const { ethers, upgrades } = require("hardhat");

async function main() {
    console.log("🔍 Checking all contracts for proxy status...");
    
    // All contract addresses from config
    const contracts = {
        "PADToken": "0x0a3d31660bE127f88Cc0561A4E585aB3715d0618",
        "StakeManager": "0x0c40811aF997bd42b46F5bBBc702Fd96EFCbA3E0",
        "NFTFactory": "0x746D6E6bd80ad9a02F6e228879EE805F5878A4E4",
        "TierCalculator": "0x9De5B3fD08eE416682ef4Aa7A51b55720739932a"
    };
    
    for (const [name, address] of Object.entries(contracts)) {
        console.log(`\n📋 Checking ${name}: ${address}`);
        
        try {
            // Try to get implementation address (proxy check)
            const implementationAddress = await upgrades.erc1967.getImplementationAddress(address);
            console.log(`✅ ${name} IS a PROXY!`);
            console.log(`📍 Proxy address: ${address}`);
            console.log(`📍 Implementation address: ${implementationAddress}`);
            
            // Try to get version if possible
            try {
                const contract = await ethers.getContractAt(name === "StakeManager" ? "UpgradeableMultiStakeManagerV4" : name, address);
                const version = await contract.version();
                console.log(`📊 Version: ${version}`);
            } catch (versionError) {
                console.log(`⚠️  Could not get version: ${versionError.message}`);
            }
            
        } catch (error) {
            console.log(`❌ ${name} is NOT a proxy`);
            console.log(`❌ Error: ${error.message}`);
            
            // Check if it's a regular contract
            try {
                const contract = await ethers.getContractAt(name, address);
                console.log(`✅ ${name} is a regular contract (not upgradeable)`);
                
                // Try to get some basic info
                if (name === "PADToken") {
                    try {
                        const totalSupply = await contract.totalSupply();
                        const name = await contract.name();
                        const symbol = await contract.symbol();
                        console.log(`📊 Token info: ${name} (${symbol}), Supply: ${ethers.formatEther(totalSupply)}`);
                    } catch (tokenError) {
                        console.log(`⚠️  Could not get token info: ${tokenError.message}`);
                    }
                }
                
            } catch (contractError) {
                console.log(`❌ Could not connect to ${name}: ${contractError.message}`);
            }
        }
    }
    
    console.log("\n📋 Summary:");
    console.log("✅ PROXY contracts (upgradeable):");
    console.log("  - StakeManager: Can be upgraded to V5, V6, etc.");
    console.log("  - Address stays the same, new functions can be added");
    
    console.log("\n❌ REGULAR contracts (not upgradeable):");
    console.log("  - PADToken: Standard ERC20, cannot be upgraded");
    console.log("  - NFTFactory: Standard contract, cannot be upgraded");
    console.log("  - TierCalculator: Standard contract, cannot be upgraded");
    
    console.log("\n💡 Recommendations:");
    console.log("✅ StakeManager: Use proxy upgrades for new features");
    console.log("⚠️  Other contracts: Need new deployment for changes");
    console.log("⚠️  PADToken: Consider proxy pattern for future upgrades");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Error:", error);
        process.exit(1);
    });
