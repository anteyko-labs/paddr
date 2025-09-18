const { ethers } = require('hardhat');

async function main() {
  console.log('🎫 Checking user vouchers...\n');
  
  const [deployer] = await ethers.getSigners();
  console.log('Checking with account:', deployer.address);
  
  // Адреса системы
  const VOUCHER_MANAGER_ADDRESS = "0x5D89adf43cb9018Ed502062a7F012a7d101893c6";
  
  // Получаем контракт
  const VoucherManager = await ethers.getContractFactory('VoucherManager');
  const voucherManager = VoucherManager.attach(VOUCHER_MANAGER_ADDRESS);
  
  console.log('📋 Voucher Manager:', VOUCHER_MANAGER_ADDRESS);
  
  // 1. Проверяем ваучеры пользователя
  console.log('\n🎫 Checking user vouchers...');
  try {
    const userVouchers = await voucherManager.getUserVouchers(deployer.address);
    console.log('✅ User vouchers count:', userVouchers.length);
    
    if (userVouchers.length > 0) {
      console.log('📋 Voucher IDs:', userVouchers.map(id => id.toString()));
      
      // Проверяем детали каждого ваучера
      for (const voucherId of userVouchers) {
        const voucher = await voucherManager.getVoucher(voucherId);
        console.log(`\n📋 Voucher ${voucherId}:`);
        console.log('  - Type:', voucher.voucherType);
        console.log('  - Value:', voucher.value);
        console.log('  - Used:', voucher.used);
        console.log('  - Expires:', new Date(Number(voucher.expiresAt) * 1000).toLocaleString());
        console.log('  - QR Code:', voucher.qrCode);
        console.log('  - Position ID:', voucher.positionId.toString());
        console.log('  - Tier:', voucher.tier.toString());
      }
    } else {
      console.log('❌ No vouchers found for user');
    }
  } catch (error) {
    console.log('❌ Error checking user vouchers:', error.message);
  }
  
  // 2. Проверяем общее количество ваучеров в системе
  console.log('\n🎫 Checking total vouchers in system...');
  try {
    // Проверяем есть ли функция для общего количества
    const totalVouchers = await voucherManager.totalVouchers();
    console.log('✅ Total vouchers in system:', totalVouchers.toString());
  } catch (error) {
    console.log('❌ Error checking total vouchers:', error.message);
  }
  
  console.log('\n🎉 User vouchers check complete!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
