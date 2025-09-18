'use client';

import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { bscTestnet, sepolia, mainnet } from 'wagmi/chains';
import { ReactNode } from 'react';

// Создаем QueryClient для wagmi
const queryClient = new QueryClient();

// Конфигурируем wagmi с правильными настройками
const config = createConfig({
  chains: [bscTestnet, sepolia, mainnet],
  transports: {
    [bscTestnet.id]: http(process.env.NEXT_PUBLIC_BSC_TESTNET_RPC_URL || 'https://data-seed-prebsc-1-s1.binance.org:8545/'),
    [sepolia.id]: http(process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || 'https://sepolia.infura.io/v3/9c259df705904ba5b2cbd4a10d00e7df'),
    [mainnet.id]: http(),
  },
});

interface RainbowProviderProps {
  children: ReactNode;
}

export function RainbowProvider({ children }: RainbowProviderProps) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          locale="en-US"
          showRecentTransactions={true}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
} 