import { Box, useTheme } from "@mui/material";
import React, { type JSX, useEffect, Suspense } from "react";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import { useTabColorTokens } from "../../../style/theme";
import PageLoader from "../../../components/loading/PageLoader";
import AnimatedOutlet from "../../../components/loading/AnimatedOutlet";

interface TeamManagementViewTabProps {
  setDynamicHeaderText: (text: string) => void;
  setDynamicHeaderIcon: (icon: JSX.Element) => void;
}

const HEADER_ICON = <PeopleAltIcon sx={{ color: "white" }} />;

const DashboardViewPage: React.FC<TeamManagementViewTabProps> = ({
  setDynamicHeaderText,
  setDynamicHeaderIcon,
}) => {
  /* ===================== HOOKS (ALWAYS FIRST) ===================== */
  const theme = useTheme();
  const bg = useTabColorTokens(theme);

  /* ===================== EFFECTS ===================== */

  // Header sync
  useEffect(() => {
    setDynamicHeaderText("Home");
    setDynamicHeaderIcon(HEADER_ICON);
  }, [setDynamicHeaderText, setDynamicHeaderIcon]);

  /* ===================== RENDER ===================== */

  return (
    <Box
      sx={{
        backgroundColor: bg.accentDim,

        maxWidth: "100%",
        height: "auto",
        pl: 8,
        overflow: "auto",

        "&::-webkit-scrollbar": {
          height: 8,
        },
        "&::-webkit-scrollbar-track": {
          backgroundColor:
            theme.palette.mode === "dark"
              ? theme.palette.background.paper
              : "#f1f1f1",
        },
        "&::-webkit-scrollbar-thumb": {
          borderRadius: 4,
        },
      }}
    >
      {/* -------- Content Area -------- */}
      <Box sx={{ pl: 2, pr: 2, pt: "45px", minHeight: "60vh" }}>
        <Suspense fallback={<PageLoader height="50vh" />}>
          <AnimatedOutlet />
        </Suspense>
      </Box>
    </Box>
  );
};

export default DashboardViewPage;
