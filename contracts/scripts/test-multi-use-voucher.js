const { ethers } = require("hardhat");

async function main() {
  const VOUCHER_MANAGER_ADDRESS = "0x5D89adf43cb9018Ed502062a7F012a7d101893c6";
  
  console.log("Testing multi-use voucher...");
  
  const voucherManager = await ethers.getContractAt("VoucherManager", VOUCHER_MANAGER_ADDRESS);
  
  try {
    const adminAddress = "0x513756b7eD711c472537cb497833c5d5Eb02A3Df";
    
    // Проверяем ваучер ID 3 (Rental Coupons - многоразовый)
    const voucherId = 3;
    const voucher = await voucherManager.getVoucher(voucherId);
    const isValid = await voucherManager.isVoucherValid(voucherId);
    
    console.log(`\n=== VOUCHER ${voucherId} (MULTI-USE) ===`);
    console.log(`Name: ${voucher.name}`);
    console.log(`Value: ${voucher.value}`);
    console.log(`Type: ${voucher.voucherType === 0 ? 'Single Use' : voucher.voucherType === 1 ? 'Multi Use' : 'Duration'}`);
    console.log(`Current uses: ${voucher.currentUses}/${voucher.maxUses}`);
    console.log(`Is valid: ${isValid}`);
    console.log(`Is active: ${voucher.isActive}`);
    
    // Проверяем ваучер ID 24 (Rental Coupons - $600, многоразовый)
    const voucherId2 = 24;
    const voucher2 = await voucherManager.getVoucher(voucherId2);
    const isValid2 = await voucherManager.isVoucherValid(voucherId2);
    
    console.log(`\n=== VOUCHER ${voucherId2} (MULTI-USE) ===`);
    console.log(`Name: ${voucher2.name}`);
    console.log(`Value: ${voucher2.value}`);
    console.log(`Type: ${voucher2.voucherType === 0 ? 'Single Use' : voucher2.voucherType === 1 ? 'Multi Use' : 'Duration'}`);
    console.log(`Current uses: ${voucher2.currentUses}/${voucher2.maxUses}`);
    console.log(`Is valid: ${isValid2}`);
    console.log(`Is active: ${voucher2.isActive}`);
    
    // Проверяем ваучер ID 35 (Rental Coupons - $1250, многоразовый)
    const voucherId3 = 35;
    const voucher3 = await voucherManager.getVoucher(voucherId3);
    const isValid3 = await voucherManager.isVoucherValid(voucherId3);
    
    console.log(`\n=== VOUCHER ${voucherId3} (MULTI-USE) ===`);
    console.log(`Name: ${voucher3.name}`);
    console.log(`Value: ${voucher3.value}`);
    console.log(`Type: ${voucher3.voucherType === 0 ? 'Single Use' : voucher3.voucherType === 1 ? 'Multi Use' : 'Duration'}`);
    console.log(`Current uses: ${voucher3.currentUses}/${voucher3.maxUses}`);
    console.log(`Is valid: ${isValid3}`);
    console.log(`Is active: ${voucher3.isActive}`);
    
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
