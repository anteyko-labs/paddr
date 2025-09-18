const { ethers } = require('ethers');

async function main() {
  console.log('🚀 Creating new Platinum staking position...\n');
  
  // Адрес UpgradeableMultiStakeManager
  const STAKE_MANAGER_ADDRESS = "0x18DDd61369C2DD3ea1144d6E440eA22d50fa384a";
  
  // Подключаемся к сети
  const provider = new ethers.JsonRpcProvider('https://sepolia.infura.io/v3/01fd1d3959ec4dd3afbef724e8c959da');
  const wallet = new ethers.Wallet('22547068237db8ba6738009e6cc6279e33cec1d5665033b0b881fc49b11e71ba', provider);
  
  // ABI для UpgradeableMultiStakeManager
  const STAKE_MANAGER_ABI = [
    "function createPosition(uint256 amount, uint256 duration) external",
    "function getUserPositions(address user) external view returns (uint256[] memory)",
    "function getPosition(uint256 positionId) external view returns (tuple(uint256 id, address owner, uint256 amount, uint256 startTime, uint256 duration, uint8 tier, bool isActive, uint256 lastClaimTime, uint256 totalClaimed))",
    "function REWARD_INTERVAL() external view returns (uint256)"
  ];
  
  const stakeManager = new ethers.Contract(STAKE_MANAGER_ADDRESS, STAKE_MANAGER_ABI, wallet);
  
  // Проверяем текущие позиции
  console.log('📋 Current staking positions:');
  try {
    const userPositions = await stakeManager.getUserPositions(wallet.address);
    console.log(`   Found ${userPositions.length} positions`);
    
    for (const positionId of userPositions) {
      const position = await stakeManager.getPosition(positionId);
      console.log(`   Position ${positionId}: ${ethers.formatEther(position.amount)} tokens, Tier ${position.tier}, Duration ${position.duration/3600} hours`);
    }
  } catch (error) {
    console.log('   Error reading positions:', error.message);
  }
  console.log('');
  
  // Создаем новую позицию Bronze для тестирования
  // Bronze требует: 500 токенов, 1 час (3600 секунд)
  const bronzeAmount = ethers.parseEther("500"); // 500 токенов
  const bronzeDuration = 3600; // 1 час в секундах
  
  console.log('🎯 Creating Bronze staking position for testing:');
  console.log(`   Amount: ${ethers.formatEther(bronzeAmount)} tokens`);
  console.log(`   Duration: ${bronzeDuration/3600} hours`);
  console.log(`   Expected Tier: 0 (Bronze)`);
  console.log('');
  
  try {
    console.log('🔄 Creating position...');
    const tx = await stakeManager.createPosition(bronzeAmount, bronzeDuration);
    await tx.wait();
    
    console.log('✅ Position created successfully!');
    console.log(`   Transaction: ${tx.hash}`);
    
    // Получаем ID новой позиции
    const userPositions = await stakeManager.getUserPositions(wallet.address);
    const newPositionId = userPositions[userPositions.length - 1];
    
    console.log(`   New Position ID: ${newPositionId}`);
    
    // Проверяем детали новой позиции
    const newPosition = await stakeManager.getPosition(newPositionId);
    console.log('\n📋 New Position Details:');
    console.log(`   ID: ${newPosition.id}`);
    console.log(`   Owner: ${newPosition.owner}`);
    console.log(`   Amount: ${ethers.formatEther(newPosition.amount)} tokens`);
    console.log(`   Start Time: ${new Date(Number(newPosition.startTime) * 1000).toLocaleString()}`);
    console.log(`   Duration: ${Number(newPosition.duration)/3600} hours`);
    console.log(`   Tier: ${newPosition.tier} (${newPosition.tier === 3 ? 'Platinum' : 'Other'})`);
    console.log(`   Active: ${newPosition.isActive}`);
    console.log(`   Last Claim: ${new Date(Number(newPosition.lastClaimTime) * 1000).toLocaleString()}`);
    console.log(`   Total Claimed: ${ethers.formatEther(newPosition.totalClaimed)} tokens`);
    
    return newPositionId;
    
  } catch (error) {
    console.log('❌ Failed to create position:', error.message);
    return null;
  }
}

main()
  .then((positionId) => {
    if (positionId) {
      console.log('\n🎉 Platinum staking position created successfully!');
      console.log(`   Position ID: ${positionId}`);
      console.log('   Ready for voucher testing!');
    } else {
      console.log('\n❌ Failed to create staking position');
    }
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
