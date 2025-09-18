'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Zap, Clock, Trophy } from 'lucide-react';
import { useAccount, useWriteContract } from 'wagmi';
import { UPGRADEABLE_STAKE_MANAGER_ABI } from '@/lib/contracts/upgradeable-stake-manager-abi';
import { STAKE_MANAGER_ADDRESS } from '@/lib/contracts/config';
import { useToast } from '@/hooks/use-toast';

export function NFTMintTest() {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const { toast } = useToast();
  const [positionId, setPositionId] = useState('0');
  const [isMinting, setIsMinting] = useState(false);

  const mintNFT = async () => {
    if (!address) {
      toast({
        title: 'Error',
        description: 'Please connect your wallet',
        variant: 'destructive',
      });
      return;
    }

    setIsMinting(true);
    try {
      await writeContractAsync({
        address: STAKE_MANAGER_ADDRESS,
        abi: UPGRADEABLE_STAKE_MANAGER_ABI,
        functionName: 'mintNextNFT',
        args: [BigInt(positionId)],
      });

      toast({
        title: 'Success!',
        description: `NFT minted for position ${positionId}`,
      });
    } catch (error: any) {
      console.error('Mint error:', error);
      
      if (error.message?.includes('Too early for next NFT')) {
        toast({
          title: 'Too Early',
          description: 'Please wait for the next mint time (1 month)',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Mint Failed',
          description: error.message || 'Failed to mint NFT',
          variant: 'destructive',
        });
      }
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          NFT Mint Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="positionId">Position ID</Label>
          <Input
            id="positionId"
            value={positionId}
            onChange={(e) => setPositionId(e.target.value)}
            placeholder="Enter position ID (e.g., 0)"
          />
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline">BSC Testnet</Badge>
          <Badge variant="secondary">Monthly interval</Badge>
        </div>

        <Button
          onClick={mintNFT}
          disabled={isMinting || !address}
          className="w-full"
        >
          {isMinting ? (
            <>
              <Clock className="h-4 w-4 mr-2 animate-spin" />
              Minting NFT...
            </>
          ) : (
            <>
              <Trophy className="h-4 w-4 mr-2" />
              Mint NFT
            </>
          )}
        </Button>

        <div className="text-sm text-muted-foreground">
          <p>• NFT will be minted every month</p>
          <p>• Check your wallet for the new NFT</p>
          <p>• Use the import guide below if NFT doesn't appear</p>
        </div>
      </CardContent>
    </Card>
  );
}
