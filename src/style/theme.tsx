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
  const colors = tokens(mode);
  const isDark = mode === "dark";

  return {
    palette: {
      mode,
      primary: {
        main: isDark ? colors.blueAccent[400] : colors.primary[500],
      },
      secondary: {
        main: colors.greenAccent[500],
      },
      background: {
        default: isDark ? colors.primary[600] : "#f8fafc",
        paper: isDark ? colors.primary[500] : "#ffffff",
      },
      text: {
        primary: isDark ? "#f1f5f9" : "#0f172a",
        secondary: isDark ? "#94a3b8" : "#475569",
      },
      divider: isDark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.08)",
    },

    shape: {
      borderRadius: 8,
    },

    typography: {
      fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
      fontSize: 13,
      h1: { fontSize: 40, fontWeight: 600 },
      h2: { fontSize: 32, fontWeight: 600 },
      h3: { fontSize: 24, fontWeight: 600 },
      h4: { fontSize: 20, fontWeight: 600 },
      h5: { fontSize: 16, fontWeight: 600 },
      h6: { fontSize: 14, fontWeight: 600 },
    },

    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: isDark ? colors.primary[600] : "#f8fafc",
            "&::-webkit-scrollbar": {
              width: 8,
              height: 8,
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: isDark ? "#374151" : "#cbd5e1",
              borderRadius: 8,
            },
          },
        },
      },

      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
          },
        },
      },

      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: isDark
              ? "0 4px 12px rgba(0,0,0,0.4)"
              : "0 4px 12px rgba(0,0,0,0.06)",
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
            borderRadius: 8,
            fontWeight: 600,
          },
        },
      },

      MuiTabs: {
        styleOverrides: {
          indicator: {
            height: 3,
            borderRadius: 3,
          },
        },
      },

      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: "none",
            fontWeight: 500,
            minHeight: 48,
          },
        },
      },

      MuiDrawer: {
        styleOverrides: {
          paper: {
            borderRight: "none",
          },
        },
      },
    },
  };
};

/* ================================
   COLOR MODE CONTEXT
================================ */

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

// import { createContext, useState, useMemo } from "react";
// import { createTheme, type ThemeOptions } from "@mui/material/styles";

// // Define the structure of the color tokens
// interface ColorTokens {
//   grey: { [key: number]: string };
//   primary: { [key: number]: string };
//   greenAccent: { [key: number]: string };
//   redAccent: { [key: number]: string };
//   blueAccent: { [key: number]: string };
// }

// // Define the function to generate color tokens based on the mode
// export const tokens = (mode: "light" | "dark"): ColorTokens => ({
//   ...(mode === "dark"
//     ? {
//         grey: {
//           100: "#e0e0e0",
//           200: "#c2c2c2",
//           300: "#a3a3a3",
//           400: "#858585",
//           500: "#666666",
//           600: "#525252",
//           700: "#3d3d3d",
//           800: "#292929",
//           900: "#141414",
//         },
//         primary: {
//           100: "#d0d1d5",
//           200: "#a1a4ab",
//           300: "#727681",
//           400: "#1F2A40",
//           450:"#202738",
//           500: "#141b2d",
//           600: "#101624",
//           700: "#0c101b",
//           800: "#080b12",
//           900: "#040509",
//           950: "#4d0024",
//         },
//         greenAccent: {
//           100: "#dbf5ee",
//           200: "#b7ebde",
//           300: "#94e2cd",
//           400: "#70d8bd",
//           500: "#4cceac",
//           600: "#3da58a",
//           700: "#2e7c67",
//           800: "#1e5245",
//           900: "#0f2922",
//         },
//         redAccent: {
//           100: "#f8dcdb",
//           200: "#f1b9b7",
//           300: "#e99592",
//           400: "#e2726e",
//           500: "#db4f4a",
//           600: "#af3f3b",
//           700: "#832f2c",
//           800: "#58201e",
//           900: "#2c100f",
//         },
//         blueAccent: {
//           100: "#e1e2fe",
//           200: "#c3c6fd",
//           300: "#a4a9fc",
//           400: "#868dfb",
//           500: "#6870fa",
//           600: "#535ac8",
//           700: "#3e4396",
//           800: "#2a2d64",
//           900: "#151632",
//         },
//       }
//     : {
//         grey: {
//           100: "#141414",
//           200: "#292929",
//           300: "#3d3d3d",
//           400: "#525252",
//           500: "#666666",
//           600: "#858585",
//           700: "#a3a3a3",
//           800: "#c2c2c2",
//           900: "#e0e0e0",
//         },
//         primary: {
//           100: "#040509",
//           200: "#080b12",
//           300: "#0c101b",
//           400: "#f2f0f0", // manually changed
//           500: "#141b2d",
//           600: "#1F2A40",
//           700: "#727681",
//           800: "#a1a4ab",
//           900: "#d0d1d5",
//           950: "#590e31",
//         },
//         greenAccent: {
//           100: "#0f2922",
//           200: "#1e5245",
//           300: "#2e7c67",
//           400: "#3da58a",
//           500: "#4cceac",
//           600: "#70d8bd",
//           700: "#94e2cd",
//           800: "#b7ebde",
//           900: "#dbf5ee",
//         },
//         redAccent: {
//           100: "#2c100f",
//           200: "#58201e",
//           300: "#832f2c",
//           400: "#af3f3b",
//           500: "#db4f4a",
//           600: "#e2726e",
//           700: "#e99592",
//           800: "#f1b9b7",
//           900: "#f8dcdb",
//         },
//         blueAccent: {
//           100: "#151632",
//           200: "#2a2d64",
//           300: "#3e4396",
//           400: "#535ac8",
//           500: "#6870fa",
//           600: "#868dfb",
//           700: "#a4a9fc",
//           800: "#c3c6fd",
//           900: "#e1e2fe",
//         },
//       }),
// });

// // Define the structure of the theme settings
// // interface ThemeSettings {
// //   palette: {
// //     mode: "light" | "dark";
// //     primary: { main: string };
// //     secondary: { main: string };
// //     neutral: { dark: string; main: string; light: string };
// //     background: { default: string };
// //   };
// //   typography: {
// //     fontFamily: string;
// //     fontSize: number;
// //     h1: { fontFamily: string; fontSize: number };
// //     h2: { fontFamily: string; fontSize: number };
// //     h3: { fontFamily: string; fontSize: number };
// //     h4: { fontFamily: string; fontSize: number };
// //     h5: { fontFamily: string; fontSize: number };
// //     h6: { fontFamily: string; fontSize: number };
// //   };
// // }

// // Generate the theme settings based on the mode
// export const themeSettings = (mode: "light" | "dark"): ThemeOptions => {
//   const colors = tokens(mode);
//   return {
//     palette: {
//       mode,
//       ...(mode === "dark"
//         ? {
//             primary: {
//               main: colors.primary[500],
//             },
//             secondary: {
//               main: colors.greenAccent[500],
//             },
//             neutral: {
//               dark: colors.grey[700],
//               main: colors.grey[500],
//               light: colors.grey[100],
//             },
//             background: {
//               default: colors.primary[500],
//             },
//           }
//         : {
//             primary: {
//               main: colors.primary[100],
//             },
//             secondary: {
//               main: colors.greenAccent[500],
//             },
//             neutral: {
//               dark: colors.grey[700],
//               main: colors.grey[500],
//               light: colors.grey[100],
//             },
//             background: {
//               default: "#fcfcfc",

//             },
//           }),
//     },
//     typography: {
//       fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
//       fontSize: 12,
//       h1: {
//         fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
//         fontSize: 40,
//       },
//       h2: {
//         fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
//         fontSize: 32,
//       },
//       h3: {
//         fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
//         fontSize: 24,
//       },
//       h4: {
//         fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
//         fontSize: 20,
//       },
//       h5: {
//         fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
//         fontSize: 16,
//       },
//       h6: {
//         fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
//         fontSize: 14,
//       },
//     },
//   };
// };

// // Define the context for color mode
// interface ColorModeContextType {
//   toggleColorMode: () => void;
// }

// export const ColorModeContext = createContext<ColorModeContextType>({
//   toggleColorMode: () => {},
// });

// // Custom hook for managing color mode
// export const useMode = (): [ReturnType<typeof createTheme>, ColorModeContextType] => {
//   const [mode, setMode] = useState<"light" | "dark">("light");

//   const colorMode = useMemo<ColorModeContextType>(
//     () => ({
//       toggleColorMode: () =>
//         setMode((prev) => (prev === "light" ? "dark" : "light")),
//     }),
//     []
//   );

//   const theme = useMemo(() => createTheme(themeSettings(mode)), [mode]);
//   return [theme, colorMode];
// };
