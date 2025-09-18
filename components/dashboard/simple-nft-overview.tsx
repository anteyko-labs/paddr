'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Copy, ExternalLink, RefreshCw } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useToast } from '@/hooks/use-toast';
import { NFT_FACTORY_ADDRESS } from '@/lib/contracts/config';

interface NFTData {
  tokenId: string;
  tier: number;
  tierName: string;
  tierColor: string;
}

export function SimpleNFTOverview() {
  const { address } = useAccount();
  const { toast } = useToast();
  const [nfts, setNfts] = useState<NFTData[]>([]);
  const [loading, setLoading] = useState(true);

  // Создаем тестовые данные для демонстрации
  useEffect(() => {
    if (!address) {
      setNfts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    // Создаем тестовые NFT (простые карточки без изображений)
    const testNFTs: NFTData[] = [
      {
        tokenId: '1',
        tier: 0,
        tierName: 'Bronze',
        tierColor: '#CD7F32'
      },
      {
        tokenId: '2', 
        tier: 1,
        tierName: 'Silver',
        tierColor: '#C0C0C0'
      },
      {
        tokenId: '3',
        tier: 2, 
        tierName: 'Gold',
        tierColor: '#FFD700'
      },
      {
        tokenId: '4',
        tier: 3, 
        tierName: 'Platinum',
        tierColor: '#E5E4E2'
      }
    ];

    setNfts(testNFTs);
    setLoading(false);
  }, [address]);

  const refreshData = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast({
        title: 'Refreshed',
        description: 'NFT data updated',
      });
    }, 1000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: 'Copied to clipboard',
    });
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading NFTs...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            My NFTs ({nfts.length})
          </CardTitle>
          <Button
            onClick={refreshData}
            disabled={loading}
            size="sm"
            variant="outline"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Your staking reward NFTs - earned every month
        </p>
      </CardHeader>
      <CardContent>
        {nfts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No NFTs found</p>
            <p className="text-sm">Stake tokens to earn NFTs every month</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {nfts.map((nft) => (
              <Card key={nft.tokenId} className="border-2 hover:border-gray-400 transition-colors">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Staking Reward NFT</h3>
                      <Badge 
                        className="text-white border-0"
                        style={{ backgroundColor: nft.tierColor }}
                      >
                        {nft.tierName}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Token ID: {nft.tokenId}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Tier: {nft.tier + 1}
                      </p>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(nft.tokenId)}
                        className="flex-1"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy ID
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`https://testnet.bscscan.com/token/${NFT_FACTORY_ADDRESS}?a=${nft.tokenId}`, '_blank')}
                        className="flex-1"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
