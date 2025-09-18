"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Eye, TrendingUp } from "lucide-react";
import { useWallet } from "@/hooks/use-wallet";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useRouter } from "next/navigation";

function TradeButton({
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
      router.push("/dashboard/rewards");
    } else if (openConnectModal) {
      openConnectModal();
    }
  };
  return (
    <Button onClick={handleClick} className={className} size="sm">
      {children}
    </Button>
  );
}

export function NFTMarketplace() {
  const nfts = [
    {
      name: "Silver NFT",
      type: "Tradeable NFT",
      tier: "Silver",
      benefits: ["6% discount", "Car upgrades 2x/year", "Priority booking"],
      image: "/images/silver-nft.png",
      video: "/videos/silver.mp4",
      tradeable: true,
      rarity: "Common",
      price: "1.2 BNB",
    },
    {
      name: "Platinum NFT",
      type: "Tradeable NFT",
      tier: "Platinum",
      benefits: ["10% discount", "Track days", "Personal manager"],
      image: "/images/platinum-nft.png",
      video: "/videos/platinum.mp4",
      tradeable: true,
      rarity: "Legendary",
      price: "8.0 BNB",
    },
    {
      name: "Gold NFT",
      type: "Tradeable NFT",
      tier: "Gold",
      benefits: ["8% discount", "VIP restaurant access", "Premium rentals"],
      image: "/images/gold-nft.png",
      video: "/videos/gold.mp4",
      tradeable: true,
      rarity: "Common",
      price: "2.5 BNB",
    },
  ];

  return (
    <section id="nft" className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 font-unbounded">
            NFT Marketplace
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Trade your tier NFTs or showcase your exclusive access passes
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
          {nfts.map((nft, index) => (
            <Card
              key={index}
              className="bg-gray-900/50 border-gray-800 card-hover group overflow-hidden"
            >
              <div className="relative">
                <video
                  src={nft.video}
                  autoPlay
                  muted
                  loop
                  className="w-full h-72 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {nft.rarity !== "Legendary" ? (
                  <div className="absolute top-4 right-4">
                    <Badge
                      className={`${
                        nft.rarity === "Legendary"
                          ? "bg-purple-600"
                          : nft.rarity === "Rare"
                          ? "bg-yellow-600"
                          : "bg-gray-600"
                      } text-white`}
                    >
                      {nft.rarity}
                    </Badge>
                  </div>
                ) : (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-xl font-bold bg-[#33BCEA20] backdrop-blur-md border border-white/30 rounded-full w-2/3 text-center py-2">
                    Legendary
                  </div>
                )}
              </div>

              <CardHeader>
                <CardTitle className="text-xl text-white">{nft.name}</CardTitle>
                <div className="flex items-center justify-between">
                  <Badge
                    variant="outline"
                    className="border-emerald-600 text-emerald-400"
                  >
                    {nft.tier} Tier
                  </Badge>
                  {nft.tradeable && nft.price && (
                    <div className="text-emerald-400 font-bold">
                      {nft.price}
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm text-gray-400 mb-2">Benefits</div>
                  <div className="space-y-1">
                    {nft.benefits.map((benefit, i) => (
                      <div
                        key={i}
                        className="text-sm text-gray-300 flex items-center"
                      >
                        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-2" />
                        {benefit}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
                  >
                    <Eye size={16} className="mr-1" />
                    View Details
                  </Button>
                  {nft.tradeable && (
                    <TradeButton className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                      <ExternalLink size={16} className="mr-1" />
                      Trade
                    </TradeButton>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Marketplace Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {[
            { label: "Total Volume", value: "1,250 BNB", icon: TrendingUp },
            { label: "NFTs Traded", value: "3,420", icon: ExternalLink },
            { label: "Active Holders", value: "8,900", icon: Eye },
            { label: "Floor Price", value: "0.8 BNB", icon: TrendingUp },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-emerald-600/20 rounded-2xl flex items-center justify-center">
                <stat.icon size={20} className="text-emerald-400" />
              </div>
              <div className="text-xl font-bold text-white mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
