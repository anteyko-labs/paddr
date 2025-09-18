const { ethers } = require('hardhat');

async function main() {
  console.log('🕐 Checking blockchain time...\n');
  
  const [deployer] = await ethers.getSigners();
  console.log('Checking with account:', deployer.address);
  
  // Получаем текущий блок
  const block = await ethers.provider.getBlock('latest');
  const blockTimestamp = block.timestamp;
  
  console.log('📋 Blockchain info:');
  console.log('  - Block number:', block.number);
  console.log('  - Block timestamp:', blockTimestamp);
  console.log('  - Block time:', new Date(blockTimestamp * 1000).toLocaleString());
  
  // Локальное время
  const localTime = Math.floor(Date.now() / 1000);
  console.log('  - Local time:', localTime);
  console.log('  - Local time:', new Date(localTime * 1000).toLocaleString());
  
  // Разница
  const timeDiff = blockTimestamp - localTime;
  console.log('  - Time difference:', timeDiff, 'seconds');
  
  if (Math.abs(timeDiff) > 60) {
    console.log('⚠️  WARNING: Blockchain time differs significantly from local time!');
    console.log('   This can cause issues with staking calculations.');
  }
  
  // Проверяем позиции с правильным временем
  const PROXY_STAKE_MANAGER = "0xAa2b43eC5EA29B7B9675676DAd91a764E823B520";
  const UpgradeableMultiStakeManagerV2 = await ethers.getContractFactory('UpgradeableMultiStakeManagerV2');
  const stakeManagerProxy = UpgradeableMultiStakeManagerV2.attach(PROXY_STAKE_MANAGER);
  
  console.log('\n🔍 Checking positions with blockchain time...');
  try {
    const userPositions = await stakeManagerProxy.getUserPositions(deployer.address);
    
    if (userPositions.length > 0) {
      const positionId = userPositions[0];
      const position = await stakeManagerProxy.positions(positionId);
      const [id, owner, amount, startTime, duration, tier, isActive, lastClaimTime, totalClaimed, nextMintAt, monthIndex] = position;
      
      console.log(`\n📋 Position ${positionId} with blockchain time:`);
      console.log('  - Start Time (blockchain):', new Date(Number(startTime) * 1000).toLocaleString());
      console.log('  - Next Mint At (blockchain):', new Date(Number(nextMintAt) * 1000).toLocaleString());
      
      // Пересчитываем с правильным временем
      const now = blockTimestamp;
      const endTime = Number(startTime) + Number(duration);
      const progress = Math.min(100, ((now - Number(startTime)) / Number(duration)) * 100);
      const secondsRemaining = Math.max(0, endTime - now);
      const secondsUntilNextMint = Math.max(0, Number(nextMintAt) - now);
      
      console.log('  - Current blockchain time:', new Date(now * 1000).toLocaleString());
      console.log('  - End time:', new Date(endTime * 1000).toLocaleString());
      console.log('  - Progress (corrected):', progress.toFixed(2) + '%');
      console.log('  - Seconds remaining:', secondsRemaining);
      console.log('  - Seconds until next mint:', secondsUntilNextMint);
      
      if (secondsUntilNextMint <= 0) {
        console.log('  ✅ Ready to mint next NFT!');
      } else {
        console.log('  ⏳ Wait', Math.ceil(secondsUntilNextMint / 60), 'minutes for next NFT');
      }
    }
  } catch (error) {
    console.log('❌ Error checking positions:', error.message);
  }
  
  console.log('\n🎉 Blockchain time check complete!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
