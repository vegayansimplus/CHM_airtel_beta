import { Box, Typography, Card, Stack, Chip } from "@mui/material";
import CelebrationOutlinedIcon from "@mui/icons-material/CelebrationOutlined";
import { dummyDashboardData } from "../api/dashboard.dummy";
import { AppScrollView } from "../../../components/ui/AppScrollView";

export default function UpcomingHolidaysCard() {
  const { holidays } = dummyDashboardData;

  return (
    <Card
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
          p: 1,
          borderBottom: "1px solid #F1F5F9",
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <CelebrationOutlinedIcon sx={{ color: "#F59E0B", fontSize: 18 }} />
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 600, color: "#0F172A" }}
          >
            Upcoming Holidays
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
          maxHeight: 120,
        }}
      >
        {holidays.map((holiday, index) => (
          <Box
            key={holiday.id}
            sx={{
              display: "flex",
              alignItems: "center",
              p: 1,
              gap: 1,
              borderBottom:
                index !== holidays.length - 1 ? "1px solid #F1F5F9" : "none",
              transition: "bgcolor 0.2s",
              "&:hover": { bgcolor: "#F8FAFC" },
            }}
          >
            {/* Calendar Date Block */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "#FFFBEB",
                border: "1px solid #FEF3C7",
                borderRadius: 2,
                minWidth: 46,
                height: 46,
              }}
            >
              <Typography
                sx={{
                  fontSize: "0.6rem",
                  fontWeight: 700,
                  color: "#D97706",
                  textTransform: "uppercase",
                  lineHeight: 1,
                }}
              >
                {holiday.month}
              </Typography>
              <Typography
                sx={{
                  fontSize: "1.1rem",
                  fontWeight: 800,
                  color: "#B45309",
                  lineHeight: 1.1,
                }}
              >
                {holiday.date}
              </Typography>
            </Box>

            {/* Holiday Details */}
            <Box sx={{ flex: 1 }}>
              <Typography
                sx={{
                  color: "#0F172A",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  mb: 0.2,
                }}
              >
                {holiday.name}
              </Typography>
              <Typography sx={{ color: "#64748B", fontSize: "0.65rem" }}>
                {holiday.day}
              </Typography>
            </Box>

            {/* Badge */}
            <Chip
              label={holiday.type}
              size="small"
              sx={{
                height: 20,
                fontSize: "0.6rem",
                bgcolor: "#F1F5F9",
                color: "#475569",
                fontWeight: 500,
              }}
            />
          </Box>
        ))}
      </AppScrollView>
    </Card>
  );
}