"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { ArrowUpRight, X } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export interface ArtworkComposition {
  id: "solo" | "couple" | "family";
  label: string;
  title: string;
  format: string;
  dimensions: string;
  image: string;
  aspect: string;
  maxWidthClass: string;
}

const COMPOSITIONS: ArtworkComposition[] = [
  {
    id: "solo",
    label: "SOLO",
    title: "Singular Microcosm",
    format: "Individual Biometric Stroma",
    dimensions: "Square Fine Art • Up to 100 × 100 cm",
    image: "/assets/gallery/iris_sapphire.webp",
    aspect: "aspect-square",
    maxWidthClass: "max-w-2xl lg:max-w-3xl",
  },
  {
    id: "couple",
    label: "COUPLE",
    title: "Dual Harmony",
    format: "Interwoven Resonance",
    dimensions: "Panoramic Diptych • Up to 160 × 80 cm",
    image: "/assets/couple/couple_artwork_final.webp",
    aspect: "aspect-[16/9]",
    maxWidthClass: "max-w-4xl lg:max-w-5xl",
  },
  {
    id: "family",
    label: "FAMILY",
    title: "Cosmic Constellation",
    format: "Generational Heritage Matrix",
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

  const activeComp = COMPOSITIONS.find((c) => c.id === activeId)!;
  const incomingComp = incomingId ? COMPOSITIONS.find((c) => c.id === incomingId) : null;

  const isTransitioningRef = useRef(false);
  const transitionTimelineRef = useRef<gsap.core.Timeline | null>(null);

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

  // Global ESC key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isDetailOpen) {
        setIsDetailOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDetailOpen]);

  // ─── Choreographed Background Entrance & Parallax Travel ───
  useEffect(() => {
    if (typeof window === "undefined" || !sectionRef.current) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // 1. Full-viewport curved surface wipe: warm paper retreats dark atmosphere
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

      // 2. Artwork floats into place before background fully settles (visual continuity)
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

      // 3. Subtle relative depth shift between headline and artwork
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

    // Interrupt any active transition cleanly
    if (transitionTimelineRef.current) {
      transitionTimelineRef.current.kill();
    }

    setIncomingId(id);
    isTransitioningRef.current = true;

    // Wait one microtask for incoming container DOM mount
    requestAnimationFrame(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          setActiveId(id);
          setIncomingId(null);
          isTransitioningRef.current = false;
          if (activeImageRef.current) {
            gsap.set(activeImageRef.current, { clearProps: "all" });
          }
        },
      });

      transitionTimelineRef.current = tl;

      // 1. Current artwork shifts back in depth
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

      // 2. Incoming artwork enters through the same visual space via controlled mask reveal
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

  // ─── Tactile Mouse Follow Perspective Shift ───
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
        {/* ─── Two Halves Asymmetrical Minimal Header ─── */}
        <div className="max-w-7xl mx-auto w-full flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-10 sm:pb-14 border-b border-[#090909]/15">
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-xs font-mono tracking-[0.26em] text-[#77736D] uppercase">
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
                        : "font-normal text-[#77736D] hover:text-[#090909]"
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
            <div className="w-full flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 mt-8 pt-6 border-t border-[#090909]/10 text-[#77736D]">
              <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4">
                <span className="text-sm font-sans tracking-[0.16em] uppercase text-[#090909] font-bold">
                  {incomingComp ? incomingComp.title : activeComp.title}
                </span>
                <span className="text-xs font-sans tracking-wide">
                  — {incomingComp ? incomingComp.format : activeComp.format}
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
        <div className="max-w-7xl mx-auto w-full pt-6 flex items-center justify-between text-xs font-mono tracking-[0.24em] uppercase text-[#77736D] border-t border-[#090909]/15">
          <span>ATELIER PONDICHERRY</span>
          <span>BESPOKE CAPTURE</span>
        </div>
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
                    EDITION • {activeComp.label}
                  </span>
                  <h3 className="font-display text-4xl sm:text-5xl font-bold uppercase tracking-tight text-white leading-tight">
                    {activeComp.title}
                  </h3>
                  <p className="text-sm font-sans tracking-wide text-[#D8D4CC]/80 mt-1">
                    {activeComp.format}
                  </p>
                </div>

                <div className="w-full space-y-3 border-y border-white/10 py-5 text-xs font-mono tracking-wider">
                  <div className="flex justify-between text-white/60">
                    <span>SPECIFICATION</span>
                    <span className="text-white">{activeComp.dimensions}</span>
                  </div>
                  <div className="flex justify-between text-white/60">
                    <span>SURFACE</span>
                    <span className="text-white">Museum-Grade Rag / Acrylic</span>
                  </div>
                  <div className="flex justify-between text-white/60">
                    <span>EDITION</span>
                    <span className="text-white">1 of 1 Biometric Bespoke</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full">
                  <button
                    onClick={() => {
                      setIsDetailOpen(false);
                      const el = document.getElementById("booking");
                      if (el) el.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="w-full py-4 text-xs font-sans tracking-[0.22em] uppercase font-bold bg-[#FAFAF8] text-[#090909] hover:bg-white transition-all text-center cursor-pointer"
                  >
                    COMMISSION THIS FORMAT
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </section>
  );
}
