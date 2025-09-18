const { ethers } = require('ethers');

// BSC Testnet конфигурация
const BSC_RPC = 'https://data-seed-prebsc-1-s1.binance.org:8545/';
const PAD_TOKEN_ADDRESS = '0x6e54ef83eD01B718c92DDEb2629E9849eDe5b94F';
const USER_ADDRESS = '0x513756b7eD711c472537cb497833c5d5Eb02A3Df';

const ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function allowance(address,address) view returns (uint256)"
];

async function checkUserBalance() {
  console.log('🔍 Проверяем баланс пользователя...\n');
  
  try {
    const provider = new ethers.JsonRpcProvider(BSC_RPC);
    const padToken = new ethers.Contract(PAD_TOKEN_ADDRESS, ERC20_ABI, provider);
    
    // Проверяем баланс PAD токенов
    const balance = await padToken.balanceOf(USER_ADDRESS);
    const balanceFormatted = ethers.formatEther(balance);
    
    console.log(`💰 Баланс PAD токенов: ${balanceFormatted} PAD`);
    
    if (balance === 0n) {
      console.log('\n❌ У вас нет PAD токенов!');
      console.log('🔧 Нужно получить токены от деплоера...');
      
      // Проверяем баланс деплоера
      const deployerAddress = '0x513756b7eD711c472537cb497833c5d5Eb02A3Df';
      const deployerBalance = await padToken.balanceOf(deployerAddress);
      const deployerBalanceFormatted = ethers.formatEther(deployerBalance);
      
      console.log(`\n📊 Баланс деплоера: ${deployerBalanceFormatted} PAD`);
      
      if (deployerBalance > 0n) {
        console.log('✅ Деплоер может отправить токены');
        console.log('💡 Нужно вызвать transfer() от деплоера к пользователю');
      }
    } else {
      console.log('✅ У вас есть PAD токены!');
      
      // Проверяем allowance для StakeManager
      const STAKE_MANAGER_ADDRESS = '0xdFb58CEe97B91178555CfAC3bE976e925F9De2e3';
      const allowance = await padToken.allowance(USER_ADDRESS, STAKE_MANAGER_ADDRESS);
      const allowanceFormatted = ethers.formatEther(allowance);
      
      console.log(`🔐 Allowance для StakeManager: ${allowanceFormatted} PAD`);
      
      if (allowance === 0n) {
        console.log('⚠️ Нужно одобрить StakeManager для траты токенов');
      } else {
        console.log('✅ Allowance настроен');
      }
    }
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  }
}

checkUserBalance().catch(console.error);
