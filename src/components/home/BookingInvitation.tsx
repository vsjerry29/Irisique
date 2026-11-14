"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, X, Calendar, MapPin } from "lucide-react";
import { SITE_CONFIG } from "@/lib/config";

export default function BookingInvitation() {
  const [isPopupModalOpen, setIsPopupModalOpen] = useState(false);

  return (
    <section
      id="inquire"
      className="relative z-30 w-full min-h-screen py-16 sm:py-20 flex flex-col justify-between overflow-hidden bg-[#020204] text-[#f0f0f2] px-6 sm:px-10 md:px-16 lg:px-24 select-none"
    >
      {/* Background Cinematic Luminous Iris Artwork (Deep subtle ambient stroma) */}
      <div className="absolute inset-0 z-0 flex items-center justify-center opacity-12 pointer-events-none">
        <div className="relative w-[500px] sm:w-[700px] md:w-[850px] aspect-square rounded-full overflow-hidden blur-[2px]">
          <Image
            src="/assets/gallery/iris_amber.webp"
            alt="Cinematic Background Iris"
            fill
            sizes="850px"
            className="object-cover animate-spin-very-slow"
          />
        </div>
        {/* Soft Dark Vignette Overlay for Crisp Contrast */}
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#020204]/85 to-[#020204]" />
      </div>

      {/* Top Meta Indicator */}
      <div className="relative z-10 max-w-6xl mx-auto w-full flex items-center justify-between border-b border-[#161622] pb-4">
        <div className="flex items-center gap-2.5 text-[10px] font-mono tracking-[0.30em] uppercase text-[#7ec8e3]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#7ec8e3] animate-pulse" />
          <span>BESPOKE APPOINTMENTS</span>
        </div>
        <span className="text-[10px] font-mono tracking-widest uppercase text-[#777788]">
          {SITE_CONFIG.location}
        </span>
      </div>

      {/* Center Main Conversion Hero Typography */}
      <div className="relative z-10 max-w-6xl mx-auto w-full my-auto py-10 flex flex-col items-start gap-6">
        <div className="flex flex-col gap-2">
          <h2 className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-light tracking-[-0.04em] uppercase text-white leading-[0.9]">
            YOUR TURN.
          </h2>
        </div>

        <p className="max-w-lg font-sans text-xs sm:text-sm text-[#a6a6b8] leading-relaxed">
          Book an intimate macro session at our Pondicherry atelier or enquire about
          upcoming travel pop-up dates. Every piece is strictly unique to your stroma.
        </p>

        {/* Primary and Secondary Actions */}
        <div className="flex flex-wrap items-center gap-4 pt-2">
          <Link
            href="/book"
            className="group inline-flex items-center gap-3 px-8 py-4 bg-[#7ec8e3] hover:bg-[#68bcdb] text-[#030304] text-xs font-sans font-semibold tracking-[0.24em] uppercase transition-all duration-300"
          >
            <span>BOOK AN EXPERIENCE</span>
            <ArrowUpRight className="w-4 h-4 text-[#030304] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>

          <button
            onClick={() => setIsPopupModalOpen(true)}
            className="px-6 py-4 border border-[#222232] hover:border-[#7ec8e3]/80 bg-[#08080e]/80 text-xs font-mono tracking-[0.20em] uppercase text-[#cfcfdc] hover:text-white transition-all duration-300"
          >
            FIND THE NEXT POP-UP
          </button>
        </div>
      </div>

      {/* Minimal Refined Editorial Footer */}
      <footer className="relative z-10 max-w-6xl mx-auto w-full border-t border-[#181826] pt-10 pb-6 flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <Link
            href="/"
            className="font-display font-medium text-xl tracking-[0.34em] uppercase text-white hover:text-[#7ec8e3] transition-colors"
          >
            IRIS<sup className="text-xs ml-0.5 opacity-60">®</sup>
          </Link>

          <nav className="flex flex-wrap items-center gap-6 sm:gap-8 text-xs font-mono tracking-wider text-[#cfcfde]">
            <Link href="/products" className="hover:text-white transition-colors">
              PRODUCTS
            </Link>
            <Link href="/book" className="hover:text-white transition-colors">
              BOOK
            </Link>
            <Link href="/my-iris" className="hover:text-white transition-colors">
              MY IRIS
            </Link>
            <Link href="/shop" className="hover:text-white transition-colors">
              SHOP
            </Link>
            <Link href="/track-order" className="hover:text-white transition-colors">
              TRACK ORDER
            </Link>
          </nav>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-[10px] font-mono tracking-widest text-[#808094]">
          <span>© 2026 IRIS STUDIO • {SITE_CONFIG.location.toUpperCase()} • ALL RIGHTS RESERVED</span>
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
              PRIVACY & BIOMETRIC NOTICE
            </span>
          </div>
        </div>
      </footer>

      {/* ─── Pop-Up Location Modal ─── */}
      {isPopupModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/85 backdrop-blur-xl animate-fadeIn"
          onClick={() => setIsPopupModalOpen(false)}
        >
          <div
            className="relative w-full max-w-md p-6 sm:p-8 bg-[#0a0a10] border border-[#222232] text-left flex flex-col gap-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#181824] pb-4">
              <div className="flex items-center gap-2.5 text-xs font-mono tracking-widest uppercase text-[#7ec8e3]">
                <MapPin className="w-4 h-4" />
                <span>POP-UP CALENDAR</span>
              </div>
              <button
                onClick={() => setIsPopupModalOpen(false)}
                className="text-[#777788] hover:text-white text-xs font-mono"
              >
                CLOSE [ESC]
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <h3 className="font-display text-xl uppercase text-white">
                PONDICHERRY ATELIER
              </h3>
              <p className="text-xs font-sans text-[#8e8e9c] leading-relaxed">
                Our permanent creative studio is located in White Town, Pondicherry.
              </p>
            </div>

            <div className="p-4 border border-[#1e1e2c] bg-[#0c0c16] flex flex-col gap-2 font-mono text-xs text-[#808092]">
              <div className="flex items-center gap-2 text-white">
                <Calendar className="w-3.5 h-3.5 text-[#7ec8e3]" />
                <span>POP-UP SCHEDULE</span>
              </div>
              <span className="text-[#a0a0b2]">
                First travel pop-up announcement coming soon. Join our priority notification list.
              </span>
            </div>

            <a
              href={`https://wa.me/${SITE_CONFIG.whatsapp.cleanNumber}?text=${encodeURIComponent(
                "Hello IRIS Studio, please add me to your priority list for upcoming Pop-up announcements."
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 py-3 bg-[#7ec8e3] text-[#030304] text-xs font-mono font-semibold uppercase tracking-wider"
            >
              <span>JOIN PRIORITY LIST ON WHATSAPP</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}
    </section>
  );
}
