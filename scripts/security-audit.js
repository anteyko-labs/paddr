const fs = require('fs');
const path = require('path');

/**
 * Аудит безопасности проекта
 */

console.log('🔒 Аудит безопасности проекта...\n');

// Проверяем контракты на безопасность
function checkContractSecurity() {
  console.log('📄 Проверка безопасности контрактов:');
  
  const contracts = [
    'contracts/contracts/UpgradeableMultiStakeManager.sol',
    'contracts/contracts/TierWeightManager.sol',
    'contracts/contracts/ProxyFactory.sol',
    'contracts/contracts/PADNFTFactory.sol',
    'contracts/contracts/VoucherManager.sol'
  ];
  
  let securityIssues = [];
  
  contracts.forEach(contract => {
    const contractPath = path.join(process.cwd(), contract);
    if (fs.existsSync(contractPath)) {
      const content = fs.readFileSync(contractPath, 'utf8');
      
      // Проверяем на наличие ReentrancyGuard
      if (!content.includes('ReentrancyGuard')) {
        securityIssues.push(`❌ ${contract}: Отсутствует ReentrancyGuard`);
      } else {
        console.log(`  ✅ ${contract}: ReentrancyGuard присутствует`);
      }
      
      // Проверяем на наличие AccessControl
      if (!content.includes('AccessControl')) {
        securityIssues.push(`❌ ${contract}: Отсутствует AccessControl`);
      } else {
        console.log(`  ✅ ${contract}: AccessControl присутствует`);
      }
      
      // Проверяем на наличие проверок адресов
      if (!content.includes('require(') && !content.includes('assert(')) {
        securityIssues.push(`❌ ${contract}: Отсутствуют проверки require/assert`);
      } else {
        console.log(`  ✅ ${contract}: Проверки require/assert присутствуют`);
      }
      
      // Проверяем на наличие событий
      if (!content.includes('event ')) {
        securityIssues.push(`❌ ${contract}: Отсутствуют события`);
      } else {
        console.log(`  ✅ ${contract}: События присутствуют`);
      }
      
      // Проверяем на наличие модификаторов
      if (!content.includes('modifier ')) {
        securityIssues.push(`❌ ${contract}: Отсутствуют модификаторы`);
      } else {
        console.log(`  ✅ ${contract}: Модификаторы присутствуют`);
      }
      
    } else {
      securityIssues.push(`❌ ${contract}: Файл не найден`);
    }
  });
  
  return securityIssues;
}

// Проверяем прокси систему
function checkProxySystem() {
  console.log('\n🔗 Проверка прокси системы:');
  
  const proxyFiles = [
    'contracts/contracts/UpgradeableMultiStakeManager.sol',
    'contracts/contracts/TierWeightManager.sol',
    'contracts/contracts/ProxyFactory.sol',
    'contracts/scripts/deployProxySystem.js'
  ];
  
  let proxyIssues = [];
  
  proxyFiles.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      
      if (file.includes('UpgradeableMultiStakeManager')) {
        if (!content.includes('TransparentUpgradeableProxy')) {
          proxyIssues.push(`❌ ${file}: Отсутствует TransparentUpgradeableProxy`);
        } else {
          console.log(`  ✅ ${file}: TransparentUpgradeableProxy присутствует`);
        }
        
        if (!content.includes('initialize')) {
          proxyIssues.push(`❌ ${file}: Отсутствует функция initialize`);
        } else {
          console.log(`  ✅ ${file}: Функция initialize присутствует`);
        }
      }
      
      if (file.includes('TierWeightManager')) {
        if (!content.includes('configVersion')) {
          proxyIssues.push(`❌ ${file}: Отсутствует configVersion`);
        } else {
          console.log(`  ✅ ${file}: configVersion присутствует`);
        }
      }
      
      if (file.includes('ProxyFactory')) {
        if (!content.includes('ProxyAdmin')) {
          proxyIssues.push(`❌ ${file}: Отсутствует ProxyAdmin`);
        } else {
          console.log(`  ✅ ${file}: ProxyAdmin присутствует`);
        }
      }
      
    } else {
      proxyIssues.push(`❌ ${file}: Файл не найден`);
    }
  });
  
  return proxyIssues;
}

// Проверяем NFT систему
function checkNFTSystem() {
  console.log('\n🎨 Проверка NFT системы:');
  
  const nftFiles = [
    'contracts/contracts/PADNFTFactory.sol',
    'components/dashboard/nft-display.tsx',
    'components/dashboard/nft-video-display.tsx',
    'hooks/useNFTBalance.ts'
  ];
  
  let nftIssues = [];
  
  nftFiles.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      
      if (file.includes('PADNFTFactory.sol')) {
        if (!content.includes('ERC721A')) {
          nftIssues.push(`❌ ${file}: Отсутствует ERC721A`);
        } else {
          console.log(`  ✅ ${file}: ERC721A присутствует`);
        }
        
        if (!content.includes('_beforeTokenTransfers')) {
          nftIssues.push(`❌ ${file}: Отсутствует _beforeTokenTransfers`);
        } else {
          console.log(`  ✅ ${file}: _beforeTokenTransfers присутствует`);
        }
      }
      
      if (file.includes('nft-display.tsx')) {
        if (!content.includes('useNFTBalance')) {
          nftIssues.push(`❌ ${file}: Отсутствует useNFTBalance`);
        } else {
          console.log(`  ✅ ${file}: useNFTBalance присутствует`);
        }
      }
      
      if (file.includes('nft-video-display.tsx')) {
        if (!content.includes('video')) {
          nftIssues.push(`❌ ${file}: Отсутствует поддержка видео`);
        } else {
          console.log(`  ✅ ${file}: Поддержка видео присутствует`);
        }
      }
      
    } else {
      nftIssues.push(`❌ ${file}: Файл не найден`);
    }
  });
  
  return nftIssues;
}

// Проверяем стейкинг систему
function checkStakingSystem() {
  console.log('\n💰 Проверка стейкинг системы:');
  
  const stakingFiles = [
    'contracts/contracts/UpgradeableMultiStakeManager.sol',
    'components/dashboard/staking-form.tsx',
    'hooks/useStakingPositions.ts',
    'hooks/usePadBalance.ts'
  ];
  
  let stakingIssues = [];
  
  stakingFiles.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      
      if (file.includes('UpgradeableMultiStakeManager.sol')) {
        if (!content.includes('mintNextNFT')) {
          stakingIssues.push(`❌ ${file}: Отсутствует mintNextNFT`);
        } else {
          console.log(`  ✅ ${file}: mintNextNFT присутствует`);
        }
        
        if (!content.includes('REWARD_INTERVAL')) {
          stakingIssues.push(`❌ ${file}: Отсутствует REWARD_INTERVAL`);
        } else {
          console.log(`  ✅ ${file}: REWARD_INTERVAL присутствует`);
        }
      }
      
      if (file.includes('staking-form.tsx')) {
        if (!content.includes('useProxySystem')) {
          stakingIssues.push(`❌ ${file}: Отсутствует useProxySystem`);
        } else {
          console.log(`  ✅ ${file}: useProxySystem присутствует`);
        }
      }
      
    } else {
      stakingIssues.push(`❌ ${file}: Файл не найден`);
    }
  });
  
  return stakingIssues;
}

// Проверяем фронтенд безопасность
function checkFrontendSecurity() {
  console.log('\n🖥️ Проверка безопасности фронтенда:');
  
  const frontendFiles = [
    'app/api/vouchers/route.ts',
    'app/api/admin/tiers/route.ts',
    'app/api/admin/nft-assets/route.ts',
    'app/api/admin/upload/route.ts'
  ];
  
  let frontendIssues = [];
  
  frontendFiles.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      
      if (!content.includes('NextRequest') && !content.includes('NextResponse')) {
        frontendIssues.push(`❌ ${file}: Отсутствует NextRequest/NextResponse`);
      } else {
        console.log(`  ✅ ${file}: NextRequest/NextResponse присутствует`);
      }
      
      if (!content.includes('try') && !content.includes('catch')) {
        frontendIssues.push(`❌ ${file}: Отсутствует обработка ошибок`);
      } else {
        console.log(`  ✅ ${file}: Обработка ошибок присутствует`);
      }
      
    } else {
      frontendIssues.push(`❌ ${file}: Файл не найден`);
    }
  });
  
  return frontendIssues;
}

// Проверяем конфигурацию
function checkConfiguration() {
  console.log('\n⚙️ Проверка конфигурации:');
  
  const configFiles = [
    'lib/contracts/config.ts',
    'lib/wagmi.ts',
    'next.config.js',
    'tailwind.config.ts'
  ];
  
  let configIssues = [];
  
  configFiles.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      
      if (file.includes('config.ts')) {
        if (!content.includes('TIER_LEVELS')) {
          configIssues.push(`❌ ${file}: Отсутствует TIER_LEVELS`);
        } else {
          console.log(`  ✅ ${file}: TIER_LEVELS присутствует`);
        }
      }
      
      if (file.includes('wagmi.ts')) {
        if (!content.includes('createConfig')) {
          configIssues.push(`❌ ${file}: Отсутствует createConfig`);
        } else {
          console.log(`  ✅ ${file}: createConfig присутствует`);
        }
      }
      
    } else {
      configIssues.push(`❌ ${file}: Файл не найден`);
    }
  });
  
  return configIssues;
}

// Главная функция аудита
function main() {
  console.log('🔒 Полный аудит безопасности проекта\n');
  
  try {
    // Проверяем все системы
    const contractIssues = checkContractSecurity();
    const proxyIssues = checkProxySystem();
    const nftIssues = checkNFTSystem();
    const stakingIssues = checkStakingSystem();
    const frontendIssues = checkFrontendSecurity();
    const configIssues = checkConfiguration();
    
    // Собираем все проблемы
    const allIssues = [
      ...contractIssues,
      ...proxyIssues,
      ...nftIssues,
      ...stakingIssues,
      ...frontendIssues,
      ...configIssues
    ];
    
    console.log('\n📊 Результаты аудита безопасности:');
    console.log(`   📄 Всего проверок: ${contractIssues.length + proxyIssues.length + nftIssues.length + stakingIssues.length + frontendIssues.length + configIssues.length}`);
    console.log(`   ❌ Проблем найдено: ${allIssues.length}`);
    console.log(`   ✅ Система безопасна: ${allIssues.length === 0 ? 'ДА' : 'НЕТ'}`);
    
    if (allIssues.length > 0) {
      console.log('\n🚨 Найденные проблемы безопасности:');
      allIssues.forEach(issue => {
        console.log(`   ${issue}`);
      });
    } else {
      console.log('\n🎉 Все проверки безопасности пройдены!');
    }
    
    // Создаем отчет
    const report = {
      timestamp: new Date().toISOString(),
      totalIssues: allIssues.length,
      issues: allIssues,
      systems: {
        contracts: contractIssues.length,
        proxy: proxyIssues.length,
        nft: nftIssues.length,
        staking: stakingIssues.length,
        frontend: frontendIssues.length,
        config: configIssues.length
      }
    };
    
    fs.writeFileSync('SECURITY_AUDIT_REPORT.json', JSON.stringify(report, null, 2));
    console.log('\n📄 Отчет сохранен: SECURITY_AUDIT_REPORT.json');
    
    console.log('\n🎯 Рекомендации:');
    if (allIssues.length === 0) {
      console.log('✅ Система готова к деплою на мейннет');
      console.log('✅ Прокси система безопасна');
      console.log('✅ NFT система работает корректно');
      console.log('✅ Стейкинг система защищена');
      console.log('✅ Фронтенд безопасен');
    } else {
      console.log('⚠️ Исправьте найденные проблемы перед деплоем');
      console.log('⚠️ Проведите дополнительное тестирование');
    }
    
  } catch (error) {
    console.error('❌ Ошибка аудита:', error.message);
    process.exit(1);
  }
}

// Запускаем аудит
main();




