"use client";

import React from "react";
import { ArrowUpRight, Sparkles, Shield, Eye } from "lucide-react";

export default function EditorialSection() {
  return (
    <div className="w-full h-full flex items-center justify-start p-6 sm:p-10 md:px-14 lg:px-20 text-[#f0f0f2] select-none">
      <div className="w-full lg:w-[48%] max-w-xl flex flex-col justify-center gap-6 md:gap-7 pointer-events-auto">
        {/* Kicker Badge */}
        <div className="flex items-center gap-3">
          <span className="w-8 h-[1px] bg-[#7ec8e3]" />
          <span className="text-[11px] font-mono tracking-[0.28em] uppercase text-[#7ec8e3]">
            01 / THE LIVING MASTERPIECE
          </span>
        </div>

        {/* Main Editorial Headline */}
        <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-[3.75rem] font-light tracking-[-0.035em] leading-[0.94] uppercase text-[#f7f7fa]">
          NO TWO EYES
          <br />
          ARE EVER THE SAME.
        </h2>

        {/* Narrative Prose */}
        <p className="font-sans text-xs sm:text-sm tracking-[0.035em] text-[#9a9aa8] leading-relaxed">
          Your iris contains more than 250 distinct biometric features—intricate
          branching collagen trabeculae, deep amber crypts, and light-refracting
          stroma filaments. We capture your living architecture in medium-format
          optical fidelity, transforming individuality into gallery-scale fine art.
        </p>

        {/* Spec Pillars */}
        <div className="grid grid-cols-3 gap-3 sm:gap-5 pt-5 border-t border-[#1c1c28]">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 text-[#7ec8e3]">
              <Eye className="w-3.5 h-3.5" />
              <span className="font-mono text-xs sm:text-sm font-semibold tracking-wider text-white">
                400MP
              </span>
            </div>
            <span className="text-[9px] sm:text-[10px] tracking-[0.18em] uppercase text-[#737380] leading-tight">
              OPTICAL STROMA RESOLUTION
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 text-[#e09848]">
              <Shield className="w-3.5 h-3.5" />
              <span className="font-mono text-xs sm:text-sm font-semibold tracking-wider text-white">
                100%
              </span>
            </div>
            <span className="text-[9px] sm:text-[10px] tracking-[0.18em] uppercase text-[#737380] leading-tight">
              INDIVIDUAL BIOMETRIC SIGNATURE
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 text-[#7ec8e3]">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="font-mono text-xs sm:text-sm font-semibold tracking-wider text-white">
                DIASEC®
              </span>
            </div>
            <span className="text-[9px] sm:text-[10px] tracking-[0.18em] uppercase text-[#737380] leading-tight">
              MUSEUM ACRYLIC ARCHIVAL
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-4 pt-2">
          <a
            href="#inquire"
            className="group inline-flex items-center gap-3 px-6 py-3.5 border border-[#7ec8e3]/80 bg-[#7ec8e3]/10 hover:bg-[#7ec8e3]/20 backdrop-blur-md text-xs sm:text-sm font-sans tracking-[0.20em] uppercase transition-all duration-300 text-white"
          >
            <span>COMMISSION AN IRIS</span>
            <ArrowUpRight className="w-4 h-4 text-[#7ec8e3] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>

          <a
            href="#collection"
            className="inline-flex items-center gap-2 px-5 py-3.5 border border-[#2a2a35] hover:border-[#737380] text-xs sm:text-sm font-sans tracking-[0.20em] uppercase text-[#a0a0b0] hover:text-white transition-colors duration-300"
          >
            <span>VIEW SPECIMENS</span>
          </a>
        </div>
      </div>
    </div>
  );
}
