const { ethers } = require("hardhat");

async function main() {
  const VOUCHER_MANAGER_ADDRESS = "0x5D89adf43cb9018Ed502062a7F012a7d101893c6";
  
  console.log("Checking all vouchers in the system...");
  
  const voucherManager = await ethers.getContractAt("VoucherManager", VOUCHER_MANAGER_ADDRESS);
  
  try {
    const adminAddress = "0x513756b7eD711c472537cb497833c5d5Eb02A3Df";
    
    console.log("\n=== ADMIN VOUCHERS ===");
    const adminVouchers = await voucherManager.getUserVouchers(adminAddress);
    console.log(`Admin has ${adminVouchers.length} vouchers`);
    
    // Показываем первые 10 ваучеров админа
    for (let i = 0; i < Math.min(10, adminVouchers.length); i++) {
      try {
        const voucher = await voucherManager.getVoucher(adminVouchers[i]);
        console.log(`Voucher ${adminVouchers[i]}: ${voucher.name} - ${voucher.value} (Owner: ${voucher.owner})`);
      } catch (error) {
        console.log(`Error getting voucher ${adminVouchers[i]}:`, error.message);
      }
    }
    
    // Проверяем ваучеры по ID (попробуем найти других пользователей)
    console.log("\n=== CHECKING VOUCHERS BY ID ===");
    const seenOwners = new Set();
    
    for (let i = 1; i <= 50; i++) {
      try {
        const voucher = await voucherManager.getVoucher(i);
        seenOwners.add(voucher.owner);
        console.log(`Voucher ${i}: ${voucher.name} - Owner: ${voucher.owner}`);
      } catch (error) {
        // Игнорируем ошибки
      }
    }
    
    console.log(`\n=== SUMMARY ===`);
    console.log(`Total unique owners found: ${seenOwners.size}`);
    console.log(`Owners:`, Array.from(seenOwners));
    
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