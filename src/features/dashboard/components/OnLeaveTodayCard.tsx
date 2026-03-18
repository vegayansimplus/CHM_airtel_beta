import { Box, Typography, Card, Stack, Avatar, Chip } from "@mui/material";
import BeachAccessOutlinedIcon from "@mui/icons-material/BeachAccessOutlined";
import { dummyDashboardData } from "../api/dashboard.dummy";
import { AppScrollView } from "../../../components/ui/AppScrollView";

export default function OnLeaveTodayCard() {
  const { onLeave } = dummyDashboardData;

  return (
    <Box
      sx={{
        borderRadius: 3,
        boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.02)",
        border: "1px solid #E2E8F0",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 1.5,
          borderBottom: "1px solid #F1F5F9",
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <BeachAccessOutlinedIcon sx={{ color: "#10B981", fontSize: 18 }} />
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 600, color: "#0F172A" }}
          >
            On Leave Today
          </Typography>
        </Stack>
        <Typography
          sx={{
            color: "#3B82F6",
            fontWeight: 600,
            fontSize: "0.75rem",
            cursor: "pointer",
          }}
        >
          View All
        </Typography>
      </Box>

      {/* Scrollable List Body */}
      <AppScrollView
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
          maxHeight: 140,
        }}
      >
        {onLeave.map((person, index) => (
          <Box
            key={person.id}
            sx={{
              display: "flex",
              alignItems: "center",
              p: 1.5,
              gap: 1.5,
              borderBottom:
                index !== onLeave.length - 1 ? "1px solid #F1F5F9" : "none",
              transition: "bgcolor 0.2s",
              "&:hover": { bgcolor: "#F8FAFC" },
            }}
          >
            {/* Avatar */}
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: person.color,
                fontSize: "0.8rem",
                fontWeight: 600,
              }}
            >
              {person.initials}
            </Avatar>

            {/* Details */}
            <Box sx={{ flex: 1 }}>
              <Typography
                sx={{
                  color: "#0F172A",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  mb: 0.2,
                }}
              >
                {person.name}
              </Typography>
              <Typography sx={{ color: "#64748B", fontSize: "0.65rem" }}>
                {person.role}
              </Typography>
            </Box>

            {/* Leave Type Badge */}
            <Chip
              label={person.type}
              size="small"
              sx={{
                height: 22,
                fontSize: "0.6rem",
                bgcolor: person.bg,
                color: person.color,
                fontWeight: 600,
                border: `1px solid ${person.color}30`,
              }}
            />
          </Box>
        ))}
      </AppScrollView>
    </Box>
  );
}
