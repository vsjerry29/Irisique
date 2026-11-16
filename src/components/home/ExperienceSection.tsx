"use client";

import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export interface ProcessStage {
  id: "capture" | "create" | "keep";
  title: string;
  tag: string;
  desc: string;
  image: string;
  meta: string;
}

const STAGES: ProcessStage[] = [
  {
    id: "capture",
    title: "CAPTURE.",
    tag: "MACRO OPTICAL EXPOSURE",
    desc: "A painless, fraction-of-a-second exposure at our White Town atelier mapping the microscopic topography of your iris stroma.",
    image: "/assets/process/process_capture.webp",
    meta: "",
  },
  {
    id: "create",
    title: "CREATE.",
    tag: "DARKROOM CHROMATIC CALIBRATION",
    desc: "Master colorists proof every collagen crypt and melanin filament to P3 wide-gamut mineral pigment standards.",
    image: "/assets/process/process_create.webp",
    meta: "",
  },
  {
    id: "keep",
    title: "KEEP.",
    tag: "ARCHIVAL HEIRLOOM COMMISSION",
    desc: "Hand-embossed, sealed with your unique biometric timestamp, and installed behind UV99 museum anti-reflective glass.",
    image: "/assets/process/process_keep.webp",
    meta: "",
  },
];

export default function ExperienceSection() {
  const containerRef = useRef<HTMLElement>(null);
  const pinTargetRef = useRef<HTMLDivElement>(null);
  const card1Ref = useRef<HTMLDivElement>(null);
  const card2Ref = useRef<HTMLDivElement>(null);
  const card3Ref = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current || !pinTargetRef.current) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          pin: pinTargetRef.current,
          start: "top top",
          end: "+=180%", // Concise, responsive pinned scroll travel
          scrub: 0.6,    // Liquid smooth catchup
          invalidateOnRefresh: true,
          refreshPriority: 4,
          onUpdate: (self) => {
            const p = self.progress;
            if (p < 0.35) setActiveStep(0);
            else if (p < 0.70) setActiveStep(1);
            else setActiveStep(2);
          },
        },
      });

      // ── Layered Spatial Choreography ──
      // Stage 1 (Capture) is initially resting in position.
      // Progress 0.00 – 0.45: Card 2 (Create) slides over on a higher depth plane
      if (card1Ref.current && card2Ref.current) {
        tl.to(
          card1Ref.current,
          {
            scale: 0.90,
            y: -40,
            opacity: 0.35,
            filter: "blur(4px)",
            ease: "power2.inOut",
          },
          0.00
        );

        tl.fromTo(
          card2Ref.current,
          {
            y: "110%",
            scale: 0.96,
            rotateZ: 1.5,
            opacity: 0,
          },
          {
            y: "0%",
            scale: 1.0,
            rotateZ: 0,
            opacity: 1,
            ease: "power2.out",
          },
          0.05
        );
      }

      // Progress 0.45 – 0.95: Card 3 (Keep) slides over Card 2 on an elevated spatial plane
      if (card2Ref.current && card3Ref.current) {
        tl.to(
          card2Ref.current,
          {
            scale: 0.90,
            y: -40,
            opacity: 0.35,
            filter: "blur(4px)",
            ease: "power2.inOut",
          },
          0.48
        );

        tl.fromTo(
          card3Ref.current,
          {
            y: "110%",
            scale: 0.96,
            rotateZ: -1.5,
            opacity: 0,
          },
          {
            y: "0%",
            scale: 1.0,
            rotateZ: 0,
            opacity: 1,
            ease: "power2.out",
          },
          0.52
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      id="experience"
      data-section="process"
      data-theme="light"
      className="relative z-30 w-full bg-[#D8D4CC] text-[#090909] select-none border-t border-[#090909]/15"
    >
      <div
        ref={pinTargetRef}
        className="relative w-full h-screen min-h-[700px] flex flex-col justify-between p-6 sm:p-10 md:p-16 lg:px-24 overflow-hidden"
      >
        {/* ─── Top Editorial Meta & Section Headline ─── */}
        <div className="max-w-7xl mx-auto w-full flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-[#090909]/15">
          <div className="space-y-2">
            <span className="text-xs font-sans tracking-[0.24em] text-[#77736D] uppercase font-bold">
              THE EXPERIENCE
            </span>
            <h2 className="font-display text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-[-0.04em] uppercase text-[#090909] leading-[0.88]">
              {STAGES[activeStep].title}
            </h2>
          </div>

          <div className="flex items-center gap-6 sm:gap-10">
            {STAGES.map((s, idx) => (
              <div
                key={s.id}
                className={`flex items-center gap-2 text-xs font-mono tracking-[0.20em] uppercase transition-all duration-300 ${
                  activeStep === idx ? "font-bold text-[#090909]" : "text-[#77736D]"
                }`}
              >
                <span>{s.title}</span>
                {activeStep === idx && <span className="w-1.5 h-1.5 rounded-full bg-[#090909]" />}
              </div>
            ))}
          </div>
        </div>

        {/* ─── Layered Spatial Plates Stage ─── */}
        <div className="max-w-5xl mx-auto w-full flex-1 relative my-4 sm:my-6 flex items-center justify-center">
          {/* Plate 1: Capture */}
          <div
            ref={card1Ref}
            className="absolute inset-0 max-h-[56vh] my-auto w-full flex flex-col md:flex-row items-center gap-8 md:gap-12 will-change-transform"
          >
            <div className="relative w-full md:w-3/5 h-full aspect-[4/3] max-h-[52vh] overflow-hidden bg-[#090909] shadow-2xl">
              <Image
                src={STAGES[0].image}
                alt={STAGES[0].title}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 60vw"
                className="object-cover"
              />
            </div>
            <div className="w-full md:w-2/5 flex flex-col justify-center gap-4">
              <span className="text-xs font-mono tracking-[0.22em] text-[#77736D] uppercase">
                {STAGES[0].tag}
              </span>
              <p className="font-sans text-sm sm:text-base text-[#090909] leading-relaxed">
                {STAGES[0].desc}
              </p>
              <span className="text-xs font-mono tracking-wider text-[#77736D] pt-2 border-t border-[#090909]/10">
                {STAGES[0].meta}
              </span>
            </div>
          </div>

          {/* Plate 2: Create (Slides over Plate 1) */}
          <div
            ref={card2Ref}
            className="absolute inset-0 max-h-[56vh] my-auto w-full flex flex-col md:flex-row items-center gap-8 md:gap-12 will-change-transform"
            style={{ transform: "translateY(110%)", opacity: 0 }}
          >
            <div className="relative w-full md:w-3/5 h-full aspect-[4/3] max-h-[52vh] overflow-hidden bg-[#090909] shadow-2xl">
              <Image
                src={STAGES[1].image}
                alt={STAGES[1].title}
                fill
                sizes="(max-width: 768px) 100vw, 60vw"
                className="object-cover"
              />
            </div>
            <div className="w-full md:w-2/5 flex flex-col justify-center gap-4">
              <span className="text-xs font-mono tracking-[0.22em] text-[#77736D] uppercase">
                {STAGES[1].tag}
              </span>
              <p className="font-sans text-sm sm:text-base text-[#090909] leading-relaxed">
                {STAGES[1].desc}
              </p>
              <span className="text-xs font-mono tracking-wider text-[#77736D] pt-2 border-t border-[#090909]/10">
                {STAGES[1].meta}
              </span>
            </div>
          </div>

          {/* Plate 3: Keep (Slides over Plate 2) */}
          <div
            ref={card3Ref}
            className="absolute inset-0 max-h-[56vh] my-auto w-full flex flex-col md:flex-row items-center gap-8 md:gap-12 will-change-transform"
            style={{ transform: "translateY(110%)", opacity: 0 }}
          >
            <div className="relative w-full md:w-3/5 h-full aspect-[4/3] max-h-[52vh] overflow-hidden bg-[#090909] shadow-2xl">
              <Image
                src={STAGES[2].image}
                alt={STAGES[2].title}
                fill
                sizes="(max-width: 768px) 100vw, 60vw"
                className="object-cover"
              />
            </div>
            <div className="w-full md:w-2/5 flex flex-col justify-center gap-4">
              <span className="text-xs font-mono tracking-[0.22em] text-[#77736D] uppercase">
                {STAGES[2].tag}
              </span>
              <p className="font-sans text-sm sm:text-base text-[#090909] leading-relaxed">
                {STAGES[2].desc}
              </p>
              <span className="text-xs font-mono tracking-wider text-[#77736D] pt-2 border-t border-[#090909]/10">
                {STAGES[2].meta}
              </span>
            </div>
          </div>
        </div>

        {/* ─── Bottom Navigation Action ─── */}
        <div className="max-w-7xl mx-auto w-full pt-4 flex items-center justify-between text-xs font-mono tracking-[0.24em] uppercase text-[#77736D] border-t border-[#090909]/15">
          <span>ATELIER PROCESS</span>
          <Link
            href="/book"
            className="font-bold text-[#090909] hover:underline underline-offset-4 inline-flex items-center gap-1"
          >
            <span>RESERVE APPOINTMENT</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
