const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PADD-R Staking System", function () {
  let padToken, voucherManager, nftFactory, multiStakeManager;
  let owner, user1, user2;
  let ownerAddress, user1Address, user2Address;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    ownerAddress = await owner.getAddress();
    user1Address = await user1.getAddress();
    user2Address = await user2.getAddress();

    // Deploy contracts
    const PADToken = await ethers.getContractFactory("PADToken");
    padToken = await PADToken.deploy();

    const VoucherManager = await ethers.getContractFactory("VoucherManager");
    voucherManager = await VoucherManager.deploy();

    const MultiStakeManager = await ethers.getContractFactory("MultiStakeManager");
    multiStakeManager = await MultiStakeManager.deploy(await padToken.getAddress());

    const TierCalculator = await ethers.getContractFactory("TierCalculator");
    const tierCalculator = await TierCalculator.deploy();

    const PADNFTFactory = await ethers.getContractFactory("PADNFTFactory");
    nftFactory = await PADNFTFactory.deploy(
      await multiStakeManager.getAddress(),
      await tierCalculator.getAddress()
    );

    // Setup roles and connections
    await multiStakeManager.setVoucherManager(await voucherManager.getAddress());
    await multiStakeManager.setNFTFactory(await nftFactory.getAddress());

    const ADMIN_ROLE = await voucherManager.ADMIN_ROLE();
    await voucherManager.grantRole(ADMIN_ROLE, await multiStakeManager.getAddress());

    const MINTER_ROLE = await nftFactory.MINTER_ROLE();
    await nftFactory.grantRole(MINTER_ROLE, await multiStakeManager.getAddress());

    // Transfer tokens from owner to user1
    const transferAmount = ethers.parseEther("10000");
    await padToken.transfer(user1Address, transferAmount);
  });

  describe("Fixed Tier Staking", function () {
    it("Should allow Bronze tier staking (500 tokens, 1 hour)", async function () {
      const amount = ethers.parseEther("500");
      const duration = 3600; // 1 hour

      await padToken.connect(user1).approve(await multiStakeManager.getAddress(), amount);
      await multiStakeManager.connect(user1).createPosition(amount, duration);

      const positions = await multiStakeManager.getUserPositions(user1Address);
      expect(positions.length).to.equal(1);

      const position = await multiStakeManager.positions(positions[0]);
      expect(position.amount).to.equal(amount);
      expect(position.duration).to.equal(duration);
      expect(position.tier).to.equal(0); // Bronze
      expect(position.isActive).to.be.true;
    });

    it("Should allow Silver tier staking (1000 tokens, 2 hours)", async function () {
      const amount = ethers.parseEther("1000");
      const duration = 7200; // 2 hours

      await padToken.connect(user1).approve(await multiStakeManager.getAddress(), amount);
      await multiStakeManager.connect(user1).createPosition(amount, duration);

      const positions = await multiStakeManager.getUserPositions(user1Address);
      expect(positions.length).to.equal(1);

      const position = await multiStakeManager.positions(positions[0]);
      expect(position.amount).to.equal(amount);
      expect(position.duration).to.equal(duration);
      expect(position.tier).to.equal(1); // Silver
      expect(position.isActive).to.be.true;
    });

    it("Should allow Gold tier staking (3000 tokens, 3 hours)", async function () {
      const amount = ethers.parseEther("3000");
      const duration = 10800; // 3 hours

      await padToken.connect(user1).approve(await multiStakeManager.getAddress(), amount);
      await multiStakeManager.connect(user1).createPosition(amount, duration);

      const positions = await multiStakeManager.getUserPositions(user1Address);
      expect(positions.length).to.equal(1);

      const position = await multiStakeManager.positions(positions[0]);
      expect(position.amount).to.equal(amount);
      expect(position.duration).to.equal(duration);
      expect(position.tier).to.equal(2); // Gold
      expect(position.isActive).to.be.true;
    });

    it("Should allow Platinum tier staking (4000 tokens, 4 hours)", async function () {
      const amount = ethers.parseEther("4000");
      const duration = 14400; // 4 hours

      await padToken.connect(user1).approve(await multiStakeManager.getAddress(), amount);
      await multiStakeManager.connect(user1).createPosition(amount, duration);

      const positions = await multiStakeManager.getUserPositions(user1Address);
      expect(positions.length).to.equal(1);

      const position = await multiStakeManager.positions(positions[0]);
      expect(position.amount).to.equal(amount);
      expect(position.duration).to.equal(duration);
      expect(position.tier).to.equal(3); // Platinum
      expect(position.isActive).to.be.true;
    });

    it("Should reject invalid tier combinations", async function () {
      const invalidAmount = ethers.parseEther("1500");
      const duration = 3600; // 1 hour

      await padToken.connect(user1).approve(await multiStakeManager.getAddress(), invalidAmount);
      
      await expect(
        multiStakeManager.connect(user1).createPosition(invalidAmount, duration)
      ).to.be.revertedWith("Invalid tier amount");
    });
  });

  describe("Voucher System", function () {
    it("Should create vouchers for Bronze tier", async function () {
      const amount = ethers.parseEther("500");
      const duration = 3600; // 1 hour

      await padToken.connect(user1).approve(await multiStakeManager.getAddress(), amount);
      await multiStakeManager.connect(user1).createPosition(amount, duration);

      const positions = await multiStakeManager.getUserPositions(user1Address);
      const positionId = positions[0];

      const userVouchers = await voucherManager.getUserVouchers(user1Address);
      expect(userVouchers.length).to.equal(4); // Bronze has 4 vouchers

      // Check first voucher
      const voucher = await voucherManager.getVoucher(userVouchers[0]);
      expect(voucher.name).to.equal("5% Discount");
      expect(voucher.voucherType).to.equal(0); // SINGLE_USE
      expect(voucher.isActive).to.be.true;
    });

    it("Should create vouchers for Silver tier", async function () {
      const amount = ethers.parseEther("1000");
      const duration = 7200; // 2 hours

      await padToken.connect(user1).approve(await multiStakeManager.getAddress(), amount);
      await multiStakeManager.connect(user1).createPosition(amount, duration);

      const userVouchers = await voucherManager.getUserVouchers(user1Address);
      expect(userVouchers.length).to.equal(9); // Silver has 9 vouchers

      // Check multi-use voucher
      const multiUseVoucher = await voucherManager.getVoucher(userVouchers[2]);
      expect(multiUseVoucher.name).to.equal("Rental Coupons");
      expect(multiUseVoucher.voucherType).to.equal(1); // MULTI_USE
      expect(multiUseVoucher.maxUses).to.equal(3);
    });

    it("Should create vouchers for Gold tier", async function () {
      const amount = ethers.parseEther("3000");
      const duration = 10800; // 3 hours

      await padToken.connect(user1).approve(await multiStakeManager.getAddress(), amount);
      await multiStakeManager.connect(user1).createPosition(amount, duration);

      const userVouchers = await voucherManager.getUserVouchers(user1Address);
      expect(userVouchers.length).to.equal(11); // Gold has 11 vouchers

      // Check duration voucher
      const durationVoucher = await voucherManager.getVoucher(userVouchers[5]);
      expect(durationVoucher.name).to.equal("Unlimited Mileage");
      expect(durationVoucher.voucherType).to.equal(2); // DURATION
    });

    it("Should create vouchers for Platinum tier", async function () {
      const amount = ethers.parseEther("4000");
      const duration = 14400; // 4 hours

      await padToken.connect(user1).approve(await multiStakeManager.getAddress(), amount);
      await multiStakeManager.connect(user1).createPosition(amount, duration);

      const userVouchers = await voucherManager.getUserVouchers(user1Address);
      expect(userVouchers.length).to.equal(14); // Platinum has 14 vouchers

      // Check exclusive voucher
      const exclusiveVoucher = await voucherManager.getVoucher(userVouchers[9]);
      expect(exclusiveVoucher.name).to.equal("Chauffeur Service");
      expect(exclusiveVoucher.value).to.equal("6 hours");
    });
  });

  describe("Voucher Redemption", function () {
    let positionId, voucherId;

    beforeEach(async function () {
      const amount = ethers.parseEther("500");
      const duration = 3600; // 1 hour

      await padToken.connect(user1).approve(await multiStakeManager.getAddress(), amount);
      await multiStakeManager.connect(user1).createPosition(amount, duration);

      const positions = await multiStakeManager.getUserPositions(user1Address);
      positionId = positions[0];

      const userVouchers = await voucherManager.getUserVouchers(user1Address);
      voucherId = userVouchers[0];
    });

    it("Should check voucher validity", async function () {
      const isValid = await voucherManager.isVoucherValid(voucherId);
      expect(isValid).to.be.true;
    });

    it("Should allow deactivating voucher", async function () {
      await voucherManager.deactivateVoucher(voucherId);

      const isValid = await voucherManager.isVoucherValid(voucherId);
      expect(isValid).to.be.false;
    });
  });

  describe("NFT Rewards", function () {
    it("Should not mint initial NFT on staking", async function () {
      const amount = ethers.parseEther("500");
      const duration = 3600; // 1 hour

      await padToken.connect(user1).approve(await multiStakeManager.getAddress(), amount);
      await multiStakeManager.connect(user1).createPosition(amount, duration);

      const positions = await multiStakeManager.getUserPositions(user1Address);
      const positionId = positions[0];

      const nftBalance = await nftFactory.balanceOf(user1Address);
      expect(nftBalance).to.equal(0); // No NFT minted immediately
    });

    it("Should allow minting first NFT after 1 hour", async function () {
      const amount = ethers.parseEther("500");
      const duration = 3600; // 1 hour

      await padToken.connect(user1).approve(await multiStakeManager.getAddress(), amount);
      await multiStakeManager.connect(user1).createPosition(amount, duration);

      const positions = await multiStakeManager.getUserPositions(user1Address);
      const positionId = positions[0];

      // Fast forward 1 hour
      await ethers.provider.send("evm_increaseTime", [3600]);
      await ethers.provider.send("evm_mine");

      await multiStakeManager.connect(user1).mintNextNFT(positionId);

      const nftBalance = await nftFactory.balanceOf(user1Address);
      expect(nftBalance).to.equal(1); // First NFT minted after 1 hour
    });

    it("Should prevent minting NFT too early", async function () {
      const amount = ethers.parseEther("500");
      const duration = 3600; // 1 hour

      await padToken.connect(user1).approve(await multiStakeManager.getAddress(), amount);
      await multiStakeManager.connect(user1).createPosition(amount, duration);

      const positions = await multiStakeManager.getUserPositions(user1Address);
      const positionId = positions[0];

      // Try to mint before 1 hour
      await expect(
        multiStakeManager.connect(user1).mintNextNFT(positionId)
      ).to.be.revertedWith("Too early for next NFT");
    });
  });

  describe("Position Management", function () {
    it("Should allow closing position after duration", async function () {
      const amount = ethers.parseEther("500");
      const duration = 3600; // 1 hour

      await padToken.connect(user1).approve(await multiStakeManager.getAddress(), amount);
      await multiStakeManager.connect(user1).createPosition(amount, duration);

      const positions = await multiStakeManager.getUserPositions(user1Address);
      const positionId = positions[0];

      // Fast forward 1 hour
      await ethers.provider.send("evm_increaseTime", [3600]);
      await ethers.provider.send("evm_mine");

      const balanceBefore = await padToken.balanceOf(user1Address);
      await multiStakeManager.connect(user1).closePosition(positionId);
      const balanceAfter = await padToken.balanceOf(user1Address);

      expect(balanceAfter).to.be.gt(balanceBefore);

      const position = await multiStakeManager.positions(positionId);
      expect(position.isActive).to.be.false;
    });

    it("Should prevent closing position before duration", async function () {
      const amount = ethers.parseEther("500");
      const duration = 3600; // 1 hour

      await padToken.connect(user1).approve(await multiStakeManager.getAddress(), amount);
      await multiStakeManager.connect(user1).createPosition(amount, duration);

      const positions = await multiStakeManager.getUserPositions(user1Address);
      const positionId = positions[0];

      await expect(
        multiStakeManager.connect(user1).closePosition(positionId)
      ).to.be.revertedWith("Position not mature");
    });
  });
});
