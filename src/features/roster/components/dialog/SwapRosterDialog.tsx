import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Stack,
  Divider,
} from "@mui/material";
import { useChangeShiftMutation } from "../../api/rosterApiSlice";

interface SwapRosterDialogProps {
  open: boolean;
  onClose: () => void;
  swapData: {
    cell1: { userId: string; date: string; shiftId: number; shiftDisplay: string };
    cell2: { userId: string; date: string; shiftId: number; shiftDisplay: string };
  } | null;
  onSwapSuccess: () => void;
}

export const SwapRosterDialog: React.FC<SwapRosterDialogProps> = ({
  open,
  onClose,
  swapData,
  onSwapSuccess,
}) => {
  const [reason, setReason] = useState("");
  const [changeShift, { isLoading }] = useChangeShiftMutation();

  const handleSave = async () => {
    if (!swapData || !reason.trim()) return;

    const { cell1, cell2 } = swapData;

    try {
      await useChangeShiftMutation({
        affectedUserId1: cell1.userId,
        shiftDate1: cell1.date,
        affectedUserId2: cell2.userId,
        shiftDate2: cell2.date,
        shiftSwapReason: reason.trim(),
      }).unwrap();

      onSwapSuccess();
      onClose();
      setReason("");
    } catch (error) {
      console.error("Failed to swap shifts", error);
      // You can add error handling here, e.g., show a snackbar
    }
  };

  const handleClose = () => {
    onClose();
    setReason("");
  };

  if (!swapData) return null;

  const { cell1, cell2 } = swapData;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Confirm Shift Swap</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          You are about to swap the following shifts:
        </Typography>

        <Stack spacing={2}>
          <Box>
            <Typography variant="subtitle2" fontWeight={600}>
              Employee 1: {cell1.userId}
            </Typography>
            <Typography variant="body2">
              Date: {cell1.date} | Current Shift: {cell1.shiftDisplay}
            </Typography>
            <Typography variant="body2" color="primary">
              Will get: {cell2.shiftDisplay}
            </Typography>
          </Box>

          <Divider />

          <Box>
            <Typography variant="subtitle2" fontWeight={600}>
              Employee 2: {cell2.userId}
            </Typography>
            <Typography variant="body2">
              Date: {cell2.date} | Current Shift: {cell2.shiftDisplay}
            </Typography>
            <Typography variant="body2" color="primary">
              Will get: {cell1.shiftDisplay}
            </Typography>
          </Box>

          <TextField
            label="Reason for Swap"
            multiline
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            fullWidth
            required
            placeholder="Please provide a reason for this shift swap..."
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={!reason.trim() || isLoading}
        >
          {isLoading ? "Swapping..." : "Confirm Swap"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};