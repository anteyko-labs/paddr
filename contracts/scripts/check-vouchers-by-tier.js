const { ethers } = require("hardhat");

async function main() {
  console.log("=== 🎫 ПРОВЕРКА ВАУЧЕРОВ ПО ТИРАМ ===\n");

  // Загружаем адреса контрактов
  const CONTRACT_ADDRESSES = {
    VoucherTypes: "0x2B8De63Dff3cC60b64F36FCB0E72a4f072818B1F", // Правильный адрес из config.ts
  };

  // Подключаемся к контракту
  const VoucherTypes = await ethers.getContractAt("VoucherTypes", CONTRACT_ADDRESSES.VoucherTypes);

  console.log("✅ Контракт VoucherTypes подключен!");

  // Определяем тиры
  const tiers = [
    { id: 0, name: "Bronze" },
    { id: 1, name: "Silver" },
    { id: 2, name: "Gold" },
    { id: 3, name: "Platinum" }
  ];

  // Проверяем ваучеры для каждого тира
  for (const tier of tiers) {
    console.log(`\n=== 🏆 ${tier.name.toUpperCase()} (Tier ${tier.id}) ===`);
    
    try {
      // Получаем все ваучеры для этого тира
      const vouchers = await VoucherTypes.getVouchersForTier(tier.id);
      
      console.log(`Количество доступных ваучеров: ${vouchers.length}`);
      
      if (vouchers.length > 0) {
        console.log("Доступные ваучеры:");
        
        for (let i = 0; i < vouchers.length; i++) {
          const voucherType = vouchers[i];
          const voucherInfo = await VoucherTypes.getVoucherInfo(voucherType);
          
          console.log(`  ${i + 1}. ${voucherInfo.description}`);
          console.log(`     - Тип: ${getVoucherTypeName(voucherType)}`);
          console.log(`     - Категория: ${getCategoryName(voucherInfo.category)}`);
          console.log(`     - Минимальный тир: ${voucherInfo.tier}`);
          console.log(`     - Максимум использований: ${voucherInfo.maxUses === 999999 ? 'Безлимитно' : voucherInfo.maxUses}`);
          console.log(`     - Значение: ${voucherInfo.value}`);
          console.log(`     - Активен во время стейкинга: ${voucherInfo.maxUses === 999999 ? 'Да' : 'Нет'}`);
          console.log("");
        }
      }
    } catch (error) {
      console.log(`❌ Ошибка при получении ваучеров для ${tier.name}:`, error.message);
    }
  }

  console.log("\n=== ✅ ПРОВЕРКА ЗАВЕРШЕНА ===");
}

// Функции для получения названий
function getVoucherTypeName(type) {
  const names = [
    "CAR_RENTAL_DISCOUNT_5",
    "FREE_RENTAL_HOURS", 
    "RENTAL_COUPON",
    "CAR_SERVICE_DISCOUNT",
    "RESTAURANT_DISCOUNT",
    "CAR_WASH",
    "UNLIMITED_MILEAGE",
    "PREMIUM_PROTECTION",
    "PRIORITY_BOOKING",
    "CAR_UPGRADE",
    "CHAUFFEUR_SERVICE",
    "FREE_UAE_DELIVERY",
    "LAMBORGHINI_RENTAL",
    "WEEKEND_HOTEL_CAR",
    "YACHT_PRIVATE_TOUR"
  ];
  return names[type] || `Unknown(${type})`;
}

function getCategoryName(category) {
  const names = ["ONE_TIME", "MULTI_USE", "STAKING_PERIOD"];
  return names[category] || `Unknown(${category})`;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
