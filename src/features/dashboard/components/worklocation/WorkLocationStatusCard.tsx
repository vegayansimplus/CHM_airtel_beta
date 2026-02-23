import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Stack,
  Collapse,
  ToggleButton,
  ToggleButtonGroup,
  TextField,
  Divider,
  Fade,
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import BusinessIcon from "@mui/icons-material/Business";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

type WorkMode = "WFH" | "WFO" | null;

const getStatusColor = (status: WorkMode) => {
  switch (status) {
    case "WFH":
      return "secondary";
    case "WFO":
      return "success";
    default:
      return "warning";
  }
};

const WorkLocationStatusCard: React.FC = () => {
  const [mode, setMode] = useState<WorkMode>(null);
  const [expanded, setExpanded] = useState(false);
  const [locationNote, setLocationNote] = useState("");

  const handleModeChange = (
    _event: React.MouseEvent<HTMLElement>,
    newMode: WorkMode,
  ) => {
    if (newMode !== null) {
      setMode(newMode);
    }
  };

  const handleSave = () => {
    if (!mode) return;
    setExpanded(false);
  };

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <Card elevation={1} sx={{ borderRadius: 3 }}>
      <CardContent sx={{ p: 2 }}>
        {/* Header */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={0.5}
        >
          <Stack direction="row" spacing={0.5} alignItems="center">
            <LocationOnIcon color="primary" />
            <Typography variant="h6" fontWeight={600}>
              Work Location
            </Typography>
          </Stack>

          <Chip
            label={mode ? mode : "Not Marked"}
            color={getStatusColor(mode)}
            variant="filled"
          />
        </Stack>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
          {today}
        </Typography>

        {/* Empty / Status Message */}
        <Fade in timeout={300}>
          <Box mb={0.5}>
            {!mode ? (
              <Stack spacing={1}>
                <Typography variant="subtitle1" fontWeight={500}>
                  You haven’t marked your location yet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Select where you’re working from today.
                </Typography>
              </Stack>
            ) : (
              <Stack spacing={0.5}>
                <Typography variant="subtitle1" fontWeight={500}>
                  You are working from{" "}
                  {mode === "WFH" ? "Home 🏠" : "Office 🏢"}
                </Typography>
                {locationNote && (
                  <Typography variant="body2" color="text.secondary">
                    Note: {locationNote}
                  </Typography>
                )}
              </Stack>
            )}
          </Box>
        </Fade>

        {/* Action Button */}
        {!expanded && (
          <Button
            variant="contained"
            fullWidth
            size="small"
            onClick={() => setExpanded(true)}
            sx={{
              borderRadius: 3,
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            {mode ? "Update Location" : "Mark Location"}
          </Button>
        )}

        {/* Expand Section */}
        <Collapse in={expanded}>
          {/* <Divider sx={{  /> */}

          <Stack spacing={1}>
            <ToggleButtonGroup
              fullWidth
              exclusive
              size="small"
              value={mode}
              onChange={handleModeChange}
            >
              <ToggleButton value="WFO">
                <BusinessIcon sx={{ mr: 1 }} />
                Office
              </ToggleButton>
              <ToggleButton value="WFH">
                <HomeWorkIcon sx={{ mr: 1 }} />
                Home
              </ToggleButton>
            </ToggleButtonGroup>

            <TextField
              label="Optional Note"
              size="small"
              value={locationNote}
              onChange={(e) => setLocationNote(e.target.value)}
              placeholder="Example: Mumbai HQ"
              fullWidth
            />

            <Stack direction="row" spacing={3}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => setExpanded(false)}
                sx={{ borderRadius: 3 }}
              >
                Cancel
              </Button>

              <Button
                variant="contained"
                fullWidth
                onClick={handleSave}
                disabled={!mode}
                sx={{
                  borderRadius: 3,
                  textTransform: "none",
                  fontWeight: 600,
                }}
              >
                Save
              </Button>
            </Stack>
          </Stack>
        </Collapse>

        {/* Footer */}
        {mode && (
          <Stack direction="row" spacing={1} alignItems="center">
            <AccessTimeIcon fontSize="small" color="action" />
            <Typography variant="caption" color="text.secondary">
              Last updated just now
            </Typography>
          </Stack>
        )}
      </CardContent>
    </Card>
  );
};

export default WorkLocationStatusCard;
