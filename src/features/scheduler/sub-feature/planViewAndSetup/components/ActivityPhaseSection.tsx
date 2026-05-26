import React, { useState } from "react";
import {
  Box,
  Chip,
  Collapse,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  AccessTime,
  CalendarToday,
  ExpandLess,
  ExpandMore,
  Groups,
  Loop,
  Schedule,
  SignalCellularAlt,
  WatchLater,
} from "@mui/icons-material";

const SHIFTS = ["General", "Morning", "Evening", "Night"];
const LEVELS = ["L1", "L2", "L3", "L4"];

const SHIFT_COLORS: Record<string, "default" | "primary" | "warning" | "info"> = {
  General: "default",
  Morning: "primary",
  Evening: "warning",
  Night: "info",
};

const FIELD_META: Record<
  string,
  { icon: React.ReactNode; tooltip: string; label: string }
> = {
  shift: {
    icon: <Schedule fontSize="small" />,
    tooltip: "Work shift for this phase",
    label: "Shift",
  },
  minimumLevelRequirement: {
    icon: <SignalCellularAlt fontSize="small" />,
    tooltip: "Minimum skill/competency level required",
    label: "Min Level",
  },
  requiredTimeMinutes: {
    icon: <AccessTime fontSize="small" />,
    tooltip: "Estimated time required in minutes",
    label: "Time (Min)",
  },
  daysMargin: {
    icon: <CalendarToday fontSize="small" />,
    tooltip: "Buffer days allowed for the phase",
    label: "Days Margin",
  },
  reservationMargin: {
    icon: <WatchLater fontSize="small" />,
    tooltip: "Reservation buffer margin",
    label: "Reservation Margin",
  },
  rollbackTime: {
    icon: <Loop fontSize="small" />,
    tooltip: "Time allocated for rollback if needed",
    label: "Rollback Time",
  },
  assignedToTeam: {
    icon: <Groups fontSize="small" />,
    tooltip: "Team ID assigned to this phase",
    label: "Assigned Team",
  },
};

const PHASE_COLORS = [
  "#4F46E5",
  "#0891B2",
  "#059669",
  "#D97706",
  "#DC2626",
  "#7C3AED",
  "#DB2777",
];

interface Props {
  title: string;
  value: any;
  onChange: (field: string, value: any) => void;
  phaseIndex?: number;
}

const ActivityPhaseSection: React.FC<Props> = ({
  title,
  value,
  onChange,
  phaseIndex = 0,
}) => {
  const [expanded, setExpanded] = useState(true);
  const accentColor = PHASE_COLORS[phaseIndex % PHASE_COLORS.length];

  const isConfigured =
    value.shift !== "" || value.minimumLevelRequirement !== "";

  return (
    <Paper
      elevation={0}
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        overflow: "hidden",
        transition: "box-shadow 0.2s",
        "&:hover": { boxShadow: "0 2px 12px rgba(0,0,0,0.08)" },
      }}
    >
      {/* Header */}
      <Box
        onClick={() => setExpanded(!expanded)}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          px: 2.5,
          py: 1.5,
          cursor: "pointer",
          bgcolor: expanded ? "action.hover" : "background.paper",
          borderBottom: expanded ? "1px solid" : "none",
          borderColor: "divider",
          userSelect: "none",
          transition: "background-color 0.15s",
          "&:hover": { bgcolor: "action.hover" },
        }}
      >
        <Box
          sx={{
            width: 4,
            height: 28,
            borderRadius: 1,
            bgcolor: accentColor,
            flexShrink: 0,
          }}
        />
        <Typography fontWeight={600} fontSize={14} sx={{ flex: 1 }}>
          {title}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {isConfigured && value.shift && (
            <Chip
              label={value.shift}
              size="small"
              color={SHIFT_COLORS[value.shift] ?? "default"}
              sx={{ height: 20, fontSize: 11 }}
            />
          )}
          {isConfigured && value.minimumLevelRequirement && (
            <Chip
              label={value.minimumLevelRequirement}
              size="small"
              variant="outlined"
              sx={{ height: 20, fontSize: 11 }}
            />
          )}
        </Box>
        <IconButton size="small" sx={{ ml: 0.5 }}>
          {expanded ? (
            <ExpandLess fontSize="small" />
          ) : (
            <ExpandMore fontSize="small" />
          )}
        </IconButton>
      </Box>

      {/* Body */}
      <Collapse in={expanded}>
        <Box sx={{ px: 2.5, py: 2 }}>
          <Grid container spacing={2}>
            {/* Shift */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Tooltip title={FIELD_META.shift.tooltip} placement="top" arrow>
                <TextField
                  fullWidth
                  select
                  size="small"
                  label={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      {FIELD_META.shift.icon}
                      {FIELD_META.shift.label}
                    </Box>
                  }
                  value={value.shift}
                  onChange={(e) => onChange("shift", e.target.value)}
                  sx={{
                    "& .MuiInputLabel-root": {
                      display: "flex",
                      alignItems: "center",
                    },
                  }}
                >
                  {SHIFTS.map((s) => (
                    <MenuItem key={s} value={s}>
                      {s}
                    </MenuItem>
                  ))}
                </TextField>
              </Tooltip>
            </Grid>

            {/* Min Level */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Tooltip
                title={FIELD_META.minimumLevelRequirement.tooltip}
                placement="top"
                arrow
              >
                <TextField
                  fullWidth
                  select
                  size="small"
                  label={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      {FIELD_META.minimumLevelRequirement.icon}
                      {FIELD_META.minimumLevelRequirement.label}
                    </Box>
                  }
                  value={value.minimumLevelRequirement}
                  onChange={(e) =>
                    onChange("minimumLevelRequirement", e.target.value)
                  }
                >
                  {LEVELS.map((l) => (
                    <MenuItem key={l} value={l}>
                      {l}
                    </MenuItem>
                  ))}
                </TextField>
              </Tooltip>
            </Grid>

            {/* Numeric fields */}
            {(
              [
                "requiredTimeMinutes",
                "daysMargin",
                "reservationMargin",
                "rollbackTime",
                "assignedToTeam",
              ] as const
            ).map((fieldKey) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={fieldKey}>
                <Tooltip
                  title={FIELD_META[fieldKey].tooltip}
                  placement="top"
                  arrow
                >
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    inputProps={{ min: 0 }}
                    label={
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                      >
                        {FIELD_META[fieldKey].icon}
                        {FIELD_META[fieldKey].label}
                      </Box>
                    }
                    value={value[fieldKey]}
                    onChange={(e) =>
                      onChange(fieldKey, Number(e.target.value))
                    }
                  />
                </Tooltip>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Collapse>
    </Paper>
  );
};

export default ActivityPhaseSection;