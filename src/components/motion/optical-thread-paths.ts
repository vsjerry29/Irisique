/**
 * OPTICAL THREAD PATHS & GEOMETRY
 * Precise mathematical SVG definitions for the IRIS Optical Thread.
 * Refined Bézier curves, reticle focus marks, and travelling highlight coordinates.
 */

export interface OpticalFocusMark {
  x: number;
  y: number;
  angle: number;
  length: number;
  label?: string;
}

export interface ThreadPathData {
  d: string;
  viewBox: string;
  focusMarks: OpticalFocusMark[];
  terminalAnchor: { x: number; y: number };
}

/**
 * Gallery Entrance & Composition Interactive Paths
 * Responsive viewBox: 0 0 1440 900
 * Curves enter from the upper left and approach the artwork specimen.
 */
export const GALLERY_THREAD_PATHS: Record<"solo" | "couple" | "family", ThreadPathData> = {
  solo: {
    // Elegant sweeping ray entering at (80, 0), curving through (240, 280), terminating at the left boundary of the circular solo specimen at (480, 480)
    d: "M 80,0 C 140,140 220,260 340,360 S 420,450 480,480",
    viewBox: "0 0 1440 900",
    terminalAnchor: { x: 480, y: 480 },
    focusMarks: [
      { x: 170, y: 190, angle: -45, length: 8, label: "F.01" },
      { x: 340, y: 360, angle: -30, length: 10, label: "OPTIC.SOLO" },
    ],
  },
  couple: {
    // Sweeps to meet the left edge of the panoramic couple diptych at (360, 480)
    d: "M 80,0 C 130,150 200,280 290,370 S 330,450 360,480",
    viewBox: "0 0 1440 900",
    terminalAnchor: { x: 360, y: 480 },
    focusMarks: [
      { x: 160, y: 195, angle: -45, length: 8, label: "F.01" },
      { x: 290, y: 370, angle: -25, length: 10, label: "OPTIC.DUO" },
    ],
  },
  family: {
    // Sweeps wider to meet the left edge of the panoramic family diptych at (280, 480)
    d: "M 80,0 C 120,160 180,290 240,380 S 260,450 280,480",
    viewBox: "0 0 1440 900",
    terminalAnchor: { x: 280, y: 480 },
    focusMarks: [
      { x: 150, y: 200, angle: -45, length: 8, label: "F.01" },
      { x: 240, y: 380, angle: -20, length: 10, label: "OPTIC.TRIO" },
    ],
  },
};

/**
 * Mobile Simplified Gallery Path
 * Responsive viewBox: 0 0 390 700
 */
export const MOBILE_GALLERY_THREAD: ThreadPathData = {
  d: "M 24,0 C 40,80 70,160 120,220 S 170,270 195,290",
  viewBox: "0 0 390 700",
  terminalAnchor: { x: 195, y: 290 },
  focusMarks: [
    { x: 70, y: 160, angle: -40, length: 6, label: "F.01" },
  ],
};

/**
 * Product Collection Horizontal Optical Thread
 * Responsive viewBox: 0 0 1440 380
 * Traverses horizontally behind the product train with subtle wave geometry
 */
export const COLLECTION_THREAD_PATH: ThreadPathData = {
  d: "M 0,200 C 260,150 480,250 720,180 S 1180,240 1440,190",
  viewBox: "0 0 1440 380",
  terminalAnchor: { x: 1440, y: 190 },
  focusMarks: [
    { x: 260, y: 150, angle: 90, length: 8, label: "AXIS.A" },
    { x: 720, y: 180, angle: 90, length: 10, label: "AXIS.B" },
    { x: 1180, y: 240, angle: 90, length: 8, label: "AXIS.C" },
  ],
};
