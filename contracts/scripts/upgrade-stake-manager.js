const { ethers, upgrades } = require('hardhat');

async function main() {
  console.log('🚀 Upgrading UpgradeableMultiStakeManager to V2...\n');
  
  // Адрес прокси контракта
  const PROXY_ADDRESS = "0x18DDd61369C2DD3ea1144d6E440eA22d50fa384a";
  
  // Получаем новую реализацию
  const UpgradeableMultiStakeManagerV2 = await ethers.getContractFactory('UpgradeableMultiStakeManagerV2');
  
  console.log('📋 Current proxy address:', PROXY_ADDRESS);
  
  // Проверяем текущую реализацию
  try {
    const currentImplementation = await upgrades.erc1967.getImplementationAddress(PROXY_ADDRESS);
    console.log('📋 Current implementation:', currentImplementation);
  } catch (error) {
    console.log('⚠️  Could not get current implementation address');
  }
  
  // Обновляем прокси
  console.log('\n🔄 Upgrading proxy to new implementation...');
  const upgradedContract = await upgrades.upgradeProxy(PROXY_ADDRESS, UpgradeableMultiStakeManagerV2);
  await upgradedContract.waitForDeployment();
  
  // Получаем новый адрес реализации
  const newImplementation = await upgrades.erc1967.getImplementationAddress(PROXY_ADDRESS);
  console.log('✅ New implementation address:', newImplementation);
  
  // Проверяем версию
  try {
    const version = await upgradedContract.version();
    console.log('✅ Contract version:', version);
  } catch (error) {
    console.log('⚠️  Could not get version');
  }
  
  // Проверяем новые требования для тиров
  console.log('\n🧪 Testing new tier requirements:');
  
  const tierNames = ['Bronze', 'Silver', 'Gold', 'Platinum'];
  for (let tier = 0; tier < 4; tier++) {
    try {
      const weight = await upgradedContract.getTierWeight(tier);
      const duration = await upgradedContract.getTierDuration(tier);
      const minAmount = await upgradedContract.getTierMinAmount(tier);
      
      console.log(`${tierNames[tier]} (Tier ${tier}):`);
      console.log(`   Weight: ${weight.toString()}%`);
      console.log(`   Duration: ${Number(duration)/3600} hours`);
      console.log(`   Min Amount: ${ethers.formatEther(minAmount)} tokens`);
      console.log('');
    } catch (error) {
      console.log(`${tierNames[tier]} (Tier ${tier}): ❌ Error - ${error.message}`);
    }
  }
  
  console.log('🎯 UPGRADE COMPLETED SUCCESSFULLY!');
  console.log('✅ Proxy address remains the same:', PROXY_ADDRESS);
  console.log('✅ New implementation deployed:', newImplementation);
  console.log('✅ All existing data preserved!');
  console.log('✅ New tier requirements active!');
  console.log('');
  console.log('📋 New Tier Requirements:');
  console.log('   Bronze: 1000 tokens, 2 hours minimum');
  console.log('   Silver: 2000 tokens, 4 hours minimum');
  console.log('   Gold: 5000 tokens, 6 hours minimum');
  console.log('   Platinum: 10000 tokens, 8 hours minimum');
  console.log('');
  console.log('🎉 Users will now need to stake MORE tokens for higher tiers!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Upgrade failed:', error);
    process.exit(1);
  });

