'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Video, Copy, ExternalLink, RefreshCw, Gift, FileText } from 'lucide-react';
import { useAccount } from 'wagmi';
import { TIER_LEVELS } from '@/lib/contracts/config';
import { useToast } from '@/hooks/use-toast';
import { useUserVouchers } from '@/hooks/useUserVouchers';

interface NFTData {
  tokenId: string;
  tier: number;
  tierName: string;
  tierColor: string;
  videoUrl: string;
  thumbnailUrl: string;
}

export function SimpleRewardsGallery() {
  const { address } = useAccount();
  const { toast } = useToast();
  const { vouchers: realVouchers, loading: vouchersLoading, refetch: refetchVouchers } = useUserVouchers();
  const [nfts, setNfts] = useState<NFTData[]>([]);
  const [loading, setLoading] = useState(true);

  // Создаем тестовые NFT (симулируем что у пользователя есть 16 NFT)
  useEffect(() => {
    if (!address) {
      setNfts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    const testNFTs: NFTData[] = [];
    for (let i = 1; i <= 16; i++) {
      const tier = (i - 1) % 4; // 0-3 для разных тиров
      const tierConfig = TIER_LEVELS[tier as keyof typeof TIER_LEVELS];
      
      testNFTs.push({
        tokenId: i.toString(),
        tier: tier,
        tierName: tierConfig.name,
        tierColor: tierConfig.color,
        videoUrl: `/api/nft-video?tier=${tierConfig.name}`,
        thumbnailUrl: `/nft-tiers/${tierConfig.name.toLowerCase()}-tier.png`
      });
    }
    
    setNfts(testNFTs);
    setLoading(false);
  }, [address]);

  const refreshData = () => {
    setLoading(true);
    refetchVouchers();
    setTimeout(() => {
      setLoading(false);
      toast({
        title: 'Refreshed',
        description: 'Rewards data updated',
      });
    }, 1000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied',
      description: 'Text copied to clipboard',
    });
  };

  if (loading || vouchersLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-400">Loading rewards...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">My Rewards</h2>
        <Button
          onClick={refreshData}
          variant="outline"
          size="sm"
          className="flex items-center space-x-2"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh</span>
        </Button>
      </div>

      {/* NFTs Section */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Trophy className="h-5 w-5 text-yellow-400" />
          <h3 className="text-lg font-semibold text-white">NFTs ({nfts.length})</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {nfts.map((nft) => (
            <Card key={nft.tokenId} className="bg-gray-900/50 border-gray-800 overflow-hidden">
              <CardContent className="p-0">
                <div className="relative">
                  <video
                    src={nft.videoUrl}
                    autoPlay
                    loop
                    muted
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      // Fallback to thumbnail if video fails
                      const target = e.target as HTMLVideoElement;
                      target.style.display = 'none';
                      const img = target.nextElementSibling as HTMLImageElement;
                      if (img) img.style.display = 'block';
                    }}
                  />
                  <img
                    src={nft.thumbnailUrl}
                    alt={`${nft.tierName} NFT`}
                    className="w-full h-48 object-cover hidden"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge 
                      style={{ backgroundColor: nft.tierColor }}
                      className="text-white font-semibold"
                    >
                      {nft.tierName}
                    </Badge>
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="font-semibold text-white mb-2">
                    {nft.tierName} NFT #{nft.tokenId}
                  </h4>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(nft.tokenId)}
                      className="flex-1"
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy ID
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(nft.videoUrl, '_blank')}
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Vouchers Section */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Gift className="h-5 w-5 text-emerald-400" />
          <h3 className="text-lg font-semibold text-white">Vouchers ({realVouchers.length})</h3>
        </div>
        {realVouchers.length === 0 ? (
          <div className="text-center py-8">
            <Gift className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">No vouchers available</p>
            <p className="text-sm text-gray-500 mt-2">Stake tokens to earn vouchers</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {realVouchers.map((voucher) => (
              <Card key={voucher.id} className="bg-gray-900/50 border-gray-800">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-white">{voucher.name}</h4>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        voucher.type === 'Single Use' ? 'text-red-400' :
                        voucher.type === 'Multi Use' ? 'text-blue-400' : 'text-green-400'
                      }`}
                    >
                      {voucher.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-300 mb-3">{voucher.description}</p>
                  <div className="flex items-center justify-between text-sm mb-3">
                    <span className="text-emerald-400 font-medium">{voucher.value}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-400">
                        {voucher.currentUses}/{voucher.maxUses} использований
                      </span>
                      {parseInt(voucher.maxUses) > 1 && (
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            parseInt(voucher.currentUses) === parseInt(voucher.maxUses) ? 'text-red-400' :
                            parseInt(voucher.currentUses) > 0 ? 'text-yellow-400' : 'text-green-400'
                          }`}
                        >
                          {parseInt(voucher.currentUses) === parseInt(voucher.maxUses) ? 'Исчерпан' :
                           parseInt(voucher.currentUses) > 0 ? 'Частично использован' : 'Не использован'}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(voucher.id)}
                      className="flex-1"
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy ID
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(`/api/voucher-preview?tier=${voucher.name}`, '_blank')}
                    >
                      <FileText className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}