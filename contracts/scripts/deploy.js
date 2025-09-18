const hre = require("hardhat");

async function main() {
  console.log("Starting deployment...");

  // Deploy PADToken
  console.log("Deploying PADToken...");
  const PADToken = await hre.ethers.getContractFactory("PADToken");
  const padToken = await PADToken.deploy();
  await padToken.waitForDeployment();
  console.log("PADToken deployed to:", await padToken.getAddress());

  // Deploy VoucherManager
  console.log("Deploying VoucherManager...");
  const VoucherManager = await hre.ethers.getContractFactory("VoucherManager");
  const voucherManager = await VoucherManager.deploy();
  await voucherManager.waitForDeployment();
  console.log("VoucherManager deployed to:", await voucherManager.getAddress());

  // Deploy MultiStakeManager
  console.log("Deploying MultiStakeManager...");
  const MultiStakeManager = await hre.ethers.getContractFactory("MultiStakeManager");
  const multiStakeManager = await MultiStakeManager.deploy(
    await padToken.getAddress()
  );
  await multiStakeManager.waitForDeployment();
  console.log("MultiStakeManager deployed to:", await multiStakeManager.getAddress());

  // Deploy TierCalculator
  console.log("Deploying TierCalculator...");
  const TierCalculator = await hre.ethers.getContractFactory("TierCalculator");
  const tierCalculator = await TierCalculator.deploy();
  await tierCalculator.waitForDeployment();
  console.log("TierCalculator deployed to:", await tierCalculator.getAddress());

  // Deploy PADNFTFactory
  console.log("Deploying PADNFTFactory...");
  const PADNFTFactory = await hre.ethers.getContractFactory("PADNFTFactory");
  const nftFactory = await PADNFTFactory.deploy(
    await multiStakeManager.getAddress(),
    await tierCalculator.getAddress()
  );
  await nftFactory.waitForDeployment();
  console.log("PADNFTFactory deployed to:", await nftFactory.getAddress());

  // Setup roles and connections
  console.log("Setting up roles and connections...");
  
  // Set VoucherManager in MultiStakeManager
  await multiStakeManager.setVoucherManager(await voucherManager.getAddress());
  console.log("VoucherManager set in MultiStakeManager");

  // Set NFTFactory in MultiStakeManager
  await multiStakeManager.setNFTFactory(await nftFactory.getAddress());
  console.log("NFTFactory set in MultiStakeManager");

  // Grant ADMIN_ROLE to MultiStakeManager in VoucherManager
  const ADMIN_ROLE = await voucherManager.ADMIN_ROLE();
  await voucherManager.grantRole(ADMIN_ROLE, await multiStakeManager.getAddress());
  console.log("ADMIN_ROLE granted to MultiStakeManager in VoucherManager");

  // Grant MINTER_ROLE to MultiStakeManager in NFTFactory
  const MINTER_ROLE = await nftFactory.MINTER_ROLE();
  await nftFactory.grantRole(MINTER_ROLE, await multiStakeManager.getAddress());
  console.log("MINTER_ROLE granted to MultiStakeManager in NFTFactory");

  // Verify contracts on Etherscan
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("Waiting for block confirmations...");
    await padToken.deployTransaction.wait(6);
    await voucherManager.deployTransaction.wait(6);
    await multiStakeManager.deployTransaction.wait(6);
    await tierCalculator.deployTransaction.wait(6);
    await nftFactory.deployTransaction.wait(6);

    console.log("Verifying contracts...");
    await hre.run("verify:verify", {
      address: await padToken.getAddress(),
      constructorArguments: [],
    });

    await hre.run("verify:verify", {
      address: await voucherManager.getAddress(),
      constructorArguments: [],
    });

    await hre.run("verify:verify", {
      address: await multiStakeManager.getAddress(),
      constructorArguments: [
        await padToken.getAddress(),
      ],
    });

    await hre.run("verify:verify", {
      address: await tierCalculator.getAddress(),
      constructorArguments: [],
    });

    await hre.run("verify:verify", {
      address: await nftFactory.getAddress(),
      constructorArguments: [
        await multiStakeManager.getAddress(),
        await tierCalculator.getAddress(),
      ],
    });
  }

  console.log("Deployment completed!");
  console.log("\nDeployed addresses:");
  console.log("PADToken:", await padToken.getAddress());
  console.log("VoucherManager:", await voucherManager.getAddress());
  console.log("MultiStakeManager:", await multiStakeManager.getAddress());
  console.log("TierCalculator:", await tierCalculator.getAddress());
  console.log("PADNFTFactory:", await nftFactory.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 