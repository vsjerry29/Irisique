"use client";

import React, { useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import Header from "@/components/layout/Header";
import HeroUI from "@/components/iris/HeroUI";
import IrisGallery from "@/components/home/IrisGallery";
import CoupleExperience from "@/components/home/CoupleExperience";
import ProductTransformation from "@/components/home/ProductTransformation";
import BookingInvitation from "@/components/home/BookingInvitation";
import MotionDebugPanel from "@/components/home/MotionDebugPanel";

// WebGL components dynamically loaded with SSR disabled
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

  useEffect(() => {
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

  return (
    <main className="relative bg-[#030405] text-[#f0f0f2] w-full selection:bg-[#7ec8e3]/30 selection:text-white">
      {/* ─── Global atelier navigation header ─── */}
      <Header onReplayIntro={handleReplayIntro} />

      {/* ─── EXPERIENCE 01: Cinematic Macro Iris Hero (Pinned 220vh) ─── */}
      <div
        ref={scrollTrackRef}
        id="explore"
        className="relative w-full h-screen overflow-hidden bg-[#030405]"
      >
        {/* Background WebGL Iris Canvas (Permanent Stage) */}
        <IrisScene
          scrollTrackRef={scrollTrackRef}
          heroRef={heroRef}
          heroScrollRef={heroScrollRef}
          className="absolute inset-0 z-0"
        />

        {/* Hero Editorial Typography (Phase A: 0% – 20% scroll, fully reversible) */}
        <div
          ref={heroRef}
          className="pointer-events-none absolute inset-0 z-10 opacity-0"
        >
          <div ref={heroScrollRef} className="w-full h-full pointer-events-none">
            <HeroUI />
          </div>
        </div>
      </div>

      {/* ─── EXPERIENCE 02: Iris Universe — Layer Exploration (Zero Text Spatial Journey) ─── */}
      <IrisLayersSection />

      {/* ─── EXPERIENCE 03: Interactive Iris Gallery (Curated Exhibition) ─── */}
      <IrisGallery />

      {/* ─── EXPERIENCE 04: Couple Composition (Two Become One) ─── */}
      <CoupleExperience />

      {/* ─── EXPERIENCE 05: Artwork Transformation (Made to be Kept) ─── */}
      <ProductTransformation />

      {/* ─── EXPERIENCE 06: The Final Invitation & Atelier Footer (Your Turn) ─── */}
      <BookingInvitation />

      {/* ─── Motion Architecture Telemetry HUD (?motionDebug=1) ─── */}
      <MotionDebugPanel />
    </main>
  );
}
