import { NextRequest, NextResponse } from 'next/server';
import { TIER_LEVELS } from '@/lib/contracts/config';

export async function GET(req: NextRequest) {
  try {
    // Возвращаем тиры из конфигурации
    const tiers = Object.entries(TIER_LEVELS).map(([tierNum, config]) => ({
      tier: parseInt(tierNum),
      name: config.name,
      minAmount: (config.amount * 1e18).toString(), // Конвертируем в wei
      duration: (config.duration * 3600).toString(), // Конвертируем часы в секунды
      rewardInterval: '300', // 5 минут в секундах
      multiplier: '100',
      weight: '100',
      isActive: true
    }));

    return NextResponse.json({ tiers });

  } catch (error: any) {
    console.error('Error getting tiers:', error);
    return NextResponse.json({ 
      error: 'Failed to get tiers',
      details: error.message 
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { action, tier, weight, duration, minAmount, rewardInterval, multiplier } = await req.json();
    
    if (action === 'update') {
      // Реальная интеграция с блокчейном
      const { ethers } = await import('ethers');
      
      const TIER_WEIGHT_MANAGER_ADDRESS = "0x18DDd61369C2DD3ea1144d6E440eA22d50fa384a";
      const BSC_TESTNET_RPC_URL = "https://data-seed-prebsc-1-s1.binance.org:8545/";
      const PRIVATE_KEY = "22547068237db8ba6738009e6cc6279e33cec1d5665033b0b881fc49b11e71ba";
      
      const TIER_WEIGHT_MANAGER_ABI = [
        "function setTierWeight(uint8 tier, uint256 weight) external",
        "function setTierDuration(uint8 tier, uint256 duration) external", 
        "function setTierMinAmount(uint8 tier, uint256 minAmount) external",
        "function getTierWeight(uint8 tier) external view returns (uint256)",
        "function getTierDuration(uint8 tier) external view returns (uint256)",
        "function getTierMinAmount(uint8 tier) external view returns (uint256)"
      ];
      
      const provider = new ethers.JsonRpcProvider(BSC_TESTNET_RPC_URL);
      const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
      const tierWeightManager = new ethers.Contract(TIER_WEIGHT_MANAGER_ADDRESS, TIER_WEIGHT_MANAGER_ABI, wallet);
      
      try {
        // Обновляем параметры тира
        const transactions = [];
        
        if (weight !== undefined) {
          const weightTx = await tierWeightManager.setTierWeight(tier, weight);
          await weightTx.wait();
          transactions.push({ type: 'weight', hash: weightTx.hash });
        }
        
        if (duration !== undefined) {
          const durationTx = await tierWeightManager.setTierDuration(tier, duration);
          await durationTx.wait();
          transactions.push({ type: 'duration', hash: durationTx.hash });
        }
        
        if (minAmount !== undefined) {
          const amountTx = await tierWeightManager.setTierMinAmount(tier, minAmount);
          await amountTx.wait();
          transactions.push({ type: 'minAmount', hash: amountTx.hash });
        }
        
        return NextResponse.json({ 
          success: true, 
          message: `Tier ${tier} updated successfully on blockchain`,
          transactions: transactions,
          note: 'Tier requirements have been updated for all users!'
        });
        
      } catch (blockchainError: any) {
        return NextResponse.json({ 
          success: false, 
          message: 'Failed to update tier on blockchain',
          details: blockchainError.message,
          note: 'This might be due to insufficient permissions or contract limitations.'
        }, { status: 500 });
      }
    }
    
    return NextResponse.json({ 
      error: 'Invalid action' 
    }, { status: 400 });
    
  } catch (error: any) {
    console.error('Error updating tier:', error);
    return NextResponse.json({ 
      error: 'Failed to update tier',
      details: error.message 
    }, { status: 500 });
  }
}