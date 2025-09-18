const { ethers } = require('hardhat');

async function main() {
  console.log('🔧 Updating tier requirements...\n');
  
  // Адрес TierWeightManager (это UpgradeableMultiStakeManager)
  const TIER_WEIGHT_MANAGER_ADDRESS = "0x18DDd61369C2DD3ea1144d6E440eA22d50fa384a";
  
  // Подключаемся к сети
  const provider = new ethers.JsonRpcProvider('https://sepolia.infura.io/v3/01fd1d3959ec4dd3afbef724e8c959da');
  const wallet = new ethers.Wallet('22547068237db8ba6738009e6cc6279e33cec1d5665033b0b881fc49b11e71ba', provider);
  
  // ABI для TierWeightManager
  const TIER_WEIGHT_MANAGER_ABI = [
    "function setTierWeight(uint8 tier, uint256 weight) external",
    "function setTierDuration(uint8 tier, uint256 duration) external", 
    "function setTierMinAmount(uint8 tier, uint256 minAmount) external",
    "function getTierWeight(uint8 tier) external view returns (uint256)",
    "function getTierDuration(uint8 tier) external view returns (uint256)",
    "function getTierMinAmount(uint8 tier) external view returns (uint256)",
    "function ADMIN_ROLE() external view returns (bytes32)"
  ];
  
  const tierWeightManager = new ethers.Contract(TIER_WEIGHT_MANAGER_ADDRESS, TIER_WEIGHT_MANAGER_ABI, wallet);
  
  // Проверяем права администратора
  try {
    const adminRole = await tierWeightManager.ADMIN_ROLE();
    const hasAdminRole = await tierWeightManager.hasRole(adminRole, wallet.address);
    console.log(`Admin Role: ${hasAdminRole ? '✅ Yes' : '❌ No'}`);
    
    if (!hasAdminRole) {
      console.log('❌ You do not have admin rights to update tiers');
      return;
    }
  } catch (error) {
    console.log('⚠️  Could not check admin role, proceeding...');
  }
  
  // Новые требования для тиров (пример)
  const newTierRequirements = {
    0: { // Bronze
      weight: 100,           // 100% вес
      duration: 7200,        // 2 часа (вместо 1 часа)
      minAmount: ethers.parseEther("1000") // 1000 токенов (вместо 500)
    },
    1: { // Silver  
      weight: 200,           // 200% вес
      duration: 14400,       // 4 часа (вместо 2 часов)
      minAmount: ethers.parseEther("2500") // 2500 токенов (вместо 1000)
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
  
  console.log('📋 New Tier Requirements:');
  for (const [tier, config] of Object.entries(newTierRequirements)) {
    console.log(`Tier ${tier}: ${ethers.formatEther(config.minAmount)} tokens, ${config.duration/3600} hours, ${config.weight}% weight`);
  }
  console.log('');
  
  // Обновляем каждый тир
  for (const [tierNum, config] of Object.entries(newTierRequirements)) {
    const tier = parseInt(tierNum);
    
    try {
      console.log(`🔄 Updating Tier ${tier}...`);
      
      // Обновляем вес тира
      const weightTx = await tierWeightManager.setTierWeight(tier, config.weight);
      await weightTx.wait();
      console.log(`   ✅ Weight updated: ${config.weight}%`);
      
      // Обновляем длительность тира
      const durationTx = await tierWeightManager.setTierDuration(tier, config.duration);
      await durationTx.wait();
      console.log(`   ✅ Duration updated: ${config.duration/3600} hours`);
      
      // Обновляем минимальную сумму
      const amountTx = await tierWeightManager.setTierMinAmount(tier, config.minAmount);
      await amountTx.wait();
      console.log(`   ✅ Min amount updated: ${ethers.formatEther(config.minAmount)} tokens`);
      
      console.log(`   📋 Transaction hashes:`);
      console.log(`      Weight: ${weightTx.hash}`);
      console.log(`      Duration: ${durationTx.hash}`);
      console.log(`      Amount: ${amountTx.hash}`);
      
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
      const weight = await tierWeightManager.getTierWeight(tier);
      const duration = await tierWeightManager.getTierDuration(tier);
      const minAmount = await tierWeightManager.getTierMinAmount(tier);
      
      console.log(`Tier ${tier}:`);
      console.log(`   Weight: ${weight.toString()}%`);
      console.log(`   Duration: ${duration.toString()} seconds (${duration.toString()/3600} hours)`);
      console.log(`   Min Amount: ${ethers.formatEther(minAmount)} tokens`);
    } catch (error) {
      console.log(`Tier ${tier}: ❌ Error reading values`);
    }
  }
  
  console.log('\n✅ Tier requirements updated successfully!');
  console.log('🎯 Users will now need to stake more tokens for higher tiers!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
