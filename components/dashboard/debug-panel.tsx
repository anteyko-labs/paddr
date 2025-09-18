'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useStakingPositions } from '@/hooks/useStakingPositions';
// import { useVouchersSimple } from '@/hooks/useVouchersSimple'; // Файл удален
import { useNFTBalance } from '@/hooks/useNFTBalance';
import { usePadBalance } from '@/hooks/usePadBalance';
import { useAccount } from 'wagmi';

// Функция для безопасной сериализации BigInt
const safeStringify = (obj: any): string => {
  return JSON.stringify(obj, (key, value) => {
    if (typeof value === 'bigint') {
      return value.toString();
    }
    return value;
  }, 2);
};

export function DebugPanel() {
  const { address } = useAccount();
  const { balance, isLoading: isLoadingBalance } = usePadBalance();
  const { positions, isLoading: isLoadingPositions, totalPositions } = useStakingPositions();
  // const { vouchers, isLoading: isLoadingVouchers, voucherIds } = useVouchersSimple(); // Файл удален
  const vouchers: any[] = [];
  const isLoadingVouchers = false;
  const voucherIds: any[] = [];
  const { nfts, isLoading: isLoadingNFTs } = useNFTBalance();

  return (
    <Card className="bg-red-900/20 border-red-800">
      <CardHeader>
        <CardTitle className="text-red-400">🔍 DEBUG PANEL</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-white font-semibold mb-2">👤 User Info</h3>
          <p className="text-gray-300">Address: {address || 'Not connected'}</p>
        </div>

        <div>
          <h3 className="text-white font-semibold mb-2">💰 Balance</h3>
          <p className="text-gray-300">
            Loading: {isLoadingBalance ? 'Yes' : 'No'} | 
            Balance: {balance ? balance.toString() : 'No balance'}
          </p>
        </div>

        <div>
          <h3 className="text-white font-semibold mb-2">📊 Staking Positions</h3>
          <p className="text-gray-300">
            Loading: {isLoadingPositions ? 'Yes' : 'No'} | 
            Total Positions: {totalPositions} | 
            Positions Array Length: {positions?.length || 0}
          </p>
          <div className="mt-2">
            <p className="text-gray-300 text-sm">Positions Data:</p>
            <pre className="text-xs text-gray-400 bg-gray-800 p-2 rounded mt-1 overflow-auto max-h-32">
              {safeStringify(positions)}
            </pre>
          </div>
        </div>

        <div>
          <h3 className="text-white font-semibold mb-2">🎫 Vouchers</h3>
          <p className="text-gray-300">
            Loading: {isLoadingVouchers ? 'Yes' : 'No'} | 
            Voucher IDs: {voucherIds?.length || 0} | 
            Vouchers Array Length: {vouchers?.length || 0}
          </p>
          <div className="mt-2">
            <p className="text-gray-300 text-sm">Vouchers Data:</p>
            <pre className="text-xs text-gray-400 bg-gray-800 p-2 rounded mt-1 overflow-auto max-h-32">
              {safeStringify(vouchers)}
            </pre>
          </div>
        </div>

        <div>
          <h3 className="text-white font-semibold mb-2">🖼️ NFTs</h3>
          <p className="text-gray-300">
            Loading: {isLoadingNFTs ? 'Yes' : 'No'} | 
            NFTs Array Length: {nfts?.length || 0}
          </p>
          <div className="mt-2">
            <p className="text-gray-300 text-sm">NFTs Data:</p>
            <pre className="text-xs text-gray-400 bg-gray-800 p-2 rounded mt-1 overflow-auto max-h-32">
              {safeStringify(nfts)}
            </pre>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
