

import { useEffect, useRef, useState } from "react";

export const VIRTUAL_ROW_HEIGHT = 44; // px — must match the <TableRow> height
const BUFFER_ROWS = 10;               // rows rendered above and below viewport

interface VirtualSlice<T> {
  visibleRows:   T[];
  paddingTop:    number;
  paddingBottom: number;
}

export function useVirtualRows<T>(
  allRows: T[],
  containerRef: React.RefObject<HTMLElement | null>,
): VirtualSlice<T> {
  const total = allRows.length;
  const [slice, setSlice] = useState({ start: 0, end: Math.min(40, total) });
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const recalc = () => {
      const { scrollTop, clientHeight } = el;
      const firstVisible = Math.floor(scrollTop / VIRTUAL_ROW_HEIGHT);
      const visibleCount  = Math.ceil(clientHeight / VIRTUAL_ROW_HEIGHT);
      const start = Math.max(0, firstVisible - BUFFER_ROWS);
      const end   = Math.min(total, firstVisible + visibleCount + BUFFER_ROWS);
      setSlice((prev) =>
        prev.start === start && prev.end === end ? prev : { start, end },
      );
    };

    const onScroll = () => {
      if (rafRef.current !== null) return;
      rafRef.current = requestAnimationFrame(() => {
        recalc();
        rafRef.current = null;
      });
    };

    recalc();
    el.addEventListener("scroll", onScroll, { passive: true });

    // Also re-calc on resize (e.g. sidebar toggle)
    const ro = new ResizeObserver(recalc);
    ro.observe(el);

    return () => {
      el.removeEventListener("scroll", onScroll);
      ro.disconnect();
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [total, containerRef]);

  // When total changes (more pages loaded), clamp end
  useEffect(() => {
    setSlice((prev) => ({
      start: prev.start,
      end:   Math.min(total, Math.max(prev.end, 40)),
    }));
  }, [total]);

  return {
    visibleRows:   allRows.slice(slice.start, slice.end),
    paddingTop:    slice.start * VIRTUAL_ROW_HEIGHT,
    paddingBottom: Math.max(0, (total - slice.end) * VIRTUAL_ROW_HEIGHT),
  };
}