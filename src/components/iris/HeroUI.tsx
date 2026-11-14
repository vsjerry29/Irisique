"use client";

import React from "react";
import { ArrowUpRight } from "lucide-react";

interface HeroUIProps {
  onDiscoverClick?: () => void;
}

export default function HeroUI({ onDiscoverClick }: HeroUIProps) {
  return (
    <div className="w-full h-full flex flex-col justify-between p-6 sm:p-10 md:p-14 lg:p-18 text-[#f0f0f2] select-none">
      {/* Top Meta Header */}
      <div className="flex items-center justify-between w-full pt-16 sm:pt-14 md:pt-12">
        <div className="flex items-center gap-4 text-[10px] tracking-[0.25em] uppercase text-[#7a7a88] font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-[#7ec8e3]/90 animate-pulse" />
          <span>4K RESOLUTION • THE LIVING IRIS</span>
        </div>

        <div className="hidden md:flex items-center gap-4 text-[10px] tracking-[0.25em] uppercase text-[#7a7a88] font-mono">
          <span>MACRO WebGL EXPERIENCE</span>
          <span className="w-1 h-1 rounded-full bg-[#3e3e4c]" />
          <span>SCROLL TO ENGAGE</span>
        </div>
      </div>

      {/* Bottom Main Hero Block */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 md:gap-12 w-full mb-4">
        {/* Left Column: Headline & Minimal CTA */}
        <div className="max-w-xl flex flex-col gap-5 pointer-events-auto">
          <h1 className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-[6.5rem] font-light tracking-[-0.04em] leading-[0.88] uppercase text-[#f7f7fa]">
            LOOK
            <br />
            CLOSER.
          </h1>

          <p className="max-w-md font-sans text-xs sm:text-sm tracking-[0.05em] text-[#8e8e9c] leading-relaxed">
            Personalised biometric fine art created from extreme-macro photography of your unique iris.
          </p>

          <div className="flex items-center gap-4 mt-1">
            <a
              href="#explore"
              onClick={onDiscoverClick}
              className="group inline-flex items-center gap-3 px-6 py-3.5 border border-[#2a2a35] hover:border-[#7ec8e3]/80 bg-[#0a0a0e]/80 hover:bg-[#121218] backdrop-blur-md rounded-none text-xs sm:text-sm font-sans tracking-[0.20em] uppercase transition-all duration-300 text-[#ededf0] hover:text-white"
            >
              <span>DISCOVER YOURS</span>
              <ArrowUpRight className="w-4 h-4 text-[#7ec8e3] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </div>
        </div>

        {/* Right Interaction Hint */}
        <div className="flex flex-col items-start md:items-end gap-1.5 text-[10px] sm:text-[11px] tracking-[0.25em] uppercase text-[#737380] font-sans">
          <div className="flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#7ec8e3]/90 animate-pulse" />
            <span>SCROLL TO EXPLORE ARCHITECTURE</span>
          </div>
          <span className="hidden sm:inline text-[9px] tracking-[0.18em] text-[#555562]">
            MOVE CURSOR TO PROBE FIBRES • CLICK TO ILLUMINATE
          </span>
        </div>
      </div>
    </div>
  );
}
