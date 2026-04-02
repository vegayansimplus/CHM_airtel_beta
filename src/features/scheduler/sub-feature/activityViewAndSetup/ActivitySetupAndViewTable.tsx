import React, { useMemo, useState, useCallback } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
  type MRT_Row,
  type MRT_Column,
} from "material-react-table";
import { type Row } from "@tanstack/react-table";
import {
  Box,
  Checkbox,
  Chip,
  FormControl,
  MenuItem,
  Select,
  IconButton,
  Tooltip,
  Typography,
  Paper,
  Avatar,
  Divider,
  Stack,
  alpha,
  darken,
  lighten,
  useTheme,
} from "@mui/material";
import EditNoteIcon from "@mui/icons-material/EditNote";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import BoltIcon from "@mui/icons-material/Bolt";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import RadioButtonCheckedIcon from "@mui/icons-material/RadioButtonChecked";
import LayersIcon from "@mui/icons-material/Layers";
import SpeedIcon from "@mui/icons-material/Speed";
import { useTabColorTokens, tokens } from "../../../../style/theme";

// ─── Static Data ──────────────────────────────────────────────────────────────
// (Unchanged from your original code)
const STATIC_DATA: Record<string, any>[] = [
  {
    ActivityID: 65,
    Team_Function: "IP Core",
    Team_SubFunction: "CEN-Core",
    Activity_Name: "B2B Link Addition",
    PlanType: "Back to Back Link addition",
    Infra_Service_GUI_CLI: "Infra",
    Activity_Executed_By: "Bharti",
    Vendor_OEM: "Cisco",
    Plan: "Automated",
    Priority: "P1",
    Days_Margin: 5,
    Reservation_Margin: 30,
    Approval_Required: "Yes",
    Approving_Authority: "COH/CTO",
    Vendor_Executor: "Cisco",
    Technology: "CEN",
    Device_Type: "AGG/ACC/Sub-acc",
    Change_Impact: "NSA",
    Type_of_CR: "TX-R(OPs)-I(NOC-SE&OPs)_CEN",
    CRQ_Review_Shift: "LG,N",
    Impact_Analysis_Shift: "LG,N",
    Activity_Comm_Shift: "LG",
    Scheduling_of_Activity_Time: 30,
    Scheduling_of_Activity_Shift: "G",
    Scheduling_of_Activity_Level: "L4",
    CRQ_Review_Min_Level_Req: "L2",
    CRQ_Review_Time: 15,
    CRQ_Review_Engi_Req: 1,
    CRQ_Review_Remark: "—",
    Follow_Up: "LG,N",
    Impact_Analysis_Engi_Req: 1,
    Impact_Analysis_Min_Level_Req: "L2",
    Impact_Analysis_Time: 30,
    MOP_Creation_Shift: "LG",
    MOP_Creation_Time: 120,
    MOP_Creation_Engi_Req: 1,
    MOP_Creation_Min_Level_Req: "L2",
    MOP_Creation_Remark: "—",
    MOP_Validation_Shift: "LG",
    MOP_Validation_Time: 10,
    MOP_Validation_Engi_Req: 1,
    MOP_Validation_Min_Level_Req: "L2",
    MOP_Validation_Remark: "—",
    Activity_NW_Exec_Shift: "N",
    Activity_Exec_Engi_Req: 1,
    Activity_Time: 120,
    Rollback_Time: 120,
    Activity_Exec_Min_Level_Req: "L2",
    Activity_Exec_Remark: "—",
    Edited_By: "—",
    Edited_Reason: "—",
    Activity_Status: "Active",
  },
  {
    ActivityID: 44,
    Team_Function: "IP Core",
    Team_SubFunction: "CEN-Core",
    Activity_Name: "Card Insertion",
    PlanType: "Card Addition",
    Infra_Service_GUI_CLI: "GUI",
    Activity_Executed_By: "Monali",
    Vendor_OEM: "Cisco/ALCATEL/Huawei",
    Plan: "Manual",
    Priority: "P2",
    Days_Margin: 5,
    Reservation_Margin: 30,
    Approval_Required: "Yes",
    Approving_Authority: "BAU",
    Vendor_Executor: "Cisco/Nokia/Huawei",
    Technology: "CEN",
    Device_Type: "Cisco/Nokia/Huawei",
    Change_Impact: "NSA",
    Type_of_CR: "TX-R(OPs)-I(NOC-SE&OPs)_CEN",
    CRQ_Review_Shift: "A, B, G, LG",
    Impact_Analysis_Shift: "A, B, G, LG",
    Activity_Comm_Shift: "A, B, G, LG",
    Scheduling_of_Activity_Time: 5,
    Scheduling_of_Activity_Shift: "G",
    Scheduling_of_Activity_Level: "L4",
    CRQ_Review_Min_Level_Req: "L1",
    CRQ_Review_Time: 1,
    CRQ_Review_Engi_Req: 15,
    CRQ_Review_Remark: "—",
    Follow_Up: "G, LG, B",
    Impact_Analysis_Engi_Req: 1,
    Impact_Analysis_Min_Level_Req: "L1",
    Impact_Analysis_Time: 30,
    MOP_Creation_Shift: "A, B, G, LG",
    MOP_Creation_Time: 30,
    MOP_Creation_Engi_Req: 1,
    MOP_Creation_Min_Level_Req: "L1",
    MOP_Creation_Remark: "—",
    MOP_Validation_Shift: "A, B, G, LG",
    MOP_Validation_Time: 30,
    MOP_Validation_Engi_Req: 1,
    MOP_Validation_Min_Level_Req: "L3",
    MOP_Validation_Remark: "—",
    Activity_NW_Exec_Shift: "N",
    Activity_Exec_Engi_Req: 1,
    Activity_Time: 30,
    Rollback_Time: 30,
    Activity_Exec_Min_Level_Req: "L2",
    Activity_Exec_Remark: "—",
    Edited_By: "Admin",
    Edited_Reason: "Minor fix",
    Activity_Status: "Active",
  },
  {
    ActivityID: 45,
    Team_Function: "IP Core",
    Team_SubFunction: "CEN-Core",
    Activity_Name: "Card Removal",
    PlanType: "Card Deletion",
    Infra_Service_GUI_CLI: "CLI",
    Activity_Executed_By: "Bharti",
    Vendor_OEM: "Cisco/ALCATEL/Huawei",
    Plan: "Manual",
    Priority: "P3",
    Days_Margin: 5,
    Reservation_Margin: 30,
    Approval_Required: "Yes",
    Approving_Authority: "BAU",
    Vendor_Executor: "Cisco/Nokia/Huawei",
    Technology: "CEN",
    Device_Type: "Cisco/Nokia/Huawei",
    Change_Impact: "NSA",
    Type_of_CR: "TX-R(OPs)-I(NOC-SE&OPs)_CEN",
    CRQ_Review_Shift: "A, B, G, LG",
    Impact_Analysis_Shift: "A, B, G, LG",
    Activity_Comm_Shift: "A, B, G, LG",
    Scheduling_of_Activity_Time: 5,
    Scheduling_of_Activity_Shift: "G",
    Scheduling_of_Activity_Level: "L4",
    CRQ_Review_Min_Level_Req: "L1",
    CRQ_Review_Time: 15,
    CRQ_Review_Engi_Req: 1,
    CRQ_Review_Remark: "—",
    Follow_Up: "G, LG, B",
    Impact_Analysis_Engi_Req: 1,
    Impact_Analysis_Min_Level_Req: "L1",
    Impact_Analysis_Time: 30,
    MOP_Creation_Shift: "A, B, G, LG",
    MOP_Creation_Time: 30,
    MOP_Creation_Engi_Req: 1,
    MOP_Creation_Min_Level_Req: "L1",
    MOP_Creation_Remark: "—",
    MOP_Validation_Shift: "A, B, G, LG",
    MOP_Validation_Time: 30,
    MOP_Validation_Engi_Req: 1,
    MOP_Validation_Min_Level_Req: "L3",
    MOP_Validation_Remark: "—",
    Activity_NW_Exec_Shift: "N",
    Activity_Exec_Engi_Req: 1,
    Activity_Time: 30,
    Rollback_Time: 30,
    Activity_Exec_Min_Level_Req: "L2",
    Activity_Exec_Remark: "—",
    Edited_By: "—",
    Edited_Reason: "—",
    Activity_Status: "Inactive",
  },
  {
    ActivityID: 78,
    Team_Function: "Transport",
    Team_SubFunction: "MPLS-Core",
    Activity_Name: "Route Reconfiguration",
    PlanType: "Route Update",
    Infra_Service_GUI_CLI: "CLI",
    Activity_Executed_By: "Rajesh",
    Vendor_OEM: "Juniper",
    Plan: "Automated",
    Priority: "P1",
    Days_Margin: 3,
    Reservation_Margin: 45,
    Approval_Required: "Yes",
    Approving_Authority: "COH",
    Vendor_Executor: "Juniper",
    Technology: "MPLS",
    Device_Type: "PE/P Router",
    Change_Impact: "SA",
    Type_of_CR: "TX-R(NOC-SE)-I(NOC-SE)_MPLS",
    CRQ_Review_Shift: "A, G",
    Impact_Analysis_Shift: "A, G",
    Activity_Comm_Shift: "A",
    Scheduling_of_Activity_Time: 20,
    Scheduling_of_Activity_Shift: "A",
    Scheduling_of_Activity_Level: "L3",
    CRQ_Review_Min_Level_Req: "L3",
    CRQ_Review_Time: 30,
    CRQ_Review_Engi_Req: 2,
    CRQ_Review_Remark: "Critical path",
    Follow_Up: "A, G",
    Impact_Analysis_Engi_Req: 2,
    Impact_Analysis_Min_Level_Req: "L3",
    Impact_Analysis_Time: 60,
    MOP_Creation_Shift: "A, G",
    MOP_Creation_Time: 180,
    MOP_Creation_Engi_Req: 2,
    MOP_Creation_Min_Level_Req: "L3",
    MOP_Creation_Remark: "Peer review needed",
    MOP_Validation_Shift: "G",
    MOP_Validation_Time: 45,
    MOP_Validation_Engi_Req: 1,
    MOP_Validation_Min_Level_Req: "L4",
    MOP_Validation_Remark: "—",
    Activity_NW_Exec_Shift: "N",
    Activity_Exec_Engi_Req: 2,
    Activity_Time: 240,
    Rollback_Time: 180,
    Activity_Exec_Min_Level_Req: "L3",
    Activity_Exec_Remark: "Dual engineer",
    Edited_By: "Lead",
    Edited_Reason: "Scope update",
    Activity_Status: "Active",
  },
  {
    ActivityID: 92,
    Team_Function: "Security",
    Team_SubFunction: "Firewall",
    Activity_Name: "Policy Deployment",
    PlanType: "Security Policy",
    Infra_Service_GUI_CLI: "GUI",
    Activity_Executed_By: "Priya",
    Vendor_OEM: "Palo Alto",
    Plan: "Manual",
    Priority: "P2",
    Days_Margin: 7,
    Reservation_Margin: 60,
    Approval_Required: "Yes",
    Approving_Authority: "CISO",
    Vendor_Executor: "Palo Alto",
    Technology: "NGFW",
    Device_Type: "Firewall",
    Change_Impact: "NSA",
    Type_of_CR: "SEC-R(SecOps)-I(NOC-SE)_FW",
    CRQ_Review_Shift: "G",
    Impact_Analysis_Shift: "G, LG",
    Activity_Comm_Shift: "G",
    Scheduling_of_Activity_Time: 15,
    Scheduling_of_Activity_Shift: "G",
    Scheduling_of_Activity_Level: "L4",
    CRQ_Review_Min_Level_Req: "L2",
    CRQ_Review_Time: 20,
    CRQ_Review_Engi_Req: 1,
    CRQ_Review_Remark: "—",
    Follow_Up: "G",
    Impact_Analysis_Engi_Req: 1,
    Impact_Analysis_Min_Level_Req: "L2",
    Impact_Analysis_Time: 45,
    MOP_Creation_Shift: "G",
    MOP_Creation_Time: 90,
    MOP_Creation_Engi_Req: 1,
    MOP_Creation_Min_Level_Req: "L2",
    MOP_Creation_Remark: "—",
    MOP_Validation_Shift: "G",
    MOP_Validation_Time: 20,
    MOP_Validation_Engi_Req: 1,
    MOP_Validation_Min_Level_Req: "L3",
    MOP_Validation_Remark: "Security sign-off",
    Activity_NW_Exec_Shift: "LG",
    Activity_Exec_Engi_Req: 1,
    Activity_Time: 60,
    Rollback_Time: 45,
    Activity_Exec_Min_Level_Req: "L2",
    Activity_Exec_Remark: "—",
    Edited_By: "—",
    Edited_Reason: "—",
    Activity_Status: "Active",
  },
];

// ─── Modern Stat Card ──────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  accentColor: string;
  surface: string;
  textPrimary: string;
  textSecondary: string;
  isDark: boolean;
}

function StatCard({
  label,
  value,
  icon,
  accentColor,
  surface,
  textPrimary,
  textSecondary,
  isDark,
}: StatCardProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        flex: 1,
        minWidth: 160,
        display: "flex",
        alignItems: "center",
        gap: 2,
        bgcolor: surface,
        border: `1px solid ${isDark ? alpha(accentColor, 0.2) : alpha("#000", 0.06)}`,
        borderLeft: `4px solid ${accentColor}`,
        borderRadius: 2,
        boxShadow: isDark
          ? "0 4px 12px rgba(0,0,0,0.4)"
          : `0 4px 16px ${alpha(accentColor, 0.08)}`,
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: isDark
            ? "0 6px 16px rgba(0,0,0,0.5)"
            : `0 6px 20px ${alpha(accentColor, 0.15)}`,
        },
      }}
    >
      <Avatar
        sx={{
          width: 44,
          height: 44,
          bgcolor: alpha(accentColor, isDark ? 0.15 : 0.1),
          color: isDark ? accentColor : darken(accentColor, 0.1),
        }}
      >
        {icon}
      </Avatar>
      <Box>
        <Typography
          sx={{
            fontSize: "1.45rem",
            fontWeight: 800,
            color: textPrimary,
            lineHeight: 1.1,
          }}
        >
          {value}
        </Typography>
        <Typography
          sx={{
            fontSize: "0.75rem",
            color: textSecondary,
            mt: 0.5,
            fontWeight: 500,
            letterSpacing: "0.02em",
          }}
        >
          {label}
        </Typography>
      </Box>
    </Paper>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export const ActivitySetupAndViewTable: React.FC = () => {
  const theme = useTheme();
  const t = useTabColorTokens(theme);
  const colorTokens = tokens(theme.palette.mode);

  // Helper to ensure text is readable on light mode chips
  const getContrastText = (color: string) =>
    t.isDark ? color : darken(color, 0.35);

  // ── Semantic colour aliases ──────────────────────────────────────────────────
  const P_META = useMemo(
    () => ({
      P1: {
        bg: t.danger,
        text: getContrastText(t.danger),
        dim: alpha(t.danger, t.isDark ? 0.15 : 0.08),
        border: alpha(t.danger, t.isDark ? 0.3 : 0.2),
      },
      P2: {
        bg: t.isDark ? colorTokens.redAccent[400] : colorTokens.redAccent[500],
        text: getContrastText(
          t.isDark ? colorTokens.redAccent[400] : colorTokens.redAccent[500],
        ),
        dim: alpha(
          t.isDark ? colorTokens.redAccent[400] : colorTokens.redAccent[500],
          t.isDark ? 0.15 : 0.08,
        ),
        border: alpha(
          t.isDark ? colorTokens.redAccent[400] : colorTokens.redAccent[500],
          t.isDark ? 0.3 : 0.2,
        ),
      },
      P3: {
        bg: t.success,
        text: getContrastText(t.success),
        dim: alpha(t.success, t.isDark ? 0.15 : 0.08),
        border: alpha(t.success, t.isDark ? 0.3 : 0.2),
      },
    }),
    [t, colorTokens],
  );

  const STATUS_META = useMemo(
    () => ({
      Active: {
        bg: t.success,
        text: getContrastText(t.success),
        dim: alpha(t.success, t.isDark ? 0.15 : 0.08),
        border: alpha(t.success, t.isDark ? 0.3 : 0.2),
      },
      Inactive: {
        bg: t.danger,
        text: getContrastText(t.danger),
        dim: alpha(t.danger, t.isDark ? 0.15 : 0.08),
        border: alpha(t.danger, t.isDark ? 0.3 : 0.2),
      },
    }),
    [t],
  );

  const PLAN_META = useMemo(
    () => ({
      Automated: { color: getContrastText(t.accent) },
      Manual: { color: getContrastText(t.info) },
    }),
    [t],
  );

  const G = useMemo(
    () => ({
      identity: t.accent,
      planning: t.isDark
        ? colorTokens.blueAccent[400]
        : colorTokens.blueAccent[600],
      scheduling: t.isDark ? t.success : darken(t.success, 0.1),
      crq: t.isDark ? colorTokens.redAccent[400] : colorTokens.redAccent[600],
      mop: t.isDark
        ? colorTokens.greenAccent[400]
        : colorTokens.greenAccent[600],
      exec: t.isDark ? t.danger : darken(t.danger, 0.1),
      actions: t.textDim,
    }),
    [t, colorTokens],
  );

  // ── State ────────────────────────────────────────────────────────────────
  const [tableData, setTableData] =
    useState<Record<string, any>[]>(STATIC_DATA);

  const stats = useMemo(
    () => ({
      total: tableData.length,
      active: tableData.filter((d) => d.Activity_Status === "Active").length,
      p1: tableData.filter((d) => d.Priority === "P1").length,
      automated: tableData.filter((d) => d.Plan === "Automated").length,
    }),
    [tableData],
  );

  const uniqueValues = useMemo(() => {
    const out: Record<string, string[]> = {};
    Object.keys(tableData[0] || {}).forEach((k) => {
      out[k] = Array.from(
        new Set(
          tableData
            .map((d) => String(d[k] ?? ""))
            .filter((v) => v && v !== "null"),
        ),
      );
    });
    return out;
  }, [tableData]);

  const handleDelete = useCallback(
    (id: number) =>
      setTableData((prev) => prev.filter((r) => r.ActivityID !== id)),
    [],
  );

  // ── Shared mini-components ───────────────────────────────────────────────

  const LevelChip = useCallback(
    ({ value, accent }: { value: string; accent: string }) => (
      <Chip
        label={value}
        size="small"
        sx={{
          bgcolor: alpha(accent, t.isDark ? 0.15 : 0.08),
          color: getContrastText(accent),
          border: `1px solid ${alpha(accent, t.isDark ? 0.3 : 0.2)}`,
          fontWeight: 700,
          fontSize: "0.68rem",
          height: 22,
          "& .MuiChip-label": { px: 1.2 },
        }}
      />
    ),
    [t.isDark],
  );

  const TimeValue = useCallback(
    ({ value }: { value: number }) => (
      <Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 0.5,
          color: getContrastText(t.accent),
          fontWeight: 600,
          fontSize: "0.78rem",
        }}
      >
        <SpeedIcon sx={{ fontSize: 13, color: alpha(t.textPrimary, 0.4) }} />
        {value}
        <Typography
          component="span"
          sx={{ color: t.textSecondary, fontSize: "0.68rem", fontWeight: 500 }}
        >
          min
        </Typography>
      </Box>
    ),
    [t],
  );

  const EngiDots = useCallback(
    ({ value }: { value: number }) => (
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        {Array.from({ length: Math.min(value, 5) }).map((_, i) => (
          <Box
            key={i}
            sx={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              bgcolor: t.isDark ? t.accent : darken(t.accent, 0.2),
              opacity: 0.85,
            }}
          />
        ))}
        {value > 5 && (
          <Typography
            sx={{ fontSize: "0.7rem", color: t.textSecondary, fontWeight: 600 }}
          >
            +{value - 5}
          </Typography>
        )}
      </Box>
    ),
    [t],
  );

  const MultiSelectFilter = useMemo(
    () =>
      React.memo(
        ({
          options,
          column,
        }: {
          options: string[];
          column: MRT_Column<Record<string, any>>;
        }) => (
          <FormControl sx={{ minWidth: 100 }} size="small">
            <Select
              multiple
              displayEmpty
              value={
                Array.isArray(column.getFilterValue())
                  ? (column.getFilterValue() as string[])
                  : []
              }
              onChange={(e) => {
                const v = e.target.value;
                column.setFilterValue(Array.isArray(v) ? v : [v]);
              }}
              renderValue={(sel) =>
                Array.isArray(sel) && sel.length > 0 ? (
                  <Typography
                    sx={{
                      fontSize: "0.75rem",
                      color: getContrastText(t.accent),
                      fontWeight: 600,
                    }}
                  >
                    {(sel as string[]).join(", ")}
                  </Typography>
                ) : (
                  <Typography
                    sx={{ fontSize: "0.75rem", color: t.textSecondary }}
                  >
                    Filter…
                  </Typography>
                )
              }
              variant="standard"
              disableUnderline
              sx={{
                fontSize: "0.75rem",
                color: t.textPrimary,
                "& .MuiSelect-icon": { color: t.textSecondary },
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    maxHeight: 220,
                    width: 210,
                    bgcolor: t.surface,
                    border: `1px solid ${t.isDark ? t.border : alpha("#000", 0.1)}`,
                    borderRadius: 2,
                    boxShadow: t.isDark
                      ? "0 8px 24px rgba(0,0,0,0.45)"
                      : "0 8px 24px rgba(0,0,0,0.08)",
                    "& .MuiMenuItem-root": {
                      fontSize: "0.78rem",
                      color: t.textPrimary,
                      "&:hover": { bgcolor: alpha(t.accent, 0.08) },
                    },
                  },
                },
              }}
            >
              {options.map((opt) => (
                <MenuItem key={opt} value={opt} sx={{ gap: 1 }}>
                  <Checkbox
                    checked={(
                      (column.getFilterValue() as string[]) || []
                    ).includes(opt)}
                    size="small"
                    sx={{
                      p: 0,
                      color: t.textDim,
                      "&.Mui-checked": { color: t.accent },
                    }}
                  />
                  {opt}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ),
      ),
    [t],
  );

  const mkFilter = useCallback(
    (key: string) => ({
      Filter: ({ column }: { column: MRT_Column<Record<string, any>> }) =>
        uniqueValues[key]?.length ? (
          <MultiSelectFilter options={uniqueValues[key]} column={column} />
        ) : null,
      filterFn: (
        row: Row<Record<string, any>>,
        id: string,
        filterValue: unknown,
      ) => {
        const fv = filterValue as string[];
        return !fv?.length || fv.includes(String(row.getValue(id) ?? ""));
      },
    }),
    [uniqueValues, MultiSelectFilter],
  );

  // ── Columns ───────────────────────────────────────────────────────────────
  const columns = useMemo<MRT_ColumnDef<Record<string, any>>[]>(
    () => [
      // ── IDENTITY ─────────────────────────────────────────────────────────
      {
        id: "grp_identity",
        header: "Identity",
        columns: [
          {
            accessorKey: "ActivityID",
            header: "ID",
            size: 80,
            ...mkFilter("ActivityID"),
            Cell: ({ cell }) => (
              <Typography
                sx={{
                  fontFamily: "monospace",
                  fontWeight: 700,
                  color: getContrastText(t.accent),
                  fontSize: "0.85rem",
                }}
              >
                #{cell.getValue<number>()}
              </Typography>
            ),
          },
          {
            accessorKey: "Activity_Name",
            header: "Activity",
            size: 160,
            ...mkFilter("Activity_Name"),
            Cell: ({ cell }) => (
              <Tooltip title={cell.getValue<string>() || ""} arrow>
                <Typography
                  sx={{
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    color: t.textPrimary,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: 150,
                  }}
                >
                  {cell.getValue<string>() || "—"}
                </Typography>
              </Tooltip>
            ),
          },
          {
            accessorKey: "PlanType",
            header: "Plan Type",
            size: 185,
            ...mkFilter("PlanType"),
            Cell: ({ cell }) => (
              <Tooltip title={cell.getValue<string>()} arrow>
                <Typography
                  sx={{
                    fontSize: "0.76rem",
                    color: t.textSecondary,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: 175,
                  }}
                >
                  {cell.getValue<string>()}
                </Typography>
              </Tooltip>
            ),
          },
          {
            accessorKey: "Team_Function",
            header: "Function",
            size: 120,
            ...mkFilter("Team_Function"),
            Cell: ({ cell }) => (
              <Typography
                sx={{
                  fontSize: "0.78rem",
                  color: t.textPrimary,
                  fontWeight: 500,
                }}
              >
                {cell.getValue<string>()}
              </Typography>
            ),
          },
          {
            accessorKey: "Team_SubFunction",
            header: "Sub-Function",
            size: 135,
            ...mkFilter("Team_SubFunction"),
            Cell: ({ cell }) => (
              <Typography sx={{ fontSize: "0.78rem", color: t.textSecondary }}>
                {cell.getValue<string>()}
              </Typography>
            ),
          },
          {
            accessorKey: "Technology",
            header: "Technology",
            size: 115,
            ...mkFilter("Technology"),
            Cell: ({ cell }) => (
              <LevelChip value={cell.getValue<string>()} accent={t.info} />
            ),
          },
          {
            accessorKey: "Device_Type",
            header: "Device Type",
            size: 175,
            ...mkFilter("Device_Type"),
            Cell: ({ cell }) => (
              <Typography sx={{ fontSize: "0.76rem", color: t.textSecondary }}>
                {cell.getValue<string>()}
              </Typography>
            ),
          },
          {
            accessorKey: "Activity_Status",
            header: "Status",
            size: 110,
            ...mkFilter("Activity_Status"),
            Cell: ({ cell }) => {
              const v = cell.getValue<string>();
              const meta = STATUS_META[v as keyof typeof STATUS_META];
              if (!meta)
                return (
                  <Typography sx={{ fontSize: "0.76rem" }}>{v}</Typography>
                );
              return (
                <Chip
                  icon={
                    v === "Active" ? (
                      <CheckCircleOutlineIcon
                        sx={{
                          fontSize: "13px !important",
                          color: `${meta.text} !important`,
                        }}
                      />
                    ) : (
                      <RadioButtonCheckedIcon
                        sx={{
                          fontSize: "13px !important",
                          color: `${meta.text} !important`,
                        }}
                      />
                    )
                  }
                  label={v}
                  size="small"
                  sx={{
                    bgcolor: meta.dim,
                    color: meta.text,
                    border: `1px solid ${meta.border}`,
                    fontWeight: 600,
                    fontSize: "0.7rem",
                    height: 24,
                    "& .MuiChip-label": { px: 1 },
                  }}
                />
              );
            },
          },
        ],
      },

      // ── PLANNING ─────────────────────────────────────────────────────────
      {
        id: "grp_planning",
        header: "Planning",
        columns: [
          {
            accessorKey: "Priority",
            header: "Priority",
            size: 95,
            ...mkFilter("Priority"),
            Cell: ({ cell }) => {
              const v = cell.getValue<string>();
              const meta = P_META[v as keyof typeof P_META];
              if (!meta)
                return (
                  <Typography
                    sx={{ fontSize: "0.76rem", color: t.textSecondary }}
                  >
                    {v}
                  </Typography>
                );
              return (
                <Chip
                  label={v}
                  size="small"
                  sx={{
                    bgcolor: meta.dim,
                    color: meta.text,
                    border: `1px solid ${meta.border}`,
                    fontWeight: 700,
                    fontSize: "0.7rem",
                    height: 24,
                    letterSpacing: "0.04em",
                    "& .MuiChip-label": { px: 1.2 },
                  }}
                />
              );
            },
          },
          {
            accessorKey: "Plan",
            header: "Plan Mode",
            size: 118,
            ...mkFilter("Plan"),
            Cell: ({ cell }) => {
              const v = cell.getValue<string>();
              const meta = PLAN_META[v as keyof typeof PLAN_META];
              return (
                <Box
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 0.5,
                    color: meta?.color || t.textSecondary,
                    fontWeight: 600,
                    fontSize: "0.76rem",
                  }}
                >
                  {v === "Automated" && <BoltIcon sx={{ fontSize: 15 }} />}
                  {v}
                </Box>
              );
            },
          },
          {
            accessorKey: "Infra_Service_GUI_CLI",
            header: "Interface",
            size: 105,
            ...mkFilter("Infra_Service_GUI_CLI"),
            Cell: ({ cell }) => {
              const v = cell.getValue<string>();
              const cMap: Record<string, string> = {
                GUI: getContrastText(t.success),
                CLI: getContrastText(
                  t.isDark
                    ? colorTokens.redAccent[400]
                    : colorTokens.redAccent[500],
                ),
                Infra: getContrastText(
                  t.isDark
                    ? colorTokens.blueAccent[400]
                    : colorTokens.blueAccent[500],
                ),
              };
              return (
                <Typography
                  sx={{
                    fontSize: "0.76rem",
                    fontWeight: 700,
                    color: cMap[v] || t.textSecondary,
                  }}
                >
                  {v || "—"}
                </Typography>
              );
            },
          },
          {
            accessorKey: "Activity_Executed_By",
            header: "Executed By",
            size: 145,
            ...mkFilter("Activity_Executed_By"),
            Cell: ({ cell }) => {
              const name = cell.getValue<string>();
              const initials = name
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);
              const palette = [
                t.accent,
                t.info,
                t.success,
                t.isDark
                  ? colorTokens.redAccent[400]
                  : colorTokens.redAccent[500],
              ];
              const baseColor =
                palette[(name?.charCodeAt(0) ?? 0) % palette.length];
              const cText = getContrastText(baseColor);
              return (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Avatar
                    sx={{
                      width: 26,
                      height: 26,
                      fontSize: "0.68rem",
                      fontWeight: 700,
                      bgcolor: alpha(baseColor, t.isDark ? 0.2 : 0.1),
                      color: cText,
                      border: `1px solid ${alpha(baseColor, 0.3)}`,
                    }}
                  >
                    {initials}
                  </Avatar>
                  <Typography
                    sx={{
                      fontSize: "0.78rem",
                      color: t.textPrimary,
                      fontWeight: 500,
                    }}
                  >
                    {name}
                  </Typography>
                </Box>
              );
            },
          },
          {
            accessorKey: "Vendor_OEM",
            header: "Vendor OEM",
            size: 175,
            ...mkFilter("Vendor_OEM"),
            Cell: ({ cell }) => (
              <Typography sx={{ fontSize: "0.76rem", color: t.textSecondary }}>
                {cell.getValue<string>() || "—"}
              </Typography>
            ),
          },
          {
            accessorKey: "Vendor_Executor",
            header: "Vendor Executor",
            size: 175,
            ...mkFilter("Vendor_Executor"),
            Cell: ({ cell }) => (
              <Typography sx={{ fontSize: "0.76rem", color: t.textSecondary }}>
                {cell.getValue<string>() || "—"}
              </Typography>
            ),
          },
          {
            accessorKey: "Days_Margin",
            header: "Days Margin",
            size: 118,
            ...mkFilter("Days_Margin"),
            Cell: ({ cell }) => (
              <Typography
                sx={{
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  color: getContrastText(t.success),
                }}
              >
                {cell.getValue<number>()} days
              </Typography>
            ),
          },
          {
            accessorKey: "Reservation_Margin",
            header: "Reservation Margin",
            size: 155,
            ...mkFilter("Reservation_Margin"),
            Cell: ({ cell }) => <TimeValue value={cell.getValue<number>()} />,
          },
          {
            accessorKey: "Approval_Required",
            header: "Approval",
            size: 108,
            ...mkFilter("Approval_Required"),
            Cell: ({ cell }) => {
              const v = cell.getValue<string>();
              const isYes = v === "Yes";
              const c = isYes
                ? getContrastText(
                    t.isDark
                      ? colorTokens.redAccent[400]
                      : colorTokens.redAccent[500],
                  )
                : t.textSecondary;
              return (
                <Chip
                  label={v}
                  size="small"
                  sx={{
                    bgcolor: alpha(c, 0.1),
                    color: c,
                    border: `1px solid ${alpha(c, 0.25)}`,
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    height: 24,
                  }}
                />
              );
            },
          },
          {
            accessorKey: "Approving_Authority",
            header: "Authority",
            size: 128,
            ...mkFilter("Approving_Authority"),
            Cell: ({ cell }) => (
              <Typography sx={{ fontSize: "0.78rem", color: t.textPrimary }}>
                {cell.getValue<string>()}
              </Typography>
            ),
          },
          {
            accessorKey: "Change_Impact",
            header: "Change Impact",
            size: 128,
            ...mkFilter("Change_Impact"),
            Cell: ({ cell }) => {
              const v = cell.getValue<string>();
              const c = v === "SA" ? t.danger : t.success;
              const cText = getContrastText(c);
              return (
                <Chip
                  label={v}
                  size="small"
                  sx={{
                    bgcolor: alpha(c, 0.1),
                    color: cText,
                    border: `1px solid ${alpha(c, 0.25)}`,
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    height: 24,
                  }}
                />
              );
            },
          },
          {
            accessorKey: "Type_of_CR",
            header: "CR Type",
            size: 215,
            ...mkFilter("Type_of_CR"),
            Cell: ({ cell }) => (
              <Tooltip title={cell.getValue<string>()} arrow>
                <Typography
                  sx={{
                    fontSize: "0.74rem",
                    color: t.textSecondary,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: 205,
                  }}
                >
                  {cell.getValue<string>()}
                </Typography>
              </Tooltip>
            ),
          },
        ],
      },

      // ── SCHEDULING ───────────────────────────────────────────────────────
      {
        id: "grp_scheduling",
        header: "Scheduling",
        columns: [
          {
            accessorKey: "Scheduling_of_Activity_Time",
            header: "Sched. Time",
            size: 125,
            ...mkFilter("Scheduling_of_Activity_Time"),
            Cell: ({ cell }) => <TimeValue value={cell.getValue<number>()} />,
          },
          {
            accessorKey: "Scheduling_of_Activity_Shift",
            header: "Sched. Shift",
            size: 118,
            ...mkFilter("Scheduling_of_Activity_Shift"),
            Cell: ({ cell }) => (
              <Typography sx={{ fontSize: "0.78rem", color: t.textPrimary }}>
                {cell.getValue<string>()}
              </Typography>
            ),
          },
          {
            accessorKey: "Scheduling_of_Activity_Level",
            header: "Sched. Level",
            size: 118,
            ...mkFilter("Scheduling_of_Activity_Level"),
            Cell: ({ cell }) => (
              <LevelChip value={cell.getValue<string>()} accent={t.success} />
            ),
          },
          {
            accessorKey: "Follow_Up",
            header: "Follow Up",
            size: 118,
            ...mkFilter("Follow_Up"),
            Cell: ({ cell }) => (
              <Typography sx={{ fontSize: "0.78rem", color: t.textSecondary }}>
                {cell.getValue<string>()}
              </Typography>
            ),
          },
          {
            accessorKey: "Activity_Comm_Shift",
            header: "Comm. Shift",
            size: 122,
            ...mkFilter("Activity_Comm_Shift"),
            Cell: ({ cell }) => (
              <Typography sx={{ fontSize: "0.78rem", color: t.textSecondary }}>
                {cell.getValue<string>()}
              </Typography>
            ),
          },
        ],
      },

      // ── CRQ REVIEW ───────────────────────────────────────────────────────
      {
        id: "grp_crq",
        header: "CRQ Review",
        columns: [
          {
            accessorKey: "CRQ_Review_Shift",
            header: "Shift",
            size: 128,
            ...mkFilter("CRQ_Review_Shift"),
            Cell: ({ cell }) => (
              <Typography sx={{ fontSize: "0.78rem", color: t.textPrimary }}>
                {cell.getValue<string>()}
              </Typography>
            ),
          },
          {
            accessorKey: "CRQ_Review_Min_Level_Req",
            header: "Min Level",
            size: 108,
            ...mkFilter("CRQ_Review_Min_Level_Req"),
            Cell: ({ cell }) => (
              <LevelChip value={cell.getValue<string>()} accent={G.crq} />
            ),
          },
          {
            accessorKey: "CRQ_Review_Time",
            header: "Time",
            size: 95,
            ...mkFilter("CRQ_Review_Time"),
            Cell: ({ cell }) => <TimeValue value={cell.getValue<number>()} />,
          },
          {
            accessorKey: "CRQ_Review_Engi_Req",
            header: "Engineers",
            size: 100,
            ...mkFilter("CRQ_Review_Engi_Req"),
            Cell: ({ cell }) => <EngiDots value={cell.getValue<number>()} />,
          },
          {
            accessorKey: "Impact_Analysis_Shift",
            header: "IA Shift",
            size: 128,
            ...mkFilter("Impact_Analysis_Shift"),
            Cell: ({ cell }) => (
              <Typography sx={{ fontSize: "0.78rem", color: t.textPrimary }}>
                {cell.getValue<string>()}
              </Typography>
            ),
          },
          {
            accessorKey: "Impact_Analysis_Min_Level_Req",
            header: "IA Min Level",
            size: 118,
            ...mkFilter("Impact_Analysis_Min_Level_Req"),
            Cell: ({ cell }) => (
              <LevelChip value={cell.getValue<string>()} accent={G.crq} />
            ),
          },
          {
            accessorKey: "Impact_Analysis_Time",
            header: "IA Time",
            size: 95,
            ...mkFilter("Impact_Analysis_Time"),
            Cell: ({ cell }) => <TimeValue value={cell.getValue<number>()} />,
          },
          {
            accessorKey: "Impact_Analysis_Engi_Req",
            header: "IA Engineers",
            size: 118,
            ...mkFilter("Impact_Analysis_Engi_Req"),
            Cell: ({ cell }) => <EngiDots value={cell.getValue<number>()} />,
          },
        ],
      },

      // ── MOP ──────────────────────────────────────────────────────────────
      {
        id: "grp_mop",
        header: "MOP",
        columns: [
          {
            accessorKey: "MOP_Creation_Shift",
            header: "Creation Shift",
            size: 138,
            ...mkFilter("MOP_Creation_Shift"),
            Cell: ({ cell }) => (
              <Typography sx={{ fontSize: "0.78rem", color: t.textPrimary }}>
                {cell.getValue<string>()}
              </Typography>
            ),
          },
          {
            accessorKey: "MOP_Creation_Time",
            header: "Creation Time",
            size: 128,
            ...mkFilter("MOP_Creation_Time"),
            Cell: ({ cell }) => <TimeValue value={cell.getValue<number>()} />,
          },
          {
            accessorKey: "MOP_Creation_Engi_Req",
            header: "Creation Engi.",
            size: 128,
            ...mkFilter("MOP_Creation_Engi_Req"),
            Cell: ({ cell }) => <EngiDots value={cell.getValue<number>()} />,
          },
          {
            accessorKey: "MOP_Creation_Min_Level_Req",
            header: "Creation Level",
            size: 128,
            ...mkFilter("MOP_Creation_Min_Level_Req"),
            Cell: ({ cell }) => (
              <LevelChip value={cell.getValue<string>()} accent={G.mop} />
            ),
          },
          {
            accessorKey: "MOP_Validation_Shift",
            header: "Validation Shift",
            size: 148,
            ...mkFilter("MOP_Validation_Shift"),
            Cell: ({ cell }) => (
              <Typography sx={{ fontSize: "0.78rem", color: t.textPrimary }}>
                {cell.getValue<string>()}
              </Typography>
            ),
          },
          {
            accessorKey: "MOP_Validation_Time",
            header: "Validation Time",
            size: 138,
            ...mkFilter("MOP_Validation_Time"),
            Cell: ({ cell }) => <TimeValue value={cell.getValue<number>()} />,
          },
          {
            accessorKey: "MOP_Validation_Engi_Req",
            header: "Validation Engi.",
            size: 138,
            ...mkFilter("MOP_Validation_Engi_Req"),
            Cell: ({ cell }) => <EngiDots value={cell.getValue<number>()} />,
          },
          {
            accessorKey: "MOP_Validation_Min_Level_Req",
            header: "Validation Level",
            size: 148,
            ...mkFilter("MOP_Validation_Min_Level_Req"),
            Cell: ({ cell }) => (
              <LevelChip value={cell.getValue<string>()} accent={G.mop} />
            ),
          },
        ],
      },

      // ── EXECUTION ────────────────────────────────────────────────────────
      {
        id: "grp_exec",
        header: "Execution",
        columns: [
          {
            accessorKey: "Activity_NW_Exec_Shift",
            header: "Exec. Shift",
            size: 118,
            ...mkFilter("Activity_NW_Exec_Shift"),
            Cell: ({ cell }) => (
              <Typography sx={{ fontSize: "0.78rem", color: t.textPrimary }}>
                {cell.getValue<string>()}
              </Typography>
            ),
          },
          {
            accessorKey: "Activity_Exec_Engi_Req",
            header: "Engineers",
            size: 108,
            ...mkFilter("Activity_Exec_Engi_Req"),
            Cell: ({ cell }) => <EngiDots value={cell.getValue<number>()} />,
          },
          {
            accessorKey: "Activity_Time",
            header: "Activity Time",
            size: 128,
            ...mkFilter("Activity_Time"),
            Cell: ({ cell }) => <TimeValue value={cell.getValue<number>()} />,
          },
          {
            accessorKey: "Rollback_Time",
            header: "Rollback Time",
            size: 128,
            ...mkFilter("Rollback_Time"),
            Cell: ({ cell }) => (
              <Box
                sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}
              >
                <Typography
                  sx={{ color: t.danger, fontSize: "0.85rem", fontWeight: 800 }}
                >
                  ↩
                </Typography>
                <TimeValue value={cell.getValue<number>()} />
              </Box>
            ),
          },
          {
            accessorKey: "Activity_Exec_Min_Level_Req",
            header: "Min Level",
            size: 108,
            ...mkFilter("Activity_Exec_Min_Level_Req"),
            Cell: ({ cell }) => (
              <LevelChip value={cell.getValue<string>()} accent={G.exec} />
            ),
          },
          {
            accessorKey: "Activity_Exec_Remark",
            header: "Exec. Remark",
            size: 148,
            ...mkFilter("Activity_Exec_Remark"),
            Cell: ({ cell }) => (
              <Typography
                sx={{
                  fontSize: "0.72rem",
                  color: t.textSecondary,
                  fontStyle: "italic",
                }}
              >
                {cell.getValue<string>() || "—"}
              </Typography>
            ),
          },
        ],
      },

      // ── ACTIONS ──────────────────────────────────────────────────────────
      {
        id: "actions",
        header: "Actions",
        enableColumnFilter: false,
        enableSorting: false,
        size: 90,
        Cell: ({ row }) => (
          <Box sx={{ display: "flex", gap: 1 }}>
            <Tooltip title="Edit" arrow>
              <IconButton
                size="small"
                sx={{
                  color: getContrastText(t.accent),
                  bgcolor: alpha(t.accent, 0.1),
                  width: 30,
                  height: 30,
                  "&:hover": { bgcolor: alpha(t.accent, 0.2) },
                }}
              >
                <EditNoteIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete" arrow>
              <IconButton
                size="small"
                onClick={() => handleDelete(row.original.ActivityID)}
                sx={{
                  color: getContrastText(t.danger),
                  bgcolor: alpha(t.danger, 0.1),
                  width: 30,
                  height: 30,
                  "&:hover": { bgcolor: alpha(t.danger, 0.2) },
                }}
              >
                <DeleteOutlineIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          </Box>
        ),
      },
    ],
    [
      mkFilter,
      t,
      colorTokens,
      P_META,
      STATUS_META,
      PLAN_META,
      G,
      LevelChip,
      TimeValue,
      EngiDots,
      handleDelete,
    ],
  );

  // ── Table instance ────────────────────────────────────────────────────────
  const table = useMaterialReactTable({
    columns,
    data: tableData,
    // enableColumnResizing: true,
    enableStickyHeader: true,
    enableColumnPinning: true,
    enablePagination: true,
    enableColumnFilters: true,
    enableGlobalFilter: true,
    columnFilterDisplayMode: "subheader",
    initialState: {
      density: "compact",
      columnPinning: { right: ["actions"] },
      pagination: { pageIndex: 0, pageSize: 10 },
    },

    // ── Paper ──
    muiTablePaperProps: {
      elevation: 0,
      sx: { bgcolor: "transparent", border: "none" },
    },

    // ── Container ──
    muiTableContainerProps: {
      sx: {
        maxHeight: "calc(100vh - 350px)",
        minHeight: 300,
        bgcolor: t.surface,
        "&::-webkit-scrollbar": { width: 8, height: 8 },
        "&::-webkit-scrollbar-track": { bgcolor: "transparent" },
        "&::-webkit-scrollbar-thumb": {
          bgcolor: t.isDark ? alpha("#fff", 0.15) : alpha("#000", 0.15),
          borderRadius: 4,
          border: `2px solid ${t.surface}`,
        },
        "&::-webkit-scrollbar-thumb:hover": {
          bgcolor: t.isDark ? alpha("#fff", 0.25) : alpha("#000", 0.25),
        },
      },
    },

    // ── Better Grouping Visuals in Light/Dark Mode ──
    muiTableHeadCellProps: ({ column }) => {
      const groupKey = (column.parent?.id ?? column.id).replace(
        "grp_",
        "",
      ) as keyof typeof G;
      const accent = G[groupKey] ?? t.textDim;
      const isGroup = !column.parent;
      return {
        sx: {
          bgcolor: t.surface, // Clean background instead of bright colored headers
          color: isGroup ? t.textPrimary : t.textSecondary,
          fontWeight: isGroup ? 800 : 600,
          fontSize: isGroup ? "0.78rem" : "0.72rem",
          letterSpacing: isGroup ? "0.03em" : "0.01em",
          textTransform: isGroup ? "uppercase" : "none",
          borderBottom: isGroup
            ? `3px solid ${accent}` // Highlight the group gently using a bottom border
            : `1px solid ${t.isDark ? t.border : alpha("#000", 0.08)}`,
          borderRight: `1px solid ${t.isDark ? t.border : alpha("#000", 0.04)}`,
          py: isGroup ? 1.5 : 1,
          whiteSpace: "nowrap",
          "& .Mui-TableHeadCell-Content-Labels": { color: "inherit" },
          "& .MuiTableSortLabel-icon": {
            color: `${t.textSecondary} !important`,
          },
          "&:hover": {
            bgcolor: alpha(t.accent, 0.04),
            transition: "background 0.2s",
          },
        },
      };
    },

    // ── Body cells ──
    muiTableBodyCellProps: {
      sx: {
        fontSize: "0.78rem",
        color: t.textPrimary,
        borderRight: `1px solid ${t.isDark ? t.border : alpha("#000", 0.04)}`,
        borderBottom: `1px solid ${t.isDark ? t.border : alpha("#000", 0.06)}`,
        padding: "0px 8px",
      },
    },
    muiTableBodyRowProps: {
      sx: {
        transition: "background 0.2s",
        "&:nth-of-type(odd) td": {
          bgcolor: t.isDark ? alpha(t.surface, 0.6) : alpha("#000", 0.01), // Soft contrast instead of dark overlays
        },
        "&:hover td": { bgcolor: alpha(t.accent, t.isDark ? 0.1 : 0.05) },
      },
    },

    // ── Toolbars ──
    muiTopToolbarProps: {
      sx: {
        bgcolor: t.surface,
        borderBottom: `1px solid ${t.isDark ? t.border : alpha("#000", 0.08)}`,
        p: 1.5,
        "& .MuiInputBase-root": {
          bgcolor: t.isDark ? alpha("#fff", 0.05) : alpha("#000", 0.03),
          color: t.textPrimary,
          borderRadius: 2,
          fontSize: "0.85rem",
          border: `1px solid ${t.isDark ? t.border : alpha("#000", 0.1)}`,
        },
      },
    },
    muiBottomToolbarProps: {
      sx: {
        bgcolor: t.surface,
        borderTop: `1px solid ${t.isDark ? t.border : alpha("#000", 0.08)}`,
        p: 1,
        "& .MuiTablePagination-root": { color: t.textSecondary },
      },
    },
    muiPaginationProps: { rowsPerPageOptions: [5, 10, 20, 50] },

    // ── Custom Actions ──
    renderTopToolbarCustomActions: () => (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, pl: 1 }}>
        <Chip
          icon={
            <LayersIcon
              sx={{
                fontSize: "15px !important",
                color: `${getContrastText(t.accent)} !important`,
              }}
            />
          }
          label={`${tableData.length} Records`}
          size="small"
          sx={{
            bgcolor: alpha(t.accent, 0.1),
            color: getContrastText(t.accent),
            fontWeight: 700,
            fontSize: "0.75rem",
            height: 28,
            borderRadius: 1.5,
          }}
        />

        {/* Legend */}
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          flexWrap="wrap"
          sx={{
            bgcolor: t.surface,
            px: 2,
            py: 1,
            borderRadius: 2,
            border: `1px solid ${t.isDark ? t.border : alpha("#000", 0.06)}`,
          }}
        >
          {Object.entries(P_META).map(([key, meta]) => (
            <Box
              key={key}
              sx={{ display: "flex", alignItems: "center", gap: 0.8 }}
            >
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  bgcolor: meta.bg,
                }}
              />
              <Typography
                sx={{
                  fontSize: "0.72rem",
                  color: t.textSecondary,
                  fontWeight: 600,
                }}
              >
                {key}
              </Typography>
            </Box>
          ))}
          <Divider
            orientation="vertical"
            flexItem
            sx={{
              borderColor: t.isDark ? t.border : alpha("#000", 0.1),
              mx: 1,
            }}
          />
          {Object.entries(STATUS_META).map(([key, meta]) => (
            <Box
              key={key}
              sx={{ display: "flex", alignItems: "center", gap: 0.8 }}
            >
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: 1,
                  bgcolor: meta.bg,
                }}
              />
              <Typography
                sx={{
                  fontSize: "0.72rem",
                  color: t.textSecondary,
                  fontWeight: 600,
                }}
              >
                {key}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Box>
    ),
    renderBottomToolbarCustomActions: () => (
     <>
     
     {/* ── Column Group Legend ── */}
      <Box
        sx={{
          mt: 2,
          display: "flex",
          gap: 2,
          flexWrap: "wrap",
          alignItems: "center",
          px: 1,
        }}
      >
        <Typography
          sx={{ fontSize: "0.72rem", color: t.textSecondary, fontWeight: 600 }}
        >
          Groups:
        </Typography>
        {(Object.entries(G) as [string, string][])
          .filter(([k]) => k !== "actions")
          .map(([key, color]) => (
            <Box
              key={key}
              sx={{ display: "flex", alignItems: "center", gap: 0.8 }}
            >
              <Box
                sx={{
                  width: 12,
                  height: 4,
                  borderRadius: 1,
                  bgcolor: color,
                  opacity: 0.8,
                }}
              />
              <Typography
                sx={{
                  fontSize: "0.7rem",
                  color: t.textSecondary,
                  textTransform: "capitalize",
                  fontWeight: 500,
                }}
              >
                {key}
              </Typography>
            </Box>
          ))}
      </Box>
     </>
    ),
  });

  return (
    <Box
      sx={{
        // p: { xs: 2, md: 3 },
        bgcolor: t.bg,
        minHeight: "100vh",
        fontFamily: theme.typography.fontFamily,
        // Softened the background gradients for a cleaner Light mode experience
        backgroundImage: t.isDark
          ? `radial-gradient(ellipse at 15% 8%,  ${alpha(t.accent, 0.05)} 0%, transparent 50%),
             radial-gradient(ellipse at 85% 88%, ${alpha(t.info, 0.04)} 0%, transparent 50%)`
          : `radial-gradient(ellipse at 15% 8%,  ${alpha(t.accent, 0.02)} 0%, transparent 50%),
             radial-gradient(ellipse at 85% 88%, ${alpha(t.success, 0.02)} 0%, transparent 50%)`,
      }}
    >
     
      {/* ── Table ── */}
      {/* <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          border: `1px solid ${t.isDark ? t.border : alpha("#000", 0.08)}`,
          bgcolor: t.surface,
          boxShadow: t.isDark
            ? "0 8px 32px rgba(0,0,0,0.4)"
            : "0 8px 24px rgba(0,0,0,0.04)",
        }}
      > */}
        <MaterialReactTable table={table} />
      {/* </Paper> */}

      
    </Box>
  );
};
