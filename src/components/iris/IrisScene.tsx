"use client";

import React, { useEffect, useRef, useCallback } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  irisLabVertexShader,
  irisLabFragmentShader,
} from "../iris-lab/shaders.glsl";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface IrisSceneProps {
  scrollTrackRef: React.RefObject<HTMLDivElement | null>;
  heroRef?: React.RefObject<HTMLDivElement | null>;
  heroScrollRef?: React.RefObject<HTMLDivElement | null>;
  nextSectionRef?: React.RefObject<HTMLDivElement | null>;
  captionRef?: React.RefObject<HTMLDivElement | null>;
  onIntroComplete?: () => void;
  className?: string;
}

export default function IrisScene({
  scrollTrackRef,
  heroRef,
  heroScrollRef,
  nextSectionRef,
  captionRef,
  onIntroComplete,
  className = "",
}: IrisSceneProps) {
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

    const checkIsMobile = () => width < 1024;
    let isMobile = checkIsMobile();

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

    let texturesLoaded = false;
    let sceneReady = false;

    const manager = new THREE.LoadingManager();
    manager.onLoad = () => {
      texturesLoaded = true;
      if (sceneReady) {
        startEntrance();
      }
    };

    const loader = new THREE.TextureLoader(manager);
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
    sceneReady = true;

    const onResize = () => {
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || window.innerHeight;
      isMobile = checkIsMobile();
      renderer.setSize(width, height);
      uniforms.uResolution.value.set(width * dpr, height * dpr);
      ScrollTrigger.refresh();
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

      // Distance from current animated iris center (taking offset & scale into account)
      const currentOffsetX = uniforms.uIrisOffset.value.x;
      const currentOffsetY = uniforms.uIrisOffset.value.y;
      const currentScale = uniforms.uIrisScale.value;
      const dx = isoX - currentOffsetX;
      const dy = isoY - currentOffsetY;
      const distFromIrisCenter = Math.sqrt(dx * dx + dy * dy);

      if (distFromIrisCenter < 0.49 * currentScale) {
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

    // Click & Tap Interaction (Calculated in rotated & offset texture coordinates)
    const triggerClickAt = (clientX: number, clientY: number) => {
      const { isoX, isoY } = screenToIso(clientX, clientY);
      const baseRadius = 0.465;
      const currentScale = uniforms.uIrisScale.value;
      const totalZoom = uniforms.uIntroZoom.value;
      const rot = uniforms.uScrollRotation.value;
      const offsetX = uniforms.uIrisOffset.value.x;
      const offsetY = uniforms.uIrisOffset.value.y;

      const px = isoX - offsetX;
      const py = isoY - offsetY;
      const cosR = Math.cos(-rot);
      const sinR = Math.sin(-rot);
      const rx = cosR * px - sinR * py;
      const ry = sinR * px + cosR * py;

      const texX = (rx / (baseRadius * 2.0 * currentScale)) / totalZoom + 0.5 + uniforms.uCameraTarget.value.x;
      const texY = (ry / (baseRadius * 2.0 * currentScale)) / totalZoom + 0.5 + uniforms.uCameraTarget.value.y;

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

    window.addEventListener("mousemove", onMouseMove);
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

    // ─── 1. Directed Master Cinematic Intro Timeline (0.00–3.80s) ───
    const introState = {
      progress: 0.0,
      zoom: 5.2,
      targetX: -0.16,
      targetY: 0.20,
    };

    // Initially position hero UI for synchronized entrance
    if (heroRef?.current) {
      gsap.set(heroRef.current, { opacity: 0, y: 16 });
    }
    if (heroScrollRef?.current) {
      gsap.set(heroScrollRef.current, { opacity: 1, y: 0, autoAlpha: 1 });
    }
    if (nextSectionRef?.current) {
      gsap.set(nextSectionRef.current, { opacity: 0, y: 50 });
    }
    if (captionRef?.current) {
      gsap.set(captionRef.current, { opacity: 0, y: 15 });
    }

    const introTimeline = gsap.timeline({
      paused: true,
      onComplete: () => {
        (window as any).__irisHomepageIntroComplete = true;
        if (onIntroComplete) onIntroComplete();
      },
    });

    if (prefersReducedMotion) {
      introTimeline.set(introState, {
        progress: 1.0,
        zoom: 1.0,
        targetX: 0.0,
        targetY: 0.0,
      });
      if (heroRef?.current) {
        introTimeline.set(heroRef.current, { opacity: 1, y: 0 });
      }
    } else {
      // 0.00–0.60s: Macro Discovery (zoom 5.2)
      introTimeline.fromTo(
        introState,
        { progress: 0.0, zoom: 5.2, targetX: -0.16, targetY: 0.20 },
        { progress: 0.14, zoom: 5.0, targetX: -0.14, targetY: 0.18, duration: 0.60, ease: "sine.inOut" },
        0.00
      );

      // 0.60–1.60s: Microscopic Exploration
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

      // 1.60–2.90s: Dramatic Pullback Reveal
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

      // 2.70–3.60s: Coordinated Hero Typography Reveal (Enters as camera slows naturally)
      if (heroRef?.current) {
        introTimeline.to(
          heroRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.90,
            ease: "power2.out",
          },
          2.70
        );
      }

      // 2.90–3.50s: Full Iris Settle
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

    let userHasScrolled = false;
    const onUserScroll = () => {
      userHasScrolled = true;
    };
    window.addEventListener("scroll", onUserScroll, { passive: true });

    // Function to start or reset entrance animation cleanly on every page load and replay
    const startEntrance = () => {
      userHasScrolled = false;
      if (typeof window !== "undefined") {
        if ("scrollRestoration" in window.history) {
          window.history.scrollRestoration = "manual";
        }
        window.scrollTo(0, 0);
      }
      ScrollTrigger.refresh();

      // Reset intro camera & animation state to initial extreme macro
      introState.progress = 0.0;
      introState.zoom = 5.2;
      introState.targetX = -0.16;
      introState.targetY = 0.20;

      // Reset shader uniforms
      uniforms.uIntroProgress.value = 0.0;
      uniforms.uIntroZoom.value = 5.2;
      uniforms.uCameraTarget.value.set(-0.16, 0.20);
      uniforms.uScrollProgress.value = 0.0;
      uniforms.uScrollRotation.value = 0.0;
      uniforms.uIrisOffset.value.set(0.0, 0.0);
      uniforms.uIrisScale.value = 1.0;

      // Reset DOM overlays
      if (heroRef?.current) gsap.set(heroRef.current, { opacity: 0, y: 16 });
      if (heroScrollRef?.current) gsap.set(heroScrollRef.current, { opacity: 1, y: 0, autoAlpha: 1 });
      if (nextSectionRef?.current) gsap.set(nextSectionRef.current, { opacity: 0, y: 50 });
      if (captionRef?.current) gsap.set(captionRef.current, { opacity: 0, y: 15 });

      // Render one initial frame immediately
      renderer.render(scene, camera);

      if (prefersReducedMotion) {
        introTimeline.progress(1.0);
        if (heroRef?.current) gsap.set(heroRef.current, { opacity: 1, y: 0 });
      } else {
        introTimeline.restart();
      }
    };

    // If textures and scene quad are already prepared, start entrance
    if (texturesLoaded && sceneReady) {
      startEntrance();
    }

    // ─── 2. Scroll-Driven Master ScrollTrigger Timeline (Liquid-Smooth Scrub) ───
    const scrollState = {
      rotation: 0,
      scale: 1.0,
      offsetX: 0,
      offsetY: 0,
    };

    let scrollTimeline: gsap.core.Timeline | null = null;

    if (scrollTrackRef?.current) {
      scrollTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: scrollTrackRef.current,
          pin: true,
          pinSpacing: true,
          start: "top top",
          end: "+=220%",
          scrub: 1.0, // Liquid-smooth 1.0s catchup
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            uniforms.uScrollProgress.value = self.progress;

            // Only advance intro if user has deliberately initiated scrolling while intro is running
            if (userHasScrolled && self.progress > 0.01 && introTimeline && introTimeline.progress() < 1.0) {
              introTimeline.progress(1.0);
            }

            // Reverse scroll restoration: When scroll progress reaches the top (0.00), ensure hero text is restored
            if (self.progress === 0 && introTimeline && introTimeline.progress() >= 1.0) {
              if (heroRef?.current) gsap.set(heroRef.current, { opacity: 1, y: 0 });
              if (heroScrollRef?.current) gsap.set(heroScrollRef.current, { opacity: 1, y: 0, autoAlpha: 1 });
            }
          },
        },
      });

      // ─── Phase A (0.00 – 0.20): Hero beginning ───
      // Rotate 10-15 degrees, slight scale increase, hero text moves out
      scrollTimeline.to(
        scrollState,
        {
          rotation: THREE.MathUtils.degToRad(14),
          scale: 1.08,
          offsetX: 0.0,
          offsetY: 0.0,
          duration: 0.20,
          ease: "power1.inOut",
        },
        0.00
      );

      const scrollTarget = heroScrollRef?.current || heroRef?.current;
      if (scrollTarget) {
        scrollTimeline.fromTo(
          scrollTarget,
          {
            opacity: 1,
            y: 0,
            autoAlpha: 1,
          },
          {
            opacity: 0,
            y: -45,
            autoAlpha: 0,
            duration: 0.18,
            ease: "power1.inOut",
            immediateRender: false,
          },
          0.00
        );
      }

      // ─── Phase B (0.20 – 0.55): Immersive motion ───
      // Rotate to ~65 degrees, zoom closer (1.35x desktop / 1.20x mobile), controlled depth
      scrollTimeline.to(
        scrollState,
        {
          rotation: THREE.MathUtils.degToRad(65),
          scale: () => (checkIsMobile() ? 1.20 : 1.35),
          offsetX: () => (checkIsMobile() ? 0.0 : 0.05),
          offsetY: () => (checkIsMobile() ? -0.04 : -0.02),
          duration: 0.35,
          ease: "power2.inOut",
        },
        0.20
      );

      if (captionRef?.current) {
        scrollTimeline.fromTo(
          captionRef.current,
          { opacity: 0, y: 15 },
          { opacity: 0.85, y: 0, duration: 0.15, ease: "power1.out" },
          0.26
        );
        scrollTimeline.to(
          captionRef.current,
          { opacity: 0, y: -15, duration: 0.12, ease: "power1.in" },
          0.44
        );
      }

      // ─── Phase C (0.55 – 0.80): Transition into next section ───
      // Scale down (0.68x), rotate to 108 degrees, reposition to right side (+0.28 desktop / +0.18y mobile)
      // Reveal next section's content around it
      scrollTimeline.to(
        scrollState,
        {
          rotation: THREE.MathUtils.degToRad(108),
          scale: () => (checkIsMobile() ? 0.58 : 0.68),
          offsetX: () => (checkIsMobile() ? 0.0 : 0.28),
          offsetY: () => (checkIsMobile() ? 0.18 : 0.0),
          duration: 0.25,
          ease: "power2.inOut",
        },
        0.55
      );

      if (nextSectionRef?.current) {
        scrollTimeline.fromTo(
          nextSectionRef.current,
          { opacity: 0, y: 45 },
          { opacity: 1, y: 0, duration: 0.24, ease: "power2.out" },
          0.58
        );
      }

      // ─── Phase D (0.80 – 1.00): Next section established ───
      // Settle naturally into final composition (120 degrees, 0.65x scale, +0.28x offset)
      // The iris remains permanently visible as part of the editorial composition!
      scrollTimeline.to(
        scrollState,
        {
          rotation: THREE.MathUtils.degToRad(120),
          scale: () => (checkIsMobile() ? 0.55 : 0.65),
          offsetX: () => (checkIsMobile() ? 0.0 : 0.28),
          offsetY: () => (checkIsMobile() ? 0.18 : 0.0),
          duration: 0.20,
          ease: "power1.out",
        },
        0.80
      );
    }

    // Expose testing harness
    (window as any).__irisHomepageTimeline = introTimeline;
    (window as any).__irisHomepageScrollTimeline = scrollTimeline;
    (window as any).__irisReplayIntro = () => {
      userHasScrolled = false;
      if (scrollTimeline && (scrollTimeline as any).scrollTrigger) {
        (scrollTimeline as any).scrollTrigger.scroll(0);
        (scrollTimeline as any).scrollTrigger.update();
      }
      startEntrance();
    };
    (window as any).__irisScrollToProgress = (p: number) => {
      if (scrollTimeline && (scrollTimeline as any).scrollTrigger) {
        const st = (scrollTimeline as any).scrollTrigger;
        const targetScroll = st.start + (st.end - st.start) * p;
        window.scrollTo({ top: targetScroll, behavior: "instant" });
        st.scroll(targetScroll);
        st.update();
      } else if (scrollTrackRef?.current) {
        const totalScrollable = scrollTrackRef.current.scrollHeight - window.innerHeight;
        window.scrollTo({ top: totalScrollable * p, behavior: "instant" });
      }
    };
    (window as any).__irisTriggerClick = (x?: number, y?: number) => {
      const cx = x !== undefined ? x : width * 0.55;
      const cy = y !== undefined ? y : height * 0.45;
      triggerClickAt(cx, cy);
    };
    (window as any).__irisReady = true;

    // ─── Render Loop with Biological Breathing & Tactile Cursor ───
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

      // Update scroll-driven uniforms directly from scrollState (zero React state overhead)
      uniforms.uScrollRotation.value = scrollState.rotation;
      uniforms.uIrisScale.value = scrollState.scale;
      uniforms.uIrisOffset.value.set(scrollState.offsetX, scrollState.offsetY);

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
      const hoverSpeed = targetHover > currentHover ? 9.0 : 3.4;
      currentHover += (targetHover - currentHover) * (1.0 - Math.exp(-delta * hoverSpeed));
      uniforms.uPointerActive.value = currentHover;

      renderer.render(scene, camera);
    };

    animate();

    cleanupRef.current = () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("scroll", onUserScroll);
      canvas.removeEventListener("mouseleave", onMouseLeave);
      canvas.removeEventListener("click", onClick);
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchend", onTouchEnd);
      introTimeline.kill();
      if (scrollTimeline) {
        scrollTimeline.kill();
      }
      ScrollTrigger.getAll().forEach((t) => t.kill());
      renderer.dispose();
      material.dispose();
      geometry.dispose();
      colorTex.dispose();
      heightTex.dispose();
      maskTex.dispose();
      macroTex.dispose();
    };
  }, [scrollTrackRef, heroRef, heroScrollRef, nextSectionRef, captionRef, onIntroComplete]);

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
