const { ethers } = require('ethers');

async function main() {
  console.log('🎫 Creating test vouchers for position...\n');
  
  // Адрес VoucherManager
  const VOUCHER_MANAGER_ADDRESS = "0x5D89adf43cb9018Ed502062a7F012a7d101893c6";
  
  // Подключаемся к сети
  const provider = new ethers.JsonRpcProvider('https://sepolia.infura.io/v3/01fd1d3959ec4dd3afbef724e8c959da');
  const wallet = new ethers.Wallet('22547068237db8ba6738009e6cc6279e33cec1d5665033b0b881fc49b11e71ba', provider);
  
  // ABI для VoucherManager
  const VOUCHER_MANAGER_ABI = [
    "function createVouchersForPosition(address owner, uint256 positionId, uint8 tier) external",
    "function getVoucher(uint256 voucherId) external view returns (tuple(uint256 id, address owner, uint8 voucherType, string name, string description, string value, uint256 maxUses, uint256 currentUses, uint256 expiresAt, bool isActive, string qrCode, uint256 positionId))",
    "function getUserVouchers(address user) external view returns (uint256[] memory)"
  ];
  
  const voucherManager = new ethers.Contract(VOUCHER_MANAGER_ADDRESS, VOUCHER_MANAGER_ABI, wallet);
  
  // Создаем ваучеры для позиции (используем ID 1 для тестирования)
  const positionId = 1;
  const tier = 3; // Platinum tier
  
  console.log('🎯 Creating vouchers for position:');
  console.log(`   Position ID: ${positionId}`);
  console.log(`   Tier: ${tier} (Platinum)`);
  console.log(`   Owner: ${wallet.address}`);
  console.log('');
  
  try {
    console.log('🔄 Creating vouchers...');
    const tx = await voucherManager.createVouchersForPosition(wallet.address, positionId, tier);
    await tx.wait();
    
    console.log('✅ Vouchers created successfully!');
    console.log(`   Transaction: ${tx.hash}`);
    
    // Проверяем созданные ваучеры
    console.log('\n🔍 Checking created vouchers...');
    const userVouchers = await voucherManager.getUserVouchers(wallet.address);
    console.log(`   Total user vouchers: ${userVouchers.length}`);
    
    // Показываем последние созданные ваучеры
    const recentVouchers = userVouchers.slice(-5); // Последние 5
    console.log('\n📋 Recent vouchers:');
    for (const voucherId of recentVouchers) {
      try {
        const voucher = await voucherManager.getVoucher(voucherId);
        console.log(`   ID ${voucherId}: ${voucher.name} (${voucher.voucherType === 0 ? 'Single Use' : voucher.voucherType === 1 ? 'Multi Use' : 'Duration'}) - Uses: ${voucher.currentUses}/${voucher.maxUses}`);
      } catch (error) {
        console.log(`   ID ${voucherId}: Error reading voucher`);
      }
    }
    
    return recentVouchers;
    
  } catch (error) {
    console.log('❌ Failed to create vouchers:', error.message);
    return [];
  }
}

main()
  .then((vouchers) => {
    if (vouchers.length > 0) {
      console.log('\n🎉 Test vouchers created successfully!');
      console.log(`   Created ${vouchers.length} vouchers`);
      console.log('   Ready for testing usage!');
    } else {
      console.log('\n❌ Failed to create test vouchers');
    }
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });

