"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/layout/Header";
import { PRODUCTS_CATALOG } from "@/lib/data";
import { Product, ProductVariant } from "@/lib/types";
import { useCart } from "@/lib/cart";
import { ArrowUpRight, Check, Eye, X } from "lucide-react";

export default function ProductsPage() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const { addItem } = useCart();

  const handleOpenProduct = (prod: Product) => {
    setSelectedProduct(prod);
    setSelectedVariant(prod.variants[0] || null);
  };

  const handleAddToCart = (prod: Product, variant: ProductVariant | null) => {
    const v = variant || prod.variants[0];
    addItem({
      productId: prod.id,
      title: prod.title,
      format: prod.format,
      size: v ? v.size : "Standard",
      price: v ? v.price : prod.startingPrice,
      quantity: 1,
      personalisationText: "Studio Calibrated Stroma",
    });
  };

  return (
    <main className="relative bg-[#030405] text-[#f0f0f2] min-h-screen selection:bg-[#7ec8e3]/30">
      <Header />

      {/* Page Header */}
      <section className="pt-32 pb-14 px-6 sm:px-12 md:px-16 max-w-7xl mx-auto border-b border-[#161622]">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2.5 text-[10px] font-mono tracking-[0.30em] uppercase text-[#7ec8e3]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7ec8e3] animate-pulse" />
            <span>COLLECTION CATALOGUE</span>
          </div>
          <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-light tracking-[-0.035em] uppercase text-white">
            EDITIONS & FORMATS.
          </h1>
          <p className="max-w-xl text-xs sm:text-sm font-sans text-[#8e8e9c] leading-relaxed pt-2">
            Every piece is custom-rendered from your high-resolution stroma capture.
            Choose between raw digital masters, archival cotton rag prints, or deep aluminum box frames.
          </p>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-16 px-6 sm:px-12 md:px-16 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          {PRODUCTS_CATALOG.map((prod) => (
            <div
              key={prod.id}
              className="group flex flex-col justify-between border border-[#1a1a28] bg-[#07070c]/70 hover:border-[#7ec8e3]/60 transition-all duration-300"
            >
              {/* Image with Lightbox Trigger */}
              <div className="relative w-full aspect-[4/3] bg-[#050508] overflow-hidden">
                <Image
                  src={prod.image}
                  alt={prod.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transform transition-transform duration-700 group-hover:scale-105"
                />
                <button
                  onClick={() => setLightboxImage(prod.image)}
                  className="absolute bottom-3 right-3 p-2 bg-black/70 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Expand artwork"
                >
                  <Eye className="w-4 h-4 text-[#7ec8e3]" />
                </button>
              </div>

              {/* Information */}
              <div className="p-6 flex flex-col gap-4 flex-1 justify-between">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] tracking-widest uppercase text-[#7ec8e3]">
                      {prod.format}
                    </span>
                    <span className="font-mono text-xs text-[#d8d8e2]">
                      From ₹{prod.startingPrice}
                    </span>
                  </div>
                  <h3 className="font-display text-xl font-light text-white uppercase tracking-wide">
                    {prod.title}
                  </h3>
                  <p className="text-xs font-sans text-[#808092] line-clamp-2 leading-relaxed">
                    {prod.description}
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-3 border-t border-[#161622]">
                  <button
                    onClick={() => handleOpenProduct(prod)}
                    className="flex-1 py-2.5 border border-[#222230] hover:border-[#7ec8e3] text-xs font-mono tracking-wider uppercase text-white transition-colors"
                  >
                    OPTIONS & SPECS
                  </button>
                  <button
                    onClick={() => handleAddToCart(prod, null)}
                    className="px-4 py-2.5 bg-[#7ec8e3] hover:bg-[#68bcdb] text-[#030304] text-xs font-sans font-semibold uppercase tracking-wider transition-colors"
                  >
                    SELECT
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Product Options Modal ─── */}
      {selectedProduct && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl animate-fadeIn"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="relative w-full max-w-xl p-6 sm:p-8 bg-[#09090f] border border-[#242436] text-left flex flex-col gap-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#181824] pb-4">
              <div className="flex flex-col gap-1">
                <span className="font-mono text-[10px] tracking-widest uppercase text-[#7ec8e3]">
                  {selectedProduct.format} SPECIFICATION
                </span>
                <h3 className="font-display text-2xl uppercase text-white">
                  {selectedProduct.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="text-[#777788] hover:text-white text-xs font-mono"
              >
                CLOSE [ESC]
              </button>
            </div>

            {/* Size Variants */}
            <div className="flex flex-col gap-3">
              <span className="font-mono text-xs text-[#9999aa] uppercase tracking-wider">
                Select Scale / Variant:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedProduct.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    className={`p-3 border text-left flex flex-col gap-1 transition-all ${
                      selectedVariant?.id === v.id
                        ? "border-[#7ec8e3] bg-[#7ec8e3]/10"
                        : "border-[#1e1e2c] bg-[#0c0c14] hover:border-[#333348]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-sans text-xs font-medium text-white">
                        {v.name}
                      </span>
                      <span className="font-mono text-xs text-[#7ec8e3]">
                        ₹{v.price}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-[#777788]">
                      {v.size}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Key Features */}
            <div className="p-4 border border-[#1c1c28] bg-[#06060a] flex flex-col gap-2 font-mono text-xs text-[#8e8e9c]">
              <span className="text-white text-[11px] tracking-wider uppercase">
                INCLUDED ATELIER ARCHIVAL STANDARDS
              </span>
              {selectedProduct.features.map((feat, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#7ec8e3]" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-[#181824] pt-4 flex items-center justify-between">
              <span className="font-mono text-base font-semibold text-white">
                Total: ₹{selectedVariant ? selectedVariant.price : selectedProduct.startingPrice}
              </span>
              <button
                onClick={() => {
                  handleAddToCart(selectedProduct, selectedVariant);
                  setSelectedProduct(null);
                }}
                className="px-6 py-3 bg-[#7ec8e3] hover:bg-[#68bcdb] text-[#030304] text-xs font-sans font-semibold uppercase tracking-[0.20em] transition-all"
              >
                ADD TO ATELIER CART
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Lightbox Fullscreen Modal ─── */}
      {lightboxImage && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl animate-fadeIn"
          onClick={() => setLightboxImage(null)}
        >
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-6 right-6 p-2 text-white hover:text-[#7ec8e3]"
            aria-label="Close lightbox"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="relative w-full max-w-4xl aspect-square sm:aspect-[4/3] rounded-lg overflow-hidden border border-[#222232]">
            <Image
              src={lightboxImage}
              alt="Expanded Iris Artwork"
              fill
              className="object-contain"
            />
          </div>
        </div>
      )}
    </main>
  );
}
