import { Box, Typography, Card, Button, Stack } from "@mui/material";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { dummyDashboardData } from "../api/dashboard.dummy";
import { AppScrollView } from "../../../components/ui/AppScrollView";

export default function NotificationCard() {
  const { notifications } = dummyDashboardData;

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return (
          <CheckCircleOutlineIcon sx={{ color: "#10B981", fontSize: 16 }} />
        );
      case "error":
        return <ErrorOutlineIcon sx={{ color: "#EF4444", fontSize: 16 }} />;
      default:
        return <InfoOutlinedIcon sx={{ color: "#3B82F6", fontSize: 16 }} />;
    }
  };

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
          <NotificationsNoneOutlinedIcon
            sx={{ color: "#475569", fontSize: 18 }}
          />
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 600, color: "#0F172A" }}
          >
            Notifications
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

      {/* Scrollable Container */}
      <AppScrollView direction="vertical" maxHeight={150} sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}
      >
        {notifications.map((notif, index) => (
          <Box
            key={notif.id}
            sx={{
              display: "flex",
              alignItems: "flex-start",
              p: 1.5,
              gap: 1.5,
              borderBottom:
                index !== notifications.length - 1
                  ? "1px solid #F1F5F9"
                  : "none",
            }}
          >
            <Box sx={{ mt: 0.2 }}>{getIcon(notif.type)}</Box>
            <Box sx={{ flex: 1 }}>
              <Typography
                sx={{
                  color: "#0F172A",
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  lineHeight: 1.3,
                  mb: 0.5,
                }}
              >
                {notif.message}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography sx={{ color: "#94A3B8", fontSize: "0.65rem" }}>
                  {notif.category}
                </Typography>
                <Box
                  sx={{
                    width: 3,
                    height: 3,
                    borderRadius: "50%",
                    bgcolor: "#CBD5E1",
                  }}
                />
                <Typography sx={{ color: "#94A3B8", fontSize: "0.65rem" }}>
                  {notif.time}
                </Typography>
              </Stack>
            </Box>
            <Button
              size="small"
              variant="contained"
              disableElevation
              sx={{
                bgcolor: "#F1F5F9",
                color: "#475569",
                minWidth: 0,
                p: "2px 8px",
                textTransform: "none",
                borderRadius: 1.5,
                fontSize: "0.65rem",
                fontWeight: 600,
              }}
            >
              Review
            </Button>
          </Box>
        ))}
      </AppScrollView>
    
    </Card>
  );
}