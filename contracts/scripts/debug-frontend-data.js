const { ethers } = require('hardhat');

async function main() {
  console.log('🔍 Debugging frontend data conversion...\n');
  
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
      // Проверяем позицию 3 (как на изображении)
      const positionId = userPositions.find(id => id.toString() === '3');
      if (positionId) {
        console.log(`\n📋 Position 3 (from image):`);
        
        const position = await stakeManagerProxy.positions(positionId);
        console.log('  Raw position data:', position);
        
        // Парсим данные позиции
        const [id, owner, amount, startTime, duration, tier, isActive, lastClaimTime, totalClaimed, nextMintAt, monthIndex] = position;
        
        console.log('  Parsed data:');
        console.log('    - ID:', id.toString());
        console.log('    - Owner:', owner);
        console.log('    - Amount (raw):', amount.toString());
        console.log('    - Amount (formatted):', ethers.formatEther(amount), 'PAD');
        console.log('    - Start Time (raw):', startTime.toString());
        console.log('    - Start Time (formatted):', new Date(Number(startTime) * 1000).toLocaleDateString());
        console.log('    - Duration (raw):', duration.toString());
        console.log('    - Duration (seconds):', Number(duration));
        console.log('    - Duration (days):', Number(duration) / 86400);
        console.log('    - Tier:', tier.toString());
        console.log('    - Is Active:', isActive);
        console.log('    - Next Mint At (raw):', nextMintAt.toString());
        console.log('    - Next Mint At (formatted):', new Date(Number(nextMintAt) * 1000).toLocaleDateString());
        console.log('    - Month Index:', monthIndex.toString());
        
        // Проверяем расчеты
        const now = Math.floor(Date.now() / 1000);
        const endTime = Number(startTime) + Number(duration);
        const progress = Math.min(100, ((now - Number(startTime)) / Number(duration)) * 100);
        const secondsRemaining = Math.max(0, endTime - now);
        const secondsUntilNextMint = Math.max(0, Number(nextMintAt) - now);
        
        console.log('  Calculations:');
        console.log('    - Current time:', new Date(now * 1000).toLocaleDateString());
        console.log('    - End time:', new Date(endTime * 1000).toLocaleDateString());
        console.log('    - Progress:', progress.toFixed(2) + '%');
        console.log('    - Seconds remaining:', secondsRemaining);
        console.log('    - Days remaining:', Math.ceil(secondsRemaining / 86400));
        console.log('    - Seconds until next mint:', secondsUntilNextMint);
        
        // Проверяем награды
        const maxRewards = Math.floor(Number(duration) / 300); // 5 минут = 300 секунд
        console.log('    - Max rewards (5min interval):', maxRewards);
        
        // Проверяем что происходит с форматированием
        console.log('  Formatting issues:');
        console.log('    - Amount as string:', amount.toString());
        console.log('    - Amount as number:', Number(amount));
        console.log('    - Amount as bigint:', amount);
        console.log('    - Duration as string:', duration.toString());
        console.log('    - Duration as number:', Number(duration));
        console.log('    - Duration as bigint:', duration);
        
        // Проверяем что происходит с конвертацией
        console.log('  Conversion issues:');
        console.log('    - typeof amount:', typeof amount);
        console.log('    - typeof duration:', typeof duration);
        console.log('    - typeof startTime:', typeof startTime);
        console.log('    - typeof tier:', typeof tier);
        
        // Проверяем что происходит с форматированием в хуке
        console.log('  Hook formatting simulation:');
        const formattedAmount = (amount / BigInt(10**18)).toString() + '.' + (amount % BigInt(10**18)).toString().padStart(18, '0').replace(/0+$/, '');
        console.log('    - Simulated formattedAmount:', formattedAmount);
        
        // Проверяем что происходит с форматированием времени
        const days = Math.floor(Number(duration) / 86400);
        const hours = Math.floor((Number(duration) % 86400) / 3600);
        const formattedDuration = `${days} day${days > 1 ? 's' : ''} ${hours} hour${hours > 1 ? 's' : ''}`.trim();
        console.log('    - Simulated formattedDuration:', formattedDuration);
        
      } else {
        console.log('❌ Position 3 not found');
      }
    }
  } catch (error) {
    console.log('❌ Error getting user positions:', error.message);
  }
  
  console.log('\n🎉 Frontend data debug complete!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });