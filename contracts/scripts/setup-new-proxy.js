const { ethers } = require('hardhat');

async function main() {
  console.log('🔧 Setting up new proxy system...\n');
  
  const [deployer] = await ethers.getSigners();
  console.log('Setting up with account:', deployer.address);
  
  // Адреса нового прокси
  const NEW_PROXY_STAKE_MANAGER = "0xb659680e6bBBaeC3B5148eF89a41975739D10Af5";
  const NFT_FACTORY = "0x6D87c4647bd91743ce69d8cd2eD568A6d892cd33"; // Используем существующий NFT Factory
  
  // Получаем контракты
  const UpgradeableMultiStakeManagerV2 = await ethers.getContractFactory('UpgradeableMultiStakeManagerV2');
  const stakeManagerProxy = UpgradeableMultiStakeManagerV2.attach(NEW_PROXY_STAKE_MANAGER);
  
  const PADNFTFactory = await ethers.getContractFactory('PADNFTFactory');
  const nftFactory = PADNFTFactory.attach(NFT_FACTORY);
  
  console.log('📋 New Proxy Stake Manager:', NEW_PROXY_STAKE_MANAGER);
  console.log('📋 NFT Factory:', NFT_FACTORY);
  
  // 1. Set NFT Factory in Stake Manager
  console.log('\n🔧 Setting NFT Factory in Stake Manager...');
  try {
    const setNftTx = await stakeManagerProxy.setNFTFactory(NFT_FACTORY);
    await setNftTx.wait();
    console.log('✅ NFT Factory set in Stake Manager');
  } catch (error) {
    console.log('❌ Error setting NFT Factory:', error.message);
  }
  
  // 2. Grant MINTER_ROLE to Stake Manager in NFT Factory
  console.log('\n🔧 Granting MINTER_ROLE to Stake Manager in NFT Factory...');
  try {
    const MINTER_ROLE = await nftFactory.MINTER_ROLE();
    const grantRoleTx = await nftFactory.grantRole(MINTER_ROLE, NEW_PROXY_STAKE_MANAGER);
    await grantRoleTx.wait();
    console.log('✅ MINTER_ROLE granted to Stake Manager');
  } catch (error) {
    console.log('❌ Error granting MINTER_ROLE:', error.message);
  }
  
  // 3. Verify setup
  console.log('\n🔍 Verifying setup...');
  try {
    const nftFactoryInStake = await stakeManagerProxy.nftFactory();
    console.log('✅ NFT Factory in Stake Manager:', nftFactoryInStake);
    
    const MINTER_ROLE = await nftFactory.MINTER_ROLE();
    const hasRole = await nftFactory.hasRole(MINTER_ROLE, NEW_PROXY_STAKE_MANAGER);
    console.log('✅ MINTER_ROLE granted:', hasRole);
    
    const version = await stakeManagerProxy.version();
    console.log('✅ Stake Manager version:', version);
  } catch (error) {
    console.log('❌ Error verifying setup:', error.message);
  }
  
  console.log('\n🎉 New proxy system setup complete!');
  console.log('\n📋 Final Proxy Contract Addresses:');
  console.log('PROXY_STAKE_MANAGER:', NEW_PROXY_STAKE_MANAGER);
  console.log('NFT_FACTORY:', NFT_FACTORY);
  console.log('PAD_TOKEN_ADDRESS:', '0xa5d3fF94a7aeDA396666c8978Eec67C209202da0');
  console.log('TIER_CALCULATOR_ADDRESS:', '0x5FbDB2315678afecb367f032d93F642f64180aa3');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
