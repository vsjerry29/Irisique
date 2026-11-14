"use client";

import React, { useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Header from "@/components/layout/Header";
import IrisGallery from "@/components/home/IrisGallery";
import CoupleExperience from "@/components/home/CoupleExperience";
import ProductTransformation from "@/components/home/ProductTransformation";
import BookingInvitation from "@/components/home/BookingInvitation";
import MotionDebugPanel from "@/components/home/MotionDebugPanel";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
  (window as any).ScrollTrigger = ScrollTrigger;
}

// Unified WebGL continuous cinematic experience dynamically loaded with SSR disabled
const UnifiedIrisHero = dynamic(() => import("@/components/iris/UnifiedIrisHero"), {
  ssr: false,
});

export default function HomePage() {

  useEffect(() => {
    if (typeof window !== "undefined") {
      if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = "manual";
      }
      window.scrollTo(0, 0);

      // Master coordination: sort triggers in DOM order and refresh layout metrics
      const refreshAll = () => {
        ScrollTrigger.sort();
        ScrollTrigger.refresh();
      };

      // Call immediately and after dynamic WebGL components settle
      refreshAll();
      const t1 = setTimeout(refreshAll, 150);
      const t2 = setTimeout(refreshAll, 600);
      const t3 = setTimeout(refreshAll, 1400);

      window.addEventListener("resize", refreshAll);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
        window.removeEventListener("resize", refreshAll);
      };
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

      {/* ─── EXPERIENCE 01: Unified Iris Universe (Continuous Cinematic Macro-to-Layer WebGL Journey) ─── */}
      <UnifiedIrisHero />

      {/* ─── EXPERIENCE 02: Interactive Iris Gallery (Curated Exhibition) ─── */}
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
