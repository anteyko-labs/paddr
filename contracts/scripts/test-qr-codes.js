const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Testing QR Code functionality...\n");

  // Получаем аккаунты
  const [owner, user1, admin] = await ethers.getSigners();
  
  console.log("👤 Owner:", owner.address);
  console.log("👤 User1:", user1.address);
  console.log("👤 Admin:", admin.address);

  // Деплоим контракты
  console.log("\n📦 Deploying contracts...");
  
  const PADToken = await ethers.getContractFactory("PADToken");
  const padToken = await PADToken.deploy();
  await padToken.waitForDeployment();
  console.log("✅ PADToken deployed to:", await padToken.getAddress());

  const VoucherManager = await ethers.getContractFactory("VoucherManager");
  const voucherManager = await VoucherManager.deploy();
  await voucherManager.waitForDeployment();
  console.log("✅ VoucherManager deployed to:", await voucherManager.getAddress());

  const MultiStakeManager = await ethers.getContractFactory("MultiStakeManager");
  const multiStakeManager = await MultiStakeManager.deploy(await padToken.getAddress());
  await multiStakeManager.waitForDeployment();
  console.log("✅ MultiStakeManager deployed to:", await multiStakeManager.getAddress());

  const TierCalculator = await ethers.getContractFactory("TierCalculator");
  const tierCalculator = await TierCalculator.deploy();
  await tierCalculator.waitForDeployment();
  console.log("✅ TierCalculator deployed to:", await tierCalculator.getAddress());

  const PADNFTFactory = await ethers.getContractFactory("PADNFTFactory");
  const nftFactory = await PADNFTFactory.deploy(await multiStakeManager.getAddress(), await tierCalculator.getAddress());
  await nftFactory.waitForDeployment();
  console.log("✅ PADNFTFactory deployed to:", await nftFactory.getAddress());

  // Настраиваем роли и связи
  console.log("\n🔗 Setting up roles and connections...");
  
  await multiStakeManager.setVoucherManager(await voucherManager.getAddress());
  console.log("✅ VoucherManager set in MultiStakeManager");
  
  await multiStakeManager.setNFTFactory(await nftFactory.getAddress());
  console.log("✅ NFTFactory set in MultiStakeManager");
  
  await voucherManager.grantRole(await voucherManager.ADMIN_ROLE(), await multiStakeManager.getAddress());
  console.log("✅ ADMIN_ROLE granted to MultiStakeManager in VoucherManager");
  
  await nftFactory.grantRole(await nftFactory.MINTER_ROLE(), await multiStakeManager.getAddress());
  console.log("✅ MINTER_ROLE granted to MultiStakeManager in NFTFactory");

  // Даем админу роль REDEEMER_ROLE
  await voucherManager.grantRole(await voucherManager.REDEEMER_ROLE(), admin.address);
  console.log("✅ REDEEMER_ROLE granted to admin");

  // Переводим токены пользователю
  const transferAmount = ethers.parseEther("10000");
  await padToken.transfer(user1.address, transferAmount);
  console.log(`💰 Transferred ${ethers.formatEther(transferAmount)} tokens to user1`);

  // Пользователь стейкает
  console.log("\n🥉 Testing Bronze tier staking...");
  
  const stakeAmount = ethers.parseEther("500");
  const duration = 3600; // 1 час
  
  await padToken.connect(user1).approve(await multiStakeManager.getAddress(), stakeAmount);
  console.log("✅ Approval successful");
  
  const stakeTx = await multiStakeManager.connect(user1).createPosition(stakeAmount, duration);
  const stakeReceipt = await stakeTx.wait();
  console.log("✅ Bronze tier staking successful");
  console.log("📝 Transaction hash:", stakeTx.hash);
  
  // Получаем ID позиции из события
  const positionCreatedEvent = stakeReceipt.logs.find(log => {
    try {
      const parsed = multiStakeManager.interface.parseLog(log);
      return parsed.name === "PositionCreated";
    } catch {
      return false;
    }
  });
  
  const positionId = positionCreatedEvent ? positionCreatedEvent.args.positionId : 1;
  console.log("📍 Position ID:", positionId);

  // Проверяем ваучеры
  console.log("\n🎫 Checking vouchers...");
  const userVouchers = await voucherManager.getUserVouchers(user1.address);
  console.log("📋 Total vouchers created:", userVouchers.length);

  // Получаем детали первого ваучера
  const firstVoucherId = userVouchers[0];
  const voucher = await voucherManager.getVoucher(firstVoucherId);
  console.log("\n📝 First voucher details:");
  console.log("   ID:", voucher.id.toString());
  console.log("   Name:", voucher.name);
  console.log("   Description:", voucher.description);
  console.log("   Value:", voucher.value);
  console.log("   Type:", voucher.voucherType.toString());
  console.log("   Is Active:", voucher.isActive);
  
  // Генерируем QR код вручную для тестирования
  const qrCode = `voucher_${firstVoucherId}_${user1.address}_${positionId}`;
  console.log("   QR Code (generated):", qrCode);

  // Тестируем поиск ваучера по QR коду
  console.log("\n🔍 Testing QR code lookup...");
  try {
    const foundVoucher = await voucherManager.findVoucherByQRCode(qrCode);
    console.log("✅ Voucher found by QR code:");
    console.log("   ID:", foundVoucher.id.toString());
    console.log("   Name:", foundVoucher.name);
  } catch (error) {
    console.log("❌ Error finding voucher by QR code:", error.message);
  }

  // Тестируем погашение ваучера через админа
  console.log("\n🎫 Testing voucher redemption...");
  try {
    const redeemTx = await voucherManager.connect(admin).redeemVoucher(qrCode, admin.address);
    await redeemTx.wait();
    console.log("✅ Voucher redeemed successfully");
    console.log("📝 Redemption transaction hash:", redeemTx.hash);
    
    // Проверяем статус ваучера после погашения
    const redeemedVoucher = await voucherManager.getVoucher(firstVoucherId);
    console.log("📊 Voucher status after redemption:");
    console.log("   Is Active:", redeemedVoucher.isActive);
    console.log("   Current Uses:", redeemedVoucher.currentUses.toString());
    
  } catch (error) {
    console.log("❌ Error redeeming voucher:", error.message);
  }

  // Тестируем повторное использование QR кода
  console.log("\n🔄 Testing QR code reuse prevention...");
  try {
    const secondRedeemTx = await voucherManager.connect(admin).redeemVoucher(qrCode, admin.address);
    await secondRedeemTx.wait();
    console.log("❌ QR code should not be reusable");
  } catch (error) {
    console.log("✅ QR code reuse prevented:", error.message);
  }

  console.log("\n🎉 QR Code testing completed!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
