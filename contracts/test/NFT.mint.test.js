const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFT Mint Test", function () {
  let proxy, nftFactory;
  let deployer;

  beforeEach(async function () {
    const signers = await ethers.getSigners();
    deployer = signers[0];
    
    // Используем существующие контракты на Sepolia
    const PROXY_ADDRESS = "0x58aeA581CA3C470C4f2B1A5DDC251b106Dd363c2";
    const NFT_FACTORY_ADDRESS = "0x6D87c4647bd91743ce69d8cd2eD568A6d892cd33";

    proxy = await ethers.getContractAt("UpgradeableMultiStakeManager", PROXY_ADDRESS);
    nftFactory = await ethers.getContractAt("PADNFTFactory", NFT_FACTORY_ADDRESS);
  });

  it("Should check user positions", async function () {
    const userAddress = deployer.address;
    
    // Получаем позиции пользователя
    const positions = await proxy.getUserPositions(userAddress);
    console.log("User positions:", positions.length);
    
    if (positions.length > 0) {
      for (let i = 0; i < Math.min(positions.length, 3); i++) {
        const positionId = positions[i];
        const position = await proxy.positions(positionId);
        
        console.log(`Position ${i}:`, {
          id: positionId.toString(),
          amount: ethers.formatEther(position.amount),
          duration: position.duration.toString(),
          tier: position.tier.toString(),
          isActive: position.isActive,
          nextMintAt: position.nextMintAt.toString(),
          startTime: position.startTime.toString()
        });
      }
    }
  });

  it("Should try to mint NFT", async function () {
    const userAddress = deployer.address;
    
    // Получаем позиции пользователя
    const positions = await proxy.getUserPositions(userAddress);
    
    if (positions.length > 0) {
      const positionId = positions[0]; // Берем первую позицию
      
      // Проверяем баланс NFT до
      const nftBalanceBefore = await nftFactory.balanceOf(userAddress);
      console.log("NFT balance before:", nftBalanceBefore.toString());
      
      try {
        // Пытаемся заминтить NFT
        console.log("Attempting to mint NFT for position:", positionId.toString());
        const tx = await proxy.mintNextNFT(positionId);
        await tx.wait();
        console.log("NFT minted successfully!");
        
        // Проверяем баланс NFT после
        const nftBalanceAfter = await nftFactory.balanceOf(userAddress);
        console.log("NFT balance after:", nftBalanceAfter.toString());
        
        expect(nftBalanceAfter).to.be.greaterThan(nftBalanceBefore);
        
      } catch (error) {
        console.log("NFT mint failed:", error.message);
        
        // Проверяем почему не удалось заминтить
        const position = await proxy.positions(positionId);
        const now = Math.floor(Date.now() / 1000);
        const nextMintAt = Number(position.nextMintAt);
        
        console.log("Current time:", now);
        console.log("Next mint at:", nextMintAt);
        console.log("Time until next mint:", nextMintAt - now, "seconds");
        
        if (nextMintAt > now) {
          console.log("Need to wait", nextMintAt - now, "seconds before next mint");
        }
      }
    } else {
      console.log("No positions found for user");
    }
  });

  it("Should check NFT factory details", async function () {
    const totalSupply = await nftFactory.totalSupply();
    console.log("Total NFT supply:", totalSupply.toString());
    
    // Проверяем есть ли NFT у пользователя
    const userAddress = deployer.address;
    const userBalance = await nftFactory.balanceOf(userAddress);
    console.log("User NFT balance:", userBalance.toString());
    
    if (userBalance > 0) {
      // Получаем токены пользователя
      for (let i = 0; i < Number(userBalance); i++) {
        try {
          const tokenId = await nftFactory.tokenOfOwnerByIndex(userAddress, i);
          console.log(`Token ${i} ID:`, tokenId.toString());
          
          // Получаем URI токена
          const tokenURI = await nftFactory.tokenURI(tokenId);
          console.log(`Token ${i} URI:`, tokenURI);
        } catch (error) {
          console.log(`Error getting token ${i}:`, error.message);
        }
      }
    }
  });
});
