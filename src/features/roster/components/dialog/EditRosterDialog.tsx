import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  IconButton,
  Stack,
  Divider,
  TextField,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EventNoteIcon from "@mui/icons-material/EventNote";
import BadgeIcon from "@mui/icons-material/Badge";
import EditCalendarIcon from "@mui/icons-material/EditCalendar";
import dayjs from "dayjs";
import { shiftColorMap } from "../../constant/shiftColors";
// const SHIFT_OPTIONS = ["WO", "Leave", "New Joinee", "N", "A", "B", "G", "L", "W", "H", "C"];

interface EditRosterDialogProps {
  open: boolean;
  onClose: () => void;
  editData: { shift: any; date: string; userId: string } | null;
  onSave: (
    userId: string,
    date: string,
    newShiftValue: string,
    reason: string,
  ) => void;
  saving?: boolean;
  shiftOptions: { shiftId: number; shiftRange: string }[];
}
export const EditRosterDialog = ({
  open,
  onClose,
  editData,
  onSave,
  saving = false,
  shiftOptions,
}: EditRosterDialogProps) => {
  const [selectedShift, setSelectedShift] = useState("");
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (editData) {
      const currentShift = editData.shift?.shiftDisplay || "WO";
      setSelectedShift(currentShift);
      // reset reason when dialog opens
      setReason("");
    }
  }, [editData]);

  const isReasonValid = reason.trim().length > 0;

  const handleSave = () => {
    if (editData && isReasonValid) {
      onSave(editData.userId, editData.date, selectedShift, reason.trim());
    }
  };

  if (!editData) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: "0px 8px 24px rgba(149, 157, 165, 0.2)",
        },
      }}
    >
      {/* HEADER */}
      <DialogTitle
        sx={{
          m: 0,
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <EditCalendarIcon color="primary" />
          <Typography variant="h6" fontWeight={600}>
            Modify Shift
          </Typography>
        </Stack>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{ color: "text.secondary" }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ p: 3 }}>
        {/* CONTEXT CARD (Date & Employee Info) */}
        <Box
          sx={{
            bgcolor: "#F8FAFC",
            border: "1px solid #E2E8F0",
            borderRadius: 2,
            p: 2,
            mb: 3,
          }}
        >
          <Stack spacing={1.5}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  p: 0.5,
                  bgcolor: "#EFF6FF",
                  borderRadius: 1,
                  display: "flex",
                }}
              >
                <EventNoteIcon sx={{ fontSize: 18, color: "#2563EB" }} />
              </Box>
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                >
                  Shift Date
                </Typography>
                <Typography
                  variant="body2"
                  fontWeight={600}
                  color="text.primary"
                >
                  {dayjs(editData.date).format("dddd, MMM D, YYYY")}
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  p: 0.5,
                  bgcolor: "#F5F3FF",
                  borderRadius: 1,
                  display: "flex",
                }}
              >
                <BadgeIcon sx={{ fontSize: 18, color: "#7C3AED" }} />
              </Box>
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                >
                  Employee ID
                </Typography>
                <Typography
                  variant="body2"
                  fontWeight={600}
                  color="text.primary"
                >
                  {editData.userId}
                </Typography>
              </Box>
            </Stack>
          </Stack>
        </Box>

        {/* INPUT SECTION */}
        <Typography
          variant="subtitle2"
          fontWeight={600}
          color="text.primary"
          sx={{ mb: 1 }}
        >
          Assign New Shift
        </Typography>

        <FormControl fullWidth size="medium">
          <InputLabel id="shift-select-label">Select Shift</InputLabel>
          <Select
            labelId="shift-select-label"
            value={selectedShift}
            label="Select Shift"
            onChange={(e) => setSelectedShift(e.target.value)}
            renderValue={(value) => {
              const shiftStyle = shiftColorMap.get(value.charAt(0)) || {
                color: "#475569",
                background: "#F1F5F9",
              };
              return (
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      bgcolor: shiftStyle.color,
                    }}
                  />
                  <Typography variant="body2" fontWeight={500}>
                    {value}
                  </Typography>
                </Stack>
              );
            }}
          >
            {shiftOptions.map((shift) => {
              const shiftCode = shift.shiftRange;

              const shiftStyle = shiftColorMap.get(shiftCode.charAt(0)) || {
                color: "#475569",
                background: "#F1F5F9",
              };

              return (
                <MenuItem
                  key={shift.shiftId}
                  value={shiftCode}
                  sx={{ py: 1.5 }}
                >
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        bgcolor: shiftStyle.color,
                        boxShadow: `0 0 0 2px ${shiftStyle.background}`,
                      }}
                    />
                    <Typography variant="body2" fontWeight={500}>
                      {shiftCode}
                    </Typography>
                  </Stack>
                </MenuItem>
              );
            })}
            {/* {SHIFT_OPTIONS.map((shiftCode) => {
              const shiftStyle = shiftColorMap.get(shiftCode.charAt(0)) || { color: "#475569", background: "#F1F5F9" };
              
              return (
                <MenuItem key={shiftCode} value={shiftCode} sx={{ py: 1.5 }}>
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Box 
                      sx={{ 
                        width: 12, 
                        height: 12, 
                        borderRadius: "50%", 
                        bgcolor: shiftStyle.color,
                        boxShadow: `0 0 0 2px ${shiftStyle.background}`
                      }} 
                    />
                    <Typography variant="body2" fontWeight={500}>{shiftCode}</Typography>
                  </Stack>
                </MenuItem>
              );
            })} */}
          </Select>
        </FormControl>

        {/* reason input */}
        <Box sx={{ mt: 2 }}>
          <TextField
            label="Reason"
            fullWidth
            size="small"
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            error={!isReasonValid && reason !== ""}
            helperText={
              !isReasonValid && reason !== "" ? "Reason is required" : ""
            }
          />
        </Box>
      </DialogContent>

      <Divider />

      {/* ACTIONS */}
      <DialogActions sx={{ p: 2, px: 3, bgcolor: "#F8FAFC" }}>
        <Button
          onClick={onClose}
          variant="text"
          color="inherit"
          sx={{ fontWeight: 600, color: "text.secondary" }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          color="primary"
          disableElevation
          sx={{ fontWeight: 600, borderRadius: 1.5, px: 3 }}
          disabled={!selectedShift || saving || !isReasonValid}
        >
          {saving ? "Updating..." : "Confirm Update"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
