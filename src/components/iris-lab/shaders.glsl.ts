// GLSL Shaders for /iris-lab — Cinematic Motion & Interaction Upgrade v2
// Refined per director's review:
// 1. Enlarge final iris to baseRadius 0.465 (93% viewport coverage with crisp circular framing)
// 2. Luminous presentation: lifted midtones, high fiber contrast, deep crypts, zero dark muddying
// 3. Directed opening (3.8s sequence): macro discovery -> exploration -> dramatic pullback -> settle -> living state
// 4. Visibly alive biological idle motion: 2.0-3.5px apparent fiber breathing along radial rays and crypt curves
// 5. Tactile cursor probe: clearly observable local fiber displacement (6-10px peak), 3D depth parallax, velocity boost
// 6. 100% stable pupil core (0px displacement) & stable outer limbal boundary

export const irisLabVertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

export const irisLabFragmentShader = /* glsl */ `
  precision highp float;

  uniform sampler2D uColorTex;
  uniform sampler2D uHeightTex;
  uniform sampler2D uMaskTex;
  uniform sampler2D uMacroTex;
  uniform float uTime;
  uniform float uIntroProgress;    // 0 = macro start, 1 = fully settled living state
  uniform float uIntroZoom;        // camera zoom factor (5.2 -> 1.0)
  uniform vec2 uCameraTarget;      // camera focus point in iris space ((-0.16, 0.20) -> (0,0))
  uniform vec2 uScreenPointer;     // cursor position in isometric screen coordinates
  uniform float uPointerActive;    // 0..1 smooth hover intensity with natural decay
  uniform float uPointerVelocity;  // smoothed cursor velocity
  uniform vec2 uResolution;
  uniform float uScrollProgress;   // scroll zoom progress
  uniform float uScrollRotation;   // scroll-driven rotation in radians
  uniform vec2 uIrisOffset;        // scroll-driven screen position offset (x, y)
  uniform float uIrisScale;         // scroll-driven scale multiplier (default 1.0)
  uniform float uReducedMotion;    // 1 = prefers-reduced-motion
  uniform float uClickProgress;    // 0..1 click impulse
  uniform vec2 uClickOrigin;       // click origin in texture space

  varying vec2 vUv;

  // ─── Fast Simplex Noise for Biological Micro-Motion ───
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
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m * m;
    m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  void main() {
    float aspect = uResolution.x / uResolution.y;

    // ─── 1. Isometric Screen Coordinates (Preserves Circular Form) ───
    vec2 screenCoord = vUv - 0.5;
    if (aspect >= 1.0) {
      screenCoord.x *= aspect;
    } else {
      screenCoord.y /= aspect;
    }

    // Iris position offset in screen coordinates (e.g. shifts right side in next section)
    vec2 centeredCoord = screenCoord - uIrisOffset;

    // Scroll-driven forward rotation (clockwise as user scrolls down)
    float cosR = cos(-uScrollRotation);
    float sinR = sin(-uScrollRotation);
    mat2 rotMatrix = mat2(cosR, -sinR, sinR, cosR);
    vec2 rotatedCoord = rotMatrix * centeredCoord;

    // Iris size framing: radius 0.465, modulated by uIrisScale
    float baseRadius = 0.465;
    float currentScale = max(uIrisScale, 0.05);
    vec2 irisNormalized = rotatedCoord / (baseRadius * 2.0 * currentScale);

    // ─── 2. Camera Transformations (Intro Zoom, Pullback & Depth) ───
    float totalZoom = uIntroZoom;

    // Texture UV mapping centered at (0.5, 0.5) + animated camera target focus
    vec2 texCoord = (irisNormalized / totalZoom) + 0.5 + uCameraTarget;

    // Polar coordinates from pupil center
    vec2 fromCenter = texCoord - 0.5;
    float r = length(fromCenter);
    float angle = atan(fromCenter.y, fromCenter.x);
    vec2 radialDir = r > 0.0001 ? fromCenter / r : vec2(0.0);

    // ─── 3. Anatomical Stability Mask (Pupil & Limbus 100% Stable) ───
    // Pupil core (r < 0.14) has EXACTLY 0.0 displacement.
    // Inner collarette ramps smoothly from 0.0 to 1.0 in [0.14, 0.22].
    // Active trabecular stroma in [0.22, 0.46] has full biological movement.
    // Outer limbal boundary ramps down to 0.0 in [0.46, 0.50] (silhouette never wobbles).
    float fiberZone = smoothstep(0.14, 0.22, r) * smoothstep(0.50, 0.46, r);

    // Sample height map for surface ridges and 3D normals
    float texel = 1.0 / 2048.0;
    float baseHeight = texture2D(uHeightTex, clamp(texCoord, 0.001, 0.999)).r;
    float hL = texture2D(uHeightTex, clamp(texCoord - vec2(texel, 0.0), 0.001, 0.999)).r;
    float hR = texture2D(uHeightTex, clamp(texCoord + vec2(texel, 0.0), 0.001, 0.999)).r;
    float hD = texture2D(uHeightTex, clamp(texCoord - vec2(0.0, texel), 0.001, 0.999)).r;
    float hU = texture2D(uHeightTex, clamp(texCoord + vec2(0.0, texel), 0.001, 0.999)).r;
    vec3 surfaceNormal = normalize(vec3((hL - hR) * 3.5, (hD - hU) * 3.5, 1.0));
    vec2 contourTangent = vec2(-surfaceNormal.y, surfaceNormal.x);

    // ─── 4. Part 2: Visibly Alive Biological Fibre Motion ───
    float motionTime = uReducedMotion > 0.5 ? 0.0 : uTime;

    // Distinct sector phase groups (sectors contract/relax asynchronously)
    float sector = floor(angle * 12.0);
    float sectorPhase = snoise(vec2(sector * 0.45, 1.8)) * 3.14159;

    // Visibly alive radial breathing (target ~1.8–3.2px at 1000px diameter)
    // 0.0018 to 0.0032 in UV units
    float b1 = sin(motionTime * 0.85 + sectorPhase + r * 14.0);
    float b2 = sin(motionTime * 1.45 + angle * 5.0 + r * 8.0);
    float b3 = sin(motionTime * 0.45 - r * 6.0);
    float radialDisplacement = (b1 * 0.0013 + b2 * 0.0008 + b3 * 0.0011) * fiberZone;

    // Crypt contour ridge flex (tangential motion along curving collagen arches) ~1.0px
    float ridgeMotion = snoise(texCoord * 16.0 + vec2(motionTime * 0.35, 0.0)) * 0.0010 * baseHeight * fiberZone;

    // Depth-aware parallax shift: raised ridges shift relative to recessed crypts
    vec2 depthParallax = surfaceNormal.xy * (baseHeight - 0.45) * 0.0012 * fiberZone;

    vec2 idleDisp = radialDir * radialDisplacement + contourTangent * ridgeMotion + depthParallax;

    // ─── 5. Part 3: Clearly Observable Tactile Cursor Interaction ───
    vec2 cursorDisp = vec2(0.0);
    float cursorIllum = 0.0;
    float cursorSpecHighlight = 0.0;

    if (uPointerActive > 0.001) {
      // Map screen pointer accurately into rotated, offset, and scaled iris UV space
      vec2 pointerCentered = uScreenPointer - uIrisOffset;
      vec2 pointerRotated = rotMatrix * pointerCentered;
      vec2 cursorIrisNorm = pointerRotated / (baseRadius * 2.0 * currentScale);
      vec2 cursorTexUV = (cursorIrisNorm / totalZoom) + 0.5 + uCameraTarget;
      float distToCursor = length(texCoord - cursorTexUV);

      // Localized influence field: affected area ~130px diameter (0.13 UV radius)
      float probeRadius = 0.13;
      float cursorFactor = smoothstep(probeRadius, 0.0, distToCursor) * uPointerActive * fiberZone;

      if (cursorFactor > 0.001) {
        // Physical deformation follows anatomical fiber direction + crypt contour
        vec2 fiberOrientation = normalize(radialDir + contourTangent * (baseHeight - 0.4) * 0.8 + 0.0001);

        // Velocity modulation: faster cursor increases deformation up to 1.6x
        float velFactor = 1.0 + clamp(uPointerVelocity * 0.30, 0.0, 0.60);

        // Target: 6–10px clearly observable deformation at cursor center
        // 0.0060 to 0.0095 in UV space
        float dispMagnitude = cursorFactor * 0.0075 * velFactor * (baseHeight * 0.7 + 0.3);
        cursorDisp = fiberOrientation * dispMagnitude;

        // 3D local depth push (fibers pop forward toward viewer)
        vec2 toCursorNorm = normalize((texCoord - cursorTexUV) + 0.0001);
        cursorDisp += toCursorNorm * cursorFactor * (baseHeight - 0.4) * 0.0040;

        // 3D Point Light for optical probe illumination
        vec3 lightPos3D = vec3(uScreenPointer, 0.15);
        vec3 surfacePos3D = vec3(screenCoord, baseHeight * 0.04);
        vec3 toCursorLight = normalize(lightPos3D - surfacePos3D);

        float cursorDiffuse = max(dot(surfaceNormal, toCursorLight), 0.0);
        vec3 viewDir = vec3(0.0, 0.0, 1.0);
        vec3 halfCursor = normalize(toCursorLight + viewDir);
        cursorSpecHighlight = pow(max(dot(surfaceNormal, halfCursor), 0.0), 28.0) * baseHeight * cursorFactor;

        cursorIllum = cursorFactor * (cursorDiffuse * 0.45 + 0.18);
      }
    }

    // ─── 6. Click Optical Exposure Wave ───
    vec2 clickDisp = vec2(0.0);
    float clickExposure = 0.0;

    if (uClickProgress > 0.001 && uClickProgress < 1.0) {
      float distToClick = length(texCoord - uClickOrigin);
      float waveFront = uClickProgress * 0.35;
      float waveThickness = 0.045;
      float wave = exp(-pow((distToClick - waveFront) / waveThickness, 2.0));
      float waveDecay = (1.0 - uClickProgress);

      // Local exposure flare along collagen ridges (not a flat water ripple)
      clickExposure = wave * waveDecay * baseHeight * 0.75;
      clickDisp = radialDir * (wave * waveDecay * 0.0035 * fiberZone);
    }

    // ─── 7. Final Displaced Texture Coordinates ───
    vec2 finalUV = texCoord + idleDisp + cursorDisp + clickDisp;
    finalUV = clamp(finalUV, 0.001, 0.999);

    // ─── 8. Multi-Scale Texture Sampling (Razor-Sharp Macro Continuity) ───
    vec4 masterColor = texture2D(uColorTex, finalUV);
    float height = texture2D(uHeightTex, finalUV).r;
    float mask = texture2D(uMaskTex, finalUV).a;

    // Macro texture blending: injects ultra-fine collagen fibrils during zoom > 1.8
    float macroBlend = smoothstep(1.5, 3.6, totalZoom);
    if (macroBlend > 0.01) {
      vec2 macroUV = fract(finalUV * 3.4);
      vec4 macroSample = texture2D(uMacroTex, macroUV);
      vec3 detailedColor = mix(masterColor.rgb, masterColor.rgb * (macroSample.rgb * 1.35 + 0.32), 0.52);
      masterColor.rgb = mix(masterColor.rgb, detailedColor, macroBlend * 0.65);
    }

    // Surface normal at displaced coordinates
    float hL_f = texture2D(uHeightTex, finalUV - vec2(texel, 0.0)).r;
    float hR_f = texture2D(uHeightTex, finalUV + vec2(texel, 0.0)).r;
    float hD_f = texture2D(uHeightTex, finalUV - vec2(0.0, texel)).r;
    float hU_f = texture2D(uHeightTex, finalUV + vec2(0.0, texel)).r;
    vec3 finalNormal = normalize(vec3((hL_f - hR_f) * 3.5, (hD_f - hU_f) * 3.5, 1.0));

    // ─── 9. Part 4: Luminous Presentation & Living Illumination ───
    // Lift midtones and increase fiber contrast without crushing dark crypts
    vec3 fiberColor = masterColor.rgb;
    // Tone curve: lift vibrancy and richness
    fiberColor = pow(fiberColor, vec3(0.92));
    // High-frequency structural contrast: raised collagen catches light, crypts stay deep
    fiberColor *= (0.88 + height * 0.38);

    // Oblique orbital keylight + subtle scroll-linked lighting shift
    float lightOrbit = motionTime * 0.22 + uScrollRotation * 0.45;
    vec3 keyLightDir = normalize(vec3(cos(lightOrbit), sin(lightOrbit), 0.65));
    float nDotL = max(dot(finalNormal, keyLightDir), 0.0);

    // Specular highlights on wet collagen filaments
    vec3 eyeDir = vec3(0.0, 0.0, 1.0);
    vec3 halfVecKey = normalize(keyLightDir + eyeDir);
    float keySpec = pow(max(dot(finalNormal, halfVecKey), 0.0), 24.0) * height * 0.40;

    // Ambient lighting: keeps base luminosity bright and crisp
    vec3 keyColor = vec3(1.05, 1.03, 0.99);
    vec3 rimColor = vec3(0.35, 0.75, 0.92) * 0.38;
    vec3 livingLight = keyColor * (nDotL * 0.32 + 0.88) + rimColor * (1.0 - finalNormal.z);

    // ─── 10. Part 1: Directed 3.8s Cinematic Opening ───
    // Fast initial fade from pitch black in 0.30s
    float initialFade = smoothstep(0.0, 0.07, uIntroProgress);

    // Sweeping directional keylight during opening reveal
    float sweepAngle = mix(-2.6, 4.2, smoothstep(0.05, 0.80, uIntroProgress));
    float sweepLight = smoothstep(-0.4, 0.85, cos(angle - sweepAngle));
    float introIntensity = mix(sweepLight * 0.50 + 0.40, 1.0, smoothstep(0.28, 0.82, uIntroProgress));

    // ─── 11. Final Color Composition ───
    vec3 shadedColor = fiberColor * livingLight + vec3(keySpec);

    // Cursor microscopic probe illumination & specular glint
    if (cursorIllum > 0.001) {
      vec3 beamColor = vec3(1.15, 1.10, 1.02);
      shadedColor += fiberColor * cursorIllum * 0.48 * beamColor;
      shadedColor += vec3(cursorSpecHighlight * 0.70);
    }

    // Click optical exposure flare
    if (clickExposure > 0.001) {
      vec3 flashColor = vec3(1.28, 1.20, 1.08);
      shadedColor += flashColor * clickExposure * 0.65;
    }

    // Apply intro sweep illumination and initial fade
    shadedColor *= introIntensity;

    // Limbal boundary vignette (outer iris edge)
    float limbusR = length(texCoord - 0.5);
    float limbalVignette = smoothstep(0.505, 0.475, limbusR);

    // Deep black pupil core (r < 0.14)
    float pupilCutout = smoothstep(0.125, 0.145, limbusR);

    // Soften outer boundary during extreme macro zoom so we don't clip
    float macroZoomFactor = smoothstep(1.5, 3.8, totalZoom);
    limbalVignette = mix(limbalVignette, 1.0, macroZoomFactor * 0.85);

    // Composite alpha over pitch black background (#030304)
    float finalAlpha = mask * limbalVignette * pupilCutout * initialFade;
    vec3 backgroundColor = vec3(0.01176, 0.01176, 0.01569);
    vec3 finalOutput = mix(backgroundColor, shadedColor, finalAlpha);

    // Subtle microscopic film grain
    float grain = (snoise(gl_FragCoord.xy * 0.35 + motionTime * 110.0) * 0.5 + 0.5) * 0.007;
    finalOutput += grain * (1.0 - smoothstep(0.0, 0.5, finalAlpha));

    gl_FragColor = vec4(finalOutput, 1.0);
  }
`;
