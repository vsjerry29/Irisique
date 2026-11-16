/**
 * THE OPTICAL TRACE 2.0 — MATHEMATICAL GEOMETRY ENGINE
 * Computes a continuous, page-spanning cubic Bézier spline linking all post-hero sections:
 * Hero Exit -> The Art of Iris -> Product Collection -> The Experience -> Booking Invitation -> Footer
 */

export interface SectionMetric {
  id: string;
  relTop: number;
  height: number;
  relBottom: number;
}

export interface TraceAnchorPoint {
  x: number;
  y: number;
  label?: string;
}

export interface OpticalTraceSpline {
  d: string;
  viewBox: string;
  width: number;
  height: number;
  anchors: TraceAnchorPoint[];
  landmarks: {
    galleryEntrance: { x: number; y: number };
    galleryArtwork: { x: number; y: number };
    galleryExit: { x: number; y: number };
    collectionEntrance: { x: number; y: number };
    collectionMid: { x: number; y: number };
    collectionExit: { x: number; y: number };
    experienceEntrance: { x: number; y: number };
    experienceMid: { x: number; y: number };
    experienceExit: { x: number; y: number };
    bookingEntrance: { x: number; y: number };
    bookingMid: { x: number; y: number };
    bookingExit: { x: number; y: number };
    footerEndpoint: { x: number; y: number };
  };
}

/**
 * Builds the page-spanning cubic Bézier path across all post-hero sections
 */
export function buildOpticalTraceSpline(
  totalWidth: number,
  sectionMetrics: {
    art: SectionMetric;
    collection: SectionMetric;
    experience: SectionMetric;
    booking: SectionMetric;
    footer: SectionMetric;
  },
  isMobile: boolean = false
): OpticalTraceSpline {
  const w = totalWidth || (isMobile ? 390 : 1440);

  const { art, collection, experience, booking, footer } = sectionMetrics;
  const totalHeight = footer.relBottom;

  if (isMobile) {
    // ─── MOBILE SIMPLIFIED RESPONSIVE ROUTE (Width ~390px) ───
    // Subtle, elegant vertical flow weaving through mobile negative spaces
    const p0 = { x: w * 0.82, y: art.relTop + art.height * 0.05 };
    const c1 = { x: w * 0.65, y: art.relTop + art.height * 0.15 };
    const c2 = { x: w * 0.72, y: art.relTop + art.height * 0.32 };
    const p1 = { x: w * 0.55, y: art.relTop + art.height * 0.42 }; // Art near solo

    const c3 = { x: w * 0.38, y: art.relTop + art.height * 0.55 };
    const c4 = { x: w * 0.22, y: art.relTop + art.height * 0.72 };
    const p2 = { x: w * 0.28, y: art.relTop + art.height * 0.90 }; // Art lower

    const c5 = { x: w * 0.35, y: collection.relTop + collection.height * 0.08 };
    const c6 = { x: w * 0.78, y: collection.relTop + collection.height * 0.25 };
    const p3 = { x: w * 0.72, y: collection.relTop + collection.height * 0.45 }; // Products

    const c7 = { x: w * 0.65, y: collection.relTop + collection.height * 0.65 };
    const c8 = { x: w * 0.25, y: collection.relTop + collection.height * 0.85 };
    const p4 = { x: w * 0.30, y: experience.relTop + experience.height * 0.05 }; // Exp bridge

    const c9 = { x: w * 0.38, y: experience.relTop + experience.height * 0.20 };
    const c10 = { x: w * 0.80, y: experience.relTop + experience.height * 0.35 };
    const p5 = { x: w * 0.75, y: experience.relTop + experience.height * 0.50 }; // Exp stage 2

    const c11 = { x: w * 0.68, y: experience.relTop + experience.height * 0.68 };
    const c12 = { x: w * 0.22, y: experience.relTop + experience.height * 0.82 };
    const p6 = { x: w * 0.35, y: booking.relTop + booking.height * 0.08 }; // Booking entrance

    const c13 = { x: w * 0.52, y: booking.relTop + booking.height * 0.30 };
    const c14 = { x: w * 0.78, y: booking.relTop + booking.height * 0.55 };
    const p7 = { x: w * 0.65, y: booking.relTop + booking.height * 0.85 }; // Booking arc

    const c15 = { x: w * 0.45, y: footer.relTop + footer.height * 0.15 };
    const c16 = { x: w * 0.28, y: footer.relTop + footer.height * 0.45 };
    const p8 = { x: w * 0.42, y: footer.relTop + footer.height * 0.82 }; // Footer terminus

    const d = `M ${p0.x.toFixed(1)},${p0.y.toFixed(1)} ` +
      `C ${c1.x.toFixed(1)},${c1.y.toFixed(1)} ${c2.x.toFixed(1)},${c2.y.toFixed(1)} ${p1.x.toFixed(1)},${p1.y.toFixed(1)} ` +
      `C ${c3.x.toFixed(1)},${c3.y.toFixed(1)} ${c4.x.toFixed(1)},${c4.y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)} ` +
      `C ${c5.x.toFixed(1)},${c5.y.toFixed(1)} ${c6.x.toFixed(1)},${c6.y.toFixed(1)} ${p3.x.toFixed(1)},${p3.y.toFixed(1)} ` +
      `C ${c7.x.toFixed(1)},${c7.y.toFixed(1)} ${c8.x.toFixed(1)},${c8.y.toFixed(1)} ${p4.x.toFixed(1)},${p4.y.toFixed(1)} ` +
      `C ${c9.x.toFixed(1)},${c9.y.toFixed(1)} ${c10.x.toFixed(1)},${c10.y.toFixed(1)} ${p5.x.toFixed(1)},${p5.y.toFixed(1)} ` +
      `C ${c11.x.toFixed(1)},${c11.y.toFixed(1)} ${c12.x.toFixed(1)},${c12.y.toFixed(1)} ${p6.x.toFixed(1)},${p6.y.toFixed(1)} ` +
      `C ${c13.x.toFixed(1)},${c13.y.toFixed(1)} ${c14.x.toFixed(1)},${c14.y.toFixed(1)} ${p7.x.toFixed(1)},${p7.y.toFixed(1)} ` +
      `C ${c15.x.toFixed(1)},${c15.y.toFixed(1)} ${c16.x.toFixed(1)},${c16.y.toFixed(1)} ${p8.x.toFixed(1)},${p8.y.toFixed(1)}`;

    return {
      d,
      viewBox: `0 0 ${w} ${totalHeight}`,
      width: w,
      height: totalHeight,
      anchors: [
        { ...p0, label: "HERO_EXIT" },
        { ...p1, label: "ART_SOLO" },
        { ...p2, label: "ART_EXIT" },
        { ...p3, label: "COLLECTION_MID" },
        { ...p4, label: "EXPERIENCE_ENTRY" },
        { ...p5, label: "EXPERIENCE_MID" },
        { ...p6, label: "BOOKING_ENTRY" },
        { ...p7, label: "BOOKING_ARC" },
        { ...p8, label: "FOOTER_TERMINUS" },
      ],
      landmarks: {
        galleryEntrance: p0,
        galleryArtwork: p1,
        galleryExit: p2,
        collectionEntrance: p3,
        collectionMid: p3,
        collectionExit: p4,
        experienceEntrance: p4,
        experienceMid: p5,
        experienceExit: p6,
        bookingEntrance: p6,
        bookingMid: p7,
        bookingExit: p7,
        footerEndpoint: p8,
      },
    };
  }

  // ─── DESKTOP EXPANSIVE EDITORIAL SPLINE (Width ~1440px) ───
  // Journey A: Hero Exit -> Upper Gallery
  const p0 = { x: w * 0.86, y: art.relTop + art.height * 0.04 };
  const c1 = { x: w * 0.76, y: art.relTop + art.height * 0.12 };
  const c2 = { x: w * 0.62, y: art.relTop + art.height * 0.20 };
  const p1 = { x: w * 0.58, y: art.relTop + art.height * 0.25 };

  // Journey B: Artwork Gallery (Sweeping gracefully through negative space around iris specimen)
  const c3 = { x: w * 0.54, y: art.relTop + art.height * 0.32 };
  const c4 = { x: w * 0.62, y: art.relTop + art.height * 0.48 };
  const p2 = { x: w * 0.52, y: art.relTop + art.height * 0.58 };

  const c5 = { x: w * 0.42, y: art.relTop + art.height * 0.68 };
  const c6 = { x: w * 0.22, y: art.relTop + art.height * 0.75 };
  const p3 = { x: w * 0.16, y: art.relTop + art.height * 0.86 };

  // Journey C: Gallery to Product Collection Bridge (Grand sweeping curve crossing the viewport)
  const c7 = { x: w * 0.10, y: art.relTop + art.height * 0.95 };
  const c8 = { x: w * 0.14, y: collection.relTop + collection.height * 0.05 };
  const p4 = { x: w * 0.26, y: collection.relTop + collection.height * 0.12 };

  const c9 = { x: w * 0.44, y: collection.relTop + collection.height * 0.20 };
  const c10 = { x: w * 0.84, y: collection.relTop + collection.height * 0.26 };
  const p5 = { x: w * 0.88, y: collection.relTop + collection.height * 0.38 };

  // Journey D: Product Collection Horizontal Trajectory
  const c11 = { x: w * 0.92, y: collection.relTop + collection.height * 0.52 };
  const c12 = { x: w * 0.70, y: collection.relTop + collection.height * 0.68 };
  const p6 = { x: w * 0.44, y: collection.relTop + collection.height * 0.76 };

  const c13 = { x: w * 0.24, y: collection.relTop + collection.height * 0.85 };
  const c14 = { x: w * 0.15, y: collection.relTop + collection.height * 0.95 };
  const p7 = { x: w * 0.22, y: experience.relTop + experience.height * 0.02 };

  // Journey E: Photographic Experience — Grand S-Curve & Elliptical Orbit
  const c15 = { x: w * 0.36, y: experience.relTop + experience.height * 0.10 };
  const c16 = { x: w * 0.84, y: experience.relTop + experience.height * 0.18 };
  const p8 = { x: w * 0.90, y: experience.relTop + experience.height * 0.28 };

  const c17 = { x: w * 0.96, y: experience.relTop + experience.height * 0.38 };
  const c18 = { x: w * 0.86, y: experience.relTop + experience.height * 0.48 };
  const p9 = { x: w * 0.65, y: experience.relTop + experience.height * 0.58 };

  const c19 = { x: w * 0.40, y: experience.relTop + experience.height * 0.68 };
  const c20 = { x: w * 0.12, y: experience.relTop + experience.height * 0.76 };
  const p10 = { x: w * 0.18, y: experience.relTop + experience.height * 0.86 };

  const c21 = { x: w * 0.22, y: experience.relTop + experience.height * 0.94 };
  const c22 = { x: w * 0.38, y: experience.relTop + experience.height * 0.98 };
  const p11 = { x: w * 0.52, y: booking.relTop + booking.height * 0.04 };

  // Journey F: Booking Invitation — Broad Dark Surface Arc
  const c23 = { x: w * 0.72, y: booking.relTop + booking.height * 0.16 };
  const c24 = { x: w * 0.88, y: booking.relTop + booking.height * 0.34 };
  const p12 = { x: w * 0.86, y: booking.relTop + booking.height * 0.50 };

  const c25 = { x: w * 0.84, y: booking.relTop + booking.height * 0.68 };
  const c26 = { x: w * 0.70, y: booking.relTop + booking.height * 0.84 };
  const p13 = { x: w * 0.56, y: booking.relTop + booking.height * 0.96 };

  // Journey G: Footer — Sweep beneath IRIS Wordmark to Deliberate End
  const c27 = { x: w * 0.42, y: footer.relTop + footer.height * 0.12 };
  const c28 = { x: w * 0.24, y: footer.relTop + footer.height * 0.28 };
  const p14 = { x: w * 0.20, y: footer.relTop + footer.height * 0.45 };

  const c29 = { x: w * 0.16, y: footer.relTop + footer.height * 0.62 };
  const c30 = { x: w * 0.28, y: footer.relTop + footer.height * 0.78 };
  const p15 = { x: w * 0.38, y: footer.relTop + footer.height * 0.88 };

  const segs = [
    [c1, c2, p1],
    [c3, c4, p2],
    [c5, c6, p3],
    [c7, c8, p4],
    [c9, c10, p5],
    [c11, c12, p6],
    [c13, c14, p7],
    [c15, c16, p8],
    [c17, c18, p9],
    [c19, c20, p10],
    [c21, c22, p11],
    [c23, c24, p12],
    [c25, c26, p13],
    [c27, c28, p14],
    [c29, c30, p15],
  ];

  let d = `M ${p0.x.toFixed(1)},${p0.y.toFixed(1)} `;
  for (const [cA, cB, pT] of segs) {
    d += `C ${cA.x.toFixed(1)},${cA.y.toFixed(1)} ${cB.x.toFixed(1)},${cB.y.toFixed(1)} ${pT.x.toFixed(1)},${pT.y.toFixed(1)} `;
  }

  return {
    d,
    viewBox: `0 0 ${w} ${totalHeight}`,
    width: w,
    height: totalHeight,
    anchors: [
      { ...p0, label: "01_HERO_EXIT" },
      { ...p1, label: "02_GALLERY_DESCENT" },
      { ...p2, label: "03_ARTWORK_ORBIT" },
      { ...p3, label: "04_GALLERY_LOWER" },
      { ...p4, label: "05_COLLECTION_BRIDGE" },
      { ...p5, label: "06_COLLECTION_APEX" },
      { ...p6, label: "07_PRODUCT_COUNTERFLOW" },
      { ...p7, label: "08_EXPERIENCE_BRIDGE" },
      { ...p8, label: "09_EXPERIENCE_S_CURVE" },
      { ...p9, label: "10_DARKROOM_CALIBRATION" },
      { ...p10, label: "11_HEIRLOOM_COMMISSION" },
      { ...p11, label: "12_BOOKING_TRANSITION" },
      { ...p12, label: "13_PRIVATE_APPOINTMENTS" },
      { ...p13, label: "14_BOOKING_DESCENT" },
      { ...p14, label: "15_FOOTER_WORDMARK" },
      { ...p15, label: "16_ATELIER_TERMINUS" },
    ],
    landmarks: {
      galleryEntrance: p0,
      galleryArtwork: p2,
      galleryExit: p3,
      collectionEntrance: p4,
      collectionMid: p5,
      collectionExit: p7,
      experienceEntrance: p7,
      experienceMid: p9,
      experienceExit: p11,
      bookingEntrance: p11,
      bookingMid: p12,
      bookingExit: p13,
      footerEndpoint: p15,
    },
  };
}
