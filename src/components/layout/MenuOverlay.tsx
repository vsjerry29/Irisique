"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { X, ArrowUpRight } from "lucide-react";
import { SITE_CONFIG } from "@/lib/config";

interface MenuOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const NAV_LINKS = [
  { label: "Home", href: "/", num: "01" },
  { label: "Products", href: "/products", num: "02" },
  { label: "Book a Session", href: "/book", num: "03" },
  { label: "My Iris", href: "/my-iris", num: "04" },
  { label: "Shop", href: "/shop", num: "05" },
  { label: "Track Order", href: "/track-order", num: "06" },
];

export default function MenuOverlay({ isOpen, onClose }: MenuOverlayProps) {
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Keyboard accessibility: Escape to close, focus trapping
  useEffect(() => {
    if (!isOpen) return;

    // Lock background scrolling
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Focus close button initially
    closeButtonRef.current?.focus();

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
      aria-label="Atelier Navigation"
      className="fixed inset-0 z-[100] flex flex-col justify-between p-6 sm:p-12 md:p-16 bg-[#030405]/95 backdrop-blur-2xl text-[#f0f0f2] transition-all duration-500 animate-fadeIn"
    >
      {/* Top Header Row */}
      <div className="flex items-center justify-between w-full border-b border-[#161622] pb-6">
        <Link
          href="/"
          onClick={onClose}
          className="font-display font-medium text-2xl tracking-[0.32em] uppercase text-white hover:text-[#7ec8e3] transition-colors"
        >
          IRIS<sup className="text-xs ml-0.5 opacity-60">®</sup>
        </Link>

        <button
          ref={closeButtonRef}
          onClick={onClose}
          className="group flex items-center gap-3 px-4 py-2 border border-[#222230] hover:border-[#7ec8e3]/60 bg-[#08080e]/60 text-xs font-mono uppercase tracking-[0.24em] text-[#9a9aa8] hover:text-white transition-all cursor-pointer"
          aria-label="Close menu"
        >
          <span>CLOSE [ESC]</span>
          <X className="w-4 h-4 text-[#7ec8e3] transition-transform duration-300 group-hover:rotate-90" />
        </button>
      </div>

      {/* Center Nav Links with Large Confident Typography */}
      <nav className="my-auto py-8 flex flex-col gap-3 sm:gap-4 max-w-4xl">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={onClose}
            className="group flex items-baseline gap-4 sm:gap-6 text-white hover:text-[#7ec8e3] transition-colors duration-300"
          >
            <span className="font-mono text-xs sm:text-sm text-[#555566] tracking-widest group-hover:text-[#7ec8e3] transition-colors">
              {link.num}
            </span>
            <span className="font-display text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-[-0.03em] uppercase transition-transform duration-300 group-hover:translate-x-2">
              {link.label}
            </span>
            <ArrowUpRight className="opacity-0 group-hover:opacity-100 w-5 h-5 sm:w-8 sm:h-8 text-[#7ec8e3] transition-all duration-300 -translate-x-2 group-hover:translate-x-0" />
          </Link>
        ))}
      </nav>

      {/* Bottom Meta Information */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pt-6 border-t border-[#161622] text-xs font-mono tracking-wider text-[#666677]">
        <div className="flex flex-col gap-1">
          <span className="uppercase text-white">{SITE_CONFIG.location}</span>
          <span>{SITE_CONFIG.tagline}</span>
        </div>

        <div className="flex items-center gap-6">
          <a
            href={SITE_CONFIG.social.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors uppercase"
          >
            INSTAGRAM
          </a>
          <a
            href={`https://wa.me/${SITE_CONFIG.whatsapp.cleanNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors uppercase"
          >
            WHATSAPP
          </a>
        </div>
      </div>
    </div>,
    document.body
  );
}
