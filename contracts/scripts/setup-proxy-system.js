const { ethers } = require('hardhat');

async function main() {
  console.log('🔧 Setting up proxy system...\n');
  
  const [deployer] = await ethers.getSigners();
  console.log('Setting up with account:', deployer.address);
  
  // Адреса прокси контрактов
  const PROXY_STAKE_MANAGER = "0x3DA6D27586A8Bac0e4Cb624D3cDf68FA75C8844C";
  const NFT_FACTORY = "0x17435f61B0e8501E5Ea824Dc8A246Add37443869";
  
  // Получаем контракты
  const UpgradeableMultiStakeManagerV2 = await ethers.getContractFactory('UpgradeableMultiStakeManagerV2');
  const stakeManagerProxy = UpgradeableMultiStakeManagerV2.attach(PROXY_STAKE_MANAGER);
  
  const PADNFTFactory = await ethers.getContractFactory('PADNFTFactory');
  const nftFactory = PADNFTFactory.attach(NFT_FACTORY);
  
  console.log('📋 Proxy Stake Manager:', PROXY_STAKE_MANAGER);
  console.log('📋 NFT Factory:', NFT_FACTORY);
  
  // 1. Проверяем текущие права
  console.log('\n🔍 Checking current permissions...');
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
  
  // 2. Set NFT Factory in Stake Manager
  console.log('\n🔧 Setting NFT Factory in Stake Manager...');
  try {
    const setNftTx = await stakeManagerProxy.setNFTFactory(NFT_FACTORY);
    await setNftTx.wait();
    console.log('✅ NFT Factory set in Stake Manager');
  } catch (error) {
    console.log('❌ Error setting NFT Factory:', error.message);
  }
  
  // 3. Grant MINTER_ROLE to Stake Manager in NFT Factory
  console.log('\n🔧 Granting MINTER_ROLE to Stake Manager in NFT Factory...');
  try {
    const MINTER_ROLE = await nftFactory.MINTER_ROLE();
    const grantRoleTx = await nftFactory.grantRole(MINTER_ROLE, PROXY_STAKE_MANAGER);
    await grantRoleTx.wait();
    console.log('✅ MINTER_ROLE granted to Stake Manager');
  } catch (error) {
    console.log('❌ Error granting MINTER_ROLE:', error.message);
  }
  
  // 4. Verify setup
  console.log('\n🔍 Verifying setup...');
  try {
    const nftFactoryInStake = await stakeManagerProxy.nftFactory();
    console.log('✅ NFT Factory in Stake Manager:', nftFactoryInStake);
    
    const MINTER_ROLE = await nftFactory.MINTER_ROLE();
    const hasRole = await nftFactory.hasRole(MINTER_ROLE, PROXY_STAKE_MANAGER);
    console.log('✅ MINTER_ROLE granted:', hasRole);
    
    const version = await stakeManagerProxy.version();
    console.log('✅ Stake Manager version:', version);
  } catch (error) {
    console.log('❌ Error verifying setup:', error.message);
  }
  
  console.log('\n🎉 Proxy system setup complete!');
  console.log('\n📋 Proxy Contract Addresses:');
  console.log('PROXY_STAKE_MANAGER:', PROXY_STAKE_MANAGER);
  console.log('NFT_FACTORY:', NFT_FACTORY);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
