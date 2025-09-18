"use client";

import { Logo } from "@/components/ui/logo";
import { Separator } from "@/components/ui/separator";
import { ExternalLink, MessageCircle, Twitter, FileText } from "lucide-react";

export function Footer() {
  const footerSections = [
    {
      title: "Resources",
      links: [
        { name: "Whitepaper", href: "https://paddock.gitbook.io/paddock-docs", icon: FileText },
        { name: "Audit Report", href: "#", icon: FileText },
        { name: "BscScan", href: "https://bscscan.com", icon: ExternalLink },
        { name: "OpenSea", href: "https://opensea.io", icon: ExternalLink },
      ],
    },
    {
      title: "Community",
      links: [
        { name: "Telegram", href: "#", icon: MessageCircle },
        { name: "Twitter", href: "#", icon: Twitter },
        { name: "Discord", href: "#", icon: MessageCircle },
        { name: "Medium", href: "#", icon: FileText },
      ],
    },
    {
      title: "Legal",
      links: [
        { name: "Terms of Use", href: "https://paddock.gitbook.io/paddock-docs/legal/terms-of-use", icon: FileText },
        { name: "Privacy Policy", href: "https://paddock.gitbook.io/paddock-docs/legal/privacy-policy", icon: FileText },
        { name: "Risk Disclosure", href: "https://paddock.gitbook.io/paddock-docs/legal/risk-disclosure", icon: FileText },
        { name: "Cookie Policy", href: "https://paddock.gitbook.io/paddock-docs/legal/cookie-policy", icon: FileText },
      ],
    },
  ];

  return (
    <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-black border-t border-gray-800">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <Logo />
            <p className="text-gray-400 text-sm leading-relaxed">
              Premium utility token for real-world luxury experiences in Dubai
              and beyond. Your key to exclusive services and rewards.
            </p>
            <div className="flex space-x-4">
              {[
                { icon: Twitter, href: "#" },
                { icon: MessageCircle, href: "#" },
                { icon: ExternalLink, href: "#" },
              ].map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="w-10 h-10 bg-gray-800 rounded-2xl flex items-center justify-center text-gray-400 hover:text-emerald-400 hover:bg-gray-700 transition-all duration-200"
                >
                  <social.icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section, index) => (
            <div key={index}>
              <h4 className="font-semibold text-white mb-4">{section.title}</h4>
              <div className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <a
                    key={linkIndex}
                    href={link.href}
                    target={link.href.startsWith('http') ? '_blank' : '_self'}
                    rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="flex items-center text-gray-400 hover:text-emerald-400 transition-colors text-sm group"
                  >
                    <link.icon
                      size={14}
                      className="mr-2 group-hover:text-emerald-400"
                    />
                    {link.name}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <Separator className="bg-gray-800 mb-8" />

        {/* Legal Disclaimer */}
        <div className="space-y-6">
          <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
            <h5 className="font-semibold text-white mb-3">⚠️ Disclaimer</h5>
            <p className="text-sm text-gray-400 leading-relaxed">
              <strong className="text-white">
                PADD-R is a utility token for loyalty and membership benefits
                only.
              </strong>{" "}
              It is not equity, income, or an investment product, and it does
              not guarantee profits or returns. Rewards may vary depending on
              ecosystem development and partnerships. This information does not
              constitute financial advice. Please conduct your own research and
              consult with licensed financial advisors before making any
              decisions. Token holders are responsible for compliance with
              applicable local regulations.
            </p>
          </div>

          <div className="text-center text-sm text-gray-500">
            <p>&copy; 2025 PADD-R Token. All rights reserved.</p>
            <p className="mt-2">
              Built with ❤️ for the luxury service ecosystem •
              <span className="text-emerald-400 ml-1">
                Powered by Binance Smart Chain
              </span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
