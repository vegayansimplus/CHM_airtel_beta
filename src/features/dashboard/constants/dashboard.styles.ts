import type { CSSProperties } from "react";
import type { Colors } from "../types/colorTypes";
import type { ToneKey } from "../types/dashboard.types";

/** Standard card shell shared by every dashboard widget, theme (light/dark) aware. */
export const getCardSx = (c: Colors) => ({
  borderRadius: "16px",
  border: `1.5px solid ${c.border}`,
  boxShadow: c.isDark ? "0 2px 12px rgba(0,0,0,.4)" : "0 2px 12px rgba(60,60,140,.06)",
  background: c.surface,
  transition: "box-shadow .22s ease, border-color .22s ease, transform .22s ease",
  "&:hover": {
    borderColor: c.borderHover,
    boxShadow: getHoverShadow(c),
    transform: "translateY(-2px)",
  },
});

export const getHoverShadow = (c: Colors) =>
  c.isDark ? "0 8px 26px rgba(0,0,0,.5)" : "0 8px 28px rgba(60,60,140,.11)";

/** Resolve a semantic tone key to its theme colour + soft background. */
export const getToneStyles = (c: Colors): Record<ToneKey, { color: string; light: string; border: string }> => ({
  accent: { color: c.accent, light: c.accentDim, border: c.accentBorder },
  success: { color: c.success, light: c.successDim, border: c.successBorder },
  warning: { color: c.warning, light: c.warningDim, border: c.warningBorder },
  danger: { color: c.danger, light: c.dangerDim, border: c.dangerBorder },
  info: { color: c.info, light: c.infoDim, border: c.infoBorder },
});

/** Staggered mount-in fade/slide, shared across widgets. */
export const fadeIn = (mounted: boolean, delay: number): CSSProperties => ({
  opacity: mounted ? 1 : 0,
  transform: mounted ? "none" : "translateY(12px)",
  transition: `opacity 0.45s ease ${delay}s, transform 0.45s ease ${delay}s`,
});

/** Expanding ring pulse — used for "live"/"now" markers (attendance timeline, active session dot). */
export const pulseRingSx = (color: string) => ({
  "@keyframes dashboardPulseRing": {
    "0%": { boxShadow: `0 0 0 0 ${color}` },
    "70%": { boxShadow: "0 0 0 8px transparent" },
    "100%": { boxShadow: "0 0 0 0 transparent" },
  },
  animation: "dashboardPulseRing 1.8s ease-out infinite",
});

/** Soft breathing glow, used behind the hero live timer while clocked in. */
export const pulseGlowSx = (color: string) => ({
  "@keyframes dashboardPulseGlow": {
    "0%, 100%": { opacity: 0.35, transform: "scale(0.96)" },
    "50%": { opacity: 0.7, transform: "scale(1.04)" },
  },
  animation: "dashboardPulseGlow 2.6s ease-in-out infinite",
  background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
});
