export const irisFragmentShader = /* glsl */ `
precision highp float;

varying vec2 vUv;
varying vec3 vPosition;

uniform float uTime;
uniform sampler2D uColorTexture;
uniform sampler2D uDetailTexture;
uniform sampler2D uHeightTexture;
uniform sampler2D uMaskTexture;
uniform vec2 uPointer;
uniform float uPointerVelocity;
uniform float uHoverStrength;
uniform float uRevealProgress;
uniform vec2 uRevealCenter;
uniform float uIntroProgress;
uniform float uScrollProgress;
uniform vec2 uResolution;
uniform float uReducedMotion;

// Exact pupil center from recreated anatomical reference
const vec2 IRIS_CENTER = vec2(0.4976, 0.4839);
const vec3 BG_COLOR = vec3(0.01176, 0.01176, 0.01569); // #030304

void main() {
  // 1. Biological breathing scale (7-9s cycle, scale 1.000 to 1.0035)
  float breathPhase = sin(uTime * 0.72) * 0.5 + 0.5;
  float breathScale = 1.0 + 0.0035 * breathPhase * (1.0 - uReducedMotion);
  
  vec2 uvBreathing = IRIS_CENTER + (vUv - IRIS_CENTER) / breathScale;

  // 2. Base mask sampling
  vec4 mask = texture2D(uMaskTexture, uvBreathing);
  float pupilMask = mask.r;
  float irisMask = mask.g;
  float cryptZoneMask = mask.b;
  float limbusAlpha = mask.a;

  // 3. Localized Pointer Interaction (Strictly nearby fiber structures only)
  vec2 ptrDelta = uvBreathing - uPointer;
  float ptrDist = length(ptrDelta);
  
  // Steep Gaussian falloff localized to ~7.5% radius (75px at 1000px diameter)
  float ptrWeight = exp(-pow(ptrDist / 0.048, 2.0)) * uHoverStrength;

  // 4. Sample fiber flow tangent vector from detail map
  vec4 detailRaw = texture2D(uDetailTexture, uvBreathing);
  vec2 flowTangent = normalize(detailRaw.rg * 2.0 - 1.0 + vec2(1e-5));

  // Anisotropic attraction: nearby fibers deflect strictly along their tangent orientation
  float fiberAlignment = dot(-ptrDelta, flowTangent);
  float velocityBonus = min(uPointerVelocity * 0.0025, 0.006);
  vec2 fiberPull = flowTangent * (fiberAlignment * 0.004 + velocityBonus * sign(fiberAlignment)) * ptrWeight;

  // 5. Independent Idle Micro-Motion:
  // Each fiber filament has an independent phase hash derived from local orientation & ridge height
  float fiberHash = fract(sin(dot(flowTangent, vec2(12.9898, 78.233)) + detailRaw.b * 17.13) * 43758.5453);
  float strandPhase = fiberHash * 6.2831853;
  
  // Three asynchronous non-commensurate frequencies per strand
  float f1 = sin(uTime * 0.68 + strandPhase) * 0.55;
  float f2 = cos(uTime * 0.42 + strandPhase * 1.618) * 0.35;
  float f3 = sin(uTime * 0.95 + dot(uvBreathing - IRIS_CENTER, flowTangent) * 40.0) * 0.10;
  
  // Independent fiber shifting along its natural cord direction (0.4 - 1.2px)
  float independentFiberDrift = (f1 + f2 + f3) * (0.0005 + detailRaw.b * 0.0006);
  vec2 idleDisplace = flowTangent * independentFiberDrift * irisMask * (1.0 - uReducedMotion);

  // Micro pupil reflex: tiny 1% contraction when pointer approaches pupil center
  float pupilCenterDist = length(uPointer - IRIS_CENTER);
  float pupilApproach = exp(-pow(pupilCenterDist / 0.15, 2.0)) * uHoverStrength;
  vec2 pupilReflexDisplace = normalize(uvBreathing - IRIS_CENTER + vec2(1e-5)) * (-0.0010 * pupilApproach * (1.0 - pupilMask));

  // Total displacement clamped and masked (pupil stays strictly still)
  vec2 totalDisplacement = (fiberPull * irisMask + idleDisplace + pupilReflexDisplace) * (1.0 - pupilMask);
  vec2 sampledUv = uvBreathing + totalDisplacement;

  // 6. Sample textures at displaced UVs
  vec4 colorSample = texture2D(uColorTexture, sampledUv);
  vec4 detailSample = texture2D(uDetailTexture, sampledUv);
  float heightSample = texture2D(uHeightTexture, sampledUv).r;

  // 7. Micro-Lighting & Highlights
  // Slow moving raking illumination field revealing microstructures
  float lightPhase = uTime * 0.16;
  vec2 lightDir = normalize(vec2(cos(lightPhase), sin(lightPhase)));
  float fiberLighting = pow(max(0.0, dot(flowTangent, lightDir)), 3.8) * detailSample.a * 0.26 * (1.0 - uReducedMotion);

  // Pointer-induced fiber illumination (only raised ridges directly under cursor catch raking light)
  float ptrHighlight = ptrWeight * pow(detailSample.b, 1.4) * detailSample.a * 0.45;

  // Localized subtle tone enhancement near cursor
  vec3 amberWarmth = vec3(0.12, 0.06, -0.02) * ptrWeight * cryptZoneMask;
  vec3 blueCoolness = vec3(-0.02, 0.04, 0.10) * ptrWeight * (irisMask - cryptZoneMask);

  // 8. Click Reveal Wavefront
  float clickDist = length(sampledUv - uRevealCenter);
  float waveFront = exp(-pow((clickDist - uRevealProgress * 0.75) / 0.07, 2.0));
  float revealEffect = waveFront * (1.0 - uRevealProgress * 0.8) * detailSample.a;
  vec3 revealTone = vec3(0.20, 0.16, 0.10) * revealEffect;

  // 9. Composite Color
  vec3 irisColor = colorSample.rgb;
  
  // Add specular and ridge highlights
  irisColor += vec3(fiberLighting + ptrHighlight) * (0.4 + detailSample.b * 0.8);
  irisColor += amberWarmth + blueCoolness + revealTone;

  // Ensure absolute black inside pupil
  irisColor *= (1.0 - pupilMask);

  // 10. Cinematic Macro Intro (pullback from microscopic fibers)
  float introExposure = smoothstep(0.0, 0.22, uIntroProgress);
  float introLightSweep = exp(-pow((length(uvBreathing - IRIS_CENTER) - (1.0 - uIntroProgress) * 0.5) / 0.12, 2.0)) * (1.0 - smoothstep(0.65, 1.0, uIntroProgress));
  irisColor = irisColor * introExposure + vec3(0.18, 0.32, 0.48) * introLightSweep * detailSample.a;

  // 11. Scroll transition into deep black pupil
  float scrollDarken = smoothstep(0.6, 0.98, uScrollProgress);
  irisColor = mix(irisColor, BG_COLOR, scrollDarken);

  // Blend with background at outer boundary
  vec3 finalColor = mix(BG_COLOR, irisColor, limbusAlpha * (1.0 - scrollDarken));

  gl_FragColor = vec4(finalColor, 1.0);
}
`;
