import React, { memo, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  FormControl,
  FormHelperText,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import {
  AccessTime,
  CalendarMonth,
  CheckCircle,
  ExpandMore,
  QueryBuilder,
  Schedule,
  SignalCellularAlt,
  Update,
} from "@mui/icons-material";
import TeamAssignmentSelect from "../../../../orgHierarchy/components/TeamAssignmentSelect";
import NumericField from "../../../../../components/common/NumericField";

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  title: string;
  variant: "slim" | "full";
  value: Record<string, any>;
  onChange: (field: string, value: any) => void;
  phaseIndex: number;
  shiftError?: boolean;
  teamError?: boolean;
}

// ─── Accent colors per phase ─────────────────────────────────────────────────

const ACCENT_COLORS = [
  "#5C6BC0", "#26A69A", "#FFA726", "#AB47BC", "#42A5F5", "#EF5350",
];

const FIELD_GRID_SX = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(4, 1fr)" },
  gap: 2,
};

// ─── Component ────────────────────────────────────────────────────────────────

const ActivityPhaseSection: React.FC<Props> = ({
  title,
  variant,
  value,
  onChange,
  phaseIndex,
  shiftError,
  teamError,
}) => {
  const [manuallyExpanded, setManuallyExpanded] = useState(phaseIndex === 0);
  const accent = ACCENT_COLORS[phaseIndex % ACCENT_COLORS.length];
  const isConfigured = !!value.shift && !!value.minimumLevelRequirement;

  // Auto-expand so a validation error is actually visible, not hidden in a
  // collapsed accordion, without needing an effect.
  const expanded = manuallyExpanded || !!shiftError || !!teamError;

  return (
    <Accordion
      expanded={expanded}
      onChange={() => setManuallyExpanded((prev) => !prev)}
      disableGutters
      elevation={0}
      sx={{
        border: "1px solid",
        borderColor: shiftError || teamError ? "error.main" : "divider",
        borderRadius: "12px !important",
        "&::before": { display: "none" },
        overflow: "hidden",
        transition: "border-color 0.15s",
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMore />}
        sx={{ bgcolor: "grey.50", px: 2.5, minHeight: 60 }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flex: 1, minWidth: 0 }}>
          <Box
            sx={{
              width: 30,
              height: 30,
              flexShrink: 0,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
              fontWeight: 700,
              color: "#fff",
              bgcolor: shiftError || teamError ? "error.main" : accent,
            }}
          >
            {phaseIndex + 1}
          </Box>
          <Typography fontWeight={700} sx={{ flexShrink: 0 }}>
            {title}
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1, ml: 0.5, flexWrap: "wrap" }}>
            {isConfigured && !shiftError && !teamError && (
              <Chip
                icon={<CheckCircle sx={{ fontSize: 14 }} />}
                label="Configured"
                size="small"
                color="success"
                variant="outlined"
                sx={{ height: 22, fontSize: 11 }}
              />
            )}
            {(shiftError || teamError) && (
              <Typography variant="caption" color="error.main" fontWeight={600}>
                {shiftError && teamError
                  ? "Shift and team are required"
                  : shiftError
                    ? "Shift is required"
                    : "Team assignment is required"}
              </Typography>
            )}
          </Box>
        </Box>
      </AccordionSummary>

      <AccordionDetails sx={{ p: 2.5, bgcolor: "background.paper" }}>
        {/* ── Row 1: core fields ──────────────────────────────── */}
        <Box sx={FIELD_GRID_SX}>
          {/* Shift */}
          <FormControl fullWidth size="small" error={shiftError}>
            <InputLabel>Shift</InputLabel>
            <Select
              value={value.shift}
              label="Shift"
              onChange={(e) => onChange("shift", e.target.value)}
              startAdornment={
                <InputAdornment position="start">
                  <Schedule fontSize="small" />
                </InputAdornment>
              }
            >
              <MenuItem value="General">General</MenuItem>
              <MenuItem value="Morning">Morning</MenuItem>
              <MenuItem value="Evening">Evening</MenuItem>
              <MenuItem value="Night">Night</MenuItem>
            </Select>
            {shiftError && <FormHelperText>Required</FormHelperText>}
          </FormControl>

          {/* Min Level */}
          <FormControl fullWidth size="small">
            <InputLabel>Min Level</InputLabel>
            <Select
              value={value.minimumLevelRequirement}
              label="Min Level"
              onChange={(e) => onChange("minimumLevelRequirement", e.target.value)}
              startAdornment={
                <InputAdornment position="start">
                  <SignalCellularAlt fontSize="small" />
                </InputAdornment>
              }
            >
              <MenuItem value="L1">L1</MenuItem>
              <MenuItem value="L2">L2</MenuItem>
              <MenuItem value="L3">L3</MenuItem>
            </Select>
          </FormControl>

          {/* Time (Min) */}
          <NumericField
            fullWidth
            size="small"
            label="Time (Min)"
            value={value.requiredTimeMinutes}
            onChange={(n) => onChange("requiredTimeMinutes", n)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AccessTime fontSize="small" />
                </InputAdornment>
              ),
            }}
          />

          {/* Assigned Team */}
          <Box sx={{ gridColumn: "1 / -1" }}>
            <Typography
              fontSize={12}
              color={teamError ? "error.main" : "text.secondary"}
              sx={{ mb: 0.5 }}
            >
              Assign Team
            </Typography>
            <TeamAssignmentSelect
              value={value.assignedToTeam || undefined}
              onChange={(subDomainId) =>
                onChange("assignedToTeam", subDomainId ?? 0)
              }
            />
            {teamError && (
              <Typography variant="caption" color="error.main" sx={{ display: "block", mt: 0.5 }}>
                Team assignment is required
              </Typography>
            )}
          </Box>
        </Box>

        {/* ── Row 2: only for crqExecution (variant === "full") ─── */}
        {variant === "full" && (
          <Box
            sx={{
              ...FIELD_GRID_SX,
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(3, 1fr)" },
              mt: 2,
              pt: 2,
              borderTop: "1px dashed",
              borderColor: "divider",
            }}
          >
            <NumericField
              fullWidth
              size="small"
              label="Days Margin"
              value={value.daysMargin}
              onChange={(n) => onChange("daysMargin", n)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarMonth fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />

            <NumericField
              fullWidth
              size="small"
              label="Reservation Margin"
              value={value.reservationMargin}
              onChange={(n) => onChange("reservationMargin", n)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <QueryBuilder fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />

            <NumericField
              fullWidth
              size="small"
              label="Rollback Time"
              value={value.rollbackTime}
              onChange={(n) => onChange("rollbackTime", n)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Update fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        )}
      </AccordionDetails>
    </Accordion>
  );
};

export default memo(ActivityPhaseSection);
