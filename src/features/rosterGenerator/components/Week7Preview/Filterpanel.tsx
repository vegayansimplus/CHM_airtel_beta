import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  Checkbox,
  Collapse,
  Divider,
  FormControlLabel,
  IconButton,
  Slider,
  Stack,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import PersonIcon from "@mui/icons-material/Person";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import TuneIcon from "@mui/icons-material/Tune";
import { ALL_LEVELS, LEVEL_COLORS, SHIFT_COLORS, SHIFT_ORDER, TOTAL_COLS, type FilterState, type ShiftCode } from "../../types/Gridtypes";
import { defaultFilter } from "../../util/Gridutils";
import { ShiftBadge } from "./Gridsharedui";

interface FilterPanelProps {
  open: boolean;
  filter: FilterState;
  availableRoles?: string[];
  onFilter: (f: FilterState) => void;
  onClose: () => void;
}

export function FilterPanel({
  open,
  filter,
  availableRoles = [],
  onFilter,
  onClose,
}: FilterPanelProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const [local, setLocal] = useState<FilterState>(filter);

  useEffect(() => {
    setLocal(filter);
  }, [filter, open]);

  const update = (patch: Partial<FilterState>) =>
    setLocal((p) => ({ ...p, ...patch }));

  const toggleArr = (arr: string[], val: string) =>
    arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];

  const toggleShift = (code: ShiftCode) =>
    update({
      shiftCodes: local.shiftCodes.includes(code)
        ? local.shiftCodes.filter((c) => c !== code)
        : [...local.shiftCodes, code],
    });

  const handleReset = () => {
    const d = defaultFilter();
    setLocal(d);
    onFilter(d);
  };
  const handleApply = () => {
    onFilter(local);
    onClose();
  };

  const sectionLabel = (text: string) => (
    <Typography
      sx={{
        fontSize: 11,
        fontWeight: 700,
        color: "text.secondary",
        mb: 1,
        textTransform: "uppercase",
        letterSpacing: "0.05em",
      }}
    >
      {text}
    </Typography>
  );

  return (
    <Collapse in={open}>
      <Card
        variant="outlined"
        sx={{
          borderRadius: "10px",
          overflow: "hidden",
          borderColor: "divider",
          mb: 0,
        }}
      >
        {/* Header */}
        <Stack
          direction="row"
          alignItems="center"
          sx={{
            px: 2,
            py: 1.25,
            borderBottom: 1,
            borderColor: "divider",
            bgcolor: isDark
              ? "rgba(255,255,255,0.015)"
              : "rgba(13,27,42,0.015)",
          }}
        >
          <TuneIcon sx={{ fontSize: 15, color: "text.secondary", mr: 1 }} />
          <Typography
            sx={{ fontSize: 12.5, fontWeight: 700, color: "text.primary" }}
          >
            Advanced Filters
          </Typography>
          <Box flex={1} />
          <Button
            size="small"
            startIcon={<RestartAltIcon />}
            onClick={handleReset}
            sx={{
              fontSize: 11,
              textTransform: "none",
              color: "text.secondary",
              mr: 1,
            }}
          >
            Reset all
          </Button>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Stack>

        {/* Grid */}
        <Box
          sx={{
            p: 2,
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "1fr 1fr",
              md: "repeat(4,1fr)",
            },
            gap: 2,
          }}
        >
          {/* Level */}
          <Box>
            {sectionLabel("Level")}
            <Stack gap={0.5}>
              {ALL_LEVELS.map((lv) => {
                const c = LEVEL_COLORS[lv];
                const active = local.levels.includes(lv);
                return (
                  <Box
                    key={lv}
                    onClick={() =>
                      update({ levels: toggleArr(local.levels, lv) })
                    }
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      px: 1.25,
                      py: 0.75,
                      borderRadius: "6px",
                      cursor: "pointer",
                      border: "1px solid",
                      borderColor: active ? alpha(c.solid, 0.4) : "divider",
                      bgcolor: active ? alpha(c.solid, 0.06) : "transparent",
                      transition: "all 0.12s",
                      "&:hover": {
                        borderColor: alpha(c.solid, 0.35),
                        bgcolor: alpha(c.solid, 0.04),
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
                      }}
                    />
                    <Typography
                      sx={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: active ? c.text : "text.primary",
                        flex: 1,
                      }}
                    >
                      {lv}
                    </Typography>
                    {active && (
                      <CheckIcon sx={{ fontSize: 13, color: c.solid }} />
                    )}
                  </Box>
                );
              })}
            </Stack>
          </Box>

          {/* Role */}
          <Box>
            {sectionLabel("Role")}
            <Stack gap={0.5} sx={{ maxHeight: 200, overflow: "auto" }}>
              {availableRoles.map((role) => {
                const active = local.roles.includes(role);
                return (
                  <Box
                    key={role}
                    onClick={() =>
                      update({ roles: toggleArr(local.roles, role) })
                    }
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      px: 1.25,
                      py: 0.75,
                      borderRadius: "6px",
                      cursor: "pointer",
                      border: "1px solid",
                      borderColor: active
                        ? alpha(theme.palette.primary.main, 0.4)
                        : "divider",
                      bgcolor: active
                        ? alpha(theme.palette.primary.main, 0.06)
                        : "transparent",
                      transition: "all 0.12s",
                      "&:hover": {
                        bgcolor: alpha(theme.palette.primary.main, 0.04),
                      },
                    }}
                  >
                    <PersonIcon
                      sx={{
                        fontSize: 13,
                        color: active ? "primary.main" : "text.disabled",
                        flexShrink: 0,
                      }}
                    />
                    <Typography
                      sx={{
                        fontSize: 11.5,
                        fontWeight: 500,
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
              {availableRoles.length === 0 && (
                <Typography
                  sx={{ fontSize: 11, color: "text.disabled", py: 1 }}
                >
                  No roles loaded
                </Typography>
              )}
            </Stack>
          </Box>

          {/* Has Shift */}
          <Box>
            {sectionLabel("Has Shift")}
            <Stack gap={0.5}>
              {SHIFT_ORDER.map((code) => {
                const c = SHIFT_COLORS[code];
                const active = local.shiftCodes.includes(code);
                return (
                  <Box
                    key={code}
                    onClick={() => toggleShift(code)}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      px: 1.25,
                      py: 0.75,
                      borderRadius: "6px",
                      cursor: "pointer",
                      border: "1px solid",
                      borderColor: active ? alpha(c.solid, 0.4) : "divider",
                      bgcolor: active ? alpha(c.solid, 0.06) : "transparent",
                      transition: "all 0.12s",
                    }}
                  >
                    <ShiftBadge code={code} size="sm" />
                    <Typography
                      sx={{
                        fontSize: 11.5,
                        fontWeight: 500,
                        color: "text.primary",
                        flex: 1,
                      }}
                    >
                      {c.label}
                    </Typography>
                    {active && (
                      <CheckIcon sx={{ fontSize: 13, color: c.solid }} />
                    )}
                  </Box>
                );
              })}
            </Stack>
          </Box>

          {/* Ranges */}
          <Box>
            {sectionLabel("Work Days Range")}
            <Slider
              value={local.workRange}
              onChange={(_, v) => update({ workRange: v as [number, number] })}
              min={0}
              max={TOTAL_COLS}
              valueLabelDisplay="auto"
              size="small"
              sx={{ mb: 0.5 }}
            />
            <Typography sx={{ fontSize: 11, color: "text.secondary", mb: 2 }}>
              {local.workRange[0]} – {local.workRange[1]} work days
            </Typography>

            {sectionLabel("Night Shifts Range")}
            <Slider
              value={local.nightRange}
              onChange={(_, v) => update({ nightRange: v as [number, number] })}
              min={0}
              max={TOTAL_COLS}
              valueLabelDisplay="auto"
              size="small"
              sx={{ mb: 0.5 }}
            />
            <Typography sx={{ fontSize: 11, color: "text.secondary", mb: 1 }}>
              {local.nightRange[0]} – {local.nightRange[1]} night shifts
            </Typography>

            <Divider sx={{ my: 1.5 }} />
            {sectionLabel("Quick Flags")}
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
                  <Typography sx={{ fontSize: 12 }}>
                    High night load (&gt;2)
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
                  <Typography sx={{ fontSize: 12 }}>
                    Low rest (&lt;3 OFF)
                  </Typography>
                }
              />
            </Stack>
          </Box>
        </Box>

        {/* Footer */}
        <Stack
          direction="row"
          justifyContent="flex-end"
          gap={1}
          sx={{
            px: 2,
            py: 1.25,
            borderTop: 1,
            borderColor: "divider",
            bgcolor: isDark
              ? "rgba(255,255,255,0.008)"
              : "rgba(13,27,42,0.008)",
          }}
        >
          <Button
            size="small"
            onClick={onClose}
            sx={{
              fontSize: 12,
              textTransform: "none",
              color: "text.secondary",
            }}
          >
            Cancel
          </Button>
          <Button
            size="small"
            variant="contained"
            onClick={handleApply}
            sx={{ fontSize: 12, textTransform: "none" }}
          >
            Apply filters
          </Button>
        </Stack>
      </Card>
    </Collapse>
  );
}
