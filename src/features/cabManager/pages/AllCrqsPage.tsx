import {
  Alert,
  Box,
  Button,
  Chip,
  IconButton,
  MenuItem,
  Paper,
  Skeleton,
  Stack,
  Table, TableBody, TableCell, TableHead, TableRow,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useGetAllCrqsQuery } from "../api/cabManagerApiSlice";
import { CrqDetailDrawer } from "../components/shared/CrqDetailDrawer";
import { NewCrqModal } from "../components/modals/NewCrqModal";
import { ImpactChip, SlaBar, StageChip, StatusChip } from "../components/shared/Chips";
import { errMsg } from "../components/shared/errMsg";
import { ASSIGN_CIRCLES, STAGES } from "../data/cabManager.mock";
import type {
  Circle, CrqFilters, CrqStage, Domain, ImpactCode,
} from "../types/types";

const DOMAINS: Domain[] = ["IP Core", "Optics", "Packet", "Embedded", "Mobility"];

const STAGE_FILTERS: { label: string; value: CrqStage | "all" }[] = [
  { label: "All Stages", value: "all" },
  ...STAGES.map((s) => ({ label: s, value: s as CrqStage })),
];

export function AllCrqsPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<CrqFilters>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [openNew, setOpenNew] = useState(false);

  const { data, isLoading, isError, error, refetch } = useGetAllCrqsQuery(filters);

  const setF = <K extends keyof CrqFilters>(k: K, v: CrqFilters[K]) =>
    setFilters((f) => ({ ...f, [k]: v }));

  const hasActiveFilters = useMemo(
    () => Object.values(filters).some((v) => v !== undefined && v !== "" && v !== "all"),
    [filters]
  );

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={3} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 500, letterSpacing: "-0.3px" }}>All CRQs</Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
            Track every change request across domains, circles, and stages of the approval workflow.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5} flexShrink={0}>
          <Button variant="outlined" startIcon={<FileDownloadOutlinedIcon />}>Export</Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenNew(true)}>
            New CRQ
          </Button>
        </Stack>
      </Stack>

      <Paper sx={{ border: "1px solid", borderColor: "divider", overflow: "hidden" }} elevation={0}>
        {/* Filter bar */}
        <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider", display: "flex", flexWrap: "wrap", gap: 1.5, alignItems: "center" }}>
          <Stack direction="row" spacing={0.5}>
            {STAGE_FILTERS.map((s) => {
              const active = (filters.stage ?? "all") === s.value;
              return (
                <Chip
                  key={s.value}
                  label={s.label}
                  size="small"
                  onClick={() => setF("stage", s.value)}
                  variant={active ? "filled" : "outlined"}
                  color={active ? "primary" : "default"}
                />
              );
            })}
          </Stack>
          <Box sx={{ width: 1, height: 20, bgcolor: "divider", mx: 0.5 }} />
          <TextField select size="small" label="Domain" value={filters.domain ?? "all"} onChange={(e) => setF("domain", e.target.value as Domain)} sx={{ minWidth: 140 }}>
            <MenuItem value="all">All Domains</MenuItem>
            {DOMAINS.map((d) => <MenuItem key={d} value={d}>{d}</MenuItem>)}
          </TextField>
          <TextField select size="small" label="Circle" value={filters.circle ?? "all"} onChange={(e) => setF("circle", e.target.value as Circle)} sx={{ minWidth: 130 }}>
            <MenuItem value="all">All Circles</MenuItem>
            {ASSIGN_CIRCLES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
          </TextField>
          <TextField select size="small" label="Impact" value={filters.impact ?? "all"} onChange={(e) => setF("impact", e.target.value as ImpactCode)} sx={{ minWidth: 120 }}>
            <MenuItem value="all">All Impact</MenuItem>
            <MenuItem value="SA">SA — Service Affecting</MenuItem>
            <MenuItem value="NSA">NSA — Non Service Affecting</MenuItem>
          </TextField>
          <TextField select size="small" label="Status" value={filters.status ?? "all"} onChange={(e) => setF("status", e.target.value as CrqFilters["status"])} sx={{ minWidth: 140 }}>
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="active">Active CRQs</MenuItem>
            <MenuItem value="escalated">Escalated CRQs</MenuItem>
            <MenuItem value="delegated">Delegated CRQs</MenuItem>
            <MenuItem value="rejected">Rejected CRQs</MenuItem>
          </TextField>
          <TextField size="small" placeholder="Search CRQ, hostname, approver…" value={filters.search ?? ""} onChange={(e) => setF("search", e.target.value)} sx={{ minWidth: 240, flex: 1 }} />
          {hasActiveFilters && (
            <Button size="small" onClick={() => setFilters({})}>Clear</Button>
          )}
          <Typography variant="caption" sx={{ color: "text.secondary", ml: "auto" }}>
            <Box component="span" sx={{ fontWeight: 500, color: "text.primary" }}>{data?.length ?? 0}</Box> of {data?.length ?? 0} CRQs
          </Typography>
        </Box>

        {/* Errors */}
        {isError && (
          <Alert
            severity="error"
            action={<Button color="inherit" size="small" onClick={() => void refetch()}>Retry</Button>}
          >
            {errMsg(error)}
          </Alert>
        )}

        {/* Table */}
        {isLoading ? (
          <Box sx={{ p: 2 }}>
            <Stack spacing={1}>
              {[0, 1, 2, 3, 4].map((i) => <Skeleton key={i} variant="rounded" height={56} />)}
            </Stack>
          </Box>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "#FAFAFA" }}>
                <TableCell>CRQ ID</TableCell>
                <TableCell>Activity</TableCell>
                <TableCell>Domain</TableCell>
                <TableCell>Stage</TableCell>
                <TableCell>SLA</TableCell>
                <TableCell>Approver</TableCell>
                <TableCell>Scheduled</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data?.map((r) => (
                <TableRow
                  key={r.id}
                  hover
                  onClick={() => setSelected(r.id)}
                  sx={{
                    cursor: "pointer",
                    bgcolor: r.assignedToMe ? "rgba(237, 108, 2, 0.04)" : undefined,
                  }}
                >
                  <TableCell sx={{ fontFamily: "'Roboto Mono', monospace", color: "primary.main", fontWeight: 500 }}>
                    {r.id}
                    {r.assignedToMe && (
                      <Typography sx={{ fontSize: 10, color: "#ED6C02", fontWeight: 600, letterSpacing: 0.3 }}>YOUR APPROVAL</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{r.activity}</Typography>
                    <Typography variant="caption" sx={{ color: "text.secondary", fontFamily: "'Roboto Mono', monospace" }}>
                      {r.hostname} · {r.technology}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Box>
                        <Typography variant="body2">{r.domain}</Typography>
                        <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mt: 0.25 }}>
                          <Typography variant="caption" sx={{ color: "text.secondary" }}>
                            Circle {r.circle} ·
                          </Typography>
                          <ImpactChip impact={r.impact} />
                        </Stack>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell><StageChip stage={r.stage} /></TableCell>
                  <TableCell><SlaBar sla={r.sla} /></TableCell>
                  <TableCell>{r.approver}</TableCell>
                  <TableCell>
                    <Typography variant="body2">{r.scheduled}</Typography>
                    <Typography variant="caption" sx={{ color: "text.secondary", fontFamily: "'Roboto Mono', monospace" }}>{r.window}</Typography>
                  </TableCell>
                  <TableCell><StatusChip status={r.status} /></TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); navigate(`/cabmanager/journey/${r.id}`); }}>
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      <CrqDetailDrawer crqId={selected} onClose={() => setSelected(null)} />
      <NewCrqModal open={openNew} onClose={() => setOpenNew(false)} />
    </Box>
  );
}
