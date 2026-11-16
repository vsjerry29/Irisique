"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  irisLabVertexShader,
  irisLabFragmentShader,
} from "../iris-lab/shaders.glsl";
import HeroUI from "../iris/HeroUI";
import ArtOfIris from "../home/ArtOfIris";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * ─── Codrops / Mersis Photographic Seam Transition Engine ───
 * An asymmetric diagonal seam sweeping from lower-right (u+v > 2) towards top-left (u+v < 0).
 * Perturbed by a gentle organic low-frequency wave for an authentic paper-tear / photographic edge.
 * Uncovers warm ivory `#F4F1EA` behind the iris. The iris pupil remains pitch-black (#000000) at all times.
 */
export function computePhotographicSeamPath(p: number): {
  clipPath: string;
  edgeLine: string;
} {
  if (p <= 0.02) {
    return {
      clipPath: "M 1.5 1.5 Z",
      edgeLine: "M 1.5 1.5 Z",
    };
  }
  if (p >= 0.90) {
    return {
      clipPath: "M -0.3 -0.3 L 1.3 -0.3 L 1.3 1.3 L -0.3 1.3 Z",
      edgeLine: "M -0.3 -0.3 Z",
    };
  }

  // Smoothstep progress from 0.02 to 0.90
  const t = (p - 0.02) / 0.88;
  const s = t * t * (3.0 - 2.0 * t);
  // Diagonal offset: at s=0, c=2.35 (outside lower-right); at s=1, c=-0.35 (past top-left)
  const c = 2.35 - s * 2.70;

  const steps = 18;
  const pts: [number, number][] = [];

  for (let i = 0; i <= steps; i++) {
    // sigma is orthogonal coordinate (u - v)
    const sigma = 1.6 - (3.2 * i) / steps;
    // Low-frequency gentle photographic edge undulation
    const delta = 0.055 * Math.sin(sigma * 2.6 + 0.4) + 0.030 * Math.cos(sigma * 4.2);
    const u = (c + sigma + delta) / 2.0;
    const v = (c - sigma + delta) / 2.0;
    pts.push([Math.round(u * 10000) / 10000, Math.round(v * 10000) / 10000]);
  }

  // Build the edge line (for the fine photographic shadow stroke)
  let edgeLine = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    edgeLine += ` L ${pts[i][0]} ${pts[i][1]}`;
  }

  // Build closed polygon covering bottom-right quadrant up to the seam
  let clipPath = edgeLine;
  clipPath += " L -0.35 1.35 L 1.35 1.35 L 1.35 -0.35 Z";

  return { clipPath, edgeLine };
}

// ─── 11 Anatomical 3D Stroma Layer Definitions ───
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
}

const LAYER_SPECS: LayerSpec[] = [
  // Layer E: Central Pupil Core (Deep optical anchor, ALWAYS PITCH BLACK)
  {
    id: "layer_e_pupil",
    file: "/assets/iris/layers/layer_e_pupil.webp",
    renderOrder: 1,
    type: "pupil",
    sepOffset: { x: 0.0, y: 0.0, z: -1.2, rotZ: 0.0, rotX: 0.0, rotY: 0.0, scale: 0.95 },
  },
  // Layer D: Inner Collarette
  {
    id: "layer_d1_collarette_alpha",
    file: "/assets/iris/layers/layer_d1_collarette_alpha.webp",
    renderOrder: 2,
    type: "collarette",
    sepOffset: { x: -0.06, y: 0.04, z: -0.50, rotZ: THREE.MathUtils.degToRad(5), rotX: 0.03, rotY: 0.02, scale: 1.05 },
  },
  {
    id: "layer_d2_collarette_beta",
    file: "/assets/iris/layers/layer_d2_collarette_beta.webp",
    renderOrder: 3,
    type: "collarette",
    sepOffset: { x: 0.05, y: -0.03, z: -0.40, rotZ: THREE.MathUtils.degToRad(7), rotX: -0.02, rotY: 0.03, scale: 1.06 },
  },
  // Layer C: Golden Crypt Network
  {
    id: "layer_c1_crypts_alpha",
    file: "/assets/iris/layers/layer_c1_crypts_alpha.webp",
    renderOrder: 4,
    type: "crypts",
    sepOffset: { x: 0.04, y: 0.06, z: -0.20, rotZ: THREE.MathUtils.degToRad(-8), rotX: 0.04, rotY: -0.02, scale: 1.07 },
  },
  {
    id: "layer_c2_crypts_beta",
    file: "/assets/iris/layers/layer_c2_crypts_beta.webp",
    renderOrder: 5,
    type: "crypts",
    sepOffset: { x: -0.05, y: -0.04, z: -0.10, rotZ: THREE.MathUtils.degToRad(-6), rotX: -0.03, rotY: 0.03, scale: 1.08 },
  },
  // Layer B: Deep Radial Stroma Fibres
  {
    id: "layer_b1_fibres_radial",
    file: "/assets/iris/layers/layer_b1_fibres_radial.webp",
    renderOrder: 6,
    type: "fibres",
    sepOffset: { x: 0.08, y: -0.05, z: 0.15, rotZ: THREE.MathUtils.degToRad(10), rotX: 0.03, rotY: -0.04, scale: 1.09 },
  },
  {
    id: "layer_b2_fibres_concentric",
    file: "/assets/iris/layers/layer_b2_fibres_concentric.webp",
    renderOrder: 7,
    type: "fibres",
    sepOffset: { x: -0.07, y: 0.06, z: 0.25, rotZ: THREE.MathUtils.degToRad(12), rotX: -0.04, rotY: 0.03, scale: 1.10 },
  },
  {
    id: "layer_b3_fibres_ciliary",
    file: "/assets/iris/layers/layer_b3_fibres_ciliary.webp",
    renderOrder: 8,
    type: "fibres",
    sepOffset: { x: 0.05, y: 0.08, z: 0.35, rotZ: THREE.MathUtils.degToRad(-11), rotX: 0.05, rotY: 0.02, scale: 1.12 },
  },
  // Layer A: Outer Limbus Ring
  {
    id: "layer_a1_limbus_arc1",
    file: "/assets/iris/layers/layer_a1_limbus_arc1.webp",
    renderOrder: 9,
    type: "limbus",
    sepOffset: { x: 0.04, y: 0.09, z: -0.55, rotZ: THREE.MathUtils.degToRad(9), rotX: 0.02, rotY: -0.04, scale: 1.15 },
  },
  {
    id: "layer_a2_limbus_arc2",
    file: "/assets/iris/layers/layer_a2_limbus_arc2.webp",
    renderOrder: 10,
    type: "limbus",
    sepOffset: { x: -0.09, y: -0.06, z: -0.60, rotZ: THREE.MathUtils.degToRad(-7), rotX: -0.03, rotY: -0.02, scale: 1.14 },
  },
  {
    id: "layer_a3_limbus_arc3",
    file: "/assets/iris/layers/layer_a3_limbus_arc3.webp",
    renderOrder: 11,
    type: "limbus",
    sepOffset: { x: 0.06, y: -0.08, z: -0.65, rotZ: THREE.MathUtils.degToRad(-5), rotX: 0.02, rotY: -0.03, scale: 1.16 },
  },
];

export interface TransitionLabStageProps {
  onProgressChange?: (p: number) => void;
}

export default function TransitionLabStage({ onProgressChange }: TransitionLabStageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);

  // Background Seam Refs
  const seamClipPathRef = useRef<SVGPathElement>(null);
  const seamEdgeLineRef = useRef<SVGPathElement>(null);

  // Gallery Handoff Target Refs
  const galleryStageRef = useRef<HTMLDivElement>(null);
  const soloPlateRef = useRef<HTMLDivElement>(null);
  const galleryHeaderRef = useRef<HTMLDivElement>(null);
  const categoryBarRef = useRef<HTMLDivElement>(null);

  // Interactive scrubbing state (for Lab)
  const [currentProgress, setCurrentProgress] = useState(0);
  const [isScrubbingManual, setIsScrubbingManual] = useState(false);
  const canonicalProgressRef = useRef(0);
  const cleanupRef = useRef<(() => void) | null>(null);

  // Initialize WebGL and GSAP ScrollTrigger Bridge
  const initScene = useCallback(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;
    const isMobile = width < 768;

    // ─── 1. WebGL Renderer with Alpha: true (Transparent Canvas) ───
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: "high-performance",
      alpha: true, // Transparent: allows diagonal background seam to show through!
    });
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(dpr);
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0.0); // Transparent background

    const scene = new THREE.Scene();
    scene.background = null; // No opaque background

    const camera = new THREE.PerspectiveCamera(44, width / height, 0.1, 100);
    camera.position.set(0, 0, isMobile ? 7.2 : 6.2);

    // Texture Loader
    const texLoader = new THREE.TextureLoader();
    const colorTex = texLoader.load("/assets/iris/iris-color.webp");
    const heightTex = texLoader.load("/assets/iris/iris-height.webp");
    const maskTex = texLoader.load("/assets/iris/iris-mask.webp");
    const macroTex = texLoader.load("/assets/iris/iris-macro.webp");

    [colorTex, heightTex, maskTex, macroTex].forEach((tex) => {
      tex.wrapS = THREE.ClampToEdgeWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
    });

    const masterLayerGroup = new THREE.Group();
    scene.add(masterLayerGroup);

    const basePlaneGeo = new THREE.PlaneGeometry(5, 5, 32, 32);
    const layerItems: Array<{
      mesh: THREE.Mesh;
      spec: LayerSpec;
      material: THREE.ShaderMaterial;
    }> = [];

    // Build 11 3D Stroma Meshes
    LAYER_SPECS.forEach((spec) => {
      const alphaTex = texLoader.load(spec.file);
      alphaTex.wrapS = THREE.ClampToEdgeWrapping;
      alphaTex.wrapT = THREE.ClampToEdgeWrapping;
      alphaTex.minFilter = THREE.LinearMipmapLinearFilter;
      alphaTex.magFilter = THREE.LinearFilter;

      const layerUniforms = {
        uColorTex: { value: colorTex },
        uAlphaTex: { value: alphaTex },
        uMaskTex: { value: maskTex },
        uOpacity: { value: 1.0 },
        uHighlight: { value: 0.0 },
        uClickProgress: { value: 0.0 },
        uClickOrigin: { value: new THREE.Vector2(0.5, 0.5) },
      };

      const layerVert = `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `;

      const layerFrag = `
        precision highp float;
        varying vec2 vUv;
        uniform sampler2D uColorTex;
        uniform sampler2D uAlphaTex;
        uniform sampler2D uMaskTex;
        uniform float uOpacity;
        uniform float uHighlight;
        uniform float uClickProgress;
        uniform vec2 uClickOrigin;

        void main() {
          vec4 col = texture2D(uColorTex, vUv);
          vec4 alphaMap = texture2D(uAlphaTex, vUv);
          float mask = texture2D(uMaskTex, vUv).r;

          float finalAlpha = alphaMap.a * alphaMap.r * mask * uOpacity;
          if (finalAlpha < 0.005) discard;

          // Localized click ripple
          if (uClickProgress > 0.001 && uClickProgress < 1.0) {
            float distClick = length(vUv - uClickOrigin);
            float clickWave = exp(-pow((distClick - uClickProgress * 0.35) / 0.055, 2.0)) * (1.0 - uClickProgress);
            col.rgb += vec3(0.65, 0.62, 0.58) * clickWave * 0.95;
          }

          col.rgb += uHighlight * 0.25;
          gl_FragColor = vec4(col.rgb, finalAlpha);
        }
      `;

      const mat = new THREE.ShaderMaterial({
        vertexShader: layerVert,
        fragmentShader: layerFrag,
        uniforms: layerUniforms,
        transparent: true,
        depthTest: true,
        depthWrite: false,
        blending: THREE.NormalBlending,
      });

      const mesh = new THREE.Mesh(basePlaneGeo, mat);
      mesh.renderOrder = spec.renderOrder;
      mesh.position.set(0, 0, 0);
      masterLayerGroup.add(mesh);
      layerItems.push({ mesh, spec, material: mat });
    });

    // Macro Intro Quad
    const macroUniforms = {
      uColorTex: { value: colorTex },
      uHeightTex: { value: heightTex },
      uMaskTex: { value: maskTex },
      uMacroTex: { value: macroTex },
      uTime: { value: 0 },
      uMasterOpacity: { value: 1.0 },
      uIntroProgress: { value: 1.0 },
      uIntroZoom: { value: 1.0 },
      uResolution: { value: new THREE.Vector2(width * dpr, height * dpr) },
      uPointerUV: { value: new THREE.Vector2(0.5, 0.5) },
      uClickProgress: { value: 0.0 },
      uClickOrigin: { value: new THREE.Vector2(0.5, 0.5) },
    };

    const macroFrag = `
      precision highp float;
      varying vec2 vUv;
      uniform sampler2D uColorTex;
      uniform sampler2D uMaskTex;
      uniform float uMasterOpacity;
      uniform float uClickProgress;
      uniform vec2 uClickOrigin;

      void main() {
        vec2 centered = vUv - 0.5;
        float dist = length(centered);
        // Circular iris boundary discard
        if (dist > 0.498) discard;

        vec4 col = texture2D(uColorTex, vUv);
        float mask = texture2D(uMaskTex, vUv).r;
        float edgeSoft = smoothstep(0.498, 0.470, dist);

        // Click impulse
        if (uClickProgress > 0.001 && uClickProgress < 1.0) {
          float distClick = length(vUv - uClickOrigin);
          float clickWave = exp(-pow((distClick - uClickProgress * 0.35) / 0.055, 2.0)) * (1.0 - uClickProgress);
          col.rgb += vec3(0.65, 0.62, 0.58) * clickWave * 0.95;
        }

        gl_FragColor = vec4(col.rgb, uMasterOpacity * edgeSoft);
      }
    `;

    const macroMaterial = new THREE.ShaderMaterial({
      vertexShader: irisLabVertexShader,
      fragmentShader: macroFrag,
      uniforms: macroUniforms,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });

    const macroQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), macroMaterial);
    macroQuad.renderOrder = 50;
    scene.add(macroQuad);

    // ─── 2. Continuous State Evaluator (Progress p: 0.00 -> 1.00) ───
    const applyProgress = (p: number) => {
      canonicalProgressRef.current = p;
      setCurrentProgress(p);
      if (onProgressChange) onProgressChange(p);

      // A. Asymmetric Diagonal Photographic Seam Update (0.70 -> 0.94)
      let seamP = 0.0;
      if (p <= 0.70) {
        seamP = 0.0;
      } else if (p >= 0.94) {
        seamP = 1.0;
      } else {
        seamP = (p - 0.70) / 0.24;
      }
      const { clipPath, edgeLine } = computePhotographicSeamPath(seamP);
      if (seamClipPathRef.current) {
        seamClipPathRef.current.setAttribute("d", clipPath);
      }
      if (seamEdgeLineRef.current) {
        seamEdgeLineRef.current.setAttribute("d", edgeLine);
      }

      // B. Hero Typography Overlay Fade-Out (0.00 -> 0.12)
      if (heroTextRef.current) {
        const textOpacity = Math.max(0, 1.0 - p / 0.12);
        heroTextRef.current.style.opacity = textOpacity.toFixed(3);
        heroTextRef.current.style.transform = `translateY(${-p * 35}px)`;
      }

      // C. Macro Quad Cross-fade into 3D Stroma Layers (0.35 -> 0.45)
      let macroQuadOpacity = 1.0;
      if (p <= 0.35) {
        macroQuadOpacity = 1.0;
      } else if (p <= 0.45) {
        macroQuadOpacity = 1.0 - (p - 0.35) / 0.10;
      } else {
        macroQuadOpacity = 0.0;
      }
      macroUniforms.uMasterOpacity.value = macroQuadOpacity;
      macroQuad.visible = macroQuadOpacity > 0.001;

      // D. Master Iris Rotation Sequence: Rotation Before Immersion
      let rotAngle = 0;
      if (p <= 0.35) {
        const t = p / 0.35;
        rotAngle = t * THREE.MathUtils.degToRad(125);
      } else if (p <= 0.70) {
        const t = (p - 0.35) / 0.35;
        const ease = Math.sin(t * Math.PI * 0.5);
        rotAngle = THREE.MathUtils.degToRad(125) + ease * THREE.MathUtils.degToRad(25);
      } else {
        const t = Math.min(1.0, (p - 0.70) / 0.15);
        const ease = t * t * (3.0 - 2.0 * t);
        rotAngle = THREE.MathUtils.lerp(THREE.MathUtils.degToRad(150), 0, ease);
      }
      masterLayerGroup.rotation.z = -rotAngle;

      // Camera coordinates:
      if (p <= 0.35) {
        camera.position.set(0, 0, isMobile ? 7.2 : 6.2);
        camera.lookAt(0, 0, 0);
      } else if (p <= 0.70) {
        const t = (p - 0.35) / 0.35;
        const camZ = THREE.MathUtils.lerp(isMobile ? 7.2 : 6.2, isMobile ? 5.2 : 4.2, t);
        camera.position.set(0, 0, camZ);
        camera.lookAt(0, 0, 0);
      } else {
        const t = Math.min(1.0, (p - 0.70) / 0.15);
        const camZ = THREE.MathUtils.lerp(isMobile ? 5.2 : 4.2, isMobile ? 7.0 : 6.6, t);
        camera.position.set(0, 0, camZ);
        camera.lookAt(0, 0, 0);
      }

      // E. WebGL Stroma Layers Transformation & Solo Plate Handoff
      layerItems.forEach((item) => {
        const { mesh, spec, material } = item;
        const sep = spec.sepOffset;

        let posX = 0, posY = 0, posZ = 0;
        let rotZ = 0, rotX = 0, rotY = 0;
        let scale = 0.82;
        let opacity = 1.0;

        if (p <= 0.35) {
          // Assembled hero state, zero separation
          posX = 0; posY = 0; posZ = 0;
          scale = 0.82;
          opacity = 0.0;
        } else if (p <= 0.55) {
          // Subtle organic unfolding (depth separation)
          const t = (p - 0.35) / 0.20;
          const ease = t * t * (3.0 - 2.0 * t);
          posX = sep.x * ease;
          posY = sep.y * ease;
          posZ = sep.z * ease;
          rotZ = sep.rotZ * ease;
          rotX = sep.rotX * ease;
          rotY = sep.rotY * ease;
          scale = THREE.MathUtils.lerp(0.82, sep.scale, ease);
          opacity = Math.min(1.0, (p - 0.35) / 0.08);
        } else if (p <= 0.70) {
          // Consolidation towards Solo artwork plate center & diameter
          const t = (p - 0.55) / 0.15;
          const ease = t * t * (3.0 - 2.0 * t);
          posX = THREE.MathUtils.lerp(sep.x, 0, ease);
          posY = THREE.MathUtils.lerp(sep.y, 0, ease);
          posZ = THREE.MathUtils.lerp(sep.z, 0, ease);
          rotZ = THREE.MathUtils.lerp(sep.rotZ, 0, ease);
          rotX = THREE.MathUtils.lerp(sep.rotX, 0, ease);
          rotY = THREE.MathUtils.lerp(sep.rotY, 0, ease);
          scale = THREE.MathUtils.lerp(sep.scale, 1.0, ease);
          opacity = 1.0;
        } else if (p <= 0.88) {
          // Matched Artwork Handoff (0.70 -> 0.88)
          // WebGL layers dissolve smoothly while Solo artwork plate cross-fades in
          const t = (p - 0.70) / 0.18;
          posX = 0; posY = 0; posZ = 0;
          scale = 1.0;
          opacity = Math.max(0.0, 1.0 - t);
        } else {
          opacity = 0.0;
        }

        mesh.position.set(posX, posY, posZ);
        mesh.rotation.set(rotX, rotY, rotZ);
        mesh.scale.set(scale, scale, 1);
        mesh.visible = opacity > 0.005;
        material.uniforms.uOpacity.value = opacity;
      });

      // F. Solo Artwork Plate Cross-fade (0.72 -> 0.88)
      if (soloPlateRef.current) {
        if (p <= 0.72) {
          soloPlateRef.current.style.opacity = "0";
        } else if (p <= 0.88) {
          const t = (p - 0.72) / 0.16;
          const s = t * t * (3.0 - 2.0 * t);
          soloPlateRef.current.style.opacity = s.toFixed(3);
        } else {
          soloPlateRef.current.style.opacity = "1";
        }
      }

      // G. Emerging Gallery Header & Category Switcher (0.80 -> 1.00)
      if (galleryHeaderRef.current && categoryBarRef.current) {
        if (p <= 0.80) {
          galleryHeaderRef.current.style.opacity = "0";
          galleryHeaderRef.current.style.transform = "translateY(20px)";
          categoryBarRef.current.style.opacity = "0";
          categoryBarRef.current.style.transform = "translateY(20px)";
        } else if (p < 1.00) {
          const t = (p - 0.80) / 0.20;
          galleryHeaderRef.current.style.opacity = t.toFixed(3);
          galleryHeaderRef.current.style.transform = `translateY(${((1 - t) * 20).toFixed(1)}px)`;
          categoryBarRef.current.style.opacity = t.toFixed(3);
          categoryBarRef.current.style.transform = `translateY(${((1 - t) * 20).toFixed(1)}px)`;
        } else {
          galleryHeaderRef.current.style.opacity = "1";
          galleryHeaderRef.current.style.transform = "translateY(0px)";
          categoryBarRef.current.style.opacity = "1";
          categoryBarRef.current.style.transform = "translateY(0px)";
        }
      }

      // Gallery Clip-path: hidden at hero start, clipped by seam during transition, completely cleared (none) when settled
      if (galleryStageRef.current) {
        if (p <= 0.70) {
          galleryStageRef.current.style.visibility = "hidden";
        } else {
          galleryStageRef.current.style.visibility = "visible";
          if (p >= 0.94) {
            galleryStageRef.current.style.clipPath = "none";
          } else {
            galleryStageRef.current.style.clipPath = "url(#photographicSeamClip)";
          }
        }
      }

      // Canvas pointer-events and opacity: enabled during hero, dissolved when Solo plate settled
      if (canvas) {
        if (p <= 0.88) {
          canvas.style.opacity = "1";
          canvas.style.pointerEvents = "auto";
        } else {
          const tDissolve = (p - 0.88) / 0.12;
          canvas.style.opacity = Math.max(0, 1.0 - tDissolve).toFixed(3);
          canvas.style.pointerEvents = "none";
        }
      }
    };

    // ─── 3. ScrollTrigger Setup (115vh travel) ───
    const scrollTrigger = ScrollTrigger.create({
      trigger: container,
      start: "top top",
      end: () => `+=${Math.round(window.innerHeight * 1.15)}`, // 115vh travel
      pin: true,
      pinSpacing: true,
      scrub: 0.5,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        applyProgress(self.progress);
      },
    });

    // ─── 4. Render Loop ───
    const clock = new THREE.Clock();
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      macroUniforms.uTime.value = elapsed;

      renderer.render(scene, camera);
    };
    animId = requestAnimationFrame(animate);

    // Initial state evaluation
    applyProgress(0);

    // Click handler for localized optical impulse
    const onClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (
        e.clientX < rect.left ||
        e.clientX > rect.right ||
        e.clientY < rect.top ||
        e.clientY > rect.bottom
      ) {
        return;
      }
      const uvX = (e.clientX - rect.left) / rect.width;
      const uvY = 1.0 - (e.clientY - rect.top) / rect.height;

      macroUniforms.uClickOrigin.value.set(uvX, uvY);
      layerItems.forEach((item) => {
        item.material.uniforms.uClickOrigin.value.set(uvX, uvY);
      });

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
    window.addEventListener("click", onClick);

    const onResize = () => {
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || window.innerHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      ScrollTrigger.refresh();
    };
    window.addEventListener("resize", onResize);

    cleanupRef.current = () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("click", onClick);
      window.removeEventListener("resize", onResize);
      scrollTrigger.kill();
      renderer.dispose();
      basePlaneGeo.dispose();
      macroMaterial.dispose();
      layerItems.forEach((item) => item.material.dispose());
    };
  }, [onProgressChange]);

  useEffect(() => {
    initScene();
    return () => {
      if (cleanupRef.current) cleanupRef.current();
    };
  }, [initScene]);

  // Jump to specific frame (for automated QA & lab inspection)
  const jumpToProgress = (targetP: number) => {
    const st = ScrollTrigger.getById("transition-lab-trigger") || ScrollTrigger.getAll()[0];
    if (st && st.start !== undefined && st.end !== undefined) {
      const scrollPos = st.start + targetP * (st.end - st.start);
      window.scrollTo({ top: scrollPos, behavior: "instant" });
    }
  };

  return (
    <div className="relative w-full">
      {/* ─── Unified Hero & Seam Transition Stage Container ─── */}
      <section
        ref={containerRef}
        data-section="transition-lab-stage"
        className="relative z-20 w-full min-h-screen overflow-visible select-none"
      >
        {/* Layer 0: Darkroom Background (#090909) */}
        <div className="absolute inset-0 bg-[#090909] z-0 pointer-events-none" />

        {/* Layer 1: Emerging Gallery Content (Unconstrained Natural Layout)
            Clipped by Asymmetric Photographic Seam during transition, unclipped (none) at p >= 0.90 */}
        <div
          ref={galleryStageRef}
          className="relative z-10 w-full min-h-screen pointer-events-auto flex flex-col justify-between"
          style={{ clipPath: "url(#photographicSeamClip)" }}
        >
          <ArtOfIris
            isEmbeddedInHero={true}
            soloPlateRef={soloPlateRef}
            headerRowRef={galleryHeaderRef}
            categoryBarRef={categoryBarRef}
          />
        </div>

        {/* Layer 2: SVG Seam ClipPath and Organic Shadow Line */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-15 overflow-visible"
          viewBox="0 0 1 1"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <clipPath id="photographicSeamClip" clipPathUnits="objectBoundingBox">
              <path ref={seamClipPathRef} d="M 1.5 1.5 Z" />
            </clipPath>
            <filter id="seamShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="-0.003" dy="0.003" stdDeviation="0.004" floodColor="#090909" floodOpacity="0.25" />
            </filter>
          </defs>
          <path
            ref={seamEdgeLineRef}
            d="M 1.5 1.5 Z"
            fill="none"
            stroke="#D5D0C6"
            strokeWidth="0.0028"
            filter="url(#seamShadow)"
          />
        </svg>

        {/* Layer 3: WebGL Iris Canvas (Transparent Background, Pitch-Black Pupil, Alpha: true)
            Renders on z-20 above the background & seam, so pupil is NEVER obscured or turned white */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-screen block z-20 pointer-events-auto"
        />

        {/* Layer 4: Hero Typography Overlay (Phase 1 & 2: Glides out on scroll, restored on reverse) */}
        <div
          ref={heroTextRef}
          className="pointer-events-none absolute inset-0 z-25 opacity-100"
        >
          <HeroUI />
        </div>
      </section>

      {/* ─── Transition Lab Telemetry & Control HUD ─── */}
      <div className="fixed bottom-6 right-6 z-50 bg-[#090909]/90 border border-white/20 p-4 font-mono text-[11px] text-[#FAFAF8] shadow-[0_8px_32px_rgba(0,0,0,0.8)] backdrop-blur-md max-w-sm rounded-lg">
        <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2 font-bold tracking-wider">
          <span className="text-white">TRANSITION LAB HUD</span>
          <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">
            ACTIVE
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-white/60">Progress (p):</span>
            <span className="text-white font-bold text-sm">{(currentProgress * 100).toFixed(1)}%</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-white/60">Pupil Color:</span>
            <span className="text-white font-semibold flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-black border border-white/40" />
              #000000 (Black)
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-white/60">Seam Status:</span>
            <span className="text-white/80">
              {currentProgress <= 0.02
                ? "Off-screen (Darkroom)"
                : currentProgress >= 0.90
                ? "Full Reveal (Ivory)"
                : "Active Diagonal Seam"}
            </span>
          </div>

          {/* Quick Jump Buttons for Frame QA */}
          <div className="pt-2 border-t border-white/10">
            <span className="text-white/50 text-[10px] block mb-1">FRAME INSPECTION:</span>
            <div className="grid grid-cols-3 gap-1">
              {[
                { label: "0% Hero", p: 0.0 },
                { label: "20% Seam", p: 0.2 },
                { label: "40% Mid", p: 0.4 },
                { label: "60% Align", p: 0.6 },
                { label: "80% Handoff", p: 0.8 },
                { label: "100% Gallery", p: 1.0 },
              ].map((btn) => (
                <button
                  key={btn.label}
                  onClick={() => jumpToProgress(btn.p)}
                  className="px-1.5 py-1 text-[9px] bg-white/10 hover:bg-white/20 text-white rounded transition-colors text-center"
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
