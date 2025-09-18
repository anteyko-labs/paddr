const { ethers } = require("hardhat");
require('dotenv').config();

async function main() {
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    console.error("PRIVATE_KEY not set in .env");
    process.exit(1);
  }
  const wallet = new ethers.Wallet(privateKey);
  console.log("Admin address:", wallet.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });