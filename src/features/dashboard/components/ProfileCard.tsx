import { Box, Card, Typography } from "@mui/material";
import type { Colors } from "../types/colorTypes";
import { fadeIn } from "../constants/dashboard.styles";
import { RadialProgress } from "./RadialProgress";

interface ProfileCardProps {
  name: string;
  role: string;
  employeeId: string;
  doneCount: number;
  totalTasks: number;
  progressPct: number;
  wfMode: string;
  colors: Colors;
  mounted: boolean;
  delay: number;
}

export function ProfileCard({
  name,
  role,
  employeeId,
  doneCount,
  totalTasks,
  progressPct,
  wfMode,
  colors,
  mounted,
  delay,
}: ProfileCardProps) {
  const stats = [
    { v: doneCount, l: "Done" },
    { v: totalTasks - doneCount, l: "Remaining" },
    { v: "5/5", l: "Days" },
    { v: wfMode, l: "Mode" },
  ];

  return (
    <Card
      sx={{
        borderRadius: "16px",
        border: `1.5px solid ${colors.border}`,
        boxShadow: colors.isDark ? "0 2px 12px rgba(0,0,0,.4)" : "0 2px 12px rgba(60,60,140,.06)",
        overflow: "hidden",
        ...fadeIn(mounted, delay),
      }}
    >
      <Box
        sx={{
          background: "linear-gradient(130deg,#1e1b4b 0%,#312e81 60%,#4338ca 100%)",
          p: "20px 18px 0",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box sx={{ position: "absolute", top: -40, right: -20, width: 140, height: 140, borderRadius: "50%", background: "rgba(255,255,255,.04)" }} />
        <Box sx={{ position: "absolute", top: 10, right: 50, width: 55, height: 55, borderRadius: "50%", background: "rgba(165,180,252,.09)" }} />

        <Box sx={{ display: "flex", alignItems: "center", gap: "12px", position: "relative", zIndex: 1 }}>
          <Box sx={{ position: "relative" }}>
            <Box
              sx={{
                width: 46,
                height: 46,
                borderRadius: "50%",
                background: `linear-gradient(135deg,${colors.accentLight},#c084fc)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
                fontWeight: 900,
                color: "#fff",
                boxShadow: "0 0 0 3px rgba(255,255,255,.18)",
              }}
            >
              {name
                .split(" ")
                .map((w) => w[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </Box>
            <Box sx={{ position: "absolute", bottom: 1, right: 1, width: 10, height: 10, borderRadius: "50%", background: colors.success, border: "2px solid #1e1b4b" }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontSize: 14, fontWeight: 900, color: "#fff", letterSpacing: "-0.3px" }}>{name}</Typography>
            <Typography sx={{ fontSize: 9, color: "rgba(199,210,254,.6)", mt: 0.3 }}>{role}</Typography>
            <Box sx={{ display: "inline-flex", alignItems: "center", gap: "4px", mt: "5px", background: "rgba(255,255,255,.1)", borderRadius: "20px", px: "7px", py: "2px" }}>
              <Box sx={{ width: 5, height: 5, borderRadius: "50%", background: colors.success }} />
              <Typography sx={{ fontSize: 8, fontWeight: 700, color: "rgba(199,210,254,.8)", letterSpacing: ".4px" }}>
                ACTIVE · {employeeId}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
            <RadialProgress value={doneCount} max={totalTasks} color={colors.accentLight} />
            <Box sx={{ position: "absolute", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Typography sx={{ fontSize: 11, fontWeight: 900, color: "#fff", lineHeight: 1 }}>
                {Math.round(progressPct)}%
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", mt: "14px", borderTop: "1px solid rgba(255,255,255,.08)" }}>
          {stats.map((s, i) => (
            <Box
              key={s.l}
              sx={{
                textAlign: "center",
                py: "9px",
                borderRight: i % 2 === 0 ? "1px solid rgba(255,255,255,.08)" : "none",
                borderBottom: i < 2 ? "1px solid rgba(255,255,255,.08)" : "none",
              }}
            >
              <Typography sx={{ fontSize: 15, fontWeight: 800, color: "#fff", lineHeight: 1 }}>{s.v}</Typography>
              <Typography sx={{ fontSize: 7, fontWeight: 700, color: "rgba(199,210,254,.45)", mt: "3px", letterSpacing: ".6px", textTransform: "uppercase" }}>
                {s.l}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      <Box sx={{ p: "10px 14px 12px" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: "5px" }}>
          <Typography sx={{ fontSize: 9, fontWeight: 700, color: colors.textSecondary, letterSpacing: ".5px", textTransform: "uppercase" }}>
            Task Progress
          </Typography>
          <Typography sx={{ fontSize: 9, fontWeight: 700, color: colors.accent }}>
            {doneCount} of {totalTasks}
          </Typography>
        </Box>
        <Box sx={{ height: 5, background: colors.surface2, borderRadius: "99px", overflow: "hidden" }}>
          <Box
            sx={{
              height: "100%",
              borderRadius: "99px",
              background: `linear-gradient(90deg,${colors.accent},#8b5cf6)`,
              width: `${progressPct}%`,
              transition: "width 1.2s cubic-bezier(.4,0,.2,1)",
            }}
          />
        </Box>
        <Typography sx={{ fontSize: 9, color: colors.textSecondary, mt: "4px" }}>
          {Math.round(progressPct)}% complete
        </Typography>
      </Box>
    </Card>
  );
}
