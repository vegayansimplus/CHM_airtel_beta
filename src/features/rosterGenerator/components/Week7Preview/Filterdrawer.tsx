import { useEffect, useState } from "react";
import {
  Drawer, Box, Stack, Typography, IconButton, Button,
  Divider, Chip, Slider, FormControlLabel, Checkbox,
  Badge, alpha, useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import TuneIcon from "@mui/icons-material/Tune";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import CheckIcon from "@mui/icons-material/Check";
import PersonIcon from "@mui/icons-material/Person";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { ALL_LEVELS, LEVEL_COLORS, SHIFT_COLORS, SHIFT_ORDER, TOTAL_COLS, type FilterState, type ShiftCode } from "../../types/Gridtypes";
import { countActiveFilters, defaultFilter } from "../../util/Gridutils";
import { ShiftBadge } from "./Gridsharedui";
// import {
//   ALL_LEVELS, SHIFT_ORDER, SHIFT_COLORS, LEVEL_COLORS, TOTAL_COLS,
//   type FilterState, type ShiftCode,
// } from "./Gridtypes";
// import { defaultFilter, countActiveFilters } from "./Gridutils";
// import { ShiftBadge } from "./GridSharedUI";

interface FilterDrawerProps {
  open: boolean;
  filter: FilterState;
  allRoles: string[];
  onApply: (f: FilterState) => void;
  onClose: () => void;
}

function SectionLabel({ children }: { children: string }) {
  return (
    <Typography
      sx={{
        fontSize: 10,
        fontWeight: 800,
        color: "text.disabled",
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        mb: 1.5,
      }}
    >
      {children}
    </Typography>
  );
}

export function FilterDrawer({
  open,
  filter,
  allRoles,
  onApply,
  onClose,
}: FilterDrawerProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const [local, setLocal] = useState<FilterState>(filter);

  // Sync when drawer opens
  useEffect(() => {
    if (open) setLocal(filter);
  }, [open, filter]);

  const update = (patch: Partial<FilterState>) =>
    setLocal((p) => ({ ...p, ...patch }));

  const toggleArr = <T,>(arr: T[], val: T): T[] =>
    arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];

  const activeCount = countActiveFilters(local);

  const handleReset = () => {
    const def = defaultFilter();
    setLocal(def);
    onApply(def);
  };

  const handleApply = () => {
    onApply(local);
    onClose();
  };

  const handleClear = () => {
    const def = defaultFilter();
    setLocal(def);
    onApply(def);
    onClose();
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        elevation: 0,
        sx: {
          width: { xs: "100vw", sm: 380 },
          bgcolor: isDark ? "#0D1521" : "#FAFBFC",
          backgroundImage: "none",
          display: "flex",
          flexDirection: "column",
          borderLeft: `1px solid ${theme.palette.divider}`,
        },
      }}
    >
      {/* ── Header ────────────────────────────────────────────────────── */}
      <Stack
        direction="row"
        alignItems="center"
        sx={{
          px: 2.5,
          py: 2,
          borderBottom: 1,
          borderColor: "divider",
          flexShrink: 0,
          background: isDark
            ? "linear-gradient(135deg,rgba(99,102,241,0.08),rgba(59,130,246,0.04))"
            : "linear-gradient(135deg,rgba(99,102,241,0.04),rgba(59,130,246,0.02))",
        }}
      >
        <TuneIcon sx={{ fontSize: 17, color: "primary.main", mr: 1 }} />
        <Typography
          sx={{ fontSize: 15, fontWeight: 750, letterSpacing: "-0.02em" }}
        >
          Filters
        </Typography>
        {activeCount > 0 && (
          <Chip
            label={`${activeCount} active`}
            size="small"
            color="primary"
            sx={{
              ml: 1,
              height: 20,
              fontSize: 10,
              fontWeight: 700,
              borderRadius: "6px",
            }}
          />
        )}
        <Box sx={{ flex: 1 }} />
        <IconButton
          size="small"
          onClick={handleReset}
          sx={{ mr: 0.5, color: "text.secondary" }}
          title="Reset all filters"
        >
          <RestartAltIcon sx={{ fontSize: 17 }} />
        </IconButton>
        <IconButton
          size="small"
          onClick={onClose}
          sx={{
            bgcolor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
            borderRadius: "8px",
          }}
          aria-label="Close filters"
        >
          <CloseIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Stack>

      {/* ── Scrollable body ────────────────────────────────────────────── */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          p: 2.5,
          display: "flex",
          flexDirection: "column",
          gap: 2.5,
          "&::-webkit-scrollbar": { width: 5 },
          "&::-webkit-scrollbar-thumb": {
            bgcolor: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)",
            borderRadius: 4,
          },
        }}
      >
        {/* Level */}
        <Box>
          <SectionLabel>Level</SectionLabel>
          <Stack direction="row" gap={0.75} flexWrap="wrap">
            {ALL_LEVELS.map((lv) => {
              const c = LEVEL_COLORS[lv];
              const active = local.levels.includes(lv);
              return (
                <Box
                  key={lv}
                  role="checkbox"
                  aria-checked={active}
                  tabIndex={0}
                  onClick={() => update({ levels: toggleArr(local.levels, lv) })}
                  onKeyDown={(e) => {
                    if (e.key === " " || e.key === "Enter")
                      update({ levels: toggleArr(local.levels, lv) });
                  }}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.75,
                    px: 1.5,
                    py: 0.85,
                    borderRadius: "8px",
                    cursor: "pointer",
                    border: "1.5px solid",
                    borderColor: active ? alpha(c.solid, 0.55) : "divider",
                    bgcolor: active ? alpha(c.solid, 0.1) : "transparent",
                    transition: "all 0.15s ease",
                    userSelect: "none",
                    "&:hover": {
                      borderColor: alpha(c.solid, 0.4),
                      bgcolor: alpha(c.solid, 0.06),
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      bgcolor: c.solid,
                      flexShrink: 0,
                      boxShadow: active ? `0 0 6px ${alpha(c.solid, 0.4)}` : "none",
                    }}
                  />
                  <Typography
                    sx={{
                      fontSize: 12.5,
                      fontWeight: 650,
                      color: active ? c.text : "text.primary",
                    }}
                  >
                    {lv}
                  </Typography>
                  {active && <CheckIcon sx={{ fontSize: 13, color: c.solid }} />}
                </Box>
              );
            })}
          </Stack>
        </Box>

        <Divider />

        {/* Role */}
        <Box>
          <SectionLabel>Role</SectionLabel>
          <Stack gap={0.75}>
            {allRoles.map((role) => {
              const active = local.roles.includes(role);
              return (
                <Box
                  key={role}
                  role="checkbox"
                  aria-checked={active}
                  tabIndex={0}
                  onClick={() =>
                    update({ roles: toggleArr(local.roles, role) })
                  }
                  onKeyDown={(e) => {
                    if (e.key === " " || e.key === "Enter")
                      update({ roles: toggleArr(local.roles, role) });
                  }}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    px: 1.5,
                    py: 1,
                    borderRadius: "8px",
                    cursor: "pointer",
                    border: "1.5px solid",
                    borderColor: active
                      ? alpha(theme.palette.primary.main, 0.5)
                      : "divider",
                    bgcolor: active
                      ? alpha(theme.palette.primary.main, 0.08)
                      : "transparent",
                    transition: "all 0.15s ease",
                    userSelect: "none",
                    "&:hover": {
                      bgcolor: alpha(theme.palette.primary.main, 0.05),
                    },
                  }}
                >
                  <PersonIcon
                    sx={{
                      fontSize: 14,
                      color: active ? "primary.main" : "text.disabled",
                      flexShrink: 0,
                    }}
                  />
                  <Typography
                    sx={{
                      fontSize: 12.5,
                      fontWeight: 550,
                      color: active ? "primary.main" : "text.primary",
                      flex: 1,
                    }}
                    noWrap
                  >
                    {role}
                  </Typography>
                  {active && (
                    <CheckIcon sx={{ fontSize: 13, color: "primary.main" }} />
                  )}
                </Box>
              );
            })}
          </Stack>
        </Box>

        <Divider />

        {/* Shifts */}
        <Box>
          <SectionLabel>Has Shift (this week)</SectionLabel>
          <Stack direction="row" gap={0.75} flexWrap="wrap">
            {SHIFT_ORDER.map((code) => {
              const c = SHIFT_COLORS[code];
              const active = local.shiftCodes.includes(code as ShiftCode);
              return (
                <Box
                  key={code}
                  role="checkbox"
                  aria-checked={active}
                  tabIndex={0}
                  onClick={() =>
                    update({
                      shiftCodes: toggleArr(
                        local.shiftCodes,
                        code as ShiftCode,
                      ),
                    })
                  }
                  onKeyDown={(e) => {
                    if (e.key === " " || e.key === "Enter")
                      update({
                        shiftCodes: toggleArr(
                          local.shiftCodes,
                          code as ShiftCode,
                        ),
                      });
                  }}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.75,
                    px: 1,
                    py: 0.6,
                    borderRadius: "8px",
                    cursor: "pointer",
                    border: "1.5px solid",
                    borderColor: active ? alpha(c.solid, 0.55) : "divider",
                    bgcolor: active ? alpha(c.solid, 0.1) : "transparent",
                    transition: "all 0.15s ease",
                    userSelect: "none",
                    "&:hover": {
                      borderColor: alpha(c.solid, 0.4),
                    },
                  }}
                >
                  <ShiftBadge code={code as ShiftCode} size="sm" />
                  <Typography
                    sx={{ fontSize: 11.5, fontWeight: 550, color: "text.primary" }}
                  >
                    {c.label}
                  </Typography>
                  {active && <CheckIcon sx={{ fontSize: 13, color: c.solid }} />}
                </Box>
              );
            })}
          </Stack>
        </Box>

        <Divider />

        {/* Work days range */}
        <Box>
          <SectionLabel>Work Days</SectionLabel>
          <Slider
            value={local.workRange}
            onChange={(_, v) => update({ workRange: v as [number, number] })}
            min={0}
            max={TOTAL_COLS}
            valueLabelDisplay="auto"
            size="small"
            sx={{ mt: 1, mb: 0.5 }}
          />
          <Typography
            sx={{
              fontSize: 11,
              color: "text.secondary",
              fontWeight: 600,
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            {local.workRange[0]}–{local.workRange[1]} days
          </Typography>
        </Box>

        {/* Night shifts range */}
        <Box>
          <SectionLabel>Night Shifts</SectionLabel>
          <Slider
            value={local.nightRange}
            onChange={(_, v) => update({ nightRange: v as [number, number] })}
            min={0}
            max={TOTAL_COLS}
            valueLabelDisplay="auto"
            size="small"
            sx={{ mt: 1, mb: 0.5 }}
          />
          <Typography
            sx={{
              fontSize: 11,
              color: "text.secondary",
              fontWeight: 600,
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            {local.nightRange[0]}–{local.nightRange[1]} nights
          </Typography>
        </Box>

        <Divider />

        {/* Compliance flags */}
        <Box>
          <SectionLabel>Compliance Flags</SectionLabel>
          <Stack gap={0.5}>
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={local.showHighLoad}
                  onChange={(e) => update({ showHighLoad: e.target.checked })}
                />
              }
              label={
                <Typography sx={{ fontSize: 12.5, fontWeight: 500 }}>
                  High night load only
                </Typography>
              }
            />
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={local.showLowRest}
                  onChange={(e) => update({ showLowRest: e.target.checked })}
                />
              }
              label={
                <Typography sx={{ fontSize: 12.5, fontWeight: 500 }}>
                  Low rest violations only
                </Typography>
              }
            />
          </Stack>
        </Box>

        <Divider />

        {/* Sort */}
        <Box>
          <Stack direction="row" alignItems="center" gap={0.75} sx={{ mb: 1.5 }}>
            <SwapVertIcon sx={{ fontSize: 15, color: "text.secondary" }} />
            <SectionLabel>Sort By</SectionLabel>
          </Stack>
          <Stack direction="row" gap={0.75} flexWrap="wrap">
            {(
              ["name", "id", "role", "level", "work", "night", "off"] as const
            ).map((field) => {
              const active = local.sortField === field;
              return (
                <Chip
                  key={field}
                  label={field.charAt(0).toUpperCase() + field.slice(1)}
                  size="small"
                  variant={active ? "filled" : "outlined"}
                  color={active ? "primary" : "default"}
                  onClick={() =>
                    update({
                      sortField: field,
                      sortDir:
                        active && local.sortDir === "asc" ? "desc" : "asc",
                    })
                  }
                  icon={
                    active ? (
                      local.sortDir === "asc" ? (
                        <ExpandLessIcon />
                      ) : (
                        <ExpandMoreIcon />
                      )
                    ) : undefined
                  }
                  sx={{
                    fontSize: 11,
                    height: 26,
                    fontWeight: 600,
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                />
              );
            })}
          </Stack>
        </Box>
      </Box>

      {/* ── Footer actions ─────────────────────────────────────────────── */}
      <Stack
        direction="row"
        gap={1.5}
        sx={{
          px: 2.5,
          py: 2,
          borderTop: 1,
          borderColor: "divider",
          flexShrink: 0,
          bgcolor: isDark ? "rgba(255,255,255,0.015)" : "rgba(13,27,42,0.015)",
        }}
      >
        <Button
          fullWidth
          variant="outlined"
          onClick={handleClear}
          sx={{
            textTransform: "none",
            fontWeight: 650,
            borderRadius: "10px",
            height: 42,
            fontSize: 13,
          }}
        >
          Clear All
        </Button>
        <Button
          fullWidth
          variant="contained"
          disableElevation
          onClick={handleApply}
          sx={{
            textTransform: "none",
            fontWeight: 650,
            borderRadius: "10px",
            height: 42,
            fontSize: 13,
            background: "linear-gradient(135deg, #6366F1, #3B82F6)",
            "&:hover": {
              background: "linear-gradient(135deg, #4F46E5, #2563EB)",
            },
          }}
        >
          Apply{activeCount > 0 ? ` (${activeCount})` : ""}
        </Button>
      </Stack>
    </Drawer>
  );
}

// ─── FilterTriggerButton (for toolbar) ───────────────────────────────────────
export function FilterTriggerButton({
  activeCount,
  onClick,
}: {
  activeCount: number;
  onClick: () => void;
}) {
  return (
    <Badge badgeContent={activeCount} color="primary" max={9}>
      <Button
        size="small"
        variant={activeCount > 0 ? "contained" : "outlined"}
        disableElevation={activeCount > 0}
        startIcon={<TuneIcon sx={{ fontSize: 15 }} />}
        onClick={onClick}
        sx={{
          textTransform: "none",
          fontSize: 12,
          fontWeight: 650,
          borderRadius: "8px",
          height: 32,
          ...(activeCount > 0 && {
            background: "linear-gradient(135deg,#6366F1,#3B82F6)",
          }),
        }}
      >
        Filters
      </Button>
    </Badge>
  );
}