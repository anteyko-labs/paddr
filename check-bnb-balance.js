const { ethers } = require('ethers');

async function checkBNBBalance() {
  const walletAddress = '0x513756b7eD711c472537cb497833c5d5Eb02A3Df';
  const bscRpc = 'https://data-seed-prebsc-1-s1.binance.org:8545/';
  
  console.log(`🔍 Проверяем баланс BNB для адреса: ${walletAddress}`);
  console.log(`📡 Подключаемся к BSC Testnet...`);
  
  try {
    const provider = new ethers.JsonRpcProvider(bscRpc);
    const balance = await provider.getBalance(walletAddress);
    const balanceFormatted = ethers.formatEther(balance);
    
    console.log(`✅ Баланс BNB: ${balanceFormatted} BNB`);
    
    if (balance === 0n) {
      console.log(`\n💰 Нужно получить тестовые BNB:`);
      console.log(`🔗 https://testnet.bnbchain.org/faucet`);
      console.log(`📍 Адрес: ${walletAddress}`);
    } else {
      console.log(`\n🚀 Готово к деплою! Можно запускать:`);
      console.log(`npx hardhat run scripts/deploy-bsc-testnet.js --network bscTestnet`);
    }
    
  } catch (error) {
    console.error(`❌ Ошибка: ${error.message}`);
  }
}

checkBNBBalance().catch(console.error);
