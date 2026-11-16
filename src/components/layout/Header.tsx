"use client";

import React, { useState, useEffect } from "react";
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
  const [isLightSection, setIsLightSection] = useState(false);
  const { totalCount, setIsCartOpen } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setIsHeroInView(window.scrollY < 450);

      // Check whether current top of viewport is over a light section
      const el = document.elementFromPoint(window.innerWidth / 2, 50);
      const lightParent = el?.closest('[data-theme="light"]');
      setIsLightSection(!!lightParent);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between p-6 sm:p-8 md:px-12 md:py-6 pointer-events-none transition-colors duration-300">
        {/* Brand Mark (Top Left) */}
        <div className="pointer-events-auto">
          <Link
            href="/"
            className="group flex items-center gap-2 select-none"
            title="IRIS — Home"
          >
            <span
              className={`font-display font-bold text-xl sm:text-2xl tracking-[0.24em] uppercase transition-colors duration-300 ${
                isLightSection
                  ? "text-[#090909] group-hover:text-black"
                  : "text-[#FAFAF8] group-hover:text-white"
              }`}
            >
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
              className={`relative p-2 transition-colors ${
                isLightSection ? "text-[#080808]" : "text-white"
              }`}
              aria-label={`Cart with ${totalCount} items`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span
                className={`absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-mono font-bold flex items-center justify-center ${
                  isLightSection ? "bg-[#090909] text-white" : "bg-white text-black"
                }`}
              >
                {totalCount}
              </span>
            </button>
          )}

          {/* Discreet Replay button restricted strictly to hero viewport */}
          {onReplayIntro && isHeroInView && (
            <button
              onClick={onReplayIntro}
              className="hidden lg:inline-block text-[10px] font-mono tracking-[0.20em] uppercase text-white/40 hover:text-white transition-colors duration-200 px-2 animate-fadeIn"
              title="Replay Cinematic Opening"
            >
              REPLAY [R]
            </button>
          )}

          {/* MENU Button */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className={`px-3.5 py-2 sm:px-4 sm:py-2 border text-[10px] sm:text-[11px] font-mono tracking-[0.24em] uppercase transition-all duration-300 cursor-pointer backdrop-blur-md ${
              isLightSection
                ? "border-[#090909]/20 hover:border-[#090909] bg-[#F4F1EA]/80 text-[#090909] hover:text-black"
                : "border-white/20 hover:border-white bg-black/80 text-[#cfcfd8] hover:text-white"
            }`}
          >
            MENU
          </button>

          {/* BOOK Button (Confidently rectangular, high contrast) */}
          <Link
            href="/book"
            className={`inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2 text-[10px] sm:text-[11px] font-sans tracking-[0.22em] uppercase font-bold transition-all duration-300 ${
              isLightSection
                ? "bg-[#090909] text-[#FAFAF8] hover:bg-neutral-800"
                : "bg-[#FAFAF8] text-[#090909] hover:bg-neutral-200"
            }`}
          >
            <span>BOOK</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Fullscreen Navigation Modal */}
      <MenuOverlay isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  );
}
