import React from "react";
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Collapse,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import PauseRoundedIcon from "@mui/icons-material/PauseRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import { format } from "date-fns";
import type { StageConfig } from "../../types/stageWorkflow.types";
import { StageHistoryPanel } from "./StageHistoryPanel";
import CrqInfoCards from "./CrqInfoCards";
import CrqTaskTable from "./CrqTaskTable";

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

const formatDate = (dateString?: string | null) =>
  dateString ? format(new Date(dateString), "dd-MMM-yyyy HH:mm") : "-";

/**
 * Stage-agnostic replacement for the original `CrqCard`. Reads its status
 * and OLM ID from `stageConfig`, so the same component renders Impact
 * Analysis, MOP Create, MOP Validate, Scheduling, Activity Implement and
 * Closer cards - with the same checkbox/expand/info-cards/task-table
 * fidelity as the Plan & Inventory reference implementation.
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
  const isFailed = ["canceled", "cancel", "Canceled", "Failed"].includes(status);

  const infoItems = [
    { label: "CRQ No", value: crq.crqNo || "-" },
    { label: "Start Date", value: formatDate(crq.activityPlanStartDate) },
    { label: "End Date", value: formatDate(crq.activityPlanEndDate) },
    { label: "CRQ Status", value: crq.crqStatus || "-" },
    { label: `${stageConfig.label} Status`, value: crq?.[stageConfig.statusField] || "-" },
    { label: `${stageConfig.label} OLM ID`, value: crq?.[stageConfig.olmIdField] || "-" },
  ];

  return (
    <Paper
      elevation={0}
      className="crq-card"
      sx={{
        mb: 1.5,
        borderRadius: colors.radiusL,
        border: `1.5px solid ${isSelected ? colors.accentBorder : colors.border}`,
        bgcolor: isSelected ? colors.accentDim : colors.surface,
        overflow: "hidden",
        transition:
          "border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease",
        "&:hover": {
          borderColor: isSelected ? colors.accent : colors.borderHover,
          boxShadow: colors.isDark
            ? "0 4px 22px rgba(0,0,0,0.32)"
            : "0 4px 22px rgba(99,102,241,0.10)",
        },
      }}
    >
      {/* ── Header Row ── */}
      <Stack
        direction="row"
        alignItems="center"
        sx={{
          px: 1.5,
          py: 1.1,
          gap: 1.5,
          borderLeft: `3px solid ${isSelected ? colors.accent : "transparent"}`,
          transition: "border-color 0.18s ease",
          overflowX: "auto",
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        <IconButton
          size="small"
          onClick={onToggle}
          sx={{
            width: 28,
            height: 28,
            borderRadius: "7px",
            flexShrink: 0,
            bgcolor: isOpen ? colors.accentDim : colors.trackOff,
            color: isOpen ? colors.accent : colors.textSecondary,
            border: `1px solid ${isOpen ? colors.accentBorder : colors.border}`,
            "&:hover": {
              bgcolor: colors.accentDim,
              color: colors.accent,
              borderColor: colors.accentBorder,
            },
          }}
        >
          <Box className={`expand-chevron${isOpen ? " open" : ""}`}>
            <ChevronRightRoundedIcon sx={{ fontSize: 16 }} />
          </Box>
        </IconButton>

        <Checkbox
          checked={isSelected}
          onChange={onSelect}
          size="small"
          sx={{
            p: 0,
            flexShrink: 0,
            color: colors.border,
            "&.Mui-checked": { color: colors.accent },
          }}
        />

        <Box sx={{ flex: 1, overflowX: "scroll", width: "60vw" }}>
          <CrqInfoCards colors={colors} data={crq} items={infoItems} />
        </Box>

        <Chip
          label={status}
          size="small"
          color={STATUS_COLOR[status] ?? "default"}
          sx={{ height: 22, fontSize: 11, fontWeight: 700, flexShrink: 0 }}
        />

        {(crq.tasks?.length ?? 0) > 0 && (
          <Chip
            icon={<AssignmentOutlinedIcon style={{ fontSize: 12 }} />}
            label={crq.tasks.length}
            size="small"
            sx={{
              height: 22,
              fontSize: 11,
              fontWeight: 700,
              flexShrink: 0,
              bgcolor: colors.infoDim,
              color: colors.info,
              border: `1px solid ${colors.infoBorder}`,
              "& .MuiChip-icon": { color: colors.info, ml: 0.7, mr: -0.4 },
              "& .MuiChip-label": { px: 0.8 },
            }}
          />
        )}

        <Button
          variant="outlined"
          size="small"
          disabled={isFailed}
          startIcon={
            isRunning ? (
              <PauseRoundedIcon sx={{ fontSize: "14px !important" }} />
            ) : (
              <PlayArrowRoundedIcon sx={{ fontSize: "14px !important" }} />
            )
          }
          onClick={onStartPause}
          sx={{
            flexShrink: 0,
            height: 30,
            minWidth: 90,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 0.3,
            borderRadius: "8px",
            px: 1.5,
            transition: "all 0.15s ease",
            ...(isFailed
              ? {
                  bgcolor: colors.trackOff,
                  color: colors.textDim,
                  borderColor: colors.trackOffBorder,
                  "&.Mui-disabled": {
                    bgcolor: colors.trackOff,
                    color: colors.textDim,
                    borderColor: colors.trackOffBorder,
                  },
                }
              : isRunning
                ? {
                    bgcolor: colors.dangerDim,
                    color: colors.danger,
                    borderColor: colors.dangerBorder,
                    "&:hover": {
                      bgcolor: colors.danger,
                      color: "#fff",
                      borderColor: colors.danger,
                    },
                  }
                : {
                    bgcolor: colors.successDim,
                    color: colors.success,
                    borderColor: colors.successBorder,
                    "&:hover": {
                      bgcolor: colors.success,
                      color: "#fff",
                      borderColor: colors.success,
                    },
                  }),
          }}
        >
          {isFailed ? "Disabled" : isRunning ? "Pause" : "Start"}
        </Button>
      </Stack>

      {/* ── Tasks + History Collapse ── */}
      <Collapse in={isOpen} timeout="auto" unmountOnExit>
        <Box
          sx={{
            mx: 2,
            mb: 1.5,
            borderRadius: colors.radius,
            border: `1px solid ${colors.border}`,
            overflow: "hidden",
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{
              px: 1.5,
              py: 0.85,
              bgcolor: colors.infoDim,
              borderBottom: `1px solid ${colors.infoBorder}`,
            }}
          >
            <AssignmentOutlinedIcon sx={{ fontSize: 13, color: colors.info }} />
            <Typography sx={{ fontSize: 12, fontWeight: 700, color: colors.info }}>
              Tasks
            </Typography>
            <Chip
              label={crq.tasks?.length ?? 0}
              size="small"
              sx={{
                height: 18,
                fontSize: 10,
                fontWeight: 800,
                bgcolor: `${colors.info}22`,
                color: colors.info,
                "& .MuiChip-label": { px: 0.7 },
              }}
            />
          </Stack>
          <Box sx={{ bgcolor: colors.surface }}>
            <CrqTaskTable tasks={crq.tasks} colors={colors} />
          </Box>
        </Box>

        {/* Read-only previous-stage history (no actions). */}
        {(crq.history?.length ?? 0) > 0 && (
          <Box sx={{ mx: 2, mb: 1.5 }}>
            <StageHistoryPanel history={crq.history} colors={colors} dense />
          </Box>
        )}
      </Collapse>
    </Paper>
  );
};

export default StageCard;
