"use client";

import { AdminDashboard } from '@/components/admin/admin-dashboard';
import { ConnectWallet } from '@/components/ui/connect-wallet';
import { useAccount } from 'wagmi';

export default function AdminPage() {
  const { address, isConnected } = useAccount();
  const admin = '0x513756b7eD711c472537cb497833c5d5Eb02A3Df'.toLowerCase();
  const isOwner = !!address && admin && address.toLowerCase() === admin;

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h1 className="text-2xl font-bold mb-4 text-center">Admin Panel</h1>
            <p className="text-gray-600 mb-6 text-center">Connect your wallet to access the admin panel</p>
            <ConnectWallet />
          </div>
        </div>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 text-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-2 text-red-600">Access Denied</h2>
          <p className="text-gray-600 mb-4">This page is restricted to the admin wallet.</p>
          <p className="text-sm text-gray-500">Connected: {address}</p>
          <p className="text-sm text-gray-500">Required: {admin}</p>
        </div>
      </div>
    );
  }

  return <AdminDashboard />;
}
