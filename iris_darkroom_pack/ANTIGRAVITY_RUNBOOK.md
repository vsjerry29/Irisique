# IRIS / Antigravity execution runbook

**How to use**: put this entire folder next to or inside the repo. Paste the **Boot prompt** below into Antigravity. Tell it the exact folder path if needed. After each stage, assess actual preview/screenshots before moving to the next stage. Antigravity should modify **your existing repository**, not replace it with a new unrelated starter.

## Boot prompt — paste this first

> You're the senior creative technologist and art director responsible for upgrading my existing IRIS photography landing page. The current implementation is generic and unacceptable. **Your source of truth is the supplied `CREATIVE_SPEC.md`, `ASSETS.md`, and `index.html` visual prototype.** Read them in full before modifying the code. Inspect the current repo and dependencies. We are building **THE LIVING DARKROOM**, an art-directed interactive photographic environment; do not reuse the previous black/gold/serif template or create a spinning iris sphere. Use current site infrastructure where sensible. Create a numbered todo/implementation plan reflecting the stages below, and execute stage by stage. The deliverable is real working code, screenshots at specified viewports, and a production build—not a generic description or an unverified claim. If you cannot access image generation, say so and use the included demonstration iris as the source plate, then document higher-resolution asset requirements. **Start with Stage 0 and Stage 1 and implement the hero; do not build generic filler below the fold.**

### Stage 0 — Repo inspection, 1 short status report, no redesign yet

- Identify Next.js/React versions and App Router layout, package scripts, CSS framework and animation libraries.
- Locate the existing home page and every old hero, gallery, image and CTA implementation. Record deletions/replacements needed.
- Check that `public/` assets are available and whether any real iris customer photographs are supplied; do not assume permission.
- Record whether image generation, browser automation, and screenshot inspection tools are available in the Antigravity environment.
- Produce a precise file-change map; avoid unnecessary dependencies and broad destructive rewrites.
- If no repo found, then initialise a clean Next.js + TypeScript app. Otherwise **never reinitialise**.

**Gate 0 output**: existing stack + planned changed files + asset availability + test capabilities. Begin next stage in the same session when safe.

### Stage 1 — Perfect first screen (VISUAL GATE)

Build the hero with *actual pixels* that match the supplied visual composition, not a generic reinterpretation. Use the prototype's `LOOK / CLOSER.` typographic treatment and large art-directed crop. Implement separate desktop/mobile image art direction. Place nav, index details, reveal control and CTA with exact hierarchy.

Use the included image as a temporary concept plate, but try to create a 2500px+ high-resolution iris master if image generation or photo assets are available. Never replace it with a poorer random image. If a new visual is generated, verify quality by inspection rather than relying on the prompt. Keep generated artwork marked as demo.

**Acceptance:** capture a 1440×900 screenshot and 390×844 screenshot of the hero before implementing complex animation. At least 55% of the hero's visual weight should come from imagery and form, not body text. The image must have a dramatic crop, not a centered circular logo. Headline, navigation and CTA must fit without collisions. No horizontal overflow or ugly image stretching.

**If the image isn't excellent, iterate on image art direction/crop. Do not start Three.js as an excuse to avoid fixing the photograph.**

### Stage 2 — Signature mechanic (INTERACTION GATE)

Replace or improve the prototype's CSS light reveal with the highest-quality feasible renderer:

- Option A: one efficient WebGL texture plane, two identical textures or colour-graded states, with a smooth soft-edged exposure field. Use R3F/Three only if this produces better output.
- Option B: layered CSS images and GPU-friendly masking if that produces equal or better visual quality.

Motion details:
- pointer position smoothed by delta-time damping; use mutable refs / RAF, not React state for every pointer move;
- color and local contrast reveal along a smooth 450–520px soft-edged area at 1440px;
- subtle tissue parallax limited to a few pixels (never make anatomical features warp wildly);
- click `Reveal` => develop full surface in 450–650ms, reversible `aria-pressed`; keyboard Enter/Space works;
- preserve pointer interaction without intercepting menu/CTA;
- mobile tap mode works independently of hover, no interference with native scroll;
- reduced motion and WebGL fallback preserve the visual.

**Acceptance:** demonstrated pointer reveal, reversed reveal, keyboard button, mobile behaviour, no blank frames, no console errors. Record which renderer was chosen and why.

### Stage 3 — Connected scene choreography (STORY GATE)

Create the next two environments, maintaining iris identity:

1. `THE SPECIMEN`: sudden photographic-paper inverse with iris as massive indexed crop, headline `NO TWO / ALIKE.` and a single concise sentence. Animate the hero's media into this physical/artwork state. Use FLIP, texture transform or carefully choreographed crop, not a random unrelated fade.
2. `THE OBJECT`: iris becomes finished framed art with credible bevel, reflection, shadow and consistent material. Headline `A PART / OF YOU.`. If using 3D, make the frame a single high-quality scene and reuse the same canvas; if using compositing, provide photographic realism and 3D-like movement.

Only after these work: build the lavender-blue final panel `YOUR / MOVE.` and functional enquire CTA.

**Acceptance:** at slow scroll, normal scroll and fast wheel, the page always has an understandable composition. No scroll trap, blinding strobe, awkward midpoint, orphaned object, layout jump, mobile broken pinning or excessive text.

### Stage 4 — Product logic / booking / refinement (FUNCTION GATE)

- Build a small typed config containing brand name, WhatsApp number, location and only **confirmed** pop-up dates.
- `Book / Enquire` composes a context-specific, properly URL-encoded WhatsApp message. If number missing, truthful setup message rather than dead link.
- Keep landing page content to 4 chapters. No FAQs, pricing tables or many cards. Prices are not needed in the immersive story. Add a clearly labelled optional product-detail layer only if business use requires it later.
- Add accessible section nav, keyboard focus, reduced motion, static fallback, image alt text and local SEO (Pondicherry).
- Avoid false awards, clients, partners or customers.

**Acceptance:** click all visible interactions and confirm real outcomes in browser. Build must not merely compile with dead buttons.

### Stage 5 — Quality audit, iterate before declaring completion

At minimum screenshot and inspect widths 360, 390, 768, 1024, 1440, 1920; include 390×844 and 1440×900 in final review. Test cold load, direct refresh, keyboard navigation, reduced motion, pointer, mobile touch simulation, no-WebGL fallback, click conversion and back-navigation.

Run repo's `lint`, `typecheck` (or `npx tsc --noEmit`), and `build`; report actual exit statuses. Check for hydration errors and animation cleanup. Inspect visual output manually (screenshot review) and fix defects found. Check no overbright UI or low-res image at 100%.

Report:
1. Files modified/created.
2. Chosen image/renderer pipeline.
3. Screenshots and where to find them.
4. Actual tests run and which passed/failed.
5. Any remaining limitations (e.g., no image generation, missing business WhatsApp number).

**Do not claim "award-winning" or "pixel-perfect" based on code compilation alone.**

---

## Production architecture — adaptive, not forced

```text
app/
  page.tsx                       # semantic HTML chapters
  layout.tsx                     # metadata and fonts
  globals.css                    # tokens + typography
components/iris/
  IrisExperience.tsx             # parent, shared visual state and refs
  HeroComposition.tsx            # title, crop, action hierarchy
  ExposureField.tsx              # shader OR CSS exposure renderer
  SpecimenChapter.tsx            # photo-paper scene
  ArtworkObject.tsx              # framed print reveal
  ClosingInvitation.tsx          # final CTA
  SceneCanvas.tsx                # one renderer, only if WebGL adds quality
  useExperienceMotion.ts         # GSAP/ScrollTrigger orchestration
  useReducedMotion.ts
lib/
  iris-config.ts                 # real business contact data
  whatsapp.ts                    # URL builder
  assets.ts                      # source manifests
public/iris/
  hero-desktop.avif
  hero-mobile.avif
  specimen.webp
  art-print.webp
```

A larger architecture is not inherently better. Organise around **one persistent object with several states**, not around independent generic marketing sections.

## State definitions (recommended)

```ts
type ExposureMode = 'local' | 'developed';
type ExperienceScene = 'unexposed' | 'specimen' | 'object' | 'invitation';
type InputMode = 'pointer' | 'touch' | 'keyboard' | 'reduced-motion';

interface ExperienceState {
  scene: ExperienceScene;
  exposure: ExposureMode;
  scrollProgress: number; // 0–1 per transition, clamped
  pointer: { x: number; y: number }; // normalized per visual plane
  inputMode: InputMode;
}
```

Use refs / interpolated uniforms for fast input; expose React state only for UI changes. Treat native scrolling, touch exploration and asset loading as separately tested user flows.

## Antigravity escalation prompt if output is generic

> Stop. Do not add more sections or animations. Compare the actual screenshot against `CREATIVE_SPEC.md` Shot A0. Identify three precise visual failures (composition, lighting, typography, imagery), with screenshots or measurable CSS/asset differences. Fix those failures in the repository, take the screenshots again, and only then continue. Do not answer with compliments or another design proposal.

## Agent rule: evidence over adjectives

Words like "premium", "cinematic", "immersive", "award-winning" and "mind-blowing" are **not implementation instructions**. Every feature must be described by (a) visible result, (b) trigger, (c) renderer, (d) fallback, and (e) acceptance test.
