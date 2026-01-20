import React from "react";
import { Box, Card, Typography, Grid, useTheme } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import { tokens } from "../../../../style/theme";
import type { TeamDataEntryType } from "../../types/TeamDataEntryType";

interface TeamTopInfoCardProps {
  levelCount: TeamDataEntryType[];
}

const LevelBadge = ({
  label,
  value,
  bg,
  iconColor,
  color,
  highlight,
}: {
  label: string;
  value: number;
  bg: string;
  iconColor: string;
  color?: string;
  highlight?: boolean;
}) => (
  <Box
    sx={{
      minWidth: 100,
      px: 5,
      py: 1.5,
      borderRadius: 2,
      bgcolor: bg,
      color: color || "inherit",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      boxShadow: highlight ? 6 : 1,
      transition: "all 0.25s ease",
      cursor: "pointer",
      "&:hover": {
        transform: "translateY(-4px)",
        boxShadow: highlight ? 10 : 4,
      },
    }}
  >
    <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 0.5 }}>
      {label}
    </Typography>

    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
      <PersonIcon fontSize="small" sx={{ color: iconColor }} />
      <Typography variant="h6" fontWeight="bold">
        {value}
      </Typography>
    </Box>
  </Box>
);

export const TeamTopInfoCard: React.FC<TeamTopInfoCardProps> = ({
  levelCount,
}) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const activeMembers = levelCount.filter(
    (item) => item.status?.toLowerCase() === "active"
  );

  const levelCounts = activeMembers.reduce((acc, item) => {
    acc[item.level] = (acc[item.level] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalActive = activeMembers.length;

  return (
    <Card
      sx={{
        p: 1,
        m: 0.5,
        borderRadius: 3,
        boxShadow: 1,
      }}
    >
      <Grid container alignItems="center" spacing={2}>
        {/* Left: Team Info */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            sx={{
              width: "85%",
              p: 2,
              borderRadius: 1,

              /* Glass effect */
              background: "rgba(255, 255, 255, 0.15)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",

              /* Glass border */
              border: "1px solid rgba(255, 255, 255, 0.3)",

              /* Depth */
              boxShadow: "0 2px 10px rgba(0, 0, 0, 0.12)",

              /* Interaction */
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 12px 40px rgba(0, 0, 0, 0.2)",
              },
            }}
          >
            <Typography
              variant="subtitle1"
              fontWeight={700}
              sx={{ letterSpacing: 0.5 }}
            >
              IP Core
            </Typography>

            <Typography variant="caption" sx={{ opacity: 0.85 }}>
              Team Head • Pankaj Chaudhary
            </Typography>
          </Card>
        </Grid>
     


        {/* Right: Level Stats */}
        <Grid
          // item xs={12} md={8}
          size={{ xs: 12, md: 8 }}
        >
          <Box
            sx={{
              display: "flex",
              gap: 1.5,
              justifyContent: { xs: "flex-start", md: "flex-end" },
              flexWrap: "wrap",
            }}
          >
            <LevelBadge
              label="L1"
              value={levelCounts["L1"] || 0}
              bg="#E3F2FD"
              iconColor="#1976D2"
            />
            <LevelBadge
              label="L2"
              value={levelCounts["L2"] || 0}
              bg="#E8F5E9"
              iconColor="#2E7D32"
            />
            <LevelBadge
              label="L3"
              value={levelCounts["L3"] || 0}
              bg="#FFF3E0"
              iconColor="#EF6C00"
            />
            <LevelBadge
              label="L4"
              value={levelCounts["L4"] || 0}
              bg="#FBE9E7"
              iconColor="#D84315"
            />
            <LevelBadge
              label="Total (Active) "
              value={totalActive}
              bg="#1E3A8A"
              iconColor="#FFFFFF"
              color="white"
            />
    
          </Box>
        </Grid>
      </Grid>
    </Card>
  );
};
