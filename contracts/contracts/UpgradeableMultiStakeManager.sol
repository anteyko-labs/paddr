// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
// Proxy imports not needed directly in implementation
import "./TierWeightManager.sol";
import "./VoucherManager.sol";
import "./DateUtils.sol";

/**
 * @title UpgradeableMultiStakeManager
 * @dev Обновляемая версия MultiStakeManager с поддержкой прокси
 * Использует TierWeightManager для динамического управления весами
 */
contract UpgradeableMultiStakeManager is AccessControl, ReentrancyGuard {
    using DateUtils for uint256;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");
    
    IERC20 public stakingToken;
    TierWeightManager public tierWeightManager;
    
    uint256 public constant MAX_POSITIONS_PER_WALLET = 10;
    uint256 public constant REWARD_INTERVAL = 30 days; // мейннет режим: NFT каждый месяц

    uint256 private _nextPositionId = 1; // Start from 1

    // Gas-optimized struct packing
    struct Position {
        uint128 amount;      // Amount of tokens staked (max ~3.4e38)
        uint64 startTime;    // When the position was created
        uint32 duration;     // Duration of stake in seconds (max ~136 years)
        uint32 nextMintAt;   // When the next reward will be minted
        uint8 tier;          // Tier level (0: Bronze, 1: Silver, 2: Gold, 3: Platinum)
        uint8 monthIndex;    // Current month index for rewards
        bool isActive;       // Whether the position is active
        address owner;       // Owner of the position
        uint256 configVersion; // Версия конфигурации на момент создания
    }

    mapping(uint256 => Position) public positions;
    mapping(address => uint256[]) public userPositions;
    mapping(uint256 => uint256) public positionIndexInUserArray;

    event PositionCreated(uint256 indexed positionId, address indexed owner, uint256 amount, uint256 duration, uint8 tier);
    event PositionClosed(uint256 indexed positionId, address indexed owner, uint256 amount, uint256 reward);
    event EmergencyWithdrawn(uint256 indexed positionId, address indexed owner, uint256 amount);
    event NFTFactorySet(address indexed newNFTFactory);
    event TierWeightManagerUpdated(address indexed newTierWeightManager);

    address public nftFactory;
    address public voucherManager;

    constructor() {}

    /**
     * @dev Инициализация для прокси (вызывается только один раз)
     * @param _stakingToken Адрес токена стейкинга
     * @param _tierWeightManager Адрес менеджера весов тиров
     */
    function initialize(address _stakingToken, address _tierWeightManager) external {
        require(_stakingToken != address(0), "Zero staking token address");
        require(_tierWeightManager != address(0), "Zero tier weight manager address");
        
        // Устанавливаем значения только если они еще не установлены
        require(address(stakingToken) == address(0), "Already initialized");

        // Устанавливаем ссылки
        stakingToken = IERC20(_stakingToken);
        tierWeightManager = TierWeightManager(_tierWeightManager);
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(UPGRADER_ROLE, msg.sender);
    }

    /**
     * @dev Создать позицию стейкинга с динамическими весами
     * @param amount Сумма для стейкинга
     * @param duration Длительность стейкинга
     */
    function createPosition(uint256 amount, uint256 duration) external nonReentrant {
        require(amount > 0, "Zero amount");
        require(userPositions[msg.sender].length < MAX_POSITIONS_PER_WALLET, "Too many positions");
        require(amount <= type(uint128).max, "Amount too large");

        // Валидация через TierWeightManager
        uint8 tier = tierWeightManager.validateTierAmount(amount, duration);
        require(tier != 255, "Invalid tier amount or duration");

        uint256 positionId = _nextPositionId++;
        uint256 startTime = block.timestamp;
        uint256 configVersion = tierWeightManager.getConfigVersion();

        uint256 interval = REWARD_INTERVAL;
        positions[positionId] = Position({
            amount: uint128(amount),
            startTime: uint64(startTime),
            duration: uint32(duration),
            nextMintAt: uint32(startTime + interval),
            tier: tier,
            monthIndex: 0,
            isActive: true,
            owner: msg.sender,
            configVersion: configVersion
        });

        userPositions[msg.sender].push(positionId);
        positionIndexInUserArray[positionId] = userPositions[msg.sender].length - 1;

        require(stakingToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");

        emit PositionCreated(positionId, msg.sender, amount, duration, tier);

        // Create vouchers for the position
        if (voucherManager != address(0)) {
            VoucherManager(voucherManager).createVouchersForPosition(msg.sender, positionId, tier);
        }
    }

    /**
     * @dev Закрыть позицию с расчетом наград по версии конфигурации
     * @param positionId ID позиции
     */
    function closePosition(uint256 positionId) external nonReentrant {
        Position storage position = positions[positionId];
        require(position.isActive, "Position not active");
        require(position.owner == msg.sender, "Not position owner");
        require(block.timestamp >= position.startTime + position.duration, "Position not mature");

        uint256 amount = position.amount;
        uint256 reward = calculateRewards(positionId);
        position.isActive = false;

        removePositionFromUser(positionId);

        require(stakingToken.transfer(msg.sender, amount + reward), "Transfer failed");

        emit PositionClosed(positionId, msg.sender, amount, reward);
    }

    /**
     * @dev Экстренный вывод средств
     * @param positionId ID позиции
     */
    function emergencyWithdraw(uint256 positionId) external nonReentrant {
        Position storage position = positions[positionId];
        require(position.isActive, "Position not active");
        require(position.owner == msg.sender, "Not position owner");
        require(msg.sender == tx.origin, "Only EOA");

        uint256 amount = position.amount;
        position.isActive = false;

        removePositionFromUser(positionId);

        require(stakingToken.transfer(msg.sender, amount), "Transfer failed");

        emit EmergencyWithdrawn(positionId, msg.sender, amount);
    }

    /**
     * @dev Получить позиции пользователя
     * @param user Адрес пользователя
     * @return Массив ID позиций
     */
    function getUserPositions(address user) external view returns (uint256[] memory) {
        return userPositions[user];
    }

    /**
     * @dev Рассчитать награды с учетом версии конфигурации
     * @param positionId ID позиции
     * @return reward Размер награды
     */
    function calculateRewards(uint256 positionId) public view returns (uint256) {
        Position storage position = positions[positionId];
        require(position.isActive, "Position not active");
        
        // Получаем процент награды из TierWeightManager
        uint256 rewardRate = tierWeightManager.getTierRewardRate(position.tier);
        
        // Рассчитываем базовую награду
        uint256 baseReward = (position.amount * rewardRate) / 10000; // rewardRate в базисных пунктах
        
        return baseReward * position.monthIndex;
    }

    /**
     * @dev Удалить позицию из массива пользователя
     * @param positionId ID позиции
     */
    function removePositionFromUser(uint256 positionId) internal {
        Position storage position = positions[positionId];
        uint256[] storage userPositionsArray = userPositions[position.owner];
        uint256 index = positionIndexInUserArray[positionId];
        
        // If not the last position, swap with last
        if (index != userPositionsArray.length - 1) {
            uint256 lastPositionId = userPositionsArray[userPositionsArray.length - 1];
            userPositionsArray[index] = lastPositionId;
            positionIndexInUserArray[lastPositionId] = index;
        }
        
        userPositionsArray.pop();
        delete positionIndexInUserArray[positionId];
    }

    /**
     * @dev Установить NFT фабрику
     * @param _nftFactory Адрес NFT фабрики
     */
    function setNFTFactory(address _nftFactory) external onlyRole(ADMIN_ROLE) {
        require(_nftFactory != address(0), "Zero address");
        nftFactory = _nftFactory;
        emit NFTFactorySet(_nftFactory);
    }

    /**
     * @dev Установить менеджер ваучеров
     * @param _voucherManager Адрес менеджера ваучеров
     */
    function setVoucherManager(address _voucherManager) external onlyRole(ADMIN_ROLE) {
        require(_voucherManager != address(0), "Zero address");
        voucherManager = _voucherManager;
    }

    /**
     * @dev Обновить TierWeightManager (только для обновления логики)
     * @param _tierWeightManager Новый адрес TierWeightManager
     */
    function updateTierWeightManager(address _tierWeightManager) external onlyRole(UPGRADER_ROLE) {
        require(_tierWeightManager != address(0), "Zero address");
        tierWeightManager = TierWeightManager(_tierWeightManager);
        emit TierWeightManagerUpdated(_tierWeightManager);
    }

    /**
     * @dev Минт следующего NFT для позиции
     * @param positionId ID позиции
     */
    function mintNextNFT(uint256 positionId) external {
        Position storage position = positions[positionId];
        require(position.isActive, "Position not active");
        require(block.timestamp >= position.nextMintAt, "Too early for next NFT");
        
        // Получаем множитель NFT из текущей конфигурации
        uint256 nftMultiplier = tierWeightManager.getTierNFTMultiplier(position.tier);
        
        // Calculate max NFTs based on duration and multiplier
        uint256 maxNFTs = (position.duration / REWARD_INTERVAL) * nftMultiplier;
        require(position.monthIndex < maxNFTs, "All NFTs minted");
        
        // Mint NFT
        if (nftFactory != address(0)) {
            IPADNFTFactory(nftFactory).mintNFT(
                position.owner,
                positionId,
                position.amount,
                position.duration / 1 hours, // lockDurationHours
                position.startTime,
                position.monthIndex, // Use current monthIndex (0 for first NFT)
                position.nextMintAt + REWARD_INTERVAL
            );
        }
        
        position.monthIndex += 1;
        position.nextMintAt += uint32(REWARD_INTERVAL);
    }

    /**
     * @dev Получить информацию о позиции с учетом текущей конфигурации
     * @param positionId ID позиции
     * @return position Данные позиции
     * @return currentTierConfig Текущая конфигурация тира
     * @return isConfigUpdated Обновлена ли конфигурация с момента создания
     */
    function getPositionWithConfig(uint256 positionId) 
        external 
        view 
        returns (
            Position memory position,
            TierWeightManager.TierConfig memory currentTierConfig,
            bool isConfigUpdated
        ) 
    {
        position = positions[positionId];
        currentTierConfig = tierWeightManager.getTierConfig(position.tier);
        isConfigUpdated = position.configVersion < tierWeightManager.getConfigVersion();
    }

    /**
     * @dev Получить все активные тиры
     * @return activeTiers Массив активных тиров
     */
    function getActiveTiers() external view returns (uint8[] memory activeTiers) {
        return tierWeightManager.getActiveTiers();
    }

    /**
     * @dev Получить текущую версию конфигурации
     * @return version Версия конфигурации
     */
    function getConfigVersion() external view returns (uint256 version) {
        return tierWeightManager.getConfigVersion();
    }
}

// Интерфейс для NFT фабрики
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
