const { ethers } = require('hardhat');

async function main() {
  console.log('🔍 Проверяем баланс BNB на BSC Testnet...');
  
  const [signer] = await ethers.getSigners();
  console.log('📍 Адрес:', signer.address);
  
  const balance = await signer.provider.getBalance(signer.address);
  const balanceFormatted = ethers.formatEther(balance);
  
  console.log('💰 Баланс BNB:', balanceFormatted, 'BNB');
  
  if (balance === 0n) {
    console.log('\n❌ Баланс 0! Нужно получить тестовые BNB:');
    console.log('🔗 https://testnet.bnbchain.org/faucet');
    console.log('📍 Адрес:', signer.address);
  } else {
    console.log('\n✅ Готово к деплою! Можно запускать:');
    console.log('npx hardhat run scripts/deploy-bsc-testnet.js --network bscTestnet');
  }
}

main().catch(console.error);
