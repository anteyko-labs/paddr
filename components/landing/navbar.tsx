"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { Menu, X, Wallet, User } from "lucide-react";
import Link from "next/link";
import { useWallet } from "@/hooks/use-wallet";
import { ConnectWalletButton } from "@/components/ui/connect-wallet-button";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isConnected, address, isBSCNetwork, switchToBSC } =
    useWallet();

  const navItems = [
    { href: "#how-it-works", label: "How It Works" },
    { href: "#utilities", label: "Utilities" },
    { href: "#tiers", label: "Tiers" },
    { href: "#nft", label: "NFT" },
    { href: "#roadmap", label: "Roadmap" },
    { href: "#tokenomics", label: "Tokenomics" },
  ];

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 w-full z-50 bg-transparent backdrop-blur-md transition-all duration-300",
        isScrolled && "bg-black/90"
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="cursor-pointer">
            <Logo />
          </Link>

          <nav className="hidden md:flex items-center space-x-3 lg:space-x-8">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-gray-300 hover:text-emerald-400 transition-colors duration-200 font-medium"
              >
                {item.label}
              </a>
            ))}

            {!isConnected ? (
              <ConnectWalletButton className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6" />
            ) : (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 bg-gray-800 rounded-2xl px-4 py-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-glow" />
                  <span className="text-sm text-gray-300">
                    {formatAddress(address!)}
                  </span>
                </div>
                {!isBSCNetwork && (
                  <Button
                    onClick={switchToBSC}
                    variant="outline"
                    size="sm"
                    className="text-yellow-400 border-yellow-400 hover:bg-yellow-400 hover:text-black"
                  >
                    Switch to BSC
                  </Button>
                )}
                <Link href="/dashboard">
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                    <User className="mr-2" size={16} />
                    Dashboard
                  </Button>
                </Link>
              </div>
            )}
          </nav>

          <button
            className="md:hidden text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-gray-900/95 backdrop-blur-md border-t border-gray-800">
          <div className="px-4 py-6 space-y-4">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="block text-gray-300 hover:text-emerald-400 transition-colors font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}

            {!isConnected ? (
              <div className="w-full">
                <ConnectWalletButton className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold" />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center space-x-2 bg-gray-800 rounded-2xl px-4 py-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-glow" />
                  <span className="text-sm text-gray-300">
                    {formatAddress(address!)}
                  </span>
                </div>
                {!isBSCNetwork && (
                  <Button
                    onClick={switchToBSC}
                    variant="outline"
                    size="sm"
                    className="w-full text-yellow-400 border-yellow-400 hover:bg-yellow-400 hover:text-black"
                  >
                    Switch to BSC
                  </Button>
                )}
                <Link href="/dashboard">
                  <Button
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User className="mr-2" size={16} />
                    Dashboard
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
