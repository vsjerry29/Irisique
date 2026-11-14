import * as THREE from "three";

// Crypt definition interface
export interface CryptOpening {
  angle: number;       // Central angle in radians
  radius: number;      // Radial distance from pupil center [0.45, 0.75]
  semiMajor: number;   // Radial spread (along radius)
  semiMinor: number;   // Angular spread in radians
  depth: number;       // Visual depth
}

// 18 Anatomically Placed Fuchs Crypts precisely matching the reference image:
// - Upper & right sectors (12:00 to 4:30): Crown of large teardrop cavities
// - Lower sector (5:00 to 7:00): Deep teardrop cavities with arched borders
// - Left sector (8:30 to 10:30): Veiled crypt cavities beneath the cyan web
export const FUCHS_CRYPTS: CryptOpening[] = [
  // Upper sector (11:30 to 1:30)
  { angle: 1.15, radius: 0.63, semiMajor: 0.12, semiMinor: 0.075, depth: 0.08 },
  { angle: 1.40, radius: 0.59, semiMajor: 0.14, semiMinor: 0.070, depth: 0.09 },
  { angle: 1.65, radius: 0.64, semiMajor: 0.13, semiMinor: 0.080, depth: 0.08 },
  { angle: 1.90, radius: 0.60, semiMajor: 0.15, semiMinor: 0.075, depth: 0.09 },
  { angle: 2.15, radius: 0.66, semiMajor: 0.11, semiMinor: 0.065, depth: 0.07 },

  // Right / 3 o'clock sector (2:00 to 4:30)
  { angle: 0.20, radius: 0.60, semiMajor: 0.14, semiMinor: 0.080, depth: 0.09 },
  { angle: 0.48, radius: 0.65, semiMajor: 0.13, semiMinor: 0.075, depth: 0.08 },
  { angle: 0.78, radius: 0.59, semiMajor: 0.12, semiMinor: 0.070, depth: 0.08 },
  { angle: 5.92, radius: 0.62, semiMajor: 0.15, semiMinor: 0.085, depth: 0.09 },
  { angle: 5.60, radius: 0.58, semiMajor: 0.13, semiMinor: 0.075, depth: 0.08 },
  { angle: 5.35, radius: 0.66, semiMajor: 0.11, semiMinor: 0.065, depth: 0.07 },

  // Bottom sector (5:00 to 7:00)
  { angle: 4.30, radius: 0.64, semiMajor: 0.14, semiMinor: 0.080, depth: 0.09 },
  { angle: 4.60, radius: 0.58, semiMajor: 0.16, semiMinor: 0.085, depth: 0.10 },
  { angle: 4.88, radius: 0.63, semiMajor: 0.13, semiMinor: 0.080, depth: 0.09 },
  { angle: 5.15, radius: 0.60, semiMajor: 0.14, semiMinor: 0.075, depth: 0.08 },

  // Left / cyan sector (veiled crypts at 8:30 to 10:30)
  { angle: 2.75, radius: 0.59, semiMajor: 0.11, semiMinor: 0.065, depth: 0.06 },
  { angle: 3.14, radius: 0.55, semiMajor: 0.10, semiMinor: 0.060, depth: 0.06 },
  { angle: 3.55, radius: 0.61, semiMajor: 0.12, semiMinor: 0.070, depth: 0.07 },
];

function pseudoRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

// Calculate deflection force pushing fibers to flow around crypt openings
export function getCryptRepulsion(r: number, theta: number): {
  dr: number;
  dTheta: number;
  inCrypt: boolean;
  nearMargin: boolean;
} {
  let totalDr = 0;
  let totalDTheta = 0;
  let inCrypt = false;
  let nearMargin = false;

  for (const crypt of FUCHS_CRYPTS) {
    const dR = (r - crypt.radius) / crypt.semiMajor;
    let dAng = theta - crypt.angle;
    while (dAng > Math.PI) dAng -= Math.PI * 2;
    while (dAng < -Math.PI) dAng += Math.PI * 2;
    const dTh = dAng / crypt.semiMinor;

    const dSq = dR * dR + dTh * dTh;
    if (dSq < 0.92) {
      inCrypt = true;
    }
    if (dSq >= 0.82 && dSq <= 1.40) {
      nearMargin = true;
    }

    if (dSq < 2.4) {
      const force = Math.exp(-dSq * 1.4) * 0.11;
      const dist = Math.sqrt(dSq) + 1e-4;
      const normRad = dR / dist;
      const normAng = dTh / dist;

      totalDr += normRad * force * crypt.semiMajor;
      totalDTheta += normAng * force * crypt.semiMinor;
    }
  }

  return { dr: totalDr, dTheta: totalDTheta, inCrypt, nearMargin };
}

// ----------------------------------------------------------------------
// 1. Annular Stroma Foundation Bed Mesh
// ----------------------------------------------------------------------
export function createAnnularBedMesh(material: THREE.Material): THREE.Mesh {
  const innerRadius = 0.28;
  const outerRadius = 0.98;
  const radialSegments = 72;
  const thetaSegments = 256;

  const geometry = new THREE.RingGeometry(
    innerRadius,
    outerRadius,
    thetaSegments,
    radialSegments
  );

  const posAttr = geometry.attributes.position;
  const vertex = new THREE.Vector3();

  for (let i = 0; i < posAttr.count; i++) {
    vertex.fromBufferAttribute(posAttr, i);
    const r = Math.sqrt(vertex.x * vertex.x + vertex.y * vertex.y);
    const theta = Math.atan2(vertex.y, vertex.x);

    // Anatomical saucer curvature: recessed pupil (-0.05), raised collarette ridge at r=0.52
    let z = -0.048 * (1.0 - Math.min(Math.max((r - 0.28) / 0.42, 0), 1));
    z += Math.exp(-Math.pow((r - 0.52) / 0.08, 2)) * 0.026;

    // Crypt depressions: sculpt cavernous hollows into the stroma bed
    for (const crypt of FUCHS_CRYPTS) {
      const dR = (r - crypt.radius) / crypt.semiMajor;
      let dAng = theta - crypt.angle;
      while (dAng > Math.PI) dAng -= Math.PI * 2;
      while (dAng < -Math.PI) dAng += Math.PI * 2;
      const dTh = dAng / crypt.semiMinor;
      const distSq = dR * dR + dTh * dTh;

      if (distSq < 1.5) {
        z -= Math.exp(-distSq * 1.5) * crypt.depth;
      }
    }

    // Outer limbus downward taper towards black background
    if (r > 0.92) {
      z -= Math.pow((r - 0.92) / 0.06, 2) * 0.028;
    }

    posAttr.setZ(i, z);
  }

  geometry.computeVertexNormals();
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = "AnnularStromaBed";
  return mesh;
}

// ----------------------------------------------------------------------
// 2. Primary Radial Trabecular Trunks (Layer 2: 3,000 major curving fibers)
// ----------------------------------------------------------------------
export function createPrimaryStrandsMesh(
  material: THREE.Material,
  count = 3000
): THREE.InstancedMesh {
  const segments = 12;
  const ribbonGeo = new THREE.PlaneGeometry(1, 1, 1, segments);

  const instGeo = new THREE.InstancedBufferGeometry();
  instGeo.index = ribbonGeo.index;
  instGeo.attributes.position = ribbonGeo.attributes.position;
  instGeo.attributes.uv = ribbonGeo.attributes.uv;

  const rootArr = new Float32Array(count * 3);
  const tipArr = new Float32Array(count * 3);
  const ctrlArr = new Float32Array(count * 3);
  const colorArr = new Float32Array(count * 3);
  const paramsArr = new Float32Array(count * 4);
  const seedArr = new Float32Array(count * 4);

  const innerR = 0.285;
  const outerR = 0.95; // Terminate cleanly inside limbal ring

  for (let i = 0; i < count; i++) {
    const s = i * 1.61803398875;
    const baseTheta = (i / count) * Math.PI * 2;
    const jitterTheta = (pseudoRandom(s) - 0.5) * (Math.PI / count) * 3.0;
    const rootTheta = baseTheta + jitterTheta;

    // Root starts right at the pupillary margin
    const rRoot = innerR + pseudoRandom(s + 1) * 0.015;
    const xRoot = Math.cos(rootTheta) * rRoot;
    const yRoot = Math.sin(rootTheta) * rRoot;
    const zRoot = -0.018 + pseudoRandom(s + 2) * 0.006;

    // Tip extends all the way to outer limbal boundary so fibers fade uniformly into limbal shadow
    const rTip = 0.935;
    const curl = (pseudoRandom(s + 4) - 0.48) * 0.12;
    const tipTheta = rootTheta + curl;
    const xTip = Math.cos(tipTheta) * rTip;
    const yTip = Math.sin(tipTheta) * rTip;
    const zTip = -0.022 - pseudoRandom(s + 5) * 0.008;

    // Mid control point with anatomical crypt deflection
    const midR = (rRoot + rTip) * 0.51 + (pseudoRandom(s + 6) - 0.5) * 0.05;
    const midTheta = rootTheta + curl * 0.46;
    const repulsion = getCryptRepulsion(midR, midTheta);
    const finalMidR = midR + repulsion.dr;
    const finalMidTheta = midTheta + repulsion.dTheta;

    const xCtrl = Math.cos(finalMidTheta) * finalMidR;
    const yCtrl = Math.sin(finalMidTheta) * finalMidR;

    // Elevate fibers that form the raised lips around crypts
    let zElevation = 0.006;
    if (repulsion.nearMargin) {
      zElevation = 0.028;
    } else if (repulsion.inCrypt) {
      zElevation = -0.030; // Drop into crypt cavity
    }
    const zCtrl = 0.015 + pseudoRandom(s + 7) * 0.015 + zElevation;

    const i3 = i * 3;
    rootArr[i3] = xRoot;
    rootArr[i3 + 1] = yRoot;
    rootArr[i3 + 2] = zRoot;

    tipArr[i3] = xTip;
    tipArr[i3 + 1] = yTip;
    tipArr[i3 + 2] = zTip;

    ctrlArr[i3] = xCtrl;
    ctrlArr[i3 + 1] = yCtrl;
    ctrlArr[i3 + 2] = zCtrl;

    // Biological Palette: Left cyan web vs warm honey-gold elsewhere
    let rCol = 0.94, gCol = 0.65, bCol = 0.22;
    const normAngle = ((rootTheta % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);

    if (normAngle >= 2.15 && normAngle <= 4.15) {
      const v = pseudoRandom(s + 8);
      if (v < 0.42) {
        // Luminous arctic cyan (#4bc2e8)
        rCol = 0.29; gCol = 0.76; bCol = 0.91;
      } else if (v < 0.72) {
        // Slate-teal trabecula (#1a566e)
        rCol = 0.10; gCol = 0.34; bCol = 0.43;
      } else if (v < 0.88) {
        // Deep ciliary teal (#092330)
        rCol = 0.04; gCol = 0.14; bCol = 0.19;
      } else {
        // Silvery ice highlight (#dcf0f8)
        rCol = 0.86; gCol = 0.94; bCol = 0.97;
      }
    } else {
      const v = pseudoRandom(s + 8);
      if (repulsion.nearMargin || v < 0.35) {
        // Molten honey-gold crest (#fbb634)
        rCol = 0.98; gCol = 0.71; bCol = 0.20;
      } else if (v < 0.68) {
        // Rich copper-amber (#d86818)
        rCol = 0.85; gCol = 0.41; bCol = 0.09;
      } else if (v < 0.88) {
        // Deep umber cord (#4a220a)
        rCol = 0.29; gCol = 0.13; bCol = 0.04;
      } else {
        // Interspersed teal filament (#164859)
        rCol = 0.09; gCol = 0.28; bCol = 0.35;
      }
    }

    colorArr[i3] = rCol;
    colorArr[i3 + 1] = gCol;
    colorArr[i3 + 2] = bCol;

    const i4 = i * 4;
    paramsArr[i4] = 0.0036 + pseudoRandom(s + 9) * 0.0016; // root width
    paramsArr[i4 + 1] = 0.0018 + pseudoRandom(s + 10) * 0.0010; // tip width
    paramsArr[i4 + 2] = zCtrl;
    paramsArr[i4 + 3] = 1.0;

    seedArr[i4] = pseudoRandom(s + 11);
    seedArr[i4 + 1] = pseudoRandom(s + 12);
    seedArr[i4 + 2] = 0.75 + pseudoRandom(s + 13) * 0.55;
    seedArr[i4 + 3] = i / count;
  }

  instGeo.setAttribute("instanceRoot", new THREE.InstancedBufferAttribute(rootArr, 3));
  instGeo.setAttribute("instanceTip", new THREE.InstancedBufferAttribute(tipArr, 3));
  instGeo.setAttribute("instanceControl", new THREE.InstancedBufferAttribute(ctrlArr, 3));
  instGeo.setAttribute("instanceColor", new THREE.InstancedBufferAttribute(colorArr, 3));
  instGeo.setAttribute("instanceParams", new THREE.InstancedBufferAttribute(paramsArr, 4));
  instGeo.setAttribute("instanceSeed", new THREE.InstancedBufferAttribute(seedArr, 4));

  const mesh = new THREE.InstancedMesh(instGeo, material, count);
  mesh.name = "PrimaryStrands";
  mesh.frustumCulled = false;
  return mesh;
}

// ----------------------------------------------------------------------
// 3. Microscopic Filaments & Dendritic Web (Layer 3: 14,000 delicate filaments)
// ----------------------------------------------------------------------
export function createMicroFilamentsMesh(
  material: THREE.Material,
  count = 14000
): THREE.InstancedMesh {
  const segments = 8;
  const ribbonGeo = new THREE.PlaneGeometry(1, 1, 1, segments);

  const instGeo = new THREE.InstancedBufferGeometry();
  instGeo.index = ribbonGeo.index;
  instGeo.attributes.position = ribbonGeo.attributes.position;
  instGeo.attributes.uv = ribbonGeo.attributes.uv;

  const rootArr = new Float32Array(count * 3);
  const tipArr = new Float32Array(count * 3);
  const ctrlArr = new Float32Array(count * 3);
  const colorArr = new Float32Array(count * 3);
  const paramsArr = new Float32Array(count * 4);
  const seedArr = new Float32Array(count * 4);

  const innerR = 0.285;

  for (let i = 0; i < count; i++) {
    const s = i * 2.7182818284;
    const category = i / count;

    let r1: number, r2: number;
    let theta1: number, theta2: number;
    let z1: number, z2: number, zCtrl: number;
    let rCol = 0.85, gCol = 0.55, bCol = 0.20;
    let widthRoot = 0.0018, widthTip = 0.0009;

    if (category < 0.48) {
      // Group 1: 9 o'clock sector Dendritic Web (Lace mesh of cyan & silver filaments)
      theta1 = 2.15 + pseudoRandom(s) * 2.05;
      r1 = 0.32 + pseudoRandom(s + 1) * 0.44;

      const isCrossBridge = pseudoRandom(s + 2) < 0.52;
      if (isCrossBridge) {
        // Cross-connecting bridge spanning adjacent radial trunks
        const deltaTheta = (pseudoRandom(s + 3) - 0.5) * 0.15;
        theta2 = theta1 + deltaTheta;
        r2 = r1 + (pseudoRandom(s + 4) - 0.45) * 0.07;
      } else {
        // Branching radiating daughter filament
        const deltaTheta = (pseudoRandom(s + 3) - 0.5) * 0.07;
        theta2 = theta1 + deltaTheta;
        r2 = r1 + 0.10 + pseudoRandom(s + 4) * 0.18;
      }

      r1 = Math.max(0.29, Math.min(0.94, r1));
      r2 = Math.max(0.29, Math.min(0.94, r2));

      z1 = 0.003 + pseudoRandom(s + 5) * 0.020;
      z2 = 0.003 + pseudoRandom(s + 6) * 0.020;
      zCtrl = 0.014 + pseudoRandom(s + 7) * 0.025;

      const cv = pseudoRandom(s + 8);
      if (cv < 0.46) {
        rCol = 0.35; gCol = 0.78; bCol = 0.92; // Luminous icy blue
      } else if (cv < 0.78) {
        rCol = 0.88; gCol = 0.94; bCol = 0.98; // Silvery frost
      } else if (cv < 0.91) {
        rCol = 0.13; gCol = 0.40; bCol = 0.50; // Slate-cyan
      } else {
        rCol = 0.03; gCol = 0.12; bCol = 0.16; // Deep teal shadow
      }

      widthRoot = 0.0016 + pseudoRandom(s + 9) * 0.0009;
      widthTip = 0.0008 + pseudoRandom(s + 10) * 0.0005;

    } else if (category < 0.78) {
      // Group 2: Outer Ciliary Zone Micro-Filaments (r in [0.55, 0.95])
      theta1 = pseudoRandom(s) * Math.PI * 2;
      r1 = 0.55 + pseudoRandom(s + 1) * 0.22;
      r2 = r1 + 0.09 + pseudoRandom(s + 2) * 0.16;
      r2 = Math.min(0.95, r2);

      const curl = (pseudoRandom(s + 3) - 0.5) * 0.06;
      theta2 = theta1 + curl;

      z1 = 0.005 + pseudoRandom(s + 5) * 0.015;
      z2 = -0.014 + pseudoRandom(s + 6) * 0.008;
      zCtrl = 0.010 + pseudoRandom(s + 7) * 0.015;

      const normAng = ((theta1 % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
      if (normAng >= 2.15 && normAng <= 4.15) {
        rCol = 0.30; gCol = 0.68; bCol = 0.82;
      } else {
        const cv = pseudoRandom(s + 8);
        if (cv < 0.56) {
          rCol = 0.96; gCol = 0.68; bCol = 0.22; // Amber gold
        } else if (cv < 0.85) {
          rCol = 0.80; gCol = 0.38; bCol = 0.10; // Copper
        } else {
          rCol = 0.11; gCol = 0.30; bCol = 0.38; // Slate accent
        }
      }

      widthRoot = 0.0017 + pseudoRandom(s + 9) * 0.0009;
      widthTip = 0.0009 + pseudoRandom(s + 10) * 0.0005;

    } else {
      // Group 3: Dense Pupillary Zone Filaments (r in [0.285, 0.50])
      theta1 = pseudoRandom(s) * Math.PI * 2;
      r1 = innerR + pseudoRandom(s + 1) * 0.012;
      r2 = 0.36 + pseudoRandom(s + 2) * 0.13;
      const curl = (pseudoRandom(s + 3) - 0.5) * 0.035;
      theta2 = theta1 + curl;

      z1 = -0.016 + pseudoRandom(s + 5) * 0.006;
      z2 = 0.012 + pseudoRandom(s + 6) * 0.010;
      zCtrl = 0.002 + pseudoRandom(s + 7) * 0.008;

      const cv = pseudoRandom(s + 8);
      if (cv < 0.42) {
        rCol = 0.92; gCol = 0.60; bCol = 0.18; // Honey
      } else if (cv < 0.78) {
        rCol = 0.65; gCol = 0.28; bCol = 0.06; // Burnt copper
      } else {
        rCol = 0.24; gCol = 0.11; bCol = 0.03; // Deep melanin
      }

      widthRoot = 0.0015 + pseudoRandom(s + 9) * 0.0007;
      widthTip = 0.0011 + pseudoRandom(s + 10) * 0.0005;
    }

    const midR = (r1 + r2) * 0.5;
    const midTheta = (theta1 + theta2) * 0.5;
    const repulsion = getCryptRepulsion(midR, midTheta);

    const x1 = Math.cos(theta1) * r1;
    const y1 = Math.sin(theta1) * r1;
    const x2 = Math.cos(theta2) * r2;
    const y2 = Math.sin(theta2) * r2;

    const xCtrl = Math.cos(midTheta + repulsion.dTheta) * (midR + repulsion.dr);
    const yCtrl = Math.sin(midTheta + repulsion.dTheta) * (midR + repulsion.dr);

    const i3 = i * 3;
    rootArr[i3] = x1;
    rootArr[i3 + 1] = y1;
    rootArr[i3 + 2] = z1;

    tipArr[i3] = x2;
    tipArr[i3 + 1] = y2;
    tipArr[i3 + 2] = z2;

    ctrlArr[i3] = xCtrl;
    ctrlArr[i3 + 1] = yCtrl;
    ctrlArr[i3 + 2] = zCtrl + (repulsion.nearMargin ? 0.016 : 0.0);

    colorArr[i3] = rCol;
    colorArr[i3 + 1] = gCol;
    colorArr[i3 + 2] = bCol;

    const i4 = i * 4;
    paramsArr[i4] = widthRoot;
    paramsArr[i4 + 1] = widthTip;
    paramsArr[i4 + 2] = zCtrl;
    paramsArr[i4 + 3] = 2.0;

    seedArr[i4] = pseudoRandom(s + 11);
    seedArr[i4 + 1] = pseudoRandom(s + 12);
    seedArr[i4 + 2] = 0.45 + pseudoRandom(s + 13) * 0.50;
    seedArr[i4 + 3] = i / count;
  }

  instGeo.setAttribute("instanceRoot", new THREE.InstancedBufferAttribute(rootArr, 3));
  instGeo.setAttribute("instanceTip", new THREE.InstancedBufferAttribute(tipArr, 3));
  instGeo.setAttribute("instanceControl", new THREE.InstancedBufferAttribute(ctrlArr, 3));
  instGeo.setAttribute("instanceColor", new THREE.InstancedBufferAttribute(colorArr, 3));
  instGeo.setAttribute("instanceParams", new THREE.InstancedBufferAttribute(paramsArr, 4));
  instGeo.setAttribute("instanceSeed", new THREE.InstancedBufferAttribute(seedArr, 4));

  const mesh = new THREE.InstancedMesh(instGeo, material, count);
  mesh.name = "MicroFilaments";
  mesh.frustumCulled = false;
  return mesh;
}

// ----------------------------------------------------------------------
// 4. Trabecular Collarette Bridges & Arched Cords (Layer 4: 1,200 continuous cords)
// ----------------------------------------------------------------------
export function createCryptArchesMesh(
  material: THREE.Material
): THREE.InstancedMesh {
  // Rather than drawing an artificial closed loop of stitched dots around each hole,
  // Layer 4 builds the raised, arching biological cords of the collarette and crypt margins
  // that radiate outwards from the collarette and curve gracefully along the crypt flanks!
  const cordsPerCrypt = 64;
  const count = FUCHS_CRYPTS.length * cordsPerCrypt;

  const segments = 12;
  const ribbonGeo = new THREE.PlaneGeometry(1, 1, 1, segments);

  const instGeo = new THREE.InstancedBufferGeometry();
  instGeo.index = ribbonGeo.index;
  instGeo.attributes.position = ribbonGeo.attributes.position;
  instGeo.attributes.uv = ribbonGeo.attributes.uv;

  const rootArr = new Float32Array(count * 3);
  const tipArr = new Float32Array(count * 3);
  const ctrlArr = new Float32Array(count * 3);
  const colorArr = new Float32Array(count * 3);
  const paramsArr = new Float32Array(count * 4);
  const seedArr = new Float32Array(count * 4);

  let idx = 0;
  for (let c = 0; c < FUCHS_CRYPTS.length; c++) {
    const crypt = FUCHS_CRYPTS[c];

    for (let a = 0; a < cordsPerCrypt; a++) {
      const s = c * 300 + a * 3.14159;
      // Cord sweeps from inner collarette (r=0.48), flows around the left or right flank of the crypt,
      // and terminates in the outer ciliary zone (r=0.82)
      const side = a % 2 === 0 ? 1 : -1;
      const progress = a / cordsPerCrypt; // [0, 1]

      // Start at collarette ridge just inside the crypt
      const rootAngle = crypt.angle + side * (0.02 + progress * crypt.semiMinor * 0.95);
      const rRoot = 0.47 + pseudoRandom(s + 1) * 0.04;
      const xRoot = Math.cos(rootAngle) * rRoot;
      const yRoot = Math.sin(rootAngle) * rRoot;
      const zRoot = 0.018 + pseudoRandom(s + 2) * 0.008;

      // Outer tip fans out into ciliary zone
      const tipAngle = crypt.angle + side * (crypt.semiMinor * 1.15 + progress * 0.05);
      const rTip = crypt.radius + crypt.semiMajor * 1.05 + pseudoRandom(s + 3) * 0.08;
      const xTip = Math.cos(tipAngle) * Math.min(0.92, rTip);
      const yTip = Math.sin(tipAngle) * Math.min(0.92, rTip);
      const zTip = -0.005 - pseudoRandom(s + 4) * 0.010;

      // Mid control point tightly hugs the crypt rim with prominent elevation
      const midAngle = crypt.angle + side * (crypt.semiMinor * 1.12);
      const midR = crypt.radius + (progress - 0.5) * crypt.semiMajor * 0.6;
      const xCtrl = Math.cos(midAngle) * midR;
      const yCtrl = Math.sin(midAngle) * midR;
      const zCtrl = 0.034 + pseudoRandom(s + 5) * 0.012; // Raised golden rim

      const i3 = idx * 3;
      rootArr[i3] = xRoot;
      rootArr[i3 + 1] = yRoot;
      rootArr[i3 + 2] = zRoot;

      tipArr[i3] = xTip;
      tipArr[i3 + 1] = yTip;
      tipArr[i3 + 2] = zTip;

      ctrlArr[i3] = xCtrl;
      ctrlArr[i3 + 1] = yCtrl;
      ctrlArr[i3 + 2] = zCtrl;

      // Color: Rich honey-gold and molten amber cords, with icy cyan in the 9 o'clock sector
      const normAng = ((crypt.angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
      if (normAng >= 2.15 && normAng <= 4.15) {
        colorArr[i3] = 0.36;
        colorArr[i3 + 1] = 0.80;
        colorArr[i3 + 2] = 0.94; // Ice-cyan cord
      } else {
        colorArr[i3] = 0.98;
        colorArr[i3 + 1] = 0.73;
        colorArr[i3 + 2] = 0.22; // Molten honey-gold
      }

      const i4 = idx * 4;
      paramsArr[i4] = 0.0038 + pseudoRandom(s + 6) * 0.0010;
      paramsArr[i4 + 1] = 0.0022 + pseudoRandom(s + 7) * 0.0008;
      paramsArr[i4 + 2] = zCtrl;
      paramsArr[i4 + 3] = 3.0;

      seedArr[i4] = pseudoRandom(s + 8);
      seedArr[i4 + 1] = pseudoRandom(s + 9);
      seedArr[i4 + 2] = 0.85;
      seedArr[i4 + 3] = idx / count;

      idx++;
    }
  }

  instGeo.setAttribute("instanceRoot", new THREE.InstancedBufferAttribute(rootArr, 3));
  instGeo.setAttribute("instanceTip", new THREE.InstancedBufferAttribute(tipArr, 3));
  instGeo.setAttribute("instanceControl", new THREE.InstancedBufferAttribute(ctrlArr, 3));
  instGeo.setAttribute("instanceColor", new THREE.InstancedBufferAttribute(colorArr, 3));
  instGeo.setAttribute("instanceParams", new THREE.InstancedBufferAttribute(paramsArr, 4));
  instGeo.setAttribute("instanceSeed", new THREE.InstancedBufferAttribute(seedArr, 4));

  const mesh = new THREE.InstancedMesh(instGeo, material, count);
  mesh.name = "CryptTrabecularArches";
  mesh.frustumCulled = false;
  return mesh;
}


// ----------------------------------------------------------------------
// 5. Anatomical Corneoscleral Limbal Shroud (Smooth Circular Boundary)
// ----------------------------------------------------------------------
export function createLimbalShroudMesh(): THREE.Mesh {
  const geometry = new THREE.RingGeometry(0.70, 1.05, 256, 16);
  const material = new THREE.ShaderMaterial({
    vertexShader: /* glsl */ `
      varying float vR;
      void main() {
        vR = length(position.xy);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      varying float vR;
      const vec3 BG_COLOR = vec3(0.01176, 0.01176, 0.01569);
      void main() {
        // Anatomical limbal vignette: transparent at r=0.72, rolls into deep black at r=0.88
        float alpha = smoothstep(0.72, 0.88, vR);
        gl_FragColor = vec4(BG_COLOR, alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = "LimbalShroud";
  mesh.renderOrder = 999;
  mesh.position.z = 0.05; // Positioned cleanly in front of outer fiber tips
  return mesh;
}
