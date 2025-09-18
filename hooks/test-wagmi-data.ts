'use client';

import { useAccount, useReadContract } from 'wagmi';
import { UPGRADEABLE_STAKE_MANAGER_ABI } from '@/lib/contracts/upgradeable-stake-manager-abi';
import { STAKE_MANAGER_ADDRESS } from '@/lib/contracts/config';

export function useTestWagmiData() {
  const { address } = useAccount();

  // Тестируем получение позиций
  const { data: positionIds, isLoading: isLoadingIds } = useReadContract({
    address: STAKE_MANAGER_ADDRESS as `0x${string}`,
    abi: UPGRADEABLE_STAKE_MANAGER_ABI,
    functionName: 'getUserPositions',
    args: [address!],
    query: { enabled: !!address },
  });

  // Тестируем получение первой позиции (временно отключено из-за ошибок типов)
  const firstPositionData: any = null;

  // Временные данные для ваучеров (файлы удалены)
  const voucherIds: any[] = [];
  const firstVoucherData: any = null;
  const isLoadingVouchers = false;

  console.log('🔍 TEST - Address:', address);
  console.log('🔍 TEST - Position IDs:', positionIds);
  console.log('🔍 TEST - Position IDs type:', typeof positionIds);
  console.log('🔍 TEST - Position IDs is array:', Array.isArray(positionIds));
  console.log('🔍 TEST - First Position Data:', firstPositionData);
  console.log('🔍 TEST - First Position type:', typeof firstPositionData);
  console.log('🔍 TEST - First Position is array:', Array.isArray(firstPositionData));
  console.log('🔍 TEST - Voucher IDs:', voucherIds);
  console.log('🔍 TEST - Voucher IDs type:', typeof voucherIds);
  console.log('🔍 TEST - Voucher IDs is array:', Array.isArray(voucherIds));
  console.log('🔍 TEST - First Voucher Data:', firstVoucherData);
  console.log('🔍 TEST - First Voucher type:', typeof firstVoucherData);
  console.log('🔍 TEST - First Voucher is array:', Array.isArray(firstVoucherData));

  return {
    address,
    positionIds,
    firstPositionData,
    voucherIds,
    firstVoucherData,
    isLoadingIds,
    isLoadingVouchers,
  };
}
