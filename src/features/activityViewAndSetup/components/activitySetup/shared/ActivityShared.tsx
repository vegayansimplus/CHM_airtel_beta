import React from "react";
import {
  Chip,
  ToggleButton,
  ToggleButtonGroup,
  TextField,
  MenuItem,
  Box,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import type { ActivityStatus, ChangeImpact, LevelRequirement, SelectOption } from "../../../types/activity.types";
// import type {
//   ActivityStatus,
//   ChangeImpact,
//   LevelRequirement,
//   SelectOption,
// } from "../../types/activity.types";

// ─────────────────────────────────────────────
//  Status Chip
// ─────────────────────────────────────────────

const STATUS_COLOR: Record<
  ActivityStatus,
  "success" | "warning" | "error" | "default"
> = {
  Active: "success",
  Draft: "default",
  Pending: "warning",
  Inactive: "error",
};

export const StatusChip: React.FC<{ status: ActivityStatus }> = ({
  status,
}) => {
  const theme = useTheme();
  const kind = STATUS_COLOR[status];
  const main =
    kind === "default" ? theme.palette.grey[600] : theme.palette[kind].main;

  return (
    <Chip
      label={status}
      size="small"
      variant="outlined"
      sx={{
        fontWeight: 800,
        fontSize: 11,
        borderRadius: 999,
        bgcolor: alpha(
          main,
          theme.palette.mode === "dark" ? 0.18 : 0.1,
        ),
        color: main,
        borderColor: alpha(
          main,
          theme.palette.mode === "dark" ? 0.45 : 0.3,
        ),
        boxShadow:
          theme.palette.mode === "dark"
            ? "0 8px 24px rgba(0,0,0,0.18)"
            : "0 6px 16px rgba(0,0,0,0.06)",
      }}
    />
  );
};

// ─────────────────────────────────────────────
//  Impact Chip
// ─────────────────────────────────────────────

const IMPACT_COLOR: Record<
  ChangeImpact,
  "success" | "warning" | "error"
> = {
  Low: "success",
  Medium: "warning",
  High: "error",
};

export const ImpactChip: React.FC<{ impact: ChangeImpact }> = ({ impact }) => (
  (() => {
    const theme = useTheme();
    const kind = IMPACT_COLOR[impact];
    const main = theme.palette[kind].main;

    return (
      <Chip
        label={impact}
        size="small"
        variant="outlined"
        sx={{
          fontWeight: 800,
          fontSize: 11,
          borderRadius: 999,
          bgcolor: alpha(
            main,
            theme.palette.mode === "dark" ? 0.18 : 0.1,
          ),
          color: main,
          borderColor: alpha(
            main,
            theme.palette.mode === "dark" ? 0.45 : 0.3,
          ),
          boxShadow:
            theme.palette.mode === "dark"
              ? "0 8px 24px rgba(0,0,0,0.18)"
              : "0 6px 16px rgba(0,0,0,0.06)",
        }}
      />
    );
  })()
);

// ─────────────────────────────────────────────
//  Level Toggle (L1 / L2 / L3)
// ─────────────────────────────────────────────

interface LevelToggleProps {
  value: LevelRequirement | "";
  onChange: (val: LevelRequirement) => void;
  disabled?: boolean;
}

export const LevelToggle: React.FC<LevelToggleProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const theme = useTheme();
  return (
    <ToggleButtonGroup
      exclusive
      value={value || null}
      onChange={(_, v) => v && onChange(v as LevelRequirement)}
      size="small"
      disabled={disabled}
      sx={{
        "& .MuiToggleButton-root": {
          px: 2,
          fontSize: 12,
          fontWeight: 500,
          textTransform: "none",
          border: `1px solid ${theme.palette.divider}`,
          "&.Mui-selected": {
            backgroundColor: theme.palette.primary.main,
            color: "#fff",
            "&:hover": {
              backgroundColor: theme.palette.primary.dark,
            },
          },
        },
      }}
    >
      {(["L1", "L2", "L3"] as LevelRequirement[]).map((l) => (
        <ToggleButton key={l} value={l}>
          {l}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
};

// ─────────────────────────────────────────────
//  FormSelect — thin wrapper over MUI Select
// ─────────────────────────────────────────────

interface FormSelectProps {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (v: string) => void;
  required?: boolean;
  disabled?: boolean;
  size?: "small" | "medium";
}

export const FormSelect: React.FC<FormSelectProps> = ({
  label,
  value,
  options,
  onChange,
  required = false,
  disabled = false,
  size = "small",
}) => (
  <TextField
    select
    label={label}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    required={required}
    disabled={disabled}
    size={size}
    fullWidth
    variant="outlined"
  >
    <MenuItem value="">
      <em>Select…</em>
    </MenuItem>
    {options.map((o) => (
      <MenuItem key={o.value} value={o.value}>
        {o.label}
      </MenuItem>
    ))}
  </TextField>
);

// ─────────────────────────────────────────────
//  FormNumberInput — number field helper
// ─────────────────────────────────────────────

interface FormNumberInputProps {
  label: string;
  value: number | "";
  onChange: (v: number | "") => void;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  suffix?: string;
}

export const FormNumberInput: React.FC<FormNumberInputProps> = ({
  label,
  value,
  onChange,
  required = false,
  disabled = false,
  placeholder = "",
  suffix,
}) => (
  <TextField
    label={suffix ? `${label} (${suffix})` : label}
    type="number"
    value={value}
    onChange={(e) =>
      onChange(e.target.value === "" ? "" : Number(e.target.value))
    }
    required={required}
    disabled={disabled}
    size="small"
    fullWidth
    placeholder={placeholder}
    inputProps={{ min: 0 }}
    variant="outlined"
  />
);

// ─────────────────────────────────────────────
//  AutoReadonlyField — greyed readonly chip
// ─────────────────────────────────────────────

export const AutoReadonlyField: React.FC<{
  label: string;
  value: string;
}> = ({ label, value }) => {
  const theme = useTheme();
  return (
    <Box>
      <Typography
        variant="caption"
        sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}
      >
        {label}
        <Chip
          label="auto"
          size="small"
          sx={{
            ml: 0.5,
            height: 16,
            fontSize: 10,
            backgroundColor: theme.palette.primary.main + "20",
            color: theme.palette.primary.main,
            fontWeight: 600,
          }}
        />
      </Typography>
      <TextField
        value={value || "—"}
        size="small"
        fullWidth
        disabled
        variant="outlined"
        sx={{
          mt: 0.5,
          "& .MuiInputBase-input.Mui-disabled": {
            WebkitTextFillColor: theme.palette.text.secondary,
          },
          "& .MuiOutlinedInput-root.Mui-disabled": {
            backgroundColor:
              theme.palette.mode === "dark"
                ? "rgba(255,255,255,0.04)"
                : "rgba(0,0,0,0.04)",
          },
        }}
      />
    </Box>
  );
};

// ─────────────────────────────────────────────
//  MetaInfoBanner — top context strip for phases
// ─────────────────────────────────────────────

interface MetaItem {
  label: string;
  value: string;
}

export const MetaInfoBanner: React.FC<{ items: MetaItem[] }> = ({ items }) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        gap: 2,
        p: 1.5,
        mb: 2,
        borderRadius: 1,
        backgroundColor:
          theme.palette.mode === "dark"
            ? "rgba(255,255,255,0.05)"
            : theme.palette.grey[50],
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      {items.map((item) => (
        <Box key={item.label}>
          <Typography
            variant="caption"
            sx={{ color: theme.palette.text.secondary }}
          >
            {item.label}:
          </Typography>{" "}
          <Typography variant="caption" sx={{ fontWeight: 600 }}>
            {item.value || "—"}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

// ─────────────────────────────────────────────
//  SectionTitle
// ─────────────────────────────────────────────

export const SectionTitle: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const theme = useTheme();
  return (
    <Typography
      variant="overline"
      sx={{
        display: "block",
        mb: 1.5,
        mt: 0.5,
        color: theme.palette.text.secondary,
        fontWeight: 600,
        letterSpacing: "0.08em",
        borderBottom: `1px solid ${theme.palette.divider}`,
        pb: 0.5,
      }}
    >
      {children}
    </Typography>
  );
};
