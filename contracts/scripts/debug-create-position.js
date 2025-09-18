const { ethers } = require('hardhat');

async function main() {
  console.log('🔍 Debugging position creation...\n');
  
  const [deployer] = await ethers.getSigners();
  console.log('Debugging with account:', deployer.address);
  
  // Адреса прокси системы
  const PROXY_STAKE_MANAGER = "0xb659680e6bBBaeC3B5148eF89a41975739D10Af5";
  const PAD_TOKEN_ADDRESS = "0xa5d3fF94a7aeDA396666c8978Eec67C209202da0";
  const TIER_CALCULATOR_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  
  // Получаем контракты
  const UpgradeableMultiStakeManagerV2 = await ethers.getContractFactory('UpgradeableMultiStakeManagerV2');
  const stakeManagerProxy = UpgradeableMultiStakeManagerV2.attach(PROXY_STAKE_MANAGER);
  
  const PADToken = await ethers.getContractFactory('PADToken');
  const padToken = PADToken.attach(PAD_TOKEN_ADDRESS);
  
  const TierCalculator = await ethers.getContractFactory('TierCalculator');
  const tierCalculator = TierCalculator.attach(TIER_CALCULATOR_ADDRESS);
  
  // Параметры для тестовой позиции
  const amount = ethers.parseEther("500"); // 500 PAD
  const duration = 30 * 24 * 60 * 60; // 30 дней в секундах
  
  console.log('📋 Test parameters:');
  console.log('  - Amount:', ethers.formatEther(amount), 'PAD');
  console.log('  - Duration:', duration, 'seconds');
  
  // 1. Проверяем контракты
  console.log('\n🔍 Checking contracts...');
  try {
    const stakingToken = await stakeManagerProxy.stakingToken();
    console.log('✅ Staking token:', stakingToken);
    
    const tierCalc = await stakeManagerProxy.tierCalculator();
    console.log('✅ Tier calculator:', tierCalc);
    
    const version = await stakeManagerProxy.version();
    console.log('✅ Version:', version);
  } catch (error) {
    console.log('❌ Error checking contracts:', error.message);
  }
  
  // 2. Проверяем tier calculator
  console.log('\n🔍 Checking tier calculator...');
  try {
    const tier = await tierCalculator.getTier(duration);
    console.log('✅ Tier for duration:', tier);
  } catch (error) {
    console.log('❌ Error checking tier calculator:', error.message);
  }
  
  // 3. Проверяем tier requirements в прокси
  console.log('\n🔍 Checking tier requirements...');
  try {
    const tier0MinAmount = await stakeManagerProxy.getTierMinAmount(0);
    console.log('✅ Tier 0 (Bronze) min amount:', ethers.formatEther(tier0MinAmount), 'PAD');
    
    const tier0Duration = await stakeManagerProxy.getTierDuration(0);
    console.log('✅ Tier 0 (Bronze) duration:', tier0Duration.toString(), 'seconds');
  } catch (error) {
    console.log('❌ Error checking tier requirements:', error.message);
  }
  
  // 4. Проверяем баланс и allowance
  console.log('\n🔍 Checking balance and allowance...');
  try {
    const balance = await padToken.balanceOf(deployer.address);
    console.log('✅ Balance:', ethers.formatEther(balance), 'PAD');
    
    const allowance = await padToken.allowance(deployer.address, PROXY_STAKE_MANAGER);
    console.log('✅ Allowance:', ethers.formatEther(allowance), 'PAD');
  } catch (error) {
    console.log('❌ Error checking balance/allowance:', error.message);
  }
  
  console.log('\n🎉 Debug complete!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
