import React, { useEffect, useState } from "react";
import { Box, Dialog, Drawer, IconButton, useMediaQuery, useTheme } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
// import type { StageConfig } from "../../../types/stageWorkflow.types";
import { GenericFormPanel } from "./GenericFormPanel";
import { StagePreviewPanel } from "./StagePreviewPanel";
import { classifyStatusValue, findHistoryEntry } from "../../../constants/workflowStages";
import type { StageConfig } from "../../../types/stageWorkflow.types";
import { useSchedulerAccess } from "../../../hook/useSchedulerAccess";

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
  // Read here rather than accepted as a prop, so no call site can open this
  // dialog in a writable state for a view-only user by forgetting to pass it.
  const { canEdit } = useSchedulerAccess();

  const crqNo = crq?.crqNo ?? null;
  const crqStatus = crq?.crqStatus ?? crq?.status ?? null;
  const isCancelled = CANCELLED_STATUSES.includes(crqStatus ?? "");
  // This stage's own outcome already recorded (Done), or the CRQ itself has
  // closed out entirely - either way, re-opening the Review dialog from a
  // "view" mode CrqActionPanel must let the user see what was submitted
  // without letting them resubmit it. crq.history[] (CRQ_MASTER_TBL,
  // authoritative) is checked first - the legacy per-stage status field is
  // only a fallback for responses that don't carry history[], and can lag
  // behind it once a CRQ has migrated onto the new model.
  const stageHistoryStatus = findHistoryEntry(crq, stageConfig.key)?.status;
  const isDone =
    classifyStatusValue(stageHistoryStatus ?? crq?.[stageConfig.statusField]) === "completed" ||
    classifyStatusValue(crqStatus) === "completed";

  // Only Impact Analysis has a right panel (the live ImpactBatchExplorer) to
  // pair the form with - every other stage renders GenericFormPanel alone,
  // so its collapse toggle and this small-screen auto-collapse would have
  // nothing to reveal.
  const hasPreviewPanel = stageConfig.key === "impactanalysis";

  useEffect(() => {
    if (isSmall && hasPreviewPanel) setPanelOpen(false);
  }, [isSmall, hasPreviewPanel]);

  const header = (
    <Box
      sx={{
        px: 2.5,
        py: 1.5,
        display: "flex",
        alignItems: "center",
        gap: 1,
        borderBottom: `1px solid ${colors.border}`,
        flexShrink: 0,
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
  );

  const formPanel = (
    <GenericFormPanel
      crq={crq}
      stageConfig={stageConfig}
      isCancelled={isCancelled}
      isDone={isDone}
      readOnly={!canEdit}
      panelOpen={panelOpen}
      setPanelOpen={setPanelOpen}
      hasPreviewPanel={hasPreviewPanel}
      open={open}
      colors={colors}
      onClose={onClose}
      onSubmitDone={onSubmitDone}
    />
  );

  // No preview content to pair the form with -> a full-height, form-width
  // sidebar anchored to the left edge instead of a fullscreen two-pane
  // dialog, so there's no empty canvas to the right of the form.
  if (!hasPreviewPanel) {
    return (
      <Drawer
        anchor="left"
        open={open}
        onClose={onClose}
        keepMounted={false}
        PaperProps={{
          elevation: 0,
          sx: {
            width: { xs: "100%", sm: 400 },
            maxWidth: "100%",
            display: "flex",
            flexDirection: "column",
            bgcolor: colors.isDark ? "#131419" : "#F4F5F7",
          },
        }}
      >
        {header}
        {formPanel}
      </Drawer>
    );
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen
      keepMounted={false}
      PaperProps={{
        elevation: 0,
        sx: {
          display: "flex",
          flexDirection: "column",
          bgcolor: colors.isDark ? "#131419" : "#F4F5F7",
        },
      }}
    >
      {header}

      <Box sx={{ display: "flex", flex: 1, minHeight: 0, position: "relative" }}>
        {formPanel}

        <StagePreviewPanel
          crqNo={crqNo}
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
