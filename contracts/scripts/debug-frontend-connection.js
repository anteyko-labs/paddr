const { ethers } = require('hardhat');

async function main() {
  console.log('🔍 Debugging frontend connection...\n');
  
  const [deployer] = await ethers.getSigners();
  console.log('Checking with account:', deployer.address);
  
  // Адреса системы
  const PROXY_STAKE_MANAGER = "0xAa2b43eC5EA29B7B9675676DAd91a764E823B520";
  
  // Получаем контракт
  const UpgradeableMultiStakeManagerV2 = await ethers.getContractFactory('UpgradeableMultiStakeManagerV2');
  const stakeManagerProxy = UpgradeableMultiStakeManagerV2.attach(PROXY_STAKE_MANAGER);
  
  console.log('📋 Stake Manager:', PROXY_STAKE_MANAGER);
  
  // 1. Проверяем getUserPositions
  console.log('\n🔍 Testing getUserPositions...');
  try {
    const userPositions = await stakeManagerProxy.getUserPositions(deployer.address);
    console.log('✅ getUserPositions result:', userPositions);
    console.log('✅ getUserPositions length:', userPositions.length);
    console.log('✅ getUserPositions types:', userPositions.map(id => typeof id));
    
    if (userPositions.length > 0) {
      console.log('✅ Position IDs:', userPositions.map(id => id.toString()));
    }
  } catch (error) {
    console.log('❌ getUserPositions error:', error.message);
  }
  
  // 2. Проверяем positions function
  console.log('\n🔍 Testing positions function...');
  try {
    if (userPositions && userPositions.length > 0) {
      const positionId = userPositions[0];
      console.log('Testing position ID:', positionId.toString());
      
      const position = await stakeManagerProxy.positions(positionId);
      console.log('✅ positions result:', position);
      console.log('✅ positions length:', position.length);
      console.log('✅ positions types:', position.map(item => typeof item));
      
      // Проверяем структуру данных
      if (position.length >= 11) {
        const [id, owner, amount, startTime, duration, tier, isActive, lastClaimTime, totalClaimed, nextMintAt, monthIndex] = position;
        console.log('✅ Parsed data:');
        console.log('  - ID:', id.toString());
        console.log('  - Owner:', owner);
        console.log('  - Amount:', amount.toString());
        console.log('  - Start Time:', startTime.toString());
        console.log('  - Duration:', duration.toString());
        console.log('  - Tier:', tier.toString());
        console.log('  - Is Active:', isActive);
        console.log('  - Next Mint At:', nextMintAt.toString());
        console.log('  - Month Index:', monthIndex.toString());
      }
    }
  } catch (error) {
    console.log('❌ positions error:', error.message);
  }
  
  // 3. Проверяем ABI
  console.log('\n🔍 Testing ABI functions...');
  try {
    const abi = UpgradeableMultiStakeManagerV2.interface;
    console.log('✅ ABI functions:');
    const functions = abi.fragments.filter(f => f.type === 'function');
    functions.forEach(func => {
      console.log(`  - ${func.name}(${func.inputs.map(i => i.type).join(', ')})`);
    });
  } catch (error) {
    console.log('❌ ABI error:', error.message);
  }
  
  console.log('\n🎉 Frontend connection debug complete!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
