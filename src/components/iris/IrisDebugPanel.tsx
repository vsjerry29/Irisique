"use client";

import React, { useState } from "react";
import { Eye, Box, Layers, Play, Pause, Compass, RotateCcw, Crosshair } from "lucide-react";

export interface DebugState {
  geometryOnly: boolean;
  wireframe: boolean;
  disableMaterials: boolean;
  paused: boolean;
  showPointerInfluence: boolean;
}

interface IrisDebugPanelProps {
  debugState: DebugState;
  onUpdateState: (newState: Partial<DebugState>) => void;
  onResetCamera: () => void;
  totalInstances: number;
  totalTriangles: number;
  fps: number;
}

export default function IrisDebugPanel({
  debugState,
  onUpdateState,
  onResetCamera,
  totalInstances,
  totalTriangles,
  fps,
}: IrisDebugPanelProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      aria-label="3D Procedural Iris Debug Tools"
      className="fixed bottom-6 right-6 z-50 bg-[#09090d]/92 backdrop-blur-xl border border-[#2a2a35] text-[#f0f0f2] text-xs font-mono rounded shadow-2xl p-4 max-w-sm w-full select-none"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#22222c] pb-2.5 mb-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold tracking-wider text-[11px] uppercase text-emerald-400">
            PROCEDURAL 3D GEOMETRY INSPECTOR
          </span>
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-[#888894] hover:text-white px-1.5 py-0.5 rounded text-[10px] uppercase border border-[#2a2a35]"
        >
          {collapsed ? "EXPAND" : "MINIMIZE"}
        </button>
      </div>

      {!collapsed && (
        <div className="flex flex-col gap-3">
          {/* Real-time Geometry Counter (Proof of Real Mesh) */}
          <div className="grid grid-cols-2 gap-2 bg-[#121218] p-2.5 rounded border border-[#1e1e28] text-[11px]">
            <div>
              <span className="text-[#8e8e9c] block text-[9px] uppercase tracking-wider">
                Active Strands:
              </span>
              <span className="font-bold text-white tracking-wide">
                {totalInstances.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-[#8e8e9c] block text-[9px] uppercase tracking-wider">
                Total Triangles:
              </span>
              <span className="font-bold text-white tracking-wide">
                {totalTriangles.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-[#8e8e9c] block text-[9px] uppercase tracking-wider">
                GPU Draw Calls:
              </span>
              <span className="font-bold text-emerald-400">3 Calls</span>
            </div>
            <div>
              <span className="text-[#8e8e9c] block text-[9px] uppercase tracking-wider">
                Frame Rate:
              </span>
              <span className="font-bold text-emerald-400">{fps} FPS</span>
            </div>
          </div>

          {/* Interactive Inspection Toggles */}
          <div className="flex flex-col gap-1.5">
            {/* 1. Geometry Only (Normal Vector Shading) */}
            <button
              onClick={() =>
                onUpdateState({
                  geometryOnly: !debugState.geometryOnly,
                  disableMaterials: false,
                })
              }
              className={`flex items-center justify-between px-3 py-2 rounded text-left transition-colors border ${
                debugState.geometryOnly
                  ? "bg-amber-500/20 border-amber-500/80 text-amber-300"
                  : "bg-[#16161e] border-[#252532] text-[#d0d0d8] hover:bg-[#1c1c28]"
              }`}
            >
              <span className="flex items-center gap-2">
                <Box className="w-3.5 h-3.5" />
                <span>Geometry Only (Normals)</span>
              </span>
              <span className="text-[10px] font-bold">
                {debugState.geometryOnly ? "ON" : "OFF"}
              </span>
            </button>

            {/* 2. Wireframe Mode */}
            <button
              onClick={() => onUpdateState({ wireframe: !debugState.wireframe })}
              className={`flex items-center justify-between px-3 py-2 rounded text-left transition-colors border ${
                debugState.wireframe
                  ? "bg-cyan-500/20 border-cyan-500/80 text-cyan-300"
                  : "bg-[#16161e] border-[#252532] text-[#d0d0d8] hover:bg-[#1c1c28]"
              }`}
            >
              <span className="flex items-center gap-2">
                <Layers className="w-3.5 h-3.5" />
                <span>Wireframe Triangles</span>
              </span>
              <span className="text-[10px] font-bold">
                {debugState.wireframe ? "ON" : "OFF"}
              </span>
            </button>

            {/* 3. Disable Materials (Clay Mode) */}
            <button
              onClick={() =>
                onUpdateState({
                  disableMaterials: !debugState.disableMaterials,
                  geometryOnly: false,
                })
              }
              className={`flex items-center justify-between px-3 py-2 rounded text-left transition-colors border ${
                debugState.disableMaterials
                  ? "bg-purple-500/20 border-purple-500/80 text-purple-300"
                  : "bg-[#16161e] border-[#252532] text-[#d0d0d8] hover:bg-[#1c1c28]"
              }`}
            >
              <span className="flex items-center gap-2">
                <Eye className="w-3.5 h-3.5" />
                <span>Disable Materials (Clay)</span>
              </span>
              <span className="text-[10px] font-bold">
                {debugState.disableMaterials ? "ON" : "OFF"}
              </span>
            </button>

            {/* 4. Pause / Resume Animation */}
            <button
              onClick={() => onUpdateState({ paused: !debugState.paused })}
              className={`flex items-center justify-between px-3 py-2 rounded text-left transition-colors border ${
                debugState.paused
                  ? "bg-rose-500/20 border-rose-500/80 text-rose-300"
                  : "bg-[#16161e] border-[#252532] text-[#d0d0d8] hover:bg-[#1c1c28]"
              }`}
            >
              <span className="flex items-center gap-2">
                {debugState.paused ? (
                  <Play className="w-3.5 h-3.5" />
                ) : (
                  <Pause className="w-3.5 h-3.5" />
                )}
                <span>Pause Animation</span>
              </span>
              <span className="text-[10px] font-bold">
                {debugState.paused ? "PAUSED" : "ACTIVE"}
              </span>
            </button>

            {/* 5. Show Pointer Influence */}
            <button
              onClick={() =>
                onUpdateState({
                  showPointerInfluence: !debugState.showPointerInfluence,
                })
              }
              className={`flex items-center justify-between px-3 py-2 rounded text-left transition-colors border ${
                debugState.showPointerInfluence
                  ? "bg-emerald-500/20 border-emerald-500/80 text-emerald-300"
                  : "bg-[#16161e] border-[#252532] text-[#d0d0d8] hover:bg-[#1c1c28]"
              }`}
            >
              <span className="flex items-center gap-2">
                <Crosshair className="w-3.5 h-3.5" />
                <span>Show Pointer Influence</span>
              </span>
              <span className="text-[10px] font-bold">
                {debugState.showPointerInfluence ? "SHOWN" : "HIDDEN"}
              </span>
            </button>
          </div>

          {/* Reset Camera */}
          <button
            onClick={onResetCamera}
            className="flex items-center justify-center gap-2 px-3 py-2 rounded bg-[#1e1e2a] hover:bg-[#252535] text-[#ededf0] border border-[#323245] transition-colors mt-1 font-semibold text-[11px]"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#7ec8e3]" />
            <span>RESET CAMERA</span>
          </button>
        </div>
      )}
    </aside>
  );
}
