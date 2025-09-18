import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';

const VOUCHER_MANAGER_ADDRESS = "0x5D89adf43cb9018Ed502062a7F012a7d101893c6";
const BSC_TESTNET_RPC_URL = "https://data-seed-prebsc-1-s1.binance.org:8545/";

// ABI для VoucherManager (упрощенная версия)
const VOUCHER_MANAGER_ABI = [
  "function findVoucherByQRCode(string memory qrCode) external view returns (tuple(uint256 id, address owner, uint8 voucherType, string name, string description, string value, uint256 maxUses, uint256 currentUses, uint256 expiresAt, bool isActive, uint256 positionId))",
  "function isVoucherValid(uint256 voucherId) external view returns (bool)"
];

export async function POST(req: NextRequest) {
  try {
    const { qrCode } = await req.json();

    if (!qrCode) {
      return NextResponse.json({ error: 'QR code is required' }, { status: 400 });
    }

    // Подключаемся к сети
    const provider = new ethers.JsonRpcProvider(BSC_TESTNET_RPC_URL);
    const voucherManager = new ethers.Contract(VOUCHER_MANAGER_ADDRESS, VOUCHER_MANAGER_ABI, provider);

    try {
      // Ищем ваучер по QR коду
      const voucher = await voucherManager.findVoucherByQRCode(qrCode);
      
      // Проверяем валидность
      const isValid = await voucherManager.isVoucherValid(voucher.id);

      const voucherData = {
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
        positionId: voucher.positionId.toString()
      };

      return NextResponse.json(voucherData);
    } catch (error: any) {
      if (error.message.includes('Voucher not found')) {
        return NextResponse.json({ error: 'Voucher not found' }, { status: 404 });
      }
      throw error;
    }

  } catch (error: any) {
    console.error('Error checking voucher:', error);
    return NextResponse.json({ 
      error: 'Failed to check voucher',
      details: error.message 
    }, { status: 500 });
  }
}
