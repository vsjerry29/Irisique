"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  irisLabVertexShader,
  irisLabFragmentShader,
} from "../iris-lab/shaders.glsl";
import HeroUI from "./HeroUI";
import ArtOfIris from "../home/ArtOfIris";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// ─── Three Explicit Scene States ───
export type SceneState = "HERO_ACTIVE" | "HANDOFF_ACTIVE" | "GALLERY_ACTIVE";

// ─── 11 Anatomical Layer Definitions ───
interface LayerSpec {
  id: string;
  file: string;
  renderOrder: number;
  type: "pupil" | "collarette" | "crypts" | "fibres" | "limbus";
  sepOffset: {
    x: number;
    y: number;
    z: number;
    rotZ: number;
    rotX: number;
    rotY: number;
    scale: number;
  };
  finalOffset: {
    x: number;
    y: number;
    z: number;
    rotZ: number;
    rotX: number;
    rotY: number;
    scale: number;
    opacity: number;
  };
}

const LAYER_SPECS: LayerSpec[] = [
  // Layer E: Central Pupil Core (Deep optical anchor)
  {
    id: "layer_e_pupil",
    file: "/assets/iris/layers/layer_e_pupil.webp",
    renderOrder: 1,
    type: "pupil",
    sepOffset: { x: 0.0, y: 0.0, z: -1.2, rotZ: 0.0, rotX: 0.0, rotY: 0.0, scale: 0.95 },
    finalOffset: { x: 0.0, y: 0.0, z: -1.2, rotZ: 0.0, rotX: 0.0, rotY: 0.0, scale: 0.90, opacity: 0.70 },
  },
  // Layer D: Inner Collarette (2 interlocking segments, warm copper & dark brown)
  {
    id: "layer_d1_collarette_alpha",
    file: "/assets/iris/layers/layer_d1_collarette_alpha.webp",
    renderOrder: 2,
    type: "collarette",
    sepOffset: { x: -0.06, y: 0.04, z: -0.50, rotZ: THREE.MathUtils.degToRad(5), rotX: 0.03, rotY: 0.02, scale: 1.05 },
    finalOffset: { x: -0.25, y: 0.15, z: -0.65, rotZ: THREE.MathUtils.degToRad(12), rotX: 0.02, rotY: 0.02, scale: 1.12, opacity: 0.75 },
  },
  {
    id: "layer_d2_collarette_beta",
    file: "/assets/iris/layers/layer_d2_collarette_beta.webp",
    renderOrder: 3,
    type: "collarette",
    sepOffset: { x: 0.05, y: -0.03, z: -0.40, rotZ: THREE.MathUtils.degToRad(7), rotX: -0.02, rotY: 0.03, scale: 1.06 },
    finalOffset: { x: 0.20, y: -0.12, z: -0.55, rotZ: THREE.MathUtils.degToRad(15), rotX: -0.02, rotY: 0.03, scale: 1.10, opacity: 0.75 },
  },
  // Layer C: Golden Crypt Network (2 organic branching segments, amber/gold structures)
  {
    id: "layer_c1_crypts_alpha",
    file: "/assets/iris/layers/layer_c1_crypts_alpha.webp",
    renderOrder: 4,
    type: "crypts",
    sepOffset: { x: 0.15, y: -0.08, z: 0.40, rotZ: THREE.MathUtils.degToRad(-13), rotX: 0.05, rotY: -0.04, scale: 1.15 },
    finalOffset: { x: 0.35, y: -0.18, z: 0.25, rotZ: THREE.MathUtils.degToRad(-22), rotX: 0.06, rotY: -0.04, scale: 1.25, opacity: 0.85 },
  },
  {
    id: "layer_c2_crypts_beta",
    file: "/assets/iris/layers/layer_c2_crypts_beta.webp",
    renderOrder: 5,
    type: "crypts",
    sepOffset: { x: -0.12, y: 0.10, z: 0.50, rotZ: THREE.MathUtils.degToRad(-15), rotX: -0.04, rotY: 0.05, scale: 1.18 },
    finalOffset: { x: -0.30, y: 0.22, z: 0.35, rotZ: THREE.MathUtils.degToRad(-25), rotX: -0.04, rotY: 0.06, scale: 1.22, opacity: 0.80 },
  },
  // Layer B: Outer Blue/Teal Fibre Network (3 segments, flies closest past camera)
  {
    id: "layer_b1_fibres_arc1",
    file: "/assets/iris/layers/layer_b1_fibres_arc1.webp",
    renderOrder: 6,
    type: "fibres",
    sepOffset: { x: -0.18, y: 0.14, z: 1.25, rotZ: THREE.MathUtils.degToRad(8), rotX: -0.06, rotY: 0.08, scale: 1.35 },
    finalOffset: { x: -0.65, y: 0.38, z: 0.75, rotZ: THREE.MathUtils.degToRad(20), rotX: -0.08, rotY: 0.10, scale: 1.48, opacity: 0.88 },
  },
  {
    id: "layer_b2_fibres_arc2",
    file: "/assets/iris/layers/layer_b2_fibres_arc2.webp",
    renderOrder: 7,
    type: "fibres",
    sepOffset: { x: 0.16, y: -0.12, z: 1.35, rotZ: THREE.MathUtils.degToRad(10), rotX: 0.08, rotY: -0.06, scale: 1.38 },
    finalOffset: { x: 0.58, y: -0.42, z: 0.65, rotZ: THREE.MathUtils.degToRad(18), rotX: 0.08, rotY: -0.08, scale: 1.45, opacity: 0.85 },
  },
  {
    id: "layer_b3_fibres_arc3",
    file: "/assets/iris/layers/layer_b3_fibres_arc3.webp",
    renderOrder: 8,
    type: "fibres",
    sepOffset: { x: 0.10, y: 0.16, z: 1.20, rotZ: THREE.MathUtils.degToRad(9), rotX: -0.05, rotY: -0.05, scale: 1.32 },
    finalOffset: { x: 0.42, y: 0.50, z: 0.70, rotZ: THREE.MathUtils.degToRad(16), rotX: -0.05, rotY: -0.06, scale: 1.42, opacity: 0.85 },
  },
  // Layer A: Outer Limbal Boundary (3 arc fragments, framing perimeter)
  {
    id: "layer_a1_limbus_arc1",
    file: "/assets/iris/layers/layer_a1_limbus_arc1.webp",
    renderOrder: 9,
    type: "limbus",
    sepOffset: { x: 0.08, y: 0.10, z: -0.70, rotZ: THREE.MathUtils.degToRad(-6), rotX: 0.02, rotY: 0.03, scale: 1.15 },
    finalOffset: { x: -0.85, y: -0.45, z: -0.45, rotZ: THREE.MathUtils.degToRad(-12), rotX: -0.03, rotY: 0.04, scale: 1.35, opacity: 0.70 },
  },
  {
    id: "layer_a2_limbus_arc2",
    file: "/assets/iris/layers/layer_a2_limbus_arc2.webp",
    renderOrder: 10,
    type: "limbus",
    sepOffset: { x: -0.09, y: -0.06, z: -0.60, rotZ: THREE.MathUtils.degToRad(-7), rotX: -0.03, rotY: -0.02, scale: 1.14 },
    finalOffset: { x: 0.75, y: 0.55, z: -0.40, rotZ: THREE.MathUtils.degToRad(-14), rotX: 0.04, rotY: 0.03, scale: 1.32, opacity: 0.70 },
  },
  {
    id: "layer_a3_limbus_arc3",
    file: "/assets/iris/layers/layer_a3_limbus_arc3.webp",
    renderOrder: 11,
    type: "limbus",
    sepOffset: { x: 0.06, y: -0.08, z: -0.65, rotZ: THREE.MathUtils.degToRad(-5), rotX: 0.02, rotY: -0.03, scale: 1.16 },
    finalOffset: { x: 0.45, y: -0.70, z: -0.50, rotZ: THREE.MathUtils.degToRad(-10), rotX: 0.03, rotY: -0.04, scale: 1.30, opacity: 0.68 },
  },
];

interface UnifiedIrisHeroProps {
  onIntroComplete?: () => void;
  className?: string;
}

export default function UnifiedIrisHero({
  onIntroComplete,
  className = "",
}: UnifiedIrisHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);
  const debugHudRef = useRef<HTMLDivElement>(null);
  const debugReticleRef = useRef<HTMLDivElement>(null);
  const debugEnabledRef = useRef(false);
  const cleanupRef = useRef<(() => void) | null>(null);

  // Optical Exposure Stage & Handoff Refs
  const exposureOverlayRef = useRef<HTMLDivElement>(null);
  const grainOverlayRef = useRef<HTMLDivElement>(null);
  const matchedSoloPlateRef = useRef<HTMLDivElement>(null);
  const emergingGalleryHeaderRef = useRef<HTMLDivElement>(null);
  const emergingCategoryBarRef = useRef<HTMLDivElement>(null);
  const transitionDebugHudRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("irisDebug") === "1" || (window as any).__irisDebug) {
        debugEnabledRef.current = true;
        if (debugHudRef.current) debugHudRef.current.classList.remove("hidden");
        if (debugReticleRef.current) debugReticleRef.current.classList.remove("hidden");
      }
      if (params.get("transitionDebug") === "1" || (window as any).__transitionDebug) {
        if (transitionDebugHudRef.current) transitionDebugHudRef.current.classList.remove("hidden");
      }
    }
  }, []);

  const initExperience = useCallback(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isTouchDevice =
      typeof window !== "undefined" &&
      (window.matchMedia("(pointer: coarse)").matches || "ontouchstart" in window);

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;
    const checkIsMobile = () => width < 768;
    let isMobile = checkIsMobile();

    // ─── 1. WebGL Renderer (Persistent High-Performance Stage with Transparent Background) ───
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: "high-performance",
      alpha: true, // Transparent: allows diagonal background seam to show through!
    });
    const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.4 : 1.85);
    renderer.setPixelRatio(dpr);
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0.0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    scene.background = null;

    // Perspective Camera: FOV 44 matches the basePlaneGeo proportion
    const camera = new THREE.PerspectiveCamera(44, width / height, 0.1, 100);
    camera.position.set(0, 0, isMobile ? 7.2 : 6.2);

    // ─── 2. Unified Texture Loader ───
    let texturesLoaded = false;
    let sceneReady = false;
    let startEntranceFn: (() => void) | null = null;

    const tryStartEntrance = () => {
      if (texturesLoaded && sceneReady && startEntranceFn) {
        startEntranceFn();
      }
    };

    const manager = new THREE.LoadingManager();
    manager.onLoad = () => {
      texturesLoaded = true;
      tryStartEntrance();
    };

    const loader = new THREE.TextureLoader(manager);
    const setupTex = (tex: THREE.Texture, isSrgb: boolean = true) => {
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.generateMipmaps = true;
      tex.colorSpace = isSrgb ? THREE.SRGBColorSpace : THREE.LinearSRGBColorSpace;
    };

    // Hero shaders textures
    const colorTex = loader.load("/assets/iris/iris-color.webp", (t) => setupTex(t, true));
    const heightTex = loader.load("/assets/iris/iris-height.webp", (t) => setupTex(t, false));
    const maskTex = loader.load("/assets/iris/iris-mask.webp", (t) => setupTex(t, false));
    const macroTex = loader.load("/assets/iris/iris-macro.webp", (t) => {
      setupTex(t, true);
      t.wrapS = THREE.RepeatWrapping;
      t.wrapT = THREE.RepeatWrapping;
    });

    // ─── 4. Stage Elements ───

    // A. Atmospheric Procedural Fog Plane (Background depth)
    const fogVertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position.xy, 0.9999, 1.0);
      }
    `;

    const fogFragmentShader = `
      precision highp float;
      varying vec2 vUv;
      uniform float uTime;
      uniform float uDensity;
      uniform vec2 uResolution;
      uniform float uRefractShift;
      uniform float uExposure;

      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

      float snoise(vec2 v) {
        const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                           -0.577350269189626, 0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy));
        vec2 x0 = v - i + dot(i, C.xx);
        vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod289(i);
        vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
        vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
        m = m * m; m = m * m;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
        vec3 g;
        g.x = a0.x * x0.x + h.x * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
      }

      float fbm(vec2 p) {
        float v = 0.0;
        v += 0.55 * snoise(p); p *= 2.02;
        v += 0.28 * snoise(p);
        return v;
      }

      void main() {
        vec2 uv = vUv;
        if (uRefractShift > 0.0) {
          uv.x += (snoise(uv * 12.0 + uTime * 0.4) - 0.5) * uRefractShift;
        }
        vec2 p = (uv - 0.5) * vec2(uResolution.x / uResolution.y, 1.0);
        float n = fbm(p * 1.4 + vec2(uTime * 0.04, -uTime * 0.02));
        vec3 colorDark = vec3(0.010, 0.013, 0.016);
        vec3 colorCyan = vec3(0.040, 0.085, 0.110);
        vec3 colorGold = vec3(0.095, 0.065, 0.028);
        float mask = smoothstep(-0.4, 0.6, n);
        vec3 fogCol = mix(colorDark, colorCyan, mask * 0.75 * uDensity * 8.0);
        fogCol += colorGold * smoothstep(0.1, 0.8, n) * 0.55 * uDensity * 8.0;
        float radialGlow = smoothstep(1.3, 0.0, length(p));
        fogCol += vec3(0.045, 0.032, 0.015) * radialGlow * (0.8 + uDensity * 4.0);
        fogCol += vec3(uExposure * 0.25);
        gl_FragColor = vec4(fogCol, 1.0);
      }
    `;

    const fogMaterial = new THREE.ShaderMaterial({
      vertexShader: fogVertexShader,
      fragmentShader: fogFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uDensity: { value: 0.03 },
        uResolution: { value: new THREE.Vector2(width, height) },
        uRefractShift: { value: 0.0 },
        uExposure: { value: 0.0 },
      },
      depthWrite: false,
      depthTest: false,
    });
    const fogMesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), fogMaterial);
    fogMesh.renderOrder = -100;
    scene.add(fogMesh);

    // B. Microscopic Depth Particles (400 floating stroma particles)
    const PARTICLE_COUNT = 400;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(PARTICLE_COUNT * 3);
    const particleRandoms = new Float32Array(PARTICLE_COUNT * 3);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particlePositions[i * 3 + 0] = (Math.random() - 0.5) * 8.0;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 6.0;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 6.0;
      particleRandoms[i * 3 + 0] = Math.random();
      particleRandoms[i * 3 + 1] = Math.random();
      particleRandoms[i * 3 + 2] = Math.random();
    }

    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute("aRandom", new THREE.BufferAttribute(particleRandoms, 3));

    const particleMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        attribute vec3 aRandom;
        uniform float uTime;
        varying float vAlpha;
        void main() {
          vec3 pos = position;
          pos.y += sin(uTime * 0.4 + aRandom.x * 6.28) * 0.15;
          pos.x += cos(uTime * 0.3 + aRandom.y * 6.28) * 0.12;
          vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
          gl_Position = projectionMatrix * mvPos;
          gl_PointSize = (2.2 + aRandom.z * 2.8) * (8.0 / -mvPos.z);
          vAlpha = 0.25 + 0.35 * sin(uTime * 0.6 + aRandom.x * 6.28);
        }
      `,
      fragmentShader: `
        precision highp float;
        varying float vAlpha;
        void main() {
          vec2 c = gl_PointCoord - vec2(0.5);
          float d = length(c);
          if (d > 0.5) discard;
          float intensity = smoothstep(0.5, 0.0, d);
          vec3 col = mix(vec3(0.5, 0.78, 0.9), vec3(0.9, 0.65, 0.3), vAlpha);
          gl_FragColor = vec4(col, intensity * vAlpha * 0.6);
        }
      `,
      uniforms: { uTime: { value: 0 } },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMaterial);
    particles.renderOrder = 40;
    scene.add(particles);

    // C. 11 3D Anatomical Layer Meshes
    const masterLayerGroup = new THREE.Group();
    scene.add(masterLayerGroup);

    const basePlaneGeo = new THREE.PlaneGeometry(5, 5, 32, 32);
    const layerItems: Array<{
      mesh: THREE.Mesh;
      spec: LayerSpec;
      material: THREE.ShaderMaterial;
    }> = [];

    const layerVertexShader = `
      varying vec2 vUv;
      varying vec3 vNormal;
      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    const layerFragmentShader = `
      precision highp float;
      varying vec2 vUv;
      varying vec3 vNormal;
      uniform sampler2D uMap;
      uniform float uOpacity;
      uniform float uErosion;
      uniform float uRefractShift;
      uniform float uHighlight;
      uniform float uClickProgress;
      uniform vec2 uClickOrigin;
      uniform vec2 uPointerUV;
      uniform float uPointerActive;

      void main() {
        vec2 uv = vUv;
        if (uRefractShift > 0.0) {
          float r = texture2D(uMap, uv + vec2(uRefractShift, 0.0)).r;
          float g = texture2D(uMap, uv).g;
          float b = texture2D(uMap, uv - vec2(uRefractShift, 0.0)).b;
          float a = texture2D(uMap, uv).a;
          if (a < 0.015) discard;
          vec4 col = vec4(r, g, b, a);
          col.rgb += uHighlight * 0.25;
          gl_FragColor = vec4(col.rgb, col.a * uOpacity);
          return;
        }

        vec4 texColor = texture2D(uMap, uv);
        if (texColor.a < 0.015) discard;
        if (uErosion > 0.0) {
          float noiseCut = (texColor.r + texColor.g + texColor.b) * 0.333;
          if (noiseCut < uErosion) discard;
        }

        // Tactile Cursor Highlight on 3D Layer
        if (uPointerActive > 0.001) {
          float distCursor = length(uv - uPointerUV);
          float hoverHighlight = smoothstep(0.18, 0.0, distCursor) * uPointerActive * 0.35;
          texColor.rgb += vec3(0.08, 0.15, 0.22) * hoverHighlight;
        }

        // Tactile Click Optical Wave on 3D Layer
        if (uClickProgress > 0.001 && uClickProgress < 1.0) {
          float distClick = length(uv - uClickOrigin);
          float clickWave = exp(-pow((distClick - uClickProgress * 0.35) / 0.055, 2.0)) * (1.0 - uClickProgress);
          texColor.rgb += vec3(0.65, 0.62, 0.58) * clickWave * 0.95;
        }

        texColor.rgb += uHighlight * 0.25;
        gl_FragColor = vec4(texColor.rgb, texColor.a * uOpacity);
      }
    `;

    LAYER_SPECS.forEach((spec) => {
      const tex = loader.load(spec.file);
      setupTex(tex, true);

      const mat = new THREE.ShaderMaterial({
        vertexShader: layerVertexShader,
        fragmentShader: layerFragmentShader,
        uniforms: {
          uMap: { value: tex },
          uOpacity: { value: 1.0 },
          uErosion: { value: 0.0 },
          uRefractShift: { value: 0.0 },
          uHighlight: { value: 0.0 },
          uClickProgress: { value: 0.0 },
          uClickOrigin: { value: new THREE.Vector2(0.5, 0.5) },
          uPointerUV: { value: new THREE.Vector2(-10, -10) },
          uPointerActive: { value: 0.0 },
        },
        transparent: true,
        depthWrite: false,
        depthTest: true,
        side: THREE.DoubleSide,
        blending: THREE.NormalBlending,
      });

      const mesh = new THREE.Mesh(basePlaneGeo, mat);
      mesh.renderOrder = spec.renderOrder;
      mesh.position.set(0, 0, 0);
      (mesh as any).specId = spec.id;
      masterLayerGroup.add(mesh);
      layerItems.push({ mesh, spec, material: mat });
    });

    // ─── 4. Resting Iris Metrics (Enlarged Canonical Composition: 690-730px diameter at 1918x908, 50-52% width) ───
    const getRestingIrisMetrics = (w: number, h: number) => {
      const mobile = w < 768;
      const aspect = w / h;
      // Target: pupil center at 51.5% of viewport width on desktop (within 50–52% range)
      // centeredCoord = screenCoord - uIrisOffset where screenCoord = (vUv - 0.5) * aspect
      // At pupil center vUv.x = 0.515 => screenCoord.x = (0.515 - 0.5) * aspect = 0.015 * aspect
      const restingX = mobile ? 0.0 : Math.max(0.012, Math.min(0.035, (0.515 - 0.5) * aspect));
      const restingY = mobile ? 0.02 : 0.0;
      // Target diameter: ~715px at 1918x908 (10-12% increase per user specification, within 690-730px).
      // In shader: diameter = 0.93 * uIrisScale * h => uIrisScale = 715 / (0.93 * 908) = 0.8467 ~ 0.85
      const restingScale = mobile ? 0.82 : 0.85;
      return { restingX, restingY, restingScale };
    };

    const initialMetrics = getRestingIrisMetrics(width, height);

    // D. Macro Entrance Quad (NDC Overlay for Extreme Macro Discovery & Pullback)
    const macroUniforms = {
      uColorTex: { value: colorTex },
      uHeightTex: { value: heightTex },
      uMaskTex: { value: maskTex },
      uMacroTex: { value: macroTex },
      uTime: { value: 0 },
      uIntroProgress: { value: 0 },
      uIntroZoom: { value: 5.2 },
      uCameraTarget: { value: new THREE.Vector2(-0.16, 0.20) },
      uScreenPointer: { value: new THREE.Vector2(-10, -10) },
      uPointerActive: { value: 0.0 },
      uPointerVelocity: { value: 0.0 },
      uResolution: { value: new THREE.Vector2(width * dpr, height * dpr) },
      uScrollProgress: { value: 0 },
      uScrollRotation: { value: 0 },
      uIrisOffset: { value: new THREE.Vector2(initialMetrics.restingX, initialMetrics.restingY) },
      uIrisScale: { value: initialMetrics.restingScale }, // Exact resting composition: ~695px diameter at 830h
      uReducedMotion: { value: prefersReducedMotion ? 1.0 : 0.0 },
      uClickProgress: { value: 0.0 },
      uClickOrigin: { value: new THREE.Vector2(0.5, 0.5) },
      uMasterOpacity: { value: 1.0 },
    };

    const macroFragShaderWithAlpha = `
      uniform float uMasterOpacity;
      ${irisLabFragmentShader.replace(
        "gl_FragColor = vec4(finalOutput, 1.0);",
        "gl_FragColor = vec4(finalOutput, uMasterOpacity);"
      )}
    `;

    const macroMaterial = new THREE.ShaderMaterial({
      vertexShader: irisLabVertexShader,
      fragmentShader: macroFragShaderWithAlpha,
      uniforms: macroUniforms,
      depthTest: false,
      depthWrite: false,
      transparent: true,
    });

    const macroQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), macroMaterial);
    macroQuad.renderOrder = 50; // Sits above background and particles during Phase 1 & 2
    scene.add(macroQuad);

    sceneReady = true;
    tryStartEntrance();

    // ─── 5. Responsive Resize ───
    const onResize = () => {
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || window.innerHeight;
      isMobile = checkIsMobile();
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      macroUniforms.uResolution.value.set(width * dpr, height * dpr);
      fogMaterial.uniforms.uResolution.value.set(width, height);

      const metrics = getRestingIrisMetrics(width, height);
      if (canonicalState.p <= 0.02) {
        macroUniforms.uIrisOffset.value.set(metrics.restingX, metrics.restingY);
        macroUniforms.uIrisScale.value = metrics.restingScale;
      }
      ScrollTrigger.refresh();
    };
    window.addEventListener("resize", onResize);

    // ─── 6. High-Precision Pointer Coordinates & Surface Raycasting ───
    const mouse = new THREE.Vector2(0, 0);
    const targetScreenPointer = new THREE.Vector2(-10, -10);
    const targetLayerUV = new THREE.Vector2(-10, -10);
    const raycaster = new THREE.Raycaster();
    const tempNdc = new THREE.Vector2();

    let lastPointerX = 0;
    let lastPointerY = 0;
    let lastPointerTime = performance.now();
    let currentPointerVelocity = 0;
    let pointerActiveTarget = 0.0;
    let revealOrigin = { x: 0.5, y: 0.5 };

    // Master Scroll Canonical State
    const canonicalState = {
      p: 0.0, // Canonical scroll progress 0.00 -> 1.00
    };

    // Rigorous Coordinate Resolver
    const resolvePointerOnIris = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      if (
        clientX < rect.left ||
        clientX > rect.right ||
        clientY < rect.top ||
        clientY > rect.bottom
      ) {
        return { isHit: false, ndcX: 0, ndcY: 0, screenX: -10, screenY: -10, texU: 0.5, texV: 0.5, hitObject: "outside" };
      }

      // Convert clientX / clientY into true NDC in [-1, 1] WITHOUT DPR multiplication
      const ndcX = ((clientX - rect.left) / rect.width) * 2.0 - 1.0;
      const ndcY = -(((clientY - rect.top) / rect.height) * 2.0 - 1.0);

      const aspect = rect.width / rect.height;
      let screenX = ndcX * 0.5;
      let screenY = ndcY * 0.5;
      if (aspect >= 1.0) {
        screenX *= aspect;
      } else {
        screenY /= aspect;
      }

      const p = canonicalState.p;

      // Phase 1 & 2: Macro Quad Analytical Projection during Resting Hero and Initial Rotation (Exact inverse of irisLabFragmentShader)
      if (p <= 0.38) {
        const centeredX = screenX - macroUniforms.uIrisOffset.value.x;
        const centeredY = screenY - macroUniforms.uIrisOffset.value.y;

        // Match GLSL column-major mat2(cosR, -sinR, sinR, cosR) * centeredCoord
        const rotAngle = -macroUniforms.uScrollRotation.value;
        const cosR = Math.cos(rotAngle);
        const sinR = Math.sin(rotAngle);
        const rotatedX = cosR * centeredX + sinR * centeredY;
        const rotatedY = -sinR * centeredX + cosR * centeredY;

        const baseRadius = 0.465;
        const currentScale = Math.max(macroUniforms.uIrisScale.value, 0.05);
        const irisNormX = rotatedX / (baseRadius * 2.0 * currentScale);
        const irisNormY = rotatedY / (baseRadius * 2.0 * currentScale);

        const distFromCenter = Math.hypot(irisNormX, irisNormY);
        // Visible iris boundary radius is 0.5 (radius 0.465 + outer limbal feather)
        const isHit = distFromCenter <= 0.52;

        const totalZoom = macroUniforms.uIntroZoom.value;
        const texU = (irisNormX / totalZoom) + 0.5 + macroUniforms.uCameraTarget.value.x;
        const texV = (irisNormY / totalZoom) + 0.5 + macroUniforms.uCameraTarget.value.y;

        return {
          isHit,
          ndcX,
          ndcY,
          screenX,
          screenY,
          texU,
          texV,
          hitObject: isHit ? "macroQuad (stroma)" : "outside",
        };
      }

      // Phase 3..6: 3D Layer Meshes Raycasting
      tempNdc.set(ndcX, ndcY);
      raycaster.setFromCamera(tempNdc, camera);
      const hits = raycaster.intersectObjects(masterLayerGroup.children, false);

      if (hits.length > 0) {
        for (const hit of hits) {
          const uv = hit.uv || new THREE.Vector2(0.5, 0.5);
          const distFromCenter = Math.hypot(uv.x - 0.5, uv.y - 0.5);
          if (distFromCenter <= 0.50) {
            return {
              isHit: true,
              ndcX,
              ndcY,
              screenX,
              screenY,
              texU: uv.x,
              texV: uv.y,
              hitObject: (hit.object as any).specId || "3D Stroma Layer",
            };
          }
        }
      }

      return {
        isHit: false,
        ndcX,
        ndcY,
        screenX,
        screenY,
        texU: 0.5,
        texV: 0.5,
        hitObject: "outside",
      };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (isTouchDevice) return;
      const target = e.target as HTMLElement | null;
      if (target && target.closest("header, nav, button, a, [role='button'], #gallery button, #gallery a")) {
        pointerActiveTarget = 0.0;
        return;
      }

      const now = performance.now();
      const dt = Math.max(now - lastPointerTime, 8);
      const dist = Math.hypot(e.clientX - lastPointerX, e.clientY - lastPointerY);
      currentPointerVelocity = Math.min((dist / dt) * 1.5, 3.0);
      lastPointerX = e.clientX;
      lastPointerY = e.clientY;
      lastPointerTime = now;

      const hit = resolvePointerOnIris(e.clientX, e.clientY);
      if (hit.isHit) {
        pointerActiveTarget = 1.0;
        targetScreenPointer.set(hit.screenX, hit.screenY);
        targetLayerUV.set(hit.texU, hit.texV);
      } else {
        pointerActiveTarget = 0.0;
      }

      mouse.x = (e.clientX / width) * 2 - 1;
      mouse.y = (e.clientY / height) * 2 - 1;

      // Debug telemetry update (?irisDebug=1) via direct DOM (zero React re-renders)
      if (debugEnabledRef.current) {
        if (debugHudRef.current && debugHudRef.current.classList.contains("hidden")) {
          debugHudRef.current.classList.remove("hidden");
        }
        if (debugReticleRef.current && debugReticleRef.current.classList.contains("hidden")) {
          debugReticleRef.current.classList.remove("hidden");
        }
        if (debugReticleRef.current) {
          debugReticleRef.current.style.left = `${e.clientX}px`;
          debugReticleRef.current.style.top = `${e.clientY}px`;
        }
        const elScreen = document.getElementById("dbg-screen");
        if (elScreen) elScreen.textContent = `${Math.round(e.clientX)}px, ${Math.round(e.clientY)}px`;
        const elNdc = document.getElementById("dbg-ndc");
        if (elNdc) elNdc.textContent = `${hit.ndcX.toFixed(3)}, ${hit.ndcY.toFixed(3)}`;
        const elUv = document.getElementById("dbg-uv");
        if (elUv) elUv.textContent = `${hit.texU.toFixed(3)}, ${hit.texV.toFixed(3)}`;
        const elHit = document.getElementById("dbg-hit");
        if (elHit) elHit.textContent = hit.hitObject;
        const elHover = document.getElementById("dbg-hover");
        if (elHover) elHover.textContent = macroUniforms.uPointerActive.value.toFixed(2);
        const elOrigin = document.getElementById("dbg-origin");
        if (elOrigin) elOrigin.textContent = `${revealOrigin.x.toFixed(3)}, ${revealOrigin.y.toFixed(3)}`;
        const elScroll = document.getElementById("dbg-scroll");
        if (elScroll) elScroll.textContent = `${(canonicalState.p * 100).toFixed(1)}%`;
        const elReticle = document.getElementById("dbg-reticle-label");
        if (elReticle) elReticle.textContent = `UV: (${hit.texU.toFixed(2)}, ${hit.texV.toFixed(2)})`;
      }
    };

    const onMouseLeave = () => {
      pointerActiveTarget = 0.0;
      currentPointerVelocity = 0;
      targetScreenPointer.set(-10, -10);
      targetLayerUV.set(-10, -10);
    };

    window.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseleave", onMouseLeave);

    // Click Optical Impulse with Exact Localized Origin
    const triggerClickAt = (clientX: number, clientY: number) => {
      const hit = resolvePointerOnIris(clientX, clientY);
      if (!hit.isHit) {
        // Outside the iris: do NOT trigger click reveal (click ignored)
        if (debugEnabledRef.current) {
          const elHit = document.getElementById("dbg-hit");
          if (elHit) elHit.textContent = "outside (click ignored)";
        }
        return;
      }

      revealOrigin = { x: hit.texU, y: hit.texV };
      macroUniforms.uClickOrigin.value.set(hit.texU, hit.texV);

      layerItems.forEach((item) => {
        item.material.uniforms.uClickOrigin.value.set(hit.texU, hit.texV);
      });

      // Update developer telemetry HUD (?irisDebug=1) immediately on click
      if (debugEnabledRef.current) {
        const elOrigin = document.getElementById("dbg-origin");
        if (elOrigin) elOrigin.textContent = `${hit.texU.toFixed(3)}, ${hit.texV.toFixed(3)}`;
        const elHit = document.getElementById("dbg-hit");
        if (elHit) elHit.textContent = `CLICK: ${hit.hitObject}`;
        const elReticle = document.getElementById("dbg-reticle-label");
        if (elReticle) elReticle.textContent = `CLICK UV: (${hit.texU.toFixed(2)}, ${hit.texV.toFixed(2)})`;
      }

      gsap.killTweensOf(macroUniforms.uClickProgress);
      macroUniforms.uClickProgress.value = 0.0;
      gsap.to(macroUniforms.uClickProgress, {
        value: 1.0,
        duration: 1.15,
        ease: "power2.out",
        onComplete: () => {
          macroUniforms.uClickProgress.value = 0.0;
        },
      });
    };

    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && target.closest("header, nav, button, a, [role='button'], #gallery button, #gallery a")) {
        return;
      }
      const rect = canvas.getBoundingClientRect();
      if (
        e.clientX < rect.left ||
        e.clientX > rect.right ||
        e.clientY < rect.top ||
        e.clientY > rect.bottom
      ) {
        return;
      }
      if (introTimeline && introTimeline.progress() < 1.0 && !introTimeline.paused()) {
        introTimeline.progress(1.0);
      }
      triggerClickAt(e.clientX, e.clientY);
    };

    window.addEventListener("click", onClick);

    // Keyboard controls
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === " ") {
        if (introTimeline && introTimeline.progress() < 1.0) {
          introTimeline.progress(1.0);
        }
      } else if (e.key === "r" || e.key === "R") {
        if (window.scrollY < 450) {
          startEntrance();
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);

    // ─── 7. PHASE 01: Directed Master Cinematic Entrance Timeline (0.00s – 3.80s) ───
    const introState = {
      progress: 0.0,
      zoom: 5.2,
      targetX: -0.16,
      targetY: 0.20,
    };

    // Hero headline and CTA are immediately visible from frame 0 matching canonical editorial design
    if (heroTextRef.current) {
      gsap.set(heroTextRef.current, { opacity: 1, y: 0 });
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
      if (heroTextRef.current) {
        introTimeline.set(heroTextRef.current, { opacity: 1, y: 0 });
      }
    } else {
      // 0.00–0.60s: Macro Discovery (zoom 5.2)
      introTimeline.fromTo(
        introState,
        { progress: 0.0, zoom: 5.2, targetX: -0.16, targetY: 0.20 },
        { progress: 0.14, zoom: 5.0, targetX: -0.14, targetY: 0.18, duration: 0.60, ease: "sine.inOut" },
        0.00
      );

      // Hero Typography remains stable and visible
      if (heroTextRef.current) {
        introTimeline.set(heroTextRef.current, { opacity: 1, y: 0 }, 0.00);
      }

      // 0.60–1.80s: Stroma Cavity Travel (pullback 5.0 -> 2.6)
      introTimeline.to(
        introState,
        {
          progress: 0.48,
          zoom: 2.6,
          targetX: -0.06,
          targetY: 0.08,
          duration: 1.20,
          ease: "power2.inOut",
        },
        0.60
      );

      // 1.80–2.90s: Collarette Reveal (pullback 2.6 -> 1.35)
      introTimeline.to(
        introState,
        {
          progress: 0.76,
          zoom: 1.35,
          targetX: -0.02,
          targetY: 0.02,
          duration: 1.10,
          ease: "power2.out",
        },
        1.80
      );

      // 2.90–3.50s: Full Macroscopic Iris Settles (pullback 1.35 -> 1.00)
      introTimeline.to(
        introState,
        {
          progress: 0.94,
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

    const startEntrance = () => {
      introState.progress = 0.0;
      introState.zoom = 5.2;
      introState.targetX = -0.16;
      introState.targetY = 0.20;

      macroUniforms.uIntroProgress.value = 0.0;
      macroUniforms.uIntroZoom.value = 5.2;
      macroUniforms.uCameraTarget.value.set(-0.16, 0.20);
      const { restingX, restingY, restingScale } = getRestingIrisMetrics(width, height);
      macroUniforms.uIrisOffset.value.set(restingX, restingY);
      macroUniforms.uIrisScale.value = restingScale;
      macroUniforms.uScrollProgress.value = 0.0;
      macroUniforms.uScrollRotation.value = 0.0;
      macroUniforms.uMasterOpacity.value = 1.0;

      if (heroTextRef.current) gsap.set(heroTextRef.current, { opacity: 1, y: 0 });

      renderer.render(scene, camera);

      if (prefersReducedMotion) {
        introTimeline.progress(1.0);
        if (heroTextRef.current) gsap.set(heroTextRef.current, { opacity: 1, y: 0 });
      } else {
        introTimeline.restart();
      }
    };

    startEntranceFn = startEntrance;
    tryStartEntrance();

    // ─── 8. UNIFIED MASTER SCROLL CHOREOGRAPHY (One Persistent Pinned Stage) ───
    const scrollTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        pin: true,
        pinSpacing: true,
        start: "top top",
        end: () => `+=${Math.round(window.innerHeight * 1.25)}`, // Crisp, responsive pinned scroll travel (rotation -> immersion -> enter pupil -> immediate seam)
        scrub: 0.6,   // Liquid-smooth 0.6s catchup
        invalidateOnRefresh: true,
        refreshPriority: 10,
        onUpdate: (self) => {
          // If user scrolls during intro, smoothly complete intro
          if (self.progress > 0.01 && introTimeline && introTimeline.progress() < 1.0) {
            introTimeline.progress(1.0);
          }

          // Reverse scroll restoration: Restore hero typography at top
          if (self.progress <= 0.02) {
            if (heroTextRef.current) gsap.set(heroTextRef.current, { opacity: 1, y: 0 });
          }
        },
      },
    });

    scrollTimeline.to(
      canonicalState,
      {
        p: 1.0,
        duration: 1.0,
        ease: "none",
      },
      0.00
    );

    // Hero typography glide-out (0.00 – 0.12)
    if (heroTextRef.current) {
      scrollTimeline.fromTo(
        heroTextRef.current,
        { opacity: 1, y: 0 },
        { opacity: 0, y: -35, duration: 0.12, ease: "power1.inOut", immediateRender: false },
        0.00
      );
    }

    // ─── 9. Continuous Frame Evaluator ───
    const evaluateScene = (p: number, elapsed: number) => {
      const mobile = isMobile;
      const { restingX, restingY, restingScale } = getRestingIrisMetrics(width, height);

      // ── 1. HORIZONTAL & VERTICAL POSITIONING ──
      // Phase A & B (p <= 0.20): Resting hero composition, iris centered at ~51.5% width, 50% height
      // Phase C (0.20 < p <= 0.50): Pupil smoothly aligns to exact viewport center (50% width, 50% height)
      // Phase D & E (p > 0.50): Strictly centered for continuous forward immersion into the pupil
      let currentOffsetX = restingX;
      let currentOffsetY = restingY;
      if (p <= 0.20) {
        currentOffsetX = restingX;
        currentOffsetY = restingY;
      } else if (p <= 0.50) {
        const t = (p - 0.20) / 0.30;
        const ease = t * t * (3.0 - 2.0 * t);
        currentOffsetX = THREE.MathUtils.lerp(restingX, 0.0, ease);
        currentOffsetY = THREE.MathUtils.lerp(restingY, 0.0, ease);
      } else {
        currentOffsetX = 0.0;
        currentOffsetY = 0.0;
      }
      macroUniforms.uIrisOffset.value.set(currentOffsetX, currentOffsetY);
      macroUniforms.uIrisScale.value = restingScale;
      masterLayerGroup.position.set(currentOffsetX * 5.01, currentOffsetY * 5.01, 0);

      // ── 2. SCROLL ROTATION (Smooth clockwise rotation, no abrupt stops, no backwards spins) ──
      let scrollRotation = 0;
      if (p <= 0.20) {
        const t = p / 0.20;
        scrollRotation = t * THREE.MathUtils.degToRad(95);
      } else if (p <= 0.62) {
        const t = (p - 0.20) / 0.42;
        const ease = Math.sin(t * Math.PI * 0.5);
        scrollRotation = THREE.MathUtils.degToRad(95) + ease * THREE.MathUtils.degToRad(35);
      } else {
        scrollRotation = THREE.MathUtils.degToRad(130);
      }
      macroUniforms.uScrollRotation.value = scrollRotation;
      masterLayerGroup.rotation.z = -scrollRotation;

      // ── 3. CAMERA DEPTH (STRICTLY MONOTONIC FORWARD JOURNEY INTO THE PUPIL) ──
      const baseCamZ = mobile ? 7.20 : 6.20;
      let camX = 0, camY = 0, camZ = baseCamZ;

      if (p <= 0.20) {
        camX = mouse.x * 0.04;
        camY = -mouse.y * 0.03;
        camZ = baseCamZ;
      } else if (p <= 0.52) {
        const t = (p - 0.20) / 0.32;
        const ease = t * t * (3.0 - 2.0 * t);
        camZ = THREE.MathUtils.lerp(baseCamZ, mobile ? 2.30 : 1.80, ease);
        const driftAmp = (1.0 - ease) * 0.08;
        camX = Math.sin(t * Math.PI) * driftAmp + mouse.x * 0.04 * (1 - ease);
        camY = -Math.sin(t * Math.PI) * driftAmp * 0.7 - mouse.y * 0.03 * (1 - ease);
      } else if (p <= 0.62) {
        const tPupil = (p - 0.52) / 0.10;
        const easePupil = tPupil * tPupil * (3.0 - 2.0 * tPupil);
        // Direct forward descent into the black pupil core:
        camZ = THREE.MathUtils.lerp(mobile ? 2.30 : 1.80, mobile ? 0.35 : 0.25, easePupil);
        camX = 0;
        camY = 0;
      } else {
        camZ = mobile ? 0.35 : 0.25;
        camX = 0;
        camY = 0;
      }

      camera.position.set(camX, camY, camZ);
      camera.lookAt(0, 0, 0);

      // ── 4. MACRO QUAD CROSS-FADES INTO 11 3D LAYERS (0.20 -> 0.30) ──
      let macroQuadOpacity = 1.0;
      if (p <= 0.20) {
        macroQuadOpacity = 1.0;
      } else if (p <= 0.30) {
        macroQuadOpacity = 1.0 - (p - 0.20) / 0.10;
      } else {
        macroQuadOpacity = 0.0;
      }
      macroUniforms.uMasterOpacity.value = macroQuadOpacity;
      macroQuad.visible = macroQuadOpacity > 0.001 && p <= 0.62;

      // ── 5. ATMOSPHERIC FOG DENSITY PROGRESSION ──
      let fogDensity = 0.03;
      if (p <= 0.20) {
        fogDensity = THREE.MathUtils.lerp(0.02, 0.035, p / 0.20);
      } else if (p <= 0.50) {
        fogDensity = THREE.MathUtils.lerp(0.035, 0.070, (p - 0.20) / 0.30);
      } else if (p <= 0.62) {
        fogDensity = THREE.MathUtils.lerp(0.070, 0.0, (p - 0.50) / 0.12);
      } else {
        fogDensity = 0.0;
      }
      fogMaterial.uniforms.uDensity.value = fogDensity;
      fogMaterial.uniforms.uTime.value = elapsed;

      // ── 6. PARTICLES DISSOLVE AS WE ENTER PUPIL (Zero prolonged black empty particles) ──
      particleMaterial.uniforms.uTime.value = elapsed;
      if (p <= 0.20) {
        particleMaterial.opacity = 0.7;
      } else if (p <= 0.52) {
        particleMaterial.opacity = THREE.MathUtils.lerp(0.7, 0.25, (p - 0.20) / 0.32);
      } else if (p <= 0.62) {
        particleMaterial.opacity = THREE.MathUtils.lerp(0.25, 0.0, (p - 0.52) / 0.10);
      } else {
        particleMaterial.opacity = 0.0;
      }

      // ── 7. 11 3D ANATOMICAL LAYERS DYNAMICS (FORWARD EXPLORATION & PUPIL IMMERSION) ──
      layerItems.forEach((item, idx) => {
        const { mesh, spec, material } = item;
        const sep = spec.sepOffset;

        let posX = 0, posY = 0, posZ = 0;
        let rotZ = 0, rotX = 0, rotY = 0;
        let scale = restingScale;
        let opacity = 1.0;
        let erosion = 0.0;
        let highlight = 0.0;

        if (p <= 0.20) {
          // Assembled at origin matching complete circular iris, zero Z-separation
          posX = 0; posY = 0; posZ = 0;
          rotZ = 0; rotX = 0; rotY = 0;
          scale = restingScale;
          opacity = 0.0; // Macro quad covers this phase
        } else if (p <= 0.52) {
          // Phase C: Organic Unfolding - Layers separate along 3D Z-depth as camera travels between them
          const t = (p - 0.20) / 0.32;
          const ease = t * t * (3.0 - 2.0 * t);
          posX = sep.x * ease;
          posY = sep.y * ease;
          posZ = sep.z * ease;
          rotZ = sep.rotZ * ease;
          rotX = sep.rotX * ease;
          rotY = sep.rotY * ease;
          scale = THREE.MathUtils.lerp(restingScale, sep.scale, ease);
          opacity = Math.min(1.0, (p - 0.20) / 0.08);
          highlight = Math.sin(ease * Math.PI) * 0.25;

          // Subtle organic micro-motion drift
          const drift = Math.sin(elapsed * 0.7 + idx * 0.8) * 0.008;
          posX += drift * 0.5;
          posY += drift;
        } else if (p <= 0.62) {
          // Phase D: Enter the Black Pupil (0.52 -> 0.62)
          // The camera approaches the central black pupil.
          // Surrounding fibres/collarette/limbus expand outward and pass beyond screen edges.
          // The central black pupil expands to cover 100% of the viewport.
          const tPupil = (p - 0.52) / 0.10;
          const easePupil = tPupil * tPupil * (3.0 - 2.0 * tPupil);

          if (spec.type === "pupil") {
            // Pupil core stays centered and expands smoothly as camera dives in
            posX = 0; posY = 0; posZ = 0;
            rotZ = 0; rotX = 0; rotY = 0;
            // Expands by 4.0x so the black core completely floods the viewport
            scale = THREE.MathUtils.lerp(restingScale, restingScale * 4.0, easePupil);
            opacity = 1.0;
          } else {
            // Surrounding fibres, crypts, collarette, and limbus fly outward past the frame
            posX = sep.x * (1.0 + easePupil * 2.5);
            posY = sep.y * (1.0 + easePupil * 2.5);
            posZ = sep.z;
            rotZ = sep.rotZ + easePupil * 0.15;
            rotX = sep.rotX;
            rotY = sep.rotY;
            scale = THREE.MathUtils.lerp(sep.scale, sep.scale * 1.6, easePupil);
            // Outer fibres dissolve as they pass outside camera FOV
            opacity = Math.max(0.0, 1.0 - easePupil * 1.8);
          }
        } else {
          // Phase E: 100% Black Pupil state
          if (spec.type === "pupil") {
            posX = 0; posY = 0; posZ = 0;
            scale = restingScale * 4.0;
            opacity = 1.0;
          } else {
            opacity = 0.0;
          }
        }

        mesh.position.set(posX, posY, posZ);
        mesh.rotation.set(rotX, rotY, rotZ);
        mesh.scale.set(scale, scale, 1);
        mesh.visible = opacity > 0.005;
        material.uniforms.uOpacity.value = opacity;
        material.uniforms.uErosion.value = erosion;
        material.uniforms.uHighlight.value = highlight;
      });

      // ── 8. THREE EXPLICIT SCENE STATES (HERO_ACTIVE | HANDOFF_ACTIVE | GALLERY_ACTIVE) ──
      let activeSceneState: SceneState = "HERO_ACTIVE";
      let handoffProgress = 0.0;
      let galleryBgColor = "rgb(9, 9, 9)";
      let grainOpacity = 0.0;

      if (p <= 0.62) {
        // ─── STATE 1: HERO_ACTIVE ───
        activeSceneState = "HERO_ACTIVE";
        handoffProgress = 0.0;
        galleryBgColor = "rgb(9, 9, 9)";
        grainOpacity = 0.0;

        // Gallery container completely dormant
        if (exposureOverlayRef.current) {
          exposureOverlayRef.current.style.visibility = "hidden";
          exposureOverlayRef.current.style.pointerEvents = "none";
          exposureOverlayRef.current.style.backgroundColor = "transparent";
        }
        if (matchedSoloPlateRef.current) {
          matchedSoloPlateRef.current.style.opacity = "0";
          matchedSoloPlateRef.current.style.transform = "scale(0.98)";
        }
        if (emergingGalleryHeaderRef.current && emergingCategoryBarRef.current) {
          emergingGalleryHeaderRef.current.style.opacity = "0";
          emergingGalleryHeaderRef.current.style.transform = "translateY(16px)";
          emergingCategoryBarRef.current.style.opacity = "0";
          emergingCategoryBarRef.current.style.transform = "translateY(16px)";
        }

        // Hero canvas active
        if (canvas) {
          canvas.style.display = "block";
          canvas.style.visibility = "visible";
          canvas.style.opacity = "1";
          canvas.style.pointerEvents = p <= 0.15 ? "auto" : "none";
        }

        // Restore 3D layers visibility for hero
        masterLayerGroup.visible = true;
        particles.visible = true;
      } else if (p < 0.88) {
        // ─── STATE 2: HANDOFF_ACTIVE ───
        activeSceneState = "HANDOFF_ACTIVE";
        const t = (p - 0.62) / 0.26;
        handoffProgress = t;
        const s = t * t * (3.0 - 2.0 * t); // smoothstep

        // Background color: smoothly interpolate from pitch black #090909 (9,9,9) to warm ivory #F4F1EA (244,241,234)
        const r = Math.round(9 + s * (244 - 9));
        const g = Math.round(9 + s * (241 - 9));
        const b = Math.round(9 + s * (234 - 9));
        galleryBgColor = `rgb(${r}, ${g}, ${b})`;

        // Subtle photographic silver grain dissolves as ivory establishes
        grainOpacity = Math.sin(t * Math.PI) * 0.05;

        // Emerging Gallery container
        if (exposureOverlayRef.current) {
          exposureOverlayRef.current.style.visibility = "visible";
          exposureOverlayRef.current.style.pointerEvents = t >= 0.80 ? "auto" : "none";
          exposureOverlayRef.current.style.backgroundColor = galleryBgColor;
        }

        // Solo Artwork Plate: reveals during mid-handoff with 100% photographic contrast
        if (matchedSoloPlateRef.current) {
          const plateT = Math.min(1.0, Math.max(0.0, (t - 0.10) / 0.55));
          const plateEase = plateT * plateT * (3.0 - 2.0 * plateT);
          matchedSoloPlateRef.current.style.opacity = String(plateEase);
          matchedSoloPlateRef.current.style.transform = `scale(${(0.98 + 0.02 * plateEase).toFixed(4)})`;
        }

        // Heading & Category Selector tabs: glide in smoothly
        if (emergingGalleryHeaderRef.current && emergingCategoryBarRef.current) {
          const textT = Math.min(1.0, Math.max(0.0, (t - 0.35) / 0.50));
          const textEase = textT * textT * (3.0 - 2.0 * textT);
          emergingGalleryHeaderRef.current.style.opacity = String(textEase);
          emergingGalleryHeaderRef.current.style.transform = `translateY(${(-10 * (1.0 - textEase)).toFixed(1)}px)`;
          emergingCategoryBarRef.current.style.opacity = String(textEase);
          emergingCategoryBarRef.current.style.transform = `translateY(${(-6 * (1.0 - textEase)).toFixed(1)}px)`;
        }

        // Hero canvas: fades out as ivory background blooms
        if (canvas) {
          canvas.style.display = "block";
          canvas.style.visibility = s >= 0.99 ? "hidden" : "visible";
          canvas.style.opacity = String(Math.max(0.0, 1.0 - s * 1.5));
          canvas.style.pointerEvents = "none";
        }

        masterLayerGroup.visible = true;
        particles.visible = false;
      } else {
        // ─── STATE 3: GALLERY_ACTIVE ───
        activeSceneState = "GALLERY_ACTIVE";
        handoffProgress = 1.0;
        galleryBgColor = "#F4F1EA";
        grainOpacity = 0.0;

        // Gallery permanently established
        if (exposureOverlayRef.current) {
          exposureOverlayRef.current.style.visibility = "visible";
          exposureOverlayRef.current.style.pointerEvents = "auto";
          exposureOverlayRef.current.style.backgroundColor = "#F4F1EA";
        }

        if (matchedSoloPlateRef.current) {
          matchedSoloPlateRef.current.style.opacity = "1";
          matchedSoloPlateRef.current.style.transform = "scale(1)";
        }

        if (emergingGalleryHeaderRef.current && emergingCategoryBarRef.current) {
          emergingGalleryHeaderRef.current.style.opacity = "1";
          emergingGalleryHeaderRef.current.style.transform = "translateY(0px)";
          emergingCategoryBarRef.current.style.opacity = "1";
          emergingCategoryBarRef.current.style.transform = "translateY(0px)";
        }

        // Hero canvas COMPLETELY SUPPRESSED: cannot leak, re-render, or interfere
        if (canvas) {
          canvas.style.visibility = "hidden";
          canvas.style.display = "none";
          canvas.style.opacity = "0";
          canvas.style.pointerEvents = "none";
        }

        // Suppress 3D meshes inside Three.js
        macroQuad.visible = false;
        masterLayerGroup.visible = false;
        particles.visible = false;
      }

      // Update grain overlay opacity
      if (grainOverlayRef.current) {
        grainOverlayRef.current.style.opacity = String(grainOpacity);
      }

      // Update Transition Debug Instrumentation (?transitionDebug=1)
      const tdState = document.getElementById("td-state");
      const tdStateBadge = document.getElementById("td-state-badge");
      const tdScrollY = document.getElementById("td-scrolly");
      const tdP = document.getElementById("td-p");
      const tdT = document.getElementById("td-t");
      const tdBg = document.getElementById("td-bg");
      const tdCanvasOpacity = document.getElementById("td-canvas-opacity");
      const tdGrainOpacity = document.getElementById("td-grain-opacity");

      if (tdState) tdState.textContent = activeSceneState;
      if (tdStateBadge) tdStateBadge.textContent = activeSceneState;
      if (tdScrollY) tdScrollY.textContent = `${Math.round(window.scrollY)}px`;
      if (tdP) tdP.textContent = `${(p * 100).toFixed(1)}%`;
      if (tdT) tdT.textContent = `${(handoffProgress * 100).toFixed(1)}%`;
      if (tdBg) tdBg.textContent = galleryBgColor;
      if (tdCanvasOpacity && canvas) tdCanvasOpacity.textContent = canvas.style.opacity || "1.0";
      if (tdGrainOpacity) tdGrainOpacity.textContent = grainOpacity.toFixed(2);
    };

    // ─── 10. Single Persistent Render Loop ───
    const clock = new THREE.Clock();
    let animFrameId: number;

    const animate = () => {
      animFrameId = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.1);
      const elapsed = clock.getElapsedTime();

      // Update macro entrance uniforms during Phase 1 & 2
      macroUniforms.uTime.value = elapsed;
      macroUniforms.uIntroProgress.value = introState.progress;
      macroUniforms.uIntroZoom.value = introState.zoom;
      macroUniforms.uCameraTarget.value.set(introState.targetX, introState.targetY);

      // Smooth pointer tracking & hover decay
      macroUniforms.uScreenPointer.value.lerp(targetScreenPointer, 0.25);
      macroUniforms.uPointerActive.value = THREE.MathUtils.lerp(
        macroUniforms.uPointerActive.value,
        pointerActiveTarget,
        0.15
      );
      macroUniforms.uPointerVelocity.value = THREE.MathUtils.lerp(
        macroUniforms.uPointerVelocity.value,
        currentPointerVelocity,
        0.15
      );

      // Propagate pointer to 3D layers
      layerItems.forEach((item) => {
        item.material.uniforms.uPointerUV.value.lerp(targetLayerUV, 0.25);
        item.material.uniforms.uPointerActive.value = macroUniforms.uPointerActive.value;
        item.material.uniforms.uClickProgress.value = macroUniforms.uClickProgress.value;
      });

      // Evaluate combined master choreography
      evaluateScene(canonicalState.p, elapsed);

      renderer.render(scene, camera);
    };

    animFrameId = requestAnimationFrame(animate);

    // Expose testing handle
    (window as any).__irisReplayIntro = () => {
      if (scrollTimeline && (scrollTimeline as any).scrollTrigger) {
        (scrollTimeline as any).scrollTrigger.scroll(0);
        (scrollTimeline as any).scrollTrigger.update();
      }
      startEntrance();
    };

    // Expose debug toggle
    (window as any).__setIrisDebug = (val: boolean) => {
      debugEnabledRef.current = val;
      if (debugHudRef.current) {
        if (val) debugHudRef.current.classList.remove("hidden");
        else debugHudRef.current.classList.add("hidden");
      }
      if (debugReticleRef.current) {
        if (val) debugReticleRef.current.classList.remove("hidden");
        else debugReticleRef.current.classList.add("hidden");
      }
    };

    // ─── Cleanup ───
    cleanupRef.current = () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("click", onClick);
      window.removeEventListener("keydown", onKeyDown);

      scrollTimeline.kill();
      introTimeline.kill();
      ScrollTrigger.getAll().forEach((t) => {
        if (t.trigger === container) t.kill();
      });

      renderer.dispose();
      basePlaneGeo.dispose();
      particleGeo.dispose();
      particleMaterial.dispose();
      fogMaterial.dispose();
      macroMaterial.dispose();
      layerItems.forEach((item) => {
        item.material.dispose();
      });
    };
  }, [onIntroComplete]);

  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => {
      if (active) initExperience();
    }, 60);

    return () => {
      active = false;
      clearTimeout(timer);
      if (cleanupRef.current) cleanupRef.current();
    };
  }, [initExperience]);

  return (
    <div id="explore" className="relative w-full bg-[#090909]">
      <section
        ref={containerRef}
        data-section="unified-iris"
        className={`relative z-20 w-full h-screen overflow-hidden select-none ${className}`}
      >
        {/* Layer 0: Darkroom Background (#090909) */}
        <div className="absolute inset-0 bg-[#090909] z-0 pointer-events-none" />

        {/* Layer 1: Emerging Gallery Content (Unconstrained Natural Layout)
            Developed by Three Explicit Scene States, zero hard cuts or diagonal seams */}
        <div
          ref={exposureOverlayRef}
          className="absolute inset-0 w-full h-full overflow-hidden pointer-events-auto flex flex-col justify-between z-[25]"
          style={{ zIndex: 25, backgroundColor: "transparent" }}
        >
          {/* Subtle Photographic Film Grain Overlay (Dissolves as Ivory establishes) */}
          <div
            ref={grainOverlayRef}
            className="absolute inset-0 pointer-events-none z-10"
            style={{
              opacity: 0,
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.7'/%3E%3C/svg%3E")`,
              mixBlendMode: "overlay",
            }}
          />
          <ArtOfIris
            isEmbeddedInHero={true}
            soloPlateRef={matchedSoloPlateRef}
            headerRowRef={emergingGalleryHeaderRef}
            categoryBarRef={emergingCategoryBarRef}
          />
        </div>

        {/* Layer 2: WebGL Iris Canvas (Transparent Background, Pitch-Black Pupil, Alpha: true)
            Active during HERO_ACTIVE and HANDOFF_ACTIVE, suppressed during GALLERY_ACTIVE */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full block z-20 pointer-events-auto"
        />

        {/* Layer 3: Hero Typography Overlay (Phase 1 & 2: Glides out on scroll, restored on reverse) */}
        <div
          ref={heroTextRef}
          className="pointer-events-none absolute inset-0 z-30 opacity-100"
        >
          <HeroUI />
        </div>

      {/* Transition Debug Telemetry HUD (?transitionDebug=1) */}
      <div
        ref={transitionDebugHudRef}
        id="transition-debug-hud"
        className="fixed top-24 left-6 z-50 bg-[#090909]/90 border border-white/20 p-4 font-mono text-[11px] text-[#FAFAF8] shadow-[0_8px_32px_rgba(0,0,0,0.8)] backdrop-blur-md max-w-xs pointer-events-none hidden rounded-lg"
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-1.5 mb-2 font-bold tracking-wider">
          <span className="text-white">TRANSITION DEBUG</span>
          <span id="td-state-badge" className="text-[10px] text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-500/30">
            STATE
          </span>
        </div>
        <div className="space-y-1 text-white/80">
          <div className="flex justify-between">
            <span className="text-white/50">Scroll Y:</span>
            <span id="td-scrolly" className="text-white font-bold">0px</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/50">Progress (p):</span>
            <span id="td-p" className="text-white font-bold">0.0%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/50">Handoff (t):</span>
            <span id="td-t" className="text-white">0.0%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/50">Scene State:</span>
            <span id="td-state" className="text-emerald-400 font-bold">HERO_ACTIVE</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/50">Gallery BG:</span>
            <span id="td-bg" className="text-white">rgb(9, 9, 9)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/50">Canvas Opacity:</span>
            <span id="td-canvas-opacity" className="text-white">1.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/50">Grain Opacity:</span>
            <span id="td-grain-opacity" className="text-white">0.00</span>
          </div>
        </div>
      </div>

      {/* Pointer Debug Telemetry Overlay (?irisDebug=1) */}
      <div
        ref={debugHudRef}
        id="iris-debug-hud"
        className="fixed bottom-6 left-6 z-50 bg-[#07090c]/90 border border-white/20 p-4 font-mono text-[11px] text-[#e0e8f0] shadow-[0_8px_32px_rgba(0,0,0,0.8)] backdrop-blur-md max-w-xs pointer-events-none hidden"
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-1.5 mb-2 text-white font-bold tracking-wider">
          <span>IRIS POINTER HUD</span>
          <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-white/20">Active</span>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between">
            <span className="text-white/60">Screen Pos:</span>
            <span id="dbg-screen">0px, 0px</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">NDC:</span>
            <span id="dbg-ndc">0, 0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">Resolved UV:</span>
            <span id="dbg-uv" className="text-white font-semibold">0.5, 0.5</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">Hit Object:</span>
            <span id="dbg-hit" className="truncate max-w-[140px] text-right">none</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">Hover Intensity:</span>
            <span id="dbg-hover">0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">Reveal Origin:</span>
            <span id="dbg-origin" className="text-white/80">0.5, 0.5</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">Scroll Travel:</span>
            <span id="dbg-scroll">0.0%</span>
          </div>
        </div>
      </div>

      <div
        ref={debugReticleRef}
        id="iris-debug-reticle"
        className="fixed z-50 pointer-events-none -translate-x-1/2 -translate-y-1/2 hidden"
        style={{ left: "-100px", top: "-100px" }}
      >
        <div className="relative w-8 h-8 flex items-center justify-center">
          <span className="absolute w-6 h-6 rounded-full border border-white animate-ping opacity-30" />
          <span className="w-4 h-4 rounded-full border border-white bg-white/20 flex items-center justify-center">
            <span className="w-1 h-1 rounded-full bg-white" />
          </span>
          <span id="dbg-reticle-label" className="absolute -top-4 left-6 text-[9px] font-mono whitespace-nowrap bg-black/90 px-1 py-0.5 rounded border border-white/30 text-white">
            UV: (0.50, 0.50)
          </span>
        </div>
      </div>
    </section>
  </div>
);
}
