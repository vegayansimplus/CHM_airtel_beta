import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useTheme } from "@mui/material/styles";
import {
  Box,
  Typography,
  InputBase,
  CircularProgress,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Tooltip,
  alpha,
  Drawer,
} from "@mui/material";
import {
  ShieldOutlined,
  ViewModuleOutlined,
  SearchOutlined,
  AddOutlined,
  MoreHorizOutlined,
  CheckOutlined,
  EditOutlined,
  DeleteOutlined,
  ContentCopyOutlined,
  CloseOutlined,
  LockOutlined,
  LockOpenOutlined,
  ErrorOutlineOutlined,
  RefreshOutlined,
  WarningAmberOutlined,
  TuneOutlined,
} from "@mui/icons-material";
import {
  useGetRolesQuery,
  useGetModulesQuery,
  useGetPermissionTypesQuery,
  useEnablePermissionMutation,
  useDisablePermissionMutation,
  useGetAllRolePermissionsQuery,
  type RoleModel,
  type ModuleModel,
  type PermissionModel,
  type RolePermissionViewModel,
  type GrantedPermissionItem,
} from "./Globalsettingapislice";
import { useTabColorTokens } from "../../../style/theme";
import { RailItem } from "./RailItem";

// ─────────────────────────────────────────────────────────────
//  Constants
// ─────────────────────────────────────────────────────────────

const ROLE_LABEL: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  VERTICAL_HEAD: "Vertical Head",
  FUNCTION_HEAD: "Function Head",
  DOMAIN_HEAD: "Domain Head",
  SUB_DOMAIN_HEAD: "Sub-Domain Head",
  TEAM_MEMBER: "Team Member",
};

/**
 * Default permission types shown in every sub-module row.
 * These are seeded into local state and can be added/deleted freely
 * without any API call — changes stay client-side until you wire up a
 * persistence endpoint.
 */
const DEFAULT_PERMISSIONS: PermissionModel[] = [
  { permissionId: 1, permissionName: "View" },
  { permissionId: 2, permissionName: "Create" },
  { permissionId: 3, permissionName: "Update" },
  { permissionId: 4, permissionName: "Delete" },
  { permissionId: 5, permissionName: "Approve" },
  { permissionId: 6, permissionName: "Reject" },
];

// ─────────────────────────────────────────────────────────────
//  Local-only (unsaved) models
// ─────────────────────────────────────────────────────────────

interface LocalRole extends RoleModel {
  isLocal?: boolean;
}
interface LocalModule extends ModuleModel {
  isLocal?: boolean;
}

interface LocalSubModule {
  subModuleId: number;
  subModuleName: string;
  moduleId: number;
  isLocal?: boolean;
}

interface LocalPermission extends PermissionModel {
  isLocal?: boolean;
}

// ─────────────────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────────────────

const slug = (s: string) =>
  s
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_|_$/, "");

const newLocalId = () => -(Math.floor(Math.random() * 900_000) + 100_000);

function parseGrantedPermissions(
  raw: string | null | undefined,
): GrantedPermissionItem[] {
  if (!raw || raw === "null") return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as GrantedPermissionItem[]) : [];
  } catch {
    return [];
  }
}

function extractApiErrorMessage(err: unknown, fallback: string): string {
  if (
    err &&
    typeof err === "object" &&
    "data" in err &&
    err.data &&
    typeof err.data === "object" &&
    "message" in err.data &&
    typeof (err.data as { message: unknown }).message === "string"
  ) {
    return (err.data as { message: string }).message;
  }
  return fallback;
}

function extractErrorStatus(err: unknown): number | null {
  if (
    err &&
    typeof err === "object" &&
    "status" in err &&
    typeof (err as { status: unknown }).status === "number"
  ) {
    return (err as { status: number }).status;
  }
  return null;
}

// ─────────────────────────────────────────────────────────────
//  PermChip
// ─────────────────────────────────────────────────────────────

interface PermChipProps {
  label: string;
  granted: boolean;
  loading: boolean;
  onClick: () => void;
  c: ReturnType<typeof useTabColorTokens>;
}

const PermChip: React.FC<PermChipProps> = ({
  label,
  granted,
  loading,
  onClick,
  c,
}) => (
  <Tooltip
    title={granted ? "Click to disable" : "Click to enable"}
    placement="top"
  >
    <Box
      component="button"
      onClick={onClick}
      disabled={loading}
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        height: 30,
        px: "10px",
        borderRadius: "7px",
        border: `1px solid ${granted ? alpha(c.accent, 0.5) : c.border}`,
        bgcolor: granted ? alpha(c.accent, 0.1) : c.surface,
        color: granted ? c.accent : c.textSecondary,
        fontSize: "0.8rem",
        fontWeight: granted ? 600 : 400,
        cursor: loading ? "wait" : "pointer",
        opacity: loading ? 0.55 : 1,
        transition: "all 0.12s",
        fontFamily: "inherit",
        letterSpacing: "-0.005em",
        "&:hover:not(:disabled)": {
          border: `1px solid ${alpha(c.accent, 0.6)}`,
          bgcolor: alpha(c.accent, granted ? 0.18 : 0.07),
          color: c.accent,
        },
      }}
    >
      <Box
        sx={{
          width: 15,
          height: 15,
          borderRadius: "4px",
          border: `1.5px solid ${granted ? c.accent : alpha(c.textSecondary, 0.4)}`,
          bgcolor: granted ? c.accent : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          transition: "all 0.1s",
        }}
      >
        {loading ? (
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              border: `1.5px solid ${c.accent}`,
              borderTopColor: "transparent",
              animation: "spin 0.6s linear infinite",
              "@keyframes spin": { to: { transform: "rotate(360deg)" } },
            }}
          />
        ) : (
          granted && <CheckOutlined sx={{ fontSize: 10, color: "#fff" }} />
        )}
      </Box>
      {label}
    </Box>
  </Tooltip>
);

// ─────────────────────────────────────────────────────────────
//  SubModuleCard
// ─────────────────────────────────────────────────────────────

interface SubModuleCardProps {
  row: RolePermissionViewModel;
  allPermissions: PermissionModel[];
  grantedIds: Set<number>;
  loadingPermId: number | null;
  onToggle: (permissionId: number, currentGranted: boolean) => void;
  onMenuClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  c: ReturnType<typeof useTabColorTokens>;
}

const SubModuleCard: React.FC<SubModuleCardProps> = ({
  row,
  allPermissions,
  grantedIds,
  loadingPermId,
  onToggle,
  onMenuClick,
  c,
}) => {
  const noRecord = row.rolePermissionId === null && grantedIds.size === 0;

  return (
    <Box
      sx={{
        bgcolor: c.surface,
        border: `1px solid ${c.border}`,
        borderRadius: "10px",
        boxShadow: c.isDark
          ? "0 1px 0 rgba(255,255,255,0.04), 0 4px 16px -8px rgba(0,0,0,0.3)"
          : "0 1px 0 rgba(13,27,42,0.05), 0 4px 16px -8px rgba(13,27,42,0.08)",
        overflow: "hidden",
        transition: "border-color 0.12s",
        "&:hover": {
          borderColor: c.borderHover,
          "& .sub-menu-btn": { opacity: 1 },
        },
      }}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "minmax(180px, 240px) 1fr auto",
          alignItems: "center",
          gap: "16px",
          px: 2,
          py: 1.75,
        }}
      >
        {/* Info */}
        <Box sx={{ minWidth: 0 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                bgcolor: grantedIds.size > 0 ? c.accent : c.border,
                flexShrink: 0,
                transition: "background 0.15s",
              }}
            />
            <Typography
              fontSize="0.875rem"
              fontWeight={500}
              color={c.textPrimary}
              noWrap
            >
              {row.subModuleName}
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              gap: 1.5,
              alignItems: "center",
              mt: 0.5,
              flexWrap: "wrap",
            }}
          >
            <Typography
              fontSize="0.68rem"
              color={c.textDim}
              fontFamily="'JetBrains Mono', 'Courier New', monospace"
            >
              ID:{row.subModuleId}
            </Typography>
            <Typography fontSize="0.68rem" color={c.textSecondary}>
              {grantedIds.size}/{allPermissions.length} granted
            </Typography>
            {noRecord && (
              <Typography
                fontSize="0.62rem"
                color={c.textDim}
                sx={{
                  px: "5px",
                  py: "1px",
                  borderRadius: "4px",
                  border: `1px dashed ${c.border}`,
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                no record
              </Typography>
            )}
          </Box>
        </Box>

        {/* Chips */}
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: "6px",
            alignItems: "center",
          }}
        >
          {allPermissions.length === 0 ? (
            <Typography fontSize="0.75rem" color={c.textDim} fontStyle="italic">
              No permission types defined.
            </Typography>
          ) : (
            allPermissions.map((p) => (
              <PermChip
                key={p.permissionId}
                label={p.permissionName}
                granted={grantedIds.has(p.permissionId)}
                loading={loadingPermId === p.permissionId}
                onClick={() =>
                  onToggle(p.permissionId, grantedIds.has(p.permissionId))
                }
                c={c}
              />
            ))
          )}
        </Box>

        {/* Menu btn */}
        <Box
          component="button"
          className="sub-menu-btn"
          onClick={onMenuClick}
          sx={{
            opacity: 0,
            width: 28,
            height: 28,
            borderRadius: "6px",
            border: `1px solid ${c.border}`,
            bgcolor: "transparent",
            color: c.textDim,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "opacity 0.12s, background 0.1s",
            flexShrink: 0,
            "&:hover": {
              bgcolor: c.isDark
                ? "rgba(255,255,255,0.08)"
                : "rgba(13,27,42,0.06)",
              color: c.textPrimary,
            },
          }}
        >
          <MoreHorizOutlined sx={{ fontSize: 14 }} />
        </Box>
      </Box>
    </Box>
  );
};

// ─────────────────────────────────────────────────────────────
//  PermissionsErrorState
// ─────────────────────────────────────────────────────────────

interface PermissionsErrorStateProps {
  error: unknown;
  roleName: string;
  moduleName: string;
  onRetry: () => void;
  c: ReturnType<typeof useTabColorTokens>;
}

const PermissionsErrorState: React.FC<PermissionsErrorStateProps> = ({
  error,
  roleName,
  moduleName,
  onRetry,
  c,
}) => {
  const statusCode = extractErrorStatus(error);
  const apiMessage = extractApiErrorMessage(
    error,
    "An unexpected error occurred while loading permissions.",
  );

  const is500 = statusCode === 500;

  const icon = is500 ? (
    <WarningAmberOutlined sx={{ fontSize: 18, color: c.danger }} />
  ) : (
    <ErrorOutlineOutlined sx={{ fontSize: 18, color: c.danger }} />
  );

  const title = is500
    ? "Permissions Not Configured"
    : statusCode === 403
      ? "Access Denied"
      : statusCode === 404
        ? "Not Found"
        : "Failed to Load Permissions";

  const hint = is500
    ? "This role–module combination has no permission records in the database. Contact your administrator to set up permissions."
    : statusCode === 403
      ? "You don't have access to view permissions for this combination."
      : statusCode === 404
        ? "The requested resource could not be found."
        : "Check your network connection or try again in a moment.";

  return (
    <Box
      sx={{
        borderRadius: "12px",
        border: `1px solid ${alpha(c.danger, 0.25)}`,
        bgcolor: c.isDark ? alpha(c.danger, 0.05) : alpha(c.danger, 0.03),
        overflow: "hidden",
        position: "relative",
      }}
    >
      <Box
        sx={{
          height: 3,
          background: `linear-gradient(90deg, ${c.danger}, ${alpha(c.danger, 0.4)})`,
        }}
      />
      <Box sx={{ px: 3, py: 3 }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, mb: 2 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "10px",
              bgcolor: alpha(c.danger, 0.1),
              border: `1px solid ${alpha(c.danger, 0.2)}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                flexWrap: "wrap",
                mb: 0.5,
              }}
            >
              <Typography
                fontSize="0.9rem"
                fontWeight={600}
                color={c.danger}
                letterSpacing="-0.01em"
              >
                {title}
              </Typography>
              {statusCode && (
                <Box
                  sx={{
                    px: "7px",
                    py: "2px",
                    borderRadius: "5px",
                    bgcolor: alpha(c.danger, 0.1),
                    border: `1px solid ${alpha(c.danger, 0.2)}`,
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    color: c.danger,
                    fontFamily: "'JetBrains Mono', monospace",
                    letterSpacing: "0.02em",
                  }}
                >
                  {statusCode}
                </Box>
              )}
            </Box>
            <Typography fontSize="0.8rem" color={c.textSecondary} lineHeight={1.6}>
              {apiMessage}
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            px: 1.5,
            py: 1,
            borderRadius: "8px",
            bgcolor: c.isDark ? "rgba(255,255,255,0.03)" : "rgba(13,27,42,0.025)",
            border: `1px solid ${c.border}`,
            mb: 2.5,
            flexWrap: "wrap",
          }}
        >
          <ShieldOutlined sx={{ fontSize: 12, color: c.textDim }} />
          <Typography fontSize="0.72rem" color={c.textSecondary} fontWeight={500}>
            {roleName}
          </Typography>
          <Box sx={{ width: 3, height: 3, borderRadius: "50%", bgcolor: c.border }} />
          <ViewModuleOutlined sx={{ fontSize: 12, color: c.textDim }} />
          <Typography fontSize="0.72rem" color={c.textSecondary} fontWeight={500}>
            {moduleName}
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            gap: 1,
            px: 1.5,
            py: 1.25,
            borderRadius: "8px",
            bgcolor: c.isDark ? "rgba(255,255,255,0.025)" : "rgba(13,27,42,0.02)",
            border: `1px dashed ${c.border}`,
            mb: 2.5,
          }}
        >
          <Box
            sx={{
              width: 4,
              height: 4,
              borderRadius: "50%",
              bgcolor: c.textDim,
              mt: "7px",
              flexShrink: 0,
            }}
          />
          <Typography fontSize="0.75rem" color={c.textDim} lineHeight={1.6}>
            {hint}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <Box
            component="button"
            onClick={onRetry}
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              height: 32,
              px: "13px",
              borderRadius: "7px",
              fontSize: "0.78rem",
              fontWeight: 500,
              fontFamily: "inherit",
              cursor: "pointer",
              border: `1px solid ${alpha(c.danger, 0.4)}`,
              bgcolor: alpha(c.danger, 0.08),
              color: c.danger,
              transition: "all 0.1s",
              letterSpacing: "-0.005em",
              "&:hover": {
                bgcolor: alpha(c.danger, 0.14),
                border: `1px solid ${alpha(c.danger, 0.55)}`,
              },
              "&:active": { transform: "scale(0.98)" },
            }}
          >
            <RefreshOutlined sx={{ fontSize: 13 }} />
            Retry
          </Box>
          <Typography fontSize="0.7rem" color={c.textDim}>
            or select a different role / module combination
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

// ─────────────────────────────────────────────────────────────
//  DrawerKind
// ─────────────────────────────────────────────────────────────

type DrawerKind =
  | "role"
  | "module"
  | "edit-role"
  | "edit-module"
  | "sub-module"
  | "edit-sub-module"
  | "edit-permission"
  | "add-permission"     // ← NEW: create a new permission type
  | "manage-permissions"; // ← NEW: manage all permission types

interface DrawerState {
  kind: DrawerKind;
  target?: { id: number; label: string };
  contextModuleId?: number;
}

// ─────────────────────────────────────────────────────────────
//  ManagePermissionsDrawer  (NEW)
//  Full CRUD for the permission-type list
// ─────────────────────────────────────────────────────────────

interface ManagePermissionsDrawerProps {
  open: boolean;
  permissions: PermissionModel[];
  onClose: () => void;
  onAdd: (name: string) => void;
  onRename: (id: number, name: string) => void;
  onDelete: (id: number) => void;
  c: ReturnType<typeof useTabColorTokens>;
}

const ManagePermissionsDrawer: React.FC<ManagePermissionsDrawerProps> = ({
  open,
  permissions,
  onClose,
  onAdd,
  onRename,
  onDelete,
  c,
}) => {
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");

  // Reset on open/close
  useEffect(() => {
    if (!open) {
      setNewName("");
      setEditingId(null);
      setEditingName("");
    }
  }, [open]);

  const handleAdd = () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setNewName("");
  };

  const handleSaveEdit = (id: number) => {
    const trimmed = editingName.trim();
    if (trimmed) onRename(id, trimmed);
    setEditingId(null);
    setEditingName("");
  };

  const btnSx = {
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    height: 30,
    px: "11px",
    borderRadius: "6px",
    fontSize: "0.78rem",
    fontWeight: 500,
    fontFamily: "inherit",
    cursor: "pointer",
    transition: "all 0.1s",
    border: `1px solid ${c.border}`,
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 420,
          bgcolor: c.surface,
          borderLeft: `1px solid ${c.border}`,
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 2.5,
          py: 2.25,
          borderBottom: `1px solid ${c.border}`,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        <TuneOutlined sx={{ fontSize: 16, color: c.accent }} />
        <Typography
          fontSize="1rem"
          fontWeight={600}
          color={c.textPrimary}
          letterSpacing="-0.015em"
        >
          Manage Permission Types
        </Typography>
        <Box flex={1} />
        <Box
          component="button"
          onClick={onClose}
          sx={{
            width: 28,
            height: 28,
            border: "none",
            borderRadius: "6px",
            bgcolor: "transparent",
            color: c.textSecondary,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            "&:hover": {
              bgcolor: c.isDark ? "rgba(255,255,255,0.06)" : "rgba(13,27,42,0.05)",
            },
          }}
        >
          <CloseOutlined sx={{ fontSize: 16 }} />
        </Box>
      </Box>

      {/* Body */}
      <Box sx={{ flex: 1, overflowY: "auto", px: 2.5, py: 2.5 }}>

        {/* Info banner */}
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            gap: 1,
            px: 1.5,
            py: 1.25,
            borderRadius: "8px",
            bgcolor: alpha(c.accent, 0.06),
            border: `1px solid ${alpha(c.accent, 0.18)}`,
            mb: 2.5,
          }}
        >
          <Typography fontSize="0.75rem" color={c.textSecondary} lineHeight={1.6}>
            These permission types appear as chips on every sub-module row. Add, rename, or
            delete types here — changes apply immediately across all sub-modules.
          </Typography>
        </Box>

        {/* Permission list */}
        <Typography
          fontSize="0.68rem"
          fontWeight={700}
          color={c.textDim}
          letterSpacing="0.08em"
          textTransform="uppercase"
          mb={1}
        >
          Current permissions ({permissions.length})
        </Typography>

        {permissions.length === 0 && (
          <Typography fontSize="0.8rem" color={c.textDim} fontStyle="italic" py={2}>
            No permission types yet. Add one below.
          </Typography>
        )}

        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75, mb: 3 }}>
          {permissions.map((p) => (
            <Box
              key={p.permissionId}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                px: 1.5,
                py: 1,
                borderRadius: "8px",
                border: `1px solid ${c.border}`,
                bgcolor: c.isDark ? "rgba(255,255,255,0.02)" : "rgba(13,27,42,0.02)",
                "&:hover": {
                  borderColor: c.borderHover,
                  "& .perm-actions": { opacity: 1 },
                },
              }}
            >
              {/* Colour dot */}
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  bgcolor: alpha(c.accent, 0.6),
                  flexShrink: 0,
                }}
              />

              {/* Inline edit or label */}
              {editingId === p.permissionId ? (
                <input
                  autoFocus
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveEdit(p.permissionId);
                    if (e.key === "Escape") { setEditingId(null); setEditingName(""); }
                  }}
                  style={{
                    flex: 1,
                    border: `1px solid ${c.accent}`,
                    borderRadius: 5,
                    padding: "3px 7px",
                    fontSize: "0.82rem",
                    fontFamily: "inherit",
                    background: c.surface,
                    color: c.textPrimary,
                    outline: "none",
                    boxShadow: `0 0 0 3px ${alpha(c.accent, 0.12)}`,
                  }}
                />
              ) : (
                <Typography
                  flex={1}
                  fontSize="0.85rem"
                  color={c.textPrimary}
                  fontWeight={500}
                >
                  {p.permissionName}
                </Typography>
              )}

              {/* ID badge */}
              <Typography
                fontSize="0.62rem"
                color={c.textDim}
                fontFamily="'JetBrains Mono', monospace"
                sx={{ flexShrink: 0 }}
              >
                #{p.permissionId}
              </Typography>

              {/* Actions */}
              <Box
                className="perm-actions"
                sx={{
                  display: "flex",
                  gap: 0.5,
                  opacity: editingId === p.permissionId ? 1 : 0,
                  transition: "opacity 0.12s",
                  flexShrink: 0,
                }}
              >
                {editingId === p.permissionId ? (
                  <>
                    <Box
                      component="button"
                      onClick={() => handleSaveEdit(p.permissionId)}
                      sx={{
                        ...btnSx,
                        height: 26,
                        px: "8px",
                        border: `1px solid ${c.accent}`,
                        bgcolor: alpha(c.accent, 0.1),
                        color: c.accent,
                        "&:hover": { bgcolor: alpha(c.accent, 0.18) },
                      }}
                    >
                      Save
                    </Box>
                    <Box
                      component="button"
                      onClick={() => { setEditingId(null); setEditingName(""); }}
                      sx={{
                        ...btnSx,
                        height: 26,
                        px: "8px",
                        bgcolor: "transparent",
                        color: c.textSecondary,
                        "&:hover": { bgcolor: c.isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)" },
                      }}
                    >
                      Cancel
                    </Box>
                  </>
                ) : (
                  <>
                    <Tooltip title="Rename" placement="top">
                      <Box
                        component="button"
                        onClick={() => {
                          setEditingId(p.permissionId);
                          setEditingName(p.permissionName);
                        }}
                        sx={{
                          width: 26,
                          height: 26,
                          borderRadius: "5px",
                          border: `1px solid ${c.border}`,
                          bgcolor: "transparent",
                          color: c.textDim,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          "&:hover": {
                            bgcolor: c.accentDim,
                            color: c.accent,
                            border: `1px solid ${c.accentBorder}`,
                          },
                        }}
                      >
                        <EditOutlined sx={{ fontSize: 12 }} />
                      </Box>
                    </Tooltip>
                    <Tooltip title="Delete permission type" placement="top">
                      <Box
                        component="button"
                        onClick={() => onDelete(p.permissionId)}
                        sx={{
                          width: 26,
                          height: 26,
                          borderRadius: "5px",
                          border: `1px solid ${c.border}`,
                          bgcolor: "transparent",
                          color: c.textDim,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          "&:hover": {
                            bgcolor: c.dangerDim,
                            color: c.danger,
                            border: `1px solid ${alpha(c.danger, 0.4)}`,
                          },
                        }}
                      >
                        <DeleteOutlined sx={{ fontSize: 12 }} />
                      </Box>
                    </Tooltip>
                  </>
                )}
              </Box>
            </Box>
          ))}
        </Box>

        {/* Add new permission */}
        <Divider sx={{ borderColor: c.border, mb: 2 }} />
        <Typography
          fontSize="0.68rem"
          fontWeight={700}
          color={c.textDim}
          letterSpacing="0.08em"
          textTransform="uppercase"
          mb={1}
        >
          Add new permission type
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="e.g. Export, Archive, Share…"
            style={{
              flex: 1,
              border: `1px solid ${c.border}`,
              borderRadius: 6,
              padding: "7px 10px",
              fontSize: "0.82rem",
              fontFamily: "inherit",
              background: c.surface,
              color: c.textPrimary,
              outline: "none",
              boxSizing: "border-box",
            }}
            onFocus={(e) =>
              (e.target.style.boxShadow = `0 0 0 3px ${alpha(c.accent, 0.15)}`)
            }
            onBlur={(e) => (e.target.style.boxShadow = "none")}
          />
          <Box
            component="button"
            onClick={handleAdd}
            disabled={!newName.trim()}
            sx={{
              ...btnSx,
              border: `1px solid ${c.textPrimary}`,
              bgcolor: c.textPrimary,
              color: c.bg,
              opacity: newName.trim() ? 1 : 0.4,
              cursor: newName.trim() ? "pointer" : "not-allowed",
              "&:hover": newName.trim()
                ? {
                    bgcolor: c.isDark
                      ? "rgba(255,255,255,0.88)"
                      : "rgba(13,27,42,0.85)",
                  }
                : {},
            }}
          >
            <AddOutlined sx={{ fontSize: 14 }} />
            Add
          </Box>
        </Box>
        <Typography fontSize="0.68rem" color={c.textDim} mt={0.75}>
          The new permission type will appear as a chip on all sub-module rows.
        </Typography>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          px: 2.5,
          py: 1.75,
          borderTop: `1px solid ${c.border}`,
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <Box
          component="button"
          onClick={onClose}
          sx={{
            ...btnSx,
            bgcolor: c.textPrimary,
            color: c.bg,
            border: `1px solid ${c.textPrimary}`,
            "&:hover": {
              bgcolor: c.isDark ? "rgba(255,255,255,0.88)" : "rgba(13,27,42,0.85)",
            },
          }}
        >
          Done
        </Box>
      </Box>
    </Drawer>
  );
};

// ─────────────────────────────────────────────────────────────
//  CreateDrawer  (role / module / sub-module / permission name)
// ─────────────────────────────────────────────────────────────

interface CreateDrawerProps {
  open: boolean;
  state: DrawerState | null;
  roles: LocalRole[];
  onClose: () => void;
  onAddRole: (label: string, copyFromRoleId?: number) => void;
  onAddModule: (label: string) => void;
  onEditRole: (id: number, label: string) => void;
  onEditModule: (id: number, label: string) => void;
  onAddSubModule: (label: string, moduleId: number) => void;
  onEditSubModule: (id: number, label: string) => void;
  onEditPermission: (id: number, label: string) => void;
  c: ReturnType<typeof useTabColorTokens>;
}

const CreateDrawer: React.FC<CreateDrawerProps> = ({
  open,
  state,
  roles,
  onClose,
  onAddRole,
  onAddModule,
  onEditRole,
  onEditModule,
  onAddSubModule,
  onEditSubModule,
  onEditPermission,
  c,
}) => {
  const [label, setLabel] = useState("");
  const [copyFromRoleId, setCopyFromRoleId] = useState<number | "">("");

  useEffect(() => {
    if (!open || !state) return;
    setLabel(state.target?.label ?? "");
    setCopyFromRoleId("");
  }, [open, state]);

  const isEdit = state?.kind.startsWith("edit-") ?? false;

  const kindBase = state?.kind.replace("edit-", "") as
    | "role"
    | "module"
    | "sub-module"
    | "permission"
    | undefined;

  const titleMap: Record<DrawerKind, string> = {
    role: "Create Role",
    module: "Create Module",
    "edit-role": "Rename Role",
    "edit-module": "Rename Module",
    "sub-module": "Add Sub-module",
    "edit-sub-module": "Rename Sub-module",
    "edit-permission": "Rename Permission",
    "add-permission": "Add Permission Type",
    "manage-permissions": "Manage Permissions",
  };

  const placeholderMap: Record<string, string> = {
    role: "e.g. Regional Manager",
    module: "e.g. Reports",
    "sub-module": "e.g. Monthly Summary",
    permission: "e.g. Approve",
  };

  const handleSubmit = () => {
    const trimmed = label.trim();
    if (!trimmed || !state) return;

    if (isEdit) {
      if (!state.target) return;
      switch (state.kind) {
        case "edit-role":       onEditRole(state.target.id, trimmed); break;
        case "edit-module":     onEditModule(state.target.id, trimmed); break;
        case "edit-sub-module": onEditSubModule(state.target.id, trimmed); break;
        case "edit-permission": onEditPermission(state.target.id, trimmed); break;
      }
    } else {
      switch (state.kind) {
        case "role":   onAddRole(trimmed, copyFromRoleId as number | undefined); break;
        case "module": onAddModule(trimmed); break;
        case "sub-module":
          if (state.contextModuleId != null) {
            onAddSubModule(trimmed, state.contextModuleId);
          }
          break;
      }
    }
    onClose();
  };

  const showSlug =
    kindBase === "role" || kindBase === "module" || kindBase === "sub-module";

  const btnSx = {
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    height: 32,
    px: "13px",
    borderRadius: "7px",
    fontSize: "0.8rem",
    fontWeight: 500,
    fontFamily: "inherit",
    cursor: "pointer",
    transition: "all 0.1s",
    border: `1px solid ${c.border}`,
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 400,
          bgcolor: c.surface,
          borderLeft: `1px solid ${c.border}`,
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 2.5,
          py: 2.25,
          borderBottom: `1px solid ${c.border}`,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        <Typography
          fontSize="1rem"
          fontWeight={600}
          color={c.textPrimary}
          letterSpacing="-0.015em"
        >
          {state ? titleMap[state.kind] : ""}
        </Typography>
        <Box flex={1} />
        <Box
          component="button"
          onClick={onClose}
          sx={{
            width: 28,
            height: 28,
            border: "none",
            borderRadius: "6px",
            bgcolor: "transparent",
            color: c.textSecondary,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            "&:hover": {
              bgcolor: c.isDark ? "rgba(255,255,255,0.06)" : "rgba(13,27,42,0.05)",
            },
          }}
        >
          <CloseOutlined sx={{ fontSize: 16 }} />
        </Box>
      </Box>

      {/* Body */}
      <Box sx={{ flex: 1, overflowY: "auto", px: 2.5, py: 2.5 }}>
        {state?.kind === "edit-permission" && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              px: 1.5,
              py: 1,
              borderRadius: "8px",
              bgcolor: alpha(c.accent, 0.06),
              border: `1px solid ${alpha(c.accent, 0.2)}`,
              mb: 2,
            }}
          >
            <Typography fontSize="0.72rem" color={c.textSecondary}>
              Renaming the display label of permission ID{" "}
              <Box
                component="span"
                sx={{ fontFamily: "'JetBrains Mono', monospace", color: c.textPrimary }}
              >
                {state.target?.id}
              </Box>
              . The underlying permission key in the database is not changed.
            </Typography>
          </Box>
        )}

        <Typography
          component="label"
          fontSize="0.72rem"
          fontWeight={600}
          color={c.textSecondary}
          display="block"
          mb={0.75}
        >
          Display name
        </Typography>
        <input
          autoFocus
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder={
            kindBase ? (placeholderMap[kindBase] ?? "Enter name…") : "Enter name…"
          }
          style={{
            width: "100%",
            border: `1px solid ${c.border}`,
            borderRadius: 6,
            padding: "8px 10px",
            fontSize: "0.85rem",
            fontFamily: "inherit",
            background: c.surface,
            color: c.textPrimary,
            outline: "none",
            boxSizing: "border-box",
          }}
          onFocus={(e) =>
            (e.target.style.boxShadow = `0 0 0 3px ${alpha(c.accent, 0.15)}`)
          }
          onBlur={(e) => (e.target.style.boxShadow = "none")}
        />

        {showSlug && (
          <Typography fontSize="0.68rem" color={c.textDim} mt={0.5}>
            Stored as key{" "}
            <Box
              component="span"
              sx={{ fontFamily: "'JetBrains Mono', monospace", color: c.textSecondary }}
            >
              {slug(label) || (kindBase?.toUpperCase().replace("-", "_") ?? "")}
            </Box>
          </Typography>
        )}

        {kindBase === "role" && !isEdit && (
          <>
            <Divider sx={{ borderColor: c.border, my: 2 }} />
            <Typography
              fontSize="0.72rem"
              fontWeight={600}
              color={c.textSecondary}
              display="block"
              mb={0.75}
            >
              Copy permissions from (optional)
            </Typography>
            <select
              value={copyFromRoleId}
              onChange={(e) =>
                setCopyFromRoleId(e.target.value ? Number(e.target.value) : "")
              }
              style={{
                width: "100%",
                border: `1px solid ${c.border}`,
                borderRadius: 6,
                padding: "8px 10px",
                fontSize: "0.82rem",
                fontFamily: "inherit",
                background: c.surface,
                color: c.textPrimary,
                outline: "none",
                cursor: "pointer",
                boxSizing: "border-box",
              }}
            >
              <option value="">— Start blank —</option>
              {roles.map((r) => (
                <option key={r.roleId} value={r.roleId}>
                  {ROLE_LABEL[r.roleCode] ?? r.roleCode}
                </option>
              ))}
            </select>
            <Typography fontSize="0.68rem" color={c.textDim} mt={0.5}>
              Optionally seed all grants from an existing role.
            </Typography>
          </>
        )}
      </Box>

      {/* Footer */}
      <Box
        sx={{
          px: 2.5,
          py: 1.75,
          borderTop: `1px solid ${c.border}`,
          display: "flex",
          gap: 1,
          justifyContent: "flex-end",
        }}
      >
        <Box
          component="button"
          onClick={onClose}
          sx={{
            ...btnSx,
            bgcolor: "transparent",
            color: c.textSecondary,
            "&:hover": {
              bgcolor: c.isDark ? "rgba(255,255,255,0.04)" : "rgba(13,27,42,0.04)",
            },
          }}
        >
          Cancel
        </Box>
        <Box
          component="button"
          onClick={handleSubmit}
          disabled={!label.trim()}
          sx={{
            ...btnSx,
            border: `1px solid ${c.textPrimary}`,
            bgcolor: c.textPrimary,
            color: c.bg,
            opacity: label.trim() ? 1 : 0.45,
            cursor: label.trim() ? "pointer" : "not-allowed",
            "&:hover": label.trim()
              ? {
                  bgcolor: c.isDark
                    ? "rgba(255,255,255,0.88)"
                    : "rgba(13,27,42,0.85)",
                }
              : {},
          }}
        >
          {isEdit ? "Save changes" : "Create"}
        </Box>
      </Box>
    </Drawer>
  );
};

// ─────────────────────────────────────────────────────────────
//  Main: AdminSettingDashboard
// ─────────────────────────────────────────────────────────────

export const AdminSettingDashboard: React.FC = () => {
  const theme = useTheme();
  const c = useTabColorTokens(theme);

  const [activeRoleId, setActiveRoleId] = useState<number | null>(null);
  const [activeModuleId, setActiveModuleId] = useState<number | null>(null);

  const [localRoles, setLocalRoles] = useState<LocalRole[]>([]);
  const [localModules, setLocalModules] = useState<LocalModule[]>([]);
  const [deletedRoleIds, setDeletedRoleIds] = useState<Set<number>>(new Set());
  const [deletedModuleIds, setDeletedModuleIds] = useState<Set<number>>(new Set());

  const [localSubModules, setLocalSubModules] = useState<LocalSubModule[]>([]);
  const [deletedSubModuleIds, setDeletedSubModuleIds] = useState<Set<number>>(new Set());

  // ── Managed permission types (replaces read-only API data) ──
  // Seeded from DEFAULT_PERMISSIONS; fully addable / deletable / renamable client-side.
  const [managedPermissions, setManagedPermissions] = useState<PermissionModel[]>(
    DEFAULT_PERMISSIONS,
  );

  // Local display-name overrides (used by the rename drawer)
  const [localPermissions, setLocalPermissions] = useState<LocalPermission[]>([]);

  // Whether the "Manage permissions" drawer is open
  const [managePermsOpen, setManagePermsOpen] = useState(false);

  const [roleQuery, setRoleQuery] = useState("");
  const [modQuery, setModQuery] = useState("");

  const [optimistic, setOptimistic] = useState<Record<string, boolean>>({});
  const [savingKey, setSavingKey] = useState<string | null>(null);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info" | "warning";
  }>({ open: false, message: "", severity: "success" });

  const [drawerState, setDrawerState] = useState<DrawerState | null>(null);

  const [railMenuAnchor, setRailMenuAnchor] = useState<{
    el: HTMLElement;
    kind: "role" | "module";
    id: number;
  } | null>(null);

  const [subMenuAnchor, setSubMenuAnchor] = useState<{
    el: HTMLElement;
    row: RolePermissionViewModel;
  } | null>(null);

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    body: string;
    onConfirm: () => void;
  }>({ open: false, title: "", body: "", onConfirm: () => {} });

  // ── API ────────────────────────────────────────────────────
  const { data: apiRoles = [], isLoading: rolesLoading } = useGetRolesQuery();
  const { data: apiModules = [], isLoading: modulesLoading } = useGetModulesQuery();

  // NOTE: We still fetch from API so server-defined types can be used as
  // an initial seed if you prefer. Currently we use DEFAULT_PERMISSIONS.
  // You can swap the line below to seed managedPermissions from apiPermissions
  // inside a useEffect if the API eventually owns permission types.
  useGetPermissionTypesQuery(); // keep query alive for cache; result unused directly

  const [enablePermission] = useEnablePermissionMutation();
  const [disablePermission] = useDisablePermissionMutation();

  const {
    data: rolePermData = [],
    isLoading: rolePermsLoading,
    isFetching: rolePermsFetching,
    isError: rolePermsIsError,
    error: rolePermsError,
    refetch: refetchRolePerms,
  } = useGetAllRolePermissionsQuery(
    { roleId: activeRoleId ?? 0, moduleId: activeModuleId ?? 0 },
    { skip: !activeRoleId || !activeModuleId },
  );

  // ── Resolved permission list (managed + local renames) ─────
  const allPermissions: PermissionModel[] = useMemo(() => {
    return managedPermissions.map((p) => {
      const override = localPermissions.find(
        (lp) => lp.permissionId === p.permissionId,
      );
      return override ? { ...p, permissionName: override.permissionName } : p;
    });
  }, [managedPermissions, localPermissions]);

  // ── Merge API + local roles ────────────────────────────────
  const roles: LocalRole[] = useMemo(() => {
    const apiMapped = apiRoles
      .filter((r) => !deletedRoleIds.has(r.roleId))
      .map(
        (r) =>
          localRoles.find((lr) => lr.roleId === r.roleId && !lr.isLocal) ?? r,
      );
    return [...apiMapped, ...localRoles.filter((lr) => lr.isLocal)];
  }, [apiRoles, localRoles, deletedRoleIds]);

  // ── Merge API + local modules ──────────────────────────────
  const modules: LocalModule[] = useMemo(() => {
    const apiMapped = apiModules
      .filter((m) => !deletedModuleIds.has(m.moduleId))
      .map(
        (m) =>
          localModules.find((lm) => lm.moduleId === m.moduleId && !lm.isLocal) ?? m,
      );
    return [...apiMapped, ...localModules.filter((lm) => lm.isLocal)];
  }, [apiModules, localModules, deletedModuleIds]);

  // ── Merge API rolePermData + local sub-modules ─────────────
  const mergedRolePermData: RolePermissionViewModel[] = useMemo(() => {
    if (!activeModuleId) return rolePermData;

    const apiSubModuleIds = new Set(rolePermData.map((r) => r.subModuleId));

    const localRows: RolePermissionViewModel[] = localSubModules
      .filter(
        (ls) =>
          ls.moduleId === activeModuleId &&
          !deletedSubModuleIds.has(ls.subModuleId) &&
          !apiSubModuleIds.has(ls.subModuleId),
      )
      .map(
        (ls) =>
          ({
            subModuleId: ls.subModuleId,
            subModuleName: ls.subModuleName,
            rolePermissionId: null,
            permissions: null,
          }) as unknown as RolePermissionViewModel,
      );

    const renamedApiRows = rolePermData
      .filter((r) => !deletedSubModuleIds.has(r.subModuleId))
      .map((r) => {
        const override = localSubModules.find(
          (ls) => ls.subModuleId === r.subModuleId && !ls.isLocal,
        );
        return override ? { ...r, subModuleName: override.subModuleName } : r;
      });

    return [...renamedApiRows, ...localRows];
  }, [rolePermData, localSubModules, deletedSubModuleIds, activeModuleId]);

  // ── Auto-select first role / module ───────────────────────
  useEffect(() => {
    if (roles.length && !activeRoleId) setActiveRoleId(roles[0].roleId);
  }, [roles, activeRoleId]);

  useEffect(() => {
    if (modules.length && !activeModuleId) setActiveModuleId(modules[0].moduleId);
  }, [modules, activeModuleId]);

  useEffect(() => {
    setOptimistic({});
  }, [activeRoleId, activeModuleId]);

  // ── Filtered ───────────────────────────────────────────────
  const filteredRoles = useMemo(
    () =>
      roles.filter(
        (r) =>
          !roleQuery ||
          r.roleCode.toLowerCase().includes(roleQuery.toLowerCase()) ||
          (ROLE_LABEL[r.roleCode] ?? "")
            .toLowerCase()
            .includes(roleQuery.toLowerCase()),
      ),
    [roles, roleQuery],
  );

  const filteredModules = useMemo(
    () =>
      modules.filter(
        (m) =>
          !modQuery ||
          m.moduleName.toLowerCase().includes(modQuery.toLowerCase()),
      ),
    [modules, modQuery],
  );

  // ── Build granted-id set for a row ─────────────────────────
  const buildGrantedIds = useCallback(
    (row: RolePermissionViewModel): Set<number> => {
      const parsed = parseGrantedPermissions(row.permissions);
      const base = new Set<number>(parsed.map((p) => p.permission_id));
      allPermissions.forEach((p) => {
        const key = `${row.subModuleId}_${p.permissionId}`;
        if (key in optimistic) {
          if (optimistic[key]) base.add(p.permissionId);
          else base.delete(p.permissionId);
        }
      });
      return base;
    },
    [optimistic, allPermissions],
  );

  // ── Toggle permission ──────────────────────────────────────
  const handleToggle = useCallback(
    async (subModuleId: number, permissionId: number, currentGranted: boolean) => {
      if (!activeRoleId) return;
      const key = `${subModuleId}_${permissionId}`;
      const newVal = !currentGranted;

      setOptimistic((prev) => ({ ...prev, [key]: newVal }));
      setSavingKey(key);

      const payload = { roleId: activeRoleId, subModuleId, permissionId };

      try {
        if (newVal) {
          await enablePermission(payload).unwrap();
        } else {
          await disablePermission(payload).unwrap();
        }
        setSnackbar({
          open: true,
          message: newVal
            ? "Permission enabled successfully."
            : "Permission disabled successfully.",
          severity: "success",
        });
        refetchRolePerms();
      } catch (err: unknown) {
        setOptimistic((prev) => ({ ...prev, [key]: currentGranted }));
        setSnackbar({
          open: true,
          message: extractApiErrorMessage(
            err,
            newVal
              ? "Failed to enable permission. Please try again."
              : "Failed to disable permission. Please try again.",
          ),
          severity: "error",
        });
      } finally {
        setSavingKey(null);
      }
    },
    [activeRoleId, enablePermission, disablePermission, refetchRolePerms],
  );

  // ── CRUD: Permission types (managed) ───────────────────────

  /** Add a brand-new permission type (client-side only) */
  const handleAddPermissionType = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const newId = newLocalId();
    setManagedPermissions((prev) => [
      ...prev,
      { permissionId: newId, permissionName: trimmed },
    ]);
    setSnackbar({
      open: true,
      message: `Permission type "${trimmed}" added.`,
      severity: "success",
    });
  };

  /** Rename a permission type (updates managedPermissions directly) */
  const handleRenamePermissionType = (id: number, name: string) => {
    setManagedPermissions((prev) =>
      prev.map((p) =>
        p.permissionId === id ? { ...p, permissionName: name } : p,
      ),
    );
    // Also clear any local override for this id
    setLocalPermissions((prev) =>
      prev.filter((lp) => lp.permissionId !== id),
    );
    setSnackbar({
      open: true,
      message: `Permission renamed to "${name}".`,
      severity: "success",
    });
  };

  /** Delete a permission type — removes from managed list and clears optimistic state */
  const handleDeletePermissionType = (id: number) => {
    setManagedPermissions((prev) =>
      prev.filter((p) => p.permissionId !== id),
    );
    setLocalPermissions((prev) =>
      prev.filter((lp) => lp.permissionId !== id),
    );
    // Clean up any optimistic keys for this permission
    setOptimistic((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((k) => {
        if (k.endsWith(`_${id}`)) delete next[k];
      });
      return next;
    });
    setSnackbar({
      open: true,
      message: "Permission type removed.",
      severity: "info",
    });
  };

  // ── CRUD: Roles ────────────────────────────────────────────
  const handleAddRole = (label: string) => {
    const newId = newLocalId();
    setLocalRoles((prev) => [
      ...prev,
      { roleId: newId, roleCode: slug(label), isLocal: true },
    ]);
    setActiveRoleId(newId);
    setSnackbar({ open: true, message: `Role "${label}" created.`, severity: "success" });
  };

  const handleEditRole = (id: number, label: string) => {
    const code = slug(label);
    setLocalRoles((prev) => {
      const exists = prev.find((r) => r.roleId === id);
      if (exists)
        return prev.map((r) => (r.roleId === id ? { ...r, roleCode: code } : r));
      return [...prev, { roleId: id, roleCode: code }];
    });
    setSnackbar({ open: true, message: `Role renamed to "${label}".`, severity: "success" });
  };

  const handleDuplicateRole = (id: number) => {
    const src = roles.find((r) => r.roleId === id);
    if (!src) return;
    const newId = newLocalId();
    setLocalRoles((prev) => [
      ...prev,
      { roleId: newId, roleCode: src.roleCode + "_COPY", isLocal: true },
    ]);
    setActiveRoleId(newId);
    setSnackbar({
      open: true,
      message: `Role duplicated as "${src.roleCode}_COPY".`,
      severity: "success",
    });
  };

  const deleteRole = (id: number) => {
    if (id < 0) setLocalRoles((prev) => prev.filter((r) => r.roleId !== id));
    else setDeletedRoleIds((prev) => new Set([...prev, id]));
    if (activeRoleId === id)
      setActiveRoleId(roles.find((r) => r.roleId !== id)?.roleId ?? null);
    setSnackbar({ open: true, message: "Role removed.", severity: "info" });
  };

  // ── CRUD: Modules ──────────────────────────────────────────
  const handleAddModule = (label: string) => {
    const newId = newLocalId();
    setLocalModules((prev) => [
      ...prev,
      { moduleId: newId, moduleName: label, isLocal: true },
    ]);
    setActiveModuleId(newId);
    setSnackbar({ open: true, message: `Module "${label}" created.`, severity: "success" });
  };

  const handleEditModule = (id: number, label: string) => {
    setLocalModules((prev) => {
      const exists = prev.find((m) => m.moduleId === id);
      if (exists)
        return prev.map((m) => (m.moduleId === id ? { ...m, moduleName: label } : m));
      return [...prev, { moduleId: id, moduleName: label }];
    });
    setSnackbar({ open: true, message: `Module renamed to "${label}".`, severity: "success" });
  };

  const deleteModule = (id: number) => {
    if (id < 0) setLocalModules((prev) => prev.filter((m) => m.moduleId !== id));
    else setDeletedModuleIds((prev) => new Set([...prev, id]));
    if (activeModuleId === id)
      setActiveModuleId(modules.find((m) => m.moduleId !== id)?.moduleId ?? null);
    setSnackbar({ open: true, message: "Module removed.", severity: "info" });
  };

  // ── CRUD: Sub-modules ──────────────────────────────────────
  const handleAddSubModule = (label: string, moduleId: number) => {
    const newId = newLocalId();
    setLocalSubModules((prev) => [
      ...prev,
      { subModuleId: newId, subModuleName: label, moduleId, isLocal: true },
    ]);
    setSnackbar({
      open: true,
      message: `Sub-module "${label}" added.`,
      severity: "success",
    });
  };

  const handleEditSubModule = (id: number, label: string) => {
    setLocalSubModules((prev) => {
      const exists = prev.find((s) => s.subModuleId === id);
      if (exists)
        return prev.map((s) =>
          s.subModuleId === id ? { ...s, subModuleName: label } : s,
        );
      const apiRow = rolePermData.find((r) => r.subModuleId === id);
      if (!apiRow) return prev;
      return [
        ...prev,
        {
          subModuleId: id,
          subModuleName: label,
          moduleId: activeModuleId ?? 0,
          isLocal: false,
        },
      ];
    });
    setSnackbar({
      open: true,
      message: `Sub-module renamed to "${label}".`,
      severity: "success",
    });
  };

  const deleteSubModule = (id: number) => {
    if (id < 0)
      setLocalSubModules((prev) => prev.filter((s) => s.subModuleId !== id));
    else setDeletedSubModuleIds((prev) => new Set([...prev, id]));
    setSnackbar({ open: true, message: "Sub-module removed.", severity: "info" });
  };

  // ── Rename via old drawer (still supported from sub-module context menu) ──
  const handleEditPermission = (id: number, label: string) => {
    handleRenamePermissionType(id, label);
  };

  // ── Derived ────────────────────────────────────────────────
  const activeRole = roles.find((r) => r.roleId === activeRoleId);
  const activeModule = modules.find((m) => m.moduleId === activeModuleId);
  const isPageLoading = rolesLoading || modulesLoading;
  const isPermsLoading = rolePermsLoading || rolePermsFetching;

  const totalGranted = useMemo(
    () => mergedRolePermData.reduce((sum, row) => sum + buildGrantedIds(row).size, 0),
    [mergedRolePermData, buildGrantedIds],
  );

  const totalRevoked = useMemo(
    () =>
      mergedRolePermData.reduce(
        (sum, row) => sum + (allPermissions.length - buildGrantedIds(row).size),
        0,
      ),
    [mergedRolePermData, buildGrantedIds, allPermissions],
  );

  // ── Shared styles ──────────────────────────────────────────
  const railSx = {
    width: 256,
    flexShrink: 0,
    bgcolor: c.surface,
    borderRight: `1px solid ${c.border}`,
    display: "flex",
    flexDirection: "column",
    height: "100%",
    overflow: "hidden",
  };
  const railHeadSx = {
    px: 2,
    pt: 2,
    pb: 1.25,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  };
  const searchInputSx = {
    mx: 1.5,
    mb: 1,
    px: 1.25,
    py: 0.75,
    borderRadius: "6px",
    border: `1px solid ${c.border}`,
    bgcolor: c.isDark ? "rgba(255,255,255,0.03)" : "rgba(13,27,42,0.025)",
    display: "flex",
    alignItems: "center",
    gap: 1,
    "&:focus-within": {
      border: `1px solid ${c.accent}`,
      boxShadow: `0 0 0 3px ${alpha(c.accent, 0.12)}`,
    },
  };
  const iconBtnSx = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 26,
    height: 26,
    borderRadius: "6px",
    border: `1px solid ${c.border}`,
    bgcolor: "transparent",
    color: c.textSecondary,
    cursor: "pointer",
    transition: "all 0.1s",
    "&:hover": {
      bgcolor: c.accentDim,
      color: c.accent,
      border: `1px solid ${c.accentBorder}`,
    },
  };
  const btnSx = {
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    height: 30,
    px: "11px",
    borderRadius: "7px",
    fontSize: "0.78rem",
    fontWeight: 500,
    fontFamily: "inherit",
    cursor: "pointer",
    letterSpacing: "-0.005em",
    transition: "all 0.1s",
  };

  // ─────────────────────────────────────────────────────────
  //  Render
  // ─────────────────────────────────────────────────────────
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateRows: "0px 1fr",
        height: "80vh",
        bgcolor: c.bg,
        overflow: "hidden",
      }}
    >
      <Box>
        <Box flex={1} />
      </Box>

      {/* ── 3-column body ── */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "256px 236px 1fr",
          overflow: "hidden",
        }}
      >
        {/* ── Rail 1: Roles ── */}
        <Box sx={railSx}>
          <Box sx={railHeadSx}>
            <Typography
              fontSize="0.68rem"
              fontWeight={700}
              color={c.textDim}
              letterSpacing="0.08em"
              textTransform="uppercase"
            >
              Roles
            </Typography>
            <Box
              component="button"
              sx={iconBtnSx}
              onClick={() => setDrawerState({ kind: "role" })}
            >
              <AddOutlined sx={{ fontSize: 14 }} />
            </Box>
          </Box>
          <Box sx={searchInputSx}>
            <SearchOutlined sx={{ fontSize: 14, color: c.textDim, flexShrink: 0 }} />
            <InputBase
              value={roleQuery}
              onChange={(e) => setRoleQuery(e.target.value)}
              placeholder="Search roles…"
              sx={{
                fontSize: "0.78rem",
                color: c.textPrimary,
                flex: 1,
                "& input": { p: 0 },
              }}
            />
          </Box>
          <Box sx={{ flex: 1, overflowY: "auto", px: 1, pb: 1.5 }}>
            {rolesLoading ? (
              <Box display="flex" justifyContent="center" py={4}>
                <CircularProgress size={20} sx={{ color: c.accent }} />
              </Box>
            ) : (
              filteredRoles.map((r) => (
                <RailItem
                  key={r.roleId}
                  label={ROLE_LABEL[r.roleCode] ?? r.roleCode}
                  sublabel={r.roleCode}
                  isActive={r.roleId === activeRoleId}
                  icon={<ShieldOutlined sx={{ fontSize: 13 }} />}
                  onClick={() => setActiveRoleId(r.roleId)}
                  onMenuClick={(e) =>
                    setRailMenuAnchor({
                      el: e.currentTarget as HTMLElement,
                      kind: "role",
                      id: r.roleId,
                    })
                  }
                  c={c}
                />
              ))
            )}
            {!rolesLoading && filteredRoles.length === 0 && (
              <Typography fontSize="0.75rem" color={c.textDim} px={1.5} py={2}>
                No roles match.
              </Typography>
            )}
          </Box>
          <Box sx={{ borderTop: `1px solid ${c.border}`, px: 1.5, py: 1.25 }}>
            <Box
              component="button"
              onClick={() => setDrawerState({ kind: "role" })}
              sx={{
                ...btnSx,
                width: "100%",
                height: 30,
                justifyContent: "center",
                border: `1px solid ${c.border}`,
                bgcolor: "transparent",
                color: c.textSecondary,
                "&:hover": {
                  bgcolor: c.accentDim,
                  color: c.accent,
                  border: `1px solid ${c.accentBorder}`,
                },
              }}
            >
              <AddOutlined sx={{ fontSize: 14 }} /> New role
            </Box>
          </Box>
        </Box>

        {/* ── Rail 2: Modules ── */}
        <Box
          sx={{
            ...railSx,
            bgcolor: c.isDark ? "rgba(255,255,255,0.01)" : "rgba(13,27,42,0.015)",
            width: 236,
          }}
        >
          <Box sx={railHeadSx}>
            <Typography
              fontSize="0.68rem"
              fontWeight={700}
              color={c.textDim}
              letterSpacing="0.08em"
              textTransform="uppercase"
            >
              Modules
            </Typography>
            <Box
              component="button"
              sx={iconBtnSx}
              onClick={() => setDrawerState({ kind: "module" })}
            >
              <AddOutlined sx={{ fontSize: 14 }} />
            </Box>
          </Box>
          <Box sx={searchInputSx}>
            <SearchOutlined sx={{ fontSize: 14, color: c.textDim, flexShrink: 0 }} />
            <InputBase
              value={modQuery}
              onChange={(e) => setModQuery(e.target.value)}
              placeholder="Search modules…"
              sx={{
                fontSize: "0.78rem",
                color: c.textPrimary,
                flex: 1,
                "& input": { p: 0 },
              }}
            />
          </Box>
          <Box sx={{ flex: 1, overflowY: "auto", px: 1, pb: 1.5 }}>
            {modulesLoading ? (
              <Box display="flex" justifyContent="center" py={4}>
                <CircularProgress size={20} sx={{ color: c.accent }} />
              </Box>
            ) : (
              filteredModules.map((m) => (
                <RailItem
                  key={m.moduleId}
                  label={m.moduleName}
                  sublabel={
                    m.moduleId === activeModuleId
                      ? `${mergedRolePermData.length} sub-modules`
                      : ""
                  }
                  isActive={m.moduleId === activeModuleId}
                  icon={<ViewModuleOutlined sx={{ fontSize: 13 }} />}
                  onClick={() => setActiveModuleId(m.moduleId)}
                  onMenuClick={(e) =>
                    setRailMenuAnchor({
                      el: e.currentTarget as HTMLElement,
                      kind: "module",
                      id: m.moduleId,
                    })
                  }
                  c={c}
                />
              ))
            )}
            {!modulesLoading && filteredModules.length === 0 && (
              <Typography fontSize="0.75rem" color={c.textDim} px={1.5} py={2}>
                No modules match.
              </Typography>
            )}
          </Box>
          <Box sx={{ borderTop: `1px solid ${c.border}`, px: 1.5, py: 1.25 }}>
            <Box
              component="button"
              onClick={() => setDrawerState({ kind: "module" })}
              sx={{
                ...btnSx,
                width: "100%",
                height: 30,
                justifyContent: "center",
                border: `1px solid ${c.border}`,
                bgcolor: "transparent",
                color: c.textSecondary,
                "&:hover": {
                  bgcolor: c.accentDim,
                  color: c.accent,
                  border: `1px solid ${c.accentBorder}`,
                },
              }}
            >
              <AddOutlined sx={{ fontSize: 14 }} /> New module
            </Box>
          </Box>
        </Box>

        {/* ── Main panel ── */}
        <Box
          component="main"
          sx={{ flex: 1, overflow: "auto", px: 3.5, pt: 3, pb: 10, bgcolor: c.bg }}
        >
          {isPageLoading ? (
            <Box display="flex" justifyContent="center" alignItems="center" py={10}>
              <CircularProgress size={28} sx={{ color: c.accent }} />
              <Typography ml={2} fontSize="0.82rem" color={c.textSecondary}>
                Loading…
              </Typography>
            </Box>
          ) : (
            <>
              {/* Panel header */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  mb: 2.5,
                  gap: 3,
                }}
              >
                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "baseline",
                      gap: 1,
                      flexWrap: "wrap",
                    }}
                  >
                    <Typography
                      fontSize="1.2rem"
                      fontWeight={600}
                      color={c.textPrimary}
                      letterSpacing="-0.02em"
                    >
                      {activeModule?.moduleName ?? "—"}
                    </Typography>
                    <Box
                      component="span"
                      sx={{
                        fontSize: "0.7rem",
                        fontFamily: "'JetBrains Mono', monospace",
                        px: "7px",
                        py: "2px",
                        borderRadius: "5px",
                        bgcolor: alpha(c.accent, 0.1),
                        color: c.accent,
                        border: `1px solid ${alpha(c.accent, 0.3)}`,
                      }}
                    >
                      {activeRole?.roleCode ?? "—"}
                    </Box>
                  </Box>
                  <Typography
                    fontSize="0.82rem"
                    color={c.textSecondary}
                    mt={0.5}
                    maxWidth="60ch"
                  >
                    Permissions for{" "}
                    <Box
                      component="strong"
                      sx={{ color: c.textPrimary, fontWeight: 600 }}
                    >
                      {ROLE_LABEL[activeRole?.roleCode ?? ""] ??
                        activeRole?.roleCode ??
                        "—"}
                    </Box>{" "}
                    in{" "}
                    <Box
                      component="strong"
                      sx={{ color: c.textPrimary, fontWeight: 600 }}
                    >
                      {activeModule?.moduleName ?? "—"}
                    </Box>
                    . Click any chip to toggle instantly.
                  </Typography>
                </Box>

                {/* Right-side action group */}
                <Box
                  sx={{
                    display: "flex",
                    gap: 1,
                    flexShrink: 0,
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  {/* ── MANAGE PERMISSIONS BUTTON (NEW) ── */}
                  <Tooltip
                    title={`${allPermissions.length} permission type${allPermissions.length !== 1 ? "s" : ""} — click to add or remove`}
                    placement="top"
                  >
                    <Box
                      component="button"
                      onClick={() => setManagePermsOpen(true)}
                      sx={{
                        ...btnSx,
                        height: 30,
                        border: `1px solid ${c.border}`,
                        bgcolor: "transparent",
                        color: c.textSecondary,
                        "&:hover": {
                          bgcolor: c.accentDim,
                          color: c.accent,
                          border: `1px solid ${c.accentBorder}`,
                        },
                      }}
                    >
                      <TuneOutlined sx={{ fontSize: 13 }} />
                      Permissions ({allPermissions.length})
                    </Box>
                  </Tooltip>

                  {/* ── ADD SUB-MODULE BUTTON ── */}
                  {activeModuleId && (
                    <Tooltip
                      title="Add a new sub-module to this module"
                      placement="top"
                    >
                      <Box
                        component="button"
                        onClick={() =>
                          setDrawerState({
                            kind: "sub-module",
                            contextModuleId: activeModuleId,
                          })
                        }
                        sx={{
                          ...btnSx,
                          height: 30,
                          border: `1px solid ${c.border}`,
                          bgcolor: "transparent",
                          color: c.textSecondary,
                          "&:hover": {
                            bgcolor: c.accentDim,
                            color: c.accent,
                            border: `1px solid ${c.accentBorder}`,
                          },
                        }}
                      >
                        <AddOutlined sx={{ fontSize: 13 }} />
                        Add sub-module
                      </Box>
                    </Tooltip>
                  )}

                  {/* Summary badges */}
                  {!isPermsLoading &&
                    !rolePermsIsError &&
                    mergedRolePermData.length > 0 && (
                      <>
                        <Box
                          sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 0.75,
                            px: 1.25,
                            py: 0.5,
                            borderRadius: "7px",
                            bgcolor: alpha(c.accent, 0.08),
                            border: `1px solid ${alpha(c.accent, 0.2)}`,
                            color: c.accent,
                            fontSize: "0.72rem",
                            fontWeight: 600,
                          }}
                        >
                          <LockOpenOutlined sx={{ fontSize: 12 }} />
                          {totalGranted} granted
                        </Box>
                        <Box
                          sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 0.75,
                            px: 1.25,
                            py: 0.5,
                            borderRadius: "7px",
                            bgcolor: c.isDark
                              ? "rgba(255,255,255,0.04)"
                              : "rgba(13,27,42,0.04)",
                            border: `1px solid ${c.border}`,
                            color: c.textSecondary,
                            fontSize: "0.72rem",
                            fontWeight: 600,
                          }}
                        >
                          <LockOutlined sx={{ fontSize: 12 }} />
                          {totalRevoked} revoked
                        </Box>
                      </>
                    )}
                </Box>
              </Box>

              {/* ── Content area ── */}
              {isPermsLoading ? (
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  py={8}
                >
                  <CircularProgress size={24} sx={{ color: c.accent }} />
                  <Typography ml={2} fontSize="0.82rem" color={c.textSecondary}>
                    Loading permissions…
                  </Typography>
                </Box>
              ) : rolePermsIsError ? (
                <PermissionsErrorState
                  error={rolePermsError}
                  roleName={
                    ROLE_LABEL[activeRole?.roleCode ?? ""] ??
                    activeRole?.roleCode ??
                    "—"
                  }
                  moduleName={activeModule?.moduleName ?? "—"}
                  onRetry={refetchRolePerms}
                  c={c}
                />
              ) : mergedRolePermData.length === 0 ? (
                <Box
                  sx={{
                    border: `1px dashed ${c.border}`,
                    borderRadius: "10px",
                    px: 3,
                    py: 5,
                    textAlign: "center",
                    color: c.textDim,
                    bgcolor: c.isDark
                      ? "rgba(255,255,255,0.01)"
                      : "rgba(13,27,42,0.015)",
                  }}
                >
                  <Typography fontSize="0.82rem" mb={1.5}>
                    No sub-modules found for{" "}
                    <Box component="strong" sx={{ color: c.textPrimary }}>
                      {ROLE_LABEL[activeRole?.roleCode ?? ""] ??
                        activeRole?.roleCode}
                    </Box>{" "}
                    in{" "}
                    <Box component="strong" sx={{ color: c.textPrimary }}>
                      {activeModule?.moduleName}
                    </Box>
                    .
                  </Typography>
                  {activeModuleId && (
                    <Box
                      component="button"
                      onClick={() =>
                        setDrawerState({
                          kind: "sub-module",
                          contextModuleId: activeModuleId,
                        })
                      }
                      sx={{
                        ...btnSx,
                        border: `1px solid ${c.border}`,
                        bgcolor: "transparent",
                        color: c.textSecondary,
                        "&:hover": {
                          bgcolor: c.accentDim,
                          color: c.accent,
                          border: `1px solid ${c.accentBorder}`,
                        },
                      }}
                    >
                      <AddOutlined sx={{ fontSize: 13 }} /> Add first sub-module
                    </Box>
                  )}
                </Box>
              ) : (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
                  {mergedRolePermData.map((row) => {
                    const grantedIds = buildGrantedIds(row);
                    const loadingPermId = savingKey?.startsWith(
                      `${row.subModuleId}_`,
                    )
                      ? Number(savingKey.split("_")[1])
                      : null;
                    return (
                      <SubModuleCard
                        key={`${row.subModuleId}-${row.rolePermissionId ?? "none"}`}
                        row={row}
                        allPermissions={allPermissions}
                        grantedIds={grantedIds}
                        loadingPermId={loadingPermId}
                        onToggle={(permId, currentGranted) =>
                          handleToggle(row.subModuleId, permId, currentGranted)
                        }
                        onMenuClick={(e) =>
                          setSubMenuAnchor({
                            el: e.currentTarget as HTMLElement,
                            row,
                          })
                        }
                        c={c}
                      />
                    );
                  })}
                </Box>
              )}

              {/* Hint bar */}
              {!isPermsLoading &&
                !rolePermsIsError &&
                mergedRolePermData.length > 0 && (
                  <Box
                    sx={{
                      mt: 2.5,
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      flexWrap: "wrap",
                    }}
                  >
                    {[
                      ["Click", "a chip to toggle the permission instantly."],
                      ["Filled", "chips are currently granted."],
                    ].map(([kbd, rest]) => (
                      <Box
                        key={kbd}
                        sx={{ display: "flex", alignItems: "center", gap: "4px" }}
                      >
                        <Box
                          component="kbd"
                          sx={{
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: "0.62rem",
                            bgcolor: c.isDark
                              ? "rgba(255,255,255,0.06)"
                              : "rgba(13,27,42,0.05)",
                            border: `1px solid ${c.border}`,
                            borderBottomWidth: 2,
                            px: "5px",
                            py: "1px",
                            borderRadius: "4px",
                            color: c.textSecondary,
                          }}
                        >
                          {kbd}
                        </Box>
                        <Typography fontSize="0.72rem" color={c.textDim}>
                          {rest}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}
            </>
          )}
        </Box>
      </Box>

      {/* ── Rail context menu (roles & modules) ── */}
      <Menu
        anchorEl={railMenuAnchor?.el}
        open={!!railMenuAnchor}
        onClose={() => setRailMenuAnchor(null)}
        PaperProps={{
          sx: {
            bgcolor: c.surface,
            border: `1px solid ${c.border}`,
            borderRadius: "8px",
            boxShadow: c.isDark
              ? "0 12px 30px -12px rgba(0,0,0,0.5)"
              : "0 12px 30px -12px rgba(13,27,42,0.2)",
            minWidth: 180,
            "& .MuiList-root": { py: "4px" },
          },
        }}
      >
        <MenuItem
          sx={{
            fontSize: "0.8rem",
            color: c.textPrimary,
            borderRadius: "5px",
            mx: "4px",
            mb: "1px",
          }}
          onClick={() => {
            if (!railMenuAnchor) return;
            const { kind, id } = railMenuAnchor;
            const item =
              kind === "role"
                ? roles.find((r) => r.roleId === id)
                : modules.find((m) => m.moduleId === id);
            setDrawerState({
              kind: kind === "role" ? "edit-role" : "edit-module",
              target: {
                id,
                label:
                  kind === "role"
                    ? ((item as LocalRole)?.roleCode ?? "")
                    : ((item as LocalModule)?.moduleName ?? ""),
              },
            });
            setRailMenuAnchor(null);
          }}
        >
          <ListItemIcon sx={{ minWidth: 28 }}>
            <EditOutlined sx={{ fontSize: 14, color: c.textSecondary }} />
          </ListItemIcon>
          <ListItemText primaryTypographyProps={{ fontSize: "0.8rem" }}>
            Rename…
          </ListItemText>
        </MenuItem>

        {railMenuAnchor?.kind === "role" && (
          <MenuItem
            sx={{
              fontSize: "0.8rem",
              color: c.textPrimary,
              borderRadius: "5px",
              mx: "4px",
              mb: "1px",
            }}
            onClick={() => {
              if (railMenuAnchor) handleDuplicateRole(railMenuAnchor.id);
              setRailMenuAnchor(null);
            }}
          >
            <ListItemIcon sx={{ minWidth: 28 }}>
              <ContentCopyOutlined sx={{ fontSize: 14, color: c.textSecondary }} />
            </ListItemIcon>
            <ListItemText primaryTypographyProps={{ fontSize: "0.8rem" }}>
              Duplicate
            </ListItemText>
          </MenuItem>
        )}

        <Divider sx={{ borderColor: c.border, my: "4px" }} />

        <MenuItem
          sx={{
            fontSize: "0.8rem",
            color: c.danger,
            borderRadius: "5px",
            mx: "4px",
            "&:hover": { bgcolor: c.dangerDim },
          }}
          onClick={() => {
            if (!railMenuAnchor) return;
            const { kind, id } = railMenuAnchor;
            setRailMenuAnchor(null);
            setConfirmDialog({
              open: true,
              title: `Delete ${kind}?`,
              body: `This removes the ${kind} permanently. This cannot be undone.`,
              onConfirm: () => {
                if (kind === "role") deleteRole(id);
                if (kind === "module") deleteModule(id);
                setConfirmDialog((d) => ({ ...d, open: false }));
              },
            });
          }}
        >
          <ListItemIcon sx={{ minWidth: 28 }}>
            <DeleteOutlined sx={{ fontSize: 14, color: c.danger }} />
          </ListItemIcon>
          <ListItemText
            primaryTypographyProps={{ fontSize: "0.8rem", color: c.danger }}
          >
            Delete…
          </ListItemText>
        </MenuItem>
      </Menu>

      {/* ── Sub-module context menu ── */}
      <Menu
        anchorEl={subMenuAnchor?.el}
        open={!!subMenuAnchor}
        onClose={() => setSubMenuAnchor(null)}
        PaperProps={{
          sx: {
            bgcolor: c.surface,
            border: `1px solid ${c.border}`,
            borderRadius: "8px",
            minWidth: 200,
            "& .MuiList-root": { py: "4px" },
          },
        }}
      >
        {/* Granted count (info row) */}
        {subMenuAnchor && (
          <MenuItem
            disabled
            sx={{
              fontSize: "0.78rem",
              color: c.textSecondary,
              borderRadius: "5px",
              mx: "4px",
              mb: "1px",
              opacity: "1 !important",
              cursor: "default",
            }}
          >
            <ListItemIcon sx={{ minWidth: 28 }}>
              <LockOpenOutlined sx={{ fontSize: 14, color: c.textSecondary }} />
            </ListItemIcon>
            <ListItemText
              primaryTypographyProps={{
                fontSize: "0.78rem",
                color: c.textSecondary,
              }}
            >
              {buildGrantedIds(subMenuAnchor.row).size} / {allPermissions.length}{" "}
              granted
            </ListItemText>
          </MenuItem>
        )}

        <Divider sx={{ borderColor: c.border, my: "4px" }} />

        {/* Rename sub-module */}
        {subMenuAnchor && (
          <MenuItem
            sx={{
              fontSize: "0.8rem",
              color: c.textPrimary,
              borderRadius: "5px",
              mx: "4px",
              mb: "1px",
            }}
            onClick={() => {
              if (!subMenuAnchor) return;
              setDrawerState({
                kind: "edit-sub-module",
                target: {
                  id: subMenuAnchor.row.subModuleId,
                  label: subMenuAnchor.row.subModuleName,
                },
              });
              setSubMenuAnchor(null);
            }}
          >
            <ListItemIcon sx={{ minWidth: 28 }}>
              <EditOutlined sx={{ fontSize: 14, color: c.textSecondary }} />
            </ListItemIcon>
            <ListItemText primaryTypographyProps={{ fontSize: "0.8rem" }}>
              Rename sub-module…
            </ListItemText>
          </MenuItem>
        )}

        {/* Manage permission types shortcut */}
        {subMenuAnchor && (
          <MenuItem
            sx={{
              fontSize: "0.8rem",
              color: c.textPrimary,
              borderRadius: "5px",
              mx: "4px",
              mb: "1px",
            }}
            onClick={() => {
              setSubMenuAnchor(null);
              setManagePermsOpen(true);
            }}
          >
            <ListItemIcon sx={{ minWidth: 28 }}>
              <TuneOutlined sx={{ fontSize: 14, color: c.textSecondary }} />
            </ListItemIcon>
            <ListItemText primaryTypographyProps={{ fontSize: "0.8rem" }}>
              Manage permission types…
            </ListItemText>
          </MenuItem>
        )}

        <Divider sx={{ borderColor: c.border, my: "4px" }} />

        {/* Delete sub-module */}
        {subMenuAnchor && (
          <MenuItem
            sx={{
              fontSize: "0.8rem",
              color: c.danger,
              borderRadius: "5px",
              mx: "4px",
              "&:hover": { bgcolor: c.dangerDim },
            }}
            onClick={() => {
              if (!subMenuAnchor) return;
              const id = subMenuAnchor.row.subModuleId;
              const name = subMenuAnchor.row.subModuleName;
              setSubMenuAnchor(null);
              setConfirmDialog({
                open: true,
                title: "Delete sub-module?",
                body: `This removes "${name}" permanently. This cannot be undone.`,
                onConfirm: () => {
                  deleteSubModule(id);
                  setConfirmDialog((d) => ({ ...d, open: false }));
                },
              });
            }}
          >
            <ListItemIcon sx={{ minWidth: 28 }}>
              <DeleteOutlined sx={{ fontSize: 14, color: c.danger }} />
            </ListItemIcon>
            <ListItemText
              primaryTypographyProps={{ fontSize: "0.8rem", color: c.danger }}
            >
              Delete sub-module…
            </ListItemText>
          </MenuItem>
        )}
      </Menu>

      {/* ── Manage Permissions Drawer (NEW) ── */}
      <ManagePermissionsDrawer
        open={managePermsOpen}
        permissions={allPermissions}
        onClose={() => setManagePermsOpen(false)}
        onAdd={handleAddPermissionType}
        onRename={handleRenamePermissionType}
        onDelete={(id) => {
          setConfirmDialog({
            open: true,
            title: "Delete permission type?",
            body: `This removes the permission chip from all sub-module rows. Existing grants for this permission will no longer be visible but are not deleted from the database.`,
            onConfirm: () => {
              handleDeletePermissionType(id);
              setConfirmDialog((d) => ({ ...d, open: false }));
            },
          });
        }}
        c={c}
      />

      {/* ── CreateDrawer (role / module / sub-module / permission name) ── */}
      <CreateDrawer
        open={!!drawerState}
        state={drawerState}
        roles={roles}
        onClose={() => setDrawerState(null)}
        onAddRole={handleAddRole}
        onAddModule={handleAddModule}
        onEditRole={handleEditRole}
        onEditModule={handleEditModule}
        onAddSubModule={handleAddSubModule}
        onEditSubModule={handleEditSubModule}
        onEditPermission={handleEditPermission}
        c={c}
      />

      {/* ── Confirm dialog ── */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog((d) => ({ ...d, open: false }))}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: c.surface,
            border: `1px solid ${c.border}`,
            borderRadius: "12px",
          },
        }}
      >
        <DialogTitle
          sx={{ fontSize: "1rem", fontWeight: 600, color: c.textPrimary, pb: 1 }}
        >
          {confirmDialog.title}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontSize: "0.82rem", color: c.textSecondary }}>
            {confirmDialog.body}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, pb: 2, gap: 1 }}>
          <Box
            component="button"
            onClick={() => setConfirmDialog((d) => ({ ...d, open: false }))}
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              height: 30,
              px: "11px",
              borderRadius: "7px",
              fontSize: "0.78rem",
              fontWeight: 500,
              fontFamily: "inherit",
              cursor: "pointer",
              transition: "all 0.1s",
              border: `1px solid ${c.border}`,
              bgcolor: "transparent",
              color: c.textSecondary,
            }}
          >
            Cancel
          </Box>
          <Box
            component="button"
            onClick={confirmDialog.onConfirm}
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              height: 30,
              px: "11px",
              borderRadius: "7px",
              fontSize: "0.78rem",
              fontWeight: 500,
              fontFamily: "inherit",
              cursor: "pointer",
              transition: "all 0.1s",
              border: `1px solid ${c.danger}`,
              bgcolor: c.danger,
              color: "#fff",
              "&:hover": { bgcolor: "#c0302f" },
            }}
          >
            Delete
          </Box>
        </DialogActions>
      </Dialog>

      {/* ── Snackbar ── */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          variant="filled"
          sx={{ fontSize: "0.8rem", borderRadius: "8px" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};