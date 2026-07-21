import {
  Alert,
  Box,
  Button,
  Chip,
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
  type MRT_RowSelectionState,
} from "material-react-table";
import EventNoteIcon from "@mui/icons-material/EventNote";
import { useMemo, useState } from "react";
import { authStorage } from "../../../app/store/auth.storage";
import OrgHierarchyFilters from "../../orgHierarchy/components/OrgHierarchyFiltersV2";
import { useOrgHierarchyState } from "../../orgHierarchy/hooks/useOrgHierarchyState";
import { useOrgHierarchyFilters } from "../../orgHierarchy/hooks/useOrgHierarchyFilters";
import { useGetCabPlanDatesQuery, useGetCabQueueQuery } from "../api/cabManagerApiSlice";
import { PlanCabModal } from "../components/modals/PlanCabModal";
import { ImpactChip } from "../components/shared/Chips";
import { errMsg } from "../components/shared/errMsg";
import type { CabQueueRow } from "../types/types";

export function CabPlanningPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const roleCode = authStorage.getUser()?.roleCode ?? "TEAM_MEMBER";
  const { values, handleChange } = useOrgHierarchyState();
  const { options } = useOrgHierarchyFilters(values);

  const shouldFetch = Boolean(values.domain && values.subDomain);
  const queue = useGetCabQueueQuery(
    { domainId: values.domain!, subDomainId: values.subDomain! },
    { skip: !shouldFetch }
  );
  const dates = useGetCabPlanDatesQuery();
  const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({});
  const [openPlan, setOpenPlan] = useState(false);
  const selected = useMemo(
    () => Object.keys(rowSelection).filter((k) => rowSelection[k]),
    [rowSelection]
  );

  const columns = useMemo<MRT_ColumnDef<CabQueueRow>[]>(
    () => [
      {
        accessorKey: "crqNo",
        header: "CRQ No",
        size: 150,
        Cell: ({ row }) => (
          <Typography sx={{ fontFamily: "'Roboto Mono', monospace", color: "primary.main", fontWeight: 500, fontSize: 12.5 }}>
            {row.original.crqNo}
          </Typography>
        ),
      },
      {
        accessorKey: "impact",
        header: "Impact",
        size: 100,
        Cell: ({ row }) => <ImpactChip impact={row.original.impact} />,
      },
      { accessorKey: "circle", header: "Circle", size: 130 },
      { accessorKey: "domain", header: "Domain", size: 130 },
      {
        accessorKey: "executionWindow",
        header: "Execution Window",
        size: 160,
        Cell: ({ row }) => (
          <Typography sx={{ fontFamily: "'Roboto Mono', monospace", fontSize: 12, color: "text.secondary" }}>
            {row.original.executionWindow}
          </Typography>
        ),
      },
    ],
    []
  );

  const table = useMaterialReactTable({
    columns,
    data: queue.data ?? [],
    getRowId: (row) => row.crqNo,
    state: { isLoading: queue.isLoading, rowSelection },
    onRowSelectionChange: setRowSelection,
    enableRowSelection: true,
    initialState: { density: "compact", pagination: { pageSize: 10, pageIndex: 0 } },
    enableTopToolbar: false,
    enableStickyHeader: true,
    paginationDisplayMode: "pages",
    muiTablePaperProps: { elevation: 0, sx: { boxShadow: "none" } },
    muiTableContainerProps: { sx: { maxHeight: 420, minHeight: 160 } },
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
    muiTableBodyRowProps: { hover: true, sx: { cursor: "pointer" } },
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
    renderEmptyRowsFallback: () => (
      <Box sx={{ py: 6, textAlign: "center", color: "text.secondary", width: "100%" }}>
        No CRQs awaiting CAB review.
      </Box>
    ),
  });

  return (
    <Box>
      {/* <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 500, letterSpacing: "-0.3px" }}>CAB Planning</Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
          Shortlist CRQs awaiting CAB review and group them into a scheduled session.
        </Typography>
      </Box> */}

      <Box sx={{ mb: 2 }}>
        <OrgHierarchyFilters
          role={roleCode}
          values={values}
          options={options}
          onChange={handleChange}
        />
      </Box>

      {/* Waiting Queue */}
      <Paper sx={{ mb: 3, border: "1px solid", borderColor: "divider", overflow: "hidden" }} elevation={0}>
        <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography sx={{ fontWeight: 500 }}>CAB Waiting Queue</Typography>
          {selected.length > 0 && (
            <Button variant="contained" startIcon={<EventNoteIcon />} onClick={() => setOpenPlan(true)}>
              Plan CAB · {selected.length} selected
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

        {!shouldFetch ? (
          <Box sx={{ p: 6, textAlign: "center", color: "text.secondary" }}>
            <Typography variant="body2">Select a Domain and Sub Domain to load the CAB waiting queue.</Typography>
          </Box>
        ) : (
          <MaterialReactTable table={table} />
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
          {dates.data?.map((d) => {
            const hasSession = Boolean(d.sessionId) && (d.crqIds?.length ?? 0) > 0;
            return (
              <Stack key={d.sessionId ?? d.date} direction="row" spacing={2}>
                <Paper sx={{
                  width: 84, p: 1.5, textAlign: "center",
                  bgcolor: !hasSession ? "#F4F5F7" : d.type === "Critical" ? "#FDECEA" : d.type === "Emergency" ? "#FFF4E5" : "#E3F2FD",
                  color:   !hasSession ? "text.secondary" : d.type === "Critical" ? "#C62828" : d.type === "Emergency" ? "#ED6C02" : "#1565C0",
                  border: "1px solid", borderColor: "divider", flexShrink: 0,
                }} elevation={0}>
                  <Typography variant="caption" sx={{ fontWeight: 600, letterSpacing: 0.5 }}>{d.dayName}</Typography>
                  <Typography sx={{ fontSize: 28, fontWeight: 500 }}>{d.dayNum}</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 600, letterSpacing: 0.5 }}>{d.monthName}</Typography>
                </Paper>

                {hasSession ? (
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
                ) : (
                  <Paper sx={{ flex: 1, p: 2, display: "flex", alignItems: "center", border: "1px dashed", borderColor: "divider" }} elevation={0}>
                    <Typography variant="body2" sx={{ color: "text.secondary", fontStyle: "italic" }}>
                      No CAB session planned for this date.
                    </Typography>
                  </Paper>
                )}
              </Stack>
            );
          })}
        </Stack>
      )}

      <PlanCabModal
        open={openPlan}
        crqIds={selected}
        onClose={() => setOpenPlan(false)}
        onPlanned={() => setRowSelection({})}
      />
    </Box>
  );
}
