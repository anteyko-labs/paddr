const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Roles Check", function () {
  let proxy, voucherManager, nftFactory;
  let deployer;

  beforeEach(async function () {
    const signers = await ethers.getSigners();
    deployer = signers[0];
    
    // Используем существующие контракты на Sepolia
    const PROXY_ADDRESS = "0x58aeA581CA3C470C4f2B1A5DDC251b106Dd363c2";
    const VOUCHER_MANAGER_ADDRESS = "0x5D89adf43cb9018Ed502062a7F012a7d101893c6";
    const NFT_FACTORY_ADDRESS = "0x6D87c4647bd91743ce69d8cd2eD568A6d892cd33";

    proxy = await ethers.getContractAt("UpgradeableMultiStakeManager", PROXY_ADDRESS);
    voucherManager = await ethers.getContractAt("VoucherManager", VOUCHER_MANAGER_ADDRESS);
    nftFactory = await ethers.getContractAt("PADNFTFactory", NFT_FACTORY_ADDRESS);
  });

  it("Should check proxy roles", async function () {
    const DEFAULT_ADMIN_ROLE = await proxy.DEFAULT_ADMIN_ROLE();
    const ADMIN_ROLE = await proxy.ADMIN_ROLE();
    
    console.log("DEFAULT_ADMIN_ROLE:", DEFAULT_ADMIN_ROLE);
    console.log("ADMIN_ROLE:", ADMIN_ROLE);
    
    const hasDefaultAdmin = await proxy.hasRole(DEFAULT_ADMIN_ROLE, deployer.address);
    const hasAdmin = await proxy.hasRole(ADMIN_ROLE, deployer.address);
    
    console.log("Deployer has DEFAULT_ADMIN_ROLE:", hasDefaultAdmin);
    console.log("Deployer has ADMIN_ROLE:", hasAdmin);
  });

  it("Should check voucher manager roles", async function () {
    const DEFAULT_ADMIN_ROLE = await voucherManager.DEFAULT_ADMIN_ROLE();
    const ADMIN_ROLE = await voucherManager.ADMIN_ROLE();
    
    console.log("VoucherManager DEFAULT_ADMIN_ROLE:", DEFAULT_ADMIN_ROLE);
    console.log("VoucherManager ADMIN_ROLE:", ADMIN_ROLE);
    
    const hasDefaultAdmin = await voucherManager.hasRole(DEFAULT_ADMIN_ROLE, deployer.address);
    const hasAdmin = await voucherManager.hasRole(ADMIN_ROLE, deployer.address);
    
    console.log("Deployer has VoucherManager DEFAULT_ADMIN_ROLE:", hasDefaultAdmin);
    console.log("Deployer has VoucherManager ADMIN_ROLE:", hasAdmin);
    
    // Проверяем есть ли у прокси админа роль в VoucherManager
    const proxyAddress = "0x58aeA581CA3C470C4f2B1A5DDC251b106Dd363c2";
    const proxyHasAdmin = await voucherManager.hasRole(ADMIN_ROLE, proxyAddress);
    console.log("Proxy has VoucherManager ADMIN_ROLE:", proxyHasAdmin);
  });

  it("Should check NFT factory roles", async function () {
    const DEFAULT_ADMIN_ROLE = await nftFactory.DEFAULT_ADMIN_ROLE();
    const MINTER_ROLE = await nftFactory.MINTER_ROLE();
    
    console.log("NFTFactory DEFAULT_ADMIN_ROLE:", DEFAULT_ADMIN_ROLE);
    console.log("NFTFactory MINTER_ROLE:", MINTER_ROLE);
    
    const hasDefaultAdmin = await nftFactory.hasRole(DEFAULT_ADMIN_ROLE, deployer.address);
    const hasMinter = await nftFactory.hasRole(MINTER_ROLE, deployer.address);
    
    console.log("Deployer has NFTFactory DEFAULT_ADMIN_ROLE:", hasDefaultAdmin);
    console.log("Deployer has NFTFactory MINTER_ROLE:", hasMinter);
    
    // Проверяем есть ли у прокси роль минтера в NFTFactory
    const proxyAddress = "0x58aeA581CA3C470C4f2B1A5DDC251b106Dd363c2";
    const proxyHasMinter = await nftFactory.hasRole(MINTER_ROLE, proxyAddress);
    console.log("Proxy has NFTFactory MINTER_ROLE:", proxyHasMinter);
  });

  it("Should grant necessary roles to proxy", async function () {
    const proxyAddress = "0x58aeA581CA3C470C4f2B1A5DDC251b106Dd363c2";
    
    // Grant ADMIN_ROLE to proxy in VoucherManager
    const voucherAdminRole = await voucherManager.ADMIN_ROLE();
    const voucherHasAdmin = await voucherManager.hasRole(voucherAdminRole, proxyAddress);
    
    if (!voucherHasAdmin) {
      console.log("Granting ADMIN_ROLE to proxy in VoucherManager...");
      await voucherManager.grantRole(voucherAdminRole, proxyAddress);
      await voucherManager.waitForDeployment();
      console.log("Granted!");
    } else {
      console.log("Proxy already has ADMIN_ROLE in VoucherManager");
    }
    
    // Grant MINTER_ROLE to proxy in NFTFactory
    const nftMinterRole = await nftFactory.MINTER_ROLE();
    const nftHasMinter = await nftFactory.hasRole(nftMinterRole, proxyAddress);
    
    if (!nftHasMinter) {
      console.log("Granting MINTER_ROLE to proxy in NFTFactory...");
      await nftFactory.grantRole(nftMinterRole, proxyAddress);
      await nftFactory.waitForDeployment();
      console.log("Granted!");
    } else {
      console.log("Proxy already has MINTER_ROLE in NFTFactory");
    }
  });
});
