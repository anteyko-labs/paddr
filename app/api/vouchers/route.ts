import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Путь к конфигурации ваучеров
const VOUCHER_CONFIG_FILE = path.join(process.cwd(), 'data', 'voucher-config.json');

// Дефолтная конфигурация ваучеров (обновленная с реальными данными)
const defaultVoucherConfig = {
  tiers: {
    BRONZE: {
      name: 'BRONZE',
      vouchers: [
        { id: 'bronze_1', name: '1 hour Free Rental Voucher', description: '1 hour free rental when renting for 1 day or more', value: '1 hour', type: 'SINGLE_USE', image: '1 hour Free Rental Voucher.png', pdf: '1 hour Free Rental Voucher.pdf' },
        { id: 'bronze_2', name: '1 hour Free Rental Voucher-1', description: '1 hour free rental when renting for 1 day or more', value: '1 hour', type: 'SINGLE_USE', image: '1 hour Free Rental Voucher-1.png', pdf: '1 hour Free Rental Voucher-1.pdf' },
        { id: 'bronze_3', name: '10% Restaurant Discount', description: '10% discount at restaurant', value: '10%', type: 'DURATION', image: '10% Restaurant Discount.png', pdf: '10% Restaurant Discount.pdf' },
        { id: 'bronze_4', name: '10% Auto Service Discount', description: '10% discount at auto service', value: '10%', type: 'DURATION', image: '10% Auto Service Discount.png', pdf: '10% Auto Service Discount.pdf' }
      ]
    },
    SILVER: {
      name: 'SILVER',
      vouchers: [
        { id: 'silver_1', name: '2 hours Free Rental Voucher', description: '2 hours free rental when renting for 1 day or more', value: '2 hours', type: 'SINGLE_USE', image: '2 hours Free Rental Voucher.png', pdf: '2 hours Free Rental Voucher.pdf' },
        { id: 'silver_2', name: '150$ Rental Voucher', description: '1x $150 car rental coupon', value: '$150', type: 'SINGLE_USE', image: '150$ Rental Voucher.png', pdf: '150$ Rental Voucher.pdf' },
        { id: 'silver_3', name: '15% Auto Service Discount', description: '15% discount at auto service', value: '15%', type: 'DURATION', image: '15% Auto Service Discount.png', pdf: '15% Auto Service Discount.pdf' },
        { id: 'silver_4', name: '10% Restaurant Discount', description: '10% discount at restaurant', value: '10%', type: 'DURATION', image: '10% Restaurant Discount.png', pdf: '10% Restaurant Discount.pdf' },
        { id: 'silver_5', name: 'Free Car Wash Voucher', description: 'Free car wash', value: 'Free', type: 'SINGLE_USE', image: 'Free Car Wash Voucher.png', pdf: 'Free Car Wash Voucher.pdf' },
        { id: 'silver_6', name: 'Free Upgrade Voucher', description: 'Free car upgrade', value: 'Upgrade', type: 'SINGLE_USE', image: 'Free Upgrade Voucher.png', pdf: 'Free Upgrade Voucher.pdf' }
      ]
    },
    GOLD: {
      name: 'GOLD',
      vouchers: [
        { id: 'gold_1', name: '3 hours Free Rental Voucher', description: '3 hours free rental when renting for 1 day or more', value: '3 hours', type: 'SINGLE_USE', image: '3 hours Free Rental Voucher.png', pdf: '3 hours Free Rental Voucher.pdf' },
        { id: 'gold_2', name: '600$ Rental Voucher', description: '1x $600 car rental coupon', value: '$600', type: 'SINGLE_USE', image: '600$ Rental Voucher.png', pdf: '600$ Rental Voucher.pdf' },
        { id: 'gold_3', name: '20% Auto Service Discount', description: '20% discount at auto service', value: '20%', type: 'DURATION', image: '20% Auto Service Discount.png', pdf: '20% Auto Service Discount.pdf' },
        { id: 'gold_4', name: '15% Restaurant Discount', description: '15% discount at restaurant', value: '15%', type: 'DURATION', image: '15% Restaurant Discount.png', pdf: '15% Restaurant Discount.pdf' },
        { id: 'gold_5', name: 'Unlimited Mileage', description: 'Unlimited mileage on rentals', value: 'Unlimited', type: 'DURATION', image: 'Unlimited Mileage.png', pdf: 'Unlimited Mileage.pdf' },
        { id: 'gold_6', name: 'Premium Protection', description: 'Premium protection included', value: 'Premium', type: 'DURATION', image: 'Premium Protection.png', pdf: 'Premium Protection.pdf' },
        { id: 'gold_7', name: 'Free Car Wash Voucher', description: 'Free car wash', value: 'Free', type: 'SINGLE_USE', image: 'Free Car Wash Voucher.png', pdf: 'Free Car Wash Voucher.pdf' },
        { id: 'gold_8', name: 'Free Upgrade Voucher', description: 'Free car upgrade', value: 'Upgrade', type: 'SINGLE_USE', image: 'Free Upgrade Voucher.png', pdf: 'Free Upgrade Voucher.pdf' }
      ]
    },
    PLATINUM: {
      name: 'PLATINUM',
      vouchers: [
        { id: 'platinum_1', name: '5 hours Free Rental Voucher', description: '5 hours free rental when renting for 1 day or more', value: '5 hours', type: 'SINGLE_USE', image: '5 hours Free Rental Voucher.png', pdf: '5 hours Free Rental Voucher.pdf' },
        { id: 'platinum_2', name: '1250$ Rental Voucher', description: '1x $1250 car rental coupon', value: '$1250', type: 'SINGLE_USE', image: '1250$ Rental Voucher.png', pdf: '1250$ Rental Voucher.pdf' },
        { id: 'platinum_3', name: '20% Auto Service Discount', description: '20% discount at auto service', value: '20%', type: 'DURATION', image: '20% Auto Service Discount.png', pdf: '20% Auto Service Discount.pdf' },
        { id: 'platinum_4', name: '20% Restaurant Discount', description: '20% discount at restaurant', value: '20%', type: 'DURATION', image: '20% Restaurant Discount.png', pdf: '20% Restaurant Discount.pdf' },
        { id: 'platinum_5', name: 'Unlimited Mileage', description: 'Unlimited mileage on rentals', value: 'Unlimited', type: 'DURATION', image: 'Unlimited Mileage.png', pdf: 'Unlimited Mileage.pdf' },
        { id: 'platinum_6', name: 'Premium Protection', description: 'Premium protection included', value: 'Premium', type: 'DURATION', image: 'Premium Protection.png', pdf: 'Premium Protection.pdf' },
        { id: 'platinum_7', name: 'Free Car Wash Voucher', description: 'Free car wash', value: 'Free', type: 'SINGLE_USE', image: 'Free Car Wash Voucher.png', pdf: 'Free Car Wash Voucher.pdf' },
        { id: 'platinum_8', name: 'Free Upgrade Voucher', description: 'Free car upgrade', value: 'Upgrade', type: 'SINGLE_USE', image: 'Free Upgrade Voucher.png', pdf: 'Free Upgrade Voucher.pdf' },
        { id: 'platinum_9', name: 'Chauffeur Service Voucher (6h)', description: '6 hours chauffeur service', value: '6 hours', type: 'SINGLE_USE', image: 'Chauffeur Service Voucher (6h).png', pdf: 'Chauffeur Service Voucher (6h).pdf' },
        { id: 'platinum_10', name: 'Free UAE Delivery Voucher', description: 'Free delivery in UAE', value: 'Free', type: 'SINGLE_USE', image: 'Free UAE Delivery Voucher.png', pdf: 'Free UAE Delivery Voucher.pdf' }
      ]
    }
  },
  version: 1,
  lastUpdated: new Date().toISOString()
};

// Функция для чтения конфигурации ваучеров
function readVoucherConfig() {
  try {
    if (fs.existsSync(VOUCHER_CONFIG_FILE)) {
      const data = fs.readFileSync(VOUCHER_CONFIG_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading voucher config:', error);
  }
  return defaultVoucherConfig;
}

// GET: Получить ваучеры для тира
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tier = searchParams.get('tier');
    
    const config = readVoucherConfig();
    
    if (tier) {
      const tierData = config.tiers[tier.toUpperCase()];
      if (!tierData) {
        return NextResponse.json(
          { error: `Tier ${tier} not found` },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        tier: tierData.name,
        vouchers: tierData.vouchers,
        count: tierData.vouchers.length
      });
    }
    
    return NextResponse.json(config);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to read voucher configuration' },
      { status: 500 }
    );
  }
}

// POST: Получить случайный ваучер для тира
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tier, excludeUsed = [] } = body;
    
    if (!tier) {
      return NextResponse.json(
        { error: 'tier is required' },
        { status: 400 }
      );
    }
    
    const config = readVoucherConfig();
    const tierData = config.tiers[tier.toUpperCase()];
    
    if (!tierData) {
      return NextResponse.json(
        { error: `Tier ${tier} not found` },
        { status: 404 }
      );
    }
    
    // Фильтруем неиспользованные ваучеры
    const availableVouchers = tierData.vouchers.filter(
      (voucher: any) => !excludeUsed.includes(voucher.id)
    );
    
    if (availableVouchers.length === 0) {
      return NextResponse.json(
        { error: 'No available vouchers for this tier' },
        { status: 404 }
      );
    }
    
    // Выбираем случайный ваучер
    const randomVoucher = availableVouchers[
      Math.floor(Math.random() * availableVouchers.length)
    ];
    
    return NextResponse.json({
      voucher: randomVoucher,
      tier: tierData.name,
      available: availableVouchers.length
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get random voucher' },
      { status: 500 }
    );
  }
}
