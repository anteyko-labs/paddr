const { ethers } = require("hardhat");

async function main() {
  console.log("=== 🔍 КОМПЛЕКСНОЕ ТЕСТИРОВАНИЕ СИСТЕМЫ СТЕЙКИНГА ===\n");

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
  const VoucherTypes = await ethers.getContractAt("VoucherTypes", CONTRACT_ADDRESSES.VoucherTypes);

  console.log("✅ Контракты подключены успешно!\n");

  // === ТЕСТ 1: ПРОВЕРКА КОНФИГУРАЦИИ ТИРОВ ===
  console.log("=== 🏷️ ТЕСТ 1: КОНФИГУРАЦИЯ ТИРОВ ===");
  for (let i = 0; i < 4; i++) {
    try {
      const tierInfo = await MultiStakeManager.getTierInfo(i);
      console.log(`Тир ${i}: ${tierInfo.name}, Min: ${ethers.formatEther(tierInfo.minAmount)} PAD, Max: ${ethers.formatEther(tierInfo.maxAmount)} PAD`);
    } catch (error) {
      console.log(`❌ Тир ${i}: Ошибка - ${error.message}`);
    }
  }
  console.log("");

  // === ТЕСТ 2: ПРОВЕРКА ПОЗИЦИЙ ПОЛЬЗОВАТЕЛЯ ===
  console.log("=== 📊 ТЕСТ 2: ПОЗИЦИИ ПОЛЬЗОВАТЕЛЯ ===");
  try {
    const userPositions = await MultiStakeManager.getUserPositions(deployer.address);
    console.log(`✅ Количество позиций: ${userPositions.length}`);
    
    if (userPositions.length > 0) {
      for (let i = 0; i < userPositions.length; i++) {
        const positionId = userPositions[i];
        const position = await MultiStakeManager.getPosition(positionId);
        
        console.log(`\nПозиция ${i + 1} (ID: ${position.id}):`);
        console.log(`  Сумма: ${ethers.formatEther(position.amount)} PAD`);
        console.log(`  Тир: ${position.tier}`);
        console.log(`  Активна: ${position.isActive}`);
        console.log(`  Время начала: ${new Date(Number(position.startTime) * 1000).toLocaleString()}`);
        console.log(`  Следующий NFT: ${new Date(Number(position.nextMintOn) * 1000).toLocaleString()}`);
        console.log(`  Индекс месяца: ${position.monthIndex}`);
      }
    }
  } catch (error) {
    console.log(`❌ Ошибка получения позиций: ${error.message}`);
  }
  console.log("");

  // === ТЕСТ 3: ПРОВЕРКА ВАУЧЕРОВ ===
  console.log("=== 🎫 ТЕСТ 3: ВАУЧЕРЫ ===");
  try {
    // Проверяем ваучеры для последней позиции
    const lastPositionId = 4; // Последняя позиция
    const positionVouchers = await VoucherManager.getPositionVouchers(lastPositionId);
    console.log(`✅ Ваучеров для позиции ${lastPositionId}: ${positionVouchers.length}`);
    
    if (positionVouchers.length > 0) {
      console.log(`\nПервые 3 ваучера:`);
      for (let i = 0; i < Math.min(3, positionVouchers.length); i++) {
        const voucherId = positionVouchers[i];
        const voucher = await VoucherManager.getUserVoucher(voucherId);
        
        console.log(`  Ваучер ${i + 1}: ID=${voucherId}, Тип=${voucher.voucherTypeId}, Активен=${voucher.isActive}`);
      }
    }
  } catch (error) {
    console.log(`❌ Ошибка получения ваучеров: ${error.message}`);
  }
  console.log("");

  // === ТЕСТ 4: ПРОВЕРКА NFT ===
  console.log("=== 🖼️ ТЕСТ 4: NFT ===");
  try {
    const nftBalance = await PADNFTFactory.balanceOf(deployer.address);
    console.log(`✅ Баланс NFT: ${nftBalance}`);
    
    if (nftBalance > 0) {
      console.log(`\nПервые 3 NFT:`);
      for (let i = 0; i < Math.min(3, Number(nftBalance)); i++) {
        const tokenId = await PADNFTFactory.tokenOfOwnerByIndex(deployer.address, i);
        const metadata = await PADNFTFactory.getNFTMetadata(tokenId);
        
        console.log(`  NFT ${i + 1}: TokenID=${tokenId}, PositionID=${metadata.positionId}, Тир=${metadata.tierLevel}`);
      }
    }
  } catch (error) {
    console.log(`❌ Ошибка получения NFT: ${error.message}`);
  }
  console.log("");

  // === ТЕСТ 5: ПРОВЕРКА ВАЛИДАЦИИ СУММ ===
  console.log("=== ✅ ТЕСТ 5: ВАЛИДАЦИЯ СУММ ===");
  const testCases = [
    { amount: "500", tier: 0, expected: false, description: "500 PAD для Bronze (слишком мало)" },
    { amount: "1500", tier: 0, expected: true, description: "1500 PAD для Bronze (валидно)" },
    { amount: "2500", tier: 0, expected: false, description: "2500 PAD для Bronze (слишком много)" },
    { amount: "8005", tier: 3, expected: true, description: "8005 PAD для Platinum (валидно)" },
  ];
  
  for (const testCase of testCases) {
    try {
      const amount = ethers.parseEther(testCase.amount);
      const isValid = await MultiStakeManager.validateTierAmount(amount, testCase.tier);
      const status = isValid === testCase.expected ? "✅" : "❌";
      console.log(`${status} ${testCase.description}: ${isValid ? 'VALID' : 'INVALID'}`);
    } catch (error) {
      console.log(`❌ Ошибка теста "${testCase.description}": ${error.message}`);
    }
  }
  console.log("");

  // === ТЕСТ 6: ПРОВЕРКА РОЛЕЙ ===
  console.log("=== 🔐 ТЕСТ 6: РОЛИ КОНТРАКТОВ ===");
  try {
    const VOUCHER_ADMIN_ROLE = await VoucherManager.ADMIN_ROLE();
    const NFT_MINTER_ROLE = await PADNFTFactory.MINTER_ROLE();
    
    const hasVoucherAdminRole = await VoucherManager.hasRole(VOUCHER_ADMIN_ROLE, CONTRACT_ADDRESSES.MultiStakeManager);
    const hasNFTMinterRole = await PADNFTFactory.hasRole(NFT_MINTER_ROLE, CONTRACT_ADDRESSES.MultiStakeManager);
    
    console.log(`MultiStakeManager -> VoucherManager ADMIN_ROLE: ${hasVoucherAdminRole ? "✅" : "❌"}`);
    console.log(`MultiStakeManager -> PADNFTFactory MINTER_ROLE: ${hasNFTMinterRole ? "✅" : "❌"}`);
  } catch (error) {
    console.log(`❌ Ошибка проверки ролей: ${error.message}`);
  }
  console.log("");

  // === ТЕСТ 7: ПРОВЕРКА БАЛАНСОВ ===
  console.log("=== 💰 ТЕСТ 7: БАЛАНСЫ ===");
  try {
    const balance = await PADToken.balanceOf(deployer.address);
    const allowance = await PADToken.allowance(deployer.address, CONTRACT_ADDRESSES.MultiStakeManager);
    
    console.log(`Баланс PAD: ${ethers.formatEther(balance)} PAD`);
    console.log(`Allowance -> MultiStakeManager: ${ethers.formatEther(allowance)} PAD`);
  } catch (error) {
    console.log(`❌ Ошибка получения балансов: ${error.message}`);
  }
  console.log("");

  // === ТЕСТ 8: СИМУЛЯЦИЯ СТЕЙКИНГА ===
  console.log("=== 🧪 ТЕСТ 8: СИМУЛЯЦИЯ СТЕЙКИНГА ===");
  try {
    const testAmount = ethers.parseEther("1200"); // Bronze tier
    const testTier = 0;
    
    // Проверяем валидацию
    const isValid = await MultiStakeManager.validateTierAmount(testAmount, testTier);
    console.log(`Валидация 1200 PAD для Bronze: ${isValid ? "✅ VALID" : "❌ INVALID"}`);
    
    // Проверяем баланс
    const balance = await PADToken.balanceOf(deployer.address);
    const hasEnoughBalance = balance >= testAmount;
    console.log(`Достаточно баланса: ${hasEnoughBalance ? "✅" : "❌"}`);
    
    // Проверяем allowance
    const allowance = await PADToken.allowance(deployer.address, CONTRACT_ADDRESSES.MultiStakeManager);
    const hasEnoughAllowance = allowance >= testAmount;
    console.log(`Достаточно allowance: ${hasEnoughAllowance ? "✅" : "❌"}`);
    
    console.log(`\nРезультат симуляции: ${isValid && hasEnoughBalance && hasEnoughAllowance ? "✅ ГОТОВ К СТЕЙКИНГУ" : "❌ НЕ ГОТОВ"}`);
  } catch (error) {
    console.log(`❌ Ошибка симуляции: ${error.message}`);
  }
  console.log("");

  console.log("=== 🎉 КОМПЛЕКСНОЕ ТЕСТИРОВАНИЕ ЗАВЕРШЕНО ===");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
