'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, TrendingUp, Shield, Trophy } from 'lucide-react';
import { useStakingPositions } from '@/hooks/useStakingPositions';
import { formatDuration } from '@/lib/contracts/config';

export function PositionsDisplay() {
  const { positions, isLoading, totalPositions, activePositions, totalStaked } = useStakingPositions();

  if (isLoading) {
    return (
      <Card className="bg-gray-900/50 border-gray-800">
        <CardContent className="pt-6">
          <div className="text-center text-gray-400">
            <Clock className="h-8 w-8 mx-auto mb-2 animate-spin" />
            <p>Загрузка позиций...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (positions.length === 0) {
    return (
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">📊 Мои позиции</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-400 py-8">
            <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>У вас пока нет стейкинг позиций</p>
            <p className="text-sm">Создайте позицию, чтобы начать зарабатывать</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getTierColor = (tier: number) => {
    const colors = ['bg-amber-600', 'bg-gray-400', 'bg-yellow-500', 'bg-purple-600'];
    return colors[tier] || 'bg-gray-500';
  };

  const getTierName = (tier: number) => {
    const names = ['Bronze', 'Silver', 'Gold', 'Platinum'];
    return names[tier] || `Tier ${tier}`;
  };

  const calculateProgress = (position: any) => {
    const now = Math.floor(Date.now() / 1000);
    const startTime = Number(position.startTime);
    const endTime = Number(position.endTime);
    const totalDuration = endTime - startTime;
    const elapsed = now - startTime;
    return Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
  };

  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <span>📊 Мои позиции</span>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              Всего: {totalPositions}
            </Badge>
            <Badge variant="outline" className="text-xs">
              Активных: {activePositions}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {positions.map((position) => {
          const progress = calculateProgress(position);
          const isActive = position.isActive;
          const isMature = position.isMature;
          
          return (
            <div key={position.id} className="p-4 bg-gray-800/30 rounded-lg border border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <Badge className={getTierColor(position.tier)}>
                    {getTierName(position.tier)}
                  </Badge>
                  <Badge variant={isActive ? "default" : "secondary"}>
                    {isActive ? "Активна" : "Завершена"}
                  </Badge>
                  {isMature && (
                    <Badge variant="outline" className="text-emerald-400 border-emerald-400">
                      Готова к NFT
                    </Badge>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-semibold text-white">{position.formattedAmount}</p>
                  <p className="text-sm text-gray-400">ID: {position.id}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Прогресс:</span>
                  <span className="text-white">{progress.toFixed(1)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Начало:</span>
                    <p className="text-white">{position.formattedStartDate}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Окончание:</span>
                    <p className="text-white">{position.formattedNextMintDate}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-400">Длительность:</span>
                    <span className="text-white">{position.formattedDuration}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-400">Месяц:</span>
                    <span className="text-white">{position.monthIndex + 1}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
