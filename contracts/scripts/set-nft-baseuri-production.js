const { ethers } = require("hardhat");

async function main() {
  const NFT_FACTORY_ADDRESS = "0x6D87c4647bd91743ce69d8cd2eD568A6d892cd33";
  
  console.log("Setting NFT baseURI for production...");
  
  // Получаем контракт
  const nftFactory = await ethers.getContractAt("PADNFTFactory", NFT_FACTORY_ADDRESS);
  
  // Устанавливаем baseURI на продакшен API (замените на ваш домен)
  const baseURI = "https://your-domain.com/api/nft-metadata/";
  
  console.log(`Setting baseURI to: ${baseURI}`);
  
  const tx = await nftFactory.setBaseURI(baseURI);
  await tx.wait();
  
  console.log("✅ BaseURI set successfully!");
  console.log(`Transaction hash: ${tx.hash}`);
  console.log("✅ BaseURI updated successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
