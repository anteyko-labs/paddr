const { ethers, upgrades } = require('hardhat');

async function main() {
  console.log('🚀 Deploying VoucherManagerV2 as PROXY to BSC Testnet...\n');

  const signers = await ethers.getSigners();
  if (signers.length === 0) {
    throw new Error('No signers found. Check your private key in .env file');
  }
  const deployer = signers[0];
  console.log('Using account:', deployer.address);
  console.log('Account balance:', ethers.formatEther(await deployer.provider.getBalance(deployer.address)), 'BNB\n');

  // Deploy VoucherManagerV2 as PROXY
  console.log('📦 Deploying VoucherManagerV2 as PROXY...');
  const VoucherManagerV2 = await ethers.getContractFactory('VoucherManagerV2');
  const voucherManager = await upgrades.deployProxy(
    VoucherManagerV2,
    [],
    { 
      initializer: 'initialize',
      kind: 'uups'
    }
  );
  await voucherManager.waitForDeployment();
  console.log('✅ VoucherManagerV2 PROXY deployed to:', await voucherManager.getAddress());
  console.log('📍 Implementation address:', await upgrades.erc1967.getImplementationAddress(await voucherManager.getAddress()));

  // Verify deployment
  console.log('\n🔍 Verifying deployment...');
  
  // Check version
  const version = await voucherManager.version();
  console.log('📊 Version:', version);
  
  // Check admin role
  const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
  const hasAdminRole = await voucherManager.hasRole(DEFAULT_ADMIN_ROLE, deployer.address);
  console.log('🔐 Has admin role:', hasAdminRole);
  
  // Test basic functionality
  console.log('\n🧪 Testing basic functionality...');
  
  // Create a test voucher
  console.log('📝 Creating test voucher...');
  const createTx = await voucherManager.createVoucher(
    "Test Voucher",
    "Test voucher for testing",
    ethers.parseEther("100"), // 100 tokens
    "Gold",
    "Single Use",
    1, // max uses
    "TEST_QR_CODE_123"
  );
  await createTx.wait();
  console.log('✅ Test voucher created');
  
  // Get voucher details
  const voucher = await voucherManager.getVoucher(1);
  console.log('📊 Voucher details:', {
    id: voucher.id.toString(),
    name: voucher.name,
    value: ethers.formatEther(voucher.value),
    tier: voucher.tier,
    type: voucher.type_,
    maxUses: voucher.maxUses.toString(),
    currentUses: voucher.currentUses.toString(),
    isActive: voucher.isActive
  });
  
  // Test QR code lookup
  const voucherByQR = await voucherManager.getVoucherByQRCode("TEST_QR_CODE_123");
  console.log('✅ QR code lookup works:', voucherByQR.name);
  
  // Check total vouchers
  const totalVouchers = await voucherManager.getTotalVouchers();
  console.log('📊 Total vouchers:', totalVouchers.toString());

  console.log('\n🎉 VoucherManagerV2 PROXY deployment complete!');
  console.log('\n📋 PROXY Contract Address (NEVER CHANGE):');
  console.log('VoucherManager PROXY:', await voucherManager.getAddress());
  
  console.log('\n🔗 BSC Testnet Explorer: https://testnet.bscscan.com/');
  console.log('\n⚠️  IMPORTANT:');
  console.log('✅ VoucherManager is now a PROXY - can be upgraded without changing address');
  console.log('✅ Update frontend config with this NEW proxy address');
  console.log('✅ Future updates will only change implementation, not proxy address');
  console.log('✅ All voucher data preserved with upgradeability');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
