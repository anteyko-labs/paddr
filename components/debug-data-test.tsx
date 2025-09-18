'use client';

import { useTestWagmiData } from '@/hooks/test-wagmi-data';

// Функция для безопасной сериализации BigInt
function safeStringify(obj: any): string {
  return JSON.stringify(obj, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  );
}

export function DebugDataTest() {
  const testData = useTestWagmiData();

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h2 className="text-xl font-bold mb-4">🔍 Debug Data Test</h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold">👤 Address:</h3>
          <p className="text-sm">{testData.address}</p>
        </div>

        <div>
          <h3 className="font-semibold">📊 Position IDs:</h3>
          <p className="text-sm">Loading: {testData.isLoadingIds ? 'Yes' : 'No'}</p>
          <p className="text-sm">Count: {testData.positionIds?.length || 0}</p>
          <p className="text-sm">Type: {typeof testData.positionIds}</p>
          <p className="text-sm">Is Array: {Array.isArray(testData.positionIds)}</p>
          <p className="text-sm">Data: {safeStringify(testData.positionIds)}</p>
        </div>

        <div>
          <h3 className="font-semibold">📊 First Position Data:</h3>
          <p className="text-sm">Data: {safeStringify(testData.firstPositionData)}</p>
          <p className="text-sm">Type: {typeof testData.firstPositionData}</p>
          <p className="text-sm">Is Array: {Array.isArray(testData.firstPositionData)}</p>
          <p className="text-sm">Length: {testData.firstPositionData?.length || 0}</p>
        </div>

        <div>
          <h3 className="font-semibold">🎫 Voucher IDs:</h3>
          <p className="text-sm">Loading: {testData.isLoadingVouchers ? 'Yes' : 'No'}</p>
          <p className="text-sm">Count: {testData.voucherIds?.length || 0}</p>
          <p className="text-sm">Type: {typeof testData.voucherIds}</p>
          <p className="text-sm">Is Array: {Array.isArray(testData.voucherIds)}</p>
          <p className="text-sm">Data: {safeStringify(testData.voucherIds)}</p>
        </div>

        <div>
          <h3 className="font-semibold">🎫 First Voucher Data:</h3>
          <p className="text-sm">Data: {safeStringify(testData.firstVoucherData)}</p>
          <p className="text-sm">Type: {typeof testData.firstVoucherData}</p>
          <p className="text-sm">Is Array: {Array.isArray(testData.firstVoucherData)}</p>
          <p className="text-sm">Length: {Array.isArray(testData.firstVoucherData) ? testData.firstVoucherData.length : 0}</p>
        </div>
      </div>
    </div>
  );
}
