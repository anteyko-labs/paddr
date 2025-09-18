const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Simple Contract Deployment", function () {
  it("Should deploy PADToken", async function () {
    const PADToken = await ethers.getContractFactory("PADToken");
    const padToken = await PADToken.deploy();
    await padToken.waitForDeployment();
    console.log("PADToken deployed to:", await padToken.getAddress());
  });

  it("Should deploy VoucherManager", async function () {
    const VoucherManager = await ethers.getContractFactory("VoucherManager");
    const voucherManager = await VoucherManager.deploy();
    await voucherManager.waitForDeployment();
    console.log("VoucherManager deployed to:", await voucherManager.getAddress());
  });

  it("Should deploy PADNFTFactory", async function () {
    const PADToken = await ethers.getContractFactory("PADToken");
    const padToken = await PADToken.deploy();
    await padToken.waitForDeployment();

    const MultiStakeManager = await ethers.getContractFactory("MultiStakeManager");
    const multiStakeManager = await MultiStakeManager.deploy(await padToken.getAddress());
    await multiStakeManager.waitForDeployment();

    const TierCalculator = await ethers.getContractFactory("TierCalculator");
    const tierCalculator = await TierCalculator.deploy();
    await tierCalculator.waitForDeployment();

    const PADNFTFactory = await ethers.getContractFactory("PADNFTFactory");
    const nftFactory = await PADNFTFactory.deploy(
      await multiStakeManager.getAddress(),
      await tierCalculator.getAddress()
    );
    await nftFactory.waitForDeployment();
    console.log("PADNFTFactory deployed to:", await nftFactory.getAddress());
  });

  it("Should deploy MultiStakeManager", async function () {
    const PADToken = await ethers.getContractFactory("PADToken");
    const padToken = await PADToken.deploy();
    await padToken.waitForDeployment();

    const MultiStakeManager = await ethers.getContractFactory("MultiStakeManager");
    const multiStakeManager = await MultiStakeManager.deploy(await padToken.getAddress());
    await multiStakeManager.waitForDeployment();
    console.log("MultiStakeManager deployed to:", await multiStakeManager.getAddress());
  });
});
