"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Crown, Star, Gem, Zap } from "lucide-react";
import { useWallet } from "@/hooks/use-wallet";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

function StakingButton({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { isConnected } = useWallet();
  const { openConnectModal } = useConnectModal();
  const router = useRouter();
  const handleClick = () => {
    if (isConnected) {
      router.push("/dashboard/stake");
    } else if (openConnectModal) {
      openConnectModal();
    }
  };
  return (
    <Button onClick={handleClick} className={className} variant="outline">
      {children}
    </Button>
  );
}

export function LoyaltyTiers() {
  const tiers = [
    {
      name: "Bronze",
      duration: "/1 months",
      dayRange: "180-365 days",
      discount: "5%",
      title: "4% NFT bonuses per year",
      perks: [
        "5% discount on rentals with PADD-R tokens",
        "+1 hour free rental",
        "$50 rental coupon (covers up to 10% cost)",
        "10% discount at Paddock Restaurant",
      ],
      nft: "Bronze NFT",
      color: "from-amber-600 to-amber-800",
      icon: Zap,
      popular: false,
      mainColor: "#F29F4E",
      amount: "$500",
    },
    {
      name: "Silver",
      duration: "/3 months",
      dayRange: "365-547 days",
      discount: "7%",
      title: "6% NFT bonuses per year",
      perks: [
        "5% discount on rentals with PADD-R tokens",
        "+2 hours free rental",
        "3x $150 rental coupons (covers up to 15% cost)",
        "15% discount at Paddock auto service",
      ],
      nft: "Silver NFT",
      color: "from-gray-400 to-gray-600",
      icon: Star,
      popular: true,
      mainColor: "#BDC0C4",
      amount: "$1000",
    },
    {
      name: "Gold",
      duration: "/6 months",
      dayRange: "547-912 days",
      discount: "10%",
      title: "8% NFT bonuses per year",
      perks: [
        "5% discount on rentals with PADD-R tokens",
        "+3 hours free rental",
        "6x $600 rental coupons (covers up to 20% cost)",
        "Unlimited mileage",
      ],
      nft: "Gold NFT",
      color: "from-yellow-400 to-yellow-600",
      icon: Crown,
      popular: false,
      mainColor: "#FFCC45",
      amount: "$3000",
    },
    {
      name: "Platinum",
      duration: "/12 months",
      dayRange: "912+ days",
      discount: "12%",
      title: "10% NFT bonuses per year",
      perks: [
        "5% discount on rentals with PADD-R tokens",
        "+5 hours free rental",
        "12x $1250 rental coupons (covers up to 25% cost)",
        "Exclusive raffles: sports car rental, 5 hotel weekend",
      ],
      nft: "Platinum NFT",
      color: "from-emerald-400 to-emerald-600",
      icon: Gem,
      popular: false,
      mainColor: "#21CC98",
      amount: "$5000",
    },
  ];

  return (
    <section id="tiers" className="py-16 px-4 sm:px-6 lg:px-8 ">
      <div className="lg-container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 font-unbounded">
            Loyalty Tiers
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Stake longer, earn more. Unlock exclusive benefits and NFT rewards
            based on staking duration.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6  mx-auto">
          {/* {tiers.map((tier, index) => (
            <Card 
              key={index} 
              className={`relative bg-gradient-to-br ${tier.color} border-0 text-white card-hover ${tier.popular ? 'ring-2 ring-emerald-400' : ''}`}
            >
              {tier.popular && (
                <div className="absolute top-3 right-3">
                  <Badge className="bg-emerald-600 text-white px-4 py-1">Most Popular</Badge>
                </div>
              )}
              
              <CardHeader className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-white/20 rounded-2xl flex items-center justify-center">
                  <tier.icon size={24} className="text-white" />
                </div>
                <CardTitle className="text-2xl font-bold">{tier.name}</CardTitle>
                <CardDescription className="text-white/80 font-medium">{tier.duration}</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold mb-1">{tier.dayRange}</div>
                  <div className="text-sm opacity-90">Staking Period</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-300 mb-1">{tier.discount}</div>
                  <div className="text-sm opacity-90">Discount</div>
                </div>
                
                <div>
                  <div className="text-sm opacity-90 mb-2 font-medium">Benefits</div>
                  <div className="space-y-1">
                    {tier.perks.map((perk, i) => (
                      <Badge key={i} variant="secondary" className="mr-1 mb-1 bg-white/20 text-white border-0 text-xs">
                        {perk}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-sm opacity-90 mb-1">NFT Reward</div>
                  <div className="font-semibold text-yellow-300">{tier.nft}</div>
                </div>
                
                <StakingButton className="w-full bg-white/20 hover:bg-white/30 text-white border-0 font-semibold">
                  Start Staking
                </StakingButton>
              </CardContent>
            </Card>
          ))} */}
          {tiers.map((tier, index) => (
            <div
              key={index}
              className="bg-[#4C4C4C] rounded-[40px] flex flex-col justify-between"
            >
              <p
                className="text-[50px] font-bold text-center font-unbounded"
                style={{ color: tier.mainColor }}
              >
                {tier.name}
              </p>
              <div className="bg-[#1A1A1A] rounded-[40px] p-6 max-h-[340px] h-full flex flex-col justify-between">
                <div>
                  <p className="text-base font-extrabold italic">
                    {tier.title}
                  </p>
                  <ul className="list-disc list-inside mt-2 pb-4">
                    {tier.perks.map((perk, i) => (
                      <li key={i} className="text-sm font-medium">
                        {perk}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <hr />
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-base font-medium ">
                      <span className="font-bold text-2xl">{tier.amount} </span>
                      <span className="text-[#868686] text-base font-bold">
                        {tier.duration}
                      </span>
                    </p>
                    {tier.popular && (
                      <div className="text-base rounded-full px-2 py-1 font-medium text-center bg-[#059669]">
                        Most Popular
                      </div>
                    )}
                  </div>
                  <StakingButton
                    className={cn(
                      "w-full text-base font-bold py-2 rounded-lg bg-gradient-to-br mt-3",
                      tier.color
                    )}
                  >
                    Get membership
                  </StakingButton>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
