"use client";

import React, { useEffect, useRef, useCallback } from "react";
import * as THREE from "three";
import gsap from "gsap";
import {
  irisLabVertexShader,
  irisLabFragmentShader,
} from "./shaders.glsl";

interface IrisLabSceneProps {
  className?: string;
}

export default function IrisLabScene({ className = "" }: IrisLabSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  const initScene = useCallback(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }

    const testCanvas = document.createElement("canvas");
    const gl =
      testCanvas.getContext("webgl2") ||
      testCanvas.getContext("webgl") ||
      testCanvas.getContext("experimental-webgl");
    if (!gl) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const isTouchDevice =
      typeof window !== "undefined" &&
      (window.matchMedia("(pointer: coarse)").matches || "ontouchstart" in window);

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      powerPreference: "high-performance",
      alpha: false,
    });
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(dpr);
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const loader = new THREE.TextureLoader();
    const setupTex = (tex: THREE.Texture, isSrgb: boolean = true) => {
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
      tex.generateMipmaps = true;
      tex.colorSpace = isSrgb ? THREE.SRGBColorSpace : THREE.LinearSRGBColorSpace;
    };

    const colorTex = loader.load("/assets/iris/iris-color.webp", (t) => setupTex(t, true));
    const heightTex = loader.load("/assets/iris/iris-height.webp", (t) => setupTex(t, false));
    const maskTex = loader.load("/assets/iris/iris-mask.webp", (t) => setupTex(t, false));
    const macroTex = loader.load("/assets/iris/iris-macro.webp", (t) => {
      setupTex(t, true);
      t.wrapS = THREE.RepeatWrapping;
      t.wrapT = THREE.RepeatWrapping;
    });

    // ─── Uniforms ───
    const uniforms = {
      uColorTex: { value: colorTex },
      uHeightTex: { value: heightTex },
      uMaskTex: { value: maskTex },
      uMacroTex: { value: macroTex },
      uTime: { value: 0 },
      uIntroProgress: { value: 0 },
      uIntroZoom: { value: 5.2 },
      uCameraTarget: { value: new THREE.Vector2(-0.16, 0.20) },
      uScreenPointer: { value: new THREE.Vector2(-10, -10) },
      uPointerActive: { value: 0 },
      uPointerVelocity: { value: 0 },
      uResolution: { value: new THREE.Vector2(width * dpr, height * dpr) },
      uScrollProgress: { value: 0 },
      uScrollRotation: { value: 0 },
      uIrisOffset: { value: new THREE.Vector2(0, 0) },
      uIrisScale: { value: 1.0 },
      uReducedMotion: { value: prefersReducedMotion ? 1.0 : 0.0 },
      uClickProgress: { value: 0 },
      uClickOrigin: { value: new THREE.Vector2(0.5, 0.5) },
    };

    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      vertexShader: irisLabVertexShader,
      fragmentShader: irisLabFragmentShader,
      uniforms,
      depthTest: false,
      depthWrite: false,
    });
    const quad = new THREE.Mesh(geometry, material);
    scene.add(quad);

    const onResize = () => {
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || window.innerHeight;
      renderer.setSize(width, height);
      uniforms.uResolution.value.set(width * dpr, height * dpr);
    };
    window.addEventListener("resize", onResize);

    // ─── Screen to Isometric UV Coordinate Mapping ───
    const targetScreenPointer = new THREE.Vector2(-10, -10);
    const currentScreenPointer = new THREE.Vector2(-10, -10);
    const prevScreenPointer = new THREE.Vector2(-10, -10);
    let targetHover = 0;
    let currentHover = 0;
    let currentVelocity = 0;

    const screenToIso = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      const nx = (clientX - rect.left) / rect.width - 0.5;
      const ny = -((clientY - rect.top) / rect.height - 0.5);
      const aspect = width / height;
      const isoX = aspect >= 1.0 ? nx * aspect : nx;
      const isoY = aspect >= 1.0 ? ny : ny / aspect;
      return { isoX, isoY };
    };

    const updatePointer = (clientX: number, clientY: number) => {
      const { isoX, isoY } = screenToIso(clientX, clientY);
      targetScreenPointer.set(isoX, isoY);
      const distFromCenter = Math.sqrt(isoX * isoX + isoY * isoY);

      // Active within the circular iris boundary (radius 0.465)
      if (distFromCenter < 0.49) {
        targetHover = 1.0;
      } else {
        targetHover = 0.0;
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      if (isTouchDevice) return;
      updatePointer(e.clientX, e.clientY);
    };

    const onMouseLeave = () => {
      targetHover = 0.0;
    };

    // Click & Tap Interaction
    const triggerClickAt = (clientX: number, clientY: number) => {
      const { isoX, isoY } = screenToIso(clientX, clientY);
      const baseRadius = 0.465;
      const totalZoom = uniforms.uIntroZoom.value;
      const texX = (isoX / (baseRadius * 2.0)) / totalZoom + 0.5 + uniforms.uCameraTarget.value.x;
      const texY = (isoY / (baseRadius * 2.0)) / totalZoom + 0.5 + uniforms.uCameraTarget.value.y;

      uniforms.uClickOrigin.value.set(texX, texY);
      gsap.killTweensOf(uniforms.uClickProgress);
      uniforms.uClickProgress.value = 0.0;
      gsap.to(uniforms.uClickProgress, {
        value: 1.0,
        duration: 1.15,
        ease: "power2.out",
        onComplete: () => {
          uniforms.uClickProgress.value = 0.0;
        },
      });
    };

    const onClick = (e: MouseEvent) => {
      // If intro is still playing, interrupt it and jump to settled state
      if (introTimeline && introTimeline.progress() < 1.0 && !introTimeline.paused()) {
        introTimeline.progress(1.0);
        return;
      }
      triggerClickAt(e.clientX, e.clientY);
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        updatePointer(touch.clientX, touch.clientY);
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (e.changedTouches.length === 1) {
        const touch = e.changedTouches[0];
        triggerClickAt(touch.clientX, touch.clientY);
        setTimeout(() => {
          targetHover = 0.0;
        }, 300);
      }
    };

    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseleave", onMouseLeave);
    canvas.addEventListener("click", onClick);
    canvas.addEventListener("touchstart", onTouchStart, { passive: true });
    canvas.addEventListener("touchend", onTouchEnd, { passive: true });

    // Keyboard shortcut to skip or replay
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === " ") {
        if (introTimeline && introTimeline.progress() < 1.0) {
          introTimeline.progress(1.0);
        }
      } else if (e.key === "r" || e.key === "R") {
        introTimeline.restart();
      }
    };
    window.addEventListener("keydown", onKeyDown);

    // Scroll depth zoom
    let targetScroll = 0;
    let currentScroll = 0;

    const onScroll = () => {
      const maxScroll = window.innerHeight * 1.5;
      targetScroll = Math.min(Math.max(window.scrollY / maxScroll, 0), 1);
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    // ─── Part 1: Directed Master Cinematic GSAP Timeline (0.00–3.80s) ───
    const introState = {
      progress: 0.0,
      zoom: 5.2,
      targetX: -0.16,
      targetY: 0.20,
    };

    const introTimeline = gsap.timeline({
      paused: true,
      onComplete: () => {
        try {
          sessionStorage.setItem("iris_lab_intro_played", "1");
        } catch {}
        (window as any).__irisIntroComplete = true;
      },
    });

    if (prefersReducedMotion) {
      introTimeline.set(introState, {
        progress: 1.0,
        zoom: 1.0,
        targetX: 0.0,
        targetY: 0.0,
      });
    } else {
      // 0.00–0.60s: Macro Discovery
      // Extreme close-up on microscopic junction of icy teal and amber fibrils
      introTimeline.fromTo(
        introState,
        { progress: 0.0, zoom: 5.2, targetX: -0.16, targetY: 0.20 },
        { progress: 0.14, zoom: 5.0, targetX: -0.14, targetY: 0.18, duration: 0.60, ease: "sine.inOut" },
        0.00
      );

      // 0.60–1.60s: Microscopic Exploration
      // Camera travels across intricate branching networks with subtle depth separation and directional light
      introTimeline.to(
        introState,
        {
          progress: 0.35,
          zoom: 4.0,
          targetX: -0.06,
          targetY: 0.12,
          duration: 1.00,
          ease: "power1.inOut",
        },
        0.60
      );

      // 1.60–2.90s: The Great Reveal (Dramatic Camera Pullback)
      // Camera smoothly accelerates and decelerates backwards; pupil core enters center of composition
      introTimeline.to(
        introState,
        {
          progress: 0.82,
          zoom: 1.25,
          targetX: 0.010,
          targetY: 0.005,
          duration: 1.30,
          ease: "power2.inOut",
        },
        1.60
      );

      // 2.90–3.50s: Full Iris Emergence & Settle
      // Full circular iris settles gracefully into resting framing
      introTimeline.to(
        introState,
        {
          progress: 0.96,
          zoom: 1.00,
          targetX: 0.0,
          targetY: 0.0,
          duration: 0.60,
          ease: "power2.out",
        },
        2.90
      );

      // 3.50–3.80s: Living State Handoff
      // Seamless transition directly into continuous biological idle motion
      introTimeline.to(
        introState,
        {
          progress: 1.00,
          zoom: 1.00,
          targetX: 0.0,
          targetY: 0.0,
          duration: 0.30,
          ease: "none",
        },
        3.50
      );
    }

    // Check URL parameters & repeat session navigation
    const urlParams = new URLSearchParams(window.location.search);
    const seekParam = urlParams.get("t");
    const forceReplay = urlParams.get("replay") === "1";
    let hasSeenIntro = false;
    try {
      hasSeenIntro = sessionStorage.getItem("iris_lab_intro_played") === "1";
    } catch {}

    if (seekParam !== null) {
      const seekTime = parseFloat(seekParam);
      introTimeline.seek(seekTime);
      introTimeline.pause();
    } else if (hasSeenIntro && !forceReplay) {
      // Repeat visit: start settled
      introTimeline.progress(1.0);
    } else {
      setTimeout(() => {
        introTimeline.play();
      }, 200);
    }

    // Expose testing harness
    (window as any).__irisLabTimeline = introTimeline;
    (window as any).__irisLabSeek = (t: number) => {
      introTimeline.pause();
      introTimeline.seek(t);
    };
    (window as any).__irisLabReplay = () => {
      introTimeline.restart();
    };
    (window as any).__irisLabTriggerClick = (x?: number, y?: number) => {
      const cx = x !== undefined ? x : width * 0.55;
      const cy = y !== undefined ? y : height * 0.45;
      triggerClickAt(cx, cy);
    };
    (window as any).__irisReady = true;

    // ─── Render Loop with Frame-Rate Independent Velocity & Decay ───
    const clock = new THREE.Clock();
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const delta = Math.min(clock.getDelta(), 0.1);
      const elapsed = clock.getElapsedTime();

      uniforms.uTime.value = elapsed;

      // Update intro state from GSAP timeline
      uniforms.uIntroProgress.value = introState.progress;
      uniforms.uIntroZoom.value = introState.zoom;
      uniforms.uCameraTarget.value.set(introState.targetX, introState.targetY);

      // Smooth pointer tracking (tau ~ 85ms)
      const smoothFactor = 1.0 - Math.exp(-delta * 12.0);
      currentScreenPointer.lerp(targetScreenPointer, smoothFactor);
      uniforms.uScreenPointer.value.copy(currentScreenPointer);

      // Pointer velocity
      const dist = currentScreenPointer.distanceTo(prevScreenPointer);
      const instantVel = delta > 0 ? dist / delta : 0;
      currentVelocity += (instantVel - currentVelocity) * smoothFactor;
      uniforms.uPointerVelocity.value = Math.min(currentVelocity, 3.5);
      prevScreenPointer.copy(currentScreenPointer);

      // Natural recovery decay (500–850ms)
      // Hover speed when active = 9.0; recovery speed when leaving = 3.4 (tau ~ 290ms)
      const hoverSpeed = targetHover > currentHover ? 9.0 : 3.4;
      currentHover += (targetHover - currentHover) * (1.0 - Math.exp(-delta * hoverSpeed));
      uniforms.uPointerActive.value = currentHover;

      // Scroll depth zoom
      currentScroll += (targetScroll - currentScroll) * (1.0 - Math.exp(-delta * 7.0));
      uniforms.uScrollProgress.value = currentScroll;

      renderer.render(scene, camera);
    };

    animate();

    cleanupRef.current = () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("keydown", onKeyDown);
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mouseleave", onMouseLeave);
      canvas.removeEventListener("click", onClick);
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchend", onTouchEnd);
      introTimeline.kill();
      renderer.dispose();
      material.dispose();
      geometry.dispose();
      colorTex.dispose();
      heightTex.dispose();
      maskTex.dispose();
      macroTex.dispose();
    };
  }, []);

  useEffect(() => {
    initScene();
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, [initScene]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden bg-[#030304] select-none ${className}`}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block cursor-crosshair touch-none"
      />
    </div>
  );
}
