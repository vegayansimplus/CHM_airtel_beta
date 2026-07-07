import { Box, Card, Chip, Tooltip, Typography } from "@mui/material";
import type { Colors } from "../types/colorTypes";
import type { LeaveTeamMember } from "../types/dashboard.types";
import { fadeIn, getCardSx, getToneStyles } from "../constants/dashboard.styles";
import { SectionHeader } from "./SectionHeader";

interface OnLeaveTodayCardProps {
  team: readonly LeaveTeamMember[];
  colors: Colors;
  mounted: boolean;
  delay: number;
}

export function OnLeaveTodayCard({ team, colors, mounted, delay }: OnLeaveTodayCardProps) {
  const tones = getToneStyles(colors);

  return (
    <Card sx={{ ...getCardSx(colors), p: "16px", ...fadeIn(mounted, delay) }}>
      <SectionHeader
        title="On leave today"
        colors={colors}
        right={
          <Box sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Chip
              label={team.length}
              size="small"
              sx={{ fontSize: 10, fontWeight: 800, color: colors.warning, background: colors.warningDim, borderRadius: "20px", height: "auto", "& .MuiChip-label": { px: "8px", py: "2px" } }}
            />
            <Typography sx={{ fontSize: 11, color: colors.accent, fontWeight: 700, cursor: "pointer", "&:hover": { textDecoration: "underline" } }}>
              All
            </Typography>
          </Box>
        }
      />
      <Box sx={{ display: "flex", flexDirection: "column", gap: "7px" }}>
        {team.map((p, i) => {
          const chipTone = tones[p.tone];
          const avatarTone = tones[p.avatarTone];
          return (
            <Tooltip key={i} title={`Returns ${p.returnDate}`} arrow placement="right">
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  p: "9px 10px",
                  borderRadius: "10px",
                  background: colors.surface2,
                  border: `1.5px solid ${colors.border}`,
                  transition: "all .18s",
                  cursor: "default",
                  "&:hover": { borderColor: colors.accentBorder, background: colors.accentDim, transform: "translateX(3px)" },
                }}
              >
                <Box
                  sx={{
                    width: 34,
                    height: 34,
                    borderRadius: "10px",
                    flexShrink: 0,
                    background: avatarTone.light,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    fontWeight: 800,
                    color: avatarTone.color,
                  }}
                >
                  {p.initials}
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontSize: 12, fontWeight: 700, color: colors.textPrimary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {p.name}
                  </Typography>
                  <Typography sx={{ fontSize: 10, color: colors.textSecondary, mt: "1px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {p.role}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: "right", flexShrink: 0 }}>
                  <Chip
                    label={p.type}
                    size="small"
                    sx={{
                      fontSize: 9,
                      fontWeight: 700,
                      color: chipTone.color,
                      background: chipTone.light,
                      borderRadius: "6px",
                      border: `1px solid ${chipTone.border}`,
                      height: "auto",
                      "& .MuiChip-label": { px: "8px", py: "3px" },
                    }}
                  />
                  <Typography sx={{ fontSize: 9, color: colors.textSecondary, mt: "3px" }}>Back {p.returnDate}</Typography>
                </Box>
              </Box>
            </Tooltip>
          );
        })}
      </Box>
    </Card>
  );
}
