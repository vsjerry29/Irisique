"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import gsap from "gsap";

export interface ProcessStage {
  id: "capture" | "create" | "keep";
  step: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  meta: string;
}

const STAGES: ProcessStage[] = [
  {
    id: "capture",
    step: "01",
    title: "CAPTURE.",
    subtitle: "Biometric Macro Scan",
    description: "An instantaneous, painless macro exposure at our White Town atelier revealing the hidden landscape of your iris stroma.",
    image: "/assets/process/process_capture.webp",
    meta: "FOCAL LENGTH: 100MM • 1:1 REPRODUCTION",
  },
  {
    id: "create",
    step: "02",
    title: "CREATE.",
    subtitle: "Atelier Darkroom & Spectral Calibration",
    description: "Our master printmakers calibrate every collagen ridge and melanin filament to P3 wide-gamut museum pigment standards.",
    image: "/assets/process/process_create.webp",
    meta: "SPECTRAL PROOFING • D50 DAYLIGHT BALANCED",
  },
  {
    id: "keep",
    step: "03",
    title: "KEEP.",
    subtitle: "Archival Heritage Artwork",
    description: "Hand-embossed, certified with your unique biometric timestamp, and sealed behind UV99 anti-reflective museum glass.",
    image: "/assets/process/process_keep.webp",
    meta: "HAHNEMÜHLE 310GSM • ARCHIVAL GUARANTEE 75+ YRS",
  },
];

export default function ExperienceSection() {
  const [activeStageId, setActiveStageId] = useState<"capture" | "create" | "keep">("capture");
  const stageVisualRef = useRef<HTMLDivElement>(null);

  const activeStage = STAGES.find((s) => s.id === activeStageId)!;

  const handleStageChange = (id: "capture" | "create" | "keep") => {
    if (id === activeStageId) return;

    if (stageVisualRef.current) {
      gsap.to(stageVisualRef.current, {
        opacity: 0.15,
        scale: 0.985,
        duration: 0.22,
        ease: "power2.inOut",
        onComplete: () => {
          setActiveStageId(id);
          gsap.to(stageVisualRef.current, {
            opacity: 1,
            scale: 1,
            duration: 0.40,
            ease: "power3.out",
          });
        },
      });
    } else {
      setActiveStageId(id);
    }
  };

  return (
    <section
      id="experience"
      data-theme="light"
      className="relative z-30 w-full py-24 sm:py-32 md:py-44 bg-[#D8D4CC] text-[#090909] px-6 sm:px-10 md:px-16 lg:px-24 select-none border-t border-[#090909]/15 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto w-full flex flex-col gap-16 md:gap-24">
        {/* ─── Two Halves Section Header ─── */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-10 border-b border-[#090909]/15">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-xs font-mono tracking-[0.26em] text-[#77736D] uppercase">
              <span className="w-2 h-2 rounded-full bg-[#090909]" />
              <span>04 / FROM CAPTURE TO ART</span>
            </div>
            <h2 className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-[-0.04em] uppercase text-[#090909] leading-[0.88]">
              THE ATELIER<br />JOURNEY.
            </h2>
          </div>

          <Link
            href="/book"
            className="group inline-flex items-center gap-2 text-xs font-sans tracking-[0.20em] uppercase font-bold text-[#090909] hover:opacity-70 transition-opacity"
          >
            <span>BOOK ATELIER SESSION</span>
            <ArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        {/* ─── Cinematic Editorial Film-Strip Sequence (NO BOXED CARDS) ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
          {/* Left Column (7 cols): Dominant Photographic Moment */}
          <div className="lg:col-span-7 w-full flex flex-col">
            <div
              ref={stageVisualRef}
              className="relative w-full aspect-[16/11] overflow-hidden bg-black shadow-[0_24px_64px_rgba(9,9,9,0.14)] will-change-transform"
            >
              <Image
                src={activeStage.image}
                alt={activeStage.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 58vw"
                className="object-cover"
              />
            </div>

            <div className="mt-4 flex items-center justify-between text-xs font-mono tracking-widest text-[#77736D] uppercase">
              <span>{activeStage.meta}</span>
              <span>ATELIER • WHITE TOWN</span>
            </div>
          </div>

          {/* Right Column (5 cols): Film-Strip Stage Selectors */}
          <div className="lg:col-span-5 flex flex-col justify-center space-y-10 sm:space-y-12">
            {STAGES.map((stage) => {
              const isActive = stage.id === activeStageId;
              return (
                <div
                  key={stage.id}
                  onClick={() => handleStageChange(stage.id)}
                  className={`flex flex-col gap-3 cursor-pointer group transition-all duration-300 pb-6 border-b ${
                    isActive ? "border-[#090909]" : "border-[#090909]/15 hover:border-[#090909]/40"
                  }`}
                >
                  <div className="flex items-baseline justify-between">
                    <div className="flex items-baseline gap-4">
                      <span className="font-mono text-xs text-[#77736D] tracking-widest">
                        {stage.step}
                      </span>
                      <h3
                        className={`font-display text-3xl sm:text-4xl md:text-5xl font-bold uppercase tracking-tight transition-colors ${
                          isActive ? "text-[#090909]" : "text-[#77736D] group-hover:text-[#090909]"
                        }`}
                      >
                        {stage.title}
                      </h3>
                    </div>

                    <span
                      className={`text-xs font-mono uppercase tracking-wider ${
                        isActive ? "text-[#090909] font-bold" : "text-transparent"
                      }`}
                    >
                      ACTIVE ↗
                    </span>
                  </div>

                  <p className="font-sans text-xs sm:text-sm text-[#090909] font-medium pl-8">
                    {stage.subtitle}
                  </p>

                  <p className="font-sans text-xs sm:text-sm text-[#77736D] pl-8 leading-relaxed max-w-md">
                    {stage.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
