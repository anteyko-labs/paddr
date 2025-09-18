const { ethers } = require('hardhat');

async function main() {
  console.log('🚀 Deploying TierCalculator...\n');
  
  const [deployer] = await ethers.getSigners();
  console.log('Deploying with account:', deployer.address);
  
  // Deploy TierCalculator
  console.log('📦 Deploying TierCalculator...');
  const TierCalculator = await ethers.getContractFactory('TierCalculator');
  const tierCalculator = await TierCalculator.deploy();
  await tierCalculator.waitForDeployment();
  const tierCalculatorAddress = await tierCalculator.getAddress();
  console.log('✅ TierCalculator deployed to:', tierCalculatorAddress);
  
  // Test the contract
  console.log('\n🧪 Testing TierCalculator...');
  try {
    const tier1 = await tierCalculator.getTier(30 * 24 * 60 * 60); // 30 days
    console.log('✅ Tier for 30 days:', tier1);
    
    const tier2 = await tierCalculator.getTier(90 * 24 * 60 * 60); // 90 days
    console.log('✅ Tier for 90 days:', tier2);
    
    const tier3 = await tierCalculator.getTier(180 * 24 * 60 * 60); // 180 days
    console.log('✅ Tier for 180 days:', tier3);
    
    const tier4 = await tierCalculator.getTier(365 * 24 * 60 * 60); // 365 days
    console.log('✅ Tier for 365 days:', tier4);
  } catch (error) {
    console.log('❌ Error testing TierCalculator:', error.message);
  }
  
  console.log('\n🎉 TierCalculator deployment complete!');
  console.log('\n📋 New TierCalculator Address:');
  console.log('TIER_CALCULATOR_ADDRESS:', tierCalculatorAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });