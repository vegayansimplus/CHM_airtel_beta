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
  Popover,
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
  CodeOutlined,
  SelectAllOutlined,
  DeselectOutlined,
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
  type RolePermissionViewModel,
  type GrantedPermissionItem,
  type PermissionModel,
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
 * Permission entry surfaced in the "+ Add" popover and used to attach
 * a new permission to a sub-module. permissionCode is DERIVED locally
 * from permissionName because the catalog endpoint
 * (GET /permissions/dropdown/permissions) only returns id + name.
 */
interface AddablePermission {
  permissionId: number;
  permissionName: string;
  permissionCode: string;
}

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

function extractApiErrorMessage(err: unknown, fallback: string): string {
  if (
    err &&
    typeof err === "object" &&
    "data" in err &&
    (err as { data?: { message?: unknown } }).data &&
    typeof (err as { data: { message?: unknown } }).data.message === "string"
  ) {
    return (err as { data: { message: string } }).data.message;
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
//  PermChip  – shows permissionName + permissionCode badge + remove button
// ─────────────────────────────────────────────────────────────

interface PermChipProps {
  permissionId: number;
  permissionName: string;
  permissionCode: string;
  granted: boolean;
  loading: boolean;
  onClick: () => void;
  onRemove: () => void;
  c: ReturnType<typeof useTabColorTokens>;
}

const PermChip: React.FC<PermChipProps> = ({
  permissionName,
  permissionCode,
  granted,
  loading,
  onClick,
  onRemove,
  c,
}) => (
  <Box
    sx={{
      position: "relative",
      display: "inline-flex",
      "&:hover .perm-remove-btn": { opacity: 1 },
    }}
  >
    <Tooltip
      title={
        <Box>
          <Box sx={{ fontWeight: 700, mb: 0.25 }}>
            {granted ? "Click to disable" : "Click to enable"}
          </Box>
          <Box
            sx={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "0.7rem",
              opacity: 0.8,
            }}
          >
            code: {permissionCode}
          </Box>
        </Box>
      }
      placement="top"
      arrow
    >
      <Box
        component="button"
        onClick={onClick}
        disabled={loading}
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          height: 32,
          px: "11px",
          pr: "26px", // space for remove btn
          borderRadius: "8px",
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
          flexShrink: 0,
          "&:hover:not(:disabled)": {
            border: `1px solid ${alpha(c.accent, 0.6)}`,
            bgcolor: alpha(c.accent, granted ? 0.18 : 0.07),
            color: c.accent,
          },
        }}
      >
        {/* Checkbox indicator */}
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

        {/* Label */}
        <span>{permissionName}</span>

        {/* Code badge */}
        <Box
          component="span"
          sx={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "0.6rem",
            px: "4px",
            py: "1px",
            borderRadius: "3px",
            bgcolor: granted
              ? alpha(c.accent, 0.15)
              : c.isDark
                ? "rgba(255,255,255,0.06)"
                : "rgba(0,0,0,0.05)",
            color: granted ? c.accent : c.textDim,
            letterSpacing: "0.03em",
            lineHeight: 1,
          }}
        >
          {permissionCode}
        </Box>
      </Box>
    </Tooltip>

    {/* Remove button – appears on hover */}
    <Tooltip title="Remove this permission from sub-module" placement="top">
      <Box
        component="button"
        className="perm-remove-btn"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        sx={{
          position: "absolute",
          top: "50%",
          right: 4,
          transform: "translateY(-50%)",
          width: 18,
          height: 18,
          borderRadius: "4px",
          border: "none",
          bgcolor: c.isDark
            ? "rgba(255,255,255,0.08)"
            : "rgba(13,27,42,0.06)",
          color: c.textDim,
          cursor: "pointer",
          opacity: 0,
          transition: "opacity 0.12s, background 0.1s, color 0.1s",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          "&:hover": {
            bgcolor: alpha(c.danger ?? "#e53935", 0.18),
            color: c.danger,
          },
        }}
      >
        <CloseOutlined sx={{ fontSize: 11 }} />
      </Box>
    </Tooltip>
  </Box>
);

// ─────────────────────────────────────────────────────────────
//  AddPermissionPopover – shows available permission types
//  (filters out the ones already attached to this sub-module)
// ─────────────────────────────────────────────────────────────

interface AddPermissionPopoverProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  availablePermissions: AddablePermission[];
  onClose: () => void;
  onSelect: (perm: AddablePermission) => void;
  c: ReturnType<typeof useTabColorTokens>;
}

const AddPermissionPopover: React.FC<AddPermissionPopoverProps> = ({
  anchorEl,
  open,
  availablePermissions,
  onClose,
  onSelect,
  c,
}) => (
  <Popover
    open={open}
    anchorEl={anchorEl}
    onClose={onClose}
    anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
    transformOrigin={{ vertical: "top", horizontal: "left" }}
    PaperProps={{
      sx: {
        mt: 0.5,
        bgcolor: c.surface,
        border: `1px solid ${c.border}`,
        borderRadius: "8px",
        boxShadow: c.isDark
          ? "0 12px 30px -12px rgba(0,0,0,0.5)"
          : "0 12px 30px -12px rgba(13,27,42,0.2)",
        minWidth: 240,
        maxHeight: 320,
        overflow: "hidden",
      },
    }}
  >
    <Box sx={{ px: 1.5, py: 1, borderBottom: `1px solid ${c.border}` }}>
      <Typography
        fontSize="0.65rem"
        fontWeight={700}
        color={c.textDim}
        letterSpacing="0.08em"
        textTransform="uppercase"
      >
        Add Permission
      </Typography>
    </Box>
    <Box sx={{ maxHeight: 260, overflowY: "auto", py: 0.5 }}>
      {availablePermissions.length === 0 ? (
        <Typography
          fontSize="0.78rem"
          color={c.textDim}
          fontStyle="italic"
          px={1.5}
          py={2}
          textAlign="center"
        >
          All available permissions are already added.
        </Typography>
      ) : (
        availablePermissions.map((p) => (
          <Box
            key={p.permissionId}
            component="button"
            onClick={() => {
              onSelect(p);
              onClose();
            }}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              width: "100%",
              px: 1.5,
              py: 1,
              border: "none",
              bgcolor: "transparent",
              cursor: "pointer",
              textAlign: "left",
              transition: "background 0.1s",
              "&:hover": {
                bgcolor: alpha(c.accent, 0.08),
              },
            }}
          >
            <AddOutlined sx={{ fontSize: 13, color: c.accent }} />
            <Typography
              fontSize="0.82rem"
              color={c.textPrimary}
              fontWeight={500}
              sx={{ flex: 1 }}
            >
              {p.permissionName}
            </Typography>
            <Box
              component="span"
              sx={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "0.62rem",
                px: "5px",
                py: "1px",
                borderRadius: "3px",
                bgcolor: c.isDark
                  ? "rgba(255,255,255,0.06)"
                  : "rgba(13,27,42,0.05)",
                color: c.textSecondary,
              }}
            >
              {p.permissionCode}
            </Box>
          </Box>
        ))
      )}
    </Box>
  </Popover>
);

// ─────────────────────────────────────────────────────────────
//  SubModuleCard
//  Only renders permissions actually attached to this sub-module
// ─────────────────────────────────────────────────────────────

interface SubModuleCardProps {
  row: RolePermissionViewModel;
  /** Permissions attached to this sub-module (with their granted state) */
  attachedPermissions: Array<{
    permissionId: number;
    permissionName: string;
    permissionCode: string;
    granted: boolean;
  }>;
  /** Permissions from the global catalog NOT yet attached to this sub-module */
  addablePermissions: AddablePermission[];
  /** True while the global permission catalog is still loading */
  catalogLoading: boolean;
  loadingPermId: number | null;
  onToggle: (permissionId: number, currentGranted: boolean) => void;
  onRemove: (permissionId: number, granted: boolean) => void;
  onAdd: (perm: AddablePermission) => void;
  onMenuClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onGrantAll: () => void;
  onRevokeAll: () => void;
  c: ReturnType<typeof useTabColorTokens>;
}

const SubModuleCard: React.FC<SubModuleCardProps> = ({
  row,
  attachedPermissions,
  addablePermissions,
  catalogLoading,
  loadingPermId,
  onToggle,
  onRemove,
  onAdd,
  onMenuClick,
  onGrantAll,
  onRevokeAll,
  c,
}) => {
  const [addAnchorEl, setAddAnchorEl] = useState<HTMLElement | null>(null);

  const grantedCount = attachedPermissions.filter((p) => p.granted).length;
  const totalCount = attachedPermissions.length;
  const noRecord = row.rolePermissionId === null && totalCount === 0;
  const allGranted = grantedCount === totalCount && totalCount > 0;
  const noneGranted = grantedCount === 0;

  return (
    <Box
      sx={{
        bgcolor: c.surface,
        border: `1px solid ${c.border}`,
        borderRadius: "12px",
        boxShadow: c.isDark
          ? "0 1px 0 rgba(255,255,255,0.04), 0 4px 16px -8px rgba(0,0,0,0.3)"
          : "0 1px 0 rgba(13,27,42,0.05), 0 4px 16px -8px rgba(13,27,42,0.08)",
        overflow: "hidden",
        transition: "border-color 0.12s, box-shadow 0.12s",
        "&:hover": {
          borderColor: c.borderHover,
          "& .sub-menu-btn": { opacity: 1 },
          "& .bulk-actions": { opacity: 1 },
        },
      }}
    >
      {/* Progress bar at top */}
      <Box
        sx={{
          height: 2,
          bgcolor: c.isDark ? "rgba(255,255,255,0.05)" : "rgba(13,27,42,0.04)",
        }}
      >
        <Box
          sx={{
            height: "100%",
            width: totalCount > 0 ? `${(grantedCount / totalCount) * 100}%` : "0%",
            bgcolor: c.accent,
            transition: "width 0.3s ease",
            borderRadius: "0 1px 1px 0",
          }}
        />
      </Box>

      <Box
        sx={{
          px: 2.5,
          py: 2,
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
        }}
      >
        {/* Header row */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          {/* Status dot */}
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              bgcolor: grantedCount > 0 ? c.accent : c.border,
              flexShrink: 0,
              transition: "background 0.15s",
              boxShadow:
                grantedCount > 0
                  ? `0 0 0 3px ${alpha(c.accent, 0.15)}`
                  : "none",
            }}
          />

          {/* Sub-module name */}
          <Typography
            fontSize="0.9rem"
            fontWeight={600}
            color={c.textPrimary}
            sx={{ flex: 1, letterSpacing: "-0.01em" }}
          >
            {row.subModuleName}
          </Typography>

          {/* Meta info */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography
              fontSize="0.68rem"
              color={c.textDim}
              fontFamily="'JetBrains Mono', monospace"
            >
              ID:{row.subModuleId}
            </Typography>

            {/* Granted badge */}
            <Box
              sx={{
                px: "7px",
                py: "2px",
                borderRadius: "5px",
                bgcolor:
                  grantedCount > 0
                    ? alpha(c.accent, 0.1)
                    : c.isDark
                      ? "rgba(255,255,255,0.04)"
                      : "rgba(13,27,42,0.04)",
                border: `1px solid ${grantedCount > 0 ? alpha(c.accent, 0.25) : c.border}`,
                color: grantedCount > 0 ? c.accent : c.textDim,
                fontSize: "0.68rem",
                fontWeight: 600,
              }}
            >
              {grantedCount}/{totalCount}
            </Box>

            {noRecord && (
              <Box
                sx={{
                  px: "5px",
                  py: "1px",
                  borderRadius: "4px",
                  border: `1px dashed ${c.border}`,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "0.62rem",
                  color: c.textDim,
                }}
              >
                no record
              </Box>
            )}

            {/* Bulk action buttons */}
            <Box
              className="bulk-actions"
              sx={{
                display: "flex",
                gap: 0.5,
                opacity: 0,
                transition: "opacity 0.12s",
              }}
            >
              <Tooltip title="Grant all permissions" placement="top">
                <Box
                  component="button"
                  onClick={onGrantAll}
                  disabled={allGranted || totalCount === 0}
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: "5px",
                    border: `1px solid ${c.border}`,
                    bgcolor: "transparent",
                    color: c.textDim,
                    cursor: allGranted || totalCount === 0 ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: allGranted || totalCount === 0 ? 0.35 : 1,
                    "&:hover:not(:disabled)": {
                      bgcolor: alpha(c.accent, 0.1),
                      color: c.accent,
                      border: `1px solid ${alpha(c.accent, 0.3)}`,
                    },
                  }}
                >
                  <SelectAllOutlined sx={{ fontSize: 12 }} />
                </Box>
              </Tooltip>
              <Tooltip title="Revoke all permissions" placement="top">
                <Box
                  component="button"
                  onClick={onRevokeAll}
                  disabled={noneGranted}
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: "5px",
                    border: `1px solid ${c.border}`,
                    bgcolor: "transparent",
                    color: c.textDim,
                    cursor: noneGranted ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: noneGranted ? 0.35 : 1,
                    "&:hover:not(:disabled)": {
                      bgcolor: alpha(c.danger ?? "#e53935", 0.1),
                      color: c.danger,
                      border: `1px solid ${alpha(c.danger ?? "#e53935", 0.3)}`,
                    },
                  }}
                >
                  <DeselectOutlined sx={{ fontSize: 12 }} />
                </Box>
              </Tooltip>
            </Box>

            {/* Context menu */}
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

        {/* Permission chips */}
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: "6px",
            alignItems: "center",
          }}
        >
          {/* Empty-state hint (only when nothing is attached) */}
          {attachedPermissions.length === 0 && (
            <Typography fontSize="0.75rem" color={c.textDim} fontStyle="italic">
              No permissions attached yet —
            </Typography>
          )}

          {attachedPermissions.map((p) => (
            <PermChip
              key={p.permissionId}
              permissionId={p.permissionId}
              permissionName={p.permissionName}
              permissionCode={p.permissionCode}
              granted={p.granted}
              loading={loadingPermId === p.permissionId}
              onClick={() => onToggle(p.permissionId, p.granted)}
              onRemove={() => onRemove(p.permissionId, p.granted)}
              c={c}
            />
          ))}

          {/* Add-permission trigger.
              ALWAYS rendered (so users always see how to add). It becomes:
                • disabled + spinner while the global catalog is loading
                • disabled when every catalog permission is already attached
                • highlighted accent style when the card is empty (zero attached)
                • subtle dashed style when there are already chips */}
          {(() => {
            const empty = attachedPermissions.length === 0;
            const noneAddable = !catalogLoading && addablePermissions.length === 0;
            const disabled = catalogLoading || noneAddable;

            const tooltipText = catalogLoading
              ? "Loading permission catalog…"
              : noneAddable
                ? "All permissions are already attached"
                : empty
                  ? "Attach a permission to this sub-module"
                  : "Add another permission to this sub-module";

            const borderColor = disabled
              ? c.border
              : empty
                ? alpha(c.accent, 0.55)
                : c.border;
            const bgColor = disabled
              ? "transparent"
              : empty
                ? alpha(c.accent, 0.06)
                : "transparent";
            const textColor = disabled
              ? c.textDim
              : empty
                ? c.accent
                : c.textDim;

            return (
              <Tooltip title={tooltipText} placement="top">
                <Box
                  component="button"
                  onClick={(e) => {
                    if (disabled) return;
                    setAddAnchorEl(e.currentTarget as HTMLElement);
                  }}
                  disabled={disabled}
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                    height: 32,
                    px: "11px",
                    borderRadius: "8px",
                    border: `1px dashed ${borderColor}`,
                    bgcolor: bgColor,
                    color: textColor,
                    fontSize: "0.78rem",
                    fontWeight: empty && !disabled ? 600 : 500,
                    cursor: disabled ? "not-allowed" : "pointer",
                    opacity: disabled ? 0.55 : 1,
                    fontFamily: "inherit",
                    transition: "all 0.12s",
                    flexShrink: 0,
                    "&:hover:not(:disabled)": {
                      border: `1px dashed ${c.accent}`,
                      bgcolor: alpha(c.accent, 0.08),
                      color: c.accent,
                    },
                  }}
                >
                  {catalogLoading ? (
                    <Box
                      sx={{
                        width: 11,
                        height: 11,
                        borderRadius: "50%",
                        border: `1.5px solid ${c.textDim}`,
                        borderTopColor: "transparent",
                        animation: "spin 0.6s linear infinite",
                        "@keyframes spin": { to: { transform: "rotate(360deg)" } },
                      }}
                    />
                  ) : (
                    <AddOutlined sx={{ fontSize: 13 }} />
                  )}
                  {empty ? "Add Permission" : "Add"}
                </Box>
              </Tooltip>
            );
          })()}
        </Box>
      </Box>

      <AddPermissionPopover
        anchorEl={addAnchorEl}
        open={!!addAnchorEl}
        availablePermissions={addablePermissions}
        onClose={() => setAddAnchorEl(null)}
        onSelect={onAdd}
        c={c}
      />
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

  const title = is500
    ? "Permissions Not Configured"
    : statusCode === 403
      ? "Access Denied"
      : statusCode === 404
        ? "Not Found"
        : "Failed to Load Permissions";

  const hint = is500
    ? "This role–module combination has no permission records in the database."
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
            {is500 ? (
              <WarningAmberOutlined sx={{ fontSize: 18, color: c.danger }} />
            ) : (
              <ErrorOutlineOutlined sx={{ fontSize: 18, color: c.danger }} />
            )}
          </Box>
          <Box sx={{ flex: 1 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                mb: 0.5,
                flexWrap: "wrap",
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
                  }}
                >
                  {statusCode}
                </Box>
              )}
            </Box>
            <Typography
              fontSize="0.8rem"
              color={c.textSecondary}
              lineHeight={1.6}
            >
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
            bgcolor: c.isDark
              ? "rgba(255,255,255,0.03)"
              : "rgba(13,27,42,0.025)",
            border: `1px solid ${c.border}`,
            mb: 2,
            flexWrap: "wrap",
          }}
        >
          <ShieldOutlined sx={{ fontSize: 12, color: c.textDim }} />
          <Typography
            fontSize="0.72rem"
            color={c.textSecondary}
            fontWeight={500}
          >
            {roleName}
          </Typography>
          <Box
            sx={{ width: 3, height: 3, borderRadius: "50%", bgcolor: c.border }}
          />
          <ViewModuleOutlined sx={{ fontSize: 12, color: c.textDim }} />
          <Typography
            fontSize="0.72rem"
            color={c.textSecondary}
            fontWeight={500}
          >
            {moduleName}
          </Typography>
        </Box>
        <Typography
          fontSize="0.75rem"
          color={c.textDim}
          lineHeight={1.6}
          mb={2.5}
          sx={{ px: 1 }}
        >
          {hint}
        </Typography>
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
              "&:hover": { bgcolor: alpha(c.danger, 0.14) },
            }}
          >
            <RefreshOutlined sx={{ fontSize: 13 }} /> Retry
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
//  DrawerKind & CreateDrawer
//  (manage-permissions kind removed entirely)
// ─────────────────────────────────────────────────────────────

type DrawerKind =
  | "role"
  | "module"
  | "sub-module"
  | "edit-role"
  | "edit-module"
  | "edit-sub-module";

interface DrawerState {
  kind: DrawerKind;
  target?: { id: number; label: string };
  contextModuleId?: number;
}

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
    | undefined;

  const titleMap: Record<DrawerKind, string> = {
    role: "Create Role",
    module: "Create Module",
    "sub-module": "Add Sub-module",
    "edit-role": "Rename Role",
    "edit-module": "Rename Module",
    "edit-sub-module": "Rename Sub-module",
  };

  const placeholderMap: Record<string, string> = {
    role: "e.g. Regional Manager",
    module: "e.g. Reports",
    "sub-module": "e.g. Monthly Summary",
  };

  const handleSubmit = () => {
    const trimmed = label.trim();
    if (!trimmed || !state) return;
    if (isEdit) {
      if (!state.target) return;
      switch (state.kind) {
        case "edit-role":
          onEditRole(state.target.id, trimmed);
          break;
        case "edit-module":
          onEditModule(state.target.id, trimmed);
          break;
        case "edit-sub-module":
          onEditSubModule(state.target.id, trimmed);
          break;
      }
    } else {
      switch (state.kind) {
        case "role":
          onAddRole(trimmed, copyFromRoleId as number | undefined);
          break;
        case "module":
          onAddModule(trimmed);
          break;
        case "sub-module":
          if (state.contextModuleId != null)
            onAddSubModule(trimmed, state.contextModuleId);
          break;
      }
    }
    onClose();
  };

  const showSlug = kindBase === "role" || kindBase === "module" || kindBase === "sub-module";

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
              bgcolor: c.isDark
                ? "rgba(255,255,255,0.06)"
                : "rgba(13,27,42,0.05)",
            },
          }}
        >
          <CloseOutlined sx={{ fontSize: 16 }} />
        </Box>
      </Box>

      <Box sx={{ flex: 1, overflowY: "auto", px: 2.5, py: 2.5 }}>
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
            kindBase
              ? (placeholderMap[kindBase] ?? "Enter name…")
              : "Enter name…"
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
        />
        {showSlug && (
          <Typography fontSize="0.68rem" color={c.textDim} mt={0.5}>
            Stored as key{" "}
            <Box
              component="span"
              sx={{
                fontFamily: "'JetBrains Mono', monospace",
                color: c.textSecondary,
              }}
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
          </>
        )}
      </Box>

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

  const [roleQuery, setRoleQuery] = useState("");
  const [modQuery, setModQuery] = useState("");

  // ── Per-sub-module local attachments ────────────────────────────────────
  // Tracks permissions the user has manually ADDED to a sub-module this session
  // (i.e. permissions NOT in the API response for that sub-module).
  // Keyed by subModuleId → Set of permissionIds added locally.
  const [locallyAddedPerms, setLocallyAddedPerms] = useState<
    Record<number, Set<number>>
  >({});

  // Permissions the user has REMOVED from a sub-module this session
  // (these were in the API response but the user clicked "X").
  // Keyed by subModuleId → Set of permissionIds removed locally.
  const [locallyRemovedPerms, setLocallyRemovedPerms] = useState<
    Record<number, Set<number>>
  >({});

  // Optimistic grant/revoke state: key = `subModuleId_permissionId` → boolean
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

  // ── API ──────────────────────────────────────────────────────
  const { data: apiRoles = [], isLoading: rolesLoading } = useGetRolesQuery();
  const { data: apiModules = [], isLoading: modulesLoading } = useGetModulesQuery();
  // Catalog of ALL available permission types (for the "+ Add" popover)
  const { data: permissionCatalog = [], isLoading: catalogLoading } =
    useGetPermissionTypesQuery();
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

  // Fast lookup: permissionId → { permissionName, permissionCode }
  // The catalog API only returns { permissionId, permissionName }, so we
  // derive permissionCode from the name (e.g. "View" → "VIEW", "Sub Approve" → "SUB_APPROVE").
  const permCatalogById = useMemo(() => {
    const map = new Map<
      number,
      { permissionId: number; permissionName: string; permissionCode: string }
    >();
    permissionCatalog.forEach((p) =>
      map.set(p.permissionId, {
        permissionId: p.permissionId,
        permissionName: p.permissionName,
        permissionCode: slug(p.permissionName),
      }),
    );
    return map;
  }, [permissionCatalog]);

  // ── Merge API + local roles / modules ───────────────────────
  const roles: LocalRole[] = useMemo(() => {
    const apiMapped = apiRoles
      .filter((r) => !deletedRoleIds.has(r.roleId))
      .map(
        (r) =>
          localRoles.find((lr) => lr.roleId === r.roleId && !lr.isLocal) ?? r,
      );
    return [...apiMapped, ...localRoles.filter((lr) => lr.isLocal)];
  }, [apiRoles, localRoles, deletedRoleIds]);

  const modules: LocalModule[] = useMemo(() => {
    const apiMapped = apiModules
      .filter((m) => !deletedModuleIds.has(m.moduleId))
      .map(
        (m) =>
          localModules.find((lm) => lm.moduleId === m.moduleId && !lm.isLocal) ?? m,
      );
    return [...apiMapped, ...localModules.filter((lm) => lm.isLocal)];
  }, [apiModules, localModules, deletedModuleIds]);

  // ── Merge API rolePermData + local sub-modules ───────────────
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
      .map((ls) => ({
        subModuleId: ls.subModuleId,
        subModuleName: ls.subModuleName,
        rolePermissionId: null,
        permissions: [],
        moduleName:
          modules.find((m) => m.moduleId === activeModuleId)?.moduleName ?? "",
        moduleId: activeModuleId,
      }));

    const renamedApiRows = rolePermData
      .filter((r) => !deletedSubModuleIds.has(r.subModuleId))
      .map((r) => {
        const override = localSubModules.find(
          (ls) => ls.subModuleId === r.subModuleId && !ls.isLocal,
        );
        return override ? { ...r, subModuleName: override.subModuleName } : r;
      });

    return [...renamedApiRows, ...localRows];
  }, [rolePermData, localSubModules, deletedSubModuleIds, activeModuleId, modules]);

  // ── Auto-select first role / module ─────────────────────────
  useEffect(() => {
    if (roles.length && !activeRoleId) setActiveRoleId(roles[0].roleId);
  }, [roles, activeRoleId]);

  useEffect(() => {
    if (modules.length && !activeModuleId) setActiveModuleId(modules[0].moduleId);
  }, [modules, activeModuleId]);

  // Reset transient state when context changes
  useEffect(() => {
    setOptimistic({});
    setLocallyAddedPerms({});
    setLocallyRemovedPerms({});
  }, [activeRoleId, activeModuleId]);

  // ── Filtered ─────────────────────────────────────────────────
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

  // ─────────────────────────────────────────────────────────────
  //  CORE LOGIC: build attached permissions for a sub-module
  //
  //  Rules:
  //   1. Start from API response (row.permissions) — these are the ones
  //      the backend has on record. Each is GRANTED by default.
  //   2. Remove any the user removed locally this session.
  //   3. Add any the user added locally this session (look up name from catalog).
  //      Locally-added perms start as NOT granted (user must click to enable).
  //   4. Apply optimistic toggles on top.
  // ─────────────────────────────────────────────────────────────
  const buildAttachedPermissions = useCallback(
    (row: RolePermissionViewModel) => {
      const removed = locallyRemovedPerms[row.subModuleId] ?? new Set<number>();
      const added = locallyAddedPerms[row.subModuleId] ?? new Set<number>();

      const apiPerms: GrantedPermissionItem[] = Array.isArray(row.permissions)
        ? row.permissions
        : [];

      // 1. API permissions (granted = true by default)
      const fromApi = apiPerms
        .filter((p) => !removed.has(p.permission_id))
        .map((p) => ({
          permissionId: p.permission_id,
          permissionCode: p.permission_code,
          // Resolve display name from catalog; fall back to humanized code
          permissionName:
            permCatalogById.get(p.permission_id)?.permissionName ??
            humanizeCode(p.permission_code),
          granted: true,
        }));

      // 2. Locally-added permissions (granted = false by default)
      const apiIds = new Set(apiPerms.map((p) => p.permission_id));
      const fromLocal = Array.from(added)
        .filter((id) => !apiIds.has(id))
        .map((id) => {
          const cat = permCatalogById.get(id);
          return {
            permissionId: id,
            permissionCode: cat?.permissionCode ?? `PERM_${id}`,
            permissionName: cat?.permissionName ?? `Permission ${id}`,
            granted: false,
          };
        });

      // 3. Apply optimistic overrides
      const merged = [...fromApi, ...fromLocal].map((p) => {
        const key = `${row.subModuleId}_${p.permissionId}`;
        if (key in optimistic) {
          return { ...p, granted: optimistic[key] };
        }
        return p;
      });

      return merged;
    },
    [locallyRemovedPerms, locallyAddedPerms, optimistic, permCatalogById],
  );

  // Compute which permissions from the global catalog can still be added
  // (i.e. not already attached to this sub-module). Code is derived from name.
  const buildAddablePermissions = useCallback(
    (row: RolePermissionViewModel): AddablePermission[] => {
      const attached = buildAttachedPermissions(row);
      const attachedIds = new Set(attached.map((p) => p.permissionId));
      return permissionCatalog
        .filter((p) => !attachedIds.has(p.permissionId))
        .map((p) => ({
          permissionId: p.permissionId,
          permissionName: p.permissionName,
          permissionCode: slug(p.permissionName),
        }));
    },
    [buildAttachedPermissions, permissionCatalog],
  );

  // ── Toggle grant/revoke ──────────────────────────────────────
  const handleToggle = useCallback(
    async (
      subModuleId: number,
      permissionId: number,
      currentGranted: boolean,
      skipRefetch = false,
    ) => {
      if (!activeRoleId) return;
      const key = `${subModuleId}_${permissionId}`;
      const newVal = !currentGranted;
      setOptimistic((prev) => ({ ...prev, [key]: newVal }));
      setSavingKey(key);
      const payload = { roleId: activeRoleId, subModuleId, permissionId };
      try {
        if (newVal) await enablePermission(payload).unwrap();
        else await disablePermission(payload).unwrap();

        if (!skipRefetch) {
          setSnackbar({
            open: true,
            message: newVal ? "Permission enabled." : "Permission disabled.",
            severity: "success",
          });
          refetchRolePerms();
        }
      } catch (err: unknown) {
        // Revert optimistic state
        setOptimistic((prev) => ({ ...prev, [key]: currentGranted }));
        if (!skipRefetch) {
          setSnackbar({
            open: true,
            message: extractApiErrorMessage(
              err,
              newVal
                ? "Failed to enable permission."
                : "Failed to disable permission.",
            ),
            severity: "error",
          });
        }
      } finally {
        setSavingKey(null);
      }
    },
    [activeRoleId, enablePermission, disablePermission, refetchRolePerms],
  );

  // ── Add a permission to a sub-module ─────────────────────────
  // Locally attach it. The user can then click it to actually enable.
  const handleAddPermissionToSubModule = useCallback(
    (subModuleId: number, perm: AddablePermission) => {
      setLocallyAddedPerms((prev) => {
        const next = { ...prev };
        const set = new Set(next[subModuleId] ?? []);
        set.add(perm.permissionId);
        next[subModuleId] = set;
        return next;
      });
      // If it was previously locally removed, un-remove it
      setLocallyRemovedPerms((prev) => {
        const set = prev[subModuleId];
        if (!set || !set.has(perm.permissionId)) return prev;
        const next = { ...prev };
        const newSet = new Set(set);
        newSet.delete(perm.permissionId);
        next[subModuleId] = newSet;
        return next;
      });
      setSnackbar({
        open: true,
        message: `Added "${perm.permissionName}" to this sub-module. Click the chip to enable it.`,
        severity: "info",
      });
    },
    [],
  );

  // ── Remove a permission from a sub-module ────────────────────
  // If it's currently granted on the server, disable it first, then hide the chip.
  const handleRemovePermissionFromSubModule = useCallback(
    async (subModuleId: number, permissionId: number, granted: boolean) => {
      if (!activeRoleId) return;

      // If it's currently granted on the server, revoke it first
      if (granted) {
        try {
          await disablePermission({
            roleId: activeRoleId,
            subModuleId,
            permissionId,
          }).unwrap();
        } catch (err: unknown) {
          setSnackbar({
            open: true,
            message: extractApiErrorMessage(err, "Failed to revoke permission."),
            severity: "error",
          });
          return;
        }
      }

      // Now hide the chip
      setLocallyRemovedPerms((prev) => {
        const next = { ...prev };
        const set = new Set(next[subModuleId] ?? []);
        set.add(permissionId);
        next[subModuleId] = set;
        return next;
      });
      // Also clear any local-add for this perm
      setLocallyAddedPerms((prev) => {
        const set = prev[subModuleId];
        if (!set || !set.has(permissionId)) return prev;
        const next = { ...prev };
        const newSet = new Set(set);
        newSet.delete(permissionId);
        next[subModuleId] = newSet;
        return next;
      });
      // Clear any optimistic state
      setOptimistic((prev) => {
        const key = `${subModuleId}_${permissionId}`;
        if (!(key in prev)) return prev;
        const next = { ...prev };
        delete next[key];
        return next;
      });

      setSnackbar({
        open: true,
        message: "Permission removed from sub-module.",
        severity: "info",
      });

      if (granted) refetchRolePerms();
    },
    [activeRoleId, disablePermission, refetchRolePerms],
  );

  // ── Grant All / Revoke All ───────────────────────────────────
  const handleGrantAll = useCallback(
    async (row: RolePermissionViewModel) => {
      if (!activeRoleId) return;
      const attached = buildAttachedPermissions(row);
      const toGrant = attached.filter((p) => !p.granted);
      if (toGrant.length === 0) return;
      await Promise.all(
        toGrant.map((p) =>
          handleToggle(row.subModuleId, p.permissionId, false, true),
        ),
      );
      refetchRolePerms();
      setSnackbar({
        open: true,
        message: `Granted ${toGrant.length} permission${toGrant.length > 1 ? "s" : ""}.`,
        severity: "success",
      });
    },
    [activeRoleId, buildAttachedPermissions, handleToggle, refetchRolePerms],
  );

  const handleRevokeAll = useCallback(
    async (row: RolePermissionViewModel) => {
      if (!activeRoleId) return;
      const attached = buildAttachedPermissions(row);
      const toRevoke = attached.filter((p) => p.granted);
      if (toRevoke.length === 0) return;
      await Promise.all(
        toRevoke.map((p) =>
          handleToggle(row.subModuleId, p.permissionId, true, true),
        ),
      );
      refetchRolePerms();
      setSnackbar({
        open: true,
        message: `Revoked ${toRevoke.length} permission${toRevoke.length > 1 ? "s" : ""}.`,
        severity: "info",
      });
    },
    [activeRoleId, buildAttachedPermissions, handleToggle, refetchRolePerms],
  );

  // ── CRUD: Roles ──────────────────────────────────────────────
  const handleAddRole = (label: string) => {
    const newId = newLocalId();
    setLocalRoles((prev) => [
      ...prev,
      { roleId: newId, roleCode: slug(label), isLocal: true },
    ]);
    setActiveRoleId(newId);
    setSnackbar({
      open: true,
      message: `Role "${label}" created.`,
      severity: "success",
    });
  };

  const handleEditRole = (id: number, label: string) => {
    const code = slug(label);
    setLocalRoles((prev) => {
      const exists = prev.find((r) => r.roleId === id);
      if (exists)
        return prev.map((r) =>
          r.roleId === id ? { ...r, roleCode: code } : r,
        );
      return [...prev, { roleId: id, roleCode: code }];
    });
    setSnackbar({
      open: true,
      message: `Role renamed to "${label}".`,
      severity: "success",
    });
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
      message: `Role duplicated.`,
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

  // ── CRUD: Modules ────────────────────────────────────────────
  const handleAddModule = (label: string) => {
    const newId = newLocalId();
    setLocalModules((prev) => [
      ...prev,
      { moduleId: newId, moduleName: label, isLocal: true },
    ]);
    setActiveModuleId(newId);
    setSnackbar({
      open: true,
      message: `Module "${label}" created.`,
      severity: "success",
    });
  };

  const handleEditModule = (id: number, label: string) => {
    setLocalModules((prev) => {
      const exists = prev.find((m) => m.moduleId === id);
      if (exists)
        return prev.map((m) =>
          m.moduleId === id ? { ...m, moduleName: label } : m,
        );
      return [...prev, { moduleId: id, moduleName: label }];
    });
    setSnackbar({
      open: true,
      message: `Module renamed to "${label}".`,
      severity: "success",
    });
  };

  const deleteModule = (id: number) => {
    if (id < 0)
      setLocalModules((prev) => prev.filter((m) => m.moduleId !== id));
    else setDeletedModuleIds((prev) => new Set([...prev, id]));
    if (activeModuleId === id)
      setActiveModuleId(
        modules.find((m) => m.moduleId !== id)?.moduleId ?? null,
      );
    setSnackbar({ open: true, message: "Module removed.", severity: "info" });
  };

  // ── CRUD: Sub-modules ────────────────────────────────────────
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
    setSnackbar({
      open: true,
      message: "Sub-module removed.",
      severity: "info",
    });
  };

  // ── Derived ──────────────────────────────────────────────────
  const activeRole = roles.find((r) => r.roleId === activeRoleId);
  const activeModule = modules.find((m) => m.moduleId === activeModuleId);
  const isPageLoading = rolesLoading || modulesLoading;
  const isPermsLoading = rolePermsLoading || rolePermsFetching;

  const totalGranted = useMemo(
    () =>
      mergedRolePermData.reduce(
        (sum, row) =>
          sum + buildAttachedPermissions(row).filter((p) => p.granted).length,
        0,
      ),
    [mergedRolePermData, buildAttachedPermissions],
  );
  const totalAttached = useMemo(
    () =>
      mergedRolePermData.reduce(
        (sum, row) => sum + buildAttachedPermissions(row).length,
        0,
      ),
    [mergedRolePermData, buildAttachedPermissions],
  );
  const totalRevoked = totalAttached - totalGranted;

  // ── Shared styles ────────────────────────────────────────────
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

  // Safe extraction of loading permission id from savingKey
  const getLoadingPermId = (
    sk: string | null,
    subModuleId: number,
  ): number | null => {
    if (!sk) return null;
    const prefix = `${subModuleId}_`;
    if (!sk.startsWith(prefix)) return null;
    const id = Number(sk.slice(prefix.length));
    return isNaN(id) ? null : id;
  };

  // ─────────────────────────────────────────────────────────────
  //  Render
  // ─────────────────────────────────────────────────────────────
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

      {/* 3-column body */}
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
        </Box>

        {/* ── Rail 2: Modules ── */}
        <Box
          sx={{
            ...railSx,
            bgcolor: c.isDark
              ? "rgba(255,255,255,0.01)"
              : "rgba(13,27,42,0.015)",
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
        </Box>

        {/* ── Main panel ── */}
        <Box
          component="main"
          sx={{
            flex: 1,
            overflow: "auto",
            px: 3.5,
            pt: 3,
            pb: 10,
            bgcolor: c.bg,
          }}
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
                  flexWrap: "wrap",
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
                    Each sub-module shows only the permissions it has on record.
                    Hover a chip to remove it, or click <strong>+ Add</strong>{" "}
                    to attach another from the catalog.
                  </Typography>
                </Box>

                {/* Right-side actions */}
                <Box
                  sx={{
                    display: "flex",
                    gap: 1,
                    flexShrink: 0,
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  {activeModuleId && (
                    <Tooltip title="Add a new sub-module" placement="top">
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
                        <AddOutlined sx={{ fontSize: 13 }} /> Add sub-module
                      </Box>
                    </Tooltip>
                  )}

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

              {/* Content area */}
              {isPermsLoading ? (
                <Box display="flex" justifyContent="center" alignItems="center" py={8}>
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
                    borderRadius: "12px",
                    px: 3,
                    py: 6,
                    textAlign: "center",
                    color: c.textDim,
                  }}
                >
                  <ViewModuleOutlined
                    sx={{ fontSize: 32, color: c.border, mb: 1.5 }}
                  />
                  <Typography
                    fontSize="0.9rem"
                    fontWeight={500}
                    color={c.textSecondary}
                  >
                    No sub-modules found
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                  {mergedRolePermData.map((row) => {
                    const attached = buildAttachedPermissions(row);
                    const addable = buildAddablePermissions(row);
                    const loadingPermId = getLoadingPermId(savingKey, row.subModuleId);
                    return (
                      <SubModuleCard
                        key={`${row.subModuleId}-${row.rolePermissionId ?? "none"}`}
                        row={row}
                        attachedPermissions={attached}
                        addablePermissions={addable}
                        catalogLoading={catalogLoading}
                        loadingPermId={loadingPermId}
                        onToggle={(permId, currentGranted) =>
                          handleToggle(row.subModuleId, permId, currentGranted)
                        }
                        onRemove={(permId, granted) =>
                          handleRemovePermissionFromSubModule(
                            row.subModuleId,
                            permId,
                            granted,
                          )
                        }
                        onAdd={(perm) =>
                          handleAddPermissionToSubModule(row.subModuleId, perm)
                        }
                        onMenuClick={(e) =>
                          setSubMenuAnchor({
                            el: e.currentTarget as HTMLElement,
                            row,
                          })
                        }
                        onGrantAll={() => handleGrantAll(row)}
                        onRevokeAll={() => handleRevokeAll(row)}
                        c={c}
                      />
                    );
                  })}
                </Box>
              )}
            </>
          )}
        </Box>
      </Box>

      {/* ── Rail context menu ── */}
      <Menu
        anchorEl={railMenuAnchor?.el}
        open={!!railMenuAnchor}
        onClose={() => setRailMenuAnchor(null)}
        PaperProps={{
          sx: {
            bgcolor: c.surface,
            border: `1px solid ${c.border}`,
            borderRadius: "8px",
            minWidth: 180,
          },
        }}
      >
        <MenuItem
          sx={{ fontSize: "0.8rem", color: c.textPrimary }}
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
            sx={{ fontSize: "0.8rem", color: c.textPrimary }}
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
          sx={{ fontSize: "0.8rem", color: c.danger }}
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
            minWidth: 220,
          },
        }}
      >
        {subMenuAnchor && (
          <>
            <MenuItem
              sx={{ fontSize: "0.8rem", color: c.textPrimary }}
              onClick={() => {
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

            <MenuItem
              sx={{ fontSize: "0.8rem", color: c.textPrimary }}
              onClick={() => {
                handleGrantAll(subMenuAnchor.row);
                setSubMenuAnchor(null);
              }}
            >
              <ListItemIcon sx={{ minWidth: 28 }}>
                <SelectAllOutlined sx={{ fontSize: 14, color: c.textSecondary }} />
              </ListItemIcon>
              <ListItemText primaryTypographyProps={{ fontSize: "0.8rem" }}>
                Grant all permissions
              </ListItemText>
            </MenuItem>

            <MenuItem
              sx={{ fontSize: "0.8rem", color: c.textPrimary }}
              onClick={() => {
                handleRevokeAll(subMenuAnchor.row);
                setSubMenuAnchor(null);
              }}
            >
              <ListItemIcon sx={{ minWidth: 28 }}>
                <DeselectOutlined sx={{ fontSize: 14, color: c.textSecondary }} />
              </ListItemIcon>
              <ListItemText primaryTypographyProps={{ fontSize: "0.8rem" }}>
                Revoke all permissions
              </ListItemText>
            </MenuItem>

            <Divider sx={{ borderColor: c.border, my: "4px" }} />

            <MenuItem
              sx={{ fontSize: "0.8rem", color: c.danger }}
              onClick={() => {
                const id = subMenuAnchor.row.subModuleId;
                const name = subMenuAnchor.row.subModuleName;
                setSubMenuAnchor(null);
                setConfirmDialog({
                  open: true,
                  title: "Delete sub-module?",
                  body: `This removes "${name}" permanently.`,
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
          </>
        )}
      </Menu>

      {/* ── Create / Edit Drawer ── */}
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
              ...btnSx,
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
              ...btnSx,
              border: `1px solid ${c.danger}`,
              bgcolor: c.danger,
              color: "#fff",
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

// ─────────────────────────────────────────────────────────────
//  Tiny utility – humanize an UPPER_SNAKE code → "Upper Snake"
//  Used only as a fallback if catalog lookup fails.
// ─────────────────────────────────────────────────────────────
function humanizeCode(code: string): string {
  return code
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}