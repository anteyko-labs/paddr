'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { UPGRADEABLE_STAKE_MANAGER_ABI } from '@/lib/contracts/upgradeable-stake-manager-abi';
import { STAKE_MANAGER_ADDRESS } from '@/lib/contracts/config';
import { useToast } from '@/hooks/use-toast';

interface Position {
  id: number;
  amount: bigint;
  startTime: bigint;
  duration: bigint;
  nextMintAt: bigint;
  tier: bigint;
  monthIndex: bigint;
  isActive: boolean;
  owner: string;
  configVersion: bigint;
}

export function useAutoNFTMint() {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const { toast } = useToast();
  
  const [positions, setPositions] = useState<Position[]>([]);
  const [mintingPositions, setMintingPositions] = useState<Set<number>>(new Set());
  const [isEnabled, setIsEnabled] = useState(true);

  // Получаем позиции пользователя
  const { data: userPositions, refetch: refetchPositions } = useReadContract({
    address: STAKE_MANAGER_ADDRESS,
    abi: UPGRADEABLE_STAKE_MANAGER_ABI,
    functionName: 'getUserPositions',
    args: [address!],
    query: { 
      enabled: !!address,
      refetchInterval: 30000, // Обновляем каждые 30 секунд
    },
  });

  // Получаем детали всех позиций
  const { data: positionsData, refetch: refetchPositionsData } = useReadContract({
    address: STAKE_MANAGER_ADDRESS,
    abi: UPGRADEABLE_STAKE_MANAGER_ABI,
    functionName: 'positions',
    args: userPositions && userPositions.length > 0 ? [userPositions[0]] : undefined,
    query: { 
      enabled: !!address && !!userPositions && userPositions.length > 0,
      refetchInterval: 30000,
    },
  });

  // Обновляем позиции
  useEffect(() => {
    if (userPositions && positionsData) {
      const newPositions: Position[] = [];
      
      // Получаем детали всех позиций
      userPositions.forEach((positionId, index) => {
        // Здесь нужно получить детали каждой позиции
        // Пока используем данные первой позиции как пример
        if (index === 0 && positionsData) {
          const [amount, startTime, duration, nextMintAt, tier, monthIndex, isActive, owner, configVersion] = positionsData as unknown as any[];
          newPositions.push({
            id: Number(positionId),
            amount,
            startTime,
            duration,
            nextMintAt,
            tier,
            monthIndex,
            isActive,
            owner,
            configVersion,
          });
        }
      });
      
      setPositions(newPositions);
    }
  }, [userPositions, positionsData]);

  // Функция для минтинга NFT
  const mintNFT = useCallback(async (positionId: number) => {
    if (mintingPositions.has(positionId)) return;
    
    setMintingPositions(prev => new Set(prev).add(positionId));
    
    try {
      await writeContractAsync({
        address: STAKE_MANAGER_ADDRESS,
        abi: UPGRADEABLE_STAKE_MANAGER_ABI,
        functionName: 'mintNextNFT',
        args: [BigInt(positionId)],
      });
      
      toast({
        title: 'NFT Minted!',
        description: `NFT successfully minted for position ${positionId}`,
      });
      
      // Обновляем позиции
      await refetchPositions();
      await refetchPositionsData();
      
    } catch (error: any) {
      console.error('NFT mint error:', error);
      
      if (error.message?.includes('Too early for next NFT')) {
        toast({
          title: 'Too Early',
          description: 'Please wait for the next mint time',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Mint Failed',
          description: error.message || 'Failed to mint NFT',
          variant: 'destructive',
        });
      }
    } finally {
      setMintingPositions(prev => {
        const newSet = new Set(prev);
        newSet.delete(positionId);
        return newSet;
      });
    }
  }, [writeContractAsync, mintingPositions, toast, refetchPositions, refetchPositionsData]);

  // Автоматический минтинг
  useEffect(() => {
    if (!isEnabled || !address) return;

    const checkAndMint = () => {
      const now = Math.floor(Date.now() / 1000);
      
      positions.forEach(position => {
        if (position.isActive && Number(position.nextMintAt) <= now) {
          console.log(`Auto-minting NFT for position ${position.id}`);
          mintNFT(position.id);
        }
      });
    };

    // Проверяем каждые 30 секунд
    const interval = setInterval(checkAndMint, 30000);
    
    // Проверяем сразу
    checkAndMint();

    return () => clearInterval(interval);
  }, [positions, isEnabled, address, mintNFT]);

  // Получаем позиции готовые к минтингу
  const getReadyToMintPositions = useCallback(() => {
    const now = Math.floor(Date.now() / 1000);
    return positions.filter(position => 
      position.isActive && 
      Number(position.nextMintAt) <= now &&
      !mintingPositions.has(position.id)
    );
  }, [positions, mintingPositions]);

  // Получаем позиции с таймером до следующего минтинга
  const getPositionsWithTimer = useCallback(() => {
    const now = Math.floor(Date.now() / 1000);
    return positions.map(position => {
      const timeUntilMint = Number(position.nextMintAt) - now;
      return {
        ...position,
        timeUntilMint: Math.max(0, timeUntilMint),
        canMint: timeUntilMint <= 0,
      };
    });
  }, [positions]);

  return {
    positions: getPositionsWithTimer(),
    readyToMintPositions: getReadyToMintPositions(),
    mintNFT,
    isEnabled,
    setIsEnabled,
    mintingPositions,
    refetchPositions,
  };
}
