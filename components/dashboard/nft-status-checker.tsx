'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useAccount, useReadContract } from 'wagmi';
import { NFT_FACTORY_ABI } from '@/lib/contracts/abis';
import { NFT_FACTORY_ADDRESS } from '@/lib/contracts/config';

export function NFTStatusChecker() {
  const { address } = useAccount();
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  // Получаем баланс NFT
  const { data: balance, refetch } = useReadContract({
    address: NFT_FACTORY_ADDRESS,
    abi: NFT_FACTORY_ABI,
    functionName: 'balanceOf',
    args: [address!],
    query: { 
      enabled: !!address,
      refetchInterval: 10000, // Проверяем каждые 10 секунд
    },
  });

  const checkNFTs = async () => {
    setIsChecking(true);
    try {
      await refetch();
      setLastCheck(new Date());
    } finally {
      setIsChecking(false);
    }
  };

  const nftCount = Number(balance || 0);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          NFT Status Checker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium">Your Staking NFT Balance</p>
            <div className="flex items-center gap-2">
              <Badge variant={nftCount > 0 ? "default" : "secondary"}>
                {nftCount} NFT{nftCount !== 1 ? 's' : ''}
              </Badge>
              {nftCount > 0 ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-gray-400" />
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Earned from staking every month
            </p>
          </div>
          
          <Button
            onClick={checkNFTs}
            disabled={isChecking || !address}
            size="sm"
            variant="outline"
          >
            {isChecking ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Check Now
              </>
            )}
          </Button>
        </div>

        {lastCheck && (
          <p className="text-sm text-muted-foreground">
            Last checked: {lastCheck.toLocaleTimeString()}
          </p>
        )}

        {nftCount > 0 ? (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Great!</strong> You have {nftCount} NFT{nftCount !== 1 ? 's' : ''} in your wallet.
              {nftCount === 1 ? ' It should appear in your wallet automatically.' : ' They should appear in your wallet automatically.'}
            </AlertDescription>
          </Alert>
        ) : (
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertDescription>
              <strong>No NFTs yet.</strong> Create a staking position and wait 1 month for your first NFT to be minted automatically.
            </AlertDescription>
          </Alert>
        )}

        <div className="text-sm text-muted-foreground space-y-1">
          <p><strong>How it works:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>NFTs are minted automatically every month</li>
            <li>They appear in your wallet without manual import</li>
            <li>If not visible, try refreshing your wallet</li>
            <li>Use the import guide below if needed</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
