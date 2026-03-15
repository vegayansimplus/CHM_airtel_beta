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
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import WbTwilightIcon from "@mui/icons-material/WbTwilight";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import { isFutureDate } from "../utils/dateUtils";
import { useAuth } from "../../auth/hooks/useAuth";
import { usePermission } from "../../auth/hooks/usePermission";

interface RosterShiftCellProps {
  shift: any;
  shiftDate: string | Date;
  rowUserId: string | number;
  onEditClick: (shift: any) => void;
  /** callback when info icon is clicked */
  onInfoClick?: (shift: any, date: string | Date, rowUserId: string | number) => void;
  isSelectedForSwap?: boolean;
  isSwapMode?: boolean;
}

export const RosterShiftCell = ({
  shift,
  shiftDate,
  rowUserId,
  onEditClick,
  onInfoClick,
  isSelectedForSwap,
  isSwapMode,
}: RosterShiftCellProps) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const { user, role } = useAuth();
  const { hasPermission } = usePermission();

  // --- Logic Helpers ---
  const isOff =
    !shift || shift.shiftDisplay === "WO" || shift.type === "Week Off";
  const isLeave =
    shift?.shiftDisplay?.toLowerCase() === "leave" || shift?.type === "Leave";
  const isRegularShift = !isOff && !isLeave;

  const shiftKey = shift?.shiftDisplay?.charAt(0) || "W";
  const shiftNameStr = (
    shift?.shiftName ||
    shift?.shiftDisplay ||
    ""
  ).toLowerCase();
  const mins = shift?.availableMins || 0;

  // Use useMemo for color map to prevent re-calculations on every render
  const shiftStyle = useMemo(() => {
    const map = getShiftColorMap(isDarkMode);
    return map.get(isLeave ? "Leave" : isOff ? "W" : shiftKey) ?? map.get("W")!;
  }, [isDarkMode, isLeave, isOff, shiftKey]);

  // Permissions logic
  const isFuture = isFutureDate(shiftDate);
  const canEdit = useMemo(() => {
    if (!isFuture) return false;
    if (role === "TEAM_MEMBER")
      return String(user?.userId) === String(rowUserId);
    return (
      hasPermission("Roster Management", "UPDATE") || role === "SUPER_ADMIN"
    );
  }, [isFuture, role, user, rowUserId, hasPermission]);

  const title = isOff
    ? "WO"
    : isLeave
      ? "Leave"
      : shift?.shiftDisplay || "Shift";
  const subtitle = isOff ? "" : shift?.timeRange || "8:00 AM - 10 PM";

  const renderStatusIcon = () => {
    if (!isRegularShift) return null; // Hide info icon for Leave/WO

    const iconSx = { fontSize: 14, color: shiftStyle.badgeBg };
    if (shiftNameStr.includes("night") || shiftKey === "N")
      return <DarkModeIcon sx={iconSx} />;
    if (
      shiftNameStr.includes("afternoon") ||
      shiftNameStr.includes("evening") ||
      shiftKey === "B"
    )
      return <WbTwilightIcon sx={iconSx} />;
    if (shiftNameStr.includes("morning") || shiftKey === "A")
      return <WbSunnyIcon sx={iconSx} />;
    return <CheckCircleIcon sx={iconSx} />;
  };

  const isClickable = canEdit || isSwapMode;

  return (
    <TableCell sx={{ p: 0.4, borderBottom: "none", height: "100%" }}>
      <Tooltip
        title={`${title} ${subtitle ? `(${subtitle})` : ""}`}
        arrow
        enterDelay={500}
      >
        <Box
          onClick={() => isClickable && onEditClick(shift)}
          sx={{
            bgcolor: isSelectedForSwap
              ? isDarkMode
                ? "#0A2F4A"
                : "#E0F2FE"
              : shiftStyle.cardBg,
            border: `1px solid ${isSelectedForSwap ? "#0284C7" : shiftStyle.cardBorder}`,
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            px: 1,
            py: 0.5,
            gap: 1.5,
            width: "100%",
            height: 52, // Standardized height
            position: "relative",
            overflow: "hidden",
            transition: "all 0.2s ease-in-out",
            cursor: isClickable ? "pointer" : "default",
            "&:hover": {
              boxShadow: isClickable ? "0px 4px 12px rgba(0,0,0,0.08)" : "none",
              borderColor: isClickable ? "#0284C7" : shiftStyle.cardBorder,
              "& .status-icon": { opacity: 0, transform: "translateY(-5px)" },
              "& .edit-btn": { opacity: 1, transform: "scale(1)" },
            },
          }}
        >
          {/* 1. LEFT SIDE: Badge and Count */}
          <Stack alignItems="center" sx={{ flexShrink: 0, minWidth: 26 }}>
            <Box
              sx={{
                bgcolor: shiftStyle.badgeBg,
                color: "#FFF",
                borderRadius: "6px",
                width: 24,
                height: 24,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: "0.7rem",
                ...(isOff && { bgcolor: isDarkMode ? "#475569" : "#CBD5E1" }),
              }}
            >
              {isOff ? (
                <WaterDropIcon sx={{ fontSize: 14 }} />
              ) : isLeave ? (
                "I"
              ) : (
                shiftKey
              )}
            </Box>

            {/* Count: Hidden for WO/Leave as requested */}
            {isRegularShift && (
              <Typography
                fontSize="0.6rem"
                color="text.secondary"
                fontWeight={600}
                sx={{ mt: 0.2 }}
              >
                {mins} m
              </Typography>
            )}
          </Stack>

          {/* 2. CENTER: Text Info */}
          <Stack sx={{ flexGrow: 1, minWidth: 0, pr: 1.5 }}>
            <Typography
              fontSize="0.8rem"
              fontWeight={700}
              noWrap
              sx={{
                color: isLeave ? "#BE185D" : "text.primary",
                lineHeight: 1.2,
              }}
            >
              {title}
            </Typography>
            <Typography
              fontSize="0.65rem"
              color="text.secondary"
              fontWeight={500}
              noWrap
              sx={{ lineHeight: 1 }}
            >
              {/* {subtitle || (isOff ? "WO" : "")} */}
            </Typography>
          </Stack>

          {/* 3. RIGHT OVERLAYS: Status Icon & Edit Button */}
          <Box
            className="status-icon"
            sx={{
              position: "absolute",
              top: 6,
              right: 6,
              transition: "all 0.2s ease",
              display: "flex",
              opacity: isSelectedForSwap ? 0 : 0.9,
            }}
          >
            {renderStatusIcon()}
          </Box>

          {canEdit && !isSwapMode && (
            <IconButton
              className="edit-btn"
              size="small"
              sx={{
                position: "absolute",
                top: 4,
                right: 4,
                opacity: 0,
                transform: "scale(0.8)",
                transition: "all 0.2s ease",
                bgcolor: isDarkMode
                  ? "rgba(255,255,255,0.1)"
                  : "rgba(0,0,0,0.04)",
                p: 0.3,
              }}
            >
              <EditIcon sx={{ fontSize: 14, color: "text.secondary" }} />
            </IconButton>
          )}

          {/* info icon - visible on all regular shifts */}
          {isRegularShift && onInfoClick && !isSelectedForSwap && (
            <IconButton
              className="info-btn"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onInfoClick(shift, shiftDate, rowUserId);
              }}
              sx={{
                position: "absolute",
                bottom: 4,
                right: 4,
                opacity: 0.7,
                bgcolor: isDarkMode
                  ? "rgba(255,255,255,0.1)"
                  : "rgba(0,0,0,0.04)",
                p: 0.3,
              }}
            >
              <InfoIcon sx={{ fontSize: 14, color: "text.secondary" }} />
            </IconButton>
          )}

          {isSelectedForSwap && (
            <CheckCircleIcon
              sx={{
                position: "absolute",
                top: 4,
                right: 4,
                fontSize: 16,
                color: "#0284C7",
              }}
            />
          )}
        </Box>
      </Tooltip>
    </TableCell>
  );
};

// Shift color mappings with enhanced contrast for production
export const getShiftColorMap = (isDarkMode: boolean) => {
  const lightMap = new Map([
    ["G", { badgeBg: "#0095fa", cardBg: "#F0F9FF", cardBorder: "#BAE6FD" }],
    ["N", { badgeBg: "#35359c", cardBg: "#EEF2FF", cardBorder: "#C7D2FE" }],
    ["A", { badgeBg: "#EAB308", cardBg: "#FEFCE8", cardBorder: "#FEF08A" }],
    ["B", { badgeBg: "#F59E0B", cardBg: "#FFFBEB", cardBorder: "#FEF3C7" }],
    ["Leave", { badgeBg: "#DB2777", cardBg: "#FDF2F8", cardBorder: "#FBCFE8" }],
    ["W", { badgeBg: "#64748B", cardBg: "#F8FAFC", cardBorder: "#E2E8F0" }],
  ]);

  const darkMap = new Map([
    ["G", { badgeBg: "#0ea5e9", cardBg: "#0c4a6e", cardBorder: "#075985" }],
    ["N", { badgeBg: "#6366f1", cardBg: "#1e1b4b", cardBorder: "#312e81" }],
    ["A", { badgeBg: "#eab308", cardBg: "#422006", cardBorder: "#713f12" }],
    ["Leave", { badgeBg: "#f472b6", cardBg: "#500724", cardBorder: "#831843" }],
    ["W", { badgeBg: "#94a3b8", cardBg: "#1e293b", cardBorder: "#334155" }],
  ]);

  return isDarkMode ? darkMap : lightMap;
};
