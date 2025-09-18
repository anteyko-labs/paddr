const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Starting comprehensive staking system test...\n");

  // Get signers
  const [owner, user1] = await ethers.getSigners();
  const ownerAddress = await owner.getAddress();
  const user1Address = await user1.getAddress();

  console.log("👤 Owner:", ownerAddress);
  console.log("👤 User1:", user1Address);
  console.log("");

  // Deploy contracts
  console.log("📦 Deploying contracts...");
  
  const PADToken = await ethers.getContractFactory("PADToken");
  const padToken = await PADToken.deploy();
  console.log("✅ PADToken deployed to:", await padToken.getAddress());

  const VoucherManager = await ethers.getContractFactory("VoucherManager");
  const voucherManager = await VoucherManager.deploy();
  console.log("✅ VoucherManager deployed to:", await voucherManager.getAddress());

  const MultiStakeManager = await ethers.getContractFactory("MultiStakeManager");
  const multiStakeManager = await MultiStakeManager.deploy(await padToken.getAddress());
  console.log("✅ MultiStakeManager deployed to:", await multiStakeManager.getAddress());

  const TierCalculator = await ethers.getContractFactory("TierCalculator");
  const tierCalculator = await TierCalculator.deploy();
  console.log("✅ TierCalculator deployed to:", await tierCalculator.getAddress());

  const PADNFTFactory = await ethers.getContractFactory("PADNFTFactory");
  const nftFactory = await PADNFTFactory.deploy(
    await multiStakeManager.getAddress(),
    await tierCalculator.getAddress()
  );
  console.log("✅ PADNFTFactory deployed to:", await nftFactory.getAddress());
  console.log("");

  // Setup roles and connections
  console.log("🔗 Setting up roles and connections...");
  await multiStakeManager.setVoucherManager(await voucherManager.getAddress());
  console.log("✅ VoucherManager set in MultiStakeManager");

  await multiStakeManager.setNFTFactory(await nftFactory.getAddress());
  console.log("✅ NFTFactory set in MultiStakeManager");

  const ADMIN_ROLE = await voucherManager.ADMIN_ROLE();
  await voucherManager.grantRole(ADMIN_ROLE, await multiStakeManager.getAddress());
  console.log("✅ ADMIN_ROLE granted to MultiStakeManager in VoucherManager");

  const MINTER_ROLE = await nftFactory.MINTER_ROLE();
  await nftFactory.grantRole(MINTER_ROLE, await multiStakeManager.getAddress());
  console.log("✅ MINTER_ROLE granted to MultiStakeManager in NFTFactory");
  console.log("");

  // Transfer tokens to user1
  const transferAmount = ethers.parseEther("10000");
  await padToken.transfer(user1Address, transferAmount);
  console.log(`💰 Transferred ${ethers.formatEther(transferAmount)} tokens to user1`);
  console.log("");

  // Test Bronze tier staking
  console.log("🥉 Testing Bronze tier staking (500 tokens, 1 hour)...");
  const bronzeAmount = ethers.parseEther("500");
  const bronzeDuration = 3600; // 1 hour

  // Check initial balances
  const initialBalance = await padToken.balanceOf(user1Address);
  console.log(`💰 User1 initial balance: ${ethers.formatEther(initialBalance)} PADD-R`);

  const initialNFTBalance = await nftFactory.balanceOf(user1Address);
  console.log(`🎨 User1 initial NFT balance: ${initialNFTBalance}`);

  // Approve and stake
  await padToken.connect(user1).approve(await multiStakeManager.getAddress(), bronzeAmount);
  console.log("✅ Approval successful");

  const tx = await multiStakeManager.connect(user1).createPosition(bronzeAmount, bronzeDuration);
  const receipt = await tx.wait();
  console.log("✅ Bronze tier staking successful");
  console.log(`📝 Transaction hash: ${tx.hash}`);

  // Get position details
  const positions = await multiStakeManager.getUserPositions(user1Address);
  const positionId = positions[0];
  console.log(`📍 Position ID: ${positionId}`);

  const position = await multiStakeManager.positions(positionId);
  console.log(`📊 Position details:`);
  console.log(`   Amount: ${ethers.formatEther(position.amount)} PADD-R`);
  console.log(`   Duration: ${position.duration} seconds (${Number(position.duration) / 3600} hours)`);
  console.log(`   Tier: ${position.tier} (Bronze)`);
  console.log(`   Start Time: ${new Date(Number(position.startTime) * 1000).toLocaleString()}`);
  console.log(`   Next Mint At: ${new Date(Number(position.nextMintAt) * 1000).toLocaleString()}`);
  console.log(`   Is Active: ${position.isActive}`);
  console.log(`   Month Index: ${position.monthIndex}`);
  console.log("");

  // Check vouchers
  console.log("🎫 Checking vouchers...");
  const userVouchers = await voucherManager.getUserVouchers(user1Address);
  console.log(`📋 Total vouchers created: ${userVouchers.length}`);

  if (userVouchers.length > 0) {
    console.log("📝 Voucher details:");
    for (let i = 0; i < userVouchers.length; i++) {
      const voucherId = userVouchers[i];
      const voucher = await voucherManager.getVoucher(voucherId);
      console.log(`   Voucher ${i + 1} (ID: ${voucherId}):`);
      console.log(`     Name: ${voucher.name}`);
      console.log(`     Description: ${voucher.description}`);
      console.log(`     Value: ${voucher.value}`);
      console.log(`     Type: ${voucher.voucherType} (0=SINGLE_USE, 1=MULTI_USE, 2=DURATION)`);
      console.log(`     Max Uses: ${voucher.maxUses}`);
      console.log(`     Current Uses: ${voucher.currentUses}`);
      console.log(`     Is Active: ${voucher.isActive}`);
      console.log(`     Position ID: ${voucher.positionId}`);
      console.log("");
    }
  }

  // Check NFT balance after staking
  const nftBalanceAfterStaking = await nftFactory.balanceOf(user1Address);
  console.log(`🎨 NFT balance after staking: ${nftBalanceAfterStaking} (should be 0)`);

  // Check token balance after staking
  const balanceAfterStaking = await padToken.balanceOf(user1Address);
  console.log(`💰 User1 balance after staking: ${ethers.formatEther(balanceAfterStaking)} PADD-R`);
  console.log("");

  // Test NFT minting after 1 hour
  console.log("⏰ Testing NFT minting after 1 hour...");
  
  // Fast forward 1 hour
  await ethers.provider.send("evm_increaseTime", [3600]);
  await ethers.provider.send("evm_mine");
  console.log("✅ Fast forwarded 1 hour");

  // Mint first NFT
  const mintTx = await multiStakeManager.connect(user1).mintNextNFT(positionId);
  const mintReceipt = await mintTx.wait();
  console.log("✅ First NFT minted successfully");
  console.log(`📝 Mint transaction hash: ${mintTx.hash}`);

  // Check NFT balance after minting
  const nftBalanceAfterMinting = await nftFactory.balanceOf(user1Address);
  console.log(`🎨 NFT balance after minting: ${nftBalanceAfterMinting} (should be 1)`);

  // Get updated position details
  const updatedPosition = await multiStakeManager.positions(positionId);
  console.log(`📊 Updated position details:`);
  console.log(`   Month Index: ${updatedPosition.monthIndex} (should be 1)`);
  console.log(`   Next Mint At: ${new Date(Number(updatedPosition.nextMintAt) * 1000).toLocaleString()}`);
  console.log("");

  // Test Silver tier staking
  console.log("🥈 Testing Silver tier staking (1000 tokens, 2 hours)...");
  const silverAmount = ethers.parseEther("1000");
  const silverDuration = 7200; // 2 hours

  await padToken.connect(user1).approve(await multiStakeManager.getAddress(), silverAmount);
  const silverTx = await multiStakeManager.connect(user1).createPosition(silverAmount, silverDuration);
  await silverTx.wait();
  console.log("✅ Silver tier staking successful");

  const silverPositions = await multiStakeManager.getUserPositions(user1Address);
  const silverPositionId = silverPositions[1];
  console.log(`📍 Silver Position ID: ${silverPositionId}`);

  const silverVouchers = await voucherManager.getUserVouchers(user1Address);
  console.log(`📋 Total vouchers after Silver staking: ${silverVouchers.length}`);
  console.log("");

  // Test voucher redemption
  console.log("🎫 Testing voucher redemption...");
  if (userVouchers.length > 0) {
    const testVoucherId = userVouchers[0];
    const isValidBefore = await voucherManager.isVoucherValid(testVoucherId);
    console.log(`✅ Voucher ${testVoucherId} is valid: ${isValidBefore}`);

    // Deactivate voucher
    await voucherManager.deactivateVoucher(testVoucherId);
    console.log(`✅ Voucher ${testVoucherId} deactivated`);

    const isValidAfter = await voucherManager.isVoucherValid(testVoucherId);
    console.log(`❌ Voucher ${testVoucherId} is valid after deactivation: ${isValidAfter}`);
  }
  console.log("");

  // Final summary
  console.log("📊 FINAL SUMMARY:");
  console.log("==================");
  const finalPositions = await multiStakeManager.getUserPositions(user1Address);
  console.log(`📍 Total positions: ${finalPositions.length}`);
  
  const finalVouchers = await voucherManager.getUserVouchers(user1Address);
  console.log(`🎫 Total vouchers: ${finalVouchers.length}`);
  
  const finalNFTBalance = await nftFactory.balanceOf(user1Address);
  console.log(`🎨 Total NFTs: ${finalNFTBalance}`);
  
  const finalBalance = await padToken.balanceOf(user1Address);
  console.log(`💰 Final balance: ${ethers.formatEther(finalBalance)} PADD-R`);
  
  console.log("\n🎉 All tests completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
