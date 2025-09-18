const { ethers } = require("hardhat");

async function main() {
    console.log("🚫 Blacklist Management Script");
    
    // Contract address
    const CONTRACT_ADDRESS = "0x0c40811aF997bd42b46F5bBBc702Fd96EFCbA3E0"; // BSC Testnet NEW PROXY
    
    // Get contract
    const UpgradeableMultiStakeManagerV3 = await ethers.getContractFactory("UpgradeableMultiStakeManagerV3");
    const contract = UpgradeableMultiStakeManagerV3.attach(CONTRACT_ADDRESS);
    
    const [admin] = await ethers.getSigners();
    console.log("👤 Admin address:", admin.address);
    
    // Check if we have admin role
    const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
    const hasAdminRole = await contract.hasRole(DEFAULT_ADMIN_ROLE, admin.address);
    console.log("🔐 Has admin role:", hasAdminRole);
    
    if (!hasAdminRole) {
        console.error("❌ You don't have admin role!");
        return;
    }
    
    // Example addresses to blacklist (replace with real addresses)
    const addressesToBlacklist = [
        "0x1234567890123456789012345678901234567890",
        "0x2345678901234567890123456789012345678901",
        "0x3456789012345678901234567890123456789012"
    ];
    
    console.log("\n📋 Managing blacklist...");
    
    // Check current status
    console.log("🔍 Checking current blacklist status...");
    for (const addr of addressesToBlacklist) {
        const isBlacklisted = await contract.isBlacklisted(addr);
        console.log(`  ${addr}: ${isBlacklisted ? "🚫 BLACKLISTED" : "✅ ALLOWED"}`);
    }
    
    // Add to blacklist
    console.log("\n🚫 Adding addresses to blacklist...");
    for (const addr of addressesToBlacklist) {
        try {
            const isAlreadyBlacklisted = await contract.isBlacklisted(addr);
            if (!isAlreadyBlacklisted) {
                const tx = await contract.addToBlacklist(addr);
                await tx.wait();
                console.log(`  ✅ Added ${addr} to blacklist`);
            } else {
                console.log(`  ⚠️  ${addr} already blacklisted`);
            }
        } catch (error) {
            console.log(`  ❌ Failed to add ${addr}:`, error.message);
        }
    }
    
    // Check status after adding
    console.log("\n🔍 Checking status after adding...");
    for (const addr of addressesToBlacklist) {
        const isBlacklisted = await contract.isBlacklisted(addr);
        console.log(`  ${addr}: ${isBlacklisted ? "🚫 BLACKLISTED" : "✅ ALLOWED"}`);
    }
    
    // Batch operations example
    console.log("\n📦 Testing batch operations...");
    
    // Batch add
    const batchAddAddresses = [
        "0x4567890123456789012345678901234567890123",
        "0x5678901234567890123456789012345678901234"
    ];
    
    try {
        const batchAddTx = await contract.batchAddToBlacklist(batchAddAddresses);
        await batchAddTx.wait();
        console.log("✅ Batch add completed");
    } catch (error) {
        console.log("❌ Batch add failed:", error.message);
    }
    
    // Get blacklist status for multiple addresses
    const allAddresses = [...addressesToBlacklist, ...batchAddAddresses];
    const statuses = await contract.getBlacklistStatus(allAddresses);
    
    console.log("\n📊 Final blacklist status:");
    for (let i = 0; i < allAddresses.length; i++) {
        console.log(`  ${allAddresses[i]}: ${statuses[i] ? "🚫 BLACKLISTED" : "✅ ALLOWED"}`);
    }
    
    // Example: Remove one address from blacklist
    console.log("\n✅ Removing one address from blacklist...");
    const addressToRemove = addressesToBlacklist[0];
    try {
        const removeTx = await contract.removeFromBlacklist(addressToRemove);
        await removeTx.wait();
        console.log(`✅ Removed ${addressToRemove} from blacklist`);
        
        // Check status
        const isBlacklisted = await contract.isBlacklisted(addressToRemove);
        console.log(`🔍 Status after removal: ${isBlacklisted ? "🚫 BLACKLISTED" : "✅ ALLOWED"}`);
    } catch (error) {
        console.log("❌ Failed to remove:", error.message);
    }
    
    console.log("\n🎉 Blacklist management completed!");
    console.log("\n📋 Available functions:");
    console.log("  - addToBlacklist(address)");
    console.log("  - removeFromBlacklist(address)");
    console.log("  - batchAddToBlacklist(address[])");
    console.log("  - batchRemoveFromBlacklist(address[])");
    console.log("  - isBlacklisted(address)");
    console.log("  - getBlacklistStatus(address[])");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Error:", error);
        process.exit(1);
    });
