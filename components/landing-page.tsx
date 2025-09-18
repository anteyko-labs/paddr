"use client";

import { Navbar } from "@/components/landing/navbar";
import { HeroSection } from "@/components/landing/hero-section";
import { HowItWorks } from "@/components/landing/how-it-works";
import { UtilityHighlights } from "@/components/landing/utility-highlights";
import { LoyaltyTiers } from "@/components/landing/loyalty-tiers";
import { NFTMarketplace } from "@/components/landing/nft-marketplace";
import { Roadmap } from "@/components/landing/roadmap";
import { Tokenomics } from "@/components/landing/tokenomics";
import { FAQSection } from "@/components/landing/faq-section";
import { Footer } from "@/components/landing/footer";
import { AboutUs } from "./landing/about-us";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <HeroSection />
      <AboutUs />
      <HowItWorks />
      <UtilityHighlights />
      <LoyaltyTiers />
      <Roadmap />
      <NFTMarketplace />
      <Tokenomics />
      <FAQSection />
      <Footer />
    </div>
  );
}
