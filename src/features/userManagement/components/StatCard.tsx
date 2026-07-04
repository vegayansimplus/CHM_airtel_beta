import { Box, Stack, Typography, alpha, useTheme } from "@mui/material";
import { TrendingDown, TrendingUp } from "@mui/icons-material";
import { motion } from "framer-motion";
import { useCountUp } from "../utils/userHelpers";

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const w = 52;
  const h = 18;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${x},${y}`;
    })
    .join(" ");
  const areaPoints = `0,${h} ${points} ${w},${h}`;

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <polygon points={areaPoints} fill={color} opacity={0.12} />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export interface StatCardProps {
  label: string;
  value: number;
  icon: React.ElementType;
  gradient: string;
  color: string;
  trend: number;
  sparkline: number[];
  index?: number;
}

export default function StatCard({
  label,
  value,
  icon: Icon,
  gradient,
  color,
  trend,
  sparkline,
  index = 0,
}: StatCardProps) {
  const animated = useCountUp(value);
  const isUp = trend >= 0;
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const trendColor = isUp ? theme.palette.success.main : theme.palette.error.main;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: "easeOut" }}
      whileHover={{ y: -2 }}
      style={{ flex: "1 1 160px", minWidth: 148 }}
    >
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          p: 1.25,
          borderRadius: "14px",
          background: isDark ? alpha(theme.palette.background.paper, 0.75) : "rgba(255,255,255,0.75)",
          backdropFilter: "blur(12px)",
          border: "1px solid",
          borderColor: "divider",
          boxShadow: isDark ? "0 2px 10px rgba(0,0,0,0.3)" : "0 2px 10px rgba(15,23,42,0.04)",
          transition: "box-shadow 0.2s ease, border-color 0.2s ease",
          "&:hover": {
            boxShadow: isDark ? "0 8px 20px rgba(0,0,0,0.45)" : "0 8px 20px rgba(15,23,42,0.1)",
            borderColor: `${color}40`,
          },
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: -24,
            right: -24,
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: gradient,
            opacity: 0.12,
          }}
        />
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" gap={1}>
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: "9px",
                background: gradient,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 4px 10px ${color}55`,
                flexShrink: 0,
              }}
            >
              <Icon sx={{ color: "#fff", fontSize: 15 }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: 18, fontWeight: 800, color: "text.primary", lineHeight: 1.1 }}>
                {animated.toLocaleString()}
              </Typography>
              <Typography sx={{ fontSize: 10.5, color: "text.secondary", fontWeight: 600, whiteSpace: "nowrap" }}>
                {label}
              </Typography>
            </Box>
          </Stack>
          <Stack alignItems="flex-end" gap={0.25} sx={{ display: { xs: "none", lg: "flex" } }}>
            <Sparkline data={sparkline} color={color} />
            <Stack
              direction="row"
              alignItems="center"
              gap={0.3}
              sx={{
                px: 0.6,
                py: 0.1,
                borderRadius: 999,
                bgcolor: alpha(trendColor, isDark ? 0.18 : 0.12),
                color: trendColor,
              }}
            >
              {isUp ? (
                <TrendingUp sx={{ fontSize: 11 }} />
              ) : (
                <TrendingDown sx={{ fontSize: 11 }} />
              )}
              <Typography sx={{ fontSize: 10, fontWeight: 700 }}>
                {Math.abs(trend)}%
              </Typography>
            </Stack>
          </Stack>
        </Stack>
      </Box>
    </motion.div>
  );
}
