"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { PRODUCTS_CATALOG } from "@/lib/products";
import { ArrowUpRight } from "lucide-react";
import OpticalTrace from "@/components/ui/OpticalTrace";

export default function ProductsPage() {
  return (
    <main className="relative bg-[#FAFAF8] text-[#090909] min-h-screen selection:bg-[#090909] selection:text-[#FAFAF8]">
      <Header />

      <section className="pt-32 pb-24 sm:pt-40 sm:pb-32 px-6 sm:px-12 md:px-16 max-w-7xl mx-auto">
        {/* ─── Curated Art Catalogue Header ─── */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-12 border-b border-[#090909]/15">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-xs font-mono tracking-[0.26em] text-[#706D68] uppercase">
              <span className="w-2 h-2 rounded-full bg-[#090909]" />
              <span>CURATED CATALOGUE</span>
            </div>
            <h1 className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-[-0.04em] uppercase text-[#090909] leading-[0.85]">
              PHYSICAL<br />EDITIONS.
            </h1>
          </div>

          <p className="max-w-md font-sans text-sm sm:text-base text-[#706D68] leading-relaxed pb-1">
            An overview of the materials, scales, and finishes crafted at our atelier. To configure bespoke sizing and purchase, visit the Atelier Shop.
          </p>
        </div>

        {/* ─── Staggered Editorial Catalogue Layout ─── */}
        <div className="flex flex-col gap-24 sm:gap-36 pt-16 sm:pt-24">
          {PRODUCTS_CATALOG.map((product, index) => {
            const isEven = index % 2 === 0;
            return (
              <section
                key={product.id}
                className={`flex flex-col ${
                  isEven ? "lg:flex-row" : "lg:flex-row-reverse"
                } items-center gap-12 lg:gap-20 pb-16 border-b border-[#090909]/10`}
              >
                {/* Large Product Photography */}
                <div className="relative w-full lg:w-3/5 aspect-square max-h-[580px] overflow-hidden bg-transparent">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    className="object-contain transition-transform duration-700 ease-out hover:scale-[1.02]"
                  />
                </div>

                {/* Editorial Metadata & Discovery Actions */}
                <div className="w-full lg:w-2/5 flex flex-col items-start gap-6">
                  <div className="space-y-2">
                    <span className="text-xs font-mono tracking-[0.24em] uppercase text-[#706D68]">
                      0{index + 1} • {product.category}
                    </span>
                    <h2 className="font-display text-4xl sm:text-5xl font-bold uppercase tracking-tight text-[#090909] leading-tight">
                      {product.name}
                    </h2>
                    <div className="font-mono text-xl font-bold text-[#090909] pt-1">
                      Starting from ${product.price}
                    </div>
                  </div>

                  <p className="font-sans text-sm sm:text-base text-[#706D68] leading-relaxed">
                    {product.description}
                  </p>

                  {/* Specifications & Available Formats */}
                  <div className="w-full space-y-2 py-4 border-y border-[#090909]/15 text-xs font-mono text-[#706D68]">
                    <div className="flex justify-between">
                      <span className="uppercase tracking-wider">FORMAT</span>
                      <span className="text-[#090909] font-bold">{product.formatLabel}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="uppercase tracking-wider">SIZING</span>
                      <span className="text-[#090909] font-bold">{product.sizes[0] || "Custom"}</span>
                    </div>
                  </div>

                  <Link
                    href={`/shop?format=${product.id.replace("prod-", "")}`}
                    className="group inline-flex items-center gap-3 px-8 py-4 bg-[#090909] text-[#FAFAF8] text-xs font-sans font-bold tracking-[0.22em] uppercase hover:bg-[#262626] transition-all"
                  >
                    <span>CONFIGURE IN SHOP</span>
                    <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                </div>
              </section>
            );
          })}
        </div>
      </section>

      <Footer />
    </main>
  );
}
