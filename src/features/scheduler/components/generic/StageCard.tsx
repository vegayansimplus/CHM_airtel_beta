import React from "react";
import { Box, Chip, IconButton, Stack, Tooltip, Typography, alpha } from "@mui/material";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import PauseRoundedIcon from "@mui/icons-material/PauseRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import type { StageConfig } from "../../types/stageWorkflow.types";
// import type { StageConfig } from "../../types/stageWorkflow.types";

interface StageCardProps {
  crq: any;
  stageConfig: StageConfig;
  colors: any;
  isOpen: boolean;
  isSelected: boolean;
  onToggle: () => void;
  onSelect: () => void;
  onStartPause: () => void;
}

const STATUS_COLOR: Record<string, "default" | "success" | "warning" | "info"> = {
  "In Progress": "info",
  Paused: "warning",
  Done: "success",
  Failed: "default",
  canceled: "default",
};

/**
 * Stage-agnostic replacement for the original `CrqCard`. Reads its status
 * value from `stageConfig.statusField`, so the same component renders
 * Impact Analysis, MOP Create, MOP Validate, Scheduling, Activity
 * Implement and Closer cards without modification.
 */
export const StageCard: React.FC<StageCardProps> = ({
  crq,
  stageConfig,
  colors,
  isOpen,
  isSelected,
  onToggle,
  onSelect,
  onStartPause,
}) => {
  const status = crq?.[stageConfig.statusField] ?? "Not Started";
  const isRunning = status === "In Progress";

  return (
    <Box
      className="crq-card"
      onClick={onSelect}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.25,
        px: 1.75,
        py: 1.1,
        mb: 1,
        borderRadius: colors.radiusL ?? 2,
        border: `1px solid ${isSelected ? colors.accent : colors.border}`,
        bgcolor: isSelected ? colors.accentDim : colors.surface,
        cursor: "pointer",
        transition: "all 0.15s ease",
        "&:hover": { borderColor: colors.accentBorder },
      }}
    >
      <IconButton
        size="small"
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
      >
        <ChevronRightRoundedIcon
          className={`expand-chevron ${isOpen ? "open" : ""}`}
          sx={{ fontSize: 18, color: colors.textSecondary }}
        />
      </IconButton>

      <Stack sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          sx={{
            fontSize: 12.5,
            fontWeight: 700,
            fontFamily: "monospace",
            color: colors.textPrimary,
          }}
          noWrap
        >
          {crq.crqNo}
        </Typography>
        {crq.description && (
          <Typography sx={{ fontSize: 11.5, color: colors.textDim }} noWrap>
            {crq.description}
          </Typography>
        )}
      </Stack>

      <Chip
        label={status}
        size="small"
        color={STATUS_COLOR[status] ?? "default"}
        sx={{ height: 22, fontSize: 11, fontWeight: 700 }}
      />

      <Tooltip title={isRunning ? `Pause ${stageConfig.label}` : `Start ${stageConfig.label}`}>
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onStartPause();
          }}
          sx={{
            width: 30,
            height: 30,
            borderRadius: "8px",
            bgcolor: isRunning ? alpha(colors.warning ?? "#f59e0b", 0.12) : colors.accentDim,
            color: isRunning ? colors.warning ?? "#f59e0b" : colors.accent,
          }}
        >
          {isRunning ? (
            <PauseRoundedIcon sx={{ fontSize: 17 }} />
          ) : (
            <PlayArrowRoundedIcon sx={{ fontSize: 17 }} />
          )}
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default StageCard;
