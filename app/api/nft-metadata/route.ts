import { NextRequest, NextResponse } from 'next/server';

// Конкретные видео для каждого тира
const tierVideos: Record<string, string> = {
  'Bronze': 'video5307504616261323182.mp4',    // 82 - Bronze
  'Silver': 'video5307504616261323179.mp4',    // 79 - Silver  
  'Gold': 'video5307504616261323181.mp4',      // 81 - Gold
  'Platinum': 'video5307504616261323180.mp4',  // 80 - Platinum
};

// Получить метаданные NFT
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tokenId = searchParams.get('tokenId');

  if (!tokenId) {
    return NextResponse.json({ error: 'tokenId required' }, { status: 400 });
  }

  try {
    // Определяем тир по tokenId (можно улучшить логику)
    const tierNumber = parseInt(tokenId) % 4;
    const tierNames = ['Bronze', 'Silver', 'Gold', 'Platinum'];
    const tier = tierNames[tierNumber];
    
    const videoFile = tierVideos[tier];
    
    const metadata = {
      name: `PADD-R Staking NFT #${tokenId}`,
      description: `Staking reward NFT for ${tier} tier`,
      image: `/nft-tiers/${tier.toLowerCase()}-tier.png`,
      animation_url: `/nft/nft_tiers/${videoFile}`,
      attributes: [
        {
          trait_type: "Tier",
          value: tier
        },
        {
          trait_type: "Type",
          value: "Staking Reward"
        },
        {
          trait_type: "Network",
          value: "BSC Testnet"
        }
      ],
      tier: tierNumber,
      tierName: tier,
      videoFile: videoFile
    };
    
    console.log(`Metadata for token ${tokenId}:`, metadata);
    return NextResponse.json(metadata);
  } catch (error) {
    console.error('Error generating metadata:', error);
    return NextResponse.json({ error: 'Failed to generate metadata' }, { status: 500 });
  }
}
