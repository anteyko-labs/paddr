const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Proxy Contract Check", function () {
  let proxy, implementation, tierWeightManager, padToken, voucherManager, nftFactory;
  let deployer, user;

  beforeEach(async function () {
    [deployer, user] = await ethers.getSigners();
    
    // Используем адреса из последнего деплоя
    const PROXY_ADDRESS = "0x58aeA581CA3C470C4f2B1A5DDC251b106Dd363c2";
    const IMPLEMENTATION_ADDRESS = "0x51C05E6fa53bFaE9beea8EbB65EecE3197af5626";
    const TIER_WEIGHT_MANAGER_ADDRESS = "0x0503a0CD303525e01d06fa9f9D41830304aC520c";
    const PAD_TOKEN_ADDRESS = "0xa5d3fF94a7aeDA396666c8978Eec67C209202da0";
    const VOUCHER_MANAGER_ADDRESS = "0x5D89adf43cb9018Ed502062a7F012a7d101893c6";
    const NFT_FACTORY_ADDRESS = "0x6D87c4647bd91743ce69d8cd2eD568A6d892cd33";

    // Подключаемся к контрактам
    proxy = await ethers.getContractAt("UpgradeableMultiStakeManager", PROXY_ADDRESS);
    tierWeightManager = await ethers.getContractAt("TierWeightManager", TIER_WEIGHT_MANAGER_ADDRESS);
    padToken = await ethers.getContractAt("PADToken", PAD_TOKEN_ADDRESS);
    voucherManager = await ethers.getContractAt("VoucherManager", VOUCHER_MANAGER_ADDRESS);
    nftFactory = await ethers.getContractAt("PADNFTFactory", NFT_FACTORY_ADDRESS);
  });

  it("Should check proxy initialization", async function () {
    // Проверяем, что прокси инициализирован
    const stakingToken = await proxy.stakingToken();
    const tierWeightManagerAddr = await proxy.tierWeightManager();
    
    console.log("Staking token:", stakingToken);
    console.log("Tier weight manager:", tierWeightManagerAddr);
    
    expect(stakingToken).to.equal("0xa5d3fF94a7aeDA396666c8978Eec67C209202da0");
    expect(tierWeightManagerAddr).to.equal("0xa9Fe33268F3B18Db6D14507959E1823069112314");
  });

  it("Should check tier configuration", async function () {
    // Проверяем конфигурацию тиров
    const bronzeConfig = await tierWeightManager.getTierConfig(0);
    const silverConfig = await tierWeightManager.getTierConfig(1);
    
    console.log("Bronze config:", bronzeConfig);
    console.log("Silver config:", silverConfig);
    
    expect(bronzeConfig.isActive).to.be.true;
    expect(silverConfig.isActive).to.be.true;
  });

  it("Should check createPosition function", async function () {
    // Проверяем, что функция createPosition доступна
    const amount = ethers.parseEther("500");
    const duration = 1 * 60 * 60; // 1 hour
    
    // Проверяем allowance
    const allowance = await padToken.allowance(user.address, proxy.target);
    console.log("Allowance:", allowance.toString());
    
    if (allowance < amount) {
      console.log("Need to approve tokens first");
      await padToken.connect(user).approve(proxy.target, amount);
      await padToken.waitForDeployment();
    }
    
    // Проверяем баланс пользователя
    const balance = await padToken.balanceOf(user.address);
    console.log("User balance:", balance.toString());
    
    if (balance < amount) {
      console.log("User needs more tokens");
      // Переводим токены пользователю
      await padToken.transfer(user.address, amount);
    }
    
    // Пытаемся создать позицию
    try {
      const tx = await proxy.connect(user).createPosition(amount, duration);
      console.log("Transaction hash:", tx.hash);
      await tx.wait();
      console.log("Position created successfully");
    } catch (error) {
      console.error("Error creating position:", error.message);
      throw error;
    }
  });
});
