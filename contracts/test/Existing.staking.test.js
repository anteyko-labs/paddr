const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Existing Contracts Staking Test", function () {
  let proxy, padToken, voucherManager, nftFactory, tierWeightManager;
  let deployer, user;

  beforeEach(async function () {
    const signers = await ethers.getSigners();
    deployer = signers[0];
    user = deployer; // Используем deployer как user для тестирования
    
    // Используем существующие контракты на Sepolia
    const PROXY_ADDRESS = "0x58aeA581CA3C470C4f2B1A5DDC251b106Dd363c2";
    const PAD_TOKEN_ADDRESS = "0xa5d3fF94a7aeDA396666c8978Eec67C209202da0";
    const VOUCHER_MANAGER_ADDRESS = "0x5D89adf43cb9018Ed502062a7F012a7d101893c6";
    const NFT_FACTORY_ADDRESS = "0x6D87c4647bd91743ce69d8cd2eD568A6d892cd33";
    const TIER_WEIGHT_MANAGER_ADDRESS = "0x0503a0CD303525e01d06fa9f9D41830304aC520c";

    // Подключаемся к существующим контрактам
    proxy = await ethers.getContractAt("UpgradeableMultiStakeManager", PROXY_ADDRESS);
    padToken = await ethers.getContractAt("PADToken", PAD_TOKEN_ADDRESS);
    voucherManager = await ethers.getContractAt("VoucherManager", VOUCHER_MANAGER_ADDRESS);
    nftFactory = await ethers.getContractAt("PADNFTFactory", NFT_FACTORY_ADDRESS);
    tierWeightManager = await ethers.getContractAt("TierWeightManager", TIER_WEIGHT_MANAGER_ADDRESS);
  });

  it("Should check contract initialization", async function () {
    // Проверяем что прокси инициализирован
    const stakingToken = await proxy.stakingToken();
    const tierWeightManagerAddr = await proxy.tierWeightManager();
    
    console.log("Staking token:", stakingToken);
    console.log("Tier weight manager:", tierWeightManagerAddr);
    
    expect(stakingToken).to.equal("0xa5d3fF94a7aeDA396666c8978Eec67C209202da0");
    expect(tierWeightManagerAddr).to.equal("0x0503a0CD303525e01d06fa9f9D41830304aC520c");
  });

  it("Should check tier configuration", async function () {
    // Проверяем конфигурацию тиров
    const bronzeConfig = await tierWeightManager.getTierConfig(0);
    const silverConfig = await tierWeightManager.getTierConfig(1);
    
    console.log("Bronze config:", bronzeConfig);
    console.log("Silver config:", silverConfig);
    
    expect(bronzeConfig.isActive).to.be.true;
    expect(silverConfig.isActive).to.be.true;
    expect(bronzeConfig.minAmount).to.equal(ethers.parseEther("500"));
    expect(silverConfig.minAmount).to.equal(ethers.parseEther("1000"));
  });

  it("Should check user balance and allowance", async function () {
    const userAddress = user.address;
    
    // Проверяем баланс пользователя
    const balance = await padToken.balanceOf(userAddress);
    console.log("User PAD balance:", ethers.formatEther(balance));
    
    // Проверяем allowance
    const allowance = await padToken.allowance(userAddress, proxy.target);
    console.log("User allowance:", ethers.formatEther(allowance));
    
    // Если баланс меньше 1000 токенов, переводим токены пользователю
    if (balance < ethers.parseEther("1000")) {
      console.log("Transferring tokens to user...");
      await padToken.transfer(userAddress, ethers.parseEther("10000"));
      await padToken.waitForDeployment();
    }
  });

  it("Should create a staking position", async function () {
    const userAddress = user.address;
    const amount = ethers.parseEther("500"); // Bronze tier
    const duration = 1 * 60 * 60; // 1 hour
    
    // Проверяем баланс
    const balance = await padToken.balanceOf(userAddress);
    if (balance < amount) {
      console.log("Transferring tokens to user...");
      await padToken.transfer(userAddress, ethers.parseEther("10000"));
      await padToken.waitForDeployment();
    }
    
    // Проверяем allowance
    const allowance = await padToken.allowance(userAddress, proxy.target);
    if (allowance < amount) {
      console.log("Approving tokens...");
      await padToken.connect(user).approve(proxy.target, amount);
      await padToken.waitForDeployment();
    }
    
    // Получаем количество позиций до создания
    const positionsBefore = await proxy.getUserPositions(userAddress);
    console.log("Positions before:", positionsBefore.length);
    
    // Создаем позицию
    console.log("Creating position...");
    const tx = await proxy.connect(user).createPosition(amount, duration);
    await tx.wait();
    console.log("Position created successfully!");
    
    // Проверяем что позиция создана
    const positionsAfter = await proxy.getUserPositions(userAddress);
    console.log("Positions after:", positionsAfter.length);
    expect(positionsAfter.length).to.be.greaterThan(positionsBefore.length);
    
    // Получаем детали позиции
    const positionId = positionsAfter[positionsAfter.length - 1];
    const position = await proxy.positions(positionId);
    console.log("Position details:", {
      id: positionId.toString(),
      amount: ethers.formatEther(position.amount),
      duration: position.duration.toString(),
      tier: position.tier.toString(),
      isActive: position.isActive
    });
    
    expect(position.isActive).to.be.true;
    expect(position.amount).to.equal(amount);
    expect(position.duration).to.equal(duration);
  });

  it("Should check voucher creation", async function () {
    const userAddress = user.address;
    
    // Получаем ваучеры пользователя
    const vouchers = await voucherManager.getUserVouchers(userAddress);
    console.log("User vouchers:", vouchers.length);
    
    // Если есть ваучеры, показываем их
    if (vouchers.length > 0) {
      for (let i = 0; i < Math.min(vouchers.length, 3); i++) {
        const voucher = vouchers[i];
        console.log(`Voucher ${i}:`, {
          id: voucher.id ? voucher.id.toString() : 'undefined',
          tier: voucher.tier ? voucher.tier.toString() : 'undefined',
          voucherType: voucher.voucherType ? voucher.voucherType.toString() : 'undefined',
          value: voucher.value ? voucher.value.toString() : 'undefined',
          isUsed: voucher.isUsed
        });
      }
    }
  });

  it("Should check NFT factory", async function () {
    const userAddress = user.address;
    
    // Проверяем баланс NFT пользователя
    const nftBalance = await nftFactory.balanceOf(userAddress);
    console.log("User NFT balance:", nftBalance.toString());
    
    // Проверяем общее количество NFT
    const totalSupply = await nftFactory.totalSupply();
    console.log("Total NFT supply:", totalSupply.toString());
  });
});
