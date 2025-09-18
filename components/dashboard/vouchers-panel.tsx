'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { QrCode, Copy, Check, ExternalLink } from 'lucide-react';
import { QRCodeComponent } from '@/components/ui/qr-code';
import { useAccount } from 'wagmi';
import { useToast } from '@/hooks/use-toast';
import { useVouchers } from '@/hooks/useVouchers';

interface Voucher {
  id: bigint;
  owner: string;
  voucherType: number; // 0: SINGLE_USE, 1: MULTI_USE, 2: DURATION
  name: string;
  description: string;
  value: string;
  maxUses: bigint;
  currentUses: bigint;
  expiresAt: bigint;
  isActive: boolean;
  qrCode: string;
  positionId: bigint;
}

export function VouchersPanel() {
  const { address } = useAccount();
  const { toast } = useToast();
  const { vouchers, isLoading, error, refetch } = useVouchers();
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = async (text: string, voucherId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(voucherId);
      toast({ title: 'Copied!', description: 'Voucher ID copied to clipboard' });
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to copy voucher ID' });
    }
  };

  const getVoucherStatus = (voucher: Voucher) => {
    if (!voucher.isActive) return 'inactive';
    if (voucher.voucherType === 0 && Number(voucher.currentUses) >= Number(voucher.maxUses)) return 'used';
    if (voucher.voucherType === 1 && Number(voucher.currentUses) >= Number(voucher.maxUses)) return 'used';
    if (voucher.expiresAt > 0 && Date.now() > Number(voucher.expiresAt) * 1000) return 'expired';
    return 'active';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-600';
      case 'used': return 'bg-gray-600';
      case 'expired': return 'bg-red-600';
      case 'inactive': return 'bg-gray-600';
      default: return 'bg-gray-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'used': return 'Used';
      case 'expired': return 'Expired';
      case 'inactive': return 'Inactive';
      default: return 'Unknown';
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <QrCode size={20} className="text-emerald-400" />
            <span>Vouchers</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-400">Loading vouchers...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <QrCode size={20} className="text-emerald-400" />
            <span>My Vouchers</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {vouchers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400">No vouchers available</p>
              <p className="text-sm text-gray-500 mt-2">Stake tokens to get vouchers</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vouchers.map((voucher) => {
                const status = getVoucherStatus(voucher);
                return (
                  <Card key={voucher.id} className="bg-gray-800/50 border-gray-700">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-white">{voucher.name}</h3>
                          <p className="text-sm text-gray-400">{voucher.description}</p>
                        </div>
                        <Badge className={getStatusColor(status)}>
                          {getStatusText(status)}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Value:</span>
                          <span className="text-emerald-400 font-medium">{voucher.value}</span>
                        </div>
                        {voucher.voucherType === 1 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Uses:</span>
                            <span className="text-white">
                              {Number(voucher.currentUses)} / {Number(voucher.maxUses)}
                            </span>
                          </div>
                        )}
                        {voucher.expiresAt > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Expires:</span>
                            <span className="text-white">
                              {new Date(Number(voucher.expiresAt) * 1000).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => setSelectedVoucher(voucher)}
                        >
                          <QrCode size={16} className="mr-2" />
                          Show QR
                        </Button>
                                                 <Button
                           size="sm"
                           variant="outline"
                           onClick={() => copyToClipboard(voucher.id.toString(), voucher.id.toString())}
                         >
                                                     {copiedId === voucher.id.toString() ? (
                             <Check size={16} />
                           ) : (
                             <Copy size={16} />
                           )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* QR Code Modal */}
      {selectedVoucher && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-2xl max-w-sm w-full mx-4">
            <div className="text-center">
              <h3 className="text-xl font-bold text-white mb-4">{selectedVoucher.name}</h3>
              <div className="bg-white p-4 rounded-lg mb-4">
                <div className="w-48 h-48 mx-auto flex items-center justify-center">
                  <QRCodeComponent 
                    value={selectedVoucher.qrCode} 
                    size={180}
                    className="border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <p className="text-sm text-gray-400 mb-4">
                Show this QR code to redeem your voucher
              </p>
              <div className="flex space-x-2">
                <Button
                  className="flex-1"
                  onClick={() => copyToClipboard(selectedVoucher.qrCode, selectedVoucher.id.toString())}
                >
                  <Copy size={16} className="mr-2" />
                  Copy Code
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedVoucher(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
