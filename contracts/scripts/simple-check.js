const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 Checking contract...");
    
    const CONTRACT_ADDRESS = "0xdFb58CEe97B91178555CfAC3bE976e925F9De2e3";
    
    try {
        const UpgradeableMultiStakeManagerV2 = await ethers.getContractFactory("UpgradeableMultiStakeManagerV2");
        const contract = UpgradeableMultiStakeManagerV2.attach(CONTRACT_ADDRESS);
        
        const version = await contract.version();
        console.log("✅ Contract found!");
        console.log("📍 Address:", CONTRACT_ADDRESS);
        console.log("📊 Version:", version);
        
    } catch (error) {
        console.log("❌ Error:", error.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Error:", error);
        process.exit(1);
    });