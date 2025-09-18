const fs = require('fs');
const path = require('path');

/**
 * Скрипт для проверки ваучеров и видео
 */

console.log('🔍 Проверка системы ваучеров и NFT видео...\n');

// Проверяем PDF файлы
console.log('📄 Проверка PDF ваучеров:');
const tierFolders = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM'];

tierFolders.forEach(tier => {
  const folderPath = path.join(process.cwd(), tier);
  if (fs.existsSync(folderPath)) {
    const pdfFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.pdf'));
    console.log(`  ${tier}: ${pdfFiles.length} PDF файлов`);
    pdfFiles.forEach(file => {
      console.log(`    - ${file}`);
    });
  } else {
    console.log(`  ${tier}: папка не найдена`);
  }
});

// Проверяем видео файлы
console.log('\n🎬 Проверка NFT видео:');
const videoFolder = path.join(process.cwd(), 'nft', 'nft_tiers');
if (fs.existsSync(videoFolder)) {
  const videoFiles = fs.readdirSync(videoFolder).filter(file => file.endsWith('.mp4'));
  console.log(`  Найдено ${videoFiles.length} видео файлов:`);
  videoFiles.forEach(file => {
    const tier = file.includes('79') ? 'Bronze' : 
                 file.includes('80') ? 'Silver' :
                 file.includes('81') ? 'Gold' : 'Platinum';
    console.log(`    - ${file} → ${tier} тир`);
  });
} else {
  console.log('  Папка nft/nft_tiers не найдена');
}

// Проверяем конвертированные изображения
console.log('\n🖼️ Проверка конвертированных изображений:');
const assetFolders = {
  'tier1': 'Bronze',
  'tier2': 'Silver', 
  'tier3': 'Gold',
  'tier4': 'Platinum'
};

Object.entries(assetFolders).forEach(([folder, tier]) => {
  const folderPath = path.join(process.cwd(), 'public', 'assets', folder);
  if (fs.existsSync(folderPath)) {
    const imageFiles = fs.readdirSync(folderPath).filter(file => 
      file.endsWith('.png') || file.endsWith('.jpg')
    );
    console.log(`  ${tier} (${folder}): ${imageFiles.length} изображений`);
  } else {
    console.log(`  ${tier} (${folder}): папка не найдена`);
  }
});

// Проверяем конфигурацию
console.log('\n⚙️ Проверка конфигурации:');
const configPath = path.join(process.cwd(), 'data', 'voucher-config.json');
if (fs.existsSync(configPath)) {
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  console.log(`  Конфигурация ваучеров: версия ${config.version}`);
  Object.entries(config.tiers).forEach(([tier, data]) => {
    console.log(`    ${tier}: ${data.vouchers.length} ваучеров`);
  });
} else {
  console.log('  Конфигурация ваучеров не найдена');
}

// Проверяем сопоставление видео
const mappingPath = path.join(process.cwd(), 'data', 'video-tier-mapping.json');
if (fs.existsSync(mappingPath)) {
  const mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));
  console.log(`  Сопоставление видео: ${Object.keys(mapping.mapping).length} видео`);
} else {
  console.log('  Сопоставление видео не найдено');
}

console.log('\n✅ Проверка завершена!');
console.log('\n📋 Следующие шаги:');
console.log('1. Если PDF файлы найдены, запустите: node scripts/convert-pdf-vouchers.js');
console.log('2. Если изображения не найдены, установите ImageMagick или Ghostscript');
console.log('3. Проверьте админ панель: http://localhost:3000/admin');
console.log('4. Проверьте NFT отображение: http://localhost:3000/dashboard/rewards');




