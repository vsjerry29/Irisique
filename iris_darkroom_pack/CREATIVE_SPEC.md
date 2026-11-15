# IRIS® / THE LIVING DARKROOM — Creative specification v1

**Status:** Art-directed concept and runnable interaction prototype. **Not** the finished production website, and **not** a claim of award-winning quality. The included WebP is generated demonstration art. Preserve the distinctive interaction grammar when implementing a production version in the existing Next.js repository.

## 0 / The thesis

**Not a generic photography site. Not a dark UI kit. Not a spinning iris sphere.**

The experience is a photographic darkroom in which the viewer discovers the iris by moving a beam of light. The artwork is not decoration; it is the interface and the recurring character of the entire website. Touch/drag exposes → the iris develops → the same specimen becomes artwork → the art becomes a physical print → enquiry.

Borrow principles, never composition, from two references:

- **Unseen Studio, https://unseen.co/**: a spatial site with its own world, intentional exploration, little interface chrome, theatrical changes of environment, and interactions embedded in the scenery rather than generic scrolling cards. Documentation: https://wordpress.org/showcase/unseen-studio/ and https://ui.gradientdeck.com/styles/unseen-studio (visual snapshot, 5 Nov 2026).
- **Lando Norris, https://landonorris.com/**: one character-defining object recurs throughout the website; the opening mask/reveal is a meaningful action; graphic art direction makes sections feel related; touch interaction is intentionally different from mouse interaction. Creator case study: https://www.itsoffbrand.com/our-work/lando-norris . Technical/design teardown: https://rickcreates.com/r/2025-11-20-lando-norris .

Do **not** reproduce Unseen's pink plaster room, reflective water, wireframe globe, eyes logo, or side menu. Do **not** reproduce Lando's helmet, lime accents, race UI, photos or exact typography. The photography-as-light-reveal mechanic is original to IRIS.

## 1 / The experience at a glance

**Character**: cinematic, experimental, tactile, graphic, photographic, spare, slightly strange, precise. A tactile art exhibition, not a luxury wedding template and not an optical clinic.

**Wordmark**: `IRIS®`, heavy, tight, confident; custom spacing if time allows. Keep the R small and aligned to optical top-right. No pupil-shaped logo or generic eye icon.

**Copy discipline**: No filler. First viewport ideally contains under 20 meaningful words, excluding navigation and metadata. Use exactly the following functional headline map unless an art director has a compelling reason to change it:

| Scene | Main copy | Supporting content |
| --- | --- | --- |
| Hero | `LOOK / CLOSER.` | `WHAT YOU SEE IS ONLY THE BEGINNING` |
| Specimen | `NO TWO / ALIKE.` | `Your iris is an artwork that already exists. We bring it into focus.` |
| Object | `A PART / OF YOU.` | `Captured. Composed. Kept.` |
| Finale | `YOUR / MOVE.` | `ENQUIRE ABOUT A SESSION` |

No `discover your universe`, `unlock the extraordinary`, `every eye tells a story`, or other interchangeable AI-brand clichés.

## 2 / Visual tokens — enforce across every section

- Background / dark: `#090A0B` (charcoal-black, not pure RGB 0)
- Background / photographic paper: `#EEECE5` (warm white)
- Body ink: `#141617`
- Primary light type: `#F4F1EB`
- Weak type: `#9A9D9D`
- Signal / editorial intervention: `#B6C4F2` (lavender-blue, used sparingly)
- Organic amber is **inside iris imagery**, not a button or border colour.
- Maximum continuous paragraph: 2 short sentences. No gradients used as primary section backgrounds. No fake bloom, glassmorphism, glowing pills, faux luxury gold rules, emoji icons, decorative orbit particles or repeatable cards.

**Typography**: modern grotesk / neo-grotesk. Use a single licensed variable family such as `Inter Tight`, `Geist`, or `Manrope`, with weights 400/600/800/900; use system fallbacks. Tight display tracking (`-0.075em` to `-0.11em`), compact leading (`0.8–0.9`). Do not use Cormorant Garamond or other generic high-contrast serif luxury trope. Support optical sizing and actual glyph metrics rather than trusting presets.

**Scale and spacing:**
- Desktop content margin: `clamp(24px, 3.1vw, 54px)`.
- Mobile content margin: `20px` at 390px viewport, `16px` if needed at 360px.
- Hero display type: `clamp(80px, 11.2vw, 204px)` desktop, about 17vw mobile (visual adjustment based on font).
- Eyebrows and labels: 9–11px / 600–750 weight / tracking `.14–.23em` / uppercase; avoid creating unreadable labels under 9px.
- Section display type: `clamp(72px, 12vw, 205px)` desktop; manually set a mobile size with no clipping.
- Microcopy maximum width: 350px. Do not span a full-width line with prose.
- Dividers: one-pixel strokes only where there is semantic hierarchy. No repeated outlined boxes.
- Shape language: mostly square corners; a single **diagonal cut** may be used as a studio-signature on buttons, not as a repeated card gimmick.

## 3 / Visual storyboard — what the camera should actually show

### Shot A0 — Unexposed / initial composition

At 1440×900, the view is almost black. A gigantic **cropped organic iris surface** enters from the top-right and right edges; the pupil is visible somewhere within the right half but does not need to sit in the exact centre. The eye feels much larger than the screen. There is no separate 3D orb floating with a shadow.

Text is a large, brutal `LOOK / CLOSER.` lockup low-to-mid left. `LOOK` filled white; `CLOSER.` has a precise fine outline (not an outer glow). The graphic type overlaps the dark image without being illegible. Small `IRIS®` logo upper-left; tiny navigation upper-right; tiny `EXPERIMENT / 001` specimen label. At bottom-left a tactile `REVEAL THE UNSEEN` control; bottom-right a tiny pointer instruction.

**Static screenshot quality gate**: A screenshot before interaction must be both visually compelling and legible. If it looks like a standard text-on-photo hero, stop and recompose before implementing effects.

### Shot A1 — Excitation / pointer-light reveal

On desktop, the iris in the unexposed layer appears nearly monochrome and dark. Moving the pointer over the hero creates a soft-edged illumination area that reveals saturated fibre details underneath. The reveal follows the pointer with slight inertia rather than rigidly snapping. It is an exposure metaphor, not an RGB circular flashlight pasted on top.

- Reveal centre follows pointer with damping about 0.12 per animation frame (use dt-aware formula in production).
- Reveal approximate diameter 420–520px at 1440, scaling reasonably with viewport width.
- Inner 20–30% fully coloured, soft falloff outward.
- Cursor lens/crosshair should be subtle and contextual, never hide buttons.
- Pointer event control must be limited to the visual surface so nav and CTA stay clickable.
- The reveal exists on an identically registered image / surface (no visible edge misalignment).
- Fallback: CSS mask on layered imagery; preferred production: shader with photographic color and mild texture parallax, avoiding fake geometry.

### Shot A2 — Develop / deliberate action

Press the `REVEAL THE UNSEEN` button: all colour develops across the iris surface and the screen briefly settles into a sharper, richer state. Show a short interface state change to `RETURN TO LIGHT REVEAL`. Duration ~450–650ms; prefer gentle ease-out. This is reversible and keyboard operable. The visual stays compelling even if the user never clicks.

**Do not** require a 3-second or 5-second hold. It adds friction, especially on mobile. A tap/click works; press-and-hold may be an optional enhancement. Never block scroll or navigation.

### Shot B0 — Specimen / hard paper inversion

The dark frame gives way to warm photographic paper `#EEECE5`. Graphic type reads `NO TWO / ALIKE.` huge in near-black. The first iris persists conceptually, but now exists as a specimen/image, cropped inside a giant circular lens, intentionally bleeding off the right edge. Pair with tiny index marks (`01 / THE SPECIMEN`). The paper transition must make the user feel the image has been **developed**, not that they have entered an unrelated section.

Desktop: oversized circle 55–65vw at the right, partly out-of-bounds. Typography left but may overlap the specimen. Mobile: move the circle high at top-right and put headline safely below with enough contrast; don't force desktop overlap if unreadable.

### Shot C0 — Object / the frame

Hard transition back to black. A physical black frame with thick bevel and a matte emerges from darkness and occupies 40–48vw desktop. The image contained in the frame must have plausible perspective and physical lighting. It may be a high-quality composited image / 3D model or layered HTML/CSS with a believable texture; **do not render a cheap CubeGeometry picture frame**. Keep only text `A PART / OF YOU.` and one concise line.

The same iris image reappearing here is **deliberate**: the artwork has moved from capture to physical print. If a collection selector is added, use genuinely different photography for its variations.

### Shot D0 — Invitation / decisive contrast

An abrupt graphic blue-lavender sheet (`#B6C4F2`), not another black gradient. Enormous black `YOUR / MOVE.` plus a single high-contrast action `ENQUIRE ABOUT A SESSION`. The footer is minimal. The dramatic colour inversion is an editorial punctuation mark. This should still feel like the same identity because type, index marks and motion rules remain consistent.

## 4 / Interaction choreography — production timing

| Trigger | Visual behaviour | Duration / rule |
| --- | --- | --- |
| Initial visual ready | Avoid heavy splash; image and title appear immediately or within a small opacity reveal | 0–450ms |
| Pointer enter / move | Revealed zone follows pointer with smooth damped position | RAF-based, no React setState per event |
| Pointer exit | Reveal returns to predefined focal area | 250–450ms |
| Click `Reveal` | Mask transitions from local to global; label changes | 450–650ms; reversible |
| Hero scroll 0–30% | Type shifts mildly and image scale/depth changes subtly | Scroll-progress driven |
| Hero scroll 30–70% | Darkroom transitions into photographic-paper specimen | Connected transition; no blank frame |
| Hero scroll 70–100% | Large iris becomes an indexed art object, no disorienting spin | Readable at all progress values |
| Specimen → Frame | Consistent iris persists as a physical print | Camera or DOM-flip transition |
| Finale | Abrupt graphic reveal, CTA already usable | 250–500ms |

Never use `scroll-jacking` that makes native browser controls fail. Never tie all text appearance to a huge stagger delay. Never animate typography continuously for decoration.

## 5 / Multi-device behaviours

**Desktop >=1024px**: pointer reveal enabled; full-range cinematic choreography permitted. Keep navbar and booking action on top of artwork and never behind a canvas. 1440×900 is the primary reference viewport; also inspect 1366×768 and 1920×1080.

**Tablet 768–1023px**: reduce lens size and parallax amplitudes; no huge hero side labels if they overlap; preserve CTA, artwork and heading priority.

**Mobile <=767px**: no hover assumptions. Hero image is a deliberate portrait crop. `Reveal` is a large tap button. Use static full-colour exposure by default or a visible `touch to reveal` gesture that does not intercept page scrolling. If supporting touch drag, require a dedicated `Explore` toggle to switch interaction mode and return immediately to normal scrolling—learn from Lando's `tap to lock` mobile solution. Motion sequence uses shorter travel and avoids multiple pinned viewports. All touch targets >=44px; no user should have to drag to enquire.

**Reduced motion**: hero full-colour, no smooth scroll, no displacement or camera transitions, all sections accessible in ordinary flow. WebGL failure: polished static poster using the actual hero asset. All copy and links are regular semantic DOM, not shader-rendered text.

## 6 / Production visual technology — choose by output quality

**Recommended:** Next.js App Router + React/TS + Tailwind for scaffolding + GSAP/ScrollTrigger for chapter choreography. Use a **single persistent Three.js/R3F Canvas** only if it produces a materially better result than layered CSS. Place accessible DOM above it; align canvas visual anchors to semantic section rectangles.

**Hero shader (if implementing WebGL)**: textured rectangular plane or a composite scene. Use actual photographic source texture as foundation, not a geometry that merely resembles a doughnut. Shader inputs include `uTexture`, `uPointer` (normalized), `uExposure`, `uRevealRadius`, `uScroll`, `uTime`, `uResolution`, optional `uDepthMap`. `uTime` should only produce extremely subtle organic drift. Avoid uniform polar noise patterns and overblown chromatic aberration.

**First visual milestone**: a perfect static frame and responsive screenshot. **Second milestone**: the pointer reveal state. **Third**: connected transitions. Do not build three chapters of generic filler first.

**Performance budget aspirations** (targets, not claims): desktop animation 55–60fps on normal hardware; mobile fallback 30–60fps depending on device; no main-thread long stalls when pointer moves; hero dominant image in compressed AVIF/WebP with source at least 2000px where possible; maintain natural image detail; limit DPR and shader samples; lazy-load extra imagery; avoid excessive physics, postprocessing, multi-pass blur, HDR and looping background video. Static hero remains useful if scripts are disabled.

**Critical privacy context**: Photographic iris imagery may be biometric-related data. This version uses demonstration assets only. Real customer image capture, storage, permissions and deletion need explicit policies before uploading customer photos. No fake customer photos or reviews, invented pop-up venues or confirmed bookings.

## 7 / Functional requirements

- Header: IRIS home, Eye, Art, booking. Native anchor jumps or accessible router navigation, no dead links.
- `Reveal` is a button with `aria-pressed`, visually distinct hover/focus states and reversible state.
- `Enquire` reads a **configured** WhatsApp number; message encoded with `encodeURIComponent`; opening WhatsApp does not mean a reservation is confirmed. Missing number -> truthful visible setup state. No invented contact number.
- Do not copy all old product pricing/FAQ/event prose onto this landing page. Reserve those for subsequent pages or a concise contextual drawer if truly needed.
- Real `alt` descriptions for informative images; hide decorative layers from screen readers; `prefers-reduced-motion` support.
- SEO basics with accurate Pondicherry context; no fake structured data fields.

## 8 / Rejection criteria

Reject a build if any of these is true:

1. Hero is a centered iris disc plus standard headline and gradient CTA.
2. The same static picture is pasted behind every section without a transformation motive.
3. More than four major content chapters on the landing page.
4. Interactions consist only of fade-up, parallax and magnetic buttons.
5. Hover is required to understand or book on mobile.
6. Any displayed image is visibly pixelated, upscaled badly, has an anatomical glitch, or is stretched beyond suitable resolution.
7. Booking CTA has no real action or honest configuration state.
8. Prototype's editorial composition is replaced by generic cards / rounded containers / 3-column feature grids.
9. Pointer move causes React re-renders per pixel or an excessive WebGL render cost.
10. The agent reports a passed browser QA without actually running the tests.

## 9 / Production work boundaries

The included `index.html` is a working **visual proof-of-concept**, not the final Next.js page. It establishes colour, type, cropping, first-frame composition and touch/button interaction. It uses CSS image masks, not a production shader or a genuine 3D art pipeline. It deliberately contains no invented locations, fake customers, or fake WhatsApp number. **Do not simply paste this page into Next.js and call the production work finished.** Use the prototype as a measurable baseline and substantially improve the photography rendering and transitions.
