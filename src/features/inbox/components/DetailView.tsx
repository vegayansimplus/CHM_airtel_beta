import { alpha, Button, Chip, IconButton, Paper, Stack, Typography, useTheme } from "@mui/material";
import { type InboxItem } from "./TaskInbox";

// import AccessTimeIcon from "@mui/icons-material/AccessTime";
// import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
// import NotificationsIcon from "@mui/icons-material/Notifications";
// import SearchIcon from "@mui/icons-material/Search";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
// import MenuIcon from "@mui/icons-material/Menu";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
// import AssignmentIcon from "@mui/icons-material/Assignment";
// import AssignmentLateIcon from "@mui/icons-material/AssignmentLate";
// import AllInboxIcon from "@mui/icons-material/AllInbox";
import { formatModuleName } from "../utils/formatModuleName";
import { AppScrollView } from "../../../components/ui/AppScrollView";

export const DetailView = ({
  activeItem,
  onBack,
}: {
  activeItem: InboxItem | undefined;
  onBack: () => void;
}) => {
  const theme = useTheme();

  if (!activeItem) {
    return (
      <Stack
        flex={1}
        alignItems="center"
        justifyContent="center"
        bgcolor="background.default"
      >
        <CheckCircleIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
        <Typography color="text.secondary" variant="body1" fontWeight={500}>
          Select an item to view details
        </Typography>
      </Stack>
    );
  }

  return (
    <>
      <Stack
        p={{ xs: 2, md: 1}}
        borderBottom={1}
        borderColor="divider"
        bgcolor="background.paper"
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Stack direction="row" alignItems="center" gap={1}>
            <IconButton
              onClick={onBack}
              sx={{ display: { md: "none" } }}
              edge="start"
            >
              <ArrowBackIcon />
            </IconButton>
            <Chip
              label={formatModuleName(activeItem.displayModule)}
              size="small"
              sx={{
                fontWeight: 600,
                color: "primary.main",
                bgcolor: alpha(theme.palette.primary.main, 0.1),
              }}
            />
          </Stack>
          <IconButton size="small">
            <MoreHorizIcon />
          </IconButton>
        </Stack>

        <Typography
          variant="h5"
          sx={{ fontWeight: 700, mb: 1, color: "text.primary" }}
        >
          {activeItem.shortTitle}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Received on <strong>{activeItem.date}</strong> at{" "}
          <strong>{activeItem.time}</strong>
        </Typography>
      </Stack>

      <AppScrollView
        p={{ xs: 2, md: 4 }}
        flex={1}
        overflow="auto"
        bgcolor="background.default"
      >
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
            bgcolor: "background.paper",
            boxShadow: theme.shadows[1],
          }}
        >
          <Typography
            variant="body1"
            sx={{
              color: "text.primary",
              whiteSpace: "pre-wrap",
              lineHeight: 1.7,
            }}
          >
            {activeItem.message}
          </Typography>
        </Paper>
      </AppScrollView>

      {/* Action Footer */}
      <Stack
        direction="row"
        spacing={2}
        p={3}
        borderTop={1}
        borderColor="divider"
        bgcolor={theme.palette.mode === "dark" ? "background.paper" : "#fafafa"}
      >
        {activeItem.isActionable ? (
          <>
            <Button
              variant="contained"
              color="success"
              fullWidth
              sx={{
                py: 1.2,
                fontWeight: 600,
                textTransform: "none",
                borderRadius: 2,
              }}
              onClick={() =>
                alert(
                  `Approving Entity ID: ${activeItem.parsedPayload?.entity_id}`,
                )
              }
            >
              Approve
            </Button>
            <Button
              variant="outlined"
              color="error"
              fullWidth
              sx={{
                py: 1.2,
                fontWeight: 600,
                textTransform: "none",
                borderRadius: 2,
              }}
              onClick={() =>
                alert(
                  `Rejecting Entity ID: ${activeItem.parsedPayload?.entity_id}`,
                )
              }
            >
              Reject
            </Button>
          </>
        ) : (
          <Button
            variant="contained"
            fullWidth
            disableElevation
            sx={{
              py: 1.2,
              fontWeight: 600,
              textTransform: "none",
              borderRadius: 2,
            }}
            onClick={() => alert(`Acknowledged.`)}
          >
            Acknowledge
          </Button>
        )}
      </Stack>
    </>
  );
};

