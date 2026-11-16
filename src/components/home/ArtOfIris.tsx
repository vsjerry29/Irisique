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
  aspect: string;
  dimensions: string;
  scaleClass: string;
}

const COMPOSITIONS: ArtworkComposition[] = [
  {
    id: "solo",
    label: "SOLO",
    title: "Singular Microcosm",
    subtitle: "One Subject • Individual Stroma",
    description: "An intimate, microscopic exploration of individual identity. Every crypt, collagen furrow, and collarette ring captured in singular biometric purity.",
    image: "/assets/gallery/iris_sapphire.webp",
    aspect: "aspect-square",
    dimensions: "Square Fine Art • Up to 100 × 100 cm",
    scaleClass: "max-w-2xl",
  },
  {
    id: "couple",
    label: "COUPLE",
    title: "Dual Harmony",
    subtitle: "Two Subjects • Interwoven Resonance",
    description: "Two distinct worlds merging into one continuous visual dialogue. The delicate filaments of two irises converge in natural equilibrium.",
    image: "/assets/couple/couple_artwork_final.webp",
    aspect: "aspect-[16/9]",
    dimensions: "Panoramic Format • Up to 160 × 80 cm",
    scaleClass: "max-w-4xl",
  },
  {
    id: "family",
    label: "FAMILY",
    title: "Cosmic Constellation",
    subtitle: "Three to Five Subjects • Heritage Matrix",
    description: "A monumental heritage composition uniting generational patterns in balanced cosmic spacing. An enduring familial centerpiece.",
    image: "/assets/art/family_artwork_final.webp",
    aspect: "aspect-[16/9]",
    dimensions: "Grand Panoramic • Up to 200 × 90 cm",
    scaleClass: "max-w-5xl",
  },
];

export default function ArtOfIris() {
  const [activeId, setActiveId] = useState<"solo" | "couple" | "family">("solo");
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const containerRef = useRef<HTMLElement>(null);
  const artStageRef = useRef<HTMLDivElement>(null);
  const imageWrapperRef = useRef<HTMLDivElement>(null);

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

  // Composition Switch Transition (Restrained masked transition, no flicker)
  const handleSelect = (id: "solo" | "couple" | "family") => {
    if (id === activeId) return;

    if (artStageRef.current) {
      gsap.to(artStageRef.current, {
        opacity: 0.2,
        scale: 0.98,
        y: 8,
        duration: 0.24,
        ease: "power2.inOut",
        onComplete: () => {
          setActiveId(id);
          gsap.to(artStageRef.current, {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.42,
            ease: "power3.out",
          });
        },
      });
    } else {
      setActiveId(id);
    }
  };

  // Subtle interactive perspective shift on mouse move
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageWrapperRef.current) return;
    const rect = imageWrapperRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    gsap.to(imageWrapperRef.current, {
      rotateY: x * 6,
      rotateX: -y * 6,
      transformPerspective: 1000,
      duration: 0.4,
      ease: "power1.out",
    });
  };

  const handleMouseLeave = () => {
    if (!imageWrapperRef.current) return;
    gsap.to(imageWrapperRef.current, {
      rotateY: 0,
      rotateX: 0,
      duration: 0.6,
      ease: "power2.out",
    });
  };

  return (
    <section
      ref={containerRef}
      id="art"
      data-theme="light"
      className="relative z-30 w-full min-h-screen py-24 sm:py-32 md:py-44 bg-[#F4F1EA] text-[#090909] px-6 sm:px-10 md:px-16 lg:px-24 flex flex-col justify-between select-none overflow-hidden"
    >
      {/* ─── Two Halves-Style Asymmetrical Header ─── */}
      <div className="max-w-7xl mx-auto w-full flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-12 sm:pb-16 border-b border-[#090909]/15">
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-xs font-mono tracking-[0.26em] text-[#77736D] uppercase">
            <span className="w-2 h-2 rounded-full bg-[#090909]" />
            <span>02 / WORKS THAT MOVE</span>
          </div>
          <h2 className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-[-0.04em] uppercase text-[#090909] leading-[0.88]">
            ART IS IN<br />THE EYE.
          </h2>
        </div>

        {/* Minimal Typographic Switcher (SOLO / COUPLE / FAMILY) */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-12 pt-4 lg:pt-0">
          <div className="flex items-center gap-8 sm:gap-10">
            {COMPOSITIONS.map((comp) => {
              const isActive = comp.id === activeId;
              return (
                <button
                  key={comp.id}
                  onClick={() => handleSelect(comp.id)}
                  className={`group relative text-base sm:text-lg font-sans tracking-[0.16em] uppercase transition-all duration-300 cursor-pointer ${
                    isActive
                      ? "font-bold text-[#090909]"
                      : "font-normal text-[#77736D] hover:text-[#090909]"
                  }`}
                >
                  <span>{comp.label}</span>
                  {/* Confident 2px underline */}
                  <span
                    className={`absolute -bottom-2 left-0 w-full h-[2px] bg-[#090909] transition-all duration-300 ${
                      isActive ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0 group-hover:opacity-40 group-hover:scale-x-75"
                    }`}
                  />
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setIsDetailOpen(true)}
            className="group inline-flex items-center gap-2 text-xs font-sans tracking-[0.20em] uppercase font-bold text-[#090909] hover:opacity-70 transition-opacity"
          >
            <span>EXPLORE WORK</span>
            <ArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>
        </div>
      </div>

      {/* ─── Asymmetrical Dominant Artwork Placement (NO BOXED PANEL) ─── */}
      <div className="max-w-7xl mx-auto w-full my-auto py-12 sm:py-16 md:py-24 flex flex-col items-center">
        <div
          ref={artStageRef}
          className={`w-full ${activeComp.scaleClass} flex flex-col items-center will-change-transform`}
        >
          {/* Frameless Artwork Visual — Floats directly on paper with subtle perspective */}
          <div
            ref={imageWrapperRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={() => setIsDetailOpen(true)}
            className={`relative w-full ${activeComp.aspect} max-h-[70vh] cursor-pointer group`}
            title="Click to inspect high-resolution artwork"
          >
            <Image
              src={activeComp.image}
              alt={activeComp.title}
              fill
              priority
              sizes="(max-width: 1024px) 95vw, 70vw"
              className="object-contain transition-transform duration-700 ease-out group-hover:scale-[1.02]"
            />
          </div>

          {/* Minimal Typography Embedded in Whitespace */}
          <div className="w-full flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 mt-8 pt-6 border-t border-[#090909]/10 text-[#77736D]">
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4">
              <span className="text-sm font-sans tracking-[0.16em] uppercase text-[#090909] font-bold">
                {activeComp.title}
              </span>
              <span className="text-xs font-sans tracking-wide">
                — {activeComp.subtitle}
              </span>
            </div>

            <div className="flex items-center gap-8 text-xs font-mono tracking-wider">
              <span>{activeComp.dimensions}</span>
              <span className="text-[#090909] font-bold underline underline-offset-4 cursor-pointer" onClick={() => setIsDetailOpen(true)}>
                VIEW DETAILS ↗
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Section Bottom Architecture ─── */}
      <div className="max-w-7xl mx-auto w-full pt-6 flex items-center justify-between text-xs font-mono tracking-[0.24em] uppercase text-[#77736D] border-t border-[#090909]/15">
        <span>AUTHENTIC BIOMETRIC STROMA</span>
        <span>ATELIER SPECIFICATION</span>
      </div>

      {/* ─── Fullscreen Editorial Artwork Detail Modal (Portal Mounted) ─── */}
      {isDetailOpen && mounted && typeof document !== "undefined" &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`${activeComp.title} Fullscreen View`}
            className="fixed inset-0 z-[99999] flex items-center justify-center bg-[#090909]/98 backdrop-blur-2xl text-[#FAFAF8] p-6 sm:p-12 md:p-16 select-none animate-fadeIn"
            onClick={() => setIsDetailOpen(false)}
          >
            {/* Fixed Close Button Above Header */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsDetailOpen(false);
              }}
              aria-label="Close artwork details"
              className="fixed right-6 sm:right-10 z-[100000] p-3 text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-none transition-all duration-200 backdrop-blur-md cursor-pointer"
              style={{ top: "max(1.5rem, env(safe-area-inset-top, 1.5rem))" }}
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Content */}
            <div
              className="relative max-w-5xl w-full flex flex-col md:flex-row items-center gap-8 md:gap-14 my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative w-full md:w-3/5 aspect-square max-h-[62vh] overflow-hidden">
                <Image
                  src={activeComp.image}
                  alt={activeComp.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 60vw"
                  className="object-contain p-2"
                />
              </div>

              <div className="w-full md:w-2/5 flex flex-col items-start gap-6">
                <div>
                  <span className="text-xs font-mono tracking-[0.24em] uppercase text-[#D8D4CC]/70 block mb-2">
                    COMPOSITION • {activeComp.label}
                  </span>
                  <h3 className="font-display text-4xl sm:text-5xl font-bold uppercase tracking-tight text-white leading-tight">
                    {activeComp.title}
                  </h3>
                </div>

                <p className="font-sans text-sm text-[#D8D4CC] leading-relaxed">
                  {activeComp.description}
                </p>

                <div className="space-y-3 py-4 border-y border-white/15 w-full text-xs font-mono text-white/70">
                  <div className="flex justify-between">
                    <span>SPECIFICATION:</span>
                    <span className="text-white font-bold">{activeComp.dimensions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>BIOMETRIC HARMONY:</span>
                    <span className="text-white">{activeComp.subtitle.split("•")[0]}</span>
                  </div>
                </div>

                <div className="pt-2 w-full">
                  <Link
                    href="/book"
                    onClick={() => setIsDetailOpen(false)}
                    className="w-full py-4 bg-white text-black text-xs font-sans font-bold tracking-[0.22em] uppercase hover:bg-neutral-200 transition-colors text-center inline-block"
                  >
                    RESERVE THIS COMPOSITION →
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
