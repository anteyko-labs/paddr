const { ethers } = require('hardhat');

async function main() {
  console.log('🔍 Checking TierCalculator contract...\n');
  
  const [deployer] = await ethers.getSigners();
  console.log('Checking with account:', deployer.address);
  
  // Адрес TierCalculator
  const TIER_CALCULATOR_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  
  // Получаем контракт
  const TierCalculator = await ethers.getContractFactory('TierCalculator');
  const tierCalculator = TierCalculator.attach(TIER_CALCULATOR_ADDRESS);
  
  console.log('📋 TierCalculator address:', TIER_CALCULATOR_ADDRESS);
  
  // Проверяем контракт
  console.log('\n🔍 Checking TierCalculator...');
  try {
    // Проверяем что контракт существует
    const code = await deployer.provider.getCode(TIER_CALCULATOR_ADDRESS);
    if (code === '0x') {
      console.log('❌ Contract does not exist at this address');
      return;
    }
    console.log('✅ Contract exists at address');
    
    // Проверяем функции
    const tier1 = await tierCalculator.getTier(30 * 24 * 60 * 60); // 30 days
    console.log('✅ Tier for 30 days:', tier1);
    
    const tier2 = await tierCalculator.getTier(90 * 24 * 60 * 60); // 90 days
    console.log('✅ Tier for 90 days:', tier2);
    
    const tier3 = await tierCalculator.getTier(180 * 24 * 60 * 60); // 180 days
    console.log('✅ Tier for 180 days:', tier3);
    
    const tier4 = await tierCalculator.getTier(365 * 24 * 60 * 60); // 365 days
    console.log('✅ Tier for 365 days:', tier4);
    
  } catch (error) {
    console.log('❌ Error checking TierCalculator:', error.message);
  }
  
  console.log('\n🎉 TierCalculator check complete!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
