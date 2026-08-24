import React from "react";
import { Box, Button, Chip, Tooltip, Typography, alpha } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import type { StageConfig } from "../../../types/stageWorkflow.types";
import SmartScrollContainer from "../../../../../components/common/SmartScrollContainer";
import { ImpactBatchExplorer } from "./impactAnalysis/ImpactBatchExplorer";
// import type { StageConfig } from "../../../types/stageWorkflow.types";

interface StagePreviewPanelProps {
  crqNo: string | null;
  stageConfig: StageConfig;
  /** Cancelled / already-reviewed / view-only stage - the explorer stays
   * readable (batches, drill-downs, Delta, Excel download) but the one
   * side-effecting control in it, "Refetch", is inert. */
  readOnly?: boolean;
  panelOpen: boolean;
  colors: any;
  setPanelOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * Right panel for the Impact Analysis stage's `StageReviewDialog` - the only
 * stage with a real live view (`ImpactBatchExplorer`) to show here. Every
 * other stage (MOP Create, MOP Validate, Scheduling, Activity Implement,
 * Closer) has no summary data to preview, so `StageReviewDialog` skips this
 * panel entirely for them instead of mounting it empty.
 */
export const StagePreviewPanel: React.FC<StagePreviewPanelProps> = ({
  crqNo,
  stageConfig,
  readOnly = false,
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
      {/* Collapse/expand is a view control, not an action, so it stays live
          even on a frozen stage - on a small screen the form auto-collapses,
          and disabling this was the only way back to it. */}
      <Tooltip title={panelOpen ? "Collapse" : "Expand"} arrow>
        <Button
          size="small"
          onClick={() => setPanelOpen((v) => !v)}
          startIcon={panelOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          sx={{ color: colors.accent, border: `1px solid ${alpha(colors.accent, 0.28)}` }}
        >
          {panelOpen ? "Hide Validation" : "Show Validation"}
        </Button>
      </Tooltip>
    </Box>

    <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
      <SmartScrollContainer fill>
        <Box sx={{ p: 2.5 }}>
          <ImpactBatchExplorer crqNo={crqNo} colors={colors} readOnly={readOnly} />
        </Box>
      </SmartScrollContainer>
    </Box>
  </Box>
);

export default StagePreviewPanel;
