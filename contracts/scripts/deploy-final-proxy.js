const { ethers, upgrades } = require('hardhat');

async function main() {
  console.log('🚀 Deploying final proxy system...\n');
  
  const [deployer] = await ethers.getSigners();
  console.log('Deploying with account:', deployer.address);
  console.log('Account balance:', ethers.formatEther(await deployer.provider.getBalance(deployer.address)), 'ETH\n');
  
  // Используем существующие контракты
  const PAD_TOKEN_ADDRESS = "0xa5d3fF94a7aeDA396666c8978Eec67C209202da0";
  const TIER_CALCULATOR_ADDRESS = "0xbe75B8781A9A9E7217E0FEd558CfC68dA6f82644"; // Новый TierCalculator
  const NFT_FACTORY_ADDRESS = "0x6D87c4647bd91743ce69d8cd2eD568A6d892cd33"; // Существующий NFT Factory
  
  // Deploy UpgradeableMultiStakeManagerV2 as proxy
  console.log('📦 Deploying UpgradeableMultiStakeManagerV2 as proxy...');
  const UpgradeableMultiStakeManagerV2 = await ethers.getContractFactory('UpgradeableMultiStakeManagerV2');
  
  const stakeManagerProxy = await upgrades.deployProxy(
    UpgradeableMultiStakeManagerV2,
    [PAD_TOKEN_ADDRESS, TIER_CALCULATOR_ADDRESS],
    { 
      initializer: 'initialize',
      kind: 'transparent'
    }
  );
  await stakeManagerProxy.waitForDeployment();
  const stakeManagerAddress = await stakeManagerProxy.getAddress();
  console.log('✅ UpgradeableMultiStakeManagerV2 proxy deployed to:', stakeManagerAddress);
  
  // Set NFT Factory in Stake Manager
  console.log('\n🔧 Setting NFT Factory in Stake Manager...');
  const setNftTx = await stakeManagerProxy.setNFTFactory(NFT_FACTORY_ADDRESS);
  await setNftTx.wait();
  console.log('✅ NFT Factory set in Stake Manager');
  
  // Grant MINTER_ROLE to Stake Manager in NFT Factory
  console.log('\n🔧 Granting MINTER_ROLE to Stake Manager in NFT Factory...');
  const PADNFTFactory = await ethers.getContractFactory('PADNFTFactory');
  const nftFactory = PADNFTFactory.attach(NFT_FACTORY_ADDRESS);
  const MINTER_ROLE = await nftFactory.MINTER_ROLE();
  const grantRoleTx = await nftFactory.grantRole(MINTER_ROLE, stakeManagerAddress);
  await grantRoleTx.wait();
  console.log('✅ MINTER_ROLE granted to Stake Manager');
  
  // Verify setup
  console.log('\n🔍 Verifying setup...');
  try {
    const nftFactoryInStake = await stakeManagerProxy.nftFactory();
    console.log('✅ NFT Factory in Stake Manager:', nftFactoryInStake);
    
    const hasRole = await nftFactory.hasRole(MINTER_ROLE, stakeManagerAddress);
    console.log('✅ MINTER_ROLE granted:', hasRole);
    
    const version = await stakeManagerProxy.version();
    console.log('✅ Stake Manager version:', version);
    
    const rewardInterval = await stakeManagerProxy.REWARD_INTERVAL();
    console.log('✅ Reward interval:', Number(rewardInterval) / 60, 'minutes');
  } catch (error) {
    console.log('❌ Error verifying setup:', error.message);
  }
  
  console.log('\n🎉 Final proxy system deployment complete!');
  console.log('\n📋 Final Contract Addresses:');
  console.log('FINAL_PROXY_STAKE_MANAGER:', stakeManagerAddress);
  console.log('NFT_FACTORY:', NFT_FACTORY_ADDRESS);
  console.log('PAD_TOKEN_ADDRESS:', PAD_TOKEN_ADDRESS);
  console.log('TIER_CALCULATOR_ADDRESS:', TIER_CALCULATOR_ADDRESS);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
