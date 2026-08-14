import React, { useEffect, useState } from "react";
import { Box, Dialog, useMediaQuery, useTheme } from "@mui/material";

import { DialogHeader } from "./DialogHeader";
import { FormPanel } from "./FormPanel";
import { PreviewPanel } from "./PreviewPanel";
import type { PlanInvDialogProps, ThemeColors } from "../../../types/crq.types";
import { SlideUpTransition } from "../../../../../components/common/SlideUpTransition";
import { classifyStatusValue, findHistoryEntry } from "../../../constants/workflowStages";

export const PlanInvDialog: React.FC<PlanInvDialogProps> = ({
  open,
  onClose,
  crq,
  colors,
  onSubmit,
}) => {
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("md"));
  const [panelOpen, setPanelOpen] = useState(true);

  // Derived properties
  const crqNo = crq?.crqNo ?? null;
  const crqId = crq?.crqId ?? null;
  const crqStatus = crq?.crqStatus ?? crq?.status ?? null;
  const isCancelled = ["canceled", "Cancel", "Canceled"].includes(
    crqStatus ?? "",
  );
  // Plan & Inventory review already recorded (Done), or the CRQ itself has
  // closed out entirely - either way, re-opening this dialog from a "view"
  // mode CrqActionPanel must let the user see what was submitted without
  // letting them resubmit it. crq.history[] (CRQ_MASTER_TBL, authoritative)
  // is checked first - the legacy crqReviewStatus field is only a fallback
  // for responses that don't carry history[], and can lag behind it once a
  // CRQ has migrated onto the new model.
  const reviewHistoryStatus = findHistoryEntry(crq, "review")?.status;
  const isDone =
    classifyStatusValue(reviewHistoryStatus ?? crq?.crqReviewStatus) === "completed" ||
    classifyStatusValue(crqStatus) === "completed";

  // Safe color defaults mapping to theme
  const dialogColors: ThemeColors = {
    accent: colors?.accent ?? theme.palette.primary.main,
    surface: colors?.surface ?? theme.palette.background.paper,
    border: colors?.border ?? theme.palette.divider,
    textPrimary: colors?.textPrimary ?? theme.palette.text.primary,
    textSecondary: colors?.textSecondary ?? theme.palette.text.secondary,
    isDark: colors?.isDark ?? theme.palette.mode === "dark",
  };

  useEffect(() => {
    if (isSmall) setPanelOpen(false);
  }, [isSmall]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen
      TransitionComponent={SlideUpTransition}
      keepMounted={false}
      PaperProps={{
        elevation: 0,
        sx: {
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          bgcolor: dialogColors.isDark ? "#131419" : "#F4F5F7",
          borderRadius: 0,
        },
      }}
    >
      <DialogHeader
        crqNo={crqNo}
        crqId={crqId}
        isCancelled={isCancelled}
        colors={dialogColors}
        onClose={onClose}
      />

      <Box
        sx={{ display: "flex", flex: 1, minHeight: 0, position: "relative" }}
      >
        <FormPanel
          crq={crq}
          crqNo={crqNo}
          crqId={crqId}
          isCancelled={isCancelled}
          isDone={isDone}
          panelOpen={panelOpen}
          setPanelOpen={setPanelOpen}
          colors={dialogColors}
          onClose={onClose}
          onExternalSubmit={onSubmit}
        />

        <PreviewPanel
          crqNo={crqNo}
          crqStatus={crqStatus}
          isCancelled={isCancelled}
          isDone={isDone}
          panelOpen={panelOpen}
          setPanelOpen={setPanelOpen}
          colors={dialogColors}
        />
      </Box>
    </Dialog>
  );
};

export default PlanInvDialog;
