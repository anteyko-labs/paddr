const { ethers } = require("hardhat");

async function main() {
  const VOUCHER_MANAGER_ADDRESS = "0x5D89adf43cb9018Ed502062a7F012a7d101893c6";
  
  console.log("Checking single voucher...");
  
  const voucherManager = await ethers.getContractAt("VoucherManager", VOUCHER_MANAGER_ADDRESS);
  
  // Проверяем первый ваучер
  const voucher = await voucherManager.getVoucher(1);
  
  console.log("Voucher 1 details:", {
    id: voucher.id.toString(),
    name: voucher.name,
    description: voucher.description,
    value: voucher.value,
    voucherType: voucher.voucherType,
    maxUses: voucher.maxUses.toString(),
    currentUses: voucher.currentUses.toString(),
    isActive: voucher.isActive,
    qrCode: voucher.qrCode,
    positionId: voucher.positionId.toString()
  });
  
  // Проверяем валидность ваучера
  const isValid = await voucherManager.isVoucherValid(1);
  console.log("Is voucher 1 valid:", isValid);
  
  // Проверяем QR код
  try {
    const voucherByQR = await voucherManager.findVoucherByQRCode(voucher.qrCode);
    console.log("Found voucher by QR code:", voucherByQR.name);
  } catch (error) {
    console.log("Error finding voucher by QR:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
