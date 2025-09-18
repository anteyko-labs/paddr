const { ethers } = require('hardhat');

async function main() {
  console.log('🔍 Debugging position data...\n');
  
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
    console.log('✅ User positions:', userPositions.map(id => id.toString()));
    
    if (userPositions.length > 0) {
      // Проверяем каждую позицию
      for (const positionId of userPositions) {
        console.log(`\n📋 Position ${positionId}:`);
        
        try {
          const position = await stakeManagerProxy.positions(positionId);
          console.log('  Raw position data:', position);
          
          // Парсим данные позиции
          const [id, owner, amount, startTime, duration, tier, isActive, lastClaimTime, totalClaimed, nextMintAt, monthIndex] = position;
          
          console.log('  Parsed data:');
          console.log('    - ID:', id.toString());
          console.log('    - Owner:', owner);
          console.log('    - Amount:', ethers.formatEther(amount), 'PAD');
          console.log('    - Start Time:', new Date(Number(startTime) * 1000).toLocaleString());
          console.log('    - Duration:', Number(duration), 'seconds');
          console.log('    - Tier:', tier.toString());
          console.log('    - Is Active:', isActive);
          console.log('    - Last Claim Time:', new Date(Number(lastClaimTime) * 1000).toLocaleString());
          console.log('    - Total Claimed:', ethers.formatEther(totalClaimed), 'PAD');
          console.log('    - Next Mint At:', new Date(Number(nextMintAt) * 1000).toLocaleString());
          console.log('    - Month Index:', monthIndex.toString());
          
          // Проверяем расчеты
          const now = Math.floor(Date.now() / 1000);
          const endTime = Number(startTime) + Number(duration);
          const progress = Math.min(100, ((now - Number(startTime)) / Number(duration)) * 100);
          const secondsRemaining = Math.max(0, endTime - now);
          const secondsUntilNextMint = Math.max(0, Number(nextMintAt) - now);
          
          console.log('  Calculations:');
          console.log('    - Current time:', new Date(now * 1000).toLocaleString());
          console.log('    - End time:', new Date(endTime * 1000).toLocaleString());
          console.log('    - Progress:', progress.toFixed(2) + '%');
          console.log('    - Seconds remaining:', secondsRemaining);
          console.log('    - Seconds until next mint:', secondsUntilNextMint);
          
          // Проверяем награды
          try {
            const rewards = await stakeManagerProxy.calculateRewards(positionId);
            console.log('    - Calculated rewards:', ethers.formatEther(rewards), 'PAD');
          } catch (error) {
            console.log('    - Rewards calculation error:', error.message);
          }
          
        } catch (error) {
          console.log('  ❌ Error reading position:', error.message);
        }
      }
    }
  } catch (error) {
    console.log('❌ Error getting user positions:', error.message);
  }
  
  console.log('\n🎉 Position data debug complete!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
