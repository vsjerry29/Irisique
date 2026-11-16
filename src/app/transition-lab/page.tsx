"use client";

import React, { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Header from "@/components/layout/Header";
import TransitionLabStage from "@/components/transition-lab/TransitionLabStage";
import ProductTransformation from "@/components/home/ProductTransformation";
import ExperienceSection from "@/components/home/ExperienceSection";
import BookingInvitation from "@/components/home/BookingInvitation";
import Footer from "@/components/layout/Footer";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
  (window as any).ScrollTrigger = ScrollTrigger;
}

export default function TransitionLabPage() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = "manual";
      }
      window.scrollTo(0, 0);

      const refreshAll = () => {
        ScrollTrigger.sort();
        ScrollTrigger.refresh();
      };

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

  return (
    <main className="relative bg-[#090909] text-[#FAFAF8] w-full selection:bg-neutral-800 selection:text-white">
      {/* ─── Global Adaptive Header ─── */}
      <Header />

      {/* ─── STAGE A: Unified Hero & Asymmetric Photographic Seam Transition ─── */}
      <div id="transition-lab-system" className="relative w-full overflow-visible">
        <TransitionLabStage />

        {/* ─── STAGE B: Collection (Continuous Product Train on Warm Neutral Surfaces) ─── */}
        <ProductTransformation />

        {/* ─── STAGE C: Atelier Process & Booking ─── */}
        <ExperienceSection />
        <BookingInvitation />

        {/* ─── Minimal Footer ─── */}
        <Footer />
      </div>
    </main>
  );
}
