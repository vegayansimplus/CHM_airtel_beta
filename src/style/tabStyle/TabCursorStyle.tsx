
import { type SxProps, type Theme } from "@mui/material";

export const tabBoxOneStyle: SxProps<Theme> = {
  backgroundColor: "auto",
  maxWidth: "100%", 
  margin: "50px auto",
  height: "auto",
  pl:8,
  overflow: "hidden",
  "&::-webkit-scrollbar": {
    height: "8px",
  },
  "&::-webkit-scrollbar-track": {
    backgroundColor: "#f1f1f1",
  },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: "#888",
    borderRadius: "4px",
  },
  "&::-webkit-scrollbar-thumb:hover": {
    backgroundColor: "grey",
  },
};

export const tabBoxTwoStyle: SxProps<Theme> = {
  backgroundColor: "auto",
  display: "flex",
  height: "20px",
  alignItems: "center",
  alignContent: "center",
  justifyContent: "center",
};

export const tabCursorStyle: SxProps<Theme> = {
  "& .MuiTabs-indicator": {
    display: "flex",
    justifyContent: "center",
    backgroundColor: "transparent",
    "&::after": {
      content: '""',
      width: 0,
      height: 0,
      borderRight: "8px solid transparent",
      borderLeft: "8px solid transparent",
      borderBottom: "10px solid pink",
      position: "absolute",
      bottom: 0,
    },
  },
  "&.Mui-focusVisible": {
    backgroundColor: "red",
  },
  width: "100%",
  backgroundColor: "auto",
  boxShadow: 2,
  mt: 1,
};

