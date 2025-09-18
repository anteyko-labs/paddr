const { ethers } = require('ethers');

async function main() {
  console.log('🧪 Testing voucher usage - marking all active vouchers as used once...\n');
  
  // Адрес VoucherManager
  const VOUCHER_MANAGER_ADDRESS = "0x5D89adf43cb9018Ed502062a7F012a7d101893c6";
  
  // Подключаемся к сети
  const provider = new ethers.JsonRpcProvider('https://sepolia.infura.io/v3/01fd1d3959ec4dd3afbef724e8c959da');
  const wallet = new ethers.Wallet('22547068237db8ba6738009e6cc6279e33cec1d5665033b0b881fc49b11e71ba', provider);
  
  // ABI для VoucherManager
  const VOUCHER_MANAGER_ABI = [
    "function getVoucher(uint256 voucherId) external view returns (tuple(uint256 id, address owner, uint8 voucherType, string name, string description, string value, uint256 maxUses, uint256 currentUses, uint256 expiresAt, bool isActive, string qrCode, uint256 positionId))",
    "function isVoucherValid(uint256 voucherId) external view returns (bool)",
    "function deactivateVoucher(uint256 voucherId) external",
    "function redeemVoucherById(uint256 voucherId) external returns (bool)"
  ];
  
  const voucherManager = new ethers.Contract(VOUCHER_MANAGER_ADDRESS, VOUCHER_MANAGER_ABI, wallet);
  
  // Получаем все активные ваучеры
  const activeVouchers = [];
  
  for (let voucherId = 1; voucherId <= 20; voucherId++) {
    try {
      const voucher = await voucherManager.getVoucher(voucherId);
      const isValid = await voucherManager.isVoucherValid(voucherId);
      
      if (voucher.name !== "" && voucher.name !== "0" && voucher.isActive && isValid && voucher.currentUses == 0) {
        activeVouchers.push({
          id: voucherId,
          name: voucher.name,
          owner: voucher.owner,
          currentUses: voucher.currentUses.toString(),
          maxUses: voucher.maxUses.toString(),
          type: voucher.voucherType === 0 ? 'Single Use' : 
                voucher.voucherType === 1 ? 'Multi Use' : 'Duration'
        });
      }
    } catch (error) {
      // Ваучер не существует или ошибка
    }
  }
  
  console.log(`📋 Found ${activeVouchers.length} active vouchers to test:`);
  activeVouchers.forEach(voucher => {
    console.log(`   ID ${voucher.id}: ${voucher.name} (${voucher.type}) - Uses: ${voucher.currentUses}/${voucher.maxUses}`);
  });
  console.log('');
  
  // Тестируем использование каждого ваучера
  for (const voucher of activeVouchers) {
    try {
      console.log(`🔄 Testing voucher ID ${voucher.id}: ${voucher.name}...`);
      
      // Пытаемся использовать ваучер через redeemVoucherById
      try {
        const tx = await voucherManager.redeemVoucherById(voucher.id);
        await tx.wait();
        console.log(`   ✅ Voucher ${voucher.id} redeemed successfully!`);
        console.log(`   📋 Transaction: ${tx.hash}`);
      } catch (redeemError) {
        console.log(`   ⚠️  redeemVoucherById failed: ${redeemError.message}`);
        
        // Если redeemVoucherById не работает, пробуем deactivateVoucher
        try {
          const tx = await voucherManager.deactivateVoucher(voucher.id);
          await tx.wait();
          console.log(`   ✅ Voucher ${voucher.id} deactivated successfully!`);
          console.log(`   📋 Transaction: ${tx.hash}`);
        } catch (deactivateError) {
          console.log(`   ❌ deactivateVoucher also failed: ${deactivateError.message}`);
        }
      }
      
    } catch (error) {
      console.log(`   ❌ Failed to test voucher ${voucher.id}: ${error.message}`);
    }
    
    console.log('');
  }
  
  // Проверяем результат
  console.log('🔍 Checking results after testing...');
  
  const updatedVouchers = [];
  for (let voucherId = 1; voucherId <= 20; voucherId++) {
    try {
      const voucher = await voucherManager.getVoucher(voucherId);
      const isValid = await voucherManager.isVoucherValid(voucherId);
      
      if (voucher.name !== "" && voucher.name !== "0") {
        updatedVouchers.push({
          id: voucherId,
          name: voucher.name,
          owner: voucher.owner,
          currentUses: voucher.currentUses.toString(),
          maxUses: voucher.maxUses.toString(),
          isActive: voucher.isActive,
          isValid: isValid,
          type: voucher.voucherType === 0 ? 'Single Use' : 
                voucher.voucherType === 1 ? 'Multi Use' : 'Duration'
        });
      }
    } catch (error) {
      // Ваучер не существует или ошибка
    }
  }
  
  console.log('\n📊 UPDATED VOUCHER STATUS:');
  updatedVouchers.forEach(voucher => {
    const status = voucher.isActive && voucher.isValid ? 
                  (voucher.currentUses > 0 ? '🔄 USED' : '✅ ACTIVE') : 
                  '❌ INVALID';
    console.log(`   ID ${voucher.id}: ${voucher.name} (${voucher.type}) - ${status} - Uses: ${voucher.currentUses}/${voucher.maxUses}`);
  });
  
  console.log('\n🎯 TESTING COMPLETED!');
  console.log('✅ All active vouchers have been tested for usage');
  console.log('✅ Check the results above to see which vouchers are now marked as used');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });

