"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, X, Check } from "lucide-react";
import { HOMEPAGE_COLLECTION, ProductItem } from "@/lib/products";
import { useCart } from "@/lib/cart";

export default function ProductTransformation() {
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [addedNotification, setAddedNotification] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>("");

  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const offsetRef = useRef(0);
  // Speed target: 140 px/s normal (~2.33 px/frame at 60fps)
  // Hover target: 45 px/s (~0.75 px/frame at 60fps)
  const currentSpeedRef = useRef(2.33);
  const targetSpeedRef = useRef(2.33);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const lastXRef = useRef(0);
  const dragDistanceRef = useRef(0);
  const velocityRef = useRef(0);
  const rafIdRef = useRef<number | null>(null);
  const isHoveredRef = useRef(false);
  const selectedProductRef = useRef<ProductItem | null>(null);

  useEffect(() => {
    isHoveredRef.current = isHovered;
  }, [isHovered]);

  useEffect(() => {
    selectedProductRef.current = selectedProduct;
  }, [selectedProduct]);

  const { addItem } = useCart();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Set default size when selectedProduct changes
  useEffect(() => {
    if (selectedProduct && selectedProduct.sizes.length > 0) {
      setSelectedSize(selectedProduct.sizes[0]);
    }
  }, [selectedProduct]);

  // Lock body scroll when Product Details overlay is open
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

  // Duplicate items 4 times for an expansive, seamless loop
  const displayItems = [
    ...HOMEPAGE_COLLECTION,
    ...HOMEPAGE_COLLECTION,
    ...HOMEPAGE_COLLECTION,
    ...HOMEPAGE_COLLECTION,
  ];

  // Train animation ticker with Two Halves kinetic tuning
  useEffect(() => {
    let lastTime = performance.now();

    const tick = (now: number) => {
      const dt = Math.min((now - lastTime) / 16.666, 2.5); // normalize to ~60fps
      lastTime = now;

      // Suspend carousel while modal is open for optimal usability
      if (selectedProductRef.current) {
        rafIdRef.current = requestAnimationFrame(tick);
        return;
      }

      if (!isDraggingRef.current) {
        // Target: 140px/s (~2.33px/frame) on normal, 45px/s (~0.75px/frame) on hover
        targetSpeedRef.current = isHoveredRef.current ? 0.75 : 2.33;

        // Smooth easing over 600–800ms (lerp factor 0.045 per frame)
        currentSpeedRef.current += (targetSpeedRef.current - currentSpeedRef.current) * 0.045 * dt;

        // Apply friction to residual drag velocity
        velocityRef.current *= 0.90;
        offsetRef.current -= (currentSpeedRef.current + velocityRef.current) * dt;
      }

      // Single set width: 5 items * (540px width + 56px gap) = 2980px
      const itemWidthWithGap = 596;
      const singleSetWidth = HOMEPAGE_COLLECTION.length * itemWidthWithGap;

      // Mathematical infinite loop wrap-around without visible jump
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
  }, []);

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

  const handleItemClick = (product: ProductItem) => {
    if (dragDistanceRef.current > 8) return;
    setSelectedProduct(product);
  };

  const handleAddToCart = (product: ProductItem) => {
    addItem({
      productId: product.id,
      title: product.name,
      format: (product.id.replace("prod-", "") || "print") as any,
      size: selectedSize || product.sizes[0] || "Standard",
      price: product.price,
      quantity: 1,
      irisArtworkName: "Bespoke Iris Capture",
    });
    setAddedNotification(`Added ${product.name} to atelier order`);
    setTimeout(() => setAddedNotification(null), 3000);
  };

  return (
    <section
      id="collection"
      data-section="collection"
      data-theme="light"
      ref={containerRef}
      className="relative z-30 w-full py-24 sm:py-32 md:py-44 overflow-hidden bg-[#F4F1EA] text-[#090909] select-none border-t border-[#090909]/15"
    >
      <div id="editions" className="sr-only" />
      {/* ─── Two Halves-Style Asymmetrical Section Header ─── */}
      <div className="max-w-7xl mx-auto w-full px-6 sm:px-10 md:px-16 lg:px-24 flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16 sm:mb-24">
        <div className="space-y-4">
          <span className="text-xs font-sans tracking-[0.24em] text-[#77736D] uppercase font-bold">
            THE COLLECTION
          </span>
          <h2 className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-[-0.04em] uppercase text-[#090909] leading-[0.88]">
            MADE TO<br />BE KEPT.
          </h2>
        </div>

        <div className="flex items-center gap-8">
          <Link
            href="/shop"
            className="group inline-flex items-center gap-2 text-xs font-sans tracking-[0.20em] uppercase font-bold text-[#090909] hover:opacity-70 transition-opacity"
          >
            <span>FULL ARCHIVE [SHOP]</span>
            <ArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </div>

      {/* ─── Seamless Horizontal Editorial Product Strip (NO CARDS, NO BOXES) ─── */}
      <div
        className="relative w-full cursor-grab active:cursor-grabbing overflow-visible py-4"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          handlePointerUp();
        }}
        onPointerEnter={() => setIsHovered(true)}
        onPointerLeave={() => {
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
        <div
          ref={trackRef}
          data-product-track="true"
          className="flex items-start gap-14 will-change-transform select-none pl-6 sm:pl-10 md:pl-16"
          style={{ width: "max-content" }}
        >
          {displayItems.map((product, index) => (
            <div
              key={`${product.id}-${index}`}
              data-product-card="true"
              onClick={() => handleItemClick(product)}
              className="flex-shrink-0 w-[320px] sm:w-[440px] md:w-[540px] flex flex-col group cursor-pointer"
            >
              {/* Product Photograph (Large, Natural Studio Lighting, Zero Card Border) */}
              <div className="relative w-full aspect-square overflow-hidden bg-transparent transition-transform duration-500 ease-out group-hover:scale-[1.02]">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 640px) 320px, (max-width: 768px) 440px, 540px"
                  className="object-contain pointer-events-none"
                  draggable={false}
                />
              </div>

              {/* Minimal Product Meta (Elegantly positioned in negative space) */}
              <div className="mt-6 flex flex-col gap-2 px-1 border-t border-[#090909]/10 pt-4">
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="font-sans text-base sm:text-lg font-bold tracking-[0.12em] uppercase text-[#090909]">
                    {product.name}
                  </h3>
                  <span className="font-mono text-sm text-[#77736D] tracking-wider">
                    From ${product.price}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-[#77736D] pt-1">
                  <span className="font-sans tracking-wide">
                    {product.formatLabel}
                  </span>
                  <span className="font-sans tracking-[0.16em] uppercase text-[#090909] font-bold inline-flex items-center gap-1 group-hover:underline underline-offset-4">
                    DETAILS ↗
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Cart Toast Notification ─── */}
      {addedNotification && (
        <div className="fixed bottom-8 right-8 z-[100000] px-6 py-4 bg-[#090909] text-[#FAFAF8] text-xs font-mono tracking-widest uppercase flex items-center gap-3 shadow-2xl animate-fadeIn">
          <Check className="w-4 h-4 text-white" />
          <span>{addedNotification}</span>
        </div>
      )}

      {/* ─── Fullscreen Editorial Product Details Overlay (Portal Mounted) ─── */}
      {selectedProduct && mounted && typeof document !== "undefined" &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`${selectedProduct.name} Details`}
            className="fixed inset-0 z-[99999] flex items-center justify-center bg-[#090909]/98 backdrop-blur-2xl text-[#FAFAF8] p-6 sm:p-12 md:p-16 select-none animate-fadeIn"
            onClick={() => setSelectedProduct(null)}
          >
            {/* Unobstructed Fixed Close Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedProduct(null);
              }}
              aria-label="Close product details"
              className="fixed right-6 sm:right-10 z-[100000] p-3 text-[#FAFAF8] bg-white/10 hover:bg-white/20 border border-white/20 rounded-none transition-all duration-200 backdrop-blur-md cursor-pointer"
              style={{ top: "max(1.5rem, env(safe-area-inset-top, 1.5rem))" }}
            >
              <X className="w-5 h-5" />
            </button>

            {/* Editorial Content Container */}
            <div
              className="relative max-w-5xl w-full flex flex-col md:flex-row items-center gap-8 md:gap-14 my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Product Large Photograph */}
              <div className="relative w-full md:w-1/2 aspect-square max-h-[58vh] bg-transparent overflow-hidden">
                <Image
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-contain p-2"
                />
              </div>

              {/* Product Specifications & Purchase Actions */}
              <div className="w-full md:w-1/2 flex flex-col items-start gap-6">
                <div>
                  <span className="text-xs font-mono tracking-[0.24em] uppercase text-[#D8D4CC]/70 block mb-2">
                    {selectedProduct.category} • {selectedProduct.formatLabel}
                  </span>
                  <h3 className="font-display text-4xl sm:text-5xl font-bold uppercase tracking-tight text-white leading-tight">
                    {selectedProduct.name}
                  </h3>
                </div>

                <div className="font-mono text-2xl text-white">
                  ${selectedProduct.price}
                </div>

                <p className="font-sans text-sm text-[#D8D4CC] leading-relaxed">
                  {selectedProduct.description}
                </p>

                {/* Available Sizes */}
                {selectedProduct.sizes.length > 0 && (
                  <div className="w-full space-y-2 pt-1">
                    <span className="text-xs font-mono tracking-widest uppercase text-white/60 block">
                      ARCHIVAL SPECIFICATIONS:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.sizes.map((s) => (
                        <button
                          key={s}
                          onClick={() => setSelectedSize(s)}
                          className={`px-4 py-2 text-xs font-mono uppercase tracking-wider transition-all duration-200 border ${
                            selectedSize === s
                              ? "bg-white text-black border-white font-bold"
                              : "bg-white/5 text-white/80 border-white/20 hover:border-white/50"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Confident Rectangular Actions */}
                <div className="flex items-center gap-4 pt-3 w-full">
                  <button
                    onClick={() => handleAddToCart(selectedProduct)}
                    className="flex-1 py-4 bg-white text-black text-xs font-sans font-bold tracking-[0.22em] uppercase hover:bg-neutral-200 transition-colors text-center"
                  >
                    ADD TO ATELIER ORDER →
                  </button>
                  <Link
                    href="/shop"
                    onClick={() => setSelectedProduct(null)}
                    className="px-6 py-4 border border-white/30 text-white text-xs font-mono tracking-[0.20em] uppercase hover:border-white transition-colors text-center"
                  >
                    SHOP ARCHIVE
                  </Link>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </section>
  );
}
