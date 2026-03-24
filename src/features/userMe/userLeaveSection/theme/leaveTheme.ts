import { createTheme, type ThemeOptions } from "@mui/material/styles";

const sharedTokens: ThemeOptions = {
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: '"DM Sans", "Helvetica Neue", sans-serif',
    h6: { fontWeight: 700, fontSize: "1.05rem" },
    body2: { fontSize: "0.8rem" },
    caption: { fontSize: "0.72rem" },
  },
  components: {
    MuiPaper: {
      defaultProps: { elevation: 0, variant: "outlined" },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 6 },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: { textTransform: "none", fontWeight: 500, minHeight: 40 },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { fontSize: "0.85rem", paddingBlock: 12 },
        head: { fontWeight: 600 },
      },
    },
  },
};

export const lightTheme = createTheme({
  ...sharedTokens,
  palette: {
    mode: "light",
    primary: { main: "#2563EB" },
    background: { default: "#F8FAFC", paper: "#FFFFFF" },
  },
});

export const darkTheme = createTheme({
  ...sharedTokens,
  palette: {
    mode: "dark",
    primary: { main: "#3B82F6" },
    background: { default: "#0F172A", paper: "#1E293B" },
  },
});