// BSC Testnet Contract Addresses
// Deploy these contracts first: npx hardhat run scripts/deploy-bsc-testnet.js --network bscTestnet

export const BSC_PAD_TOKEN_ADDRESS = '0xa5d3fF94a7aeDA396666c8978Eec67C209202da0'; // Same as Sepolia for now
export const BSC_MULTI_STAKE_MANAGER_ADDRESS = 'TBD'; // Will be set after deployment
export const BSC_VOUCHER_MANAGER_ADDRESS = 'TBD'; // Will be set after deployment  
export const BSC_PAD_NFT_FACTORY_ADDRESS = 'TBD'; // Will be set after deployment
export const BSC_TIER_CALCULATOR_ADDRESS = 'TBD'; // Will be set after deployment

// Network configuration
export const BSC_NETWORK_CONFIG = {
  chainId: 97,
  name: 'BSC Testnet',
  rpc: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
  explorer: 'https://testnet.bscscan.com/',
  faucet: 'https://testnet.bnbchain.org/faucet'
};
