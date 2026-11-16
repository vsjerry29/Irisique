"use client";

import React from "react";
import Link from "next/link";
import { SITE_CONFIG } from "@/lib/config";

export default function Footer() {
  return (
    <footer
      id="footer"
      data-theme="light"
      className="relative z-30 w-full bg-[#F5F2EC] text-[#080808] border-t border-[#080808]/10 pt-20 pb-12 sm:pt-28 sm:pb-16 px-6 sm:px-10 md:px-16 lg:px-24 select-none"
    >
      <div className="max-w-7xl mx-auto w-full flex flex-col justify-between gap-16 md:gap-24">
        {/* Top: Oversized Refined IRIS Wordmark */}
        <div className="w-full flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10 border-b border-[#080808]/10">
          <Link
            href="/"
            className="font-display text-6xl sm:text-8xl md:text-9xl lg:text-[11rem] font-medium tracking-[0.06em] uppercase text-[#080808] leading-[0.8] hover:opacity-80 transition-opacity"
          >
            IRIS<sup className="text-2xl sm:text-3xl md:text-4xl ml-1 font-light opacity-60">®</sup>
          </Link>

          <div className="flex flex-col items-start md:items-end gap-1.5 text-xs font-mono text-[#77736D] tracking-widest uppercase">
            <span>BIOMETRIC MACRO ATELIER</span>
            <span>WHITE TOWN • PONDICHERRY</span>
          </div>
        </div>

        {/* Middle: Clean Responsive Columns of Links */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-10 sm:gap-12 text-xs font-mono tracking-wider">
          {/* Navigation Column */}
          <div className="flex flex-col gap-3">
            <span className="text-[10px] tracking-[0.24em] text-[#77736D] uppercase">
              INDEX
            </span>
            <Link href="/" className="hover:text-black transition-colors">
              Home
            </Link>
            <Link href="/products" className="hover:text-black transition-colors">
              Products
            </Link>
            <Link href="/book" className="hover:text-black transition-colors">
              Book
            </Link>
            <Link href="/my-iris" className="hover:text-black transition-colors">
              My Iris
            </Link>
          </div>

          {/* Collection & Studio */}
          <div className="flex flex-col gap-3">
            <span className="text-[10px] tracking-[0.24em] text-[#77736D] uppercase">
              ATELIER
            </span>
            <Link href="/shop" className="hover:text-black transition-colors">
              Shop
            </Link>
            <Link href="/track-order" className="hover:text-black transition-colors">
              Track Order
            </Link>
            <Link href="/iris-lab" className="hover:text-black transition-colors">
              Iris Lab
            </Link>
          </div>

          {/* Social Links (Only valid configured URLs) */}
          <div className="flex flex-col gap-3">
            <span className="text-[10px] tracking-[0.24em] text-[#77736D] uppercase">
              CONNECT
            </span>
            <a
              href={`https://wa.me/${SITE_CONFIG.whatsapp.cleanNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-black transition-colors"
            >
              WhatsApp Atelier
            </a>
            <a
              href={SITE_CONFIG.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-black transition-colors"
            >
              Instagram
            </a>
            <a
              href={`mailto:${SITE_CONFIG.social.email}`}
              className="hover:text-black transition-colors"
            >
              Email Atelier
            </a>
          </div>

          {/* Legal / Policy */}
          <div className="flex flex-col gap-3">
            <span className="text-[10px] tracking-[0.24em] text-[#77736D] uppercase">
              LEGAL
            </span>
            <Link href="/shop" className="hover:text-black transition-colors">
              Privacy Policy
            </Link>
            <Link href="/shop" className="hover:text-black transition-colors">
              Terms of Service
            </Link>
            <span className="text-[#77736D] text-[11px]">
              Strict Biometric Privacy
            </span>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Subtle Publication Note */}
        <div className="pt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-[10px] font-mono tracking-widest text-[#77736D] uppercase border-t border-[#080808]/10">
          <span>© {new Date().getFullYear()} IRIS ATELIER. ALL RIGHTS RESERVED.</span>
          <span>PRINTED ON HAHNEMÜHLE • ARCHIVAL MUSEUM SPECIFICATION</span>
        </div>
      </div>
    </footer>
  );
}
