const { ethers } = require('hardhat');

async function main() {
  console.log('🚀 Deploying to BSC Testnet (Simple)...\n');

  const signers = await ethers.getSigners();
  if (signers.length === 0) {
    throw new Error('No signers found. Check your private key in .env file');
  }
  const deployer = signers[0];
  console.log('Using account:', deployer.address);
  console.log('Account balance:', ethers.formatEther(await deployer.provider.getBalance(deployer.address)), 'BNB\n');

  // 1. Deploy PADToken (1 billion)
  console.log('📦 Deploying PADToken...');
  const PADToken = await ethers.getContractFactory('PADToken');
  const padToken = await PADToken.deploy();
  await padToken.waitForDeployment();
  console.log('✅ PADToken deployed to:', await padToken.getAddress());

  // 2. Deploy TierCalculator
  console.log('\n📦 Deploying TierCalculator...');
  const TierCalculator = await ethers.getContractFactory('TierCalculator');
  const tierCalculator = await TierCalculator.deploy();
  await tierCalculator.waitForDeployment();
  console.log('✅ TierCalculator deployed to:', await tierCalculator.getAddress());

  // 3. Deploy PADNFTFactory
  console.log('\n📦 Deploying PADNFTFactory...');
  const PADNFTFactory = await ethers.getContractFactory('PADNFTFactory');
  const nftFactory = await PADNFTFactory.deploy(
    ethers.ZeroAddress, // temporary stakeManager address
    await tierCalculator.getAddress() // tierCalculator
  );
  await nftFactory.waitForDeployment();
  console.log('✅ PADNFTFactory deployed to:', await nftFactory.getAddress());

  // 4. Deploy UpgradeableMultiStakeManagerV2 (direct deployment)
  console.log('\n📦 Deploying UpgradeableMultiStakeManagerV2...');
  const UpgradeableMultiStakeManagerV2 = await ethers.getContractFactory('UpgradeableMultiStakeManagerV2');
  const stakeManager = await UpgradeableMultiStakeManagerV2.deploy();
  await stakeManager.waitForDeployment();
  console.log('✅ UpgradeableMultiStakeManagerV2 deployed to:', await stakeManager.getAddress());

  // 5. Initialize StakeManager
  console.log('\n🔧 Initializing StakeManager...');
  const initTx = await stakeManager.initialize(
    await padToken.getAddress(), // stakingToken
    await tierCalculator.getAddress() // tierCalculator
  );
  await initTx.wait();
  console.log('✅ StakeManager initialized');

  // 6. Set NFT Factory in StakeManager
  console.log('\n🔧 Setting NFT Factory in StakeManager...');
  const setNFTFactoryTx = await stakeManager.setNFTFactory(await nftFactory.getAddress());
  await setNFTFactoryTx.wait();
  console.log('✅ NFT Factory set in StakeManager');

  // 7. Set NFT BaseURI
  console.log('\n🔧 Setting NFT BaseURI...');
  const baseURI = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000/api/nft-metadata/";
  const setBaseURITx = await nftFactory.setBaseURI(baseURI);
  await setBaseURITx.wait();
  console.log('✅ NFT BaseURI set to:', baseURI);

  // 8. Verify deployment
  console.log('\n🔍 Verifying deployment...');
  const tierCalcAddress = await stakeManager.tierCalculator();
  const nftFactoryAddress = await stakeManager.nftFactory();
  
  console.log('✅ TierCalculator address:', tierCalcAddress);
  console.log('✅ NFT Factory address:', nftFactoryAddress);
  console.log('✅ StakeManager address:', await stakeManager.getAddress());

  // 9. Test tokenURI
  console.log('\n🔍 Testing NFT tokenURI...');
  try {
    const tokenURI = await nftFactory.tokenURI(1);
    console.log('✅ Token URI for #1:', tokenURI);
  } catch (error) {
    console.error('❌ Error testing tokenURI:', error.message);
  }

  console.log('\n🎉 BSC Testnet deployment complete!');
  console.log('\n📋 Contract Addresses:');
  console.log('PADToken:', await padToken.getAddress());
  console.log('TierCalculator:', await tierCalculator.getAddress());
  console.log('PADNFTFactory:', await nftFactory.getAddress());
  console.log('StakeManager:', await stakeManager.getAddress());
  console.log('\n🔗 BSC Testnet Explorer: https://testnet.bscscan.com/');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
