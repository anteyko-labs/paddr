const { ethers } = require("hardhat");

async function main() {
  console.log("=== 💰 УВЕЛИЧЕНИЕ ALLOWANCE ДЛЯ СТЕЙКИНГА ===\n");

  // Получаем аккаунты
  const accounts = await ethers.getSigners();
  const deployer = accounts[0];
  
  console.log("👤 Deployer:", deployer.address);
  console.log("");

  // Загружаем адреса контрактов
  const CONTRACT_ADDRESSES = {
    PADToken: "0x6D84688A4734F091cD42F6D998d3F3cB4A990849",
    MultiStakeManager: "0x8D5b8A4841Ed2Dac943DD01B9E51eCC21E17FaAb",
  };

  // Подключаемся к контрактам
  const PADToken = await ethers.getContractAt("PADToken", CONTRACT_ADDRESSES.PADToken);

  console.log("✅ Контракты подключены успешно!\n");

  // === ПРОВЕРЯЕМ ТЕКУЩИЙ ALLOWANCE ===
  console.log("=== 🔍 ТЕКУЩИЙ ALLOWANCE ===");
  const currentAllowance = await PADToken.allowance(deployer.address, CONTRACT_ADDRESSES.MultiStakeManager);
  const balance = await PADToken.balanceOf(deployer.address);
  
  console.log(`Баланс PAD: ${ethers.formatEther(balance)} PAD`);
  console.log(`Текущий allowance: ${ethers.formatEther(currentAllowance)} PAD`);
  console.log("");

  // === УВЕЛИЧИВАЕМ ALLOWANCE ===
  console.log("=== 🔧 УВЕЛИЧЕНИЕ ALLOWANCE ===");
  
  // Устанавливаем allowance равным балансу (максимально возможное)
  const newAllowance = balance;
  
  try {
    console.log(`Устанавливаем allowance: ${ethers.formatEther(newAllowance)} PAD`);
    const approveTx = await PADToken.approve(CONTRACT_ADDRESSES.MultiStakeManager, newAllowance);
    console.log("   Транзакция отправлена:", approveTx.hash);
    
    const approveReceipt = await approveTx.wait();
    console.log("   ✅ Allowance увеличен в блоке:", approveReceipt.blockNumber);
  } catch (error) {
    console.error("   ❌ Ошибка при увеличении allowance:", error.message);
  }
  console.log("");

  // === ПРОВЕРЯЕМ РЕЗУЛЬТАТ ===
  console.log("=== ✅ ПРОВЕРКА РЕЗУЛЬТАТА ===");
  const finalAllowance = await PADToken.allowance(deployer.address, CONTRACT_ADDRESSES.MultiStakeManager);
  console.log(`Новый allowance: ${ethers.formatEther(finalAllowance)} PAD`);
  
  if (finalAllowance >= newAllowance) {
    console.log("\n🎉 Allowance успешно увеличен! Теперь можно стейкать.");
  } else {
    console.log("\n⚠️ Allowance не был увеличен. Проверьте ошибки выше.");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
