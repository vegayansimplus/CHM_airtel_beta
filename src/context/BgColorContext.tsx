import React, { createContext, useState, useContext, useEffect } from "react";
import { useTheme } from "@mui/material";
import { tokens } from "../style/theme";

export const BgColorContext = createContext<any>(undefined);

export const BgColorProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [bgColor, setBgColor] = useState<string>("");

  useEffect(() => {
    setBgColor(colors.primary[450] || colors.primary[500]);
  }, [theme.palette.mode]);

  return (
    <BgColorContext.Provider value={{ bgColor, setBgColor }}>
      {children}
    </BgColorContext.Provider>
  );
};

export const useBgColor = () => {
  const context = useContext(BgColorContext);
  if (!context) {
    throw new Error("useBgColor must be used within BgColorProvider");
  }
  return context;
};
