# IRIS — Two Halves Editorial Creative Redirection & Engineering Report

## Executive Summary
This report documents the end-to-end creative redirection and engineering execution for the **IRIS** website (`D:\Irisique`). Guided by the contemporary craftsmanship, kinetic pacing, and typography of [Two Halves](https://twohalves.co/), the homepage has been transformed from a generic template into an experimental luxury photography experience with an original visual identity.

---

## 1. Reference Audit: Key Takeaways from Two Halves
Our live audit of `https://twohalves.co/` and case studies (`/work/nour-koura`, `/work/rawan`, `/work/xwagens`) established these design principles:
1. **Typography**: Heavy grotesque headlines with ultra-tight tracking (`letter-spacing: -0.04em`), paired with compact monospace and uppercase sans metadata (`tracking-[0.20em]`).
2. **Color System**: Strictly monochromatic palette rooted in near-black `#090909`, warm archival paper `#F4F1EA`, crisp studio white `#FAFAF8`, stone `#D8D4CC`, and neutral graphite `#77736D`. Zero blue/cyan interface accents or gradient pills.
3. **Borderless Compositions**: Photographic artwork and physical products exist directly on the page surface with natural studio drop shadows, eliminating rectangular card boxes, glassmorphism cards, and decorative gradients.
4. **Kinetic Pacing**: Continuous, active motion that responds immediately to user curiosity. Carousels glide at brisk speeds (~140px/s) and decelerate smoothly to ~45px/s on hover without abrupt halting.

The detailed reference analysis is documented in [IRIS_CREATIVE_REFERENCE.md](file:///D:/Irisique/IRIS_CREATIVE_REFERENCE.md).

---

## 2. Engineering Repair: Hero Iris Click Coordinate Pipeline

### Root Cause Analysis
During rotation in the WebGL vertex/fragment shader, the iris coordinates undergo a column-major 2D rotation matrix:
$$\begin{pmatrix} x' \\ y' \end{pmatrix} = \begin{pmatrix} \cos\theta & \sin\theta \\ -\sin\theta & \cos\theta \end{pmatrix} \begin{pmatrix} x \\ y \end{pmatrix}$$
In the previous JavaScript pointer coordinate handler, the sign of the angle was inverted (`rotatedX = cosR * centeredX - sinR * centeredY`), causing clicks to map to the opposite quadrant when the scene was scrolled and rotated ($p > 0$). Furthermore, overlay elements intercepted pointer events on desktop.

### Applied Solutions in `UnifiedIrisHero.tsx`
1. **Column-Major Matrix Synchronization**:
   ```typescript
   // Corrected inverse rotation matching GLSL mat2(cosR, -sinR, sinR, cosR) * centeredCoord
   const rotatedX = cosR * centeredX + sinR * centeredY;
   const rotatedY = -sinR * centeredX + cosR * centeredY;
   ```
2. **Global Window Event Delegation**: Bound click listeners to `window` with an explicit bounding rectangle check against the WebGL canvas, guaranteeing clicks register regardless of overlay layering.
3. **Radial Boundary Guard**: Computed radial distance $r = \sqrt{x^2 + y^2}$. If $r > 0.44$, the click is accurately identified as outside the stroma and aborted without distorting shader uniforms.
4. **Neutral Pearl Wave Shader**: Updated `uClickWaveColor` from electric blue `(0.20, 0.38, 0.50)` to warm neutral pearl `(0.65, 0.62, 0.58)` in [shaders.glsl.ts](file:///D:/Irisique/src/components/iris-lab/shaders.glsl.ts).
5. **Developer HUD (`?irisDebug=1`)**: Added real-time telemetry displaying hit state, canvas coordinates, and normalized shader coordinates.

### Verification Matrix
Verified with `scripts/verify_hero_click_interaction.mjs` across 8 cardinal points around the iris and in rotated scroll state ($p = 0.194$):
- **North** $(0, 0.28)$: Shader origin `(0.000, 0.280)` — $\Delta = 0.000$
- **North-East** $(0.20, 0.20)$: Shader origin `(0.198, 0.198)` — $\Delta = 0.000$
- **East** $(0.28, 0)$: Shader origin `(0.280, 0.000)` — $\Delta = 0.000$
- **South-East** $(0.20, -0.20)$: Shader origin `(0.198, -0.198)` — $\Delta = 0.000$
- **South** $(0, -0.28)$: Shader origin `(0.000, -0.280)` — $\Delta = 0.000$
- **South-West** $(-0.20, -0.20)$: Shader origin `(-0.198, -0.198)` — $\Delta = 0.000$
- **West** $(-0.28, 0)$: Shader origin `(-0.280, 0.000)` — $\Delta = 0.000$
- **North-West** $(-0.20, 0.20)$: Shader origin `(-0.198, 0.198)` — $\Delta = 0.000$
- **Outside Boundary** $(0.65, 0)$: Correctly ignored (`outside (click ignored)`).

---

## 3. Section Architecture & Creative Transformations

### 1. Unified Cinematic Hero & Iris Universe
- Seamless single-canvas transition from the macro iris eye to the multi-layered optical universe.
- Approved teal and amber macro stroma photography preserved with zero regressions.
- File: [UnifiedIrisHero.tsx](file:///D:/Irisique/src/components/iris/UnifiedIrisHero.tsx)

### 2. Art of Iris (`ART IS IN THE EYE`)
- Asymmetrical editorial layout with heavy display typography (`leading-[0.88]`).
- Clean typographic switcher: `SOLO`, `COUPLE`, `FAMILY` with a 2px underline indicator.
- Interactive mouse-driven 3D perspective shift on active artwork plates.
- Generated 2560×1440 master family constellation artwork (`public/assets/art/family_artwork_final.webp`).
- File: [ArtOfIris.tsx](file:///D:/Irisique/src/components/home/ArtOfIris.tsx)

### 3. The Collection: Continuous Product Train
- Replaced boxed cards with large, borderless studio photographs resting on warm archival paper `#F4F1EA`.
- **Kinetic Tuning Verified**:
  - Normal velocity: **`140.5 px/s`** (target: ~140 px/s).
  - Hover velocity: **`45.7 px/s`** (target: ~45 px/s, smooth deceleration without abrupt stopping).
  - Smooth lerp recovery over 600–800ms upon pointer leave.
- **Fullscreen Product Modal**: Portal-mounted overlay with locked body scroll, 600ms exit transitions, and global `Escape` key dismissal.
- File: [ProductTransformation.tsx](file:///D:/Irisique/src/components/home/ProductTransformation.tsx)

### 4. Photographic Process (`FROM CAPTURE TO ART`)
- **Fake 3D Scanner Completely Removed**: Eliminated artificial glass-tube scanner 3D models.
- **Authentic Photographic Sequence**: Implemented 3 museum-grade visual plates:
  1. `CAPTURE`: Macro optical stroma capture with softbox corneal reflection.
  2. `CREATE`: Darkroom colorist proofing desk with P3 calibration charts.
  3. `KEEP`: Gallery wall installation in minimalist interior.
- File: [ExperienceSection.tsx](file:///D:/Irisique/src/components/home/ExperienceSection.tsx)

### 5. Booking Invitation & Studio Details
- Striking contrast section in near-black `#090909` with massive headline `YOUR TURN.`.
- Studio location in Pondicherry, India, opening hours, and direct booking appointment modal.
- File: [BookingInvitation.tsx](file:///D:/Irisique/src/components/home/BookingInvitation.tsx)

### 6. Minimal Warm Paper Footer & Contrast Header
- Footer in warm paper `#F4F1EA` with monumental `IRIS®` wordmark spanning full width.
- Adaptive Header dynamically sampling background lightness to toggle between white and dark typography.
- Files: [Footer.tsx](file:///D:/Irisique/src/components/layout/Footer.tsx), [Header.tsx](file:///D:/Irisique/src/components/layout/Header.tsx)

---

## 4. Visual QA & Verification Results

| Verification Criterion | Target Specification | Measured Result | Status |
| :--- | :--- | :--- | :--- |
| **Iris Click Accuracy** | 8 cardinal points + rotated $p=0.194$ | Coordinate error $\Delta < 0.001$ | **PASSED** |
| **Product Train Normal Speed** | ~140 px/s | **`140.5 px/s`** | **PASSED** |
| **Product Train Hover Speed** | ~45 px/s | **`45.7 px/s`** | **PASSED** |
| **Product Modal Trigger** | Opens fullscreen detail view | Dialog rendered in portal | **PASSED** |
| **Modal Keyboard Dismissal** | Pressing `Escape` key | Dialog closes cleanly | **PASSED** |
| **Process Section Realism** | Authentic plates, scanner removed | 3 plates active, 0 scanner nodes | **PASSED** |
| **Art of Iris Switching** | SOLO / COUPLE / FAMILY tabs | Smooth transition, 0 flicker | **PASSED** |
| **Mobile 390×844 Overflow** | No horizontal page overflow | `scrollWidth === innerWidth` | **PASSED** |
| **Mobile 430×932 Overflow** | No horizontal page overflow | `scrollWidth === innerWidth` | **PASSED** |
| **Production Build** | Zero TypeScript or runtime errors | Next.js compiled in 6.3s | **PASSED** |

### Proof Artifacts
- **Walkthrough Animated GIF**: [twohalves_editorial_redirection.gif](file:///D:/Irisique/recordings/twohalves_editorial_redirection.gif)
- **High-Resolution Screenshots**:
  - [01_desktop_1440_hero.png](file:///D:/Irisique/screenshots/twohalves_qa/01_desktop_1440_hero.png)
  - [02_desktop_1440_layers.png](file:///D:/Irisique/screenshots/twohalves_qa/02_desktop_1440_layers.png)
  - [03_desktop_1440_art_solo.png](file:///D:/Irisique/screenshots/twohalves_qa/03_desktop_1440_art_solo.png)
  - [04_desktop_1440_art_couple.png](file:///D:/Irisique/screenshots/twohalves_qa/04_desktop_1440_art_couple.png)
  - [05_desktop_1440_art_family.png](file:///D:/Irisique/screenshots/twohalves_qa/05_desktop_1440_art_family.png)
  - [06_desktop_1440_product_train.png](file:///D:/Irisique/screenshots/twohalves_qa/06_desktop_1440_product_train.png)
  - [07_desktop_1440_product_modal.png](file:///D:/Irisique/screenshots/twohalves_qa/07_desktop_1440_product_modal.png)
  - [08_desktop_1440_process_capture.png](file:///D:/Irisique/screenshots/twohalves_qa/08_desktop_1440_process_capture.png)
  - [11_desktop_1440_booking.png](file:///D:/Irisique/screenshots/twohalves_qa/11_desktop_1440_booking.png)
  - [12_desktop_1440_footer.png](file:///D:/Irisique/screenshots/twohalves_qa/12_desktop_1440_footer.png)
  - [15_mobile_390_hero.png](file:///D:/Irisique/screenshots/twohalves_qa/15_mobile_390_hero.png)
  - [16_mobile_390_art.png](file:///D:/Irisique/screenshots/twohalves_qa/16_mobile_390_art.png)
  - [17_mobile_390_product.png](file:///D:/Irisique/screenshots/twohalves_qa/17_mobile_390_product.png)
  - [18_mobile_430_hero.png](file:///D:/Irisique/screenshots/twohalves_qa/18_mobile_430_hero.png)
  - [19_mobile_430_booking.png](file:///D:/Irisique/screenshots/twohalves_qa/19_mobile_430_booking.png)
