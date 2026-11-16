# IRIS — Creative Reference & Motion Analysis
## Benchmark: Two Halves (`twohalves.co`)

This document captures the verified creative craftsmanship, motion language, and editorial art direction of **Two Halves** (`https://twohalves.co/`) and its featured case studies (`/work/nour-koura`, `/work/rawan`, `/work/xwagens`), providing the design system benchmark for the IRIS complete creative redirection.

---

## 1. Verified Core Creative Principles

### A. Contemporary Grotesk & Editorial Scale
- **Display Headlines:** Bold, high-character typographic scale (53px–124px) with tightly calibrated tracking (`-0.03em` to `-0.04em`), treated as architectural design elements rather than plain labels.
- **Micro-copy & Metadata:** Set in compact, highly legible grotesk sans (11px–15px) at 400–500 weight with quiet line-heights.
- **Copy Discipline:** Extremely restrained copy. No repetitive marketing fluff. The typography integrates directly with the photography and negative space.

### B. Contrasting Spatial Atmosphere
- **Hero & Nocturnal States:** Deep Ink Black (`#090909`) creates mystery and focus on the central visual subject.
- **Editorial Paper States:** Warm Paper (`#F4F1EA`) and Soft Stone (`#D8D4CC`) transition the visitor into a tactile, museum-grade exhibition environment.
- **Clean Section Handoffs:** Background shifts are deliberate, architectural, and unhurried. No sudden cuts, no awkward black flash gaps.

### C. Rejection of the "Card Kit" (No Boxed UI)
- **Direct Layout Placement:** Imagery floats directly on the editorial background without rounded container rectangles, card outlines, or drop shadows.
- **Compositional Asymmetry:** Varied scale and asymmetric positioning create tension between oversized visuals and expansive whitespace.
- **Metadata Positioning:** Titles, specifications, and prices sit directly beneath or beside the imagery, separated strictly by whitespace.

### D. Flat Confident Buttons & Interaction
- **Primary Actions:** Confident flat rectangular or typographic blocks (White fill with Black text on dark backgrounds; Black fill with White text on light backgrounds).
- **Secondary Actions:** Typographic text links accompanied by directional arrows (`→` or `↗`) with subtle translate and underline hover mechanics. Zero pill buttons, zero gradient fills, zero glowing cyan borders.

---

## 2. Case Studies Analysis

### Case Study 1: Nour Koura (`twohalves.co/work/nour-koura`)
- **Key Insight:** Minimalist curation of visual art. Artwork is given massive breathing room. Captions are minimal and monospace-accented.
- **Application to IRIS:** In the **Art of Iris** section, the active composition (Solo, Couple, Family) occupies 55–65% of the viewport directly on Warm Paper, with restrained typographic switching controls.

### Case Study 2: Rawan (`twohalves.co/work/rawan`)
- **Key Insight:** Continuous fluid motion, seamless horizontal media pacing, and tactile deceleration upon user hover without jarring dead stops.
- **Application to IRIS:** In **The Collection**, the continuous product train glides right-to-left at an elevated base velocity (~140px/s) and smoothly decelerates on hover to ~45px/s with a 600–800ms easing recovery.

### Case Study 3: Xwagens (`twohalves.co/work/xwagens`)
- **Key Insight:** Connected scroll storytelling where technical processes are shown through cinematic authentic photography rather than fake 3D renders or generic icons.
- **Application to IRIS:** In **The Experience** (`FROM CAPTURE TO ART`), the artificial scanner render is replaced with a three-moment photographic sequence: `CAPTURE` (biometric optical macro), `CREATE` (colorist darkroom refinement), and `KEEP` (finished framed physical art).

---

## 3. IRIS Design Tokens Derived from Reference

| Token Name | Hex Value | Role & Usage |
| :--- | :--- | :--- |
| **Black** | `#090909` | Nocturnal hero stage, final booking invitation, high-contrast actions |
| **Paper** | `#F4F1EA` | Tactile warm background for Art of Iris and Product Collection |
| **White** | `#FAFAF8` | Pure highlights, primary dark-section button fill, crisp card accents |
| **Stone** | `#D8D4CC` | The Experience process background, subtle neutral dividers |
| **Neutral Grey** | `#77736D` | Subtitles, metadata, timestamps, non-active composition links |

---

## 4. Implementation Directives for IRIS

1. **Stage 1:** Fix the hero iris click interaction so clicks anywhere on the stroma trigger the optical impulse from that exact coordinate.
2. **Stage 2:** Enforce the `#090909` / `#F4F1EA` / `#FAFAF8` / `#D8D4CC` / `#77736D` palette across all components.
3. **Stage 3:** Standardize the 6-section homepage sequence.
4. **Stage 4:** Rebuild the artwork section as `ART IS IN THE EYE` (Solo / Couple / Family) with oversized borderless cropping and masked transitions.
5. **Stage 5:** Accelerate the continuous product train to ~140px/s, slowing to ~45px/s on hover, with edge-to-edge detail overlays.
6. **Stage 6:** Replace the fake scanner with the 3-moment photographic sequence: `CAPTURE`, `CREATE`, `KEEP`.
7. **Stage 7–10:** Polish responsive layout, adaptive header, and 60fps performance across mobile and desktop.
