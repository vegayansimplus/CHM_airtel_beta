import { createContext, useMemo, useState } from "react";
import {
  alpha,
  createTheme,
  darken,
  lighten,
  type Theme,
  type ThemeOptions,
} from "@mui/material/styles";

// ─── Color Token Types ─────────────────────────────────────────────────────────
interface ColorTokens {
  grey: { [key: number]: string };
  primary: { [key: number]: string };
  greenAccent: { [key: number]: string };
  redAccent: { [key: number]: string };
  blueAccent: { [key: number]: string };
}

export const tokens = (mode: "light" | "dark"): ColorTokens => ({
  ...(mode === "dark"
    ? {
        grey: {
          100: "#e0e0e0",
          200: "#c2c2c2",
          300: "#a3a3a3",
          400: "#858585",
          500: "#666666",
          600: "#525252",
          700: "#3d3d3d",
          800: "#292929",
          900: "#141414",
        },
        primary: {
          100: "#d0d1d5",
          200: "#a1a4ab",
          300: "#727681",
          400: "#1F2A40",
          450: "#202738",
          500: "#141b2d",
          600: "#101624",
          700: "#0c101b",
          800: "#080b12",
          900: "#040509",
          950: "#4d0024",
        },
        greenAccent: {
          100: "#dbf5ee",
          200: "#b7ebde",
          300: "#94e2cd",
          400: "#70d8bd",
          500: "#4cceac",
          600: "#3da58a",
          700: "#2e7c67",
          800: "#1e5245",
          900: "#0f2922",
        },
        redAccent: {
          100: "#f8dcdb",
          200: "#f1b9b7",
          300: "#e99592",
          400: "#e2726e",
          500: "#db4f4a",
          600: "#af3f3b",
          700: "#832f2c",
          800: "#58201e",
          900: "#2c100f",
        },
        blueAccent: {
          100: "#e1e2fe",
          200: "#c3c6fd",
          300: "#a4a9fc",
          400: "#868dfb",
          500: "#6870fa",
          600: "#535ac8",
          700: "#3e4396",
          800: "#2a2d64",
          900: "#151632",
        },
      }
    : {
        grey: {
          100: "#141414",
          200: "#292929",
          300: "#3d3d3d",
          400: "#525252",
          500: "#666666",
          600: "#858585",
          700: "#a3a3a3",
          800: "#c2c2c2",
          900: "#e0e0e0",
        },
        primary: {
          100: "#040509",
          200: "#080b12",
          300: "#0c101b",
          400: "#f2f0f0",
          500: "#141b2d",
          600: "#1F2A40",
          700: "#727681",
          800: "#a1a4ab",
          900: "#d0d1d5",
          950: "#590e31",
        },
        greenAccent: {
          100: "#0f2922",
          200: "#1e5245",
          300: "#2e7c67",
          400: "#3da58a",
          500: "#4cceac",
          600: "#70d8bd",
          700: "#94e2cd",
          800: "#b7ebde",
          900: "#dbf5ee",
        },
        redAccent: {
          100: "#2c100f",
          200: "#58201e",
          300: "#832f2c",
          400: "#af3f3b",
          500: "#db4f4a",
          600: "#e2726e",
          700: "#e99592",
          800: "#f1b9b7",
          900: "#f8dcdb",
        },
        blueAccent: {
          100: "#151632",
          200: "#2a2d64",
          300: "#3e4396",
          400: "#535ac8",
          500: "#6870fa",
          600: "#868dfb",
          700: "#a4a9fc",
          800: "#c3c6fd",
          900: "#e1e2fe",
        },
      }),
});

/* ================================
   BRAND / ACCENT COLOR OPTIONS
   The Header's theme-control swatches pick one of these as
   theme.palette.primary — every accent-driven surface in the
   app (buttons, links, sidebar highlights, focus rings) follows.
================================ */

export interface BrandColorOption {
  label: string;
  value: string;
}

export const BRAND_COLOR_OPTIONS: BrandColorOption[] = [
  { label: "Airtel Blue", value: "#185FA5" },
  { label: "Violet", value: "#6C5CE7" },
  { label: "Sky", value: "#0984E3" },
  { label: "Emerald", value: "#00B894" },
  { label: "Amber", value: "#F39C12" },
  { label: "Rose", value: "#B81D4C" },
];

export const DEFAULT_BRAND_COLOR = BRAND_COLOR_OPTIONS[0].value;

/* ================================
   THEME SETTINGS
================================ */

export const themeSettings = (
  mode: "light" | "dark",
  primaryColor: string = DEFAULT_BRAND_COLOR,
): ThemeOptions => {
  const isDark = mode === "dark";

  const primaryMain = primaryColor;
  const primaryLight = lighten(primaryColor, 0.28);
  const primaryDark = darken(primaryColor, 0.28);
  const focusRing = alpha(primaryMain, isDark ? 0.1 : 0.06);
  const focusRingStrong = alpha(primaryMain, isDark ? 0.2 : 0.12);

  return {
    palette: {
      mode,

      primary: {
        main: primaryMain, // User-selectable brand accent — driven by the header theme control
        light: primaryLight,
        dark: primaryDark,
      },

      secondary: {
        main: "#0F6E56", // Teal-green — success / positive states
        light: "#1D9E75",
        dark: "#085041",
      },

      error: {
        main: "#E24B4A",
        light: "#F09595",
        dark: "#A32D2D",
      },

      warning: {
        main: "#EF9F27",
        light: "#FAC775",
        dark: "#854F0B",
      },

      info: {
        main: "#378ADD",
        light: "#85B7EB",
        dark: "#185FA5",
      },

      success: {
        main: "#1D9E75",
        light: "#5DCAA5",
        dark: "#0F6E56",
      },

      background: {
        default: isDark ? "#0C1117" : "#F4F6F9", // Page / outer shell
        paper: isDark ? "#131C2B" : "#FFFFFF", // Cards / sidebar / header
      },

      text: {
        primary: isDark ? "#E8EDF5" : "#0D1B2A",
        secondary: isDark ? "#7B90A8" : "#4A5568",
        disabled: isDark ? "#3E5068" : "#A0AEC0",
      },

      divider: isDark ? "rgba(255,255,255,0.06)" : "rgba(13,27,42,0.08)",

      action: {
        hover: isDark ? "rgba(255,255,255,0.04)" : "rgba(13,27,42,0.04)",
        selected: focusRingStrong,
        disabledBackground: isDark
          ? "rgba(255,255,255,0.06)"
          : "rgba(13,27,42,0.06)",
        disabled: isDark ? "#3E5068" : "#A0AEC0",
      },
    },

    shape: {
      borderRadius: 8,
    },

    typography: {
      fontFamily: ["Inter", "Source Sans Pro", "sans-serif"].join(","),
      fontSize: 14,

      h1: { fontSize: 34, fontWeight: 700, letterSpacing: "-0.02em" },
      h2: { fontSize: 26, fontWeight: 700, letterSpacing: "-0.01em" },
      h3: { fontSize: 20, fontWeight: 600 },
      h4: { fontSize: 17, fontWeight: 600 },
      h5: { fontSize: 15, fontWeight: 600 },
      h6: { fontSize: 13, fontWeight: 600 },

      body1: { fontSize: 14, lineHeight: 1.6 },
      body2: { fontSize: 12, lineHeight: 1.5 },

      caption: {
        fontSize: 11,
        letterSpacing: "0.04em",
        color: isDark ? "#7B90A8" : "#4A5568",
      },

      overline: {
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
      },
    },

    components: {
      // ── Global baseline ────────────────────────────────────────────────
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: isDark ? "#0C1117" : "#F4F6F9",
            "&::-webkit-scrollbar": { width: 6, height: 6 },
            "&::-webkit-scrollbar-track": {
              background: "transparent",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: isDark ? "#1E2D40" : "#CBD5E1",
              borderRadius: 6,
            },
            "&::-webkit-scrollbar-thumb:hover": {
              backgroundColor: isDark ? "#2A3E57" : "#94A3B8",
            },
          },
        },
      },

      // ── Paper ──────────────────────────────────────────────────────────
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            border: isDark
              ? "1px solid rgba(255,255,255,0.05)"
              : "1px solid rgba(13,27,42,0.07)",
          },
          elevation1: {
            boxShadow: isDark
              ? "0 1px 4px rgba(0,0,0,0.4)"
              : "0 1px 4px rgba(13,27,42,0.08)",
          },
        },
      },

      // ── Card ───────────────────────────────────────────────────────────
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            backgroundColor: isDark ? "#131C2B" : "#FFFFFF",
            border: isDark
              ? "1px solid rgba(255,255,255,0.05)"
              : "1px solid rgba(13,27,42,0.07)",
            boxShadow: isDark
              ? "0 4px 20px rgba(0,0,0,0.3)"
              : "0 4px 20px rgba(13,27,42,0.06)",
          },
        },
      },

      // ── Button ─────────────────────────────────────────────────────────
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: {
            textTransform: "none",
            fontWeight: 600,
            borderRadius: 8,
            padding: "7px 18px",
            fontSize: 13,
            transition: "background 0.15s, opacity 0.15s",
          },
          containedPrimary: {
            backgroundColor: primaryMain,
            color: "#FFFFFF",
            "&:hover": { backgroundColor: primaryDark },
            "&.Mui-disabled": {
              backgroundColor: isDark
                ? "rgba(255,255,255,0.07)"
                : "rgba(13,27,42,0.07)",
              color: isDark ? "#3E5068" : "#A0AEC0",
            },
          },
          outlinedPrimary: {
            borderColor: alpha(primaryMain, isDark ? 0.4 : 0.35),
            color: primaryMain,
            "&:hover": { backgroundColor: focusRing },
          },
          textPrimary: {
            color: primaryMain,
            "&:hover": { backgroundColor: focusRing },
          },
        },
      },

      // ── IconButton ─────────────────────────────────────────────────────
      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            "&:hover": {
              backgroundColor: isDark
                ? "rgba(255,255,255,0.06)"
                : "rgba(13,27,42,0.05)",
            },
          },
        },
      },

      // ── TextField / OutlinedInput ──────────────────────────────────────
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            fontSize: 13,
            backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "#FFFFFF",
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: isDark
                ? "rgba(255,255,255,0.1)"
                : "rgba(13,27,42,0.15)",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: isDark
                ? "rgba(255,255,255,0.2)"
                : "rgba(13,27,42,0.3)",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: primaryMain,
              borderWidth: 1.5,
            },
          },
          input: {
            padding: "8px 12px",
          },
        },
      },

      MuiInputLabel: {
        styleOverrides: {
          root: {
            fontSize: 13,
            "&.Mui-focused": { color: primaryMain },
          },
        },
      },

      // ── Select ─────────────────────────────────────────────────────────
      MuiSelect: {
        styleOverrides: {
          select: {
            fontSize: 13,
            paddingTop: 8,
            paddingBottom: 8,
          },
        },
      },

      MuiMenuItem: {
        styleOverrides: {
          root: {
            fontSize: 13,
            minHeight: 36,
            "&:hover": { backgroundColor: focusRing },
            "&.Mui-selected": {
              backgroundColor: focusRingStrong,
              "&:hover": { backgroundColor: alpha(primaryMain, isDark ? 0.28 : 0.16) },
            },
          },
        },
      },

      // ── Checkbox ───────────────────────────────────────────────────────
      MuiCheckbox: {
        styleOverrides: {
          root: {
            padding: 4,
            color: isDark ? "rgba(255,255,255,0.2)" : "rgba(13,27,42,0.25)",
            "&.Mui-checked": { color: primaryMain },
            "&.Mui-disabled": {
              color: isDark ? "rgba(255,255,255,0.1)" : "rgba(13,27,42,0.12)",
            },
          },
        },
      },

      // ── Chip ───────────────────────────────────────────────────────────
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            fontWeight: 500,
            fontSize: 11,
          },
          sizeSmall: {
            height: 20,
            fontSize: 10,
          },
        },
      },

      // ── Tabs ───────────────────────────────────────────────────────────
      MuiTabs: {
        styleOverrides: {
          root: {
            minHeight: 44,
          },
          indicator: {
            height: 2,
            borderRadius: 2,
            backgroundColor: primaryMain,
          },
        },
      },

      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: "none",
            fontWeight: 500,
            fontSize: 13,
            minHeight: 44,
            color: isDark ? "#7B90A8" : "#4A5568",
            "&.Mui-selected": {
              color: primaryMain,
              fontWeight: 600,
            },
            "&:hover": {
              color: isDark ? primaryLight : primaryDark,
              backgroundColor: focusRing,
            },
          },
        },
      },

      // ── Accordion ──────────────────────────────────────────────────────
      MuiAccordion: {
        styleOverrides: {
          root: {
            borderRadius: "10px !important",
            border: isDark
              ? "1px solid rgba(255,255,255,0.06)"
              : "1px solid rgba(13,27,42,0.08)",
            boxShadow: "none",
            "&:before": { display: "none" },
            "&.Mui-expanded": { margin: 0 },
          },
        },
      },

      MuiAccordionSummary: {
        styleOverrides: {
          root: {
            minHeight: "44px !important",
            borderRadius: "10px 10px 0 0",
            backgroundColor: isDark
              ? "rgba(255,255,255,0.02)"
              : "rgba(13,27,42,0.015)",
            "&.Mui-expanded": {
              borderBottom: isDark
                ? "1px solid rgba(255,255,255,0.06)"
                : "1px solid rgba(13,27,42,0.08)",
            },
            "& .MuiAccordionSummary-content": {
              my: "10px !important",
              display: "flex",
              alignItems: "center",
              gap: 10,
            },
          },
        },
      },

      MuiAccordionDetails: {
        styleOverrides: {
          root: { padding: 0 },
        },
      },

      // ── Table ──────────────────────────────────────────────────────────
      MuiTableCell: {
        styleOverrides: {
          root: {
            fontSize: 12,
            borderColor: isDark
              ? "rgba(255,255,255,0.05)"
              : "rgba(13,27,42,0.07)",
            padding: "8px 12px",
          },
          head: {
            fontSize: 11,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            color: isDark ? "#7B90A8" : "#4A5568",
            backgroundColor: isDark
              ? "rgba(255,255,255,0.02)"
              : "rgba(13,27,42,0.015)",
          },
        },
      },

      MuiTableRow: {
        styleOverrides: {
          root: {
            "&:hover td": {
              backgroundColor: isDark
                ? "rgba(255,255,255,0.02)"
                : "rgba(13,27,42,0.018)",
            },
          },
        },
      },

      // ── Alert ──────────────────────────────────────────────────────────
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            fontSize: 12,
            alignItems: "center",
          },
          standardInfo: {
            backgroundColor: isDark ? "rgba(55,138,221,0.12)" : "#E6F1FB",
            color: isDark ? "#85B7EB" : "#0C447C",
            border: isDark
              ? "1px solid rgba(55,138,221,0.25)"
              : "1px solid #B5D4F4",
          },
          standardWarning: {
            backgroundColor: isDark ? "rgba(239,159,39,0.12)" : "#FAEEDA",
            color: isDark ? "#FAC775" : "#633806",
            border: isDark
              ? "1px solid rgba(239,159,39,0.25)"
              : "1px solid #FAC775",
          },
          standardError: {
            backgroundColor: isDark ? "rgba(226,75,74,0.12)" : "#FCEBEB",
            color: isDark ? "#F09595" : "#791F1F",
            border: isDark
              ? "1px solid rgba(226,75,74,0.25)"
              : "1px solid #F7C1C1",
          },
          standardSuccess: {
            backgroundColor: isDark ? "rgba(29,158,117,0.12)" : "#E1F5EE",
            color: isDark ? "#5DCAA5" : "#085041",
            border: isDark
              ? "1px solid rgba(29,158,117,0.25)"
              : "1px solid #9FE1CB",
          },
        },
      },

      // ── Drawer ─────────────────────────────────────────────────────────
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: isDark ? "#0E1621" : "#FFFFFF",
            borderRight: isDark
              ? "1px solid rgba(255,255,255,0.06)"
              : "1px solid rgba(13,27,42,0.08)",
          },
        },
      },

      // ── Tooltip ────────────────────────────────────────────────────────
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            fontSize: 11,
            fontWeight: 500,
            borderRadius: 6,
            backgroundColor: isDark ? "#1E2D40" : "#0D1B2A",
            color: isDark ? "#E8EDF5" : "#F4F6F9",
            padding: "5px 10px",
          },
        },
      },

      // ── Divider ────────────────────────────────────────────────────────
      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: isDark
              ? "rgba(255,255,255,0.06)"
              : "rgba(13,27,42,0.08)",
          },
        },
      },
    },
  };
};

/* ================================
   COLOR MODE + BRAND COLOR CONTEXT
================================ */

interface ColorModeContextType {
  toggleColorMode: () => void;
  primaryColor: string;
  setPrimaryColor: (color: string) => void;
}

export const ColorModeContext = createContext<ColorModeContextType>({
  toggleColorMode: () => {},
  primaryColor: DEFAULT_BRAND_COLOR,
  setPrimaryColor: () => {},
});

/* ================================
   USE MODE HOOK
================================ */

const MODE_STORAGE_KEY = "chm.themeMode";
const BRAND_COLOR_STORAGE_KEY = "chm.brandColor";

function readStoredMode(): "light" | "dark" {
  const stored = window.localStorage.getItem(MODE_STORAGE_KEY);
  return stored === "dark" ? "dark" : "light";
}

function readStoredBrandColor(): string {
  return window.localStorage.getItem(BRAND_COLOR_STORAGE_KEY) || DEFAULT_BRAND_COLOR;
}

export const useMode = (): [
  ReturnType<typeof createTheme>,
  ColorModeContextType,
] => {
  const [mode, setMode] = useState<"light" | "dark">(readStoredMode);
  const [primaryColor, setPrimaryColorState] = useState<string>(readStoredBrandColor);

  const colorMode = useMemo<ColorModeContextType>(
    () => ({
      toggleColorMode: () =>
        setMode((prev) => {
          const next = prev === "light" ? "dark" : "light";
          window.localStorage.setItem(MODE_STORAGE_KEY, next);
          return next;
        }),
      primaryColor,
      setPrimaryColor: (color: string) => {
        window.localStorage.setItem(BRAND_COLOR_STORAGE_KEY, color);
        setPrimaryColorState(color);
      },
    }),
    [primaryColor],
  );

  const theme = useMemo(
    () => createTheme(themeSettings(mode, primaryColor)),
    [mode, primaryColor],
  );

  return [theme, colorMode];
};

/* ================================
   TAB COLOR TOKENS
================================ */

export function useTabColorTokens(theme: Theme) {
  const isDark = theme.palette.mode === "dark";
  const colors = tokens(theme.palette.mode);
  const primaryMain = theme.palette.primary.main;

  return {
    // ── Surfaces ──────────────────────────────────────────────────────────
    bg: theme.palette.background.default, // #0C1117 / #F4F6F9
    surface: theme.palette.background.paper, // #131C2B / #FFFFFF
    surface2: isDark ? "#1A2436" : "#F0F4F8", // Slightly elevated surface

    // ── Borders ───────────────────────────────────────────────────────────
    border: theme.palette.divider,
    borderHover: isDark ? "rgba(255,255,255,0.12)" : "rgba(13,27,42,0.18)",

    // ── Primary accent (user-selectable brand colour) ─────────────────────
    accent: primaryMain,
    accentLight: isDark ? theme.palette.primary.light : theme.palette.primary.dark,
    accentDim: alpha(primaryMain, isDark ? 0.1 : 0.05),
    accentBorder: alpha(primaryMain, isDark ? 0.3 : 0.2),

    // ── Success / teal ────────────────────────────────────────────────────
    success: theme.palette.secondary.main, // #0F6E56
    successDim: isDark ? "rgba(15,110,86,0.12)" : "rgba(15,110,86,0.07)",
    successBorder: isDark ? "rgba(15,110,86,0.30)" : "rgba(15,110,86,0.20)",

    // ── Danger / red ──────────────────────────────────────────────────────
    danger: isDark ? colors.redAccent[400] : colors.redAccent[500],
    dangerDim: isDark ? "rgba(226,75,74,0.12)" : "rgba(226,75,74,0.07)",
    dangerBorder: isDark ? "rgba(226,75,74,0.30)" : "rgba(226,75,74,0.20)",

    // ── Warning / amber ───────────────────────────────────────────────────
    warning: isDark ? "#FAC775" : "#854F0B",
    warningDim: isDark ? "rgba(239,159,39,0.12)" : "rgba(239,159,39,0.07)",
    warningBorder: isDark ? "rgba(239,159,39,0.30)" : "rgba(239,159,39,0.20)",

    // ── Info / lighter blue ───────────────────────────────────────────────
    info: isDark ? colors.blueAccent[400] : colors.blueAccent[500],
    infoDim: isDark ? "rgba(104,112,250,0.10)" : "rgba(104,112,250,0.07)",
    infoBorder: isDark ? "rgba(104,112,250,0.28)" : "rgba(104,112,250,0.22)",

    // ── Text ──────────────────────────────────────────────────────────────
    textPrimary: theme.palette.text.primary,
    textSecondary: theme.palette.text.secondary,
    textDim: isDark ? "#3E5068" : "#A0AEC0",

    // ── Sidebar / nav specific ────────────────────────────────────────────
    sidebarBg: isDark ? "#0E1621" : "#FFFFFF",
    selectedRow: alpha(primaryMain, isDark ? 0.12 : 0.07),
    selectedBar: primaryMain,

    // ── Radius ────────────────────────────────────────────────────────────
    radius: `${theme.shape.borderRadius}px`, // 8px
    radiusL: `${(theme.shape.borderRadius as number) + 4}px`, // 12px
    radiusXL: `${(theme.shape.borderRadius as number) + 8}px`, // 16px

    // ── Toggle track ──────────────────────────────────────────────────────
    trackOff: isDark ? "rgba(255,255,255,0.08)" : "rgba(13,27,42,0.09)",
    trackOffBorder: isDark ? "rgba(255,255,255,0.10)" : "rgba(13,27,42,0.12)",

    isDark,
  };
}
