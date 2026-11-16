"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { createPortal } from "react-dom";
import { ArrowUpRight, X } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import OpticalTrace from "@/components/ui/OpticalTrace";

export interface ArtworkComposition {
  id: "solo" | "couple" | "family";
  label: string;
  category: string;
  title: string;
  summary: string;
  dimensions: string;
  image: string;
  aspect: string;
  maxWidthClass: string;
}

const COMPOSITIONS: ArtworkComposition[] = [
  {
    id: "solo",
    label: "SOLO",
    category: "SOLO COMPOSITION",
    title: "SINGULAR MICROCOSM",
    summary: "An intimate macroscopic exploration of an individual stroma.",
    dimensions: "Square Format • Up to 100 × 100 cm",
    image: "/assets/gallery/iris_sapphire.webp",
    aspect: "aspect-square",
    maxWidthClass: "max-w-2xl lg:max-w-3xl",
  },
  {
    id: "couple",
    label: "COUPLE",
    category: "COUPLE COMPOSITION",
    title: "DUAL HARMONY",
    summary: "Two distinct irises converging in natural visual equilibrium.",
    dimensions: "Panoramic Diptych • Up to 160 × 80 cm",
    image: "/assets/couple/couple_artwork_final.webp",
    aspect: "aspect-[16/9]",
    maxWidthClass: "max-w-4xl lg:max-w-5xl",
  },
  {
    id: "family",
    label: "FAMILY",
    category: "FAMILY COMPOSITION",
    title: "COSMIC CONSTELLATION",
    summary: "Three individual irises, composed into one enduring artwork.",
    dimensions: "Grand Horizon • Up to 200 × 90 cm",
    image: "/assets/art/family_artwork_final.webp",
    aspect: "aspect-[16/9]",
    maxWidthClass: "max-w-5xl lg:max-w-6xl",
  },
];

export default function ArtOfIris() {
  const [activeId, setActiveId] = useState<"solo" | "couple" | "family">("solo");
  const [incomingId, setIncomingId] = useState<"solo" | "couple" | "family" | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const sectionRef = useRef<HTMLElement>(null);
  const surfaceRef = useRef<HTMLDivElement>(null);
  const artworkStageRef = useRef<HTMLDivElement>(null);
  const activeImageRef = useRef<HTMLDivElement>(null);
  const incomingImageRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);

  // Accessibility refs for modal
  const triggerButtonRef = useRef<HTMLButtonElement | null>(null);
  const modalContainerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const activeComp = COMPOSITIONS.find((c) => c.id === activeId)!;
  const incomingComp = incomingId ? COMPOSITIONS.find((c) => c.id === incomingId) : null;

  const transitionTimelineRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ─── Modal Accessibility: Scroll Lock, Focus Trap & Escape Key ───
  useEffect(() => {
    if (!isDetailOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Auto-focus close button
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

  // ─── Choreographed Background Entrance & Parallax Travel ───
  useEffect(() => {
    if (typeof window === "undefined" || !sectionRef.current) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      if (surfaceRef.current) {
        gsap.fromTo(
          surfaceRef.current,
          {
            clipPath: "polygon(0% 6vw, 100% 0%, 100% 100%, 0% 100%)",
            y: 40,
          },
          {
            clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
            y: 0,
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top bottom",
              end: "top 30%",
              scrub: 0.5,
              refreshPriority: 8,
            },
          }
        );
      }

      if (artworkStageRef.current) {
        gsap.fromTo(
          artworkStageRef.current,
          {
            y: 80,
            scale: 0.96,
            opacity: 0.7,
          },
          {
            y: -20,
            scale: 1.0,
            opacity: 1.0,
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 80%",
              end: "bottom top",
              scrub: 0.6,
              refreshPriority: 8,
            },
          }
        );
      }

      if (headlineRef.current) {
        gsap.to(headlineRef.current, {
          y: -40,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.8,
            refreshPriority: 8,
          },
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // ─── Responsive & Interruptible Masked Composition Switch ───
  const handleSelect = (id: "solo" | "couple" | "family") => {
    if (id === activeId && !incomingId) return;
    if (id === incomingId) return;

    if (transitionTimelineRef.current) {
      transitionTimelineRef.current.kill();
    }

    setIncomingId(id);

    requestAnimationFrame(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          setActiveId(id);
          setIncomingId(null);
          if (activeImageRef.current) {
            gsap.set(activeImageRef.current, { clearProps: "all" });
          }
        },
      });

      transitionTimelineRef.current = tl;

      if (activeImageRef.current) {
        tl.to(
          activeImageRef.current,
          {
            scale: 0.94,
            opacity: 0.2,
            filter: "blur(3px)",
            duration: 0.45,
            ease: "power2.inOut",
          },
          0
        );
      }

      if (incomingImageRef.current) {
        tl.fromTo(
          incomingImageRef.current,
          {
            scale: 1.08,
            opacity: 0,
            filter: "blur(6px)",
            clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
          },
          {
            scale: 1.0,
            opacity: 1,
            filter: "blur(0px)",
            clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
            duration: 0.72,
            ease: "power3.out",
          },
          0.1
        );
      }
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!artworkStageRef.current) return;
    const rect = artworkStageRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    gsap.to(artworkStageRef.current, {
      rotateY: x * 5,
      rotateX: -y * 5,
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
      className="relative z-30 w-full min-h-screen bg-[#090909] text-[#090909] select-none overflow-hidden"
    >
      {/* ─── Architectural Warm Paper Surface Layer ─── */}
      <div
        ref={surfaceRef}
        className="relative w-full min-h-screen bg-[#F4F1EA] py-24 sm:py-32 md:py-40 px-6 sm:px-10 md:px-16 lg:px-24 flex flex-col justify-between"
      >
        {/* Subtle Optical Trace Motif along Section Transition */}
        <div className="absolute top-0 right-12 w-96 h-28 opacity-40 hidden md:block">
          <OpticalTrace theme="light" variant="artwork" />
        </div>

        {/* ─── Two Halves Asymmetrical Minimal Header ─── */}
        <div className="max-w-7xl mx-auto w-full flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-10 sm:pb-14 border-b border-[#090909]/15">
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-xs font-mono tracking-[0.26em] text-[#706D68] uppercase">
              <span className="w-2 h-2 rounded-full bg-[#090909]" />
              <span>02 / WORKS THAT MOVE</span>
            </div>
            <h2
              ref={headlineRef}
              className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-[-0.04em] uppercase text-[#090909] leading-[0.84]"
            >
              EVERY IRIS<br />IS ART.
            </h2>
          </div>

          {/* Minimal Controls: Solo / Couple / Family + Explore Artwork */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-12 pt-4 lg:pt-0">
            <div className="flex items-center gap-8 sm:gap-10">
              {COMPOSITIONS.map((comp) => {
                const isActive = (incomingId || activeId) === comp.id;
                return (
                  <button
                    key={comp.id}
                    data-tab={comp.label}
                    data-composition={comp.id}
                    onClick={() => handleSelect(comp.id)}
                    className={`group relative text-base sm:text-lg font-sans tracking-[0.16em] uppercase transition-all duration-300 cursor-pointer ${
                      isActive
                        ? "font-bold text-[#090909]"
                        : "font-normal text-[#706D68] hover:text-[#090909]"
                    }`}
                  >
                    <span>{comp.label}</span>
                    <span
                      className={`absolute -bottom-2 left-0 w-full h-[2px] bg-[#090909] transition-all duration-300 ${
                        isActive
                          ? "opacity-100 scale-x-100"
                          : "opacity-0 scale-x-0 group-hover:opacity-40 group-hover:scale-x-75"
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            <button
              ref={triggerButtonRef}
              data-explore-btn="true"
              onClick={() => setIsDetailOpen(true)}
              className="group inline-flex items-center gap-2 text-xs font-sans tracking-[0.20em] uppercase font-bold text-[#090909] hover:opacity-70 transition-opacity cursor-pointer"
            >
              <span>EXPLORE ARTWORK</span>
              <ArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
          </div>
        </div>

        {/* ─── Asymmetrical Dominant Artwork Placement (NO BOXES, NO BORDERS) ─── */}
        <div
          className="max-w-7xl mx-auto w-full my-auto py-10 sm:py-16 md:py-20 flex flex-col items-center justify-center relative"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <div
            ref={artworkStageRef}
            className={`w-full ${activeComp.maxWidthClass} relative flex flex-col items-center will-change-transform`}
          >
            {/* Active Artwork Plate */}
            <div
              ref={activeImageRef}
              data-artwork-plate="true"
              onClick={() => setIsDetailOpen(true)}
              className={`relative w-full ${activeComp.aspect} max-h-[74vh] cursor-pointer group`}
              title="Click to view artwork fullscreen"
            >
              <Image
                src={activeComp.image}
                alt={activeComp.title}
                fill
                priority
                sizes="(max-width: 1024px) 95vw, 75vw"
                className="object-contain transition-transform duration-700 ease-out group-hover:scale-[1.015]"
              />
            </div>

            {/* Incoming Artwork Plate during Transition */}
            {incomingComp && (
              <div
                ref={incomingImageRef}
                className={`absolute inset-0 w-full ${incomingComp.aspect} max-h-[74vh] pointer-events-none z-10`}
              >
                <Image
                  src={incomingComp.image}
                  alt={incomingComp.title}
                  fill
                  sizes="(max-width: 1024px) 95vw, 75vw"
                  className="object-contain"
                />
              </div>
            )}

            {/* Minimal Sub-Headline & Dimension Meta */}
            <div className="w-full flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 mt-8 pt-6 border-t border-[#090909]/10 text-[#706D68]">
              <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4">
                <span className="text-sm font-sans tracking-[0.16em] uppercase text-[#090909] font-bold">
                  {incomingComp ? incomingComp.title : activeComp.title}
                </span>
                <span className="text-xs font-sans tracking-wide">
                  — {incomingComp ? incomingComp.summary : activeComp.summary}
                </span>
              </div>

              <div className="flex items-center gap-6 text-xs font-mono tracking-wider">
                <span>{incomingComp ? incomingComp.dimensions : activeComp.dimensions}</span>
                <span
                  className="text-[#090909] font-bold underline underline-offset-4 cursor-pointer hover:opacity-70 transition-opacity"
                  onClick={() => setIsDetailOpen(true)}
                >
                  FULLSCREEN ↗
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Section Bottom Architecture ─── */}
        <div className="max-w-7xl mx-auto w-full pt-6 flex items-center justify-between text-xs font-mono tracking-[0.24em] uppercase text-[#706D68] border-t border-[#090909]/15">
          <span>ATELIER PONDICHERRY</span>
          <span>BESPOKE CAPTURE</span>
        </div>
      </div>

      {/* ─── REDESIGNED ARTWORK POPUP: Option A — Solid Black Gallery Surface ─── */}
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

            {/* Contemporary Art Gallery Editorial Layout: 55–60% Artwork, Sharp & Clean */}
            <div
              className="relative max-w-6xl w-full flex flex-col md:flex-row items-center gap-10 md:gap-16 my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Large, Sharp Photographic Masterwork (No heavy filters or dark blurred halo) */}
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

              {/* Minimal Editorial Information (Guaranteed 100% High-Contrast Legibility) */}
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
