/* eslint-disable no-console */
const { ethers } = require("hardhat");

async function main() {
  const proxyAddress = process.env.FIX_PROXY_ADDRESS || "0x18DDd61369C2DD3ea1144d6E440eA22d50fa384a";
  console.log("Fixing proxy admin for:", proxyAddress);

  const [deployer] = await ethers.getSigners();
  console.log("Caller:", deployer.address);

  // Deploy ProxyAdmin
  const ProxyAdmin = await ethers.getContractFactory("ProxyAdmin");
  const proxyAdmin = await ProxyAdmin.deploy();
  await proxyAdmin.waitForDeployment();
  const proxyAdminAddress = await proxyAdmin.getAddress();
  console.log("New ProxyAdmin:", proxyAdminAddress);

  // Change admin of existing proxy
  const TransparentUpgradeableProxy = await ethers.getContractFactory("TransparentUpgradeableProxy");
  const proxy = TransparentUpgradeableProxy.attach(proxyAddress);
  const tx = await proxy.changeAdmin(proxyAdminAddress);
  await tx.wait();
  console.log("Proxy admin changed.");

  // Quick read via implementation ABI to confirm delegatecalls will work for admin account now
  const u = await ethers.getContractAt("UpgradeableMultiStakeManager", proxyAddress);
  try {
    const stakingToken = await u.stakingToken();
    console.log("stakingToken:", stakingToken);
  } catch (e) {
    console.log("Read check after changeAdmin failed:", String(e));
  }
}

main().catch((e) => { console.error(e); process.exit(1); });


