const { ethers } = require('hardhat');

async function main() {
  console.log('🎫 Checking vouchers for position...\n');
  
  const [deployer] = await ethers.getSigners();
  console.log('Checking with account:', deployer.address);
  
  // Адреса системы
  const VOUCHER_MANAGER_ADDRESS = "0x5D89adf43cb9018Ed502062a7F012a7d101893c6";
  const PROXY_STAKE_MANAGER = "0xAa2b43eC5EA29B7B9675676DAd91a764E823B520";
  
  // Получаем контракты
  const VoucherManager = await ethers.getContractFactory('VoucherManager');
  const voucherManager = VoucherManager.attach(VOUCHER_MANAGER_ADDRESS);
  
  const UpgradeableMultiStakeManagerV2 = await ethers.getContractFactory('UpgradeableMultiStakeManagerV2');
  const stakeManagerProxy = UpgradeableMultiStakeManagerV2.attach(PROXY_STAKE_MANAGER);
  
  console.log('📋 Voucher Manager:', VOUCHER_MANAGER_ADDRESS);
  console.log('📋 Stake Manager:', PROXY_STAKE_MANAGER);
  
  // 1. Проверяем позиции пользователя
  console.log('\n🔍 Checking user positions...');
  try {
    const userPositions = await stakeManagerProxy.getUserPositions(deployer.address);
    console.log('✅ User positions count:', userPositions.length);
    
    if (userPositions.length > 0) {
      console.log('📋 Position IDs:', userPositions.map(id => id.toString()));
      
      // Проверяем детали каждой позиции
      for (const positionId of userPositions) {
        const position = await stakeManagerProxy.positions(positionId);
        console.log(`\n📋 Position ${positionId}:`);
        console.log('  - Amount:', ethers.formatEther(position.amount), 'PAD');
        console.log('  - Duration:', Number(position.duration), 'seconds');
        console.log('  - Tier:', position.tier);
        console.log('  - Is active:', position.isActive);
      }
    }
  } catch (error) {
    console.log('❌ Error checking positions:', error.message);
  }
  
  // 2. Проверяем ваучеры для позиции 0
  console.log('\n🎫 Checking vouchers for position 0...');
  try {
    // Проверяем есть ли функция для получения ваучеров позиции
    const voucherCount = await voucherManager.getVoucherCountForPosition(0);
    console.log('✅ Voucher count for position 0:', voucherCount.toString());
    
    if (voucherCount > 0) {
      // Получаем детали ваучеров
      for (let i = 0; i < Number(voucherCount); i++) {
        const voucherId = await voucherManager.getVoucherIdForPosition(0, i);
        console.log(`📋 Voucher ${i}:`, voucherId.toString());
        
        // Получаем детали ваучера
        const voucher = await voucherManager.vouchers(voucherId);
        console.log(`  - Type: ${voucher.voucherType}`);
        console.log(`  - Value: ${voucher.value}`);
        console.log(`  - Used: ${voucher.used}`);
        console.log(`  - Expires: ${new Date(Number(voucher.expiresAt) * 1000).toLocaleString()}`);
      }
    }
  } catch (error) {
    console.log('❌ Error checking vouchers:', error.message);
  }
  
  // 3. Проверяем общее количество ваучеров пользователя
  console.log('\n🎫 Checking total user vouchers...');
  try {
    const userVoucherCount = await voucherManager.getUserVoucherCount(deployer.address);
    console.log('✅ Total user vouchers:', userVoucherCount.toString());
  } catch (error) {
    console.log('❌ Error checking user vouchers:', error.message);
  }
  
  // 4. Проверяем NFT баланс
  console.log('\n🎨 Checking NFT balance...');
  try {
    const NFT_FACTORY_ADDRESS = "0x6D87c4647bd91743ce69d8cd2eD568A6d892cd33";
    const PADNFTFactory = await ethers.getContractFactory('PADNFTFactory');
    const nftFactory = PADNFTFactory.attach(NFT_FACTORY_ADDRESS);
    
    const nftBalance = await nftFactory.balanceOf(deployer.address);
    console.log('✅ NFT balance:', nftBalance.toString());
  } catch (error) {
    console.log('❌ Error checking NFT balance:', error.message);
  }
  
  console.log('\n🎉 Voucher check complete!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });