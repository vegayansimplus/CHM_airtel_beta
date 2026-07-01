import { Box, Stack, Typography } from "@mui/material";
import { TrendingDown, TrendingUp } from "@mui/icons-material";
import { motion } from "framer-motion";
import { useCountUp } from "../utils/userHelpers";

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const w = 72;
  const h = 24;
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: "easeOut" }}
      whileHover={{ y: -4 }}
      style={{ flex: "1 1 220px", minWidth: 200 }}
    >
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          p: 2.25,
          borderRadius: "18px",
          background: "rgba(255,255,255,0.75)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(15,23,42,0.06)",
          boxShadow: "0 4px 20px rgba(15,23,42,0.05)",
          transition: "box-shadow 0.25s ease, border-color 0.25s ease",
          "&:hover": {
            boxShadow: "0 14px 32px rgba(15,23,42,0.12)",
            borderColor: `${color}40`,
          },
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: -30,
            right: -30,
            width: 100,
            height: 100,
            borderRadius: "50%",
            background: gradient,
            opacity: 0.12,
          }}
        />
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "12px",
              background: gradient,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 6px 16px ${color}55`,
            }}
          >
            <Icon sx={{ color: "#fff", fontSize: 20 }} />
          </Box>
          <Sparkline data={sparkline} color={color} />
        </Stack>

        <Typography
          sx={{ mt: 1.5, fontSize: 26, fontWeight: 800, color: "#0F172A", lineHeight: 1.1 }}
        >
          {animated.toLocaleString()}
        </Typography>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mt={0.5}>
          <Typography sx={{ fontSize: 12.5, color: "#64748B", fontWeight: 500 }}>
            {label}
          </Typography>
          <Stack
            direction="row"
            alignItems="center"
            gap={0.3}
            sx={{
              px: 0.8,
              py: 0.2,
              borderRadius: 999,
              bgcolor: isUp ? "#ECFDF5" : "#FEF2F2",
              color: isUp ? "#059669" : "#DC2626",
            }}
          >
            {isUp ? (
              <TrendingUp sx={{ fontSize: 13 }} />
            ) : (
              <TrendingDown sx={{ fontSize: 13 }} />
            )}
            <Typography sx={{ fontSize: 11, fontWeight: 700 }}>
              {Math.abs(trend)}%
            </Typography>
          </Stack>
        </Stack>
      </Box>
    </motion.div>
  );
}
