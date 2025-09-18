/* eslint-disable no-await-in-loop */
const { expect } = require("chai");
const { ethers } = require("hardhat");

async function increaseTime(seconds) {
  await ethers.provider.send("evm_increaseTime", [seconds]);
  await ethers.provider.send("evm_mine", []);
}

describe("UpgradeableMultiStakeManager via TransparentUpgradeableProxy", function () {
  it("initialize → set links → approve → createPosition → mintNextNFT after 5m → close", async function () {
    const [deployer, user] = await ethers.getSigners();

    // Deploy PAD token and fund user
    const PADToken = await ethers.getContractFactory("PADToken");
    const pad = await PADToken.deploy();
    await pad.waitForDeployment();
    await pad.transfer(await user.getAddress(), ethers.parseEther("10000"));

    // Deploy TierWeightManager (defaults: Bronze 500 PAD, 1h, etc.)
    const TierWeightManager = await ethers.getContractFactory("TierWeightManager");
    const twm = await TierWeightManager.deploy();
    await twm.waitForDeployment();

    // Deploy implementation (no-args constructor) and proxy
    const Impl = await ethers.getContractFactory("UpgradeableMultiStakeManager");
    const impl = await Impl.deploy();
    await impl.waitForDeployment();

    const initData = Impl.interface.encodeFunctionData("initialize", [await pad.getAddress(), await twm.getAddress()]);
    const Proxy = await ethers.getContractFactory("TransparentUpgradeableProxy");
    const proxy = await Proxy.deploy(await impl.getAddress(), await deployer.getAddress(), initData);
    await proxy.waitForDeployment();

    const stake = await ethers.getContractAt("UpgradeableMultiStakeManager", await proxy.getAddress());

    // Deploy voucher manager (used inside createPosition)
    const VoucherManager = await ethers.getContractFactory("VoucherManager");
    const vm = await VoucherManager.deploy();
    await vm.waitForDeployment();
    await (await stake.setVoucherManager(await vm.getAddress())).wait();
    // grant ADMIN_ROLE to proxy so createPosition can call VoucherManager
    const ADMIN_ROLE = ethers.keccak256(ethers.toUtf8Bytes("ADMIN_ROLE"));
    await (await vm.grantRole(ADMIN_ROLE, await proxy.getAddress())).wait();

    // Deploy TierCalculator (for PADNFTFactory tier calculation)
    const TierCalculator = await ethers.getContractFactory("TierCalculator");
    const tc = await TierCalculator.deploy();
    await tc.waitForDeployment();

    // Deploy NFT factory and grant MINTER_ROLE to proxy (use TierCalculator here)
    const PADNFTFactory = await ethers.getContractFactory("PADNFTFactory");
    const nft = await PADNFTFactory.deploy(await stake.getAddress(), await tc.getAddress());
    await nft.waitForDeployment();
    const MINTER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MINTER_ROLE"));
    await (await nft.grantRole(MINTER_ROLE, await proxy.getAddress())).wait();
    await (await stake.setNFTFactory(await nft.getAddress())).wait();

    // User approves and creates Bronze position (500 PAD, 1 hour)
    const userPad = pad.connect(user);
    const userStake = stake.connect(user);
    await (await userPad.approve(await proxy.getAddress(), ethers.parseEther("10000"))).wait();
    // duration must match tier config duration (1 hour in seconds)
    const duration = 60 * 60;
    await expect(userStake.createPosition(ethers.parseEther("500"), duration)).to.emit(stake, "PositionCreated");
    // Vouchers should be created for user immediately
    const userVouchers = await vm.getUserVouchers(await user.getAddress());
    expect(userVouchers.length).to.be.greaterThan(0);
    const ids = await userStake.getUserPositions(await user.getAddress());
    const positionId = Number(ids[0]);

    // Move forward 5 minutes and mint next NFT
    await increaseTime(5 * 60);
    await expect(userStake.mintNextNFT(positionId)).to.emit(nft, "NFTMinted");
    // balance should reflect 1 NFT
    expect(await nft.balanceOf(await user.getAddress())).to.equal(1n);

    // Close after full duration elapsed
    await increaseTime(55 * 60); // total ~60 minutes
    // Fund proxy with reward buffer so contract can pay amount + reward
    await (await pad.transfer(await proxy.getAddress(), ethers.parseEther("1000"))).wait();
    await expect(userStake.closePosition(positionId)).to.emit(stake, "PositionClosed");
  });
});


