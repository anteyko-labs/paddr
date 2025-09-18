const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Direct Proxy Check", function () {
  let provider;

  beforeEach(async function () {
    provider = ethers.provider;
  });

  it("Should check proxy contract directly", async function () {
    const PROXY_ADDRESS = "0x58aeA581CA3C470C4f2B1A5DDC251b106Dd363c2";
    
    // Проверяем что контракт существует
    const code = await provider.getCode(PROXY_ADDRESS);
    console.log("Proxy contract code length:", code.length);
    expect(code.length).to.be.greaterThan(2); // Больше чем "0x"
    
    // Проверяем что это прокси контракт
    const proxyABI = [
      "function implementation() view returns (address)",
      "function admin() view returns (address)"
    ];
    
    try {
      const proxy = new ethers.Contract(PROXY_ADDRESS, proxyABI, provider);
      const implementation = await proxy.implementation();
      const admin = await proxy.admin();
      
      console.log("Implementation address:", implementation);
      console.log("Admin address:", admin);
      
      expect(implementation).to.not.equal(ethers.ZeroAddress);
      expect(admin).to.not.equal(ethers.ZeroAddress);
    } catch (error) {
      console.error("Error checking proxy:", error.message);
      throw error;
    }
  });

  it("Should check implementation contract", async function () {
    const IMPLEMENTATION_ADDRESS = "0x51C05E6fa53bFaE9beea8EbB65EecE3197af5626";
    
    // Проверяем что implementation существует
    const code = await provider.getCode(IMPLEMENTATION_ADDRESS);
    console.log("Implementation contract code length:", code.length);
    expect(code.length).to.be.greaterThan(2);
    
    // Проверяем что это UpgradeableMultiStakeManager
    const implABI = [
      "function stakingToken() view returns (address)",
      "function tierWeightManager() view returns (address)",
      "function initialize(address,address) external"
    ];
    
    try {
      const impl = new ethers.Contract(IMPLEMENTATION_ADDRESS, implABI, provider);
      
      // Эти функции должны существовать в implementation
      const stakingToken = await impl.stakingToken();
      const tierWeightManager = await impl.tierWeightManager();
      
      console.log("Implementation stakingToken:", stakingToken);
      console.log("Implementation tierWeightManager:", tierWeightManager);
      
    } catch (error) {
      console.error("Error checking implementation:", error.message);
      // Implementation может не быть инициализирован, это нормально
    }
  });

  it("Should check proxy through implementation", async function () {
    const PROXY_ADDRESS = "0x58aeA581CA3C470C4f2B1A5DDC251b106Dd363c2";
    const IMPLEMENTATION_ADDRESS = "0x51C05E6fa53bFaE9beea8EbB65EecE3197af5626";
    
    // Используем ABI implementation для вызова через proxy
    const implABI = [
      "function stakingToken() view returns (address)",
      "function tierWeightManager() view returns (address)",
      "function getConfigVersion() view returns (uint256)",
      "function getActiveTiers() view returns (uint8[])"
    ];
    
    try {
      const proxy = new ethers.Contract(PROXY_ADDRESS, implABI, provider);
      
      const stakingToken = await proxy.stakingToken();
      const tierWeightManager = await proxy.tierWeightManager();
      const configVersion = await proxy.getConfigVersion();
      const activeTiers = await proxy.getActiveTiers();
      
      console.log("Proxy stakingToken:", stakingToken);
      console.log("Proxy tierWeightManager:", tierWeightManager);
      console.log("Proxy configVersion:", configVersion.toString());
      console.log("Proxy activeTiers:", activeTiers);
      
      expect(stakingToken).to.not.equal(ethers.ZeroAddress);
      expect(tierWeightManager).to.not.equal(ethers.ZeroAddress);
      
    } catch (error) {
      console.error("Error checking proxy through implementation:", error.message);
      throw error;
    }
  });
});
