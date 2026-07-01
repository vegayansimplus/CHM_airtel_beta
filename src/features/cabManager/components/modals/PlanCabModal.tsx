import {
  Alert,
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
import { usePlanCabMutation } from "../../api/cabManagerApiSlice";
import { errMsg } from "../shared/errMsg";

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
  const [type, setType] = useState<"Critical" | "Normal" | "Emergency">("Normal");
  const [host, setHost] = useState("Ravi Nair (NOC)");

  const [planCab, { isLoading, isError, error }] = usePlanCabMutation();

  const submit = async () => {
    if (!date || crqIds.length === 0) return;
    try {
      await planCab({ crqIds, date, type, host }).unwrap();
      onPlanned?.();
      onClose();
    } catch { /* error surfaced */ }
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

        <TextField
          fullWidth required
          type="date"
          label="Session date"
          InputLabelProps={{ shrink: true }}
          value={date}
          onChange={(e) => setDate(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          select fullWidth
          label="Session type"
          value={type}
          onChange={(e) => setType(e.target.value as typeof type)}
          sx={{ mb: 2 }}
        >
          <MenuItem value="Normal">Normal</MenuItem>
          <MenuItem value="Critical">Critical</MenuItem>
          <MenuItem value="Emergency">Emergency</MenuItem>
        </TextField>
        <TextField
          fullWidth
          label="Host"
          value={host}
          onChange={(e) => setHost(e.target.value)}
        />
        {isError && <Alert severity="error" sx={{ mt: 2 }}>{errMsg(error)}</Alert>}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={submit} disabled={isLoading || !date || crqIds.length === 0}>
          {isLoading ? "Creating…" : "Schedule CAB"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
