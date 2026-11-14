"use client";

import React, { useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function CoupleExperience() {
  const containerRef = useRef<HTMLDivElement>(null);
  const amberEyeRef = useRef<HTMLDivElement>(null);
  const blueEyeRef = useRef<HTMLDivElement>(null);
  const finalArtworkRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const actionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const amber = amberEyeRef.current;
    const blue = blueEyeRef.current;
    const finalArt = finalArtworkRef.current;
    const heading = headingRef.current;
    const action = actionRef.current;

    if (!container || !amber || !blue || !finalArt) return;

    const ctx = gsap.context(() => {
      // Timeline pinned for 200vh travel
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: "top top",
          end: "+=200%",
          pin: true,
          pinSpacing: true,
          scrub: 0.8,
          invalidateOnRefresh: true,
        },
      });

      // ─── Initial Setup ───
      // Stage A (0% – 20%): Separated at left and right, hidden until section activates
      gsap.set(amber, { xPercent: -90, yPercent: 0, rotation: -12, scale: 0.85, opacity: 0 });
      gsap.set(blue, { xPercent: 90, yPercent: 0, rotation: 12, scale: 0.85, opacity: 0 });
      gsap.set(finalArt, { opacity: 0, scale: 0.95 });
      gsap.set(heading, { opacity: 0.4, y: 0 });
      gsap.set(action, { opacity: 0, y: 15 });

      // ─── Stage A: Seamless Entry Fade-in (0% – 15%) ───
      tl.to(
        [amber, blue],
        {
          opacity: 1,
          duration: 0.15,
          ease: "power1.out",
        },
        0.00
      );

      // ─── Stage B: Attraction along curved trajectories (15% – 55%) ───
      tl.to(
        amber,
        {
          xPercent: -22,
          yPercent: 4,
          rotation: 4,
          scale: 0.96,
          ease: "power2.inOut",
          duration: 0.35,
        },
        0.15
      );

      tl.to(
        blue,
        {
          xPercent: 22,
          yPercent: -4,
          rotation: -4,
          scale: 0.96,
          ease: "power2.inOut",
          duration: 0.35,
        },
        0.15
      );

      tl.to(
        heading,
        {
          opacity: 1,
          duration: 0.25,
          ease: "none",
        },
        0.20
      );

      // ─── Stage C & D: Connection & Final Artwork Dissolve (55% – 85%) ───
      // Both irises meet at the center and smoothly dissolve into the unified couple piece
      tl.to(
        amber,
        {
          xPercent: -12,
          yPercent: 0,
          rotation: 0,
          scale: 1.0,
          opacity: 0,
          duration: 0.25,
          ease: "power1.inOut",
        },
        0.55
      );

      tl.to(
        blue,
        {
          xPercent: 12,
          yPercent: 0,
          rotation: 0,
          scale: 1.0,
          opacity: 0,
          duration: 0.25,
          ease: "power1.inOut",
        },
        0.55
      );

      tl.to(
        finalArt,
        {
          opacity: 1,
          scale: 1.0,
          duration: 0.25,
          ease: "power2.out",
        },
        0.58
      );

      // ─── Stage E: Handoff & Action (85% – 100%) ───
      tl.to(
        action,
        {
          opacity: 1,
          y: 0,
          duration: 0.15,
          ease: "power2.out",
        },
        0.80
      );
    }, container);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="couple"
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden bg-[#030405] text-[#f0f0f2] flex flex-col justify-between p-6 sm:p-12 md:p-16 select-none"
    >
      {/* Top Meta Label */}
      <div className="relative z-20 flex items-center justify-between w-full">
        <div className="flex items-center gap-2.5 text-[10px] font-mono tracking-[0.30em] uppercase text-[#7ec8e3]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#7ec8e3] animate-pulse" />
          <span>04 / DUAL HARMONY</span>
        </div>
        <span className="text-[10px] font-mono tracking-widest uppercase text-[#555566]">
          INTERLOCKING STROMA
        </span>
      </div>

      {/* Main 3D Choreography Stage */}
      <div className="relative z-10 w-full flex-1 flex items-center justify-center">
        {/* Eye 1: Amber Partner */}
        <div
          ref={amberEyeRef}
          className="absolute w-[280px] sm:w-[420px] md:w-[500px] aspect-square rounded-full overflow-hidden shadow-[0_0_80px_rgba(224,152,72,0.15)] will-change-transform"
        >
          <Image
            src="/assets/couple/couple_amber.webp"
            alt="Amber Iris Partner"
            fill
            sizes="(max-width: 768px) 280px, 500px"
            priority
            className="object-cover"
          />
        </div>

        {/* Eye 2: Blue Partner */}
        <div
          ref={blueEyeRef}
          className="absolute w-[280px] sm:w-[420px] md:w-[500px] aspect-square rounded-full overflow-hidden shadow-[0_0_80px_rgba(126,200,227,0.15)] will-change-transform"
        >
          <Image
            src="/assets/couple/couple_blue.webp"
            alt="Blue Iris Partner"
            fill
            sizes="(max-width: 768px) 280px, 500px"
            priority
            className="object-cover"
          />
        </div>

        {/* Unified Final Artwork (Reveals seamlessly at connection) */}
        <div
          ref={finalArtworkRef}
          className="absolute w-[92vw] max-w-[960px] aspect-[16/9] rounded-2xl overflow-hidden border border-[#222232] bg-[#020304] shadow-[0_0_120px_rgba(0,0,0,0.95)] will-change-transform"
        >
          <Image
            src="/assets/couple/couple_artwork_final.webp"
            alt="Two Become One Couple Artwork"
            fill
            sizes="(max-width: 768px) 92vw, 960px"
            className="object-cover"
          />
        </div>
      </div>

      {/* Bottom Typography & Discreet Action */}
      <div className="relative z-20 flex flex-col sm:flex-row sm:items-end justify-between gap-6 w-full">
        <h2
          ref={headingRef}
          className="font-display text-4xl sm:text-6xl md:text-7xl font-light tracking-[-0.04em] uppercase text-[#f7f7fa]"
        >
          TWO BECOME ONE.
        </h2>

        <div ref={actionRef} className="flex items-center gap-4">
          <Link
            href="/products"
            className="group inline-flex items-center gap-3 px-6 py-3 border border-[#2a2a3a] hover:border-[#7ec8e3] bg-[#07070c]/80 backdrop-blur-md text-xs font-mono tracking-[0.20em] uppercase text-white transition-all duration-300"
          >
            <span>EXPLORE COUPLE ARTWORK</span>
            <ArrowUpRight className="w-4 h-4 text-[#7ec8e3] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
