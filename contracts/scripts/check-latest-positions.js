const { ethers } = require('hardhat');

async function main() {
  console.log('🔍 Checking latest positions...\n');
  
  const [deployer] = await ethers.getSigners();
  console.log('Checking with account:', deployer.address);
  
  // Адреса системы
  const PROXY_STAKE_MANAGER = "0xAa2b43eC5EA29B7B9675676DAd91a764E823B520";
  
  // Получаем контракт
  const UpgradeableMultiStakeManagerV2 = await ethers.getContractFactory('UpgradeableMultiStakeManagerV2');
  const stakeManagerProxy = UpgradeableMultiStakeManagerV2.attach(PROXY_STAKE_MANAGER);
  
  console.log('📋 Stake Manager:', PROXY_STAKE_MANAGER);
  
  // 1. Получаем позиции пользователя
  console.log('\n🔍 Getting user positions...');
  try {
    const userPositions = await stakeManagerProxy.getUserPositions(deployer.address);
    console.log('✅ User positions count:', userPositions.length);
    console.log('✅ User positions:', userPositions.map(id => id.toString()));
    
    if (userPositions.length > 0) {
      // Проверяем последнюю позицию
      const lastPositionId = userPositions[userPositions.length - 1];
      console.log(`\n📋 Latest position ${lastPositionId}:`);
      
      const position = await stakeManagerProxy.positions(lastPositionId);
      const [id, owner, amount, startTime, duration, tier, isActive, lastClaimTime, totalClaimed, nextMintAt, monthIndex] = position;
      
      console.log('  - ID:', id.toString());
      console.log('  - Owner:', owner);
      console.log('  - Amount:', ethers.formatEther(amount), 'PAD');
      console.log('  - Start Time:', new Date(Number(startTime) * 1000).toLocaleString());
      console.log('  - Duration:', Number(duration), 'seconds');
      console.log('  - Duration:', Number(duration) / 86400, 'days');
      console.log('  - Tier:', tier.toString());
      console.log('  - Is Active:', isActive);
      console.log('  - Next Mint At:', new Date(Number(nextMintAt) * 1000).toLocaleString());
      console.log('  - Month Index:', monthIndex.toString());
      
      // Проверяем готовность к минтингу
      const now = Math.floor(Date.now() / 1000);
      const secondsUntilNextMint = Math.max(0, Number(nextMintAt) - now);
      console.log('  - Seconds until next mint:', secondsUntilNextMint);
      
      if (secondsUntilNextMint <= 0) {
        console.log('  ✅ Ready to mint next NFT!');
      } else {
        console.log('  ⏳ Wait', Math.ceil(secondsUntilNextMint / 60), 'minutes for next NFT');
      }
    }
  } catch (error) {
    console.log('❌ Error getting user positions:', error.message);
  }
  
  // 2. Проверяем общее количество позиций в системе
  console.log('\n🔍 Checking total positions in system...');
  try {
    // Попробуем получить общее количество позиций
    const totalPositions = await stakeManagerProxy.totalPositions();
    console.log('✅ Total positions in system:', totalPositions.toString());
  } catch (error) {
    console.log('❌ Error getting total positions:', error.message);
  }
  
  console.log('\n🎉 Latest positions check complete!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
