'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Video, Copy, ExternalLink } from 'lucide-react';
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
}

export function SimpleNFTGallery() {
  const { address } = useAccount();
  const { toast } = useToast();
  const [nfts, setNfts] = useState<NFTData[]>([]);
  const [loading, setLoading] = useState(true);

  // Получаем баланс NFT пользователя
  const { data: balance } = useReadContract({
    address: NFT_FACTORY_ADDRESS,
    abi: NFT_FACTORY_ABI,
    functionName: 'balanceOf',
    args: [address!],
    query: { 
      enabled: !!address,
      refetchInterval: 30000,
    },
  });

  // Получаем детали NFT
  useEffect(() => {
    if (!address || !balance || Number(balance) === 0) {
      setNfts([]);
      setLoading(false);
      return;
    }

    const fetchNFTs = async () => {
      setLoading(true);
      const nftData: NFTData[] = [];

      try {
        // Получаем все токены пользователя
        for (let i = 0; i < Number(balance); i++) {
          try {
            // Получаем ID токена по индексу
            const tokenId = await fetch(`/api/nft-token-id?address=${address}&index=${i}`)
              .then(res => res.json())
              .then(data => data.tokenId);

            if (tokenId) {
              // Получаем метаданные NFT
              const metadata = await fetch(`/api/nft-metadata/${tokenId}`)
                .then(res => res.json())
                .then(data => data);

              const tier = metadata.tier || 0;
              const tierInfo = TIER_LEVELS[tier as keyof typeof TIER_LEVELS];
              
              // Используем наш API для видео
              const videoUrl = `/api/nft-video-file?tokenId=${tokenId}`;

              nftData.push({
                tokenId: tokenId.toString(),
                tier,
                tierName: tierInfo?.name || `Tier ${tier}`,
                tierColor: tierInfo?.color || '#gray',
                videoUrl,
              });
            }
          } catch (error) {
            console.error(`Error fetching NFT ${i}:`, error);
          }
        }

        setNfts(nftData);
      } catch (error) {
        console.error('Error fetching NFTs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNFTs();
  }, [address, balance]);

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
            <p className="mt-4 text-muted-foreground">Loading NFTs...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          My NFTs ({nfts.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {nfts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No NFTs found</p>
            <p className="text-sm">Stake tokens to earn NFTs every month</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {nfts.map((nft) => (
              <Card key={nft.tokenId} className="overflow-hidden">
                <div className="aspect-video bg-gray-100 relative">
                  {nft.videoUrl ? (
                    <video
                      className="w-full h-full object-cover"
                      controls
                      preload="metadata"
                    >
                      <source src={nft.videoUrl} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Video className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  
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
