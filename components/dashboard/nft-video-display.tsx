'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Download, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { useNFTBalance } from '@/hooks/useNFTBalance';

interface NFTVideoDisplayProps {
  className?: string;
}

export function NFTVideoDisplay({ className }: NFTVideoDisplayProps) {
  const { nfts, isLoading } = useNFTBalance();
  const [playingVideo, setPlayingVideo] = useState<number | null>(null);
  const [muted, setMuted] = useState(true);

  // Видео файлы для каждого тира (правильное сопоставление)
  const tierVideos: Record<string, string> = {
    'Bronze': '/nft_tiers/bronze-tier.gif',   // Гифка для Bronze
    'Silver': '/nft_tiers/silver-tier.gif',   // Гифка для Silver
    'Gold': '/nft_tiers/gold-tier.gif',       // Гифка для Gold
    'Platinum': '/nft_tiers/platinum-tier.gif', // Гифка для Platinum
  };

  const handlePlayPause = (tokenId: number) => {
    if (playingVideo === tokenId) {
      setPlayingVideo(null);
    } else {
      setPlayingVideo(tokenId);
    }
  };

  const handleDownload = (videoPath: string, tierName: string) => {
    const link = document.createElement('a');
    link.href = videoPath;
    link.download = `${tierName}_reward_video.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <Card className={`bg-gray-900/50 border-gray-800 ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy size={20} className="text-purple-400" />
            <span>NFT Rewards</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-400">Loading NFT rewards...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!nfts || nfts.length === 0) {
    return (
      <Card className={`bg-gray-900/50 border-gray-800 ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy size={20} className="text-purple-400" />
            <span>NFT Rewards</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-400 mb-4">No NFT rewards yet</p>
            <p className="text-sm text-gray-500">Stake tokens to earn NFT rewards</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-gray-900/50 border-gray-800 ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Trophy size={20} className="text-purple-400" />
            <span>NFT Rewards ({nfts.length})</span>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setMuted(!muted)}
              className="text-gray-400 hover:text-white"
            >
              {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {nfts.map((nft) => {
            const tierName = nft.tierInfo?.name || 'Unknown';
            const videoPath = tierVideos[tierName];
            const tierColor = nft.tierLevel >= 2 ? 'bg-emerald-600' : 'bg-gray-600';
            const isPlaying = playingVideo === nft.tokenId;
            
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
                    {tierName}
                  </Badge>
                </div>
                
                {videoPath && (
                  <div className="relative">
                    <video
                      className="w-full h-48 bg-black rounded-lg object-cover"
                      src={videoPath}
                      muted={muted}
                      loop
                      playsInline
                      onPlay={() => setPlayingVideo(nft.tokenId)}
                      onPause={() => setPlayingVideo(null)}
                      style={{ display: isPlaying ? 'block' : 'none' }}
                    />
                    
                    {!isPlaying && (
                      <div 
                        className="w-full h-48 bg-gradient-to-br from-emerald-400/20 to-blue-500/20 rounded-lg flex items-center justify-center border border-emerald-500/30 cursor-pointer"
                        onClick={() => handlePlayPause(nft.tokenId)}
                      >
                        <div className="text-center">
                          <Play size={32} className="text-emerald-400 mx-auto mb-2" />
                          <p className="text-emerald-400 font-medium text-sm">Play Reward Video</p>
                          <p className="text-gray-400 text-xs mt-1">{tierName} Tier Reward</p>
                        </div>
                      </div>
                    )}
                    
                    {isPlaying && (
                      <div 
                        className="absolute inset-0 flex items-center justify-center cursor-pointer"
                        onClick={() => handlePlayPause(nft.tokenId)}
                      >
                        <div className="bg-black/50 rounded-full p-3">
                          <Pause size={24} className="text-white" />
                        </div>
                      </div>
                    )}
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
                    <span className="text-gray-400">Hour:</span>
                    <span className="text-blue-400">{nft.monthIndex + 1}</span>
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
                    onClick={() => handlePlayPause(nft.tokenId)}
                  >
                    {isPlaying ? <Pause size={14} className="mr-1" /> : <Play size={14} className="mr-1" />}
                    {isPlaying ? 'Pause' : 'Play'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs"
                    onClick={() => videoPath && handleDownload(videoPath, tierName)}
                  >
                    <Download size={14} className="mr-1" />
                    Download
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-6 p-4 bg-emerald-900/20 border border-emerald-800 rounded-2xl">
          <div className="flex items-start space-x-3">
            <Trophy size={16} className="text-emerald-400 mt-0.5" />
            <div className="text-sm">
              <p className="text-emerald-400 font-medium mb-1">
                NFT Rewards System
              </p>
              <p className="text-gray-300 mb-2">
                Each hour of staking earns you a unique NFT reward video. These videos are your proof of participation and can be used for special benefits.
              </p>
              <ul className="text-gray-300 space-y-1">
                <li>• Bronze/Silver: Soul-bound NFTs (non-transferable)</li>
                <li>• Gold/Platinum: Transferable NFTs</li>
                <li>• Each NFT represents 1 hour of staking</li>
                <li>• Videos are unique to each tier</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
