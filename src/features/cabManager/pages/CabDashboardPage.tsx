import { useMemo } from "react";
import {
  Alert,
  Box,
  Button,
  LinearProgress,
  Paper,
  Skeleton,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from "material-react-table";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import { useNavigate } from "react-router";
import { useGetDashboardQuery } from "../api/cabManagerApiSlice";
import { SlaBar, StageChip } from "../components/shared/Chips";
import { errMsg } from "../components/shared/errMsg";
import type { Crq } from "../types/types";

export function CabDashboardPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const { data, isLoading, isError, error, refetch } = useGetDashboardQuery();

  const columns = useMemo<MRT_ColumnDef<Crq>[]>(
    () => [
      {
        accessorKey: "id",
        header: "CRQ ID",
        size: 110,
        Cell: ({ cell }) => (
          <Typography sx={{ fontFamily: "'Roboto Mono', monospace", fontSize: 12.5, color: "primary.main", fontWeight: 500 }}>
            {cell.getValue<string>()}
          </Typography>
        ),
      },
      {
        accessorKey: "activity",
        header: "Activity",
        Cell: ({ row }) => (
          <Box>
            <Typography variant="body2">{row.original.activity}</Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {row.original.domain} · Circle {row.original.circle}
            </Typography>
          </Box>
        ),
      },
      {
        accessorKey: "stage",
        header: "Stage",
        size: 130,
        Cell: ({ cell }) => <StageChip stage={cell.getValue<Crq["stage"]>()} />,
      },
      {
        accessorKey: "sla",
        header: "SLA",
        size: 130,
        Cell: ({ cell }) => <SlaBar sla={cell.getValue<number>()} />,
      },
      {
        accessorKey: "scheduled",
        header: "Scheduled",
        size: 100,
      },
      {
        id: "action",
        header: "Action",
        size: 90,
        enableSorting: false,
        muiTableHeadCellProps: { align: "right" },
        muiTableBodyCellProps: { align: "right" },
        Cell: ({ row }) => (
          <Button
            size="small"
            variant="contained"
            onClick={(e) => { e.stopPropagation(); navigate(`/cabmanager/journey/${row.original.id}`); }}
          >
            Open
          </Button>
        ),
      },
    ],
    [navigate],
  );

  const table = useMaterialReactTable({
    columns,
    data: data?.actionQueue ?? [],
    enableTopToolbar: false,
    enableBottomToolbar: false,
    enablePagination: false,
    enableSorting: false,
    enableColumnActions: false,
    initialState: { density: "compact" },
    muiTablePaperProps: { elevation: 0, sx: { boxShadow: "none" } },
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
      onClick: () => navigate(`/cabmanager/journey/${row.original.id}`),
      sx: {
        cursor: "pointer",
        "&:hover td": { backgroundColor: alpha(theme.palette.primary.main, isDark ? 0.08 : 0.04) },
        transition: "background-color 100ms ease",
      },
    }),
  });

  if (isError) {
    return (
      <Alert
        severity="error"
        action={<Button color="inherit" size="small" onClick={() => void refetch()}>Retry</Button>}
      >
        {errMsg(error)}
      </Alert>
    );
  }

  if (isLoading || !data) {
    return (
      <Stack spacing={2}>
        <Skeleton variant="rounded" height={88} />
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 2 }}>
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} variant="rounded" height={96} />)}
        </Box>
        <Skeleton variant="rounded" height={280} />
      </Stack>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 500, letterSpacing: "-0.3px" }}>{data.title}</Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>{data.subtitle}</Typography>
      </Box>

      {/* KPI tiles */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 2, mb: 3 }}>
        {data.kpis.map((k) => (
          <Paper key={k.label} sx={{ p: 2.25, border: "1px solid", borderColor: "divider" }} elevation={0}>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>{k.label}</Typography>
            <Typography sx={{ fontSize: 28, fontWeight: 400, letterSpacing: "-0.5px", lineHeight: 1.1, mt: 0.5 }}>{k.value}</Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>{k.foot}</Typography>
          </Paper>
        ))}
      </Box>

      {/* Pipeline + SLA watch */}
      <Box sx={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 2, mb: 3 }}>
        <Paper sx={{ p: 2.5, border: "1px solid", borderColor: "divider" }} elevation={0}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography sx={{ fontWeight: 500 }}>Change pipeline — by stage</Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>{data.totalCount} total</Typography>
          </Box>
          <Stack spacing={1.5}>
            {data.stageBars.map((b) => (
              <Box key={b.stage}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                  <StageChip stage={b.stage} />
                  <Typography variant="caption" sx={{ color: "text.secondary", fontFamily: "'Roboto Mono', monospace" }}>{b.count}</Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={b.pct}
                  sx={{ height: 8, borderRadius: 1, bgcolor: "rgba(0,0,0,0.05)" }}
                />
              </Box>
            ))}
          </Stack>
        </Paper>

        <Paper sx={{ p: 2.5, border: "1px solid", borderColor: "divider" }} elevation={0}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
            <WarningAmberRoundedIcon sx={{ color: "error.main", fontSize: 20 }} />
            <Typography sx={{ fontWeight: 500 }}>CAB SLA watch</Typography>
          </Stack>
          {data.escalations.length === 0 ? (
            <Typography variant="body2" sx={{ color: "text.secondary", py: 4, textAlign: "center" }}>
              No SLA breaches right now.
            </Typography>
          ) : (
            <Stack>
              {data.escalations.map((e) => (
                <Box
                  key={e.id}
                  onClick={() => navigate(`/cabmanager/journey/${e.id}`)}
                  sx={{
                    display: "flex", alignItems: "center", gap: 1.5,
                    py: 1.25, cursor: "pointer", borderBottom: "1px solid", borderColor: "divider",
                    "&:hover": { bgcolor: "action.hover" },
                  }}
                >
                  <Box sx={{
                    width: 38, height: 38, borderRadius: 1.5,
                    bgcolor: "#FDECEA", color: "#D32F2F",
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  }}>
                    <Typography sx={{ fontSize: 13, fontWeight: 500, fontFamily: "'Roboto Mono', monospace" }}>{e.sla}</Typography>
                    <Typography sx={{ fontSize: 8, letterSpacing: 0.5 }}>SLA</Typography>
                  </Box>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography sx={{ fontFamily: "'Roboto Mono', monospace", fontSize: 12.5, color: "primary.main", fontWeight: 500 }}>{e.id}</Typography>
                    <Typography variant="body2" sx={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{e.activity}</Typography>
                  </Box>
                </Box>
              ))}
            </Stack>
          )}
        </Paper>
      </Box>

      {/* Action queue */}
      <Paper sx={{ border: "1px solid", borderColor: "divider", overflow: "hidden" }} elevation={0}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 2, borderBottom: "1px solid", borderColor: "divider" }}>
          <Typography sx={{ fontWeight: 500 }}>{data.actionQueueTitle}</Typography>
          <Button size="small" onClick={() => navigate("/cabmanager/allcrqs")}>View all</Button>
        </Box>
        <MaterialReactTable table={table} />
      </Paper>
    </Box>
  );
}
