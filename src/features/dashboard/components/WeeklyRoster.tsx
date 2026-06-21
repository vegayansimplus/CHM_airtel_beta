import { Box, Typography, Card, Chip, Avatar, Stack } from "@mui/material";
import WeekendOutlinedIcon from "@mui/icons-material/WeekendOutlined";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { dummyDashboardData } from "../api/dashboard.dummy";

export default function WeeklyRoster() {
  const { employee, schedule } = dummyDashboardData.roster;

  return (
    <Card
      sx={{
        borderRadius: 3,
        boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.02)",
        border: "1px solid #E2E8F0",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          // p: 1.5,
          borderBottom: "1px solid #E2E8F0",
          bgcolor: "#FFFFFF",
        }}
      >
        {/* <CalendarMonthOutlinedIcon
          sx={{ color: "#475569", mr: 1, fontSize: 18 }}
        />
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 600, color: "#0F172A" }}
        >
          Weekly Schedule
        </Typography> */}
      </Box>

      <Box  sx={{ display: "flex" }}>
        {/* Compact Employee Column */}
        <Box
          sx={{
            minWidth: 200,
            p: 1,
            borderRight: "1px solid #E2E8F0",
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
            bgcolor: "#F8FAFC",
            justifyContent: "center",
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar
              sx={{
                bgcolor: "#4F46E5",
                width: 36,
                height: 36,
                fontSize: "0.8rem",
                fontWeight: 600,
              }}
            >
              {employee.initials}
            </Avatar>
            <Box>
              <Typography
                variant="subtitle2"
                sx={{ color: "#0F172A", fontWeight: 700, lineHeight: 1.2 }}
              >
                {employee.name}
              </Typography>
              <Typography sx={{ color: "#64748B", fontSize: "0.65rem" }}>
                {employee.role}
              </Typography>
            </Box>
          </Stack>
          <Stack direction="row" spacing={0.5}>
            <Chip
              label={employee.id}
              size="small"
              sx={{
                height: 20,
                fontSize: "0.65rem",
                bgcolor: "white",
                border: "1px solid #E2E8F0",
              }}
            />
            <Chip
              label="Full Time"
              size="small"
              sx={{
                height: 20,
                fontSize: "0.65rem",
                bgcolor: "white",
                border: "1px solid #E2E8F0",
              }}
            />
          </Stack>
        </Box>

        {/* Compact Days Columns */}
        {schedule.map((day, index) => (
          <Box
            key={index}
            sx={{
              flex: 1,
              minWidth: 100,
              display: "flex",
              flexDirection: "column",
              borderRight:
                index < schedule.length - 1 ? "1px solid #E2E8F0" : "none",
            }}
          >
            <Box
              sx={{
                p: 1,
                textAlign: "center",
                borderBottom: "1px solid #E2E8F0",
                bgcolor: "white",
              }}
            >
              <Typography
                sx={{
                  color: "#64748B",
                  fontSize: "0.65rem",
                  fontWeight: 600,
                  textTransform: "uppercase",
                }}
              >
                {day.day}
              </Typography>
              <Typography
                variant="subtitle2"
                sx={{ color: "#0F172A", fontWeight: 700, fontSize: "0.8rem" }}
              >
                {day.date}
              </Typography>
            </Box>

            <Box
              sx={{
                flex: 1,
                p: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: day.type === "off" ? "#F8FAFC" : "white",
              }}
            >
              {day.type === "off" ? (
                <Stack alignItems="center" spacing={0.5} sx={{ opacity: 0.6 }}>
                  <WeekendOutlinedIcon
                    sx={{ color: "#94A3B8", fontSize: 18 }}
                  />
                  <Typography
                    sx={{
                      fontSize: "0.65rem",
                      fontWeight: 600,
                      color: "#64748B",
                    }}
                  >
                    Weekly Off
                  </Typography>
                </Stack>
              ) : (
                <Stack
                  alignItems="center"
                  spacing={0.5}
                  sx={{
                    w: "100%",
                    bgcolor: "#EEF2FF",
                    py: 1,
                    px: 0.5,
                    borderRadius: 2,
                    border: "1px solid #E0E7FF",
                    width: "100%",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      color: "#4F46E5",
                    }}
                  >
                    {day.shift}
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <AccessTimeIcon sx={{ fontSize: 12, color: "#6366F1" }} />
                    <Typography
                      sx={{
                        fontSize: "0.65rem",
                        color: "#4F46E5",
                        fontWeight: 500,
                      }}
                    >
                      {day.time}
                    </Typography>
                  </Stack>
                  <Chip
                    label={`${day.mins}m`}
                    size="small"
                    sx={{
                      height: 16,
                      fontSize: "0.6rem",
                      bgcolor: "transparent",
                      color: "#4F46E5",
                    }}
                  />
                </Stack>
              )}
            </Box>
          </Box>
        ))}
      </Box>
    </Card>
  );
}
