import React from "react";
import { Box, Chip, Collapse, IconButton, Stack, Tooltip, Typography, alpha } from "@mui/material";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import PauseRoundedIcon from "@mui/icons-material/PauseRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import type { StageConfig } from "../../types/stageWorkflow.types";
import { StageHistoryPanel } from "./StageHistoryPanel";

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
  const currentIdx = crq?.history?.findIndex((h: any) => h.current) ?? -1;
  const historyCount =
    crq?.history?.filter(
      (h: any, i: number) => !h.current && (currentIdx === -1 || i < currentIdx),
    ).length ?? 0;

  return (
    <Box
      className="crq-card"
      sx={{
        mb: 1,
        borderRadius: colors.radiusL ?? 2,
        border: `1px solid ${isSelected ? colors.accent : colors.border}`,
        bgcolor: isSelected ? colors.accentDim : colors.surface,
        transition: "all 0.15s ease",
        "&:hover": { borderColor: colors.accentBorder },
        overflow: "hidden",
      }}
    >
    <Box
      onClick={onSelect}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.25,
        px: 1.75,
        py: 1.1,
        cursor: "pointer",
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

      {historyCount > 0 && (
        <Tooltip title={`${historyCount} completed previous stage${historyCount > 1 ? "s" : ""} — expand to view`}>
          <Chip
            icon={<HistoryRoundedIcon sx={{ fontSize: "13px !important" }} />}
            label={historyCount}
            size="small"
            sx={{
              height: 22,
              fontSize: 11,
              fontWeight: 700,
              bgcolor: colors.trackOff,
              color: colors.textSecondary,
              border: `1px solid ${colors.border}`,
              "& .MuiChip-icon": { color: colors.textDim },
            }}
          />
        </Tooltip>
      )}

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

    {/* Expanded body: read-only previous-stage history (no actions). */}
    <Collapse in={isOpen} timeout="auto" unmountOnExit>
      <Box sx={{ px: 2, pb: 1.5, pt: 0.5, borderTop: `1px dashed ${colors.border}` }}>
        <StageHistoryPanel history={crq?.history} colors={colors} dense />
      </Box>
    </Collapse>
    </Box>
  );
};

export default StageCard;
