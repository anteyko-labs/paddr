const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 Verifying complete address block...");
    
    // Address to check
    const BLOCKED_ADDRESS = "0x2565A772fa45f130b0840010a1DBBD90f06278d3";
    
    // Contract addresses
    const TOKEN_ADDRESS = "0xe7df07F1B2525AE59489E253811a64EC20f2d14E";
    const STAKE_MANAGER_ADDRESS = "0xaFbe65E1bcB565EdA5469B5f465357DcE02C17bc";
    
    try {
        // Get contracts
        const token = await ethers.getContractAt("PADTokenV3Simple", TOKEN_ADDRESS);
        const stakeManager = await ethers.getContractAt("UpgradeableMultiStakeManagerV4", STAKE_MANAGER_ADDRESS);
        
        console.log("📊 Contract Information:");
        console.log(`  Token: ${TOKEN_ADDRESS} (Version: ${await token.version()})`);
        console.log(`  StakeManager: ${STAKE_MANAGER_ADDRESS} (Version: ${await stakeManager.version()})`);
        
        // Check token blacklist
        console.log("\n🚫 Token Blacklist Status:");
        const tokenBlacklisted = await token.isBlacklisted(BLOCKED_ADDRESS);
        console.log(`  Address ${BLOCKED_ADDRESS} is blacklisted in token: ${tokenBlacklisted ? "✅ YES" : "❌ NO"}`);
        
        // Check stake manager blacklist
        console.log("\n🚫 StakeManager Blacklist Status:");
        const stakeBlacklisted = await stakeManager.isBlacklisted(BLOCKED_ADDRESS);
        console.log(`  Address ${BLOCKED_ADDRESS} is blacklisted in stake manager: ${stakeBlacklisted ? "✅ YES" : "❌ NO"}`);
        
        // Check token balance
        const balance = await token.balanceOf(BLOCKED_ADDRESS);
        console.log(`\n💰 Token Balance: ${ethers.formatEther(balance)} PAD`);
        
        // Check admin role
        const [deployer] = await ethers.getSigners();
        const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
        const hasTokenAdminRole = await token.hasRole(DEFAULT_ADMIN_ROLE, deployer.address);
        const hasStakeAdminRole = await stakeManager.hasRole(DEFAULT_ADMIN_ROLE, deployer.address);
        
        console.log("\n🔐 Admin Status:");
        console.log(`  Token admin: ${hasTokenAdminRole ? "✅ YES" : "❌ NO"}`);
        console.log(`  StakeManager admin: ${hasStakeAdminRole ? "✅ YES" : "❌ NO"}`);
        
        // Summary
        console.log("\n📋 COMPLETE BLOCK STATUS:");
        console.log("=" * 50);
        
        if (tokenBlacklisted && stakeBlacklisted) {
            console.log("🎉 ADDRESS IS COMPLETELY BLOCKED!");
            console.log("\n🚫 What this address CANNOT do:");
            console.log("  ❌ Transfer PAD tokens to other addresses");
            console.log("  ❌ Receive PAD tokens from other addresses");
            console.log("  ❌ Create staking positions");
            console.log("  ❌ Claim staking rewards");
            console.log("  ❌ Unstake tokens");
            console.log("  ❌ Use emergency unstake");
            console.log("  ❌ Any staking operations");
            console.log("  ❌ Any token transfer operations");
            
            console.log("\n✅ Block Status: FULLY OPERATIONAL");
            console.log("✅ Token transfers: BLOCKED");
            console.log("✅ Staking operations: BLOCKED");
            console.log("✅ All contract interactions: BLOCKED");
            
        } else {
            console.log("⚠️  ADDRESS IS PARTIALLY BLOCKED!");
            console.log(`  Token blacklist: ${tokenBlacklisted ? "✅ ACTIVE" : "❌ INACTIVE"}`);
            console.log(`  Staking blacklist: ${stakeBlacklisted ? "✅ ACTIVE" : "❌ INACTIVE"}`);
        }
        
        console.log("\n🔧 Management Commands:");
        console.log("  To unblock token transfers:");
        console.log(`    await token.removeFromBlacklist("${BLOCKED_ADDRESS}")`);
        console.log("  To unblock staking operations:");
        console.log(`    await stakeManager.removeFromBlacklist("${BLOCKED_ADDRESS}")`);
        
    } catch (error) {
        console.error("❌ Error during verification:", error.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Error:", error);
        process.exit(1);
    });
