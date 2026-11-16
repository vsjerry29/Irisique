"use client";

import React, { useRef, useEffect, useState, useMemo, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  buildOpticalTraceSpline,
  OpticalTraceSpline,
  SectionMetric,
} from "@/lib/motion/opticalTraceGeometry";

// Default fallback baseline metrics
const DEFAULT_METRICS = {
  art: { id: "art", relTop: 0, height: 1467, relBottom: 1467 },
  collection: { id: "collection", relTop: 1467, height: 1406, relBottom: 2873 },
  experience: { id: "experience", relTop: 2873, height: 2521, relBottom: 5394 },
  booking: { id: "booking", relTop: 5394, height: 1018, relBottom: 6412 },
  footer: { id: "footer", relTop: 6412, height: 811, relBottom: 7223 },
};

export default function OpticalTraceSystem() {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const activePathRef = useRef<SVGPathElement>(null);
  const ghostPathRef = useRef<SVGPathElement>(null);
  const focalHeadRef = useRef<SVGCircleElement>(null);
  const focalRingRef = useRef<SVGCircleElement>(null);

  const [metrics, setMetrics] = useState(DEFAULT_METRICS);
  const [dimensions, setDimensions] = useState({ width: 1440, height: 7223 });
  const [isMobile, setIsMobile] = useState(false);
  const [isDebug, setIsDebug] = useState(false);
  const [debugInfo, setDebugInfo] = useState({
    scrollProgress: 0,
    pathProgress: 0,
    activeSection: "HERO_EXIT",
    headX: 0,
    headY: 0,
  });

  // Check for ?threadDebug=1
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setIsDebug(params.has("threadDebug") || params.get("debug") === "thread");
    }
  }, []);

  // Measure sections relative to #post-hero-system
  const measureSections = useCallback(() => {
    if (typeof window === "undefined") return;

    const postHeroEl = document.getElementById("post-hero-system");
    if (!postHeroEl) return;

    const baseTop = postHeroEl.getBoundingClientRect().top + window.scrollY;
    const w = postHeroEl.clientWidth || window.innerWidth;
    const mobile = w < 768;
    setIsMobile(mobile);

    const getMetric = (selector: string, fallback: SectionMetric): SectionMetric => {
      const el = document.querySelector(selector) as HTMLElement | null;
      if (!el) return fallback;
      const r = el.getBoundingClientRect();
      const top = r.top + window.scrollY - baseTop;
      const h = el.offsetHeight;
      return {
        id: fallback.id,
        relTop: Math.max(0, top),
        height: h,
        relBottom: top + h,
      };
    };

    const art = getMetric("#art", DEFAULT_METRICS.art);
    const collection = getMetric('[data-section="collection"]', DEFAULT_METRICS.collection);
    const experience = getMetric("#experience", DEFAULT_METRICS.experience);
    const booking = getMetric("#booking", DEFAULT_METRICS.booking);
    const footer = getMetric("#footer", DEFAULT_METRICS.footer);

    const totalH = Math.max(footer.relBottom, postHeroEl.offsetHeight || 7200);

    setDimensions({ width: w, height: totalH });
    setMetrics({ art, collection, experience, booking, footer });
  }, []);

  useEffect(() => {
    measureSections();

    const debouncedMeasure = () => {
      requestAnimationFrame(measureSections);
    };

    window.addEventListener("resize", debouncedMeasure);
    window.addEventListener("orientationchange", debouncedMeasure);

    // Re-measure after webfonts & layouts establish
    const t1 = setTimeout(debouncedMeasure, 200);
    const t2 = setTimeout(debouncedMeasure, 800);
    const t3 = setTimeout(debouncedMeasure, 1800);

    return () => {
      window.removeEventListener("resize", debouncedMeasure);
      window.removeEventListener("orientationchange", debouncedMeasure);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [measureSections]);

  // Compute mathematical spline based on current metrics
  const spline: OpticalTraceSpline = useMemo(() => {
    return buildOpticalTraceSpline(dimensions.width, metrics, isMobile);
  }, [dimensions.width, metrics, isMobile]);

  // Compute multi-surface gradient color stops
  const gradientStops = useMemo(() => {
    const total = dimensions.height || 7223;
    const pArtEnd = (metrics.art.relBottom / total) * 100;
    const pColEnd = (metrics.collection.relBottom / total) * 100;
    const pExpEnd = (metrics.experience.relBottom / total) * 100;
    const pBookEnd = (metrics.booking.relBottom / total) * 100;

    return {
      artEnd: Math.min(Math.max(pArtEnd, 5), 35).toFixed(1),
      colEnd: Math.min(Math.max(pColEnd, 20), 55).toFixed(1),
      expEnd: Math.min(Math.max(pExpEnd, 50), 82).toFixed(1),
      bookEnd: Math.min(Math.max(pBookEnd, 75), 94).toFixed(1),
    };
  }, [dimensions.height, metrics]);

  // ─── Liquid Scroll Animation Coordination ───
  useEffect(() => {
    if (typeof window === "undefined" || !activePathRef.current || !containerRef.current) return;

    gsap.registerPlugin(ScrollTrigger);

    const path = activePathRef.current;
    const pathLength = path.getTotalLength ? path.getTotalLength() : 7500;

    // Check prefers-reduced-motion
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      gsap.set(path, { strokeDasharray: "none", strokeDashoffset: 0, opacity: 0.5 });
      if (focalHeadRef.current) gsap.set(focalHeadRef.current, { opacity: 0 });
      if (focalRingRef.current) gsap.set(focalRingRef.current, { opacity: 0 });
      return;
    }

    // Set initial stroke dash state
    gsap.set(path, {
      strokeDasharray: `${pathLength}`,
      strokeDashoffset: pathLength,
      opacity: 0.85,
    });

    const triggerEl = document.getElementById("post-hero-system") || containerRef.current;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: triggerEl,
        start: "top 85%",
        end: "bottom bottom",
        scrub: 0.65,
        onUpdate: (self) => {
          const progress = self.progress;

          // Scrub path reveal
          const currentDist = progress * pathLength;
          const offset = pathLength - currentDist;
          gsap.set(path, { strokeDashoffset: offset });

          // Update travelling optical focal bead position along the exact Bézier path
          if (path.getPointAtLength && focalHeadRef.current && focalRingRef.current) {
            const pt = path.getPointAtLength(currentDist);
            focalHeadRef.current.setAttribute("cx", String(pt.x));
            focalHeadRef.current.setAttribute("cy", String(pt.y));
            focalRingRef.current.setAttribute("cx", String(pt.x));
            focalRingRef.current.setAttribute("cy", String(pt.y));

            // Dynamic color adaptation for the focal head:
            // If inside booking section (dark), bead is warm ivory; else graphite
            const isInsideDarkSection =
              pt.y >= metrics.booking.relTop - 40 && pt.y <= metrics.booking.relBottom + 40;

            const headFill = isInsideDarkSection ? "#F4F1EA" : "#090909";
            const headStroke = isInsideDarkSection ? "#090909" : "#F4F1EA";
            const ringStroke = isInsideDarkSection ? "#F4F1EA" : "#171717";

            focalHeadRef.current.setAttribute("fill", headFill);
            focalHeadRef.current.setAttribute("stroke", headStroke);
            focalRingRef.current.setAttribute("stroke", ringStroke);

            // Active section name calculation for debug
            let activeSec = "02 / THE ART OF IRIS";
            if (pt.y >= metrics.collection.relTop && pt.y < metrics.experience.relTop) {
              activeSec = "03 / THE COLLECTION";
            } else if (pt.y >= metrics.experience.relTop && pt.y < metrics.booking.relTop) {
              activeSec = "04 / THE EXPERIENCE";
            } else if (pt.y >= metrics.booking.relTop && pt.y < metrics.footer.relTop) {
              activeSec = "05 / YOUR TURN";
            } else if (pt.y >= metrics.footer.relTop) {
              activeSec = "06 / ATELIER FOOTER";
            }

            if (isDebug) {
              setDebugInfo({
                scrollProgress: Number((progress * 100).toFixed(1)),
                pathProgress: Number(((currentDist / pathLength) * 100).toFixed(1)),
                activeSection: activeSec,
                headX: Number(pt.x.toFixed(1)),
                headY: Number(pt.y.toFixed(1)),
              });
            }
          }
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, [spline, metrics, isDebug]);

  return (
    <div
      ref={containerRef}
      id="optical-trace-layer"
      className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-hidden select-none transition-opacity duration-300"
      aria-hidden="true"
    >
      <svg
        ref={svgRef}
        viewBox={spline.viewBox}
        width="100%"
        height="100%"
        preserveAspectRatio="none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full overflow-visible will-change-transform pointer-events-none"
      >
        <defs>
          {/* Continuous multi-surface gradient matching section backgrounds perfectly */}
          <linearGradient
            id="opticalTraceMultiSurfaceGradient"
            x1="0"
            y1="0"
            x2="0"
            y2="100%"
            gradientUnits="userSpaceOnUse"
          >
            {/* Gallery (Warm Ivory #F4F1EA) -> Graphite #262626 */}
            <stop offset="0%" stopColor="#262626" stopOpacity="0.65" />
            <stop offset={`${gradientStops.artEnd}%`} stopColor="#262626" stopOpacity="0.65" />

            {/* Collection (Warm Ivory #F4F1EA) -> Graphite #262626 */}
            <stop offset={`${gradientStops.colEnd}%`} stopColor="#262626" stopOpacity="0.65" />

            {/* Experience (Stone #D8D4CC) -> Deep Charcoal #1F1F1F */}
            <stop offset={`${gradientStops.expEnd}%`} stopColor="#1F1F1F" stopOpacity="0.70" />

            {/* Transition into Booking (Deep Black #090909) -> Luminous Warm Ivory #F4F1EA */}
            <stop offset={`${Number(gradientStops.expEnd) + 0.8}%`} stopColor="#F4F1EA" stopOpacity="0.85" />
            <stop offset={`${gradientStops.bookEnd}%`} stopColor="#F4F1EA" stopOpacity="0.85" />

            {/* Transition into Footer (Warm Ivory #F4F1EA) -> Graphite #262626 */}
            <stop offset={`${Number(gradientStops.bookEnd) + 0.8}%`} stopColor="#262626" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#262626" stopOpacity="0.65" />
          </linearGradient>

          {/* Ghost Guide Gradient (Faint, elegant underlayer) */}
          <linearGradient
            id="opticalTraceGhostGradient"
            x1="0"
            y1="0"
            x2="0"
            y2="100%"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#262626" stopOpacity="0.22" />
            <stop offset={`${gradientStops.expEnd}%`} stopColor="#262626" stopOpacity="0.22" />
            <stop offset={`${Number(gradientStops.expEnd) + 0.8}%`} stopColor="#F4F1EA" stopOpacity="0.30" />
            <stop offset={`${gradientStops.bookEnd}%`} stopColor="#F4F1EA" stopOpacity="0.30" />
            <stop offset={`${Number(gradientStops.bookEnd) + 0.8}%`} stopColor="#262626" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#262626" stopOpacity="0.22" />
          </linearGradient>
        </defs>

        {/* ─── Layer 1: Ghost Guide Ray (Delicate irregular dot-dash rhythm) ─── */}
        <path
          ref={ghostPathRef}
          d={spline.d}
          stroke="url(#opticalTraceGhostGradient)"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeDasharray="2 12 18 14 3 10 32 16 2 12"
          className="pointer-events-none"
        />

        {/* ─── Layer 2: Active Progressive Travel Path (Scrubbed to page scroll) ─── */}
        <path
          ref={activePathRef}
          d={spline.d}
          stroke="url(#opticalTraceMultiSurfaceGradient)"
          strokeWidth="1.5"
          strokeLinecap="round"
          className="pointer-events-none"
        />

        {/* ─── Layer 3: Precision Optical Reticles at Key Transition Landmarks ─── */}
        <g className="opacity-60 pointer-events-none">
          {spline.anchors.map((pt, i) => (
            <g key={i} transform={`translate(${pt.x}, ${pt.y})`}>
              <line x1="-5" y1="0" x2="5" y2="0" stroke="currentColor" strokeWidth="0.75" />
              <line x1="0" y1="-5" x2="0" y2="5" stroke="currentColor" strokeWidth="0.75" />
              <circle cx="0" cy="0" r="1.2" fill="currentColor" />
            </g>
          ))}
        </g>

        {/* ─── Layer 4: The Travelling Optical Signal Head (Glides in exact sync with scroll) ─── */}
        {/* Subtle concentric reticle ring */}
        <circle
          ref={focalRingRef}
          cx="0"
          cy="0"
          r="8"
          fill="none"
          stroke="#171717"
          strokeWidth="0.8"
          strokeDasharray="2 2"
          className="pointer-events-none transition-colors duration-200"
        />
        {/* Precision focal bead */}
        <circle
          ref={focalHeadRef}
          cx="0"
          cy="0"
          r="3.5"
          fill="#090909"
          stroke="#F4F1EA"
          strokeWidth="1"
          className="pointer-events-none transition-colors duration-200"
        />

        {/* ─── Layer 5: Debug Anchors & Labels (?threadDebug=1) ─── */}
        {isDebug && (
          <g className="opacity-90 pointer-events-none">
            {spline.anchors.map((pt, i) => (
              <g key={i} transform={`translate(${pt.x}, ${pt.y})`}>
                <circle cx="0" cy="0" r="4" fill="#e11d48" />
                <text
                  x="8"
                  y="4"
                  fill="#e11d48"
                  fontSize="10"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {pt.label} ({pt.x.toFixed(0)}, {pt.y.toFixed(0)})
                </text>
              </g>
            ))}
          </g>
        )}
      </svg>

      {/* ─── Diagnostic Telemetry HUD (?threadDebug=1) ─── */}
      {isDebug && (
        <div
          data-thread-debug="true"
          className="fixed bottom-6 left-6 z-[9999] bg-[#090909]/95 text-[#FAFAF8] border border-white/20 p-4 font-mono text-xs shadow-2xl max-w-sm pointer-events-auto backdrop-blur-md"
        >
          <div className="flex items-center justify-between border-b border-white/15 pb-2 mb-2 font-bold text-white">
            <span>OPTICAL TRACE 2.0 TELEMETRY</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <div className="space-y-1 text-white/80">
            <div className="flex justify-between">
              <span>Scroll Progress:</span>
              <span className="font-bold text-white">{debugInfo.scrollProgress}%</span>
            </div>
            <div className="flex justify-between">
              <span>Path Progress:</span>
              <span className="font-bold text-white">{debugInfo.pathProgress}%</span>
            </div>
            <div className="flex justify-between">
              <span>Active Section:</span>
              <span className="font-bold text-amber-300">{debugInfo.activeSection}</span>
            </div>
            <div className="flex justify-between">
              <span>Focal Bead Coordinates:</span>
              <span className="text-white">
                X: {debugInfo.headX} / Y: {debugInfo.headY}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Document Canvas:</span>
              <span className="text-white">
                {dimensions.width}px × {dimensions.height}px
              </span>
            </div>
            <div className="flex justify-between text-xs text-white/60 pt-1">
              <span>Device Profile:</span>
              <span>{isMobile ? "Mobile (Simplified)" : "Desktop (Expansive)"}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
