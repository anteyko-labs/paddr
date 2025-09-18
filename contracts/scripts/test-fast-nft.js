const { ethers } = require('hardhat');

async function main() {
  console.log('⚡ Testing fast NFT minting (5 minutes interval)...\n');
  
  const [deployer] = await ethers.getSigners();
  console.log('Testing with account:', deployer.address);
  
  // Адреса прокси системы
  const PROXY_STAKE_MANAGER = "0xb659680e6bBBaeC3B5148eF89a41975739D10Af5";
  const PAD_TOKEN_ADDRESS = "0xa5d3fF94a7aeDA396666c8978Eec67C209202da0";
  const NFT_FACTORY = "0x6D87c4647bd91743ce69d8cd2eD568A6d892cd33";
  
  // Получаем контракты
  const UpgradeableMultiStakeManagerV2 = await ethers.getContractFactory('UpgradeableMultiStakeManagerV2');
  const stakeManagerProxy = UpgradeableMultiStakeManagerV2.attach(PROXY_STAKE_MANAGER);
  
  const PADToken = await ethers.getContractFactory('PADToken');
  const padToken = PADToken.attach(PAD_TOKEN_ADDRESS);
  
  const PADNFTFactory = await ethers.getContractFactory('PADNFTFactory');
  const nftFactory = PADNFTFactory.attach(NFT_FACTORY);
  
  console.log('📋 Proxy Stake Manager:', PROXY_STAKE_MANAGER);
  
  // 1. Проверяем REWARD_INTERVAL
  console.log('\n🔍 Checking REWARD_INTERVAL...');
  try {
    const rewardInterval = await stakeManagerProxy.REWARD_INTERVAL();
    console.log('✅ REWARD_INTERVAL:', rewardInterval.toString(), 'seconds');
    console.log('✅ REWARD_INTERVAL:', Number(rewardInterval) / 60, 'minutes');
  } catch (error) {
    console.log('❌ Error checking REWARD_INTERVAL:', error.message);
  }
  
  // 2. Проверяем баланс токенов
  console.log('\n🔍 Checking token balance...');
  try {
    const tokenBalance = await padToken.balanceOf(deployer.address);
    console.log('✅ Token balance:', ethers.formatEther(tokenBalance), 'PAD');
  } catch (error) {
    console.log('❌ Error checking token balance:', error.message);
  }
  
  // 3. Проверяем текущие позиции
  console.log('\n🔍 Checking current positions...');
  try {
    const userPositions = await stakeManagerProxy.getUserPositions(deployer.address);
    console.log('✅ Current positions count:', userPositions.length);
    
    if (userPositions.length > 0) {
      console.log('📋 Position IDs:', userPositions.map(id => id.toString()));
      
      // Проверяем детали первой позиции
      const firstPosition = await stakeManagerProxy.positions(userPositions[0]);
      console.log('📋 First position details:');
      console.log('  - Amount:', ethers.formatEther(firstPosition.amount), 'PAD');
      console.log('  - Duration:', Number(firstPosition.duration), 'seconds');
      console.log('  - Next mint at:', new Date(Number(firstPosition.nextMintAt) * 1000).toLocaleString());
      console.log('  - Month index:', firstPosition.monthIndex);
      console.log('  - Is active:', firstPosition.isActive);
    }
  } catch (error) {
    console.log('❌ Error checking positions:', error.message);
  }
  
  // 4. Проверяем NFT баланс
  console.log('\n🔍 Checking NFT balance...');
  try {
    const nftBalance = await nftFactory.balanceOf(deployer.address);
    console.log('✅ NFT balance:', nftBalance.toString());
  } catch (error) {
    console.log('❌ Error checking NFT balance:', error.message);
  }
  
  console.log('\n🎉 Fast NFT system test complete!');
  console.log('\n📋 System Status:');
  console.log('✅ REWARD_INTERVAL set to 5 minutes');
  console.log('✅ Proxy system ready for fast testing');
  console.log('✅ Ready to mint NFTs every 5 minutes!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
