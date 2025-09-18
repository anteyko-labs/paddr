import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Конкретные видео для каждого тира
const tierVideos: Record<string, string> = {
  'Bronze': 'video5307504616261323182.mp4',    // 82 - Bronze
  'Silver': 'video5307504616261323179.mp4',    // 79 - Silver  
  'Gold': 'video5307504616261323181.mp4',      // 81 - Gold
  'Platinum': 'video5307504616261323180.mp4',  // 80 - Platinum
};

// Возвращаем оптимизированное видео для ЛК
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
    
    const videoFile = tierVideos[tier];
    if (!videoFile) {
      return NextResponse.json({ error: `No video file mapped for tier: ${tier}` }, { status: 404 });
    }

    // Читаем видео файл
    const filePath = path.join(process.cwd(), 'nft', 'nft_tiers', videoFile);
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'Video file not found' }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);
    
    // Возвращаем видео с оптимизированными заголовками
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'video/mp4',
        'Cache-Control': 'public, max-age=31536000',
        'Content-Length': fileBuffer.length.toString(),
        // Добавляем заголовки для защиты от скачивания
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'Content-Security-Policy': "default-src 'self'",
      },
    });
  } catch (error) {
    console.error('Error serving NFT video:', error);
    return NextResponse.json({ error: 'Failed to serve NFT video' }, { status: 500 });
  }
}
