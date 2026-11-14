"use client";

import React, { useRef } from "react";
import dynamic from "next/dynamic";
import HeroUI from "@/components/iris/HeroUI";
import EditorialSection from "@/components/iris/EditorialSection";
import Header from "@/components/iris/Header";
import { ArrowUpRight, ShieldCheck, Sparkles, Sliders } from "lucide-react";

const IrisScene = dynamic(() => import("@/components/iris/IrisScene"), {
  ssr: false,
});

const IrisLayersSection = dynamic(() => import("@/components/iris/IrisLayersSection"), {
  ssr: false,
});

export default function HomePage() {
  const scrollTrackRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const heroScrollRef = useRef<HTMLDivElement>(null);
  const nextSectionRef = useRef<HTMLDivElement>(null);
  const captionRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = "manual";
      }
      window.scrollTo(0, 0);
    }
  }, []);

  const handleReplayIntro = () => {
    if (typeof window !== "undefined" && (window as any).__irisReplayIntro) {
      (window as any).__irisReplayIntro();
    }
  };

  const handleDiscoverClick = () => {
    if (typeof window !== "undefined" && (window as any).__irisScrollToProgress) {
      (window as any).__irisScrollToProgress(0.70);
    }
  };

  return (
    <main className="relative bg-[#030304] text-[#f0f0f2] w-full selection:bg-[#7ec8e3]/30 selection:text-white">
      {/* ─── Persistent Shared WebGL Stage & Scroll Track (Pinned for 220vh) ─── */}
      <div
        ref={scrollTrackRef}
        id="explore"
        className="relative w-full h-screen overflow-hidden bg-[#030304]"
      >
        {/* Background WebGL Iris Canvas (Permanent Stage) */}
        <IrisScene
          scrollTrackRef={scrollTrackRef}
          heroRef={heroRef}
          heroScrollRef={heroScrollRef}
          nextSectionRef={nextSectionRef}
          captionRef={captionRef}
          className="absolute inset-0 z-0"
        />

        {/* Top Brand Navigation Header */}
        <Header onReplayIntro={handleReplayIntro} />

        {/* Layer 1: Hero Editorial Typography (Phase A: 0% – 20% scroll) */}
        {/* heroRef is the entrance container (owned by introTimeline) */}
        {/* heroScrollRef is the scroll container (owned by scrollTimeline, fully reversible) */}
        <div
          ref={heroRef}
          className="pointer-events-none absolute inset-0 z-10 opacity-0"
        >
          <div ref={heroScrollRef} className="w-full h-full pointer-events-none">
            <HeroUI onDiscoverClick={handleDiscoverClick} />
          </div>
        </div>

        {/* Layer 2: Phase B Macro Exploration Floating Caption (20% – 55% scroll) */}
        <div
          ref={captionRef}
          className="pointer-events-none absolute bottom-10 inset-x-0 z-10 flex justify-center text-center px-4 opacity-0"
        >
          <div className="inline-flex items-center gap-2.5 px-4 py-2 border border-[#2a2a35]/60 bg-[#07070a]/80 backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7ec8e3] animate-ping" />
            <span className="text-[10px] font-mono tracking-[0.30em] uppercase text-[#7ec8e3]">
              0.01MM MACRO RESOLUTION • LIVING STROMA FIBRES
            </span>
          </div>
        </div>

        {/* Layer 3: Next Section — The Biometric Masterpiece (Phase C & D: 55% – 100% scroll) */}
        {/* The iris rotates & shifts right; this content reveals on the left side! */}
        <div
          ref={nextSectionRef}
          id="artistry"
          className="pointer-events-none absolute inset-0 z-10 opacity-0"
        >
          <EditorialSection />
        </div>
      </div>

      {/* ─── Cinematic Layer Exploration (Pure Visual Spatial Journey) ─── */}
      <IrisLayersSection />

      {/* ─── Subsequent Section: Collection & Archival Standards (Post-320vh) ─── */}
      <section
        id="collection"
        className="relative z-20 bg-[#040406] border-t border-[#181824] py-24 sm:py-32 px-6 sm:px-10 md:px-16 lg:px-24"
      >
        <div className="max-w-6xl mx-auto flex flex-col gap-16">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#1b1b26] pb-10">
            <div className="flex flex-col gap-3">
              <span className="text-[11px] font-mono tracking-[0.28em] uppercase text-[#7ec8e3]">
                02 / ARCHIVAL CRAFTSMANSHIP
              </span>
              <h3 className="font-display text-3xl sm:text-4xl md:text-5xl font-light tracking-[-0.03em] uppercase text-[#f7f7fa]">
                FROM BIOMETRIC CODE
                <br />
                TO GALLERY CANVAS.
              </h3>
            </div>
            <p className="max-w-md font-sans text-xs sm:text-sm tracking-[0.03em] text-[#8e8e9c] leading-relaxed">
              Every iris portrait is custom-printed using Swiss museum-grade Diasec®
              lamination, preserving microscopic filament clarity for over 100 years.
            </p>
          </div>

          {/* 3 Pillars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col gap-4 p-8 border border-[#1a1a26] bg-[#08080c]/60 backdrop-blur-sm">
              <Sliders className="w-6 h-6 text-[#7ec8e3]" />
              <h4 className="font-display text-xl font-normal tracking-wide text-white uppercase">
                CALIBRATED ILLUMINATION
              </h4>
              <p className="font-sans text-xs tracking-wide text-[#808092] leading-relaxed">
                Diffused ring strobes illuminate the deep collagen arches without
                pupillary constriction, revealing hidden amber and teal gradations.
              </p>
            </div>

            <div className="flex flex-col gap-4 p-8 border border-[#1a1a26] bg-[#08080c]/60 backdrop-blur-sm">
              <Sparkles className="w-6 h-6 text-[#e09848]" />
              <h4 className="font-display text-xl font-normal tracking-wide text-white uppercase">
                OPTICAL POLARISATION
              </h4>
              <p className="font-sans text-xs tracking-wide text-[#808092] leading-relaxed">
                Cross-polarised cross-beam optics neutralize corneal reflections,
                surfacing the true three-dimensional depth of the iris stroma.
              </p>
            </div>

            <div className="flex flex-col gap-4 p-8 border border-[#1a1a26] bg-[#08080c]/60 backdrop-blur-sm">
              <ShieldCheck className="w-6 h-6 text-[#7ec8e3]" />
              <h4 className="font-display text-xl font-normal tracking-wide text-white uppercase">
                CERTIFIED PROVENANCE
              </h4>
              <p className="font-sans text-xs tracking-wide text-[#808092] leading-relaxed">
                Each bespoke piece receives a tamper-proof cryptographic certificate
                recording biometric coordinates and individual specimen serials.
              </p>
            </div>
          </div>

          {/* Footer Callout */}
          <div
            id="inquire"
            className="flex flex-col sm:flex-row items-center justify-between gap-6 p-8 sm:p-12 border border-[#262638] bg-gradient-to-r from-[#0a0a12] via-[#0d0d18] to-[#0a0a12]"
          >
            <div className="flex flex-col gap-2 text-center sm:text-left">
              <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-[#7ec8e3]">
                PRIVATE APPOINTMENTS
              </span>
              <h4 className="font-display text-2xl sm:text-3xl font-light tracking-tight text-white uppercase">
                READY TO REVEAL YOUR IRIS?
              </h4>
            </div>

            <a
              href="#inquire"
              className="group inline-flex items-center gap-3 px-8 py-4 border border-[#7ec8e3] bg-[#7ec8e3] hover:bg-[#68bcdb] text-xs font-sans tracking-[0.22em] uppercase font-semibold text-[#030304] transition-all duration-300"
            >
              <span>BOOK A SESSION</span>
              <ArrowUpRight className="w-4 h-4 text-[#030304] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </div>

          {/* Minimal Legal Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-10 border-t border-[#14141e] text-[10px] font-mono tracking-[0.20em] uppercase text-[#555566]">
            <span>© 2026 IRIS STUDIO • ALL RIGHTS RESERVED</span>
            <div className="flex items-center gap-6">
              <a href="#privacy" className="hover:text-white transition-colors">
                PRIVACY
              </a>
              <a href="#terms" className="hover:text-white transition-colors">
                TERMS
              </a>
              <a href="#press" className="hover:text-white transition-colors">
                PRESS
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
