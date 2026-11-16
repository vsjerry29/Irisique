"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { X, ArrowUpRight } from "lucide-react";
import { SITE_CONFIG } from "@/lib/config";
import OpticalTrace from "@/components/ui/OpticalTrace";

interface MenuOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const NAV_LINKS = [
  { label: "Home", href: "/", num: "01", desc: "Cinematic macro stroma journey" },
  { label: "Products", href: "/products", num: "02", desc: "Curated fine art catalogue" },
  { label: "Book a Session", href: "/book", num: "03", desc: "Private atelier appointment" },
  { label: "My Iris", href: "/my-iris", num: "04", desc: "Client biometric archive" },
  { label: "Shop", href: "/shop", num: "05", desc: "Bespoke formats & editions" },
  { label: "Track Order", href: "/track-order", num: "06", desc: "Live production dispatch" },
];

export default function MenuOverlay({ isOpen, onClose }: MenuOverlayProps) {
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const curtainRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Accessibility: Focus trap, Escape key, and Scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
      if (e.key === "Tab" && containerRef.current) {
        const focusables = containerRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-label="Atelier Navigation Menu"
      className="fixed inset-0 z-[100] flex flex-col justify-between p-6 sm:p-12 md:p-16 bg-[#090909] text-[#FAFAF8] select-none animate-fadeIn overflow-hidden"
    >
      {/* ─── Architectural Typographic Curtain Surface ─── */}
      <div
        ref={curtainRef}
        className="w-full h-full flex flex-col justify-between max-w-7xl mx-auto"
      >
        {/* Top Header Row with Close Control */}
        <div className="flex items-center justify-between w-full border-b border-white/15 pb-6">
          <Link
            href="/"
            onClick={onClose}
            className="font-display font-medium text-2xl tracking-[0.28em] uppercase text-white hover:opacity-80 transition-opacity"
          >
            IRIS<sup className="text-xs ml-1 font-light opacity-60">®</sup>
          </Link>

          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="group flex items-center gap-3 px-4 py-2 border border-white/20 hover:border-white bg-[#171717] text-xs font-mono uppercase tracking-[0.24em] text-white transition-all cursor-pointer"
            aria-label="Close menu"
          >
            <span>CLOSE [ESC]</span>
            <X className="w-4 h-4 text-white transition-transform duration-300 group-hover:rotate-90" />
          </button>
        </div>

        {/* Center: Large Masked Typography Links + Optical Trace Ray */}
        <div className="relative my-auto py-8 sm:py-12 flex flex-col lg:flex-row items-start justify-between gap-12">
          {/* Main Navigation Index */}
          <nav className="flex flex-col gap-4 sm:gap-6 w-full lg:w-2/3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className="group flex items-baseline justify-between py-2 border-b border-white/10 hover:border-white/40 transition-colors"
              >
                <div className="flex items-baseline gap-4 sm:gap-8">
                  <span className="font-mono text-xs sm:text-sm text-[#706D68] tracking-widest">
                    {link.num}
                  </span>
                  <span className="font-display text-3xl sm:text-5xl md:text-6xl font-bold uppercase tracking-[-0.03em] text-[#FAFAF8] group-hover:text-white transition-transform duration-300 group-hover:translate-x-2">
                    {link.label}
                  </span>
                </div>
                <div className="hidden sm:flex items-center gap-3 text-xs font-mono tracking-widest text-[#706D68] group-hover:text-white transition-colors">
                  <span>{link.desc}</span>
                  <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </Link>
            ))}
          </nav>

          {/* Right Column: Studio Coordinates & Optical Motif */}
          <div className="w-full lg:w-1/3 flex flex-col justify-between gap-8 pt-6 lg:pt-0 lg:pl-12 lg:border-l border-white/10 text-xs font-mono tracking-wider text-[#D8D4CC]/70">
            <div className="space-y-3">
              <span className="text-[10px] tracking-[0.24em] uppercase text-white font-bold block">
                ATELIER LOCATION
              </span>
              <p className="text-white text-sm font-sans">
                White Town, Pondicherry 605001<br />
                Tamil Nadu, India
              </p>
              <p className="text-[#706D68]">
                Tuesday – Sunday • 10:00 – 19:30 IST
              </p>
            </div>

            <div className="space-y-3">
              <span className="text-[10px] tracking-[0.24em] uppercase text-white font-bold block">
                DIRECT ENQUIRIES
              </span>
              <a
                href={`https://wa.me/${SITE_CONFIG.whatsapp.cleanNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:underline underline-offset-4 block font-sans"
              >
                WhatsApp Atelier ↗
              </a>
              <a
                href={`mailto:${SITE_CONFIG.social.email}`}
                className="text-white hover:underline underline-offset-4 block font-sans"
              >
                {SITE_CONFIG.social.email} ↗
              </a>
            </div>

            <div className="w-full h-20 opacity-40">
              <OpticalTrace theme="dark" variant="compact" />
            </div>
          </div>
        </div>

        {/* Bottom Bar: Provenance & Copyright */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-white/15 pt-6 text-xs font-mono tracking-widest uppercase text-[#706D68]">
          <span>BIOMETRIC IRIS MACRO ART</span>
          <span>© {new Date().getFullYear()} IRIS ATELIER. ALL RIGHTS RESERVED.</span>
        </div>
      </div>
    </div>,
    document.body
  );
}
