import { createContext, useState, useMemo } from "react";
import { createTheme, type ThemeOptions } from "@mui/material/styles";

/* ================================
   COLOR TOKENS
================================ */

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
   THEME SETTINGS
================================ */

export const themeSettings = (mode: "light" | "dark"): ThemeOptions => {
  const isDark = mode === "dark";

  return {
    palette: {
      mode,

      primary: {
        main: "#6366F1", // Indigo 500 (Premium SaaS accent)
      },

      secondary: {
        main: "#10B981", // Emerald (success / positive)
      },

      background: {
        default: isDark ? "#0B1220" : "#F8FAFC", // Page background
        paper: isDark ? "#111827" : "#FFFFFF", // Cards / surfaces
      },

      text: {
        primary: isDark ? "#F1F5F9" : "#0F172A",
        secondary: isDark ? "#94A3B8" : "#475569",
      },

      divider: isDark ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.08)",
    },

    shape: {
      borderRadius: 10,
    },

    typography: {
      fontFamily: ["Inter", "Source Sans Pro", "sans-serif"].join(","),
      fontSize: 14,

      h1: { fontSize: 36, fontWeight: 700 },
      h2: { fontSize: 28, fontWeight: 700 },
      h3: { fontSize: 22, fontWeight: 600 },
      h4: { fontSize: 18, fontWeight: 600 },
      h5: { fontSize: 16, fontWeight: 600 },
      h6: { fontSize: 14, fontWeight: 600 },
    },

    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: isDark ? "#0B1220" : "#F8FAFC",

            "&::-webkit-scrollbar": {
              width: 8,
              height: 8,
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: isDark ? "#1F2937" : "#CBD5E1",
              borderRadius: 8,
            },
          },
        },
      },

      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            border: isDark
              ? "1px solid rgba(255,255,255,0.04)"
              : "1px solid rgba(15,23,42,0.06)",
          },
        },
      },

      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 14,
            backgroundColor: isDark ? "#111827" : "#FFFFFF",
            boxShadow: isDark
              ? "0 8px 24px rgba(0,0,0,0.35)"
              : "0 8px 24px rgba(15,23,42,0.08)",
            border: "1px solid rgba(255,255,255,0.04)",
          },
        },
      },

      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },
        styleOverrides: {
          root: {
            textTransform: "none",
            fontWeight: 600,
            borderRadius: 8,
            padding: "8px 18px",
          },
          containedPrimary: {
            backgroundColor: "#6366F1",
            "&:hover": {
              backgroundColor: "#4F46E5",
            },
          },
        },
      },

      MuiTabs: {
        styleOverrides: {
          indicator: {
            height: 3,
            borderRadius: 3,
            backgroundColor: "#6366F1",
          },
        },
      },

      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: "none",
            fontWeight: 500,
            fontSize: 14,
            minHeight: 48,
            color: isDark ? "#94A3B8" : "#475569",

            "&.Mui-selected": {
              color: "#6366F1",
              fontWeight: 600,
            },
          },
        },
      },

      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: isDark ? "#0F172A" : "#FFFFFF",
            borderRight: "none",
          },
        },
      },
    },
  };
};


interface ColorModeContextType {
  toggleColorMode: () => void;
}

export const ColorModeContext = createContext<ColorModeContextType>({
  toggleColorMode: () => {},
});

/* ================================
   USE MODE HOOK
================================ */

export const useMode = (): [
  ReturnType<typeof createTheme>,
  ColorModeContextType,
] => {
  const [mode, setMode] = useState<"light" | "dark">("light");

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () =>
        setMode((prev) => (prev === "light" ? "dark" : "light")),
    }),
    [],
  );

  const theme = useMemo(() => createTheme(themeSettings(mode)), [mode]);

  return [theme, colorMode];
};
