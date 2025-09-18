const { ethers } = require("hardhat");

async function main() {
    console.log("🔓 Unblocking address from blacklist...");
    
    // Address to unblock
    const ADDRESS_TO_UNBLOCK = "0x2565A772fa45f130b0840010a1DBBD90f06278d3";
    
    // Contract addresses
    const TOKEN_ADDRESS = "0xe7df07F1B2525AE59489E253811a64EC20f2d14E";
    const STAKE_MANAGER_ADDRESS = "0xaFbe65E1bcB565EdA5469B5f465357DcE02C17bc";
    
    try {
        // Get contracts
        const token = await ethers.getContractAt("PADTokenV3Simple", TOKEN_ADDRESS);
        const stakeManager = await ethers.getContractAt("UpgradeableMultiStakeManagerV4", STAKE_MANAGER_ADDRESS);
        
        // Check admin role
        const [deployer] = await ethers.getSigners();
        const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
        
        console.log("👤 Admin address:", deployer.address);
        
        const hasTokenAdminRole = await token.hasRole(DEFAULT_ADMIN_ROLE, deployer.address);
        const hasStakeAdminRole = await stakeManager.hasRole(DEFAULT_ADMIN_ROLE, deployer.address);
        
        console.log("🔐 Has token admin role:", hasTokenAdminRole);
        console.log("🔐 Has stake manager admin role:", hasStakeAdminRole);
        
        if (!hasTokenAdminRole || !hasStakeAdminRole) {
            console.error("❌ You don't have admin role for one or both contracts!");
            return;
        }
        
        // Check current blacklist status
        console.log("\n🔍 Checking current blacklist status...");
        const tokenBlacklisted = await token.isBlacklisted(ADDRESS_TO_UNBLOCK);
        const stakeBlacklisted = await stakeManager.isBlacklisted(ADDRESS_TO_UNBLOCK);
        
        console.log(`📊 Token blacklist status: ${tokenBlacklisted ? "🚫 BLACKLISTED" : "✅ ALLOWED"}`);
        console.log(`📊 StakeManager blacklist status: ${stakeBlacklisted ? "🚫 BLACKLISTED" : "✅ ALLOWED"}`);
        
        // Unblock from token
        if (tokenBlacklisted) {
            console.log("\n🔓 Removing address from token blacklist...");
            const tokenTx = await token.removeFromBlacklist(ADDRESS_TO_UNBLOCK);
            console.log("⏳ Token transaction sent:", tokenTx.hash);
            await tokenTx.wait();
            console.log("✅ Address removed from token blacklist!");
        } else {
            console.log("ℹ️  Address is not blacklisted in token");
        }
        
        // Unblock from stake manager
        if (stakeBlacklisted) {
            console.log("\n🔓 Removing address from stake manager blacklist...");
            const stakeTx = await stakeManager.removeFromBlacklist(ADDRESS_TO_UNBLOCK);
            console.log("⏳ StakeManager transaction sent:", stakeTx.hash);
            await stakeTx.wait();
            console.log("✅ Address removed from stake manager blacklist!");
        } else {
            console.log("ℹ️  Address is not blacklisted in stake manager");
        }
        
        // Verify unblock status
        console.log("\n🔍 Verifying unblock status...");
        const finalTokenStatus = await token.isBlacklisted(ADDRESS_TO_UNBLOCK);
        const finalStakeStatus = await stakeManager.isBlacklisted(ADDRESS_TO_UNBLOCK);
        
        console.log(`📊 Final token blacklist status: ${finalTokenStatus ? "🚫 BLACKLISTED" : "✅ ALLOWED"}`);
        console.log(`📊 Final stake manager blacklist status: ${finalStakeStatus ? "🚫 BLACKLISTED" : "✅ ALLOWED"}`);
        
        if (!finalTokenStatus && !finalStakeStatus) {
            console.log("\n🎉 ADDRESS SUCCESSFULLY UNBLOCKED!");
            console.log("\n✅ What this address CAN NOW do:");
            console.log("  ✅ Transfer PAD tokens to other addresses");
            console.log("  ✅ Receive PAD tokens from other addresses");
            console.log("  ✅ Create staking positions");
            console.log("  ✅ Claim staking rewards");
            console.log("  ✅ Unstake tokens");
            console.log("  ✅ Use emergency unstake");
            console.log("  ✅ All staking operations");
            console.log("  ✅ All token transfer operations");
            
            console.log("\n📋 Unblock details:");
            console.log(`  Address: ${ADDRESS_TO_UNBLOCK}`);
            console.log(`  Unblocked by: ${deployer.address}`);
            console.log(`  Unblocked at: ${new Date().toISOString()}`);
            console.log(`  Token contract: ${TOKEN_ADDRESS}`);
            console.log(`  StakeManager contract: ${STAKE_MANAGER_ADDRESS}`);
        } else {
            console.log("⚠️  Address is still partially or fully blocked!");
        }
        
    } catch (error) {
        console.error("❌ Error unblocking address:", error.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Error:", error);
        process.exit(1);
    });
