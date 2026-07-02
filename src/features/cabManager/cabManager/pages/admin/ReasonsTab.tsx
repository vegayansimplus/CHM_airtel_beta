import {
  Box,
  Chip,
  MenuItem,
  Paper,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useGetRejectionReasonsQuery } from "../../api/cabManagerApiSlice";
import { REJECTION_STAGES } from "../../data/cabManager.mock";

export function AdminReasonsTab() {
  const [stage, setStage] = useState(REJECTION_STAGES[0]);
  const { data, isLoading } = useGetRejectionReasonsQuery(stage);

  return (
    <Paper sx={{ p: 3, maxWidth: 720, border: "1px solid", borderColor: "divider" }} elevation={0}>
      <Typography sx={{ fontWeight: 500, mb: 0.5 }}>Rejection Reason Configuration</Typography>
      <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 2 }}>
        Define, activate, or deactivate rejection reasons mapped to each approval stage.
      </Typography>

      <TextField
        select
        label="Stage mapping"
        value={stage}
        onChange={(e) => setStage(e.target.value)}
        sx={{ width: 320, mb: 3 }}
      >
        {REJECTION_STAGES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
      </TextField>

      {isLoading ? (
        <Skeleton variant="rounded" height={220} />
      ) : (
        <Stack divider={<Box sx={{ borderBottom: "1px solid", borderColor: "divider" }} />} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1.5, overflow: "hidden" }}>
          {data?.map((r) => (
            <Stack key={r.reason} direction="row" justifyContent="space-between" alignItems="center" sx={{ p: 1.5 }}>
              <Typography variant="body2">{r.reason}</Typography>
              <Chip
                size="small"
                label={r.active ? "Active" : "Inactive"}
                sx={{
                  bgcolor: r.active ? "#E8F5E9" : "#F5F5F5",
                  color:   r.active ? "#2E7D32" : "rgba(0,0,0,0.55)",
                  fontWeight: 500,
                }}
              />
            </Stack>
          ))}
        </Stack>
      )}
    </Paper>
  );
}
