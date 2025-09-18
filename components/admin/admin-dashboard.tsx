'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Settings, 
  Users, 
  Trophy, 
  Gift, 
  Upload, 
  Save, 
  RefreshCw, 
  Eye,
  Edit,
  Trash2,
  Plus,
  Video,
  Image as ImageIcon,
  DollarSign,
  Clock,
  Star
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAccount, useWriteContract, useReadContract } from 'wagmi';
import { VoucherScanner } from './voucher-scanner';

// Интерфейсы для типов данных
interface TierConfig {
  id: number;
  name: string;
  amount: number;
  duration: number;
  rewardRate: number;
  nftMultiplier: number;
  isActive: boolean;
  vouchers: VoucherConfig[];
}

interface VoucherConfig {
  id: string;
  name: string;
  description: string;
  value: string;
  type: 'SINGLE_USE' | 'MULTI_USE' | 'DURATION';
  maxUses?: number;
}

interface NFTAsset {
  id: string;
  name: string;
  type: 'image' | 'video';
  path: string;
  tier: string;
  isActive: boolean;
}

export function AdminDashboard() {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const { toast } = useToast();

  // Состояние для управления тирами
  const [tiers, setTiers] = useState<TierConfig[]>([
    {
      id: 0,
      name: 'Bronze',
      amount: 500,
      duration: 1,
      rewardRate: 100,
      nftMultiplier: 1,
      isActive: true,
      vouchers: [
        { id: '1', name: '5% Discount', description: '5% discount when paying for car rental with PADD-R tokens', value: '5%', type: 'SINGLE_USE' },
        { id: '2', name: 'Free Rental Hour', description: '1 hour free rental when renting for 1 day or more', value: '1 hour', type: 'SINGLE_USE' },
        { id: '3', name: 'Rental Coupon', description: '1x $50 car rental coupon', value: '$50', type: 'SINGLE_USE' },
        { id: '4', name: 'Restaurant Discount', description: '10% discount at restaurant', value: '10%', type: 'DURATION' }
      ]
    },
    {
      id: 1,
      name: 'Silver',
      amount: 1000,
      duration: 2,
      rewardRate: 200,
      nftMultiplier: 1,
      isActive: true,
      vouchers: [
        { id: '5', name: '5% Discount', description: '5% discount when paying for car rental with PADD-R tokens', value: '5%', type: 'SINGLE_USE' },
        { id: '6', name: 'Free Rental Hours', description: '2 hours free rental when renting for 1 day or more', value: '2 hours', type: 'SINGLE_USE' },
        { id: '7', name: 'Rental Coupons', description: '3x $150 car rental coupons', value: '$150', type: 'MULTI_USE', maxUses: 3 },
        { id: '8', name: 'Auto Service Discount', description: '15% discount at auto service', value: '15%', type: 'DURATION' },
        { id: '9', name: 'Restaurant Discount', description: '10% discount at restaurant', value: '10%', type: 'DURATION' },
        { id: '10', name: 'Car Wash', description: 'Free car wash', value: 'Free', type: 'SINGLE_USE' },
        { id: '11', name: 'Priority Booking', description: 'Priority booking for rentals', value: 'Priority', type: 'DURATION' },
        { id: '12', name: 'Car Upgrade', description: 'Free car upgrade', value: 'Upgrade', type: 'SINGLE_USE' },
        { id: '13', name: 'Lamborghini Rental', description: '1 day rental of Lamborghini Huracan EVO', value: '1 day', type: 'SINGLE_USE' }
      ]
    },
    {
      id: 2,
      name: 'Gold',
      amount: 3000,
      duration: 3,
      rewardRate: 300,
      nftMultiplier: 1,
      isActive: true,
      vouchers: [
        { id: '14', name: '5% Discount', description: '5% discount when paying for car rental with PADD-R tokens', value: '5%', type: 'SINGLE_USE' },
        { id: '15', name: 'Free Rental Hours', description: '3 hours free rental when renting for 1 day or more', value: '3 hours', type: 'SINGLE_USE' },
        { id: '16', name: 'Rental Coupons', description: '6x $600 car rental coupons', value: '$600', type: 'MULTI_USE', maxUses: 6 },
        { id: '17', name: 'Auto Service Discount', description: '20% discount at auto service', value: '20%', type: 'DURATION' },
        { id: '18', name: 'Restaurant Discount', description: '15% discount at restaurant', value: '15%', type: 'DURATION' },
        { id: '19', name: 'Unlimited Mileage', description: 'Unlimited mileage on rentals', value: 'Unlimited', type: 'DURATION' },
        { id: '20', name: 'Premium Protection', description: 'Premium protection included', value: 'Premium', type: 'DURATION' },
        { id: '21', name: 'Priority Booking', description: 'Priority booking for rentals', value: 'Priority', type: 'DURATION' },
        { id: '22', name: 'Car Upgrade', description: 'Free car upgrade', value: 'Upgrade', type: 'SINGLE_USE' },
        { id: '23', name: 'Lamborghini Rental', description: '1 day rental of Lamborghini Huracan EVO', value: '1 day', type: 'SINGLE_USE' },
        { id: '24', name: 'Weekend Package', description: 'Weekend with car and 5-star hotel stay', value: 'Weekend', type: 'SINGLE_USE' }
      ]
    },
    {
      id: 3,
      name: 'Platinum',
      amount: 4000,
      duration: 4,
      rewardRate: 400,
      nftMultiplier: 1,
      isActive: true,
      vouchers: [
        { id: '25', name: '5% Discount', description: '5% discount when paying for car rental with PADD-R tokens', value: '5%', type: 'SINGLE_USE' },
        { id: '26', name: 'Free Rental Hours', description: '5 hours free rental when renting for 1 day or more', value: '5 hours', type: 'SINGLE_USE' },
        { id: '27', name: 'Rental Coupons', description: '12x $1250 car rental coupons', value: '$1250', type: 'MULTI_USE', maxUses: 12 },
        { id: '28', name: 'Auto Service Discount', description: '30% discount at auto service', value: '30%', type: 'DURATION' },
        { id: '29', name: 'Restaurant Discount', description: '20% discount at restaurant', value: '20%', type: 'DURATION' },
        { id: '30', name: 'Unlimited Mileage', description: 'Unlimited mileage on rentals', value: 'Unlimited', type: 'DURATION' },
        { id: '31', name: 'Premium Protection', description: 'Premium protection included', value: 'Premium', type: 'DURATION' },
        { id: '32', name: 'Priority Booking', description: 'Priority booking for rentals', value: 'Priority', type: 'DURATION' },
        { id: '33', name: 'Car Upgrade', description: 'Free car upgrade', value: 'Upgrade', type: 'SINGLE_USE' },
        { id: '34', name: 'Chauffeur Service', description: '6 hours chauffeur service', value: '6 hours', type: 'SINGLE_USE' },
        { id: '35', name: 'Free UAE Delivery', description: 'Free delivery in UAE', value: 'Free', type: 'SINGLE_USE' },
        { id: '36', name: 'Lamborghini Rental', description: '1 day rental of Lamborghini Huracan EVO', value: '1 day', type: 'SINGLE_USE' },
        { id: '37', name: 'Weekend Package', description: 'Weekend with car and 5-star hotel stay', value: 'Weekend', type: 'SINGLE_USE' },
        { id: '38', name: 'Yacht Trip', description: 'Yacht trip or private tour of the Emirates', value: 'Yacht/Tour', type: 'SINGLE_USE' }
      ]
    }
  ]);

  // Состояние для NFT ассетов
  const [nftAssets, setNftAssets] = useState<NFTAsset[]>([
    { id: '1', name: 'Bronze Video 1', type: 'video', path: '/nft/nft_tiers/video5307504616261323179.mp4', tier: 'Bronze', isActive: true },
    { id: '2', name: 'Silver Video 1', type: 'video', path: '/nft/nft_tiers/video5307504616261323180.mp4', tier: 'Silver', isActive: true },
    { id: '3', name: 'Gold Video 1', type: 'video', path: '/nft/nft_tiers/video5307504616261323181.mp4', tier: 'Gold', isActive: true },
    { id: '4', name: 'Platinum Video 1', type: 'video', path: '/nft/nft_tiers/video5307504616261323182.mp4', tier: 'Platinum', isActive: true },
  ]);

  // Состояние для редактирования
  const [editingTier, setEditingTier] = useState<TierConfig | null>(null);
  const [editingVoucher, setEditingVoucher] = useState<VoucherConfig | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Состояние для всех ваучеров
  const [allVouchers, setAllVouchers] = useState<any[]>([]);
  const [vouchersByOwner, setVouchersByOwner] = useState<Record<string, any[]>>({});
  const [loadingVouchers, setLoadingVouchers] = useState(false);

  // Функции для управления тирами
  const updateTier = async (tier: TierConfig) => {
    try {
      const response = await fetch('/api/admin/tiers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update',
          tier: tier.name,
          duration: tier.duration,
          minAmount: tier.amount
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update tier');
      }

      const data = await response.json();
      toast({
        title: 'Тир обновлен',
        description: `Тир ${tier.name} успешно обновлен в блокчейне`,
      });
      setTiers(prev => prev.map(t => t.id === tier.id ? tier : t));
      setEditingTier(null);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить тир',
        variant: 'destructive',
      });
    }
  };

  // Функция для загрузки тиров из блокчейна
  const loadTiers = async () => {
    try {
      const response = await fetch('/api/admin/tiers');
      if (!response.ok) {
        throw new Error('Failed to load tiers');
      }
      
      const data = await response.json();
      // Преобразуем данные в нужный формат
      const formattedTiers = data.tiers.map((tier: any) => ({
        id: tier.tier,
        tier: tier.tier,
        name: tier.name,
        minAmount: tier.minAmount,
        duration: tier.duration,
        rewardInterval: tier.rewardInterval,
        multiplier: tier.multiplier,
        weight: tier.weight,
        isActive: tier.isActive,
        vouchers: [] // Добавляем пустой массив ваучеров
      }));
      
      setTiers(formattedTiers);
      toast({
        title: 'Тиры загружены',
        description: 'Данные тиров загружены из блокчейна',
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить тиры',
        variant: 'destructive',
      });
    }
  };

  const toggleTierActive = async (tierId: number) => {
    try {
      const tier = tiers.find(t => t.id === tierId);
      if (!tier) return;

      const updatedTier = { ...tier, isActive: !tier.isActive };
      await updateTier(updatedTier);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось изменить статус тира',
        variant: 'destructive',
      });
    }
  };

  // Функции для управления ваучерами
  const addVoucher = (tierId: number) => {
    const newVoucher: VoucherConfig = {
      id: Date.now().toString(),
      name: 'New Voucher',
      description: 'New voucher description',
      value: '0%',
      type: 'SINGLE_USE',
    };

    setTiers(prev => prev.map(tier => 
      tier.id === tierId 
        ? { ...tier, vouchers: [...tier.vouchers, newVoucher] }
        : tier
    ));
  };

  const removeVoucher = (tierId: number, voucherId: string) => {
    setTiers(prev => prev.map(tier => 
      tier.id === tierId 
        ? { ...tier, vouchers: tier.vouchers.filter(v => v.id !== voucherId) }
        : tier
    ));
  };

  const updateVoucher = (tierId: number, voucher: VoucherConfig) => {
    setTiers(prev => prev.map(tier => 
      tier.id === tierId 
        ? { ...tier, vouchers: tier.vouchers.map(v => v.id === voucher.id ? voucher : v) }
        : tier
    ));
  };

  // Функции для управления NFT ассетами
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, tier: string, type: 'image' | 'video') => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('tier', tier);
      formData.append('type', type);

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload file');
      }

      const result = await response.json();
      
      const newAsset: NFTAsset = {
        id: Date.now().toString(),
        name: result.file.name,
        type,
        path: result.file.path,
        tier,
        isActive: true,
      };

      setNftAssets(prev => [...prev, newAsset]);
      toast({
        title: 'Файл загружен',
        description: `${result.file.name} успешно загружен для тира ${tier}`,
      });
    } catch (error) {
      toast({
        title: 'Ошибка загрузки',
        description: 'Не удалось загрузить файл',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const toggleAssetActive = (assetId: string) => {
    setNftAssets(prev => prev.map(asset => 
      asset.id === assetId 
        ? { ...asset, isActive: !asset.isActive }
        : asset
    ));
  };

  const removeAsset = (assetId: string) => {
    setNftAssets(prev => prev.filter(asset => asset.id !== assetId));
  };

  // Функция для загрузки всех ваучеров
  const loadAllVouchers = async () => {
    setLoadingVouchers(true);
    try {
      console.log('Loading vouchers...');
      const response = await fetch('/api/admin/all-vouchers');
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error('Failed to load vouchers');
      }
      
      const data = await response.json();
      console.log('Vouchers data:', data);
      
      setAllVouchers(data.allVouchers || []);
      setVouchersByOwner(data.vouchersByOwner || {});
      toast({
        title: 'Ваучеры загружены',
        description: `Найдено ${data.allVouchers?.length || 0} ваучеров от ${data.totalOwners || 0} пользователей`,
      });
    } catch (error) {
      console.error('Error loading vouchers:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить ваучеры',
        variant: 'destructive',
      });
    } finally {
      setLoadingVouchers(false);
    }
  };

  // Функция для погашения ваучера
  const redeemVoucher = async (voucherId: string) => {
    try {
      const response = await fetch('/api/admin/vouchers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'redeem',
          voucherId: voucherId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to redeem voucher');
      }

      const data = await response.json();
      toast({
        title: 'Ваучер погашен',
        description: data.message,
      });

      // Обновляем список ваучеров
      loadAllVouchers();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось погасить ваучер',
        variant: 'destructive',
      });
    }
  };

  // Функция для тестирования погашения одного использования многоразового ваучера
  const testRedeemMultiUse = async (voucherId: string) => {
    try {
      // Симулируем погашение одного использования
      const response = await fetch('/api/admin/vouchers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'test_redeem',
          voucherId: voucherId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to test redeem voucher');
      }

      const data = await response.json();
      toast({
        title: 'Тест погашения',
        description: data.message,
      });

      // Обновляем список ваучеров
      loadAllVouchers();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось протестировать погашение',
        variant: 'destructive',
      });
    }
  };

  // Функция для деактивации ваучера
  const deactivateVoucher = async (voucherId: string) => {
    try {
      const response = await fetch('/api/admin/vouchers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'deactivate',
          voucherId: voucherId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to deactivate voucher');
      }

      const data = await response.json();
      toast({
        title: 'Ваучер деактивирован',
        description: data.message,
      });

      // Обновляем список ваучеров
      loadAllVouchers();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось деактивировать ваучер',
        variant: 'destructive',
      });
    }
  };

  // Функция для создания ваучеров для позиции
  const createVouchersForPosition = async (owner: string, positionId: number, tier: number) => {
    try {
      const response = await fetch('/api/admin/vouchers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create',
          owner: owner,
          positionId: positionId,
          tier: tier
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create vouchers');
      }

      const data = await response.json();
      toast({
        title: 'Ваучеры созданы',
        description: data.message,
      });

      // Обновляем список ваучеров
      loadAllVouchers();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось создать ваучеры',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center space-x-3">
            <Settings className="text-emerald-400" size={32} />
            <span>Админ панель</span>
          </h1>
          <p className="text-gray-400">Полное управление системой стейкинга, NFT и ваучерами</p>
        </div>

        <Tabs defaultValue="tiers" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-gray-900 border-gray-700">
            <TabsTrigger value="tiers" className="flex items-center space-x-2">
              <Trophy size={16} />
              <span>Тиры</span>
            </TabsTrigger>
            <TabsTrigger value="vouchers" className="flex items-center space-x-2">
              <Gift size={16} />
              <span>Ваучеры</span>
            </TabsTrigger>
            <TabsTrigger value="all-vouchers" className="flex items-center space-x-2">
              <Gift size={16} />
              <span>Все ваучеры</span>
            </TabsTrigger>
            <TabsTrigger value="nft" className="flex items-center space-x-2">
              <ImageIcon size={16} />
              <span>NFT</span>
            </TabsTrigger>
            <TabsTrigger value="scanner" className="flex items-center space-x-2">
              <Eye size={16} />
              <span>Сканер</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <Users size={16} />
              <span>Аналитика</span>
            </TabsTrigger>
          </TabsList>

          {/* Управление тирами */}
          <TabsContent value="tiers" className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Управление тирами</h2>
              <Button
                onClick={loadTiers}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <RefreshCw size={16} className="mr-2" />
                Загрузить из блокчейна
              </Button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {tiers.map((tier) => (
                <Card key={tier.id} className="bg-gray-900/50 border-gray-800">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center space-x-2">
                        <Badge className={`${
                          tier.name === 'Platinum' ? 'bg-emerald-600' :
                          tier.name === 'Gold' ? 'bg-yellow-600' :
                          tier.name === 'Silver' ? 'bg-gray-600' : 'bg-amber-600'
                        } text-white`}>
                          {tier.name}
                        </Badge>
                        <Switch
                          checked={tier.isActive}
                          onCheckedChange={() => toggleTierActive(tier.id)}
                        />
                      </CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingTier(tier)}
                      >
                        <Edit size={16} />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-gray-400">Сумма стейкинга</Label>
                        <div className="text-xl font-bold text-white">{tier.amount} PADD-R</div>
                      </div>
                      <div>
                        <Label className="text-gray-400">Длительность</Label>
                        <div className="text-xl font-bold text-white">{tier.duration} час(ов)</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-gray-400">Процент награды</Label>
                        <div className="text-lg font-semibold text-emerald-400">{tier.rewardRate / 100}%</div>
                      </div>
                      <div>
                        <Label className="text-gray-400">Множитель NFT</Label>
                        <div className="text-lg font-semibold text-blue-400">{tier.nftMultiplier}x</div>
                      </div>
                    </div>
    <div>
      <Label className="text-gray-400">Ваучеры</Label>
      <div className="text-sm text-gray-300">{tier.vouchers?.length || 0} включено</div>
    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Модальное окно редактирования тира */}
            {editingTier && (
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle>Редактирование тира {editingTier.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Сумма стейкинга (PADD-R)</Label>
                      <Input
                        type="number"
                        value={editingTier.amount}
                        onChange={(e) => setEditingTier({
                          ...editingTier,
                          amount: parseInt(e.target.value) || 0
                        })}
                        className="bg-gray-800 border-gray-700"
                      />
                    </div>
                    <div>
                      <Label>Длительность (часы)</Label>
                      <Input
                        type="number"
                        value={editingTier.duration}
                        onChange={(e) => setEditingTier({
                          ...editingTier,
                          duration: parseInt(e.target.value) || 0
                        })}
                        className="bg-gray-800 border-gray-700"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Процент награды (базисные пункты)</Label>
                      <Input
                        type="number"
                        value={editingTier.rewardRate}
                        onChange={(e) => setEditingTier({
                          ...editingTier,
                          rewardRate: parseInt(e.target.value) || 0
                        })}
                        className="bg-gray-800 border-gray-700"
                      />
                    </div>
                    <div>
                      <Label>Множитель NFT</Label>
                      <Input
                        type="number"
                        value={editingTier.nftMultiplier}
                        onChange={(e) => setEditingTier({
                          ...editingTier,
                          nftMultiplier: parseInt(e.target.value) || 1
                        })}
                        className="bg-gray-800 border-gray-700"
                      />
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => updateTier(editingTier)}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      <Save size={16} className="mr-2" />
                      Сохранить
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setEditingTier(null)}
                    >
                      Отмена
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Управление ваучерами */}
          <TabsContent value="vouchers" className="space-y-6">
            {tiers.map((tier) => (
              <Card key={tier.id} className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <Badge className={`${
                        tier.name === 'Platinum' ? 'bg-emerald-600' :
                        tier.name === 'Gold' ? 'bg-yellow-600' :
                        tier.name === 'Silver' ? 'bg-gray-600' : 'bg-amber-600'
                      } text-white`}>
                        {tier.name} - Ваучеры
                      </Badge>
                    </CardTitle>
                    <Button
                      size="sm"
                      onClick={() => addVoucher(tier.id)}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      <Plus size={16} className="mr-1" />
                      Добавить
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {tier.vouchers.map((voucher) => (
                      <div key={voucher.id} className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-white">{voucher.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {voucher.type}
                            </Badge>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingVoucher(voucher)}
                            >
                              <Edit size={14} />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => removeVoucher(tier.id, voucher.id)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm text-gray-300 mb-1">{voucher.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-emerald-400 font-medium">{voucher.value}</span>
                          {voucher.maxUses && (
                            <span className="text-xs text-gray-400">Макс. использований: {voucher.maxUses}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Модальное окно редактирования ваучера */}
            {editingVoucher && (
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle>Редактирование ваучера</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Название</Label>
                    <Input
                      value={editingVoucher.name}
                      onChange={(e) => setEditingVoucher({
                        ...editingVoucher,
                        name: e.target.value
                      })}
                      className="bg-gray-800 border-gray-700"
                    />
                  </div>
                  <div>
                    <Label>Описание</Label>
                    <Textarea
                      value={editingVoucher.description}
                      onChange={(e) => setEditingVoucher({
                        ...editingVoucher,
                        description: e.target.value
                      })}
                      className="bg-gray-800 border-gray-700"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Значение</Label>
                      <Input
                        value={editingVoucher.value}
                        onChange={(e) => setEditingVoucher({
                          ...editingVoucher,
                          value: e.target.value
                        })}
                        className="bg-gray-800 border-gray-700"
                      />
                    </div>
                    <div>
                      <Label>Тип</Label>
                      <Select
                        value={editingVoucher.type}
                        onValueChange={(value: 'SINGLE_USE' | 'MULTI_USE' | 'DURATION') => 
                          setEditingVoucher({ ...editingVoucher, type: value })
                        }
                      >
                        <SelectTrigger className="bg-gray-800 border-gray-700">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SINGLE_USE">Одноразовый</SelectItem>
                          <SelectItem value="MULTI_USE">Многоразовый</SelectItem>
                          <SelectItem value="DURATION">На период</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {editingVoucher.type === 'MULTI_USE' && (
                    <div>
                      <Label>Максимальное количество использований</Label>
                      <Input
                        type="number"
                        value={editingVoucher.maxUses || 1}
                        onChange={(e) => setEditingVoucher({
                          ...editingVoucher,
                          maxUses: parseInt(e.target.value) || 1
                        })}
                        className="bg-gray-800 border-gray-700"
                      />
                    </div>
                  )}
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => {
                        // Найти тир и обновить ваучер
                        const tier = tiers.find(t => t.vouchers.some(v => v.id === editingVoucher.id));
                        if (tier) {
                          updateVoucher(tier.id, editingVoucher);
                        }
                        setEditingVoucher(null);
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      <Save size={16} className="mr-2" />
                      Сохранить
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setEditingVoucher(null)}
                    >
                      Отмена
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Все ваучеры всех пользователей */}
          <TabsContent value="all-vouchers" className="space-y-6">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Gift size={20} />
                    <span>Все ваучеры в системе</span>
                  </CardTitle>
                  <div className="flex space-x-2">
                    <Button
                      onClick={loadAllVouchers}
                      disabled={loadingVouchers}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      <RefreshCw size={16} className={`mr-2 ${loadingVouchers ? 'animate-spin' : ''}`} />
                      {loadingVouchers ? 'Загрузка...' : 'Обновить'}
                    </Button>
                    <Button
                      onClick={() => createVouchersForPosition("0x513756b7eD711c472537cb497833c5d5Eb02A3Df", 1, 0)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus size={16} className="mr-2" />
                      Создать ваучеры
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {allVouchers.length === 0 ? (
                  <div className="text-center py-8">
                    <Gift size={48} className="mx-auto text-gray-500 mb-4" />
                    <p className="text-gray-400">Нажмите "Обновить" чтобы загрузить все ваучеры</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {Object.entries(vouchersByOwner).map(([owner, vouchers]) => {
                      // Фильтруем только активные и валидные ваучеры
                      const activeVouchers = vouchers.filter(voucher => 
                        voucher.isActive && voucher.isValid && voucher.name !== "" && voucher.name !== "0"
                      );
                      
                      if (activeVouchers.length === 0) return null;
                      
                      return (
                        <div key={owner} className="space-y-4">
                          <div className="flex items-center space-x-3">
                            <h3 className="text-lg font-semibold text-white">
                              Владелец: {owner === "0x0000000000000000000000000000000000000000" ? "Пустые слоты" : `${owner.slice(0, 6)}...${owner.slice(-4)}`}
                            </h3>
                            <Badge variant="outline" className="text-xs">
                              {activeVouchers.length} активных ваучеров
                            </Badge>
                            {owner !== "0x0000000000000000000000000000000000000000" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => navigator.clipboard.writeText(owner)}
                                className="text-xs"
                              >
                                Копировать адрес
                              </Button>
                            )}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {activeVouchers.map((voucher) => (
                            <div key={voucher.id} className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  <span className="font-semibold text-white">{voucher.name}</span>
                                  <Badge 
                                    variant="outline" 
                                    className={`text-xs ${
                                      voucher.type === 'Single Use' ? 'text-red-400' :
                                      voucher.type === 'Multi Use' ? 'text-blue-400' : 'text-green-400'
                                    }`}
                                  >
                                    {voucher.type}
                                  </Badge>
                                </div>
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${
                                    voucher.isActive ? 'text-green-400' : 'text-red-400'
                                  }`}
                                >
                                  {voucher.isActive ? 'Активен' : 'Неактивен'}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-300 mb-2">{voucher.description}</p>
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-emerald-400 font-medium">{voucher.value}</span>
                                <div className="flex items-center space-x-2">
                                  <span className="text-gray-400">
                                    {voucher.currentUses}/{voucher.maxUses} использований
                                  </span>
                                  {parseInt(voucher.maxUses) > 1 && (
                                    <Badge 
                                      variant="outline" 
                                      className={`text-xs ${
                                        parseInt(voucher.currentUses) === parseInt(voucher.maxUses) ? 'text-red-400' :
                                        parseInt(voucher.currentUses) > 0 ? 'text-yellow-400' : 'text-green-400'
                                      }`}
                                    >
                                      {parseInt(voucher.currentUses) === parseInt(voucher.maxUses) ? 'Исчерпан' :
                                       parseInt(voucher.currentUses) > 0 ? 'Частично использован' : 'Не использован'}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <div className="mt-2 pt-2 border-t border-gray-700">
                                <p className="text-xs text-gray-500">
                                  ID: {voucher.id} | Позиция: {voucher.positionId}
                                </p>
                                <div className="flex space-x-2 mt-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => redeemVoucher(voucher.id)}
                                    disabled={!voucher.isActive || !voucher.isValid}
                                    className="text-xs"
                                  >
                                    Погасить
                                  </Button>
                                  {parseInt(voucher.maxUses) > 1 && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => testRedeemMultiUse(voucher.id)}
                                      disabled={!voucher.isActive || !voucher.isValid || parseInt(voucher.currentUses) >= parseInt(voucher.maxUses)}
                                      className="text-xs text-blue-400"
                                    >
                                      Тест (1/{voucher.maxUses})
                                    </Button>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => deactivateVoucher(voucher.id)}
                                    disabled={!voucher.isActive}
                                    className="text-xs text-red-400"
                                  >
                                    Деактивировать
                                  </Button>
                                </div>
                              </div>
                            </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Управление NFT */}
          <TabsContent value="nft" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {['Bronze', 'Silver', 'Gold', 'Platinum'].map((tier) => (
                <Card key={tier} className="bg-gray-900/50 border-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Badge className={`${
                        tier === 'Platinum' ? 'bg-emerald-600' :
                        tier === 'Gold' ? 'bg-yellow-600' :
                        tier === 'Silver' ? 'bg-gray-600' : 'bg-amber-600'
                      } text-white`}>
                        {tier} NFT
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Загрузка изображений */}
                    <div>
                      <Label className="text-gray-400 mb-2 block">Загрузить изображения</Label>
                      <div className="flex space-x-2">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, tier, 'image')}
                          disabled={isUploading}
                          className="bg-gray-800 border-gray-700"
                        />
                        <Button
                          size="sm"
                          disabled={isUploading}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Upload size={16} />
                        </Button>
                      </div>
                    </div>

                    {/* Загрузка видео */}
                    <div>
                      <Label className="text-gray-400 mb-2 block">Загрузить видео</Label>
                      <div className="flex space-x-2">
                        <Input
                          type="file"
                          accept="video/*"
                          onChange={(e) => handleFileUpload(e, tier, 'video')}
                          disabled={isUploading}
                          className="bg-gray-800 border-gray-700"
                        />
                        <Button
                          size="sm"
                          disabled={isUploading}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          <Video size={16} />
                        </Button>
                      </div>
                    </div>

                    {/* Список ассетов */}
                    <div>
                      <Label className="text-gray-400 mb-2 block">Текущие ассеты</Label>
                      <div className="space-y-2">
                        {nftAssets
                          .filter(asset => asset.tier === tier)
                          .map((asset) => (
                            <div key={asset.id} className="flex items-center justify-between p-2 bg-gray-800/50 rounded border border-gray-700">
                              <div className="flex items-center space-x-2">
                                {asset.type === 'video' ? (
                                  <Video size={16} className="text-purple-400" />
                                ) : (
                                  <ImageIcon size={16} className="text-blue-400" />
                                )}
                                <span className="text-white text-sm">{asset.name}</span>
                                <Badge variant="outline" className="text-xs">
                                  {asset.type}
                                </Badge>
                              </div>
                              <div className="flex space-x-2">
                                <Switch
                                  checked={asset.isActive}
                                  onCheckedChange={() => toggleAssetActive(asset.id)}
                                />
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => removeAsset(asset.id)}
                                  className="text-red-400 hover:text-red-300"
                                >
                                  <Trash2 size={14} />
                                </Button>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Сканер ваучеров */}
          <TabsContent value="scanner">
            <VoucherScanner />
          </TabsContent>

          {/* Аналитика */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gray-900/50 border-gray-800">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Users className="text-blue-400" size={24} />
                    <div>
                      <p className="text-sm text-gray-400">Всего пользователей</p>
                      <p className="text-2xl font-bold text-white">1,234</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-800">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Trophy className="text-emerald-400" size={24} />
                    <div>
                      <p className="text-sm text-gray-400">Активных стейков</p>
                      <p className="text-2xl font-bold text-white">567</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-800">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="text-yellow-400" size={24} />
                    <div>
                      <p className="text-sm text-gray-400">Общий объем</p>
                      <p className="text-2xl font-bold text-white">2.5M PADD-R</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-800">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Gift className="text-purple-400" size={24} />
                    <div>
                      <p className="text-sm text-gray-400">Погашено ваучеров</p>
                      <p className="text-2xl font-bold text-white">89</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle>Статистика по тирам</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tiers.map((tier) => (
                    <div key={tier.id} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Badge className={`${
                          tier.name === 'Platinum' ? 'bg-emerald-600' :
                          tier.name === 'Gold' ? 'bg-yellow-600' :
                          tier.name === 'Silver' ? 'bg-gray-600' : 'bg-amber-600'
                        } text-white`}>
                          {tier.name}
                        </Badge>
                        <span className="text-white">{tier.amount} PADD-R</span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <span>Пользователей: 123</span>
                        <span>Объем: 456K PADD-R</span>
                        <span>Ваучеров: {tier.vouchers.length}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
