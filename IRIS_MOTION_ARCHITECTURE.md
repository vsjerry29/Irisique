# IRIS — Unified Motion Architecture & Creative System

## 1. Executive Motion Strategy
The IRIS digital experience operates as a single, uninterrupted visual journey rather than a sequence of disconnected scrolling containers. Following the creative direction of Two Halves, every transition between visual spaces defines a strict handoff contract, ensuring continuous momentum, deterministic reverse-scrolling, and responsive physical feedback.

---

## 2. Shared Animation Clock & Scroll System
1. **Clock Authority**:
   - Single global ticker: `gsap.ticker` coordinates all continuous transforms and timelines.
   - Zero competing `requestAnimationFrame` loops.
   - WebGL shaders in `UnifiedIrisHero.tsx` sample from standard `THREE.Clock` delta clamped to $0.1\text{s}$ to prevent frame-spike instability.
2. **Scroll Management**:
   - Native document scrolling with `window.history.scrollRestoration = "manual"`.
   - ScrollTrigger manages scroll-linked choreography with `invalidateOnRefresh: true` and explicit `refreshPriority` tiers:
     - **Priority 10**: Hero pinned canvas (200vh canonical progress stage).
     - **Priority 8**: Art of Iris background entry & parallax layer.
     - **Priority 6**: Product Transformation continuous locomotive track.
     - **Priority 4**: Experience photographic narrative plates.
     - **Priority 2**: Booking surface transformation & Footer.
   - Master layout coordination: `ScrollTrigger.sort()` called upon component mount and viewport resize.

---

## 3. Motion Curve Family & Timing Tiers
To establish a cohesive tactile feel without mechanical bounce or arbitrary easing:
* **Tactile Micro-Interactions** (Buttons, tabs, reticles):
  - Duration: `200ms – 320ms`
  - Ease: `power2.out`
* **Masked Media Transitions** (Artwork switching, image boundary transformations):
  - Duration: `650ms – 950ms`
  - Depth recess: `scale: 0.94 -> 1.00`, `blur: 3px -> 0px`
  - Ease: `power3.out`
  - Invariant: Interruptible on user re-selection with immediate tween kill and glide.
* **Large Composition Surface Shifts** (Section handoffs, black-to-paper wipes):
  - Duration: Driven by scroll scrub (`scrub: 0.5 – 0.6s catchup`)
  - Interpolation: `smoothstep(t) = t * t * (3.0 - 2.0 * t)`
* **Continuous Locomotive Train** (Product collection):
  - Base Velocity: `140 px/s` (~`2.33 px/frame` at 60fps)
  - Hover Velocity: `45 px/s` (~`0.75 px/frame`, smooth lerp deceleration over 600–800ms)
  - Friction Lerp: `0.045` per frame normalized to 60fps.

---

## 4. Section Handoff Contract
1. **Hero → Artworks (`EVERY IRIS IS ART`)**:
   - Exit: Stroma layers part radially outward and dissolve completely to $0.0$ opacity by $p = 0.97$.
   - Entry: Warm paper background (`#F4F1EA`) transitions across the viewport with a subtle organic curved surface boundary.
   - Continuity: The primary Solo artwork emerges before the background completes its settle, creating spatial continuity.
2. **Artworks → Products (`THE COLLECTION`)**:
   - Solo/Couple/Family selection transforms smoothly into horizontal product formats.
   - Seamless surface continuity on `#F4F1EA`.
3. **Products → Experience (`CAPTURE • CREATE • KEEP`)**:
   - Horizontal train hands off to authentic photographic sequence on clean paper/stone planes.
4. **Experience → Booking (`YOUR TURN.`)**:
   - Warm paper transitions into deep near-black `#090909` through an architectural vertical surface wipe.
5. **Booking → Footer (`IRIS®`)**:
   - Re-emergence of warm archival paper `#F4F1EA` with monumental full-width brand wordmark.
