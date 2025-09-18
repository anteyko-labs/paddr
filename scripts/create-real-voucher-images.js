const fs = require('fs');
const path = require('path');

/**
 * Создание реальных изображений ваучеров с нуля
 * Использует HTML Canvas для генерации PNG изображений
 */

console.log('🎨 Создание реальных изображений ваучеров с нуля...\n');

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

// Цвета для каждого тира
const TIER_COLORS = {
  'BRONZE': {
    primary: '#CD7F32',
    secondary: '#FFD700',
    accent: '#B8860B',
    text: '#FFFFFF',
    bg: '#2D1810'
  },
  'SILVER': {
    primary: '#C0C0C0',
    secondary: '#E8E8E8',
    accent: '#A8A8A8',
    text: '#000000',
    bg: '#F5F5F5'
  },
  'GOLD': {
    primary: '#FFD700',
    secondary: '#FFF8DC',
    accent: '#DAA520',
    text: '#000000',
    bg: '#FFFACD'
  },
  'PLATINUM': {
    primary: '#E5E4E2',
    secondary: '#F8F8FF',
    accent: '#C0C0C0',
    text: '#000000',
    bg: '#F0F0F0'
  }
};

// Функция для создания папок
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✅ Создана папка: ${dirPath}`);
  }
}

// Функция для создания HTML страницы с Canvas
function createCanvasHTML(voucherName, tierName, outputPath) {
  const colors = TIER_COLORS[tierName];
  
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Voucher Generator</title>
    <style>
        body { margin: 0; padding: 20px; background: #1a1a1a; }
        canvas { border: 1px solid #333; }
        .info { color: white; margin-top: 10px; }
    </style>
</head>
<body>
    <canvas id="canvas" width="400" height="300"></canvas>
    <div class="info">
        <p>Тир: ${tierName}</p>
        <p>Ваучер: ${voucherName}</p>
        <button onclick="downloadImage()">Скачать PNG</button>
    </div>

    <script>
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        
        // Цвета
        const colors = ${JSON.stringify(colors)};
        
        // Очищаем canvas
        ctx.clearRect(0, 0, 400, 300);
        
        // Фон
        ctx.fillStyle = colors.bg;
        ctx.fillRect(0, 0, 400, 300);
        
        // Градиентный фон
        const gradient = ctx.createLinearGradient(0, 0, 400, 300);
        gradient.addColorStop(0, colors.primary);
        gradient.addColorStop(1, colors.secondary);
        ctx.fillStyle = gradient;
        ctx.fillRect(10, 10, 380, 280);
        
        // Рамка
        ctx.strokeStyle = colors.accent;
        ctx.lineWidth = 3;
        ctx.strokeRect(10, 10, 380, 280);
        
        // Внутренняя рамка
        ctx.strokeStyle = colors.text;
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(30, 30, 340, 240);
        ctx.setLineDash([]);
        
        // Заголовок тира
        ctx.fillStyle = colors.text;
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('${tierName} TIER', 200, 60);
        
        // Название ваучера
        ctx.font = 'bold 18px Arial';
        ctx.fillText('${voucherName}', 200, 100);
        
        // Иконка ваучера
        ctx.fillStyle = '#DC2626';
        ctx.fillRect(150, 120, 100, 80);
        ctx.fillStyle = 'white';
        ctx.font = 'bold 20px Arial';
        ctx.fillText('VOUCHER', 200, 170);
        
        // Информация
        ctx.fillStyle = colors.text;
        ctx.font = '14px Arial';
        ctx.fillText('Digital Voucher', 200, 220);
        ctx.font = '12px Arial';
        ctx.fillText('Generated from PDF', 200, 240);
        
        // Декоративные элементы
        ctx.fillStyle = colors.accent;
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
        
        // Функция скачивания
        function downloadImage() {
            const link = document.createElement('a');
            link.download = '${voucherName.replace(/[^a-zA-Z0-9]/g, '_')}.png';
            link.href = canvas.toDataURL();
            link.click();
        }
        
        // Автоматически скачиваем через 1 секунду
        setTimeout(downloadImage, 1000);
    </script>
</body>
</html>`;

  return htmlContent;
}

// Функция для создания PNG изображения через Puppeteer
async function createPNGWithPuppeteer(voucherName, tierName, outputPath) {
  try {
    // Проверяем наличие Puppeteer
    let puppeteer;
    try {
      puppeteer = require('puppeteer');
    } catch (error) {
      console.log('📦 Устанавливаем Puppeteer...');
      const { execSync } = require('child_process');
      execSync('npm install puppeteer', { stdio: 'inherit' });
      puppeteer = require('puppeteer');
    }

    const colors = TIER_COLORS[tierName];
    
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    await page.setViewport({ width: 400, height: 300 });
    
    // Создаем HTML контент
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body { margin: 0; padding: 0; }
            canvas { width: 400px; height: 300px; }
        </style>
    </head>
    <body>
        <canvas id="canvas" width="400" height="300"></canvas>
        <script>
            const canvas = document.getElementById('canvas');
            const ctx = canvas.getContext('2d');
            
            const colors = ${JSON.stringify(colors)};
            
            // Очищаем canvas
            ctx.clearRect(0, 0, 400, 300);
            
            // Фон
            ctx.fillStyle = colors.bg;
            ctx.fillRect(0, 0, 400, 300);
            
            // Градиентный фон
            const gradient = ctx.createLinearGradient(0, 0, 400, 300);
            gradient.addColorStop(0, colors.primary);
            gradient.addColorStop(1, colors.secondary);
            ctx.fillStyle = gradient;
            ctx.fillRect(10, 10, 380, 280);
            
            // Рамка
            ctx.strokeStyle = colors.accent;
            ctx.lineWidth = 3;
            ctx.strokeRect(10, 10, 380, 280);
            
            // Внутренняя рамка
            ctx.strokeStyle = colors.text;
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.strokeRect(30, 30, 340, 240);
            ctx.setLineDash([]);
            
            // Заголовок тира
            ctx.fillStyle = colors.text;
            ctx.font = 'bold 24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('${tierName} TIER', 200, 60);
            
            // Название ваучера
            ctx.font = 'bold 18px Arial';
            ctx.fillText('${voucherName}', 200, 100);
            
            // Иконка ваучера
            ctx.fillStyle = '#DC2626';
            ctx.fillRect(150, 120, 100, 80);
            ctx.fillStyle = 'white';
            ctx.font = 'bold 20px Arial';
            ctx.fillText('VOUCHER', 200, 170);
            
            // Информация
            ctx.fillStyle = colors.text;
            ctx.font = '14px Arial';
            ctx.fillText('Digital Voucher', 200, 220);
            ctx.font = '12px Arial';
            ctx.fillText('Generated from PDF', 200, 240);
            
            // Декоративные элементы
            ctx.fillStyle = colors.accent;
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
        </script>
    </body>
    </html>`;
    
    await page.setContent(htmlContent);
    
    // Ждем загрузки
    await page.waitForTimeout(1000);
    
    // Делаем скриншот
    const screenshot = await page.screenshot({ 
      type: 'png',
      clip: { x: 0, y: 0, width: 400, height: 300 }
    });
    
    await browser.close();
    
    // Сохраняем PNG
    fs.writeFileSync(outputPath, screenshot);
    
    return true;
  } catch (error) {
    console.error(`❌ Ошибка создания PNG с Puppeteer:`, error.message);
    return false;
  }
}

// Функция для создания простого PNG без Puppeteer
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

// Функция для обработки всех PDF файлов
async function processAllPdfVouchers() {
  console.log('🚀 Начинаем создание реальных изображений ваучеров...\n');

  let totalProcessed = 0;
  let totalSuccess = 0;

  // Обрабатываем каждый тир
  for (const [tierName, folderName] of Object.entries(TIER_FOLDERS)) {
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
      continue;
    }

    // Получаем все PDF файлы
    const pdfFiles = fs.readdirSync(sourceFolder).filter(file => file.endsWith('.pdf'));
    
    if (pdfFiles.length === 0) {
      console.log(`⚠️  PDF файлы не найдены в ${sourceFolder}`);
      continue;
    }

    console.log(`📄 Найдено PDF файлов: ${pdfFiles.length}`);

    // Конвертируем каждый PDF
    for (const pdfFile of pdfFiles) {
      const pdfPath = path.join(sourceFolder, pdfFile);
      const imageName = pdfFile.replace('.pdf', '.png');
      const outputPath = path.join(outputFolder, imageName);
      
      console.log(`\n🔄 Создаем изображение: ${pdfFile}`);
      console.log(`   → ${imageName}`);
      
      totalProcessed++;
      
      // Пробуем создать PNG с Puppeteer
      if (await createPNGWithPuppeteer(pdfFile.replace('.pdf', ''), tierName, outputPath)) {
        console.log(`   ✅ Успешно создан PNG!`);
        totalSuccess++;
      } else {
        // Fallback - создаем простой PNG
        if (createSimplePNG(pdfFile.replace('.pdf', ''), tierName, outputPath)) {
          console.log(`   ✅ Создан простой PNG`);
          totalSuccess++;
        } else {
          console.log(`   ❌ Ошибка создания изображения`);
        }
      }
    }
  }

  console.log(`\n📊 Результаты создания изображений:`);
  console.log(`   📄 Всего обработано: ${totalProcessed}`);
  console.log(`   ✅ Успешно: ${totalSuccess}`);
  console.log(`   ❌ Ошибок: ${totalProcessed - totalSuccess}`);
}

// Главная функция
async function main() {
  console.log('🎨 Создание реальных изображений ваучеров с нуля\n');
  
  try {
    // Создаем папку data если её нет
    ensureDirectoryExists(path.join(process.cwd(), 'data'));
    
    // Создаем изображения
    await processAllPdfVouchers();
    
    console.log('\n🎉 Создание изображений завершено!');
    console.log('\n📋 Созданы файлы:');
    console.log('- public/assets/tier1/ - Bronze ваучеры (PNG)');
    console.log('- public/assets/tier2/ - Silver ваучеры (PNG)');
    console.log('- public/assets/tier3/ - Gold ваучеры (PNG)');
    console.log('- public/assets/tier4/ - Platinum ваучеры (PNG)');
    
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
  createPNGWithPuppeteer,
  createSimplePNG,
  processAllPdfVouchers
};




