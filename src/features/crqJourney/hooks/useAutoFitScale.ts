import { useCallback, useEffect, useRef, useState } from "react";

interface AutoFitOptions {
  /** Never shrink past this — below it the canvas scrolls instead of becoming unreadable. */
  min?: number;
  /** Never grow past this, so a 4K monitor doesn't blow the diagram up. */
  max?: number;
  /**
   * Design-space height. Supply it and the scale also fits whatever viewport
   * height is left below the canvas, so the whole diagram reads in one view
   * instead of running under the fold.
   */
  baseHeight?: number;
  /** Breathing room to leave between the canvas bottom and the viewport bottom. */
  bottomGutter?: number;
  /** Don't height-fit into a slot smaller than this — scrolling beats a speck. */
  minViewportSlot?: number;
}

/**
 * Scales a fixed-coordinate canvas to fit its container.
 *
 * The flow diagram is drawn once at its design size (cards + SVG connectors
 * share one coordinate space, so they can't drift); this hook is what makes
 * that fixed drawing responsive. Width alone used to drive the scale, which
 * meant a tall CRQ still spilled past the bottom of the screen — so when
 * `baseHeight` is given the scale is the tighter of the two fits.
 */
export const useAutoFitScale = (
  baseWidth: number,
  {
    min = 0.58,
    max = 1.12,
    baseHeight,
    bottomGutter = 20,
    minViewportSlot = 240,
  }: AutoFitOptions = {}
) => {
  const [{ scale, widthFloored }, setFit] = useState({ scale: 1, widthFloored: false });
  const elRef = useRef<HTMLDivElement | null>(null);

  const measure = useCallback(() => {
    const node = elRef.current;
    if (!node) return;

    const width = node.clientWidth;
    if (!width) return;

    const widthRatio = width / baseWidth;
    let ratio = widthRatio;

    if (baseHeight) {
      // Measured off the node's viewport position rather than its own height —
      // scaling changes the height, and reading that back would feed the
      // ResizeObserver its own output.
      const slot = window.innerHeight - node.getBoundingClientRect().top - bottomGutter;
      if (slot >= minViewportSlot) ratio = Math.min(ratio, slot / baseHeight);
    }

    const next = Math.round(Math.min(max, Math.max(min, ratio)) * 1000) / 1000;
    // Horizontal scrolling is a width problem only — a height-driven floor must
    // not switch it on.
    const floored = widthRatio <= min;

    setFit((prev) =>
      Math.abs(prev.scale - next) < 0.002 && prev.widthFloored === floored
        ? prev
        : { scale: next, widthFloored: floored }
    );
  }, [baseWidth, baseHeight, min, max, bottomGutter, minViewportSlot]);

  const ref = useCallback(
    (node: HTMLDivElement | null) => {
      elRef.current = node;
      if (node) measure();
    },
    [measure]
  );

  useEffect(() => {
    const node = elRef.current;
    if (!node) return;

    let frame = 0;
    // rAF-deferred so a scale change can never re-enter the observer in the
    // same frame ("ResizeObserver loop" warnings).
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };

    schedule();
    window.addEventListener("resize", schedule);

    let observer: ResizeObserver | undefined;
    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(schedule);
      observer.observe(node);
      // The chrome above the canvas (selector, info strip) reflows as data
      // lands, which moves the canvas down without resizing it — body catches
      // that, the node alone wouldn't.
      if (document.body) observer.observe(document.body);
    }

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", schedule);
      observer?.disconnect();
    };
  }, [measure]);

  return { ref, scale, isFloored: widthFloored };
};
