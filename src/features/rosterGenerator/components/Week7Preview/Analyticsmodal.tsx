import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Stack,
  Typography,
  Button,
  Alert,
  LinearProgress,
  alpha,
  useTheme,
} from "@mui/material";
import {
  colCounts,
  empSummary,
  fmtShort,
  spanCounts,
  workingTotal,
} from "../../util/Gridutils";
import {
    DOW,
    SHIFT_COLORS,
  type ShiftCode,
  type Employee,
  SHIFT_ORDER,
} from "../../types/Gridtypes";
import { ShiftBadge } from "./Gridsharedui";
// import { SHIFT_COLORS, SHIFT_ORDER, DOW, type Employee, type ShiftCode } from "./Gridtypes";
// import { spanCounts, colCounts, workingTotal, empSummary } from "./Gridutils";
// import { ShiftBadge } from "./GridSharedUI";
// import { fmtShort } from "./Gridutils";

interface AnalyticsModalProps {
  open: boolean;
  grid: Record<string, ShiftCode[]>;
  emps: Employee[];
  dates: Date[];
  onClose: () => void;
}

export function AnalyticsModal({
  open,
  grid,
  emps,
  dates,
  onClose,
}: AnalyticsModalProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const len = dates.length;

  const totals = spanCounts(grid, emps, 0, len);
  const totalShifts = Object.values(totals).reduce((a, b) => a + b, 0) || 1;

  const busiestDay = Array.from({ length: len }, (_, i) => ({
    label: `${DOW[i % 7]} ${fmtShort(dates[i])}`,
    count: workingTotal(colCounts(grid, emps, i)),
  })).sort((a, b) => b.count - a.count)[0];

  const nightHeavy = emps.filter((e) => empSummary(grid[e.id] ?? []).n > 2);
  const lowRest = emps.filter((e) => empSummary(grid[e.id] ?? []).off >= 3);

  const dateLabel =
    dates.length >= 2
      ? `${fmtShort(dates[0])} – ${fmtShort(dates[dates.length - 1])}`
      : "";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        elevation: 0,
        sx: {
          borderRadius: "16px",
          border: `1px solid ${theme.palette.divider}`,
          bgcolor: isDark ? "#0F1923" : "#fff",
          overflow: "hidden",
        },
      }}
    >
      <DialogTitle
        sx={{
          fontWeight: 750,
          fontSize: 18,
          pb: 0.5,
          letterSpacing: "-0.02em",
          borderBottom: 1,
          borderColor: "divider",
          background: isDark
            ? "linear-gradient(135deg,rgba(99,102,241,0.08),rgba(59,130,246,0.04))"
            : "linear-gradient(135deg,rgba(99,102,241,0.03),rgba(59,130,246,0.015))",
        }}
      >
        Week Analytics
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontSize: 12, fontWeight: 500, mt: 0.25 }}
        >
          {emps.length} employees · {dateLabel}
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pt: 2.5 }}>
        {/* Shift distribution grid */}
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
          Shift Distribution
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 1.25,
            mb: 2.5,
          }}
        >
          {SHIFT_ORDER.map((code) => {
            const c = SHIFT_COLORS[code];
            const count = totals[code] ?? 0;
            const pct = Math.round((count / totalShifts) * 100);
            return (
              <Box
                key={code}
                sx={{
                  p: 1.75,
                  borderRadius: "12px",
                  border: `1px solid ${alpha(c.solid, 0.2)}`,
                  bgcolor: alpha(c.solid, 0.04),
                  transition: "all 0.2s ease",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: `0 6px 20px ${alpha(c.solid, 0.15)}`,
                  },
                }}
              >
                <ShiftBadge code={code} />
                <Typography
                  sx={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 26,
                    fontWeight: 700,
                    mt: 1,
                    lineHeight: 1,
                    color: isDark ? c.textDark : c.text,
                  }}
                >
                  {count}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={pct}
                  sx={{
                    mt: 1,
                    height: 4,
                    borderRadius: 2,
                    bgcolor: alpha(c.solid, 0.1),
                    "& .MuiLinearProgress-bar": {
                      bgcolor: c.solid,
                      borderRadius: 2,
                    },
                  }}
                />
                <Typography
                  sx={{
                    fontSize: 10.5,
                    color: "text.secondary",
                    fontWeight: 600,
                    mt: 0.5,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  {pct}%
                </Typography>
              </Box>
            );
          })}
        </Box>

        {/* Summary stats */}
        <Typography
          sx={{
            fontSize: 10,
            fontWeight: 800,
            color: "text.disabled",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            mb: 1.25,
          }}
        >
          Compliance Summary
        </Typography>
        <Stack gap={1}>
          <Alert
            severity="info"
            variant="outlined"
            sx={{ borderRadius: "10px", fontSize: 13 }}
          >
            <strong>Busiest day:</strong> {busiestDay?.label ?? "N/A"} with{" "}
            <strong>{busiestDay?.count ?? 0}</strong> active staff
          </Alert>
          {nightHeavy.length > 0 && (
            <Alert
              severity="warning"
              variant="outlined"
              sx={{ borderRadius: "10px", fontSize: 13 }}
            >
              <strong>
                {nightHeavy.length} employee{nightHeavy.length > 1 ? "s" : ""}
              </strong>{" "}
              with high night load (&gt;2 night shifts)
            </Alert>
          )}
          {lowRest.length > 0 && (
            <Alert
              severity="error"
              variant="outlined"
              sx={{ borderRadius: "10px", fontSize: 13 }}
            >
              <strong>
                {lowRest.length} employee{lowRest.length > 1 ? "s" : ""}
              </strong>{" "}
              with low rest (≥3 days off — review needed)
            </Alert>
          )}
          {nightHeavy.length === 0 && lowRest.length === 0 && (
            <Alert
              severity="success"
              variant="outlined"
              sx={{ borderRadius: "10px", fontSize: 13 }}
            >
              All employees are within compliance thresholds this week.
            </Alert>
          )}
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{ px: 3, pb: 2.5, borderTop: 1, borderColor: "divider" }}
      >
        <Button
          onClick={onClose}
          variant="contained"
          disableElevation
          sx={{
            textTransform: "none",
            px: 3,
            borderRadius: "8px",
            fontWeight: 650,
            background: "linear-gradient(135deg,#6366F1,#3B82F6)",
          }}
        >
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
}
