import { Box, Drawer, IconButton, Stack, Typography } from "@mui/material";
import { useMemo } from "react";
import type { NormalisedEmployee, ShiftCode } from "../../types/Futureweek.types";
import { shiftSummary } from "../../util/Futureweek.utils";
import { MONO, SHIFT_COLORS, SHIFT_DISPLAY_ORDER } from "../../util/Shiftconstants";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import CloseIcon from "@mui/icons-material/Close";

export function AnalyticsPanel({
  open,
  employees,
  onClose,
  isDark,
}: {
  open:      boolean;
  employees: NormalisedEmployee[];
  onClose:   () => void;
  isDark:    boolean;
}) {
  const shiftTotals = useMemo(() => {
    const counts: Partial<Record<ShiftCode, number>> = {};
    for (const emp of employees)
      for (const s of emp.shifts)
        counts[s] = (counts[s] ?? 0) + 1;
    return counts;
  }, [employees]);

  const totalCells = employees.length * 7;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        elevation: 0,
        sx: {
          width:           { xs: "100vw", sm: 360 },
          bgcolor:         isDark ? "#0D1521" : "#FAFBFC",
          backgroundImage: "none",
          borderLeft:      `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(13,27,42,0.07)"}`,
          display:         "flex",
          flexDirection:   "column",
        },
      }}
    >
      {/* Header */}
      <Stack
        direction="row"
        alignItems="center"
        sx={{
          px: 2.5, py: 2, flexShrink: 0,
          borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(13,27,42,0.07)"}`,
        }}
      >
        <BarChartOutlinedIcon sx={{ fontSize: 16, color: "primary.main", mr: 1 }} />
        <Typography sx={{ fontSize: 15, fontWeight: 750, letterSpacing: "-0.02em" }}>
          Analytics
        </Typography>
        <Box sx={{ flex: 1 }} />
        <IconButton size="small" onClick={onClose}>
          <CloseIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Stack>

      {/* Body */}
      <Box
        sx={{
          flex: 1, overflowY: "auto", p: 2.5,
          "&::-webkit-scrollbar": { width: 5 },
          "&::-webkit-scrollbar-thumb": {
            bgcolor: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)",
            borderRadius: 4,
          },
        }}
      >
        <Typography
          sx={{
            fontSize: 11, fontWeight: 700, color: "text.disabled",
            textTransform: "uppercase", letterSpacing: "0.07em", mb: 1.5,
          }}
        >
          Shift distribution
        </Typography>

        <Stack gap={1.25}>
          {SHIFT_DISPLAY_ORDER.map((code) => {
            const count = shiftTotals[code] ?? 0;
            const pct   = totalCells > 0 ? Math.round((count / totalCells) * 100) : 0;
            const tk    = SHIFT_COLORS[code];
            return (
              <Box key={code}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.5 }}>
                  <Stack direction="row" alignItems="center" gap={0.75}>
                    {/* Mini shift chip */}
                    <Box
                      component="span"
                      sx={{
                        display: "inline-grid", placeItems: "center",
                        width: 34, height: 20, borderRadius: "4px",
                        fontFamily: MONO, fontSize: 10, fontWeight: 700,
                        bgcolor: isDark ? tk.bgDark  : tk.bgLight,
                        color:   isDark ? tk.fgDark  : tk.fgLight,
                        border:  `1px solid ${isDark ? tk.borderDark : tk.borderLight}`,
                      }}
                    >
                      {code}
                    </Box>
                    <Typography sx={{ fontSize: 12, fontWeight: 500, color: "text.primary" }}>
                      {tk.label}
                    </Typography>
                  </Stack>
                  <Typography sx={{ fontSize: 11, fontFamily: MONO, color: "text.secondary", fontWeight: 600 }}>
                    {count}{" "}
                    <Typography component="span" sx={{ fontSize: 10, color: "text.disabled" }}>
                      ({pct}%)
                    </Typography>
                  </Typography>
                </Stack>
                <Box
                  sx={{
                    height: 4, borderRadius: 2,
                    bgcolor: isDark ? "rgba(255,255,255,0.06)" : "rgba(13,27,42,0.06)",
                    overflow: "hidden",
                  }}
                >
                  <Box
                    sx={{
                      width: `${pct}%`, height: "100%", borderRadius: 2,
                      bgcolor: tk.solid, transition: "width 0.4s ease",
                    }}
                  />
                </Box>
              </Box>
            );
          })}
        </Stack>

        {/* Summary card */}
        <Box
          sx={{
            mt: 3, p: 1.5, borderRadius: "10px",
            border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(13,27,42,0.07)"}`,
          }}
        >
          <Typography
            sx={{
              fontSize: 11, fontWeight: 700, color: "text.disabled",
              textTransform: "uppercase", letterSpacing: "0.07em", mb: 1,
            }}
          >
            Summary
          </Typography>
          <Stack gap={0.6}>
            {[
              { label: "Total employees", value: employees.length },
              { label: "Total cells",     value: totalCells },
              {
                label: "High night load (>2 N)",
                value: employees.filter((e) => shiftSummary(e.shifts).night > 2).length,
              },
              {
                label: "Low rest (≥3 off)",
                value: employees.filter((e) => shiftSummary(e.shifts).off >= 3).length,
              },
            ].map(({ label, value }) => (
              <Stack key={label} direction="row" justifyContent="space-between">
                <Typography sx={{ fontSize: 12, color: "text.secondary" }}>{label}</Typography>
                <Typography sx={{ fontSize: 12, fontWeight: 700, fontFamily: MONO, color: "text.primary" }}>
                  {value}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Box>
      </Box>
    </Drawer>
  );
}
