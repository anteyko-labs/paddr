const { ethers } = require("hardhat");

async function main() {
  const VOUCHER_MANAGER_ADDRESS = "0x5D89adf43cb9018Ed502062a7F012a7d101893c6";
  
  console.log("Checking voucher without qrCode field...");
  
  const voucherManager = await ethers.getContractAt("VoucherManager", VOUCHER_MANAGER_ADDRESS);
  
  try {
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
      positionId: voucher.positionId.toString()
    });
    
    const isValid = await voucherManager.isVoucherValid(1);
    console.log("Is voucher 1 valid:", isValid);
    
    // Проверим несколько ваучеров
    console.log("\nChecking multiple vouchers:");
    for (let i = 1; i <= 5; i++) {
      try {
        const v = await voucherManager.getVoucher(i);
        console.log(`Voucher ${i}: ${v.name} - ${v.value} (Type: ${v.voucherType})`);
      } catch (error) {
        console.log(`Error getting voucher ${i}:`, error.message);
      }
    }
    
  } catch (error) {
    console.log("Error:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
