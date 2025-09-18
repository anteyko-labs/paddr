const { ethers } = require('ethers');

// BSC Testnet конфигурация
const BSC_RPC = 'https://data-seed-prebsc-1-s1.binance.org:8545/';
const PAD_TOKEN_ADDRESS = '0x6e54ef83eD01B718c92DDEb2629E9849eDe5b94F';
const STAKE_MANAGER_ADDRESS = '0xdFb58CEe97B91178555CfAC3bE976e925F9De2e3';

// Простой ABI для проверки
const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)"
];

const STAKE_MANAGER_ABI = [
  "function tierCalculator() view returns (address)",
  "function nftFactory() view returns (address)",
  "function stakingToken() view returns (address)"
];

async function testContracts() {
  console.log('🧪 Тестируем подключение к контрактам на BSC Testnet...\n');
  
  try {
    const provider = new ethers.JsonRpcProvider(BSC_RPC);
    console.log('✅ Подключились к BSC Testnet');
    
    // Тестируем PADToken
    console.log('\n📦 Тестируем PADToken...');
    const padToken = new ethers.Contract(PAD_TOKEN_ADDRESS, ERC20_ABI, provider);
    
    const name = await padToken.name();
    const symbol = await padToken.symbol();
    const decimals = await padToken.decimals();
    const totalSupply = await padToken.totalSupply();
    
    console.log(`✅ PADToken: ${name} (${symbol})`);
    console.log(`✅ Decimals: ${decimals}`);
    console.log(`✅ Total Supply: ${ethers.formatEther(totalSupply)} PAD`);
    
    // Тестируем StakeManager
    console.log('\n📦 Тестируем StakeManager...');
    const stakeManager = new ethers.Contract(STAKE_MANAGER_ADDRESS, STAKE_MANAGER_ABI, provider);
    
    const tierCalc = await stakeManager.tierCalculator();
    const nftFactory = await stakeManager.nftFactory();
    const stakingToken = await stakeManager.stakingToken();
    
    console.log(`✅ TierCalculator: ${tierCalc}`);
    console.log(`✅ NFT Factory: ${nftFactory}`);
    console.log(`✅ Staking Token: ${stakingToken}`);
    
    // Проверяем что адреса совпадают
    if (stakingToken.toLowerCase() === PAD_TOKEN_ADDRESS.toLowerCase()) {
      console.log('✅ Staking Token адрес совпадает с PADToken');
    } else {
      console.log('❌ Staking Token адрес НЕ совпадает с PADToken');
      console.log(`Expected: ${PAD_TOKEN_ADDRESS}`);
      console.log(`Actual: ${stakingToken}`);
    }
    
    console.log('\n🎉 Все контракты работают!');
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  }
}

testContracts().catch(console.error);
