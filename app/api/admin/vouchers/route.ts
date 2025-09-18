import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';

const VOUCHER_MANAGER_ADDRESS = "0x5D89adf43cb9018Ed502062a7F012a7d101893c6";
const BSC_TESTNET_RPC_URL = "https://data-seed-prebsc-1-s1.binance.org:8545/";
const PRIVATE_KEY = "22547068237db8ba6738009e6cc6279e33cec1d5665033b0b881fc49b11e71ba";

// ABI для VoucherManager
const VOUCHER_MANAGER_ABI = [
  "function createVouchersForPosition(address owner, uint256 positionId, uint8 tier) external",
  "function deactivateVoucher(uint256 voucherId) external",
  "function getVoucher(uint256 voucherId) external view returns (tuple(uint256 id, address owner, uint8 voucherType, string name, string description, string value, uint256 maxUses, uint256 currentUses, uint256 expiresAt, bool isActive, string qrCode, uint256 positionId))",
  "function isVoucherValid(uint256 voucherId) external view returns (bool)",
  "function getUserVouchers(address user) external view returns (uint256[] memory)"
];

export async function POST(req: NextRequest) {
  try {
    const { action, voucherId, owner, positionId, tier } = await req.json();
    
    if (!PRIVATE_KEY) {
      return NextResponse.json({ 
        error: 'Private key not configured' 
      }, { status: 500 });
    }

    // Подключаемся к сети
    const provider = new ethers.JsonRpcProvider(BSC_TESTNET_RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const voucherManager = new ethers.Contract(VOUCHER_MANAGER_ADDRESS, VOUCHER_MANAGER_ABI, wallet);
    
    if (action === 'create') {
      // Создаем ваучеры для позиции
      // Конвертируем tier из строки в число
      const tierMap: Record<string, number> = {
        'Bronze': 0,
        'Silver': 1,
        'Gold': 2,
        'Platinum': 3
      };
      const tierNumber = tierMap[tier] ?? parseInt(tier) ?? 0;
      
      const tx = await voucherManager.createVouchersForPosition(owner, positionId, tierNumber);
      const receipt = await tx.wait();
      
      return NextResponse.json({ 
        success: true, 
        message: 'Vouchers created successfully',
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber
      });
    }
    
    if (action === 'deactivate') {
      // Деактивируем ваучер
      const tx = await voucherManager.deactivateVoucher(voucherId);
      const receipt = await tx.wait();
      
      return NextResponse.json({ 
        success: true, 
        message: `Voucher ${voucherId} deactivated successfully`,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber
      });
    }
    
    if (action === 'redeem') {
      // Погашаем ваучер (если функция доступна)
      try {
        const tx = await voucherManager.redeemVoucherById(voucherId);
        const receipt = await tx.wait();
        
        return NextResponse.json({ 
          success: true, 
          message: `Voucher ${voucherId} redeemed successfully`,
          transactionHash: tx.hash,
          blockNumber: receipt.blockNumber
        });
      } catch (error: any) {
        // Если функция не доступна, используем деактивацию
        const tx = await voucherManager.deactivateVoucher(voucherId);
        const receipt = await tx.wait();
        
        return NextResponse.json({ 
          success: true, 
          message: `Voucher ${voucherId} deactivated successfully (redeem not available)`,
          transactionHash: tx.hash,
          blockNumber: receipt.blockNumber
        });
      }
    }
    
    if (action === 'test_redeem') {
      // Симуляция погашения одного использования многоразового ваучера
      // Пока что используем deactivateVoucher для тестирования
      try {
        // Сначала получаем текущий ваучер
        const voucher = await voucherManager.getVoucher(voucherId);
        
        if (!voucher.isActive) {
          return NextResponse.json({ 
            success: false, 
            message: 'Voucher is not active'
          }, { status: 400 });
        }
        
        if (voucher.currentUses >= voucher.maxUses) {
          return NextResponse.json({ 
            success: false, 
            message: 'Voucher is already fully used'
          }, { status: 400 });
        }
        
        // Пока что деактивируем ваучер для тестирования
        // В будущем здесь будет реальное погашение с увеличением currentUses
        const tx = await voucherManager.deactivateVoucher(voucherId);
        const receipt = await tx.wait();
        
        return NextResponse.json({ 
          success: true, 
          message: `Voucher ${voucherId} test redeemed successfully (deactivated for testing)`,
          transactionHash: tx.hash,
          blockNumber: receipt.blockNumber,
          note: 'This is a test. Real multi-use tracking will be implemented when contract is updated.'
        });
      } catch (error: any) {
        return NextResponse.json({ 
          success: false, 
          message: 'Failed to test redeem voucher',
          details: error.message
        }, { status: 500 });
      }
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
