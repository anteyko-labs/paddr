const { ethers } = require('hardhat');

async function main() {
  console.log('🧪 Тестируем создание PADToken с 1 миллиардом токенов...\n');
  
  // Deploy PADToken
  console.log('📦 Deploying PADToken...');
  const PADToken = await ethers.getContractFactory('PADToken');
  const padToken = await PADToken.deploy();
  await padToken.waitForDeployment();
  
  const tokenAddress = await padToken.getAddress();
  console.log('✅ PADToken deployed to:', tokenAddress);
  
  // Check total supply
  const totalSupply = await padToken.totalSupply();
  const totalSupplyFormatted = ethers.formatEther(totalSupply);
  
  console.log('\n📊 Total Supply:', totalSupplyFormatted, 'PAD');
  console.log('📊 Expected: 1,000,000,000 PAD');
  
  // Check if correct
  const expectedSupply = ethers.parseEther('1000000000'); // 1 billion
  if (totalSupply.toString() === expectedSupply.toString()) {
    console.log('✅ SUCCESS: Token supply is correct (1 billion)');
  } else {
    console.log('❌ ERROR: Token supply is incorrect');
    console.log('Expected:', ethers.formatEther(expectedSupply));
    console.log('Actual:', totalSupplyFormatted);
  }
  
  // Check deployer balance
  const [deployer] = await ethers.getSigners();
  const deployerBalance = await padToken.balanceOf(deployer.address);
  const deployerBalanceFormatted = ethers.formatEther(deployerBalance);
  
  console.log('\n💰 Deployer balance:', deployerBalanceFormatted, 'PAD');
  
  console.log('\n🎉 Test completed!');
}

main().catch(console.error);
