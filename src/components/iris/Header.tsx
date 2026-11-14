"use client";

import React from "react";
import { ArrowUpRight } from "lucide-react";

interface HeaderProps {
  onReplayIntro?: () => void;
}

export default function Header({ onReplayIntro }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between p-6 sm:p-8 md:px-12 md:py-6 pointer-events-none transition-all duration-300">
      {/* Brand Mark */}
      <div className="pointer-events-auto">
        <a
          href="/"
          className="group flex items-center gap-2 select-none"
          title="IRIS — Home"
        >
          <span className="font-display font-medium text-xl sm:text-2xl tracking-[0.34em] text-[#f5f5f7] uppercase transition-colors duration-300 group-hover:text-[#7ec8e3]">
            IRIS<sup className="text-xs ml-0.5 tracking-normal opacity-70">®</sup>
          </span>
        </a>
      </div>

      {/* Center Nav Links */}
      <nav className="hidden md:flex items-center gap-8 pointer-events-auto">
        <a
          href="#artistry"
          className="text-[11px] font-sans tracking-[0.24em] uppercase text-[#9e9eb0] hover:text-white transition-colors duration-200"
        >
          THE ARTISTRY
        </a>
        <a
          href="#collection"
          className="text-[11px] font-sans tracking-[0.24em] uppercase text-[#9e9eb0] hover:text-white transition-colors duration-200"
        >
          COLLECTION
        </a>
        <a
          href="#process"
          className="text-[11px] font-sans tracking-[0.24em] uppercase text-[#9e9eb0] hover:text-white transition-colors duration-200"
        >
          PROCESS
        </a>
        {onReplayIntro && (
          <button
            onClick={onReplayIntro}
            className="text-[10px] font-mono tracking-[0.20em] uppercase text-[#606072] hover:text-[#7ec8e3] transition-colors duration-200"
            title="Replay Cinematic Opening"
          >
            REPLAY [R]
          </button>
        )}
      </nav>

      {/* Right Action */}
      <div className="pointer-events-auto flex items-center gap-3">
        <a
          href="#inquire"
          className="inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 border border-[#2a2a38] hover:border-[#7ec8e3]/70 bg-[#0a0a0f]/80 backdrop-blur-md text-[10px] sm:text-[11px] font-sans tracking-[0.22em] uppercase text-[#ededf0] hover:text-white transition-all duration-300"
        >
          <span>INQUIRE</span>
          <ArrowUpRight className="w-3.5 h-3.5 text-[#7ec8e3]" />
        </a>
      </div>
    </header>
  );
}
