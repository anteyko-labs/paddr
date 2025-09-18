# 🚀 Proxy System Guide - Обновляемая архитектура без потери ликвидности

## 📋 Обзор

Новая прокси архитектура позволяет обновлять веса токенов и NFT без потери ликвидности и данных пользователей. Система состоит из трех основных компонентов:

1. **TierWeightManager** - управляет весами тиров
2. **UpgradeableMultiStakeManager** - обновляемая версия основного контракта
3. **ProxyFactory** - фабрика для создания и управления прокси

## 🏗️ Архитектура

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   ProxyFactory  │────│  ProxyAdmin      │────│  Proxy Contract │
│                  │    │                  │    │                 │
│ - createDeploy   │    │ - upgrade()      │    │ - User Data     │
│ - upgradeImpl()  │    │ - transferOwn()  │    │ - Positions     │
│ - updateTier()   │    │                  │    │ - Balances      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │ UpgradeableMulti │
                       │ StakeManager     │
                       │                  │
                       │ - createPosition │
                       │ - closePosition   │
                       │ - mintNFT        │
                       └──────────────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │ TierWeightManager│
                       │                  │
                       │ - updateTier()   │
                       │ - getTierConfig()│
                       │ - validateTier() │
                       └──────────────────┘
```

## 🔧 Основные возможности

### 1. Динамическое обновление весов
- ✅ Изменение сумм стейкинга для тиров
- ✅ Обновление процентов наград
- ✅ Изменение множителей NFT
- ✅ Активация/деактивация тиров

### 2. Обновление логики контракта
- ✅ Обновление основной логики без потери данных
- ✅ Добавление новых функций
- ✅ Исправление багов
- ✅ Оптимизация газа

### 3. Сохранение данных пользователей
- ✅ Все позиции стейкинга сохраняются
- ✅ Балансы токенов не теряются
- ✅ NFT остаются в собственности пользователей
- ✅ Ваучеры продолжают работать

## 🚀 Деплой и настройка

### Шаг 1: Деплой системы

```bash
# Деплой через скрипт миграции
npx hardhat run scripts/migrateToProxy.js --network <network>
```

### Шаг 2: Настройка начальных весов

```javascript
const initialTierWeights = [
    {
        minAmount: ethers.parseEther("500"),   // Bronze
        maxAmount: ethers.parseEther("500"),
        duration: 3600, // 1 час
        rewardRate: 100, // 1%
        nftMultiplier: 1,
        isActive: true
    },
    // ... остальные тиры
];
```

### Шаг 3: Интеграция с фронтендом

```javascript
// Получение адреса прокси из deployment-info.json
const deploymentInfo = require('./deployment-info.json');
const proxyAddress = deploymentInfo.proxyAddress;

// Подключение к прокси контракту
const contract = new ethers.Contract(proxyAddress, abi, signer);
```

## 🔄 Обновление весов тиров

### Обновление через ProxyFactory

```javascript
// 1. Создаем новый TierWeightManager
const newTierWeightManager = await TierWeightManager.deploy();

// 2. Настраиваем новые веса
await newTierWeightManager.updateTierConfig(0, {
    minAmount: ethers.parseEther("600"), // Новый вес для Bronze
    maxAmount: ethers.parseEther("600"),
    duration: 3600,
    rewardRate: 150, // Увеличенная награда
    nftMultiplier: 2, // Больше NFT
    isActive: true
});

// 3. Обновляем в прокси
await proxyFactory.updateTierWeightManager(
    deploymentId,
    await newTierWeightManager.getAddress()
);
```

### Прямое обновление (если у вас есть права)

```javascript
// Обновление веса конкретного тира
await tierWeightManager.updateTierConfig(0, newConfig);

// Активация/деактивация тира
await tierWeightManager.setTierActive(0, false);
```

## ⬆️ Обновление реализации

### Обновление логики контракта

```javascript
// 1. Деплоим новую реализацию
const newImplementation = await UpgradeableMultiStakeManager.deploy(
    stakingTokenAddress,
    tierWeightManagerAddress
);

// 2. Обновляем через ProxyFactory
await proxyFactory.upgradeImplementation(
    deploymentId,
    await newImplementation.getAddress()
);
```

### Обновление через ProxyAdmin напрямую

```javascript
const proxyAdmin = ProxyAdmin.attach(proxyAdminAddress);
await proxyAdmin.upgrade(proxyAddress, newImplementationAddress);
```

## 📊 Мониторинг и аналитика

### Получение информации о деплое

```javascript
// Информация о деплое
const deploymentInfo = await proxyFactory.getDeploymentInfo(deploymentId);

// Активные деплои
const activeDeployments = await proxyFactory.getActiveDeployments();

// Версия конфигурации
const configVersion = await contract.getConfigVersion();
```

### Отслеживание изменений

```javascript
// Слушаем события обновления
contract.on("TierConfigUpdated", (tier, config, version) => {
    console.log(`Tier ${tier} updated to version ${version}`);
});

// Проверяем, обновилась ли конфигурация для позиции
const { isConfigUpdated } = await contract.getPositionWithConfig(positionId);
```

## 🔒 Безопасность

### Роли и права доступа

- **DEFAULT_ADMIN_ROLE**: Полный контроль над системой
- **ADMIN_ROLE**: Управление настройками контракта
- **UPGRADER_ROLE**: Обновление реализации и TierWeightManager
- **WEIGHT_UPDATER_ROLE**: Обновление весов тиров

### Рекомендации по безопасности

1. **Мультисиг**: Используйте мультисиг для критических операций
2. **Таймлок**: Добавьте задержку для обновлений
3. **Тестирование**: Всегда тестируйте обновления на тестовой сети
4. **Резервные копии**: Сохраняйте резервные копии данных

## 🚨 Миграция существующих позиций

### План миграции

1. **Подготовка**: Создание прокси системы
2. **Уведомление**: Уведомление пользователей о миграции
3. **Переход**: Постепенный переход на новую систему
4. **Завершение**: Отключение старой системы

### Сохранение данных

```javascript
// Экспорт данных из старого контракта
const oldContract = await ethers.getContractAt("MultiStakeManager", oldAddress);

// Получение всех позиций
const totalPositions = await oldContract._nextPositionId();
const positions = [];

for (let i = 1; i < totalPositions; i++) {
    const position = await oldContract.positions(i);
    positions.push({
        id: i,
        owner: position.owner,
        amount: position.amount,
        duration: position.duration,
        tier: position.tier,
        // ... остальные поля
    });
}

// Импорт в новую систему (если необходимо)
```

## 📈 Преимущества новой системы

### Для пользователей
- ✅ Стабильность: данные никогда не теряются
- ✅ Гибкость: возможность изменения условий стейкинга
- ✅ Прозрачность: все изменения отслеживаются

### Для разработчиков
- ✅ Обновляемость: легко добавлять новые функции
- ✅ Масштабируемость: система растет вместе с проектом
- ✅ Поддерживаемость: простое исправление багов

### Для бизнеса
- ✅ Адаптивность: быстрое реагирование на изменения рынка
- ✅ Конкурентоспособность: возможность улучшения условий
- ✅ Доверие: пользователи знают, что их данные в безопасности

## 🛠️ Troubleshooting

### Частые проблемы

1. **Ошибка "Already initialized"**
   - Решение: Убедитесь, что initialize() вызывается только один раз

2. **Ошибка "Invalid tier"**
   - Решение: Проверьте, что тир активен в TierWeightManager

3. **Ошибка "Zero address"**
   - Решение: Убедитесь, что все адреса корректно переданы

### Логи и отладка

```javascript
// Включение подробных логов
const provider = new ethers.JsonRpcProvider(rpcUrl);
provider.on("debug", (info) => {
    console.log("Debug:", info);
});
```

## 📞 Поддержка

При возникновении проблем:
1. Проверьте логи транзакций
2. Убедитесь в корректности адресов
3. Проверьте права доступа
4. Обратитесь к команде разработки

---

**Важно**: Всегда тестируйте обновления на тестовой сети перед применением в продакшене!

