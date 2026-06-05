import { useMemo } from "react";
import { TableCell, Box, Typography, Tooltip, useTheme } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { isFutureDate } from "../utils/dateUtils";
import { useAuth } from "../../auth/hooks/useAuth";
import { usePermission } from "../../auth/hooks/usePermission";

// ─── Shift palette ─────────────────────────────────────────────────────────
interface ShiftStyle {
  bg: string;
  border: string;
  txt: string;
  dot: string;
}

const SHIFT_STYLES: Record<string, ShiftStyle> = {
  N:  { bg: "#E6EAFF", border: "#A5B0F5", txt: "#1E1B6B", dot: "#3730A3" }, // Night    — indigo
  A:  { bg: "#FEFCE8", border: "#FDE68A", txt: "#713F12", dot: "#A16207" }, // Afternoon— amber
  B:  { bg: "#FFF7ED", border: "#FDBA74", txt: "#7C2D12", dot: "#C2410C" }, // Break    — orange
  G:  { bg: "#EFF6FF", border: "#BFDBFE", txt: "#1E3A8A", dot: "#2563EB" }, // General  — blue
  LG: { bg: "#F0FDF4", border: "#BBF7D0", txt: "#14532D", dot: "#15803D" }, // LG shift — green
  L:  { bg: "#FFF1F2", border: "#FECDD3", txt: "#881337", dot: "#BE185D" }, // Leave    — rose
  W:  { bg: "#F5F5F4", border: "#D6D3D1", txt: "#44403C", dot: "#78716C" }, // Week off — stone
  H:  { bg: "#FFF1F2", border: "#FECACA", txt: "#7F1D1D", dot: "#DC2626" }, // Holiday  — red
  C:  { bg: "#F5F5F4", border: "#D6D3D1", txt: "#44403C", dot: "#78716C" }, // Comp off — stone
  NJ: { bg: "#FEFCE8", border: "#FDE68A", txt: "#713F12", dot: "#CA8A04" }, // New joinee—yellow
};

const FALLBACK: ShiftStyle = {
  bg: "#F9FAFB", border: "#E5E7EB", txt: "#374151", dot: "#6B7280",
};

function resolveShiftStyle(shiftDisplay?: string): { style: ShiftStyle; letter: string } {
  if (!shiftDisplay) return { style: SHIFT_STYLES.W, letter: "W" };

  const name = shiftDisplay.trim();
  if (name === "Leave") return { style: SHIFT_STYLES.L, letter: "L" };
  if (name === "New Joinee") return { style: SHIFT_STYLES.NJ, letter: "NJ" };
  if (name.startsWith("LG")) return { style: SHIFT_STYLES.LG, letter: "LG" };

  const first = name.charAt(0).toUpperCase();
  return { style: SHIFT_STYLES[first] ?? FALLBACK, letter: first };
}

// ─── Component ─────────────────────────────────────────────────────────────
interface RosterShiftCellCompactProps {
  shift: any;
  shiftDate: string | Date;
  rowUserId: string | number;
  onEditClick: (shift: any) => void;
  isSelectedForSwap?: boolean;
  isSwapMode?: boolean;
}

export const RosterShiftCellCompact = ({
  shift,
  shiftDate,
  rowUserId,
  onEditClick,
  isSelectedForSwap,
  isSwapMode,
}: RosterShiftCellCompactProps) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const { user, role } = useAuth();
  const { hasPermission } = usePermission();

  const isOff   = !shift || shift.shiftDisplay === "WO" || shift.type === "Week Off";
  const isLeave = shift?.shiftDisplay?.toLowerCase() === "leave" || shift?.type === "Leave";
  const crqCount: number = shift?.assignActCount ?? 0;

  const { style, letter } = useMemo(
    () => resolveShiftStyle(isOff ? "W" : isLeave ? "Leave" : shift?.shiftDisplay),
    [isOff, isLeave, shift],
  );

  const cardBg     = isDark ? `${style.dot}22` : style.bg;
  const cardBorder = isDark ? `${style.dot}55` : style.border;
  const cardTxt    = isDark ? style.bg          : style.txt;

  const isFuture = isFutureDate(shiftDate);
  const canEdit  = useMemo(() => {
    if (!isFuture) return false;
    if (role === "TEAM_MEMBER") return String(user?.userId) === String(rowUserId);
    return hasPermission("Roster Management", "UPDATE") || role === "SUPER_ADMIN";
  }, [isFuture, role, user, rowUserId, hasPermission]);

  const isClickable = canEdit || isSwapMode;

  return (
    <TableCell sx={{ p: "3px", borderBottom: "none", textAlign: "center", verticalAlign: "middle" }}>
      <Tooltip
        title={isOff ? "Week off" : isLeave ? "Leave" : shift?.shiftDisplay || "Shift"}
        arrow
        enterDelay={350}
        placement="top"
      >
        <Box
          onClick={() => isClickable && onEditClick(shift)}
          sx={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            width: 42,
            height: 38,
            borderRadius: "9px",
            bgcolor: isSelectedForSwap ? (isDark ? "#1E3A8A" : "#DBEAFE") : cardBg,
            border: `1px solid ${isSelectedForSwap ? (isDark ? "#93C5FD" : "#2563EB") : cardBorder}`,
            outline: isSelectedForSwap ? "2px solid #2563EB" : "none",
            outlineOffset: "1px",
            cursor: isClickable ? "pointer" : "default",
            transition: "transform .12s ease, box-shadow .12s ease",
            "&:hover": isClickable ? { transform: "scale(1.10)", boxShadow: `0 2px 8px ${style.dot}33` } : {},
          }}
        >
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: letter.length > 1 ? "10px" : "13px",
              lineHeight: 1,
              color: isSelectedForSwap ? (isDark ? "#BFDBFE" : "#1E3A8A") : cardTxt,
              userSelect: "none",
              letterSpacing: letter.length > 1 ? "-0.3px" : 0,
            }}
          >
            {letter}
          </Typography>

          {!isOff && !isLeave && crqCount > 0 && (
            <Box
              sx={{
                position: "absolute",
                top: -7,
                right: -7,
                minWidth: 16,
                height: 16,
                px: "3px",
                borderRadius: "50px",
                bgcolor: "#1D4ED8",
                border: `2px solid ${isDark ? theme.palette.background.default : "#FFFFFF"}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography sx={{ color: "#FFFFFF", fontWeight: 700, fontSize: "9px", lineHeight: 1 }}>
                {crqCount}
              </Typography>
            </Box>
          )}

          {isSelectedForSwap && (
            <CheckCircleIcon
              sx={{
                position: "absolute",
                bottom: -5,
                right: -5,
                fontSize: 14,
                color: "#FFFFFF",
                bgcolor: "#2563EB",
                borderRadius: "50%",
              }}
            />
          )}
        </Box>
      </Tooltip>
    </TableCell>
  );
};