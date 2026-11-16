"use client";

import React, { useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const STEPS = [
  {
    num: "01",
    label: "CAPTURE",
    description: "Discover the details within your iris.",
    detail: "A painless, safe, and instantaneous optical macro scan at our Pondicherry studio revealing the unique stroma pattern.",
  },
  {
    num: "02",
    label: "CREATE",
    description: "Choose your artwork and composition.",
    detail: "Select from solo, couple, or family arrangements, refined through fine art pigments or sculptural acrylic formats.",
  },
  {
    num: "03",
    label: "KEEP",
    description: "Receive your personalised creation.",
    detail: "Handcrafted, certified with unique biometric timestamps, and delivered in museum archival packaging.",
  },
];

export default function ExperienceSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current || !imageRef.current) return;

    // Subtle scroll-driven parallax reveal of the atelier capture image
    const ctx = gsap.context(() => {
      gsap.fromTo(
        imageRef.current,
        { y: 35, opacity: 0.85 },
        {
          y: -25,
          opacity: 1,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.0,
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="experience"
      data-theme="light"
      className="relative z-30 w-full py-24 sm:py-32 md:py-40 bg-[#E8E6E1] text-[#080808] px-6 sm:px-10 md:px-16 lg:px-24 select-none border-t border-[#080808]/10"
    >
      <div className="max-w-7xl mx-auto w-full flex flex-col gap-16 md:gap-24">
        {/* Section Eyebrow */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-[#080808]/10">
          <div>
            <span className="text-[11px] font-mono tracking-[0.28em] uppercase text-[#77736D] block mb-3">
              04 / THE EXPERIENCE
            </span>
            <h2 className="font-display text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-light tracking-[-0.04em] uppercase text-[#080808] leading-[0.92]">
              THE ATELIER PROCESS.
            </h2>
          </div>

          <Link
            href="/book"
            className="group inline-flex items-center gap-2 text-xs font-sans tracking-[0.20em] uppercase font-semibold text-[#080808] hover:opacity-70 transition-opacity"
          >
            <span>RESERVE SESSION</span>
            <ArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        {/* Two-Column Editorial Layout: Image & Three Plain Steps (NO CARDS, NO ICONS) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
          {/* Left Column: Authentic Atelier Capture Photograph */}
          <div className="lg:col-span-6 w-full">
            <div
              ref={imageRef}
              className="relative w-full aspect-[4/3] sm:aspect-[16/11] overflow-hidden bg-[#FAF7F2] shadow-[0_20px_50px_rgba(8,8,8,0.08)]"
            >
              <Image
                src="/assets/atelier/atelier_capture.webp"
                alt="Optical Macro Iris Capture Station at IRIS Atelier, Pondicherry"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="mt-4 flex items-center justify-between text-[10px] font-mono tracking-widest text-[#77736D] uppercase">
              <span>BESPOKE OPTICAL MACRO SCANNER</span>
              <span>ATELIER • WHITE TOWN</span>
            </div>
          </div>

          {/* Right Column: Three Clean Steps */}
          <div className="lg:col-span-6 flex flex-col justify-center space-y-10 sm:space-y-12">
            {STEPS.map((step) => (
              <div key={step.num} className="flex flex-col gap-2.5">
                <div className="flex items-baseline gap-4">
                  <span className="font-mono text-xs text-[#77736D] tracking-widest">
                    {step.num}
                  </span>
                  <h3 className="font-sans text-xl sm:text-2xl md:text-3xl font-semibold tracking-[-0.02em] uppercase text-[#080808]">
                    {step.label}
                  </h3>
                </div>

                <p className="font-sans text-sm sm:text-base text-[#080808] font-normal pl-8">
                  {step.description}
                </p>

                <p className="font-sans text-xs sm:text-sm text-[#77736D] pl-8 leading-relaxed max-w-md">
                  {step.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
