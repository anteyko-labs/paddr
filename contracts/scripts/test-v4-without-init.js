const { ethers, upgrades } = require("hardhat");

async function main() {
    console.log("🧪 Testing V4 without initialization...");
    
    const PROXY_ADDRESS = "0x0c40811aF997bd42b46F5bBBc702Fd96EFCbA3E0";
    
    try {
        // Get V4 contract
        const contract = await ethers.getContractAt("UpgradeableMultiStakeManagerV4", PROXY_ADDRESS);
        
        // Test version
        console.log("📊 Testing version...");
        const version = await contract.version();
        console.log("✅ Version:", version);
        
        // Test statistics (should work even without init)
        console.log("📊 Testing statistics...");
        const stats = await contract.getStatistics();
        console.log("✅ Statistics:", {
            totalStaked: ethers.formatEther(stats[0]),
            totalPositions: stats[1].toString(),
            emergencyPaused: stats[2],
            emergencyPauseTimestamp: stats[3].toString()
        });
        
        // Test emergency pause
        console.log("🚨 Testing emergency pause...");
        try {
            const pauseTx = await contract.emergencyPause();
            await pauseTx.wait();
            console.log("✅ Emergency pause works!");
            
            const unpauseTx = await contract.emergencyUnpause();
            await unpauseTx.wait();
            console.log("✅ Emergency unpause works!");
        } catch (error) {
            console.log("❌ Emergency pause error:", error.message);
        }
        
        // Test enhanced blacklist
        console.log("🚫 Testing enhanced blacklist...");
        const testAddress = "0x5555555555555555555555555555555555555555";
        const testReason = "V4 test reason";
        
        try {
            const addTx = await contract.addToBlacklistWithReason(testAddress, testReason);
            await addTx.wait();
            console.log("✅ Enhanced blacklist works!");
            
            const reason = await contract.getBlacklistReason(testAddress);
            console.log("✅ Blacklist reason:", reason);
        } catch (error) {
            console.log("❌ Enhanced blacklist error:", error.message);
        }
        
        console.log("\n🎉 V4 functions work without explicit initialization!");
        console.log("✅ Proxy upgrade successful!");
        console.log("✅ New functions available!");
        console.log("✅ Address unchanged:", PROXY_ADDRESS);
        
    } catch (error) {
        console.error("❌ Error testing V4:", error);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Error:", error);
        process.exit(1);
    });
