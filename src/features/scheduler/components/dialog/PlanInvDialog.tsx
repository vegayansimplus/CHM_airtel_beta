import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  TextField,
  Stack,
  Chip,
} from "@mui/material";

interface PlanInvDialogProps {
  open: boolean;
  onClose: () => void;
  crq: any;
  colors: any;
  onSubmit?: (data: {
    crqNo: string;
    status: string;
    comments: string;
  }) => void;
}

export const PlanInvDialog: React.FC<PlanInvDialogProps> = ({
  open,
  onClose,
  crq,
  colors,
  onSubmit,
}) => {
  const [status, setStatus] = useState<"Approved" | "Rejected" | "">("");
  const [comments, setComments] = useState("");

  const handleSubmit = () => {
    if (!crq) return;

    onSubmit?.({
      crqNo: crq.crqNo,
      status,
      comments,
    });

    onClose();
    setStatus("");
    setComments("");
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "12px",
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          fontWeight: 700,
          fontSize: 16,
          borderBottom: `1px solid ${colors.border}`,
        }}
      >
        CRQ Review
      </DialogTitle>

      {/* Content */}
      <DialogContent sx={{ py: 2.5 }}>
        {!crq ? (
          <Typography>No CRQ selected</Typography>
        ) : (
          <Stack spacing={2}>
            {/* CRQ Info */}
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
                CRQ No:
              </Typography>
              <Chip
                label={crq.crqNo}
                size="small"
                sx={{
                  fontWeight: 700,
                  bgcolor: colors.accentDim,
                  color: colors.accent,
                }}
              />
            </Stack>

            {/* Status Selection */}
            <Stack direction="row" spacing={1}>
              <Chip
                label="Approve"
                clickable
                onClick={() => setStatus("Approved")}
                color={status === "Approved" ? "success" : "default"}
                variant={status === "Approved" ? "filled" : "outlined"}
              />
              <Chip
                label="Reject"
                clickable
                onClick={() => setStatus("Rejected")}
                color={status === "Rejected" ? "error" : "default"}
                variant={status === "Rejected" ? "filled" : "outlined"}
              />
            </Stack>

            {/* Comments */}
            <TextField
              label="Comments"
              multiline
              minRows={3}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Enter review comments..."
              fullWidth
            />
          </Stack>
        )}
      </DialogContent>

      {/* Actions */}
      <DialogActions
        sx={{
          px: 2,
          py: 1.5,
          borderTop: `1px solid ${colors.border}`,
        }}
      >
        <Button onClick={onClose}>Cancel</Button>

        <Button
          variant="contained"
          disabled={!status}
          onClick={handleSubmit}
        >
          Submit Review
        </Button>
      </DialogActions>
    </Dialog>
  );
};