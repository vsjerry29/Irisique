"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { createPortal } from "react-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { PRODUCTS_CATALOG, ProductItem } from "@/lib/products";
import { useCart } from "@/lib/cart";
import { ArrowUpRight, X, Check, ShoppingBag } from "lucide-react";
import OpticalTrace from "@/components/ui/OpticalTrace";

export default function ShopPage() {
  const { addItem, setIsCartOpen } = useCart();

  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [addedNotice, setAddedNotice] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const modalContainerRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Update selected size when product opens
  useEffect(() => {
    if (selectedProduct && selectedProduct.sizes.length > 0) {
      setSelectedSize(selectedProduct.sizes[0]);
      setQuantity(1);
    }
  }, [selectedProduct]);

  // Modal accessibility: body scroll lock & Escape key
  useEffect(() => {
    if (!selectedProduct) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeBtnRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedProduct(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedProduct]);

  const categories = ["ALL", "Museum Wall Art", "Gallery Display", "Sculptural Object", "Luminescent Art", "Wearable Artifact", "Master Asset"];

  const filteredProducts = activeCategory === "ALL"
    ? PRODUCTS_CATALOG
    : PRODUCTS_CATALOG.filter((p) => p.category === activeCategory);

  const handleAddToCart = (product: ProductItem) => {
    addItem({
      productId: product.id,
      title: product.name,
      format: product.formatLabel,
      size: selectedSize || product.sizes[0] || "Standard",
      price: product.price,
      quantity: quantity,
      irisArtworkName: "Bespoke Biometric Stroma",
    });

    setAddedNotice(`Added ${quantity}× ${product.name} to atelier order`);
    setTimeout(() => setAddedNotice(null), 3000);
    setSelectedProduct(null);
  };

  return (
    <main className="relative bg-[#F4F1EA] text-[#090909] min-h-screen selection:bg-[#090909] selection:text-[#FAFAF8]">
      <Header />

      <section className="pt-32 pb-24 sm:pt-40 sm:pb-32 px-6 sm:px-12 md:px-16 max-w-7xl mx-auto">
        {/* ─── Asymmetrical Header ─── */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-12 border-b border-[#090909]/15">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-xs font-mono tracking-[0.26em] text-[#706D68] uppercase">
              <span className="w-2 h-2 rounded-full bg-[#090909]" />
              <span>ATELIER EDITIONS & FORMATS</span>
            </div>
            <h1 className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-[-0.04em] uppercase text-[#090909] leading-[0.85]">
              ATELIER<br />SHOP.
            </h1>
          </div>

          <p className="max-w-md font-sans text-sm sm:text-base text-[#706D68] leading-relaxed pb-1">
            Choose an archival medium for your biometric iris. Every physical edition is custom-crafted by master printmakers in Pondicherry.
          </p>
        </div>

        {/* ─── Category Filter Navigation ─── */}
        <div className="flex items-center gap-4 sm:gap-8 overflow-x-auto py-8 border-b border-[#090909]/10 text-xs font-mono uppercase tracking-wider scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap pb-1 border-b-2 transition-all cursor-pointer ${
                activeCategory === cat
                  ? "border-[#090909] text-[#090909] font-bold"
                  : "border-transparent text-[#706D68] hover:text-[#090909]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* ─── Editorial Asymmetrical Product Grid ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 sm:gap-16 pt-12 sm:pt-16">
          {filteredProducts.map((product) => (
            <article
              key={product.id}
              onClick={() => setSelectedProduct(product)}
              className="group flex flex-col cursor-pointer select-none"
            >
              {/* Product Photograph (Large, Sharp Studio Lighting, Zero Card Border) */}
              <div className="relative w-full aspect-square overflow-hidden bg-transparent">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-contain transition-transform duration-700 ease-out group-hover:scale-[1.025]"
                />
              </div>

              {/* Minimal Product Meta Embedded in Whitespace */}
              <div className="mt-6 flex flex-col gap-2 pt-4 border-t border-[#090909]/15">
                <div className="flex items-baseline justify-between gap-4">
                  <h2 className="font-sans text-lg font-bold uppercase tracking-[0.12em] text-[#090909]">
                    {product.name}
                  </h2>
                  <span className="font-mono text-sm text-[#090909] font-bold">
                    From ${product.price}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-[#706D68]">
                  <span className="font-sans">{product.formatLabel}</span>
                  <span className="font-sans tracking-[0.16em] uppercase text-[#090909] font-bold inline-flex items-center gap-1 group-hover:underline underline-offset-4">
                    SPECIFY ↗
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ─── UNIQUE PRODUCT POPUP: Paper Shutter Portfolio ─── */}
      {selectedProduct && mounted && typeof document !== "undefined" &&
        createPortal(
          <div
            ref={modalContainerRef}
            role="dialog"
            aria-modal="true"
            aria-label={`${selectedProduct.name} Configuration`}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#F4F1EA] text-[#090909] p-6 sm:p-12 md:p-16 select-none animate-fadeIn overflow-y-auto"
            onClick={() => setSelectedProduct(null)}
          >
            {/* Top-Right Safe Area Close Button */}
            <button
              ref={closeBtnRef}
              onClick={() => setSelectedProduct(null)}
              className="fixed right-6 sm:right-10 z-[110] flex items-center gap-2.5 px-4 py-2 text-xs font-mono tracking-[0.22em] uppercase text-[#090909] bg-[#FAFAF8] hover:bg-[#E8E4DC] border border-[#090909]/20 transition-all cursor-pointer"
              style={{ top: "max(1.5rem, env(safe-area-inset-top, 1.5rem))" }}
              aria-label="Close product portfolio"
            >
              <span>CLOSE [ESC]</span>
              <X className="w-4 h-4 text-[#090909]" />
            </button>

            {/* Paper Shutter Portfolio Content */}
            <div
              className="relative max-w-6xl w-full flex flex-col md:flex-row items-center gap-10 md:gap-16 my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Product Large Photograph */}
              <div className="relative w-full md:w-[55%] aspect-square max-h-[68vh] overflow-hidden flex items-center justify-center">
                <Image
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 55vw"
                  className="object-contain"
                />
              </div>

              {/* Specification & Selection Controls */}
              <div className="w-full md:w-[45%] flex flex-col items-start gap-6">
                <div>
                  <span className="text-xs font-mono tracking-[0.24em] uppercase text-[#706D68] block mb-2">
                    {selectedProduct.category} • {selectedProduct.formatLabel}
                  </span>
                  <h3 className="font-display text-4xl sm:text-5xl font-bold uppercase tracking-tight text-[#090909] leading-tight">
                    {selectedProduct.name}
                  </h3>
                  <div className="font-mono text-2xl font-bold text-[#090909] mt-2">
                    ${selectedProduct.price}
                  </div>
                </div>

                <p className="font-sans text-sm text-[#706D68] leading-relaxed">
                  {selectedProduct.description}
                </p>

                {/* Available Sizes / Variants */}
                {selectedProduct.sizes.length > 0 && (
                  <div className="w-full space-y-2 pt-2 border-t border-[#090909]/15">
                    <span className="text-xs font-mono tracking-widest uppercase text-[#090909] font-bold block">
                      ARCHIVAL SPECIFICATIONS:
                    </span>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {selectedProduct.sizes.map((s) => (
                        <button
                          key={s}
                          onClick={() => setSelectedSize(s)}
                          className={`px-4 py-2 text-xs font-mono uppercase tracking-wider transition-all border cursor-pointer ${
                            selectedSize === s
                              ? "bg-[#090909] text-white border-[#090909] font-bold"
                              : "bg-transparent text-[#090909] border-[#090909]/30 hover:border-[#090909]"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity & Action Controls */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full pt-4 border-t border-[#090909]/15">
                  <div className="flex items-center border border-[#090909]/30 text-xs font-mono h-12">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 h-full hover:bg-[#090909] hover:text-white transition-colors cursor-pointer"
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="px-4 font-bold min-w-[32px] text-center">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-4 h-full hover:bg-[#090909] hover:text-white transition-colors cursor-pointer"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => handleAddToCart(selectedProduct)}
                    className="flex-1 py-4 px-6 bg-[#090909] text-[#FAFAF8] text-xs font-sans font-bold tracking-[0.22em] uppercase hover:bg-[#262626] transition-all flex items-center justify-center gap-2 cursor-pointer h-12"
                  >
                    <span>ADD TO ATELIER ORDER</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Cart Toast Notification */}
      {addedNotice && (
        <div className="fixed bottom-8 right-8 z-[120] px-6 py-4 bg-[#090909] text-[#FAFAF8] text-xs font-mono tracking-widest uppercase flex items-center gap-3 shadow-2xl animate-fadeIn">
          <Check className="w-4 h-4 text-white" />
          <span>{addedNotice}</span>
          <button
            onClick={() => setIsCartOpen(true)}
            className="ml-3 underline underline-offset-4 font-bold hover:text-white"
          >
            VIEW CART
          </button>
        </div>
      )}

      <Footer />
    </main>
  );
}
