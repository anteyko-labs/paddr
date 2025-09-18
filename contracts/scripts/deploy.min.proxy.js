/* eslint-disable no-console */
const { ethers } = require("hardhat");

async function main() {
  console.log("Starting minimal proxy deployment...");
  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);

  const PAD = process.env.PAD_TOKEN_ADDRESS || "0xa5d3fF94a7aeDA396666c8978Eec67C209202da0";
  const VOUCHER = process.env.VOUCHER_MANAGER_ADDRESS || "0x5D89adf43cb9018Ed502062a7F012a7d101893c6";
  const NFT_FACTORY = process.env.PAD_NFT_FACTORY_ADDRESS || "0x6D87c4647bd91743ce69d8cd2eD568A6d892cd33";

  if (!ethers.isAddress(PAD)) throw new Error("Invalid PAD token address");
  if (!ethers.isAddress(VOUCHER)) throw new Error("Invalid VoucherManager address");
  if (!ethers.isAddress(NFT_FACTORY)) throw new Error("Invalid PADNFTFactory address");

  // 1) Deploy TierWeightManager and set initial configs
  const TierWeightManager = await ethers.getContractFactory("TierWeightManager");
  const twm = await TierWeightManager.deploy();
  await twm.waitForDeployment();
  const twmAddr = await twm.getAddress();
  console.log("TierWeightManager:", twmAddr);

  const e = ethers.parseEther;
  const cfg = (min, max, dur, rr, nm, act) => ({ minAmount: min, maxAmount: max, duration: dur, rewardRate: rr, nftMultiplier: nm, isActive: act });
  const initial = [
    cfg(e("500"),  e("500"),  1*60*60, 100, 1, true),
    cfg(e("1000"), e("1000"), 2*60*60, 200, 1, true),
    cfg(e("3000"), e("3000"), 3*60*60, 300, 1, true),
    cfg(e("4000"), e("4000"), 4*60*60, 400, 1, true),
  ];
  for (let i = 0; i < 4; i++) {
    await (await twm.updateTierConfig(i, initial[i])).wait();
  }

  // 2) Deploy implementation
  const Impl = await ethers.getContractFactory("UpgradeableMultiStakeManager");
  const impl = await Impl.deploy();
  await impl.waitForDeployment();
  const implAddr = await impl.getAddress();
  console.log("Implementation:", implAddr);

  // 3) Deploy TransparentUpgradeableProxy with init data
  const initData = Impl.interface.encodeFunctionData("initialize", [PAD, twmAddr]);
  const Proxy = await ethers.getContractFactory("TransparentUpgradeableProxy");
  // admin is deployer for test; in prod use a ProxyAdmin or multisig
  const proxy = await Proxy.deploy(implAddr, deployer.address, initData);
  await proxy.waitForDeployment();
  const proxyAddr = await proxy.getAddress();
  console.log("Proxy:", proxyAddr);

  // 4) Wire NFT factory and voucher manager on proxy
  const Upgradeable = await ethers.getContractAt("UpgradeableMultiStakeManager", proxyAddr);
  await (await Upgradeable.setNFTFactory(NFT_FACTORY)).wait();
  await (await Upgradeable.setVoucherManager(VOUCHER)).wait();
  console.log("Linked NFT and Voucher managers");

  console.log(JSON.stringify({ proxy: proxyAddr, implementation: implAddr, tierWeightManager: twmAddr }, null, 2));
}

main().catch((e) => { console.error(e); process.exit(1); });


