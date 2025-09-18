const { ethers, upgrades } = require('hardhat');

async function main() {
  console.log('🔄 Upgrading existing proxy...\n');
  
  const [deployer] = await ethers.getSigners();
  console.log('Upgrading with account:', deployer.address);
  
  // Адрес существующего прокси
  const PROXY_ADDRESS = "0xb659680e6bBBaeC3B5148eF89a41975739D10Af5";
  
  // Получаем новую реализацию
  const UpgradeableMultiStakeManagerV2 = await ethers.getContractFactory('UpgradeableMultiStakeManagerV2');
  
  console.log('📋 Current proxy address:', PROXY_ADDRESS);
  
  // Проверяем текущую реализацию
  try {
    const currentImplementation = await upgrades.erc1967.getImplementationAddress(PROXY_ADDRESS);
    console.log('📋 Current implementation:', currentImplementation);
  } catch (error) {
    console.log('⚠️  Could not get current implementation address');
  }
  
  // Обновляем прокси
  console.log('\n🔄 Upgrading proxy to new implementation...');
  const upgradedContract = await upgrades.upgradeProxy(PROXY_ADDRESS, UpgradeableMultiStakeManagerV2);
  await upgradedContract.waitForDeployment();
  
  // Получаем новый адрес реализации
  const newImplementation = await upgrades.erc1967.getImplementationAddress(PROXY_ADDRESS);
  console.log('✅ New implementation address:', newImplementation);
  
  // Проверяем что обновление прошло успешно
  try {
    const version = await upgradedContract.version();
    console.log('✅ Contract version:', version);
  } catch (error) {
    console.log('❌ Error checking version:', error.message);
  }
  
  console.log('\n🎉 Proxy upgrade complete!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
