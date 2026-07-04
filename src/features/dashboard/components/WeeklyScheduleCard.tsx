import { Box, Card, Chip, Grid, Tooltip, Typography } from "@mui/material";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import type { Colors } from "../types/colorTypes";
import type { WeekDay } from "../types/dashboard.types";
import { fadeIn, getCardSx } from "../constants/dashboard.styles";
import { SectionHeader } from "./SectionHeader";

interface WeeklyScheduleCardProps {
  week: readonly WeekDay[];
  rangeLabel: string;
  scheduleHover: number | null;
  colors: Colors;
  mounted: boolean;
  delay: number;
  onHoverChange: (date: number | null) => void;
}

export function WeeklyScheduleCard({
  week,
  rangeLabel,
  scheduleHover,
  colors,
  mounted,
  delay,
  onHoverChange,
}: WeeklyScheduleCardProps) {
  return (
    <Card sx={{ ...getCardSx(colors), p: "14px", ...fadeIn(mounted, delay) }}>
      <SectionHeader
        title="Weekly schedule"
        subtitle={rangeLabel}
        colors={colors}
        right={
          <Typography sx={{ fontSize: 10, color: colors.accent, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "3px", "&:hover": { textDecoration: "underline" } }}>
            Full view <OpenInFullIcon sx={{ fontSize: 10 }} />
          </Typography>
        }
      />
      <Grid container spacing="5px">
        {week.map((d) => (
          <Grid key={d.date} size={{ xs: 12 / 7 }}>
            <Box sx={{ textAlign: "center" }}>
              <Typography sx={{ fontSize: 8, fontWeight: 700, color: colors.textSecondary, letterSpacing: ".6px", textTransform: "uppercase", mb: "4px" }}>
                {d.day}
              </Typography>
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  mx: "auto",
                  mb: "5px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: d.isToday ? `linear-gradient(135deg,${colors.accent},#8b5cf6)` : "transparent",
                  boxShadow: d.isToday ? `0 3px 10px ${colors.accentBorder}` : "none",
                  transition: "transform .2s",
                  "&:hover": { transform: "scale(1.12)" },
                }}
              >
                <Typography sx={{ fontSize: 10, fontWeight: d.isToday ? 900 : 600, color: d.isToday ? "#fff" : d.isOff ? colors.textDim : colors.textPrimary }}>
                  {d.date}
                </Typography>
              </Box>

              {d.shift ? (
                <Tooltip title={`${d.shift.name} · ${d.shift.start}–${d.shift.end} · ${d.shift.dur}`} arrow placement="top">
                  <Box
                    onMouseEnter={() => onHoverChange(d.date)}
                    onMouseLeave={() => onHoverChange(null)}
                    sx={{
                      borderRadius: "8px",
                      py: "5px",
                      px: "2px",
                      minHeight: 58,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "1px",
                      background: d.isToday ? colors.accentDim : scheduleHover === d.date ? colors.selectedRow : colors.surface2,
                      border: `1.5px solid ${d.isToday ? colors.accentBorder : scheduleHover === d.date ? colors.accentBorder : colors.border}`,
                      cursor: "pointer",
                      transition: "all .18s",
                      transform: scheduleHover === d.date && !d.isToday ? "translateY(-2px)" : "none",
                      boxShadow: scheduleHover === d.date ? `0 4px 12px ${colors.accentBorder}` : "none",
                    }}
                  >
                    <Typography sx={{ fontSize: 8, fontWeight: 800, color: d.isToday ? colors.accent : colors.textSecondary }}>{d.shift.name}</Typography>
                    <Typography sx={{ fontSize: 7, color: colors.textSecondary, lineHeight: 1.5 }}>{d.shift.start}</Typography>
                    <Typography sx={{ fontSize: 7, color: colors.textSecondary }}>{d.shift.end}</Typography>
                    {d.isToday && (
                      <Chip
                        label="Today"
                        size="small"
                        sx={{
                          fontSize: 7,
                          fontWeight: 800,
                          color: "#fff",
                          background: colors.accent,
                          borderRadius: "20px",
                          mt: "2px",
                          height: "auto",
                          "& .MuiChip-label": { px: "5px", py: "1px" },
                        }}
                      />
                    )}
                  </Box>
                </Tooltip>
              ) : (
                <Box
                  sx={{
                    borderRadius: "8px",
                    minHeight: 58,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: `1.5px dashed ${colors.border}`,
                    background: "transparent",
                  }}
                >
                  <Typography sx={{ fontSize: 8, color: colors.textDim, fontWeight: 600 }}>Off</Typography>
                </Box>
              )}
            </Box>
          </Grid>
        ))}
      </Grid>
    </Card>
  );
}
