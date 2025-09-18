import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

interface Voucher {
  id: string;
  name: string;
  description: string;
  value: string;
  type: string;
  maxUses: string;
  currentUses: string;
  isActive: boolean;
  isValid: boolean;
  owner: string;
  positionId: string;
  expiresAt: string;
}

export function useUserVouchers() {
  const { address } = useAccount();
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadVouchers = async () => {
    if (!address) {
      setVouchers([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/user/vouchers?address=${address}`);
      if (!response.ok) {
        throw new Error('Failed to load vouchers');
      }

      const data = await response.json();
      setVouchers(data.vouchers || []);
    } catch (err: any) {
      setError(err.message);
      console.error('Error loading vouchers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVouchers();
  }, [address]);

  return {
    vouchers,
    loading,
    error,
    refetch: loadVouchers
  };
}
