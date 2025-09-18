const { ethers, upgrades } = require('hardhat');

async function main() {
  console.log('🚀 Deploying to BSC Testnet...\n');

  const signers = await ethers.getSigners();
  if (signers.length === 0) {
    throw new Error('No signers found. Check your private key in .env file');
  }
  const deployer = signers[0];
  console.log('Using account:', deployer.address);
  console.log('Account balance:', ethers.formatEther(await deployer.provider.getBalance(deployer.address)), 'BNB\n');

  // 1. Deploy TierCalculator
  console.log('📦 Deploying TierCalculator...');
  const TierCalculator = await ethers.getContractFactory('TierCalculator');
  const tierCalculator = await TierCalculator.deploy();
  await tierCalculator.waitForDeployment();
  console.log('✅ TierCalculator deployed to:', await tierCalculator.getAddress());

  // 2. Deploy PADNFTFactory
  console.log('\n📦 Deploying PADNFTFactory...');
  const PADNFTFactory = await ethers.getContractFactory('PADNFTFactory');
  const nftFactory = await PADNFTFactory.deploy(
    ethers.ZeroAddress, // temporary stakeManager address
    await tierCalculator.getAddress() // tierCalculator
  );
  await nftFactory.waitForDeployment();
  console.log('✅ PADNFTFactory deployed to:', await nftFactory.getAddress());

  // 3. Deploy UpgradeableMultiStakeManagerV2 Implementation
  console.log('\n📦 Deploying UpgradeableMultiStakeManagerV2 Implementation...');
  const UpgradeableMultiStakeManagerV2 = await ethers.getContractFactory('UpgradeableMultiStakeManagerV2');
  const stakeManagerImpl = await UpgradeableMultiStakeManagerV2.deploy();
  await stakeManagerImpl.waitForDeployment();
  console.log('✅ UpgradeableMultiStakeManagerV2 Implementation deployed to:', await stakeManagerImpl.getAddress());

  // 4. Deploy Proxy
  console.log('\n📦 Deploying Proxy...');
  const proxy = await upgrades.deployProxy(stakeManagerImpl, [
    await tierCalculator.getAddress(),
    await nftFactory.getAddress(),
    deployer.address // admin
  ], {
    initializer: 'initialize',
    kind: 'uups'
  });
  await proxy.waitForDeployment();
  console.log('✅ Proxy deployed to:', await proxy.getAddress());

  // 5. Update PADNFTFactory with correct stakeManager address
  console.log('\n🔧 Updating PADNFTFactory stakeManager address...');
  const setStakeManagerTx = await nftFactory.setStakeManager(await proxy.getAddress());
  await setStakeManagerTx.wait();
  console.log('✅ PADNFTFactory stakeManager updated to:', await proxy.getAddress());

  // 6. Set NFT BaseURI
  console.log('\n🔧 Setting NFT BaseURI...');
  const baseURI = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000/api/nft-metadata/";
  const setBaseURITx = await nftFactory.setBaseURI(baseURI);
  await setBaseURITx.wait();
  console.log('✅ NFT BaseURI set to:', baseURI);

  // 7. Verify deployment
  console.log('\n🔍 Verifying deployment...');
  const stakeManager = UpgradeableMultiStakeManagerV2.attach(await proxy.getAddress());
  
  const tierCalcAddress = await stakeManager.tierCalculator();
  const nftFactoryAddress = await stakeManager.nftFactory();
  
  console.log('✅ TierCalculator address:', tierCalcAddress);
  console.log('✅ NFT Factory address:', nftFactoryAddress);
  console.log('✅ Proxy address:', await proxy.getAddress());

  // 8. Test tokenURI
  console.log('\n🔍 Testing NFT tokenURI...');
  try {
    const tokenURI = await nftFactory.tokenURI(1);
    console.log('✅ Token URI for #1:', tokenURI);
  } catch (error) {
    console.error('❌ Error testing tokenURI:', error.message);
  }

  console.log('\n🎉 BSC Testnet deployment complete!');
  console.log('\n📋 Contract Addresses:');
  console.log('TierCalculator:', await tierCalculator.getAddress());
  console.log('PADNFTFactory:', await nftFactory.getAddress());
  console.log('StakeManager Implementation:', await stakeManagerImpl.getAddress());
  console.log('StakeManager Proxy:', await proxy.getAddress());
  console.log('\n🔗 BSC Testnet Explorer: https://testnet.bscscan.com/');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
