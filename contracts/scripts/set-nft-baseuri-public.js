const { ethers } = require("hardhat");

async function main() {
  const NFT_FACTORY_ADDRESS = "0x6D87c4647bd91743ce69d8cd2eD568A6d892cd33";
  
  console.log("Setting NFT baseURI for public access...");
  
  // Получаем контракт
  const nftFactory = await ethers.getContractAt("PADNFTFactory", NFT_FACTORY_ADDRESS);
  
  // Устанавливаем baseURI на публичный домен (замените на ваш ngrok URL)
  const baseURI = "https://YOUR-NGROK-URL.ngrok.io/api/nft-metadata/";
  
  console.log(`Setting baseURI to: ${baseURI}`);
  console.log("⚠️  IMPORTANT: Replace YOUR-NGROK-URL with your actual ngrok URL!");
  
  // Раскомментируйте когда получите ngrok URL:
  // const tx = await nftFactory.setBaseURI(baseURI);
  // await tx.wait();
  // console.log("✅ BaseURI set successfully!");
  // console.log(`Transaction hash: ${tx.hash}`);
  
  console.log("✅ Script ready - update the URL and uncomment the transaction code");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
