"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Wallet, Shield, Gift, Trophy } from "lucide-react";

export function AboutUs() {
  return (
    <section id="how-it-works" className="py-16 px-4 sm:px-6 lg:px-8 ">
      <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center font-unbounded">
        About us
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
        {[
          { value: "40K+", label: "Token Holders" },
          { value: "15M+", label: "Tokens Staked" },
          { value: "500+", label: "NFTs Minted" },
          { value: "99%", label: "Uptime" },
        ].map((stat, index) => (
          <div key={index} className="text-center">
            <div className="text-5xl md:text-5xl lg:text-[56px] font-bold text-[#079669] mb-1 font-grtsk">
              {stat.value}
            </div>
            <div className="text-2xl text-white font-medium">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
