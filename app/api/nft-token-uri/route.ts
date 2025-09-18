import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';

const NFT_FACTORY_ADDRESS = '0x6D87c4647bd91743ce69d8cd2eD568A6d892cd33';
const NFT_FACTORY_ABI = [
  {
    "inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
    "name": "tokenURI",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  }
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tokenId = searchParams.get('tokenId');

  if (!tokenId) {
    return NextResponse.json({ error: 'tokenId required' }, { status: 400 });
  }

  try {
    const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_BSC_TESTNET_RPC_URL || 'https://data-seed-prebsc-1-s1.binance.org:8545/');
    const contract = new ethers.Contract(NFT_FACTORY_ADDRESS, NFT_FACTORY_ABI, provider);
    
    const tokenURI = await contract.tokenURI(tokenId);
    
    return NextResponse.json({ tokenURI });
  } catch (error) {
    console.error('Error fetching token URI:', error);
    return NextResponse.json({ error: 'Failed to fetch token URI' }, { status: 500 });
  }
}
