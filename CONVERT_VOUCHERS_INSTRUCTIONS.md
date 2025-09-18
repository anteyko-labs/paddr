# 🎫 Инструкция по конвертации PDF ваучеров в изображения

## 📋 Что нужно сделать

У вас есть PDF ваучеры для каждого тира, которые нужно конвертировать в изображения для отображения в NFT системе.

## 🎬 Правильное сопоставление видео с тирами

**Исправлено сопоставление:**
- `video5307504616261323179.mp4` → **Bronze** тир (79 = Bronze)
- `video5307504616261323180.mp4` → **Silver** тир (80 = Silver)  
- `video5307504616261323181.mp4` → **Gold** тир (81 = Gold)
- `video5307504616261323182.mp4` → **Platinum** тир (82 = Platinum)

## 🔧 Установка необходимых инструментов

### Вариант 1: ImageMagick (рекомендуется)

1. **Скачайте ImageMagick:**
   - Windows: https://imagemagick.org/script/download.php#windows
   - Выберите "ImageMagick-7.x.x-x-Q16-HDRI-x64-dll.exe"

2. **Установите ImageMagick:**
   - Запустите установщик
   - Выберите "Add application directory to your system path"
   - Завершите установку

3. **Проверьте установку:**
   ```bash
   magick -version
   ```

### Вариант 2: Ghostscript (альтернатива)

1. **Скачайте Ghostscript:**
   - https://www.ghostscript.com/download/gsdnld.html
   - Выберите версию для Windows

2. **Установите Ghostscript:**
   - Запустите установщик
   - Добавьте в PATH при установке

3. **Проверьте установку:**
   ```bash
   gs -version
   ```

## 🚀 Запуск конвертации

### Шаг 1: Запустите скрипт конвертации

```bash
node scripts/convert-pdf-vouchers.js
```

### Шаг 2: Проверьте результаты

Скрипт создаст:
- `public/assets/tier1/` - Bronze ваучеры (PNG)
- `public/assets/tier2/` - Silver ваучеры (PNG)
- `public/assets/tier3/` - Gold ваучеры (PNG)
- `public/assets/tier4/` - Platinum ваучеры (PNG)
- `data/voucher-config.json` - Конфигурация ваучеров
- `data/video-tier-mapping.json` - Сопоставление видео

## 📁 Структура файлов после конвертации

```
public/
├── assets/
│   ├── tier1/          # Bronze ваучеры
│   │   ├── 1 hour Free Rental Voucher.png
│   │   ├── 10% Restaurant Discount.png
│   │   └── 10% Auto Service Discount.png
│   ├── tier2/          # Silver ваучеры
│   │   ├── 2 hours Free Rental Voucher.png
│   │   ├── 150$ Rental Voucher.png
│   │   └── ...
│   ├── tier3/          # Gold ваучеры
│   │   ├── 3 hours Free Rental Voucher.png
│   │   ├── 600$ Rental Voucher.png
│   │   └── ...
│   └── tier4/          # Platinum ваучеры
│       ├── 5 hours Free Rental Voucher.png
│       ├── 1250$ Rental Voucher.png
│       └── ...

nft/
└── nft_tiers/          # NFT видео
    ├── video5307504616261323179.mp4  # Bronze
    ├── video5307504616261323180.mp4  # Silver
    ├── video5307504616261323181.mp4  # Gold
    └── video5307504616261323182.mp4  # Platinum
```

## 🎯 Что получится

### В кошельке пользователя:
1. **NFT с видео** - каждый час стейкинга
2. **Видео награды** - уникальные для каждого тира
3. **Ваучеры** - изображения из PDF файлов

### В админ панели:
1. **Управление ваучерами** - редактирование PDF ваучеров
2. **Загрузка новых** - добавление новых ваучеров
3. **Просмотр статистики** - использование ваучеров

## 🔄 Обновление ваучеров

### Если нужно обновить ваучеры:

1. **Замените PDF файлы** в соответствующих папках:
   - `BRONZE/` - для Bronze тира
   - `SILVER/` - для Silver тира
   - `GOLD/` - для Gold тира
   - `PLATINUM/` - для Platinum тира

2. **Запустите конвертацию:**
   ```bash
   node scripts/convert-pdf-vouchers.js
   ```

3. **Проверьте результаты** в `public/assets/`

## 🎬 Как работают NFT с видео и ваучерами

### Процесс получения NFT:

1. **Пользователь стейкает** токены (например, 1000 PADD-R на 2 часа для Silver)
2. **Через 1 час** может вызвать `mintNextNFT(positionId)`
3. **NFT минтится** в кошелек с:
   - Видео: `video5307504616261323180.mp4` (Silver)
   - Ваучер: случайный из Silver тира (например, "2 hours Free Rental Voucher")
4. **Через 2 часа** получает второй NFT
5. **И так далее** каждый час

### Отображение в кошельке:

- **MetaMask/OpenSea**: NFT токены с метаданными
- **Ваше приложение**: Видео плеер + информация о ваучере
- **Админ панель**: Управление всеми ваучерами

## 🛠️ Troubleshooting

### Ошибка "ImageMagick не найден":
```bash
# Установите ImageMagick или используйте Ghostscript
# Проверьте PATH переменную
echo $PATH
```

### Ошибка "Ghostscript не найден":
```bash
# Установите Ghostscript
# Или используйте ImageMagick
```

### PDF не конвертируется:
1. Проверьте права доступа к файлам
2. Убедитесь что PDF файлы не повреждены
3. Попробуйте другой инструмент конвертации

### Изображения не отображаются:
1. Проверьте пути в `public/assets/`
2. Убедитесь что файлы имеют расширение `.png`
3. Проверьте конфигурацию в `data/voucher-config.json`

## ✅ Проверка результатов

После конвертации проверьте:

1. **Изображения созданы:**
   ```bash
   ls public/assets/tier1/
   ls public/assets/tier2/
   ls public/assets/tier3/
   ls public/assets/tier4/
   ```

2. **Конфигурация создана:**
   ```bash
   cat data/voucher-config.json
   ```

3. **Приложение работает:**
   - Откройте `/admin` - админ панель
   - Откройте `/dashboard/rewards` - NFT с видео
   - Проверьте отображение ваучеров

## 🎉 Готово!

После выполнения всех шагов у вас будет:

- ✅ **PDF ваучеры** конвертированы в изображения
- ✅ **Видео правильно** сопоставлены с тирами
- ✅ **NFT система** работает с видео и ваучерами
- ✅ **Админ панель** для управления ваучерами
- ✅ **Кошелек пользователей** показывает NFT с видео

**Система готова к использованию!** 🚀




