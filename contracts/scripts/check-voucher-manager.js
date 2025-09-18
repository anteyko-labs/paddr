const { ethers } = require("hardhat");

async function main() {
  const VOUCHER_MANAGER_ADDRESS = "0x5D89adf43cb9018Ed502062a7F012a7d101893c6";
  
  console.log("Checking VoucherManager contract...");
  
  const voucherManager = await ethers.getContractAt("VoucherManager", VOUCHER_MANAGER_ADDRESS);
  
  const adminRole = await voucherManager.DEFAULT_ADMIN_ROLE();
  const redeemerRole = await voucherManager.REDEEMER_ROLE();
  
  console.log("Admin Role:", adminRole);
  console.log("Redeemer Role:", redeemerRole);
  
  const deployer = "0x513756b7eD711c472537cb497833c5d5Eb02A3Df";
  
  const hasAdminRole = await voucherManager.hasRole(adminRole, deployer);
  const hasRedeemerRole = await voucherManager.hasRole(redeemerRole, deployer);
  
  console.log(`Deployer ${deployer} has admin role:`, hasAdminRole);
  console.log(`Deployer ${deployer} has redeemer role:`, hasRedeemerRole);
  
  try {
    const userVouchers = await voucherManager.getUserVouchers(deployer);
    console.log("User vouchers:", userVouchers.map(id => id.toString()));
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
