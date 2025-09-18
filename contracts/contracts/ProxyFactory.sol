// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";
import "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol" as OZ;
import "@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "./UpgradeableMultiStakeManager.sol";
import "./TierWeightManager.sol";

/**
 * @title ProxyFactory
 * @dev Фабрика для создания обновляемых прокси контрактов
 * Позволяет деплоить и обновлять логику без потери данных
 */
contract ProxyFactory is AccessControl {
    bytes32 public constant DEPLOYER_ROLE = keccak256("DEPLOYER_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");

    // Структура для хранения информации о деплоях
    struct DeploymentInfo {
        address proxy;
        address implementation;
        address proxyAdmin;
        address tierWeightManager;
        uint256 deploymentTime;
        bool isActive;
    }

    // Маппинг деплоев
    mapping(uint256 => DeploymentInfo) public deployments;
    uint256 public deploymentCount;

    // События
    event DeploymentCreated(
        uint256 indexed deploymentId,
        address indexed proxy,
        address indexed implementation,
        address proxyAdmin,
        address tierWeightManager
    );
    event ImplementationUpgraded(
        uint256 indexed deploymentId,
        address indexed oldImplementation,
        address indexed newImplementation
    );
    event TierWeightManagerUpdated(
        uint256 indexed deploymentId,
        address indexed oldTierWeightManager,
        address indexed newTierWeightManager
    );

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(DEPLOYER_ROLE, msg.sender);
        _grantRole(UPGRADER_ROLE, msg.sender);
    }

    /**
     * @dev Создать новый деплой с прокси
     * @param stakingToken Адрес токена для стейкинга
     * @param initialTierWeights Начальные веса тиров
     * @return deploymentId ID деплоя
     * @return proxy Адрес прокси контракта
     * @return proxyAdmin Адрес админа прокси
     */
    function createDeployment(
        address stakingToken,
        TierWeightManager.TierConfig[4] calldata initialTierWeights
    ) 
        external 
        onlyRole(DEPLOYER_ROLE) 
        returns (
            uint256 deploymentId,
            address proxy,
            address proxyAdmin
        ) 
    {
        require(stakingToken != address(0), "Zero staking token address");

        deploymentId = deploymentCount++;
        
        // 1. Деплоим TierWeightManager
        TierWeightManager tierWeightManager = new TierWeightManager();
        
        // 2. Деплоим ProxyAdmin
        ProxyAdmin admin = new ProxyAdmin(msg.sender);
        proxyAdmin = address(admin);
        
        // 3. Деплоим реализацию UpgradeableMultiStakeManager
        UpgradeableMultiStakeManager implementation = new UpgradeableMultiStakeManager();
        
        // 4. Создаем прокси
        bytes memory initData = abi.encodeWithSelector(
            UpgradeableMultiStakeManager.initialize.selector,
            stakingToken,
            address(tierWeightManager)
        );
        
        proxy = address(new TransparentUpgradeableProxy(
            address(implementation),
            proxyAdmin,
            initData
        ));

        // 5. Настраиваем начальные веса тиров
        for (uint8 i = 0; i < 4; i++) {
            tierWeightManager.updateTierConfig(i, initialTierWeights[i]);
        }

        // 6. Передаем права админа прокси
        ProxyAdmin(proxyAdmin).transferOwnership(msg.sender);

        // 7. Сохраняем информацию о деплое
        deployments[deploymentId] = DeploymentInfo({
            proxy: proxy,
            implementation: address(implementation),
            proxyAdmin: proxyAdmin,
            tierWeightManager: address(tierWeightManager),
            deploymentTime: block.timestamp,
            isActive: true
        });

        emit DeploymentCreated(
            deploymentId,
            proxy,
            address(implementation),
            proxyAdmin,
            address(tierWeightManager)
        );

        return (deploymentId, proxy, proxyAdmin);
    }

    /**
     * @dev Обновить реализацию контракта
     * @param deploymentId ID деплоя
     * @param newImplementation Адрес новой реализации
     */
    function upgradeImplementation(
        uint256 deploymentId,
        address newImplementation
    ) 
        external 
        onlyRole(UPGRADER_ROLE) 
    {
        require(deployments[deploymentId].isActive, "Deployment not active");
        require(newImplementation != address(0), "Zero implementation address");

        address proxyAdmin = deployments[deploymentId].proxyAdmin;
        address oldImplementation = deployments[deploymentId].implementation;

        // Обновляем реализацию через ProxyAdmin
        ProxyAdmin(proxyAdmin).upgradeAndCall(
            OZ.ITransparentUpgradeableProxy(payable(deployments[deploymentId].proxy)),
            newImplementation,
            bytes("")
        );

        // Обновляем информацию о деплое
        deployments[deploymentId].implementation = newImplementation;

        emit ImplementationUpgraded(deploymentId, oldImplementation, newImplementation);
    }

    /**
     * @dev Обновить TierWeightManager
     * @param deploymentId ID деплоя
     * @param newTierWeightManager Адрес нового TierWeightManager
     */
    function updateTierWeightManager(
        uint256 deploymentId,
        address newTierWeightManager
    ) 
        external 
        onlyRole(UPGRADER_ROLE) 
    {
        require(deployments[deploymentId].isActive, "Deployment not active");
        require(newTierWeightManager != address(0), "Zero tier weight manager address");

        address oldTierWeightManager = deployments[deploymentId].tierWeightManager;
        
        // Обновляем TierWeightManager в основном контракте
        UpgradeableMultiStakeManager(deployments[deploymentId].proxy)
            .updateTierWeightManager(newTierWeightManager);

        // Обновляем информацию о деплое
        deployments[deploymentId].tierWeightManager = newTierWeightManager;

        emit TierWeightManagerUpdated(deploymentId, oldTierWeightManager, newTierWeightManager);
    }

    /**
     * @dev Получить информацию о деплое
     * @param deploymentId ID деплоя
     * @return info Информация о деплое
     */
    function getDeploymentInfo(uint256 deploymentId) 
        external 
        view 
        returns (DeploymentInfo memory info) 
    {
        return deployments[deploymentId];
    }

    /**
     * @dev Получить все активные деплои
     * @return activeDeployments Массив активных деплоев
     */
    function getActiveDeployments() external view returns (uint256[] memory activeDeployments) {
        uint256 count = 0;
        
        // Подсчитываем активные деплои
        for (uint256 i = 0; i < deploymentCount; i++) {
            if (deployments[i].isActive) {
                count++;
            }
        }
        
        // Создаем массив
        activeDeployments = new uint256[](count);
        uint256 index = 0;
        
        for (uint256 i = 0; i < deploymentCount; i++) {
            if (deployments[i].isActive) {
                activeDeployments[index] = i;
                index++;
            }
        }
        
        return activeDeployments;
    }

    /**
     * @dev Деактивировать деплой
     * @param deploymentId ID деплоя
     */
    function deactivateDeployment(uint256 deploymentId) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(deployments[deploymentId].isActive, "Deployment already inactive");
        deployments[deploymentId].isActive = false;
    }

    /**
     * @dev Получить адрес прокси для деплоя
     * @param deploymentId ID деплоя
     * @return proxy Адрес прокси
     */
    function getProxyAddress(uint256 deploymentId) external view returns (address proxy) {
        require(deployments[deploymentId].isActive, "Deployment not active");
        return deployments[deploymentId].proxy;
    }

    /**
     * @dev Получить адрес ProxyAdmin для деплоя
     * @param deploymentId ID деплоя
     * @return proxyAdmin Адрес ProxyAdmin
     */
    function getProxyAdminAddress(uint256 deploymentId) external view returns (address proxyAdmin) {
        require(deployments[deploymentId].isActive, "Deployment not active");
        return deployments[deploymentId].proxyAdmin;
    }
}

