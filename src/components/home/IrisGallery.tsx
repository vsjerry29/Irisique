"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, X, ArrowUpRight, Eye } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { GALLERY_ITEMS } from "@/lib/data";
import { useCart } from "@/lib/cart";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function IrisGallery() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedArtwork, setSelectedArtwork] = useState<(typeof GALLERY_ITEMS)[0] | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [velocity, setVelocity] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const currentDragRef = useRef(0);
  const lastTimeRef = useRef(0);
  const lastXRef = useRef(0);
  const rafIdRef = useRef<number | null>(null);

  const { addItem } = useCart();

  const activeItem = GALLERY_ITEMS[activeIndex];

  // Drag Handlers with Smooth Momentum
  const handlePointerDown = (clientX: number) => {
    if (selectedArtwork) return;
    setIsDragging(true);
    startXRef.current = clientX;
    lastXRef.current = clientX;
    lastTimeRef.current = performance.now();
    currentDragRef.current = dragOffset;
  };

  const handlePointerMove = (clientX: number) => {
    if (!isDragging || selectedArtwork) return;
    const now = performance.now();
    const dt = Math.max(now - lastTimeRef.current, 8);
    const dx = clientX - lastXRef.current;
    
    // Calculate instantaneous velocity
    const v = dx / dt;
    setVelocity(v);

    lastXRef.current = clientX;
    lastTimeRef.current = now;

    const totalDx = clientX - startXRef.current;
    // Damped drag resistance
    const damped = totalDx * 0.75;
    setDragOffset(currentDragRef.current + damped);
  };

  const handlePointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);

    // Inertia threshold calculation
    const threshold = 70;
    if (dragOffset < -threshold || velocity < -0.4) {
      nextItem();
    } else if (dragOffset > threshold || velocity > 0.4) {
      prevItem();
    }
    
    // Smooth settle back to zero offset
    setDragOffset(0);
    setVelocity(0);
  };

  const nextItem = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % GALLERY_ITEMS.length);
  }, []);

  const prevItem = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + GALLERY_ITEMS.length) % GALLERY_ITEMS.length);
  }, []);

  // Keyboard Navigation
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (selectedArtwork) {
        if (e.key === "Escape") setSelectedArtwork(null);
        return;
      }
      if (e.key === "ArrowRight") nextItem();
      if (e.key === "ArrowLeft") prevItem();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedArtwork, nextItem, prevItem]);

  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { opacity: 0.85 },
        {
          opacity: 1,
          duration: 0.6,
          scrollTrigger: {
            trigger: el,
            start: "top 90%",
            end: "top 30%",
            scrub: 0.5,
          },
        }
      );
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="gallery"
      ref={containerRef}
      className="relative w-full min-h-screen py-24 md:py-32 flex flex-col justify-between overflow-hidden bg-[#030405] select-none transition-colors duration-1000"
      style={{
        background: `radial-gradient(circle at 50% 50%, ${activeItem.glowColor}10 0%, #030405 75%)`,
      }}
    >
      {/* Section Typography Header */}
      <div className="relative z-10 max-w-7xl mx-auto w-full px-6 sm:px-10 md:px-16 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2.5 text-[10px] font-mono tracking-[0.30em] uppercase text-[#7ec8e3]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7ec8e3] animate-pulse" />
            <span>03 / CURATED EXHIBITION</span>
          </div>
          <h2 className="font-display text-4xl sm:text-6xl md:text-7xl font-light tracking-[-0.04em] uppercase text-[#f7f7fa]">
            UNLIKE ANY OTHER.
          </h2>
        </div>

        {/* Discreet Prev / Next Navigation Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={prevItem}
            className="w-11 h-11 border border-[#222230] hover:border-[#7ec8e3]/70 bg-[#08080c]/80 flex items-center justify-center text-[#9090a0] hover:text-white transition-colors"
            aria-label="Previous artwork"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-mono text-xs tracking-widest text-[#666677] px-2">
            0{activeIndex + 1} / 0{GALLERY_ITEMS.length}
          </span>
          <button
            onClick={nextItem}
            className="w-11 h-11 border border-[#222230] hover:border-[#7ec8e3]/70 bg-[#08080c]/80 flex items-center justify-center text-[#9090a0] hover:text-white transition-colors"
            aria-label="Next artwork"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Fluid Carousel Stage */}
      <div
        className="relative z-10 w-full flex-1 flex items-center justify-center my-10 py-4 cursor-grab active:cursor-grabbing touch-pan-y"
        onMouseDown={(e) => handlePointerDown(e.clientX)}
        onMouseMove={(e) => handlePointerMove(e.clientX)}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
        onTouchStart={(e) => handlePointerDown(e.touches[0].clientX)}
        onTouchMove={(e) => handlePointerMove(e.touches[0].clientX)}
        onTouchEnd={handlePointerUp}
      >
        <div className="relative w-full max-w-5xl h-[380px] sm:h-[480px] md:h-[540px] flex items-center justify-center">
          {GALLERY_ITEMS.map((item, idx) => {
            const offset = (idx - activeIndex + GALLERY_ITEMS.length) % GALLERY_ITEMS.length;
            // Calculate relative positioning: 0 = center, 1 = right, 2 = left (for length 3)
            let xPos = 0;
            let scale = 0.72;
            let opacity = 0.35;
            let zIndex = 1;

            if (offset === 0) {
              xPos = dragOffset;
              scale = 1.0;
              opacity = 1.0;
              zIndex = 10;
            } else if (offset === 1) {
              xPos = 360 + dragOffset * 0.4;
              scale = 0.72;
              opacity = 0.45;
              zIndex = 5;
            } else {
              xPos = -360 + dragOffset * 0.4;
              scale = 0.72;
              opacity = 0.45;
              zIndex = 5;
            }

            // Tilt angle from velocity
            const tilt = offset === 0 ? velocity * 6 : 0;

            return (
              <div
                key={item.id}
                onClick={() => {
                  if (offset === 0) {
                    setSelectedArtwork(item);
                  } else {
                    setActiveIndex(idx);
                  }
                }}
                className="absolute transition-transform duration-500 ease-out cursor-pointer group"
                style={{
                  transform: `translateX(${xPos}px) scale(${scale}) rotate(${tilt}deg)`,
                  opacity,
                  zIndex,
                }}
              >
                <div className="relative w-[280px] sm:w-[380px] md:w-[440px] aspect-square rounded-full p-2 border border-[#2a2a38]/60 bg-[#07070b]/60 backdrop-blur-md transition-all duration-500 group-hover:border-[#7ec8e3]/80 group-hover:shadow-[0_0_40px_rgba(126,200,227,0.15)]">
                  <div className="relative w-full h-full rounded-full overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="(max-width: 768px) 280px, 440px"
                      priority={offset === 0}
                      className="object-cover transform transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>

                  {/* Micro Hint when active */}
                  {offset === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                      <div className="px-4 py-2 bg-black/80 backdrop-blur-md border border-white/20 text-[10px] font-mono tracking-widest uppercase text-white flex items-center gap-2">
                        <Eye className="w-3.5 h-3.5 text-[#7ec8e3]" />
                        <span>EXPLORE DETAILS</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Artwork Meta Footer */}
      <div className="relative z-10 max-w-7xl mx-auto w-full px-6 sm:px-10 md:px-16 flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-t border-[#161622] pt-6">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-mono tracking-[0.24em] uppercase text-[#7ec8e3]">
            {activeItem.category} • {activeItem.specs}
          </span>
          <h3 className="font-display text-xl sm:text-2xl font-light tracking-wide uppercase text-white">
            {activeItem.name}
          </h3>
          <p className="text-xs font-sans text-[#8e8e9c] max-w-md">
            {activeItem.description}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setSelectedArtwork(activeItem)}
            className="px-6 py-3 border border-[#2a2a3a] hover:border-[#7ec8e3] bg-[#0c0c14]/80 text-xs font-mono tracking-[0.20em] uppercase text-[#ededf0] hover:text-white transition-all"
          >
            EXPLORE ARTWORK
          </button>
          <button
            onClick={() =>
              addItem({
                productId: "prod-print",
                title: activeItem.name,
                format: "print",
                size: "Gallery Medium (A3)",
                price: activeItem.price,
                quantity: 1,
                irisArtworkName: activeItem.name,
              })
            }
            className="px-6 py-3 bg-[#7ec8e3] hover:bg-[#68bcdb] text-[#030304] text-xs font-sans font-semibold tracking-[0.20em] uppercase transition-all"
          >
            ORDER FROM ₹{activeItem.price}
          </button>
        </div>
      </div>

      {/* ─── Fullscreen Artwork Selection Overlay ─── */}
      {selectedArtwork && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 md:p-14 bg-[#030405]/95 backdrop-blur-2xl text-[#f0f0f2] animate-fadeIn"
        >
          {/* Close Button */}
          <button
            onClick={() => setSelectedArtwork(null)}
            className="absolute top-6 right-6 sm:top-8 sm:right-10 flex items-center gap-2.5 px-4 py-2 border border-[#262638] bg-[#08080f]/80 text-xs font-mono tracking-widest text-[#9e9eb0] hover:text-white hover:border-[#7ec8e3]/70 transition-all z-20"
          >
            <span>CLOSE [ESC]</span>
            <X className="w-4 h-4 text-[#7ec8e3]" />
          </button>

          <div className="relative w-full max-w-6xl h-full flex flex-col md:flex-row items-center justify-between gap-8 md:gap-14 my-auto">
            {/* Expanded High-Resolution Artwork Presentation */}
            <div className="relative w-[320px] sm:w-[480px] md:w-[560px] aspect-square rounded-full p-3 border border-[#2e2e42] bg-[#050608] shadow-[0_0_80px_rgba(0,0,0,0.8)]">
              <div className="relative w-full h-full rounded-full overflow-hidden">
                <Image
                  src={selectedArtwork.image}
                  alt={selectedArtwork.name}
                  fill
                  sizes="(max-width: 768px) 320px, 560px"
                  priority
                  className="object-cover animate-scaleUp"
                />
              </div>
            </div>

            {/* Artwork Details & Purchase Actions */}
            <div className="flex flex-col gap-6 max-w-md text-left">
              <div className="flex flex-col gap-2">
                <span className="font-mono text-xs tracking-[0.28em] uppercase text-[#7ec8e3]">
                  {selectedArtwork.category}
                </span>
                <h3 className="font-display text-3xl sm:text-5xl font-light tracking-[-0.03em] uppercase text-white">
                  {selectedArtwork.name}
                </h3>
                <span className="font-mono text-sm text-[#d4d4dc]">
                  From ₹{selectedArtwork.price} • {selectedArtwork.colorName}
                </span>
              </div>

              <p className="font-sans text-xs sm:text-sm text-[#9a9aa8] leading-relaxed">
                {selectedArtwork.description} Captured using dual-polarised macro illumination,
                revealing the true 3D topography of the collagen fibers.
              </p>

              <div className="p-4 border border-[#1e1e2c] bg-[#0a0a12]/70 font-mono text-xs text-[#808092] flex flex-col gap-1.5">
                <span className="text-white">SPECIFICATION OVERVIEW</span>
                <span>• Sensor: Medium Format Macro CCD</span>
                <span>• Spectral Lighting: 5400K Diffused Strobes</span>
                <span>• Resolution: Microscopic 0.01mm Stroma</span>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => {
                    addItem({
                      productId: "prod-print",
                      title: selectedArtwork.name,
                      format: "print",
                      size: "Gallery Medium (A3)",
                      price: selectedArtwork.price,
                      quantity: 1,
                      irisArtworkName: selectedArtwork.name,
                    });
                    setSelectedArtwork(null);
                  }}
                  className="inline-flex items-center gap-3 px-6 py-3.5 bg-[#7ec8e3] hover:bg-[#68bcdb] text-[#030304] text-xs font-sans font-semibold tracking-[0.20em] uppercase transition-all"
                >
                  <span>ADD TO ATELIER CART</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>

                <Link
                  href={`/products`}
                  onClick={() => setSelectedArtwork(null)}
                  className="px-6 py-3.5 border border-[#2a2a3a] hover:border-[#7ec8e3] text-xs font-mono tracking-[0.20em] uppercase text-white transition-all"
                >
                  VIEW ALL FORMATS
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
