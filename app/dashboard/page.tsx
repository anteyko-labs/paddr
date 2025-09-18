import { DashboardLayout } from '@/components/dashboard/layout';
import { Overview } from '@/components/dashboard/overview';
import { SimpleNFTOverview } from '@/components/dashboard/simple-nft-overview';

export default function Dashboard() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Overview />
        <SimpleNFTOverview />
      </div>
    </DashboardLayout>
  );
}