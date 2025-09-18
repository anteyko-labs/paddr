import { DashboardLayout } from '@/components/dashboard/layout';
import { NFTStatusChecker } from '@/components/dashboard/nft-status-checker';
import { SimpleRewardsGallery } from '@/components/dashboard/simple-rewards-gallery';

export default function RewardsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Your Rewards</h1>
          <p className="text-muted-foreground">Your NFT collection, vouchers, and staking rewards</p>
        </div>
        
        {/* NFT Status Checker */}
        <NFTStatusChecker />
        
        {/* Rewards Gallery - NFTs and Vouchers */}
        <SimpleRewardsGallery />
      </div>
    </DashboardLayout>
  );
}