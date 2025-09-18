const { ethers } = require("hardhat");

async function main() {
  console.log("=== 🔧 ИСПРАВЛЕНИЕ РОЛЕЙ МЕЖДУ КОНТРАКТАМИ ===\n");

  // Получаем аккаунты
  const accounts = await ethers.getSigners();
  const deployer = accounts[0];
  
  console.log("👤 Deployer:", deployer.address);
  console.log("");

  // Загружаем адреса контрактов из конфигурации фронтенда
  const CONTRACT_ADDRESSES = {
    PADToken: "0x6D84688A4734F091cD42F6D998d3F3cB4A990849",
    VoucherTypes: "0x2B8De63Dff3cC60b64F36FCB0E72a4f072818B1F",
    VoucherManager: "0xFe267475409db3703597C230C67Fa7dD36C78A4d",
    MultiStakeManager: "0x8D5b8A4841Ed2Dac943DD01B9E51eCC21E17FaAb",
    PADNFTFactory: "0x7d19632e1b76C0667Db471f61a38E60C7B088579",
  };

  console.log("🔗 Адреса контрактов:");
  Object.entries(CONTRACT_ADDRESSES).forEach(([name, address]) => {
    console.log(`  ${name}: ${address}`);
  });
  console.log("");

  // Подключаемся к контрактам
  const VoucherManager = await ethers.getContractAt("VoucherManager", CONTRACT_ADDRESSES.VoucherManager);
  const MultiStakeManager = await ethers.getContractAt("MultiStakeManager", CONTRACT_ADDRESSES.MultiStakeManager);
  const PADNFTFactory = await ethers.getContractAt("PADNFTFactory", CONTRACT_ADDRESSES.PADNFTFactory);

  console.log("✅ Контракты подключены успешно!\n");

  // === ПРОВЕРЯЕМ ТЕКУЩИЕ РОЛИ ===
  console.log("=== 🔍 ПРОВЕРКА ТЕКУЩИХ РОЛЕЙ ===");
  
  // Проверяем роли в VoucherManager
  const VOUCHER_ADMIN_ROLE = await VoucherManager.ADMIN_ROLE();
  const hasVoucherAdminRole = await VoucherManager.hasRole(VOUCHER_ADMIN_ROLE, CONTRACT_ADDRESSES.MultiStakeManager);
  console.log(`MultiStakeManager имеет ADMIN_ROLE в VoucherManager: ${hasVoucherAdminRole}`);
  
  // Проверяем роли в PADNFTFactory
  const NFT_MINTER_ROLE = await PADNFTFactory.MINTER_ROLE();
  const hasNFTMinterRole = await PADNFTFactory.hasRole(NFT_MINTER_ROLE, CONTRACT_ADDRESSES.MultiStakeManager);
  console.log(`MultiStakeManager имеет MINTER_ROLE в PADNFTFactory: ${hasNFTMinterRole}`);
  console.log("");

  // === ИСПРАВЛЯЕМ РОЛИ ===
  console.log("=== 🔧 ИСПРАВЛЕНИЕ РОЛЕЙ ===");
  
  // 1. Даем MultiStakeManager роль ADMIN_ROLE в VoucherManager
  if (!hasVoucherAdminRole) {
    console.log("1️⃣ Даем MultiStakeManager роль ADMIN_ROLE в VoucherManager...");
    try {
      const grantVoucherRoleTx = await VoucherManager.grantRole(VOUCHER_ADMIN_ROLE, CONTRACT_ADDRESSES.MultiStakeManager);
      console.log("   Транзакция отправлена:", grantVoucherRoleTx.hash);
      
      const grantVoucherRoleReceipt = await grantVoucherRoleTx.wait();
      console.log("   ✅ Роль ADMIN_ROLE выдана в блоке:", grantVoucherRoleReceipt.blockNumber);
    } catch (error) {
      console.error("   ❌ Ошибка при выдаче роли ADMIN_ROLE:", error.message);
    }
  } else {
    console.log("1️⃣ MultiStakeManager уже имеет роль ADMIN_ROLE в VoucherManager");
  }
  console.log("");

  // 2. Даем MultiStakeManager роль MINTER_ROLE в PADNFTFactory
  if (!hasNFTMinterRole) {
    console.log("2️⃣ Даем MultiStakeManager роль MINTER_ROLE в PADNFTFactory...");
    try {
      const grantNFTRoleTx = await PADNFTFactory.grantRole(NFT_MINTER_ROLE, CONTRACT_ADDRESSES.MultiStakeManager);
      console.log("   Транзакция отправлена:", grantNFTRoleTx.hash);
      
      const grantNFTRoleReceipt = await grantNFTRoleTx.wait();
      console.log("   ✅ Роль MINTER_ROLE выдана в блоке:", grantNFTRoleReceipt.blockNumber);
    } catch (error) {
      console.error("   ❌ Ошибка при выдаче роли MINTER_ROLE:", error.message);
    }
  } else {
    console.log("2️⃣ MultiStakeManager уже имеет роль MINTER_ROLE в PADNFTFactory");
  }
  console.log("");

  // === ПРОВЕРЯЕМ РЕЗУЛЬТАТ ===
  console.log("=== ✅ ПРОВЕРКА РЕЗУЛЬТАТА ===");
  
  const finalVoucherAdminRole = await VoucherManager.hasRole(VOUCHER_ADMIN_ROLE, CONTRACT_ADDRESSES.MultiStakeManager);
  const finalNFTMinterRole = await PADNFTFactory.hasRole(NFT_MINTER_ROLE, CONTRACT_ADDRESSES.MultiStakeManager);
  
  console.log(`MultiStakeManager имеет ADMIN_ROLE в VoucherManager: ${finalVoucherAdminRole}`);
  console.log(`MultiStakeManager имеет MINTER_ROLE в PADNFTFactory: ${finalNFTMinterRole}`);
  
  if (finalVoucherAdminRole && finalNFTMinterRole) {
    console.log("\n🎉 Все роли настроены правильно! Теперь стейкинг должен работать.");
  } else {
    console.log("\n⚠️ Не все роли настроены. Проверьте ошибки выше.");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
