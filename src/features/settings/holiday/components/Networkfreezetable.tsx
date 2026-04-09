import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Backdrop,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  Snackbar,
  Alert,
  TextField,
  Chip,
  Tooltip,
} from "@mui/material";
import { Delete, Edit } from "@mui/icons-material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import dayjs from "dayjs";
import { MaterialReactTable, useMaterialReactTable } from "material-react-table";
// import { AddActiveFreezeSchedule } from "./AddActiveFreezeSchedule";

// ─── Static JSON Data ────────────────────────────────────────────────────────
const STATIC_FREEZE_DATA = [
  {
    freezeId: "1",
    startDayAndTime: "2026-03-19 00:00:00",
    endDayAndTime: "2026-04-18 00:00:00",
    duration: "720",
    remark: "New Year",
  },
  {
    freezeId: "2",
    startDayAndTime: "2024-12-24 20:00:00",
    endDayAndTime: "2024-12-24 20:00:00",
    duration: "0",
    remark: "Holiday",
  },
  {
    freezeId: "3",
    startDayAndTime: "2025-01-01 10:00:00",
    endDayAndTime: "2025-02-01 10:00:00",
    duration: "744",
    remark: "Activity Freeze",
  },
  {
    freezeId: "4",
    startDayAndTime: "2025-04-25 19:57:00",
    endDayAndTime: "2025-04-29 20:57:00",
    duration: "97",
    remark: "Test Window",
  },
  {
    freezeId: "5",
    startDayAndTime: "2025-04-25 12:17:00",
    endDayAndTime: "2026-04-18 00:00:00",
    duration: "8411",
    remark: "Testing",
  },
];

type FreezeDaysTable = {
  startDayAndTime: string;
  endDayAndTime: string;
  duration: string;
  remark: string;
  freezeId?: string;
};

interface NetworkFreezeTableProps {
  onRefresh?: () => void;
}

// ─── Status helpers ───────────────────────────────────────────────────────────
const getStatus = (start: string, end: string) => {
  const now = dayjs();
  if (dayjs(start).isAfter(now)) return "upcoming";
  if (dayjs(end).isBefore(now)) return "past";
  return "active";
};

const statusConfig: Record<string, { label: string; bg: string; color: string; dot: string }> = {
  upcoming: { label: "Upcoming", bg: "#eff6ff", color: "#1d4ed8", dot: "#3b82f6" },
  active:   { label: "Active",   bg: "#f0fdf4", color: "#15803d", dot: "#22c55e" },
  past:     { label: "Past",     bg: "#f9fafb", color: "#6b7280", dot: "#9ca3af" },
};

// ─── Component ────────────────────────────────────────────────────────────────
const NetworkFreezeTable: React.FC<NetworkFreezeTableProps> = ({ onRefresh }) => {
  const [freezeDaysTable, setFreezeDaysTable] = useState<FreezeDaysTable[]>([]);
  const [filteredTable, setFilteredTable] = useState<FreezeDaysTable[]>([]);
  const [startDateTime, setStartDateTime] = useState<string>("");
  const [endDateTime, setEndDateTime] = useState<string>("");
  const [remark, setRemark] = useState("");
  const [filter, setFilter] = useState<"upcoming" | "all">("upcoming");
  const [loading, setLoading] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState<FreezeDaysTable | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false, message: "", severity: "success",
  });

  // Load static data
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setFreezeDaysTable(STATIC_FREEZE_DATA);
      setLoading(false);
    }, 400);
  }, []);

  // Apply filter
  useEffect(() => {
    if (filter === "upcoming") {
      const now = dayjs();
      setFilteredTable(freezeDaysTable.filter((row) => dayjs(row.startDayAndTime).isAfter(now)));
    } else {
      setFilteredTable(freezeDaysTable);
    }
  }, [freezeDaysTable, filter]);

  const confirmDelete = (row: FreezeDaysTable) => {
    setRowToDelete(row);
    setConfirmDialogOpen(true);
  };

  const handleDelete = () => {
    if (!rowToDelete?.freezeId) return;
    setLoading(true);
    setTimeout(() => {
      setFreezeDaysTable((prev) => prev.filter((r) => r.freezeId !== rowToDelete.freezeId));
      setSnackbar({ open: true, message: "Freeze schedule deleted successfully!", severity: "success" });
      setLoading(false);
      setConfirmDialogOpen(false);
    }, 300);
  };

  const handleEditClick = (rowData: FreezeDaysTable) => {
    setEditingId(rowData.freezeId ?? null);
    setStartDateTime(rowData.startDayAndTime);
    setEndDateTime(rowData.endDayAndTime);
    setRemark(rowData.remark);
    setEditDialogOpen(true);
  };

  const submitEdit = () => {
    if (!startDateTime || !endDateTime || !remark) {
      setSnackbar({ open: true, message: "Please fill in all fields.", severity: "error" });
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setFreezeDaysTable((prev) =>
        prev.map((r) =>
          r.freezeId === editingId
            ? { ...r, startDayAndTime: startDateTime, endDayAndTime: endDateTime, remark }
            : r
        )
      );
      setSnackbar({ open: true, message: "Freeze schedule updated successfully!", severity: "success" });
      setLoading(false);
      setEditDialogOpen(false);
    }, 300);
  };

  // Stats
  const now = dayjs();
  const stats = {
    total: freezeDaysTable.length,
    upcoming: freezeDaysTable.filter((r) => dayjs(r.startDayAndTime).isAfter(now)).length,
    active: freezeDaysTable.filter((r) => !dayjs(r.startDayAndTime).isAfter(now) && !dayjs(r.endDayAndTime).isBefore(now)).length,
  };

  const columns = [
    {
      accessorKey: "remark",
      header: "Holiday Name",
      Cell: ({ cell, row }: any) => {
        const status = getStatus(row.original.startDayAndTime, row.original.endDayAndTime);
        const cfg = statusConfig[status];
        return (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#1a1f36", fontFamily: "'DM Sans', sans-serif" }}>
              {cell.getValue()}
            </Typography>
            <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, width: "fit-content",
              px: 1, py: 0.25, borderRadius: "20px", background: cfg.bg }}>
              <Box sx={{ width: 5, height: 5, borderRadius: "50%", background: cfg.dot, flexShrink: 0 }} />
              <Typography sx={{ fontSize: "10px", fontWeight: 600, color: cfg.color, letterSpacing: "0.3px",
                fontFamily: "'DM Sans', sans-serif", lineHeight: 1 }}>
                {cfg.label}
              </Typography>
            </Box>
          </Box>
        );
      },
    },
    {
      accessorKey: "startDayAndTime",
      header: "Start",
      Cell: ({ cell }: any) => (
        <Typography sx={{ fontSize: "12px", color: "#6b7280", fontFamily: "'DM Sans', sans-serif" }}>
          {cell.getValue()}
        </Typography>
      ),
    },
    {
      accessorKey: "endDayAndTime",
      header: "End",
      Cell: ({ cell }: any) => (
        <Typography sx={{ fontSize: "12px", color: "#6b7280", fontFamily: "'DM Sans', sans-serif" }}>
          {cell.getValue()}
        </Typography>
      ),
    },
    {
      accessorKey: "duration",
      header: "Duration (HRS)",
      Cell: ({ cell }: any) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#1a1f36", fontFamily: "'DM Sans', sans-serif" }}>
            {Number(cell.getValue()).toLocaleString()}
          </Typography>
          <Typography sx={{ fontSize: "10px", color: "#9ca3af", fontFamily: "'DM Sans', sans-serif" }}>hrs</Typography>
        </Box>
      ),
    },
    {
      id: "action",
      header: "Actions",
      Cell: ({ row }: any) => (
        <Box sx={{ display: "flex", gap: 0.5 }}>
          <Tooltip title="Edit schedule">
            <IconButton
              size="small"
              onClick={() => handleEditClick(row.original)}
              sx={{
                width: 30, height: 30, borderRadius: "8px",
                border: "1px solid #e5e7eb",
                background: "#fff",
                "&:hover": { background: "#eff6ff", borderColor: "#93c5fd" },
                "& svg": { fontSize: 14, color: "#6b7280" },
                "&:hover svg": { color: "#1d4ed8" },
              }}
            >
              <Edit />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete schedule">
            <IconButton
              size="small"
              onClick={() => confirmDelete(row.original)}
              sx={{
                width: 30, height: 30, borderRadius: "8px",
                border: "1px solid #e5e7eb",
                background: "#fff",
                "&:hover": { background: "#fef2f2", borderColor: "#fca5a5" },
                "& svg": { fontSize: 14, color: "#6b7280" },
                "&:hover svg": { color: "#dc2626" },
              }}
            >
              <Delete />
            </IconButton>
          </Tooltip>
        </Box>
      ),
      size: 90,
    },
  ];

  const table = useMaterialReactTable({
    columns,
    data: filteredTable,
    enableStickyHeader: true,
    enableSorting: false,
    enablePagination: false,
    enableColumnActions: false,
    initialState: { showGlobalFilter: false, density: "compact", columnPinning: { right: ["action"] } },
    muiTablePaperProps: { elevation: 0, sx: { background: "transparent" } },
    muiTableHeadCellProps: {
      sx: { backgroundColor: "#f8fafc", fontWeight: 600, fontSize: "11px", color: "#6b7280",
        padding: "10px 12px", letterSpacing: "0.5px", textTransform: "uppercase",
        borderBottom: "1px solid #f1f5f9", fontFamily: "'DM Sans', sans-serif" },
    },
    muiTableBodyCellProps: {
      sx: { padding: "10px 12px", fontSize: "12px", borderBottom: "1px solid #f8fafc",
        fontFamily: "'DM Sans', sans-serif" },
    },
    muiTableBodyRowProps: {
      sx: { "&:hover td": { backgroundColor: "#fafbff" }, transition: "background 0.15s" },
    },
    muiTableContainerProps: {
      sx: {
        maxHeight: "340px",
        "&::-webkit-scrollbar": { width: "4px", height: "4px" },
        "&::-webkit-scrollbar-track": { background: "transparent" },
        "&::-webkit-scrollbar-thumb": { background: "#d1d5db", borderRadius: "4px" },
      },
    },
  });

  return (
    <>
      <Backdrop open={loading} sx={{ zIndex: 9999, backdropFilter: "blur(4px)", background: "rgba(0,0,0,0.2)" }}>
        <CircularProgress sx={{ color: "#3b4fd8" }} />
      </Backdrop>

      <Box
        sx={{
          background: "#fff",
          borderRadius: "16px",
          border: "1px solid #f1f5f9",
          boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(59,79,216,0.06)",
          overflow: "hidden",
        }}
      >
        {/* Panel Header */}
        <Box
          sx={{
            background: "linear-gradient(135deg, #2d3a8c 0%, #3b4fd8 100%)",
            px: 2, py: 1.5,
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {/* <AddActiveFreezeSchedule refreshTable={() => {}} /> */}
          </Box>

          <Typography sx={{ color: "#fff", fontSize: "14px", fontWeight: 700,
            letterSpacing: "-0.2px", fontFamily: "'DM Sans', sans-serif" }}>
            Active Freeze Schedule
          </Typography>

          {/* All / Upcoming toggle */}
          <Box sx={{ display: "flex", background: "rgba(255,255,255,0.12)", borderRadius: "8px", p: "3px", gap: "2px" }}>
            {(["all", "upcoming"] as const).map((val) => (
              <Box
                key={val}
                onClick={() => setFilter(val)}
                sx={{
                  px: 1.5, py: 0.4, borderRadius: "6px", cursor: "pointer",
                  fontSize: "11px", fontWeight: 600, transition: "all 0.15s",
                  fontFamily: "'DM Sans', sans-serif",
                  background: filter === val ? "#fff" : "transparent",
                  color: filter === val ? "#2d3a8c" : "rgba(255,255,255,0.75)",
                  "&:hover": { background: filter === val ? "#fff" : "rgba(255,255,255,0.2)" },
                }}
              >
                {val.charAt(0).toUpperCase() + val.slice(1)}
              </Box>
            ))}
          </Box>
        </Box>

        {/* Stats bar */}
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 0, borderBottom: "1px solid #f1f5f9" }}>
          {[
            { label: "Total", value: stats.total, color: "#1a1f36" },
            { label: "Upcoming", value: stats.upcoming, color: "#1d4ed8" },
            { label: "Active", value: stats.active, color: "#15803d" },
          ].map((s, i) => (
            <Box
              key={s.label}
              sx={{
                px: 2, py: 1.5,
                borderRight: i < 2 ? "1px solid #f1f5f9" : "none",
                background: "#fafbff",
              }}
            >
              <Typography sx={{ fontSize: "10px", color: "#9ca3af", fontWeight: 500,
                textTransform: "uppercase", letterSpacing: "0.5px", fontFamily: "'DM Sans', sans-serif" }}>
                {s.label}
              </Typography>
              <Typography sx={{ fontSize: "22px", fontWeight: 700, color: s.color,
                lineHeight: 1.2, fontFamily: "'DM Sans', sans-serif" }}>
                {s.value}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Table */}
        <MaterialReactTable table={table} />
      </Box>

      {/* Delete Confirmation */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        PaperProps={{ sx: { borderRadius: "16px", width: 360 } }}
      >
        <DialogTitle sx={{ fontSize: "16px", fontWeight: 700, color: "#1a1f36",
          fontFamily: "'DM Sans', sans-serif", pb: 0.5 }}>
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontSize: "13px", color: "#6b7280", fontFamily: "'DM Sans', sans-serif" }}>
            Are you sure you want to delete <strong>{rowToDelete?.remark}</strong>? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            onClick={() => setConfirmDialogOpen(false)}
            sx={{ borderRadius: "8px", textTransform: "none", fontSize: "13px",
              color: "#6b7280", border: "1px solid #e5e7eb", fontFamily: "'DM Sans', sans-serif" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            variant="contained"
            sx={{ borderRadius: "8px", textTransform: "none", fontSize: "13px",
              background: "#dc2626", "&:hover": { background: "#b91c1c" },
              fontFamily: "'DM Sans', sans-serif", boxShadow: "none" }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: "16px", overflow: "hidden" } }}
      >
        <Box sx={{ background: "linear-gradient(135deg, #2d3a8c 0%, #3b4fd8 100%)", px: 2.5, py: 2 }}>
          <Typography sx={{ color: "#fff", fontSize: "15px", fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>
            Edit Freeze Schedule
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.7)", fontSize: "12px", fontFamily: "'DM Sans', sans-serif", mt: 0.25 }}>
            Update the schedule details below
          </Typography>
        </Box>
        <DialogContent sx={{ px: 2.5, pt: 2.5, pb: 1 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Start Date & Time"
              type="datetime-local"
              disabled
              value={startDateTime}
              onChange={(e) => setStartDateTime(e.target.value)}
              fullWidth
              size="small"
              slotProps={{ inputLabel: { shrink: true } }}
              sx={fieldStyle}
            />
            <TextField
              label="End Date & Time"
              type="datetime-local"
              disabled
              value={endDateTime}
              onChange={(e) => setEndDateTime(e.target.value)}
              fullWidth
              size="small"
              slotProps={{ inputLabel: { shrink: true } }}
              sx={fieldStyle}
            />
            <TextField
              label="Holiday Name"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              fullWidth
              size="small"
              sx={fieldStyle}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, pb: 2.5, pt: 1, gap: 1 }}>
          <Button
            onClick={() => setEditDialogOpen(false)}
            sx={{ borderRadius: "8px", textTransform: "none", fontSize: "13px",
              color: "#6b7280", border: "1px solid #e5e7eb", fontFamily: "'DM Sans', sans-serif" }}
          >
            Cancel
          </Button>
          <Button
            onClick={submitEdit}
            variant="contained"
            sx={{ borderRadius: "8px", textTransform: "none", fontSize: "13px",
              background: "linear-gradient(135deg, #2d3a8c 0%, #3b4fd8 100%)",
              fontFamily: "'DM Sans', sans-serif", boxShadow: "none", flex: 1,
              "&:hover": { background: "linear-gradient(135deg, #232e73 0%, #2f3fb5 100%)" } }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
          sx={{ borderRadius: "10px", fontFamily: "'DM Sans', sans-serif", fontSize: "13px" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

// Shared text field style
const fieldStyle = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",
    fontSize: "13px",
    fontFamily: "'DM Sans', sans-serif",
    "& fieldset": { borderColor: "#e5e7eb" },
    "&:hover fieldset": { borderColor: "#a5b4fc" },
    "&.Mui-focused fieldset": { borderColor: "#3b4fd8" },
  },
  "& .MuiInputLabel-root": {
    fontSize: "13px",
    fontFamily: "'DM Sans', sans-serif",
    "&.Mui-focused": { color: "#3b4fd8" },
  },
};

export default NetworkFreezeTable;