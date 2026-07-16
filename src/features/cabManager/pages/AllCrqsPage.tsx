import {
  Alert,
  Box,
  Button,
  Chip,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from "material-react-table";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useGetAllCrqsQuery } from "../api/cabManagerApiSlice";
import { AllCrqDetailDrawer } from "../components/shared/AllCrqDetailDrawer";
// import { NewCrqModal } from "../components/modals/NewCrqModal";
import { ImpactChip, SlaBar, StageChip, StatusChip } from "../components/shared/Chips";
import { errMsg } from "../components/shared/errMsg";
import { ASSIGN_CIRCLES, STAGES } from "../data/cabManager.mock";
import type {
  Circle, Crq, CrqFilters, CrqStage, Domain, ImpactCode,
} from "../types/types";

const DOMAINS: Domain[] = ["IP Core", "Optics", "Packet", "Embedded", "Mobility"];

const STAGE_FILTERS: { label: string; value: CrqStage | "all" }[] = [
  { label: "All Stages", value: "all" },
  ...STAGES.map((s) => ({ label: s, value: s as CrqStage })),
];

export function AllCrqsPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const [filters, setFilters] = useState<CrqFilters>({});
  const [selected, setSelected] = useState<string | null>(null);
  // const [openNew, setOpenNew] = useState(false);

  const { data, isLoading, isError, error, refetch } = useGetAllCrqsQuery(filters);

  const setF = <K extends keyof CrqFilters>(k: K, v: CrqFilters[K]) =>
    setFilters((f) => ({ ...f, [k]: v }));

  const hasActiveFilters = useMemo(
    () => Object.values(filters).some((v) => v !== undefined && v !== "" && v !== "all"),
    [filters]
  );

  const columns = useMemo<MRT_ColumnDef<Crq>[]>(
    () => [
      {
        accessorKey: "id",
        header: "CRQ ID",
        size: 130,
        Cell: ({ row }) => (
          <Box>
            <Typography sx={{ fontFamily: "'Roboto Mono', monospace", fontSize: 12.5, color: "primary.main", fontWeight: 500 }}>
              {row.original.id}
            </Typography>
            {row.original.assignedToMe && (
              <Typography sx={{ fontSize: 10, color: "#ED6C02", fontWeight: 600, letterSpacing: 0.3 }}>YOUR APPROVAL</Typography>
            )}
          </Box>
        ),
      },
      {
        accessorKey: "activity",
        header: "Activity",
        Cell: ({ row }) => (
          <Box>
            <Typography variant="body2">{row.original.activity}</Typography>
            <Typography variant="caption" sx={{ color: "text.secondary", fontFamily: "'Roboto Mono', monospace" }}>
              {row.original.hostname} · {row.original.technology}
            </Typography>
          </Box>
        ),
      },
      {
        accessorKey: "domain",
        header: "Domain",
        size: 150,
        Cell: ({ row }) => (
          <Box>
            <Typography variant="body2">{row.original.domain}</Typography>
            <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mt: 0.25 }}>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Circle {row.original.circle} ·
              </Typography>
              <ImpactChip impact={row.original.impact} />
            </Stack>
          </Box>
        ),
      },
      {
        accessorKey: "stage",
        header: "Stage",
        size: 130,
        filterVariant: "select",
        filterSelectOptions: [...STAGES],
        Cell: ({ cell }) => <StageChip stage={cell.getValue<CrqStage>()} />,
      },
      {
        accessorKey: "sla",
        header: "SLA",
        size: 130,
        Cell: ({ cell }) => <SlaBar sla={cell.getValue<number>()} />,
      },
      {
        accessorKey: "approver",
        header: "Approver",
        size: 130,
      },
      {
        accessorKey: "scheduled",
        header: "Scheduled",
        size: 120,
        Cell: ({ row }) => (
          <Box>
            <Typography variant="body2">{row.original.scheduled}</Typography>
            <Typography variant="caption" sx={{ color: "text.secondary", fontFamily: "'Roboto Mono', monospace" }}>
              {row.original.window}
            </Typography>
          </Box>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        size: 130,
        Cell: ({ cell }) => <StatusChip status={cell.getValue<Crq["status"]>()} />,
      },
      {
        id: "action",
        header: "Action",
        size: 70,
        enableSorting: false,
        muiTableHeadCellProps: { align: "right" },
        muiTableBodyCellProps: { align: "right" },
        Cell: ({ row }) => (
          <IconButton size="small" onClick={(e) => { e.stopPropagation(); navigate(`/cabmanager/journey/${row.original.id}`); }}>
            <MoreVertIcon fontSize="small" />
          </IconButton>
        ),
      },
    ],
    [navigate],
  );

  const table = useMaterialReactTable({
    columns,
    data: data ?? [],
    state: { isLoading },
    initialState: { density: "compact", pagination: { pageSize: 10, pageIndex: 0 } },
    enableTopToolbar: false,
    enableStickyHeader: true,
    paginationDisplayMode: "pages",
    muiTablePaperProps: { elevation: 0, sx: { boxShadow: "none" } },
    muiTableContainerProps: { sx: { maxHeight: "calc(100vh - 420px)", minHeight: 240 } },
    muiTableHeadCellProps: {
      sx: {
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.07em",
        textTransform: "uppercase",
        color: "text.secondary",
        py: 0.75,
        backgroundColor: isDark ? alpha(theme.palette.primary.main, 0.12) : theme.palette.grey[50],
        borderBottom: `1px solid ${theme.palette.divider}`,
      },
    },
    muiTableBodyCellProps: { sx: { py: 1, fontSize: 12.5 } },
    muiTableBodyRowProps: ({ row }) => ({
      hover: true,
      onClick: () => setSelected(row.original.id),
      sx: {
        cursor: "pointer",
        bgcolor: row.original.assignedToMe ? "rgba(237, 108, 2, 0.04)" : undefined,
        "&:hover td": { backgroundColor: alpha(theme.palette.primary.main, isDark ? 0.08 : 0.04) },
        transition: "background-color 100ms ease",
      },
    }),
    muiBottomToolbarProps: {
      sx: {
        borderTop: `1px solid ${theme.palette.divider}`,
        backgroundColor: isDark ? "rgba(255,255,255,0.02)" : theme.palette.grey[50],
        px: 1,
      },
    },
    muiPaginationProps: {
      shape: "rounded",
      size: "small",
      sx: { "& .MuiButtonBase-root": { fontSize: 12 } },
    },
  });

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
        <MaterialReactTable table={table} />
      </Paper>

      <AllCrqDetailDrawer crqId={selected} onClose={() => setSelected(null)} />
      {/* <NewCrqModal open={openNew} onClose={() => setOpenNew(false)} /> */}
    </Box>
  );
}
