import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';

const NFT_FACTORY_ADDRESS = '0x6D87c4647bd91743ce69d8cd2eD568A6d892cd33';
const NFT_FACTORY_ABI = [
  {
    "inputs": [
      {"internalType": "address", "name": "owner", "type": "address"},
      {"internalType": "uint256", "name": "index", "type": "uint256"}
    ],
    "name": "tokenOfOwnerByIndex",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get('address');
  const index = searchParams.get('index');

  if (!address || !index) {
    return NextResponse.json({ error: 'address and index required' }, { status: 400 });
  }

  try {
    const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_BSC_TESTNET_RPC_URL || 'https://data-seed-prebsc-1-s1.binance.org:8545/');
    const contract = new ethers.Contract(NFT_FACTORY_ADDRESS, NFT_FACTORY_ABI, provider);
    
    const tokenId = await contract.tokenOfOwnerByIndex(address, index);
    
    return NextResponse.json({ tokenId: tokenId.toString() });
  } catch (error) {
    console.error('Error fetching token ID:', error);
    return NextResponse.json({ error: 'Failed to fetch token ID' }, { status: 500 });
  }
}
