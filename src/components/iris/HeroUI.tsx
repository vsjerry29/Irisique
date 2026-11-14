"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

interface HeroUIProps {
  onDiscoverClick?: () => void;
}

export default function HeroUI({ onDiscoverClick }: HeroUIProps) {
  return (
    <div className="w-full h-full flex flex-col justify-end p-6 sm:p-10 md:p-14 lg:p-18 text-[#f0f0f2] select-none">
      {/* Bottom Main Hero Block — Extremely Clean, Artwork Dominates */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 w-full mb-6 pointer-events-auto">
        {/* Left Column: Headline & Primary CTA */}
        <div className="flex flex-col gap-5">
          <h1 className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-[7rem] font-light tracking-[-0.04em] leading-[0.88] uppercase text-[#f7f7fa]">
            LOOK
            <br />
            CLOSER.
          </h1>

          <div className="flex items-center gap-4 pt-1">
            <Link
              href="/book"
              className="group inline-flex items-center gap-3 px-6 py-3.5 border border-[#7ec8e3] bg-[#7ec8e3] hover:bg-[#68bcdb] text-xs font-sans tracking-[0.22em] uppercase font-semibold text-[#030304] transition-all duration-300"
            >
              <span>BOOK YOUR IRIS</span>
              <ArrowUpRight className="w-4 h-4 text-[#030304] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
        </div>

        {/* Right Column: Micro-label */}
        <div className="flex items-center gap-2 text-[10px] sm:text-[11px] tracking-[0.26em] uppercase text-[#737382] font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-[#7ec8e3] animate-pulse" />
          <span>SCROLL TO EXPLORE</span>
        </div>
      </div>
    </div>
  );
}
