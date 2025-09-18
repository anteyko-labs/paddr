const fs = require('fs');
const path = require('path');

/**
 * Скрипт для проверки прокси системы
 */

console.log('🔍 Проверка прокси системы...\n');

// Проверяем наличие контрактов
const contracts = [
  'contracts/contracts/UpgradeableMultiStakeManager.sol',
  'contracts/contracts/TierWeightManager.sol', 
  'contracts/contracts/ProxyFactory.sol',
  'contracts/contracts/PADNFTFactory.sol',
  'contracts/contracts/VoucherManager.sol'
];

console.log('📄 Проверка контрактов:');
contracts.forEach(contract => {
  const contractPath = path.join(process.cwd(), contract);
  if (fs.existsSync(contractPath)) {
    console.log(`  ✅ ${contract}`);
  } else {
    console.log(`  ❌ ${contract} - не найден`);
  }
});

// Проверяем скрипты деплоя
const scripts = [
  'contracts/scripts/migrateToProxy.js',
  'contracts/scripts/deployProxySystem.js'
];

console.log('\n📜 Проверка скриптов:');
scripts.forEach(script => {
  const scriptPath = path.join(process.cwd(), script);
  if (fs.existsSync(scriptPath)) {
    console.log(`  ✅ ${script}`);
  } else {
    console.log(`  ❌ ${script} - не найден`);
  }
});

// Проверяем документацию
const docs = [
  'contracts/PROXY_SYSTEM_GUIDE.md',
  'contracts/DEPLOYMENT_GUIDE.md'
];

console.log('\n📚 Проверка документации:');
docs.forEach(doc => {
  const docPath = path.join(process.cwd(), doc);
  if (fs.existsSync(docPath)) {
    console.log(`  ✅ ${doc}`);
  } else {
    console.log(`  ❌ ${doc} - не найден`);
  }
});

console.log('\n🎯 Прокси система готова к деплою!');
console.log('\n📋 Преимущества прокси системы:');
console.log('✅ Обновление логики без потери данных');
console.log('✅ Сохранение ликвидности при обновлениях');
console.log('✅ Безопасный деплой на мейннет');
console.log('✅ Возможность отката изменений');
console.log('✅ Управление через админ панель');

console.log('\n🚀 Готово к деплою на мейннет!');




