/**
 * OPTICAL THREAD CONTROLLER
 * Coordinates interaction between user actions, scroll state, and the Optical Thread.
 */

import gsap from "gsap";

export class OpticalThreadController {
  private static instance: OpticalThreadController;

  public static getInstance(): OpticalThreadController {
    if (!OpticalThreadController.instance) {
      OpticalThreadController.instance = new OpticalThreadController();
    }
    return OpticalThreadController.instance;
  }

  /**
   * Fires an optical pulse toward a specific coordinate
   */
  public pulseTerminal(element: SVGElement, anchorX: number, anchorY: number) {
    if (!element) return;
    const ring = element.querySelector("circle:nth-last-of-type(2)");
    if (!ring) return;

    ring.setAttribute("cx", String(anchorX));
    ring.setAttribute("cy", String(anchorY));

    gsap.fromTo(
      ring,
      { r: 2, opacity: 0.9, strokeWidth: 1.5 },
      { r: 18, opacity: 0, strokeWidth: 0.5, duration: 0.6, ease: "power2.out" }
    );
  }
}
