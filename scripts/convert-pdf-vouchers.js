const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Скрипт для конвертации PDF ваучеров в изображения
 * и правильного сопоставления видео с тирами
 */

// Правильное сопоставление видео с тирами
const VIDEO_TIER_MAPPING = {
  'video5307504616261323179.mp4': 'Silver',   // 79 = Silver
  'video5307504616261323180.mp4': 'Platinum', // 80 = Platinum  
  'video5307504616261323181.mp4': 'Gold',     // 81 = Gold
  'video5307504616261323182.mp4': 'Bronze'     // 82 = Bronze
};

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

// Функция для конвертации PDF в PNG с помощью ImageMagick
function convertPdfToPng(pdfPath, outputPath) {
  try {
    // Проверяем наличие ImageMagick
    try {
      execSync('magick -version', { stdio: 'ignore' });
    } catch (error) {
      console.error('❌ ImageMagick не найден. Установите ImageMagick для конвертации PDF.');
      console.log('📥 Скачать: https://imagemagick.org/script/download.php');
      return false;
    }

    // Конвертируем PDF в PNG с высоким качеством
    const command = `magick "${pdfPath}" -density 300 -quality 100 "${outputPath}"`;
    execSync(command, { stdio: 'pipe' });
    return true;
  } catch (error) {
    console.error(`❌ Ошибка конвертации ${pdfPath}:`, error.message);
    return false;
  }
}

// Функция для конвертации PDF в JPG с помощью Ghostscript (альтернатива)
function convertPdfToJpgWithGhostscript(pdfPath, outputPath) {
  try {
    // Проверяем наличие Ghostscript
    try {
      execSync('gs -version', { stdio: 'ignore' });
    } catch (error) {
      console.error('❌ Ghostscript не найден. Установите Ghostscript для конвертации PDF.');
      console.log('📥 Скачать: https://www.ghostscript.com/download/gsdnld.html');
      return false;
    }

    // Конвертируем PDF в JPG
    const command = `gs -dNOPAUSE -dBATCH -sDEVICE=jpeg -r300 -sOutputFile="${outputPath}" "${pdfPath}"`;
    execSync(command, { stdio: 'pipe' });
    return true;
  } catch (error) {
    console.error(`❌ Ошибка конвертации ${pdfPath}:`, error.message);
    return false;
  }
}

// Функция для конвертации PDF в изображение (универсальная)
function convertPdfToImage(pdfPath, outputPath) {
  // Сначала пробуем ImageMagick
  if (convertPdfToPng(pdfPath, outputPath)) {
    return true;
  }
  
  // Если не получилось, пробуем Ghostscript
  const jpgPath = outputPath.replace('.png', '.jpg');
  if (convertPdfToJpgWithGhostscript(pdfPath, jpgPath)) {
    // Переименовываем JPG в PNG для единообразия
    fs.renameSync(jpgPath, outputPath);
    return true;
  }
  
  return false;
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
      
      if (convertPdfToImage(pdfPath, outputPath)) {
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

// Функция для создания README с инструкциями
function createReadme() {
  const readmeContent = `# 🎫 Система ваучеров и NFT

## 📁 Структура файлов

### NFT Видео
- \`nft/nft_tiers/video5307504616261323179.mp4\` - Bronze тир
- \`nft/nft_tiers/video5307504616261323180.mp4\` - Silver тир  
- \`nft/nft_tiers/video5307504616261323181.mp4\` - Gold тир
- \`nft/nft_tiers/video5307504616261323182.mp4\` - Platinum тир

### Ваучеры (изображения)
- \`public/assets/tier1/\` - Bronze ваучеры (PNG)
- \`public/assets/tier2/\` - Silver ваучеры (PNG)
- \`public/assets/tier3/\` - Gold ваучеры (PNG)
- \`public/assets/tier4/\` - Platinum ваучеры (PNG)

### Исходные PDF
- \`BRONZE/\` - PDF ваучеры Bronze тира
- \`SILVER/\` - PDF ваучеры Silver тира
- \`GOLD/\` - PDF ваучеры Gold тира
- \`PLATINUM/\` - PDF ваучеры Platinum тира

## 🔄 Как обновить ваучеры

1. Замените PDF файлы в соответствующих папках
2. Запустите: \`node scripts/convert-pdf-vouchers.js\`
3. Изображения автоматически сконвертируются в PNG
4. Конфигурация обновится автоматически

## 📋 Требования

- ImageMagick или Ghostscript для конвертации PDF
- Node.js для запуска скриптов

## 🎯 Использование

Ваучеры автоматически отображаются в админ панели и кошельке пользователей.
`;

  const readmePath = path.join(process.cwd(), 'VOUCHER_SYSTEM_README.md');
  fs.writeFileSync(readmePath, readmeContent);
  console.log(`✅ README создан: ${readmePath}`);
}

// Главная функция
function main() {
  console.log('🎫 Система конвертации PDF ваучеров в изображения\n');
  
  try {
    // Создаем папку data если её нет
    ensureDirectoryExists(path.join(process.cwd(), 'data'));
    
    // Конвертируем PDF в изображения
    processAllPdfVouchers();
    
    // Создаем конфигурацию ваучеров
    createVoucherConfig();
    
    // Обновляем сопоставление видео
    updateVideoMapping();
    
    // Создаем README
    createReadme();
    
    console.log('\n🎉 Конвертация завершена успешно!');
    console.log('\n📋 Следующие шаги:');
    console.log('1. Проверьте созданные изображения в public/assets/');
    console.log('2. Обновите админ панель для использования новых ваучеров');
    console.log('3. Проверьте отображение в кошельке пользователей');
    
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
  convertPdfToImage,
  processAllPdfVouchers,
  createVoucherConfig,
  updateVideoMapping
};
