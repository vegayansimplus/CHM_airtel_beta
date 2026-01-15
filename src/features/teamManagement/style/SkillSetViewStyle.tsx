import { useTheme } from "@mui/material/styles";
import { tokens } from "../../../style/theme";




export const useCustomTheme = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    return { theme, colors };
  };

  
  
export const topTitleCardStyle = {
    bgcolor: "white",
    display: "flex",
    justifyContent: "space-between",
    p: 1,
    mb:1,
 
    

};

export const bubbleStyle = {
    p: 0.6,
    m: 0.2,
    height: "55px",
    width: "30%",
    backgroundImage:
        "radial-gradient(circle, rgba(255,255,255,0.9), rgba(173,216,230,0.8), rgba(240,128,128,0.7), rgba(221,160,221,0.6))",
    backgroundSize: "cover",
    borderRadius: "50%", // Optional for a circular bubble look
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)", // Adds a floating effect
};

export const topTitleCardStyle2 = {
    p: 0.6, m: 0.2, height: "55px", width: "23%",
    bgcolor: "#e3f5ff",
}

export const topTitleCardStyle3 = {
    p: 0.6, m: 0.2, height: "55px", width: "35%",
    bgcolor: "#e3f5ff",

}

export const topTypographyStyle = {
    textAlign: "center"

}

export const topTypographyStyle1 = {
    textAlign: "center",
    fontWeight: "bold"
}
export const cardLevelStyle = {
    width: "20%",
    height: "43px",
    pt: 1.5,
    justifyItems: "center",
    bgcolor: "pink",
    textAlign: "center",
    fontWeight: "bold"
}

export const cardLevelStyle2 = {

    pl: 0.5,
    pr: 0.5,
    textAlign: "center",
    width: "20%",
    color: "black",

}



export const headerStyle = {
    textAlign: "center",
    backgroundColor: "#7d2a18",
    color: "white",
    border: "1px solid white",
    p: 0.5,
    width: "auto",
  };
  
 export const bodyStyle = {
    textAlign: "center",
    border: "1px solid white",
    p: 0.1,
    // ml:1,
    width: "auto",
  };
  