import React, { useEffect, useState } from "react";
import {
  Box,
  Dialog,
  Fade,
  IconButton,
  Tooltip,
  alpha,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";


import { DialogHeader } from "./DialogHeader";
import { FormPanel } from "./FormPanel";
import { PreviewPanel } from "./PreviewPanel";
import type { PlanInvDialogProps, ThemeColors } from "../../../types/crq.types";
import { SlideUpTransition } from "../../../../../components/common/SlideUpTransition";

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
      maxWidth="xl"
      fullWidth
      fullScreen={isSmall}
      TransitionComponent={SlideUpTransition}
      keepMounted={false}
      PaperProps={{
        elevation: 0,
        sx: {
          height: isSmall ? "100%" : "88vh",
          maxHeight: 780,
          display: "flex",
          flexDirection: "column",
          bgcolor: dialogColors.isDark ? "#131419" : "#F4F5F7",
          borderRadius: isSmall ? 0 : "16px",
          border: `1px solid ${dialogColors.isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)"}`,
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
          panelOpen={panelOpen}
          setPanelOpen={setPanelOpen}
          colors={dialogColors}
          onClose={onClose}
          onExternalSubmit={onSubmit}
        />

        {/* Float Open Button */}
        <Fade in={!panelOpen && !isSmall}>
          <Tooltip title="Show validation form" placement="right" arrow>
            <IconButton
              onClick={() => setPanelOpen(true)}
              size="small"
              sx={{
                position: "absolute",
                left: 10,
                top: 20,
                zIndex: 40,
                bgcolor: dialogColors.surface,
              }}
            >
              <ChevronRightIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        </Fade>

        <PreviewPanel
          crqNo={crqNo}
          crqStatus={crqStatus}
          isCancelled={isCancelled}
          panelOpen={panelOpen}
          setPanelOpen={setPanelOpen}
          colors={dialogColors}
        />
      </Box>
    </Dialog>
  );
};

export default PlanInvDialog;
