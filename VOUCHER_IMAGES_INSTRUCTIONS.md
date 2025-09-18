
# 🎨 Инструкция по созданию изображений ваучеров

## 📋 Что нужно сделать:

1. **Откройте файл генератора:**
   - Откройте в браузере: `scripts/generate-voucher-images.html`
   - Или скопируйте файл на рабочий стол и откройте

2. **Сгенерируйте изображения:**
   - Нажмите "🚀 Сгенерировать все изображения"
   - Все изображения будут созданы автоматически

3. **Скачайте PNG файлы:**
   - Нажмите "📥 Скачать PNG" под каждым изображением
   - Или нажмите "📥 Скачать все PNG" для массового скачивания

4. **Сохраните файлы в правильные папки:**
   - **Bronze**: сохраните в `public/assets/tier1/`
   - **Silver**: сохраните в `public/assets/tier2/`
   - **Gold**: сохраните в `public/assets/tier3/`
   - **Platinum**: сохраните в `public/assets/tier4/`

## 📂 Структура файлов:

```
public/assets/
├── tier1/          # Bronze ваучеры
│   ├── 1 hour Free Rental Voucher.png
│   ├── 1 hour Free Rental Voucher-1.png
│   ├── 10% Restaurant Discount.png
│   └── 10% Auto Service Discount.png
├── tier2/          # Silver ваучеры
│   ├── 2 hours Free Rental Voucher.png
│   ├── 150$ Rental Voucher.png
│   ├── 15% Auto Service Discount.png
│   ├── 10% Restaurant Discount.png
│   ├── Free Car Wash Voucher.png
│   ├── Free Upgrade Voucher.png
│   └── Frame 1686560875.png
├── tier3/          # Gold ваучеры
│   ├── 3 hours Free Rental Voucher.png
│   ├── 600$ Rental Voucher.png
│   ├── 20% Auto Service Discount.png
│   ├── 15% Restaurant Discount.png
│   ├── Unlimited Mileage.png
│   ├── Premium Protection.png
│   ├── Free Car Wash Voucher.png
│   ├── Free Upgrade Voucher.png
│   └── Frame 1686560876.png
└── tier4/          # Platinum ваучеры
    ├── 5 hours Free Rental Voucher.png
    ├── 1250$ Rental Voucher.png
    ├── 20% Auto Service Discount.png
    ├── 20% Restaurant Discount.png
    ├── Unlimited Mileage.png
    ├── Premium Protection.png
    ├── Free Car Wash Voucher.png
    ├── Free Upgrade Voucher.png
    ├── Chauffeur Service Voucher (6h).png
    ├── Free UAE Delivery Voucher.png
    └── Frame 1686560878.png
```

## 🎯 Особенности изображений:

- **Bronze**: Бронзовые цвета (#CD7F32, #FFD700)
- **Silver**: Серебряные цвета (#C0C0C0, #E8E8E8)
- **Gold**: Золотые цвета (#FFD700, #FFF8DC)
- **Platinum**: Платиновые цвета (#E5E4E2, #F8F8FF)

## ✅ После создания изображений:

1. Проверьте что все файлы на месте
2. Запустите: `npm run dev`
3. Проверьте: http://localhost:3000/admin
4. Проверьте: http://localhost:3000/dashboard/rewards

## 🚀 Готово!

После выполнения всех шагов у вас будут реальные PNG изображения ваучеров!
