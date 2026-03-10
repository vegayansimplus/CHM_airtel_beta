import {
  Drawer,
  Box,
  Typography,
  Stack,
  TextField,
  MenuItem,
  Button,
  IconButton,
  Divider,
  CircularProgress,
  InputAdornment,
} from "@mui/material";
import { useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import EventNoteIcon from "@mui/icons-material/EventNote";
import DescriptionIcon from "@mui/icons-material/Description";
import { useApplyLeaveMutation } from "../api/leave.api";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ApplyLeaveDrawer({ open, onClose }: Props) {
  // Extract isLoading to show a loading state on the button
  const [applyLeave, { isLoading }] = useApplyLeaveMutation();

  const [form, setForm] = useState({
    leaveType: "",
    startDate: "",
    endDate: "",
    reason: "",
  });

  const handleChange =
    (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm({ ...form, [field]: e.target.value });
    };

  const handleSubmit = async () => {
    try {
      await applyLeave(form).unwrap();
      // Optional: Reset form here
      onClose();
    } catch (error) {
      console.error("Failed to apply leave", error);
    }
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box
        sx={{
          width: { xs: "100vw", sm: 450 }, // Full width on mobile, 450px on desktop
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        {/* --- HEADER --- */}
        <Box
          sx={{
            px: 3,
            py: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              fontWeight: 600,
            }}
          >
            <EventNoteIcon color="primary" />
            Apply for Leave
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider />

        {/* --- BODY (Scrollable) --- */}
        <Box sx={{ flexGrow: 1, overflowY: "auto", p: 3 }}>
          <Stack spacing={3}>
            <Typography variant="body2" color="text.secondary" mb={-1}>
              Please fill in the details below to submit your leave request.
            </Typography>

            <TextField
              select
              fullWidth
              label="Leave Type"
              value={form.leaveType}
              onChange={handleChange("leaveType")}
            >
              <MenuItem value="CASUAL">Casual Leave</MenuItem>
              <MenuItem value="SICK">Sick Leave</MenuItem>
              <MenuItem value="EARNED">Earned Leave</MenuItem>
            </TextField>

            {/* Dates side-by-side */}
            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                type="date"
                label="Start Date"
                value={form.startDate}
                InputLabelProps={{ shrink: true }}
                onChange={handleChange("startDate")}
              />
              <TextField
                fullWidth
                type="date"
                label="End Date"
                value={form.endDate}
                InputLabelProps={{ shrink: true }}
                onChange={handleChange("endDate")}
              />
            </Stack>

            <TextField
              fullWidth
              label="Reason for Leave"
              multiline
              rows={4}
              value={form.reason}
              onChange={handleChange("reason")}
              placeholder="Briefly explain why you need this leave..."
              InputProps={{
                startAdornment: (
                  <InputAdornment
                    position="start"
                    sx={{ alignSelf: "flex-start", mt: 1 }}
                  >
                    <DescriptionIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Stack>
        </Box>

        {/* --- FOOTER (Fixed) --- */}
        <Divider />
        <Box
          sx={{
            p: 3,
            bgcolor: "background.default",
            display: "flex",
            justifyContent: "flex-end",
            gap: 2,
          }}
        >
          <Button variant="outlined" color="inherit" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={
              isLoading || !form.leaveType || !form.startDate || !form.endDate
            }
            startIcon={isLoading ? <CircularProgress size={20} /> : null}
            sx={{ px: 4 }}
          >
            {isLoading ? "Submitting..." : "Submit Leave"}
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
}
