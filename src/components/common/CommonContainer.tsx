import { Box, useTheme } from "@mui/material";
import { tokens } from "../../style/theme";

const CommonContainer = ({ children }: { children: React.ReactNode }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <Box
      sx={{
        // marginTop: "5px",
        maxWidth: "100%",
        overflow: "auto",
        height: {
          xs: "calc(100vh - 50px)", 
          sm: "calc(100vh - 50px)", 
          md: "calc(100vh - 40px)", 
          lg: "auto",
          xl: "calc(100vh - 158px)",
        },
        minHeight: "500px", 
        p: {
          xs: "0px 8px",
          sm: "4px 12px",
          md: "4px 18px",
          // lg: "4px 40px",
          // xl: "10px 50px",
        },
        bgcolor: theme.palette.mode === "dark" ? colors.primary[400] : "#f7f9fa",
      }}
    >
      {children}
    </Box>
  );
};

export default CommonContainer;
