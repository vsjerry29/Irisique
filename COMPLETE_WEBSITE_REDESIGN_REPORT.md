# IRIS — Complete Website Redesign & Interaction Refinement Report

## Executive Summary
This report documents the site-wide creative rebuild and interaction refinement for **IRIS** (`D:\Irisique`). While strictly preserving the approved cinematic macro hero (shaders, textures, entrance, scroll rotation, and stroma layers), every remaining route and overlay across the application has been redesigned into a unified, high-contrast, editorial brand inspired by the craftsmanship and kinetic continuity of [Two Halves](https://twohalves.co/).

---

## 1. Global Monochromatic Design System
* **Exact Palette Tokens**:
  - Primary Black: `#090909`
  - Secondary Black: `#171717`
  - Warm Ivory: `#F4F1EA`
  - Off-White: `#FAFAF8`
  - Soft Stone: `#D8D4CC`
  - Neutral Grey: `#706D68`
  - Pure White: `#FFFFFF`
* **Complete Removal of Blue/Cyan Styling**: All legacy `#030405`, `#7ec8e3`, and blue/cyan UI borders, outlines, inputs, progress bars, and buttons across `/book`, `/shop`, `/products`, `/my-iris`, and `/track-order` have been removed. Natural iris colors are preserved in the artwork while interface elements are strictly monochromatic.
* **Typography & Surfaces**: Open editorial layouts with oversized grotesk display headings, compact monospace metadata (`tracking-[0.24em]`), zero card boxes, and zero decorative glassmorphism panels.

---

## 2. Critical Defect Repairs

### A. Artwork Popup (`ArtOfIris.tsx`)
* **Identified Defect**: Previous modal suffered from text contrast failure (white headings against translucent blur), an accidental dark blurred halo resembling an image filter, disconnected image boxes, and jargon ("Generational Heritage Matrix", "Biometric Bespoke").
* **Implemented Solution (Option A — Solid Black Gallery Surface)**:
  - **100% Solid Surface**: Mounted via React portal to `document.body` with solid `#090909` background—eliminating translucent bleed-through and ensuring text contrast exceeds `15:1`.
  - **Sharp 58% Artwork**: Large, sharp masterwork occupying 58% of usable viewport width without artificial CSS blurs or dark glow filters.
  - **Human-Curated Typography**:
    - Solo: `SOLO COMPOSITION • SINGULAR MICROCOSM`
    - Couple: `COUPLE COMPOSITION • DUAL HARMONY`
    - Family: `FAMILY COMPOSITION • COSMIC CONSTELLATION` — *"Three individual irises, composed into one enduring artwork."*
  - **Safe-Area Close Button**: Fixed top-right control (`top: max(1.5rem, env(safe-area-inset-top, 1.5rem))`, `z-[110]`) with `CLOSE [ESC]` text and icon.
  - **Accessibility**: Full background scroll locking, focus trapping, and global `Escape` key dismissal with focus restoration to the trigger button.
* File: [ArtOfIris.tsx](file:///D:/Irisique/src/components/home/ArtOfIris.tsx)

### B. Booking Page Rebuild (`/book`)
* **Identified Defect**: Outdated technology dashboard in pure black with cyan buttons, blue outlines, biometric safety protocol cards, and 8+ unnecessary input fields.
* **Implemented Solution (`BOOK YOUR IRIS.`)**:
  - Calm, minimal warm ivory `#F4F1EA` canvas with black typography.
  - Secondary natural iris visual floating in negative space without technology boxes.
  - **Exactly 4 Primary Fields**:
    1. `01 / FULL NAME *`: Text input.
    2. `02 / WHATSAPP MOBILE NUMBER *`: Validated 10-digit Indian phone number.
    3. `03 / NUMBER OF PEOPLE *`: Compact stepper (`−` / count / `+`) starting at 1.
    4. `04 / PREFERRED DATE *`: Accessible date input preventing past dates (`min={today}`).
  - **Location**: Pre-set to *White Town Atelier, Pondicherry 605001*.
  - **Enquiry Submission**: Primary CTA `REQUEST A SESSION` formats and prefills a direct WhatsApp message to the atelier (`SITE_CONFIG.whatsapp.cleanNumber`). Clear notice explains that the booking is an enquiry awaiting response, avoiding false confirmation claims.
* File: [page.tsx](file:///D:/Irisique/src/app/book/page.tsx)

### C. Signature Motion Motif: The Optical Trace
* **Concept**: An asymmetric, curved monochrome SVG path resembling a ray of light travelling through an imaginary optical system.
* **Choreography**: Combines a fine continuous line, micro-dashes, and a scroll-linked luminous focal reticle. Binds to GSAP ScrollTrigger to reveal during section transitions and recede gracefully.
* **Placement**: Integrated into the hero-to-gallery handoff, artwork compositions, collection transition, booking invitation, and tracking progress.
* File: [OpticalTrace.tsx](file:///D:/Irisique/src/components/ui/OpticalTrace.tsx)

### D. Typographic Curtain Fullscreen Navigation
* **Concept**: Clicking `MENU` smoothly deploys a solid `#090909` typographic curtain over the viewport.
* **Features**:
  - Oversized display navigation links (`01 HOME`, `02 PRODUCTS`, `03 BOOK A SESSION`, `04 MY IRIS`, `05 SHOP`, `06 TRACK ORDER`).
  - Studio coordinates and direct WhatsApp/Email links.
  - Accompanied by a compact Optical Trace motif.
  - Focus trapped inside modal; `Escape` key triggers smooth exit and restores background scroll.
* File: [MenuOverlay.tsx](file:///D:/Irisique/src/components/layout/MenuOverlay.tsx)

### E. Atelier Shop (`/shop`) & Paper Shutter Portfolio
* **Canvas**: Warm ivory `#F4F1EA` with large borderless studio product photographs.
* **Products**: Digital Artwork, Photo Print, Fine Art Print, Framed Artwork, Acrylic Block, Light Box, and Jewelry & Pendant.
* **Paper Shutter Detail Modal**: Clicking any product opens an editorial portfolio view displaying original imagery, short descriptions, available sizes, live pricing updates, and quantity stepper.
* **Editorial Cart Drawer**: Rebuilt [CartDrawer.tsx](file:///D:/Irisique/src/components/commerce/CartDrawer.tsx) on warm ivory with subtotal calculations and one-click WhatsApp order formulation.
* File: [page.tsx](file:///D:/Irisique/src/app/shop/page.tsx)

### F. Curated Products Catalogue (`/products`)
* Staggered alternating editorial layout highlighting physical materials, scales, and introductory pricing with direct links to configure within the shop.
* File: [page.tsx](file:///D:/Irisique/src/app/products/page.tsx)

### G. My Iris Client Archive (`/my-iris`) & Track Order (`/track-order`)
* **My Iris**: Private gallery aesthetic with clean OTP authentication portal and high-resolution stroma masterwork display.
* **Track Order**: Minimal order reference lookup with an Optical Trace production stage indicator displaying honest statuses (Request received, Confirmed, Artwork preparation, Production, Dispatched, Delivered).
* Files: [page.tsx (my-iris)](file:///D:/Irisique/src/app/my-iris/page.tsx), [page.tsx (track-order)](file:///D:/Irisique/src/app/track-order/page.tsx)

---

## 3. Browser Verification & Audit Telemetry

| Route / Component | Test Performed | Measured Result | Status |
| :--- | :--- | :--- | :--- |
| **Hero Preservation** | Macro entrance, shaders, rotation | Unmodified, fully functional | **PASSED** |
| **Artwork Popup** | Family artwork selection & popup | Solid `#090909`, contrast > 15:1, 0 jargon | **PASSED** |
| **Popup Escape Close** | `Escape` key event on open popup | Cleanly closes, focus restored | **PASSED** |
| **Menu Curtain** | `MENU` click & link verification | 9 active links, focus trapped | **PASSED** |
| **Booking Page** | Exactly 4 fields, Indian mobile validation | 4 fields present, past dates blocked | **PASSED** |
| **Booking Submission** | Form submit & WhatsApp URL generation | `wa.me` prefilled URL with enquiry note | **PASSED** |
| **Shop Paper Shutter** | Product selection & size change | Live price update, cart updated | **PASSED** |
| **Cart Drawer** | Add to cart, quantity change, subtotal | Real-time calculation, WhatsApp action | **PASSED** |
| **Products Catalogue** | Large imagery, configure links | Correct navigation to `/shop` | **PASSED** |
| **My Iris Access** | Phone auth + OTP entry | Private gallery unlocked, sign out works | **PASSED** |
| **Track Order** | Query with `IRIS-7402` | Production stages rendered | **PASSED** |
| **Mobile 390×844 Layout** | Full page mobile overflow test | `scrollWidth === innerWidth` (0 overflow) | **PASSED** |
| **Production Build** | `npm run build` | 14/14 routes compiled in 4.6s (0 errors) | **PASSED** |

---

## 4. Proof Artifacts & Recordings
* **Master Walkthrough GIF**: [complete_redesign_walkthrough.gif](file:///D:/Irisique/recordings/complete_redesign_walkthrough.gif)
* **High-Resolution QA Screenshots**:
  - [01_artwork_popup_family.png](file:///D:/Irisique/screenshots/redesign_qa/01_artwork_popup_family.png)
  - [02_typographic_curtain_menu.png](file:///D:/Irisique/screenshots/redesign_qa/02_typographic_curtain_menu.png)
  - [03_book_page_initial.png](file:///D:/Irisique/screenshots/redesign_qa/03_book_page_initial.png)
  - [04_book_page_submitted.png](file:///D:/Irisique/screenshots/redesign_qa/04_book_page_submitted.png)
  - [05_shop_page.png](file:///D:/Irisique/screenshots/redesign_qa/05_shop_page.png)
  - [06_shop_paper_shutter.png](file:///D:/Irisique/screenshots/redesign_qa/06_shop_paper_shutter.png)
  - [07_products_catalogue.png](file:///D:/Irisique/screenshots/redesign_qa/07_products_catalogue.png)
  - [08_my_iris_auth.png](file:///D:/Irisique/screenshots/redesign_qa/08_my_iris_auth.png)
  - [09_my_iris_private_gallery.png](file:///D:/Irisique/screenshots/redesign_qa/09_my_iris_private_gallery.png)
  - [10_track_order_status.png](file:///D:/Irisique/screenshots/redesign_qa/10_track_order_status.png)
  - [11_mobile_390_home.png](file:///D:/Irisique/screenshots/redesign_qa/11_mobile_390_home.png)
  - [12_mobile_390_book.png](file:///D:/Irisique/screenshots/redesign_qa/12_mobile_390_book.png)

---

## 5. Production Credentials & Setup Checklist
To transition from the current development environment to live production:
1. **WhatsApp Business API / Webhook**: Set the verified studio number in `src/lib/config.ts` (`SITE_CONFIG.whatsapp.cleanNumber`).
2. **Order Database / Storage**: Connect a persistent database (e.g. Supabase, PostgreSQL) to replace the in-memory store in `src/app/api/orders/route.ts` and `src/app/api/bookings/route.ts`.
3. **SMS / OTP Gateway**: Configure an SMS provider (e.g. Twilio, MSG91) for production OTP delivery on `/my-iris`.
4. **Payment Gateway**: Connect Razorpay, Stripe, or Pine Labs if real-time checkout is desired over direct studio WhatsApp enquiry.
