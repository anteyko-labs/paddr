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

// Получить конкретное видео для тира
function getVideoForTier(tier: string): string | null {
  const videoFile = tierVideos[tier];
  if (!videoFile) return null;
  
  try {
    // Проверяем что файл существует
    const videoPath = path.join(process.cwd(), 'public/nft_tiers', videoFile);
    if (fs.existsSync(videoPath)) {
      return `/nft_tiers/${videoFile}`;
    }
    
    console.error(`Video file not found: ${videoPath}`);
    return null;
  } catch (error) {
    console.error('Error checking video file:', error);
    return null;
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tier = searchParams.get('tier');

  if (!tier) {
    return NextResponse.json({ error: 'tier required' }, { status: 400 });
  }

  try {
    const videoFile = tierVideos[tier];
    if (!videoFile) {
      return NextResponse.json({ error: `No video found for tier: ${tier}` }, { status: 404 });
    }
    
    const videoPath = path.join(process.cwd(), 'public/nft_tiers', videoFile);
    
    if (!fs.existsSync(videoPath)) {
      return NextResponse.json({ error: `Video file not found: ${videoPath}` }, { status: 404 });
    }
    
    // Читаем файл и возвращаем его напрямую
    const videoBuffer = fs.readFileSync(videoPath);
    
    console.log(`Video for tier ${tier}: ${videoFile}`);
    return new NextResponse(videoBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/gif',
        'Content-Length': videoBuffer.length.toString(),
        'Cache-Control': 'public, max-age=31536000',
      },
    });
  } catch (error) {
    console.error('Error fetching video:', error);
    return NextResponse.json({ error: 'Failed to fetch video' }, { status: 500 });
  }
}
