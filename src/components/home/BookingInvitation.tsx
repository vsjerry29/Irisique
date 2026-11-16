"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { ArrowUpRight, X, Calendar, MapPin } from "lucide-react";
import { SITE_CONFIG } from "@/lib/config";

export default function BookingInvitation() {
  const [isPopupModalOpen, setIsPopupModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

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

  return (
    <section
      id="inquire"
      data-theme="dark"
      className="relative z-30 w-full min-h-[85vh] py-28 sm:py-36 md:py-44 flex flex-col justify-between overflow-hidden bg-[#090909] text-[#FAFAF8] px-6 sm:px-10 md:px-16 lg:px-24 select-none"
    >
      {/* Top Meta Indicator */}
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between border-b border-white/15 pb-8">
        <div className="flex items-center gap-3 text-xs font-mono tracking-[0.26em] uppercase text-white/60">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <span>05 / PRIVATE APPOINTMENTS</span>
        </div>
        <span className="text-xs font-mono tracking-widest uppercase text-white/50">
          PONDICHERRY, INDIA
        </span>
      </div>

      {/* Center Main Conversion Hero Typography (Two Halves Boldness) */}
      <div className="max-w-7xl mx-auto w-full my-auto py-16 sm:py-24 flex flex-col items-start gap-8">
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
            <span>BOOK AN EXPERIENCE</span>
            <ArrowUpRight className="w-4 h-4 text-[#090909] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>

          <button
            onClick={() => setIsPopupModalOpen(true)}
            className="group inline-flex items-center gap-2 text-xs font-sans tracking-[0.18em] uppercase text-white font-bold hover:opacity-75 transition-opacity cursor-pointer"
          >
            <span>FIND THE NEXT POP-UP</span>
            <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>
        </div>
      </div>

      {/* Bottom Sub-text line */}
      <div className="max-w-7xl mx-auto w-full pt-8 flex items-center justify-between text-xs font-mono tracking-[0.24em] uppercase text-white/40 border-t border-white/15">
        <span>PRIVATE ATELIER RESERVATIONS</span>
        <span>STUDIO ADMISSION BY BOOKING ONLY</span>
      </div>

      {/* ─── Pop-Up Location Modal (Portal Mounted) ─── */}
      {isPopupModalOpen && mounted && typeof document !== "undefined" &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Upcoming Travelling Pop-up Dates"
            className="fixed inset-0 z-[99999] flex items-center justify-center p-6 bg-black/98 backdrop-blur-2xl text-white select-none animate-fadeIn"
            onClick={() => setIsPopupModalOpen(false)}
          >
            {/* Unobstructed Fixed Close Button */}
            <button
              onClick={() => setIsPopupModalOpen(false)}
              aria-label="Close pop-up dialog"
              className="fixed right-6 sm:right-10 z-[100000] p-3 text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-none transition-all duration-200 backdrop-blur-md cursor-pointer"
              style={{ top: "max(1.5rem, env(safe-area-inset-top, 1.5rem))" }}
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Body */}
            <div
              className="relative max-w-lg w-full bg-[#090909] border border-white/15 p-8 sm:p-10 flex flex-col gap-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div>
                <span className="text-xs font-mono tracking-[0.26em] uppercase text-white/50 block mb-1">
                  POP-UP SALONS
                </span>
                <h3 className="font-display text-3xl font-bold uppercase tracking-tight text-white">
                  POP-UP SCHEDULE
                </h3>
              </div>

              <div className="space-y-4">
                <div className="p-4 border border-white/15 bg-white/5 flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs font-mono text-white">
                    <span className="flex items-center gap-1.5 font-bold">
                      <MapPin className="w-3.5 h-3.5 text-white/70" />
                      White Town Studio, Pondicherry
                    </span>
                    <span className="text-white/60">Permanent</span>
                  </div>
                  <span className="text-xs text-white/50 pl-5">
                    Open Tuesday through Sunday by appointment
                  </span>
                </div>

                <div className="p-4 border border-white/15 bg-white/5 flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs font-mono text-white">
                    <span className="flex items-center gap-1.5 font-bold">
                      <Calendar className="w-3.5 h-3.5 text-white/70" />
                      Bangalore Art Residency
                    </span>
                    <span className="text-white/60">Upcoming</span>
                  </div>
                  <span className="text-xs text-white/50 pl-5">
                    Dates announced soon • Priority waitlist open
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <Link
                  href="/book"
                  onClick={() => setIsPopupModalOpen(false)}
                  className="w-full py-4 bg-white text-black text-xs font-sans font-bold tracking-[0.22em] uppercase hover:bg-neutral-200 transition-colors text-center"
                >
                  RESERVE ATELIER SESSION →
                </Link>
              </div>
            </div>
          </div>,
          document.body
        )}
    </section>
  );
}
