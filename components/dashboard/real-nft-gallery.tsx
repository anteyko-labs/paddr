'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Video, Copy, ExternalLink, RefreshCw } from 'lucide-react';
import { useAccount, useReadContract } from 'wagmi';
import { NFT_FACTORY_ABI } from '@/lib/contracts/abis';
import { NFT_FACTORY_ADDRESS } from '@/lib/contracts/config';
import { TIER_LEVELS } from '@/lib/contracts/config';
import { useToast } from '@/hooks/use-toast';

interface NFTData {
  tokenId: string;
  tier: number;
  tierName: string;
  tierColor: string;
  videoUrl: string;
  metadata: any;
}

export function RealNFTGallery() {
  const { address } = useAccount();
  const { toast } = useToast();
  const [nfts, setNfts] = useState<NFTData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Получаем баланс NFT пользователя
  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: NFT_FACTORY_ADDRESS,
    abi: NFT_FACTORY_ABI,
    functionName: 'balanceOf',
    args: [address!],
    query: { 
      enabled: !!address,
      refetchInterval: 30000,
    },
  });

  // Получаем реальные NFT пользователя
  const fetchUserNFTs = async () => {
    if (!address || !balance || Number(balance) === 0) {
      setNfts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const nftData: NFTData[] = [];

    try {
      console.log(`Fetching ${Number(balance)} NFTs for address ${address}`);
      
      // Получаем все токены пользователя
      for (let i = 0; i < Number(balance); i++) {
        try {
          console.log(`Fetching token at index ${i}`);
          
          // Получаем ID токена по индексу
          const tokenIdResponse = await fetch(`/api/nft-token-id?address=${address}&index=${i}`);
          const tokenIdData = await tokenIdResponse.json();
          
          if (tokenIdData.tokenId) {
            const tokenId = tokenIdData.tokenId;
            console.log(`Found token ID: ${tokenId}`);
            
            // Получаем метаданные NFT
            const metadataResponse = await fetch(`/api/nft-metadata/${tokenId}`);
            const metadata = await metadataResponse.json();
            
            console.log(`Metadata for token ${tokenId}:`, metadata);
            
            const tier = metadata.tier || 0;
            const tierInfo = TIER_LEVELS[tier as keyof typeof TIER_LEVELS];
            
            nftData.push({
              tokenId: tokenId.toString(),
              tier,
              tierName: tierInfo?.name || `Tier ${tier}`,
              tierColor: tierInfo?.color || '#gray',
              videoUrl: `/api/nft-video?tier=${tierInfo?.name}`,
              metadata,
            });
          }
        } catch (error) {
          console.error(`Error fetching NFT at index ${i}:`, error);
        }
      }

      console.log(`Loaded ${nftData.length} NFTs:`, nftData);
      setNfts(nftData);
    } catch (error) {
      console.error('Error fetching NFTs:', error);
      toast({
        title: 'Error',
        description: 'Failed to load NFTs',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Загружаем NFT при изменении адреса или баланса
  useEffect(() => {
    fetchUserNFTs();
  }, [address, balance]);

  const refreshNFTs = async () => {
    setRefreshing(true);
    await refetchBalance();
    await fetchUserNFTs();
    setRefreshing(false);
    toast({
      title: 'Refreshed',
      description: 'NFT list updated',
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: 'Token ID copied to clipboard',
    });
  };

  const openInWallet = (tokenId: string) => {
    const url = `https://testnet.bscscan.com/token/${NFT_FACTORY_ADDRESS}?a=${tokenId}`;
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            My NFTs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading your NFTs...</p>
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
            onClick={refreshNFTs}
            disabled={refreshing}
            size="sm"
            variant="outline"
          >
            {refreshing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </>
            )}
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
            <p className="text-xs mt-2">Balance: {Number(balance || 0)} NFTs</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {nfts.map((nft) => (
              <Card key={nft.tokenId} className="overflow-hidden">
                <div className="aspect-video bg-gray-100 relative">
                  <video
                    className="w-full h-full object-cover"
                    controls
                    preload="metadata"
                  >
                    <source src={nft.videoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  
                  <div className="absolute top-2 left-2">
                    <Badge 
                      className="text-white border-0"
                      style={{ backgroundColor: nft.tierColor }}
                    >
                      {nft.tierName}
                    </Badge>
                  </div>
                </div>
                
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold">Staking Reward NFT</h3>
                      <p className="text-sm text-muted-foreground">
                        Token ID: {nft.tokenId}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {nft.metadata?.description || 'Staking reward NFT'}
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
                        onClick={() => openInWallet(nft.tokenId)}
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
