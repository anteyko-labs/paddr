const { ethers, upgrades } = require('hardhat');

async function main() {
  console.log('🚀 Deploying ALL contracts with PROXIES to BSC Testnet...\n');

  const signers = await ethers.getSigners();
  if (signers.length === 0) {
    throw new Error('No signers found. Check your private key in .env file');
  }
  const deployer = signers[0];
  console.log('Using account:', deployer.address);
  console.log('Account balance:', ethers.formatEther(await deployer.provider.getBalance(deployer.address)), 'BNB\n');

  // 1. Deploy PADTokenV2 as PROXY
  console.log('📦 Deploying PADTokenV2 as PROXY...');
  const PADTokenV2 = await ethers.getContractFactory('PADTokenV2');
  const padToken = await upgrades.deployProxy(
    PADTokenV2,
    [ethers.parseEther('1000000000')], // 1 billion tokens
    { 
      initializer: 'initialize',
      kind: 'uups'
    }
  );
  await padToken.waitForDeployment();
  console.log('✅ PADTokenV2 PROXY deployed to:', await padToken.getAddress());
  console.log('📍 Implementation address:', await upgrades.erc1967.getImplementationAddress(await padToken.getAddress()));

  // 2. Deploy TierCalculatorV2 as PROXY
  console.log('\n📦 Deploying TierCalculatorV2 as PROXY...');
  const TierCalculatorV2 = await ethers.getContractFactory('TierCalculatorV2');
  const tierCalculator = await upgrades.deployProxy(
    TierCalculatorV2,
    [],
    { 
      initializer: 'initialize',
      kind: 'uups'
    }
  );
  await tierCalculator.waitForDeployment();
  console.log('✅ TierCalculatorV2 PROXY deployed to:', await tierCalculator.getAddress());
  console.log('📍 Implementation address:', await upgrades.erc1967.getImplementationAddress(await tierCalculator.getAddress()));

  // 3. Deploy PADNFTFactoryV2 as PROXY
  console.log('\n📦 Deploying PADNFTFactoryV2 as PROXY...');
  const PADNFTFactoryV2 = await ethers.getContractFactory('PADNFTFactoryV2');
  const nftFactory = await upgrades.deployProxy(
    PADNFTFactoryV2,
    [
      ethers.ZeroAddress, // temporary stakeManager address
      await tierCalculator.getAddress() // tierCalculator
    ],
    { 
      initializer: 'initialize',
      kind: 'uups'
    }
  );
  await nftFactory.waitForDeployment();
  console.log('✅ PADNFTFactoryV2 PROXY deployed to:', await nftFactory.getAddress());
  console.log('📍 Implementation address:', await upgrades.erc1967.getImplementationAddress(await nftFactory.getAddress()));

  // 4. Deploy UpgradeableMultiStakeManagerV4 as PROXY
  console.log('\n📦 Deploying UpgradeableMultiStakeManagerV4 as PROXY...');
  const UpgradeableMultiStakeManagerV4 = await ethers.getContractFactory('UpgradeableMultiStakeManagerV4');
  const stakeManager = await upgrades.deployProxy(
    UpgradeableMultiStakeManagerV4,
    [
      await padToken.getAddress(), // stakingToken
      await tierCalculator.getAddress() // tierCalculator
    ],
    { 
      initializer: 'initialize',
      kind: 'uups'
    }
  );
  await stakeManager.waitForDeployment();
  console.log('✅ UpgradeableMultiStakeManagerV4 PROXY deployed to:', await stakeManager.getAddress());
  console.log('📍 Implementation address:', await upgrades.erc1967.getImplementationAddress(await stakeManager.getAddress()));

  // 5. Initialize StakeManager V4
  console.log('\n🔧 Initializing StakeManager V4...');
  const initTx = await stakeManager.initializeV4();
  await initTx.wait();
  console.log('✅ StakeManager V4 initialized');

  // 6. Set NFT Factory in StakeManager
  console.log('\n🔧 Setting NFT Factory in StakeManager...');
  const setNFTFactoryTx = await stakeManager.setNFTFactory(await nftFactory.getAddress());
  await setNFTFactoryTx.wait();
  console.log('✅ NFT Factory set in StakeManager');

  // 7. Set StakeManager in NFT Factory
  console.log('\n🔧 Setting StakeManager in NFT Factory...');
  const setStakeManagerTx = await nftFactory.setStakeManager(await stakeManager.getAddress());
  await setStakeManagerTx.wait();
  console.log('✅ StakeManager set in NFT Factory');

  // 8. Set NFT BaseURI
  console.log('\n🔧 Setting NFT BaseURI...');
  const baseURI = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000/api/nft-metadata/";
  const setBaseURITx = await nftFactory.setBaseURI(baseURI);
  await setBaseURITx.wait();
  console.log('✅ NFT BaseURI set to:', baseURI);

  // 9. Verify deployment
  console.log('\n🔍 Verifying deployment...');
  
  // Check versions
  const tokenVersion = await padToken.version();
  const tierVersion = await tierCalculator.version();
  const nftVersion = await nftFactory.version();
  const stakeVersion = await stakeManager.version();
  
  console.log('📊 Contract versions:');
  console.log('  - PADToken:', tokenVersion);
  console.log('  - TierCalculator:', tierVersion);
  console.log('  - NFTFactory:', nftVersion);
  console.log('  - StakeManager:', stakeVersion);
  
  // Check proxy status
  console.log('\n🔍 Verifying proxy status...');
  const tokenImpl = await upgrades.erc1967.getImplementationAddress(await padToken.getAddress());
  const tierImpl = await upgrades.erc1967.getImplementationAddress(await tierCalculator.getAddress());
  const nftImpl = await upgrades.erc1967.getImplementationAddress(await nftFactory.getAddress());
  const stakeImpl = await upgrades.erc1967.getImplementationAddress(await stakeManager.getAddress());
  
  console.log('✅ All contracts are PROXIES:');
  console.log('  - PADToken implementation:', tokenImpl);
  console.log('  - TierCalculator implementation:', tierImpl);
  console.log('  - NFTFactory implementation:', nftImpl);
  console.log('  - StakeManager implementation:', stakeImpl);

  // 10. Test basic functionality
  console.log('\n🧪 Testing basic functionality...');
  
  // Test token
  const totalSupply = await padToken.totalSupply();
  console.log('✅ Token total supply:', ethers.formatEther(totalSupply));
  
  // Test tier calculator
  const bronzeTier = await tierCalculator.getTier(30 * 24 * 60 * 60); // 30 days
  console.log('✅ Bronze tier (30 days):', bronzeTier);
  
  // Test NFT factory
  const currentTokenId = await nftFactory.getCurrentTokenId();
  console.log('✅ NFT current token ID:', currentTokenId.toString());
  
  // Test stake manager
  const stats = await stakeManager.getStatistics();
  console.log('✅ Stake manager stats:', {
    totalStaked: ethers.formatEther(stats[0]),
    totalPositions: stats[1].toString(),
    emergencyPaused: stats[2]
  });

  console.log('\n🎉 ALL CONTRACTS DEPLOYED WITH PROXIES!');
  console.log('\n📋 PROXY Contract Addresses (NEVER CHANGE):');
  console.log('PADToken PROXY:', await padToken.getAddress());
  console.log('TierCalculator PROXY:', await tierCalculator.getAddress());
  console.log('PADNFTFactory PROXY:', await nftFactory.getAddress());
  console.log('StakeManager PROXY:', await stakeManager.getAddress());
  
  console.log('\n🔗 BSC Testnet Explorer: https://testnet.bscscan.com/');
  console.log('\n⚠️  IMPORTANT:');
  console.log('✅ ALL contracts are now PROXIES - can be upgraded without changing addresses');
  console.log('✅ Update frontend config with these NEW proxy addresses');
  console.log('✅ Future updates will only change implementation, not proxy addresses');
  console.log('✅ All existing functionality preserved with upgradeability');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
