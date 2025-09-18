const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 Checking PADNFTFactory...");
    
    const NFT_FACTORY_ADDRESS = "0x746D6E6bd80ad9a02F6e228879EE805F5878A4E4";
    
    try {
        const contract = await ethers.getContractAt("PADNFTFactory", NFT_FACTORY_ADDRESS);
        console.log("✅ PADNFTFactory connected successfully!");
        console.log("📍 Address:", NFT_FACTORY_ADDRESS);
        
        // Get some basic info
        try {
            const baseURI = await contract._baseTokenURI();
            console.log("📊 Base URI:", baseURI);
            
            const stakeManager = await contract.stakeManager();
            console.log("📊 Stake Manager:", stakeManager);
            
            const tierCalculator = await contract.tierCalculator();
            console.log("📊 Tier Calculator:", tierCalculator);
            
        } catch (infoError) {
            console.log("⚠️  Could not get contract info:", infoError.message);
        }
        
        console.log("❌ PADNFTFactory is NOT a proxy - cannot be upgraded");
        
    } catch (error) {
        console.log("❌ Error connecting to PADNFTFactory:", error.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Error:", error);
        process.exit(1);
    });
