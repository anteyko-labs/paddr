import { NextRequest, NextResponse } from 'next/server';

// Создаем анимированный GIF превью для NFT
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

    // Создаем анимированный SVG с градиентом
    const svg = createAnimatedPreview(tier, tokenId);
    
    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=31536000',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
      },
    });
  } catch (error) {
    console.error('Error generating NFT preview:', error);
    return NextResponse.json({ error: 'Failed to generate NFT preview' }, { status: 500 });
  }
}

function createAnimatedPreview(tier: string, tokenId: string): string {
  const tierColors = {
    'Bronze': '#CD7F32',
    'Silver': '#C0C0C0', 
    'Gold': '#FFD700',
    'Platinum': '#E5E4E2'
  };

  const tierIcons = {
    'Bronze': '🥉',
    'Silver': '🥈',
    'Gold': '🥇', 
    'Platinum': '💎'
  };

  const color = tierColors[tier as keyof typeof tierColors] || '#gray';
  const icon = tierIcons[tier as keyof typeof tierIcons] || '🎯';

  return `
    <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${color};stop-opacity:1">
            <animate attributeName="stop-opacity" values="1;0.7;1" dur="2s" repeatCount="indefinite"/>
          </stop>
          <stop offset="50%" style="stop-color:${color}CC;stop-opacity:1">
            <animate attributeName="stop-opacity" values="0.7;1;0.7" dur="2s" repeatCount="indefinite"/>
          </stop>
          <stop offset="100%" style="stop-color:${color}88;stop-opacity:1">
            <animate attributeName="stop-opacity" values="1;0.7;1" dur="2s" repeatCount="indefinite"/>
          </stop>
        </linearGradient>
        <linearGradient id="card" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:white;stop-opacity:0.95" />
          <stop offset="100%" style="stop-color:white;stop-opacity:0.85" />
        </linearGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="black" flood-opacity="0.3"/>
        </filter>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      <!-- Background -->
      <rect width="400" height="400" fill="url(#bg)" rx="20"/>
      
      <!-- Card -->
      <rect x="40" y="40" width="320" height="320" fill="url(#card)" rx="16" filter="url(#shadow)"/>
      
      <!-- Icon with animation -->
      <text x="200" y="180" text-anchor="middle" font-size="80" font-family="Arial, sans-serif" filter="url(#glow)">
        ${icon}
        <animateTransform attributeName="transform" type="scale" values="1;1.1;1" dur="1.5s" repeatCount="indefinite"/>
      </text>
      
      <!-- Tier Name with pulse -->
      <text x="200" y="220" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#333">
        ${tier}
        <animate attributeName="opacity" values="1;0.7;1" dur="2s" repeatCount="indefinite"/>
      </text>
      
      <!-- Token ID -->
      <text x="200" y="250" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="#666">
        #${tokenId}
      </text>
      
      <!-- Video indicator with animation -->
      <circle cx="200" cy="300" r="20" fill="${color}" opacity="0.8">
        <animate attributeName="r" values="20;25;20" dur="1s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.8;1;0.8" dur="1s" repeatCount="indefinite"/>
      </circle>
      <polygon points="190,290 190,310 210,300" fill="white">
        <animate attributeName="opacity" values="1;0.5;1" dur="1s" repeatCount="indefinite"/>
      </polygon>
      
      <!-- Border with glow -->
      <rect x="40" y="40" width="320" height="320" fill="none" stroke="${color}" stroke-width="3" rx="16" filter="url(#glow)">
        <animate attributeName="stroke-width" values="3;5;3" dur="2s" repeatCount="indefinite"/>
      </rect>
      
      <!-- Watermark -->
      <text x="200" y="380" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#666" opacity="0.5">
        PADD-R Staking NFT
      </text>
    </svg>
  `;
}
