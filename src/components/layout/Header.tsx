"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, ShoppingBag } from "lucide-react";
import MenuOverlay from "./MenuOverlay";
import { useCart } from "@/lib/cart";

interface HeaderProps {
  onReplayIntro?: () => void;
}

export default function Header({ onReplayIntro }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHeroInView, setIsHeroInView] = useState(true);
  const { totalCount, setIsCartOpen } = useCart();

  React.useEffect(() => {
    const handleScroll = () => {
      setIsHeroInView(window.scrollY < 450);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between p-6 sm:p-8 md:px-12 md:py-6 pointer-events-none transition-all duration-300">
        {/* Brand Mark (Top Left) */}
        <div className="pointer-events-auto">
          <Link
            href="/"
            className="group flex items-center gap-2 select-none"
            title="IRIS — Home"
          >
            <span className="font-display font-medium text-xl sm:text-2xl tracking-[0.34em] text-[#f5f5f7] uppercase transition-colors duration-300 group-hover:text-[#7ec8e3]">
              IRIS<sup className="text-xs ml-0.5 tracking-normal opacity-70">®</sup>
            </span>
          </Link>
        </div>

        {/* Top Right: Cart, MENU, BOOK */}
        <div className="pointer-events-auto flex items-center gap-3 sm:gap-4">
          {/* Cart Icon (if items exist) */}
          {totalCount > 0 && (
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-[#b0b0c0] hover:text-white transition-colors"
              aria-label={`Cart with ${totalCount} items`}
            >
              <ShoppingBag className="w-4 h-4 text-[#7ec8e3]" />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#7ec8e3] text-[#030304] text-[9px] font-mono font-bold flex items-center justify-center">
                {totalCount}
              </span>
            </button>
          )}

          {/* Discreet Replay button restricted strictly to hero viewport */}
          {onReplayIntro && isHeroInView && (
            <button
              onClick={onReplayIntro}
              className="hidden lg:inline-block text-[10px] font-mono tracking-[0.20em] uppercase text-[#606072] hover:text-[#7ec8e3] transition-colors duration-200 px-2 animate-fadeIn"
              title="Replay Cinematic Opening"
            >
              REPLAY [R]
            </button>
          )}

          {/* MENU Button */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className="px-3.5 py-2 sm:px-4 sm:py-2 border border-[#262634] hover:border-[#7ec8e3]/60 bg-[#07070b]/80 backdrop-blur-md text-[10px] sm:text-[11px] font-mono tracking-[0.24em] uppercase text-[#cfcfd8] hover:text-white transition-all duration-300"
          >
            MENU
          </button>

          {/* BOOK Button */}
          <Link
            href="/book"
            className="inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2 border border-[#7ec8e3]/80 bg-[#7ec8e3]/10 hover:bg-[#7ec8e3]/20 backdrop-blur-md text-[10px] sm:text-[11px] font-sans tracking-[0.22em] uppercase font-semibold text-white transition-all duration-300"
          >
            <span>BOOK</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#7ec8e3]" />
          </Link>
        </div>
      </header>

      {/* Fullscreen Navigation Modal */}
      <MenuOverlay isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  );
}
