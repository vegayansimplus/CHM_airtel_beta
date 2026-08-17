import { useCallback, useEffect, useRef, useState } from "react";

interface AutoFitOptions {
  /** Never shrink past this — below it the canvas scrolls horizontally instead of becoming unreadable. */
  min?: number;
  /** Never grow past this, so a 4K monitor doesn't blow the diagram up. */
  max?: number;
}

/**
 * Scales a fixed-coordinate canvas to whatever width its container has.
 *
 * The flow diagram is drawn once at its design size (cards + SVG connectors
 * share one coordinate space, so they can't drift); this hook is what makes
 * that fixed drawing responsive — desktop gets it slightly enlarged, laptops
 * get it shrunk to fit with no horizontal scrollbar, and only genuinely narrow
 * viewports fall back to scrolling.
 */
export const useAutoFitScale = (baseWidth: number, { min = 0.58, max = 1.12 }: AutoFitOptions = {}) => {
  const [scale, setScale] = useState(1);
  const elRef = useRef<HTMLDivElement | null>(null);

  const measure = useCallback(
    (width: number) => {
      if (!width) return;
      const next = Math.round(Math.min(max, Math.max(min, width / baseWidth)) * 1000) / 1000;
      setScale((prev) => (Math.abs(prev - next) < 0.002 ? prev : next));
    },
    [baseWidth, min, max]
  );

  const ref = useCallback(
    (node: HTMLDivElement | null) => {
      elRef.current = node;
      if (node) measure(node.clientWidth);
    },
    [measure]
  );

  useEffect(() => {
    const node = elRef.current;
    if (!node || typeof ResizeObserver === "undefined") return;

    let frame = 0;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? 0;
      // rAF-deferred so a scale change can never re-enter the observer in the
      // same frame ("ResizeObserver loop" warnings).
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => measure(width));
    });

    observer.observe(node);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [measure]);

  return { ref, scale, isFloored: scale <= min + 0.001 };
};
