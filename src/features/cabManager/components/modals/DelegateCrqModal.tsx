import {
  Alert,
  Box,
  Button,
  Dialog, DialogActions, DialogContent, DialogTitle,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import { useState } from "react";
import { useDelegateCrqMutation } from "../../api/cabManagerApiSlice";
import { APPROVERS } from "../../data/cabManager.mock";
import { errMsg } from "../shared/errMsg";

const DELEGATE_REASONS = ["On Leave", "Workload Management", "Technical Expertise Required", "Shift Change", "Emergency Support", "Incorrect approver mapped"];

export function DelegateCrqModal({ open, crqId, onClose }: { open: boolean; crqId: string | null; onClose: () => void }) {
  const [delegateTo, setDelegateTo] = useState("");
  const [reason, setReason] = useState("");
  const [delegate, { isLoading, isError, error }] = useDelegateCrqMutation();

  const submit = async () => {
    if (!crqId || !delegateTo || !reason) return;
    try {
      await delegate({ crqId, delegateTo, reason }).unwrap();
      setDelegateTo(""); setReason("");
      onClose();
    } catch { /* error surfaced */ }
  };

  return (
    <Dialog open={open && !!crqId} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={{ width: 40, height: 40, borderRadius: "50%", bgcolor: "#E3F2FD", color: "#1565C0", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <SwapHorizIcon />
          </Box>
          Delegate Approval
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
          Transfer approval responsibility for{" "}
          <Box component="span" sx={{ fontFamily: "'Roboto Mono', monospace", color: "primary.main", fontWeight: 500 }}>{crqId}</Box>.
          Delegation requires CTO/COH confirmation and is logged in the audit trail.
        </Typography>

        <TextField
          select fullWidth required
          label="Delegate to"
          value={delegateTo}
          onChange={(e) => setDelegateTo(e.target.value)}
          sx={{ mb: 2 }}
        >
          <MenuItem value="">— Select approver —</MenuItem>
          {APPROVERS.map((a) => (
            <MenuItem key={a.name} value={a.name}>{a.name} · {a.role} · {a.domain}</MenuItem>
          ))}
        </TextField>

        <TextField
          select fullWidth required
          label="Reason for delegation"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        >
          <MenuItem value="">— Select reason —</MenuItem>
          {DELEGATE_REASONS.map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
        </TextField>

        <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mt: 2 }}>
          Delegations remaining this month: <Box component="span" sx={{ color: "primary.main", fontWeight: 500 }}>2 of 2</Box>
        </Typography>

        {isError && <Alert severity="error" sx={{ mt: 2 }}>{errMsg(error)}</Alert>}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={submit} disabled={isLoading || !delegateTo || !reason}>
          {isLoading ? "Delegating…" : "Confirm Delegation"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
