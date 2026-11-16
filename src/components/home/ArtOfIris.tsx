"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { createPortal } from "react-dom";
import { ArrowUpRight, X } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ArtworkStageShader from "./ArtworkStageShader";

export interface ArtworkComposition {
  id: "solo" | "couple" | "family";
  label: string;
  category: string;
  title: string;
  summary: string;
  dimensions: string;
  image: string;
}

const COMPOSITIONS: ArtworkComposition[] = [
  {
    id: "solo",
    label: "SOLO",
    category: "SOLO COMPOSITION",
    title: "SINGULAR MICROCOSM",
    summary: "An intimate macroscopic exploration of an individual stroma.",
    dimensions: "Square Masterpiece • 100 × 100 cm",
    image: "/assets/gallery/iris_sapphire.webp",
  },
  {
    id: "couple",
    label: "COUPLE",
    category: "COUPLE COMPOSITION",
    title: "DUAL HARMONY",
    summary: "Two distinct irises converging in natural visual equilibrium.",
    dimensions: "Panoramic Diptych • 160 × 90 cm",
    image: "/assets/couple/couple_artwork_final.webp",
  },
  {
    id: "family",
    label: "FAMILY",
    category: "FAMILY COMPOSITION",
    title: "COSMIC CONSTELLATION",
    summary: "Three individual irises, composed into one enduring artwork.",
    dimensions: "Horizon Triptych • 200 × 90 cm",
    image: "/assets/art/family_artwork_final.webp",
  },
];

const COMP_ORDER: Record<string, number> = { solo: 0, couple: 1, family: 2 };

export interface ArtOfIrisProps {
  isEmbeddedInHero?: boolean;
  soloPlateRef?: React.RefObject<HTMLDivElement | null>;
  headerRowRef?: React.RefObject<HTMLDivElement | null>;
  categoryBarRef?: React.RefObject<HTMLDivElement | null>;
}

export default function ArtOfIris({
  isEmbeddedInHero = false,
  soloPlateRef: externalSoloPlateRef,
  headerRowRef: externalHeaderRowRef,
  categoryBarRef: externalCategoryBarRef,
}: ArtOfIrisProps = {}) {
  const [activeId, setActiveId] = useState<"solo" | "couple" | "family">("solo");
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const sectionRef = useRef<HTMLElement>(null);
  const surfaceRef = useRef<HTMLDivElement>(null);
  const internalHeaderRowRef = useRef<HTMLDivElement>(null);
  const internalCategoryBarRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const artworkStageRef = useRef<HTMLDivElement>(null);
  const activeImageRef = useRef<HTMLDivElement>(null);

  const setHeaderRowRef = useCallback((node: HTMLDivElement | null) => {
    internalHeaderRowRef.current = node;
    if (externalHeaderRowRef) {
      (externalHeaderRowRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
    }
  }, [externalHeaderRowRef]);

  const setCategoryBarRef = useCallback((node: HTMLDivElement | null) => {
    internalCategoryBarRef.current = node;
    if (externalCategoryBarRef) {
      (externalCategoryBarRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
    }
  }, [externalCategoryBarRef]);

  const setSoloPlateRef = useCallback((node: HTMLDivElement | null) => {
    activeImageRef.current = node;
    if (externalSoloPlateRef) {
      (externalSoloPlateRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
    }
  }, [externalSoloPlateRef]);

  // Hover preview debounce timer
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);
  const activeIdRef = useRef<"solo" | "couple" | "family">(activeId);
  activeIdRef.current = activeId;

  // Accessibility refs for modal
  const triggerButtonRef = useRef<HTMLButtonElement | null>(null);
  const modalContainerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const activeComp = COMPOSITIONS.find((c) => c.id === activeId)!;

  const transitionTimelineRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    setMounted(true);
    return () => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    };
  }, []);

  // ─── Modal Accessibility: Scroll Lock, Focus Trap & Escape Key ───
  useEffect(() => {
    if (!isDetailOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsDetailOpen(false);
      }
      if (e.key === "Tab" && modalContainerRef.current) {
        const focusables = modalContainerRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      triggerButtonRef.current?.focus();
    };
  }, [isDetailOpen]);

  // ─── Clean Header Exit on Deep Scroll (No clipping) ───
  useEffect(() => {
    if (typeof window === "undefined" || !sectionRef.current) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Clean header row fade-out when scrolling down towards Collection
      if (internalHeaderRowRef.current) {
        gsap.to(internalHeaderRowRef.current, {
          opacity: 0,
          y: -24,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top -5%",
            end: "top -35%",
            scrub: 0.5,
            refreshPriority: 8,
          },
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // ─── Directional & Interruptible Masked Composition Transition ───
  const triggerTransition = useCallback((targetId: "solo" | "couple" | "family") => {
    if (targetId === activeIdRef.current) return;
    setActiveId(targetId);
  }, []);

  // ─── Primary Hover Preview Handlers (Debounced 65ms) ───
  const handleTabMouseEnter = (id: "solo" | "couple" | "family") => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = setTimeout(() => {
      triggerTransition(id);
    }, 65);
  };

  const handleTabMouseLeave = () => {
    // Clear debounce timer if cursor left quickly
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    // Note: Do NOT reset artwork on mouse leave — keep most recently previewed artwork visible!
  };

  const handleTabClick = (id: "solo" | "couple" | "family") => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    triggerTransition(id);
  };

  const handleTabFocus = (id: "solo" | "couple" | "family") => {
    triggerTransition(id);
  };

  const handleTabKeyDown = (e: React.KeyboardEvent, id: "solo" | "couple" | "family") => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      triggerTransition(id);
    }
  };

  // Subtle 3D mouse parallax on artwork stage
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!artworkStageRef.current) return;
    const rect = artworkStageRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    gsap.to(artworkStageRef.current, {
      rotateY: x * 3.5,
      rotateX: -y * 3.5,
      transformPerspective: 1200,
      duration: 0.4,
      ease: "power1.out",
    });
  };

  const handleMouseLeave = () => {
    if (!artworkStageRef.current) return;
    gsap.to(artworkStageRef.current, {
      rotateY: 0,
      rotateX: 0,
      duration: 0.6,
      ease: "power2.out",
    });
  };

  return (
    <section
      ref={sectionRef}
      id="art"
      data-theme="light"
      className={`relative z-30 w-full ${
        isEmbeddedInHero ? "h-full bg-transparent overflow-hidden" : "min-h-screen bg-[#F4F1EA]"
      } text-[#090909] select-none`}
    >
      {/* ─── Architectural Warm Paper Surface Layer (Zero harsh horizontal cuts, viewport fitted) ─── */}
      <div
        ref={surfaceRef}
        className={`relative w-full ${
          isEmbeddedInHero
            ? "h-full py-3 sm:py-5 lg:py-6 px-6 sm:px-10 md:px-14 lg:px-20 overflow-hidden flex flex-col justify-between bg-transparent"
            : "min-h-screen py-20 sm:py-28 md:py-32 px-6 sm:px-10 md:px-16 lg:px-24 flex flex-col justify-between overflow-visible bg-[#F4F1EA]"
        }`}
      >
        {/* ─── Two Halves Asymmetrical Minimal Header Row ─── */}
        <div
          ref={setHeaderRowRef}
          className={`max-w-7xl mx-auto w-full flex flex-col lg:flex-row lg:items-end justify-between gap-4 ${
            isEmbeddedInHero ? "pb-2 sm:pb-3 border-b border-[#090909]/15" : "pb-8 border-b border-[#090909]/15"
          } relative z-20 will-change-transform`}
          style={isEmbeddedInHero ? { opacity: 0, transform: "translateY(16px)" } : undefined}
        >
          <div>
            <h2
              ref={headlineRef}
              className={`font-display ${
                isEmbeddedInHero
                  ? "text-3xl sm:text-4xl md:text-5xl lg:text-6xl"
                  : "text-5xl sm:text-6xl md:text-7xl lg:text-8xl"
              } font-bold tracking-[-0.03em] uppercase text-[#090909] leading-[0.92]`}
            >
              EVERY IRIS<br />IS ART.
            </h2>
          </div>
        </div>

        {/* ─── Composition Switcher Bar (HOVER TO PREVIEW on Desktop, Tap on Mobile) ─── */}
        <div
          ref={setCategoryBarRef}
          className={`max-w-7xl mx-auto w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
            isEmbeddedInHero ? "pt-2 pb-1.5" : "pt-8 pb-4"
          } relative z-20 will-change-transform`}
          style={isEmbeddedInHero ? { opacity: 0, transform: "translateY(16px)" } : undefined}
        >
          <div className="flex items-center gap-8 sm:gap-10">
            {COMPOSITIONS.map((comp) => {
              const isActive = activeId === comp.id;
              return (
                <button
                  key={comp.id}
                  data-tab={comp.label}
                  data-composition={comp.id}
                  onClick={() => handleTabClick(comp.id)}
                  onPointerEnter={() => handleTabMouseEnter(comp.id)}
                  onMouseEnter={() => handleTabMouseEnter(comp.id)}
                  onMouseLeave={handleTabMouseLeave}
                  onFocus={() => handleTabFocus(comp.id)}
                  onKeyDown={(e) => handleTabKeyDown(e, comp.id)}
                  aria-pressed={isActive}
                  className={`group relative py-1 text-base sm:text-lg font-sans tracking-[0.16em] uppercase transition-all duration-300 cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-[#090909] ${
                    isActive
                      ? "font-bold text-[#090909]"
                      : "font-normal text-[#706D68] hover:text-[#090909]"
                  }`}
                >
                  <span>{comp.label}</span>
                  <span
                    className={`absolute bottom-0 left-0 w-full h-[2px] bg-[#090909] transition-all duration-300 ${
                      isActive
                        ? "opacity-100 scale-x-100"
                        : "opacity-0 scale-x-0 group-hover:opacity-40 group-hover:scale-x-75"
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Explore Artwork Button: Opens fullscreen modal for the currently active/hovered preview */}
          <button
            ref={triggerButtonRef}
            data-explore-btn="true"
            onClick={() => setIsDetailOpen(true)}
            className="group inline-flex items-center gap-2 text-xs font-sans tracking-[0.20em] uppercase font-bold text-[#090909] hover:opacity-70 transition-opacity cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-[#090909]"
            title={`Explore details for ${activeComp.title}`}
          >
            <span>EXPLORE ARTWORK [{activeComp.label}]</span>
            <ArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>
        </div>

        {/* ─── Unified 16:9 Photographic Stage (Same Outer Dimensions & Zero Border Radius) ─── */}
        <div
          className={`max-w-7xl mx-auto w-full my-auto ${
            isEmbeddedInHero ? "py-1 flex-1 min-h-0" : "py-6 sm:py-10 md:py-12"
          } flex flex-col items-center justify-center relative z-20`}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <div
            ref={artworkStageRef}
            className={`w-full ${
              isEmbeddedInHero ? "max-w-2xl lg:max-w-3xl xl:max-w-[820px]" : "max-w-4xl"
            } relative flex flex-col items-center opacity-100 will-change-transform`}
            style={{ opacity: 1 }}
          >
            {/* Unified WebGL Photographic Stage with Refractive Fibre Reveal */}
            <div
              ref={setSoloPlateRef}
              data-artwork-plate="true"
              className="w-full relative shadow-2xl overflow-hidden bg-[#090909]"
              style={{ opacity: isEmbeddedInHero ? 0 : 1, filter: "none", borderRadius: 0 }}
            >
              <ArtworkStageShader
                activeId={activeId}
                onDetailClick={() => setIsDetailOpen(true)}
                isEmbeddedInHero={isEmbeddedInHero}
              />
            </div>

            {/* Minimal Editorial Title & Fullscreen Action */}
            <div
              className={`w-full flex items-center justify-between ${
                isEmbeddedInHero ? "mt-2.5 pt-2" : "mt-8 pt-6"
              } border-t border-[#090909]/10 text-[#706D68]`}
            >
              <span className="text-xs sm:text-sm font-sans tracking-[0.18em] uppercase text-[#090909] font-bold">
                {activeComp.title}
              </span>

              <button
                type="button"
                className="text-xs font-mono tracking-wider text-[#090909] font-bold underline underline-offset-4 cursor-pointer hover:opacity-70 transition-opacity"
                onClick={() => setIsDetailOpen(true)}
              >
                FULLSCREEN ↗
              </button>
            </div>
          </div>
        </div>

        {/* ─── Clean Section Bottom Architecture (Only if standalone page) ─── */}
        {!isEmbeddedInHero && (
          <div className="max-w-7xl mx-auto w-full pt-6 flex items-center justify-between text-xs font-mono tracking-[0.24em] uppercase text-[#706D68] border-t border-[#090909]/15 relative z-20">
            <span>ATELIER PONDICHERRY</span>
            <span>BESPOKE CAPTURE</span>
          </div>
        )}
      </div>

      {/* ─── REDESIGNED ARTWORK POPUP: Solid Black Gallery Surface for Currently Active Preview ─── */}
      {isDetailOpen && mounted && typeof document !== "undefined" &&
        createPortal(
          <div
            ref={modalContainerRef}
            role="dialog"
            aria-modal="true"
            aria-label={`${activeComp.title} Fullscreen Gallery View`}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#090909] text-[#FAFAF8] p-6 sm:p-12 md:p-16 select-none animate-fadeIn"
            onClick={() => setIsDetailOpen(false)}
          >
            {/* Elegant, Unobstructed Top-Right Close Button in Safe Area */}
            <button
              ref={closeButtonRef}
              onClick={(e) => {
                e.stopPropagation();
                setIsDetailOpen(false);
              }}
              aria-label="Close artwork details"
              className="fixed right-6 sm:right-10 z-[110] flex items-center gap-2.5 px-4 py-2 text-xs font-mono tracking-[0.22em] uppercase text-[#FAFAF8] bg-[#171717] hover:bg-[#262626] border border-white/20 transition-all duration-200 cursor-pointer"
              style={{ top: "max(1.5rem, env(safe-area-inset-top, 1.5rem))" }}
            >
              <span>CLOSE [ESC]</span>
              <X className="w-4 h-4 text-white" />
            </button>

            {/* Contemporary Art Gallery Editorial Layout: 58% Artwork, Sharp & Clean */}
            <div
              className="relative max-w-6xl w-full flex flex-col md:flex-row items-center gap-10 md:gap-16 my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Large, Sharp Photographic Masterwork */}
              <div className="relative w-full md:w-[58%] aspect-[4/3] sm:aspect-square md:aspect-[4/3] max-h-[72vh] overflow-hidden flex items-center justify-center">
                <Image
                  src={activeComp.image}
                  alt={activeComp.title}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 58vw"
                  className="object-contain"
                />
              </div>

              {/* Minimal Editorial Information */}
              <div className="w-full md:w-[42%] flex flex-col items-start gap-6">
                <div>
                  <span className="text-xs font-mono tracking-[0.24em] uppercase text-[#D8D4CC]/80 block mb-2">
                    {activeComp.category}
                  </span>
                  <h3 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold uppercase tracking-tight text-white leading-[0.95]">
                    {activeComp.title}
                  </h3>
                  <p className="text-sm font-sans text-[#D8D4CC] mt-3 leading-relaxed">
                    {activeComp.summary}
                  </p>
                </div>

                <div className="w-full space-y-2.5 border-y border-white/15 py-5 text-xs font-mono tracking-wider">
                  <div className="flex justify-between text-white/70">
                    <span>SPECIFICATION</span>
                    <span className="text-white font-medium">{activeComp.dimensions}</span>
                  </div>
                  <div className="flex justify-between text-white/70">
                    <span>ATELIER STATUS</span>
                    <span className="text-white font-medium">Original Biometric Commission</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full pt-1">
                  <Link
                    href="/shop"
                    onClick={() => setIsDetailOpen(false)}
                    className="w-full py-4 text-xs font-sans tracking-[0.22em] uppercase font-bold bg-[#FAFAF8] text-[#090909] hover:bg-white transition-all text-center cursor-pointer inline-flex items-center justify-center gap-2"
                  >
                    <span>EXPLORE FORMATS</span>
                    <ArrowUpRight className="w-4 h-4 text-[#090909]" />
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
