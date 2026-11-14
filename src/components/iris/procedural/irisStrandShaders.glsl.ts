export const irisStrandVertexShader = /* glsl */ `
precision highp float;

attribute vec3 instanceRoot;
attribute vec3 instanceTip;
attribute vec3 instanceControl;
attribute vec3 instanceColor;
attribute vec4 instanceParams; // x: widthRoot, y: widthTip, z: depthOffset, w: strandType
attribute vec4 instanceSeed;   // x: freq, y: phase, z: stiffness, w: id

uniform float uTime;
uniform vec3 uPointer3D;
uniform float uHoverStrength;
uniform float uPointerVelocity;
uniform float uRevealProgress;
uniform vec3 uRevealPoint3D;
uniform float uPauseAnimation;

varying vec3 vNormal;
varying vec3 vTangent;
varying vec3 vColor;
varying float vT;
varying float vDepth;
varying float vHover;
varying vec3 vWorldPos;
varying float vRadialDist;

void main() {
  float t = uv.y; // 0.0 at root, 1.0 at tip
  vT = t;
  vColor = instanceColor;
  vDepth = instanceParams.z;

  // 1. Quadratic Bezier curve along strand length
  float omt = 1.0 - t;
  vec3 curvePos = omt * omt * instanceRoot + 
                  2.0 * omt * t * instanceControl + 
                  t * t * instanceTip;

  // 2. Tangent vector along curve
  vec3 tangent = 2.0 * omt * (instanceControl - instanceRoot) + 
                 2.0 * t * (instanceTip - instanceControl);
  tangent = normalize(tangent + vec3(1e-5));
  vTangent = tangent;

  // 3. Binormal and Base Normal
  vec3 up = vec3(0.0, 0.0, 1.0);
  vec3 binormal = normalize(cross(tangent, up) + vec3(1e-5));
  vec3 normal = normalize(cross(binormal, tangent));

  // 4. Biological Idle Motion (Per-strand independent frequency and phase)
  vec3 idleOffset = vec3(0.0);
  if (uPauseAnimation < 0.5) {
    float freq = 0.50 + instanceSeed.x * 0.60;
    float phase = instanceSeed.y * 6.2831853;

    // Organic transverse ripple along filament
    float dispB = sin(uTime * freq + phase) * 0.0024;
    float dispN = cos(uTime * (freq * 0.8) + phase * 1.618) * 0.0018;

    // Boundary pinning: strictly 0 at root (pupil stays locked), flexible in mid-body
    float pinFactor = sin(t * 3.1415926) * instanceSeed.z;
    idleOffset = (binormal * dispB + normal * dispN) * pinFactor;
  }

  // 5. 3D Cursor Hover Interaction (Strictly local to nearby strands)
  vec3 toPtr = curvePos - uPointer3D;
  float distPtr = length(toPtr);
  
  // Localized radius (~9% of iris radius)
  float ptrWeight = exp(-pow(distPtr / 0.088, 2.0)) * uHoverStrength;
  vHover = ptrWeight;

  vec3 ptrOffset = vec3(0.0);
  if (ptrWeight > 0.001) {
    float bProj = dot(toPtr, binormal);
    float dispMag = (0.012 + min(uPointerVelocity * 0.008, 0.024)) * ptrWeight * sin(t * 3.1415926);
    ptrOffset = (binormal * sign(bProj) * 0.82 + normal * 0.42) * dispMag;
  }

  // 6. Click Reveal Wavefront
  vec3 revealOffset = vec3(0.0);
  if (uRevealProgress > 0.001 && uRevealProgress < 0.999) {
    float revDist = length(curvePos - uRevealPoint3D);
    float waveFront = exp(-pow((revDist - uRevealProgress * 1.35) / 0.08, 2.0)) * (1.0 - uRevealProgress);
    revealOffset = normal * (waveFront * 0.030 * sin(t * 3.1415926));
  }

  // Displaced center axis point
  vec3 finalCenter = curvePos + idleOffset + ptrOffset + revealOffset;

  // 7. Cylindrical Cross-Section & Natural Biological Taper
  float tipTaper = 1.0 - smoothstep(0.65, 1.0, t) * 0.50;
  float width = mix(instanceParams.x, instanceParams.y, t) * tipTaper;

  // Transverse cylindrical dome (position.x goes from -0.5 to 0.5)
  float normX = position.x * 2.0; // [-1.0, 1.0]
  float dome = sqrt(max(0.0, 1.0 - normX * normX));

  // Vertex position: expand along binormal and dome along normal
  vec3 vertexOffset = binormal * (position.x * width) + normal * (dome * width * 0.38);
  vec3 finalPos = finalCenter + vertexOffset;

  // True 3D rounded cylindrical normal
  vec3 filamentNormal = normalize(normal * dome + binormal * (normX * 0.85));
  vNormal = normalize(normalMatrix * filamentNormal);

  vRadialDist = length(finalPos.xy);
  vWorldPos = (modelMatrix * vec4(finalPos, 1.0)).xyz;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(finalPos, 1.0);
}
`;

export const irisStrandFragmentShader = /* glsl */ `
precision highp float;

varying vec3 vNormal;
varying vec3 vTangent;
varying vec3 vColor;
varying float vT;
varying float vDepth;
varying float vHover;
varying vec3 vWorldPos;
varying float vRadialDist;

uniform float uTime;
uniform float uDebugMode; // 0: Normal visual, 1: Geometry Only (Normals), 2: Disable Materials (Clay)

const vec3 BG_COLOR = vec3(0.01176, 0.01176, 0.01569); // #030304

void main() {
  // Strict anatomical circular bounds:
  // Central circular pupil aperture (r < 0.284) is pure void
  if (vRadialDist < 0.284) {
    discard;
  }
  // Outer circular limbal boundary (r > 0.825) terminates cleanly
  if (vRadialDist > 0.825) {
    discard;
  }

  vec3 N = normalize(vNormal);
  vec3 T = normalize(vTangent);

  // --- DEBUG MODES TO PROVE REAL PROCEDURAL 3D GEOMETRY ---
  if (uDebugMode > 0.5 && uDebugMode < 1.5) {
    // Mode 1: Geometry Only — Display actual 3D geometric normals across all cylindrical filaments
    gl_FragColor = vec4(N * 0.5 + 0.5, 1.0);
    return;
  } else if (uDebugMode > 1.5) {
    // Mode 2: Disable Materials (Clay Mode) — Scientific directional clay shading
    vec3 L = normalize(vec3(0.6, 0.8, 1.4));
    float diff = max(dot(N, L), 0.12);
    vec3 clay = vec3(0.72, 0.70, 0.68) * diff;
    clay *= (0.55 + 0.45 * sin(vT * 3.1415926));
    gl_FragColor = vec4(clay, 1.0);
    return;
  }

  // --- STANDARD HIGH-FIDELITY 3D BIOLOGICAL SCULPTURE ---

  // 1. Dual Light Sources (Oblique Raking Studio Key Light + Soft Fill)
  float lightAngle = uTime * 0.12 + 0.35;
  vec3 keyLightDir = normalize(vec3(cos(lightAngle) * 0.75 + 0.25, sin(lightAngle) * 0.75 + 0.35, 1.20));
  vec3 fillLightDir = normalize(vec3(-0.5, -0.6, 0.75));

  // Anisotropic strand shading (Kajiya-Kay hair model)
  float dotTL_key = dot(T, keyLightDir);
  float sinTL_key = sqrt(max(0.0, 1.0 - dotTL_key * dotTL_key));
  float diffuseKey = sinTL_key;

  float dotTL_fill = dot(T, fillLightDir);
  float sinTL_fill = sqrt(max(0.0, 1.0 - dotTL_fill * dotTL_fill));
  float diffuseFill = sinTL_fill * 0.32;

  float diffuse = diffuseKey * 0.85 + diffuseFill;

  // Specular sheen along curved cylindrical fibers
  vec3 viewDir = normalize(cameraPosition - vWorldPos);
  vec3 halfVecKey = normalize(keyLightDir + viewDir);
  float dotTH = dot(T, halfVecKey);
  float sinTH = sqrt(max(0.0, 1.0 - dotTH * dotTH));
  float specKey = pow(max(0.0, sinTH), 18.0) * 0.55;

  // Secondary soft specular sheen
  float specFill = pow(max(0.0, sinTH), 7.0) * 0.18;

  // Local pointer interaction highlight
  float ptrSpec = vHover * pow(max(0.0, sinTH), 9.0) * 0.75;

  // 2. Cavity and Depth Occlusion (Self-Shadowing)
  float depthOcclusion = clamp((vDepth + 0.08) / 0.15, 0.35, 1.0);
  
  // Subtle body shading
  float bodyCurve = sin(vT * 3.1415926);
  float endShadow = mix(0.45, 1.0, pow(bodyCurve, 0.28));

  // 3. Compose Rich Biological Pigmentation
  vec3 baseColor = vColor;
  
  // Dynamic glow on hover
  vec3 hoverBoost = mix(vec3(0.12, 0.06, -0.02), vec3(-0.02, 0.10, 0.16), step(0.5, baseColor.b));
  baseColor += hoverBoost * vHover;

  // Combine lighting components
  vec3 litColor = baseColor * (diffuse * 0.80 + 0.20) * depthOcclusion * endShadow;
  litColor += vec3(specKey + specFill + ptrSpec);

  // 4. Photographic Circular Boundary Fade (Seamless Limbal & Pupillary Transitions)
  // Limbal falloff: from r=0.70 to r=0.820, smoothly fades completely into black background (#030304)
  float limbalFade = 1.0 - smoothstep(0.70, 0.820, vRadialDist);
  // Pupillary ruff emergence: from r=0.284 to r=0.298, smoothly emerges from black pupil void
  float pupilFade = smoothstep(0.284, 0.298, vRadialDist);

  float edgeFade = limbalFade * pupilFade;
  vec3 finalColor = mix(BG_COLOR, litColor, edgeFade);

  gl_FragColor = vec4(finalColor, 1.0);
}
`;

export const irisBedVertexShader = /* glsl */ `
precision highp float;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorldPos;
varying float vRadialDist;
varying float vCryptDepth;

uniform float uTime;
uniform float uPauseAnimation;

void main() {
  vUv = uv;
  vec3 pos = position;

  vRadialDist = length(pos.xy);
  vCryptDepth = pos.z;

  vNormal = normalize(normalMatrix * normal);
  vWorldPos = (modelMatrix * vec4(pos, 1.0)).xyz;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

export const irisBedFragmentShader = /* glsl */ `
precision highp float;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorldPos;
varying float vRadialDist;
varying float vCryptDepth;

uniform float uTime;
uniform float uDebugMode;

const vec3 BG_COLOR = vec3(0.01176, 0.01176, 0.01569); // #030304

void main() {
  float r = vRadialDist;
  if (r < 0.284 || r > 0.825) {
    discard;
  }

  vec3 N = normalize(vNormal);

  // Debug Modes
  if (uDebugMode > 0.5 && uDebugMode < 1.5) {
    gl_FragColor = vec4(N * 0.5 + 0.5, 1.0);
    return;
  } else if (uDebugMode > 1.5) {
    vec3 L = normalize(vec3(0.6, 0.8, 1.4));
    float diff = max(dot(N, L), 0.15);
    gl_FragColor = vec4(vec3(0.55, 0.53, 0.52) * diff, 1.0);
    return;
  }

  // Procedural Deep Biological Stroma Bed Shading
  float angle = atan(vWorldPos.y, vWorldPos.x);

  // Base stroma pigment: deep dark chocolate/sepia stroma with slate undertone in cyan sector
  float normAngle = mod(angle + 6.2831853, 6.2831853);
  vec3 stromaWarm = vec3(0.065, 0.038, 0.014); // Dark chocolate sepia
  vec3 stromaCool = vec3(0.018, 0.052, 0.075); // Deep slate stroma

  float sectorBlend = smoothstep(2.0, 2.4, normAngle) * (1.0 - smoothstep(4.1, 4.5, normAngle));
  vec3 baseBedColor = mix(stromaWarm, stromaCool, sectorBlend);

  // Fine radial stroma contraction furrows
  float radialGroove = sin(angle * 120.0) * 0.06 + sin(angle * 240.0) * 0.03;
  baseBedColor += vec3(radialGroove * 0.015);

  // Crypt cavities: deep dark melanin void floors
  float cryptOcclusion = clamp((vCryptDepth + 0.035) / 0.045, 0.08, 1.0);
  vec3 litBed = baseBedColor * cryptOcclusion;

  // Soft directional shading
  vec3 L = normalize(vec3(0.5, 0.7, 1.2));
  float diff = max(dot(N, L), 0.22);
  litBed *= (diff * 0.7 + 0.3);

  // Pupillary ruff (pigment epithelium border) right at r in [0.284, 0.298]
  if (r < 0.298) {
    float ruff = smoothstep(0.284, 0.298, r);
    litBed = mix(BG_COLOR, litBed * 0.3, ruff);
  }

  // Smooth circular limbal fade at r in [0.70, 0.820] into #030304
  if (r > 0.70) {
    float limbalFade = 1.0 - smoothstep(0.70, 0.820, r);
    litBed = mix(BG_COLOR, litBed, limbalFade);
  }

  gl_FragColor = vec4(litBed, 1.0);
}
`;
