const { ethers } = require('hardhat');

async function main() {
  console.log('🚀 Deploying New Tier Calculator with updated requirements...\n');
  
  // Деплоим новый TierCalculator
  const NewTierCalculator = await ethers.getContractFactory('NewTierCalculator');
  const newTierCalculator = await NewTierCalculator.deploy();
  await newTierCalculator.waitForDeployment();
  
  const newTierCalculatorAddress = await newTierCalculator.getAddress();
  console.log('✅ New Tier Calculator deployed to:', newTierCalculatorAddress);
  
  // Тестируем новые требования
  console.log('\n🧪 Testing new tier requirements:');
  
  const testDurations = [
    { duration: 3600, name: '1 hour' },
    { duration: 7200, name: '2 hours' },
    { duration: 14400, name: '4 hours' },
    { duration: 21600, name: '6 hours' },
    { duration: 28800, name: '8 hours' },
    { duration: 36000, name: '10 hours' }
  ];
  
  for (const test of testDurations) {
    const tier = await newTierCalculator.getTier(test.duration);
    const tierName = await newTierCalculator.getTierName(tier);
    const minAmount = await newTierCalculator.getTierMinAmount(tier);
    const tierDuration = await newTierCalculator.getTierDuration(tier);
    
    console.log(`${test.name}:`);
    console.log(`   Tier: ${tier} (${tierName})`);
    console.log(`   Min Amount: ${ethers.formatEther(minAmount)} tokens`);
    console.log(`   Required Duration: ${Number(tierDuration)/3600} hours`);
    console.log('');
  }
  
  console.log('📋 New Tier Requirements Summary:');
  console.log('✅ Bronze: 1000 tokens, 2 hours minimum');
  console.log('✅ Silver: 2000 tokens, 4 hours minimum');
  console.log('✅ Gold: 5000 tokens, 6 hours minimum');
  console.log('✅ Platinum: 10000 tokens, 8 hours minimum');
  console.log('');
  console.log('🎯 Users will now need to stake MORE tokens for higher tiers!');
  console.log('📈 This makes each tier more exclusive and valuable!');
  console.log('');
  console.log('📝 Next steps:');
  console.log('1. Update frontend config to use new requirements');
  console.log('2. Update contract addresses in config.ts');
  console.log('3. Test staking with new requirements');
  console.log('4. Deploy to mainnet when ready');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
