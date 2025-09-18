const fs = require('fs');
const path = require('path');

/**
 * Извлечение изображений из PDF и создание точных копий
 */

console.log('📄 Извлечение изображений из PDF файлов...\n');

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

// Функция для создания HTML конвертера PDF в изображение
function createPDFConverterHTML(voucherName, tierName, pdfPath, outputPath) {
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
    <title>PDF to Image Converter - ${voucherName}</title>
    <style>
        body { 
            margin: 0; 
            padding: 20px; 
            background: #1a1a1a; 
            color: white; 
            font-family: Arial, sans-serif;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        .pdf-viewer {
            width: 100%;
            height: 600px;
            border: 1px solid #333;
            margin: 20px 0;
        }
        canvas { 
            border: 1px solid #333; 
            margin: 10px 0;
        }
        button { 
            background: #10b981; 
            color: white; 
            border: none; 
            padding: 10px 20px; 
            border-radius: 4px; 
            cursor: pointer; 
            margin: 10px;
            font-size: 16px;
        }
        button:hover { 
            background: #059669; 
        }
        .info {
            background: #111827;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .steps {
            background: #1f2937;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .step {
            margin: 10px 0;
            padding: 10px;
            background: #374151;
            border-radius: 4px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎨 Конвертер PDF в изображение</h1>
        <h2>${voucherName} - ${tierName}</h2>
        
        <div class="info">
            <h3>📋 Инструкция:</h3>
            <ol>
                <li>Загрузите PDF файл ниже</li>
                <li>Просмотрите содержимое PDF</li>
                <li>Нажмите "Создать изображение как в PDF"</li>
                <li>Скачайте PNG файл</li>
                <li>Сохраните в папку: ${outputPath}</li>
            </ol>
        </div>
        
        <div class="steps">
            <h3>📁 Шаг 1: Загрузите PDF</h3>
            <input type="file" id="pdfInput" accept=".pdf" />
            <div id="pdfViewer" class="pdf-viewer" style="display: none;"></div>
        </div>
        
        <div class="steps">
            <h3>🎨 Шаг 2: Создайте изображение</h3>
            <button onclick="createImageFromPDF()">📸 Создать изображение как в PDF</button>
            <button onclick="createCustomImage()">🎨 Создать кастомное изображение</button>
            <canvas id="canvas" width="400" height="300" style="display: none;"></canvas>
        </div>
        
        <div class="steps">
            <h3>📥 Шаг 3: Скачайте результат</h3>
            <button id="downloadBtn" onclick="downloadImage()" style="display: none;">📥 Скачать PNG</button>
        </div>
        
        <div class="info">
            <h3>🎯 Цвета для ${tierName}:</h3>
            <div style="display: flex; gap: 20px; margin: 10px 0;">
                <div style="width: 50px; height: 50px; background: ${color.primary}; border: 1px solid #333;"></div>
                <div style="width: 50px; height: 50px; background: ${color.secondary}; border: 1px solid #333;"></div>
                <div style="width: 50px; height: 50px; background: ${color.bg}; border: 1px solid #333;"></div>
            </div>
        </div>
    </div>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
    <script>
        let pdfDoc = null;
        let currentPage = 1;
        
        // Настройка PDF.js
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        
        document.getElementById('pdfInput').addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                loadPDF(file);
            }
        });
        
        function loadPDF(file) {
            const fileReader = new FileReader();
            fileReader.onload = function(e) {
                const typedarray = new Uint8Array(e.target.result);
                pdfjsLib.getDocument(typedarray).promise.then(function(pdf) {
                    pdfDoc = pdf;
                    renderPage(1);
                    document.getElementById('pdfViewer').style.display = 'block';
                });
            };
            fileReader.readAsArrayBuffer(file);
        }
        
        function renderPage(pageNum) {
            pdfDoc.getPage(pageNum).then(function(page) {
                const scale = 1.5;
                const viewport = page.getViewport({scale: scale});
                
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                
                const renderContext = {
                    canvasContext: ctx,
                    viewport: viewport
                };
                
                page.render(renderContext).promise.then(function() {
                    const pdfViewer = document.getElementById('pdfViewer');
                    pdfViewer.innerHTML = '';
                    pdfViewer.appendChild(canvas);
                });
            });
        }
        
        function createImageFromPDF() {
            const pdfCanvas = document.querySelector('#pdfViewer canvas');
            if (!pdfCanvas) {
                alert('Сначала загрузите PDF файл!');
                return;
            }
            
            const outputCanvas = document.getElementById('canvas');
            const ctx = outputCanvas.getContext('2d');
            
            // Показываем canvas
            outputCanvas.style.display = 'block';
            
            // Очищаем canvas
            ctx.clearRect(0, 0, 400, 300);
            
            // Копируем изображение из PDF
            ctx.drawImage(pdfCanvas, 0, 0, 400, 300);
            
            // Показываем кнопку скачивания
            document.getElementById('downloadBtn').style.display = 'block';
            
            alert('✅ Изображение создано! Теперь можете скачать PNG.');
        }
        
        function createCustomImage() {
            const canvas = document.getElementById('canvas');
            const ctx = canvas.getContext('2d');
            
            // Показываем canvas
            canvas.style.display = 'block';
            
            const colors = ${JSON.stringify(color)};
            
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
            ctx.strokeStyle = colors.primary;
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
            ctx.fillStyle = colors.text;
            ctx.font = '14px Arial';
            ctx.fillText('Digital Voucher', 200, 240);
            ctx.font = '12px Arial';
            ctx.fillText('Generated from PDF', 200, 260);
            
            // Декоративные элементы
            ctx.fillStyle = colors.primary;
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
            
            // Показываем кнопку скачивания
            document.getElementById('downloadBtn').style.display = 'block';
        }
        
        function downloadImage() {
            const canvas = document.getElementById('canvas');
            const link = document.createElement('a');
            link.download = '${voucherName.replace(/[^a-zA-Z0-9]/g, '_')}.png';
            link.href = canvas.toDataURL();
            link.click();
        }
    </script>
</body>
</html>`;

  fs.writeFileSync(outputPath, htmlContent);
}

// Функция для обработки всех PDF файлов
function processAllPdfVouchers() {
  console.log('🚀 Создание конвертеров PDF в изображения...\n');

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

    // Создаем конвертер для каждого PDF
    pdfFiles.forEach((pdfFile, index) => {
      const pdfPath = path.join(sourceFolder, pdfFile);
      const voucherName = pdfFile.replace('.pdf', '');
      const converterName = `${voucherName.replace(/[^a-zA-Z0-9]/g, '_')}_converter.html`;
      const outputPath = path.join(outputFolder, converterName);
      
      console.log(`\n🔄 Создаем конвертер: ${pdfFile}`);
      console.log(`   → ${converterName}`);
      
      totalProcessed++;
      
      try {
        createPDFConverterHTML(voucherName, tierName, pdfPath, outputPath);
        console.log(`   ✅ Конвертер создан!`);
        totalSuccess++;
      } catch (error) {
        console.log(`   ❌ Ошибка создания конвертера: ${error.message}`);
      }
    });
  });

  console.log(`\n📊 Результаты создания конвертеров:`);
  console.log(`   📄 Всего обработано: ${totalProcessed}`);
  console.log(`   ✅ Успешно: ${totalSuccess}`);
  console.log(`   ❌ Ошибок: ${totalProcessed - totalSuccess}`);
}

// Главная функция
function main() {
  console.log('📄 Создание конвертеров PDF в изображения\n');
  
  try {
    // Создаем папку data если её нет
    ensureDirectoryExists(path.join(process.cwd(), 'data'));
    
    // Создаем конвертеры
    processAllPdfVouchers();
    
    console.log('\n🎉 Конвертеры созданы!');
    console.log('\n📋 Следующие шаги:');
    console.log('1. Откройте HTML конвертеры в браузере');
    console.log('2. Загрузите PDF файлы в конвертеры');
    console.log('3. Создайте изображения точно как в PDF');
    console.log('4. Скачайте PNG файлы');
    console.log('5. Сохраните в папки public/assets/');
    
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
  createPDFConverterHTML,
  processAllPdfVouchers
};




