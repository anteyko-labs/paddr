const { ethers } = require('hardhat');

async function main() {
  console.log('🔍 Checking proxy configuration...\n');
  
  const [deployer] = await ethers.getSigners();
  console.log('Checking with account:', deployer.address);
  
  // Адрес прокси
  const PROXY_STAKE_MANAGER = "0xb659680e6bBBaeC3B5148eF89a41975739D10Af5";
  
  // Получаем контракт
  const UpgradeableMultiStakeManagerV2 = await ethers.getContractFactory('UpgradeableMultiStakeManagerV2');
  const stakeManagerProxy = UpgradeableMultiStakeManagerV2.attach(PROXY_STAKE_MANAGER);
  
  console.log('📋 Proxy address:', PROXY_STAKE_MANAGER);
  
  // Проверяем конфигурацию
  console.log('\n🔍 Checking proxy configuration...');
  try {
    const stakingToken = await stakeManagerProxy.stakingToken();
    console.log('✅ Staking token:', stakingToken);
    
    const tierCalculator = await stakeManagerProxy.tierCalculator();
    console.log('✅ Tier calculator:', tierCalculator);
    
    const nftFactory = await stakeManagerProxy.nftFactory();
    console.log('✅ NFT Factory:', nftFactory);
    
    const version = await stakeManagerProxy.version();
    console.log('✅ Version:', version);
    
    const rewardInterval = await stakeManagerProxy.REWARD_INTERVAL();
    console.log('✅ Reward interval:', rewardInterval.toString(), 'seconds');
    console.log('✅ Reward interval:', Number(rewardInterval) / 60, 'minutes');
  } catch (error) {
    console.log('❌ Error checking configuration:', error.message);
  }
  
  // Проверяем tier requirements
  console.log('\n🔍 Checking tier requirements...');
  try {
    for (let i = 0; i < 4; i++) {
      const minAmount = await stakeManagerProxy.getTierMinAmount(i);
      const duration = await stakeManagerProxy.getTierDuration(i);
      const weight = await stakeManagerProxy.getTierWeight(i);
      
      console.log(`✅ Tier ${i}:`);
      console.log(`   - Min amount: ${ethers.formatEther(minAmount)} PAD`);
      console.log(`   - Duration: ${duration.toString()} seconds (${Number(duration) / (24 * 60 * 60)} days)`);
      console.log(`   - Weight: ${weight.toString()}`);
    }
  } catch (error) {
    console.log('❌ Error checking tier requirements:', error.message);
  }
  
  console.log('\n🎉 Configuration check complete!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
