import React, { useMemo, useState } from "react";
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
  Button,
  Snackbar,
  Alert,
  TextField,
  Tooltip,
  Chip,
} from "@mui/material";
import { Delete, Edit, Add, LocationOn } from "@mui/icons-material";
import dayjs from "dayjs";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import {
  useGetHolidayDataQuery,
  useAddHolidayMutation,
  useUpdateHolidayMutation,
  useDeleteHolidayMutation,
  type Holiday,
} from "../../api/GlobalSettingApiSlice";

// ─── Status Helpers ──────────────────────────────────────────────────────────
const getStatus = (date: string) =>
  dayjs(date).isBefore(dayjs(), "day") ? "past" : "upcoming";

const statusConfig = {
  upcoming: {
    label: "Upcoming",
    bg: "#eff6ff",
    color: "#1d4ed8",
    dot: "#3b82f6",
  },
  past: { label: "Past", bg: "#f8fafc", color: "#94a3b8", dot: "#cbd5e1" },
} as const;

// ─── Shared Styles ────────────────────────────────────────────────────────────
const FONT = "'Sora', 'DM Sans', sans-serif";
const INK = "#0f172a";
const INK2 = "#475569";
const INK3 = "#94a3b8";
const SLATE = "#f8fafc";
const BORDER = "rgba(15,23,42,0.08)";

const fieldStyle = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "8px",
    fontSize: "13px",
    fontFamily: FONT,
    backgroundColor: SLATE,
    "& fieldset": { borderColor: BORDER },
    "&:hover fieldset": { borderColor: "#93c5fd" },
    "&.Mui-focused fieldset": { borderColor: "#2563eb", borderWidth: "1.5px" },
  },
  "& .MuiInputLabel-root": {
    fontSize: "12px",
    fontFamily: FONT,
    color: INK3,
    fontWeight: 500,
    "&.Mui-focused": { color: "#2563eb" },
  },
};

const actionBtnSx = (type: "edit" | "delete") => ({
  width: 26,
  height: 26,
  borderRadius: "6px",
  border: `0.5px solid ${BORDER}`,
  background: "#fff",
  transition: "all 0.15s",
  "&:hover": {
    background: type === "edit" ? "#eff6ff" : "#fef2f2",
    borderColor: type === "edit" ? "#93c5fd" : "#fca5a5",
  },
  "& svg": { fontSize: 13, color: INK3 },
  "&:hover svg": { color: type === "edit" ? "#2563eb" : "#dc2626" },
});

// ─── Component ────────────────────────────────────────────────────────────────
export const HolidayListTable: React.FC = () => {
  const {
    data: holidays = [],
    isLoading,
    isFetching,
  } = useGetHolidayDataQuery();
  const [addHoliday, { isLoading: isAdding }] = useAddHolidayMutation();
  const [updateHoliday, { isLoading: isUpdating }] = useUpdateHolidayMutation();
  const [deleteHoliday, { isLoading: isDeleting }] = useDeleteHolidayMutation();

  const [filter, setFilter] = useState<"upcoming" | "all">("upcoming");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState<Holiday | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const [formData, setFormData] = useState<Partial<Holiday>>({
    holidayOccasion: "",
    holidayDate: "",
    location: "",
  });
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  // ─── Derived Data ───────────────────────────────────────────────────────────
  const filteredData = useMemo(
    () =>
      filter === "upcoming"
        ? holidays.filter((r) => !dayjs(r.holidayDate).isBefore(dayjs(), "day"))
        : holidays,
    [holidays, filter],
  );

  const stats = useMemo(() => {
    const upcoming = holidays.filter(
      (r) => !dayjs(r.holidayDate).isBefore(dayjs(), "day"),
    ).length;
    return {
      total: holidays.length,
      upcoming,
      past: holidays.length - upcoming,
    };
  }, [holidays]);

  // ─── Handlers ────────────────────────────────────────────────────────────────
  const openAdd = () => {
    setDialogMode("add");
    setFormData({ holidayOccasion: "", holidayDate: "", location: "" });
    setDialogOpen(true);
  };

  const openEdit = (row: Holiday) => {
    setDialogMode("edit");
    setFormData({ ...row });
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!rowToDelete?.holidayId) return;
    try {
      await deleteHoliday(rowToDelete.holidayId).unwrap();
      setSnackbar({
        open: true,
        message: "Holiday deleted.",
        severity: "success",
      });
    } catch {
      setSnackbar({
        open: true,
        message: "Failed to delete holiday.",
        severity: "error",
      });
    } finally {
      setConfirmOpen(false);
    }
  };

  const handleSubmit = async () => {
    if (
      !formData.holidayDate ||
      !formData.holidayOccasion ||
      !formData.location
    ) {
      setSnackbar({
        open: true,
        message: "Please fill all fields.",
        severity: "error",
      });
      return;
    }
    const payload = {
      ...formData,
      holidayDay: dayjs(formData.holidayDate).format("dddd"),
    };
    try {
      if (dialogMode === "add") {
        await addHoliday(payload).unwrap();
        setSnackbar({
          open: true,
          message: "Holiday added.",
          severity: "success",
        });
      } else {
        await updateHoliday(payload).unwrap();
        setSnackbar({
          open: true,
          message: "Holiday updated.",
          severity: "success",
        });
      }
      setDialogOpen(false);
    } catch {
      setSnackbar({
        open: true,
        message: `Failed to ${dialogMode} holiday.`,
        severity: "error",
      });
    }
  };

  // ─── Columns ─────────────────────────────────────────────────────────────────
  const columns = useMemo(
    () => [
      {
        accessorKey: "holidayOccasion",
        header: "Occasion",
        Cell: ({ cell, row }: any) => {
          const cfg = statusConfig[getStatus(row.original.holidayDate)];
          return (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
              {/* color accent bar */}
              <Box
                sx={{
                  width: 3,
                  height: 32,
                  borderRadius: 2,
                  flexShrink: 0,
                  background: cfg.dot,
                }}
              />
              <Box>
                <Typography
                  sx={{
                    fontSize: "12.5px",
                    fontWeight: 600,
                    color: INK,
                    fontFamily: FONT,
                    lineHeight: 1.3,
                  }}
                >
                  {cell.getValue()}
                </Typography>
                <Box
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 0.5,
                    mt: 0.25,
                    px: "6px",
                    py: "1.5px",
                    borderRadius: "20px",
                    background: cfg.bg,
                  }}
                >
                  <Box
                    sx={{
                      width: 4.5,
                      height: 4.5,
                      borderRadius: "50%",
                      background: cfg.dot,
                    }}
                  />
                  <Typography
                    sx={{
                      fontSize: "9.5px",
                      fontWeight: 700,
                      color: cfg.color,
                      letterSpacing: "0.4px",
                      fontFamily: FONT,
                      lineHeight: 1,
                    }}
                  >
                    {cfg.label}
                  </Typography>
                </Box>
              </Box>
            </Box>
          );
        },
      },
      {
        accessorKey: "holidayDate",
        header: "Date",
        Cell: ({ row }: any) => (
          <Box>
            <Typography
              sx={{
                fontSize: "12px",
                fontWeight: 600,
                color: INK,
                fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: "-0.2px",
              }}
            >
              {dayjs(row.original.holidayDate).format("DD MMM YYYY")}
            </Typography>
            <Typography
              sx={{
                fontSize: "10.5px",
                color: INK3,
                fontFamily: FONT,
                mt: 0.25,
              }}
            >
              {row.original.holidayDay}
            </Typography>
          </Box>
        ),
      },
      {
        accessorKey: "location",
        header: "Location",
        Cell: ({ cell }: any) => (
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.5,
              px: "8px",
              py: "3px",
              borderRadius: "20px",
              border: `0.5px solid ${BORDER}`,
              background: SLATE,
            }}
          >
            <LocationOn sx={{ fontSize: 10, color: INK3 }} />
            <Typography
              sx={{
                fontSize: "11px",
                fontWeight: 500,
                color: INK2,
                fontFamily: FONT,
              }}
            >
              {cell.getValue()}
            </Typography>
          </Box>
        ),
      },
      {
        id: "action",
        header: "Actions",
        size: 76,
        Cell: ({ row }: any) => (
          <Box sx={{ display: "flex", gap: 0.5, justifyContent: "flex-end" }}>
            <Tooltip title="Edit">
              <IconButton
                size="small"
                onClick={() => openEdit(row.original)}
                sx={actionBtnSx("edit")}
              >
                <Edit />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton
                size="small"
                onClick={() => {
                  setRowToDelete(row.original);
                  setConfirmOpen(true);
                }}
                sx={actionBtnSx("delete")}
              >
                <Delete />
              </IconButton>
            </Tooltip>
          </Box>
        ),
      },
    ],
    [],
  );

  const table = useMaterialReactTable({
    columns,
    data: filteredData,
    enableStickyHeader: true,
    enableSorting: false,
    enablePagination: false,
    enableColumnActions: false,
    initialState: { density: "compact", columnPinning: { right: ["action"] } },
    muiTablePaperProps: { elevation: 0, sx: { background: "transparent" } },
    muiTableHeadCellProps: {
      sx: {
        background: SLATE,
        fontFamily: FONT,
        fontSize: "10px",
        fontWeight: 700,
        color: INK3,
        textTransform: "uppercase",
        letterSpacing: "0.7px",
        padding: "8px 14px",
        borderBottom: `0.5px solid ${BORDER}`,
        borderTop: "none",
      },
    },
    muiTableBodyCellProps: {
      sx: {
        padding: "7px 14px",
        borderBottom: `0.5px solid ${BORDER}`,
        fontFamily: FONT,
        fontSize: "12px",
      },
    },
    muiTableBodyRowProps: {
      sx: {
        "&:hover td": { background: "#fafbff" },
        "&:last-child td": { borderBottom: "none" },
        transition: "background 0.12s",
      },
    },
    muiTableContainerProps: {
      sx: {
        maxHeight: "360px",
        "&::-webkit-scrollbar": { width: "3px" },
        "&::-webkit-scrollbar-track": { background: "transparent" },
        "&::-webkit-scrollbar-thumb": {
          background: "#e2e8f0",
          borderRadius: "4px",
        },
      },
    },
  });

  const apiLoading =
    isLoading || isFetching || isAdding || isUpdating || isDeleting;

  // ─── Stat items ──────────────────────────────────────────────────────────────
  const statItems = [
    { label: "Total", value: stats.total, color: INK, numBg: "transparent" },
    {
      label: "Upcoming",
      value: stats.upcoming,
      color: "#2563eb",
      numBg: "transparent",
    },
    { label: "Past", value: stats.past, color: INK3, numBg: "transparent" },
  ];

  return (
    <>
      {/* ── Loading Backdrop ── */}
      <Backdrop
        open={apiLoading}
        sx={{
          zIndex: 9999,
          backdropFilter: "blur(3px)",
          background: "rgba(0,0,0,0.15)",
        }}
      >
        <CircularProgress size={28} sx={{ color: "#2563eb" }} />
      </Backdrop>

      {/* ── Main Card ── */}
      <Box
        sx={{
          background: "#fff",
          borderRadius: "16px",
          border: "1px solid #f1f5f9",
          boxShadow:
            "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(59,79,216,0.06)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            // background: INK,
            background: "linear-gradient(135deg, #2d3a8c 0%, #3b4fd8 100%)",

            px: 2,
            py: "13px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Left: icon + title */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
            <Tooltip title="Add holiday">
              <IconButton
                onClick={openAdd}
                size="small"
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: "7px",
                  border: "0.5px solid rgba(255,255,255,0.15)",
                  background: "rgba(255,255,255,0.08)",
                  "&:hover": { background: "rgba(255,255,255,0.16)" },
                  color: "#fff",
                }}
              >
                <Add sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
            <Box>
              <Typography
                sx={{
                  color: "#fff",
                  fontSize: "13px",
                  fontWeight: 700,
                  fontFamily: FONT,
                  letterSpacing: "-0.2px",
                  lineHeight: 1.3,
                }}
              >
                Holiday Schedule
              </Typography>
              <Typography
                sx={{
                  color: "rgba(255,255,255,0.4)",
                  fontSize: "10.5px",
                  fontFamily: FONT,
                  lineHeight: 1,
                }}
              >
                Manage team holidays
              </Typography>
            </Box>
          </Box>

          {/* Segment toggle */}
          <Box
            sx={{
              display: "flex",
              background: "rgba(255,255,255,0.08)",
              borderRadius: "7px",
              p: "3px",
              gap: "2px",
            }}
          >
            {(["all", "upcoming"] as const).map((val) => (
              <Box
                key={val}
                onClick={() => setFilter(val)}
                sx={{
                  px: "12px",
                  py: "4px",
                  borderRadius: "5px",
                  cursor: "pointer",
                  fontSize: "10.5px",
                  fontWeight: 700,
                  fontFamily: FONT,
                  letterSpacing: "0.2px",
                  transition: "all 0.15s",
                  background: filter === val ? "#fff" : "transparent",
                  color: filter === val ? INK : "rgba(255,255,255,0.5)",
                  "&:hover": {
                    background:
                      filter === val ? "#fff" : "rgba(255,255,255,0.12)",
                  },
                }}
              >
                {val.charAt(0).toUpperCase() + val.slice(1)}
              </Box>
            ))}
          </Box>
        </Box>

        {/* Stats bar */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            borderBottom: `0.5px solid ${BORDER}`,
          }}
        >
          {statItems.map((s, i) => (
            <Box
              key={s.label}
              sx={{
                px: 2,
                py: "10px",
                borderRight: i < 2 ? `0.5px solid ${BORDER}` : "none",
                background: "#fafbfc",
                display: "flex",
                alignItems: "center",
                gap: 1.5,
              }}
            >
              <Typography
                sx={{
                  fontSize: "22px",
                  fontWeight: 700,
                  color: s.color,
                  fontFamily: "'JetBrains Mono', monospace",
                  lineHeight: 1,
                }}
              >
                {s.value}
              </Typography>
              <Typography
                sx={{
                  fontSize: "9.5px",
                  fontWeight: 700,
                  color: INK3,
                  textTransform: "uppercase",
                  letterSpacing: "0.6px",
                  fontFamily: FONT,
                }}
              >
                {s.label}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Table */}
        <MaterialReactTable table={table} />
      </Box>

      {/* ── Add / Edit Dialog ── */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "14px",
            overflow: "hidden",
            border: `0.5px solid ${BORDER}`,
            boxShadow: "0 8px 40px rgba(15,23,42,0.14)",
          },
        }}
      >
        <Box sx={{ background: INK, px: 2.5, py: 2 }}>
          <Typography
            sx={{
              color: "#fff",
              fontSize: "14px",
              fontWeight: 700,
              fontFamily: FONT,
            }}
          >
            {dialogMode === "add" ? "Add new holiday" : "Edit holiday"}
          </Typography>
          <Typography
            sx={{
              color: "rgba(255,255,255,0.4)",
              fontSize: "11px",
              fontFamily: FONT,
              mt: 0.4,
            }}
          >
            {dialogMode === "add"
              ? "Fill in the details below"
              : "Update the holiday details"}
          </Typography>
        </Box>
        <DialogContent sx={{ px: 2.5, pt: 2.5, pb: 1 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.75 }}>
            <TextField
              label="Occasion name"
              value={formData.holidayOccasion}
              onChange={(e) =>
                setFormData({ ...formData, holidayOccasion: e.target.value })
              }
              fullWidth
              size="small"
              sx={fieldStyle}
            />
            <TextField
              label="Date"
              type="date"
              value={formData.holidayDate}
              onChange={(e) =>
                setFormData({ ...formData, holidayDate: e.target.value })
              }
              fullWidth
              size="small"
              slotProps={{ inputLabel: { shrink: true } }}
              sx={fieldStyle}
            />
            <TextField
              label="Location"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              fullWidth
              size="small"
              sx={fieldStyle}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, pb: 2.5, pt: 1.25, gap: 1 }}>
          <Button
            onClick={() => setDialogOpen(false)}
            sx={{
              borderRadius: "8px",
              textTransform: "none",
              fontSize: "12.5px",
              color: INK2,
              border: `0.5px solid ${BORDER}`,
              fontFamily: FONT,
              "&:hover": { background: SLATE },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            sx={{
              borderRadius: "8px",
              textTransform: "none",
              fontSize: "12.5px",
              background: INK,
              fontFamily: FONT,
              boxShadow: "none",
              flex: 1,
              fontWeight: 700,
              "&:hover": { background: "#1e293b" },
            }}
          >
            {dialogMode === "add" ? "Save holiday" : "Save changes"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete Confirm Dialog ── */}
      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: "14px",
            width: 340,
            border: `0.5px solid ${BORDER}`,
            boxShadow: "0 8px 40px rgba(15,23,42,0.14)",
          },
        }}
      >
        <Box sx={{ px: 2.5, pt: 2.5, pb: 0 }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: "10px",
              background: "#fef2f2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 1.5,
            }}
          >
            <Delete sx={{ fontSize: 18, color: "#dc2626" }} />
          </Box>
          <Typography
            sx={{
              fontSize: "14px",
              fontWeight: 700,
              color: INK,
              fontFamily: FONT,
            }}
          >
            Delete holiday
          </Typography>
        </Box>
        <DialogContent sx={{ px: 2.5, py: 1 }}>
          <DialogContentText
            sx={{
              fontSize: "12.5px",
              color: INK2,
              fontFamily: FONT,
              lineHeight: 1.6,
            }}
          >
            Are you sure you want to delete{" "}
            <strong style={{ color: INK }}>
              {rowToDelete?.holidayOccasion}
            </strong>
            ? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, pb: 2.5, pt: 1, gap: 1 }}>
          <Button
            onClick={() => setConfirmOpen(false)}
            sx={{
              borderRadius: "8px",
              textTransform: "none",
              fontSize: "12.5px",
              color: INK2,
              border: `0.5px solid ${BORDER}`,
              fontFamily: FONT,
              "&:hover": { background: SLATE },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            variant="contained"
            sx={{
              borderRadius: "8px",
              textTransform: "none",
              fontSize: "12.5px",
              background: "#dc2626",
              fontFamily: FONT,
              boxShadow: "none",
              flex: 1,
              fontWeight: 700,
              "&:hover": { background: "#b91c1c" },
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Snackbar ── */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          sx={{
            borderRadius: "10px",
            fontFamily: FONT,
            fontSize: "12.5px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};
