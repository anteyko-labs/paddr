"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Play, User, Wallet, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useWallet } from "@/hooks/use-wallet";
import { ConnectWalletButton } from "@/components/ui/connect-wallet-button";
import { useMediaQuery } from "@/hooks/useMediaQuery";

export function HeroSection() {
  const { isConnected } = useWallet();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isHeightMobile = useMediaQuery("(max-height: 768px)");

  return (
    <section
      className="relative min-h-[100vh] lg:min-h-[120vh] md:min-h-[110vh] flex items-end lg:items-start md:items-start md:pt-36 lg:pt-36 justify-center px-4 sm:px-6 lg:px-8 overflow-hidden"
      style={{
        ...(isHeightMobile && !isMobile && { minHeight: "120vh" }),
      }}
      // style={{
      //   backgroundImage: "url(/videos/main-bg.gif)",
      //   backgroundSize: !isMobile ? "cover" : "contain",
      //   backgroundPosition: isMobile ? "center 0px" : "center -100px",
      //   backgroundRepeat: "no-repeat",
      //   minHeight: isMobile ? "100vh" : "125vh",
      // }}
    >
      {isMobile ? (
        <video
          src="/videos/test.mp4"
          autoPlay
          muted
          loop
          controls={false}
          className="absolute inset-0 w-full  object-contain"
        />
      ) : (
        <video
          src="/videos/test.mp4"
          autoPlay
          muted
          loop
          controls={false}
          className="absolute inset-0 w-full -top-32 object-contain"
        />
      )}
      {/* Background gradient */}
      {/* <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 via-black to-black" /> */}

      {/* Animated background elements */}
      {/* <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl animate-float" />
      <div
        className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-400/5 rounded-full blur-3xl animate-float"
        style={{ animationDelay: "2s" }}
      /> */}

      <div className="container mx-auto text-start md:text-center lg:text-center relative z-10">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-[32px] md:text-[56px] lg:text-[56px] font-semibold lg:font-bold md:font-bold mb-6 leading-tight">
            <p className="font-unbounded">
              Drive, Dine, Stay <br /> powered by{" "}
            </p>
            <span className="text-white font-unbounded animate-pulse text-glow-white">
              PADD-R Token
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Your key to real-world rewards in Dubai and beyond. Experience
            luxury services with exclusive token-gated benefits.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            {/* Get Token button - always visible */}
            <a
              href="https://pancakeswap.finance/swap?outputCurrency=0x742d35Cc6Bf8fE5a02B5c4B4c8b4cB2"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full md:w-auto"
            >
              <Button
                size="lg"
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-lg px-8 py-4 rounded-2xl font-semibold pulse-emerald w-full md:w-auto"
              >
                Get Token <ExternalLink className="ml-2" size={20} />
              </Button>
            </a>

            {/* Conditional buttons based on wallet connection */}
            {!isConnected ? (
              <ConnectWalletButton className="border-emerald-600 text-emerald-400 hover:bg-emerald-600/10 text-lg px-8 py-4 rounded-2xl font-semibold w-full md:w-auto" />
            ) : (
              <Link href="/dashboard" className="w-full md:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-emerald-600 text-emerald-400 hover:bg-emerald-600/10 text-lg px-8 py-4 rounded-2xl font-semibold !w-full md:w-auto"
                >
                  <User className="mr-2" size={20} />
                  Go to Dashboard
                </Button>
              </Link>
            )}

            <Button
              variant="outline"
              size="lg"
              className="border-emerald-600 text-emerald-400 hover:bg-emerald-600/10 text-lg px-8 py-4 rounded-2xl font-semibold w-full md:w-auto"
            >
              <Play className="mr-2" size={20} />
              Watch Demo
            </Button>
          </div>

          {/* Stats */}
          {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {[
              { value: "40K+", label: "Token Holders" },
              { value: "15M+", label: "Tokens Staked" },
              { value: "500+", label: "NFTs Minted" },
              { value: "99%", label: "Uptime" },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-emerald-400 mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-400 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div> */}
        </div>
      </div>
    </section>
  );
}
