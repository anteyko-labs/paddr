# Smart Contract Deployment Guide

## Prerequisites

1. **Environment Variables**: Create a `.env` file in the `contracts/` directory with the following variables:
   ```
   PRIVATE_KEY=your_private_key_here
   SEPOLIA_RPC_URL=your_sepolia_rpc_url_here
   ETHERSCAN_API_KEY=your_etherscan_api_key_here
   ```

2. **Testnet ETH**: Ensure you have some Sepolia testnet ETH for gas fees.

## Deployment Steps

1. **Navigate to contracts directory**:
   ```bash
   cd contracts
   ```

2. **Deploy to Sepolia**:
   ```bash
   npx hardhat run scripts/deploy.js --network sepolia
   ```

3. **Expected Output**: The deployment script will output the deployed contract addresses:
   ```
   PADToken: 0x...
   VoucherManager: 0x...
   MultiStakeManager: 0x...
   TierCalculator: 0x...
   PADNFTFactory: 0x...
   ```

## Update Frontend Configuration

After successful deployment, update the contract addresses in `lib/contracts/config.ts`:

```typescript
// Replace these addresses with your deployed contract addresses
export const PAD_TOKEN_ADDRESS = '0x...'; // Your deployed PADToken address
export const MULTI_STAKE_MANAGER_ADDRESS = '0x...'; // Your deployed MultiStakeManager address
export const VOUCHER_MANAGER_ADDRESS = '0x...'; // Your deployed VoucherManager address
export const PAD_NFT_FACTORY_ADDRESS = '0x...'; // Your deployed PADNFTFactory address
export const TIER_CALCULATOR_ADDRESS = '0x...'; // Your deployed TierCalculator address
```

## Verification

All contracts will be automatically verified on Etherscan after deployment.

## Testing

After deployment, you can test the contracts using the frontend application. The staking system supports:

- **Fixed Tier Staking**:
  - Bronze: 500 PADD-R tokens, 1 hour
  - Silver: 1000 PADD-R tokens, 2 hours
  - Gold: 3000 PADD-R tokens, 3 hours
  - Platinum: 4000 PADD-R tokens, 4 hours

- **NFT Rewards**: Minted every hour after staking begins
- **Voucher System**: Automatic voucher creation with QR codes
- **Token Return**: Tokens returned when staking period ends

## Troubleshooting

1. **Insufficient Gas**: Ensure you have enough Sepolia ETH
2. **Network Issues**: Check your RPC URL is correct
3. **Verification Failures**: Check your Etherscan API key
