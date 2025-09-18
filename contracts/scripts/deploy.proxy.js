/* eslint-disable no-console */
const { ethers } = require("hardhat");

async function main() {
  console.log("Starting proxy stack deployment...");

  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);

  const PAD = process.env.PAD_TOKEN_ADDRESS || "0xa5d3fF94a7aeDA396666c8978Eec67C209202da0";
  const VOUCHER = process.env.VOUCHER_MANAGER_ADDRESS || "0x5D89adf43cb9018Ed502062a7F012a7d101893c6";
  const NFT_FACTORY = process.env.PAD_NFT_FACTORY_ADDRESS || "0x6D87c4647bd91743ce69d8cd2eD568A6d892cd33";

  if (!ethers.isAddress(PAD)) throw new Error("Invalid PAD token address");
  if (!ethers.isAddress(VOUCHER)) throw new Error("Invalid VoucherManager address");
  if (!ethers.isAddress(NFT_FACTORY)) throw new Error("Invalid PADNFTFactory address");

  console.log("Using addresses:\n PAD:", PAD, "\n VoucherManager:", VOUCHER, "\n PADNFTFactory:", NFT_FACTORY);

  // Deploy ProxyFactory
  const ProxyFactory = await ethers.getContractFactory("ProxyFactory");
  const proxyFactory = await ProxyFactory.deploy();
  await proxyFactory.waitForDeployment();
  const proxyFactoryAddress = await proxyFactory.getAddress();
  console.log("ProxyFactory:", proxyFactoryAddress);

  // Grant roles to deployer just in case
  await (await proxyFactory.grantRole(await proxyFactory.DEPLOYER_ROLE(), deployer.address)).wait();
  await (await proxyFactory.grantRole(await proxyFactory.UPGRADER_ROLE(), deployer.address)).wait();

  // Prepare initial tier weights (seconds)
  const e = ethers.parseEther;
  const cfg = (min, max, dur, rr, nm, act) => ({ minAmount: min, maxAmount: max, duration: dur, rewardRate: rr, nftMultiplier: nm, isActive: act });
  const initial = [
    cfg(e("500"),  e("500"),  1*60*60, 100, 1, true),
    cfg(e("1000"), e("1000"), 2*60*60, 200, 1, true),
    cfg(e("3000"), e("3000"), 3*60*60, 300, 1, true),
    cfg(e("4000"), e("4000"), 4*60*60, 400, 1, true),
  ];

  // Create deployment (proxy, implementation, proxyAdmin, tierWeightManager)
  const tx = await proxyFactory.createDeployment(PAD, initial);
  const rc = await tx.wait();
  const ev = rc.logs.map(l => {
    try { return proxyFactory.interface.parseLog(l); } catch { return null; }
  }).find(x => x && x.name === "DeploymentCreated");
  if (!ev) throw new Error("DeploymentCreated event not found");

  const deploymentId = ev.args.deploymentId;
  const proxy = ev.args.proxy;
  const proxyAdmin = ev.args.proxyAdmin;
  console.log("DeploymentId:", deploymentId.toString());
  console.log("Proxy:", proxy);
  console.log("ProxyAdmin:", proxyAdmin);

  // Wire NFT factory and voucher manager on the proxy contract
  const Upgradeable = await ethers.getContractAt("UpgradeableMultiStakeManager", proxy);
  await (await Upgradeable.setNFTFactory(NFT_FACTORY)).wait();
  await (await Upgradeable.setVoucherManager(VOUCHER)).wait();
  console.log("Linked NFT factory and voucher manager to proxy");

  console.log(JSON.stringify({
    proxyFactory: proxyFactoryAddress,
    deploymentId: deploymentId.toString(),
    proxy,
    proxyAdmin,
  }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


