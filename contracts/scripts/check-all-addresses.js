const { ethers } = require("hardhat");

async function main() {
  console.log("=== 🔍 ПРОВЕРКА ВСЕХ АДРЕСОВ И СВЯЗЕЙ ===\n");

  // Адреса из config.ts
  const CONTRACT_ADDRESSES = {
    PADToken: "0x6D84688A4734F091cD42F6D998d3F3cB4A990849",
    VoucherTypes: "0x2B8De63Dff3cC60b64F36FCB0E72a4f072818B1F",
    VoucherManager: "0xFe267475409db3703597C230C67Fa7dD36C78A4d",
    MultiStakeManager: "0x8D5b8A4841Ed2Dac943DD01B9E51eCC21E17FaAb",
    PADNFTFactory: "0x7d19632e1b76C0667Db471f61a38E60C7B088579",
  };

  // Адрес пользователя для тестирования
  const USER_ADDRESS = "0x513756b7eD711c472537cb497833c5d5Eb02A3Df";

  try {
    // 1. Проверяем PADToken
    console.log("1. 🔍 Проверяем PADToken...");
    const PADToken = await ethers.getContractAt("PADToken", CONTRACT_ADDRESSES.PADToken);
    const tokenName = await PADToken.name();
    const tokenSymbol = await PADToken.symbol();
    const userBalance = await PADToken.balanceOf(USER_ADDRESS);
    const totalSupply = await PADToken.totalSupply();
    
    console.log(`   ✅ PADToken: ${tokenName} (${tokenSymbol})`);
    console.log(`   📊 Баланс пользователя: ${ethers.formatUnits(userBalance, 18)} PAD`);
    console.log(`   📊 Общий supply: ${ethers.formatUnits(totalSupply, 18)} PAD`);

    // 2. Проверяем MultiStakeManager
    console.log("\n2. 🔍 Проверяем MultiStakeManager...");
    const MultiStakeManager = await ethers.getContractAt("MultiStakeManager", CONTRACT_ADDRESSES.MultiStakeManager);
    const userPositions = await MultiStakeManager.getUserPositions(USER_ADDRESS);
    
    console.log(`   ✅ MultiStakeManager подключен`);
    console.log(`   📊 Позиции пользователя: ${userPositions.length}`);

    // 3. Проверяем VoucherManager
    console.log("\n3. 🔍 Проверяем VoucherManager...");
    const VoucherManager = await ethers.getContractAt("VoucherManager", CONTRACT_ADDRESSES.VoucherManager);
    const userVouchers = await VoucherManager.getUserVoucherIds(USER_ADDRESS);
    
    console.log(`   ✅ VoucherManager подключен`);
    console.log(`   📊 Ваучеры пользователя: ${userVouchers.length}`);

    // 4. Проверяем VoucherTypes
    console.log("\n4. 🔍 Проверяем VoucherTypes...");
    const VoucherTypes = await ethers.getContractAt("VoucherTypes", CONTRACT_ADDRESSES.VoucherTypes);
    const silverVouchers = await VoucherTypes.getVouchersForTier(1);
    const goldVouchers = await VoucherTypes.getVouchersForTier(2);
    
    console.log(`   ✅ VoucherTypes подключен`);
    console.log(`   📊 Ваучеры для Silver: ${silverVouchers.length}`);
    console.log(`   📊 Ваучеры для Gold: ${goldVouchers.length}`);

    // 5. Проверяем PADNFTFactory
    console.log("\n5. 🔍 Проверяем PADNFTFactory...");
    const PADNFTFactory = await ethers.getContractAt("PADNFTFactory", CONTRACT_ADDRESSES.PADNFTFactory);
    const nftName = await PADNFTFactory.name();
    const nftSymbol = await PADNFTFactory.symbol();
    const userNFTs = await PADNFTFactory.balanceOf(USER_ADDRESS);
    
    console.log(`   ✅ PADNFTFactory: ${nftName} (${nftSymbol})`);
    console.log(`   📊 NFT пользователя: ${userNFTs}`);

    // 6. Проверяем Allowance
    console.log("\n6. 🔍 Проверяем Allowance...");
    const allowance = await PADToken.allowance(USER_ADDRESS, CONTRACT_ADDRESSES.MultiStakeManager);
    console.log(`   📊 Allowance для стейкинга: ${ethers.formatUnits(allowance, 18)} PAD`);

    // 7. Проверяем роли
    console.log("\n7. 🔍 Проверяем роли...");
    const hasRole = await MultiStakeManager.hasRole(ethers.ZeroHash, USER_ADDRESS);
    console.log(`   📊 Пользователь имеет роль DEFAULT_ADMIN_ROLE: ${hasRole}`);

    // 8. Проверяем детали первой позиции
    if (userPositions.length > 0) {
      console.log("\n8. 🔍 Проверяем детали первой позиции...");
      const firstPosition = await MultiStakeManager.getPosition(userPositions[0]);
      console.log(`   📊 Позиция ${userPositions[0]}:`, firstPosition);
    }

    // 9. Проверяем детали первого ваучера
    if (userVouchers.length > 0) {
      console.log("\n9. 🔍 Проверяем детали первого ваучера...");
      const firstVoucher = await VoucherManager.getUserVoucher(userVouchers[0]);
      console.log(`   📊 Ваучер ${userVouchers[0]}:`, firstVoucher);
    }

    console.log("\n=== ✅ ПРОВЕРКА ЗАВЕРШЕНА ===");

  } catch (error) {
    console.error("❌ Ошибка при проверке:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
