import { useMemo } from "react";
import { TableCell, Box, Tooltip, Typography, useTheme } from "@mui/material";
import dayjs from "dayjs";
import { isFutureDate } from "../utils/dateUtils";
import { useAuth } from "../../auth/hooks/useAuth";
import { usePermission } from "../../auth/hooks/usePermission";
import { SHIFT_COLOR_MAP } from "./RosterShiftCell";

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

/* ─── Hex → rgb helper ───────────────────────────────────────────────────── */
function hexToRgb(hex: string): string {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `${r},${g},${b}`;
}

/* ─── Props ─────────────────────────────────────────────────────────────── */
interface RosterShiftCellCompactProps {
  shift: any;
  shiftDate: string | Date;
  rowUserId: string | number;
  onEditClick: (shift: any) => void;
  isSelectedForSwap?: boolean;
  isSwapMode?: boolean;
  highlightShift?: string;
}

/* ─── Component ─────────────────────────────────────────────────────────── */
export const RosterShiftCellCompact = ({
  shift,
  shiftDate,
  rowUserId,
  onEditClick,
  isSelectedForSwap,
  isSwapMode,
  highlightShift = "",
}: RosterShiftCellCompactProps) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const { user, role } = useAuth();
  const { hasPermission } = usePermission();

  const isOff =
    !shift || shift.shiftDisplay === "WO" || shift.type === "Week Off";
  const isLeave =
    shift?.shiftDisplay?.toLowerCase() === "leave" || shift?.type === "Leave";
  const isToday = dayjs(shiftDate).isSame(dayjs(), "day");
  const shiftKey = resolveShiftKey(shift, isOff, isLeave);
  const style = SHIFT_COLOR_MAP[shiftKey] ?? SHIFT_COLOR_MAP.W;

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

  const tooltipTitle = isOff
    ? "Week Off"
    : isLeave
      ? "Leave"
      : shift?.shiftDisplay || "Shift";

  /* shared TableCell sx — tight padding, centered content */
  const cellSx = {
    p: "4px 6px",
    borderBottom: "none",
    textAlign: "center" as const,
    verticalAlign: "middle" as const,
  };

  /* ── Week-off ──────────────────────────────────────────────────────── */
  if (isOff) {
    return (
      <TableCell sx={cellSx}>
        <Tooltip title="Week Off" arrow enterDelay={400}>
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 34,
              height: 26,
              borderRadius: "6px",
              border: "1.5px dashed",
              borderColor: isDark ? "rgba(255,255,255,.12)" : "#D1D5DB",
              bgcolor: "transparent",
              opacity: isDimmed ? 0.1 : 1,
              transition: "opacity .14s",
              mx: "auto",
            }}
          >
            <Typography
              sx={{
                fontSize: "0.6rem",
                fontWeight: 600,
                color: isDark ? "rgba(255,255,255,.22)" : "#9CA3AF",
                letterSpacing: ".02em",
                lineHeight: 1,
                userSelect: "none",
              }}
            >
              WO
            </Typography>
          </Box>
        </Tooltip>
      </TableCell>
    );
  }

  /* ── Regular shift ────────────────────────────────────────────────── */
  return (
    <TableCell sx={cellSx}>
      <Tooltip title={tooltipTitle} arrow enterDelay={400}>
        <Box
          onClick={() => isClickable && onEditClick(shift)}
          sx={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 34,
            height: 26,
            borderRadius: "6px",
            border: `1.5px solid ${
              isSelectedForSwap
                ? "#2563EB"
                : isToday
                  ? style.badgeBg
                  : isDark
                    ? `rgba(${hexToRgb(style.badgeBg)}, 0.35)`
                    : style.cardBorder
            }`,
            bgcolor: isSelectedForSwap
              ? isDark ? "#1E3A8A" : "#DBEAFE"
              : isDark
                ? `rgba(${hexToRgb(style.badgeBg)}, 0.18)`
                : style.cardBg,
            cursor: isClickable ? "pointer" : "default",
            opacity: isDimmed ? 0.12 : 1,
            mx: "auto",
            outline: isToday && !isSelectedForSwap
              ? `1.5px solid ${style.badgeBg}`
              : "none",
            outlineOffset: "1px",
            transition: "opacity .14s, transform .13s, box-shadow .13s",
            "&:hover": {
              opacity: isDimmed ? 0.25 : 1,
              transform: isClickable ? "scale(1.08)" : "none",
              boxShadow: isClickable
                ? `0 2px 8px rgba(${hexToRgb(style.badgeBg)}, 0.35)`
                : "none",
            },
          }}
        >
          <Typography
            sx={{
              fontSize: shiftKey.length > 1 ? "0.55rem" : "0.62rem",
              fontWeight: 800,
              lineHeight: 1,
              letterSpacing: shiftKey.length > 1 ? "-.5px" : "0",
              color: isDark
                ? `rgba(${hexToRgb(style.badgeBg)}, 0.95)`
                : style.textColor,
              userSelect: "none",
              whiteSpace: "nowrap",
            }}
          >
            {shiftKey}
          </Typography>
        </Box>
      </Tooltip>
    </TableCell>
  );
};


// import { useMemo } from "react";
// import { TableCell, Box, Typography, Tooltip, useTheme } from "@mui/material";
// import CheckCircleIcon from "@mui/icons-material/CheckCircle";
// import dayjs from "dayjs";
// import { isFutureDate } from "../utils/dateUtils";
// import { useAuth } from "../../auth/hooks/useAuth";
// import { usePermission } from "../../auth/hooks/usePermission";
// import { SHIFT_COLOR_MAP } from "./RosterShiftCell"; // reuse same palette

// interface RosterShiftCellCompactProps {
//   shift: any;
//   shiftDate: string | Date;
//   rowUserId: string | number;
//   onEditClick: (shift: any) => void;
//   isSelectedForSwap?: boolean;
//   isSwapMode?: boolean;
// }

// function resolveShiftKey(shift: any, isOff: boolean, isLeave: boolean): string {
//   if (isOff) return "W";
//   if (isLeave) return "L";
//   const d = (shift?.shiftDisplay ?? "").trim();
//   if (d === "New Joinee") return "NJ";
//   if (d === "Holiday") return "H";
//   if (d === "Comp Off" || d === "CO") return "C";
//   if (d.startsWith("LG")) return "LG";
//   return d.charAt(0).toUpperCase() || "W";
// }

// export const RosterShiftCellCompact = ({
//   shift, shiftDate, rowUserId,
//   onEditClick, isSelectedForSwap, isSwapMode,
// }: RosterShiftCellCompactProps) => {
//   const theme  = useTheme();
//   const isDark = theme.palette.mode === "dark";
//   const { user, role } = useAuth();
//   const { hasPermission } = usePermission();

//   const isOff   = !shift || shift.shiftDisplay === "WO" || shift.type === "Week Off";
//   const isLeave = shift?.shiftDisplay?.toLowerCase() === "leave" || shift?.type === "Leave";
//   const isRegular = !isOff && !isLeave;
//   const crqCount  = shift?.assignActCount ?? 0;

//   const shiftKey = resolveShiftKey(shift, isOff, isLeave);
//   const style    = SHIFT_COLOR_MAP[shiftKey] ?? SHIFT_COLOR_MAP.W;
//   const isToday  = dayjs(shiftDate).isSame(dayjs(), "day");

//   const cardBg     = isDark ? style.cardBgDark     : style.cardBg;
//   const cardBorder = isDark ? style.cardBorderDark : style.cardBorder;
//   const textColor  = isDark ? style.textColorDark  : style.textColor;

//   const isFuture = isFutureDate(shiftDate);
//   const canEdit  = useMemo(() => {
//     if (!isFuture) return false;
//     if (role === "TEAM_MEMBER") return String(user?.userId) === String(rowUserId);
//     return hasPermission("Roster Management", "UPDATE") || role === "SUPER_ADMIN";
//   }, [isFuture, role, user, rowUserId, hasPermission]);

//   const isClickable = canEdit || isSwapMode;

//   return (
//     <TableCell sx={{ p: "3px", borderBottom: "none", textAlign: "center", verticalAlign: "middle" }}>
//       <Tooltip
//         title={isOff ? "Week off" : isLeave ? "Leave" : (shift?.shiftDisplay || "Shift")}
//         arrow enterDelay={350} placement="top"
//       >
//         <Box
//           onClick={() => isClickable && onEditClick(shift)}
//           sx={{
//             display: "inline-flex",
//             alignItems: "center",
//             justifyContent: "center",
//             position: "relative",
//             width: 44,
//             height: 40,
//             borderRadius: "10px",
//             bgcolor: isSelectedForSwap
//               ? (isDark ? "#1E3A8A" : "#DBEAFE")
//               : cardBg,
//             border: `1.5px solid ${
//               isSelectedForSwap ? (isDark ? "#93C5FD" : "#2563EB")
//               : isToday ? style.badgeBg
//               : cardBorder
//             }`,
//             ...(isToday && !isSelectedForSwap && {
//               outline: `2px solid ${style.badgeBg}`,
//               outlineOffset: "2px",
//               animation: "cPulse 2.2s ease-in-out infinite",
//               "@keyframes cPulse": {
//                 "0%,100%": { boxShadow: `0 0 0 0 ${style.glowColor}` },
//                 "50%":     { boxShadow: `0 0 0 5px transparent` },
//               },
//               "&::before": {
//                 content: '""',
//                 position: "absolute",
//                 inset: 0,
//                 borderRadius: "9px",
//                 background: "linear-gradient(110deg,transparent 30%,rgba(255,255,255,.2) 50%,transparent 70%)",
//                 backgroundSize: "200% 100%",
//                 animation: "cShimmer 2.4s linear infinite",
//                 pointerEvents: "none",
//               },
//               "@keyframes cShimmer": {
//                 "0%":   { backgroundPosition: "-200% center" },
//                 "100%": { backgroundPosition:  "200% center" },
//               },
//             }),
//             cursor: isClickable ? "pointer" : "default",
//             transition: "transform .12s ease, box-shadow .12s ease",
//             "&:hover": isClickable
//               ? { transform: "scale(1.12)", boxShadow: `0 2px 10px ${style.glowColor}` }
//               : {},
//           }}
//         >
//           <Typography
//             sx={{
//               fontWeight: 800,
//               fontSize: shiftKey.length > 1 ? "9px" : "13px",
//               lineHeight: 1,
//               letterSpacing: shiftKey.length > 1 ? "-0.4px" : 0,
//               color: isSelectedForSwap
//                 ? (isDark ? "#BFDBFE" : "#1E3A8A")
//                 : textColor,
//               userSelect: "none",
//             }}
//           >
//             {shiftKey}
//           </Typography>

//           {/* CRQ count badge */}
//           {isRegular && crqCount > 0 && (
//             <Box
//               sx={{
//                 position: "absolute", top: -6, right: -6,
//                 minWidth: 16, height: 16, px: "3px",
//                 borderRadius: "50px",
//                 bgcolor: style.badgeBg,
//                 border: `2px solid ${isDark ? theme.palette.background.default : "#FFF"}`,
//                 display: "flex", alignItems: "center", justifyContent: "center",
//               }}
//             >
//               <Typography sx={{ color: "#FFF", fontWeight: 800, fontSize: "9px", lineHeight: 1 }}>
//                 {crqCount}
//               </Typography>
//             </Box>
//           )}

//           {/* Today dot */}
//           {isToday && !isSelectedForSwap && (
//             <Box
//               sx={{
//                 position: "absolute", bottom: -5, right: -5,
//                 width: 9, height: 9, borderRadius: "50%",
//                 bgcolor: style.badgeBg,
//                 border: `2px solid ${isDark ? theme.palette.background.default : "#FFF"}`,
//                 animation: "cPop .4s cubic-bezier(.34,1.56,.64,1) forwards",
//                 "@keyframes cPop": {
//                   "0%":   { transform: "scale(.5)", opacity: 0 },
//                   "100%": { transform: "scale(1)",  opacity: 1 },
//                 },
//               }}
//             />
//           )}

//           {/* Swap selected */}
//           {isSelectedForSwap && (
//             <CheckCircleIcon
//               sx={{
//                 position: "absolute", bottom: -5, right: -5,
//                 fontSize: 14, color: "#FFF",
//                 bgcolor: "#2563EB", borderRadius: "50%",
//               }}
//             />
//           )}
//         </Box>
//       </Tooltip>
//     </TableCell>
//   );
// };

// import { useMemo } from "react";
// import { TableCell, Box, Typography, Tooltip, useTheme } from "@mui/material";
// import CheckCircleIcon from "@mui/icons-material/CheckCircle";
// import { isFutureDate } from "../utils/dateUtils";
// import { useAuth } from "../../auth/hooks/useAuth";
// import { usePermission } from "../../auth/hooks/usePermission";

// // ─── Shift palette ─────────────────────────────────────────────────────────
// interface ShiftStyle {
//   bg: string;
//   border: string;
//   txt: string;
//   dot: string;
// }

// const SHIFT_STYLES: Record<string, ShiftStyle> = {
//   N:  { bg: "#E6EAFF", border: "#A5B0F5", txt: "#1E1B6B", dot: "#3730A3" }, // Night    — indigo
//   A:  { bg: "#FEFCE8", border: "#FDE68A", txt: "#713F12", dot: "#A16207" }, // Afternoon— amber
//   B:  { bg: "#FFF7ED", border: "#FDBA74", txt: "#7C2D12", dot: "#C2410C" }, // Break    — orange
//   G:  { bg: "#EFF6FF", border: "#BFDBFE", txt: "#1E3A8A", dot: "#2563EB" }, // General  — blue
//   LG: { bg: "#F0FDF4", border: "#BBF7D0", txt: "#14532D", dot: "#15803D" }, // LG shift — green
//   L:  { bg: "#FFF1F2", border: "#FECDD3", txt: "#881337", dot: "#BE185D" }, // Leave    — rose
//   W:  { bg: "#F5F5F4", border: "#D6D3D1", txt: "#44403C", dot: "#78716C" }, // Week off — stone
//   H:  { bg: "#FFF1F2", border: "#FECACA", txt: "#7F1D1D", dot: "#DC2626" }, // Holiday  — red
//   C:  { bg: "#F5F5F4", border: "#D6D3D1", txt: "#44403C", dot: "#78716C" }, // Comp off — stone
//   NJ: { bg: "#FEFCE8", border: "#FDE68A", txt: "#713F12", dot: "#CA8A04" }, // New joinee—yellow
// };

// const FALLBACK: ShiftStyle = {
//   bg: "#F9FAFB", border: "#E5E7EB", txt: "#374151", dot: "#6B7280",
// };

// function resolveShiftStyle(shiftDisplay?: string): { style: ShiftStyle; letter: string } {
//   if (!shiftDisplay) return { style: SHIFT_STYLES.W, letter: "W" };

//   const name = shiftDisplay.trim();
//   if (name === "Leave") return { style: SHIFT_STYLES.L, letter: "L" };
//   if (name === "New Joinee") return { style: SHIFT_STYLES.NJ, letter: "NJ" };
//   if (name.startsWith("LG")) return { style: SHIFT_STYLES.LG, letter: "LG" };

//   const first = name.charAt(0).toUpperCase();
//   return { style: SHIFT_STYLES[first] ?? FALLBACK, letter: first };
// }

// // ─── Component ─────────────────────────────────────────────────────────────
// interface RosterShiftCellCompactProps {
//   shift: any;
//   shiftDate: string | Date;
//   rowUserId: string | number;
//   onEditClick: (shift: any) => void;
//   isSelectedForSwap?: boolean;
//   isSwapMode?: boolean;
// }

// export const RosterShiftCellCompact = ({
//   shift,
//   shiftDate,
//   rowUserId,
//   onEditClick,
//   isSelectedForSwap,
//   isSwapMode,
// }: RosterShiftCellCompactProps) => {
//   const theme = useTheme();
//   const isDark = theme.palette.mode === "dark";
//   const { user, role } = useAuth();
//   const { hasPermission } = usePermission();

//   const isOff   = !shift || shift.shiftDisplay === "WO" || shift.type === "Week Off";
//   const isLeave = shift?.shiftDisplay?.toLowerCase() === "leave" || shift?.type === "Leave";
//   const crqCount: number = shift?.assignActCount ?? 0;

//   const { style, letter } = useMemo(
//     () => resolveShiftStyle(isOff ? "W" : isLeave ? "Leave" : shift?.shiftDisplay),
//     [isOff, isLeave, shift],
//   );

//   const cardBg     = isDark ? `${style.dot}22` : style.bg;
//   const cardBorder = isDark ? `${style.dot}55` : style.border;
//   const cardTxt    = isDark ? style.bg          : style.txt;

//   const isFuture = isFutureDate(shiftDate);
//   const canEdit  = useMemo(() => {
//     if (!isFuture) return false;
//     if (role === "TEAM_MEMBER") return String(user?.userId) === String(rowUserId);
//     return hasPermission("Roster Management", "UPDATE") || role === "SUPER_ADMIN";
//   }, [isFuture, role, user, rowUserId, hasPermission]);

//   const isClickable = canEdit || isSwapMode;

//   return (
//     <TableCell sx={{ p: "3px", borderBottom: "none", textAlign: "center", verticalAlign: "middle" }}>
//       <Tooltip
//         title={isOff ? "Week off" : isLeave ? "Leave" : shift?.shiftDisplay || "Shift"}
//         arrow
//         enterDelay={350}
//         placement="top"
//       >
//         <Box
//           onClick={() => isClickable && onEditClick(shift)}
//           sx={{
//             display: "inline-flex",
//             alignItems: "center",
//             justifyContent: "center",
//             position: "relative",
//             width: 42,
//             height: 38,
//             borderRadius: "9px",
//             bgcolor: isSelectedForSwap ? (isDark ? "#1E3A8A" : "#DBEAFE") : cardBg,
//             border: `1px solid ${isSelectedForSwap ? (isDark ? "#93C5FD" : "#2563EB") : cardBorder}`,
//             outline: isSelectedForSwap ? "2px solid #2563EB" : "none",
//             outlineOffset: "1px",
//             cursor: isClickable ? "pointer" : "default",
//             transition: "transform .12s ease, box-shadow .12s ease",
//             "&:hover": isClickable ? { transform: "scale(1.10)", boxShadow: `0 2px 8px ${style.dot}33` } : {},
//           }}
//         >
//           <Typography
//             sx={{
//               fontWeight: 700,
//               fontSize: letter.length > 1 ? "10px" : "13px",
//               lineHeight: 1,
//               color: isSelectedForSwap ? (isDark ? "#BFDBFE" : "#1E3A8A") : cardTxt,
//               userSelect: "none",
//               letterSpacing: letter.length > 1 ? "-0.3px" : 0,
//             }}
//           >
//             {letter}
//           </Typography>

//           {!isOff && !isLeave && crqCount > 0 && (
//             <Box
//               sx={{
//                 position: "absolute",
//                 top: -7,
//                 right: -7,
//                 minWidth: 16,
//                 height: 16,
//                 px: "3px",
//                 borderRadius: "50px",
//                 bgcolor: "#1D4ED8",
//                 border: `2px solid ${isDark ? theme.palette.background.default : "#FFFFFF"}`,
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//               }}
//             >
//               <Typography sx={{ color: "#FFFFFF", fontWeight: 700, fontSize: "9px", lineHeight: 1 }}>
//                 {crqCount}
//               </Typography>
//             </Box>
//           )}

//           {isSelectedForSwap && (
//             <CheckCircleIcon
//               sx={{
//                 position: "absolute",
//                 bottom: -5,
//                 right: -5,
//                 fontSize: 14,
//                 color: "#FFFFFF",
//                 bgcolor: "#2563EB",
//                 borderRadius: "50%",
//               }}
//             />
//           )}
//         </Box>
//       </Tooltip>
//     </TableCell>
//   );
// };