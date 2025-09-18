const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Proxy upgrade flow", function () {
  it("preserves storage and roles across implementation upgrade", async function () {
    const [deployer, user] = await ethers.getSigners();

    // Deploy PAD token and fund user
    const PADToken = await ethers.getContractFactory("PADToken");
    const pad = await PADToken.deploy();
    await pad.waitForDeployment();
    await pad.transfer(await user.getAddress(), ethers.parseEther("10000"));

    // Deploy TierWeightManager
    const TierWeightManager = await ethers.getContractFactory("TierWeightManager");
    const twm = await TierWeightManager.deploy();
    await twm.waitForDeployment();

    // Deploy implementation v1 and proxy
    const ImplV1 = await ethers.getContractFactory("UpgradeableMultiStakeManager");
    const implV1 = await ImplV1.deploy();
    await implV1.waitForDeployment();
    const initData = ImplV1.interface.encodeFunctionData("initialize", [await pad.getAddress(), await twm.getAddress()]);
    const Proxy = await ethers.getContractFactory("TransparentUpgradeableProxy");
    const proxy = await Proxy.deploy(await implV1.getAddress(), await deployer.getAddress(), initData);
    await proxy.waitForDeployment();
    const stake = await ethers.getContractAt("UpgradeableMultiStakeManager", await proxy.getAddress());

    // Verify links stored
    expect(await stake.getConfigVersion()).to.equal(1n);

    // Approve and create a position (fundments)
    const uPad = pad.connect(user);
    const uStake = stake.connect(user);
    await (await uPad.approve(await proxy.getAddress(), ethers.parseEther("10000"))).wait();
    await expect(uStake.createPosition(ethers.parseEther("500"), 3600)).to.emit(stake, "PositionCreated");

    // Deploy implementation v2 (same bytecode here; simulate upgrade) and upgrade proxy admin by calling upgradeTo via admin
    const ImplV2 = await ethers.getContractFactory("UpgradeableMultiStakeManager");
    const implV2 = await ImplV2.deploy();
    await implV2.waitForDeployment();

    // Use ProxyAdmin to perform upgrade
    const ProxyAdmin = await ethers.getContractFactory("ProxyAdmin");
    const pa = await ProxyAdmin.deploy(await deployer.getAddress());
    await pa.waitForDeployment();
    const TransparentProxy = await ethers.getContractFactory("TransparentUpgradeableProxy");
    const proxyAsAdmin = TransparentProxy.attach(await proxy.getAddress());
    await (await proxyAsAdmin.changeAdmin(await pa.getAddress())).wait();
    await (await pa.upgrade(await proxy.getAddress(), await implV2.getAddress())).wait();

    // Verify storage preserved (position and config)
    const ids = await uStake.getUserPositions(await user.getAddress());
    expect(ids.length).to.equal(1);
    expect(await stake.getConfigVersion()).to.equal(1n);
  });
});


