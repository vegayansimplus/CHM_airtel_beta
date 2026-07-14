import React, { useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import {
  AccessTime,
  CalendarMonth,
  ExpandMore,
  Groups,
  QueryBuilder,
  Schedule,
  SignalCellularAlt,
  Update,
} from "@mui/icons-material";

import { SHIFT_OPTIONS, LEVEL_OPTIONS } from "../../../data/activityOptions";
import type { PhaseVariant } from "../shared/phaseFieldConfigs";

export interface PhaseFormValue {
  shift: string;
  minimumLevelRequirement: string;
  requiredTimeMinutes: number;
  assignedToTeam: number;
  daysMargin?: number;
  reservationMargin?: number;
  rollbackTime?: number;
}

interface Props {
  title: string;
  variant: PhaseVariant;
  value: PhaseFormValue;
  onChange: (field: keyof PhaseFormValue, value: string | number) => void;
  phaseIndex: number;
}

const ACCENT_COLORS = ["#5C6BC0", "#26A69A", "#FFA726", "#AB47BC", "#42A5F5", "#EF5350"];

const PhaseConfigSection: React.FC<Props> = ({ title, variant, value, onChange, phaseIndex }) => {
  const [expanded, setExpanded] = useState(phaseIndex === 0);
  const accent = ACCENT_COLORS[phaseIndex % ACCENT_COLORS.length];

  return (
    <Accordion
      expanded={expanded}
      onChange={() => setExpanded((prev) => !prev)}
      disableGutters
      elevation={0}
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: "12px !important",
        "&::before": { display: "none" },
        overflow: "hidden",
      }}
    >
      <AccordionSummary expandIcon={<ExpandMore />} sx={{ bgcolor: "grey.50", px: 2.5, minHeight: 56 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={{ width: 4, height: 28, borderRadius: 1, bgcolor: accent }} />
          <Typography fontWeight={700}>{title}</Typography>
        </Box>
      </AccordionSummary>

      <AccordionDetails sx={{ p: 2.5 }}>
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 2 }}>
          <FormControl fullWidth size="small">
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
              {SHIFT_OPTIONS.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

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
              {LEVEL_OPTIONS.map((l) => (
                <MenuItem key={l} value={l}>
                  {l}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            size="small"
            type="number"
            label="Time (Min)"
            value={value.requiredTimeMinutes}
            onChange={(e) => onChange("requiredTimeMinutes", Number(e.target.value))}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AccessTime fontSize="small" />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            size="small"
            type="number"
            label="Assigned Team"
            value={value.assignedToTeam}
            onChange={(e) => onChange("assignedToTeam", Number(e.target.value))}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Groups fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {variant === "full" && (
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              size="small"
              type="number"
              label="Days Margin"
              value={value.daysMargin ?? 0}
              onChange={(e) => onChange("daysMargin", Number(e.target.value))}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarMonth fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              size="small"
              type="number"
              label="Reservation Margin"
              value={value.reservationMargin ?? 0}
              onChange={(e) => onChange("reservationMargin", Number(e.target.value))}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <QueryBuilder fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              size="small"
              type="number"
              label="Rollback Time"
              value={value.rollbackTime ?? 0}
              onChange={(e) => onChange("rollbackTime", Number(e.target.value))}
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

export default PhaseConfigSection;
