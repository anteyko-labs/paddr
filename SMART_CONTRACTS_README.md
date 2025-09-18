# 🚀 Smart Contracts - PADD-R Staking System

## 📋 Обзор системы

### Новая архитектура стейкинга:
- **4 фиксированных тира** с предопределенными суммами и длительностями
- **NFT награды** каждый час после начала стейкинга
- **Система ваучеров** с QR-кодами для использования
- **Автоматическое создание ваучеров** при стейкинге

### Тиры:
1. **Bronze**: 500 PADD-R токенов, стейкинг на 1 час
2. **Silver**: 1000 PADD-R токенов, стейкинг на 2 часа
3. **Gold**: 3000 PADD-R токенов, стейкинг на 3 часа
4. **Platinum**: 4000 PADD-R токенов, стейкинг на 4 часа

## 🏗️ Контракты

### 1. MultiStakeManager.sol
**Основной контракт стейкинга**
- Управление позициями стейкинга
- Фиксированные суммы для каждого тира
- NFT награды каждый час
- Интеграция с VoucherManager

**Ключевые изменения:**
- `REWARD_INTERVAL = 1 hours` (было 30 минут)
- `MAX_STAKE_DURATION = 4 hours` (было 10 часов)
- Добавлена функция `_validateTierAmount()` для проверки фиксированных сумм
- Интеграция с `VoucherManager` для создания ваучеров

### 2. VoucherManager.sol
**Новый контракт для управления ваучерами**
- Создание ваучеров при стейкинге
- QR-код система
- Три типа ваучеров:
  - `SINGLE_USE`: Одноразовые
  - `MULTI_USE`: Многоразовые с лимитом
  - `DURATION`: На период стейкинга

**Функции:**
- `createVouchersForPosition()`: Создание ваучеров для позиции
- `redeemVoucher()`: Использование ваучера по QR-коду
- `isVoucherValid()`: Проверка валидности ваучера
- `getUserVouchers()`: Получение ваучеров пользователя

### 3. PADNFTFactory.sol
**Фабрика NFT**
- Создание NFT наград
- Метаданные для ваучеров
- Soul-bound логика

## 🔧 Деплой и настройка

### 1. Компиляция контрактов
```bash
cd contracts
npm install
npx hardhat compile
```

### 2. Деплой контрактов
```bash
npx hardhat run scripts/deploy.js --network localhost
```

### 3. Настройка адресов
После деплоя обновите адреса в `lib/contracts/config.ts`:
```typescript
export const VOUCHER_MANAGER_ADDRESS = '0x...'; // Новый адрес
```

### 4. Настройка ролей
```javascript
// Дать роль ADMIN для MultiStakeManager в VoucherManager
await voucherManager.grantRole(ADMIN_ROLE, stakeManager.address);

// Дать роль MINTER для MultiStakeManager в NFTFactory
await nftFactory.grantRole(MINTER_ROLE, stakeManager.address);
```

## 🔄 Жизненный цикл стейкинга

### 1. Создание позиции
```javascript
// Пользователь выбирает тир (например, Bronze)
const amount = 500 * 10**18; // 500 токенов
const duration = 1 * 60 * 60; // 1 час в секундах

// Вызов createPosition
await stakeManager.createPosition(amount, duration);
```

### 2. Автоматическое создание ваучеров
```javascript
// В createPosition автоматически вызывается:
await voucherManager.createVouchersForPosition(user, positionId, tier);
```

### 3. NFT награды
```javascript
// Каждый час пользователь может получить NFT:
await stakeManager.mintNextNFT(positionId);
```

### 4. Использование ваучеров
```javascript
// Пользователь показывает QR-код
// Администратор сканирует и вызывает:
await voucherManager.redeemVoucher(qrCode, redeemer);
```

## 🧪 Тестирование

### Тест стейкинга
```bash
npx hardhat test test/Staking.test.js
```

### Тест ваучеров
```bash
npx hardhat test test/Vouchers.test.js
```

## 🔍 Критические моменты

### 1. Валидация тиров
- Только фиксированные комбинации сумма/длительность
- `_validateTierAmount()` возвращает 255 для невалидных комбинаций

### 2. QR-коды
- Генерируются автоматически при создании ваучера
- Формат: `voucher_{id}_{owner}_{positionId}_{timestamp}`
- Одноразовое использование через `qrCodeUsed` mapping

### 3. NFT награды
- Каждый час после начала стейкинга
- `nextMintAt` обновляется на +1 час
- Максимум NFT = `duration / REWARD_INTERVAL`

### 4. Ваучеры
- Создаются автоматически при стейкинге
- 4 ваучера для каждого тира
- Разные типы в зависимости от тира

## 🚨 Безопасность

### Проверки в VoucherManager:
- Только `REDEEMER_ROLE` может использовать ваучеры
- Проверка QR-кода на одноразовое использование
- Валидация типа ваучера и лимитов

### Проверки в MultiStakeManager:
- Валидация фиксированных сумм
- Проверка лимитов позиций
- ReentrancyGuard защита

## 📊 Мониторинг

### Events для отслеживания:
- `VoucherCreated`: Создание ваучера
- `VoucherRedeemed`: Использование ваучера
- `PositionCreated`: Создание позиции стейкинга
- `NFTMinted`: Создание NFT награды

## 🔧 Настройка фронтенда

### Обновленные хуки:
- `useVouchers`: Загрузка ваучеров пользователя
- Обновленный `useStakingPositions`: Поддержка новых тиров

### Компоненты:
- `VouchersPanel`: Отображение ваучеров с QR-кодами
- Обновленная форма стейкинга: Фиксированные суммы

## 🎯 Следующие шаги

1. **Деплой контрактов** на тестнет
2. **Тестирование** всех функций
3. **Интеграция** с фронтендом
4. **Аудит безопасности**
5. **Деплой** на мейннет

---

**⚠️ Важно**: Все контракты должны быть протестированы перед деплоем на мейннет!
