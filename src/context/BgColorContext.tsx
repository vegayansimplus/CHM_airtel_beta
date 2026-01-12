import React, { createContext, useState, useContext } from "react";

interface BgColorContextProps {
  bgColor: string;
  setBgColor: React.Dispatch<React.SetStateAction<string>>;
}

export const BgColorContext = createContext<BgColorContextProps | undefined>(undefined);

interface BgColorProviderProps {
  children: React.ReactNode;
}

export const BgColorProvider: React.FC<BgColorProviderProps> = ({ children }) => {
  const [bgColor, setBgColor] = useState<string>("#263042");

  return (
    <BgColorContext.Provider value={{ bgColor, setBgColor }}>
      {children}
    </BgColorContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useBgColor = () => {
  const context = useContext(BgColorContext);
  if (!context) {
    throw new Error("useBgColor must be used within a BgColorProvider");
  }
  return context;
};
    