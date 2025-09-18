'use client';

import React, { useState } from 'react';
import { useAccount, useWriteContract } from 'wagmi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { QrCode, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { QRCodeComponent } from '@/components/ui/qr-code';
import { useToast } from '@/hooks/use-toast';
import { VOUCHER_MANAGER_ADDRESS, VOUCHER_MANAGER_ABI } from '@/lib/contracts/config';
import { checkVoucherByQRCode } from '@/hooks/useVouchers';

export function VoucherScanner() {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const { toast } = useToast();
  
  const [qrCode, setQrCode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{
    success: boolean;
    message: string;
    voucherData?: any;
  } | null>(null);

  const handleScanQR = async () => {
    if (!qrCode.trim()) {
      toast({ title: 'Ошибка', description: 'Введите QR код', variant: 'destructive' });
      return;
    }

    setIsScanning(true);
    setScanResult(null);

    try {
      // Сначала проверяем ваучер
      const voucherData = await checkVoucher(qrCode);
      
      if (!voucherData) {
        setScanResult({
          success: false,
          message: 'Ваучер не найден'
        });
        return;
      }

      // Пытаемся погасить ваучер
      const result = await writeContractAsync({
        address: VOUCHER_MANAGER_ADDRESS,
        abi: VOUCHER_MANAGER_ABI,
        functionName: 'redeemVoucher',
        args: [qrCode, address!],
      });

      setScanResult({
        success: true,
        message: 'Ваучер успешно погашен!',
        voucherData
      });

      toast({ 
        title: 'Успех!', 
        description: 'Ваучер погашен успешно' 
      });

    } catch (error: any) {
      console.error('Error redeeming voucher:', error);
      setScanResult({
        success: false,
        message: error?.message || 'Ошибка при погашении ваучера'
      });
      
      toast({ 
        title: 'Ошибка', 
        description: error?.message || 'Ошибка при погашении ваучера',
        variant: 'destructive'
      });
    } finally {
      setIsScanning(false);
    }
  };

  const checkVoucher = async (qrCode: string) => {
    try {
      // Используем реальную функцию проверки ваучера
      const voucher = await checkVoucherByQRCode(qrCode);
      if (!voucher) return null;
      
      return {
        id: voucher.id.toString(),
        name: voucher.name,
        description: voucher.description,
        value: voucher.value,
        type: voucher.voucherType === 0 ? 'Single Use' : 
              voucher.voucherType === 1 ? 'Multi Use' : 'Duration',
        isActive: voucher.isActive,
        currentUses: Number(voucher.currentUses),
        maxUses: Number(voucher.maxUses)
      };
    } catch (error) {
      console.error('Error checking voucher:', error);
      return null;
    }
  };

  const handleManualInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQrCode(e.target.value);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setQrCode(text);
    } catch (error) {
      toast({ 
        title: 'Ошибка', 
        description: 'Не удалось получить данные из буфера обмена',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-white">
            <QrCode size={24} className="text-emerald-400" />
            <span>Сканер QR кодов ваучеров</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* QR Code Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">
              QR код ваучера
            </label>
            <div className="flex space-x-2">
              <Input
                value={qrCode}
                onChange={handleManualInput}
                placeholder="Введите или вставьте QR код..."
                className="flex-1 bg-gray-800 border-gray-700 text-white"
              />
              <Button
                onClick={handlePaste}
                variant="outline"
                className="border-gray-600 text-gray-300"
              >
                Вставить
              </Button>
            </div>
          </div>

          {/* Scan Button */}
          <Button
            onClick={handleScanQR}
            disabled={isScanning || !qrCode.trim()}
            className="w-full bg-emerald-600 hover:bg-emerald-700"
          >
            {isScanning ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Сканирование...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <QrCode size={16} />
                <span>Сканировать и погасить</span>
              </div>
            )}
          </Button>

          {/* Scan Result */}
          {scanResult && (
            <Card className={`border-2 ${
              scanResult.success 
                ? 'border-emerald-600 bg-emerald-900/20' 
                : 'border-red-600 bg-red-900/20'
            }`}>
              <CardContent className="pt-4">
                <div className="flex items-center space-x-2">
                  {scanResult.success ? (
                    <CheckCircle size={20} className="text-emerald-400" />
                  ) : (
                    <XCircle size={20} className="text-red-400" />
                  )}
                  <span className={`font-medium ${
                    scanResult.success ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {scanResult.message}
                  </span>
                </div>
                
                {scanResult.voucherData && (
                  <div className="mt-3 p-3 bg-gray-800/50 rounded-lg">
                    <h4 className="font-medium text-white mb-2">Данные ваучера:</h4>
                    <div className="space-y-1 text-sm">
                      <div>
                        <span className="text-gray-400">ID: </span>
                        <span className="text-white">{scanResult.voucherData.id}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Название: </span>
                        <span className="text-white">{scanResult.voucherData.name}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Описание: </span>
                        <span className="text-white">{scanResult.voucherData.description}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Значение: </span>
                        <span className="text-white font-semibold">{scanResult.voucherData.value}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">QR Код: </span>
                        <span className="text-white font-mono text-xs">{qrCode}</span>
                      </div>
                    </div>
                    <div className="mt-3 flex justify-center">
                      <div className="bg-white p-2 rounded-lg">
                        <QRCodeComponent 
                          value={qrCode} 
                          size={120}
                          className="border border-gray-300 rounded"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-white">
            <AlertCircle size={20} className="text-blue-400" />
            <span>Инструкции</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-300">
            <p>1. Попросите клиента показать QR код ваучера</p>
            <p>2. Отсканируйте QR код или попросите клиента скопировать его</p>
            <p>3. Вставьте QR код в поле выше</p>
            <p>4. Нажмите "Сканировать и погасить"</p>
            <p>5. Ваучер будет автоматически деактивирован в системе</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
