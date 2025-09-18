const hre = require("hardhat");

async function main() {
  console.log("🔄 Updating MultiStakeManager with fixed mintNextNFT function...");

  // Адрес существующего контракта
  const STAKE_MANAGER_ADDRESS = "0x58aeA581CA3C470C4f2B1A5DDC251b106Dd363c2";
  
  // Получаем контракт
  const MultiStakeManager = await hre.ethers.getContractFactory("MultiStakeManager");
  const stakeManager = MultiStakeManager.attach(STAKE_MANAGER_ADDRESS);
  
  console.log("📋 Current MultiStakeManager address:", STAKE_MANAGER_ADDRESS);
  
  // Проверяем что контракт работает
  try {
    const DEFAULT_ADMIN_ROLE = await stakeManager.DEFAULT_ADMIN_ROLE();
    console.log("✅ Contract DEFAULT_ADMIN_ROLE:", DEFAULT_ADMIN_ROLE);
  } catch (error) {
    console.log("❌ Error accessing contract:", error.message);
    return;
  }
  
  console.log("\n🚀 Deploying new MultiStakeManager with fix...");
  
  // Деплоим новый контракт
  const padTokenAddress = "0xa5d3fF94a7aeDA396666c8978Eec67C209202da0";
  
  const newMultiStakeManager = await MultiStakeManager.deploy(
    padTokenAddress
  );
  await newMultiStakeManager.waitForDeployment();
  const newAddress = await newMultiStakeManager.getAddress();
  
  console.log("✅ New MultiStakeManager deployed to:", newAddress);
  
  // Проверяем что новый контракт работает
  try {
    const DEFAULT_ADMIN_ROLE = await newMultiStakeManager.DEFAULT_ADMIN_ROLE();
    console.log("✅ New contract DEFAULT_ADMIN_ROLE:", DEFAULT_ADMIN_ROLE);
  } catch (error) {
    console.log("❌ Error accessing new contract:", error.message);
  }
  
  console.log("\n📝 IMPORTANT: Update the address in lib/contracts/config.ts");
  console.log("Change MULTI_STAKE_MANAGER_ADDRESS to:", newAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
