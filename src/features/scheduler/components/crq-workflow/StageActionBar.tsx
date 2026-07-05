import React from "react";
import { Box, Button, Chip, Stack, Typography } from "@mui/material";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import PauseRoundedIcon from "@mui/icons-material/PauseRounded";
import VisibilityIcon from "@mui/icons-material/Visibility";
import type { Colors } from "../../types/colorTypes";

export type StageMode = "editable" | "view" | "locked";

interface StageActionBarProps {
  stageLabel: string;
  mode: StageMode;
  isRunning: boolean;
  onStartPause: () => void;
  onReview: () => void;
  isBusy?: boolean;
  colors: Colors;
}

const MODE_COPY: Record<StageMode, { badge: string; note: string }> = {
  editable: {
    badge: "Editable",
    note: "This is the active stage — its output is editable and actionable here.",
  },
  view: {
    badge: "View only",
    note: "Completed stage — output is retained for reference and is read-only.",
  },
  locked: {
    badge: "Locked",
    note: "This stage has not been reached yet for this CRQ.",
  },
};

/**
 * Mode banner + Start/Pause/Review actions for the currently selected
 * stage. "Review {stage}" opens the same review dialog every stage page
 * already uses (PlanInvDialog / StageReviewDialog) - there is no separate
 * "complete" action in the real workflow beyond submitting that dialog.
 */
export const StageActionBar: React.FC<StageActionBarProps> = ({
  stageLabel,
  mode,
  isRunning,
  onStartPause,
  onReview,
  isBusy,
  colors,
}) => {
  const copy = MODE_COPY[mode];
  const badgePalette =
    mode === "editable"
      ? { bg: colors.successDim, fg: colors.success }
      : { bg: colors.trackOff, fg: colors.textDim };
  const bannerBg = mode === "editable" ? colors.successDim : colors.trackOff;
  const bannerBorder = mode === "editable" ? colors.successBorder : colors.border;

  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      flexWrap="wrap"
      spacing={1.5}
      sx={{
        bgcolor: bannerBg,
        border: `1px solid ${bannerBorder}`,
        borderRadius: colors.radiusL,
        px: 2.25,
        py: 1.6,
        mb: 2,
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1.4}>
        <Chip
          label={copy.badge}
          size="small"
          sx={{
            height: 24,
            fontWeight: 800,
            fontSize: 11,
            textTransform: "uppercase",
            letterSpacing: "0.4px",
            bgcolor: badgePalette.bg,
            color: badgePalette.fg,
          }}
        />
        <Box>
          <Typography sx={{ fontSize: 14, fontWeight: 800, color: colors.textPrimary }}>
            {stageLabel}
          </Typography>
          <Typography sx={{ fontSize: 12, color: colors.textSecondary, mt: 0.2 }}>
            {copy.note}
          </Typography>
        </Box>
      </Stack>

      {mode === "editable" ? (
        <Stack direction="row" spacing={1.1}>
          <Button
            variant="contained"
            size="small"
            disabled={isBusy}
            onClick={onStartPause}
            startIcon={
              isRunning ? <PauseRoundedIcon sx={{ fontSize: 16 }} /> : <PlayArrowRoundedIcon sx={{ fontSize: 16 }} />
            }
            sx={{
              textTransform: "none",
              fontWeight: 700,
              fontSize: 13,
              borderRadius: "10px",
              px: 2.2,
              py: 1,
              boxShadow: isRunning ? "none" : "0 4px 12px rgba(15,115,80,0.28)",
              border: isRunning ? `1.5px solid ${colors.dangerBorder}` : "none",
              background: isRunning ? "transparent" : "linear-gradient(135deg,#15a06b,#0f7350)",
              color: isRunning ? colors.danger : "#fff",
              "&:hover": {
                boxShadow: isRunning ? "none" : "0 6px 16px rgba(15,115,80,0.36)",
                background: isRunning ? colors.dangerDim : "linear-gradient(135deg,#15a06b,#0f7350)",
                transform: "translateY(-1px)",
              },
            }}
          >
            {isRunning ? "Pause" : "Start Stage"}
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={onReview}
            startIcon={<VisibilityIcon sx={{ fontSize: 16 }} />}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              fontSize: 13,
              borderRadius: "10px",
              px: 2,
              py: 1,
              borderWidth: "1.5px",
              borderColor: colors.accentBorder,
              color: colors.accent,
              bgcolor: colors.surface,
              "&:hover": { bgcolor: colors.accentDim, borderColor: colors.accent },
            }}
          >
            Review {stageLabel}
          </Button>
        </Stack>
      ) : (
        <Chip
          label={mode === "view" ? "✓ Completed" : "Not reached"}
          size="small"
          sx={{
            height: 28,
            fontWeight: 800,
            fontSize: 12,
            px: 0.5,
            bgcolor: mode === "view" ? colors.successDim : colors.trackOff,
            color: mode === "view" ? colors.success : colors.textDim,
          }}
        />
      )}
    </Stack>
  );
};

export default StageActionBar;
