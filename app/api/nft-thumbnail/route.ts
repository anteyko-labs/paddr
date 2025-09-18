import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// PNG изображения для каждого тира (для кошелька)
const tierImages: Record<string, string> = {
  'Bronze': 'bronze-tier.png',
  'Silver': 'silver-tier.png',  
  'Gold': 'gold-tier.png',
  'Platinum': 'platinum-tier.png',
};

// Возвращаем PNG изображение для кошелька
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tokenId = searchParams.get('tokenId');

  if (!tokenId) {
    return NextResponse.json({ error: 'tokenId required' }, { status: 400 });
  }

  try {
    // Определяем тир по tokenId
    const tierNumber = parseInt(tokenId) % 4;
    const tierNames = ['Bronze', 'Silver', 'Gold', 'Platinum'];
    const tier = tierNames[tierNumber];
    
    const imageFile = tierImages[tier];
    if (!imageFile) {
      return NextResponse.json({ error: `No image file mapped for tier: ${tier}` }, { status: 404 });
    }

    // Читаем PNG файл
    const filePath = path.join(process.cwd(), 'nft', 'nft_tiers', imageFile);
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'Image file not found' }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);
    
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000',
      },
    });
  } catch (error) {
    console.error('Error serving NFT image:', error);
    return NextResponse.json({ error: 'Failed to serve NFT image' }, { status: 500 });
  }
}

