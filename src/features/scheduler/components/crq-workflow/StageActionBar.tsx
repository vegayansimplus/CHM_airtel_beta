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

  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      flexWrap="wrap"
      spacing={1.5}
      sx={{
        bgcolor: colors.surface,
        border: `1px solid ${colors.border}`,
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
        <Stack direction="row" spacing={1}>
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
              borderRadius: "10px",
              bgcolor: isRunning ? colors.danger : colors.success,
              "&:hover": { bgcolor: isRunning ? colors.danger : colors.success, opacity: 0.9 },
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
              borderRadius: "10px",
              borderColor: colors.accentBorder,
              color: colors.accent,
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
            bgcolor: mode === "view" ? colors.successDim : colors.trackOff,
            color: mode === "view" ? colors.success : colors.textDim,
          }}
        />
      )}
    </Stack>
  );
};

export default StageActionBar;
