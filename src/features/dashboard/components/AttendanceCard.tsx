import { useEffect, useState } from "react";
import { Box, Button, Card, Chip, Skeleton, Typography } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import BusinessIcon from "@mui/icons-material/Business";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { format, parseISO } from "date-fns";
import type { Colors } from "../types/colorTypes";
import type { AttendanceRow, WorkMode } from "../types/dashboard.types";
import type { DashboardAttendanceStatus } from "../hooks/useDashboardAttendance";
import { fadeIn, getCardSx } from "../constants/dashboard.styles";
import { PermissionGate } from "../../../rbac/PermissionGate";
import { SectionHeader } from "./SectionHeader";
import { AttendanceTimeline } from "./AttendanceTimeline";

interface AttendanceCardProps {
  attendance?: AttendanceRow | null;
  status: DashboardAttendanceStatus;
  errorMessage?: string;
  isMutating: boolean;
  onSetWorkMode: (mode: WorkMode) => void;
  onClockIn: (mode?: WorkMode) => void;
  onClockOut: () => void;
  colors: Colors;
  mounted: boolean;
  delay: number;
}

function formatMinutes(mins: number | null | undefined): string {
  if (!mins || mins <= 0) return "0h 0m";
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

function formatClock(iso: string | null | undefined): string {
  if (!iso) return "—";
  return format(parseISO(iso), "h:mm a");
}

/** "H:MM:SS" — used by the prominent running timer. */
function formatStopwatch(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

/** Live-ticking elapsed seconds since clock-in, for display only (no extra network calls). */
function useLiveElapsedSeconds(clockInTime: string | null | undefined, clockOutTime: string | null | undefined, fallbackMinutes: number | null | undefined) {
  const [seconds, setSeconds] = useState((fallbackMinutes ?? 0) * 60);

  useEffect(() => {
    if (!clockInTime || clockOutTime) {
      setSeconds((fallbackMinutes ?? 0) * 60);
      return;
    }
    const start = parseISO(clockInTime).getTime();
    const tick = () => setSeconds(Math.max(0, Math.floor((Date.now() - start) / 1000)));
    tick();
    const id = setInterval(tick, 1_000);
    return () => clearInterval(id);
  }, [clockInTime, clockOutTime, fallbackMinutes]);

  return seconds;
}

export function AttendanceCard({
  attendance,
  status,
  errorMessage,
  isMutating,
  onSetWorkMode,
  onClockIn,
  onClockOut,
  colors,
  mounted,
  delay,
}: AttendanceCardProps) {
  const workMode = attendance?.workfromLocation ?? null;
  const attendanceStatus = attendance?.status ?? "NOT_STARTED";
  const elapsedSeconds = useLiveElapsedSeconds(attendance?.clockInTime, attendance?.clockOutTime, attendance?.workedMinutes);
  const workedMinutes = Math.floor(elapsedSeconds / 60);

  const statusChip =
    attendanceStatus === "CLOCKED_IN"
      ? { label: "Working", tone: colors.success, bg: colors.successDim }
      : attendanceStatus === "CLOCKED_OUT"
        ? { label: "Day complete", tone: colors.textSecondary, bg: colors.border }
        : { label: "Not started", tone: colors.textDim, bg: colors.border };

  return (
    <Card sx={{ ...getCardSx(colors), p: "16px", ...fadeIn(mounted, delay) }}>
      <SectionHeader
        title="Today's attendance"
        colors={colors}
        right={
          status === "ready" || status === "empty" ? (
            <Chip
              label={statusChip.label}
              size="small"
              sx={{ bgcolor: statusChip.bg, color: statusChip.tone, fontWeight: 700, fontSize: 11 }}
            />
          ) : undefined
        }
      />

      {status === "loading" && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: "10px", py: "6px" }}>
          <Skeleton variant="rounded" height={36} sx={{ borderRadius: "10px" }} />
          <Skeleton variant="rounded" height={36} sx={{ borderRadius: "10px" }} />
        </Box>
      )}

      {status === "error" && (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "6px", py: "22px" }}>
          <ErrorOutlineIcon sx={{ fontSize: 24, color: colors.danger }} />
          <Typography sx={{ fontSize: 12, fontWeight: 600, color: colors.danger, textAlign: "center" }}>
            {errorMessage}
          </Typography>
        </Box>
      )}

      {(status === "ready" || status === "empty") && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {attendanceStatus !== "NOT_STARTED" && (
            <Box
              sx={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "center",
                gap: "8px",
                py: "4px",
              }}
            >
              <Typography
                sx={{
                  fontSize: 28,
                  fontWeight: 800,
                  fontFamily: "'DM Mono','Roboto Mono',monospace",
                  letterSpacing: ".5px",
                  color: attendanceStatus === "CLOCKED_IN" ? colors.success : colors.textSecondary,
                }}
              >
                {formatStopwatch(elapsedSeconds)}
              </Typography>
              <Typography sx={{ fontSize: 11, fontWeight: 700, color: colors.textDim }}>
                {attendanceStatus === "CLOCKED_IN" ? "worked so far" : "total worked"}
              </Typography>
            </Box>
          )}

          <PermissionGate
            module="Me"
            action="UPDATE"
            fallback={
              <Typography sx={{ fontSize: 12, color: colors.textDim }}>
                You don't have permission to update attendance.
              </Typography>
            }
          >
            <Box sx={{ display: "flex", gap: "8px" }}>
              <Button
                fullWidth
                size="small"
                disabled={isMutating || attendanceStatus !== "NOT_STARTED"}
                onClick={() => onSetWorkMode("WFH")}
                startIcon={<HomeIcon sx={{ fontSize: 16 }} />}
                variant={workMode === "WFH" ? "contained" : "outlined"}
                sx={{ textTransform: "none", fontWeight: 700, borderRadius: "10px" }}
              >
                WFH
              </Button>
              <Button
                fullWidth
                size="small"
                disabled={isMutating || attendanceStatus !== "NOT_STARTED"}
                onClick={() => onSetWorkMode("WFO")}
                startIcon={<BusinessIcon sx={{ fontSize: 16 }} />}
                variant={workMode === "WFO" ? "contained" : "outlined"}
                sx={{ textTransform: "none", fontWeight: 700, borderRadius: "10px" }}
              >
                WFO
              </Button>
            </Box>

            {attendanceStatus === "NOT_STARTED" && (
              <Button
                fullWidth
                size="small"
                color="success"
                disabled={isMutating || !workMode}
                onClick={() => onClockIn(workMode ?? undefined)}
                startIcon={<LoginIcon sx={{ fontSize: 16 }} />}
                variant="contained"
                sx={{ textTransform: "none", fontWeight: 700, borderRadius: "10px" }}
              >
                Clock In
              </Button>
            )}

            {attendanceStatus === "CLOCKED_IN" && (
              <Button
                fullWidth
                size="small"
                color="error"
                disabled={isMutating}
                onClick={onClockOut}
                startIcon={<LogoutIcon sx={{ fontSize: 16 }} />}
                variant="contained"
                sx={{ textTransform: "none", fontWeight: 700, borderRadius: "10px" }}
              >
                Clock Out
              </Button>
            )}
          </PermissionGate>

          <AttendanceTimeline
            shiftRange={attendance?.shiftRange ?? null}
            clockInTime={attendance?.clockInTime ?? null}
            clockOutTime={attendance?.clockOutTime ?? null}
            status={attendanceStatus}
            colors={colors}
          />

          <Box sx={{ display: "flex", justifyContent: "space-between", pt: "4px", borderTop: `1px solid ${colors.border}` }}>
            <Box>
              <Typography sx={{ fontSize: 10, color: colors.textDim, fontWeight: 600 }}>CLOCK IN</Typography>
              <Typography sx={{ fontSize: 13, color: colors.textPrimary, fontWeight: 700 }}>
                {formatClock(attendance?.clockInTime)}
              </Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: 10, color: colors.textDim, fontWeight: 600 }}>CLOCK OUT</Typography>
              <Typography sx={{ fontSize: 13, color: colors.textPrimary, fontWeight: 700 }}>
                {formatClock(attendance?.clockOutTime)}
              </Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: 10, color: colors.textDim, fontWeight: 600 }}>HOURS</Typography>
              <Typography sx={{ fontSize: 13, color: colors.accent, fontWeight: 700 }}>
                {formatMinutes(workedMinutes)}
              </Typography>
            </Box>
          </Box>
        </Box>
      )}
    </Card>
  );
}
