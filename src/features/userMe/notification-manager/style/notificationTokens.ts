import { type Theme } from "@mui/material/styles";
import { tokens } from "../../../../style/theme";

/**
 * Derives all notification UI tokens from the active MUI theme.
 * Call this inside any component: const tk = useNotifTokens(theme)
 */
export function useNotifTokens(theme: Theme) {
  const isDark = theme.palette.mode === "dark";
  const colors = tokens(theme.palette.mode);

  return {
    // ── Surfaces ──────────────────────────────────────────────────────────
    bg: theme.palette.background.default, // #0B1220 / #F8FAFC
    surface: theme.palette.background.paper, // #111827 / #FFFFFF
    surface2: isDark ? colors.primary[400] : colors.primary[900], // #1F2A40 / #d0d1d5

    // ── Borders ───────────────────────────────────────────────────────────
    border: theme.palette.divider,
    borderHover: isDark ? "rgba(255,255,255,0.13)" : "rgba(15,23,42,0.18)",

    // ── Primary accent (indigo) ────────────────────────────────────────────
    accent: theme.palette.primary.main, // #6366F1
    accentDim: isDark ? "rgba(99,102,241,0.13)" : "rgba(99,102,241,0.09)",
    accentBorder: isDark ? "rgba(99,102,241,0.35)" : "rgba(99,102,241,0.30)",

    // ── Success / green ───────────────────────────────────────────────────
    success: theme.palette.secondary.main, // #10B981
    successDim: isDark ? "rgba(16,185,129,0.13)" : "rgba(16,185,129,0.10)",
    successBorder: isDark ? "rgba(16,185,129,0.35)" : "rgba(16,185,129,0.28)",

    // ── Text ──────────────────────────────────────────────────────────────
    textPrimary: theme.palette.text.primary,
    textSecondary: theme.palette.text.secondary,
    textDim: isDark ? colors.grey[600] : colors.grey[400],

    // ── Info (blue-accent from tokens) ────────────────────────────────────
    info: isDark ? colors.blueAccent[400] : colors.blueAccent[500],
    infoDim: isDark ? "rgba(104,112,250,0.12)" : "rgba(104,112,250,0.09)",
    infoBorder: isDark ? "rgba(104,112,250,0.30)" : "rgba(104,112,250,0.25)",

    // ── Danger (red-accent from tokens) ───────────────────────────────────
    danger: isDark ? colors.redAccent[400] : colors.redAccent[500],
    dangerDim: isDark ? "rgba(219,79,74,0.12)" : "rgba(219,79,74,0.08)",
    dangerBorder: isDark ? "rgba(219,79,74,0.30)" : "rgba(219,79,74,0.22)",

    // ── Radius (matches theme.shape.borderRadius = 10) ────────────────────
    radius: `${theme.shape.borderRadius}px`,
    radiusL: `${(theme.shape.borderRadius as number) + 4}px`,
    radiusXL: `${(theme.shape.borderRadius as number) + 8}px`,

    // ── Toggle track off-state ────────────────────────────────────────────
    trackOff: isDark ? "rgba(255,255,255,0.09)" : "rgba(15,23,42,0.10)",
    trackOffBorder: isDark ? "rgba(255,255,255,0.11)" : "rgba(15,23,42,0.14)",

    isDark,
  };
}

export type NotifTokens = ReturnType<typeof useNotifTokens>;

/** Generates the minimal keyframe + toggle CSS block using live theme values */
export function buildToggleCss(tk: NotifTokens): string {
  return `
    .ntf-tog{position:relative;width:38px;height:21px;display:inline-block;flex-shrink:0}
    .ntf-tog input{display:none}
    .ntf-track{
      position:absolute;inset:0;
      background:${tk.trackOff};
      border:1px solid ${tk.trackOffBorder};
      border-radius:11px;cursor:pointer;
      transition:background .2s,border-color .2s
    }
    .ntf-tog input:checked~.ntf-track{
      background:${tk.success};
      border-color:${tk.success}
    }
    .ntf-thumb{
      position:absolute;top:3px;left:3px;
      width:13px;height:13px;
      background:#fff;border-radius:50%;
      transition:transform .2s cubic-bezier(.4,0,.2,1);
      pointer-events:none
    }
    .ntf-tog input:checked~.ntf-track .ntf-thumb{transform:translateX(17px)}
  `;
}
