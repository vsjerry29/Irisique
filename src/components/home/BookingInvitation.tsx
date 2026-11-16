"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SITE_CONFIG } from "@/lib/config";

export default function BookingInvitation() {
  const sectionRef = useRef<HTMLElement>(null);
  const surfaceRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // ─── Two Halves Inspired Black/Cream Surface Transformation ───
  useEffect(() => {
    if (typeof window === "undefined" || !sectionRef.current || !surfaceRef.current) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Controlled surface mask wiping from bottom across the viewport
      gsap.fromTo(
        surfaceRef.current,
        {
          clipPath: "polygon(0% 10vw, 100% 0%, 100% 100%, 0% 100%)",
          y: 50,
        },
        {
          clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
          y: 0,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "top 25%",
            scrub: 0.6,
            refreshPriority: 3,
          },
        }
      );

      // Parallax text entrance
      if (contentRef.current) {
        gsap.fromTo(
          contentRef.current,
          {
            y: 40,
            opacity: 0.8,
          },
          {
            y: 0,
            opacity: 1,
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 75%",
              end: "top 20%",
              scrub: 0.6,
              refreshPriority: 2,
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="booking"
      data-section="booking"
      data-theme="dark"
      className="relative z-30 w-full min-h-[85vh] bg-[#D8D4CC] text-[#FAFAF8] select-none overflow-hidden"
    >
      <div id="inquire" className="sr-only" />

      {/* ─── Controlled Architectural Black Surface ─── */}
      <div
        ref={surfaceRef}
        className="relative w-full min-h-[85vh] bg-[#090909] py-28 sm:py-36 md:py-44 flex flex-col justify-between px-6 sm:px-10 md:px-16 lg:px-24"
      >
        {/* Top Meta Indicator */}
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between border-b border-white/15 pb-8 relative">
          <div className="flex items-center gap-3 text-xs font-mono tracking-[0.26em] uppercase text-white/60">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span>05 / PRIVATE APPOINTMENTS</span>
          </div>
          <span className="text-xs font-mono tracking-widest uppercase text-white/50">
            PONDICHERRY, INDIA
          </span>
        </div>

        {/* Center Main Conversion Hero Typography */}
        <div
          ref={contentRef}
          className="max-w-7xl mx-auto w-full my-auto py-16 sm:py-24 flex flex-col items-start gap-8 will-change-transform"
        >
          <h2 className="font-display text-6xl sm:text-8xl md:text-9xl lg:text-[11rem] font-bold tracking-[-0.04em] uppercase text-white leading-[0.84]">
            YOUR TURN.
          </h2>

          <p className="max-w-md font-sans text-sm sm:text-base text-[#D8D4CC] leading-relaxed">
            Reserve an intimate macro scan at our White Town atelier. Every piece is strictly unique to the microscopic architecture of your stroma.
          </p>

          {/* Primary Action Button (Confident, Minimal, Zero Clutter) */}
          <div className="pt-4">
            <Link
              href="/book"
              className="group inline-flex items-center gap-3 px-10 py-5 bg-[#FAFAF8] text-[#090909] text-xs font-sans font-bold tracking-[0.24em] uppercase hover:bg-white hover:shadow-[0_0_30px_rgba(255,255,255,0.15)] transition-all duration-300"
            >
              <span>BOOK YOUR IRIS</span>
              <ArrowUpRight className="w-4 h-4 text-[#090909] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
        </div>

        {/* Bottom Studio Coordinates */}
        <div className="max-w-7xl mx-auto w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-white/15 pt-8 text-xs font-mono tracking-widest uppercase text-white/50">
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-white/70" />
            <span>WHITE TOWN, PONDICHERRY 605001</span>
          </div>
          <div>
            <span>TUESDAY – SUNDAY • 10:00 – 19:30</span>
          </div>
        </div>
      </div>
    </section>
  );
}
