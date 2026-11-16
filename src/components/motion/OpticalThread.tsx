"use client";

import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  GALLERY_THREAD_PATHS,
  COLLECTION_THREAD_PATH,
  ThreadPathData,
} from "./optical-thread-paths";

interface OpticalThreadProps {
  variant: "gallery" | "collection";
  activeComposition?: "solo" | "couple" | "family";
  className?: string;
  theme?: "light" | "dark";
}

export default function OpticalThread({
  variant,
  activeComposition = "solo",
  className = "",
  theme = "light",
}: OpticalThreadProps) {
  const containerRef = useRef<SVGSVGElement>(null);
  const primaryPathRef = useRef<SVGPathElement>(null);
  const guidePathRef = useRef<SVGPathElement>(null);
  const highlightHeadRef = useRef<SVGCircleElement>(null);
  const pulseRingRef = useRef<SVGCircleElement>(null);
  const focusMarksGroupRef = useRef<SVGGElement>(null);

  const prevCompRef = useRef(activeComposition);

  const strokeColor = theme === "dark" ? "#D8D4CC" : "#262626";
  const guideColor = theme === "dark" ? "rgba(216,212,204,0.18)" : "rgba(38,38,38,0.18)";
  const beadColor = theme === "dark" ? "#FAFAF8" : "#090909";

  const pathData: ThreadPathData =
    variant === "gallery"
      ? GALLERY_THREAD_PATHS[activeComposition] || GALLERY_THREAD_PATHS.solo
      : COLLECTION_THREAD_PATH;

  // ─── Scroll-Linked Thread Reveal & Travelling Focal Bead ───
  useEffect(() => {
    if (typeof window === "undefined" || !primaryPathRef.current || !containerRef.current) return;

    gsap.registerPlugin(ScrollTrigger);

    const path = primaryPathRef.current;
    const pathLength = path.getTotalLength ? path.getTotalLength() : 800;

    // Check for prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      gsap.set(path, {
        strokeDasharray: "none",
        strokeDashoffset: 0,
        opacity: 0.5,
      });
      if (highlightHeadRef.current) {
        gsap.set(highlightHeadRef.current, { opacity: 0 });
      }
      return;
    }

    // Initialize path stroke dash
    gsap.set(path, {
      strokeDasharray: `${pathLength}`,
      strokeDashoffset: pathLength,
      opacity: 0.65,
    });

    // Position bead at start
    const startPoint = path.getPointAtLength(0);
    if (highlightHeadRef.current) {
      gsap.set(highlightHeadRef.current, {
        cx: startPoint.x,
        cy: startPoint.y,
        opacity: 0,
      });
    }

    const ctx = gsap.context(() => {
      // Create scroll-driven scrub animation
      const triggerElement = containerRef.current?.parentElement || containerRef.current;

      const scrubTl = gsap.timeline({
        scrollTrigger: {
          trigger: triggerElement,
          start: variant === "gallery" ? "top 85%" : "top 90%",
          end: variant === "gallery" ? "top 20%" : "bottom 30%",
          scrub: 0.6,
          onUpdate: (self) => {
            const progress = self.progress;
            // Calculate point along path
            const currentDist = progress * pathLength;
            if (path.getPointAtLength && highlightHeadRef.current) {
              const pt = path.getPointAtLength(currentDist);
              highlightHeadRef.current.setAttribute("cx", String(pt.x));
              highlightHeadRef.current.setAttribute("cy", String(pt.y));
            }
          },
        },
      });

      // Reveal stroke
      scrubTl.to(path, {
        strokeDashoffset: 0,
        ease: "none",
        duration: 1,
      }, 0);

      // Fade in bead
      if (highlightHeadRef.current) {
        scrubTl.to(highlightHeadRef.current, {
          opacity: 1,
          duration: 0.2,
          ease: "none",
        }, 0);
      }

      // Subtly reveal focus marks
      if (focusMarksGroupRef.current) {
        scrubTl.fromTo(
          focusMarksGroupRef.current,
          { opacity: 0 },
          { opacity: 0.8, duration: 0.4, ease: "none" },
          0.3
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, [variant]);

  // ─── Composition Switch Interactive Optical Pulse ───
  useEffect(() => {
    if (variant !== "gallery") return;
    if (prevCompRef.current === activeComposition) return;
    prevCompRef.current = activeComposition;

    if (!primaryPathRef.current || !highlightHeadRef.current) return;

    const path = primaryPathRef.current;
    const pathLength = path.getTotalLength ? path.getTotalLength() : 800;

    // Trigger an optical pulse traversal to the newly anchored specimen
    const pulseObj = { progress: 0.2 };

    gsap.killTweensOf(pulseObj);
    gsap.to(pulseObj, {
      progress: 1.0,
      duration: 0.65,
      ease: "power2.out",
      onUpdate: () => {
        if (!path.getPointAtLength || !highlightHeadRef.current) return;
        const pt = path.getPointAtLength(pulseObj.progress * pathLength);
        highlightHeadRef.current.setAttribute("cx", String(pt.x));
        highlightHeadRef.current.setAttribute("cy", String(pt.y));
      },
      onComplete: () => {
        // Expand and dissipate pulse ring at terminal anchor
        if (pulseRingRef.current && path.getPointAtLength) {
          const endPt = path.getPointAtLength(pathLength);
          pulseRingRef.current.setAttribute("cx", String(endPt.x));
          pulseRingRef.current.setAttribute("cy", String(endPt.y));

          gsap.fromTo(
            pulseRingRef.current,
            { r: 3, opacity: 0.8, strokeWidth: 1.5 },
            { r: 16, opacity: 0, strokeWidth: 0.5, duration: 0.55, ease: "power2.out" }
          );
        }
      },
    });
  }, [activeComposition, variant]);

  return (
    <svg
      ref={containerRef}
      viewBox={pathData.viewBox}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`pointer-events-none select-none overflow-visible will-change-transform ${className}`}
      aria-hidden="true"
      data-optical-thread={variant}
    >
      <defs>
        {/* Subtle monochrome line gradient for path depth */}
        <linearGradient id={`threadGrad-${variant}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={strokeColor} stopOpacity="0.25" />
          <stop offset="50%" stopColor={strokeColor} stopOpacity="0.65" />
          <stop offset="100%" stopColor={strokeColor} stopOpacity="0.85" />
        </linearGradient>
      </defs>

      {/* Guide Stroke (Ghost Ray) */}
      <path
        ref={guidePathRef}
        d={pathData.d}
        stroke={guideColor}
        strokeWidth="1"
        strokeLinecap="round"
        strokeDasharray={variant === "collection" ? "12 8 4 8" : "none"}
      />

      {/* Primary Optical Thread Path */}
      <path
        ref={primaryPathRef}
        d={pathData.d}
        stroke={`url(#threadGrad-${variant})`}
        strokeWidth="1.25"
        strokeLinecap="round"
      />

      {/* Optical Reticle Focus Marks */}
      <g ref={focusMarksGroupRef} className="opacity-70">
        {pathData.focusMarks.map((mark, i) => (
          <g key={i} transform={`translate(${mark.x}, ${mark.y})`}>
            {/* Small perpendicular reticle tick */}
            <line
              x1={-mark.length / 2}
              y1={0}
              x2={mark.length / 2}
              y2={0}
              stroke={strokeColor}
              strokeWidth="1"
              transform={`rotate(${mark.angle})`}
            />
            {/* Small cross node */}
            <circle cx="0" cy="0" r="1" fill={strokeColor} />
            {mark.label && (
              <text
                x="8"
                y="3"
                fill={strokeColor}
                opacity="0.45"
                fontSize="8"
                fontFamily="monospace"
                letterSpacing="0.1em"
              >
                {mark.label}
              </text>
            )}
          </g>
        ))}
      </g>

      {/* Interactive Terminal Pulse Ring */}
      <circle
        ref={pulseRingRef}
        cx={pathData.terminalAnchor.x}
        cy={pathData.terminalAnchor.y}
        r="3"
        fill="none"
        stroke={beadColor}
        opacity="0"
      />

      {/* Travelling Optical Focal Bead */}
      <circle
        ref={highlightHeadRef}
        cx="0"
        cy="0"
        r="3.5"
        fill={beadColor}
        stroke={theme === "dark" ? "#090909" : "#F4F1EA"}
        strokeWidth="1"
        className="transition-opacity duration-300"
      />
    </svg>
  );
}
