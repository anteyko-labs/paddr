import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Маппинг тиров на папки
const tierFolders: Record<string, string> = {
  'Bronze': 'BRONZE',
  'Silver': 'SILVER', 
  'Gold': 'GOLD',
  'Platinum': 'PLATINUM'
};

// Маппинг типов ваучеров на файлы
const voucherFiles: Record<string, Record<string, string>> = {
  'Bronze': {
    'rental': '1 hour Free Rental Voucher.pdf',
    'restaurant': '10% Restaurant Discount.pdf',
    'auto': '10% Auto Service Discount.pdf'
  },
  'Silver': {
    'rental': '2 hours Free Rental Voucher.pdf',
    'restaurant': '10% Restaurant Discount.pdf',
    'auto': '15% Auto Service Discount.pdf'
  },
  'Gold': {
    'rental': '3 hours Free Rental Voucher.pdf',
    'restaurant': '15% Restaurant Discount.pdf',
    'auto': '20% Auto Service Discount.pdf'
  },
  'Platinum': {
    'rental': '600$ Rental Voucher.pdf',
    'restaurant': '20% Restaurant Discount.pdf',
    'auto': '25% Auto Service Discount.pdf'
  }
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tier = searchParams.get('tier');
  const type = searchParams.get('type') || 'rental';

  if (!tier) {
    return NextResponse.json({ error: 'tier required' }, { status: 400 });
  }

  try {
    const tierFolder = tierFolders[tier];
    if (!tierFolder) {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
    }

    const fileName = voucherFiles[tier]?.[type];
    if (!fileName) {
      return NextResponse.json({ error: 'Invalid voucher type' }, { status: 400 });
    }

    // Проверяем что файл существует
    const filePath = path.join(process.cwd(), tierFolder, fileName);
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'Voucher file not found' }, { status: 404 });
    }

    // Возвращаем URL для изображения (пока заглушка)
    const imageUrl = `/api/voucher-preview?tier=${tier}&type=${type}`;
    
    return NextResponse.json({ 
      imageUrl,
      pdfUrl: `/${tierFolder}/${fileName}`,
      tier,
      type,
      fileName
    });
  } catch (error) {
    console.error('Error fetching voucher image:', error);
    return NextResponse.json({ error: 'Failed to fetch voucher image' }, { status: 500 });
  }
}
