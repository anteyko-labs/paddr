const { ethers } = require("hardhat");

async function main() {
  const NFT_FACTORY_ADDRESS = "0x6D87c4647bd91743ce69d8cd2eD568A6d892cd33";
  const STAKE_MANAGER_ADDRESS = "0x58aeA581CA3C470C4f2B1A5DDC251b106Dd363c2";
  
  console.log("Minting test NFT...");
  
  // Получаем контракт
  const nftFactory = await ethers.getContractAt("PADNFTFactory", NFT_FACTORY_ADDRESS);
  
  // Получаем адрес владельца
  const [owner] = await ethers.getSigners();
  console.log(`Owner address: ${owner.address}`);
  
  // Проверяем баланс
  const balance = await nftFactory.balanceOf(owner.address);
  console.log(`Current NFT balance: ${balance}`);
  
  // Создаем тестовые метаданные
  const metadata = {
    positionId: 1,
    amountStaked: ethers.parseEther("100"), // 100 токенов
    lockDurationHours: 24, // 24 часа
    startTimestamp: Math.floor(Date.now() / 1000),
    tierLevel: 1, // Silver tier
    hourIndex: 0,
    nextMintOn: Math.floor(Date.now() / 1000) + 3600 // через час
  };
  
  // Минтим NFT
  console.log("Minting NFT...");
  const tx = await nftFactory.mintNFT(owner.address, metadata);
  await tx.wait();
  
  console.log("✅ NFT minted successfully!");
  console.log(`Transaction hash: ${tx.hash}`);
  
  // Проверяем новый баланс
  const newBalance = await nftFactory.balanceOf(owner.address);
  console.log(`New NFT balance: ${newBalance}`);
  
  // Проверяем tokenURI
  try {
    const tokenURI = await nftFactory.tokenURI(0);
    console.log(`Token 0 URI: ${tokenURI}`);
  } catch (error) {
    console.log(`Error getting token 0 URI: ${error.message}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
