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
  const currentSpeedRef = useRef(1.5); // Normal speed: ~90px/s (~1.5px/frame at 60fps)
  const targetSpeedRef = useRef(1.5);
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
    return () => window.removeEventListener("keydown", handleKeyRelease);
  }, [selectedProduct]);

  const handleKeyRelease = (e: KeyboardEvent) => {
    if (e.key === "Escape") setSelectedProduct(null);
  };

  // We duplicate the 5 items 4 times to ensure an uninterrupted, wide seamless rail
  const displayItems = [
    ...HOMEPAGE_COLLECTION,
    ...HOMEPAGE_COLLECTION,
    ...HOMEPAGE_COLLECTION,
    ...HOMEPAGE_COLLECTION,
  ];

  // Train animation ticker
  useEffect(() => {
    let lastTime = performance.now();

    const tick = (now: number) => {
      const dt = Math.min((now - lastTime) / 16.666, 2.5); // normalize to ~60fps
      lastTime = now;

      // If modal is open, suspend carousel movement for usability
      if (selectedProduct) {
        rafIdRef.current = requestAnimationFrame(tick);
        return;
      }

      if (!isDraggingRef.current) {
        // Normal speed: 1.5 px/frame (~90px/s)
        // Hover speed: 0.30 px/frame (~18px/s) — slows down gracefully without stopping completely
        targetSpeedRef.current = isHovered ? 0.30 : 1.5;

        // Smooth easing between speeds (no abrupt jumps)
        currentSpeedRef.current += (targetSpeedRef.current - currentSpeedRef.current) * 0.06 * dt;

        // Apply friction to residual drag velocity
        velocityRef.current *= 0.92;
        offsetRef.current -= (currentSpeedRef.current + velocityRef.current) * dt;
      }

      // Single set width: 5 items * (420px image width + 48px gap) = 2340px
      const itemWidthWithGap = 468;
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
  }, [isHovered, selectedProduct]);

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
    velocityRef.current = -dx * 0.4;
  };

  const handlePointerUp = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsDragging(false);
  };

  const handleItemClick = (product: ProductItem) => {
    if (dragDistanceRef.current > 6) return;
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
    setAddedNotification(`Added ${product.name} to collection`);
    setTimeout(() => setAddedNotification(null), 3000);
  };

  return (
    <section
      id="collection"
      data-theme="light"
      ref={containerRef}
      className="relative z-30 w-full py-24 sm:py-32 md:py-40 overflow-hidden bg-[#F5F2EC] text-[#080808] select-none border-t border-[#080808]/10"
    >
      {/* Section Header — Clean Editorial Typography */}
      <div className="max-w-7xl mx-auto w-full px-6 sm:px-10 md:px-16 lg:px-24 flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 sm:mb-20">
        <div>
          <span className="text-[11px] font-mono tracking-[0.28em] uppercase text-[#77736D] block mb-3">
            03 / THE COLLECTION
          </span>
          <h2 className="font-display text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-light tracking-[-0.04em] uppercase text-[#080808] leading-[0.92]">
            MADE TO BE KEPT.
          </h2>
        </div>

        <div className="flex items-center gap-6">
          <Link
            href="/shop"
            className="group inline-flex items-center gap-2 text-xs font-sans tracking-[0.20em] uppercase font-semibold text-[#080808] hover:opacity-70 transition-opacity"
          >
            <span>FULL CATALOG</span>
            <ArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </div>

      {/* ─── Continuous Horizontal Product Train (NO BOXED CARDS) ─── */}
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
        <div
          ref={trackRef}
          className="flex items-start gap-12 will-change-transform select-none pl-6 sm:pl-10 md:pl-16"
          style={{ width: "max-content" }}
        >
          {displayItems.map((product, index) => (
            <div
              key={`${product.id}-${index}`}
              onClick={() => handleItemClick(product)}
              className="flex-shrink-0 w-[300px] sm:w-[380px] md:w-[420px] flex flex-col group cursor-pointer"
            >
              {/* Product Photograph (Clean, Borderless, Natural Studio Shadow) */}
              <div className="relative w-full aspect-square overflow-hidden bg-transparent transition-transform duration-500 ease-out group-hover:scale-[1.015]">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 640px) 300px, (max-width: 768px) 380px, 420px"
                  className="object-contain pointer-events-none"
                  draggable={false}
                />
              </div>

              {/* Minimal Product Meta (Placed elegantly beneath photography) */}
              <div className="mt-5 flex flex-col gap-1.5 px-1">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="font-sans text-sm sm:text-base font-semibold tracking-[0.14em] uppercase text-[#080808]">
                    {product.name}
                  </h3>
                  <span className="font-mono text-xs text-[#77736D] tracking-wider">
                    From ${product.price}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#77736D] pt-1">
                  <span className="font-sans tracking-wide">
                    {product.formatLabel}
                  </span>
                  <span className="font-sans tracking-[0.18em] uppercase text-[#080808] font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 inline-flex items-center gap-1">
                    DETAILS <ArrowUpRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Cart Toast Notification ─── */}
      {addedNotification && (
        <div className="fixed bottom-8 right-8 z-[100000] px-5 py-3.5 bg-[#080808] text-[#F5F2EC] text-xs font-mono tracking-widest uppercase flex items-center gap-3 shadow-2xl animate-fadeIn">
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
            className="fixed inset-0 z-[99999] flex items-center justify-center bg-[#080808]/96 backdrop-blur-2xl text-[#F5F2EC] p-6 sm:p-12 md:p-16 select-none animate-fadeIn"
            onClick={() => setSelectedProduct(null)}
          >
            {/* Unobstructed Fixed Close Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedProduct(null);
              }}
              aria-label="Close product details"
              className="fixed right-6 sm:right-10 z-[100000] p-3 text-[#F5F2EC] bg-white/10 hover:bg-white/20 border border-white/20 rounded-none transition-all duration-200 backdrop-blur-md cursor-pointer"
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
              <div className="relative w-full md:w-1/2 aspect-square max-h-[55vh] bg-transparent overflow-hidden">
                <Image
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-contain p-4"
                />
              </div>

              {/* Product Specifications & Purchase Actions */}
              <div className="w-full md:w-1/2 flex flex-col items-start gap-5">
                <div>
                  <span className="text-[10px] font-mono tracking-[0.28em] uppercase text-white/50 block mb-1">
                    {selectedProduct.category} • {selectedProduct.formatLabel}
                  </span>
                  <h3 className="font-display text-3xl sm:text-4xl lg:text-5xl font-light uppercase tracking-tight text-white leading-tight">
                    {selectedProduct.name}
                  </h3>
                </div>

                <div className="font-mono text-xl sm:text-2xl text-white">
                  ${selectedProduct.price}
                </div>

                <p className="font-sans text-xs sm:text-sm text-[#E8E6E1]/80 leading-relaxed">
                  {selectedProduct.description}
                </p>

                {/* Sizes Selector */}
                {selectedProduct.sizes.length > 0 && (
                  <div className="w-full space-y-2 pt-2">
                    <span className="text-[10px] font-mono tracking-widest uppercase text-white/50 block">
                      AVAILABLE SIZES:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.sizes.map((s) => (
                        <button
                          key={s}
                          onClick={() => setSelectedSize(s)}
                          className={`px-3.5 py-1.5 text-xs font-mono uppercase tracking-wider transition-all duration-200 border ${
                            selectedSize === s
                              ? "bg-white text-black border-white font-semibold"
                              : "bg-white/5 text-white/80 border-white/20 hover:border-white/50"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Primary Action Button */}
                <div className="flex items-center gap-4 pt-4 w-full">
                  <button
                    onClick={() => handleAddToCart(selectedProduct)}
                    className="flex-1 py-4 bg-white text-black text-xs font-sans font-semibold tracking-[0.22em] uppercase hover:bg-neutral-200 transition-colors text-center"
                  >
                    ADD TO ATELIER ORDER
                  </button>
                  <Link
                    href="/shop"
                    onClick={() => setSelectedProduct(null)}
                    className="px-6 py-4 border border-white/30 text-white text-xs font-mono tracking-[0.20em] uppercase hover:border-white transition-colors text-center"
                  >
                    VIEW IN SHOP
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
