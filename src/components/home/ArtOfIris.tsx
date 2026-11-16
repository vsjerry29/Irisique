"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { createPortal } from "react-dom";
import { ArrowUpRight, X } from "lucide-react";
import gsap from "gsap";

export interface ArtworkComposition {
  id: "solo" | "couple" | "family";
  label: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  aspect: string; // for responsive framing
  dimensions: string;
}

const COMPOSITIONS: ArtworkComposition[] = [
  {
    id: "solo",
    label: "Solo",
    title: "The Singular Microcosm",
    subtitle: "One Subject • Individual Stroma",
    description: "An intimate, microscopic exploration of individual identity. Every crypt, furrow, and collarette ring captured in singular biometric purity.",
    image: "/assets/gallery/iris_sapphire.webp",
    aspect: "aspect-square",
    dimensions: "Square Format • Up to 100 × 100 cm",
  },
  {
    id: "couple",
    label: "Couple",
    title: "Dual Harmony",
    subtitle: "Two Subjects • Interwoven Resonance",
    description: "Two distinct worlds merging into one continuous visual dialogue. The delicate filaments of two irises converge in natural equilibrium.",
    image: "/assets/couple/couple_artwork_final.webp",
    aspect: "aspect-[16/9]",
    dimensions: "Panoramic Format • Up to 160 × 80 cm",
  },
  {
    id: "family",
    label: "Family",
    title: "Cosmic Constellation",
    subtitle: "Three to Five Subjects • Heritage Matrix",
    description: "A monumental heritage composition uniting generational patterns in balanced cosmic spacing. An enduring familial centerpiece.",
    image: "/assets/art/family_artwork_final.webp",
    aspect: "aspect-[16/9]",
    dimensions: "Grand Panoramic • Up to 200 × 90 cm",
  },
];

export default function ArtOfIris() {
  const [activeId, setActiveId] = useState<"solo" | "couple" | "family">("solo");
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const artworkContainerRef = useRef<HTMLDivElement>(null);
  const activeComp = COMPOSITIONS.find((c) => c.id === activeId)!;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isDetailOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [isDetailOpen]);

  // ESC key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isDetailOpen) {
        setIsDetailOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDetailOpen]);

  const handleSelect = (id: "solo" | "couple" | "family") => {
    if (id === activeId) return;

    if (artworkContainerRef.current) {
      // Smooth gallery transition: subtle fade and scale reveal
      gsap.to(artworkContainerRef.current, {
        opacity: 0.15,
        scale: 0.985,
        duration: 0.22,
        ease: "power2.inOut",
        onComplete: () => {
          setActiveId(id);
          gsap.to(artworkContainerRef.current, {
            opacity: 1,
            scale: 1,
            duration: 0.38,
            ease: "power2.out",
          });
        },
      });
    } else {
      setActiveId(id);
    }
  };

  return (
    <section
      id="art"
      data-theme="light"
      className="relative z-30 w-full min-h-screen py-24 sm:py-32 md:py-40 bg-[#F5F2EC] text-[#080808] px-6 sm:px-10 md:px-16 lg:px-24 flex flex-col justify-between select-none"
    >
      {/* ─── Top Editorial Header ─── */}
      <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row md:items-end justify-between gap-6 pb-12 sm:pb-16 border-b border-[#080808]/10">
        <div>
          <span className="text-[11px] font-mono tracking-[0.28em] uppercase text-[#77736D] block mb-3">
            02 / THE ART OF IRIS
          </span>
          <h2 className="font-display text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-light tracking-[-0.04em] uppercase text-[#080808] leading-[0.92]">
            EVERY IRIS IS ART.
          </h2>
        </div>

        {/* Minimal Typographic Selection Controls (No bordered tabs, no cards) */}
        <div className="flex items-center gap-8 sm:gap-10 pt-4 md:pt-0">
          {COMPOSITIONS.map((comp) => {
            const isActive = comp.id === activeId;
            return (
              <button
                key={comp.id}
                onClick={() => handleSelect(comp.id)}
                className={`group relative text-sm sm:text-base font-sans tracking-[0.20em] uppercase transition-all duration-300 cursor-pointer ${
                  isActive
                    ? "font-semibold text-[#080808]"
                    : "font-normal text-[#77736D] hover:text-[#080808]"
                }`}
              >
                <span>{comp.label}</span>
                {/* Minimal black underline indicator */}
                <span
                  className={`absolute -bottom-1.5 left-0 w-full h-[1.5px] bg-[#080808] transition-all duration-300 ${
                    isActive ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0 group-hover:opacity-40 group-hover:scale-x-75"
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Central Large Artwork Presentation (50–65% width with whitespace) ─── */}
      <div className="max-w-7xl mx-auto w-full my-auto py-12 sm:py-16 md:py-20 flex flex-col items-center">
        <div
          ref={artworkContainerRef}
          className="w-full max-w-4xl flex flex-col items-center will-change-transform"
        >
          {/* Frameless Artwork Visual */}
          <div
            className={`relative w-full ${activeComp.aspect} max-h-[68vh] overflow-hidden bg-[#080808] shadow-[0_24px_64px_rgba(8,8,8,0.12)] cursor-pointer group`}
            onClick={() => setIsDetailOpen(true)}
            title="Click to view artwork details"
          >
            <Image
              src={activeComp.image}
              alt={activeComp.title}
              fill
              priority
              sizes="(max-width: 1024px) 90vw, 65vw"
              className="object-contain p-4 sm:p-8 transition-transform duration-700 ease-out group-hover:scale-[1.015]"
            />
          </div>

          {/* Minimal Caption & Dimensions */}
          <div className="w-full flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 mt-6 text-[#77736D]">
            <div className="flex items-baseline gap-3">
              <span className="text-xs font-mono tracking-[0.24em] uppercase text-[#080808] font-medium">
                {activeComp.title}
              </span>
              <span className="text-[11px] font-sans tracking-wide">
                — {activeComp.subtitle}
              </span>
            </div>

            <div className="flex items-center gap-6">
              <span className="text-[11px] font-mono tracking-wider">
                {activeComp.dimensions}
              </span>
              <button
                onClick={() => setIsDetailOpen(true)}
                className="group inline-flex items-center gap-1.5 text-xs font-sans tracking-[0.18em] uppercase text-[#080808] font-medium hover:opacity-70 transition-opacity"
              >
                <span>EXPLORE ARTWORK</span>
                <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Bottom Subtle Rule ─── */}
      <div className="max-w-7xl mx-auto w-full pt-8 flex items-center justify-between text-[10px] font-mono tracking-[0.26em] uppercase text-[#77736D] border-t border-[#080808]/10">
        <span>CURATED ATELIER ARCHIVE</span>
        <span>PONDICHERRY • WHITE TOWN</span>
      </div>

      {/* ─── Fullscreen Editorial Artwork Detail Modal (Portal Mounted) ─── */}
      {isDetailOpen && mounted && typeof document !== "undefined" &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`${activeComp.title} Details`}
            className="fixed inset-0 z-[99999] flex items-center justify-center bg-[#080808]/96 backdrop-blur-2xl text-[#F5F2EC] p-6 sm:p-12 md:p-16 select-none animate-fadeIn"
            onClick={() => setIsDetailOpen(false)}
          >
            {/* Fixed Close Button (Inside viewport above header) */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsDetailOpen(false);
              }}
              aria-label="Close artwork details"
              className="fixed right-6 sm:right-10 z-[100000] p-3 text-[#F5F2EC] bg-white/10 hover:bg-white/20 border border-white/20 rounded-none transition-all duration-200 backdrop-blur-md cursor-pointer"
              style={{ top: "max(1.5rem, env(safe-area-inset-top, 1.5rem))" }}
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Body */}
            <div
              className="relative max-w-5xl w-full flex flex-col md:flex-row items-center gap-8 md:gap-14 my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Artwork Large View */}
              <div className="relative w-full md:w-3/5 aspect-square max-h-[60vh] bg-black overflow-hidden shadow-2xl">
                <Image
                  src={activeComp.image}
                  alt={activeComp.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 55vw"
                  className="object-contain p-4 sm:p-6"
                />
              </div>

              {/* Editorial Details */}
              <div className="w-full md:w-2/5 flex flex-col items-start gap-5">
                <span className="text-[10px] font-mono tracking-[0.28em] uppercase text-white/50">
                  COMPOSITION • {activeComp.label}
                </span>

                <h3 className="font-display text-3xl sm:text-4xl lg:text-5xl font-light uppercase tracking-tight text-white leading-tight">
                  {activeComp.title}
                </h3>

                <p className="font-sans text-xs sm:text-sm text-[#E8E6E1]/80 leading-relaxed">
                  {activeComp.description}
                </p>

                <div className="space-y-2 py-3 border-y border-white/10 w-full text-xs font-mono text-white/60">
                  <div className="flex justify-between">
                    <span>FORMAT:</span>
                    <span className="text-white">{activeComp.dimensions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>SUBJECTS:</span>
                    <span className="text-white">{activeComp.subtitle.split("•")[0]}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-2">
                  <Link
                    href="/book"
                    onClick={() => setIsDetailOpen(false)}
                    className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-white text-black text-xs font-sans font-semibold tracking-[0.22em] uppercase hover:bg-neutral-200 transition-colors"
                  >
                    <span>BOOK THIS COMPOSITION</span>
                    <ArrowUpRight className="w-4 h-4" />
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
