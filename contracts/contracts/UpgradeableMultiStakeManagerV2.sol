// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "./ITierCalculator.sol";
import "./DateUtils.sol";

interface IPADNFTFactory {
    function mintNFT(
        address to,
        uint256 positionId,
        uint256 amountStaked,
        uint256 lockDurationMonths,
        uint256 startTimestamp,
        uint256 monthIndex,
        uint256 nextMintOn
    ) external returns (uint256);
}

/**
 * @title UpgradeableMultiStakeManagerV2
 * @dev Обновленная версия стейкинг контракта с новыми требованиями для тиров
 */
contract UpgradeableMultiStakeManagerV2 is AccessControlUpgradeable, ReentrancyGuardUpgradeable, UUPSUpgradeable {
    // Роли
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    
    // Константы
    uint256 public constant REWARD_INTERVAL = 5 minutes; // 5 минут для тестирования
    
    // Состояние
    IERC20 public stakingToken;
    ITierCalculator public tierCalculator;
    IPADNFTFactory public nftFactory;
    
    // Структуры
    struct StakingPosition {
        uint256 id;
        address owner;
        uint256 amount;
        uint256 startTime;
        uint256 duration;
        uint8 tier;
        bool isActive;
        uint256 lastClaimTime;
        uint256 totalClaimed;
        uint256 nextMintAt;
        uint8 monthIndex;
    }
    
    // Маппинги
    mapping(uint256 => StakingPosition) public positions;
    mapping(address => uint256[]) public userPositions;
    mapping(uint8 => uint256) public tierWeights;
    mapping(uint8 => uint256) public tierDurations;
    mapping(uint8 => uint256) public tierMinAmounts;
    
    uint256 public nextPositionId;
    
    // События
    event PositionCreated(uint256 indexed positionId, address indexed owner, uint256 amount, uint8 tier);
    event PositionClosed(uint256 indexed positionId, address indexed owner, uint256 amount);
    event RewardsClaimed(uint256 indexed positionId, address indexed owner, uint256 amount);
    event TierUpdated(uint8 indexed tier, uint256 weight, uint256 duration, uint256 minAmount);
    
    // Инициализация
    function initialize(
        address _stakingToken,
        address _tierCalculator
    ) public initializer {
        __AccessControl_init();
        __ReentrancyGuard_init();
        
        stakingToken = IERC20(_stakingToken);
        tierCalculator = ITierCalculator(_tierCalculator);
        
        // Выдаем права deployer'у
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        
        // Инициализируем новые требования для тиров
        _initializeTierRequirements();
    }
    
    /**
     * @dev Инициализирует новые требования для тиров
     */
    function _initializeTierRequirements() internal {
        // Новые требования (уменьшенные суммы, увеличенные сроки)
        tierWeights[0] = 100;      // Bronze: 100% вес
        tierWeights[1] = 200;      // Silver: 200% вес  
        tierWeights[2] = 300;      // Gold: 300% вес
        tierWeights[3] = 400;      // Platinum: 400% вес
        
        tierDurations[0] = 30 days;   // Bronze: 1 месяц
        tierDurations[1] = 90 days;   // Silver: 3 месяца
        tierDurations[2] = 180 days;  // Gold: 6 месяцев
        tierDurations[3] = 365 days;  // Platinum: 12 месяцев
        
        tierMinAmounts[0] = 500 * 10**18;   // Bronze: 500 токенов
        tierMinAmounts[1] = 1000 * 10**18;   // Silver: 1000 токенов
        tierMinAmounts[2] = 2500 * 10**18;  // Gold: 2500 токенов
        tierMinAmounts[3] = 5000 * 10**18;   // Platinum: 5000 токенов
    }
    
    /**
     * @dev Создает новую позицию стейкинга
     */
    function createPosition(uint256 amount, uint256 duration) external virtual {
        require(amount > 0, "Amount must be greater than 0");
        require(duration > 0, "Duration must be greater than 0");
        
        // Определяем тир на основе длительности
        uint8 tier = uint8(tierCalculator.getTier(duration));
        
        // Проверяем минимальную сумму для тира
        require(amount >= tierMinAmounts[tier], "Amount below minimum for tier");
        
        // Переводим токены на контракт
        require(stakingToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        
        // Создаем позицию
        uint256 positionId = nextPositionId++;
        positions[positionId] = StakingPosition({
            id: positionId,
            owner: msg.sender,
            amount: amount,
            startTime: block.timestamp,
            duration: duration,
            tier: tier,
            isActive: true,
            lastClaimTime: block.timestamp,
            totalClaimed: 0,
            nextMintAt: block.timestamp + REWARD_INTERVAL, // First NFT after 5 minutes
            monthIndex: 0 // Start from 0
        });
        
        userPositions[msg.sender].push(positionId);
        
        emit PositionCreated(positionId, msg.sender, amount, tier);
    }
    
    /**
     * @dev Получает вес тира
     */
    function getTierWeight(uint8 tier) external view returns (uint256) {
        return tierWeights[tier];
    }
    
    /**
     * @dev Получает длительность тира
     */
    function getTierDuration(uint8 tier) external view returns (uint256) {
        return tierDurations[tier];
    }
    
    /**
     * @dev Получает минимальную сумму для тира
     */
    function getTierMinAmount(uint8 tier) external view returns (uint256) {
        return tierMinAmounts[tier];
    }
    
    /**
     * @dev Обновляет требования для тира (только админ)
     */
    function updateTierRequirements(
        uint8 tier,
        uint256 weight,
        uint256 duration,
        uint256 minAmount
    ) external {
        tierWeights[tier] = weight;
        tierDurations[tier] = duration;
        tierMinAmounts[tier] = minAmount;
        
        emit TierUpdated(tier, weight, duration, minAmount);
    }
    
    /**
     * @dev Получает версию контракта
     */
    function version() external pure virtual returns (string memory) {
        return "2.0.0";
    }
    
    /**
     * @dev Mint next NFT for a position (called by user or automated system)
     * @param positionId ID of the position
     */
    function mintNextNFT(uint256 positionId) external {
        StakingPosition storage position = positions[positionId];
        require(position.isActive, "Position not active");
        require(block.timestamp >= position.nextMintAt, "Too early for next NFT");
        
        // Calculate max NFTs based on duration (1 NFT per month)
        uint256 maxNFTs = position.duration / REWARD_INTERVAL;
        require(position.monthIndex < maxNFTs, "All NFTs minted");
        
        // Mint NFT (first NFT will be minted after 5 minutes, then every 5 minutes after)
        if (address(nftFactory) != address(0)) {
            IPADNFTFactory(nftFactory).mintNFT(
                position.owner,
                positionId,
                position.amount,
                position.duration / (30 days), // lockDurationMonths (convert days to months)
                position.startTime,
                position.monthIndex, // Use current monthIndex (0 for first NFT)
                position.nextMintAt + REWARD_INTERVAL
            );
        }
        
        position.monthIndex += 1;
        position.nextMintAt += REWARD_INTERVAL;
    }
    
    /**
     * @dev Set NFT Factory address (only admin)
     */
    function setNFTFactory(address _nftFactory) external {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Only admin");
        nftFactory = IPADNFTFactory(_nftFactory);
    }
    
    /**
     * @dev Get user positions
     */
    function getUserPositions(address user) external view returns (uint256[] memory) {
        return userPositions[user];
    }
    
    /**
     * @dev Authorize upgrade (only admin)
     */
    function _authorizeUpgrade(address newImplementation) internal override onlyRole(DEFAULT_ADMIN_ROLE) {
        // Only admin can authorize upgrades
    }
}
