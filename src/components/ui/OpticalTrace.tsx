"use client";

import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface OpticalTraceProps {
  className?: string;
  theme?: "light" | "dark";
  variant?: "hero-to-gallery" | "artwork" | "collection" | "booking" | "compact";
}

/**
 * THE OPTICAL TRACE — Signature IRIS Motion Motif
 * A fine ray of light travelling through an imaginary optical system.
 * Asymmetric curved path with a fine continuous segment, irregular micro-dashes,
 * and a scroll-driven or interactive luminous focal point.
 */
export default function OpticalTrace({
  className = "",
  theme = "light",
  variant = "hero-to-gallery",
}: OpticalTraceProps) {
  const containerRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const dotRef = useRef<SVGCircleElement>(null);

  const strokeColor = theme === "dark" ? "#FAFAF8" : "#090909";
  const glowColor = theme === "dark" ? "#FFFFFF" : "#171717";

  useEffect(() => {
    if (typeof window === "undefined" || !pathRef.current || !containerRef.current) return;

    gsap.registerPlugin(ScrollTrigger);

    const path = pathRef.current;
    const pathLength = path.getTotalLength ? path.getTotalLength() : 600;

    // Initial setup: stroke hidden
    gsap.set(path, {
      strokeDasharray: `${pathLength * 0.4} ${pathLength * 0.15} ${pathLength * 0.15} ${pathLength * 0.3}`,
      strokeDashoffset: pathLength,
      opacity: 0.4,
    });

    if (dotRef.current) {
      gsap.set(dotRef.current, { opacity: 0 });
    }

    const ctx = gsap.context(() => {
      // Animate stroke and moving focal point driven by scroll
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 85%",
          end: "bottom 15%",
          scrub: 0.6,
        },
      });

      tl.to(path, {
        strokeDashoffset: 0,
        opacity: 0.65,
        ease: "none",
      });

      if (dotRef.current) {
        tl.to(
          dotRef.current,
          {
            opacity: 1,
            ease: "none",
          },
          0.1
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, [variant]);

  // Distinct geometric paths depending on section context
  let pathD = "M 20,10 C 180,80 320,10 500,90 S 780,180 980,120";
  let viewBox = "0 0 1000 200";

  if (variant === "artwork") {
    pathD = "M 50,20 C 220,160 400,30 650,140 S 850,50 950,110";
    viewBox = "0 0 1000 180";
  } else if (variant === "booking") {
    pathD = "M 10,90 C 200,10 420,170 700,50 S 900,130 990,40";
    viewBox = "0 0 1000 160";
  } else if (variant === "compact") {
    pathD = "M 10,30 C 120,60 220,10 340,50";
    viewBox = "0 0 350 80";
  }

  return (
    <svg
      ref={containerRef}
      viewBox={viewBox}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`pointer-events-none select-none overflow-visible will-change-transform ${className}`}
      aria-hidden="true"
    >
      {/* Background shadow stroke for depth */}
      <path
        d={pathD}
        stroke={strokeColor}
        strokeWidth="1"
        strokeOpacity="0.15"
        strokeLinecap="round"
      />

      {/* Primary Optical Trace Segment */}
      <path
        ref={pathRef}
        d={pathD}
        stroke={strokeColor}
        strokeWidth="1.25"
        strokeLinecap="round"
      />

      {/* Moving Optical Focal Reticle */}
      <circle
        ref={dotRef}
        cx="500"
        cy="90"
        r="2.5"
        fill={glowColor}
        className="transition-opacity duration-300"
      />
    </svg>
  );
}
