import React from "react";
import { Box, Button, Chip, Tooltip, Typography, alpha } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import type { ThemeColors } from "../../../types/crq.types";
import { CheckPointSummaryPreview } from "./CheckPointSummaryPreview/CheckPointSummaryPreview";
// import { CheckPointSummaryPreview } from "./CheckPointSummaryPreview";
// import { ThemeColors } from "../../types/crq.types";

interface Props {
  crqNo: string | null;
  crqStatus: string | null;
  isCancelled: boolean;
  panelOpen: boolean;
  colors: ThemeColors;
  setPanelOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const PreviewPanel: React.FC<Props> = ({
  crqNo,
  crqStatus,
  isCancelled,
  panelOpen,
  colors,
  setPanelOpen,
}) => {
  return (
    <Box
      component="section"
      sx={{
        flex: 1,
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        bgcolor: colors.isDark ? alpha("#fff", 0.02) : "#F4F5F7",
      }}
    >
      <Box
        sx={{
          px: 2.5,
          py: 1.2,
          borderBottom: `1px solid ${colors.border}`,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        <Typography
          variant="body2"
          sx={{ fontWeight: 700, fontSize: 13, color: colors.textPrimary }}
        >
          CheckPoint Summary Preview
        </Typography>
        <Chip
          label="Live"
          size="small"
          sx={{
            height: 20,
            fontSize: 10,
            fontWeight: 700,
            bgcolor: alpha(colors.accent, 0.1),
            color: colors.accent,
          }}
        />
        <Box sx={{ flex: 1 }} />

        <Tooltip title={panelOpen ? "Collapse" : "Expand"} arrow>
          <Button
            size="small"
            onClick={() => setPanelOpen((v) => !v)}
            startIcon={panelOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
            disabled={isCancelled}
            sx={{
              color: colors.accent,
              border: `1px solid ${alpha(colors.accent, 0.28)}`,
            }}
          >
            {panelOpen ? "Hide Validation" : "Show Validation"}
          </Button>
        </Tooltip>
      </Box>

      <Box sx={{ flex: 1, overflowY: "auto", p: 2.5 }}>
        <CheckPointSummaryPreview crqNo={crqNo} crqStatus={crqStatus} />
      </Box>
    </Box>
  );
};
