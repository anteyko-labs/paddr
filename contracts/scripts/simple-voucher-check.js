const { ethers } = require("hardhat");

async function main() {
  console.log("=== 🎫 ПРОСТАЯ ПРОВЕРКА ВАУЧЕРОВ ===\n");

  try {
    // Загружаем адреса контрактов
    const CONTRACT_ADDRESSES = {
      VoucherTypes: "0x2B8De63Dff3cC60b64F36FCB0E72a4f072818B1F",
    };

    console.log("Адрес VoucherTypes:", CONTRACT_ADDRESSES.VoucherTypes);

    // Подключаемся к контракту
    const VoucherTypes = await ethers.getContractAt("VoucherTypes", CONTRACT_ADDRESSES.VoucherTypes);
    console.log("✅ Контракт VoucherTypes подключен!");

    // Проверяем ваучеры для Silver (tier 1)
    console.log("\n=== 🥈 SILVER (Tier 1) ===");
    const silverVouchers = await VoucherTypes.getVouchersForTier(1);
    console.log(`Количество ваучеров для Silver: ${silverVouchers.length}`);
    
    for (let i = 0; i < silverVouchers.length; i++) {
      const voucherInfo = await VoucherTypes.getVoucherInfo(silverVouchers[i]);
      console.log(`${i + 1}. ${voucherInfo.description}`);
    }

    // Проверяем ваучеры для Gold (tier 2)
    console.log("\n=== 🥇 GOLD (Tier 2) ===");
    const goldVouchers = await VoucherTypes.getVouchersForTier(2);
    console.log(`Количество ваучеров для Gold: ${goldVouchers.length}`);
    
    for (let i = 0; i < goldVouchers.length; i++) {
      const voucherInfo = await VoucherTypes.getVoucherInfo(goldVouchers[i]);
      console.log(`${i + 1}. ${voucherInfo.description}`);
    }

  } catch (error) {
    console.error("❌ Ошибка:", error.message);
  }

  console.log("\n=== ✅ ПРОВЕРКА ЗАВЕРШЕНА ===");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
