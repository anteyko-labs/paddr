const { ethers, upgrades } = require("hardhat");

async function main() {
    console.log("🚀 Upgrading MultiStakeManager to V3 with Blacklist functionality...");
    
    // Get the current proxy address
    const PROXY_ADDRESS = "0x0c40811aF997bd42b46F5bBBc702Fd96EFCbA3E0"; // BSC Testnet NEW PROXY
    
    console.log("📋 Current proxy address:", PROXY_ADDRESS);
    
    // Deploy the new implementation
    console.log("🔨 Deploying UpgradeableMultiStakeManagerV3...");
    const UpgradeableMultiStakeManagerV3 = await ethers.getContractFactory("UpgradeableMultiStakeManagerV3");
    
    // Upgrade the proxy
    console.log("⬆️ Upgrading proxy to V3...");
    const upgraded = await upgrades.upgradeProxy(PROXY_ADDRESS, UpgradeableMultiStakeManagerV3);
    
    console.log("✅ Proxy upgraded successfully!");
    console.log("📍 Proxy address:", upgraded.target);
    
    // Initialize V3
    console.log("🔧 Initializing V3...");
    const tx = await upgraded.initializeV3();
    await tx.wait();
    console.log("✅ V3 initialized successfully!");
    
    // Test the new functions
    console.log("🧪 Testing new functions...");
    
    // Check version
    const version = await upgraded.version();
    console.log("📊 Contract version:", version);
    
    // Test blacklist functions (as admin)
    const [deployer] = await ethers.getSigners();
    console.log("👤 Admin address:", deployer.address);
    
    // Test adding to blacklist
    const testAddress = "0x1234567890123456789012345678901234567890";
    console.log("🚫 Adding test address to blacklist:", testAddress);
    
    const addTx = await upgraded.addToBlacklist(testAddress);
    await addTx.wait();
    console.log("✅ Address added to blacklist");
    
    // Check if blacklisted
    const isBlacklisted = await upgraded.isBlacklisted(testAddress);
    console.log("🔍 Is address blacklisted:", isBlacklisted);
    
    // Remove from blacklist
    console.log("✅ Removing address from blacklist...");
    const removeTx = await upgraded.removeFromBlacklist(testAddress);
    await removeTx.wait();
    console.log("✅ Address removed from blacklist");
    
    // Check again
    const isBlacklistedAfter = await upgraded.isBlacklisted(testAddress);
    console.log("🔍 Is address blacklisted after removal:", isBlacklistedAfter);
    
    console.log("\n🎉 Upgrade to V3 completed successfully!");
    console.log("📋 New functions available:");
    console.log("  - addToBlacklist(address)");
    console.log("  - removeFromBlacklist(address)");
    console.log("  - batchAddToBlacklist(address[])");
    console.log("  - batchRemoveFromBlacklist(address[])");
    console.log("  - isBlacklisted(address)");
    console.log("  - getBlacklistStatus(address[])");
    console.log("  - version()");
    console.log("\n⚠️  Blacklisted addresses cannot:");
    console.log("  - Create staking positions");
    console.log("  - Claim rewards");
    console.log("  - Unstake tokens");
    console.log("  - Use emergency unstake");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Error during upgrade:", error);
        process.exit(1);
    });
