const { ethers } = require("hardhat");

async function main() {
  console.log("=== 🚀 ТЕСТОВЫЙ СТЕЙКИНГ ЧЕРЕЗ СКРИПТ ===\n");

  // Адреса из config.ts
  const CONTRACT_ADDRESSES = {
    PADToken: "0x6D84688A4734F091cD42F6D998d3F3cB4A990849",
    MultiStakeManager: "0x8D5b8A4841Ed2Dac943DD01B9E51eCC21E17FaAb",
  };

  // Адрес пользователя для тестирования
  const USER_ADDRESS = "0x513756b7eD711c472537cb497833c5d5Eb02A3Df";

  try {
    // Получаем подписантов
    const [deployer] = await ethers.getSigners();
    console.log("🔑 Подписант:", deployer.address);

    // 1. Проверяем баланс до стейкинга
    console.log("\n1. 🔍 Проверяем состояние ДО стейкинга...");
    const PADToken = await ethers.getContractAt("PADToken", CONTRACT_ADDRESSES.PADToken);
    const MultiStakeManager = await ethers.getContractAt("MultiStakeManager", CONTRACT_ADDRESSES.MultiStakeManager);
    
    const balanceBefore = await PADToken.balanceOf(USER_ADDRESS);
    const positionsBefore = await MultiStakeManager.getUserPositions(USER_ADDRESS);
    
    console.log(`   📊 Баланс PAD: ${ethers.formatUnits(balanceBefore, 18)}`);
    console.log(`   📊 Позиций: ${positionsBefore.length}`);

    // 2. Выполняем стейкинг
    console.log("\n2. 🚀 Выполняем стейкинг...");
    
    // Сумма для стейкинга (1000 PAD = Bronze tier)
    const stakeAmount = ethers.parseUnits("1000", 18);
    
    console.log(`   💰 Сумма стейкинга: ${ethers.formatUnits(stakeAmount, 18)} PAD`);
    console.log(`   🏆 Tier: Bronze (0)`);

    // Выполняем транзакцию стейкинга
    const tx = await MultiStakeManager.createPosition(stakeAmount, 0); // tier 0 = Bronze
    console.log(`   🔗 Транзакция отправлена: ${tx.hash}`);
    
    // Ждем подтверждения
    const receipt = await tx.wait();
    console.log(`   ✅ Транзакция подтверждена в блоке ${receipt.blockNumber}`);

    // 3. Проверяем состояние ПОСЛЕ стейкинга
    console.log("\n3. 🔍 Проверяем состояние ПОСЛЕ стейкинга...");
    
    const balanceAfter = await PADToken.balanceOf(USER_ADDRESS);
    const positionsAfter = await MultiStakeManager.getUserPositions(USER_ADDRESS);
    
    console.log(`   📊 Баланс PAD: ${ethers.formatUnits(balanceAfter, 18)}`);
    console.log(`   📊 Позиций: ${positionsAfter.length}`);
    
    // Проверяем новую позицию
    if (positionsAfter.length > positionsBefore.length) {
      const newPositionId = positionsAfter[positionsAfter.length - 1];
      const newPosition = await MultiStakeManager.getPosition(newPositionId);
      
      console.log(`   🆕 Новая позиция ID: ${newPositionId}`);
      console.log(`   📊 Детали позиции:`, newPosition);
    }

    // 4. Проверяем ваучеры
    console.log("\n4. 🔍 Проверяем ваучеры...");
    const VoucherManager = await ethers.getContractAt("VoucherManager", "0xFe267475409db3703597C230C67Fa7dD36C78A4d");
    const vouchersAfter = await VoucherManager.getUserVoucherIds(USER_ADDRESS);
    
    console.log(`   📊 Ваучеров: ${vouchersAfter.length}`);
    
    if (vouchersAfter.length > 0) {
      const latestVoucher = await VoucherManager.getUserVoucher(vouchersAfter[vouchersAfter.length - 1]);
      console.log(`   🎫 Последний ваучер:`, latestVoucher);
    }

    console.log("\n=== ✅ ТЕСТОВЫЙ СТЕЙКИНГ ЗАВЕРШЕН ===");

  } catch (error) {
    console.error("❌ Ошибка при стейкинге:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
