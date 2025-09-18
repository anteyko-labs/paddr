import { sepolia, mainnet, bscTestnet } from 'wagmi/chains';

// Типы для позиций стейкинга
export interface StakingPosition {
  id: number;
  amount: bigint;
  startTime: bigint;
  duration: bigint;
  nextMintAt: bigint;
  tier: bigint;
  monthIndex: bigint;
  isActive: boolean;
  owner: string;
  rewards?: bigint;
}

// Типы для NFT метаданных
export interface NFTMetadata {
  positionId: bigint;
  amountStaked: bigint;
  lockDurationHours: bigint;
  startTimestamp: bigint;
  tierLevel: number;
  hourIndex: bigint;
  nextMintOn: bigint;
}

// Новый TIER_LEVELS для фиксированных сумм (МЕЙННЕТ НАСТРОЙКИ)
export const TIER_LEVELS = {
  0: { name: 'Bronze', color: '#CD7F32', amount: 500, duration: 1 },   // 500 токенов, 1 месяц
  1: { name: 'Silver', color: '#C0C0C0', amount: 1000, duration: 3 },  // 1000 токенов, 3 месяца
  2: { name: 'Gold', color: '#FFD700', amount: 2500, duration: 6 },     // 2500 токенов, 6 месяцев
  3: { name: 'Platinum', color: '#E5E4E2', amount: 5000, duration: 12 }, // 5000 токенов, 12 месяцев
} as const;

// Форматирование чисел
export function formatTokenAmount(amount: bigint, decimals: number = 18): string {
  const divisor = BigInt(10 ** decimals);
  const whole = amount / divisor;
  const fraction = amount % divisor;
  if (fraction === BigInt(0)) {
    return whole.toString();
  }
  const fractionStr = fraction.toString().padStart(decimals, '0');
  const trimmedFraction = fractionStr.replace(/0+$/, '');
  return `${whole}.${trimmedFraction}`;
}

// Форматирование времени
export function formatDuration(seconds: bigint): string {
  const days = Math.floor(Number(seconds) / 86400);
  const hours = Math.floor((Number(seconds) % 86400) / 3600);
  let res = '';
  if (days > 0) res += `${days} day${days > 1 ? 's' : ''} `;
  if (hours > 0) res += `${hours} hour${hours > 1 ? 's' : ''}`;
  return res.trim() || '0 hours';
}

// Форматирование даты
export function formatDate(timestamp: bigint): string {
  return new Date(Number(timestamp) * 1000).toLocaleDateString();
}

// Contract addresses - ALL PROXIES ON BSC TESTNET (1 BILLION TOKENS) - UPGRADEABLE
export const PAD_TOKEN_ADDRESS = '0xe7df07F1B2525AE59489E253811a64EC20f2d14E'; // PROXY V2
export const MULTI_STAKE_MANAGER_ADDRESS = '0xaFbe65E1bcB565EdA5469B5f465357DcE02C17bc'; // PROXY V4 with blacklist
export const VOUCHER_MANAGER_ADDRESS = '0x6ea4DFd4a83C0261d9ab2B858df3b427D84E2dd7'; // PROXY V2
export const PAD_NFT_FACTORY_ADDRESS = '0x8c266d52Fcb28c76A8FDFd0CBE82a623a94FF742'; // PROXY V2
export const TIER_CALCULATOR_ADDRESS = '0xFAa3A27b42268d81fE9C9a5e8CF1B51B2564Ac65'; // PROXY V2

// Legacy addresses for backward compatibility
export const STAKE_MANAGER_ADDRESS = MULTI_STAKE_MANAGER_ADDRESS;
export const NFT_FACTORY_ADDRESS = PAD_NFT_FACTORY_ADDRESS;

// Импортируем ABI
export { VOUCHER_MANAGER_ABI } from './abis'; 