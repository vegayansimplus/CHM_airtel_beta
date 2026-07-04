import { Box, Card, Tooltip, Typography } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import BusinessIcon from "@mui/icons-material/Business";
import type { Colors } from "../types/colorTypes";
import type { WorkMode, WorkModeDay } from "../types/dashboard.types";
import { fadeIn, getCardSx } from "../constants/dashboard.styles";
import { SectionHeader } from "./SectionHeader";

const MODES: readonly WorkMode[] = ["WFH", "WFO"];

interface WorkLocationCardProps {
  wfMode: WorkMode;
  wfhBounce: boolean;
  weekLabel: string;
  week: readonly WorkModeDay[];
  colors: Colors;
  mounted: boolean;
  delay: number;
  onChangeMode: (mode: WorkMode) => void;
}

export function WorkLocationCard({
  wfMode,
  wfhBounce,
  weekLabel,
  week,
  colors,
  mounted,
  delay,
  onChangeMode,
}: WorkLocationCardProps) {
  return (
    <Card sx={{ ...getCardSx(colors), p: "14px", ...fadeIn(mounted, delay) }}>
      <SectionHeader
        title="Work location"
        colors={colors}
        right={<Typography sx={{ fontSize: 10, color: colors.textSecondary, fontWeight: 600 }}>{weekLabel}</Typography>}
      />

      <Box sx={{ display: "flex", gap: "8px", mb: "12px" }}>
        {MODES.map((m) => {
          const active = wfMode === m;
          return (
            <Box
              key={m}
              onClick={() => onChangeMode(m)}
              sx={{
                flex: 1,
                py: "10px",
                borderRadius: "10px",
                textAlign: "center",
                cursor: "pointer",
                transition: "all .2s",
                background: active ? colors.accentDim : colors.surface2,
                border: `2px solid ${active ? colors.accentBorder : colors.border}`,
                transform: active && wfhBounce ? "scale(0.95)" : "scale(1)",
                "&:hover": { borderColor: colors.accentBorder, background: colors.accentDim },
              }}
            >
              {m === "WFH" ? (
                <HomeIcon sx={{ fontSize: 17, color: active ? colors.accent : colors.textSecondary }} />
              ) : (
                <BusinessIcon sx={{ fontSize: 17, color: active ? colors.accent : colors.textSecondary }} />
              )}
              <Typography sx={{ fontSize: 11, fontWeight: 800, color: active ? colors.accent : colors.textSecondary, display: "block", mt: "2px" }}>
                {m}
              </Typography>
              <Typography sx={{ fontSize: 8, color: active ? colors.accentLight : colors.textDim, mt: "1px" }}>
                {m === "WFH" ? "From Home" : "In Office"}
              </Typography>
            </Box>
          );
        })}
      </Box>

      <Typography sx={{ fontSize: 8, fontWeight: 700, color: colors.textSecondary, letterSpacing: ".8px", textTransform: "uppercase", mb: "7px" }}>
        This week
      </Typography>
      <Box sx={{ display: "flex", gap: "5px" }}>
        {week.map((d, i) => (
          <Tooltip key={i} title={d.t} arrow placement="top">
            <Box
              sx={{
                flex: 1,
                py: "5px",
                borderRadius: "7px",
                textAlign: "center",
                cursor: "pointer",
                background: d.active ? colors.accentDim : colors.surface2,
                border: `1.5px solid ${d.active ? colors.accentBorder : colors.border}`,
                transition: "all .15s",
                "&:hover": { borderColor: colors.accentBorder, transform: "translateY(-1px)" },
              }}
            >
              <Typography sx={{ fontSize: 9, fontWeight: 800, color: d.active ? colors.accent : colors.textSecondary }}>{d.d}</Typography>
              <Typography sx={{ fontSize: 7, fontWeight: 700, color: d.active ? colors.accentLight : colors.textDim, mt: "1px" }}>{d.t}</Typography>
            </Box>
          </Tooltip>
        ))}
      </Box>
    </Card>
  );
}
