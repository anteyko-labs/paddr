const { ethers } = require("hardhat");

async function main() {
  const VOUCHER_MANAGER_ADDRESS = "0x5D89adf43cb9018Ed502062a7F012a7d101893c6";
  
  console.log("Checking VoucherManager contract...");
  
  // Получаем контракт
  const voucherManager = await ethers.getContractAt("VoucherManager", VOUCHER_MANAGER_ADDRESS);
  
  // Проверяем роли
  const adminRole = await voucherManager.DEFAULT_ADMIN_ROLE();
  const redeemerRole = await voucherManager.REDEEMER_ROLE();
  
  console.log("Admin Role:", adminRole);
  console.log("Redeemer Role:", redeemerRole);
  
  // Проверяем кто имеет роли
  const deployer = "0x513756b7eD711c472537cb497833c5d5Eb02A3Df";
  
  const hasAdminRole = await voucherManager.hasRole(adminRole, deployer);
  const hasRedeemerRole = await voucherManager.hasRole(redeemerRole, deployer);
  
  console.log(`Deployer ${deployer} has admin role:`, hasAdminRole);
  console.log(`Deployer ${deployer} has redeemer role:`, hasRedeemerRole);
  
  // Проверяем количество ваучеров
  try {
    const nextVoucherId = await voucherManager._nextVoucherId();
    console.log("Next Voucher ID:", nextVoucherId.toString());
  } catch (error) {
    console.log("Error getting next voucher ID:", error.message);
  }
  
  // Проверяем ваучеры пользователя
  try {
    const userVouchers = await voucherManager.getUserVouchers(deployer);
    console.log("User vouchers:", userVouchers.map(id => id.toString()));
    
    if (userVouchers.length > 0) {
      const firstVoucher = await voucherManager.getVoucher(userVouchers[0]);
      console.log("First voucher:", {
        id: firstVoucher.id.toString(),
        name: firstVoucher.name,
        description: firstVoucher.description,
        value: firstVoucher.value,
        voucherType: firstVoucher.voucherType,
        isActive: firstVoucher.isActive,
        qrCode: firstVoucher.qrCode
      });
    }
  } catch (error) {
    console.log("Error getting user vouchers:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
