# 🎫🎬 Полная система NFT с видео и ваучерами

## 🎯 Что у вас есть

### 1. **NFT с видео наградами**
- ✅ **Реальные NFT** минтится в кошелек пользователя
- ✅ **Уникальные видео** для каждого тира
- ✅ **Каждый час стейкинга** = 1 NFT с видео
- ✅ **Soul-bound** для Bronze/Silver (нельзя продать)
- ✅ **Transferable** для Gold/Platinum (можно продать)

### 2. **PDF ваучеры конвертированы в изображения**
- ✅ **Bronze**: 3 ваучера (1 hour Free Rental, 10% Restaurant Discount, 10% Auto Service Discount)
- ✅ **Silver**: 6 ваучеров (2 hours Free Rental, $150 Rental, 15% Auto Service, etc.)
- ✅ **Gold**: 8 ваучеров (3 hours Free Rental, $600 Rental, 20% Auto Service, etc.)
- ✅ **Platinum**: 10 ваучеров (5 hours Free Rental, $1250 Rental, Chauffeur Service, etc.)

### 3. **Правильное сопоставление видео с тирами**
- ✅ `video5307504616261323179.mp4` → **Bronze** (79 = Bronze)
- ✅ `video5307504616261323180.mp4` → **Silver** (80 = Silver)
- ✅ `video5307504616261323181.mp4` → **Gold** (81 = Gold)
- ✅ `video5307504616261323182.mp4` → **Platinum** (82 = Platinum)

## 🚀 Как запустить систему

### Шаг 1: Проверьте текущее состояние
```bash
node scripts/check-vouchers.js
```

### Шаг 2: Конвертируйте PDF в изображения
```bash
# Установите ImageMagick или Ghostscript
node scripts/convert-pdf-vouchers.js
```

### Шаг 3: Запустите приложение
```bash
npm run dev
```

### Шаг 4: Проверьте работу
- **Админ панель**: http://localhost:3000/admin
- **NFT с видео**: http://localhost:3000/dashboard/rewards
- **Стейкинг**: http://localhost:3000/dashboard/stake

## 🎬 Как работают NFT с видео

### Процесс получения NFT:

1. **Пользователь стейкает** 1000 PADD-R на 2 часа (Silver тир)
2. **Через 1 час** вызывает `mintNextNFT(positionId)`
3. **NFT минтится** в кошелек с:
   - **Видео**: `video5307504616261323180.mp4` (Silver)
   - **Ваучер**: случайный из Silver тира
   - **Метаданные**: positionId, amountStaked, tierLevel, hourIndex
4. **Через 2 часа** получает второй NFT
5. **И так далее** каждый час

### Что видит пользователь в кошельке:

#### В MetaMask/OpenSea:
- **NFT токены** "PAD NFT (v2)"
- **Уникальные ID** (#1, #2, #3...)
- **Метаданные** с информацией о стейкинге
- **Soul-bound** для Bronze/Silver
- **Transferable** для Gold/Platinum

#### В вашем приложении (`/dashboard/rewards`):
- **Видео плеер** для каждого NFT
- **Информация о ваучере** (название, описание, значение)
- **Кнопки** Play/Pause/Download
- **Статистика** по часам стейкинга

## 🎫 Система ваучеров

### Структура ваучеров:

```
BRONZE (3 ваучера):
├── 1 hour Free Rental Voucher.pdf → 1 hour Free Rental Voucher.png
├── 10% Restaurant Discount.pdf → 10% Restaurant Discount.png
└── 10% Auto Service Discount.pdf → 10% Auto Service Discount.png

SILVER (6 ваучеров):
├── 2 hours Free Rental Voucher.pdf → 2 hours Free Rental Voucher.png
├── 150$ Rental Voucher.pdf → 150$ Rental Voucher.png
├── 15% Auto Service Discount.pdf → 15% Auto Service Discount.png
├── 10% Restaurant Discount.pdf → 10% Restaurant Discount.png
├── Free Car Wash Voucher.pdf → Free Car Wash Voucher.png
└── Free Upgrade Voucher.pdf → Free Upgrade Voucher.png

GOLD (8 ваучеров):
├── 3 hours Free Rental Voucher.pdf → 3 hours Free Rental Voucher.png
├── 600$ Rental Voucher.pdf → 600$ Rental Voucher.png
├── 20% Auto Service Discount.pdf → 20% Auto Service Discount.png
├── 15% Restaurant Discount.pdf → 15% Restaurant Discount.png
├── Unlimited Mileage.pdf → Unlimited Mileage.png
├── Premium Protection.pdf → Premium Protection.png
├── Free Car Wash Voucher.pdf → Free Car Wash Voucher.png
└── Free Upgrade Voucher.pdf → Free Upgrade Voucher.png

PLATINUM (10 ваучеров):
├── 5 hours Free Rental Voucher.pdf → 5 hours Free Rental Voucher.png
├── 1250$ Rental Voucher.pdf → 1250$ Rental Voucher.png
├── 20% Auto Service Discount.pdf → 20% Auto Service Discount.png
├── 20% Restaurant Discount.pdf → 20% Restaurant Discount.png
├── Unlimited Mileage.pdf → Unlimited Mileage.png
├── Premium Protection.pdf → Premium Protection.png
├── Free Car Wash Voucher.pdf → Free Car Wash Voucher.png
├── Free Upgrade Voucher.pdf → Free Upgrade Voucher.png
├── Chauffeur Service Voucher (6h).pdf → Chauffeur Service Voucher (6h).png
└── Free UAE Delivery Voucher.pdf → Free UAE Delivery Voucher.png
```

### Типы ваучеров:

- **SINGLE_USE**: Одноразовые (Free Rental, Car Wash, Upgrade)
- **MULTI_USE**: Многоразовые (Rental Coupons)
- **DURATION**: На период стейкинга (Discounts, Unlimited Mileage)

## 🎛️ Админ панель

### Управление системой:

1. **Тиры** - изменение весов токенов, длительности, процентов наград
2. **Ваучеры** - редактирование ваучеров для каждого тира
3. **NFT** - управление изображениями и видео
4. **Сканер** - сканирование QR кодов ваучеров
5. **Аналитика** - статистика системы

### API Endpoints:

- `GET /api/vouchers?tier=BRONZE` - получить ваучеры тира
- `POST /api/vouchers` - получить случайный ваучер
- `GET /api/admin/tiers` - управление тирами
- `POST /api/admin/upload` - загрузка файлов

## 🔄 Обновление системы

### Если нужно обновить ваучеры:

1. **Замените PDF файлы** в папках BRONZE/SILVER/GOLD/PLATINUM
2. **Запустите конвертацию:**
   ```bash
   node scripts/convert-pdf-vouchers.js
   ```
3. **Проверьте результаты** в `public/assets/`

### Если нужно обновить видео:

1. **Замените видео файлы** в `nft/nft_tiers/`
2. **Обновите сопоставление** в `data/video-tier-mapping.json`
3. **Перезапустите приложение**

## 🎯 Итоговая система

### Что получает пользователь:

1. **Стейкает токены** (500/1000/3000/4000 PADD-R)
2. **Получает NFT** каждый час с:
   - **Видео наградой** (уникальное для тира)
   - **Ваучером** (случайный из тира)
   - **Метаданными** (информация о стейкинге)
3. **Может использовать** ваучеры в реальном мире
4. **Может торговать** Gold/Platinum NFT

### Что видит в кошельке:

- **Реальные NFT** (ERC721A стандарт)
- **Видео награды** (воспроизводимые)
- **Ваучеры** (изображения из PDF)
- **Метаданные** (полная информация)

### Что может делать админ:

- **Изменять веса** токенов для тиров
- **Обновлять ваучеры** (PDF → PNG)
- **Управлять видео** наградами
- **Сканировать QR коды** ваучеров
- **Просматривать аналитику** системы

## 🎉 Готово!

**У вас есть полноценная система NFT с видео и ваучерами!**

- ✅ **NFT минтится** в кошелек пользователя
- ✅ **Видео награды** уникальны для каждого тира
- ✅ **PDF ваучеры** конвертированы в изображения
- ✅ **Админ панель** для управления всем
- ✅ **Прокси система** для обновлений без потери данных
- ✅ **Soul-bound** и **transferable** NFT
- ✅ **Полная интеграция** с фронтендом

**Система готова к использованию!** 🚀




