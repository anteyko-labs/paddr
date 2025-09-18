import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';

const VOUCHER_MANAGER_ADDRESS = "0x5D89adf43cb9018Ed502062a7F012a7d101893c6";
const BSC_TESTNET_RPC_URL = "https://data-seed-prebsc-1-s1.binance.org:8545/";

// ABI для VoucherManager
const VOUCHER_MANAGER_ABI = [
  "function getUserVouchers(address user) external view returns (uint256[] memory)",
  "function getVoucher(uint256 voucherId) external view returns (tuple(uint256 id, address owner, uint8 voucherType, string name, string description, string value, uint256 maxUses, uint256 currentUses, uint256 expiresAt, bool isActive, string qrCode, uint256 positionId))",
  "function isVoucherValid(uint256 voucherId) external view returns (bool)"
];

export async function GET(req: NextRequest) {
  try {
    console.log('Loading all vouchers...');
    
    // Подключаемся к сети
    const provider = new ethers.JsonRpcProvider(BSC_TESTNET_RPC_URL);
    const voucherManager = new ethers.Contract(VOUCHER_MANAGER_ADDRESS, VOUCHER_MANAGER_ABI, provider);

    const allVouchers = [];
    const seenOwners = new Set();

    // Проверяем ваучеры по ID (от 1 до 100)
    for (let i = 1; i <= 100; i++) {
      try {
        const voucher = await voucherManager.getVoucher(i);
        const isValid = await voucherManager.isVoucherValid(i);

        // Пропускаем пустые ваучеры (с пустыми именами)
        if (voucher.name === "" || voucher.name === "0") {
          continue;
        }

        seenOwners.add(voucher.owner);

        allVouchers.push({
          id: voucher.id.toString(),
          name: voucher.name,
          description: voucher.description,
          value: voucher.value,
          type: voucher.voucherType === 0 ? 'Single Use' :
                voucher.voucherType === 1 ? 'Multi Use' : 'Duration',
          maxUses: voucher.maxUses.toString(),
          currentUses: voucher.currentUses.toString(),
          isActive: voucher.isActive,
          isValid: isValid,
          owner: voucher.owner,
          positionId: voucher.positionId.toString(),
          expiresAt: voucher.expiresAt.toString()
        });
      } catch (error) {
        // Игнорируем ошибки (ваучер не существует)
      }
    }

    // Группируем по владельцам
    const vouchersByOwner: Record<string, any[]> = {};
    allVouchers.forEach(voucher => {
      if (!vouchersByOwner[voucher.owner]) {
        vouchersByOwner[voucher.owner] = [];
      }
      vouchersByOwner[voucher.owner].push(voucher);
    });

    console.log(`Found ${allVouchers.length} vouchers from ${seenOwners.size} owners`);
    
    return NextResponse.json({
      totalVouchers: allVouchers.length,
      totalOwners: seenOwners.size,
      owners: Array.from(seenOwners),
      vouchersByOwner,
      allVouchers
    });

  } catch (error: any) {
    console.error('Error getting all vouchers:', error);
    return NextResponse.json({ 
      error: 'Failed to get vouchers',
      details: error.message 
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { action, voucherId } = await req.json();
    
    if (action === 'redeem') {
      // Здесь будет логика погашения ваучера
      // Пока что просто возвращаем успех
      return NextResponse.json({ 
        success: true, 
        message: `Voucher ${voucherId} redeemed successfully` 
      });
    }
    
    if (action === 'deactivate') {
      // Здесь будет логика деактивации ваучера
      return NextResponse.json({ 
        success: true, 
        message: `Voucher ${voucherId} deactivated successfully` 
      });
    }
    
    return NextResponse.json({ 
      error: 'Invalid action' 
    }, { status: 400 });
    
  } catch (error: any) {
    console.error('Error processing voucher action:', error);
    return NextResponse.json({ 
      error: 'Failed to process action',
      details: error.message 
    }, { status: 500 });
  }
}
