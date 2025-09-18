const { ethers } = require("hardhat");

async function main() {
  const NFT_FACTORY_ADDRESS = "0x6D87c4647bd91743ce69d8cd2eD568A6d892cd33";
  
  console.log("Checking NFT baseURI...");
  
  // Получаем контракт
  const nftFactory = await ethers.getContractAt("PADNFTFactory", NFT_FACTORY_ADDRESS);
  
  // Проверяем tokenURI напрямую
  
  // Проверяем tokenURI для токена 0
  try {
    const tokenURI = await nftFactory.tokenURI(0);
    console.log(`Token 0 URI: ${tokenURI}`);
  } catch (error) {
    console.log(`Error getting token 0 URI: ${error.message}`);
  }
  
  // Проверяем tokenURI для токена 1
  try {
    const tokenURI = await nftFactory.tokenURI(1);
    console.log(`Token 1 URI: ${tokenURI}`);
  } catch (error) {
    console.log(`Error getting token 1 URI: ${error.message}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
