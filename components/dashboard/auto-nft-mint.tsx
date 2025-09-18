'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, Zap, Trophy, Play } from 'lucide-react';
import { useAutoNFTMint } from '@/hooks/useAutoNFTMint';
import { TIER_LEVELS } from '@/lib/contracts/config';
import { useToast } from '@/hooks/use-toast';

export function AutoNFTMint() {
  const { 
    positions, 
    readyToMintPositions, 
    mintNFT, 
    isEnabled, 
    setIsEnabled,
    mintingPositions 
  } = useAutoNFTMint();
  
  const { toast } = useToast();

  // Форматирование времени
  const formatTime = (seconds: number) => {
    if (seconds <= 0) return 'Ready!';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  // Автоматический минтинг всех готовых позиций
  const mintAllReady = async () => {
    for (const position of readyToMintPositions) {
      await mintNFT(position.id);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Auto NFT Minting
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={isEnabled ? "default" : "secondary"}>
              {isEnabled ? "Enabled" : "Disabled"}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEnabled(!isEnabled)}
            >
              {isEnabled ? "Disable" : "Enable"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {positions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No active staking positions found</p>
            <p className="text-sm">Create a position to start earning NFTs</p>
          </div>
        ) : (
          <>
            {/* Готовые к минтингу */}
            {readyToMintPositions.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-green-600">
                    Ready to Mint ({readyToMintPositions.length})
                  </h3>
                  <Button 
                    onClick={mintAllReady}
                    disabled={mintingPositions.size > 0}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Mint All
                  </Button>
                </div>
                
                {readyToMintPositions.map((position) => {
                  const tierInfo = TIER_LEVELS[Number(position.tier) as keyof typeof TIER_LEVELS];
                  return (
                    <Card key={position.id} className="border-green-200 bg-green-50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: tierInfo?.color || '#gray' }}
                            />
                            <div>
                              <p className="font-medium">
                                {tierInfo?.name || `Tier ${position.tier}`} Position #{position.id + 1}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {Number(position.amount) / 1e18} PAD tokens
                              </p>
                            </div>
                          </div>
                          <Button
                            onClick={() => mintNFT(position.id)}
                            disabled={mintingPositions.has(position.id)}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {mintingPositions.has(position.id) ? "Minting..." : "Mint NFT"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Все позиции с таймерами */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">All Positions</h3>
              
              {positions.map((position) => {
                const tierInfo = TIER_LEVELS[Number(position.tier) as keyof typeof TIER_LEVELS];
                const progress = position.timeUntilMint > 0 
                  ? Math.max(0, Math.min(100, (300 - position.timeUntilMint) / 300 * 100))
                  : 100;
                
                return (
                  <Card key={position.id} className="border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: tierInfo?.color || '#gray' }}
                          />
                          <div>
                            <p className="font-medium">
                              {tierInfo?.name || `Tier ${position.tier}`} Position #{position.id + 1}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {Number(position.amount) / 1e18} PAD tokens
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="h-4 w-4" />
                            <span className="text-sm font-medium">
                              {formatTime(position.timeUntilMint)}
                            </span>
                          </div>
                          
                          {position.timeUntilMint > 0 && (
                            <div className="w-32">
                              <Progress value={progress} className="h-2" />
                            </div>
                          )}
                          
                          {position.canMint && (
                            <Button
                              onClick={() => mintNFT(position.id)}
                              disabled={mintingPositions.has(position.id)}
                              size="sm"
                              className="mt-2 bg-blue-600 hover:bg-blue-700"
                            >
                              {mintingPositions.has(position.id) ? "Minting..." : "Mint Now"}
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
