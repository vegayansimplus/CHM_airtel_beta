import { useState } from "react";
import { useNavigate } from "react-router";
import { Box, Card, Chip, IconButton, Skeleton, Tooltip, Typography } from "@mui/material";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import EventBusyIcon from "@mui/icons-material/EventBusy";
import HomeIcon from "@mui/icons-material/Home";
import BusinessIcon from "@mui/icons-material/Business";
import type { Colors } from "../types/colorTypes";
import type { WeekDay } from "../types/dashboard.types";
import type { DashboardRosterStatus } from "../hooks/useDashboardRoster";
import { fadeIn, getCardSx } from "../constants/dashboard.styles";
import { SectionHeader } from "./SectionHeader";
import { ShiftLegend } from "./ShiftLegend";

interface WeeklyScheduleCardProps {
  week: readonly WeekDay[];
  rangeLabel: string;
  status: DashboardRosterStatus;
  errorMessage?: string;
  anchorDate: Date;
  colors: Colors;
  mounted: boolean;
  delay: number;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}

export function WeeklyScheduleCard({
  week,
  rangeLabel,
  status,
  errorMessage,
  anchorDate,
  colors,
  mounted,
  delay,
  onPrev,
  onNext,
  onToday,
}: WeeklyScheduleCardProps) {
  const [scheduleHover, setScheduleHover] = useState<number | null>(null);
  const navigate = useNavigate();

  return (
    <Card sx={{ ...getCardSx(colors), p: "16px", ...fadeIn(mounted, delay) }}>
      <SectionHeader
        title="My roster"
        subtitle={rangeLabel}
        colors={colors}
        right={
          <Box sx={{ display: "flex", alignItems: "center", gap: "2px" }}>
            <IconButton size="small" onClick={onPrev} aria-label="Previous week" sx={{ p: "4px" }}>
              <ChevronLeftIcon sx={{ fontSize: 16, color: colors.textSecondary }} />
            </IconButton>
            <Typography
              onClick={onToday}
              sx={{ fontSize: 10, fontWeight: 700, color: colors.accent, cursor: "pointer", px: "2px", "&:hover": { textDecoration: "underline" } }}
            >
              Today
            </Typography>
            <IconButton size="small" onClick={onNext} aria-label="Next week" sx={{ p: "4px" }}>
              <ChevronRightIcon sx={{ fontSize: 16, color: colors.textSecondary }} />
            </IconButton>
            <Typography
              onClick={() => navigate("/me/monthlyview", { state: { initialDate: anchorDate } })}
              sx={{ fontSize: 11, color: colors.accent, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "3px", ml: "6px", "&:hover": { textDecoration: "underline" } }}
            >
              Full view <OpenInFullIcon sx={{ fontSize: 11 }} />
            </Typography>
          </Box>
        }
      />

      {status === "loading" && (
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: { xs: "6px", sm: "10px" } }}>
          {Array.from({ length: 7 }, (_, i) => (
            <Box key={i} sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
              <Skeleton variant="text" width={20} height={14} />
              <Skeleton variant="circular" width={28} height={28} />
              <Skeleton variant="rounded" width="100%" height={66} sx={{ borderRadius: "10px" }} />
            </Box>
          ))}
        </Box>
      )}

      {status === "error" && (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "6px", py: "28px" }}>
          <ErrorOutlineIcon sx={{ fontSize: 26, color: colors.danger }} />
          <Typography sx={{ fontSize: 12, fontWeight: 600, color: colors.danger, textAlign: "center" }}>
            {errorMessage}
          </Typography>
        </Box>
      )}

      {status === "empty" && (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "6px", py: "28px" }}>
          <EventBusyIcon sx={{ fontSize: 26, color: colors.textDim }} />
          <Typography sx={{ fontSize: 12, fontWeight: 600, color: colors.textDim, textAlign: "center" }}>
            No roster published for this week
          </Typography>
        </Box>
      )}

      {status === "ready" && (
        <>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
              gap: { xs: "6px", sm: "10px" },
            }}
          >
            {week.map((d) => {
              const tileColors = d.shift?.colors;
              return (
                <Box key={d.date} sx={{ display: "flex", flexDirection: "column", textAlign: "center", minWidth: 0 }}>
                  <Typography sx={{ fontSize: 9, fontWeight: 700, color: colors.textSecondary, letterSpacing: ".6px", textTransform: "uppercase", mb: "5px" }}>
                    {d.day}
                  </Typography>
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      mx: "auto",
                      mb: "6px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: d.isToday ? `linear-gradient(135deg,${colors.accent},#8b5cf6)` : "transparent",
                      boxShadow: d.isToday ? `0 3px 10px ${colors.accentBorder}` : "none",
                      transition: "transform .2s",
                      "&:hover": { transform: "scale(1.12)" },
                    }}
                  >
                    <Typography sx={{ fontSize: 11, fontWeight: d.isToday ? 900 : 600, color: d.isToday ? "#fff" : d.isOff ? colors.textDim : colors.textPrimary }}>
                      {d.date}
                    </Typography>
                  </Box>

                  {d.shift ? (
                    <Tooltip
                      title={`${d.shift.name} · ${d.shift.start}–${d.shift.end} · ${d.shift.dur}${d.shift.workMode ? ` · ${d.shift.workMode}` : ""}`}
                      arrow
                      placement="top"
                    >
                      <Box
                        onMouseEnter={() => setScheduleHover(d.date)}
                        onMouseLeave={() => setScheduleHover(null)}
                        sx={{
                          position: "relative",
                          borderRadius: "10px",
                          py: "7px",
                          px: "3px",
                          flex: 1,
                          minHeight: 66,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "1px",
                          background: d.isToday
                            ? colors.accentDim
                            : scheduleHover === d.date
                              ? colors.selectedRow
                              : (tileColors?.background ?? colors.surface2),
                          border: `1.5px solid ${
                            d.isToday
                              ? colors.accentBorder
                              : scheduleHover === d.date
                                ? colors.accentBorder
                                : (tileColors?.border ?? colors.border)
                          }`,
                          cursor: "pointer",
                          transition: "all .18s",
                          transform: scheduleHover === d.date && !d.isToday ? "translateY(-2px)" : "none",
                          boxShadow: scheduleHover === d.date ? `0 4px 12px ${colors.accentBorder}` : "none",
                        }}
                      >
                        {d.shift.workMode && (
                          <Box sx={{ position: "absolute", top: "4px", right: "4px", lineHeight: 0 }}>
                            {d.shift.workMode === "WFH" ? (
                              <HomeIcon sx={{ fontSize: 11, color: colors.accent }} />
                            ) : (
                              <BusinessIcon sx={{ fontSize: 11, color: colors.textDim }} />
                            )}
                          </Box>
                        )}
                        <Typography sx={{ fontSize: 10, fontWeight: 800, color: d.isToday ? colors.accent : (tileColors?.color ?? colors.textSecondary) }}>
                          {d.shift.name}
                        </Typography>
                        <Typography sx={{ fontSize: 9, color: colors.textSecondary, lineHeight: 1.5 }}>{d.shift.start}</Typography>
                        <Typography sx={{ fontSize: 9, color: colors.textSecondary }}>{d.shift.end}</Typography>
                        {d.isToday && (
                          <Chip
                            label="Today"
                            size="small"
                            sx={{
                              fontSize: 8,
                              fontWeight: 800,
                              color: "#fff",
                              background: colors.accent,
                              borderRadius: "20px",
                              mt: "3px",
                              height: "auto",
                              "& .MuiChip-label": { px: "6px", py: "1px" },
                            }}
                          />
                        )}
                      </Box>
                    </Tooltip>
                  ) : (
                    <Box
                      sx={{
                        borderRadius: "10px",
                        flex: 1,
                        minHeight: 66,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: `1.5px dashed ${colors.border}`,
                        background: "transparent",
                      }}
                    >
                      <Typography sx={{ fontSize: 10, color: colors.textDim, fontWeight: 600 }}>{d.offLabel ?? "Off"}</Typography>
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>
          <ShiftLegend colors={colors} />
        </>
      )}
    </Card>
  );
}
