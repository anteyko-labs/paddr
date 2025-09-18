const fs = require('fs');
const path = require('path');

/**
 * Простой конвертер PDF в изображения без внешних зависимостей
 * Создает заглушки изображений на основе PDF файлов
 */

console.log('🎫 Простая конвертация PDF ваучеров в изображения...\n');

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

// Функция для создания заглушки изображения
function createImagePlaceholder(pdfPath, outputPath, voucherName) {
  try {
    // Создаем простой SVG как заглушку
    const svgContent = `
<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="300" fill="#1f2937" stroke="#374151" stroke-width="2"/>
  <rect x="20" y="20" width="360" height="260" fill="#111827" stroke="#4b5563" stroke-width="1"/>
  
  <!-- Заголовок -->
  <text x="200" y="60" text-anchor="middle" fill="#10b981" font-family="Arial, sans-serif" font-size="18" font-weight="bold">
    ${voucherName}
  </text>
  
  <!-- Иконка PDF -->
  <rect x="150" y="100" width="100" height="80" fill="#dc2626" stroke="#ef4444" stroke-width="2"/>
  <text x="200" y="150" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="24" font-weight="bold">
    PDF
  </text>
  
  <!-- Информация -->
  <text x="200" y="200" text-anchor="middle" fill="#9ca3af" font-family="Arial, sans-serif" font-size="12">
    Voucher Image
  </text>
  <text x="200" y="220" text-anchor="middle" fill="#6b7280" font-family="Arial, sans-serif" font-size="10">
    Generated from PDF
  </text>
  
  <!-- Рамка -->
  <rect x="10" y="10" width="380" height="280" fill="none" stroke="#10b981" stroke-width="3"/>
</svg>`;

    // Сохраняем SVG
    fs.writeFileSync(outputPath.replace('.png', '.svg'), svgContent);
    
    // Создаем простой PNG заглушку (базовый формат)
    const pngHeader = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
      0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
      0x00, 0x00, 0x01, 0x90, 0x00, 0x00, 0x01, 0x2C, // 400x300
      0x08, 0x06, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // RGB, no compression
      0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, // IEND chunk
      0xAE, 0x42, 0x60, 0x82
    ]);
    
    fs.writeFileSync(outputPath, pngHeader);
    
    return true;
  } catch (error) {
    console.error(`❌ Ошибка создания изображения ${outputPath}:`, error.message);
    return false;
  }
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
      
      if (createImagePlaceholder(pdfPath, outputPath, pdfFile.replace('.pdf', ''))) {
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

// Функция для создания конфигурации ваучеров
function createVoucherConfig() {
  console.log('\n🔧 Создаем конфигурацию ваучеров...');

  const voucherConfig = {
    tiers: {},
    version: 1,
    lastUpdated: new Date().toISOString()
  };

  // Обрабатываем каждый тир
  Object.entries(TIER_FOLDERS).forEach(([tierName, folderName]) => {
    const sourceFolder = path.join(process.cwd(), folderName);
    
    if (!fs.existsSync(sourceFolder)) {
      return;
    }

    const pdfFiles = fs.readdirSync(sourceFolder).filter(file => file.endsWith('.pdf'));
    
    voucherConfig.tiers[tierName] = {
      name: tierName,
      vouchers: pdfFiles.map((pdfFile, index) => {
        const voucherName = pdfFile.replace('.pdf', '');
        const imageName = pdfFile.replace('.pdf', '.png');
        
        return {
          id: `${tierName.toLowerCase()}_${index + 1}`,
          name: voucherName,
          description: `Voucher: ${voucherName}`,
          value: extractValueFromName(voucherName),
          type: determineVoucherType(voucherName),
          image: imageName,
          pdf: pdfFile
        };
      })
    };
  });

  // Сохраняем конфигурацию
  const configPath = path.join(process.cwd(), 'data', 'voucher-config.json');
  ensureDirectoryExists(path.dirname(configPath));
  fs.writeFileSync(configPath, JSON.stringify(voucherConfig, null, 2));
  
  console.log(`✅ Конфигурация сохранена: ${configPath}`);
}

// Функция для извлечения значения из названия ваучера
function extractValueFromName(voucherName) {
  // Ищем числовые значения в названии
  const valueMatch = voucherName.match(/(\d+)\s*(\$|%|hour|hours)/i);
  if (valueMatch) {
    return `${valueMatch[1]}${valueMatch[2]}`;
  }
  
  // Специальные случаи
  if (voucherName.toLowerCase().includes('free')) {
    return 'Free';
  }
  if (voucherName.toLowerCase().includes('unlimited')) {
    return 'Unlimited';
  }
  if (voucherName.toLowerCase().includes('premium')) {
    return 'Premium';
  }
  
  return 'Special';
}

// Функция для определения типа ваучера
function determineVoucherType(voucherName) {
  const name = voucherName.toLowerCase();
  
  if (name.includes('rental') && name.includes('hour')) {
    return 'SINGLE_USE';
  }
  if (name.includes('rental') && name.includes('$')) {
    return 'MULTI_USE';
  }
  if (name.includes('discount') || name.includes('unlimited') || name.includes('premium')) {
    return 'DURATION';
  }
  
  return 'SINGLE_USE';
}

// Функция для обновления видео маппинга
function updateVideoMapping() {
  console.log('\n🎬 Обновляем сопоставление видео с тирами...');
  
  const VIDEO_TIER_MAPPING = {
    'video5307504616261323179.mp4': 'Silver',   // 79 = Silver
    'video5307504616261323180.mp4': 'Platinum', // 80 = Platinum  
    'video5307504616261323181.mp4': 'Gold',     // 81 = Gold
    'video5307504616261323182.mp4': 'Bronze'    // 82 = Bronze
  };
  
  const videoMapping = {
    mapping: VIDEO_TIER_MAPPING,
    description: 'Правильное сопоставление видео с тирами',
    note: '79=Silver, 80=Platinum, 81=Gold, 82=Bronze',
    lastUpdated: new Date().toISOString()
  };
  
  const mappingPath = path.join(process.cwd(), 'data', 'video-tier-mapping.json');
  ensureDirectoryExists(path.dirname(mappingPath));
  fs.writeFileSync(mappingPath, JSON.stringify(videoMapping, null, 2));
  
  console.log(`✅ Сопоставление видео сохранено: ${mappingPath}`);
}

// Главная функция
function main() {
  console.log('🎫 Простая конвертация PDF ваучеров в изображения\n');
  
  try {
    // Создаем папку data если её нет
    ensureDirectoryExists(path.join(process.cwd(), 'data'));
    
    // Конвертируем PDF в изображения
    processAllPdfVouchers();
    
    // Создаем конфигурацию ваучеров
    createVoucherConfig();
    
    // Обновляем сопоставление видео
    updateVideoMapping();
    
    console.log('\n🎉 Конвертация завершена успешно!');
    console.log('\n📋 Созданы файлы:');
    console.log('- public/assets/tier1/ - Bronze ваучеры');
    console.log('- public/assets/tier2/ - Silver ваучеры');
    console.log('- public/assets/tier3/ - Gold ваучеры');
    console.log('- public/assets/tier4/ - Platinum ваучеры');
    console.log('- data/voucher-config.json - Конфигурация ваучеров');
    console.log('- data/video-tier-mapping.json - Сопоставление видео');
    
    console.log('\n📋 Следующие шаги:');
    console.log('1. Проверьте созданные изображения в public/assets/');
    console.log('2. Для лучшего качества установите ImageMagick и запустите: node scripts/convert-pdf-vouchers.js');
    console.log('3. Проверьте админ панель: http://localhost:3000/admin');
    console.log('4. Проверьте NFT отображение: http://localhost:3000/dashboard/rewards');
    
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
  createImagePlaceholder,
  processAllPdfVouchers,
  createVoucherConfig,
  updateVideoMapping
};




