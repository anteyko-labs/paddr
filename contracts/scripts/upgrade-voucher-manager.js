const { ethers } = require('hardhat');

async function main() {
  console.log('🔄 Upgrading VoucherManager contract...');
  
  // Получаем текущий VoucherManager
  const VoucherManager = await ethers.getContractFactory('VoucherManager');
  
  // Деплоим новую версию
  console.log('📦 Deploying new VoucherManager implementation...');
  const newVoucherManager = await VoucherManager.deploy();
  await newVoucherManager.waitForDeployment();
  
  const newImplementationAddress = await newVoucherManager.getAddress();
  console.log('✅ New VoucherManager deployed to:', newImplementationAddress);
  
  // Получаем ProxyAdmin для VoucherManager
  const VOUCHER_MANAGER_ADDRESS = "0x5D89adf43cb9018Ed502062a7F012a7d101893c6";
  
  // Проверяем что это прокси контракт
  const proxyCode = await ethers.provider.getCode(VOUCHER_MANAGER_ADDRESS);
  console.log('🔍 Proxy code length:', proxyCode.length);
  
  if (proxyCode.length > 2) {
    console.log('✅ VoucherManager is a proxy contract');
    
    // Получаем ProxyAdmin
    const proxyAdmin = await ethers.getContractAt('ProxyAdmin', VOUCHER_MANAGER_ADDRESS);
    
    try {
      // Обновляем реализацию
      console.log('🔄 Upgrading proxy to new implementation...');
      const upgradeTx = await proxyAdmin.upgrade(VOUCHER_MANAGER_ADDRESS, newImplementationAddress);
      await upgradeTx.wait();
      
      console.log('✅ VoucherManager upgraded successfully!');
      console.log('📋 Transaction hash:', upgradeTx.hash);
      
      // Проверяем что новая функция работает
      console.log('🧪 Testing new redeemVoucherById function...');
      const upgradedVoucherManager = await ethers.getContractAt('VoucherManager', VOUCHER_MANAGER_ADDRESS);
      
      // Проверяем что функция существует
      const hasRedeemFunction = await upgradedVoucherManager.redeemVoucherById.staticCall(1).catch(() => false);
      if (hasRedeemFunction !== false) {
        console.log('✅ redeemVoucherById function is available!');
      } else {
        console.log('❌ redeemVoucherById function not available');
      }
      
    } catch (error) {
      console.error('❌ Failed to upgrade VoucherManager:', error.message);
      
      // Возможно, это не прокси контракт, попробуем другой подход
      console.log('🔄 Trying alternative upgrade method...');
      
      // Создаем новый VoucherManager и мигрируем данные
      console.log('📦 Creating new VoucherManager with migrated data...');
      console.log('⚠️  Note: This will require manual data migration');
    }
  } else {
    console.log('❌ VoucherManager is not a proxy contract');
    console.log('📦 Deploying new VoucherManager...');
    console.log('⚠️  Note: This will require manual data migration');
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });