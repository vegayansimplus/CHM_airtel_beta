import type { CSSProperties } from "react";
import type { Colors } from "../types/colorTypes";
import type { TaskStatus, ToneKey } from "../types/dashboard.types";

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

export const getTaskStatusStyles = (c: Colors): Record<TaskStatus, { bg: string; color: string; ring: string }> => ({
  Done: { bg: c.successDim, color: c.success, ring: c.successBorder },
  Urgent: { bg: c.warningDim, color: c.warning, ring: c.warningBorder },
  Pending: { bg: c.surface2, color: c.textSecondary, ring: c.border },
  Rostering: { bg: c.accentDim, color: c.accent, ring: c.accentBorder },
});

/** Staggered mount-in fade/slide, shared across widgets. */
export const fadeIn = (mounted: boolean, delay: number): CSSProperties => ({
  opacity: mounted ? 1 : 0,
  transform: mounted ? "none" : "translateY(12px)",
  transition: `opacity 0.45s ease ${delay}s, transform 0.45s ease ${delay}s`,
});
