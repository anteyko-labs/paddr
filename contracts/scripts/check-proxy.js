const { ethers, upgrades } = require("hardhat");

async function main() {
    console.log("🔍 Checking if contract is a proxy...");
    
    const CONTRACT_ADDRESS = "0xdFb58CEe97B91178555CfAC3bE976e925F9De2e3"; // Current address
    
    try {
        // Check if it's a proxy
        const implementationAddress = await upgrades.erc1967.getImplementationAddress(CONTRACT_ADDRESS);
        console.log("✅ Contract IS a proxy!");
        console.log("📍 Proxy address:", CONTRACT_ADDRESS);
        console.log("📍 Implementation address:", implementationAddress);
        
        // Get contract and check version
        const UpgradeableMultiStakeManagerV2 = await ethers.getContractFactory("UpgradeableMultiStakeManagerV2");
        const contract = UpgradeableMultiStakeManagerV2.attach(CONTRACT_ADDRESS);
        
        try {
            const version = await contract.version();
            console.log("📊 Current version:", version);
        } catch (error) {
            console.log("❌ Error getting version:", error.message);
        }
        
    } catch (error) {
        console.log("❌ Contract is NOT a proxy!");
        console.log("❌ Error:", error.message);
        console.log("\n💡 This means the contract was deployed as a regular contract, not as a proxy.");
        console.log("💡 To add blacklist functionality, you need to either:");
        console.log("   1. Deploy a new proxy contract (what I did)");
        console.log("   2. Or migrate to a proxy system");
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Error:", error);
        process.exit(1);
    });
