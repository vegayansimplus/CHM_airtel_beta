import { useMemo } from "react";
import {
  TableCell,
  Box,
  Stack,
  Typography,
  IconButton,
  Tooltip,
  useTheme,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import InfoIcon from "@mui/icons-material/Info";
import dayjs from "dayjs";
import { isFutureDate } from "../utils/dateUtils";
import { useAuth } from "../../auth/hooks/useAuth";
import { usePermission } from "../../auth/hooks/usePermission";

/* ─── Types ─────────────────────────────────────────────────────────────── */
export interface ShiftStyle {
  badgeBg: string;
  cardBg: string;
  cardBgDark: string;
  cardBorder: string;
  cardBorderDark: string;
  textColor: string;
  textColorDark: string;
  glowColor: string;
}

export const SHIFT_COLOR_MAP: Record<string, ShiftStyle> = {
  G: {
    badgeBg: "#3B82F6",
    cardBg: "#EEF5FF",
    cardBgDark: "#0c1f3d",
    cardBorder: "#C3D9FE",
    cardBorderDark: "#1d4ed8",
    textColor: "#1E40AF",
    textColorDark: "#93c5fd",
    glowColor: "rgba(59,130,246,.22)",
  },
  LG: {
    badgeBg: "#10B981",
    cardBg: "#EDFBF3",
    cardBgDark: "#022c22",
    cardBorder: "#9DECBF",
    cardBorderDark: "#059669",
    textColor: "#065F46",
    textColorDark: "#6ee7b7",
    glowColor: "rgba(16,185,129,.2)",
  },
  B: {
    badgeBg: "#F59E0B",
    cardBg: "#FFF8EE",
    cardBgDark: "#2c1800",
    cardBorder: "#FCD97D",
    cardBorderDark: "#d97706",
    textColor: "#854D0E",
    textColorDark: "#fcd34d",
    glowColor: "rgba(245,158,11,.2)",
  },
  N: {
    badgeBg: "#6366F1",
    cardBg: "#F1F0FF",
    cardBgDark: "#1e1b4b",
    cardBorder: "#C0B8FD",
    cardBorderDark: "#4338ca",
    textColor: "#3730A3",
    textColorDark: "#a5b4fc",
    glowColor: "rgba(99,102,241,.22)",
  },
  A: {
    badgeBg: "#FBBF24",
    cardBg: "#FFFCEE",
    cardBgDark: "#271e00",
    cardBorder: "#FCE98D",
    cardBorderDark: "#b45309",
    textColor: "#78350F",
    textColorDark: "#fde68a",
    glowColor: "rgba(251,191,36,.2)",
  },
  L: {
    badgeBg: "#EC4899",
    cardBg: "#FEF0FA",
    cardBgDark: "#3b0a20",
    cardBorder: "#F9C4E8",
    cardBorderDark: "#be185d",
    textColor: "#9D174D",
    textColorDark: "#f9a8d4",
    glowColor: "rgba(236,72,153,.2)",
  },
  H: {
    badgeBg: "#F43F5E",
    cardBg: "#FFF0F2",
    cardBgDark: "#2d0a0e",
    cardBorder: "#FECDD3",
    cardBorderDark: "#be123c",
    textColor: "#881337",
    textColorDark: "#fda4af",
    glowColor: "rgba(244,63,94,.2)",
  },
  C: {
    badgeBg: "#94A3B8",
    cardBg: "#F8FAFC",
    cardBgDark: "#1e293b",
    cardBorder: "#E2E8F0",
    cardBorderDark: "#475569",
    textColor: "#475569",
    textColorDark: "#cbd5e1",
    glowColor: "rgba(148,163,184,.15)",
  },
  NJ: {
    badgeBg: "#F59E0B",
    cardBg: "#FFFBEB",
    cardBgDark: "#292000",
    cardBorder: "#FDE68A",
    cardBorderDark: "#92400e",
    textColor: "#78350F",
    textColorDark: "#fcd34d",
    glowColor: "rgba(245,158,11,.18)",
  },
  W: {
    badgeBg: "#D1D5DB",
    cardBg: "#FAFAFA",
    cardBgDark: "#111827",
    cardBorder: "#E4E7EC",
    cardBorderDark: "#374151",
    textColor: "#98A2B3",
    textColorDark: "#6b7280",
    glowColor: "rgba(0,0,0,.06)",
  },
};

/* ─── Shift key resolver ─────────────────────────────────────────────────── */
function resolveShiftKey(
  shift: any,
  isOff: boolean,
  isLeave: boolean,
): string {
  if (isOff) return "W";
  if (isLeave) return "L";
  const d = (shift?.shiftDisplay ?? "").trim();
  if (d === "New Joinee") return "NJ";
  if (d === "Holiday") return "H";
  if (d === "Comp Off" || d === "CO") return "C";
  if (d.startsWith("LG")) return "LG";
  return d.charAt(0).toUpperCase() || "W";
}

/* ─── Props ─────────────────────────────────────────────────────────────── */
interface RosterShiftCellProps {
  shift: any;
  shiftDate: string | Date;
  rowUserId: string | number;
  onEditClick: (shift: any) => void;
  onInfoClick?: (
    shift: any,
    date: string | Date,
    id: string | number,
  ) => void;
  isSelectedForSwap?: boolean;
  isSwapMode?: boolean;
  /** When set, cells whose shift key does NOT match are dimmed */
  highlightShift?: string;
}

/* ─── Component ─────────────────────────────────────────────────────────── */
export const RosterShiftCell = ({
  shift,
  shiftDate,
  rowUserId,
  onEditClick,
  onInfoClick,
  isSelectedForSwap,
  isSwapMode,
  highlightShift = "",
}: RosterShiftCellProps) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const { user, role } = useAuth();
  const { hasPermission } = usePermission();

  const isOff =
    !shift || shift.shiftDisplay === "WO" || shift.type === "Week Off";
  const isLeave =
    shift?.shiftDisplay?.toLowerCase() === "leave" ||
    shift?.type === "Leave";
  const isRegular = !isOff && !isLeave;
  const isToday = dayjs(shiftDate).isSame(dayjs(), "day");
  const shiftKey = resolveShiftKey(shift, isOff, isLeave);
  const style = SHIFT_COLOR_MAP[shiftKey] ?? SHIFT_COLOR_MAP.W;

  const cardBg = isDark ? style.cardBgDark : style.cardBg;
  const cardBorder = isDark ? style.cardBorderDark : style.cardBorder;
  const textColor = isDark ? style.textColorDark : style.textColor;

  /** Dim this cell when highlight is active and this shift doesn't match */
  const isDimmed = highlightShift !== "" && shiftKey !== highlightShift;

  const isFuture = isFutureDate(shiftDate);
  const canEdit = useMemo(() => {
    if (!isFuture) return false;
    if (role === "TEAM_MEMBER")
      return String(user?.userId) === String(rowUserId);
    return (
      hasPermission("Roster Management", "UPDATE") || role === "SUPER_ADMIN"
    );
  }, [isFuture, role, user, rowUserId, hasPermission]);

  const isClickable = canEdit || isSwapMode;
  const title = isOff
    ? "Week Off"
    : isLeave
      ? "Leave"
      : shift?.shiftDisplay || "Shift";
  const timeRange = isRegular ? shift?.timeRange || "" : "";

  /* ── Week-off: minimal dashed box ─────────────────────────────────── */
  if (isOff) {
    return (
      <TableCell sx={{ p: "3px", borderBottom: "none" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: 42,
            borderRadius: "8px",
            border: "1px dashed",
            borderColor: isDark ? "rgba(255,255,255,.12)" : "#E4E7EC",
            bgcolor: isDark ? "rgba(255,255,255,.03)" : "#FAFAFA",
            opacity: isDimmed ? 0.1 : 1,
            transition: "opacity .14s",
          }}
        >
          <Typography
            fontSize="0.6rem"
            fontWeight={500}
            sx={{
              color: isDark ? "rgba(255,255,255,.25)" : "#D0D5DD",
              letterSpacing: ".02em",
            }}
          >
            Week off
          </Typography>
        </Box>
      </TableCell>
    );
  }

  /* ── Regular shift ────────────────────────────────────────────────── */
  return (
    <TableCell sx={{ p: "3px", borderBottom: "none" }}>
      <Tooltip
        title={`${title}${timeRange ? ` · ${timeRange}` : ""}`}
        arrow
        enterDelay={500}
      >
        <Box
          onClick={() => isClickable && onEditClick(shift)}
          sx={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            gap: "5px",
            bgcolor: isSelectedForSwap
              ? isDark
                ? "#1E3A8A"
                : "#DBEAFE"
              : cardBg,
            border: `1px solid ${
              isSelectedForSwap
                ? "#2563EB"
                : isToday
                  ? style.badgeBg
                  : cardBorder
            }`,
            borderRadius: "8px",
            px: "6px",
            height: 42,
            overflow: "hidden",
            cursor: isClickable ? "pointer" : "default",
            opacity: isDimmed ? 0.12 : 1,
            transition:
              "transform .13s ease, box-shadow .13s ease, opacity .14s",
            // Today: outline + pulse
            ...(isToday &&
              !isSelectedForSwap && {
                outline: `1.5px solid ${style.badgeBg}`,
                outlineOffset: "1px",
                animation: "todayPulseCell 2.6s ease-in-out infinite",
                "@keyframes todayPulseCell": {
                  "0%,100%": { boxShadow: `0 0 0 0 ${style.glowColor}` },
                  "60%": { boxShadow: `0 0 0 5px transparent` },
                },
                "&::before": {
                  content: '""',
                  position: "absolute",
                  inset: 0,
                  borderRadius: "7px",
                  background:
                    "linear-gradient(108deg,transparent 20%,rgba(255,255,255,.22) 50%,transparent 80%)",
                  backgroundSize: "200% 100%",
                  animation: "sweepCell 3s linear infinite",
                  pointerEvents: "none",
                },
                "@keyframes sweepCell": {
                  "0%": { backgroundPosition: "-200% center" },
                  "100%": { backgroundPosition: "200% center" },
                },
              }),
            "&:hover": {
              transform: isClickable ? "translateY(-1px)" : "none",
              boxShadow: isClickable ? "0 4px 12px rgba(0,0,0,.08)" : "none",
              "& .sc-ico": { opacity: 0, transform: "translateY(-4px)" },
              "& .sc-info": { opacity: 1 },
            },
          }}
        >
          {/* Today "Live" tag */}
          {isToday && !isSelectedForSwap && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                right: 0,
                bgcolor: style.badgeBg,
                color: "#fff",
                fontSize: "7px",
                fontWeight: 700,
                px: "6px",
                py: "2px",
                borderRadius: "0 7px 0 6px",
                letterSpacing: ".06em",
                textTransform: "uppercase",
                display: "flex",
                alignItems: "center",
                gap: "3px",
                zIndex: 1,
              }}
            >
              <Box
                sx={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  bgcolor: "rgba(255,255,255,.8)",
                  animation:
                    "dotPop .4s .2s both cubic-bezier(.34,1.56,.64,1)",
                  "@keyframes dotPop": {
                    "0%": { transform: "scale(0)", opacity: 0 },
                    "70%": { transform: "scale(1.4)" },
                    "100%": { transform: "scale(1)", opacity: 1 },
                  },
                }}
              />
            </Box>
          )}

          {/* Badge */}
          <Box
            sx={{
              width: 23,
              height: 23,
              borderRadius: "6px",
              bgcolor: style.badgeBg,
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: shiftKey.length > 1 ? "0.48rem" : "0.58rem",
              letterSpacing: "-.4px",
              flexShrink: 0,
              textShadow: "0 1px 2px rgba(0,0,0,.15)",
            }}
          >
            {shiftKey}
          </Box>

          {/* Text */}
          <Stack sx={{ flex: 1, minWidth: 0, pr: "14px" }}>
            <Typography
              fontSize="0.6rem"
              fontWeight={700}
              noWrap
              sx={{ color: textColor, lineHeight: 1.3 }}
            >
              {title}
            </Typography>
            {timeRange && (
              <Typography
                fontSize="0.55rem"
                fontWeight={500}
                noWrap
                sx={{
                  color: textColor,
                  opacity: 0.6,
                  lineHeight: 1.2,
                  mt: "1px",
                }}
              >
                {timeRange}
              </Typography>
            )}
          </Stack>

          {/* Status icon (hides on hover) */}
          {!isToday && isRegular && !isSelectedForSwap && (
            <Box
              className="sc-ico"
              sx={{
                position: "absolute",
                top: 4,
                right: 5,
                width: 14,
                height: 14,
                borderRadius: "50%",
                bgcolor: `${style.badgeBg}22`,
                color: style.badgeBg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "9px",
                transition: "opacity .15s, transform .15s",
              }}
            />
          )}

          {/* Edit button */}
          {canEdit && !isSwapMode && (
            <IconButton
              size="small"
              sx={{
                position: "absolute",
                top: 3,
                right: 3,
                opacity: 0,
                transform: "scale(.8)",
                transition: "all .15s ease",
                bgcolor: isDark
                  ? "rgba(255,255,255,.1)"
                  : "rgba(0,0,0,.04)",
                p: "2px",
                ".sc:hover &, &:focus": { opacity: 1, transform: "scale(1)" },
              }}
            >
              <EditIcon sx={{ fontSize: 12 }} />
            </IconButton>
          )}

          {/* Info icon (appears on hover) */}
          {isRegular && onInfoClick && !isSelectedForSwap && (
            <IconButton
              className="sc-info"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onInfoClick(shift, shiftDate, rowUserId);
              }}
              sx={{
                position: "absolute",
                bottom: 2,
                right: 4,
                opacity: 0,
                transition: "opacity .15s",
                bgcolor: isDark
                  ? "rgba(255,255,255,.08)"
                  : "rgba(0,0,0,.04)",
                p: "1px",
              }}
            >
              <InfoIcon sx={{ fontSize: 11, color: "text.secondary" }} />
            </IconButton>
          )}

          {/* Swap selected checkmark */}
          {isSelectedForSwap && (
            <Box
              sx={{
                position: "absolute",
                top: 3,
                right: 3,
                width: 14,
                height: 14,
                borderRadius: "50%",
                bgcolor: "#2563EB",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography
                sx={{ color: "#fff", fontSize: "8px", fontWeight: 800 }}
              >
                ✓
              </Typography>
            </Box>
          )}
        </Box>
      </Tooltip>
    </TableCell>
  );
};
