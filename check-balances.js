const { ethers } = require('ethers');

// Конфигурация сетей
const networks = {
  sepolia: {
    name: 'Sepolia Testnet',
    rpc: 'https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
    chainId: 11155111,
    tokenAddress: '0xa5d3fF94a7aeDA396666c8978Eec67C209202da0'
  },
  bscTestnet: {
    name: 'BSC Testnet', 
    rpc: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
    chainId: 97,
    tokenAddress: '0xa5d3fF94a7aeDA396666c8978Eec67C209202da0' // Тот же адрес для BSC
  },
  mainnet: {
    name: 'Ethereum Mainnet',
    rpc: 'https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161', 
    chainId: 1,
    tokenAddress: '0xa5d3fF94a7aeDA396666c8978Eec67C209202da0'
  }
};

// ABI для ERC20 токена
const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function name() view returns (string)"
];

async function checkBalances(walletAddress) {
  console.log(`🔍 Проверяем баланс для адреса: ${walletAddress}\n`);
  
  for (const [networkKey, network] of Object.entries(networks)) {
    try {
      console.log(`📡 Подключаемся к ${network.name}...`);
      const provider = new ethers.JsonRpcProvider(network.rpc);
      const contract = new ethers.Contract(network.tokenAddress, ERC20_ABI, provider);
      
      // Проверяем баланс токена
      const balance = await contract.balanceOf(walletAddress);
      const decimals = await contract.decimals();
      const symbol = await contract.symbol();
      const name = await contract.name();
      
      // Проверяем баланс ETH/BNB
      const nativeBalance = await provider.getBalance(walletAddress);
      
      // Форматируем балансы
      const tokenBalance = ethers.formatUnits(balance, decimals);
      const nativeBalanceFormatted = ethers.formatEther(nativeBalance);
      
      console.log(`✅ ${network.name}:`);
      console.log(`   💰 ${symbol} (${name}): ${tokenBalance}`);
      console.log(`   ⛽ ${networkKey === 'bscTestnet' ? 'BNB' : 'ETH'}: ${nativeBalanceFormatted}`);
      console.log(`   🔗 Chain ID: ${network.chainId}`);
      console.log(`   📍 Token Contract: ${network.tokenAddress}\n`);
      
    } catch (error) {
      console.log(`❌ ${network.name}: Ошибка - ${error.message}\n`);
    }
  }
}

// Получаем адрес из аргументов командной строки
const walletAddress = process.argv[2];

if (!walletAddress) {
  console.log('❌ Укажите адрес кошелька:');
  console.log('node check-balances.js 0x...');
  process.exit(1);
}

checkBalances(walletAddress).catch(console.error);
