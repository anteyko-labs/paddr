import { NextRequest, NextResponse } from 'next/server';
// import { supabase } from '@/lib/supabase'; // Временно отключено
import fs from 'fs';
import path from 'path';

// Конкретные видео для каждого тира
const tierVideos: Record<string, string> = {
  'Bronze': 'video5307504616261323182.mp4',    // 82 - Bronze
  'Silver': 'video5307504616261323179.mp4',    // 79 - Silver  
  'Gold': 'video5307504616261323181.mp4',      // 81 - Gold
  'Platinum': 'video5307504616261323180.mp4',  // 80 - Platinum
};

// Получить конкретное видео для тира
function getVideoForTier(tier: string): string | null {
  const videoFile = tierVideos[tier];
  if (!videoFile) return null;
  
  try {
    // Проверяем что файл существует
    const videoPath = path.join(process.cwd(), 'nft/nft_tiers', videoFile);
    if (fs.existsSync(videoPath)) {
      return videoFile;
    }
    
    console.error(`Video file not found: ${videoPath}`);
    return null;
  } catch (error) {
    console.error('Error checking video file:', error);
    return null;
  }
}

// GET: получить неиспользованную картинку для пользователя, tier и token_id
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get('address');
  const tier = searchParams.get('tier');
  console.log('NFT Image API called with:', { address, tier });
  
  // token_id опционален для случайного подбора изображения при стейкинге
  if (!address || !tier) {
    console.log('Missing required params');
    return NextResponse.json({ error: 'address, tier required' }, { status: 400 });
  }

  // Получаем конкретное видео для тира
  const videoFile = getVideoForTier(tier);
  console.log(`Video for tier ${tier}:`, videoFile);
  
  if (!videoFile) {
    console.log('No video available for tier:', tier);
    return NextResponse.json({ error: `No video available for tier: ${tier}` }, { status: 404 });
  }
  
  console.log('Selected video:', videoFile);
  return NextResponse.json({ image: videoFile });
}

// POST: сохранить выбранную картинку для пользователя, tier и token_id
export async function POST(req: NextRequest) {
  const { address, tier, token_id, image } = await req.json();
  if (!address || !tier || !token_id || !image) return NextResponse.json({ error: 'address, tier, token_id, image required' }, { status: 400 });
  // Временно отключено Supabase
  return NextResponse.json({ success: true, message: 'Supabase temporarily disabled' });
} 