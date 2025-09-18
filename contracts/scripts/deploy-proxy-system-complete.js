const { ethers, upgrades } = require('hardhat');

async function main() {
  console.log('🚀 Deploying complete proxy system...\n');
  
  const [deployer] = await ethers.getSigners();
  console.log('Deploying with account:', deployer.address);
  console.log('Account balance:', ethers.formatEther(await deployer.provider.getBalance(deployer.address)), 'ETH\n');
  
  // 1. Deploy PADToken (if not exists)
  console.log('📦 Deploying PADToken...');
  const PADToken = await ethers.getContractFactory('PADToken');
  const padToken = await PADToken.deploy();
  await padToken.waitForDeployment();
  const padTokenAddress = await padToken.getAddress();
  console.log('✅ PADToken deployed to:', padTokenAddress);
  
  // 2. Deploy TierCalculator (if not exists)
  console.log('\n📦 Deploying TierCalculator...');
  const TierCalculator = await ethers.getContractFactory('TierCalculator');
  const tierCalculator = await TierCalculator.deploy();
  await tierCalculator.waitForDeployment();
  const tierCalculatorAddress = await tierCalculator.getAddress();
  console.log('✅ TierCalculator deployed to:', tierCalculatorAddress);
  
  // 3. Deploy UpgradeableMultiStakeManagerV2 as proxy
  console.log('\n📦 Deploying UpgradeableMultiStakeManagerV2 as proxy...');
  const UpgradeableMultiStakeManagerV2 = await ethers.getContractFactory('UpgradeableMultiStakeManagerV2');
  
  const stakeManagerProxy = await upgrades.deployProxy(
    UpgradeableMultiStakeManagerV2,
    [padTokenAddress, tierCalculatorAddress],
    { 
      initializer: 'initialize',
      kind: 'transparent'
    }
  );
  await stakeManagerProxy.waitForDeployment();
  const stakeManagerAddress = await stakeManagerProxy.getAddress();
  console.log('✅ UpgradeableMultiStakeManagerV2 proxy deployed to:', stakeManagerAddress);
  
  // 4. Deploy PADNFTFactory (if not exists)
  console.log('\n📦 Deploying PADNFTFactory...');
  const PADNFTFactory = await ethers.getContractFactory('PADNFTFactory');
  const nftFactory = await PADNFTFactory.deploy(stakeManagerAddress, tierCalculatorAddress);
  await nftFactory.waitForDeployment();
  const nftFactoryAddress = await nftFactory.getAddress();
  console.log('✅ PADNFTFactory deployed to:', nftFactoryAddress);
  
  // 5. Grant DEFAULT_ADMIN_ROLE to deployer
  console.log('\n🔧 Granting DEFAULT_ADMIN_ROLE to deployer...');
  const DEFAULT_ADMIN_ROLE = await stakeManagerProxy.DEFAULT_ADMIN_ROLE();
  const grantAdminTx = await stakeManagerProxy.grantRole(DEFAULT_ADMIN_ROLE, deployer.address);
  await grantAdminTx.wait();
  console.log('✅ DEFAULT_ADMIN_ROLE granted to deployer');
  
  // 6. Set NFT Factory in Stake Manager
  console.log('\n🔧 Setting NFT Factory in Stake Manager...');
  const setNftTx = await stakeManagerProxy.setNFTFactory(nftFactoryAddress);
  await setNftTx.wait();
  console.log('✅ NFT Factory set in Stake Manager');
  
  // 7. Grant MINTER_ROLE to Stake Manager in NFT Factory
  console.log('\n🔧 Granting MINTER_ROLE to Stake Manager in NFT Factory...');
  const MINTER_ROLE = await nftFactory.MINTER_ROLE();
  const grantRoleTx = await nftFactory.grantRole(MINTER_ROLE, stakeManagerAddress);
  await grantRoleTx.wait();
  console.log('✅ MINTER_ROLE granted to Stake Manager');
  
  // 8. Deploy VoucherManager (if not exists)
  console.log('\n📦 Deploying VoucherManager...');
  const VoucherManager = await ethers.getContractFactory('VoucherManager');
  const voucherManager = await VoucherManager.deploy();
  await voucherManager.waitForDeployment();
  const voucherManagerAddress = await voucherManager.getAddress();
  console.log('✅ VoucherManager deployed to:', voucherManagerAddress);
  
  // 9. Verify setup
  console.log('\n🔍 Verifying setup...');
  try {
    const nftFactoryInStake = await stakeManagerProxy.nftFactory();
    console.log('✅ NFT Factory in Stake Manager:', nftFactoryInStake);
    
    const hasRole = await nftFactory.hasRole(MINTER_ROLE, stakeManagerAddress);
    console.log('✅ MINTER_ROLE granted:', hasRole);
    
    const version = await stakeManagerProxy.version();
    console.log('✅ Stake Manager version:', version);
  } catch (error) {
    console.log('❌ Error verifying setup:', error.message);
  }
  
  console.log('\n🎉 Proxy system deployment complete!');
  console.log('\n📋 Contract Addresses:');
  console.log('PAD_TOKEN_ADDRESS:', padTokenAddress);
  console.log('TIER_CALCULATOR_ADDRESS:', tierCalculatorAddress);
  console.log('MULTI_STAKE_MANAGER_ADDRESS:', stakeManagerAddress);
  console.log('PAD_NFT_FACTORY_ADDRESS:', nftFactoryAddress);
  console.log('VOUCHER_MANAGER_ADDRESS:', voucherManagerAddress);
  
  console.log('\n📝 Update these addresses in lib/contracts/config.ts');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
