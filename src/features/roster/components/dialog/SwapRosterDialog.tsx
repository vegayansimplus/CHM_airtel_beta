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
  Paper,
  CircularProgress,
  Grid,
} from "@mui/material";

interface CellData {
  userId: string;
  date: string;
  shiftId: number;
  shiftDisplay: string;
}

interface SwapRosterDialogProps {
  open: boolean;
  onClose: () => void;
  swapData: {
    cell1: CellData;
    cell2: CellData;
  } | null;
  onConfirm: (
    cell1: CellData,
    cell2: CellData,
    reason: string,
  ) => Promise<void>;
  onSwapSuccess: () => void;
}

const EmployeeShiftCard: React.FC<{
  title: string;
  userId: string;
  date: string;
  currentShift: string;
  newShift: string;
}> = ({ title, userId, date, currentShift, newShift }) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        transition: "all 0.2s ease",
        "&:hover": {
          boxShadow: 2,
        },
      }}
    >
      <Stack spacing={1}>
        <Typography variant="subtitle1" fontWeight={600}>
          {title}
        </Typography>

        <Typography variant="body2" color="text.secondary">
          Employee ID
        </Typography>

        <Typography variant="body1" fontWeight={500}>
          {userId}
        </Typography>

        <Divider sx={{ my: 1 }} />

        <Typography variant="body2">
          <strong>Date:</strong> {date}
        </Typography>

        <Typography variant="body2">
          <strong>Current Shift:</strong> {currentShift}
        </Typography>

        <Typography variant="body2" color="primary.main" fontWeight={500}>
          Will Receive: {newShift}
        </Typography>
      </Stack>
    </Paper>
  );
};

export const SwapRosterDialog: React.FC<SwapRosterDialogProps> = ({
  open,
  onClose,
  swapData,
  onConfirm,
  onSwapSuccess,
}) => {
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!swapData || !reason.trim()) return;

    const { cell1, cell2 } = swapData;
    setIsLoading(true);

    try {
      await onConfirm(cell1, cell2, reason.trim());
      onSwapSuccess();
      onClose();
      setReason("");
    } catch (error) {
      console.error("Failed to swap shifts", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    setReason("");
  };

  if (!swapData) return null;

  const { cell1, cell2 } = swapData;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      sx={{ borderRadius: 3, p: 1 }}
    >
      <DialogTitle sx={{ pb: 0 }}>
        <Typography variant="h6" fontWeight={600}>
          Confirm Shift Swap
        </Typography>

        <Typography variant="body2" color="text.secondary">
          Review the shift swap details before confirming.
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Stack spacing={3}>
          {/* Employee Cards */}
          <Grid container spacing={2}>
            <Grid 
            // item xs={12} md={6}
            size={{ xs: 12, md: 6 }}
            
            >
              <EmployeeShiftCard
                title="Employee 1"
                userId={cell1.userId}
                date={cell1.date}
                currentShift={cell1.shiftDisplay}
                newShift={cell2.shiftDisplay}
              />
            </Grid>

            <Grid 
            // item xs={12} md={6}
            size={{ xs: 12, md: 6 }}
            
            >
              <EmployeeShiftCard
                title="Employee 2"
                userId={cell2.userId}
                date={cell2.date}
                currentShift={cell2.shiftDisplay}
                newShift={cell1.shiftDisplay}
              />
            </Grid>
          </Grid>

          {/* Reason Field */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Reason for Swap
            </Typography>

            <TextField
              multiline
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              fullWidth
              required
              placeholder="Explain why this shift swap is needed..."
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            />
          </Box>
        </Stack>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 2, justifyContent: "space-between" }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          disabled={isLoading}
          sx={{ borderRadius: 2 }}
        >
          Cancel
        </Button>

        <Button
          onClick={handleSave}
          variant="contained"
          disabled={!reason.trim() || isLoading}
          sx={{
            borderRadius: 2,
            minWidth: 140,
          }}
        >
          {isLoading ? (
            <Stack direction="row" spacing={1} alignItems="center">
              <CircularProgress size={18} color="inherit" />
              <span>Swapping...</span>
            </Stack>
          ) : (
            "Confirm Swap"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
