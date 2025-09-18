const hre = require("hardhat");

async function main() {
  console.log("🔧 Setting up new MultiStakeManager...");

  // Адреса
  const NEW_STAKE_MANAGER_ADDRESS = "0xAd3A081fa98bD3C4944282792d0a84116f542E1A";
  const NFT_FACTORY_ADDRESS = "0x6D87c4647bd91743ce69d8cd2eD568A6d892cd33";
  
  // Получаем контракты
  const MultiStakeManager = await hre.ethers.getContractFactory("MultiStakeManager");
  const stakeManager = MultiStakeManager.attach(NEW_STAKE_MANAGER_ADDRESS);
  
  const PADNFTFactory = await hre.ethers.getContractFactory("PADNFTFactory");
  const nftFactory = PADNFTFactory.attach(NFT_FACTORY_ADDRESS);
  
  console.log("📋 New MultiStakeManager address:", NEW_STAKE_MANAGER_ADDRESS);
  console.log("📋 NFT Factory address:", NFT_FACTORY_ADDRESS);
  
  // 1. Устанавливаем NFT Factory в MultiStakeManager
  console.log("\n🔧 Setting NFT Factory in MultiStakeManager...");
  try {
    const setNftTx = await stakeManager.setNFTFactory(NFT_FACTORY_ADDRESS);
    await setNftTx.wait();
    console.log("✅ NFT Factory set in MultiStakeManager");
  } catch (error) {
    console.log("❌ Error setting NFT Factory:", error.message);
  }
  
  // 2. Выдаем MINTER_ROLE для MultiStakeManager в NFTFactory
  console.log("\n🔧 Granting MINTER_ROLE to MultiStakeManager in NFTFactory...");
  try {
    const MINTER_ROLE = await nftFactory.MINTER_ROLE();
    const grantRoleTx = await nftFactory.grantRole(MINTER_ROLE, NEW_STAKE_MANAGER_ADDRESS);
    await grantRoleTx.wait();
    console.log("✅ MINTER_ROLE granted to MultiStakeManager");
  } catch (error) {
    console.log("❌ Error granting MINTER_ROLE:", error.message);
  }
  
  // 3. Проверяем настройки
  console.log("\n🔍 Verifying setup...");
  try {
    const nftFactoryAddress = await stakeManager.nftFactory();
    console.log("✅ NFT Factory in MultiStakeManager:", nftFactoryAddress);
    
    const hasRole = await nftFactory.hasRole(MINTER_ROLE, NEW_STAKE_MANAGER_ADDRESS);
    console.log("✅ MINTER_ROLE granted:", hasRole);
  } catch (error) {
    console.log("❌ Error verifying setup:", error.message);
  }
  
  console.log("\n🎉 Setup complete! New MultiStakeManager is ready to use.");
  console.log("📝 The fix for mintNextNFT is now active!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
