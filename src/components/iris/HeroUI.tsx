"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

interface HeroUIProps {
  onDiscoverClick?: () => void;
}

export default function HeroUI({ onDiscoverClick }: HeroUIProps) {
  return (
    <div className="w-full h-full flex flex-col justify-end p-8 sm:p-12 md:p-16 lg:p-20 text-white select-none">
      {/* Bottom Main Hero Block — Exact Canonical Editorial Framing matching user reference */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 w-full mb-4 sm:mb-6 pointer-events-auto">
        {/* Left Column: Headline & Primary CTA */}
        <div className="max-w-xl flex flex-col gap-6">
          <h1 className="font-display text-6xl sm:text-7xl md:text-8xl lg:text-[7.5rem] font-bold tracking-[-0.04em] leading-[0.88] uppercase text-white">
            LOOK
            <br />
            CLOSER.
          </h1>

          <div className="flex items-center gap-4 pt-1">
            <Link
              href="/book"
              className="group inline-flex items-center gap-3 px-7 py-3.5 bg-white hover:bg-neutral-200 text-xs font-sans tracking-[0.22em] uppercase font-bold text-black transition-all duration-300 shadow-[0_4px_24px_rgba(255,255,255,0.15)]"
            >
              <span>BOOK YOUR IRIS</span>
              <ArrowUpRight className="w-4 h-4 text-black transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
