import React from "react";
import { Box, Button, Chip, Tooltip, Typography, alpha } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import type { StageConfig } from "../../../types/stageWorkflow.types";
// import type { StageConfig } from "../../../types/stageWorkflow.types";

interface StagePreviewPanelProps {
  crqNo: string | null;
  crqStatus: string | null;
  stageConfig: StageConfig;
  isCancelled: boolean;
  panelOpen: boolean;
  colors: any;
  setPanelOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

/** Stage-agnostic summary preview, reused across every stage's dialog. */
export const StagePreviewPanel: React.FC<StagePreviewPanelProps> = ({
  crqNo,
  crqStatus,
  stageConfig,
  isCancelled,
  panelOpen,
  colors,
  setPanelOpen,
}) => (
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
      <Typography variant="body2" sx={{ fontWeight: 700, fontSize: 13, color: colors.textPrimary }}>
        {stageConfig.label} Summary
      </Typography>
      <Chip
        label="Live"
        size="small"
        sx={{ height: 20, fontSize: 10, fontWeight: 700, bgcolor: alpha(colors.accent, 0.1), color: colors.accent }}
      />
      <Box sx={{ flex: 1 }} />
      <Tooltip title={panelOpen ? "Collapse" : "Expand"} arrow>
        <Button
          size="small"
          onClick={() => setPanelOpen((v) => !v)}
          startIcon={panelOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          disabled={isCancelled}
          sx={{ color: colors.accent, border: `1px solid ${alpha(colors.accent, 0.28)}` }}
        >
          {panelOpen ? "Hide Validation" : "Show Validation"}
        </Button>
      </Tooltip>
    </Box>

    <Box sx={{ flex: 1, overflowY: "auto", p: 2.5 }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 220,
          border: "1.5px dashed",
          borderColor: "divider",
          borderRadius: 3,
          p: 4,
          gap: 1.5,
          bgcolor: "background.paper",
        }}
      >
        <AssignmentTurnedInOutlinedIcon sx={{ fontSize: 26, color: "text.disabled" }} />
        <Typography variant="subtitle2" fontWeight={600} color="text.primary">
          {stageConfig.label} Summary Preview
        </Typography>
        <Typography variant="body2" color="text.secondary">
          CRQ: <strong>{crqNo || "N/A"}</strong> &nbsp;•&nbsp; Status: <strong>{crqStatus || "N/A"}</strong>
        </Typography>
      </Box>
    </Box>
  </Box>
);

export default StagePreviewPanel;
