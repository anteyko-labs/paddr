const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Checking status with account:", deployer.address);

  // Адреса контрактов (актуальные)
  const PADToken = await ethers.getContractFactory("PADToken");
  const padToken = PADToken.attach("0xa5d3fF94a7aeDA396666c8978Eec67C209202da0");

  const MultiStakeManager = await ethers.getContractFactory("MultiStakeManager");
  const multiStakeManager = MultiStakeManager.attach("0xAd3A081fa98bD3C4944282792d0a84116f542E1A");

  const PADNFTFactory = await ethers.getContractFactory("PADNFTFactory");
  const padNFTFactory = PADNFTFactory.attach("0x6D87c4647bd91743ce69d8cd2eD568A6d892cd33");

  console.log("\n=== ПРОВЕРКА СТАТУСА ===");
  
  // 1. Проверяем баланс токенов
  const tokenBalance = await padToken.balanceOf(deployer.address);
  console.log(`1. Баланс PADToken на кошельке: ${ethers.formatEther(tokenBalance)} PAD`);
  
  // 2. Проверяем количество позиций
  const userPositions = await multiStakeManager.getUserPositions(deployer.address);
  console.log(`2. Количество позиций пользователя: ${userPositions.length}`);
  
  // 3. Проверяем NFT баланс
  const nftBalance = await padNFTFactory.balanceOf(deployer.address);
  console.log(`4. Количество NFT на кошельке: ${nftBalance}`);
  
  // 4. Проверяем allowance
  const allowance = await padToken.allowance(deployer.address, await multiStakeManager.getAddress());
  console.log(`5. Allowance для MultiStakeManager: ${ethers.formatEther(allowance)} PAD`);
  
  // 5. Проверяем общий supply
  const totalSupply = await padToken.totalSupply();
  console.log(`6. Общий supply PADToken: ${ethers.formatEther(totalSupply)} PAD`);
  
  console.log("\n=== КОНЕЦ ПРОВЕРКИ ===");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
