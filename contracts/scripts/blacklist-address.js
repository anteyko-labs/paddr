const { ethers } = require("hardhat");

async function main() {
    console.log("🚫 Adding address to blacklist...");
    
    // Address to blacklist
    const ADDRESS_TO_BLACKLIST = "0x2565A772fa45f130b0840010a1DBBD90f06278d3";
    
    // StakeManager PROXY address
    const STAKE_MANAGER_ADDRESS = "0xaFbe65E1bcB565EdA5469B5f465357DcE02C17bc";
    
    try {
        // Get contract
        const contract = await ethers.getContractAt("UpgradeableMultiStakeManagerV4", STAKE_MANAGER_ADDRESS);
        
        // Check if we have admin role
        const [deployer] = await ethers.getSigners();
        const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
        const hasAdminRole = await contract.hasRole(DEFAULT_ADMIN_ROLE, deployer.address);
        
        console.log("👤 Admin address:", deployer.address);
        console.log("🔐 Has admin role:", hasAdminRole);
        
        if (!hasAdminRole) {
            console.error("❌ You don't have admin role!");
            return;
        }
        
        // Check current blacklist status
        console.log("\n🔍 Checking current blacklist status...");
        const isCurrentlyBlacklisted = await contract.isBlacklisted(ADDRESS_TO_BLACKLIST);
        console.log(`📊 Address ${ADDRESS_TO_BLACKLIST} is currently blacklisted:`, isCurrentlyBlacklisted);
        
        if (isCurrentlyBlacklisted) {
            console.log("⚠️  Address is already blacklisted!");
            return;
        }
        
        // Add to blacklist
        console.log("\n🚫 Adding address to blacklist...");
        const tx = await contract.addToBlacklist(ADDRESS_TO_BLACKLIST);
        console.log("⏳ Transaction sent:", tx.hash);
        
        await tx.wait();
        console.log("✅ Transaction confirmed!");
        
        // Verify blacklist status
        console.log("\n🔍 Verifying blacklist status...");
        const isNowBlacklisted = await contract.isBlacklisted(ADDRESS_TO_BLACKLIST);
        console.log(`📊 Address ${ADDRESS_TO_BLACKLIST} is now blacklisted:`, isNowBlacklisted);
        
        if (isNowBlacklisted) {
            console.log("\n🎉 Address successfully blacklisted!");
            console.log("\n🚫 What this address CANNOT do:");
            console.log("  ❌ Create staking positions");
            console.log("  ❌ Claim rewards");
            console.log("  ❌ Unstake tokens");
            console.log("  ❌ Use emergency unstake");
            console.log("  ❌ Any other staking operations");
            
            console.log("\n📋 Blacklist details:");
            console.log(`  Address: ${ADDRESS_TO_BLACKLIST}`);
            console.log(`  Blocked by: ${deployer.address}`);
            console.log(`  Blocked at: ${new Date().toISOString()}`);
            console.log(`  Contract: ${STAKE_MANAGER_ADDRESS}`);
        } else {
            console.log("❌ Failed to blacklist address!");
        }
        
    } catch (error) {
        console.error("❌ Error blacklisting address:", error.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Error:", error);
        process.exit(1);
    });
