'use client';

import { useAccount } from 'wagmi';
import { useReadContract, useReadContracts } from 'wagmi';
import { UPGRADEABLE_STAKE_MANAGER_ABI } from '@/lib/contracts/upgradeable-stake-manager-abi';
import { STAKE_MANAGER_ADDRESS, formatTokenAmount, formatDuration, formatDate, TIER_LEVELS } from '@/lib/contracts/config';

export function useStakingPositions() {
  const { address } = useAccount();
  const contractAddress = STAKE_MANAGER_ADDRESS;
  
  console.log('🔍 useStakingPositions called with address:', address);
  console.log('🔍 Contract address:', contractAddress);

  // Получаем список ID позиций пользователя
  const { data: positionIds, isLoading: isLoadingIds, refetch: refetchIds } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: UPGRADEABLE_STAKE_MANAGER_ABI,
    functionName: 'getUserPositions',
    args: [address!],
    query: { 
      enabled: !!address,
      refetchInterval: 2000, // Обновляем каждые 2 секунды
      refetchOnWindowFocus: true,
      staleTime: 0, // Всегда считаем данные устаревшими
    },
  });

  // Фильтруем только bigint id
  const positionIdList: bigint[] = Array.isArray(positionIds) ? positionIds.filter((id): id is bigint => typeof id === 'bigint') : [];
  
  console.log('🔍 positionIds:', positionIds);
  console.log('🔍 positionIdList:', positionIdList);
  console.log('🔍 positionIdList length:', positionIdList.length);

  // Получаем все позиции батчем
  const { data: positionsData, isLoading: isLoadingPositions, refetch: refetchPositions } = useReadContracts({
    contracts: positionIdList.map((id) => ({
      address: contractAddress as `0x${string}`,
      abi: UPGRADEABLE_STAKE_MANAGER_ABI,
      functionName: 'positions',
      args: [id],
    })),
    query: { 
      enabled: positionIdList.length > 0,
      refetchInterval: 2000, // Обновляем каждые 2 секунды
      refetchOnWindowFocus: true,
      staleTime: 0, // Всегда считаем данные устаревшими
    },
  });

  // Получаем все награды батчем
  const { data: rewardsData, isLoading: isLoadingRewards, refetch: refetchRewards } = useReadContracts({
    contracts: positionIdList.map((id) => ({
      address: contractAddress as `0x${string}`,
      abi: UPGRADEABLE_STAKE_MANAGER_ABI,
      functionName: 'calculateRewards',
      args: [id],
    })),
    query: { enabled: positionIdList.length > 0 },
  });

  // Форматируем все позиции строго по индексам positionIdList
  const positions = positionIdList
    .map((id, idx) => {
      const pos = positionsData?.[idx];
      console.log(`🔍 Position ${idx}:`, pos);
      if (!pos || !pos.result) {
        console.log(`❌ Position ${idx}: no result`);
        return null;
      }
      const result: unknown = pos.result;
      console.log(`🔍 Position ${idx} result:`, result);
      if (!Array.isArray(result) || result.length < 9) {
        console.log(`❌ Position ${idx}: invalid result length`, Array.isArray(result) ? result.length : 'not array');
        return null;
      }
      const [positionId, owner, amount, startTime, duration, tier, isActive, lastClaimTime, totalClaimed] = result;
      
      // Конвертируем в правильные типы
      const amountBigInt = typeof amount === 'bigint' ? amount : BigInt(Math.floor(Number(amount)));
      const startTimeBigInt = typeof startTime === 'bigint' ? startTime : BigInt(Math.floor(Number(startTime)));
      const durationBigInt = typeof duration === 'bigint' ? duration : BigInt(Math.floor(Number(duration)));
      
      // Рассчитываем когда можно забрать следующий NFT (каждый месяц)
      const REWARD_INTERVAL = 30 * 24 * 60 * 60; // 30 дней в секундах
      const nextMintAt = startTimeBigInt + BigInt(REWARD_INTERVAL);
      const monthIndex = BigInt(0); // Временно
      const tierNumber = Number(tier);
      const tierInfo = TIER_LEVELS[tierNumber as keyof typeof TIER_LEVELS];
      const rawRewards = rewardsData?.[idx]?.result ?? BigInt(0);
      const rewards = typeof rawRewards === 'bigint' ? rawRewards : 
                     Array.isArray(rawRewards) ? BigInt(0) : 
                     typeof rawRewards === 'number' ? BigInt(rawRewards) :
                     typeof rawRewards === 'string' ? BigInt(rawRewards) :
                     BigInt(0);
      // Используем время блокчейна, но защищаемся от отрицательного прогресса
      const now = Math.floor(Date.now() / 1000);
      const startTimeNum = Number(startTimeBigInt);
      const endTime = startTimeNum + Number(durationBigInt);
      
      // Если startTime в будущем, используем текущее время как начало
      const actualStartTime = Math.min(startTimeNum, now);
      const position = {
        id: Number(id),
        amount: amountBigInt,
        startTime: startTimeBigInt,
        duration: durationBigInt,
        nextMintAt,
        tier: tierNumber,
        monthIndex: Number(monthIndex),
        isActive,
        owner,
        rewards,
        formattedAmount: formatTokenAmount(amountBigInt),
        formattedDuration: formatDuration(durationBigInt),
        formattedStartDate: formatDate(startTimeBigInt),
        formattedNextMintDate: formatDate(nextMintAt),
        formattedRewards: formatTokenAmount(typeof rewards === 'bigint' ? rewards : BigInt(rewards)),
        tierInfo,
        isMature: now >= endTime,
        secondsRemaining: Math.max(0, endTime - now),
        secondsUntilNextMint: Math.max(0, Number(nextMintAt) - now),
        // Правильный расчет прогресса (0-100%)
        progress: Math.max(0, Math.min(100, ((now - actualStartTime) / (endTime - actualStartTime)) * 100)),
      };
      
      console.log(`✅ Position ${idx} created:`, position);
      return position;
    })
    .filter((pos): pos is NonNullable<typeof pos> => !!pos);

  // Разделяем активные и завершённые позиции
  const activePositionsArr = positions.filter(pos => pos.isActive);
  const pastPositions = positions.filter(pos => !pos.isActive);

  // Рассчитываем общую статистику
  const totalStaked = positions.reduce((sum, pos) => sum + Number(pos ? pos.formattedAmount : 0), 0);
  const totalRewards = positions.reduce((sum, pos) => sum + Number(pos ? pos.formattedRewards : 0), 0);
  const activePositions = activePositionsArr.length;

  // Новый: вычисляем максимальный tier среди всех активных позиций
  const maxTier = positions.length > 0 ? Math.max(...activePositionsArr.map(pos => pos.tier ?? 0)) : 0;
  const currentTier = TIER_LEVELS[maxTier as keyof typeof TIER_LEVELS]?.name || 'None';

  console.log('🔍 Final positions:', positions);
  console.log('🔍 Final positions length:', positions.length);
  console.log('🔍 isLoading:', isLoadingIds || isLoadingPositions || isLoadingRewards);
  
  return {
    positions,
    isLoading: isLoadingIds || isLoadingPositions || isLoadingRewards,
    totalPositions: positionIds?.length || 0,
    activePositions,
    totalStaked,
    totalRewards,
    currentTier,
    nextRewardIn: positions[0]?.secondsUntilNextMint || 0,
    pastPositions,
    refetch: async () => {
      await refetchIds();
      await refetchPositions();
      await refetchRewards();
    },
  };
} 