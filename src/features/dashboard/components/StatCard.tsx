import { Box, Card, Chip, Typography } from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import type { Colors } from "../types/colorTypes";
import type { StatCardConfig } from "../types/dashboard.types";
import { getHoverShadow, getToneStyles } from "../constants/dashboard.styles";
import { AnimatedNumber } from "./AnimatedNumber";

const ICONS = {
  trending: TrendingUpIcon,
  clock: AccessTimeIcon,
  calendar: CalendarTodayIcon,
  event: EventAvailableIcon,
} as const;

interface StatCardProps {
  config: StatCardConfig;
  colors: Colors;
}

export function StatCard({ config, colors }: StatCardProps) {
  const tone = getToneStyles(colors)[config.tone];
  const Icon = ICONS[config.icon];

  return (
    <Card
      sx={{
        borderRadius: "12px",
        border: `1.5px solid ${colors.border}`,
        boxShadow: colors.isDark ? "0 2px 12px rgba(0,0,0,.35)" : "0 2px 12px rgba(60,60,140,.055)",
        overflow: "hidden",
        position: "relative",
        cursor: "default",
        background: colors.surface,
        transition: "box-shadow .22s, border-color .22s, transform .22s",
        "&:hover": {
          boxShadow: getHoverShadow(colors),
          borderColor: tone.border,
          transform: "translateY(-2px)",
          "& .sc-bar": { opacity: 1 },
          "& .sc-glow": { opacity: 1 },
        },
      }}
    >
      <Box
        className="sc-glow"
        sx={{
          position: "absolute",
          inset: 0,
          opacity: 0,
          pointerEvents: "none",
          transition: "opacity .3s",
          background: `radial-gradient(circle at 85% 15%,${tone.light},transparent 68%)`,
        }}
      />
      <Box
        className="sc-bar"
        sx={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "3px",
          borderRadius: "0 0 12px 12px",
          opacity: 0,
          transition: "opacity .25s",
          background: tone.color,
        }}
      />
      <Box sx={{ p: "13px 14px" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: "8px" }}>
          <Box sx={{ width: 30, height: 30, borderRadius: "8px", background: tone.light, display: "flex", alignItems: "center", justifyContent: "center", color: tone.color }}>
            <Icon sx={{ fontSize: 15 }} />
          </Box>
          <Chip
            label="LIVE"
            size="small"
            sx={{
              fontSize: 7,
              fontWeight: 800,
              color: tone.color,
              background: tone.light,
              borderRadius: "20px",
              height: "auto",
              "& .MuiChip-label": { px: "6px", py: "1px" },
            }}
          />
        </Box>
        <Typography sx={{ fontSize: 24, fontWeight: 900, color: colors.textPrimary, lineHeight: 1, letterSpacing: "-1px" }}>
          {typeof config.display === "number" ? <AnimatedNumber value={config.display} /> : config.display}
        </Typography>
        <Typography sx={{ fontSize: 9, fontWeight: 700, color: colors.textSecondary, mt: "4px", letterSpacing: ".3px", textTransform: "uppercase" }}>
          {config.label}
        </Typography>
        <Typography sx={{ fontSize: 10, color: tone.color, fontWeight: 600, mt: "4px" }}>{config.sub}</Typography>
      </Box>
    </Card>
  );
}
