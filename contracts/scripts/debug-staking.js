const { ethers } = require("hardhat");

async function main() {
  console.log("=== 🐛 ДЕТАЛЬНАЯ ОТЛАДКА СТЕЙКИНГА ===\n");

  // Получаем аккаунты
  const accounts = await ethers.getSigners();
  const deployer = accounts[0];
  
  console.log("👤 Deployer:", deployer.address);
  console.log("");

  // Загружаем адреса контрактов
  const CONTRACT_ADDRESSES = {
    PADToken: "0x6D84688A4734F091cD42F6D998d3F3cB4A990849",
    VoucherTypes: "0x2B8De63Dff3cC60b64F36FCB0E72a4f072818B1F",
    VoucherManager: "0xFe267475409db3703597C230C67Fa7dD36C78A4d",
    MultiStakeManager: "0x8D5b8A4841Ed2Dac943DD01B9E51eCC21E17FaAb",
    PADNFTFactory: "0x7d19632e1b76C0667Db471f61a38E60C7B088579",
  };

  // Подключаемся к контрактам
  const PADToken = await ethers.getContractAt("PADToken", CONTRACT_ADDRESSES.PADToken);
  const MultiStakeManager = await ethers.getContractAt("MultiStakeManager", CONTRACT_ADDRESSES.MultiStakeManager);
  const VoucherManager = await ethers.getContractAt("VoucherManager", CONTRACT_ADDRESSES.VoucherManager);
  const PADNFTFactory = await ethers.getContractAt("PADNFTFactory", CONTRACT_ADDRESSES.PADNFTFactory);

  console.log("✅ Контракты подключены успешно!\n");

  // === ПРОВЕРЯЕМ БАЛАНСЫ И ALLOWANCE ===
  console.log("=== 💰 ПРОВЕРКА БАЛАНСОВ ===");
  const balance = await PADToken.balanceOf(deployer.address);
  const allowance = await PADToken.allowance(deployer.address, CONTRACT_ADDRESSES.MultiStakeManager);
  
  console.log(`Баланс deployer: ${ethers.formatEther(balance)} PAD`);
  console.log(`Allowance -> MultiStakeManager: ${ethers.formatEther(allowance)} PAD`);
  console.log("");

  // === ПРОВЕРЯЕМ КОНФИГУРАЦИЮ ТИРОВ ===
  console.log("=== 🏷️ ПРОВЕРКА КОНФИГУРАЦИИ ТИРОВ ===");
  for (let i = 0; i < 4; i++) {
    try {
      const tierInfo = await MultiStakeManager.getTierInfo(i);
      console.log(`Тир ${i}: ${tierInfo.name}, Min: ${ethers.formatEther(tierInfo.minAmount)} PAD, Max: ${ethers.formatEther(tierInfo.maxAmount)} PAD`);
    } catch (error) {
      console.log(`Тир ${i}: Ошибка - ${error.message}`);
    }
  }
  console.log("");

  // === ПРОВЕРЯЕМ ВАЛИДАЦИЯ СУММ ===
  console.log("=== ✅ ПРОВЕРКА ВАЛИДАЦИИ СУММ ===");
  const testAmount = ethers.parseEther("8005"); // Platinum tier
  const testTier = 3; // Platinum
  
  try {
    const isValid = await MultiStakeManager.validateTierAmount(testAmount, testTier);
    console.log(`Сумма ${ethers.formatEther(testAmount)} PAD для тира ${testTier}: ${isValid ? 'VALID' : 'INVALID'}`);
  } catch (error) {
    console.log(`Ошибка валидации: ${error.message}`);
  }
  console.log("");

  // === ПРОВЕРЯЕМ СУЩЕСТВУЮЩИЕ ПОЗИЦИИ ===
  console.log("=== 📊 ПРОВЕРКА СУЩЕСТВУЮЩИХ ПОЗИЦИЙ ===");
  try {
    const userPositions = await MultiStakeManager.getUserPositions(deployer.address);
    console.log(`Количество позиций пользователя: ${userPositions.length}`);
    
    if (userPositions.length > 0) {
      for (let i = 0; i < userPositions.length; i++) {
        const positionId = userPositions[i];
        const position = await MultiStakeManager.getPosition(positionId);
        
        console.log(`\nПозиция ${i + 1}:`);
        console.log(`  ID: ${position.id}`);
        console.log(`  Владелец: ${position.owner}`);
        console.log(`  Сумма: ${ethers.formatEther(position.amount)} PAD`);
        console.log(`  Тир: ${position.tier}`);
        console.log(`  Время начала: ${new Date(Number(position.startTime) * 1000).toLocaleString()}`);
        console.log(`  Время окончания: ${new Date(Number(position.endTime) * 1000).toLocaleString()}`);
        console.log(`  Активна: ${position.isActive}`);
        console.log(`  Следующий NFT: ${new Date(Number(position.nextMintOn) * 1000).toLocaleString()}`);
        console.log(`  Индекс месяца: ${position.monthIndex}`);
      }
    }
  } catch (error) {
    console.log(`Ошибка при получении позиций: ${error.message}`);
  }
  console.log("");

  // === ПРОВЕРЯЕМ ВАУЧЕРЫ ===
  console.log("=== 🎫 ПРОВЕРКА ВАУЧЕРОВ ===");
  try {
    const userVoucherIds = await VoucherManager.userVoucherIds(deployer.address);
    console.log(`Количество ваучеров пользователя: ${userVoucherIds.length}`);
    
    if (userVoucherIds.length > 0) {
      for (let i = 0; i < Math.min(userVoucherIds.length, 3); i++) {
        const voucherId = userVoucherIds[i];
        const voucher = await VoucherManager.userVouchers(voucherId);
        
        console.log(`\nВаучер ${i + 1}:`);
        console.log(`  ID: ${voucher.id}`);
        console.log(`  Тип: ${voucher.voucherTypeId}`);
        console.log(`  Позиция: ${voucher.positionId}`);
        console.log(`  Тир: ${voucher.tier}`);
        console.log(`  Выдан: ${new Date(Number(voucher.issuedAt) * 1000).toLocaleString()}`);
        console.log(`  Активен: ${voucher.isActive}`);
        console.log(`  Код: ${voucher.voucherCode}`);
      }
    }
  } catch (error) {
    console.log(`Ошибка при получении ваучеров: ${error.message}`);
  }
  console.log("");

  // === ПРОВЕРЯЕМ NFT ===
  console.log("=== 🖼️ ПРОВЕРКА NFT ===");
  try {
    const balance = await PADNFTFactory.balanceOf(deployer.address);
    console.log(`Баланс NFT пользователя: ${balance}`);
    
    if (balance > 0) {
      for (let i = 0; i < Math.min(Number(balance), 3); i++) {
        const tokenId = await PADNFTFactory.tokenOfOwnerByIndex(deployer.address, i);
        const metadata = await PADNFTFactory.getNFTMetadata(tokenId);
        
        console.log(`\nNFT ${i + 1}:`);
        console.log(`  Token ID: ${tokenId}`);
        console.log(`  Position ID: ${metadata.positionId}`);
        console.log(`  Сумма: ${ethers.formatEther(metadata.amountStaked)} PAD`);
        console.log(`  Тир: ${metadata.tierLevel}`);
        console.log(`  Время начала: ${new Date(Number(metadata.startTimestamp) * 1000).toLocaleString()}`);
        console.log(`  Индекс месяца: ${metadata.monthIndex}`);
      }
    }
  } catch (error) {
    console.log(`Ошибка при получении NFT: ${error.message}`);
  }
  console.log("");

  console.log("=== 🔍 ОТЛАДКА ЗАВЕРШЕНА ===");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
