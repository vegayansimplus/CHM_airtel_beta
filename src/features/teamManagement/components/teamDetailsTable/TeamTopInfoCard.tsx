import React from "react";
import {
  Card,
  Box,
  Typography,
  Avatar,
  Chip,
  useTheme,
} from "@mui/material";

/* ================= OVERVIEW TYPE ================= */

interface OverviewType {
  l1Count: number;
  l2Count: number;
  l3Count: number;
  l4Count: number;
  teamLead: string;
  totalCount: number;
}

interface TeamTopInfoCardProps {
  overview?: OverviewType;   // ✅ dynamic data
  teamName?: string;
}

export const TeamTopInfoCard: React.FC<TeamTopInfoCardProps> = ({
  overview,
  teamName = "IP Core",
}) => {
  const theme = useTheme();

  // If API still loading
  if (!overview) return null;

  // ----------------{ Level Style Map }----------------
  const levelStyles: Record<
    string,
    { bg: string; color: string }
  > = {
    L1: { bg: "#E3F2FD", color: "#1976D2" },
    L2: { bg: "#E8F5E9", color: "#2E7D32" },
    L3: { bg: "#FFF3E0", color: "#ED6C02" },
    L4: { bg: "#FDECEA", color: "#C62828" },
    TOTAL: { bg: "#EDE7F6", color: "#512DA8" },
  };

  return (
    <Card
      sx={{
        p: 0.5,
        borderRadius: 3,
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        {/* ---------------- LEFT SIDE ---------------- */}
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar
            sx={{
              bgcolor: "#5C6BC0",
              width: 35,
              height: 35,
              fontWeight: 600,
            }}
          >
            {teamName.slice(0, 2).toUpperCase()}
          </Avatar>

          <Box>
            <Typography fontWeight={700}>
              {teamName}
            </Typography>

            <Typography
              variant="body1"
              sx={{ color: "text.secondary" }}
            >
              Team Head:{" "}
              <Typography
                component="span"
                fontWeight={600}
                color="text.primary"
              >
                {overview.teamLead}
              </Typography>
            </Typography>
          </Box>
        </Box>

        {/* ---------------- RIGHT SIDE (Responsive Chips) ---------------- */}
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            justifyContent: { xs: "flex-start", md: "flex-end" },
          }}
        >
          <Chip
            label={`L1: ${overview.l1Count}`}
            sx={{
              backgroundColor: levelStyles.L1.bg,
              color: levelStyles.L1.color,
              fontWeight: 600,
              borderRadius: "8px",
            }}
          />

          <Chip
            label={`L2: ${overview.l2Count}`}
            sx={{
              backgroundColor: levelStyles.L2.bg,
              color: levelStyles.L2.color,
              fontWeight: 600,
              borderRadius: "8px",
            }}
          />

          <Chip
            label={`L3: ${overview.l3Count}`}
            sx={{
              backgroundColor: levelStyles.L3.bg,
              color: levelStyles.L3.color,
              fontWeight: 600,
              borderRadius: "8px",
            }}
          />

          <Chip
            label={`L4: ${overview.l4Count}`}
            sx={{
              backgroundColor: levelStyles.L4.bg,
              color: levelStyles.L4.color,
              fontWeight: 600,
              borderRadius: "8px",
            }}
          />

          <Chip
            label={`Total (Active): ${overview.totalCount}`}
            sx={{
              backgroundColor: levelStyles.TOTAL.bg,
              color: levelStyles.TOTAL.color,
              fontWeight: 700,
              borderRadius: "8px",
              px: 1,
            }}
          />
        </Box>
      </Box>
    </Card>
  );
};

// import React from "react";
// import { Card, Box, Typography, useTheme } from "@mui/material";
// import { tokens } from "../../../../style/theme";
// import type { TeamDataEntryType } from "../../types/TeamDataEntryType";

// interface TeamTopInfoCardProps {
//   levelCount: TeamDataEntryType[];
// }

// export const TeamTopInfoCard: React.FC<TeamTopInfoCardProps> = ({
//   levelCount,
// }) => {
//   const theme = useTheme();
//   const colors = tokens(theme.palette.mode);

//   const activeMembers = levelCount.filter(
//     (item) => item.status?.toLowerCase() === "active",
//   );

//   const levelCounts = activeMembers.reduce(
//     (acc, item) => {
//       acc[item.level] = (acc[item.level] || 0) + 1;
//       return acc;
//     },
//     {} as Record<string, number>,
//   );

//   const totalActive = activeMembers.length;

//   const Stat = ({
//     label,
//     value,
//     highlight = false,
//   }: {
//     label: string;
//     value: number;
//     highlight?: boolean;
//   }) => (
//     <Box
//       sx={{
//         display: "flex",
//         alignItems: "center",
//         gap: 0.5,
//         px: highlight ? 2 : 0,
//         py: highlight ? 0.5 : 0,
//         borderRadius: 1,
//         bgcolor: highlight ? "#1E3A8A" : "transparent",
//         color: highlight ? "#fff" : "inherit",
//       }}
//     >
//       <Typography fontWeight={600}>{label}:</Typography>
//       <Typography fontWeight={700}>{value}</Typography>
//     </Box>
//   );

//   return (
//     <Card sx={{ p: 2, borderRadius: 2, boxShadow: 1 }}>
//       <Box
//         sx={{
//           display: "flex",
//           justifyContent: "space-between",
//           alignItems: "center",
//           flexWrap: "wrap",
//           gap: 2,
//         }}
//       >
//         <Typography variant="h6" fontWeight={700}>
//           IP Core • Pankaj Chaudhary
//         </Typography>

//         <Box
//           sx={{
//             display: "flex",
//             alignItems: "center",
//             gap: 3,
//             "& > *:not(:last-child)": {
//               borderRight: "1px solid #e0e0e0",
//               pr: 2,
//             },
//           }}
//         >
//           <Stat label="L1" value={levelCounts["L1"] || 10000} />
//           <Stat label="L2" value={levelCounts["L2"] || 920} />
//           <Stat label="L3" value={levelCounts["L3"] || 890} />
//           <Stat label="L4" value={levelCounts["L4"] || 870} />
//           <Stat label="Total (Active)" value={totalActive} highlight />
//         </Box>
//       </Box>
//     </Card>
//   );
// };
