import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Paper,
  Skeleton,
  Stack,
  Table, TableBody, TableCell, TableHead, TableRow,
  Typography,
} from "@mui/material";
import EventNoteIcon from "@mui/icons-material/EventNote";
import { useMemo, useState } from "react";
import { useGetCabPlanDatesQuery, useGetCabQueueQuery } from "../api/cabManagerApiSlice";
import { PlanCabModal } from "../components/modals/PlanCabModal";
import { ImpactChip } from "../components/shared/Chips";
import { errMsg } from "../components/shared/errMsg";

export function CabPlanningPage() {
  const queue = useGetCabQueueQuery();
  const dates = useGetCabPlanDatesQuery();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [openPlan, setOpenPlan] = useState(false);

  const toggle = (id: string) => setSelected((s) => {
    const next = new Set(s);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const allIds = useMemo(() => queue.data?.map((r) => r.id) ?? [], [queue.data]);
  const allChecked = allIds.length > 0 && allIds.every((id) => selected.has(id));
  const someChecked = allIds.some((id) => selected.has(id)) && !allChecked;
  const toggleAll = (checked: boolean) => setSelected(checked ? new Set(allIds) : new Set());

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 500, letterSpacing: "-0.3px" }}>CAB Planning</Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
          Shortlist CRQs awaiting CAB review and group them into a scheduled session.
        </Typography>
      </Box>

      {/* Waiting Queue */}
      <Paper sx={{ mb: 3, border: "1px solid", borderColor: "divider", overflow: "hidden" }} elevation={0}>
        <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography sx={{ fontWeight: 500 }}>CAB Waiting Queue</Typography>
          {selected.size > 0 && (
            <Button variant="contained" startIcon={<EventNoteIcon />} onClick={() => setOpenPlan(true)}>
              Plan CAB · {selected.size} selected
            </Button>
          )}
        </Box>

        {queue.isError && (
          <Alert
            severity="error"
            action={<Button color="inherit" size="small" onClick={() => void queue.refetch()}>Retry</Button>}
          >
            {errMsg(queue.error)}
          </Alert>
        )}

        {queue.isLoading ? (
          <Box sx={{ p: 2 }}><Skeleton variant="rounded" height={280} /></Box>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "#FAFAFA" }}>
                <TableCell padding="checkbox">
                  <Checkbox checked={allChecked} indeterminate={someChecked} onChange={(e) => toggleAll(e.target.checked)} />
                </TableCell>
                <TableCell>CRQ / Activity</TableCell>
                <TableCell>Impact</TableCell>
                <TableCell>B2B</TableCell>
                <TableCell>Criticality</TableCell>
                <TableCell>Domain</TableCell>
                <TableCell>Execution Window</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {queue.data?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6, color: "text.secondary" }}>No CRQs awaiting CAB review.</TableCell>
                </TableRow>
              ) : (
                queue.data?.map((r) => {
                  const checked = selected.has(r.id);
                  return (
                    <TableRow key={r.id} hover selected={checked} sx={{ cursor: "pointer" }} onClick={() => toggle(r.id)}>
                      <TableCell padding="checkbox"><Checkbox checked={checked} onChange={() => toggle(r.id)} /></TableCell>
                      <TableCell>
                        <Typography sx={{ fontFamily: "'Roboto Mono', monospace", color: "primary.main", fontWeight: 500, fontSize: 12.5 }}>{r.id}</Typography>
                        <Typography variant="body2">{r.activity}</Typography>
                      </TableCell>
                      <TableCell><ImpactChip impact={r.impact} /></TableCell>
                      <TableCell>
                        <Typography variant="caption" sx={{ color: r.b2b ? "primary.main" : "text.secondary", fontWeight: 500 }}>
                          {r.b2b ? "Yes" : "No"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={r.critical}
                          sx={{
                            bgcolor: r.critical === "Critical" ? "#FDECEA" : r.critical === "Moderate" ? "#FFF4E5" : "#E8F5E9",
                            color:   r.critical === "Critical" ? "#C62828" : r.critical === "Moderate" ? "#ED6C02" : "#2E7D32",
                            fontWeight: 500,
                          }}
                        />
                      </TableCell>
                      <TableCell>{r.domain}</TableCell>
                      <TableCell sx={{ fontFamily: "'Roboto Mono', monospace", fontSize: 12, color: "text.secondary" }}>{r.window}</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        )}
      </Paper>

      {/* Date-wise CAB plan */}
      <Box sx={{ mb: 2 }}>
        <Typography sx={{ fontWeight: 500 }}>Date-wise CAB Meeting Plan</Typography>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          One CAB call per date — grouped CRQs reviewed together by the CAB Engineer.
        </Typography>
      </Box>

      {dates.isLoading ? (
        <Skeleton variant="rounded" height={180} />
      ) : (
        <Stack spacing={1.5}>
          {dates.data?.map((d) => (
            <Stack key={d.sessionId} direction="row" spacing={2}>
              <Paper sx={{
                width: 84, p: 1.5, textAlign: "center",
                bgcolor: d.type === "Critical" ? "#FDECEA" : d.type === "Emergency" ? "#FFF4E5" : "#E3F2FD",
                color:   d.type === "Critical" ? "#C62828" : d.type === "Emergency" ? "#ED6C02" : "#1565C0",
                border: "1px solid", borderColor: "divider", flexShrink: 0,
              }} elevation={0}>
                <Typography variant="caption" sx={{ fontWeight: 600, letterSpacing: 0.5 }}>{d.dayName}</Typography>
                <Typography sx={{ fontSize: 28, fontWeight: 500 }}>{d.dayNum}</Typography>
                <Typography variant="caption" sx={{ fontWeight: 600, letterSpacing: 0.5 }}>{d.monthName}</Typography>
              </Paper>
              <Paper sx={{ flex: 1, p: 2, border: "1px solid", borderColor: "divider", borderLeft: "3px solid", borderLeftColor: d.type === "Critical" ? "#C62828" : "primary.main" }} elevation={0}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                  <Typography sx={{ fontFamily: "'Roboto Mono', monospace", color: "primary.main", fontWeight: 500 }}>{d.sessionId}</Typography>
                  <Chip size="small" label={d.type} />
                  <Typography variant="caption" sx={{ color: "text.secondary", ml: 1 }}>{d.crqIds?.length ?? 0} CRQs</Typography>
                </Stack>
                <Stack direction="row" spacing={0.5} flexWrap="wrap">
                  {(d.crqIds ?? []).map((id) => (
                    <Chip key={id} size="small" label={id} variant="outlined" sx={{ fontFamily: "'Roboto Mono', monospace", fontSize: 11 }} />
                  ))}
                </Stack>
              </Paper>
            </Stack>
          ))}
        </Stack>
      )}

      <PlanCabModal open={openPlan} crqIds={[...selected]} onClose={() => setOpenPlan(false)} onPlanned={() => setSelected(new Set())} />
    </Box>
  );
}
