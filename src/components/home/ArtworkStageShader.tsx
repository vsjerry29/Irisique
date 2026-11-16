"use client";

import React, { useEffect, useRef, useCallback } from "react";
import * as THREE from "three";
import gsap from "gsap";

export interface ArtworkStageShaderProps {
  activeId: "solo" | "couple" | "family";
  onDetailClick?: () => void;
  className?: string;
  isEmbeddedInHero?: boolean;
}

const ARTWORK_TEXTURES: Record<string, { src: string; aspect: number }> = {
  solo: { src: "/assets/gallery/iris_sapphire.webp", aspect: 1.0 },
  couple: { src: "/assets/couple/couple_artwork_final.webp", aspect: 16 / 9 },
  family: { src: "/assets/art/family_artwork_final.webp", aspect: 16 / 9 },
};

const COMP_ORDER: Record<string, number> = { solo: 0, couple: 1, family: 2 };

// ─── Refractive Fibre Reveal GLSL Shaders ───
const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;

  uniform sampler2D uTexCurrent;
  uniform sampler2D uTexNext;
  uniform float uProgress;       // 0.0 to 1.0
  uniform float uDirection;      // +1.0 (rightward) or -1.0 (leftward)
  uniform float uAspectStage;    // stage aspect ratio (16.0 / 9.0)
  uniform float uAspectCurrent;  // 1.0 for solo, 16/9 for couple/family
  uniform float uAspectNext;     // 1.0 for solo, 16/9 for couple/family
  uniform vec2 uResolution;
  uniform float uTime;

  varying vec2 vUv;

  // Center-contain sampler: maps an image of aspect 'imgAspect' centered into 'stageAspect'
  // Outside image bounds, returns pure black vec3(0.0) without stretching or letterbox lines.
  vec3 sampleContain(sampler2D tex, vec2 uv, float imgAspect, float stageAspect) {
    if (imgAspect < stageAspect) {
      // e.g. 1.0 inside 16/9: scale horizontal coordinates
      float scaleX = imgAspect / stageAspect;
      float uMapped = (uv.x - 0.5) / scaleX + 0.5;
      if (uMapped < 0.0 || uMapped > 1.0) {
        return vec3(0.0);
      }
      return texture2D(tex, vec2(uMapped, uv.y)).rgb;
    } else {
      // 16/9 inside 16/9: 1:1 mapping
      return texture2D(tex, uv).rgb;
    }
  }

  void main() {
    // If progress is 0, render current texture cleanly
    if (uProgress <= 0.0001) {
      gl_FragColor = vec4(sampleContain(uTexCurrent, vUv, uAspectCurrent, uAspectStage), 1.0);
      return;
    }
    // If progress is 1, render next texture cleanly
    if (uProgress >= 0.9999) {
      gl_FragColor = vec4(sampleContain(uTexNext, vUv, uAspectNext, uAspectStage), 1.0);
      return;
    }

    // ─── 1. Asymmetric Optical Wavefront Boundary ───
    // Low-frequency organic wave modulation along the vertical axis
    float wave = sin(vUv.y * 3.8 + uDirection * 1.2 + uTime * 0.8) * 0.055
               + cos(vUv.y * 7.5 - uTime * 0.5) * 0.022;

    // Moving wavefront coordinate
    float edgeCoord = vUv.x + wave;
    float sweep = uDirection > 0.0 ? uProgress : (1.0 - uProgress);
    float wavefrontPos = mix(-0.20, 1.20, sweep);

    float distToEdge = uDirection > 0.0 ? (edgeCoord - wavefrontPos) : (wavefrontPos - edgeCoord);

    // ─── 2. Delicate Refractive Optical Displacement (2-4px max near boundary) ───
    float feather = 0.14;
    float band = smoothstep(feather, 0.0, abs(distToEdge));
    
    // Orthogonal optical refraction vector
    vec2 refVector = vec2(
      sin(vUv.y * 14.0 + vUv.x * 6.0),
      cos(vUv.x * 14.0 - vUv.y * 6.0)
    ) * 0.006 * band;

    // ─── 3. Reveal Mask (Smooth, Non-linear Transition Edge) ───
    float revealMask = smoothstep(-feather * 0.75, feather * 0.75, distToEdge);

    // Sample current and next textures with localized refractive displacement
    vec3 colCurrent = sampleContain(uTexCurrent, vUv + refVector * 0.6, uAspectCurrent, uAspectStage);
    vec3 colNext = sampleContain(uTexNext, vUv - refVector * 0.6, uAspectNext, uAspectStage);

    // ─── 4. Restrained Optical Highlight Fringe ───
    // Subtle chromatic luminance along the boundary peak, zero grey dimming
    vec3 highlight = vec3(0.04, 0.07, 0.09) * band * (1.0 - abs(distToEdge) / feather);

    // Blend: pure black background remains pure black (colCurrent & colNext both 0 outside),
    // fine iris fibres transition with refractive optical clarity
    vec3 finalColor = mix(colNext, colCurrent, revealMask) + highlight;

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

export default function ArtworkStageShader({
  activeId,
  onDetailClick,
  className = "",
  isEmbeddedInHero = false,
}: ArtworkStageShaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Three.js instances
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const texturesRef = useRef<Record<string, THREE.Texture>>({});

  // Transition state
  const currentIdRef = useRef<"solo" | "couple" | "family">(activeId);
  const nextIdRef = useRef<"solo" | "couple" | "family">(activeId);
  const animTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const progressObjRef = useRef({ progress: 0 });

  // Uniforms ref
  const uniformsRef = useRef({
    uTexCurrent: { value: null as THREE.Texture | null },
    uTexNext: { value: null as THREE.Texture | null },
    uProgress: { value: 0.0 },
    uDirection: { value: 1.0 },
    uAspectStage: { value: 16.0 / 9.0 },
    uAspectCurrent: { value: 1.0 },
    uAspectNext: { value: 16.0 / 9.0 },
    uResolution: { value: new THREE.Vector2(1920, 1080) },
    uTime: { value: 0.0 },
  });

  // Render frame
  const renderFrame = useCallback(() => {
    if (rendererRef.current && sceneRef.current && cameraRef.current) {
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }
  }, []);

  // Initialize Three.js scene
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let width = container.clientWidth || 800;
    let height = container.clientHeight || 450;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(dpr);
    renderer.setClearColor(0x090909, 1.0);
    rendererRef.current = renderer;

    // Scene & Orthographic Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    cameraRef.current = camera;

    // Load textures
    const textureLoader = new THREE.TextureLoader();
    const loadedTextures: Record<string, THREE.Texture> = {};

    Object.entries(ARTWORK_TEXTURES).forEach(([key, config]) => {
      const tex = textureLoader.load(config.src, () => {
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.generateMipmaps = false;
        renderFrame();
      });
      loadedTextures[key] = tex;
    });
    texturesRef.current = loadedTextures;

    // Set initial textures
    const initialTex = loadedTextures[activeId] || loadedTextures.solo;
    uniformsRef.current.uTexCurrent.value = initialTex;
    uniformsRef.current.uTexNext.value = initialTex;
    uniformsRef.current.uAspectCurrent.value = ARTWORK_TEXTURES[activeId].aspect;
    uniformsRef.current.uAspectNext.value = ARTWORK_TEXTURES[activeId].aspect;
    uniformsRef.current.uAspectStage.value = width / height;
    uniformsRef.current.uResolution.value.set(width * dpr, height * dpr);

    // Fullscreen quad geometry & shader material
    const geo = new THREE.PlaneGeometry(2, 2);
    const mat = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: uniformsRef.current,
      depthTest: false,
      depthWrite: false,
    });
    materialRef.current = mat;

    const mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);

    // Initial render
    renderFrame();

    // Responsive resize
    const handleResize = () => {
      if (!container || !renderer) return;
      width = container.clientWidth || 800;
      height = container.clientHeight || 450;
      renderer.setSize(width, height);
      uniformsRef.current.uAspectStage.value = width / height;
      uniformsRef.current.uResolution.value.set(width * dpr, height * dpr);
      renderFrame();
    };

    window.addEventListener("resize", handleResize);

    // Animation loop for alive breathing during idle / transitions
    let rafId: number;
    let clock = new THREE.Clock();

    const tick = () => {
      const elapsed = clock.getElapsedTime();
      uniformsRef.current.uTime.value = elapsed;
      if (progressObjRef.current.progress > 0.0001 && progressObjRef.current.progress < 0.9999) {
        renderFrame();
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(rafId);
      if (animTimelineRef.current) animTimelineRef.current.kill();
      geo.dispose();
      mat.dispose();
      Object.values(loadedTextures).forEach((t) => t.dispose());
      renderer.dispose();
    };
  }, [renderFrame]);

  // ─── Trigger Refractive Fibre Transition when activeId changes ───
  useEffect(() => {
    if (activeId === currentIdRef.current) return;

    const prevId = currentIdRef.current;
    const nextId = activeId;
    nextIdRef.current = nextId;

    const prevOrder = COMP_ORDER[prevId] ?? 0;
    const nextOrder = COMP_ORDER[nextId] ?? 1;
    const direction = nextOrder >= prevOrder ? 1.0 : -1.0;

    const textures = texturesRef.current;
    const nextTex = textures[nextId];
    if (!nextTex) {
      currentIdRef.current = nextId;
      return;
    }

    // Kill any running transition
    if (animTimelineRef.current) {
      animTimelineRef.current.kill();
    }

    // Setup transition uniforms
    uniformsRef.current.uTexNext.value = nextTex;
    uniformsRef.current.uAspectNext.value = ARTWORK_TEXTURES[nextId].aspect;
    uniformsRef.current.uDirection.value = direction;

    progressObjRef.current.progress = 0;
    uniformsRef.current.uProgress.value = 0;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      // Immediate clean commit
      uniformsRef.current.uTexCurrent.value = nextTex;
      uniformsRef.current.uAspectCurrent.value = ARTWORK_TEXTURES[nextId].aspect;
      uniformsRef.current.uProgress.value = 0.0;
      currentIdRef.current = nextId;
      renderFrame();
      return;
    }

    // Smooth refractive transition (520ms)
    animTimelineRef.current = gsap.timeline({
      onUpdate: () => {
        uniformsRef.current.uProgress.value = progressObjRef.current.progress;
        renderFrame();
      },
      onComplete: () => {
        // Commit next as current
        uniformsRef.current.uTexCurrent.value = nextTex;
        uniformsRef.current.uAspectCurrent.value = ARTWORK_TEXTURES[nextId].aspect;
        uniformsRef.current.uProgress.value = 0.0;
        progressObjRef.current.progress = 0.0;
        currentIdRef.current = nextId;
        renderFrame();
      },
    });

    animTimelineRef.current.to(progressObjRef.current, {
      progress: 1.0,
      duration: 0.52,
      ease: "power2.out",
    });
  }, [activeId, renderFrame]);

  return (
    <div
      ref={containerRef}
      onClick={onDetailClick}
      className={`relative w-full aspect-[16/9] ${
        isEmbeddedInHero
          ? "max-h-[38vh] sm:max-h-[40vh] lg:max-h-[42vh]"
          : "max-h-[65vh]"
      } bg-[#090909] overflow-hidden cursor-pointer shadow-2xl select-none ${className}`}
      style={{ borderRadius: 0 }}
      title="Click to view artwork fullscreen"
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}
