const { ethers } = require('ethers');

async function main() {
  const provider = new ethers.JsonRpcProvider('https://sepolia.infura.io/v3/01fd1d3959ec4dd3afbef724e8c959da');
  const voucherManager = new ethers.Contract('0x5D89adf43cb9018Ed502062a7F012a7d101893c6', [
    'function getVoucher(uint256 voucherId) external view returns (tuple(uint256 id, address owner, uint8 voucherType, string name, string description, string value, uint256 maxUses, uint256 currentUses, uint256 expiresAt, bool isActive, string qrCode, uint256 positionId))'
  ], provider);
  
  console.log('🔍 Vouchers 60-64:');
  for (let id = 60; id <= 64; id++) {
    try {
      const v = await voucherManager.getVoucher(id);
      console.log(`ID ${id}: ${v.name} - Uses: ${v.currentUses}/${v.maxUses} - Active: ${v.isActive}`);
    } catch (e) {
      console.log(`ID ${id}: Error`);
    }
  }
}

main().catch(console.error);