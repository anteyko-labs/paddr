const { ethers, upgrades } = require('hardhat');

async function main() {
  console.log('🚀 Deploying new proxy with correct initialization...\n');
  
  const [deployer] = await ethers.getSigners();
  console.log('Deploying with account:', deployer.address);
  console.log('Account balance:', ethers.formatEther(await deployer.provider.getBalance(deployer.address)), 'ETH\n');
  
  // Используем существующие контракты
  const PAD_TOKEN_ADDRESS = "0xa5d3fF94a7aeDA396666c8978Eec67C209202da0";
  const TIER_CALCULATOR_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  
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
  
  // Проверяем права
  console.log('\n🔍 Checking permissions...');
  try {
    const DEFAULT_ADMIN_ROLE = await stakeManagerProxy.DEFAULT_ADMIN_ROLE();
    const hasAdminRole = await stakeManagerProxy.hasRole(DEFAULT_ADMIN_ROLE, deployer.address);
    console.log('✅ Has DEFAULT_ADMIN_ROLE:', hasAdminRole);
    
    const ADMIN_ROLE = await stakeManagerProxy.ADMIN_ROLE();
    const hasAdminRole2 = await stakeManagerProxy.hasRole(ADMIN_ROLE, deployer.address);
    console.log('✅ Has ADMIN_ROLE:', hasAdminRole2);
  } catch (error) {
    console.log('❌ Error checking permissions:', error.message);
  }
  
  // Проверяем версию
  try {
    const version = await stakeManagerProxy.version();
    console.log('✅ Contract version:', version);
  } catch (error) {
    console.log('❌ Error checking version:', error.message);
  }
  
  console.log('\n🎉 New proxy deployment complete!');
  console.log('\n📋 New Proxy Address:');
  console.log('NEW_PROXY_STAKE_MANAGER:', stakeManagerAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
