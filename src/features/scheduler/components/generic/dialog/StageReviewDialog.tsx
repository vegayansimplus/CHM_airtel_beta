import React, { useEffect, useState } from "react";
import { Box, Dialog, IconButton, useMediaQuery, useTheme } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
// import type { StageConfig } from "../../../types/stageWorkflow.types";
import { GenericFormPanel } from "./GenericFormPanel";
import { StagePreviewPanel } from "./StagePreviewPanel";
import type { StageConfig } from "../../../types/stageWorkflow.types";

interface StageReviewDialogProps {
  open: boolean;
  onClose: () => void;
  crq: any;
  colors: any;
  stageConfig: StageConfig;
  onSubmitDone: (values: Record<string, any>, crq: any) => Promise<{ success: boolean }>;
}

const CANCELLED_STATUSES = ["canceled", "Cancel", "Canceled"];

/**
 * Stage-agnostic replacement for `PlanInvDialog`. Every stage (Impact
 * Analysis, MOP Create, MOP Validate, Scheduling, Activity Implement,
 * Closer, ...) renders through this exact same dialog - only the
 * `stageConfig` prop changes.
 */
export const StageReviewDialog: React.FC<StageReviewDialogProps> = ({
  open,
  onClose,
  crq,
  colors,
  stageConfig,
  onSubmitDone,
}) => {
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("md"));
  const [panelOpen, setPanelOpen] = useState(true);

  const crqNo = crq?.crqNo ?? null;
  const crqStatus = crq?.crqStatus ?? crq?.status ?? null;
  const isCancelled = CANCELLED_STATUSES.includes(crqStatus ?? "");

  useEffect(() => {
    if (isSmall) setPanelOpen(false);
  }, [isSmall]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      fullScreen={isSmall}
      keepMounted={false}
      PaperProps={{
        elevation: 0,
        sx: {
          height: isSmall ? "100%" : "88vh",
          maxHeight: 780,
          display: "flex",
          flexDirection: "column",
          bgcolor: colors.isDark ? "#131419" : "#F4F5F7",
          borderRadius: isSmall ? 0 : "16px",
          border: `1px solid ${colors.border}`,
        },
      }}
    >
      <Box
        sx={{
          px: 2.5,
          py: 1.5,
          display: "flex",
          alignItems: "center",
          gap: 1,
          borderBottom: `1px solid ${colors.border}`,
        }}
      >
        <Box sx={{ fontWeight: 800, fontSize: 14 }}>
          {stageConfig.label} — {crqNo ?? "N/A"}
        </Box>
        <Box sx={{ flex: 1 }} />
        <IconButton size="small" onClick={onClose}>
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      <Box sx={{ display: "flex", flex: 1, minHeight: 0, position: "relative" }}>
        <GenericFormPanel
          crq={crq}
          stageConfig={stageConfig}
          isCancelled={isCancelled}
          panelOpen={panelOpen}
          setPanelOpen={setPanelOpen}
          colors={colors}
          onClose={onClose}
          onSubmitDone={onSubmitDone}
        />

        <StagePreviewPanel
          crqNo={crqNo}
          crqStatus={crqStatus}
          stageConfig={stageConfig}
          isCancelled={isCancelled}
          panelOpen={panelOpen}
          setPanelOpen={setPanelOpen}
          colors={colors}
        />
      </Box>
    </Dialog>
  );
};

export default StageReviewDialog;
