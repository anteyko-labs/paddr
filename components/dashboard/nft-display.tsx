'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Download, Eye } from 'lucide-react';
import { useNFTBalance } from '@/hooks/useNFTBalance';
import axios from 'axios';

interface NFTImage {
  tokenId: number;
  imageName: string;
  tier: string;
  voucher?: {
    id: string;
    name: string;
    description: string;
    value: string;
    type: string;
    image: string;
    pdf: string;
  };
}

export function NFTDisplay() {
  const { nfts, isLoading } = useNFTBalance();
  const [nftImages, setNftImages] = useState<Record<number, NFTImage>>({});

  // Получаем изображения ваучеров для NFT
  useEffect(() => {
    async function fetchNFTVouchers() {
      if (!nfts || nfts.length === 0) return;

      for (const nft of nfts) {
        try {
          // Получаем случайный ваучер для тира
          const res = await axios.post('/api/vouchers', {
            tier: nft.tierInfo?.name,
            excludeUsed: [] // В будущем можно исключать уже использованные
          });
          
          if (res.data.voucher) {
            setNftImages(prev => ({
              ...prev,
              [nft.tokenId]: {
                tokenId: nft.tokenId,
                imageName: res.data.voucher.image.replace('.png', '.svg'), // Используем SVG вместо PNG
                tier: nft.tierInfo?.name || 'Unknown',
                voucher: res.data.voucher
              }
            }));
          }
        } catch (e) {
          console.warn('Failed to fetch NFT voucher:', e);
        }
      }
    }

    fetchNFTVouchers();
  }, [nfts]);

  if (isLoading) {
    return (
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy size={20} className="text-purple-400" />
            <span>My NFTs</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-400">Loading NFTs...</p>
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
            <span>My NFTs</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-400 mb-4">No NFTs yet</p>
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
          <span>My NFTs ({nfts.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {nfts.map((nft) => {
            const nftImage = nftImages[nft.tokenId];
            const tierColor = nft.tierLevel >= 2 ? 'bg-emerald-600' : 'bg-gray-600';
            
            return (
              <div key={nft.tokenId} className="p-4 rounded-2xl bg-gray-800/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-8 h-8 ${tierColor} rounded flex items-center justify-center`}>
                      <Trophy size={16} className="text-white" />
                    </div>
                    <span className="font-semibold text-white">#{nft.tokenId}</span>
                  </div>
                  <Badge className={tierColor}>
                    {nft.tierInfo?.name || 'Unknown'}
                  </Badge>
                </div>
                
                {nftImage && (
                  <div className="text-center">
                    <div className="w-full h-32 bg-gradient-to-br from-emerald-400/20 to-blue-500/20 rounded-lg flex items-center justify-center border border-emerald-500/30 overflow-hidden">
                      <img 
                        src={`/assets/${nftImage.tier.toLowerCase() === 'bronze' ? 'tier1' : 
                               nftImage.tier.toLowerCase() === 'silver' ? 'tier2' :
                               nftImage.tier.toLowerCase() === 'gold' ? 'tier3' : 'tier4'}/${nftImage.imageName}`}
                        alt={nftImage.voucher?.name || nftImage.imageName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback если изображение не загрузилось
                          e.currentTarget.style.display = 'none';
                          const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                          if (nextElement) {
                            nextElement.style.display = 'block';
                          }
                        }}
                      />
                      <div className="text-center hidden">
                        <p className="text-emerald-400 font-medium text-sm">{nftImage.voucher?.name || nftImage.imageName}</p>
                        <p className="text-gray-400 text-xs mt-1">{nftImage.voucher?.value || 'Voucher'}</p>
                        {nftImage.voucher && (
                          <p className="text-gray-500 text-xs mt-1">{nftImage.voucher.type}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Position ID:</span>
                    <span className="text-white">{nft.positionId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Amount:</span>
                    <span className="text-emerald-400">{nft.formattedAmountStaked}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Month:</span>
                    <span className="text-blue-400">{nft.monthIndex + 1}/12</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Started:</span>
                    <span className="text-gray-300">{nft.formattedStartDate}</span>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs"
                    onClick={() => {
                      // Здесь можно добавить логику для просмотра деталей ваучера
                      console.log('View voucher details:', nftImage?.imageName);
                    }}
                  >
                    <Eye size={14} className="mr-1" />
                    View
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs"
                    onClick={() => {
                      // Здесь можно добавить логику для скачивания ваучера
                      console.log('Download voucher:', nftImage?.imageName);
                    }}
                  >
                    <Download size={14} className="mr-1" />
                    Download
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
