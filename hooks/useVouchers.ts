import { useState, useEffect } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { VOUCHER_MANAGER_ADDRESS, VOUCHER_MANAGER_ABI } from '@/lib/contracts/config';

export interface Voucher {
  id: bigint;
  owner: string;
  voucherType: number; // 0: SINGLE_USE, 1: MULTI_USE, 2: DURATION
  name: string;
  description: string;
  value: string;
  maxUses: bigint;
  currentUses: bigint;
  expiresAt: bigint;
  isActive: boolean;
  qrCode: string;
  positionId: bigint;
}

export function useVouchers() {
  const { address } = useAccount();
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Получаем список ID ваучеров пользователя
  const { data: voucherIds, refetch: refetchVoucherIds } = useReadContract({
    address: VOUCHER_MANAGER_ADDRESS,
    abi: VOUCHER_MANAGER_ABI,
    functionName: 'getUserVouchers',
    args: [address!],
    query: { enabled: !!address },
  });

  // Загружаем детали каждого ваучера
  useEffect(() => {
    async function loadVouchers() {
      if (!address || !voucherIds) {
        setVouchers([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const voucherDetails: Voucher[] = [];
        
        for (const voucherId of voucherIds) {
          try {
            const voucher = await fetchVoucherDetails(voucherId);
            if (voucher) {
              voucherDetails.push(voucher);
            }
          } catch (err) {
            console.error(`Error loading voucher ${voucherId}:`, err);
          }
        }

        setVouchers(voucherDetails);
      } catch (err) {
        console.error('Error loading vouchers:', err);
        setError('Failed to load vouchers');
      } finally {
        setIsLoading(false);
      }
    }

    loadVouchers();
  }, [address, voucherIds]);

  // Автоматическое обновление каждые 30 секунд
  useEffect(() => {
    if (!address) return;
    
    const interval = setInterval(() => {
      refetchVoucherIds();
    }, 30000); // 30 секунд

    return () => clearInterval(interval);
  }, [address, refetchVoucherIds]);

  const fetchVoucherDetails = async (voucherId: bigint): Promise<Voucher | null> => {
    try {
      // Create a public client to read contract data
      const { createPublicClient, http } = await import('viem');
      const { bscTestnet } = await import('viem/chains');
      
      const publicClient = createPublicClient({
        chain: bscTestnet,
        transport: http(),
      });

      // Fetch voucher data from the smart contract
      const voucherData = await publicClient.readContract({
        address: VOUCHER_MANAGER_ADDRESS,
        abi: VOUCHER_MANAGER_ABI,
        functionName: 'getVoucher',
        args: [voucherId],
      });

      // Transform the data to match our Voucher interface
      return {
        id: voucherId,
        owner: voucherData.owner,
        voucherType: Number(voucherData.voucherType),
        name: voucherData.name,
        description: voucherData.description,
        value: voucherData.value,
        maxUses: voucherData.maxUses,
        currentUses: voucherData.currentUses,
        expiresAt: voucherData.expiresAt,
        isActive: voucherData.isActive,
        qrCode: voucherData.qrCode, // Use real QR code from contract
        positionId: voucherData.positionId,
      };
    } catch (err) {
      console.error(`Error fetching voucher ${voucherId}:`, err);
      return null;
    }
  };

  const refetch = () => {
    refetchVoucherIds();
  };

  return {
    vouchers,
    isLoading,
    error,
    refetch,
  };
}

// Функция для проверки ваучера по QR коду (для админки)
export async function checkVoucherByQRCode(qrCode: string): Promise<Voucher | null> {
  try {
    const { createPublicClient, http } = await import('viem');
    const { bscTestnet } = await import('viem/chains');
    
    const publicClient = createPublicClient({
      chain: bscTestnet,
      transport: http(),
    });

    // Сначала нужно найти ваучер по QR коду
    // Для этого можно использовать событие или создать функцию в контракте
    // Пока используем простую проверку через getAllVouchers (если есть)
    
    // Альтернативно, можно добавить функцию в контракт для поиска по QR коду
    const voucherData = await publicClient.readContract({
      address: VOUCHER_MANAGER_ADDRESS,
      abi: VOUCHER_MANAGER_ABI,
      functionName: 'findVoucherByQRCode',
      args: [qrCode],
    });

    if (!voucherData || voucherData.id === BigInt(0)) {
      return null;
    }

    return {
      id: voucherData.id,
      owner: voucherData.owner,
      voucherType: Number(voucherData.voucherType),
      name: voucherData.name,
      description: voucherData.description,
      value: voucherData.value,
      maxUses: voucherData.maxUses,
      currentUses: voucherData.currentUses,
      expiresAt: voucherData.expiresAt,
      isActive: voucherData.isActive,
      qrCode: voucherData.qrCode,
      positionId: voucherData.positionId,
    };
  } catch (err) {
    console.error('Error checking voucher by QR code:', err);
    return null;
  }
}
