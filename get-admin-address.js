const { ethers } = require("hardhat");

async function main() {
  const privateKey = "22547068237db8ba6738009e6cc6279e33cec1d5665033b0b881fc49b11e71ba";
  const wallet = new ethers.Wallet(privateKey);
  console.log("Admin address:", wallet.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
