import {
  Box,
  Button,
  Chip,
  Dialog, DialogActions, DialogContent, DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { toast } from "react-toastify";
import { usePlanCabMutation } from "../../api/cabManagerApiSlice";

export function PlanCabModal({
  open,
  crqIds,
  onClose,
  onPlanned,
}: {
  open: boolean;
  crqIds: string[];
  onClose: () => void;
  onPlanned?: () => void;
}) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("16:00");
  const [type, setType] = useState<"Critical" | "Normal" | "Emergency">("Normal");

  const [planCab, { isLoading }] = usePlanCabMutation();

  const submit = async () => {
    if (!date || !time || crqIds.length === 0) return;
    try {
      const sessionDateTime = `${date} ${time}:00`;
      const result = await planCab({ crqIds, sessionDateTime, type }).unwrap();
      if (result.status === "Success") {
        toast.success(result.message);
        onPlanned?.();
        onClose();
      } else {
        toast.error(result.message);
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to plan CAB session.");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Plan CAB Session</DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
          Grouping <Box component="span" sx={{ color: "primary.main", fontWeight: 500 }}>{crqIds.length} CRQ(s)</Box> into a single CAB session for discussion.
        </Typography>

        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 1 }}>Selected CRQs</Typography>
          <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
            {crqIds.map((id) => (
              <Chip key={id} size="small" label={id} sx={{ fontFamily: "'Roboto Mono', monospace" }} />
            ))}
          </Stack>
        </Box>

        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <TextField
            fullWidth required
            type="date"
            label="Session date"
            InputLabelProps={{ shrink: true }}
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <TextField
            fullWidth required
            type="time"
            label="Session time"
            InputLabelProps={{ shrink: true }}
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </Stack>
        <TextField
          select fullWidth
          label="Session type"
          value={type}
          onChange={(e) => setType(e.target.value as typeof type)}
        >
          <MenuItem value="Normal">Normal</MenuItem>
          <MenuItem value="Critical">Critical</MenuItem>
          <MenuItem value="Emergency">Emergency</MenuItem>
        </TextField>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={submit} disabled={isLoading || !date || !time || crqIds.length === 0}>
          {isLoading ? "Creating…" : "Schedule CAB"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
