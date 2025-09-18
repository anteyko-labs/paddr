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
    const { searchParams } = new URL(req.url);
    const userAddress = searchParams.get('address');
    
    if (!userAddress) {
      return NextResponse.json({ 
        error: 'User address is required' 
      }, { status: 400 });
    }

    // Подключаемся к сети
    const provider = new ethers.JsonRpcProvider(BSC_TESTNET_RPC_URL);
    const voucherManager = new ethers.Contract(VOUCHER_MANAGER_ADDRESS, VOUCHER_MANAGER_ABI, provider);

    // Получаем ваучеры пользователя
    const userVoucherIds = await voucherManager.getUserVouchers(userAddress);
    
    const vouchers = [];
    
    for (let i = 0; i < userVoucherIds.length; i++) {
      try {
        const voucherId = userVoucherIds[i];
        const voucher = await voucherManager.getVoucher(voucherId);
        const isValid = await voucherManager.isVoucherValid(voucherId);

        // Пропускаем пустые ваучеры
        if (voucher.name === "" || voucher.name === "0") {
          continue;
        }

        vouchers.push({
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
        console.log(`Error getting voucher ${userVoucherIds[i]}:`, error);
      }
    }

    return NextResponse.json({ 
      vouchers: vouchers,
      totalVouchers: vouchers.length
    });

  } catch (error: any) {
    console.error('Error getting user vouchers:', error);
    return NextResponse.json({ 
      error: 'Failed to get user vouchers',
      details: error.message 
    }, { status: 500 });
  }
}
