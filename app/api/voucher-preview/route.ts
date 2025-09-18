import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tier = searchParams.get('tier');
  const type = searchParams.get('type');

  if (!tier) {
    return NextResponse.json({ error: 'tier required' }, { status: 400 });
  }

  try {
    // Создаем простое SVG изображение для ваучера
    const svg = `
      <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${getTierColor(tier)};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${getTierColor(tier)}88;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="400" height="300" fill="url(#grad)" rx="10"/>
        <rect x="20" y="20" width="360" height="260" fill="white" fill-opacity="0.9" rx="8"/>
        <text x="200" y="80" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#333">
          ${getVoucherTitle(tier, type)}
        </text>
        <text x="200" y="120" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="#666">
          ${getVoucherDescription(tier, type)}
        </text>
        <text x="200" y="180" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="#888">
          Tier: ${tier}
        </text>
        <text x="200" y="220" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#aaa">
          Click to open PDF
        </text>
      </svg>
    `;

    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=31536000',
      },
    });
  } catch (error) {
    console.error('Error generating voucher preview:', error);
    return NextResponse.json({ error: 'Failed to generate voucher preview' }, { status: 500 });
  }
}

function getTierColor(tier: string): string {
  const colors: Record<string, string> = {
    'Bronze': '#CD7F32',
    'Silver': '#C0C0C0',
    'Gold': '#FFD700',
    'Platinum': '#E5E4E2'
  };
  return colors[tier] || '#gray';
}

function getVoucherTitle(tier: string, type: string | null): string {
  const titles: Record<string, Record<string, string>> = {
    'Bronze': {
      'rental': '1 Hour Free Rental',
      'restaurant': '10% Restaurant Discount',
      'auto': '10% Auto Service Discount'
    },
    'Silver': {
      'rental': '2 Hours Free Rental',
      'restaurant': '10% Restaurant Discount',
      'auto': '15% Auto Service Discount'
    },
    'Gold': {
      'rental': '3 Hours Free Rental',
      'restaurant': '15% Restaurant Discount',
      'auto': '20% Auto Service Discount'
    },
    'Platinum': {
      'rental': '$600 Rental Voucher',
      'restaurant': '20% Restaurant Discount',
      'auto': '25% Auto Service Discount'
    }
  };
  return titles[tier]?.[type || 'rental'] || 'Voucher';
}

function getVoucherDescription(tier: string, type: string | null): string {
  const descriptions: Record<string, Record<string, string>> = {
    'Bronze': {
      'rental': 'Free car rental for 1 hour',
      'restaurant': '10% discount at partner restaurants',
      'auto': '10% discount on auto services'
    },
    'Silver': {
      'rental': 'Free car rental for 2 hours',
      'restaurant': '10% discount at partner restaurants',
      'auto': '15% discount on auto services'
    },
    'Gold': {
      'rental': 'Free car rental for 3 hours',
      'restaurant': '15% discount at partner restaurants',
      'auto': '20% discount on auto services'
    },
    'Platinum': {
      'rental': 'Up to $600 rental voucher',
      'restaurant': '20% discount at partner restaurants',
      'auto': '25% discount on auto services'
    }
  };
  return descriptions[tier]?.[type || 'rental'] || 'Staking reward voucher';
}
