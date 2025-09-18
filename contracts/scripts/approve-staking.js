const { ethers } = require('hardhat');

async function main() {
  console.log('🔐 Одобряем StakeManager для траты PAD токенов...\n');
  
  const signers = await ethers.getSigners();
  if (signers.length === 0) {
    throw new Error('No signers found. Check your private key in .env file');
  }
  const deployer = signers[0];
  console.log('Using account:', deployer.address);
  
  const PAD_TOKEN_ADDRESS = '0x6e54ef83eD01B718c92DDEb2629E9849eDe5b94F';
  const STAKE_MANAGER_ADDRESS = '0xdFb58CEe97B91178555CfAC3bE976e925F9De2e3';
  
  // ABI для PADToken
  const PAD_TOKEN_ABI = [
    "function approve(address spender, uint256 amount) returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)"
  ];
  
  const padToken = new ethers.Contract(PAD_TOKEN_ADDRESS, PAD_TOKEN_ABI, deployer);
  
  // Проверяем текущий allowance
  const currentAllowance = await padToken.allowance(deployer.address, STAKE_MANAGER_ADDRESS);
  console.log('Current allowance:', ethers.formatEther(currentAllowance), 'PAD');
  
  if (currentAllowance > 0n) {
    console.log('✅ Allowance уже настроен');
    return;
  }
  
  // Одобряем максимальное количество
  const maxAmount = ethers.MaxUint256;
  console.log('Approving maximum amount...');
  
  const approveTx = await padToken.approve(STAKE_MANAGER_ADDRESS, maxAmount);
  console.log('Transaction hash:', approveTx.hash);
  
  await approveTx.wait();
  console.log('✅ Approval confirmed!');
  
  // Проверяем новый allowance
  const newAllowance = await padToken.allowance(deployer.address, STAKE_MANAGER_ADDRESS);
  console.log('New allowance:', ethers.formatEther(newAllowance), 'PAD');
  
  console.log('\n🎉 Теперь можно стейкать!');
}

main().catch(console.error);
