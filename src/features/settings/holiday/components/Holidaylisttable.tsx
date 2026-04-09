import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Backdrop,
  Snackbar,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  TextField,
  Tooltip,
} from "@mui/material";
import { Delete, Edit, AddCircleOutline } from "@mui/icons-material";
// import { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { MaterialReactTable, useMaterialReactTable } from "material-react-table";

// ─── Static JSON Data ────────────────────────────────────────────────────────
const STATIC_HOLIDAY_DATA = [
  { holidayId: 1, location: "Chennai", date: "2025-01-01", name: "Wednesday", description: "New Year" },
  { holidayId: 2, location: "Chennai", date: "2025-01-13", name: "Monday",    description: "Bhogi" },
  { holidayId: 3, location: "Chennai", date: "2025-01-14", name: "Tuesday",   description: "Pongal" },
  { holidayId: 4, location: "Chennai", date: "2025-01-15", name: "Wednesday", description: "Tiruvalluvar Day" },
  { holidayId: 5, location: "Chennai", date: "2025-01-26", name: "Sunday",    description: "Republic Day" },
  { holidayId: 6, location: "Mumbai",  date: "2025-03-31", name: "Monday",    description: "Ramzan" },
  { holidayId: 7, location: "Chennai", date: "2025-04-18", name: "Friday",    description: "Good Friday" },
  { holidayId: 8, location: "Mumbai",  date: "2025-05-01", name: "Thursday",  description: "May Day" },
  { holidayId: 9, location: "Chennai", date: "2026-04-14", name: "Tuesday",   description: "Tamil New Year" },
  { holidayId: 10, location: "Mumbai", date: "2026-08-15", name: "Saturday",  description: "Independence Day" },
];

// ─── Location colors ──────────────────────────────────────────────────────────
const locationColors: Record<string, { bg: string; color: string }> = {
  Chennai: { bg: "#fdf2f8", color: "#9d174d" },
  Mumbai:  { bg: "#eff6ff", color: "#1d4ed8" },
  Delhi:   { bg: "#f0fdf4", color: "#15803d" },
  Default: { bg: "#f5f3ff", color: "#6d28d9" },
};

type Holiday = {
  location: string;
  date: string;
  name: string;
  description: string;
  holidayId?: number;
};

interface HolidayListTableProps {
  refresh: boolean;
}

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

export const HolidayListTable: React.FC<HolidayListTableProps> = ({ refresh }) => {
  const [holiday, setHoliday] = useState<Holiday[]>([]);
  const [filteredHoliday, setFilteredHoliday] = useState<Holiday[]>([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedHoliday, setSelectedHoliday] = useState<Holiday | null>(null);
  const [filter, setFilter] = useState<"upcoming" | "all">("upcoming");
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [holidayToDelete, setHolidayToDelete] = useState<Holiday | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newLocation, setNewLocation] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newDay, setNewDay] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false, message: "", severity: "success",
  });

  // Load static data
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setHoliday(STATIC_HOLIDAY_DATA);
      setLoading(false);
    }, 400);
  }, [refresh]);

  // Apply filter
  useEffect(() => {
    const now = dayjs();
    if (filter === "upcoming") {
      setFilteredHoliday(holiday.filter((r) => dayjs(r.date).isValid() && dayjs(r.date).isAfter(now)));
    } else {
      setFilteredHoliday(holiday);
    }
  }, [filter, holiday]);

  const handleEditClick = (h: Holiday) => {
    setSelectedHoliday(h);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (h: Holiday) => {
    setHolidayToDelete(h);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!holidayToDelete) return;
    setLoading(true);
    setTimeout(() => {
      setHoliday((prev) => prev.filter((r) => r.holidayId !== holidayToDelete.holidayId));
      setSnackbar({ open: true, message: "Holiday deleted successfully!", severity: "success" });
      setLoading(false);
      setDeleteDialogOpen(false);
      setHolidayToDelete(null);
    }, 300);
  };

  const handleAddHoliday = () => {
    if (!newLocation || !newDate || !newDescription) {
      setSnackbar({ open: true, message: "Please fill in all fields.", severity: "error" });
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const newEntry: Holiday = {
        holidayId: Date.now(),
        location: newLocation,
        date: newDate,
        name: newDay || dayjs(newDate).format("dddd"),
        description: newDescription,
      };
      setHoliday((prev) => [...prev, newEntry]);
      setSnackbar({ open: true, message: "Holiday added successfully!", severity: "success" });
      setNewLocation(""); setNewDate(""); setNewDay(""); setNewDescription("");
      setAddDialogOpen(false);
      setLoading(false);
    }, 300);
  };

  const handleSaveEdit = (updated: Holiday) => {
    setHoliday((prev) => prev.map((r) => (r.holidayId === updated.holidayId ? updated : r)));
    setSnackbar({ open: true, message: "Holiday updated successfully!", severity: "success" });
    setEditDialogOpen(false);
  };

  // Stats
  const now = dayjs();
  const stats = {
    total: holiday.length,
    upcoming: holiday.filter((r) => dayjs(r.date).isAfter(now)).length,
    locations: [...new Set(holiday.map((r) => r.location))].length,
  };

  const columns = [
    {
      accessorKey: "location",
      header: "Location",
      size: 110,
      Cell: ({ cell }: any) => {
        const loc = cell.getValue() as string;
        const cfg = locationColors[loc] ?? locationColors.Default;
        return (
          <Box sx={{ display: "inline-flex", alignItems: "center", px: 1.5, py: 0.4,
            borderRadius: "20px", background: cfg.bg }}>
            <Typography sx={{ fontSize: "11px", fontWeight: 600, color: cfg.color,
              fontFamily: "'DM Sans', sans-serif" }}>
              {loc}
            </Typography>
          </Box>
        );
      },
    },
    {
      accessorKey: "date",
      header: "Date",
      size: 110,
      Cell: ({ cell }: any) => (
        <Typography sx={{ fontSize: "12px", color: "#374151", fontFamily: "'DM Sans', sans-serif",
          fontWeight: 500 }}>
          {cell.getValue()}
        </Typography>
      ),
    },
    {
      accessorKey: "name",
      header: "Day",
      size: 100,
      Cell: ({ cell }: any) => (
        <Typography sx={{ fontSize: "12px", color: "#6b7280", fontFamily: "'DM Sans', sans-serif" }}>
          {cell.getValue()}
        </Typography>
      ),
    },
    {
      accessorKey: "description",
      header: "Description",
      Cell: ({ cell }: any) => (
        <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#1a1f36",
          fontFamily: "'DM Sans', sans-serif" }}>
          {cell.getValue()}
        </Typography>
      ),
    },
    {
      id: "action",
      header: "Actions",
      Cell: ({ row }: any) => (
        <Box sx={{ display: "flex", gap: 0.5 }}>
          <Tooltip title="Edit holiday">
            <IconButton
              size="small"
              onClick={() => handleEditClick(row.original)}
              sx={{
                width: 30, height: 30, borderRadius: "8px",
                border: "1px solid #e5e7eb", background: "#fff",
                "&:hover": { background: "#eff6ff", borderColor: "#93c5fd" },
                "& svg": { fontSize: 14, color: "#6b7280" },
                "&:hover svg": { color: "#1d4ed8" },
              }}
            >
              <Edit />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete holiday">
            <IconButton
              size="small"
              onClick={() => handleDeleteClick(row.original)}
              sx={{
                width: 30, height: 30, borderRadius: "8px",
                border: "1px solid #e5e7eb", background: "#fff",
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
    data: filteredHoliday,
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
          <Tooltip title="Add Holiday">
            <IconButton
              onClick={() => setAddDialogOpen(true)}
              sx={{
                width: 30, height: 30, borderRadius: "8px",
                background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)",
                "&:hover": { background: "rgba(255,255,255,0.25)" },
                "& svg": { fontSize: 16, color: "#fff" },
              }}
            >
              <AddCircleOutline />
            </IconButton>
          </Tooltip>

          <Typography sx={{ color: "#fff", fontSize: "14px", fontWeight: 700,
            letterSpacing: "-0.2px", fontFamily: "'DM Sans', sans-serif" }}>
            Holiday List
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
            { label: "Total",     value: stats.total,     color: "#1a1f36" },
            { label: "Upcoming",  value: stats.upcoming,  color: "#1d4ed8" },
            { label: "Locations", value: stats.locations, color: "#9d174d" },
          ].map((s, i) => (
            <Box
              key={s.label}
              sx={{ px: 2, py: 1.5, borderRight: i < 2 ? "1px solid #f1f5f9" : "none", background: "#fafbff" }}
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

        <MaterialReactTable table={table} />
      </Box>

      {/* Add Holiday Dialog */}
      <Dialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: "16px", overflow: "hidden" } }}
      >
        <Box sx={{ background: "linear-gradient(135deg, #2d3a8c 0%, #3b4fd8 100%)", px: 2.5, py: 2 }}>
          <Typography sx={{ color: "#fff", fontSize: "15px", fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>
            Add Holiday
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.7)", fontSize: "12px", fontFamily: "'DM Sans', sans-serif", mt: 0.25 }}>
            Fill in the details to add a new holiday
          </Typography>
        </Box>
        <DialogContent sx={{ px: 2.5, pt: 2.5, pb: 1 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField label="Location" value={newLocation} onChange={(e) => setNewLocation(e.target.value)}
              fullWidth size="small" placeholder="e.g. Chennai" sx={fieldStyle} />
            <TextField label="Date" type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)}
              fullWidth size="small" slotProps={{ inputLabel: { shrink: true } }} sx={fieldStyle} />
            <TextField label="Day (optional)" value={newDay} onChange={(e) => setNewDay(e.target.value)}
              fullWidth size="small" placeholder="e.g. Monday" sx={fieldStyle} />
            <TextField label="Description" value={newDescription} onChange={(e) => setNewDescription(e.target.value)}
              fullWidth size="small" placeholder="e.g. Republic Day" sx={fieldStyle} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, pb: 2.5, pt: 1, gap: 1 }}>
          <Button
            onClick={() => setAddDialogOpen(false)}
            sx={{ borderRadius: "8px", textTransform: "none", fontSize: "13px",
              color: "#6b7280", border: "1px solid #e5e7eb", fontFamily: "'DM Sans', sans-serif" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddHoliday}
            variant="contained"
            sx={{ borderRadius: "8px", textTransform: "none", fontSize: "13px", flex: 1,
              background: "linear-gradient(135deg, #2d3a8c 0%, #3b4fd8 100%)",
              fontFamily: "'DM Sans', sans-serif", boxShadow: "none",
              "&:hover": { background: "linear-gradient(135deg, #232e73 0%, #2f3fb5 100%)" } }}
          >
            Add Holiday
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      {editDialogOpen && selectedHoliday && (
        <EditHolidayDialogInline
          holiday={selectedHoliday}
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          onSave={handleSaveEdit}
        />
      )}

      {/* Delete Confirmation */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => { setDeleteDialogOpen(false); setHolidayToDelete(null); }}
        PaperProps={{ sx: { borderRadius: "16px", width: 360 } }}
      >
        <DialogTitle sx={{ fontSize: "16px", fontWeight: 700, color: "#1a1f36",
          fontFamily: "'DM Sans', sans-serif", pb: 0.5 }}>
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontSize: "13px", color: "#6b7280", fontFamily: "'DM Sans', sans-serif" }}>
            Are you sure you want to delete <strong>{holidayToDelete?.description}</strong>? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            onClick={() => { setDeleteDialogOpen(false); setHolidayToDelete(null); }}
            sx={{ borderRadius: "8px", textTransform: "none", fontSize: "13px",
              color: "#6b7280", border: "1px solid #e5e7eb", fontFamily: "'DM Sans', sans-serif" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            sx={{ borderRadius: "8px", textTransform: "none", fontSize: "13px",
              background: "#dc2626", "&:hover": { background: "#b91c1c" },
              fontFamily: "'DM Sans', sans-serif", boxShadow: "none" }}
          >
            Delete
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

// ─── Inline Edit Dialog (replaces EditHolidayDialog import) ───────────────────
interface EditDialogProps {
  holiday: Holiday;
  open: boolean;
  onClose: () => void;
  onSave: (updated: Holiday) => void;
}

const EditHolidayDialogInline: React.FC<EditDialogProps> = ({ holiday, open, onClose, onSave }) => {
  const [location, setLocation] = useState(holiday.location);
  const [date, setDate] = useState(holiday.date);
  const [day, setDay] = useState(holiday.name);
  const [description, setDescription] = useState(holiday.description);

  const handleSave = () => {
    onSave({ ...holiday, location, date, name: day, description });
  };

  const fieldStyle = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "10px", fontSize: "13px", fontFamily: "'DM Sans', sans-serif",
      "& fieldset": { borderColor: "#e5e7eb" },
      "&:hover fieldset": { borderColor: "#a5b4fc" },
      "&.Mui-focused fieldset": { borderColor: "#3b4fd8" },
    },
    "& .MuiInputLabel-root": {
      fontSize: "13px", fontFamily: "'DM Sans', sans-serif",
      "&.Mui-focused": { color: "#3b4fd8" },
    },
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth
      PaperProps={{ sx: { borderRadius: "16px", overflow: "hidden" } }}>
      <Box sx={{ background: "linear-gradient(135deg, #2d3a8c 0%, #3b4fd8 100%)", px: 2.5, py: 2 }}>
        <Typography sx={{ color: "#fff", fontSize: "15px", fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>
          Edit Holiday
        </Typography>
        <Typography sx={{ color: "rgba(255,255,255,0.7)", fontSize: "12px", fontFamily: "'DM Sans', sans-serif", mt: 0.25 }}>
          Update the holiday details below
        </Typography>
      </Box>
      <DialogContent sx={{ px: 2.5, pt: 2.5, pb: 1 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField label="Location" value={location} onChange={(e) => setLocation(e.target.value)}
            fullWidth size="small" sx={fieldStyle} />
          <TextField label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)}
            fullWidth size="small" slotProps={{ inputLabel: { shrink: true } }} sx={fieldStyle} />
          <TextField label="Day" value={day} onChange={(e) => setDay(e.target.value)}
            fullWidth size="small" sx={fieldStyle} />
          <TextField label="Description" value={description} onChange={(e) => setDescription(e.target.value)}
            fullWidth size="small" sx={fieldStyle} />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 2.5, pb: 2.5, pt: 1, gap: 1 }}>
        <Button onClick={onClose}
          sx={{ borderRadius: "8px", textTransform: "none", fontSize: "13px",
            color: "#6b7280", border: "1px solid #e5e7eb", fontFamily: "'DM Sans', sans-serif" }}>
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained"
          sx={{ borderRadius: "8px", textTransform: "none", fontSize: "13px", flex: 1,
            background: "linear-gradient(135deg, #2d3a8c 0%, #3b4fd8 100%)", boxShadow: "none",
            fontFamily: "'DM Sans', sans-serif",
            "&:hover": { background: "linear-gradient(135deg, #232e73 0%, #2f3fb5 100%)" } }}>
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};