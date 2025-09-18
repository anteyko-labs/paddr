'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Shield, Info, Calculator, Clock, Trophy } from 'lucide-react';
import { usePadBalance } from '@/hooks/usePadBalance';
import { useStakingPositions } from '@/hooks/useStakingPositions';
import { TIER_LEVELS, formatDate, formatDuration, formatTokenAmount } from '@/lib/contracts/config';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { PAD_TOKEN_ABI } from '@/lib/contracts/abis';
import { UPGRADEABLE_STAKE_MANAGER_ABI } from '@/lib/contracts/upgradeable-stake-manager-abi';
import { PAD_TOKEN_ADDRESS, STAKE_MANAGER_ADDRESS } from '@/lib/contracts/config';
import { useToast } from '@/hooks/use-toast';
import { useNFTBalance } from '@/hooks/useNFTBalance';
import { useProxySystem } from '@/hooks/useProxySystem';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction } from '@/components/ui/alert-dialog';
import axios from 'axios';
import { NFT_FACTORY_ABI } from '@/lib/contracts/abis';
import { NFT_FACTORY_ADDRESS } from '@/lib/contracts/config';

const tierFolders: Record<string, string> = {
  Bronze: 'tier1',
  Silver: 'tier2',
  Gold: 'tier3',
  Platinum: 'tier4',
};

// Безопасный перевод строки в wei (bigint)
function parseUnits(amount: string, decimals: number = 18): bigint {
  const [whole, fraction = ''] = amount.split('.');
  const normalizedFraction = (fraction + '0'.repeat(decimals)).slice(0, decimals);
  return BigInt(whole + normalizedFraction);
}

export function StakingForm() {

  const [stakeDuration, setStakeDuration] = useState('1');
  const [isApproving, setIsApproving] = useState(false);
  const [isStaking, setIsStaking] = useState(false);
  const [showDecimalsDialog, setShowDecimalsDialog] = useState(false);
  const [userNFTImages, setUserNFTImages] = useState<Record<string, string>>({}); // tokenId -> image
  const [nftImages, setNftImages] = useState<Record<number, string>>({}); // tokenId -> image_name
  const [stakeError, setStakeError] = useState<string | null>(null);

  const { toast } = useToast();
  const { address, chainId } = useAccount();
  const { balance, isLoading: isLoadingBalance, refetch: refetchBalance } = usePadBalance();
  const { positions, isLoading: isLoadingPositions, totalStaked, totalRewards, refetch: refetchPositions } = useStakingPositions();
  const { nfts, isLoading: isLoadingNFTs, totalNFTs } = useNFTBalance();
  const { tiers: proxyTiers, configVersion, isLoading: isLoadingProxy } = useProxySystem();

  const padTokenAddress = PAD_TOKEN_ADDRESS;
  const stakeManagerAddress = STAKE_MANAGER_ADDRESS;

  // Проверяем allowance
  const { data: allowance, refetch: refetchAllowance, isLoading: isLoadingAllowance } = useReadContract({
    address: padTokenAddress,
    abi: PAD_TOKEN_ABI,
    functionName: 'allowance',
    args: [address!, stakeManagerAddress],
    query: { enabled: !!address && !!stakeManagerAddress },
  });

  const { writeContractAsync } = useWriteContract();
  const { writeContractAsync: writeNFTContract } = useWriteContract();

  // Динамически генерируем опции стейкинга на основе прокси системы
  const generateStakingOptions = () => {
    if (isLoadingProxy || Object.keys(proxyTiers).length === 0) {
      // Возвращаем дефолтные опции если прокси система не загружена (МЕЙННЕТ НАСТРОЙКИ)
      return [
        { 
          duration: '1', 
          tier: 'Bronze', 
          period: '1 month', 
          amount: '500', 
          nft: 'Bronze NFT',
          vouchers: [
            { name: '5% discount when paying for car rental with PADD-R tokens', type: 'SINGLE_USE', value: '5%' },
            { name: '1 hour free rental when renting for 1 day or more', type: 'SINGLE_USE', value: '1 hour' },
            { name: '1x $50 car rental coupon', type: 'SINGLE_USE', value: '$50' },
            { name: '10% discount at restaurant', type: 'DURATION', value: '10%' }
          ]
        },
        { 
          duration: '3', 
          tier: 'Silver', 
          period: '3 months', 
          amount: '1000', 
          nft: 'Silver NFT',
          vouchers: [
            { name: '5% discount when paying for car rental with PADD-R tokens', type: 'SINGLE_USE', value: '5%' },
            { name: '2 hours free rental when renting for 1 day or more', type: 'SINGLE_USE', value: '2 hours' },
            { name: '3x $150 car rental coupons', type: 'MULTI_USE', value: '$150', maxUses: 3 },
            { name: '15% discount at auto service', type: 'DURATION', value: '15%' },
            { name: '10% discount at restaurant', type: 'DURATION', value: '10%' },
            { name: 'Car wash', type: 'SINGLE_USE', value: 'Free' },
            { name: 'Priority booking', type: 'DURATION', value: 'Priority' },
            { name: 'Car upgrade', type: 'SINGLE_USE', value: 'Upgrade' },
            { name: '1 day rental of Lamborghini Huracán EVO', type: 'SINGLE_USE', value: '1 day' }
          ]
        },
        { 
          duration: '6', 
          tier: 'Gold', 
          period: '6 months', 
          amount: '2500', 
          nft: 'Gold NFT',
          vouchers: [
            { name: '5% discount when paying for car rental with PADD-R tokens', type: 'SINGLE_USE', value: '5%' },
            { name: '3 hours free rental when renting for 1 day or more', type: 'SINGLE_USE', value: '3 hours' },
            { name: '6x $600 car rental coupons', type: 'MULTI_USE', value: '$600', maxUses: 6 },
            { name: '20% discount at auto service', type: 'DURATION', value: '20%' },
            { name: '15% discount at restaurant', type: 'DURATION', value: '15%' },
            { name: 'Unlimited mileage', type: 'DURATION', value: 'Unlimited' },
            { name: 'Premium protection', type: 'DURATION', value: 'Premium' },
            { name: 'Priority booking', type: 'DURATION', value: 'Priority' },
            { name: 'Car upgrade', type: 'SINGLE_USE', value: 'Upgrade' },
            { name: '1 day rental of Lamborghini Huracán EVO', type: 'SINGLE_USE', value: '1 day' },
            { name: 'Weekend with car and 5-star hotel stay', type: 'SINGLE_USE', value: 'Weekend' }
          ]
        },
        { 
          duration: '12', 
          tier: 'Platinum', 
          period: '12 months', 
          amount: '5000', 
          nft: 'Platinum NFT',
          vouchers: [
            { name: '5% discount when paying for car rental with PADD-R tokens', type: 'SINGLE_USE', value: '5%' },
            { name: '5 hours free rental when renting for 1 day or more', type: 'SINGLE_USE', value: '5 hours' },
            { name: '12x $1250 car rental coupons', type: 'MULTI_USE', value: '$1250', maxUses: 12 },
            { name: '30% discount at auto service', type: 'DURATION', value: '30%' },
            { name: '20% discount at restaurant', type: 'DURATION', value: '20%' },
            { name: 'Unlimited mileage', type: 'DURATION', value: 'Unlimited' },
            { name: 'Premium protection', type: 'DURATION', value: 'Premium' },
            { name: 'Priority booking', type: 'DURATION', value: 'Priority' },
            { name: 'Car upgrade', type: 'SINGLE_USE', value: 'Upgrade' },
            { name: '6 hours chauffeur service', type: 'SINGLE_USE', value: '6 hours' },
            { name: 'Free delivery in UAE', type: 'SINGLE_USE', value: 'Free' },
            { name: '1 day rental of Lamborghini Huracán EVO', type: 'SINGLE_USE', value: '1 day' },
            { name: 'Weekend with car and 5-star hotel stay', type: 'SINGLE_USE', value: 'Weekend' },
            { name: 'Yacht trip or private tour of the Emirates', type: 'SINGLE_USE', value: 'Yacht/Tour' }
          ]
        },
      ];
    }

    // Генерируем опции на основе прокси системы
    const tierNames = ['Bronze', 'Silver', 'Gold', 'Platinum'];
    return Object.entries(proxyTiers)
      .filter(([tierId, config]) => config.isActive)
      .map(([tierId, config]) => {
        const tierIndex = parseInt(tierId);
        const tierName = tierNames[tierIndex];
        const durationMonths = Number(config.duration) / (30 * 24 * 60 * 60); // Конвертируем секунды в месяцы
        
        return {
          duration: durationMonths.toString(),
          tier: tierName,
          period: `${durationMonths} month${durationMonths > 1 ? 's' : ''}`,
          amount: formatTokenAmount(config.minAmount),
          nft: `${tierName} NFT`,
          rewardRate: Number(config.rewardRate) / 100, // Конвертируем базисные пункты в проценты
          nftMultiplier: Number(config.nftMultiplier),
          vouchers: [] // Ваучеры будут загружаться отдельно
        };
      });
  };

  const stakingOptions = generateStakingOptions();

  // Получить и сохранить картинку для NFT после стейкинга
  const assignNFTImage = async (address: string, tier: string) => {
    try {
      // 1. Получить неиспользованную картинку
      const res = await axios.get(`/api/nft-image?address=${address}&tier=${tier}`);
      const image = res.data.image;
      // 2. Сохранить выбранную картинку (без token_id пока)
      await axios.post('/api/nft-image', { address, tier, token_id: 'pending', image });
      return image;
    } catch (e) {
      console.error('NFT image assignment error:', e);
      return null;
    }
  };

  const handleStake = async () => {
    console.log('handleStake called');
    console.log('address:', address);
    console.log('chainId:', chainId);
    console.log('padTokenAddress:', padTokenAddress);
    console.log('stakeManagerAddress:', stakeManagerAddress);
    console.log('writeContractAsync:', writeContractAsync);
    console.log('Stake button clicked', { stakeDuration });
    if (!address || !padTokenAddress || !stakeManagerAddress) {
      toast({ title: 'Wallet not connected', description: 'Connect your wallet and select network', });
      console.error('No wallet or contract address');
      return;
    }
    if (!selectedOption) {
      toast({ title: 'Select tier', description: 'Please select a staking tier', });
      return;
    }
    
    const amount = parseUnits(selectedOption.amount, 18);
    const durationMonths = Number(stakeDuration);
    const duration = BigInt(durationMonths * 30 * 24 * 60 * 60); // месяцы -> секунды (30 дней в месяце)
    if (typeof window !== 'undefined') {
      console.log('handleStake:');
      console.log('selectedOption:', selectedOption);
      console.log('stakeDuration:', stakeDuration);
      console.log('durationMonths:', durationMonths);
      console.log('duration (сек):', duration.toString());
      console.log('stakingOptions:', stakingOptions);
      if (durationMonths < 1 || durationMonths > 12) {
        console.error('Ошибка: срок должен быть от 1 до 12 месяцев!');
      }
    }
    if (durationMonths < 1 || durationMonths > 12) {
      toast({ title: 'Ошибка', description: 'Срок должен быть от 1 до 12 месяцев!' });
      return;
    }
    
    // Проверяем достаточность баланса
    if (balance && BigInt(balance) < amount) {
      toast({ title: 'Insufficient balance', description: `You need ${selectedOption.amount} PADD-R tokens for ${selectedOption.tier} tier` });
      return;
    }
    if (typeof window !== 'undefined') {
      console.log('handleStake:');

      console.log('stakeDuration:', stakeDuration);
      console.log('duration (сек):', Number(stakeDuration) * 60 * 60);
      console.log('address:', address);
      console.log('padTokenAddress:', padTokenAddress);
      console.log('stakeManagerAddress:', stakeManagerAddress);
    }
    try {
      setIsApproving(true);
      console.log('Checking allowance:', { allowance, amount });
      // Проверяем allowance
      if (!allowance || BigInt(allowance) < amount) {
        console.log('Calling approve...');
        await writeContractAsync({
          address: padTokenAddress,
          abi: PAD_TOKEN_ABI,
          functionName: 'approve',
          args: [stakeManagerAddress, amount],
        });
        toast({ title: 'Approve sent', description: 'Подтвердите разрешение в кошельке' });
        await refetchAllowance();
        console.log('Approve confirmed');
      }
      setIsApproving(false);
      setIsStaking(true);
      console.log('Calling createPosition...');
      try {
        await writeContractAsync({
          address: stakeManagerAddress,
          abi: UPGRADEABLE_STAKE_MANAGER_ABI,
          functionName: 'createPosition',
          args: [amount, duration],
        });
        await refetchBalance();
        await refetchPositions();
        
        // Принудительно обновляем данные
        toast({ title: 'Position created!', description: 'Стейкинг позиция создана успешно' });
        
        // Множественные обновления для гарантии
        setTimeout(async () => {
          await refetchPositions();
        }, 1000);
        setTimeout(async () => {
          await refetchPositions();
        }, 3000);
        setTimeout(async () => {
          await refetchPositions();
        }, 5000);
        
        // --- Создание ваучеров для новой позиции ---
        const tier = selectedOption?.tier;
        if (address && tier) {
          try {
            // Получаем ID новой позиции (последняя созданная)
            await refetchPositions();
            // Используем текущие позиции из хука
            const currentPositions = positions || [];
            if (currentPositions.length > 0) {
              const newPositionId = currentPositions[currentPositions.length - 1]?.id;
              
              // Создаем ваучеры для позиции
              const response = await fetch('/api/admin/vouchers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  action: 'create',
                  owner: address,
                  positionId: newPositionId,
                  tier: tier
                })
              });
              
              if (response.ok) {
                console.log('Vouchers created for position:', newPositionId);
              }
            }
          } catch (err) {
            console.error('Failed to create vouchers:', err);
          }
        }
        
        // --- Новый блок: получить и сохранить картинку для NFT (неблокирующий) ---
        if (address && tier) {
          // Не ждем завершения, чтобы не блокировать UI
          assignNFTImage(address, tier).then(image => {
            if (image) {
              setUserNFTImages(prev => ({ ...prev, [`${address}_${tier}_${Date.now()}`]: image }));
            }
          }).catch(err => {
            console.error('NFT image assignment failed:', err);
          });
        }
        // --- конец блока ---
      } catch (err: any) {
        if (typeof err?.message === 'string' && err.message.includes('Too many positions')) {
          toast({ title: 'Лимит позиций', description: 'Можно иметь не более 10 активных позиций. Закройте одну из существующих, чтобы создать новую.' });
          setIsStaking(false);
          return;
        }
        if (typeof window !== 'undefined') {
          console.error('createPosition error:', err);
        }
        throw err;
      }
      toast({ title: 'Staking transaction sent', description: 'Подтвердите транзакцию в кошельке' });

      toast({ title: 'Staked!', description: 'Токены успешно застейканы' });
      console.log('Staking confirmed');
    } catch (e: any) {
      setIsApproving(false);
      setIsStaking(false);
      toast({ title: 'Ошибка', description: e?.message || 'Ошибка транзакции', });
      if (typeof window !== 'undefined') {
        console.error('Staking error:', e);
      }
      return;
    }
    setIsStaking(false);
  };

  const selectedOption = stakingOptions.find(option => option.duration === stakeDuration);
  
  if (!selectedOption) {
    console.error('Selected option not found for duration:', stakeDuration);
    console.log('Available options:', stakingOptions.map(o => ({ duration: o.duration, tier: o.tier })));
  }

  // Форматируем баланс
  const formatBalance = (balance: bigint | undefined) => {
    if (!balance) return '0';
    return formatTokenAmount(balance);
  };

  const availableBalance = formatBalance(balance);

  // Показываем все активные позиции как текущие
  const currentPositions = positions.filter(pos => pos.isActive);
  const pastPositions = positions.filter(pos => !pos.isActive);

  // Автоматически назначать изображение для каждого NFT
  useEffect(() => {
    async function assignImages() {
      if (!address || !nfts) return;
      for (const nft of nfts) {
        if (!nftImages[nft.tokenId]) {
          try {
            // 1. Получить или назначить изображение через API
            const res = await axios.get(`/api/nft-image?address=${address}&tier=${nft.tierInfo?.name}&token_id=${nft.tokenId}`);
            const image = res.data.image;
            if (image) {
              // 2. Сохранить связь, если это новое назначение
              await axios.post('/api/nft-image', { address, tier: nft.tierInfo?.name, token_id: nft.tokenId, image });
              setNftImages(prev => ({ ...prev, [nft.tokenId]: image }));
            }
          } catch (e) {
            // Если уже есть изображение, просто пропускаем
          }
        }
      }
    }
    assignImages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nfts, address]);

  // Проверка баланса
  const maxStake = balance ? Number(formatTokenAmount(balance)) : 0;


  useEffect(() => {

  }, [maxStake]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Staking Form */}
      <div className="space-y-6">
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp size={20} className="text-emerald-400" />
              <span>Stake Tokens</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-white">Staking Amount</Label>
              {selectedOption ? (
                <div className="p-4 bg-gray-800 border border-gray-700 rounded-lg mt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-white">{selectedOption.amount} PADD-R</span>
                    <Badge className={`${
                      selectedOption.tier === 'Platinum' ? 'bg-emerald-600' :
                      selectedOption.tier === 'Gold' ? 'bg-yellow-600' :
                      selectedOption.tier === 'Silver' ? 'bg-gray-600' : 'bg-amber-600'
                    } text-white`}>
                      {selectedOption.tier}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">Fixed amount for {selectedOption.period} staking</p>
                </div>
              ) : (
                <div className="p-4 bg-gray-800 border border-gray-700 rounded-lg mt-2">
                  <p className="text-gray-400">Select a tier to see staking amount</p>
                </div>
              )}
              {isLoadingBalance ? (
                <p className="text-sm text-gray-400 mt-1">Loading balance...</p>
              ) : (
                <p className="text-sm text-gray-400 mt-1">Available: {availableBalance} PADD-R</p>
              )}
              {stakeError && <div className="text-red-500 text-xs mt-1">{stakeError}</div>}
            </div>

            <div>
              <Label className="text-white">Staking Tier Selection</Label>
              <div className="grid grid-cols-1 gap-3 mt-2">
                {stakingOptions.map((option) => (
                  <div
                    key={option.duration}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      stakeDuration === option.duration
                        ? 'border-emerald-500 bg-emerald-500/10'
                        : 'border-gray-700 bg-gray-800/30 hover:border-gray-600'
                    }`}
                    onClick={() => setStakeDuration(option.duration)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-white">{option.tier}</span>
                          <Badge className={`${
                            option.tier === 'Platinum' ? 'bg-emerald-600' :
                            option.tier === 'Gold' ? 'bg-yellow-600' :
                            option.tier === 'Silver' ? 'bg-gray-600' : 'bg-amber-600'
                          } text-white`}>
                            {option.period}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-400">
                          Fixed amount: {option.amount} PADD-R tokens
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-emerald-400 font-medium">{option.nft}</p>
                      </div>
                    </div>
                    <div className="border-t border-gray-700 pt-3">
                      <p className="text-xs text-gray-400 mb-2">Vouchers included:</p>
                      <div className="space-y-1">
                        {option.vouchers.map((voucher, index) => (
                          <div key={index} className="text-xs text-white/80 flex items-center justify-between">
                            <span>• {voucher.name}</span>
                            <span className="text-emerald-400 text-xs">
                              {voucher.type === 'SINGLE_USE' ? '1x' : 
                               voucher.type === 'MULTI_USE' ? `${voucher.maxUses}x` : 
                               'Duration'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selectedOption && (
              <div className="p-4 bg-emerald-900/20 border border-emerald-800 rounded-2xl">
                <div className="flex items-start space-x-3">
                  <Info size={16} className="text-emerald-400 mt-0.5" />
                  <div className="text-sm">
                    <p className="text-emerald-400 font-medium mb-1">
                      {selectedOption.tier} Tier Summary
                    </p>
                    <p className="text-gray-300 mb-2">
                      Stake {selectedOption.amount} PADD-R for {selectedOption.period} to get:
                    </p>
                    <ul className="text-gray-300 space-y-1">
                      <li>• {selectedOption.nft} reward (every month)</li>
                      <li>• Instant access to vouchers</li>
                      <li>• Tokens returned after {selectedOption.period}</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            <Button 
              onClick={handleStake}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3"
              disabled={!selectedOption || isApproving || isStaking}
            >
              {isApproving ? 'Approving...' : isStaking ? 'Staking...' : <><Shield className="mr-2" size={20} />Stake {selectedOption?.amount || ''} PADD-R</>}
            </Button>
          </CardContent>
        </Card>

        {/* Staking Calculator */}
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calculator size={20} className="text-blue-400" />
              <span>Staking Calculator</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-800/30 rounded-xl text-center">
                <p className="text-sm text-gray-400">Estimated Tier</p>
                <p className="text-lg font-bold text-white">
                                      {selectedOption?.tier || 'None'}
                </p>
              </div>
              <div className="p-3 bg-gray-800/30 rounded-xl text-center">
                <p className="text-sm text-gray-400">Vouchers</p>
                <p className="text-lg font-bold text-emerald-400">
                  {selectedOption ? `${selectedOption.vouchers.length} included` : '0'}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-800/30 rounded-xl text-center">
                <p className="text-sm text-gray-400">Total Staked</p>
                <p className="text-lg font-bold text-blue-400">
                  {isLoadingPositions ? 'Loading...' : `${totalStaked.toFixed(2)} PAD`}
                </p>
              </div>
              <div className="p-3 bg-gray-800/30 rounded-xl text-center">
                <p className="text-sm text-gray-400">Total Rewards</p>
                <p className="text-lg font-bold text-emerald-400">
                  {isLoadingPositions ? 'Loading...' : `${totalRewards.toFixed(2)} PAD`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Stakes */}
      <div className="space-y-6">
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield size={20} className="text-blue-400" />
              <span>Current Stakes</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoadingPositions ? (
              <div className="text-center py-8">
                <p className="text-gray-400">Loading staking positions...</p>
              </div>
            ) : currentPositions.length > 0 ? (
              currentPositions.map((position, index) => {
                const safePosition = position as NonNullable<typeof position>;
                const nftsForPosition = nfts.filter(nft => Number(nft.positionId) === Number(safePosition.id));
                const nftImage = nftsForPosition[0] ? nftImages[nftsForPosition[0].tokenId] : undefined;
                // Используем данные из хука, которые уже содержат правильные расчеты
                // Используем данные из хука для правильного расчета прогресса
                const progress = safePosition.progress || 0;
                const maxRewards = Math.floor(Number(safePosition.duration) / 2592000); // 1 месяц = 2592000 секунд
                const claimedRewards = nftsForPosition.length;
                const unclaimedRewards = Math.max(0, maxRewards - claimedRewards);
                const canClaim = unclaimedRewards > 0 && safePosition.secondsUntilNextMint <= 0;
                const displayClaimedRewards = claimedRewards + (canClaim ? 1 : 0);
                return (
                  <div key={index} className="p-4 rounded-2xl bg-gray-800/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {nftImage && (
                          <img
                            src={`/assets/${tierFolders[safePosition.tierInfo?.name]}/${nftImage}`}
                            alt="NFT"
                            className="w-12 h-12 object-cover rounded mr-3"
                          />
                        )}
                        <div>
                          <p className="font-semibold text-white">Position #{safePosition.id + 1} • {safePosition.formattedAmount} PADD-R</p>
                          <p className="text-sm text-gray-400">
                            {safePosition.tierInfo?.name} Tier • {safePosition.secondsRemaining > 0 ? `${Math.ceil(safePosition.secondsRemaining / 86400)} days remaining` : 'Completed'}
                          </p>
                        </div>
                      </div>
                      <Badge className={`${safePosition.isActive ? 'bg-emerald-600' : 'bg-gray-600'} text-white`}>
                        {safePosition.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Progress</span>
                        <span className="text-emerald-400">
                          {progress.toFixed(1)}%
                        </span>
                      </div>
                      <Progress 
                        value={progress} 
                        className="h-2" 
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center space-x-2">
                        <Clock size={14} className="text-gray-400" />
                        <span className="text-gray-400">Started: {new Date(Number(safePosition.startTime) * 1000).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Trophy size={14} className="text-emerald-400" />
                        <span className="text-emerald-400 font-bold">
                          Rewards: {displayClaimedRewards} / {maxRewards}
                        </span>
                      </div>
                    </div>
                    {/* Кнопка Claim NFT */}
                    {canClaim && (
                      <Button
                        className="mt-2 bg-emerald-600 hover:bg-emerald-700 w-full"
                        onClick={async () => {
                          console.log('Claim NFT clicked', safePosition.id, {
                            address: STAKE_MANAGER_ADDRESS,
                            abi: UPGRADEABLE_STAKE_MANAGER_ABI,
                            functionName: 'mintNextNFT',
                            args: [BigInt(safePosition.id)],
                          });
                          try {
                            const result = await writeContractAsync({
                              address: STAKE_MANAGER_ADDRESS,
                              abi: UPGRADEABLE_STAKE_MANAGER_ABI,
                              functionName: 'mintNextNFT',
                              args: [BigInt(safePosition.id)],
                            });
                            console.log('mintNextNFT result:', result);
                            toast({ title: 'Claimed!', description: 'NFT успешно заминчен' });
                            await refetchPositions();
                          } catch (e: any) {
                            console.error('mintNextNFT error:', e);
                            toast({ title: 'Ошибка', description: e?.message || 'Ошибка mintNextNFT' });
                          }
                        }}
                      >
                        Claim NFT
                      </Button>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-4">No staking positions yet</p>
                <p className="text-sm text-gray-500">Start staking to earn rewards and unlock tier benefits</p>
              </div>
            )}
          </CardContent>
        </Card>

        <hr className="my-8 border-gray-700" />

        {/* Past Stakes */}
        <div className="space-y-6">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield size={20} className="text-gray-400" />
                <span>Past Stakes</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {pastPositions && pastPositions.length > 0 ? (
                pastPositions.map((position, idx) => {
                  const safePosition = position as NonNullable<typeof position>;
                  const nftsForPosition = nfts.filter(nft => Number(nft.positionId) === Number(safePosition.id));
                  // Используем данные из хука для правильного расчета прогресса
                const progress = safePosition.progress || 0;
                  const rewardsCount = nftsForPosition.length;
                  const maxRewards = Math.floor(Number(safePosition.duration) / 2592000); // 1 месяц = 2592000 секунд
                  // Определяем, можно ли забрать NFT (по таймеру)
                  const unclaimedRewards = Math.max(0, maxRewards - rewardsCount);
                  const canClaim = unclaimedRewards > 0 && safePosition.secondsUntilNextMint <= 0;
                  // Для отображения: если можно забрать NFT, увеличиваем rewardsCount на 1
                  const displayRewardsCount = rewardsCount + (canClaim ? 1 : 0);
                  const canUnstake = safePosition.isActive && safePosition.isMature && rewardsCount === maxRewards;
                  const canClaimAndUnstake = safePosition.isActive && safePosition.isMature && rewardsCount < maxRewards;
                  return (
                    <div key={idx} className="p-4 rounded-2xl bg-gray-800/50 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-white">Position #{safePosition.id + 1} • {safePosition.formattedAmount} PADD-R</p>
                          <p className="text-sm text-gray-400">
                            {safePosition.tierInfo?.name} Tier • {safePosition.secondsRemaining > 0 ? `${Math.ceil(safePosition.secondsRemaining / 86400)} days remaining` : 'Completed'}
                          </p>
                        </div>
                        <Badge className="bg-gray-600 text-white">Closed</Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Progress</span>
                          <span className="text-emerald-400">100%</span>
                        </div>
                        <Progress value={100} className="h-2" />
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center space-x-2">
                          <Clock size={14} className="text-gray-400" />
                          <span className="text-gray-400">Started: {new Date(Number(safePosition.startTime) * 1000).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Trophy size={14} className="text-emerald-400" />
                          <span className="text-emerald-400 font-bold">Rewards: {displayRewardsCount} / {maxRewards}</span>
                        </div>
                      </div>
                      {/* Кнопка Claim NFT & Unstake если есть несобранные NFT */}
                      {canClaimAndUnstake && (
                        <Button className="mt-2 bg-emerald-600 hover:bg-emerald-700 w-full"
                          onClick={async () => {
                            try {
                              // Сначала claim NFT
                              await writeContractAsync({
                                address: STAKE_MANAGER_ADDRESS,
                                abi: UPGRADEABLE_STAKE_MANAGER_ABI,
                                functionName: 'mintNextNFT',
                                args: [BigInt(safePosition.id)],
                              });
                              // Затем unstake
                              await writeContractAsync({
                                address: STAKE_MANAGER_ADDRESS,
                                abi: UPGRADEABLE_STAKE_MANAGER_ABI,
                                functionName: 'closePosition',
                                args: [BigInt(safePosition.id)],
                              });
                              toast({ title: 'Unstaked!', description: 'Позиция успешно закрыта и NFT собран.' });
                              await refetchPositions();
                            } catch (e: any) {
                              toast({ title: 'Ошибка', description: e?.message || 'Ошибка Claim NFT & Unstake' });
                            }
                          }}
                        >
                          Claim NFT & Unstake
                        </Button>
                      )}
                      {/* Кнопка Unstake если все NFT уже собраны */}
                      {canUnstake && (
                        <Button className="mt-2 bg-emerald-600 hover:bg-emerald-700 w-full"
                          onClick={async () => {
                            try {
                              await writeContractAsync({
                                address: STAKE_MANAGER_ADDRESS,
                                abi: UPGRADEABLE_STAKE_MANAGER_ABI,
                                functionName: 'closePosition',
                                args: [BigInt(safePosition.id)],
                              });
                              toast({ title: 'Unstaked!', description: 'Позиция успешно закрыта.' });
                              await refetchPositions();
                            } catch (e: any) {
                              toast({ title: 'Ошибка', description: e?.message || 'Ошибка Unstake' });
                            }
                          }}
                        >
                          Unstake
                        </Button>
                      )}
                      {/* Шторка с историей */}
                      <details className="mt-2">
                        <summary className="cursor-pointer text-gray-400">Show history</summary>
                        <div className="mt-2 text-sm text-gray-300">
                          <div>Staked: {safePosition.formattedAmount} PAD</div>
                          <div>Start: {safePosition.formattedStartDate}</div>
                          <div>End: {formatDate(BigInt(safePosition.startTime) + BigInt(safePosition.duration))}</div>
                          <div>Tier: {safePosition.tierInfo?.name} Tier • {formatDuration(safePosition.duration)} remaining</div>
                          <div>Rewards: {safePosition.formattedRewards}</div>
                        </div>
                      </details>
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-gray-400 py-8">No past stakes yet</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* NFT Collection */}
      <div className="space-y-6">
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">NFT Collection</h3>
          {isLoadingNFTs ? (
            <p className="text-gray-400">Loading NFTs...</p>
          ) : nfts.length === 0 ? (
            <p className="text-gray-500">You have no staking NFTs yet.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {nfts.map((nft) => {
                const imgKey = `${address}_${nft.tierInfo?.name}`;
                const image = userNFTImages[imgKey];
                const nftsForPosition = nfts.filter(nft => nft.positionId === nft.id);
                return (
                  <div key={nft.tokenId} className="p-4 rounded-xl bg-gray-800/60 border border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-white">NFT #{nft.tokenId}</span>
                      <span className="text-sm text-emerald-400 font-medium">{nftsForPosition.length} NFT</span>
                    </div>
                    {image && (
                      <img src={`/assets/${tierFolders[nft.tierInfo?.name]}/${image}`} alt="NFT" className="w-24 h-24 object-cover rounded mb-2" />
                    )}
                    <div className="text-sm text-gray-300 mb-1">Staked: {nft.formattedAmountStaked} PAD</div>
                    <div className="text-sm text-gray-400 mb-1">Start: {nft.formattedStartDate}</div>
                    <div className="text-sm text-gray-400 mb-1">Next Mint: {nft.formattedNextMintDate}</div>
                    <div className="text-sm text-gray-400 mb-1">Month Index: {String(nft.monthIndex)}</div>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="text-xs text-yellow-400">Не подтверждено</span>
                      <button className="px-2 py-1 bg-emerald-700 text-white rounded text-xs">Подтвердить</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={showDecimalsDialog} onOpenChange={setShowDecimalsDialog}>
        <AlertDialogContent className="bg-gray-900 border-gray-700 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-emerald-400">Too Many Decimal Places</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              You can use up to <span className="text-emerald-400 font-semibold">3</span> decimal places for staking amount. Please correct your input (e.g. <span className="text-emerald-400 font-mono">1000.001</span>).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => setShowDecimalsDialog(false)}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}