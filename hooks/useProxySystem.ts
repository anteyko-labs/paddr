import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { useToast } from '@/hooks/use-toast';

// ABI для прокси системы (упрощенная версия)
const PROXY_SYSTEM_ABI = [
  {
    "inputs": [],
    "name": "getConfigVersion",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint8", "name": "tier", "type": "uint8"}],
    "name": "getTierConfig",
    "outputs": [
      {
        "components": [
          {"internalType": "uint256", "name": "minAmount", "type": "uint256"},
          {"internalType": "uint256", "name": "maxAmount", "type": "uint256"},
          {"internalType": "uint256", "name": "duration", "type": "uint256"},
          {"internalType": "uint256", "name": "rewardRate", "type": "uint256"},
          {"internalType": "uint256", "name": "nftMultiplier", "type": "uint256"},
          {"internalType": "bool", "name": "isActive", "type": "bool"}
        ],
        "internalType": "struct TierWeightManager.TierConfig",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getActiveTiers",
    "outputs": [{"internalType": "uint8[]", "name": "", "type": "uint8[]"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

interface TierConfig {
  minAmount: bigint;
  maxAmount: bigint;
  duration: bigint;
  rewardRate: bigint;
  nftMultiplier: bigint;
  isActive: boolean;
}

interface ProxySystemData {
  configVersion: bigint;
  tiers: Record<number, TierConfig>;
  activeTiers: number[];
  isLoading: boolean;
  error: string | null;
}

// Адреса прокси системы (нужно будет обновить после деплоя)
const PROXY_ADDRESSES = {
  PROXY_CONTRACT: '0x58aeA581CA3C470C4f2B1A5DDC251b106Dd363c2',
  TIER_WEIGHT_MANAGER: '0x0503a0CD303525e01d06fa9f9D41830304aC520c',
} as const;

export function useProxySystem(): ProxySystemData {
  const { address } = useAccount();
  const { toast } = useToast();
  
  const [data, setData] = useState<ProxySystemData>({
    configVersion: BigInt(0),
    tiers: {},
    activeTiers: [],
    isLoading: true,
    error: null,
  });

  // Читаем версию конфигурации
  const { data: configVersion, isLoading: isLoadingVersion } = useReadContract({
    address: PROXY_ADDRESSES.PROXY_CONTRACT,
    abi: PROXY_SYSTEM_ABI,
    functionName: 'getConfigVersion',
    query: { enabled: !!address },
  });

  // Читаем активные тиры
  const { data: activeTiers, isLoading: isLoadingTiers } = useReadContract({
    address: PROXY_ADDRESSES.PROXY_CONTRACT,
    abi: PROXY_SYSTEM_ABI,
    functionName: 'getActiveTiers',
    query: { enabled: !!address },
  });

  // Читаем конфигурацию каждого тира
  const { data: bronzeConfig, isLoading: isLoadingBronze } = useReadContract({
    address: PROXY_ADDRESSES.PROXY_CONTRACT,
    abi: PROXY_SYSTEM_ABI,
    functionName: 'getTierConfig',
    args: [0],
    query: { enabled: !!address },
  });

  const { data: silverConfig, isLoading: isLoadingSilver } = useReadContract({
    address: PROXY_ADDRESSES.PROXY_CONTRACT,
    abi: PROXY_SYSTEM_ABI,
    functionName: 'getTierConfig',
    args: [1],
    query: { enabled: !!address },
  });

  const { data: goldConfig, isLoading: isLoadingGold } = useReadContract({
    address: PROXY_ADDRESSES.PROXY_CONTRACT,
    abi: PROXY_SYSTEM_ABI,
    functionName: 'getTierConfig',
    args: [2],
    query: { enabled: !!address },
  });

  const { data: platinumConfig, isLoading: isLoadingPlatinum } = useReadContract({
    address: PROXY_ADDRESSES.PROXY_CONTRACT,
    abi: PROXY_SYSTEM_ABI,
    functionName: 'getTierConfig',
    args: [3],
    query: { enabled: !!address },
  });

  useEffect(() => {
    const isLoading = isLoadingVersion || isLoadingTiers || isLoadingBronze || 
                     isLoadingSilver || isLoadingGold || isLoadingPlatinum;

    if (!isLoading) {
      const tiers: Record<number, TierConfig> = {};
      
      if (bronzeConfig) tiers[0] = bronzeConfig;
      if (silverConfig) tiers[1] = silverConfig;
      if (goldConfig) tiers[2] = goldConfig;
      if (platinumConfig) tiers[3] = platinumConfig;

      setData({
        configVersion: configVersion || BigInt(0),
        tiers,
        activeTiers: [...(activeTiers || [])],
        isLoading: false,
        error: null,
      });
    }
  }, [
    configVersion,
    activeTiers,
    bronzeConfig,
    silverConfig,
    goldConfig,
    platinumConfig,
    isLoadingVersion,
    isLoadingTiers,
    isLoadingBronze,
    isLoadingSilver,
    isLoadingGold,
    isLoadingPlatinum,
  ]);

  return data;
}

// Хук для обновления тиров (только для админов)
export function useTierUpdater() {
  const { writeContractAsync } = useWriteContract();
  const { toast } = useToast();

  const updateTier = async (tierId: number, newConfig: Partial<TierConfig>) => {
    try {
      // Здесь будет вызов смарт-контракта для обновления тира
      // Пока что обновляем через API
      const response = await fetch('/api/admin/tiers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tierId,
          updates: newConfig,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update tier');
      }

      toast({
        title: 'Тир обновлен',
        description: `Тир ${tierId} успешно обновлен`,
      });

      return true;
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить тир',
        variant: 'destructive',
      });
      return false;
    }
  };

  const toggleTierActive = async (tierId: number, isActive: boolean) => {
    return updateTier(tierId, { isActive });
  };

  const updateTierAmount = async (tierId: number, minAmount: bigint, maxAmount: bigint) => {
    return updateTier(tierId, { minAmount, maxAmount });
  };

  const updateTierDuration = async (tierId: number, duration: bigint) => {
    return updateTier(tierId, { duration });
  };

  const updateTierRewardRate = async (tierId: number, rewardRate: bigint) => {
    return updateTier(tierId, { rewardRate });
  };

  const updateTierNFTMultiplier = async (tierId: number, nftMultiplier: bigint) => {
    return updateTier(tierId, { nftMultiplier });
  };

  return {
    updateTier,
    toggleTierActive,
    updateTierAmount,
    updateTierDuration,
    updateTierRewardRate,
    updateTierNFTMultiplier,
  };
}

// Хук для проверки обновлений конфигурации
export function useConfigUpdates() {
  const { configVersion, tiers } = useProxySystem();
  const [lastKnownVersion, setLastKnownVersion] = useState<bigint>(BigInt(0));

  useEffect(() => {
    if (configVersion > lastKnownVersion) {
      setLastKnownVersion(configVersion);
      
      // Здесь можно добавить уведомления о новых обновлениях
      console.log('Configuration updated to version:', configVersion.toString());
    }
  }, [configVersion, lastKnownVersion]);

  const hasUpdates = configVersion > lastKnownVersion;

  return {
    hasUpdates,
    currentVersion: configVersion,
    lastKnownVersion,
  };
}

