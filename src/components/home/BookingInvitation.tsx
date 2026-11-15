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
      className="relative z-30 w-full min-h-screen py-20 sm:py-28 flex flex-col justify-between overflow-hidden bg-[#020204] text-[#f0f0f2] px-6 sm:px-10 md:px-16 lg:px-24 select-none border-t border-white/5"
    >
      {/* Top Meta Indicator */}
      <div className="relative z-10 max-w-6xl mx-auto w-full flex items-center justify-between border-b border-white/10 pb-5">
        <div className="flex items-center gap-2 text-[10px] font-mono tracking-[0.28em] uppercase text-white/50">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          <span>05 / BESPOKE APPOINTMENTS</span>
        </div>
        <span className="text-[10px] font-mono tracking-widest uppercase text-white/40">
          {SITE_CONFIG.location}
        </span>
      </div>

      {/* Center Main Conversion Hero Typography */}
      <div className="relative z-10 max-w-6xl mx-auto w-full my-auto py-16 flex flex-col items-start gap-8">
        <div className="flex flex-col gap-3">
          <h2 className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-light tracking-[-0.04em] uppercase text-white leading-[0.9]">
            YOUR TURN.
          </h2>
        </div>

        <p className="max-w-lg font-sans text-xs sm:text-sm text-white/60 leading-relaxed">
          Book an intimate macro session at our Pondicherry atelier or enquire about
          upcoming travel pop-up dates. Every piece is strictly unique to your stroma.
        </p>

        {/* Primary and Secondary Actions */}
        <div className="flex flex-wrap items-center gap-4 pt-2">
          <Link
            href="/book"
            className="group inline-flex items-center gap-3 px-8 py-4 bg-white hover:bg-neutral-200 text-black text-xs font-sans font-semibold tracking-[0.24em] uppercase transition-all duration-300"
          >
            <span>BOOK AN EXPERIENCE</span>
            <ArrowUpRight className="w-4 h-4 text-black transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>

          <button
            onClick={() => setIsPopupModalOpen(true)}
            className="px-7 py-4 border border-white/20 hover:border-white bg-black/60 text-xs font-mono tracking-[0.20em] uppercase text-white transition-all duration-300 cursor-pointer"
          >
            FIND NEXT POP-UP
          </button>
        </div>
      </div>

      {/* Rebuilt Architectural Luxury Footer */}
      <footer className="relative z-10 max-w-6xl mx-auto w-full border-t border-white/10 pt-12 pb-8 flex flex-col gap-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <Link
            href="/"
            className="font-display font-medium text-2xl tracking-[0.34em] uppercase text-white hover:text-white/80 transition-colors"
          >
            IRIS<sup className="text-xs ml-0.5 opacity-60">®</sup>
          </Link>

          <nav className="flex flex-wrap items-center gap-6 sm:gap-10 text-xs font-mono tracking-wider text-white/70">
            <Link href="/shop" className="hover:text-white transition-colors">
              COLLECTION
            </Link>
            <Link href="/book" className="hover:text-white transition-colors">
              EXPERIENCE
            </Link>
            <Link href="/products" className="hover:text-white transition-colors">
              FORMATS
            </Link>
            <Link href="/my-iris" className="hover:text-white transition-colors">
              MY IRIS
            </Link>
            <Link href="/track-order" className="hover:text-white transition-colors">
              TRACK ORDER
            </Link>
          </nav>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-[10px] font-mono tracking-widest text-white/40 pt-4 border-t border-white/5">
          <span>© 2026 IRIS ATELIER • WHITE TOWN, PONDICHERRY • ALL RIGHTS RESERVED</span>
          <div className="flex items-center gap-6">
            <a
              href={`https://wa.me/${SITE_CONFIG.whatsapp.cleanNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              WHATSAPP
            </a>
            <a
              href={SITE_CONFIG.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              INSTAGRAM
            </a>
            <span className="hover:text-white transition-colors cursor-pointer">
              PRIVACY & TERMS
            </span>
          </div>
        </div>
      </footer>

      {/* ─── Pop-Up Location Modal (Portal Mounted) ─── */}
      {isPopupModalOpen && mounted && typeof document !== "undefined" &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-[99999] flex items-center justify-center p-6 bg-black/95 backdrop-blur-2xl text-white animate-fadeIn select-none"
            onClick={() => setIsPopupModalOpen(false)}
          >
            {/* Safe Fixed Close Button */}
            <button
              onClick={() => setIsPopupModalOpen(false)}
              className="fixed top-6 right-6 sm:top-8 sm:right-10 flex items-center gap-2 px-4 py-2.5 border border-white/20 bg-black/90 hover:bg-white hover:text-black text-xs font-mono tracking-widest text-white transition-all duration-300 z-[100000] cursor-pointer shadow-[0_8px_32px_rgba(0,0,0,0.9)]"
              aria-label="Close modal"
            >
              <span>CLOSE [ESC]</span>
              <X className="w-4 h-4" />
            </button>

            <div
              className="relative w-full max-w-md p-6 sm:p-8 bg-[#0a0a0e] border border-white/15 text-left flex flex-col gap-6 shadow-[0_20px_60px_rgba(0,0,0,0.9)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2.5 text-xs font-mono tracking-widest uppercase text-white/50 border-b border-white/10 pb-4">
                <MapPin className="w-4 h-4 text-white" />
                <span>POP-UP CALENDAR</span>
              </div>

              <div className="flex flex-col gap-2">
                <h3 className="font-display text-2xl uppercase text-white font-light">
                  PONDICHERRY ATELIER
                </h3>
                <p className="text-xs font-sans text-white/60 leading-relaxed">
                  Our permanent creative studio is located in White Town, Pondicherry.
                  Private appointments are conducted daily.
                </p>
              </div>

              <div className="p-4 border border-white/10 bg-white/[0.02] flex flex-col gap-2 font-mono text-xs text-white/60">
                <div className="flex items-center gap-2 text-white font-medium">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>TRAVEL SCHEDULE</span>
                </div>
                <span className="text-white/70">
                  Bengaluru & Mumbai travel atelier dates will be released shortly.
                </span>
              </div>

              <a
                href={`https://wa.me/${SITE_CONFIG.whatsapp.cleanNumber}?text=${encodeURIComponent(
                  "Hello IRIS Studio, please add me to your priority list for upcoming Pop-up announcements."
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 py-3.5 bg-white text-black hover:bg-neutral-200 text-xs font-mono font-semibold uppercase tracking-wider transition-all"
              >
                <span>JOIN PRIORITY LIST ON WHATSAPP</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
          </div>,
          document.body
        )
      }
    </section>
  );
}
