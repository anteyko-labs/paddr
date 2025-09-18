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
    
    // Показываем ваучеры админа
    for (let i = 0; i < adminVouchers.length; i++) {
      try {
        const voucher = await voucherManager.getVoucher(adminVouchers[i]);
        const isValid = await voucherManager.isVoucherValid(adminVouchers[i]);
        console.log(`Voucher ${adminVouchers[i]}: ${voucher.name} - ${voucher.value} (Owner: ${voucher.owner})`);
        console.log(`  - Type: ${voucher.voucherType === 0 ? 'Single Use' : voucher.voucherType === 1 ? 'Multi Use' : 'Duration'}`);
        console.log(`  - Uses: ${voucher.currentUses}/${voucher.maxUses}`);
        console.log(`  - Active: ${voucher.isActive}, Valid: ${isValid}`);
        console.log(`  - Position ID: ${voucher.positionId}`);
      } catch (error) {
        console.log(`Error getting voucher ${adminVouchers[i]}:`, error.message);
      }
    }
    
    // Проверяем ваучеры по ID (от 1 до 100)
    console.log("\n=== CHECKING ALL VOUCHERS BY ID ===");
    const seenOwners = new Set();
    const allVouchers = [];
    
    for (let i = 1; i <= 100; i++) {
      try {
        const voucher = await voucherManager.getVoucher(i);
        const isValid = await voucherManager.isVoucherValid(i);
        
        seenOwners.add(voucher.owner);
        allVouchers.push({
          id: i,
          name: voucher.name,
          description: voucher.description,
          value: voucher.value,
          type: voucher.voucherType === 0 ? 'Single Use' : 
                voucher.voucherType === 1 ? 'Multi Use' : 'Duration',
          maxUses: voucher.maxUses.toString(),
          currentUses: voucher.currentUses.toString(),
          isActive: voucher.isActive,
          isValid: isValid,
          owner: voucher.owner,
          positionId: voucher.positionId.toString()
        });
        
        console.log(`Voucher ${i}: ${voucher.name} - Owner: ${voucher.owner} - Uses: ${voucher.currentUses}/${voucher.maxUses}`);
      } catch (error) {
        // Игнорируем ошибки (ваучер не существует)
      }
    }
    
    console.log(`\n=== SUMMARY ===`);
    console.log(`Total vouchers found: ${allVouchers.length}`);
    console.log(`Total unique owners: ${seenOwners.size}`);
    console.log(`Owners:`, Array.from(seenOwners));
    
    // Группируем по владельцам
    const vouchersByOwner = {};
    allVouchers.forEach(voucher => {
      if (!vouchersByOwner[voucher.owner]) {
        vouchersByOwner[voucher.owner] = [];
      }
      vouchersByOwner[voucher.owner].push(voucher);
    });
    
    console.log(`\n=== VOUCHERS BY OWNER ===`);
    Object.keys(vouchersByOwner).forEach(owner => {
      console.log(`\n${owner}: ${vouchersByOwner[owner].length} vouchers`);
      vouchersByOwner[owner].forEach(voucher => {
        console.log(`  - ${voucher.name} (${voucher.type}) - Uses: ${voucher.currentUses}/${voucher.maxUses}`);
      });
    });
    
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
