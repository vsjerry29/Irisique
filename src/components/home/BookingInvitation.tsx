"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { ArrowUpRight, X, Calendar, MapPin } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SITE_CONFIG } from "@/lib/config";
import OpticalTrace from "@/components/ui/OpticalTrace";

export default function BookingInvitation() {
  const [isPopupModalOpen, setIsPopupModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const sectionRef = useRef<HTMLElement>(null);
  const surfaceRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when Pop-up modal is open
  useEffect(() => {
    if (isPopupModalOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isPopupModalOpen]);

  // ESC key handler
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isPopupModalOpen) {
        setIsPopupModalOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isPopupModalOpen]);

  // ─── Two Halves Inspired Black/Cream Surface Transformation (4–5s moment) ───
  useEffect(() => {
    if (typeof window === "undefined" || !sectionRef.current || !surfaceRef.current) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Controlled surface mask wiping from bottom across the viewport
      gsap.fromTo(
        surfaceRef.current,
        {
          clipPath: "polygon(0% 12vw, 100% 0%, 100% 100%, 0% 100%)",
          y: 60,
        },
        {
          clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
          y: 0,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "top 25%",
            scrub: 0.5,
            refreshPriority: 2,
          },
        }
      );

      // Subtle parallax rise on the massive typography
      if (contentRef.current) {
        gsap.fromTo(
          contentRef.current,
          { y: 40, opacity: 0.8 },
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

          {/* Optical Trace Motif on Dark Surface */}
          <div className="absolute -bottom-8 right-0 w-80 h-20 opacity-30 hidden md:block">
            <OpticalTrace theme="dark" variant="booking" />
          </div>
        </div>

        {/* Center Main Conversion Hero Typography (Two Halves Boldness) */}
        <div
          ref={contentRef}
          className="max-w-7xl mx-auto w-full my-auto py-16 sm:py-24 flex flex-col items-start gap-8 will-change-transform"
        >
          <h2 className="font-display text-6xl sm:text-8xl md:text-9xl lg:text-[11rem] font-bold tracking-[-0.04em] uppercase text-white leading-[0.84]">
            YOUR TURN.
          </h2>

          <p className="max-w-md font-sans text-sm sm:text-base text-[#D8D4CC] leading-relaxed">
            Reserve an intimate macro scan at our White Town studio or request access to our next travelling pop-up salon. Every piece is strictly unique to your stroma.
          </p>

          {/* Primary Action Button & Secondary Text Link */}
          <div className="flex flex-wrap items-center gap-8 pt-4">
            <Link
              href="/book"
              className="group inline-flex items-center gap-3 px-8 py-4 bg-[#FAFAF8] text-[#090909] text-xs font-sans font-bold tracking-[0.22em] uppercase hover:bg-neutral-200 transition-all duration-300"
            >
              <span>BOOK YOUR IRIS</span>
              <ArrowUpRight className="w-4 h-4 text-[#090909] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>

            <button
              onClick={() => setIsPopupModalOpen(true)}
              className="group inline-flex items-center gap-2 text-xs font-sans tracking-[0.18em] uppercase text-white font-bold hover:opacity-75 transition-opacity cursor-pointer"
            >
              <span>FIND THE NEXT POP-UP</span>
              <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
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

      {/* ─── Pop-Up Schedule Enquiry Modal (Portal Mounted) ─── */}
      {isPopupModalOpen && mounted && typeof document !== "undefined" &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Upcoming Travelling Pop-up Locations"
            className="fixed inset-0 z-[99999] flex items-center justify-center bg-[#090909]/95 backdrop-blur-xl text-white p-6 sm:p-10 select-none animate-fadeIn"
            onClick={() => setIsPopupModalOpen(false)}
          >
            <div
              className="relative max-w-lg w-full bg-[#141414] border border-white/15 p-8 sm:p-12 space-y-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-white/15 pb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-white/70" />
                  <span className="text-xs font-mono uppercase tracking-[0.24em] text-white/70">
                    TRAVELLING ATELIER
                  </span>
                </div>
                <button
                  onClick={() => setIsPopupModalOpen(false)}
                  className="p-1 text-white/60 hover:text-white transition-colors cursor-pointer"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div>
                <h3 className="font-display text-3xl font-bold uppercase tracking-tight">
                  NEXT POP-UP SALONS
                </h3>
                <p className="font-sans text-xs text-[#D8D4CC] mt-2 leading-relaxed">
                  Our mobile high-resolution biometric camera travels seasonally to selected gallery spaces across India.
                </p>
              </div>

              <div className="space-y-4 font-mono text-xs">
                <div className="p-4 bg-white/5 border border-white/10 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-white block">MUMBAI • KALA GHODA</span>
                    <span className="text-white/50 text-[11px]">DECEMBER 2026</span>
                  </div>
                  <span className="text-[10px] uppercase px-2 py-1 bg-white/10 text-white">WAITLIST OPEN</span>
                </div>

                <div className="p-4 bg-white/5 border border-white/10 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-white block">BENGALURU • INDIRANAGAR</span>
                    <span className="text-white/50 text-[11px]">JANUARY 2027</span>
                  </div>
                  <span className="text-[10px] uppercase px-2 py-1 bg-white/10 text-white">WAITLIST OPEN</span>
                </div>

                <div className="p-4 bg-white/5 border border-white/10 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-white block">NEW DELHI • MEHRAULI</span>
                    <span className="text-white/50 text-[11px]">FEBRUARY 2027</span>
                  </div>
                  <span className="text-[10px] uppercase px-2 py-1 bg-white/10 text-white">ANNOUNCING SOON</span>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href={`https://wa.me/${SITE_CONFIG.whatsapp.cleanNumber}?text=Hello%20Iris%20Atelier,%20I%20would%20like%20to%20join%20the%20waitlist%20for%20the%20next%20travelling%20pop-up.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 text-xs font-sans tracking-[0.20em] uppercase font-bold bg-white text-black hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2 text-center"
                >
                  <span>JOIN POP-UP WAITLIST (WHATSAPP)</span>
                  <ArrowUpRight className="w-4 h-4 text-black" />
                </a>
              </div>
            </div>
          </div>,
          document.body
        )}
    </section>
  );
}
