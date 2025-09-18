const fs = require('fs');
const path = require('path');

/**
 * Тест отображения изображений ваучеров
 */

console.log('🖼️ Тест отображения изображений ваучеров...\n');

// Проверяем SVG файлы
const assetFolders = {
  'tier1': 'Bronze',
  'tier2': 'Silver', 
  'tier3': 'Gold',
  'tier4': 'Platinum'
};

console.log('📁 Проверка SVG файлов:');
Object.entries(assetFolders).forEach(([folder, tier]) => {
  const folderPath = path.join(process.cwd(), 'public', 'assets', folder);
  if (fs.existsSync(folderPath)) {
    const svgFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.svg'));
    console.log(`\n${tier} (${folder}):`);
    svgFiles.forEach(file => {
      const filePath = path.join(folderPath, file);
      const stats = fs.statSync(filePath);
      console.log(`  ✅ ${file} (${stats.size} bytes)`);
      
      // Проверяем содержимое SVG
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.includes('<svg') && content.includes('</svg>')) {
        console.log(`    📄 SVG валидный`);
      } else {
        console.log(`    ❌ SVG поврежден`);
      }
    });
  } else {
    console.log(`  ❌ ${tier} (${folder}): папка не найдена`);
  }
});

// Проверяем PNG файлы
console.log('\n📁 Проверка PNG файлов:');
Object.entries(assetFolders).forEach(([folder, tier]) => {
  const folderPath = path.join(process.cwd(), 'public', 'assets', folder);
  if (fs.existsSync(folderPath)) {
    const pngFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.png'));
    console.log(`\n${tier} (${folder}):`);
    pngFiles.forEach(file => {
      const filePath = path.join(folderPath, file);
      const stats = fs.statSync(filePath);
      console.log(`  ${stats.size > 100 ? '✅' : '⚠️'} ${file} (${stats.size} bytes)`);
      
      if (stats.size < 100) {
        console.log(`    ⚠️ Файл слишком маленький, возможно поврежден`);
      }
    });
  }
});

// Создаем тестовую HTML страницу
console.log('\n🌐 Создание тестовой HTML страницы...');
const testHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Voucher Images Test</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #1a1a1a; color: white; }
        .tier { margin: 20px 0; }
        .tier h2 { color: #10b981; }
        .vouchers { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }
        .voucher { border: 1px solid #374151; border-radius: 8px; padding: 10px; background: #111827; }
        .voucher img { width: 100%; height: 150px; object-fit: cover; border-radius: 4px; }
        .voucher h3 { margin: 10px 0 5px 0; color: #10b981; font-size: 14px; }
        .voucher p { margin: 0; color: #9ca3af; font-size: 12px; }
    </style>
</head>
<body>
    <h1>🎫 Тест изображений ваучеров</h1>
    
    <div class="tier">
        <h2>🥉 Bronze Tier</h2>
        <div class="vouchers">
            <div class="voucher">
                <img src="/assets/tier1/1 hour Free Rental Voucher.svg" alt="1 hour Free Rental Voucher">
                <h3>1 hour Free Rental Voucher</h3>
                <p>1 hour free rental when renting for 1 day or more</p>
            </div>
            <div class="voucher">
                <img src="/assets/tier1/10% Restaurant Discount.svg" alt="10% Restaurant Discount">
                <h3>10% Restaurant Discount</h3>
                <p>10% discount at restaurant</p>
            </div>
            <div class="voucher">
                <img src="/assets/tier1/10% Auto Service Discount.svg" alt="10% Auto Service Discount">
                <h3>10% Auto Service Discount</h3>
                <p>10% discount at auto service</p>
            </div>
        </div>
    </div>
    
    <div class="tier">
        <h2>🥈 Silver Tier</h2>
        <div class="vouchers">
            <div class="voucher">
                <img src="/assets/tier2/2 hours Free Rental Voucher.svg" alt="2 hours Free Rental Voucher">
                <h3>2 hours Free Rental Voucher</h3>
                <p>2 hours free rental when renting for 1 day or more</p>
            </div>
            <div class="voucher">
                <img src="/assets/tier2/150$ Rental Voucher.svg" alt="150$ Rental Voucher">
                <h3>150$ Rental Voucher</h3>
                <p>1x $150 car rental coupon</p>
            </div>
            <div class="voucher">
                <img src="/assets/tier2/15% Auto Service Discount.svg" alt="15% Auto Service Discount">
                <h3>15% Auto Service Discount</h3>
                <p>15% discount at auto service</p>
            </div>
        </div>
    </div>
    
    <div class="tier">
        <h2>🥇 Gold Tier</h2>
        <div class="vouchers">
            <div class="voucher">
                <img src="/assets/tier3/3 hours Free Rental Voucher.svg" alt="3 hours Free Rental Voucher">
                <h3>3 hours Free Rental Voucher</h3>
                <p>3 hours free rental when renting for 1 day or more</p>
            </div>
            <div class="voucher">
                <img src="/assets/tier3/600$ Rental Voucher.svg" alt="600$ Rental Voucher">
                <h3>600$ Rental Voucher</h3>
                <p>1x $600 car rental coupon</p>
            </div>
            <div class="voucher">
                <img src="/assets/tier3/20% Auto Service Discount.svg" alt="20% Auto Service Discount">
                <h3>20% Auto Service Discount</h3>
                <p>20% discount at auto service</p>
            </div>
        </div>
    </div>
    
    <div class="tier">
        <h2>💎 Platinum Tier</h2>
        <div class="vouchers">
            <div class="voucher">
                <img src="/assets/tier4/5 hours Free Rental Voucher.svg" alt="5 hours Free Rental Voucher">
                <h3>5 hours Free Rental Voucher</h3>
                <p>5 hours free rental when renting for 1 day or more</p>
            </div>
            <div class="voucher">
                <img src="/assets/tier4/1250$ Rental Voucher.svg" alt="1250$ Rental Voucher">
                <h3>1250$ Rental Voucher</h3>
                <p>1x $1250 car rental coupon</p>
            </div>
            <div class="voucher">
                <img src="/assets/tier4/Chauffeur Service Voucher (6h).svg" alt="Chauffeur Service Voucher (6h)">
                <h3>Chauffeur Service Voucher (6h)</h3>
                <p>6 hours chauffeur service</p>
            </div>
        </div>
    </div>
    
    <div style="margin-top: 40px; padding: 20px; background: #111827; border-radius: 8px;">
        <h3>📋 Инструкции по тестированию:</h3>
        <ol>
            <li>Запустите приложение: <code>npm run dev</code></li>
            <li>Откройте эту страницу: <code>http://localhost:3000/test-vouchers.html</code></li>
            <li>Проверьте что все изображения отображаются корректно</li>
            <li>Проверьте админ панель: <code>http://localhost:3000/admin</code></li>
            <li>Проверьте NFT отображение: <code>http://localhost:3000/dashboard/rewards</code></li>
        </ol>
    </div>
</body>
</html>
`;

const testHtmlPath = path.join(process.cwd(), 'public', 'test-vouchers.html');
fs.writeFileSync(testHtmlPath, testHtml);
console.log(`✅ Тестовая страница создана: ${testHtmlPath}`);

console.log('\n🎉 Тест завершен!');
console.log('\n📋 Следующие шаги:');
console.log('1. Запустите: npm run dev');
console.log('2. Откройте: http://localhost:3000/test-vouchers.html');
console.log('3. Проверьте отображение всех изображений');
console.log('4. Проверьте админ панель: http://localhost:3000/admin');
console.log('5. Проверьте NFT отображение: http://localhost:3000/dashboard/rewards');




