const { ethers } = require("hardhat");

async function main() {
  console.log("=== 🔍 ОТЛАДКА ФРОНТЕНДА И ПРОВЕРКА ДАННЫХ ===\n");

  // Получаем аккаунты
  const accounts = await ethers.getSigners();
  const deployer = accounts[0];
  
  console.log("👤 Deployer:", deployer.address);
  console.log("");

  // Загружаем адреса контрактов
  const CONTRACT_ADDRESSES = {
    PADToken: "0x6D84688A4734F091cD42F6D998d3F3cB4A990849",
    MultiStakeManager: "0x8D5b8A4841Ed2Dac943DD01B9E51eCC21E17FaAb",
    VoucherManager: "0xFe267475409db3703597C230C67Fa7dD36C78A4d",
    PADNFTFactory: "0x7d19632e1b76C0667Db471f61a38E60C7B088579",
  };

  // Подключаемся к контрактам
  const PADToken = await ethers.getContractAt("PADToken", CONTRACT_ADDRESSES.PADToken);
  const MultiStakeManager = await ethers.getContractAt("MultiStakeManager", CONTRACT_ADDRESSES.MultiStakeManager);
  const VoucherManager = await ethers.getContractAt("VoucherManager", CONTRACT_ADDRESSES.VoucherManager);

  console.log("✅ Контракты подключены успешно!\n");

  // === ПРОВЕРЯЕМ БАЛАНС И ALLOWANCE ===
  console.log("=== 💰 БАЛАНС И ALLOWANCE ===");
  const balance = await PADToken.balanceOf(deployer.address);
  const allowance = await PADToken.allowance(deployer.address, CONTRACT_ADDRESSES.MultiStakeManager);
  
  console.log(`Баланс PAD: ${ethers.formatEther(balance)} PAD`);
  console.log(`Allowance: ${ethers.formatEther(allowance)} PAD`);
  console.log("");

  // === ПРОВЕРЯЕМ ПОЗИЦИИ ПОЛЬЗОВАТЕЛЯ ===
  console.log("=== 📊 ПОЗИЦИИ ПОЛЬЗОВАТЕЛЯ ===");
  try {
    const userPositions = await MultiStakeManager.getUserPositions(deployer.address);
    console.log(`Количество позиций: ${userPositions.length}`);
    
    if (userPositions.length > 0) {
      console.log("ID позиций:", userPositions.map(id => id.toString()));
      
      // Получаем детали каждой позиции
      for (let i = 0; i < Math.min(userPositions.length, 3); i++) {
        const positionId = userPositions[i];
        console.log(`\n--- Позиция ${positionId.toString()} ---`);
        
        try {
          const position = await MultiStakeManager.getPosition(positionId);
          console.log("ID:", position.id.toString());
          console.log("Owner:", position.owner);
          console.log("Amount:", ethers.formatEther(position.amount), "PAD");
          console.log("Tier:", position.tier.toString());
          console.log("Start Time:", new Date(Number(position.startTime) * 1000).toLocaleString());
          console.log("End Time:", new Date(Number(position.endTime) * 1000).toLocaleString());
          console.log("Is Active:", position.isActive);
          console.log("Next Mint On:", new Date(Number(position.nextMintOn) * 1000).toLocaleString());
          console.log("Month Index:", position.monthIndex.toString());
        } catch (error) {
          console.log(`❌ Ошибка при получении позиции ${positionId}:`, error.message);
        }
      }
    } else {
      console.log("❌ У пользователя нет позиций");
    }
  } catch (error) {
    console.log("❌ Ошибка при получении позиций:", error.message);
  }
  console.log("");

  // === ПРОВЕРЯЕМ ВАУЧЕРЫ ПОЛЬЗОВАТЕЛЯ ===
  console.log("=== 🎫 ВАУЧЕРЫ ПОЛЬЗОВАТЕЛЯ ===");
  try {
    const userVoucherIds = await VoucherManager.getUserVoucherIds(deployer.address);
    console.log(`Количество ваучеров: ${userVoucherIds.length}`);
    
    if (userVoucherIds.length > 0) {
      console.log("ID ваучеров:", userVoucherIds.map(id => id.toString()));
      
      // Получаем детали первого ваучера
      const firstVoucherId = userVoucherIds[0];
      console.log(`\n--- Ваучер ${firstVoucherId.toString()} ---`);
      
      try {
        const voucher = await VoucherManager.getUserVoucher(firstVoucherId);
        console.log("Voucher Type ID:", voucher.voucherTypeId.toString());
        console.log("Position ID:", voucher.positionId.toString());
        console.log("Tier:", voucher.tier.toString());
        console.log("Issued At:", new Date(Number(voucher.issuedAt) * 1000).toLocaleString());
        console.log("Used At:", voucher.usedAt.toString() === "0" ? "Не использован" : new Date(Number(voucher.usedAt) * 1000).toLocaleString());
        console.log("Usage Count:", voucher.usageCount.toString());
        console.log("Max Uses:", voucher.maxUses.toString());
        console.log("Is Active:", voucher.isActive);
        console.log("Voucher Code:", voucher.voucherCode);
      } catch (error) {
        console.log(`❌ Ошибка при получении ваучера ${firstVoucherId}:`, error.message);
      }
    } else {
      console.log("❌ У пользователя нет ваучеров");
    }
  } catch (error) {
    console.log("❌ Ошибка при получении ваучеров:", error.message);
  }
  console.log("");

  // === ПРОВЕРЯЕМ TIER LEVELS ===
  console.log("=== 🏆 TIER LEVELS ===");
  try {
    const tierCount = await MultiStakeManager.getTierCount();
    console.log(`Количество тиров: ${tierCount}`);
    
    for (let i = 0; i < Number(tierCount); i++) {
      try {
        const tierInfo = await MultiStakeManager.getTierInfo(i);
        console.log(`\n--- Tier ${i} ---`);
        console.log("Name:", tierInfo.name);
        console.log("Min Amount:", ethers.formatEther(tierInfo.minAmount), "PAD");
        console.log("Max Amount:", ethers.formatEther(tierInfo.maxAmount), "PAD");
      } catch (error) {
        console.log(`❌ Ошибка при получении тира ${i}:`, error.message);
      }
    }
  } catch (error) {
    console.log("❌ Ошибка при получении тиров:", error.message);
  }
  console.log("");

  // === ПРОВЕРЯЕМ ОБЩУЮ СТАТИСТИКУ ===
  console.log("=== 📈 ОБЩАЯ СТАТИСТИКА ===");
  try {
    const totalStaked = await MultiStakeManager.getTotalStaked(deployer.address);
    console.log(`Общая сумма в стейкинге: ${ethers.formatEther(totalStaked)} PAD`);
  } catch (error) {
    console.log("❌ Ошибка при получении общей статистики:", error.message);
  }
  console.log("");

  console.log("=== ✅ ОТЛАДКА ЗАВЕРШЕНА ===");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
