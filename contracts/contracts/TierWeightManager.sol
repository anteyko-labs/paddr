// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title TierWeightManager
 * @dev Управляет весами тиров для стейкинга и NFT
 * Этот контракт можно обновлять через прокси без потери данных
 */
contract TierWeightManager is AccessControl, ReentrancyGuard {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant WEIGHT_UPDATER_ROLE = keccak256("WEIGHT_UPDATER_ROLE");

    struct TierConfig {
        uint256 minAmount;      // Минимальная сумма для тира
        uint256 maxAmount;      // Максимальная сумма для тира
        uint256 duration;       // Длительность стейкинга в секундах
        uint256 rewardRate;     // Процент награды (в базисных пунктах, 100 = 1%)
        uint256 nftMultiplier;  // Множитель для NFT (сколько NFT за час)
        bool isActive;          // Активен ли тир
    }

    // Маппинг тиров (0: Bronze, 1: Silver, 2: Gold, 3: Platinum)
    mapping(uint8 => TierConfig) public tierConfigs;
    
    // Версия конфигурации для отслеживания изменений
    uint256 public configVersion;
    
    // События
    event TierConfigUpdated(uint8 indexed tier, TierConfig config, uint256 version);
    event TierActivated(uint8 indexed tier, bool active);
    event ConfigVersionUpdated(uint256 newVersion);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(WEIGHT_UPDATER_ROLE, msg.sender);
        
        // Инициализация дефолтных значений
        _initializeDefaultTiers();
    }

    /**
     * @dev Инициализация дефолтных тиров (МЕЙННЕТ НАСТРОЙКИ)
     */
    function _initializeDefaultTiers() internal {
        // Bronze: 500 токенов, 1 месяц
        tierConfigs[0] = TierConfig({
            minAmount: 500 * 10**18,
            maxAmount: 500 * 10**18,
            duration: 30 days,
            rewardRate: 0, // 0% - только NFT награды
            nftMultiplier: 1, // 1 NFT в месяц
            isActive: true
        });

        // Silver: 1000 токенов, 3 месяца
        tierConfigs[1] = TierConfig({
            minAmount: 1000 * 10**18,
            maxAmount: 1000 * 10**18,
            duration: 90 days,
            rewardRate: 0, // 0% - только NFT награды
            nftMultiplier: 1,
            isActive: true
        });

        // Gold: 2500 токенов, 6 месяцев
        tierConfigs[2] = TierConfig({
            minAmount: 2500 * 10**18,
            maxAmount: 2500 * 10**18,
            duration: 180 days,
            rewardRate: 0, // 0% - только NFT награды
            nftMultiplier: 1,
            isActive: true
        });

        // Platinum: 5000 токенов, 12 месяцев
        tierConfigs[3] = TierConfig({
            minAmount: 5000 * 10**18,
            maxAmount: 5000 * 10**18,
            duration: 365 days,
            rewardRate: 0, // 0% - только NFT награды
            nftMultiplier: 1,
            isActive: true
        });

        configVersion = 1;
        emit ConfigVersionUpdated(1);
    }

    /**
     * @dev Обновить конфигурацию тира
     * @param tier Номер тира (0-3)
     * @param config Новая конфигурация
     */
    function updateTierConfig(uint8 tier, TierConfig calldata config) 
        external 
        onlyRole(WEIGHT_UPDATER_ROLE) 
        nonReentrant 
    {
        require(tier <= 3, "Invalid tier");
        require(config.minAmount > 0, "Invalid min amount");
        require(config.maxAmount >= config.minAmount, "Invalid amount range");
        require(config.duration > 0, "Invalid duration");
        require(config.rewardRate <= 10000, "Reward rate too high"); // Максимум 100%
        require(config.nftMultiplier > 0, "Invalid NFT multiplier");

        tierConfigs[tier] = config;
        configVersion++;

        emit TierConfigUpdated(tier, config, configVersion);
        emit ConfigVersionUpdated(configVersion);
    }

    /**
     * @dev Активировать/деактивировать тир
     * @param tier Номер тира
     * @param active Статус активности
     */
    function setTierActive(uint8 tier, bool active) 
        external 
        onlyRole(ADMIN_ROLE) 
    {
        require(tier <= 3, "Invalid tier");
        tierConfigs[tier].isActive = active;
        emit TierActivated(tier, active);
    }

    /**
     * @dev Получить конфигурацию тира
     * @param tier Номер тира
     * @return config Конфигурация тира
     */
    function getTierConfig(uint8 tier) external view returns (TierConfig memory config) {
        require(tier <= 3, "Invalid tier");
        return tierConfigs[tier];
    }

    /**
     * @dev Проверить валидность суммы и длительности для тира
     * @param amount Сумма стейкинга
     * @param duration Длительность стейкинга
     * @return tier Номер тира или 255 если невалидно
     */
    function validateTierAmount(uint256 amount, uint256 duration) 
        external 
        view 
        returns (uint8 tier) 
    {
        for (uint8 i = 0; i <= 3; i++) {
            TierConfig memory config = tierConfigs[i];
            if (config.isActive && 
                amount >= config.minAmount && 
                amount <= config.maxAmount && 
                duration == config.duration) {
                return i;
            }
        }
        return 255; // Invalid
    }

    /**
     * @dev Получить процент награды для тира
     * @param tier Номер тира
     * @return rewardRate Процент награды в базисных пунктах
     */
    function getTierRewardRate(uint8 tier) external view returns (uint256 rewardRate) {
        require(tier <= 3, "Invalid tier");
        return tierConfigs[tier].rewardRate;
    }

    /**
     * @dev Получить множитель NFT для тира
     * @param tier Номер тира
     * @return multiplier Множитель NFT
     */
    function getTierNFTMultiplier(uint8 tier) external view returns (uint256 multiplier) {
        require(tier <= 3, "Invalid tier");
        return tierConfigs[tier].nftMultiplier;
    }

    /**
     * @dev Получить все активные тиры
     * @return activeTiers Массив активных тиров
     */
    function getActiveTiers() external view returns (uint8[] memory activeTiers) {
        uint8 count = 0;
        
        // Подсчитываем активные тиры
        for (uint8 i = 0; i <= 3; i++) {
            if (tierConfigs[i].isActive) {
                count++;
            }
        }
        
        // Создаем массив
        activeTiers = new uint8[](count);
        uint8 index = 0;
        
        for (uint8 i = 0; i <= 3; i++) {
            if (tierConfigs[i].isActive) {
                activeTiers[index] = i;
                index++;
            }
        }
        
        return activeTiers;
    }

    /**
     * @dev Получить текущую версию конфигурации
     * @return version Версия конфигурации
     */
    function getConfigVersion() external view returns (uint256 version) {
        return configVersion;
    }
}

