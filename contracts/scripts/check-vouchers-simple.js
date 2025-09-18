const { ethers } = require('ethers');

async function main() {
  console.log('🔍 Checking all vouchers on blockchain...\n');
  
  // Адрес VoucherManager
  const VOUCHER_MANAGER_ADDRESS = "0x5D89adf43cb9018Ed502062a7F012a7d101893c6";
  
  // Подключаемся к сети
  const provider = new ethers.JsonRpcProvider('https://sepolia.infura.io/v3/01fd1d3959ec4dd3afbef724e8c959da');
  
  // ABI для VoucherManager
  const VOUCHER_MANAGER_ABI = [
    "function getVoucher(uint256 voucherId) external view returns (tuple(uint256 id, address owner, uint8 voucherType, string name, string description, string value, uint256 maxUses, uint256 currentUses, uint256 expiresAt, bool isActive, string qrCode, uint256 positionId))",
    "function isVoucherValid(uint256 voucherId) external view returns (bool)",
    "function getUserVouchers(address user) external view returns (uint256[] memory)"
  ];
  
  const voucherManager = new ethers.Contract(VOUCHER_MANAGER_ADDRESS, VOUCHER_MANAGER_ABI, provider);
  
  // Проверяем ваучеры с ID от 1 до 20
  console.log('📋 Checking vouchers 1-20...');
  
  const activeVouchers = [];
  const usedVouchers = [];
  const invalidVouchers = [];
  
  for (let voucherId = 1; voucherId <= 20; voucherId++) {
    try {
      const voucher = await voucherManager.getVoucher(voucherId);
      const isValid = await voucherManager.isVoucherValid(voucherId);
      
      if (voucher.name !== "" && voucher.name !== "0" && voucher.isActive) {
        if (isValid) {
          if (voucher.currentUses > 0) {
            usedVouchers.push({
              id: voucherId,
              name: voucher.name,
              owner: voucher.owner,
              currentUses: voucher.currentUses.toString(),
              maxUses: voucher.maxUses.toString(),
              type: voucher.voucherType === 0 ? 'Single Use' : 
                    voucher.voucherType === 1 ? 'Multi Use' : 'Duration'
            });
          } else {
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
        } else {
          invalidVouchers.push({
            id: voucherId,
            name: voucher.name,
            owner: voucher.owner
          });
        }
      }
    } catch (error) {
      // Ваучер не существует или ошибка
    }
  }
  
  console.log('\n✅ ACTIVE VOUCHERS (неиспользованные):');
  activeVouchers.forEach(voucher => {
    console.log(`   ID ${voucher.id}: ${voucher.name} (${voucher.type}) - Owner: ${voucher.owner.slice(0, 6)}...${voucher.owner.slice(-4)}`);
  });
  
  console.log('\n🔄 USED VOUCHERS (использованные):');
  usedVouchers.forEach(voucher => {
    console.log(`   ID ${voucher.id}: ${voucher.name} (${voucher.type}) - Uses: ${voucher.currentUses}/${voucher.maxUses} - Owner: ${voucher.owner.slice(0, 6)}...${voucher.owner.slice(-4)}`);
  });
  
  console.log('\n❌ INVALID VOUCHERS:');
  invalidVouchers.forEach(voucher => {
    console.log(`   ID ${voucher.id}: ${voucher.name} - Owner: ${voucher.owner.slice(0, 6)}...${voucher.owner.slice(-4)}`);
  });
  
  console.log('\n📊 SUMMARY:');
  console.log(`   Active vouchers: ${activeVouchers.length}`);
  console.log(`   Used vouchers: ${usedVouchers.length}`);
  console.log(`   Invalid vouchers: ${invalidVouchers.length}`);
  console.log(`   Total checked: ${activeVouchers.length + usedVouchers.length + invalidVouchers.length}`);
  
  // Тестируем использование ваучера
  if (activeVouchers.length > 0) {
    console.log('\n🧪 Testing voucher usage...');
    const testVoucher = activeVouchers[0];
    console.log(`   Testing voucher ID ${testVoucher.id}: ${testVoucher.name}`);
    console.log(`   Current uses: ${testVoucher.currentUses}/${testVoucher.maxUses}`);
    console.log(`   Owner: ${testVoucher.owner}`);
    
    // Здесь можно добавить логику для тестирования использования
    console.log('   ✅ Voucher is ready for testing!');
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });

