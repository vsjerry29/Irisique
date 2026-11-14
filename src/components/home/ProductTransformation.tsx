"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Check, Eye } from "lucide-react";
import { useCart } from "@/lib/cart";

type FormatKey = "digital" | "print" | "framed";

const FORMAT_DATA: Record<
  FormatKey,
  {
    name: string;
    price: number;
    image: string;
    aspect: string;
    leadTime: string;
    specs: string;
    features: string[];
  }
> = {
  digital: {
    name: "DIGITAL MASTER",
    price: 299,
    image: "/assets/products/product_digital.webp",
    aspect: "aspect-[4/3]",
    leadTime: "Instant / 24h",
    specs: "4096×4096 P3 Gamut",
    features: [
      "Lossless 4K Master Export",
      "P3 Wide-Gamut Color Calibrated",
      "Cryptographic Signature Certificate",
    ],
  },
  print: {
    name: "FINE ART PRINT",
    price: 499,
    image: "/assets/products/product_print.webp",
    aspect: "aspect-[4/3]",
    leadTime: "3–5 Days",
    specs: "310gsm Cotton Rag",
    features: [
      "Hahnemühle 100% Cotton Rag Paper",
      "Archival Mineral Pigment Inks",
      "Studio Embossed Seal of Authenticity",
    ],
  },
  framed: {
    name: "ANODIZED BOX FRAME",
    price: 799,
    image: "/assets/products/product_framed.webp",
    aspect: "aspect-[4/3]",
    leadTime: "5–7 Days",
    specs: "Matte Black Aluminum",
    features: [
      "Deep Aerospace Box Frame",
      "99% UV Museum Non-Reflective Glass",
      "Acid-Free Archival Floating Mat",
    ],
  },
};

export default function ProductTransformation() {
  const [selectedFormat, setSelectedFormat] = useState<FormatKey>("framed");
  const [artworkMode, setArtworkMode] = useState<"couple" | "solo">("couple");
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const { addItem } = useCart();

  const current = FORMAT_DATA[selectedFormat];
  const displayImage = artworkMode === "couple" && selectedFormat === "framed" 
    ? "/assets/couple/couple_artwork_final.webp" 
    : current.image;

  // Subtle pointer perspective tilt
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  return (
    <section
      id="products"
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full min-h-screen py-24 md:py-32 flex flex-col justify-between overflow-hidden bg-[#030405] text-[#f0f0f2] px-6 sm:px-10 md:px-16 select-none"
    >
      {/* Top Section Header */}
      <div className="relative z-10 max-w-7xl mx-auto w-full flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-[#161622] pb-8">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2.5 text-[10px] font-mono tracking-[0.30em] uppercase text-[#7ec8e3]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7ec8e3] animate-pulse" />
            <span>05 / MATERIAL CRAFTSMANSHIP</span>
          </div>
          <h2 className="font-display text-4xl sm:text-6xl md:text-7xl font-light tracking-[-0.04em] uppercase text-[#f7f7fa]">
            MADE TO BE KEPT.
          </h2>
        </div>

        {/* Controls: Artwork Source & Material Format */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {/* Artwork continuity toggle */}
          <div className="flex items-center p-1 border border-[#222230] bg-[#07070b]/90 backdrop-blur-md">
            <button
              onClick={() => setArtworkMode("couple")}
              className={`px-3 sm:px-4 py-1.5 text-[10px] font-mono uppercase tracking-[0.16em] transition-all duration-300 ${
                artworkMode === "couple"
                  ? "bg-[#e09848] text-[#030304] font-semibold"
                  : "text-[#8e8e9c] hover:text-white"
              }`}
            >
              COUPLE MASTER
            </button>
            <button
              onClick={() => setArtworkMode("solo")}
              className={`px-3 sm:px-4 py-1.5 text-[10px] font-mono uppercase tracking-[0.16em] transition-all duration-300 ${
                artworkMode === "solo"
                  ? "bg-[#7ec8e3] text-[#030304] font-semibold"
                  : "text-[#8e8e9c] hover:text-white"
              }`}
            >
              SOLO IRIS
            </button>
          </div>

          {/* Minimal Format Selector Buttons */}
          <div className="flex items-center p-1 border border-[#222230] bg-[#07070b]/90 backdrop-blur-md">
            {(["digital", "print", "framed"] as FormatKey[]).map((fmt) => (
              <button
                key={fmt}
                onClick={() => setSelectedFormat(fmt)}
                className={`px-3 sm:px-5 py-1.5 text-xs font-mono uppercase tracking-[0.18em] transition-all duration-300 ${
                  selectedFormat === fmt
                    ? "bg-[#7ec8e3] text-[#030304] font-semibold shadow-md"
                    : "text-[#8e8e9c] hover:text-white"
                }`}
              >
                {fmt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Center Dominant Product Visual Presentation with Perspective Tilt */}
      <div className="relative z-10 w-full flex-1 flex items-center justify-center my-10 py-6">
        <div
          className="relative w-full max-w-4xl aspect-[16/10] sm:aspect-[16/9] flex items-center justify-center transition-transform duration-500 ease-out"
          style={{
            transform: `perspective(1200px) rotateY(${mousePos.x * 3.5}deg) rotateX(${-mousePos.y * 3.5}deg)`,
          }}
        >
          {/* Active Product Mockup Image */}
          <div className="relative w-full h-full rounded-xl overflow-hidden border border-[#222230] bg-[#050608] shadow-[0_20px_80px_rgba(0,0,0,0.85)]">
            <Image
              key={`${selectedFormat}-${artworkMode}`}
              src={displayImage}
              alt={current.name}
              fill
              sizes="(max-width: 1024px) 90vw, 960px"
              priority
              className="object-contain p-4 sm:p-8 transition-all duration-700 animate-fadeIn"
            />

            {/* Specular Light Variation Overlay */}
            <div
              className="absolute inset-0 pointer-events-none transition-opacity duration-300"
              style={{
                background: `radial-gradient(circle at ${50 + mousePos.x * 30}% ${50 + mousePos.y * 30}%, rgba(255,255,255,0.06) 0%, transparent 60%)`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Bottom Information Row & Actions */}
      <div className="relative z-10 max-w-7xl mx-auto w-full flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-t border-[#161622] pt-8">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-3">
            <span className="font-display text-2xl sm:text-3xl font-light text-white uppercase">
              {current.name}
            </span>
            <span className="font-mono text-sm sm:text-base font-semibold text-[#7ec8e3]">
              From ₹{current.price}
            </span>
          </div>
          <span className="text-xs font-mono text-[#777788] uppercase tracking-wider">
            {current.specs} • Lead time: {current.leadTime}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsDetailModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-3 border border-[#222230] hover:border-[#7ec8e3] bg-[#090910]/80 text-xs font-mono tracking-widest uppercase text-[#ededf0] hover:text-white transition-all"
          >
            <Eye className="w-3.5 h-3.5 text-[#7ec8e3]" />
            <span>VIEW DETAILS</span>
          </button>

          <Link
            href={`/shop?format=${selectedFormat}`}
            className="inline-flex items-center gap-3 px-6 py-3 bg-[#7ec8e3] hover:bg-[#68bcdb] text-[#030304] text-xs font-sans font-semibold tracking-[0.20em] uppercase transition-all duration-300"
          >
            <span>SHOP THIS FORMAT</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* ─── Detail Modal ─── */}
      {isDetailModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/85 backdrop-blur-xl animate-fadeIn"
          onClick={() => setIsDetailModalOpen(false)}
        >
          <div
            className="relative w-full max-w-lg p-6 sm:p-8 bg-[#0a0a10] border border-[#222232] text-left flex flex-col gap-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#1a1a28] pb-4">
              <h3 className="font-display text-xl uppercase text-white">
                {current.name} SPECIFICATIONS
              </h3>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="text-[#777788] hover:text-white text-xs font-mono"
              >
                CLOSE [ESC]
              </button>
            </div>

            <div className="flex flex-col gap-3 font-mono text-xs text-[#a0a0b2]">
              {current.features.map((feat, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-[#7ec8e3]" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-[#1a1a28] pt-4 flex items-center justify-between">
              <span className="font-mono text-sm text-[#7ec8e3]">Starting at ₹{current.price}</span>
              <button
                onClick={() => {
                  addItem({
                    productId: selectedFormat === "digital" ? "prod-digital" : selectedFormat === "print" ? "prod-print" : "prod-framed",
                    title: current.name,
                    format: selectedFormat,
                    size: "Standard Atelier Format",
                    price: current.price,
                    quantity: 1,
                  });
                  setIsDetailModalOpen(false);
                }}
                className="px-5 py-2.5 bg-[#7ec8e3] text-[#030304] text-xs font-mono font-semibold uppercase tracking-wider"
              >
                ADD TO CART
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
