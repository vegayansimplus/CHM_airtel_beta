import React from "react";
import {
  Box,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  alpha,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EditNoteRoundedIcon from "@mui/icons-material/EditNoteRounded";

import { useTabColorTokens } from "../../../../../style/theme";
import { SlideUpTransition } from "../../../../../components/common/SlideUpTransition";
import { useAttributeUpdate } from "../hooks/useAttributeUpdate";
import { AttributeStageStepper } from "./AttributeStageStepper";
import { AttributeCrqHeaderCard } from "./AttributeCrqHeaderCard";
import { AttributeApiChips } from "./AttributeApiChips";
import { RemedySubStatusBar } from "./RemedySubStatusBar";
import { AttributeSection } from "./AttributeSection";
import { AttributeDialogFooter } from "./AttributeDialogFooter";

/**
 * "Attribute Update" dialog: for the selected CRQ it shows, per CMS stage,
 * every attribute updated in Remedy / CAB / the Planning Tool. Fully driven
 * by the attributeUpdate Redux slice — mount it once on the hosting page and
 * open it via `useOpenAttributeUpdate()`.
 */
export const AttributeUpdateDialog: React.FC = () => {
  const theme = useTheme();
  const colors = useTabColorTokens(theme);
  const isSmall = useMediaQuery(theme.breakpoints.down("md"));

  const {
    dialogOpen,
    crq,
    isLoading,
    error,
    stageList,
    selectedStageIndex,
    isStageLocked,
    stageView,
    close,
    selectStage,
    selectRemedyStatus,
    goToNextStage,
    goToPreviousStage,
  } = useAttributeUpdate();

  return (
    <Dialog
      open={dialogOpen}
      onClose={close}
      maxWidth="lg"
      fullWidth
      fullScreen={isSmall}
      TransitionComponent={SlideUpTransition}
      keepMounted={false}
      PaperProps={{
        elevation: 0,
        sx: {
          height: isSmall ? "100%" : "88vh",
          maxHeight: 820,
          display: "flex",
          flexDirection: "column",
          bgcolor: colors.isDark ? "#131419" : "#F4F5F7",
          borderRadius: isSmall ? 0 : "16px",
          border: `1px solid ${colors.border}`,
        },
      }}
    >
      <DialogTitle
        sx={{
          p: 0,
          flexShrink: 0,
          bgcolor: colors.surface,
          borderBottom: `1px solid ${colors.border}`,
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={1.5}
          sx={{ px: { xs: 2, sm: 2.5 }, py: 1.5 }}
        >
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: 2,
              background: `linear-gradient(135deg, ${alpha(colors.accent, 0.18)} 0%, ${alpha(colors.accent, 0.08)} 100%)`,
              border: `1px solid ${alpha(colors.accent, 0.2)}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <EditNoteRoundedIcon sx={{ color: colors.accent, fontSize: 19 }} />
          </Box>

          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 700, fontSize: 15, color: colors.textPrimary }}
          >
            Attribute Update
          </Typography>

          <Box
            sx={{
              width: "1px",
              height: 16,
              bgcolor: colors.border,
              display: { xs: "none", sm: "block" },
            }}
          />

          <Stack
            direction="row"
            spacing={0.75}
            sx={{ display: { xs: "none", sm: "flex" } }}
          >
            {crq?.crqNo && (
              <Chip
                label={crq.crqNo}
                size="small"
                sx={{
                  height: 22,
                  fontWeight: 600,
                  fontSize: 10.5,
                  bgcolor: alpha(colors.accent, 0.1),
                  color: colors.accent,
                  border: `1px solid ${alpha(colors.accent, 0.2)}`,
                }}
              />
            )}
            {crq?.crqId !== null && crq?.crqId !== undefined && (
              <Chip
                label={`ID: ${crq.crqId}`}
                size="small"
                variant="outlined"
                sx={{
                  height: 22,
                  fontSize: 10.5,
                  color: colors.textSecondary,
                  borderColor: colors.border,
                }}
              />
            )}
          </Stack>

          <Box sx={{ flex: 1 }} />

          <Tooltip title="Close" arrow>
            <IconButton
              onClick={close}
              size="small"
              sx={{
                color: colors.textSecondary,
                width: 30,
                height: 30,
                borderRadius: 1.5,
              }}
            >
              <CloseIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        </Stack>
      </DialogTitle>

      {!!stageList.length && (
        <AttributeStageStepper
          stages={stageList}
          selectedIndex={selectedStageIndex}
          onSelectStage={selectStage}
          interactive={!isStageLocked}
          colors={colors}
        />
      )}

      <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", p: 2.25 }}>
        {isLoading && (
          <Stack alignItems="center" spacing={1.5} sx={{ py: 8 }}>
            <CircularProgress size={28} />
            <Typography sx={{ fontSize: 13, color: colors.textSecondary }}>
              Loading attribute details…
            </Typography>
          </Stack>
        )}

        {!isLoading && error && (
          <Typography color="error" sx={{ fontSize: 13.5, py: 4 }}>
            {error}
          </Typography>
        )}

        {!isLoading && !error && crq && stageView && (
          <>
            <AttributeCrqHeaderCard
              crq={crq}
              stageView={stageView}
              colors={colors}
            />
            <AttributeApiChips colors={colors} />

            {stageView.stage.remedyStatuses.length > 1 && (
              <RemedySubStatusBar
                statuses={stageView.stage.remedyStatuses}
                activeIndex={stageView.stage.remedyStatuses.indexOf(
                  stageView.activeRemedyStatus,
                )}
                onSelect={selectRemedyStatus}
                colors={colors}
              />
            )}

            <AttributeSection
              system="remedy"
              attributes={stageView.remedyAttributes}
              colors={colors}
            />
            <AttributeSection
              system="cab"
              attributes={stageView.cabAttributes}
              colors={colors}
            />
            <AttributeSection
              system="planningTool"
              attributes={stageView.planningToolVisible}
              backendAttributes={stageView.planningToolBackend}
              colors={colors}
            />

            <AttributeDialogFooter
              canGoPrevious={selectedStageIndex > 0}
              canGoNext={selectedStageIndex < stageList.length - 1}
              onPrevious={goToPreviousStage}
              onNext={goToNextStage}
              onCancel={close}
              navigationEnabled={!isStageLocked}
              colors={colors}
            />
          </>
        )}
      </Box>
    </Dialog>
  );
};

export default AttributeUpdateDialog;
