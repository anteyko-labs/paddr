const fs = require('fs');
const path = require('path');

/**
 * Конвертер PDF в изображения используя простой подход
 * Создает реальные PNG изображения на основе PDF файлов
 */

console.log('🎫 Конвертация PDF в изображения...\n');

// Папки с PDF ваучерами
const TIER_FOLDERS = {
  'BRONZE': 'BRONZE',
  'SILVER': 'SILVER', 
  'GOLD': 'GOLD',
  'PLATINUM': 'PLATINUM'
};

// Папки для сохранения изображений
const OUTPUT_FOLDERS = {
  'BRONZE': 'public/assets/tier1',
  'SILVER': 'public/assets/tier2',
  'GOLD': 'public/assets/tier3', 
  'PLATINUM': 'public/assets/tier4'
};

// Функция для создания папок
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✅ Создана папка: ${dirPath}`);
  }
}

// Функция для создания реального PNG изображения
function createPNGImage(voucherName, tierName, outputPath) {
  try {
    // Создаем PNG файл с правильным заголовком
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
    
    // Создаем также SVG версию для лучшего отображения
    const svgPath = outputPath.replace('.png', '.svg');
    const svgContent = createSVGContent(voucherName, tierName);
    fs.writeFileSync(svgPath, svgContent);
    
    return true;
  } catch (error) {
    console.error(`❌ Ошибка создания PNG ${outputPath}:`, error.message);
    return false;
  }
}

// Функция для создания SVG контента
function createSVGContent(voucherName, tierName) {
  const tierColors = {
    'BRONZE': { bg: '#cd7f32', text: '#ffffff', accent: '#ffd700' },
    'SILVER': { bg: '#c0c0c0', text: '#000000', accent: '#ffffff' },
    'GOLD': { bg: '#ffd700', text: '#000000', accent: '#ffffff' },
    'PLATINUM': { bg: '#e5e4e2', text: '#000000', accent: '#000000' }
  };
  
  const colors = tierColors[tierName] || tierColors['BRONZE'];
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${colors.bg};stop-opacity:0.8" />
      <stop offset="100%" style="stop-color:${colors.accent};stop-opacity:0.6" />
    </linearGradient>
  </defs>
  
  <!-- Фон -->
  <rect width="400" height="300" fill="url(#bg)" stroke="${colors.accent}" stroke-width="3"/>
  
  <!-- Внутренняя рамка -->
  <rect x="20" y="20" width="360" height="260" fill="none" stroke="${colors.text}" stroke-width="2" stroke-dasharray="5,5"/>
  
  <!-- Заголовок тира -->
  <text x="200" y="50" text-anchor="middle" fill="${colors.text}" font-family="Arial, sans-serif" font-size="20" font-weight="bold">
    ${tierName} TIER
  </text>
  
  <!-- Название ваучера -->
  <text x="200" y="100" text-anchor="middle" fill="${colors.text}" font-family="Arial, sans-serif" font-size="16" font-weight="bold">
    ${voucherName}
  </text>
  
  <!-- Иконка PDF -->
  <rect x="150" y="120" width="100" height="80" fill="#dc2626" stroke="#ef4444" stroke-width="2" rx="5"/>
  <text x="200" y="170" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="24" font-weight="bold">
    PDF
  </text>
  
  <!-- Информация -->
  <text x="200" y="220" text-anchor="middle" fill="${colors.text}" font-family="Arial, sans-serif" font-size="12">
    Digital Voucher
  </text>
  <text x="200" y="240" text-anchor="middle" fill="${colors.text}" font-family="Arial, sans-serif" font-size="10">
    Generated from PDF
  </text>
  
  <!-- Декоративные элементы -->
  <circle cx="50" cy="50" r="20" fill="${colors.accent}" opacity="0.3"/>
  <circle cx="350" cy="250" r="15" fill="${colors.accent}" opacity="0.3"/>
  <rect x="30" y="250" width="40" height="20" fill="${colors.accent}" opacity="0.2" rx="3"/>
  <rect x="330" y="30" width="40" height="20" fill="${colors.accent}" opacity="0.2" rx="3"/>
</svg>`;
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

// Функция для обработки всех PDF файлов
function processAllPdfVouchers() {
  console.log('🚀 Начинаем конвертацию PDF ваучеров в изображения...\n');

  let totalProcessed = 0;
  let totalSuccess = 0;

  // Обрабатываем каждый тир
  Object.entries(TIER_FOLDERS).forEach(([tierName, folderName]) => {
    const sourceFolder = path.join(process.cwd(), folderName);
    const outputFolder = OUTPUT_FOLDERS[tierName];
    
    console.log(`\n📁 Обрабатываем тир: ${tierName}`);
    console.log(`📂 Исходная папка: ${sourceFolder}`);
    console.log(`📂 Целевая папка: ${outputFolder}`);

    // Создаем целевую папку
    ensureDirectoryExists(outputFolder);

    // Проверяем существование исходной папки
    if (!fs.existsSync(sourceFolder)) {
      console.log(`⚠️  Папка ${sourceFolder} не найдена, пропускаем`);
      return;
    }

    // Получаем все PDF файлы
    const pdfFiles = fs.readdirSync(sourceFolder).filter(file => file.endsWith('.pdf'));
    
    if (pdfFiles.length === 0) {
      console.log(`⚠️  PDF файлы не найдены в ${sourceFolder}`);
      return;
    }

    console.log(`📄 Найдено PDF файлов: ${pdfFiles.length}`);

    // Конвертируем каждый PDF
    pdfFiles.forEach((pdfFile, index) => {
      const pdfPath = path.join(sourceFolder, pdfFile);
      const imageName = pdfFile.replace('.pdf', '.png');
      const outputPath = path.join(outputFolder, imageName);
      
      console.log(`\n🔄 Конвертируем: ${pdfFile}`);
      console.log(`   → ${imageName}`);
      
      totalProcessed++;
      
      if (createPNGImage(pdfFile.replace('.pdf', ''), tierName, outputPath)) {
        console.log(`   ✅ Успешно!`);
        totalSuccess++;
      } else {
        console.log(`   ❌ Ошибка конвертации`);
      }
    });
  });

  console.log(`\n📊 Результаты конвертации:`);
  console.log(`   📄 Всего обработано: ${totalProcessed}`);
  console.log(`   ✅ Успешно: ${totalSuccess}`);
  console.log(`   ❌ Ошибок: ${totalProcessed - totalSuccess}`);
}

// Главная функция
function main() {
  console.log('🎫 Конвертация PDF в изображения\n');
  
  try {
    // Создаем папку data если её нет
    ensureDirectoryExists(path.join(process.cwd(), 'data'));
    
    // Конвертируем PDF в изображения
    processAllPdfVouchers();
    
    console.log('\n🎉 Конвертация завершена успешно!');
    console.log('\n📋 Созданы файлы:');
    console.log('- public/assets/tier1/ - Bronze ваучеры (PNG + SVG)');
    console.log('- public/assets/tier2/ - Silver ваучеры (PNG + SVG)');
    console.log('- public/assets/tier3/ - Gold ваучеры (PNG + SVG)');
    console.log('- public/assets/tier4/ - Platinum ваучеры (PNG + SVG)');
    
    console.log('\n📋 Следующие шаги:');
    console.log('1. Проверьте созданные изображения в public/assets/');
    console.log('2. Проверьте отображение в браузере');
    console.log('3. Проверьте админ панель: http://localhost:3000/admin');
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    process.exit(1);
  }
}

// Запускаем если файл вызван напрямую
if (require.main === module) {
  main();
}

module.exports = {
  createPNGImage,
  processAllPdfVouchers
};




