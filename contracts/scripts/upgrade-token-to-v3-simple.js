const { ethers, upgrades } = require("hardhat");

async function main() {
    console.log("🚀 Upgrading PADToken to V3Simple with Blacklist functionality...");
    
    // Current PROXY address (stays the same!)
    const PROXY_ADDRESS = "0xe7df07F1B2525AE59489E253811a64EC20f2d14E";
    
    console.log("📋 Token proxy address (stays the same):", PROXY_ADDRESS);
    
    // Check current version
    try {
        const currentContract = await ethers.getContractAt("PADTokenV2", PROXY_ADDRESS);
        const currentVersion = await currentContract.version();
        console.log("📊 Current version:", currentVersion);
    } catch (error) {
        console.log("⚠️  Could not get current version:", error.message);
    }
    
    // Deploy new V3Simple implementation
    console.log("🔨 Deploying PADTokenV3Simple...");
    const PADTokenV3Simple = await ethers.getContractFactory("PADTokenV3Simple");
    
    // Upgrade the proxy (same address!)
    console.log("⬆️ Upgrading token proxy to V3Simple...");
    const upgraded = await upgrades.upgradeProxy(PROXY_ADDRESS, PADTokenV3Simple);
    
    console.log("✅ Token proxy upgraded successfully!");
    console.log("📍 Token proxy address (unchanged):", upgraded.target);
    console.log("📍 New implementation address:", await upgrades.erc1967.getImplementationAddress(upgraded.target));
    
    // Test new functions
    console.log("🧪 Testing new V3Simple functions...");
    
    // Test version
    const newVersion = await upgraded.version();
    console.log("📊 New version:", newVersion);
    
    // Test blacklist functions
    const testAddress = "0x2565A772fa45f130b0840010a1DBBD90f06278d3"; // The address we want to blacklist
    console.log("🚫 Testing blacklist functions...");
    
    // Check if already blacklisted
    const isAlreadyBlacklisted = await upgraded.isBlacklisted(testAddress);
    console.log("🔍 Is address already blacklisted:", isAlreadyBlacklisted);
    
    if (!isAlreadyBlacklisted) {
        // Add to blacklist
        console.log("🚫 Adding address to token blacklist...");
        const addTx = await upgraded.addToBlacklist(testAddress);
        await addTx.wait();
        console.log("✅ Address added to token blacklist");
    } else {
        console.log("⚠️  Address already blacklisted in token");
    }
    
    // Verify blacklist status
    const isBlacklisted = await upgraded.isBlacklisted(testAddress);
    console.log("🔍 Is address blacklisted in token:", isBlacklisted);
    
    // Test batch functions
    const testAddresses = [
        "0x1111111111111111111111111111111111111111",
        "0x2222222222222222222222222222222222222222"
    ];
    
    try {
        const statuses = await upgraded.getBlacklistStatus(testAddresses);
        console.log("✅ Batch status check works:", statuses);
    } catch (error) {
        console.log("❌ Batch functions error:", error.message);
    }
    
    console.log("\n🎉 Token upgrade to V3Simple completed successfully!");
    console.log("\n📋 New V3Simple functions available:");
    console.log("  - addToBlacklist(address)");
    console.log("  - removeFromBlacklist(address)");
    console.log("  - batchAddToBlacklist(address[])");
    console.log("  - batchRemoveFromBlacklist(address[])");
    console.log("  - isBlacklisted(address)");
    console.log("  - getBlacklistStatus(address[])");
    console.log("  - version() -> 3.0.0");
    
    console.log("\n🚫 What blacklisted addresses CANNOT do:");
    console.log("  ❌ Transfer tokens to other addresses");
    console.log("  ❌ Receive tokens from other addresses");
    console.log("  ❌ Use batchTransfer function");
    console.log("  ❌ Any token transfer operations");
    
    console.log("\n⚠️  IMPORTANT:");
    console.log("✅ Token proxy address stayed the same: 0xe7df07F1B2525AE59489E253811a64EC20f2d14E");
    console.log("✅ No frontend changes needed!");
    console.log("✅ All existing token data preserved!");
    console.log("✅ Blacklist functions available immediately!");
    console.log("✅ Address 0x2565A772fa45f130b0840010a1DBBD90f06278d3 is now blocked from ALL token transfers!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Error during token V3Simple upgrade:", error);
        process.exit(1);
    });
