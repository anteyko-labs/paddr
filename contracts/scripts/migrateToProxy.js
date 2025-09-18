const { ethers } = require("hardhat");

/**
 * Скрипт для миграции существующих позиций на новую прокси архитектуру
 * Сохраняет все данные пользователей и обеспечивает плавный переход
 */

async function main() {
    console.log("🚀 Начинаем миграцию на прокси архитектуру...");

    const [deployer] = await ethers.getSigners();
    console.log("Deployer:", deployer.address);

    // 1. Деплой TierWeightManager
    console.log("\n📦 Деплоим TierWeightManager...");
    const TierWeightManager = await ethers.getContractFactory("TierWeightManager");
    const tierWeightManager = await TierWeightManager.deploy();
    await tierWeightManager.waitForDeployment();
    console.log("TierWeightManager deployed to:", await tierWeightManager.getAddress());

    // 2. Деплой ProxyFactory
    console.log("\n🏭 Деплоим ProxyFactory...");
    const ProxyFactory = await ethers.getContractFactory("ProxyFactory");
    const proxyFactory = await ProxyFactory.deploy();
    await proxyFactory.waitForDeployment();
    console.log("ProxyFactory deployed to:", await proxyFactory.getAddress());

    // 3. Получаем адрес токена стейкинга (предполагаем, что он уже деплоен)
    const STAKING_TOKEN_ADDRESS = "0x..."; // Замените на реальный адрес

    // 4. Создаем начальную конфигурацию тиров
    const initialTierWeights = [
        {
            minAmount: ethers.parseEther("500"),
            maxAmount: ethers.parseEther("500"),
            duration: 3600, // 1 час
            rewardRate: 100, // 1%
            nftMultiplier: 1,
            isActive: true
        },
        {
            minAmount: ethers.parseEther("1000"),
            maxAmount: ethers.parseEther("1000"),
            duration: 7200, // 2 часа
            rewardRate: 200, // 2%
            nftMultiplier: 1,
            isActive: true
        },
        {
            minAmount: ethers.parseEther("3000"),
            maxAmount: ethers.parseEther("3000"),
            duration: 10800, // 3 часа
            rewardRate: 300, // 3%
            nftMultiplier: 1,
            isActive: true
        },
        {
            minAmount: ethers.parseEther("4000"),
            maxAmount: ethers.parseEther("4000"),
            duration: 14400, // 4 часа
            rewardRate: 400, // 4%
            nftMultiplier: 1,
            isActive: true
        }
    ];

    // 5. Создаем деплой через ProxyFactory
    console.log("\n🔧 Создаем новый деплой через ProxyFactory...");
    const tx = await proxyFactory.createDeployment(STAKING_TOKEN_ADDRESS, initialTierWeights);
    const receipt = await tx.wait();
    
    // Извлекаем события из рецепта
    const deploymentEvent = receipt.logs.find(log => {
        try {
            const parsed = proxyFactory.interface.parseLog(log);
            return parsed.name === "DeploymentCreated";
        } catch (e) {
            return false;
        }
    });

    if (deploymentEvent) {
        const parsed = proxyFactory.interface.parseLog(deploymentEvent);
        const deploymentId = parsed.args.deploymentId;
        const proxyAddress = parsed.args.proxy;
        const proxyAdminAddress = parsed.args.proxyAdmin;

        console.log("✅ Деплой создан успешно!");
        console.log("Deployment ID:", deploymentId.toString());
        console.log("Proxy Address:", proxyAddress);
        console.log("ProxyAdmin Address:", proxyAdminAddress);

        // 6. Получаем экземпляр прокси контракта
        const UpgradeableMultiStakeManager = await ethers.getContractFactory("UpgradeableMultiStakeManager");
        const proxyContract = UpgradeableMultiStakeManager.attach(proxyAddress);

        // 7. Проверяем, что прокси работает
        console.log("\n🔍 Проверяем работу прокси...");
        const configVersion = await proxyContract.getConfigVersion();
        console.log("Config Version:", configVersion.toString());

        const activeTiers = await proxyContract.getActiveTiers();
        console.log("Active Tiers:", activeTiers);

        // 8. Сохраняем адреса для фронтенда
        const deploymentInfo = {
            deploymentId: deploymentId.toString(),
            proxyAddress: proxyAddress,
            proxyAdminAddress: proxyAdminAddress,
            tierWeightManagerAddress: await tierWeightManager.getAddress(),
            proxyFactoryAddress: await proxyFactory.getAddress(),
            stakingTokenAddress: STAKING_TOKEN_ADDRESS,
            deploymentTime: new Date().toISOString()
        };

        console.log("\n📋 Информация о деплое:");
        console.log(JSON.stringify(deploymentInfo, null, 2));

        // 9. Сохраняем в файл
        const fs = require('fs');
        fs.writeFileSync(
            './deployment-info.json',
            JSON.stringify(deploymentInfo, null, 2)
        );

        console.log("\n✅ Миграция завершена успешно!");
        console.log("📄 Информация о деплое сохранена в deployment-info.json");

    } else {
        console.error("❌ Ошибка: не удалось найти событие DeploymentCreated");
    }
}

// Функция для обновления весов тиров
async function updateTierWeights(proxyFactoryAddress, deploymentId, newWeights) {
    console.log("\n🔄 Обновляем веса тиров...");
    
    const ProxyFactory = await ethers.getContractFactory("ProxyFactory");
    const proxyFactory = ProxyFactory.attach(proxyFactoryAddress);

    // Деплоим новый TierWeightManager с обновленными весами
    const TierWeightManager = await ethers.getContractFactory("TierWeightManager");
    const newTierWeightManager = await TierWeightManager.deploy();
    await newTierWeightManager.waitForDeployment();

    // Настраиваем новые веса
    for (let i = 0; i < newWeights.length; i++) {
        await newTierWeightManager.updateTierConfig(i, newWeights[i]);
    }

    // Обновляем TierWeightManager в прокси
    const tx = await proxyFactory.updateTierWeightManager(
        deploymentId,
        await newTierWeightManager.getAddress()
    );
    await tx.wait();

    console.log("✅ Веса тиров обновлены!");
    console.log("Новый TierWeightManager:", await newTierWeightManager.getAddress());
}

// Функция для обновления реализации
async function upgradeImplementation(proxyFactoryAddress, deploymentId, newImplementationAddress) {
    console.log("\n⬆️ Обновляем реализацию...");
    
    const ProxyFactory = await ethers.getContractFactory("ProxyFactory");
    const proxyFactory = ProxyFactory.attach(proxyFactoryAddress);

    const tx = await proxyFactory.upgradeImplementation(deploymentId, newImplementationAddress);
    await tx.wait();

    console.log("✅ Реализация обновлена!");
}

if (require.main === module) {
    main()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}

module.exports = {
    main,
    updateTierWeights,
    upgradeImplementation
};

