"use client";

import React, { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Header from "@/components/layout/Header";
import UnifiedIrisHero from "@/components/iris/UnifiedIrisHero";
import ArtOfIris from "@/components/home/ArtOfIris";
import ProductTransformation from "@/components/home/ProductTransformation";
import ExperienceSection from "@/components/home/ExperienceSection";
import BookingInvitation from "@/components/home/BookingInvitation";
import Footer from "@/components/layout/Footer";
import MotionDebugPanel from "@/components/home/MotionDebugPanel";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
  (window as any).ScrollTrigger = ScrollTrigger;
}

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
    <main className="relative bg-[#090909] text-[#FAFAF8] w-full selection:bg-neutral-800 selection:text-white">
      {/* ─── Global Atelier Adaptive Header ─── */}
      <Header onReplayIntro={handleReplayIntro} />

      {/* ─── 01: CINEMATIC DISCOVERY (Unified WebGL Macro & Stroma Travel) ─── */}
      <UnifiedIrisHero />

      {/* ─── 02: THE ART OF IRIS (Curated Museum Compositions: Solo / Couple / Family) ─── */}
      <ArtOfIris />

      {/* ─── 03: THE COLLECTION (Continuous Product Train on Warm Neutral Surfaces) ─── */}
      <ProductTransformation />

      {/* ─── 04: THE EXPERIENCE (Bespoke Atelier Process: Capture • Create • Keep) ─── */}
      <ExperienceSection />

      {/* ─── 05: YOUR TURN (Striking Near-Black Atelier Appointment Invitation) ─── */}
      <BookingInvitation />

      {/* ─── 06: MINIMAL FOOTER (Warm Ivory Art Publication Index & Wordmark) ─── */}
      <Footer />

      {/* ─── Motion Architecture Telemetry HUD (?motionDebug=1) ─── */}
      <MotionDebugPanel />
    </main>
  );
}
