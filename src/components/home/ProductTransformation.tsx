"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, X, ChevronRight, Check } from "lucide-react";
import { PRODUCTS_CATALOG, ProductItem } from "@/lib/products";
import { useCart } from "@/lib/cart";

export default function ProductTransformation() {
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [addedNotification, setAddedNotification] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const offsetRef = useRef(0);
  const currentSpeedRef = useRef(1.15); // Base train speed (pixels per frame)
  const targetSpeedRef = useRef(1.15);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const lastXRef = useRef(0);
  const dragDistanceRef = useRef(0);
  const velocityRef = useRef(0);
  const rafIdRef = useRef<number | null>(null);

  const { addItem } = useCart();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when Product Details modal is open
  useEffect(() => {
    if (selectedProduct) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [selectedProduct]);

  // Global ESC key listener to close details modal
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedProduct) {
        setSelectedProduct(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedProduct]);

  // Doubled array for seamless wrap-around loop
  const displayItems = [...PRODUCTS_CATALOG, ...PRODUCTS_CATALOG];

  // Train animation ticker
  useEffect(() => {
    let lastTime = performance.now();

    const tick = (now: number) => {
      const dt = Math.min((now - lastTime) / 16.666, 2.5); // normalize to ~60fps
      lastTime = now;

      if (!isDraggingRef.current) {
        // Target speed: slow down to 0.28x on hover, gently return to 1.15x when unhovered
        targetSpeedRef.current = isHovered ? 0.28 : 1.15;

        // Smooth easing between speeds (no jerky sudden stops)
        currentSpeedRef.current += (targetSpeedRef.current - currentSpeedRef.current) * 0.08 * dt;

        // Apply friction to any residual drag velocity
        velocityRef.current *= 0.92;
        offsetRef.current -= (currentSpeedRef.current + velocityRef.current) * dt;
      }

      // Compute total width of one complete set of products
      // Card width (360px) + Gap (24px) = 384px per item
      const singleSetWidth = PRODUCTS_CATALOG.length * 384;

      // Infinite loop wrap-around without visible jump
      if (offsetRef.current <= -singleSetWidth) {
        offsetRef.current += singleSetWidth;
      } else if (offsetRef.current > 0) {
        offsetRef.current -= singleSetWidth;
      }

      if (trackRef.current) {
        trackRef.current.style.transform = `translate3d(${offsetRef.current}px, 0, 0)`;
      }

      rafIdRef.current = requestAnimationFrame(tick);
    };

    rafIdRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, [isHovered]);

  // Pointer drag handlers for touch & mouse swiping
  const handlePointerDown = (clientX: number) => {
    isDraggingRef.current = true;
    setIsDragging(true);
    startXRef.current = clientX;
    lastXRef.current = clientX;
    dragDistanceRef.current = 0;
    velocityRef.current = 0;
  };

  const handlePointerMove = (clientX: number) => {
    if (!isDraggingRef.current) return;
    const dx = clientX - lastXRef.current;
    lastXRef.current = clientX;
    dragDistanceRef.current += Math.abs(dx);
    offsetRef.current += dx;
    velocityRef.current = -dx * 0.45;
  };

  const handlePointerUp = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsDragging(false);
  };

  const handleCardClick = (product: ProductItem) => {
    // If pointer was dragged more than 6px, treat as drag rather than click
    if (dragDistanceRef.current > 6) return;
    setSelectedProduct(product);
  };

  const handleAddToCart = (product: ProductItem) => {
    addItem({
      productId: product.id,
      title: product.name,
      format: (product.id.replace("prod-", "") || "print") as any,
      size: product.sizes[0] || "Standard",
      price: product.price,
      quantity: 1,
      irisArtworkName: "Bespoke Iris Capture",
    });
    setAddedNotification(`Added ${product.name} to cart`);
    setTimeout(() => setAddedNotification(null), 3000);
  };

  return (
    <section
      id="products"
      ref={containerRef}
      className="relative z-30 w-full py-20 md:py-28 overflow-hidden bg-[#020204] text-white select-none border-t border-white/5"
    >
      {/* Section Header — Clean, Minimal Luxury */}
      <div className="relative z-10 max-w-7xl mx-auto w-full px-6 sm:px-10 md:px-16 flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-[10px] font-mono tracking-[0.28em] uppercase text-white/50">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span>04 / MATERIAL OBJECTS</span>
          </div>
          <h2 className="font-display text-4xl sm:text-6xl md:text-7xl font-light tracking-[-0.04em] uppercase text-[#f7f7fa]">
            MADE TO BE KEPT.
          </h2>
        </div>

        {/* Minimal hint */}
        <div className="flex items-center gap-3 text-xs font-mono text-white/40 tracking-widest uppercase">
          <span>DRAG TO SCRUB • HOVER TO INSPECT</span>
        </div>
      </div>

      {/* Train-like Continuous Product Carousel Container */}
      <div
        className="relative w-full cursor-grab active:cursor-grabbing overflow-visible py-4"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          handlePointerUp();
        }}
        onMouseDown={(e) => handlePointerDown(e.clientX)}
        onMouseMove={(e) => handlePointerMove(e.clientX)}
        onMouseUp={handlePointerUp}
        onTouchStart={(e) => handlePointerDown(e.touches[0].clientX)}
        onTouchMove={(e) => handlePointerMove(e.touches[0].clientX)}
        onTouchEnd={handlePointerUp}
      >
        {/* Left & Right Subtle Edge Vignettes */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 sm:w-36 bg-gradient-to-r from-[#020204] to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 sm:w-36 bg-gradient-to-l from-[#020204] to-transparent z-10" />

        {/* Moving Train Track */}
        <div
          ref={trackRef}
          className="flex gap-6 will-change-transform"
          style={{ width: "max-content" }}
        >
          {displayItems.map((prod, idx) => (
            <div
              key={`${prod.id}-${idx}`}
              onClick={() => handleCardClick(prod)}
              className="group relative w-[320px] sm:w-[360px] flex-shrink-0 bg-[#09090c] border border-white/10 hover:border-white/40 transition-all duration-500 flex flex-col justify-between p-5 cursor-pointer shadow-[0_12px_40px_rgba(0,0,0,0.6)]"
            >
              {/* Card Image Stage */}
              <div className="relative w-full aspect-[4/3] rounded-sm overflow-hidden bg-black/80 mb-5 border border-white/5">
                <Image
                  src={prod.image}
                  alt={prod.name}
                  fill
                  sizes="(max-width: 768px) 320px, 360px"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                {/* Subtle sheen highlight on hover */}
                <div className="absolute inset-0 bg-white/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>

              {/* Card Information */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono tracking-[0.24em] uppercase text-white/40">
                    {prod.formatLabel}
                  </span>
                  <span className="text-xs font-mono font-medium text-white/80">
                    From ₹{prod.price}
                  </span>
                </div>

                <h3 className="font-display text-xl font-light tracking-wide uppercase text-white group-hover:text-white transition-colors">
                  {prod.name}
                </h3>
              </div>

              {/* Card Compact CTA */}
              <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-[11px] font-mono tracking-wider uppercase text-white/60 group-hover:text-white transition-colors">
                  EXPLORE DETAILS
                </span>
                <span className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-white/60 group-hover:border-white group-hover:text-white group-hover:bg-white/10 transition-all">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Added Notification Toast */}
      {addedNotification && (
        <div className="fixed bottom-8 right-8 z-[100000] bg-white text-black px-5 py-3 text-xs font-mono tracking-wider uppercase flex items-center gap-3 shadow-2xl animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{addedNotification}</span>
        </div>
      )}

      {/* ─── Product Details Modal (Mounted via Portal above all UI) ─── */}
      {selectedProduct && mounted && typeof document !== "undefined" &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-8 md:p-12 bg-black/95 backdrop-blur-2xl text-white select-none animate-fadeIn"
          >
            {/* Close Button — Fully unobstructed fixed button with priority stacking */}
            <button
              onClick={() => setSelectedProduct(null)}
              className="fixed top-6 right-6 sm:top-8 sm:right-10 flex items-center gap-2 px-4 py-2.5 border border-white/20 bg-black/90 hover:bg-white hover:text-black text-xs font-mono tracking-widest text-white transition-all duration-300 z-[100000] cursor-pointer shadow-[0_8px_32px_rgba(0,0,0,0.9)]"
              aria-label="Close product details"
            >
              <span>CLOSE [ESC]</span>
              <X className="w-4 h-4" />
            </button>

            {/* Modal Body Container */}
            <div className="relative w-full max-w-5xl flex flex-col md:flex-row items-center justify-between gap-8 md:gap-14 my-auto overflow-y-auto max-h-[90vh] py-6">
              {/* Product Visual Presentation */}
              <div className="relative w-full md:w-[500px] aspect-[4/3] rounded-sm overflow-hidden border border-white/15 bg-[#060608] shadow-[0_20px_60px_rgba(0,0,0,0.85)] shrink-0">
                <Image
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  fill
                  sizes="(max-width: 768px) 90vw, 500px"
                  priority
                  className="object-cover"
                />
              </div>

              {/* Product Information & Actions */}
              <div className="flex flex-col gap-5 max-w-md text-left">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-mono tracking-[0.28em] uppercase text-white/50">
                    {selectedProduct.category} • {selectedProduct.formatLabel}
                  </span>
                  <h3 className="font-display text-3xl sm:text-4xl font-light tracking-[-0.03em] uppercase text-white">
                    {selectedProduct.name}
                  </h3>
                  <span className="font-mono text-base font-medium text-white/90">
                    Starting from ₹{selectedProduct.price}
                  </span>
                </div>

                {/* Short Elegant Description */}
                <p className="font-sans text-xs text-white/70 leading-relaxed">
                  {selectedProduct.description}
                </p>

                {/* Available Formats / Sizes */}
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-mono tracking-[0.20em] uppercase text-white/40">
                    AVAILABLE FORMATS
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.sizes.map((sz) => (
                      <span
                        key={sz}
                        className="px-3 py-1.5 border border-white/15 bg-white/[0.03] text-[11px] font-mono text-white/80"
                      >
                        {sz}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Personalization Note */}
                <div className="p-3.5 border border-white/10 bg-white/[0.02] text-[11px] font-mono text-white/60 flex flex-col gap-1">
                  <span className="text-white/80 uppercase font-medium tracking-wider">
                    PERSONALIZATION
                  </span>
                  <span>{selectedProduct.personalization}</span>
                </div>

                {/* CTAs: Order / Add to Cart + Book Session */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      handleAddToCart(selectedProduct);
                      setSelectedProduct(null);
                    }}
                    className="inline-flex items-center gap-3 px-6 py-3.5 bg-white hover:bg-neutral-200 text-black text-xs font-sans font-semibold tracking-[0.20em] uppercase transition-all cursor-pointer"
                  >
                    <span>ORDER FROM ₹{selectedProduct.price}</span>
                    <ArrowUpRight className="w-4 h-4 text-black" />
                  </button>

                  <Link
                    href="/book"
                    onClick={() => setSelectedProduct(null)}
                    className="px-6 py-3.5 border border-white/20 hover:border-white text-xs font-mono tracking-[0.20em] uppercase text-white transition-all cursor-pointer"
                  >
                    BOOK SESSION
                  </Link>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )
      }
    </section>
  );
}
