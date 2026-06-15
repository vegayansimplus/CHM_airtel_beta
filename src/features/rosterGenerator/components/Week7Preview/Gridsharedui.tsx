import {
  Box, Stack, Tooltip, Typography, InputBase, IconButton, alpha, useTheme,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import { LEVEL_COLORS, MONO, SHIFT_COLORS, SHIFT_ORDER, type Employee, type ShiftCode } from "../../types/Gridtypes";
import { shiftStyle } from "../../util/Gridutils";
// import { shiftStyle } from "../Week7PreviewScreen";
// import { LEVEL_COLORS, MONO, SHIFT_COLORS, SHIFT_ORDER, type Employee, type ShiftCode } from "./Gridtypes";
// import { shiftStyle } from "./Gridutils";

// ─── LevelBadge ───────────────────────────────────────────────────────────────
export function LevelBadge({ level }: { level: string }) {
  const c = LEVEL_COLORS[level] ?? { bg: "#F1F5F9", text: "#475569", solid: "#64748B" };
  return (
    <Box
      component="span"
      sx={{
        display: "inline-grid",
        placeItems: "center",
        px: 0.75,
        height: 18,
        borderRadius: "4px",
        fontSize: 9.5,
        fontWeight: 700,
        bgcolor: c.bg,
        color: c.text,
        border: `1px solid ${alpha(c.solid, 0.2)}`,
        letterSpacing: "0.03em",
        flexShrink: 0,
      }}
    >
      {level}
    </Box>
  );
}

// ─── EmployeeCell ─────────────────────────────────────────────────────────────
export function EmployeeCell({
  employee,
  accent = false,
}: {
  employee: Employee;
  accent?: boolean;
}) {
  const theme = useTheme();
  const initials = employee.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Stack direction="row" alignItems="center" gap={1.25} sx={{ minWidth: 0 }}>
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: "8px",
          display: "grid",
          placeItems: "center",
          fontWeight: 700,
          fontSize: 11,
          letterSpacing: "0.02em",
          bgcolor: accent
            ? alpha(theme.palette.primary.main, 0.1)
            : alpha(theme.palette.text.primary, 0.05),
          color: accent
            ? theme.palette.primary.main
            : theme.palette.text.secondary,
          border: "1px solid",
          borderColor: accent
            ? alpha(theme.palette.primary.main, 0.2)
            : "transparent",
          flexShrink: 0,
          transition: "all 0.2s ease",
        }}
      >
        {initials}
      </Box>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Stack direction="row" alignItems="center" gap={0.75}>
          <Typography
            sx={{
              fontSize: 12.5,
              fontWeight: 650,
              lineHeight: 1.2,
              color: "text.primary",
            }}
            noWrap
          >
            {employee.name}
          </Typography>
          <LevelBadge level={employee.level} />
        </Stack>
        <Typography
          sx={{ fontSize: 10, color: "text.secondary", fontWeight: 500, mt: 0.2 }}
          noWrap
        >
          {employee.id} · {employee.role}
        </Typography>
      </Box>
    </Stack>
  );
}

// ─── ShiftBadge ───────────────────────────────────────────────────────────────
export function ShiftBadge({
  code,
  size = "md",
}: {
  code: ShiftCode;
  size?: "sm" | "md";
}) {
  const theme = useTheme();
  return (
    <Box
      component="span"
      sx={{
        display: "inline-grid",
        placeItems: "center",
        minWidth: size === "sm" ? 28 : 32,
        height: size === "sm" ? 20 : 24,
        px: 0.75,
        borderRadius: "5px",
        fontFamily: MONO,
        fontSize: size === "sm" ? 10 : 11,
        fontWeight: 700,
        border: "1px solid",
        ...shiftStyle(code, theme.palette.mode),
        transition: "all 0.12s ease",
      }}
    >
      {code}
    </Box>
  );
}

// ─── ShiftLegend ──────────────────────────────────────────────────────────────
export function ShiftLegend() {
  return (
    <Stack direction="row" gap={0.75} flexWrap="wrap" alignItems="center">
      {SHIFT_ORDER.map((code) => (
        <Tooltip key={code} title={SHIFT_COLORS[code].label} arrow disableInteractive>
          <Box>
            <ShiftBadge code={code} />
          </Box>
        </Tooltip>
      ))}
    </Stack>
  );
}

// ─── BrushBar ─────────────────────────────────────────────────────────────────
export function BrushBar({
  brush,
  onSelect,
}: {
  brush: ShiftCode;
  onSelect: (code: ShiftCode) => void;
}) {
  const theme = useTheme();
  return (
    <Stack
      direction="row"
      alignItems="center"
      gap={1.5}
      flexWrap="wrap"
      sx={{
        px: 2,
        py: 1.25,
        borderBottom: 1,
        borderColor: "divider",
        background:
          theme.palette.mode === "dark"
            ? "linear-gradient(135deg,rgba(99,102,241,0.08),rgba(59,130,246,0.04))"
            : "linear-gradient(135deg,rgba(99,102,241,0.04),rgba(59,130,246,0.02))",
      }}
    >
      {/* Paint mode indicator */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.75,
          px: 1.25,
          py: 0.5,
          borderRadius: "6px",
          bgcolor: alpha(theme.palette.primary.main, 0.08),
          border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
        }}
      >
        <Box
          sx={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            bgcolor: "primary.main",
            animation: "rosterPulse 2s infinite",
            "@keyframes rosterPulse": {
              "0%,100%": { opacity: 1 },
              "50%": { opacity: 0.35 },
            },
          }}
        />
        <Typography
          sx={{
            fontSize: 10.5,
            color: "primary.main",
            fontWeight: 800,
            letterSpacing: "0.06em",
          }}
        >
          PAINT MODE
        </Typography>
      </Box>

      {/* Shift buttons */}
      <Stack direction="row" gap={0.75} flexWrap="wrap">
        {SHIFT_ORDER.map((code) => {
          const c = SHIFT_COLORS[code];
          const active = brush === code;
          return (
            <Box
              key={code}
              component="button"
              onClick={() => onSelect(code)}
              sx={{
                minWidth: 46,
                height: 30,
                fontFamily: MONO,
                fontWeight: 700,
                fontSize: 11.5,
                borderRadius: "8px",
                border: `${active ? 2 : 1}px solid`,
                borderColor: active ? c.solid : "divider",
                bgcolor: active ? alpha(c.solid, 0.12) : "transparent",
                color: active ? c.text : "text.secondary",
                boxShadow: active ? `0 0 0 3px ${alpha(c.solid, 0.18)}` : "none",
                cursor: "pointer",
                transition: "all 0.12s ease",
                "&:hover": {
                  borderColor: c.solid,
                  bgcolor: alpha(c.solid, 0.08),
                },
              }}
            >
              {code}
            </Box>
          );
        })}
      </Stack>

      <Typography
        sx={{
          ml: "auto",
          fontSize: 10.5,
          color: "text.secondary",
          fontStyle: "italic",
          display: { xs: "none", sm: "block" },
        }}
      >
        Click or drag cells to paint
      </Typography>
    </Stack>
  );
}

// ─── SearchBox ────────────────────────────────────────────────────────────────
export function SearchBox({
  value,
  onChange,
  onClear,
  placeholder = "Search employees…",
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
  placeholder?: string;
}) {
  const theme = useTheme();
  return (
    <Stack
      direction="row"
      alignItems="center"
      gap={0.75}
      sx={{
        bgcolor: "background.paper",
        border: "1.5px solid",
        borderColor: "divider",
        borderRadius: "10px",
        px: 1.25,
        py: 0.5,
        width: 200,
        transition: "all 0.2s ease",
        "&:focus-within": {
          borderColor: "primary.main",
          boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.1)}`,
        },
      }}
    >
      <SearchIcon sx={{ fontSize: 15, color: "text.secondary", flexShrink: 0 }} />
      <InputBase
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        sx={{ fontSize: 12.5, width: "100%", fontWeight: 500 }}
        inputProps={{ "aria-label": "Search employees" }}
      />
      {value && (
        <IconButton
          size="small"
          onClick={onClear}
          sx={{ p: 0.25, flexShrink: 0 }}
          aria-label="Clear search"
        >
          <CloseIcon sx={{ fontSize: 13 }} />
        </IconButton>
      )}
    </Stack>
  );
}
