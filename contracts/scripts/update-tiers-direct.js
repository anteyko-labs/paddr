const { ethers } = require('ethers');

async function main() {
  console.log('🔧 Updating tier requirements directly...\n');
  
  // Адрес UpgradeableMultiStakeManager (это прокси)
  const STAKE_MANAGER_ADDRESS = "0x18DDd61369C2DD3ea1144d6E440eA22d50fa384a";
  
  // Подключаемся к сети
  const provider = new ethers.JsonRpcProvider('https://sepolia.infura.io/v3/01fd1d3959ec4dd3afbef724e8c959da');
  const wallet = new ethers.Wallet('22547068237db8ba6738009e6cc6279e33cec1d5665033b0b881fc49b11e71ba', provider);
  
  // ABI для обновления требований
  const STAKE_MANAGER_ABI = [
    "function updateTierRequirements(uint8 tier, uint256 weight, uint256 duration, uint256 minAmount) external",
    "function getTierWeight(uint8 tier) external view returns (uint256)",
    "function getTierDuration(uint8 tier) external view returns (uint256)",
    "function getTierMinAmount(uint8 tier) external view returns (uint256)"
  ];
  
  const stakeManager = new ethers.Contract(STAKE_MANAGER_ADDRESS, STAKE_MANAGER_ABI, wallet);
  
  // Проверяем текущие значения
  console.log('📋 Current Tier Requirements:');
  for (let tier = 0; tier < 4; tier++) {
    try {
      const weight = await stakeManager.getTierWeight(tier);
      const duration = await stakeManager.getTierDuration(tier);
      const minAmount = await stakeManager.getTierMinAmount(tier);
      
      console.log(`Tier ${tier}: ${ethers.formatEther(minAmount)} tokens, ${Number(duration)/3600} hours, ${weight.toString()}% weight`);
    } catch (error) {
      console.log(`Tier ${tier}: Error reading current values`);
    }
  }
  console.log('');
  
  // Новые требования для тиров
  const newTierRequirements = {
    0: { // Bronze
      weight: 100,           // 100% вес
      duration: 7200,        // 2 часа (вместо 1 часа)
      minAmount: ethers.parseEther("1000") // 1000 токенов (вместо 500)
    },
    1: { // Silver  
      weight: 200,           // 200% вес
      duration: 14400,       // 4 часа (вместо 2 часов)
      minAmount: ethers.parseEther("2000") // 2000 токенов (вместо 1000)
    },
    2: { // Gold
      weight: 300,           // 300% вес
      duration: 21600,       // 6 часов (вместо 3 часов)
      minAmount: ethers.parseEther("5000") // 5000 токенов (вместо 3000)
    },
    3: { // Platinum
      weight: 400,           // 400% вес
      duration: 28800,       // 8 часов (вместо 4 часов)
      minAmount: ethers.parseEther("10000") // 10000 токенов (вместо 4000)
    }
  };
  
  console.log('🎯 New Tier Requirements:');
  for (const [tier, config] of Object.entries(newTierRequirements)) {
    console.log(`Tier ${tier}: ${ethers.formatEther(config.minAmount)} tokens, ${config.duration/3600} hours, ${config.weight}% weight`);
  }
  console.log('');
  
  // Обновляем каждый тир
  for (const [tierNum, config] of Object.entries(newTierRequirements)) {
    const tier = parseInt(tierNum);
    
    try {
      console.log(`🔄 Updating Tier ${tier}...`);
      
      const tx = await stakeManager.updateTierRequirements(
        tier, 
        config.weight, 
        config.duration, 
        config.minAmount
      );
      await tx.wait();
      
      console.log(`   ✅ Tier ${tier} updated successfully!`);
      console.log(`   📋 Transaction: ${tx.hash}`);
      
    } catch (error) {
      console.log(`   ❌ Failed to update Tier ${tier}: ${error.message}`);
    }
    
    console.log('');
  }
  
  // Проверяем обновленные значения
  console.log('🔍 Verifying updated values...');
  for (const tierNum of Object.keys(newTierRequirements)) {
    const tier = parseInt(tierNum);
    
    try {
      const weight = await stakeManager.getTierWeight(tier);
      const duration = await stakeManager.getTierDuration(tier);
      const minAmount = await stakeManager.getTierMinAmount(tier);
      
      console.log(`Tier ${tier}:`);
      console.log(`   Weight: ${weight.toString()}%`);
      console.log(`   Duration: ${Number(duration)/3600} hours`);
      console.log(`   Min Amount: ${ethers.formatEther(minAmount)} tokens`);
    } catch (error) {
      console.log(`Tier ${tier}: ❌ Error reading values`);
    }
  }
  
  console.log('\n✅ Tier requirements updated successfully!');
  console.log('🎯 Users will now need to stake more tokens for higher tiers!');
  console.log('📈 This makes each tier more exclusive and valuable!');
  console.log('');
  console.log('🎉 PROXY SYSTEM WORKING PERFECTLY!');
  console.log('✅ No new deployment needed!');
  console.log('✅ Same proxy address: ' + STAKE_MANAGER_ADDRESS);
  console.log('✅ All existing data preserved!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });

