import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia, mainnet, bscTestnet } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'PADD-R Platform',
  projectId: 'YOUR_PROJECT_ID', // Можно оставить пустым для локальной разработки
  chains: [bscTestnet, sepolia, mainnet], // BSC Testnet первый
  ssr: true,
});

// Конфигурация для BSC Testnet сети
export const bscTestnetConfig = {
  chainId: 97,
  name: 'BSC Testnet',
  network: 'bscTestnet',
  nativeCurrency: {
    name: 'BNB',
    symbol: 'tBNB',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://data-seed-prebsc-1-s1.binance.org:8545/'],
    },
    public: {
      http: ['https://data-seed-prebsc-1-s1.binance.org:8545/'],
    },
  },
  blockExplorers: {
    default: {
      name: 'BSC Testnet Explorer',
      url: 'https://testnet.bscscan.com',
    },
  },
  testnet: true,
};

// Конфигурация для Sepolia сети (legacy)
export const sepoliaConfig = {
  chainId: 11155111,
  name: 'Sepolia',
  network: 'sepolia',
  nativeCurrency: {
    name: 'Sepolia Ether',
    symbol: 'SEP',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://sepolia.infura.io/v3/YOUR_INFURA_KEY'],
    },
    public: {
      http: ['https://sepolia.infura.io/v3/YOUR_INFURA_KEY'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Sepolia Etherscan',
      url: 'https://sepolia.etherscan.io',
    },
  },
  testnet: true,
}; 