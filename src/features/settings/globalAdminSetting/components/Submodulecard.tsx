import React, { useState } from "react";
import { Box, Typography, Tooltip } from "@mui/material";
import {
  AddOutlined,
  MoreHorizOutlined,
  SelectAllOutlined,
  DeselectOutlined,
} from "@mui/icons-material";
import { alpha } from "@mui/material/styles";
import type { useTabColorTokens } from "../../../../style/theme";
import type { RolePermissionViewModel } from "../Globalsettingapislice";
import type { AddablePermission } from "../constants/Constants";
import { AddPermissionPopover } from "./Addpermissionpopover";
// import { PermchipAdminProps } from "./PermchipAdmin";
// import { PermChip } from "./Permchip";
// import { AddPermissionPopover } from "./Addpermissionpopover";
// import type { AddablePermission } from "./constants";
// import { PermChip } from "./PermChip";
// import { AddPermissionPopover } from "./AddPermissionPopover";

// ─────────────────────────────────────────────────────────────
//  SubModuleCard
//  Card that renders all permissions attached to one sub-module,
//  including grant/revoke toggles, bulk actions, and add/remove.
// ─────────────────────────────────────────────────────────────

export interface AttachedPermission {
  permissionId: number;
  permissionName: string;
  permissionCode: string;
  granted: boolean;
}

export interface SubModuleCardProps {
  row: RolePermissionViewModel;
  /** Permissions attached to this sub-module (with their granted state). */
  attachedPermissions: AttachedPermission[];
  /** Permissions from the global catalog NOT yet attached to this sub-module. */
  addablePermissions: AddablePermission[];
  /** True while the global permission catalog is still loading. */
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

export const SubModuleCard: React.FC<SubModuleCardProps> = ({
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
      {/* Granted-progress bar at top */}
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
        {/* ── Header row ── */}
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

          {/* Meta: ID + badges + bulk actions + context menu */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography
              fontSize="0.68rem"
              color={c.textDim}
              fontFamily="'JetBrains Mono', monospace"
            >
              ID:{row.subModuleId}
            </Typography>

            {/* Granted/total badge */}
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

            {/* Bulk action buttons (grant all / revoke all) */}
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

            {/* Context menu trigger */}
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

        {/* ── Permission chips row ── */}
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: "6px",
            alignItems: "center",
          }}
        >
          {attachedPermissions.length === 0 && (
            <Typography fontSize="0.75rem" color={c.textDim} fontStyle="italic">
              No permissions attached yet —
            </Typography>
          )}

          {attachedPermissions.map((p) => (
            <PermchipAdminProps
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

          {/* ── "+ Add Permission" trigger ──
              Always rendered; becomes disabled/spinner/highlighted based on state. */}
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

      {/* Popover – anchored to the "+ Add" button above */}
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