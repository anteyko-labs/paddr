const { ethers } = require('hardhat');

// Копируем функции форматирования из config.ts
function formatTokenAmount(amount, decimals = 18) {
  const divisor = BigInt(10 ** decimals);
  const whole = amount / divisor;
  const fraction = amount % divisor;
  if (fraction === BigInt(0)) {
    return whole.toString();
  }
  const fractionStr = fraction.toString().padStart(decimals, '0');
  const trimmedFraction = fractionStr.replace(/0+$/, '');
  return `${whole}.${trimmedFraction}`;
}

function formatDuration(seconds) {
  const days = Math.floor(Number(seconds) / 86400);
  const hours = Math.floor((Number(seconds) % 86400) / 3600);
  let res = '';
  if (days > 0) res += `${days} day${days > 1 ? 's' : ''} `;
  if (hours > 0) res += `${hours} hour${hours > 1 ? 's' : ''}`;
  return res.trim() || '0 hours';
}

function formatDate(timestamp) {
  return new Date(Number(timestamp) * 1000).toLocaleDateString();
}

async function main() {
  console.log('🧪 Testing formatting functions...\n');
  
  // Тестируем с данными из позиции 3
  const amount = BigInt('1000000000000000000000'); // 1000 PAD
  const duration = BigInt('7776000'); // 90 days
  const startTime = BigInt('1757576088'); // timestamp
  
  console.log('📋 Test data:');
  console.log('  - Amount (raw):', amount.toString());
  console.log('  - Duration (raw):', duration.toString());
  console.log('  - Start Time (raw):', startTime.toString());
  
  console.log('\n🧪 Testing formatTokenAmount:');
  try {
    const formattedAmount = formatTokenAmount(amount);
    console.log('  - Result:', formattedAmount);
    console.log('  - Expected: 1000');
    console.log('  - Match:', formattedAmount === '1000' ? '✅' : '❌');
  } catch (error) {
    console.log('  - Error:', error.message);
  }
  
  console.log('\n🧪 Testing formatDuration:');
  try {
    const formattedDuration = formatDuration(duration);
    console.log('  - Result:', formattedDuration);
    console.log('  - Expected: 90 days');
    console.log('  - Match:', formattedDuration === '90 days' ? '✅' : '❌');
  } catch (error) {
    console.log('  - Error:', error.message);
  }
  
  console.log('\n🧪 Testing formatDate:');
  try {
    const formattedDate = formatDate(startTime);
    console.log('  - Result:', formattedDate);
    console.log('  - Expected: 11.09.2025');
    console.log('  - Match:', formattedDate.includes('2025') ? '✅' : '❌');
  } catch (error) {
    console.log('  - Error:', error.message);
  }
  
  // Тестируем с неправильными типами данных
  console.log('\n🧪 Testing with wrong data types:');
  
  // Тест 1: amount как строка
  try {
    const amountStr = '1000000000000000000000';
    const formattedAmountStr = formatTokenAmount(BigInt(amountStr));
    console.log('  - Amount as string:', formattedAmountStr);
  } catch (error) {
    console.log('  - Amount as string error:', error.message);
  }
  
  // Тест 2: duration как число
  try {
    const durationNum = 7776000;
    const formattedDurationNum = formatDuration(BigInt(durationNum));
    console.log('  - Duration as number:', formattedDurationNum);
  } catch (error) {
    console.log('  - Duration as number error:', error.message);
  }
  
  // Тест 3: startTime как число
  try {
    const startTimeNum = 1757576088;
    const formattedDateNum = formatDate(BigInt(startTimeNum));
    console.log('  - Start time as number:', formattedDateNum);
  } catch (error) {
    console.log('  - Start time as number error:', error.message);
  }
  
  console.log('\n🎉 Formatting test complete!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
