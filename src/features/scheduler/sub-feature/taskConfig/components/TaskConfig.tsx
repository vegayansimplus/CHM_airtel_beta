import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_Cell,
  type MRT_ColumnDef,
  type MRT_Row,
  type MRT_TableInstance,
} from "material-react-table";
import {
  Box,
  Typography,
  Switch,
  styled,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  Button,
  ButtonGroup,
  Stack,
  Paper,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  type SelectChangeEvent,
  Snackbar,
  Alert,
  type AlertColor,
  CircularProgress,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import DoNotDisturbAltIcon from "@mui/icons-material/DoNotDisturbAlt";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

// ─── Types ──────────────────────────────────────────────────────────────────

type EmployeeLevel = "L2" | "L3" | "L4";
type EmployeeRole = "Onroll" | "Contract";

interface TaskFlags {
  crqValidation: boolean;
  impactAnalysis: boolean;
  mopCreation: boolean;
  mopValidation: boolean;
  schedulingApprovals: boolean;
  networkExecution: boolean;
}

type TaskKey = keyof TaskFlags;

interface TaskData extends TaskFlags {
  id: number;
  olmId: string;
  employeeName: string;
  employeeLevel: EmployeeLevel;
  roll: EmployeeRole;
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

interface SnackState {
  open: boolean;
  message: string;
  severity: AlertColor;
}

interface AddEmployeeForm {
  employeeName: string;
  olmId: string;
  employeeLevel: EmployeeLevel;
  roll: EmployeeRole;
}

interface TaskColumnMeta {
  key: TaskKey;
  label: string;
  fullLabel: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const TASK_COLUMNS: TaskColumnMeta[] = [
  { key: "crqValidation", label: "CRQ", fullLabel: "CRQ Validation" },
  { key: "impactAnalysis", label: "Impact", fullLabel: "Impact Analysis" },
  { key: "mopCreation", label: "MOP", fullLabel: "MOP Creation" },
  { key: "mopValidation", label: "Validation", fullLabel: "MOP Validation" },
  {
    key: "schedulingApprovals",
    label: "Approval",
    fullLabel: "Scheduling Approvals",
  },
  {
    key: "networkExecution",
    label: "Execution",
    fullLabel: "Network Execution",
  },
];

const ALL_TASK_KEYS: TaskKey[] = TASK_COLUMNS.map((c) => c.key);

const INITIAL_DATA: TaskData[] = [
  {
    id: 1,
    olmId: "B0093363",
    employeeName: "Prasann Shrivastava",
    employeeLevel: "L4",
    roll: "Onroll",
    crqValidation: true,
    impactAnalysis: true,
    mopCreation: true,
    mopValidation: true,
    schedulingApprovals: true,
    networkExecution: true,
  },
  {
    id: 2,
    olmId: "B0266821",
    employeeName: "Harsh Yadav",
    employeeLevel: "L3",
    roll: "Onroll",
    crqValidation: true,
    impactAnalysis: false,
    mopCreation: true,
    mopValidation: true,
    schedulingApprovals: false,
    networkExecution: true,
  },
  {
    id: 3,
    olmId: "B0312445",
    employeeName: "Anita Sharma",
    employeeLevel: "L2",
    roll: "Contract",
    crqValidation: false,
    impactAnalysis: false,
    mopCreation: true,
    mopValidation: false,
    schedulingApprovals: false,
    networkExecution: true,
  },
  {
    id: 4,
    olmId: "B0198732",
    employeeName: "Rohan Mehta",
    employeeLevel: "L3",
    roll: "Onroll",
    crqValidation: true,
    impactAnalysis: true,
    mopCreation: false,
    mopValidation: false,
    schedulingApprovals: true,
    networkExecution: false,
  },
];

const DEFAULT_ADD_FORM: AddEmployeeForm = {
  employeeName: "",
  olmId: "",
  employeeLevel: "L3",
  roll: "Onroll",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getInitials = (name: string): string =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const getAccessPercent = (row: TaskData): number =>
  Math.round(
    (ALL_TASK_KEYS.filter((k) => row[k]).length / ALL_TASK_KEYS.length) * 100,
  );

const generateOlmId = (): string =>
  "B0" + String(Math.floor(100000 + Math.random() * 900000));

let nextId = INITIAL_DATA.length + 1;

// ─── Styled Components ────────────────────────────────────────────────────────

const ActionSwitch = styled(Switch)(({ theme }) => ({
  width: 36,
  height: 20,
  padding: 0,
  "& .MuiSwitch-switchBase": {
    padding: 3,
    transitionDuration: "200ms",
    "&.Mui-checked": {
      transform: "translateX(16px)",
      color: "#fff",
      "& + .MuiSwitch-track": {
        backgroundColor: theme.palette.primary.main,
        opacity: 1,
        border: 0,
      },
    },
  },
  "& .MuiSwitch-thumb": { width: 14, height: 14 },
  "& .MuiSwitch-track": {
    borderRadius: 10,
    backgroundColor: theme.palette.mode === "dark" ? "#555" : "#ccc",
    opacity: 1,
  },
}));

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, color }) => (
  <Paper
    elevation={0}
    sx={{
      p: "10px 14px",
      border: "1px solid",
      borderColor: "divider",
      borderRadius: 2,
      display: "flex",
      alignItems: "center",
      gap: 1.5,
    }}
  >
    <Box
      sx={{
        width: 36,
        height: 36,
        borderRadius: 1.5,
        bgcolor: `${color}18`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color,
        flexShrink: 0,
      }}
    >
      {icon}
    </Box>
    <Box>
      <Typography
        sx={{ fontSize: 11, color: "text.secondary", lineHeight: 1.2 }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontSize: 20,
          fontWeight: 700,
          lineHeight: 1.3,
          color: "text.primary",
        }}
      >
        {value}
      </Typography>
    </Box>
  </Paper>
);

const AccessBar: React.FC<{ percent: number }> = ({ percent }) => (
  <Box sx={{ minWidth: 60 }}>
    <Typography
      sx={{
        fontSize: 11,
        color: "text.secondary",
        mb: 0.25,
        textAlign: "right",
      }}
    >
      {percent}%
    </Typography>
    <LinearProgress
      variant="determinate"
      value={percent}
      sx={{
        height: 4,
        borderRadius: 99,
        bgcolor: "action.hover",
        "& .MuiLinearProgress-bar": {
          borderRadius: 99,
          bgcolor:
            percent === 100
              ? "success.main"
              : percent === 0
                ? "error.light"
                : "primary.main",
        },
      }}
    />
  </Box>
);

// ─── Add Employee Dialog ──────────────────────────────────────────────────────

interface AddEmployeeDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (form: AddEmployeeForm) => void;
}

const AddEmployeeDialog: React.FC<AddEmployeeDialogProps> = ({
  open,
  onClose,
  onAdd,
}) => {
  const [form, setForm] = useState<AddEmployeeForm>(DEFAULT_ADD_FORM);
  const [errors, setErrors] = useState<
    Partial<Record<keyof AddEmployeeForm, string>>
  >({});

  useEffect(() => {
    if (open) {
      setForm({ ...DEFAULT_ADD_FORM, olmId: generateOlmId() });
      setErrors({});
    }
  }, [open]);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof AddEmployeeForm, string>> = {};
    if (!form.employeeName.trim()) newErrors.employeeName = "Name is required";
    if (!form.olmId.trim()) newErrors.olmId = "OLM ID is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (): void => {
    if (validate()) onAdd(form);
  };

  const handleLevelChange = (e: SelectChangeEvent<EmployeeLevel>): void =>
    setForm((f) => ({ ...f, employeeLevel: e.target.value as EmployeeLevel }));

  const handleRoleChange = (e: SelectChangeEvent<EmployeeRole>): void =>
    setForm((f) => ({ ...f, roll: e.target.value as EmployeeRole }));

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 600, fontSize: 16 }}>
        Add Employee
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Full Name"
            size="small"
            fullWidth
            value={form.employeeName}
            onChange={(e) =>
              setForm((f) => ({ ...f, employeeName: e.target.value }))
            }
            error={!!errors.employeeName}
            helperText={errors.employeeName}
          />
          <TextField
            label="OLM ID"
            size="small"
            fullWidth
            value={form.olmId}
            onChange={(e) => setForm((f) => ({ ...f, olmId: e.target.value }))}
            error={!!errors.olmId}
            helperText={errors.olmId}
          />
          <FormControl size="small" fullWidth>
            <InputLabel>Level</InputLabel>
            <Select<EmployeeLevel>
              value={form.employeeLevel}
              label="Level"
              onChange={handleLevelChange}
            >
              <MenuItem value="L2">L2</MenuItem>
              <MenuItem value="L3">L3</MenuItem>
              <MenuItem value="L4">L4</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" fullWidth>
            <InputLabel>Role</InputLabel>
            <Select<EmployeeRole>
              value={form.roll}
              label="Role"
              onChange={handleRoleChange}
            >
              <MenuItem value="Onroll">Onroll</MenuItem>
              <MenuItem value="Contract">Contract</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} size="small">
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" size="small">
          Add Employee
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

interface TaskConfigProps {
  data?: {
    crqValidation: boolean;
    employeeLevel: "L2" | "L3" | "L4";
    employeeName: string;
    impactAnalysis: boolean;
    mopCreation: boolean;
    mopValidation: boolean;
    networkExecution: boolean;
    olmId: string;
    schedulingApprovals: boolean;
  }[];
  isLoading?: boolean;
}

export const TaskConfig: React.FC<TaskConfigProps> = ({ data: propData, isLoading }) => {
  const [data, setData] = useState<TaskData[]>([]);
  const [search, setSearch] = useState<string>("");
  const [levelFilter, setLevelFilter] = useState<EmployeeLevel | "All">("All");
  const [addOpen, setAddOpen] = useState<boolean>(false);
  const [snack, setSnack] = useState<SnackState>({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    if (propData) {
      const mappedData: TaskData[] = propData.map((item, index) => ({
        id: index + 1,
        olmId: item.olmId,
        employeeName: item.employeeName,
        employeeLevel: item.employeeLevel,
        roll: "Onroll", // Default since not in API
        crqValidation: item.crqValidation,
        impactAnalysis: item.impactAnalysis,
        mopCreation: item.mopCreation,
        mopValidation: item.mopValidation,
        schedulingApprovals: item.schedulingApprovals,
        networkExecution: item.networkExecution,
      }));
      setData(mappedData);
    } else {
      setData([]);
    }
  }, [propData]);
  // const [search, setSearch] = useState<string>("");
  // const [levelFilter, setLevelFilter] = useState<EmployeeLevel | "All">("All");
  // const [addOpen, setAddOpen] = useState<boolean>(false);
  // const [snack, setSnack] = useState<SnackState>({
  //   open: false,
  //   message: "",
  //   severity: "success",
  // });

  // ── Helpers ────────────────────────────────────────────────────────────────

  const showSnack = (message: string, severity: AlertColor = "success"): void =>
    setSnack({ open: true, message, severity });

  const closeSnack = (
    _: React.SyntheticEvent | Event,
    reason?: string,
  ): void => {
    if (reason === "clickaway") return;
    setSnack((s) => ({ ...s, open: false }));
  };

  // ── Mutation Handlers ──────────────────────────────────────────────────────

  const handleToggle = useCallback(
    (rowId: number, columnKey: TaskKey): void => {
      setData((prev) =>
        prev.map((row) =>
          row.id === rowId ? { ...row, [columnKey]: !row[columnKey] } : row,
        ),
      );
    },
    [],
  );

  const handleEnableAll = useCallback((rowId: number): void => {
    setData((prev) =>
      prev.map((row) => {
        if (row.id !== rowId) return row;
        const allEnabled = ALL_TASK_KEYS.every((k) => row[k]);
        const updated = ALL_TASK_KEYS.reduce<Partial<TaskFlags>>(
          (acc, k) => ({ ...acc, [k]: !allEnabled }),
          {},
        );
        return { ...row, ...updated };
      }),
    );
  }, []);

  const handleDelete = useCallback((rowId: number, name: string): void => {
    setData((prev) => prev.filter((r) => r.id !== rowId));
    showSnack(`${name} removed from task configuration.`, "info");
  }, []);

  const handleAdd = useCallback((form: AddEmployeeForm): void => {
    const newRow: TaskData = {
      id: nextId++,
      olmId: form.olmId,
      employeeName: form.employeeName,
      employeeLevel: form.employeeLevel,
      roll: form.roll,
      crqValidation: false,
      impactAnalysis: false,
      mopCreation: false,
      mopValidation: false,
      schedulingApprovals: false,
      networkExecution: false,
    };
    setData((prev) => [...prev, newRow]);
    setAddOpen(false);
    showSnack(`${form.employeeName} added successfully.`);
  }, []);

  const handleBulkAction = useCallback(
    (table: MRT_TableInstance<TaskData>, enable: boolean): void => {
      const selectedIds = table
        .getSelectedRowModel()
        .rows.map((r: MRT_Row<TaskData>) => r.original.id);
      if (!selectedIds.length) return;
      setData((prev) =>
        prev.map((row) => {
          if (!selectedIds.includes(row.id)) return row;
          const updated = ALL_TASK_KEYS.reduce<Partial<TaskFlags>>(
            (acc, k) => ({ ...acc, [k]: enable }),
            {},
          );
          return { ...row, ...updated };
        }),
      );
      table.resetRowSelection();
      showSnack(
        `${selectedIds.length} employee(s) ${enable ? "fully enabled" : "fully restricted"}.`,
      );
    },
    [],
  );

  // ── Derived Stats ──────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const total = data.length;
    const totalToggles = total * ALL_TASK_KEYS.length;
    const activeToggles = data.reduce(
      (s, r) => s + ALL_TASK_KEYS.filter((k) => r[k]).length,
      0,
    );
    const fullAccess = data.filter((r) =>
      ALL_TASK_KEYS.every((k) => r[k]),
    ).length;
    const restricted = total - fullAccess;
    return { total, totalToggles, activeToggles, fullAccess, restricted };
  }, [data]);

  // ── Filtered Data ──────────────────────────────────────────────────────────

  const filteredData = useMemo<TaskData[]>(() => {
    const q = search.toLowerCase();
    return data.filter(
      (r) =>
        (levelFilter === "All" || r.employeeLevel === levelFilter) &&
        (r.employeeName.toLowerCase().includes(q) ||
          r.olmId.toLowerCase().includes(q)),
    );
  }, [data, search, levelFilter]);

  // ── Columns ────────────────────────────────────────────────────────────────

  const columns = useMemo<MRT_ColumnDef<TaskData>[]>(
    () => [
      {
        accessorKey: "olmId",
        header: "OLM ID",
        size: 105,

        Cell: ({ cell }) => (
          <Typography
            sx={{
              fontSize: 12,
              fontWeight: 700,
              color: "text.secondary",
              fontFamily: "monospace",
            }}
          >
            {cell.getValue<string>()}
          </Typography>
        ),
      },
      {
        accessorKey: "employeeName",
        header: "Employee",
        size: 210,
        Cell: ({ cell }) => {
          const name = cell.getValue<string>();
          return (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Avatar
                sx={{
                  width: 28,
                  height: 28,
                  fontSize: 11,
                  fontWeight: 700,
                  bgcolor: "primary.light",
                  color: "primary.dark",
                  flexShrink: 0,
                }}
              >
                {getInitials(name)}
              </Avatar>
              <Typography sx={{ fontSize: 13 }}>{name}</Typography>
            </Box>
          );
        },
      },
      {
        accessorKey: "employeeLevel",
        header: "Level",
        size: 70,
        Cell: ({ cell }) => {
          const level = cell.getValue<EmployeeLevel>();
          const colorMap: Record<
            EmployeeLevel,
            "secondary" | "primary" | "success"
          > = {
            L4: "secondary",
            L3: "primary",
            L2: "success",
          };
          return (
            <Chip
              label={level}
              size="small"
              color={colorMap[level]}
              variant="outlined"
              sx={{ fontSize: 11, fontWeight: 700, height: 20 }}
            />
          );
        },
      },
      {
        accessorKey: "roll",
        header: "Role",
        size: 95,
        Cell: ({ cell }) => {
          const role = cell.getValue<EmployeeRole>();
          return (
            <Chip
              label={role}
              size="small"
              variant="filled"
              color={role === "Contract" ? "warning" : "default"}
              sx={{ fontSize: 11, height: 20 }}
            />
          );
        },
      },
      // ── Task Toggle Columns ──
      ...TASK_COLUMNS.map<MRT_ColumnDef<TaskData>>((col) => ({
        accessorKey: col.key,
        header: col.label,

        Header: () => (
          <Tooltip title={col.fullLabel} placement="top" arrow>
            <Typography
              sx={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              {col.label}
            </Typography>
          </Tooltip>
        ),
        size: 80,
        enableSorting: false,

        Cell: ({
          cell,
          row,
        }: {
          cell: MRT_Cell<TaskData, unknown>;
          row: MRT_Row<TaskData>;
        }) => (
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Tooltip
              title={`${cell.getValue() ? "Disable" : "Enable"} ${col.fullLabel}`}
              placement="top"
              arrow
            >
              <ActionSwitch
                size="small"
                checked={Boolean(cell.getValue())}
                onChange={() => handleToggle(row.original.id, col.key)}
              />
            </Tooltip>
          </Box>
        ),
      })),
      // ── Access Column ──
      // {
      //   id: "access",
      //   header: "Access",
      //   size: 80,
      //   enableSorting: false,
      //   Cell: ({ row }: { row: MRT_Row<TaskData> }) => (
      //     <AccessBar percent={getAccessPercent(row.original)} />
      //   ),
      // },
      // // ── Actions Column ──
      // {
      //   id: "actions",
      //   header: "Actions",
      //   size: 80,
      //   enableSorting: false,
      //   Cell: ({ row }: { row: MRT_Row<TaskData> }) => {
      //     const allEnabled = ALL_TASK_KEYS.every((k) => row.original[k]);
      //     return (
      //       <Box sx={{ display: "flex", gap: 0.5, justifyContent: "center" }}>
      //         <Tooltip
      //           title={allEnabled ? "Disable all tasks" : "Enable all tasks"}
      //           placement="top"
      //           arrow
      //         >
      //           <IconButton
      //             size="small"
      //             onClick={() => handleEnableAll(row.original.id)}
      //             sx={{
      //               color: allEnabled ? "error.light" : "success.main",
      //               p: 0.5,
      //             }}
      //           >
      //             {allEnabled ? (
      //               <DoNotDisturbAltIcon fontSize="small" />
      //             ) : (
      //               <CheckCircleOutlineIcon fontSize="small" />
      //             )}
      //           </IconButton>
      //         </Tooltip>
      //         <Tooltip title="Remove employee" placement="top" arrow>
      //           <IconButton
      //             size="small"
      //             onClick={() =>
      //               handleDelete(row.original.id, row.original.employeeName)
      //             }
      //             sx={{
      //               color: "text.disabled",
      //               p: 0.5,
      //               "&:hover": { color: "error.main" },
      //             }}
      //           >
      //             <DeleteOutlineIcon fontSize="small" />
      //           </IconButton>
      //         </Tooltip>
      //       </Box>
      //     );
      //   },
      // },
    ],
    [data, handleToggle, handleEnableAll, handleDelete],
  );

  // ── Table ──────────────────────────────────────────────────────────────────

  const table = useMaterialReactTable<TaskData>({
    columns,
    data: filteredData,
    enableColumnActions: false,
    enableSorting: true,
    enablePagination: false,
    enableRowSelection: true,
    initialState: { density: "compact" },
    muiTablePaperProps: {
      elevation: 0,
      sx: {
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        overflow: "hidden",
      },
    },

    muiTableHeadCellProps: {
      align: "center",
      sx: {
        backgroundColor: "rgba(0,0,0,0.02)",
        fontWeight: 700,
        fontSize: "11px",
        textTransform: "uppercase",
        letterSpacing: "0.5px",
        borderBottom: "2px solid",
        borderColor: "divider",
      },
    },
    muiTableBodyRowProps: {
      sx: { "&:hover": { backgroundColor: "rgba(24, 95, 165, 0.03)" } },
    },

    muiTableBodyCellProps: {
      align: "center",
      sx: {
        textAlign: "center",
      },
    },
    renderTopToolbarCustomActions: () => (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          flexWrap: "wrap",
          py: 0.5,
        }}
      >
        {table.getSelectedRowModel().rows.length > 0 && (
          <>
            <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
              {table.getSelectedRowModel().rows.length} selected:
            </Typography>
            <Button
              size="small"
              variant="outlined"
              color="success"
              startIcon={<LockOpenOutlinedIcon />}
              onClick={() => handleBulkAction(table, true)}
              sx={{ fontSize: 12, py: 0.25 }}
            >
              Enable all
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="error"
              startIcon={<LockOutlinedIcon />}
              onClick={() => handleBulkAction(table, false)}
              sx={{ fontSize: 12, py: 0.25 }}
            >
              Disable all
            </Button>
          </>
        )}
      </Box>
    ),
  });

  // ── Render ─────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 1 }}>
      {/* Stats */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 1,
          mb: 2,
        }}
      >
        <StatCard
          label="Total Employees"
          value={stats.total}
          icon={<PeopleAltOutlinedIcon fontSize="small" />}
          color="#185FA5"
        />
        <StatCard
          label="Tasks Enabled"
          value={`${stats.activeToggles}/${stats.totalToggles}`}
          icon={<TaskAltIcon fontSize="small" />}
          color="#0F6E56"
        />
        <StatCard
          label="Full Access"
          value={stats.fullAccess}
          icon={<LockOpenOutlinedIcon fontSize="small" />}
          color="#3B6D11"
        />
        <StatCard
          label="Restricted"
          value={stats.restricted}
          icon={<LockOutlinedIcon fontSize="small" />}
          color="#854F0B"
        />
      </Box>

      {/* Table */}
      <MaterialReactTable table={table} />

      {/* Add Dialog */}
      <AddEmployeeDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdd={handleAdd}
      />

      {/* Snackbar */}
      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={closeSnack}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={closeSnack}
          severity={snack.severity}
          variant="filled"
          sx={{ fontSize: 13 }}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TaskConfig;
