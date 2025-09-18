const { ethers, upgrades } = require("hardhat");

async function main() {
    console.log("🚀 Upgrading PROXY ONLY (no new contracts deployment)...");
    
    // Current PROXY address (from config)
    const PROXY_ADDRESS = "0x0c40811aF997bd42b46F5bBBc702Fd96EFCbA3E0";
    
    console.log("📋 Current proxy address:", PROXY_ADDRESS);
    
    // Check current version
    try {
        const currentContract = await ethers.getContractAt("UpgradeableMultiStakeManagerV3", PROXY_ADDRESS);
        const currentVersion = await currentContract.version();
        console.log("📊 Current version:", currentVersion);
    } catch (error) {
        console.log("⚠️  Could not get current version:", error.message);
    }
    
    // Deploy new implementation (V4, V5, etc.)
    console.log("🔨 Deploying new implementation...");
    const NewImplementation = await ethers.getContractFactory("UpgradeableMultiStakeManagerV3"); // Change this to V4, V5, etc.
    
    // Upgrade the proxy
    console.log("⬆️ Upgrading proxy to new version...");
    const upgraded = await upgrades.upgradeProxy(PROXY_ADDRESS, NewImplementation);
    
    console.log("✅ Proxy upgraded successfully!");
    console.log("📍 Proxy address:", upgraded.target);
    console.log("📍 New implementation address:", await upgrades.erc1967.getImplementationAddress(upgraded.target));
    
    // Test new version
    try {
        const newVersion = await upgraded.version();
        console.log("📊 New version:", newVersion);
    } catch (error) {
        console.log("⚠️  Could not get new version:", error.message);
    }
    
    console.log("\n🎉 Proxy upgrade completed!");
    console.log("⚠️  IMPORTANT: No frontend changes needed - proxy address stays the same!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Error during proxy upgrade:", error);
        process.exit(1);
    });
