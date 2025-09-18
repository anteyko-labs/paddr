const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 Checking blacklist status...");
    
    // Address to check
    const ADDRESS_TO_CHECK = "0x2565A772fa45f130b0840010a1DBBD90f06278d3";
    
    // StakeManager PROXY address
    const STAKE_MANAGER_ADDRESS = "0xaFbe65E1bcB565EdA5469B5f465357DcE02C17bc";
    
    try {
        // Get contract
        const contract = await ethers.getContractAt("UpgradeableMultiStakeManagerV4", STAKE_MANAGER_ADDRESS);
        
        // Check version
        const version = await contract.version();
        console.log("📊 Contract version:", version);
        
        // Check blacklist status
        const isBlacklisted = await contract.isBlacklisted(ADDRESS_TO_CHECK);
        console.log(`📊 Address ${ADDRESS_TO_CHECK} is blacklisted:`, isBlacklisted);
        
        // Check admin role
        const [deployer] = await ethers.getSigners();
        const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
        const hasAdminRole = await contract.hasRole(DEFAULT_ADMIN_ROLE, deployer.address);
        console.log("🔐 Has admin role:", hasAdminRole);
        
        // Try to get statistics
        try {
            const stats = await contract.getStatistics();
            console.log("📊 Statistics:", {
                totalStaked: ethers.formatEther(stats[0]),
                totalPositions: stats[1].toString(),
                emergencyPaused: stats[2]
            });
        } catch (error) {
            console.log("⚠️  Could not get statistics:", error.message);
        }
        
        // Check if blacklist functions exist
        try {
            const testAddress = "0x1111111111111111111111111111111111111111";
            const testResult = await contract.isBlacklisted(testAddress);
            console.log("✅ Blacklist functions are working");
        } catch (error) {
            console.log("❌ Blacklist functions error:", error.message);
        }
        
    } catch (error) {
        console.error("❌ Error:", error.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Error:", error);
        process.exit(1);
    });
