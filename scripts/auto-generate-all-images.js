const fs = require('fs');
const path = require('path');

/**
 * Автоматический генератор всех изображений ваучеров
 * Создает изображения с правильным форматом как в PDF
 */

console.log('🎨 Автоматическое создание всех изображений ваучеров...\n');

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

// Функция для создания HTML файла с автоматическим созданием изображения
function createAutoImageHTML(voucherName, tierName, outputPath) {
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
    <title>Auto Image Generator - ${voucherName}</title>
    <style>
        body { margin: 0; padding: 20px; background: #1a1a1a; color: white; font-family: Arial, sans-serif; }
        .container { max-width: 800px; margin: 0 auto; }
        canvas { border: 1px solid #333; margin: 10px 0; }
        .info { background: #111827; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .status { background: #1f2937; padding: 15px; border-radius: 8px; margin: 10px 0; }
        .success { background: #065f46; }
        .error { background: #7f1d1d; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎨 Автоматический генератор изображений</h1>
        <h2>${voucherName} - ${tierName}</h2>
        
        <div class="info">
            <h3>📋 Автоматическое создание:</h3>
            <p>Этот файл автоматически создаст изображение ваучера и скачает PNG файл.</p>
            <p>Никаких действий с вашей стороны не требуется!</p>
        </div>
        
        <div id="status" class="status">
            <h3>⏳ Создание изображения...</h3>
            <p>Пожалуйста, подождите...</p>
        </div>
        
        <canvas id="canvas" width="600" height="400" style="display: none;"></canvas>
        
        <div class="info">
            <h3>🎯 Цвета для ${tierName}:</h3>
            <div style="display: flex; gap: 20px; margin: 10px 0;">
                <div style="width: 50px; height: 50px; background: ${color.primary}; border: 1px solid #333;"></div>
                <div style="width: 50px; height: 50px; background: ${color.secondary}; border: 1px solid #333;"></div>
                <div style="width: 50px; height: 50px; background: ${color.bg}; border: 1px solid #333;"></div>
            </div>
        </div>
    </div>

    <script>
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        const statusDiv = document.getElementById('status');
        
        const colors = ${JSON.stringify(color)};
        
        function updateStatus(message, isSuccess = false, isError = false) {
            statusDiv.innerHTML = \`<h3>\${isSuccess ? '✅' : isError ? '❌' : '⏳'} \${message}</h3>\`;
            statusDiv.className = \`status \${isSuccess ? 'success' : isError ? 'error' : ''}\`;
        }
        
        function createVoucherImage() {
            try {
                updateStatus('Создание изображения...');
                
                // Показываем canvas
                canvas.style.display = 'block';
                
                // Очищаем canvas
                ctx.clearRect(0, 0, 600, 400);
                
                // Фон
                ctx.fillStyle = colors.bg;
                ctx.fillRect(0, 0, 600, 400);
                
                // Градиентный фон
                const gradient = ctx.createLinearGradient(0, 0, 600, 400);
                gradient.addColorStop(0, colors.primary);
                gradient.addColorStop(1, colors.secondary);
                ctx.fillStyle = gradient;
                ctx.fillRect(20, 20, 560, 360);
                
                // Рамка
                ctx.strokeStyle = colors.primary;
                ctx.lineWidth = 4;
                ctx.strokeRect(20, 20, 560, 360);
                
                // Внутренняя рамка
                ctx.strokeStyle = colors.text;
                ctx.lineWidth = 2;
                ctx.setLineDash([8, 8]);
                ctx.strokeRect(40, 40, 520, 320);
                ctx.setLineDash([]);
                
                // Заголовок тира
                ctx.fillStyle = colors.text;
                ctx.font = 'bold 32px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('${tierName} TIER', 300, 80);
                
                // Название ваучера
                ctx.font = 'bold 24px Arial';
                const words = '${voucherName}'.split(' ');
                let y = 140;
                for (let i = 0; i < words.length; i += 2) {
                    const line = words.slice(i, i + 2).join(' ');
                    ctx.fillText(line, 300, y);
                    y += 35;
                }
                
                // Иконка ваучера
                ctx.fillStyle = '#DC2626';
                ctx.fillRect(200, 200, 200, 120);
                ctx.fillStyle = 'white';
                ctx.font = 'bold 28px Arial';
                ctx.fillText('VOUCHER', 300, 275);
                
                // Информация
                ctx.fillStyle = colors.text;
                ctx.font = '20px Arial';
                ctx.fillText('Digital Voucher', 300, 320);
                ctx.font = '16px Arial';
                ctx.fillText('Generated from PDF', 300, 350);
                
                // Декоративные элементы
                ctx.fillStyle = colors.primary;
                ctx.globalAlpha = 0.3;
                ctx.beginPath();
                ctx.arc(80, 80, 30, 0, 2 * Math.PI);
                ctx.fill();
                
                ctx.beginPath();
                ctx.arc(520, 320, 25, 0, 2 * Math.PI);
                ctx.fill();
                
                ctx.fillRect(50, 320, 60, 30);
                ctx.fillRect(490, 50, 60, 30);
                
                ctx.globalAlpha = 1;
                
                updateStatus('Изображение создано! Скачивание...', true);
                
                // Автоматически скачиваем через 1 секунду
                setTimeout(() => {
                    downloadImage();
                }, 1000);
                
            } catch (error) {
                updateStatus(\`Ошибка: \${error.message}\`, false, true);
            }
        }
        
        function downloadImage() {
            try {
                const link = document.createElement('a');
                link.download = '${voucherName.replace(/[^a-zA-Z0-9]/g, '_')}.png';
                link.href = canvas.toDataURL();
                link.click();
                
                updateStatus('✅ PNG файл скачан! Сохраните в папку public/assets/', true);
                
                // Показываем инструкцию
                setTimeout(() => {
                    statusDiv.innerHTML += \`
                        <div style="margin-top: 15px; padding: 15px; background: #1f2937; border-radius: 4px;">
                            <h4>📁 Сохраните файл в папку:</h4>
                            <p><code>public/assets/tier${tierName === 'BRONZE' ? '1' : tierName === 'SILVER' ? '2' : tierName === 'GOLD' ? '3' : '4'}/</code></p>
                            <p>Имя файла: <code>${voucherName}.png</code></p>
                        </div>
                    \`;
                }, 2000);
                
            } catch (error) {
                updateStatus(\`Ошибка скачивания: \${error.message}\`, false, true);
            }
        }
        
        // Автоматически создаем изображение при загрузке страницы
        window.onload = function() {
            setTimeout(createVoucherImage, 1000);
        };
    </script>
</body>
</html>`;

  fs.writeFileSync(outputPath, htmlContent);
}

// Функция для создания всех изображений
function createAllImages() {
  console.log('🚀 Создание всех изображений...\n');

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
      const autoGeneratorName = `${voucherName.replace(/[^a-zA-Z0-9]/g, '_')}_auto_generator.html`;
      const outputPath = path.join(outputFolder, autoGeneratorName);
      
      console.log(`\n🔄 Создаем автогенератор: ${voucherName}`);
      console.log(`   → ${autoGeneratorName}`);
      
      totalProcessed++;
      
      try {
        createAutoImageHTML(voucherName, tierName, outputPath);
        console.log(`   ✅ Автогенератор создан!`);
        totalSuccess++;
      } catch (error) {
        console.log(`   ❌ Ошибка создания автогенератора: ${error.message}`);
      }
    });
  });

  console.log(`\n📊 Результаты создания автогенераторов:`);
  console.log(`   📄 Всего обработано: ${totalProcessed}`);
  console.log(`   ✅ Успешно: ${totalSuccess}`);
  console.log(`   ❌ Ошибок: ${totalProcessed - totalSuccess}`);

  return { totalProcessed, totalSuccess };
}

// Функция для создания мастер-файла
function createMasterGenerator() {
  console.log('\n🎯 Создание мастер-генератора...');
  
  const masterHTML = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Master Voucher Image Generator</title>
    <style>
        body { margin: 0; padding: 20px; background: #1a1a1a; color: white; font-family: Arial, sans-serif; }
        .container { max-width: 1200px; margin: 0 auto; }
        .tier-section { margin: 30px 0; }
        .tier-title { color: #10b981; font-size: 24px; margin-bottom: 20px; }
        .voucher-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .voucher-card { border: 1px solid #374151; border-radius: 8px; padding: 15px; background: #111827; }
        .voucher-card h3 { color: #10b981; margin: 0 0 10px 0; }
        .voucher-card p { color: #9ca3af; margin: 5px 0; }
        button { background: #10b981; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; margin: 5px; }
        button:hover { background: #059669; }
        .controls { margin: 20px 0; padding: 20px; background: #111827; border-radius: 8px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎨 Мастер-генератор изображений ваучеров</h1>
        
        <div class="controls">
            <h3>📋 Инструкция:</h3>
            <ol>
                <li>Нажмите "🚀 Создать все изображения"</li>
                <li>Откроются все автогенераторы в новых вкладках</li>
                <li>Каждый автогенератор автоматически создаст и скачает PNG</li>
                <li>Сохраните все PNG файлы в соответствующие папки</li>
            </ol>
            <button onclick="generateAll()">🚀 Создать все изображения (31 файл)</button>
            <button onclick="generateByTier('BRONZE')">🥉 Создать Bronze (4 файла)</button>
            <button onclick="generateByTier('SILVER')">🥈 Создать Silver (7 файлов)</button>
            <button onclick="generateByTier('GOLD')">🥇 Создать Gold (9 файлов)</button>
            <button onclick="generateByTier('PLATINUM')">💎 Создать Platinum (11 файлов)</button>
        </div>

        <div class="tier-section">
            <h2 class="tier-title">🥉 BRONZE TIER</h2>
            <div class="voucher-grid">
                <div class="voucher-card">
                    <h3>1 hour Free Rental Voucher</h3>
                    <p>Автогенератор: 1_hour_Free_Rental_Voucher_auto_generator.html</p>
                    <button onclick="openGenerator('tier1', '1_hour_Free_Rental_Voucher_auto_generator.html')">🎨 Создать</button>
                </div>
                <div class="voucher-card">
                    <h3>1 hour Free Rental Voucher-1</h3>
                    <p>Автогенератор: 1_hour_Free_Rental_Voucher_1_auto_generator.html</p>
                    <button onclick="openGenerator('tier1', '1_hour_Free_Rental_Voucher_1_auto_generator.html')">🎨 Создать</button>
                </div>
                <div class="voucher-card">
                    <h3>10% Restaurant Discount</h3>
                    <p>Автогенератор: 10__Restaurant_Discount_auto_generator.html</p>
                    <button onclick="openGenerator('tier1', '10__Restaurant_Discount_auto_generator.html')">🎨 Создать</button>
                </div>
                <div class="voucher-card">
                    <h3>10% Auto Service Discount</h3>
                    <p>Автогенератор: 10__Auto_Service_Discount_auto_generator.html</p>
                    <button onclick="openGenerator('tier1', '10__Auto_Service_Discount_auto_generator.html')">🎨 Создать</button>
                </div>
            </div>
        </div>

        <div class="tier-section">
            <h2 class="tier-title">🥈 SILVER TIER</h2>
            <div class="voucher-grid">
                <div class="voucher-card">
                    <h3>2 hours Free Rental Voucher</h3>
                    <p>Автогенератор: 2_hours_Free_Rental_Voucher_auto_generator.html</p>
                    <button onclick="openGenerator('tier2', '2_hours_Free_Rental_Voucher_auto_generator.html')">🎨 Создать</button>
                </div>
                <div class="voucher-card">
                    <h3>150$ Rental Voucher</h3>
                    <p>Автогенератор: 150__Rental_Voucher_auto_generator.html</p>
                    <button onclick="openGenerator('tier2', '150__Rental_Voucher_auto_generator.html')">🎨 Создать</button>
                </div>
                <div class="voucher-card">
                    <h3>15% Auto Service Discount</h3>
                    <p>Автогенератор: 15__Auto_Service_Discount_auto_generator.html</p>
                    <button onclick="openGenerator('tier2', '15__Auto_Service_Discount_auto_generator.html')">🎨 Создать</button>
                </div>
                <div class="voucher-card">
                    <h3>10% Restaurant Discount</h3>
                    <p>Автогенератор: 10__Restaurant_Discount_auto_generator.html</p>
                    <button onclick="openGenerator('tier2', '10__Restaurant_Discount_auto_generator.html')">🎨 Создать</button>
                </div>
                <div class="voucher-card">
                    <h3>Free Car Wash Voucher</h3>
                    <p>Автогенератор: Free_Car_Wash_Voucher_auto_generator.html</p>
                    <button onclick="openGenerator('tier2', 'Free_Car_Wash_Voucher_auto_generator.html')">🎨 Создать</button>
                </div>
                <div class="voucher-card">
                    <h3>Free Upgrade Voucher</h3>
                    <p>Автогенератор: Free_Upgrade_Voucher_auto_generator.html</p>
                    <button onclick="openGenerator('tier2', 'Free_Upgrade_Voucher_auto_generator.html')">🎨 Создать</button>
                </div>
                <div class="voucher-card">
                    <h3>Frame 1686560875</h3>
                    <p>Автогенератор: Frame_1686560875_auto_generator.html</p>
                    <button onclick="openGenerator('tier2', 'Frame_1686560875_auto_generator.html')">🎨 Создать</button>
                </div>
            </div>
        </div>

        <div class="tier-section">
            <h2 class="tier-title">🥇 GOLD TIER</h2>
            <div class="voucher-grid">
                <div class="voucher-card">
                    <h3>3 hours Free Rental Voucher</h3>
                    <p>Автогенератор: 3_hours_Free_Rental_Voucher_auto_generator.html</p>
                    <button onclick="openGenerator('tier3', '3_hours_Free_Rental_Voucher_auto_generator.html')">🎨 Создать</button>
                </div>
                <div class="voucher-card">
                    <h3>600$ Rental Voucher</h3>
                    <p>Автогенератор: 600__Rental_Voucher_auto_generator.html</p>
                    <button onclick="openGenerator('tier3', '600__Rental_Voucher_auto_generator.html')">🎨 Создать</button>
                </div>
                <div class="voucher-card">
                    <h3>20% Auto Service Discount</h3>
                    <p>Автогенератор: 20__Auto_Service_Discount_auto_generator.html</p>
                    <button onclick="openGenerator('tier3', '20__Auto_Service_Discount_auto_generator.html')">🎨 Создать</button>
                </div>
                <div class="voucher-card">
                    <h3>15% Restaurant Discount</h3>
                    <p>Автогенератор: 15__Restaurant_Discount_auto_generator.html</p>
                    <button onclick="openGenerator('tier3', '15__Restaurant_Discount_auto_generator.html')">🎨 Создать</button>
                </div>
                <div class="voucher-card">
                    <h3>Unlimited Mileage</h3>
                    <p>Автогенератор: Unlimited_Mileage_auto_generator.html</p>
                    <button onclick="openGenerator('tier3', 'Unlimited_Mileage_auto_generator.html')">🎨 Создать</button>
                </div>
                <div class="voucher-card">
                    <h3>Premium Protection</h3>
                    <p>Автогенератор: Premium_Protection_auto_generator.html</p>
                    <button onclick="openGenerator('tier3', 'Premium_Protection_auto_generator.html')">🎨 Создать</button>
                </div>
                <div class="voucher-card">
                    <h3>Free Car Wash Voucher</h3>
                    <p>Автогенератор: Free_Car_Wash_Voucher_auto_generator.html</p>
                    <button onclick="openGenerator('tier3', 'Free_Car_Wash_Voucher_auto_generator.html')">🎨 Создать</button>
                </div>
                <div class="voucher-card">
                    <h3>Free Upgrade Voucher</h3>
                    <p>Автогенератор: Free_Upgrade_Voucher_auto_generator.html</p>
                    <button onclick="openGenerator('tier3', 'Free_Upgrade_Voucher_auto_generator.html')">🎨 Создать</button>
                </div>
                <div class="voucher-card">
                    <h3>Frame 1686560876</h3>
                    <p>Автогенератор: Frame_1686560876_auto_generator.html</p>
                    <button onclick="openGenerator('tier3', 'Frame_1686560876_auto_generator.html')">🎨 Создать</button>
                </div>
            </div>
        </div>

        <div class="tier-section">
            <h2 class="tier-title">💎 PLATINUM TIER</h2>
            <div class="voucher-grid">
                <div class="voucher-card">
                    <h3>5 hours Free Rental Voucher</h3>
                    <p>Автогенератор: 5_hours_Free_Rental_Voucher_auto_generator.html</p>
                    <button onclick="openGenerator('tier4', '5_hours_Free_Rental_Voucher_auto_generator.html')">🎨 Создать</button>
                </div>
                <div class="voucher-card">
                    <h3>1250$ Rental Voucher</h3>
                    <p>Автогенератор: 1250__Rental_Voucher_auto_generator.html</p>
                    <button onclick="openGenerator('tier4', '1250__Rental_Voucher_auto_generator.html')">🎨 Создать</button>
                </div>
                <div class="voucher-card">
                    <h3>20% Auto Service Discount</h3>
                    <p>Автогенератор: 20__Auto_Service_Discount_auto_generator.html</p>
                    <button onclick="openGenerator('tier4', '20__Auto_Service_Discount_auto_generator.html')">🎨 Создать</button>
                </div>
                <div class="voucher-card">
                    <h3>20% Restaurant Discount</h3>
                    <p>Автогенератор: 20__Restaurant_Discount_auto_generator.html</p>
                    <button onclick="openGenerator('tier4', '20__Restaurant_Discount_auto_generator.html')">🎨 Создать</button>
                </div>
                <div class="voucher-card">
                    <h3>Unlimited Mileage</h3>
                    <p>Автогенератор: Unlimited_Mileage_auto_generator.html</p>
                    <button onclick="openGenerator('tier4', 'Unlimited_Mileage_auto_generator.html')">🎨 Создать</button>
                </div>
                <div class="voucher-card">
                    <h3>Premium Protection</h3>
                    <p>Автогенератор: Premium_Protection_auto_generator.html</p>
                    <button onclick="openGenerator('tier4', 'Premium_Protection_auto_generator.html')">🎨 Создать</button>
                </div>
                <div class="voucher-card">
                    <h3>Free Car Wash Voucher</h3>
                    <p>Автогенератор: Free_Car_Wash_Voucher_auto_generator.html</p>
                    <button onclick="openGenerator('tier4', 'Free_Car_Wash_Voucher_auto_generator.html')">🎨 Создать</button>
                </div>
                <div class="voucher-card">
                    <h3>Free Upgrade Voucher</h3>
                    <p>Автогенератор: Free_Upgrade_Voucher_auto_generator.html</p>
                    <button onclick="openGenerator('tier4', 'Free_Upgrade_Voucher_auto_generator.html')">🎨 Создать</button>
                </div>
                <div class="voucher-card">
                    <h3>Chauffeur Service Voucher (6h)</h3>
                    <p>Автогенератор: Chauffeur_Service_Voucher__6h__auto_generator.html</p>
                    <button onclick="openGenerator('tier4', 'Chauffeur_Service_Voucher__6h__auto_generator.html')">🎨 Создать</button>
                </div>
                <div class="voucher-card">
                    <h3>Free UAE Delivery Voucher</h3>
                    <p>Автогенератор: Free_UAE_Delivery_Voucher_auto_generator.html</p>
                    <button onclick="openGenerator('tier4', 'Free_UAE_Delivery_Voucher_auto_generator.html')">🎨 Создать</button>
                </div>
                <div class="voucher-card">
                    <h3>Frame 1686560878</h3>
                    <p>Автогенератор: Frame_1686560878_auto_generator.html</p>
                    <button onclick="openGenerator('tier4', 'Frame_1686560878_auto_generator.html')">🎨 Создать</button>
                </div>
            </div>
        </div>
    </div>

    <script>
        function openGenerator(tier, filename) {
            const url = \`public/assets/\${tier}/\${filename}\`;
            window.open(url, '_blank');
        }
        
        function generateByTier(tier) {
            const tierMap = {
                'BRONZE': ['1_hour_Free_Rental_Voucher_auto_generator.html', '1_hour_Free_Rental_Voucher_1_auto_generator.html', '10__Restaurant_Discount_auto_generator.html', '10__Auto_Service_Discount_auto_generator.html'],
                'SILVER': ['2_hours_Free_Rental_Voucher_auto_generator.html', '150__Rental_Voucher_auto_generator.html', '15__Auto_Service_Discount_auto_generator.html', '10__Restaurant_Discount_auto_generator.html', 'Free_Car_Wash_Voucher_auto_generator.html', 'Free_Upgrade_Voucher_auto_generator.html', 'Frame_1686560875_auto_generator.html'],
                'GOLD': ['3_hours_Free_Rental_Voucher_auto_generator.html', '600__Rental_Voucher_auto_generator.html', '20__Auto_Service_Discount_auto_generator.html', '15__Restaurant_Discount_auto_generator.html', 'Unlimited_Mileage_auto_generator.html', 'Premium_Protection_auto_generator.html', 'Free_Car_Wash_Voucher_auto_generator.html', 'Free_Upgrade_Voucher_auto_generator.html', 'Frame_1686560876_auto_generator.html'],
                'PLATINUM': ['5_hours_Free_Rental_Voucher_auto_generator.html', '1250__Rental_Voucher_auto_generator.html', '20__Auto_Service_Discount_auto_generator.html', '20__Restaurant_Discount_auto_generator.html', 'Unlimited_Mileage_auto_generator.html', 'Premium_Protection_auto_generator.html', 'Free_Car_Wash_Voucher_auto_generator.html', 'Free_Upgrade_Voucher_auto_generator.html', 'Chauffeur_Service_Voucher__6h__auto_generator.html', 'Free_UAE_Delivery_Voucher_auto_generator.html', 'Frame_1686560878_auto_generator.html']
            };
            
            const tierFolder = tier === 'BRONZE' ? 'tier1' : tier === 'SILVER' ? 'tier2' : tier === 'GOLD' ? 'tier3' : 'tier4';
            const files = tierMap[tier];
            
            files.forEach((file, index) => {
                setTimeout(() => {
                    openGenerator(tierFolder, file);
                }, index * 500);
            });
        }
        
        function generateAll() {
            const allFiles = [
                { tier: 'tier1', files: ['1_hour_Free_Rental_Voucher_auto_generator.html', '1_hour_Free_Rental_Voucher_1_auto_generator.html', '10__Restaurant_Discount_auto_generator.html', '10__Auto_Service_Discount_auto_generator.html'] },
                { tier: 'tier2', files: ['2_hours_Free_Rental_Voucher_auto_generator.html', '150__Rental_Voucher_auto_generator.html', '15__Auto_Service_Discount_auto_generator.html', '10__Restaurant_Discount_auto_generator.html', 'Free_Car_Wash_Voucher_auto_generator.html', 'Free_Upgrade_Voucher_auto_generator.html', 'Frame_1686560875_auto_generator.html'] },
                { tier: 'tier3', files: ['3_hours_Free_Rental_Voucher_auto_generator.html', '600__Rental_Voucher_auto_generator.html', '20__Auto_Service_Discount_auto_generator.html', '15__Restaurant_Discount_auto_generator.html', 'Unlimited_Mileage_auto_generator.html', 'Premium_Protection_auto_generator.html', 'Free_Car_Wash_Voucher_auto_generator.html', 'Free_Upgrade_Voucher_auto_generator.html', 'Frame_1686560876_auto_generator.html'] },
                { tier: 'tier4', files: ['5_hours_Free_Rental_Voucher_auto_generator.html', '1250__Rental_Voucher_auto_generator.html', '20__Auto_Service_Discount_auto_generator.html', '20__Restaurant_Discount_auto_generator.html', 'Unlimited_Mileage_auto_generator.html', 'Premium_Protection_auto_generator.html', 'Free_Car_Wash_Voucher_auto_generator.html', 'Free_Upgrade_Voucher_auto_generator.html', 'Chauffeur_Service_Voucher__6h__auto_generator.html', 'Free_UAE_Delivery_Voucher_auto_generator.html', 'Frame_1686560878_auto_generator.html'] }
            ];
            
            let fileIndex = 0;
            allFiles.forEach(tierData => {
                tierData.files.forEach(file => {
                    setTimeout(() => {
                        openGenerator(tierData.tier, file);
                    }, fileIndex * 300);
                    fileIndex++;
                });
            });
        }
    </script>
</body>
</html>`;

  fs.writeFileSync('public/master-voucher-generator.html', masterHTML);
  console.log('✅ Мастер-генератор создан: public/master-voucher-generator.html');
}

// Главная функция
function main() {
  console.log('🎨 Автоматическое создание всех изображений ваучеров\n');
  
  try {
    // Создаем папку data если её нет
    ensureDirectoryExists(path.join(process.cwd(), 'data'));
    
    // Создаем все автогенераторы
    const result = createAllImages();
    
    // Создаем мастер-генератор
    createMasterGenerator();
    
    console.log('\n🎉 Автогенераторы созданы!');
    console.log('\n📋 Следующие шаги:');
    console.log('1. Откройте: public/master-voucher-generator.html');
    console.log('2. Нажмите "🚀 Создать все изображения (31 файл)"');
    console.log('3. Все PNG файлы будут созданы автоматически');
    console.log('4. Сохраните файлы в соответствующие папки');
    console.log('5. Запустите: npm run dev');
    
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
  createAutoImageHTML,
  createAllImages,
  createMasterGenerator
};




