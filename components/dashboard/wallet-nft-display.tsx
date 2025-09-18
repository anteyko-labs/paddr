'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy } from 'lucide-react';
import { useNFTBalanceFromEvents } from '@/hooks/useNFTBalanceFromEvents';

export function WalletNFTDisplay() {
  const { nfts, isLoading } = useNFTBalanceFromEvents();
  
  console.log('🔍 WalletNFTDisplay - nfts:', nfts);
  console.log('🔍 WalletNFTDisplay - isLoading:', isLoading);

  if (isLoading) {
    return (
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy size={20} className="text-purple-400" />
            <span>Wallet NFTs</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-400">Loading wallet NFTs...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!nfts || nfts.length === 0) {
    return (
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy size={20} className="text-purple-400" />
            <span>Wallet NFTs</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-400 mb-4">No NFTs in wallet yet</p>
            <p className="text-sm text-gray-500">Stake tokens to earn NFT rewards</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Trophy size={20} className="text-purple-400" />
          <span>Wallet NFTs ({nfts.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {nfts.map((nft: any, index: number) => {
            console.log(`🔍 NFT ${index}:`, nft);
            console.log(`🔍 NFT ${index} tierInfo:`, nft.tierInfo);
            console.log(`🔍 NFT ${index} image path:`, `/nft_tiers/${nft.tierInfo?.name?.toLowerCase() || 'bronze'}-tier.png`);
            
            return (
            <Card key={`wallet-nft-${nft.tokenId}-${index}`} className="bg-gray-800/50 border-gray-700 overflow-hidden">
              <div className="relative">
                <img 
                  src={`/nft_tiers/${nft.tierInfo?.name?.toLowerCase() || 'bronze'}-tier.png`} 
                  alt={`${nft.tierInfo?.name || 'NFT'} NFT`} 
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    console.log('❌ NFT image failed to load:', e.currentTarget.src);
                    // Fallback на дефолтное изображение
                    e.currentTarget.src = '/images/default-nft.png';
                  }}
                  onLoad={(e) => {
                    console.log('✅ NFT image loaded:', e.currentTarget.src);
                  }}
                />
                <div className="absolute top-4 right-4">
                  <Badge className={`${
                    nft.tierInfo?.name === 'Platinum' ? 'bg-emerald-600' :
                    nft.tierInfo?.name === 'Gold' ? 'bg-yellow-600' :
                    nft.tierInfo?.name === 'Silver' ? 'bg-gray-600' : 'bg-amber-600'
                  } text-white`}>
                    {nft.tierInfo?.name}
                  </Badge>
                </div>
              </div>
              <CardHeader>
                <CardTitle className="text-lg text-white">{nft.tierInfo?.name} NFT #{nft.tokenId}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-400">Started: {nft.formattedStartDate}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-400">Staked for: {Number(nft.lockDurationMonths)} month{Number(nft.lockDurationMonths) === 1 ? '' : 's'}</span>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  <p>This NFT is displayed as a static image in your wallet</p>
                  <p>For animated version, check your dashboard</p>
                </div>
              </CardContent>
            </Card>
            );
          })}
        </div>
        
        <div className="mt-6 p-4 bg-blue-900/20 border border-blue-800 rounded-2xl">
          <div className="flex items-start space-x-3">
            <Trophy size={16} className="text-blue-400 mt-0.5" />
            <div className="text-sm">
              <p className="text-blue-400 font-medium mb-1">
                Wallet NFT Display
              </p>
              <p className="text-gray-300 mb-2">
                NFTs in your wallet are displayed as static images for better compatibility with wallet interfaces.
              </p>
              <ul className="text-gray-300 space-y-1">
                <li>• Static PNG images for wallet compatibility</li>
                <li>• Animated GIFs available in dashboard</li>
                <li>• Same NFT, different display formats</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
