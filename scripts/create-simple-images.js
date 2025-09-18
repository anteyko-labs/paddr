const fs = require('fs');
const path = require('path');

/**
 * Простое создание изображений ваучеров без браузера
 * Создает базовые PNG файлы с правильными заголовками
 */

console.log('🎨 Создание простых изображений ваучеров...\n');

// Данные ваучеров
const vouchers = {
  'BRONZE': [
    '1 hour Free Rental Voucher',
    '1 hour Free Rental Voucher-1', 
    '10% Restaurant Discount',
    '10% Auto Service Discount'
  ],
  'SILVER': [
    '2 hours Free Rental Voucher',
    '150$ Rental Voucher',
    '15% Auto Service Discount',
    '10% Restaurant Discount',
    'Free Car Wash Voucher',
    'Free Upgrade Voucher',
    'Frame 1686560875'
  ],
  'GOLD': [
    '3 hours Free Rental Voucher',
    '600$ Rental Voucher',
    '20% Auto Service Discount',
    '15% Restaurant Discount',
    'Unlimited Mileage',
    'Premium Protection',
    'Free Car Wash Voucher',
    'Free Upgrade Voucher',
    'Frame 1686560876'
  ],
  'PLATINUM': [
    '5 hours Free Rental Voucher',
    '1250$ Rental Voucher',
    '20% Auto Service Discount',
    '20% Restaurant Discount',
    'Unlimited Mileage',
    'Premium Protection',
    'Free Car Wash Voucher',
    'Free Upgrade Voucher',
    'Chauffeur Service Voucher (6h)',
    'Free UAE Delivery Voucher',
    'Frame 1686560878'
  ]
};

// Функция для создания папок
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✅ Создана папка: ${dirPath}`);
  }
}

// Функция для создания простого PNG файла
function createSimplePNG(voucherName, tierName, outputPath) {
  try {
    // Создаем простой PNG файл с правильным заголовком
    const width = 400;
    const height = 300;
    
    // PNG заголовок
    const pngSignature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
    
    // IHDR chunk
    const ihdrData = Buffer.alloc(13);
    ihdrData.writeUInt32BE(width, 0);   // width
    ihdrData.writeUInt32BE(height, 4); // height
    ihdrData.writeUInt8(8, 8);         // bit depth
    ihdrData.writeUInt8(2, 9);         // color type (RGB)
    ihdrData.writeUInt8(0, 10);        // compression
    ihdrData.writeUInt8(0, 11);        // filter
    ihdrData.writeUInt8(0, 12);        // interlace
    
    const ihdrCrc = crc32(Buffer.concat([Buffer.from('IHDR'), ihdrData]));
    const ihdrChunk = Buffer.concat([
      Buffer.from([0x00, 0x00, 0x00, 0x0D]), // length
      Buffer.from('IHDR'),
      ihdrData,
      Buffer.from([
        (ihdrCrc >> 24) & 0xFF,
        (ihdrCrc >> 16) & 0xFF,
        (ihdrCrc >> 8) & 0xFF,
        ihdrCrc & 0xFF
      ])
    ]);
    
    // IDAT chunk (минимальные данные)
    const idatData = Buffer.alloc(1); // пустые данные
    const idatCrc = crc32(Buffer.concat([Buffer.from('IDAT'), idatData]));
    const idatChunk = Buffer.concat([
      Buffer.from([0x00, 0x00, 0x00, 0x01]), // length
      Buffer.from('IDAT'),
      idatData,
      Buffer.from([
        (idatCrc >> 24) & 0xFF,
        (idatCrc >> 16) & 0xFF,
        (idatCrc >> 8) & 0xFF,
        idatCrc & 0xFF
      ])
    ]);
    
    // IEND chunk
    const iendCrc = crc32(Buffer.from('IEND'));
    const iendChunk = Buffer.concat([
      Buffer.from([0x00, 0x00, 0x00, 0x00]), // length
      Buffer.from('IEND'),
      Buffer.from([
        (iendCrc >> 24) & 0xFF,
        (iendCrc >> 16) & 0xFF,
        (iendCrc >> 8) & 0xFF,
        iendCrc & 0xFF
      ])
    ]);
    
    // Собираем PNG файл
    const pngBuffer = Buffer.concat([pngSignature, ihdrChunk, idatChunk, iendChunk]);
    
    // Сохраняем PNG файл
    fs.writeFileSync(outputPath, pngBuffer);
    
    return true;
  } catch (error) {
    console.error(`❌ Ошибка создания PNG:`, error.message);
    return false;
  }
}

// Простая функция CRC32
function crc32(data) {
  const table = [];
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < data.length; i++) {
    crc = table[(crc ^ data[i]) & 0xFF] ^ (crc >>> 8);
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

// Функция для создания HTML файла для каждого ваучера
function createHTMLForVoucher(voucherName, tierName, outputPath) {
  const colors = {
    'BRONZE': { primary: '#CD7F32', secondary: '#FFD700', text: '#FFFFFF', bg: '#2D1810' },
    'SILVER': { primary: '#C0C0C0', secondary: '#E8E8E8', text: '#000000', bg: '#F5F5F5' },
    'GOLD': { primary: '#FFD700', secondary: '#FFF8DC', text: '#000000', bg: '#FFFACD' },
    'PLATINUM': { primary: '#E5E4E2', secondary: '#F8F8FF', text: '#000000', bg: '#F0F0F0' }
  };
  
  const color = colors[tierName];
  
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${voucherName}</title>
    <style>
        body { margin: 0; padding: 20px; background: #1a1a1a; color: white; }
        canvas { border: 1px solid #333; }
        button { background: #10b981; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; margin: 10px; }
        button:hover { background: #059669; }
    </style>
</head>
<body>
    <h1>${voucherName} - ${tierName}</h1>
    <canvas id="canvas" width="400" height="300"></canvas>
    <br>
    <button onclick="downloadImage()">📥 Скачать PNG</button>
    
    <script>
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        
        // Очищаем canvas
        ctx.clearRect(0, 0, 400, 300);
        
        // Фон
        ctx.fillStyle = '${color.bg}';
        ctx.fillRect(0, 0, 400, 300);
        
        // Градиентный фон
        const gradient = ctx.createLinearGradient(0, 0, 400, 300);
        gradient.addColorStop(0, '${color.primary}');
        gradient.addColorStop(1, '${color.secondary}');
        ctx.fillStyle = gradient;
        ctx.fillRect(10, 10, 380, 280);
        
        // Рамка
        ctx.strokeStyle = '${color.primary}';
        ctx.lineWidth = 3;
        ctx.strokeRect(10, 10, 380, 280);
        
        // Внутренняя рамка
        ctx.strokeStyle = '${color.text}';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(30, 30, 340, 240);
        ctx.setLineDash([]);
        
        // Заголовок тира
        ctx.fillStyle = '${color.text}';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('${tierName} TIER', 200, 60);
        
        // Название ваучера
        ctx.font = 'bold 16px Arial';
        const words = '${voucherName}'.split(' ');
        let y = 100;
        for (let i = 0; i < words.length; i += 2) {
            const line = words.slice(i, i + 2).join(' ');
            ctx.fillText(line, 200, y);
            y += 25;
        }
        
        // Иконка ваучера
        ctx.fillStyle = '#DC2626';
        ctx.fillRect(150, 140, 100, 80);
        ctx.fillStyle = 'white';
        ctx.font = 'bold 18px Arial';
        ctx.fillText('VOUCHER', 200, 185);
        
        // Информация
        ctx.fillStyle = '${color.text}';
        ctx.font = '14px Arial';
        ctx.fillText('Digital Voucher', 200, 240);
        ctx.font = '12px Arial';
        ctx.fillText('Generated from PDF', 200, 260);
        
        // Декоративные элементы
        ctx.fillStyle = '${color.primary}';
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.arc(50, 50, 20, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(350, 250, 15, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.fillRect(30, 250, 40, 20);
        ctx.fillRect(330, 30, 40, 20);
        
        ctx.globalAlpha = 1;
        
        function downloadImage() {
            const link = document.createElement('a');
            link.download = '${voucherName.replace(/[^a-zA-Z0-9]/g, '_')}.png';
            link.href = canvas.toDataURL();
            link.click();
        }
        
        // Автоматически скачиваем через 2 секунды
        setTimeout(downloadImage, 2000);
    </script>
</body>
</html>`;

  fs.writeFileSync(outputPath, htmlContent);
}

// Главная функция
function main() {
  console.log('🚀 Создание изображений ваучеров...\n');

  let totalProcessed = 0;
  let totalSuccess = 0;

  // Обрабатываем каждый тир
  Object.entries(vouchers).forEach(([tierName, voucherList]) => {
    const outputFolder = `public/assets/tier${tierName === 'BRONZE' ? '1' : tierName === 'SILVER' ? '2' : tierName === 'GOLD' ? '3' : '4'}`;
    
    console.log(`\n📁 Обрабатываем тир: ${tierName}`);
    console.log(`📂 Целевая папка: ${outputFolder}`);

    // Создаем целевую папку
    ensureDirectoryExists(outputFolder);

    // Создаем изображения для каждого ваучера
    voucherList.forEach((voucherName, index) => {
      const imageName = `${voucherName}.png`;
      const outputPath = path.join(outputFolder, imageName);
      const htmlPath = path.join(outputFolder, `${voucherName.replace(/[^a-zA-Z0-9]/g, '_')}.html`);
      
      console.log(`\n🔄 Создаем: ${voucherName}`);
      console.log(`   → ${imageName}`);
      
      totalProcessed++;
      
      // Создаем простой PNG
      if (createSimplePNG(voucherName, tierName, outputPath)) {
        console.log(`   ✅ PNG создан`);
        
        // Создаем HTML файл для лучшего качества
        createHTMLForVoucher(voucherName, tierName, htmlPath);
        console.log(`   ✅ HTML создан: ${htmlPath}`);
        
        totalSuccess++;
      } else {
        console.log(`   ❌ Ошибка создания`);
      }
    });
  });

  console.log(`\n📊 Результаты:`);
  console.log(`   📄 Всего обработано: ${totalProcessed}`);
  console.log(`   ✅ Успешно: ${totalSuccess}`);
  console.log(`   ❌ Ошибок: ${totalProcessed - totalSuccess}`);

  console.log('\n🎉 Создание завершено!');
  console.log('\n📋 Следующие шаги:');
  console.log('1. Откройте HTML файлы в браузере для лучшего качества');
  console.log('2. Или используйте: scripts/generate-voucher-images.html');
  console.log('3. Проверьте PNG файлы в public/assets/');
  console.log('4. Запустите: npm run dev');
  console.log('5. Проверьте: http://localhost:3000/admin');
}

// Запускаем
main();




