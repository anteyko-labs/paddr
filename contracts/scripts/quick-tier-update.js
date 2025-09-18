const { ethers } = require('hardhat');

async function main() {
  console.log('⚡ Quick Tier Requirements Update\n');
  
  // Адрес TierWeightManager
  const TIER_WEIGHT_MANAGER_ADDRESS = "0x18DDd61369C2DD3ea1144d6E440eA22d50fa384a";
  
  // Подключаемся к сети
  const provider = new ethers.JsonRpcProvider('https://sepolia.infura.io/v3/01fd1d3959ec4dd3afbef724e8c959da');
  const wallet = new ethers.Wallet('22547068237db8ba6738009e6cc6279e33cec1d5665033b0b881fc49b11e71ba', provider);
  
  // ABI для TierWeightManager
  const TIER_WEIGHT_MANAGER_ABI = [
    "function setTierMinAmount(uint8 tier, uint256 minAmount) external",
    "function getTierMinAmount(uint8 tier) external view returns (uint256)"
  ];
  
  const tierWeightManager = new ethers.Contract(TIER_WEIGHT_MANAGER_ADDRESS, TIER_WEIGHT_MANAGER_ABI, wallet);
  
  // Текущие требования
  console.log('📋 Current Tier Requirements:');
  for (let tier = 0; tier < 4; tier++) {
    try {
      const currentAmount = await tierWeightManager.getTierMinAmount(tier);
      console.log(`Tier ${tier}: ${ethers.formatEther(currentAmount)} tokens`);
    } catch (error) {
      console.log(`Tier ${tier}: Error reading current amount`);
    }
  }
  console.log('');
  
  // Новые требования (увеличиваем в 2 раза)
  const newRequirements = {
    0: ethers.parseEther("1000"),  // Bronze: 1000 токенов (было 500)
    1: ethers.parseEther("2000"),  // Silver: 2000 токенов (было 1000)
    2: ethers.parseEther("6000"),  // Gold: 6000 токенов (было 3000)
    3: ethers.parseEther("8000")   // Platinum: 8000 токенов (было 4000)
  };
  
  console.log('🎯 New Tier Requirements:');
  for (const [tier, amount] of Object.entries(newRequirements)) {
    console.log(`Tier ${tier}: ${ethers.formatEther(amount)} tokens`);
  }
  console.log('');
  
  // Обновляем требования
  console.log('🔄 Updating tier requirements...');
  for (const [tierNum, newAmount] of Object.entries(newRequirements)) {
    const tier = parseInt(tierNum);
    
    try {
      console.log(`Updating Tier ${tier} to ${ethers.formatEther(newAmount)} tokens...`);
      
      const tx = await tierWeightManager.setTierMinAmount(tier, newAmount);
      await tx.wait();
      
      console.log(`✅ Tier ${tier} updated successfully!`);
      console.log(`   Transaction: ${tx.hash}`);
      
    } catch (error) {
      console.log(`❌ Failed to update Tier ${tier}: ${error.message}`);
    }
  }
  
  // Проверяем обновленные значения
  console.log('\n🔍 Verifying updated requirements:');
  for (let tier = 0; tier < 4; tier++) {
    try {
      const updatedAmount = await tierWeightManager.getTierMinAmount(tier);
      console.log(`Tier ${tier}: ${ethers.formatEther(updatedAmount)} tokens`);
    } catch (error) {
      console.log(`Tier ${tier}: Error reading updated amount`);
    }
  }
  
  console.log('\n✅ Tier requirements updated successfully!');
  console.log('🎯 Users will now need to stake more tokens for each tier!');
  console.log('📈 This will increase the value of each tier and make staking more exclusive!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
