const { ethers } = require('hardhat');

async function main() {
  console.log('🚀 Creating test staking position...\n');
  
  const [deployer] = await ethers.getSigners();
  console.log('Creating with account:', deployer.address);
  
  // Адреса прокси системы
  const PROXY_STAKE_MANAGER = "0xb659680e6bBBaeC3B5148eF89a41975739D10Af5";
  const PAD_TOKEN_ADDRESS = "0xa5d3fF94a7aeDA396666c8978Eec67C209202da0";
  
  // Получаем контракты
  const UpgradeableMultiStakeManagerV2 = await ethers.getContractFactory('UpgradeableMultiStakeManagerV2');
  const stakeManagerProxy = UpgradeableMultiStakeManagerV2.attach(PROXY_STAKE_MANAGER);
  
  const PADToken = await ethers.getContractFactory('PADToken');
  const padToken = PADToken.attach(PAD_TOKEN_ADDRESS);
  
  // Параметры для тестовой позиции (Bronze tier)
  const amount = ethers.parseEther("500"); // 500 PAD
  const duration = 30 * 24 * 60 * 60; // 30 дней в секундах
  
  console.log('📋 Test position parameters:');
  console.log('  - Amount:', ethers.formatEther(amount), 'PAD');
  console.log('  - Duration:', duration, 'seconds');
  console.log('  - Duration:', duration / (24 * 60 * 60), 'days');
  
  // 1. Проверяем баланс
  console.log('\n🔍 Checking balance...');
  const balance = await padToken.balanceOf(deployer.address);
  console.log('✅ Current balance:', ethers.formatEther(balance), 'PAD');
  
  if (balance < amount) {
    console.log('❌ Insufficient balance for staking');
    return;
  }
  
  // 2. Проверяем allowance
  console.log('\n🔍 Checking allowance...');
  const allowance = await padToken.allowance(deployer.address, PROXY_STAKE_MANAGER);
  console.log('✅ Current allowance:', ethers.formatEther(allowance), 'PAD');
  
  if (allowance < amount) {
    console.log('\n🔧 Approving tokens...');
    const approveTx = await padToken.approve(PROXY_STAKE_MANAGER, amount);
    await approveTx.wait();
    console.log('✅ Tokens approved');
  }
  
  // 3. Создаем позицию
  console.log('\n🚀 Creating staking position...');
  try {
    const createTx = await stakeManagerProxy.createPosition(amount, duration);
    const receipt = await createTx.wait();
    console.log('✅ Position created!');
    
    // Ищем событие PositionCreated
    const positionCreatedEvent = receipt.logs.find(log => {
      try {
        const parsed = stakeManagerProxy.interface.parseLog(log);
        return parsed.name === 'PositionCreated';
      } catch (e) {
        return false;
      }
    });
    
    if (positionCreatedEvent) {
      const parsed = stakeManagerProxy.interface.parseLog(positionCreatedEvent);
      const positionId = parsed.args.positionId;
      console.log('✅ Position ID:', positionId.toString());
      
      // Получаем детали позиции
      const position = await stakeManagerProxy.positions(positionId);
      console.log('\n📋 Position details:');
      console.log('  - Position ID:', positionId.toString());
      console.log('  - Amount:', ethers.formatEther(position.amount), 'PAD');
      console.log('  - Duration:', Number(position.duration), 'seconds');
      console.log('  - Start time:', new Date(Number(position.startTime) * 1000).toLocaleString());
      console.log('  - Next mint at:', new Date(Number(position.nextMintAt) * 1000).toLocaleString());
      console.log('  - Month index:', position.monthIndex);
      console.log('  - Is active:', position.isActive);
      
      // Вычисляем когда можно будет получить первый NFT
      const now = Math.floor(Date.now() / 1000);
      const nextMintTime = Number(position.nextMintAt);
      const timeUntilMint = nextMintTime - now;
      
      console.log('\n⏰ NFT Minting Schedule:');
      console.log('  - First NFT available in:', Math.max(0, timeUntilMint), 'seconds');
      console.log('  - First NFT available in:', Math.max(0, Math.floor(timeUntilMint / 60)), 'minutes');
      console.log('  - First NFT available at:', new Date(nextMintTime * 1000).toLocaleString());
    }
  } catch (error) {
    console.log('❌ Error creating position:', error.message);
  }
  
  console.log('\n🎉 Test position creation complete!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
