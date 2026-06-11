import { useEffect, useRef, useState } from "react";

/**
 * Must match the rendered TableRow height.
 * MUI Table size="small" with py:0.75 ≈ 40px.
 */
export const VIRTUAL_ROW_HEIGHT = 40;
const BUFFER_ROWS = 8;

interface VirtualSlice<T> {
  visibleRows: T[];
  paddingTop: number;
  paddingBottom: number;
}

export function useVirtualRows<T>(
  allRows: T[],
  containerRef: React.RefObject<HTMLElement>,
): VirtualSlice<T> {
  const total = allRows.length;
  const [slice, setSlice] = useState({ start: 0, end: Math.min(30, total) });
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const recalc = () => {
      const { scrollTop, clientHeight } = el;
      const first = Math.floor(scrollTop / VIRTUAL_ROW_HEIGHT);
      const visible = Math.ceil(clientHeight / VIRTUAL_ROW_HEIGHT);
      const start = Math.max(0, first - BUFFER_ROWS);
      const end = Math.min(total, first + visible + BUFFER_ROWS);
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
    return () => {
      el.removeEventListener("scroll", onScroll);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [total, containerRef]);

  return {
    visibleRows: allRows.slice(slice.start, slice.end),
    paddingTop: slice.start * VIRTUAL_ROW_HEIGHT,
    paddingBottom: Math.max(0, (total - slice.end) * VIRTUAL_ROW_HEIGHT),
  };
}

// import { useEffect, useRef, useState } from "react";

// /**
//  * ROW_HEIGHT must match the rendered TableRow height in RosterGrid.
//  * MUI Table size="small" with py:0.75 ≈ 40 px.
//  */
// export const VIRTUAL_ROW_HEIGHT = 40;

// /** Extra rows kept rendered above and below the visible viewport. */
// const BUFFER_ROWS = 6;

// interface VirtualSlice<T> {
//   visibleRows: T[];
//   /** px to pad above the rendered slice so total scroll height is correct */
//   paddingTop: number;
//   /** px to pad below the rendered slice so total scroll height is correct */
//   paddingBottom: number;
// }

// /**
//  * Slices only the rows visible in `containerRef`'s scroll viewport.
//  *
//  * @param allRows   Full accumulated array of rows (grows as pages load)
//  * @param containerRef  Ref attached to the scrollable TableContainer
//  */
// export function useVirtualRows<T>(
//   allRows: T[],
//   containerRef: React.RefObject<HTMLElement>
// ): VirtualSlice<T> {
//   const [slice, setSlice] = useState({ start: 0, end: 25 });
//   const rafRef = useRef<number | null>(null);

//   useEffect(() => {
//     const el = containerRef.current;
//     if (!el) return;

//     const recalc = () => {
//       const scrollTop = el.scrollTop;
//       const clientHeight = el.clientHeight;

//       const firstVisible = Math.floor(scrollTop / VIRTUAL_ROW_HEIGHT);
//       const visibleCount = Math.ceil(clientHeight / VIRTUAL_ROW_HEIGHT);

//       const start = Math.max(0, firstVisible - BUFFER_ROWS);
//       const end = Math.min(
//         allRows.length,
//         firstVisible + visibleCount + BUFFER_ROWS
//       );

//       setSlice((prev) =>
//         prev.start === start && prev.end === end ? prev : { start, end }
//       );
//     };

//     // Throttle with rAF to avoid layout thrash on every pixel
//     const onScroll = () => {
//       if (rafRef.current !== null) return;
//       rafRef.current = requestAnimationFrame(() => {
//         recalc();
//         rafRef.current = null;
//       });
//     };

//     recalc();
//     el.addEventListener("scroll", onScroll, { passive: true });

//     return () => {
//       el.removeEventListener("scroll", onScroll);
//       if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
//     };
//   }, [allRows.length, containerRef]);

//   return {
//     visibleRows: allRows.slice(slice.start, slice.end),
//     paddingTop: slice.start * VIRTUAL_ROW_HEIGHT,
//     paddingBottom: Math.max(0, (allRows.length - slice.end) * VIRTUAL_ROW_HEIGHT),
//   };
// }
