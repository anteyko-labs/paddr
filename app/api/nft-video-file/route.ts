import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Конкретные видео для каждого тира
const tierVideos: Record<string, string> = {
  'Bronze': 'bronze-tier.gif',    // Гифка для Bronze
  'Silver': 'silver-tier.gif',    // Гифка для Silver  
  'Gold': 'gold-tier.gif',        // Гифка для Gold
  'Platinum': 'platinum-tier.gif', // Гифка для Platinum
};

// Получить видео файл по tokenId
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tokenId = searchParams.get('tokenId');

  if (!tokenId) {
    return NextResponse.json({ error: 'tokenId required' }, { status: 400 });
  }

  try {
    // Для простоты используем Bronze tier как default
    // В реальном приложении нужно получать tier из метаданных NFT
    const tier = 'Bronze'; // TODO: получить tier из метаданных NFT
    const videoFile = tierVideos[tier];
    
    if (!videoFile) {
      return NextResponse.json({ error: `No video found for tier: ${tier}` }, { status: 404 });
    }
    
    const videoPath = path.join(process.cwd(), 'public/nft_tiers', videoFile);
    
    if (!fs.existsSync(videoPath)) {
      return NextResponse.json({ error: `Video file not found: ${videoPath}` }, { status: 404 });
    }
    
    // Читаем файл и возвращаем его
    const videoBuffer = fs.readFileSync(videoPath);
    
    return new NextResponse(videoBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/gif',
        'Content-Length': videoBuffer.length.toString(),
        'Cache-Control': 'public, max-age=31536000',
      },
    });
  } catch (error) {
    console.error('Error fetching video file:', error);
    return NextResponse.json({ error: 'Failed to fetch video file' }, { status: 500 });
  }
}