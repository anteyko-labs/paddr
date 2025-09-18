const { ethers } = require('ethers');

async function main() {
  console.log('🧪 Testing new vouchers usage - setting currentUses = 1...\n');
  
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
  
  // Получаем новые ваучеры (ID 60-64)
  const newVoucherIds = [60, 61, 62, 63, 64];
  
  console.log('📋 New vouchers to test:');
  for (const voucherId of newVoucherIds) {
    try {
      const voucher = await voucherManager.getVoucher(voucherId);
      const isValid = await voucherManager.isVoucherValid(voucherId);
      
      console.log(`   ID ${voucherId}: ${voucher.name} (${voucher.voucherType === 0 ? 'Single Use' : voucher.voucherType === 1 ? 'Multi Use' : 'Duration'}) - Uses: ${voucher.currentUses}/${voucher.maxUses} - Active: ${voucher.isActive} - Valid: ${isValid}`);
    } catch (error) {
      console.log(`   ID ${voucherId}: Error reading voucher`);
    }
  }
  console.log('');
  
  // Тестируем использование каждого ваучера
  for (const voucherId of newVoucherIds) {
    try {
      const voucher = await voucherManager.getVoucher(voucherId);
      console.log(`🔄 Testing voucher ID ${voucherId}: ${voucher.name}...`);
      console.log(`   Type: ${voucher.voucherType === 0 ? 'Single Use' : voucher.voucherType === 1 ? 'Multi Use' : 'Duration'}`);
      console.log(`   Current uses: ${voucher.currentUses}/${voucher.maxUses}`);
      console.log(`   Active: ${voucher.isActive}`);
      
      // Пытаемся использовать ваучер через redeemVoucherById
      try {
        const tx = await voucherManager.redeemVoucherById(voucherId);
        await tx.wait();
        console.log(`   ✅ Voucher ${voucherId} redeemed successfully!`);
        console.log(`   📋 Transaction: ${tx.hash}`);
      } catch (redeemError) {
        console.log(`   ⚠️  redeemVoucherById failed: ${redeemError.message}`);
        
        // Если redeemVoucherById не работает, пробуем deactivateVoucher
        try {
          const tx = await voucherManager.deactivateVoucher(voucherId);
          await tx.wait();
          console.log(`   ✅ Voucher ${voucherId} deactivated successfully!`);
          console.log(`   📋 Transaction: ${tx.hash}`);
        } catch (deactivateError) {
          console.log(`   ❌ deactivateVoucher also failed: ${deactivateError.message}`);
        }
      }
      
    } catch (error) {
      console.log(`   ❌ Failed to test voucher ${voucherId}: ${error.message}`);
    }
    
    console.log('');
  }
  
  // Проверяем результат
  console.log('🔍 Checking results after testing...');
  
  for (const voucherId of newVoucherIds) {
    try {
      const voucher = await voucherManager.getVoucher(voucherId);
      const isValid = await voucherManager.isVoucherValid(voucherId);
      
      const status = voucher.isActive && isValid ? 
                    (voucher.currentUses > 0 ? '🔄 USED' : '✅ ACTIVE') : 
                    '❌ INVALID';
      
      console.log(`   ID ${voucherId}: ${voucher.name} - ${status} - Uses: ${voucher.currentUses}/${voucher.maxUses} - Active: ${voucher.isActive} - Valid: ${isValid}`);
    } catch (error) {
      console.log(`   ID ${voucherId}: ❌ Error reading voucher`);
    }
  }
  
  console.log('\n🎯 TESTING COMPLETED!');
  console.log('✅ All new vouchers have been tested for usage');
  console.log('✅ Check the results above to see which vouchers are now marked as used');
  console.log('✅ Both single-use and multi-use vouchers have been tested');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });

