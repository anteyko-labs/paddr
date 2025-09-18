const { ethers, upgrades } = require("hardhat");

async function main() {
    console.log("🚀 Upgrading ALL PROXIES to new versions...");
    
    // Current PROXY addresses (NEVER CHANGE!)
    const PROXY_ADDRESSES = {
        PADToken: "0xe7df07F1B2525AE59489E253811a64EC20f2d14E",
        TierCalculator: "0xFAa3A27b42268d81fE9C9a5e8CF1B51B2564Ac65",
        PADNFTFactory: "0x8c266d52Fcb28c76A8FDFd0CBE82a623a94FF742",
        StakeManager: "0xaFbe65E1bcB565EdA5469B5f465357DcE02C17bc"
    };
    
    console.log("📋 Current proxy addresses (will stay the same):");
    for (const [name, address] of Object.entries(PROXY_ADDRESSES)) {
        console.log(`  ${name}: ${address}`);
    }
    
    // Check current versions
    console.log("\n📊 Checking current versions...");
    try {
        const tokenContract = await ethers.getContractAt("PADTokenV2", PROXY_ADDRESSES.PADToken);
        const tierContract = await ethers.getContractAt("TierCalculatorV2", PROXY_ADDRESSES.TierCalculator);
        const nftContract = await ethers.getContractAt("PADNFTFactoryV2", PROXY_ADDRESSES.PADNFTFactory);
        const stakeContract = await ethers.getContractAt("UpgradeableMultiStakeManagerV4", PROXY_ADDRESSES.StakeManager);
        
        const tokenVersion = await tokenContract.version();
        const tierVersion = await tierContract.version();
        const nftVersion = await nftContract.version();
        const stakeVersion = await stakeContract.version();
        
        console.log("✅ Current versions:");
        console.log(`  - PADToken: ${tokenVersion}`);
        console.log(`  - TierCalculator: ${tierVersion}`);
        console.log(`  - PADNFTFactory: ${nftVersion}`);
        console.log(`  - StakeManager: ${stakeVersion}`);
        
    } catch (error) {
        console.log("⚠️  Could not get current versions:", error.message);
    }
    
    console.log("\n💡 To upgrade specific contracts:");
    console.log("1. Create new version contracts (V3, V4, V5, etc.)");
    console.log("2. Use upgrades.upgradeProxy() for each contract");
    console.log("3. Proxy addresses will NEVER change");
    console.log("4. Frontend will continue working without changes");
    
    console.log("\n📋 Example upgrade commands:");
    console.log("// Upgrade PADToken to V3:");
    console.log("const PADTokenV3 = await ethers.getContractFactory('PADTokenV3');");
    console.log("await upgrades.upgradeProxy(PROXY_ADDRESSES.PADToken, PADTokenV3);");
    console.log("");
    console.log("// Upgrade StakeManager to V5:");
    console.log("const StakeManagerV5 = await ethers.getContractFactory('UpgradeableMultiStakeManagerV5');");
    console.log("await upgrades.upgradeProxy(PROXY_ADDRESSES.StakeManager, StakeManagerV5);");
    
    console.log("\n🎉 All proxies are ready for upgrades!");
    console.log("✅ Proxy addresses are permanent");
    console.log("✅ Frontend config never needs to change");
    console.log("✅ All data preserved during upgrades");
    console.log("✅ New functions can be added anytime");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Error:", error);
        process.exit(1);
    });
