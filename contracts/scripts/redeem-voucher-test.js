const { ethers } = require("hardhat");

async function main() {
  const VOUCHER_MANAGER_ADDRESS = "0x5D89adf43cb9018Ed502062a7F012a7d101893c6";
  
  console.log("Testing voucher redemption...");
  
  const voucherManager = await ethers.getContractAt("VoucherManager", VOUCHER_MANAGER_ADDRESS);
  
  try {
    // Проверяем роли админа
    const adminAddress = "0x513756b7eD711c472537cb497833c5d5Eb02A3Df";
    const ADMIN_ROLE = await voucherManager.ADMIN_ROLE();
    const REDEEMER_ROLE = await voucherManager.REDEEMER_ROLE();
    
    console.log("Admin Role:", ADMIN_ROLE);
    console.log("Redeemer Role:", REDEEMER_ROLE);
    console.log(`Admin ${adminAddress} has admin role: ${await voucherManager.hasRole(ADMIN_ROLE, adminAddress)}`);
    console.log(`Admin ${adminAddress} has redeemer role: ${await voucherManager.hasRole(REDEEMER_ROLE, adminAddress)}`);
    
    // Берем первый ваучер для тестирования
    const voucherId = 1;
    const voucher = await voucherManager.getVoucher(voucherId);
    const isValid = await voucherManager.isVoucherValid(voucherId);
    
    console.log(`\n=== TESTING VOUCHER ${voucherId} ===`);
    console.log(`Name: ${voucher.name}`);
    console.log(`Value: ${voucher.value}`);
    console.log(`Current uses: ${voucher.currentUses}/${voucher.maxUses}`);
    console.log(`Is valid: ${isValid}`);
    console.log(`Is active: ${voucher.isActive}`);
    // console.log(`QR Code: ${voucher.qrCode}`); // Пропускаем проблемное поле
    
    if (isValid && voucher.isActive) {
      console.log(`\nAttempting to redeem voucher ${voucherId} by ID...`);
      
      // Пытаемся деактивировать ваучер (тест)
      const tx = await voucherManager.deactivateVoucher(voucherId);
      console.log(`Transaction hash: ${tx.hash}`);
      
      const receipt = await tx.wait();
      console.log(`Transaction confirmed in block: ${receipt.blockNumber}`);
      
      // Проверяем статус после погашения
      const voucherAfter = await voucherManager.getVoucher(voucherId);
      const isValidAfter = await voucherManager.isVoucherValid(voucherId);
      
      console.log(`\n=== AFTER REDEMPTION ===`);
      console.log(`Current uses: ${voucherAfter.currentUses}/${voucherAfter.maxUses}`);
      console.log(`Is valid: ${isValidAfter}`);
      console.log(`Is active: ${voucherAfter.isActive}`);
      
    } else {
      console.log("Voucher is not valid or not active, cannot redeem");
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
