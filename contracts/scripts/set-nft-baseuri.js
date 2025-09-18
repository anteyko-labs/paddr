const { ethers } = require('hardhat');

async function main() {
  console.log('🔧 Setting NFT BaseURI...\n');
  
  const [deployer] = await ethers.getSigners();
  console.log('Using account:', deployer.address);
  console.log('Account balance:', ethers.formatEther(await deployer.provider.getBalance(deployer.address)), 'ETH\n');
  
  // NFT Factory address
  const NFT_FACTORY_ADDRESS = "0x6D87c4647bd91743ce69d8cd2eD568A6d892cd33";
  
  // Set baseURI to our API endpoint
  const BASE_URI = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000/api/nft-metadata/";
  
  console.log('📦 Connecting to NFT Factory...');
  const PADNFTFactory = await ethers.getContractFactory('PADNFTFactory');
  const nftFactory = PADNFTFactory.attach(NFT_FACTORY_ADDRESS);
  
  console.log('🔧 Setting baseURI to:', BASE_URI);
  const setBaseURITx = await nftFactory.setBaseURI(BASE_URI);
  await setBaseURITx.wait();
  console.log('✅ BaseURI set successfully!');
  
  // Verify the change by checking tokenURI
  console.log('\n🔍 Verifying baseURI by checking tokenURI...');
  
  // Test tokenURI for token 17
  console.log('\n🔍 Testing tokenURI for token 17...');
  try {
    const tokenURI = await nftFactory.tokenURI(17);
    console.log('✅ Token URI for #17:', tokenURI);
  } catch (error) {
    console.log('❌ Error getting tokenURI:', error.message);
  }
  
  console.log('\n🎉 NFT BaseURI setup complete!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });