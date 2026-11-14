"use client";

import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// 11 Anatomical layer definitions matching public/assets/iris/layers/
interface LayerSpec {
  id: string;
  file: string;
  renderOrder: number;
  type: "pupil" | "collarette" | "crypts" | "fibres" | "limbus";
  // Offsets at Phase B/C (Separation & Immersion)
  sepOffset: {
    x: number;
    y: number;
    z: number;
    rotZ: number;
    rotX: number;
    rotY: number;
    scale: number;
  };
  // Offsets at Phase D/E (Transformation & Distinct Final State)
  // Continuous forward progression — never reassembling!
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
    // In Phase D/E, pupil recedes deeper and shifts to the right, becoming an off-axis dark void
    finalOffset: { x: 1.2, y: -0.4, z: -2.5, rotZ: 0.05, rotX: 0.02, rotY: -0.04, scale: 0.85, opacity: 0.15 },
  },

  // Layer D: Inner Collarette (2 interlocking segments, warm copper & dark brown)
  {
    id: "layer_d1_collarette_alpha",
    file: "/assets/iris/layers/layer_d1_collarette_alpha.webp",
    renderOrder: 2,
    type: "collarette",
    sepOffset: { x: -0.06, y: 0.04, z: -0.50, rotZ: THREE.MathUtils.degToRad(5), rotX: 0.03, rotY: 0.02, scale: 1.05 },
    finalOffset: { x: 0.9, y: -0.6, z: -1.6, rotZ: THREE.MathUtils.degToRad(18), rotX: 0.05, rotY: -0.06, scale: 1.15, opacity: 0.30 },
  },
  {
    id: "layer_d2_collarette_beta",
    file: "/assets/iris/layers/layer_d2_collarette_beta.webp",
    renderOrder: 3,
    type: "collarette",
    sepOffset: { x: 0.05, y: -0.03, z: -0.40, rotZ: THREE.MathUtils.degToRad(7), rotX: -0.02, rotY: 0.03, scale: 1.06 },
    finalOffset: { x: 1.4, y: 0.3, z: -1.8, rotZ: THREE.MathUtils.degToRad(22), rotX: -0.04, rotY: 0.05, scale: 1.10, opacity: 0.25 },
  },

  // Layer C: Golden Crypt Network (2 organic branching segments, amber/gold structures)
  {
    id: "layer_c1_crypts_alpha",
    file: "/assets/iris/layers/layer_c1_crypts_alpha.webp",
    renderOrder: 4,
    type: "crypts",
    sepOffset: { x: 0.15, y: -0.08, z: 0.40, rotZ: THREE.MathUtils.degToRad(-13), rotX: 0.05, rotY: -0.04, scale: 1.15 },
    // Persists deeper into space as a floating luminous amber arch on the right
    finalOffset: { x: 0.7, y: 0.4, z: -0.6, rotZ: THREE.MathUtils.degToRad(-35), rotX: 0.12, rotY: -0.10, scale: 1.45, opacity: 0.65 },
  },
  {
    id: "layer_c2_crypts_beta",
    file: "/assets/iris/layers/layer_c2_crypts_beta.webp",
    renderOrder: 5,
    type: "crypts",
    sepOffset: { x: -0.12, y: 0.10, z: 0.50, rotZ: THREE.MathUtils.degToRad(-15), rotX: -0.04, rotY: 0.05, scale: 1.18 },
    finalOffset: { x: -0.8, y: -0.5, z: -0.9, rotZ: THREE.MathUtils.degToRad(-40), rotX: -0.08, rotY: 0.12, scale: 1.40, opacity: 0.55 },
  },

  // Layer B: Outer Blue/Teal Fibre Network (3 segments, flies closest past camera)
  {
    id: "layer_b1_fibres_arc1",
    file: "/assets/iris/layers/layer_b1_fibres_arc1.webp",
    renderOrder: 6,
    type: "fibres",
    sepOffset: { x: -0.18, y: 0.14, z: 1.25, rotZ: THREE.MathUtils.degToRad(8), rotX: -0.06, rotY: 0.08, scale: 1.35 },
    // Remains visible on the upper-left edge as large, intricate microscopic filaments
    finalOffset: { x: -1.4, y: 0.8, z: 0.5, rotZ: THREE.MathUtils.degToRad(32), rotX: -0.15, rotY: 0.18, scale: 2.10, opacity: 0.85 },
  },
  {
    id: "layer_b2_fibres_arc2",
    file: "/assets/iris/layers/layer_b2_fibres_arc2.webp",
    renderOrder: 7,
    type: "fibres",
    sepOffset: { x: 0.16, y: -0.12, z: 1.35, rotZ: THREE.MathUtils.degToRad(10), rotX: 0.08, rotY: -0.06, scale: 1.38 },
    // Flies past viewer and disperses downward into the dark fog
    finalOffset: { x: 0.4, y: -1.5, z: 0.2, rotZ: THREE.MathUtils.degToRad(28), rotX: 0.16, rotY: -0.12, scale: 2.05, opacity: 0.45 },
  },
  {
    id: "layer_b3_fibres_arc3",
    file: "/assets/iris/layers/layer_b3_fibres_arc3.webp",
    renderOrder: 8,
    type: "fibres",
    sepOffset: { x: 0.10, y: 0.16, z: 1.20, rotZ: THREE.MathUtils.degToRad(9), rotX: -0.05, rotY: -0.05, scale: 1.32 },
    finalOffset: { x: 1.8, y: 0.6, z: 0.4, rotZ: THREE.MathUtils.degToRad(25), rotX: -0.10, rotY: -0.14, scale: 1.95, opacity: 0.40 },
  },

  // Layer A: Outer Limbal Boundary (3 arc fragments, recedes into dark perimeter and dissolves)
  {
    id: "layer_a1_limbus_arc1",
    file: "/assets/iris/layers/layer_a1_limbus_arc1.webp",
    renderOrder: 9,
    type: "limbus",
    sepOffset: { x: 0.08, y: 0.10, z: -0.70, rotZ: THREE.MathUtils.degToRad(-6), rotX: 0.02, rotY: 0.03, scale: 1.15 },
    finalOffset: { x: 1.5, y: 1.2, z: -1.5, rotZ: THREE.MathUtils.degToRad(-20), rotX: 0.06, rotY: 0.08, scale: 1.50, opacity: 0.15 },
  },
  {
    id: "layer_a2_limbus_arc2",
    file: "/assets/iris/layers/layer_a2_limbus_arc2.webp",
    renderOrder: 10,
    type: "limbus",
    sepOffset: { x: -0.09, y: -0.06, z: -0.60, rotZ: THREE.MathUtils.degToRad(-7), rotX: -0.03, rotY: -0.02, scale: 1.14 },
    finalOffset: { x: -1.6, y: -1.0, z: -1.6, rotZ: THREE.MathUtils.degToRad(-22), rotX: -0.08, rotY: -0.06, scale: 1.45, opacity: 0.12 },
  },
  {
    id: "layer_a3_limbus_arc3",
    file: "/assets/iris/layers/layer_a3_limbus_arc3.webp",
    renderOrder: 11,
    type: "limbus",
    sepOffset: { x: 0.06, y: -0.08, z: -0.65, rotZ: THREE.MathUtils.degToRad(-5), rotX: 0.02, rotY: -0.03, scale: 1.16 },
    finalOffset: { x: 1.7, y: -1.1, z: -1.4, rotZ: THREE.MathUtils.degToRad(-18), rotX: 0.05, rotY: -0.07, scale: 1.48, opacity: 0.10 },
  },
];

export default function IrisLayersSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const container = containerRef.current;
    const canvas = canvasRef.current;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;
    const isMobile = () => width < 768;

    // ─── Three.js Scene Setup ───
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#020304");

    // Camera setup with depth
    const camera = new THREE.PerspectiveCamera(44, width / height, 0.1, 100);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile() ? 1.3 : 1.75));
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    // ─── 1. Authored 3D Camera & Target Flight Path (Continuous Non-Looping) ───
    // Desktop 3D camera trajectory: continuously moving forward along Z while panning off-axis
    const desktopCamPoints = [
      new THREE.Vector3(0.00, 0.00, 6.20),  // 0%: Complete frontal iris
      new THREE.Vector3(0.35, 0.10, 5.10),  // 20%: Early approach & subtle angle
      new THREE.Vector3(1.10, -0.35, 3.30), // 40%: Layer entry (travelling into gap)
      new THREE.Vector3(0.65, 0.45, 1.60),  // 60%: Inner traversal through fibres
      new THREE.Vector3(-0.45, 0.35, 0.15), // 80%: Transformation / pass-through
      new THREE.Vector3(-1.60, 0.20, -2.40),// 100%: Distinct final state in deep space
    ];

    const desktopTargetPoints = [
      new THREE.Vector3(0.00, 0.00, 0.00),   // 0%: Centered iris pupil
      new THREE.Vector3(0.06, -0.02, 0.00),  // 20%: Slight drift
      new THREE.Vector3(0.18, -0.08, -0.20), // 40%: Pupil moves off-center
      new THREE.Vector3(0.05, 0.08, -0.60),  // 60%: Peering toward midground amber
      new THREE.Vector3(-0.35, 0.12, -1.30), // 80%: Passing beyond core
      new THREE.Vector3(-1.10, 0.10, -3.60), // 100%: Looking into vast negative space
    ];

    // Mobile path: tighter lateral displacement to fit 390x844 portrait frame
    const mobileCamPoints = [
      new THREE.Vector3(0.00, 0.00, 7.20),
      new THREE.Vector3(0.15, 0.05, 5.80),
      new THREE.Vector3(0.40, -0.15, 3.90),
      new THREE.Vector3(0.25, 0.20, 2.10),
      new THREE.Vector3(-0.20, 0.15, 0.50),
      new THREE.Vector3(-0.80, 0.10, -1.80),
    ];

    const mobileTargetPoints = [
      new THREE.Vector3(0.00, 0.00, 0.00),
      new THREE.Vector3(0.03, -0.01, 0.00),
      new THREE.Vector3(0.08, -0.04, -0.20),
      new THREE.Vector3(0.02, 0.04, -0.50),
      new THREE.Vector3(-0.15, 0.06, -1.00),
      new THREE.Vector3(-0.50, 0.05, -2.50),
    ];

    const camCurveDesktop = new THREE.CatmullRomCurve3(desktopCamPoints, false, "catmullrom", 0.5);
    const targetCurveDesktop = new THREE.CatmullRomCurve3(desktopTargetPoints, false, "catmullrom", 0.5);

    const camCurveMobile = new THREE.CatmullRomCurve3(mobileCamPoints, false, "catmullrom", 0.5);
    const targetCurveMobile = new THREE.CatmullRomCurve3(mobileTargetPoints, false, "catmullrom", 0.5);

    // ─── 2. Atmospheric Procedural Shader Fog (Codrops 'The Sleepers' Inspired) ───
    // Lightweight 2-octave FBM noise on a deep background quad, zero heavy raymarching
    const fogVertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position.xy, 0.9999, 1.0); // Depth pinned at far plane
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

      // Fast simplex/fbm noise
      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

      float snoise(vec2 v) {
        const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                            -0.577350269189626, 0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy));
        vec2 x0 = v -   i + dot(i, C.xx);
        vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod289(i);
        vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
        m = m*m;
        m = m*m;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
        vec3 g;
        g.x  = a0.x  * x0.x  + h.x  * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
      }

      float fbm(vec2 p) {
        float total = 0.0;
        total += 0.60 * snoise(p);
        total += 0.30 * snoise(p * 2.1 + vec2(1.7, 9.2));
        total += 0.10 * snoise(p * 4.3 + vec2(5.2, 1.3));
        return total * 0.5 + 0.5;
      }

      void main() {
        vec2 uv = vUv;
        // Subtle optical chromatic shift during refraction moment
        vec2 uvR = uv + vec2(uRefractShift, 0.0);
        vec2 uvB = uv - vec2(uRefractShift, 0.0);

        // Slow organic time drift
        float t = uTime * 0.04;
        vec2 st = (uv - 0.5) * vec2(uResolution.x / uResolution.y, 1.0);

        float n1 = fbm(st * 1.8 + vec2(t * 0.5, t * 0.3));
        float n2 = fbm(st * 2.5 - vec2(t * 0.4, t * 0.6));
        float fog = mix(n1, n2, 0.5);

        // Petrol teal core + warm amber highlight contamination
        vec3 bgDeep = vec3(0.0078, 0.0117, 0.0156); // #020304
        vec3 tealAtmosphere = vec3(0.04, 0.12, 0.16); // Petrol teal
        vec3 amberHaze = vec3(0.24, 0.13, 0.05);     // Burnt amber

        float radialDist = length(st);
        vec3 color = bgDeep;
        color += tealAtmosphere * (fog * uDensity * 2.2);
        color += amberHaze * (smoothstep(0.8, 0.0, radialDist) * uDensity * 1.4);

        // Apply brief exposure lift at peak refraction
        color *= (1.0 + uExposure);

        gl_FragColor = vec4(color, 1.0);
      }
    `;

    const fogMaterial = new THREE.ShaderMaterial({
      vertexShader: fogVertexShader,
      fragmentShader: fogFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uDensity: { value: 0.04 },
        uResolution: { value: new THREE.Vector2(width, height) },
        uRefractShift: { value: 0.0 },
        uExposure: { value: 0.0 },
      },
      depthWrite: false,
      depthTest: false,
    });

    const fogQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), fogMaterial);
    fogQuad.renderOrder = -100;
    scene.add(fogQuad);

    // ─── 3. Microscopic Particles System (ONE Batched THREE.Points) ───
    // 3 apparent depth groups (foreground soft, midground crisp, background dim)
    const particleCount = isMobile() ? 110 : 280;
    const particleGeo = new THREE.BufferGeometry();
    const pPositions = new Float32Array(particleCount * 3);
    const pSizes = new Float32Array(particleCount);
    const pOpacities = new Float32Array(particleCount);
    const pWarmCool = new Float32Array(particleCount); // 0 = teal, 1 = amber
    const pDrifts = new Float32Array(particleCount * 3);

    // Deterministic seeded pseudo-random
    let seed = 42;
    const rnd = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };

    for (let i = 0; i < particleCount; i++) {
      // Disperse in 3D volume around the camera's path: x in [-3.5, 3.5], y in [-3, 3], z in [-4.5, 6.5]
      pPositions[i * 3 + 0] = (rnd() - 0.5) * 7.0;
      pPositions[i * 3 + 1] = (rnd() - 0.5) * 6.0;
      pPositions[i * 3 + 2] = (rnd() - 0.5) * 11.0 + 1.0;

      const group = rnd();
      if (group < 0.20) {
        // Foreground: large, soft, low opacity
        pSizes[i] = isMobile() ? 24.0 : 36.0;
        pOpacities[i] = 0.22 + rnd() * 0.15;
      } else if (group < 0.70) {
        // Midground: small, sharp
        pSizes[i] = isMobile() ? 8.0 : 12.0;
        pOpacities[i] = 0.55 + rnd() * 0.35;
      } else {
        // Background: tiny, dim optical debris
        pSizes[i] = isMobile() ? 4.0 : 6.0;
        pOpacities[i] = 0.20 + rnd() * 0.25;
      }

      pWarmCool[i] = rnd() > 0.45 ? 1.0 : 0.0; // Amber vs Teal mix
      pDrifts[i * 3 + 0] = (rnd() - 0.5) * 0.08;
      pDrifts[i * 3 + 1] = (rnd() - 0.5) * 0.06;
      pDrifts[i * 3 + 2] = (rnd() - 0.5) * 0.05;
    }

    particleGeo.setAttribute("position", new THREE.BufferAttribute(pPositions, 3));
    particleGeo.setAttribute("aSize", new THREE.BufferAttribute(pSizes, 1));
    particleGeo.setAttribute("aOpacity", new THREE.BufferAttribute(pOpacities, 1));
    particleGeo.setAttribute("aWarmCool", new THREE.BufferAttribute(pWarmCool, 1));

    const particleVertexShader = `
      attribute float aSize;
      attribute float aOpacity;
      attribute float aWarmCool;
      varying float vOpacity;
      varying float vWarmCool;
      uniform float uTime;
      uniform float uPixelRatio;

      void main() {
        vOpacity = aOpacity;
        vWarmCool = aWarmCool;

        vec3 pos = position;
        // Subtle organic drift
        pos.x += sin(uTime * 0.5 + position.z * 2.0) * 0.04;
        pos.y += cos(uTime * 0.4 + position.x * 2.0) * 0.04;

        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_Position = projectionMatrix * mvPosition;

        // Size attenuation based on camera distance
        gl_PointSize = (aSize * uPixelRatio) * (2.8 / -mvPosition.z);
        gl_PointSize = clamp(gl_PointSize, 1.0, 60.0);
      }
    `;

    const particleFragmentShader = `
      precision highp float;
      varying float vOpacity;
      varying float vWarmCool;

      void main() {
        // Soft gaussian circular falloff (NOT hard square)
        vec2 coord = gl_PointCoord - vec2(0.5);
        float dist = length(coord);
        if (dist > 0.5) discard;

        float alpha = smoothstep(0.5, 0.05, dist) * vOpacity;

        // Palette: Teal (#7ec8e3) vs Amber (#e09848)
        vec3 tealColor = vec3(0.494, 0.784, 0.890);
        vec3 amberColor = vec3(0.878, 0.596, 0.282);
        vec3 finalColor = mix(tealColor, amberColor, vWarmCool);

        gl_FragColor = vec4(finalColor, alpha);
      }
    `;

    const particleMaterial = new THREE.ShaderMaterial({
      vertexShader: particleVertexShader,
      fragmentShader: particleFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: renderer.getPixelRatio() },
      },
      transparent: true,
      depthWrite: false,
      depthTest: true,
      blending: THREE.AdditiveBlending,
    });

    const particleSystem = new THREE.Points(particleGeo, particleMaterial);
    particleSystem.renderOrder = 20;
    scene.add(particleSystem);

    // ─── 4. 11 Anatomical Layer Meshes with Custom Optical Shader ───
    // Diameter = 2.8 units (fits 55-65% viewport height at z=6.2)
    const basePlaneGeo = new THREE.PlaneGeometry(2.8, 2.8, 1, 1);
    const textureLoader = new THREE.TextureLoader();

    const layerVertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    const layerFragmentShader = `
      precision highp float;
      varying vec2 vUv;
      uniform sampler2D uMap;
      uniform float uOpacity;
      uniform float uErosion;
      uniform float uRefractShift;
      uniform float uHighlight;

      void main() {
        vec2 uv = vUv;

        // Brief chromatic aberration separation during 72-76% refraction
        vec4 colR = texture2D(uMap, uv + vec2(uRefractShift, 0.0));
        vec4 colG = texture2D(uMap, uv);
        vec4 colB = texture2D(uMap, uv - vec2(uRefractShift, 0.0));

        vec4 tex = vec4(colR.r, colG.g, colB.b, (colR.a + colG.a + colB.a) * 0.3333);

        if (tex.a < 0.005) discard;

        // Controlled mask erosion during Phase D (Transformation)
        float alpha = tex.a * uOpacity;
        if (uErosion > 0.0) {
          // Softly feather finer edges
          alpha *= smoothstep(uErosion * 0.85, 1.0, tex.a);
        }

        // Shimmer highlight as camera travels past
        vec3 rgb = tex.rgb * (1.0 + uHighlight * 0.35);

        gl_FragColor = vec4(rgb, alpha);
      }
    `;

    interface LayerItem {
      mesh: THREE.Mesh;
      spec: LayerSpec;
      material: THREE.ShaderMaterial;
    }

    const layerItems: LayerItem[] = [];
    const masterLayerGroup = new THREE.Group();
    scene.add(masterLayerGroup);

    LAYER_SPECS.forEach((spec) => {
      const tex = textureLoader.load(spec.file);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.generateMipmaps = true;

      const mat = new THREE.ShaderMaterial({
        vertexShader: layerVertexShader,
        fragmentShader: layerFragmentShader,
        uniforms: {
          uMap: { value: tex },
          uOpacity: { value: 1.0 },
          uErosion: { value: 0.0 },
          uRefractShift: { value: 0.0 },
          uHighlight: { value: 0.0 },
        },
        transparent: true,
        depthWrite: false,
        depthTest: true, // Prevents rectangular clipping while maintaining proper 3D depth
        side: THREE.DoubleSide,
        blending: THREE.NormalBlending,
      });

      const mesh = new THREE.Mesh(basePlaneGeo, mat);
      mesh.renderOrder = spec.renderOrder;
      mesh.position.set(0, 0, 0);
      mesh.rotation.set(0, 0, 0);
      mesh.scale.set(1, 1, 1);

      masterLayerGroup.add(mesh);
      layerItems.push({ mesh, spec, material: mat });
    });

    // ─── 5. Master Scroll Model (Canonical Normalized Progress [0..1]) ───
    // One canonical driver object: NO loops, NO yoyo, NO reassembly!
    const canonicalState = {
      p: 0.0, // Normalized progress 0.0 -> 1.0
    };

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        pin: true,
        pinSpacing: true,
        start: "top top",
        end: "+=200%", // 200vh controlled scroll travel
        scrub: 0.8,   // Liquid-smooth 0.8s catchup
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          canonicalState.p = self.progress;
        },
      },
    });

    // Linear progress tween driving the canonical state deterministically
    timeline.to(
      canonicalState,
      {
        p: 1.0,
        duration: 1.0,
        ease: "none",
      },
      0.00
    );

    // Expose testing handle
    (window as any).__irisJourneyTimeline = timeline;
    (window as any).__irisJourneyState = canonicalState;

    // ─── 6. Interpolation Engine for Continuous 3D Transformation ───
    // Helper function to evaluate layer transforms based on canonical progress p in [0, 1]
    const updateTransforms = (p: number, elapsed: number) => {
      const mobile = isMobile();
      const camCurve = mobile ? camCurveMobile : camCurveDesktop;
      const targetCurve = mobile ? targetCurveMobile : targetCurveDesktop;

      // 1. Evaluate Camera Position & Target along authored 3D splines
      const camPos = camCurve.getPointAt(p);
      const camTarget = targetCurve.getPointAt(p);

      // Add gentle mouse parallax (restrained)
      camera.position.x = camPos.x + mouse.x * 0.08;
      camera.position.y = camPos.y - mouse.y * 0.06;
      camera.position.z = camPos.z;
      camera.lookAt(camTarget.x + mouse.x * 0.03, camTarget.y - mouse.y * 0.02, camTarget.z);

      // 2. Atmospheric Fog Density Progression (Specified in prompt):
      // 0%: 0.04 -> 30%: 0.07 -> 60%: 0.10 -> 78%: 0.14 -> 100%: 0.11
      let fogDensity = 0.04;
      if (p <= 0.30) {
        fogDensity = THREE.MathUtils.lerp(0.04, 0.07, p / 0.30);
      } else if (p <= 0.60) {
        fogDensity = THREE.MathUtils.lerp(0.07, 0.10, (p - 0.30) / 0.30);
      } else if (p <= 0.78) {
        fogDensity = THREE.MathUtils.lerp(0.10, 0.14, (p - 0.60) / 0.18);
      } else {
        fogDensity = THREE.MathUtils.lerp(0.14, 0.11, (p - 0.78) / 0.22);
      }
      fogMaterial.uniforms.uDensity.value = fogDensity;
      fogMaterial.uniforms.uTime.value = elapsed;

      // 3. Optical Refraction Event (at 72% - 76% progress):
      // Very small RGB shift (0.0015 - 0.003), horizontal displacement (~0.002), exposure lift (<= 4%)
      let refractShift = 0.0;
      let exposureLift = 0.0;
      if (p >= 0.71 && p <= 0.77) {
        const mid = 0.74;
        const dist = Math.abs(p - mid) / 0.03; // [0..1]
        const bell = 0.5 + 0.5 * Math.cos(dist * Math.PI);
        refractShift = bell * 0.0022;
        exposureLift = bell * 0.038;
      }
      fogMaterial.uniforms.uRefractShift.value = refractShift;
      fogMaterial.uniforms.uExposure.value = exposureLift;

      // 4. Update Particle System
      particleMaterial.uniforms.uTime.value = elapsed;

      // 5. Update 11 Layer Meshes
      layerItems.forEach((item, idx) => {
        const { mesh, spec, material } = item;
        const sep = spec.sepOffset;
        const fin = spec.finalOffset;

        let posX = 0, posY = 0, posZ = 0;
        let rotZ = 0, rotX = 0, rotY = 0;
        let scale = 1.0;
        let opacity = 1.0;
        let erosion = 0.0;
        let highlight = 0.0;

        if (p <= 0.15) {
          // ── PHASE A (0–15%): Complete Iris
          // All layers aligned at origin, slight subtle rotation
          const t = p / 0.15;
          rotZ = THREE.MathUtils.degToRad(1.5) * t;
          opacity = 1.0;
        } else if (p <= 0.35) {
          // ── PHASE B (15–35%): Layer Separation
          // Interpolate from Assembled (0) to sepOffset
          const t = (p - 0.15) / 0.20;
          const ease = t * t * (3.0 - 2.0 * t); // smoothstep
          posX = sep.x * ease;
          posY = sep.y * ease;
          posZ = sep.z * ease;
          rotZ = sep.rotZ * ease;
          rotX = sep.rotX * ease;
          rotY = sep.rotY * ease;
          scale = 1.0 + (sep.scale - 1.0) * ease;
          opacity = 1.0;
        } else if (p <= 0.65) {
          // ── PHASE C (35–65%): Immersion / Fly-Through
          // Layers continue expanding and drifting as camera enters
          const t = (p - 0.35) / 0.30;
          posX = THREE.MathUtils.lerp(sep.x, (sep.x + fin.x) * 0.5, t);
          posY = THREE.MathUtils.lerp(sep.y, (sep.y + fin.y) * 0.5, t);
          posZ = THREE.MathUtils.lerp(sep.z, (sep.z + fin.z) * 0.45, t);
          rotZ = THREE.MathUtils.lerp(sep.rotZ, (sep.rotZ + fin.rotZ) * 0.5, t);
          rotX = THREE.MathUtils.lerp(sep.rotX, (sep.rotX + fin.rotX) * 0.5, t);
          rotY = THREE.MathUtils.lerp(sep.rotY, (sep.rotY + fin.rotY) * 0.5, t);
          scale = THREE.MathUtils.lerp(sep.scale, (sep.scale + fin.scale) * 0.5, t);
          opacity = 1.0;
          highlight = Math.sin(t * Math.PI) * 0.4;
        } else if (p <= 0.85) {
          // ── PHASE D (65–85%): Transformation & Controlled Dissolution
          // Structures fragment / disperse laterally and into depth.
          // NEVER reassembling!
          const t = (p - 0.65) / 0.20;
          posX = THREE.MathUtils.lerp((sep.x + fin.x) * 0.5, fin.x, t);
          posY = THREE.MathUtils.lerp((sep.y + fin.y) * 0.5, fin.y, t);
          posZ = THREE.MathUtils.lerp((sep.z + fin.z) * 0.45, fin.z, t);
          rotZ = THREE.MathUtils.lerp((sep.rotZ + fin.rotZ) * 0.5, fin.rotZ, t);
          rotX = THREE.MathUtils.lerp((sep.rotX + fin.rotX) * 0.5, fin.rotX, t);
          rotY = THREE.MathUtils.lerp((sep.rotY + fin.rotY) * 0.5, fin.rotY, t);
          scale = THREE.MathUtils.lerp((sep.scale + fin.scale) * 0.5, fin.scale, t);
          opacity = THREE.MathUtils.lerp(1.0, fin.opacity, t);
          erosion = t * 0.5; // Controlled edge erosion
        } else {
          // ── PHASE E (85–100%): Distinct Final State
          // Settled in final dispersed composition, opening negative space for next section
          const t = (p - 0.85) / 0.15;
          posX = fin.x;
          posY = fin.y;
          posZ = fin.z;
          rotZ = fin.rotZ;
          rotX = fin.rotX;
          rotY = fin.rotY;
          scale = fin.scale;
          // Smooth fade into next section handoff
          opacity = fin.opacity * (1.0 - t * 0.25);
          erosion = 0.5 + t * 0.2;
        }

        // Apply idle micro-drift (only when separated, blended additively)
        if (p > 0.15) {
          const drift = Math.sin(elapsed * 0.7 + idx * 0.8) * 0.012;
          posX += drift * 0.5;
          posY += drift;
        }

        mesh.position.set(posX, posY, posZ);
        mesh.rotation.set(rotX, rotY, rotZ);
        mesh.scale.set(scale, scale, 1.0);

        material.uniforms.uOpacity.value = opacity;
        material.uniforms.uErosion.value = erosion;
        material.uniforms.uRefractShift.value = refractShift;
        material.uniforms.uHighlight.value = highlight;
      });
    };

    // ─── Pointer & Mouse Smoothing ───
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const onMouseMove = (e: MouseEvent) => {
      mouse.targetX = (e.clientX / width - 0.5) * 2;
      mouse.targetY = (e.clientY / height - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMouseMove, { passive: true });

    // ─── Render Loop ───
    const clock = new THREE.Clock();
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsed = clock.getElapsedTime();

      // Mouse smoothing
      mouse.x += (mouse.targetX - mouse.x) * 0.04;
      mouse.y += (mouse.targetY - mouse.y) * 0.04;

      // Update scene based on canonical progress
      updateTransforms(canonicalState.p, elapsed);

      renderer.render(scene, camera);
    };

    animate();

    // ─── Resize Handler ───
    const onResize = () => {
      if (!container) return;
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile() ? 1.3 : 1.75));
      fogMaterial.uniforms.uResolution.value.set(width, height);
      particleMaterial.uniforms.uPixelRatio.value = renderer.getPixelRatio();
    };
    window.addEventListener("resize", onResize);

    // ─── Cleanup ───
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      timeline.kill();
      ScrollTrigger.getAll().forEach((t) => {
        if (t.trigger === container) t.kill();
      });

      basePlaneGeo.dispose();
      particleGeo.dispose();
      particleMaterial.dispose();
      fogMaterial.dispose();
      layerItems.forEach((item) => {
        if (item.material.uniforms.uMap.value) {
          item.material.uniforms.uMap.value.dispose();
        }
        item.material.dispose();
      });
      renderer.dispose();
    };
  }, []);

  return (
    <section
      ref={containerRef}
      id="universe"
      data-section="iris-layers"
      className="relative w-full h-screen overflow-hidden bg-[#020304] select-none"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block z-10"
      />
    </section>
  );
}
