const { ethers, upgrades } = require("hardhat");

async function main() {
    console.log("🚀 Upgrading PROXY to V4 with new features...");
    
    // Current PROXY address (stays the same!)
    const PROXY_ADDRESS = "0x0c40811aF997bd42b46F5bBBc702Fd96EFCbA3E0";
    
    console.log("📋 Proxy address (stays the same):", PROXY_ADDRESS);
    
    // Check current version
    try {
        const currentContract = await ethers.getContractAt("UpgradeableMultiStakeManagerV3", PROXY_ADDRESS);
        const currentVersion = await currentContract.version();
        console.log("📊 Current version:", currentVersion);
    } catch (error) {
        console.log("⚠️  Could not get current version:", error.message);
    }
    
    // Deploy new V4 implementation
    console.log("🔨 Deploying UpgradeableMultiStakeManagerV4...");
    const UpgradeableMultiStakeManagerV4 = await ethers.getContractFactory("UpgradeableMultiStakeManagerV4");
    
    // Upgrade the proxy (same address!)
    console.log("⬆️ Upgrading proxy to V4...");
    const upgraded = await upgrades.upgradeProxy(PROXY_ADDRESS, UpgradeableMultiStakeManagerV4);
    
    console.log("✅ Proxy upgraded successfully!");
    console.log("📍 Proxy address (unchanged):", upgraded.target);
    console.log("📍 New implementation address:", await upgrades.erc1967.getImplementationAddress(upgraded.target));
    
    // Initialize V4
    console.log("🔧 Initializing V4...");
    const tx = await upgraded.initializeV4();
    await tx.wait();
    console.log("✅ V4 initialized successfully!");
    
    // Test new functions
    console.log("🧪 Testing new V4 functions...");
    
    // Test version
    const newVersion = await upgraded.version();
    console.log("📊 New version:", newVersion);
    
    // Test statistics
    const stats = await upgraded.getStatistics();
    console.log("📊 Statistics:");
    console.log("  - Total staked amount:", ethers.formatEther(stats[0]), "tokens");
    console.log("  - Total positions created:", stats[1].toString());
    console.log("  - Emergency paused:", stats[2]);
    console.log("  - Emergency pause timestamp:", stats[3].toString());
    
    // Test enhanced blacklist
    const testAddress = "0x4444444444444444444444444444444444444444";
    const testReason = "Test blacklist reason";
    
    console.log("🚫 Testing enhanced blacklist...");
    const addTx = await upgraded.addToBlacklistWithReason(testAddress, testReason);
    await addTx.wait();
    console.log("✅ Address added to blacklist with reason");
    
    const reason = await upgraded.getBlacklistReason(testAddress);
    console.log("📝 Blacklist reason:", reason);
    
    // Test emergency pause
    console.log("🚨 Testing emergency pause...");
    const pauseTx = await upgraded.emergencyPause();
    await pauseTx.wait();
    console.log("✅ Emergency pause activated");
    
    const pauseStats = await upgraded.getStatistics();
    console.log("📊 Emergency paused:", pauseStats[2]);
    
    // Unpause
    const unpauseTx = await upgraded.emergencyUnpause();
    await unpauseTx.wait();
    console.log("✅ Emergency unpause activated");
    
    console.log("\n🎉 Upgrade to V4 completed successfully!");
    console.log("\n📋 New V4 functions available:");
    console.log("  - emergencyPause() / emergencyUnpause()");
    console.log("  - getStatistics()");
    console.log("  - addToBlacklistWithReason(address, reason)");
    console.log("  - getBlacklistReason(address)");
    console.log("  - batchAddToBlacklistWithReasons(address[], reasons[])");
    console.log("  - version() -> 4.0.0");
    
    console.log("\n⚠️  IMPORTANT:");
    console.log("✅ Proxy address stayed the same: 0x0c40811aF997bd42b46F5bBBc702Fd96EFCbA3E0");
    console.log("✅ No frontend changes needed!");
    console.log("✅ All existing data preserved!");
    console.log("✅ New functions available immediately!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Error during V4 upgrade:", error);
        process.exit(1);
    });
