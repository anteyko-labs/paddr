'use client';

import React, { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Clock, Star, Gift, QrCode, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PAD_TOKEN_ADDRESS, STAKE_MANAGER_ADDRESS, NFT_FACTORY_ADDRESS } from '@/lib/contracts/config';
import { NFT_FACTORY_ABI } from '@/lib/contracts/abis';
import { useNFTBalanceFromEvents } from '@/hooks/useNFTBalanceFromEvents';
import { useStakingPositions } from '@/hooks/useStakingPositions';
import { useVouchers } from '@/hooks/useVouchers';
import { TIER_LEVELS } from '@/lib/contracts/config';
import { useContext } from 'react';
import { BrowserProvider, Contract, JsonRpcProvider } from 'ethers';
// import { VouchersPanel } from './vouchers-panel'; // Файл удален

import { DashboardDataContext } from './layout';
import { RealNFTGallery } from './real-nft-gallery';

export function RewardsPanel() {
  const { nftBalance, stakingPositions } = useContext(DashboardDataContext);
  const {
    nfts = [],
    isLoading: isLoadingNFTs,
    totalNFTs = 0,
    transferableNFTs = 0,
    currentTier,
    refetch,
  } = nftBalance;
  const {
    positions = [],
    isLoading: isLoadingPositions,
    totalRewards = 0,
  } = stakingPositions;
  
  // Use real voucher data from smart contract
  const { vouchers, isLoading: isLoadingVouchers, error: vouchersError } = useVouchers();
  
  const [filter, setFilter] = useState<'active' | 'expired' | 'used' | 'transferred'>('active');

  // Слушаем событие NFTMinted
  useEffect(() => {
    // Для подписки на события используем публичный RPC из .env
    const rpcUrl = process.env.NEXT_PUBLIC_BSC_TESTNET_RPC_URL || 'https://data-seed-prebsc-1-s1.binance.org:8545/';
    const rpcProvider = new JsonRpcProvider(rpcUrl);
    const nftAddress = NFT_FACTORY_ADDRESS;
    if (!nftAddress) return;
    const abi = [
      'event NFTMinted(address indexed to, uint256 indexed tokenId, tuple(uint256,uint256,uint256,uint256,uint8,uint256,uint256) meta)'
    ];
    const contract = new Contract(nftAddress, abi, rpcProvider);
    const handler = () => refetch && refetch();
    contract.on('NFTMinted', handler);
    return () => { contract.off('NFTMinted', handler); };
  }, [refetch]);

  // Функция для вычисления статуса NFT
  function getNFTStatus(nft: any) {
    // Примерная логика, доработай под свои правила:
    // - active: transferable и срок не истёк
    // - expired: если есть поле nextMintOn и оно в прошлом
    // - used: если есть поле used или аналогичное (заглушка)
    // - transferred: если есть поле owner и он не совпадает с текущим пользователем (заглушка)
    const now = Date.now() / 1000;
    if (nft.used) return 'used';
    if (nft.owner && nft.owner !== nft.currentUser) return 'transferred';
    if (nft.nextMintOn && Number(nft.nextMintOn) < now) return 'expired';
    return 'active';
  }

  // Фильтруем NFT по выбранному статусу
  const filteredNFTs = nfts.filter((nft: any) => getNFTStatus(nft) === filter);

  // Генерируем NFT карточки на основе реальных данных
  const generateNFTCards = () => {
    if (isLoadingNFTs) {
      return <div className="text-center py-8 text-gray-400">Loading NFTs...</div>;
    }
    if (nfts.length === 0) {
      return <div className="text-center py-8 text-gray-400">No NFTs yet</div>;
    }
    return nfts.map((nft: any, index: number) => (
      <Card key={`nft-${nft.tokenId}-${index}`} className="bg-gray-900/50 border-gray-800 card-hover overflow-hidden">
        <div className="relative">
          <video
            src={`/api/nft-video?tier=${nft.tierInfo?.name}`}
            autoPlay
            loop
            muted
            className="w-full h-48 object-cover"
            onError={(e) => {
              // Fallback to thumbnail if video fails
              const target = e.target as HTMLVideoElement;
              target.style.display = 'none';
              const img = target.nextElementSibling as HTMLImageElement;
              if (img) img.style.display = 'block';
            }}
          />
          <img
            src={`/nft_tiers/${nft.tierInfo?.name?.toLowerCase()}-tier.png`}
            alt={`${nft.tierInfo?.name} NFT`}
            className="w-full h-48 object-cover hidden"
          />
          <div className="absolute top-4 right-4">
            <Badge className={`${
              nft.tierInfo?.name === 'Platinum' ? 'bg-emerald-600' :
              nft.tierInfo?.name === 'Gold' ? 'bg-yellow-600' :
              nft.tierInfo?.name === 'Silver' ? 'bg-gray-600' : 'bg-amber-600'
            } text-white`}>
              {nft.tierInfo?.name}
            </Badge>
          </div>
        </div>
        <CardHeader>
          <CardTitle className="text-lg text-white">{nft.tierInfo?.name} NFT #{nft.tokenId}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center space-x-2">
              <span className="text-gray-400">Started: {nft.formattedStartDate}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-400">Staked for: {Number(nft.lockDurationMonths)} month{Number(nft.lockDurationMonths) === 1 ? '' : 's'}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    ));
  };

  // Real vouchers from smart contract - no need to generate mock data

  // Динамическая история наград
  const rewardHistory = [
    // NFT события
    ...nfts.map((nft: any, index: number) => ({
      date: nft.formattedStartDate,
      reward: `${nft.tierInfo?.name} NFT`,
      tier: nft.tierInfo?.name,
      amount: nft.formattedAmountStaked,
    })),
    // Токеновые награды по позициям
    ...positions.filter((pos: any) => !!pos && Number(pos.rewards) > 0).map((pos: any) => {
      const safePos = pos as NonNullable<typeof pos>;
      return {
        date: safePos.formattedNextMintDate,
        reward: `${safePos.tierInfo?.name} Token Reward`,
        tier: safePos.tierInfo?.name,
        amount: safePos.formattedRewards,
      };
    }),
  ];

  function formatDuration(seconds: number) {
    if (!seconds || seconds <= 0) return '0 minutes';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    let res = '';
    if (h > 0) res += `${h} hour${h > 1 ? 's' : ''} `;
    if (m > 0) res += `${m} minute${m > 1 ? 's' : ''}`;
    return res.trim();
  }

  // Helper to get tier key by name
  const getTierKeyByName = (name: string): number | undefined => {
    const entry = Object.entries(TIER_LEVELS).find(([, value]) => value.name === name);
    return entry ? Number(entry[0]) : undefined;
  };

  // Пример reduce с типами
  const bestTier = filteredNFTs.reduce((max: string, pos: any, index: number) => {
    // ...
    return max;
  }, 'No Tier');

  filteredNFTs.forEach((pos: any, index: number) => {
    // ...
  });

  filteredNFTs.map((nft: any, index: number) => { /* ... */ });

  vouchers.map((voucher: any, index: number) => { /* ... */ });

  rewardHistory.map((item: any, index: number) => { /* ... */ });

  return (
    <div className="space-y-8">
      {/* Фильтр по статусу */}
      <div className="overflow-x-auto mb-4">
        <div className="flex gap-2 flex-nowrap w-max min-w-full">
          <Button
            variant="ghost"
            size="sm"
            className={`transition-colors rounded-full px-4 py-2 font-semibold border-2
              ${filter === 'active' ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg' : 'bg-transparent border-emerald-800 text-emerald-400 hover:bg-emerald-900/20'}
            `}
            onClick={() => setFilter('active')}
          >
            Актуальные
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`transition-colors rounded-full px-4 py-2 font-semibold border-2
              ${filter === 'used' ? 'bg-gray-600 text-white border-gray-600 shadow-lg' : 'bg-transparent border-gray-800 text-gray-400 hover:bg-gray-900/20'}
            `}
            onClick={() => setFilter('used')}
          >
            Использованы
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`transition-colors rounded-full px-4 py-2 font-semibold border-2
              ${filter === 'transferred' ? 'bg-purple-600 text-white border-purple-600 shadow-lg' : 'bg-transparent border-purple-800 text-purple-400 hover:bg-purple-900/20'}
            `}
            onClick={() => setFilter('transferred')}
          >
            Переданы
          </Button>
        </div>
      </div>
      {/* NFT Rewards */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">NFT Collection</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoadingNFTs ? (
            generateNFTCards()
          ) : filteredNFTs.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="w-24 h-24 bg-gray-800 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Trophy size={32} className="text-gray-600" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Нет NFT с выбранным статусом</h3>
              <p className="text-gray-400 mb-4">Попробуйте выбрать другой фильтр</p>
            </div>
          ) : (
            filteredNFTs.map((nft: any, index: number) => (
              <Card key={`filtered-nft-${nft.tokenId}-${index}`} className="bg-gray-900/50 border-gray-800 card-hover overflow-hidden">
                <div className="relative">
                  <video
                    src={`/api/nft-video?tier=${nft.tierInfo?.name}`}
                    autoPlay
                    loop
                    muted
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      // Fallback to thumbnail if video fails
                      const target = e.target as HTMLVideoElement;
                      target.style.display = 'none';
                      const img = target.nextElementSibling as HTMLImageElement;
                      if (img) img.style.display = 'block';
                    }}
                  />
                  <img
                    src={`/nft_tiers/${nft.tierInfo?.name?.toLowerCase()}-tier.png`}
                    alt={`${nft.tierInfo?.name} NFT`}
                    className="w-full h-48 object-cover hidden"
                  />
                  <div className="absolute top-4 right-4">
                    <Badge className={`${
                      nft.tierInfo?.name === 'Platinum' ? 'bg-emerald-600' :
                      nft.tierInfo?.name === 'Gold' ? 'bg-yellow-600' :
                      nft.tierInfo?.name === 'Silver' ? 'bg-gray-600' : 'bg-amber-600'
                    } text-white`}>
                      {nft.tierInfo?.name}
                    </Badge>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="text-lg text-white">{nft.tierInfo?.name} NFT #{nft.tokenId}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-400">Started: {nft.formattedStartDate}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-400">Staked for: {Number(nft.lockDurationMonths)} month{Number(nft.lockDurationMonths) === 1 ? '' : 's'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Active Vouchers */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">Active Vouchers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoadingVouchers ? (
            <div className="col-span-full text-center py-12 text-gray-400">Loading vouchers...</div>
          ) : vouchersError ? (
            <div className="col-span-full text-center py-12 text-red-400">Error loading vouchers: {vouchersError}</div>
          ) : vouchers.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-400">No active vouchers</div>
          ) : vouchers.map((voucher: any, index: number) => (
            <Card key={index} className="bg-gray-900/50 border-gray-800 card-hover">
              <CardHeader>
                <CardTitle className="text-lg text-white">{voucher.name}</CardTitle>
                <Badge className={`w-fit ${voucher.isActive ? 'bg-emerald-600' : 'bg-gray-600'} text-white`}>
                  {voucher.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-300 text-sm">{voucher.description}</p>
                <div className="text-sm">
                  <span className="text-gray-400">Value: </span>
                  <span className="text-white font-semibold">{voucher.value}</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-400">Type: </span>
                  <span className="text-white">
                    {voucher.voucherType === 0 ? 'Single Use' : 
                     voucher.voucherType === 1 ? 'Multi Use' : 'Duration'}
                  </span>
                </div>
                {voucher.voucherType === 1 && (
                  <div className="text-sm">
                    <span className="text-gray-400">Uses: </span>
                    <span className="text-white">{Number(voucher.currentUses)} / {Number(voucher.maxUses)}</span>
                  </div>
                )}
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                    <QrCode size={16} className="mr-1" />
                    Show QR
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 border-gray-600 text-gray-300"
                  >
                    <Download size={16} className="mr-1" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Reward History */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Gift size={20} className="text-purple-400" />
            <span>Reward History</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {rewardHistory.length === 0 ? (
              <div className="text-center text-gray-400">No reward history</div>
            ) : rewardHistory.map((item: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-2xl bg-gray-800/30">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-600/20 rounded-full flex items-center justify-center">
                    <Gift size={16} className="text-purple-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white">{item.reward}</p>
                    <p className="text-sm text-gray-400">{item.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="text-xs border-gray-600 text-gray-300">
                    {item.type}
                  </Badge>
                  <p className="text-xs text-emerald-400 mt-1">{item.status}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Real NFT Gallery */}
      <RealNFTGallery />

      {/* Vouchers Panel - временно отключен */}
      {/* <VouchersPanel /> */}
    </div>
  );
}