import {
  Alert,
  Box,
  Button,
  Paper,
  Skeleton,
  Stack,
  Table, TableBody, TableCell, TableHead, TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import PersonAddAlt1OutlinedIcon from "@mui/icons-material/PersonAddAlt1Outlined";
import EngineeringOutlinedIcon from "@mui/icons-material/EngineeringOutlined";
import { useState } from "react";
import { useGetMyCrqsQuery } from "../api/cabManagerApiSlice";
import { MyCrqDetailDrawer } from "../components/shared/MyCrqDetailDrawer";
import { StageChip } from "../components/shared/Chips";
import { errMsg } from "../components/shared/errMsg";

export function MyCrqsPage() {
  const { data, isLoading, isError, error, refetch } = useGetMyCrqsQuery();
  const [selected, setSelected] = useState<string | null>(null);

  if (isError) {
    return <Alert severity="error" action={<Button color="inherit" size="small" onClick={() => void refetch()}>Retry</Button>}>{errMsg(error)}</Alert>;
  }
  if (isLoading || !data) {
    return <Stack spacing={2}><Skeleton variant="rounded" height={88} /><Skeleton variant="rounded" height={400} /></Stack>;
  }

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 500, letterSpacing: "-0.3px" }}>{data.title}</Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>{data.subtitle}</Typography>
      </Box>

      {/* Stats */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2, mb: 3, maxWidth: 720 }}>
        {[
          { icon: <HourglassEmptyIcon />, label: "Awaiting your action", value: data.stats.awaitingMe, color: "#ED6C02", bg: "#FFF4E5" },
          { icon: <CheckCircleOutlineIcon />, label: "Approved this week",  value: data.stats.approvedThisWeek, color: "#2E7D32", bg: "#E8F5E9" },
          { icon: <CancelOutlinedIcon />, label: "Rejected this week",  value: data.stats.rejectedThisWeek, color: "#D32F2F", bg: "#FDECEA" },
        ].map((s) => (
          <Paper key={s.label} sx={{ p: 2, display: "flex", alignItems: "center", gap: 2, border: "1px solid", borderColor: "divider" }} elevation={0}>
            <Box sx={{ width: 42, height: 42, borderRadius: 1.5, bgcolor: s.bg, color: s.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {s.icon}
            </Box>
            <Box>
              <Typography sx={{ fontSize: 24, fontWeight: 400 }}>{s.value}</Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>{s.label}</Typography>
            </Box>
          </Paper>
        ))}
      </Box>

      {/* Table */}
      <Paper sx={{ border: "1px solid", borderColor: "divider", overflow: "hidden" }} elevation={0}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: "#FAFAFA" }}>
              <TableCell>CRQ ID</TableCell>
              <TableCell>Activity</TableCell>
              <TableCell>Stage</TableCell>
              <TableCell>Scheduled</TableCell>
              <TableCell>SPOC</TableCell>
              <TableCell>Field Engineer</TableCell>
              <TableCell align="right">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.rows.length === 0 ? (
              <TableRow><TableCell colSpan={7} align="center" sx={{ py: 6, color: "text.secondary" }}>No CRQs assigned to you right now.</TableCell></TableRow>
            ) : (
              data.rows.map((r) => (
                <TableRow key={r.id} hover sx={{ cursor: "pointer" }} onClick={() => setSelected(r.id)}>
                  <TableCell sx={{ fontFamily: "'Roboto Mono', monospace", color: "primary.main", fontWeight: 500 }}>
                    {r.id}
                    <Typography variant="caption" sx={{ display: "block", color: "text.secondary" }}>{r.domain} · {r.circle}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{r.activity}</Typography>
                    <Typography variant="caption" sx={{ color: "text.secondary", fontFamily: "'Roboto Mono', monospace" }}>{r.hostname}</Typography>
                  </TableCell>
                  <TableCell><StageChip stage={r.stage} /></TableCell>
                  <TableCell>
                    <Typography variant="body2">{r.scheduled}</Typography>
                    <Typography variant="caption" sx={{ color: "text.secondary", fontFamily: "'Roboto Mono', monospace" }}>{r.window}</Typography>
                  </TableCell>
                  <TableCell>{r.spoc ?? <Typography variant="caption" sx={{ color: "text.secondary" }}>Unassigned</Typography>}</TableCell>
                  <TableCell>{r.fieldEngineer ?? <Typography variant="caption" sx={{ color: "text.secondary" }}>Unassigned</Typography>}</TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                      <Tooltip title="View only">
                        <span>
                          <Button size="small" variant="outlined" startIcon={<PersonAddAlt1OutlinedIcon />} disabled>
                            Re-assign SPOC
                          </Button>
                        </span>
                      </Tooltip>
                      <Tooltip title="View only">
                        <span>
                          <Button size="small" variant="outlined" startIcon={<EngineeringOutlinedIcon />} disabled>
                            Re-assign FE
                          </Button>
                        </span>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>

      <MyCrqDetailDrawer crqId={selected} onClose={() => setSelected(null)} />
    </Box>
  );
}
