'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, Download, ExternalLink, Wallet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const NFT_FACTORY_ADDRESS = '0x6D87c4647bd91743ce69d8cd2eD568A6d892cd33';

export function NFTImportGuide() {
  const { toast } = useToast();
  const [tokenId, setTokenId] = useState('');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: 'Address copied to clipboard',
    });
  };

  const generateImportData = () => {
    return {
      address: NFT_FACTORY_ADDRESS,
      symbol: 'PADNFT',
      decimals: 0,
      name: 'PADD-R Staking NFT',
      tokenId: tokenId || '0',
    };
  };

  const downloadImportFile = () => {
    const importData = generateImportData();
    const dataStr = JSON.stringify(importData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pad-nft-import-${tokenId || 'template'}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Import NFT to Wallet
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertDescription>
            To see your NFTs in your wallet, you need to import the NFT contract. 
            Most wallets will automatically detect ERC-721 tokens, but you may need to add the contract manually.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div>
            <Label htmlFor="tokenId">Token ID (optional)</Label>
            <Input
              id="tokenId"
              value={tokenId}
              onChange={(e) => setTokenId(e.target.value)}
              placeholder="Enter specific token ID to import"
            />
          </div>

          <div className="space-y-3">
            <div>
              <Label>Contract Address</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={NFT_FACTORY_ADDRESS}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(NFT_FACTORY_ADDRESS)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Token Standard</Label>
                <Badge variant="secondary" className="w-full justify-center">
                  ERC-721
                </Badge>
              </div>
              <div>
                <Label>Network</Label>
                <Badge variant="outline" className="w-full justify-center">
                  BSC Testnet
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={downloadImportFile}
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Import File
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open(`https://testnet.bscscan.com/address/${NFT_FACTORY_ADDRESS}`, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View Contract
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold">Manual Import Instructions:</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p><strong>MetaMask:</strong> Go to NFTs tab → Import NFTs → Paste contract address</p>
            <p><strong>WalletConnect:</strong> Add custom token → Enter contract address</p>
            <p><strong>Other Wallets:</strong> Look for "Add Token" or "Import NFT" option</p>
          </div>
        </div>

        <Alert>
          <AlertDescription>
            <strong>Note:</strong> NFTs will appear in your wallet automatically after minting. 
            If you don't see them, try refreshing your wallet or importing the contract manually.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
