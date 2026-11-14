"use client";

import React, { useState, useEffect } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Activity, X, Gauge, Layers, Eye, RefreshCw } from "lucide-react";

export default function MotionDebugPanel() {
  const [enabled, setEnabled] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [fps, setFps] = useState(60);
  const [activeSection, setActiveSection] = useState("hero");
  const [triggersInfo, setTriggersInfo] = useState<Array<{ id: string; progress: number; isActive: boolean }>>([]);
  const [motionDisabled, setMotionDisabled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("motionDebug") === "1") {
      setEnabled(true);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    let frameCount = 0;
    let lastTime = performance.now();
    let animId: number;

    const measureLoop = () => {
      frameCount++;
      const now = performance.now();
      if (now - lastTime >= 1000) {
        setFps(Math.round((frameCount * 1000) / (now - lastTime)));
        frameCount = 0;
        lastTime = now;
      }

      setScrollY(Math.round(window.scrollY));

      // Query active ScrollTriggers
      if (typeof window !== "undefined" && (window as any).ScrollTrigger) {
        const triggers = ScrollTrigger.getAll();
        setTriggersInfo(
          triggers.map((st, i) => {
            const trig = st.trigger as HTMLElement | null;
            return {
              id: trig?.id || `st-${i}`,
              progress: Math.round(st.progress * 100) / 100,
              isActive: st.isActive,
            };
          })
        );
      }

      // Determine active section by scroll position
      const sections = ["explore", "universe", "gallery", "couple", "products", "inquire"];
      let currentSec = "explore";
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= window.innerHeight * 0.4 && rect.bottom >= window.innerHeight * 0.4) {
            currentSec = id;
            break;
          }
        }
      }
      setActiveSection(currentSec);

      animId = requestAnimationFrame(measureLoop);
    };

    animId = requestAnimationFrame(measureLoop);
    return () => cancelAnimationFrame(animId);
  }, [enabled]);

  const toggleMotion = () => {
    const nextState = !motionDisabled;
    setMotionDisabled(nextState);
    if (typeof window !== "undefined") {
      (window as any).__irisMotionDisabled = nextState;
      if (nextState) {
        document.body.classList.add("reduce-motion-forced");
      } else {
        document.body.classList.remove("reduce-motion-forced");
      }
    }
  };

  const jumpTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (!enabled) return null;

  return (
    <aside
      aria-label="Motion Debug Panel"
      className="fixed bottom-6 right-6 z-[99999] max-w-sm w-full bg-[#0a0c10]/95 backdrop-blur-md border border-[#2a2d38] p-4 text-[#f0f0f4] text-xs font-mono shadow-[0_10px_40px_rgba(0,0,0,0.8)]"
    >
      <div className="flex items-center justify-between border-b border-[#202430] pb-2 mb-3">
        <div className="flex items-center gap-2 text-[#7ec8e3]">
          <Activity className="w-4 h-4 animate-pulse" />
          <span className="font-bold tracking-widest uppercase">MOTION ARCHITECTURE HUD</span>
        </div>
        <button
          onClick={() => setEnabled(false)}
          className="text-[#666677] hover:text-white transition-colors"
          title="Close Debug Panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3 text-[11px]">
        <div className="bg-[#121520] p-2 border border-[#1e2230]">
          <span className="text-[#888899] block text-[9px] uppercase">Active Scene</span>
          <span className="font-semibold text-white uppercase">{activeSection}</span>
        </div>
        <div className="bg-[#121520] p-2 border border-[#1e2230]">
          <span className="text-[#888899] block text-[9px] uppercase">FPS / Frame Time</span>
          <span className={`font-semibold ${fps < 45 ? "text-amber-400" : "text-emerald-400"}`}>
            {fps} FPS ({Math.round(1000 / (fps || 1))}ms)
          </span>
        </div>
        <div className="bg-[#121520] p-2 border border-[#1e2230]">
          <span className="text-[#888899] block text-[9px] uppercase">Scroll Position</span>
          <span className="font-semibold text-white">{scrollY}px</span>
        </div>
        <div className="bg-[#121520] p-2 border border-[#1e2230]">
          <span className="text-[#888899] block text-[9px] uppercase">Triggers Active</span>
          <span className="font-semibold text-white">{triggersInfo.filter((t) => t.isActive).length} / {triggersInfo.length}</span>
        </div>
      </div>

      {/* Triggers breakdown */}
      <div className="mb-3 max-h-24 overflow-y-auto space-y-1 pr-1 border border-[#1e2230] p-1.5 bg-[#0e1017]">
        {triggersInfo.map((tr, idx) => (
          <div key={idx} className="flex items-center justify-between text-[10px]">
            <span className={tr.isActive ? "text-[#7ec8e3] font-bold" : "text-[#777788]"}>
              #{tr.id || `trigger-${idx}`}
            </span>
            <span className="font-mono text-[#aaaabb]">
              {(tr.progress * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>

      {/* Scene Quick Jump */}
      <div className="mb-3">
        <span className="text-[#777788] block text-[9px] uppercase tracking-wider mb-1">Quick Jump</span>
        <div className="grid grid-cols-3 gap-1">
          {["explore", "gallery", "couple", "products", "inquire"].map((id) => (
            <button
              key={id}
              onClick={() => jumpTo(id)}
              className="px-2 py-1 bg-[#161a26] hover:bg-[#7ec8e3] hover:text-black border border-[#232838] text-[9px] uppercase tracking-wider transition-colors"
            >
              {id}
            </button>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between border-t border-[#202430] pt-2">
        <button
          onClick={toggleMotion}
          className={`px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider transition-colors border ${
            motionDisabled
              ? "bg-amber-600 border-amber-500 text-white"
              : "bg-[#181d28] border-[#2a3040] text-[#9999aa] hover:text-white"
          }`}
        >
          {motionDisabled ? "Motion: OFF" : "Motion: ON"}
        </button>

        <button
          onClick={() => {
            if (typeof window !== "undefined" && (window as any).__irisReplayIntro) {
              (window as any).__irisReplayIntro();
            }
          }}
          className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] uppercase tracking-wider bg-[#181d28] border border-[#2a3040] text-[#9999aa] hover:text-white transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Replay Intro</span>
        </button>
      </div>
    </aside>
  );
}
