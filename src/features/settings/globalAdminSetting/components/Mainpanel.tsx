import React from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Tooltip,
  alpha,
} from "@mui/material";
import {
  AddOutlined,
  TuneOutlined,
  LockOpenOutlined,
  LockOutlined,
} from "@mui/icons-material";
import type { useTabColorTokens } from "../../../../style/theme";
import type { RolePermissionViewModel, PermissionModel } from "../Globalsettingapislice";
import { ROLE_LABEL } from "./Constants";
import type { LocalRole, LocalModule } from "./GlobalSettingTypes";
import PermissionsErrorState from "./Permissionserrorstate";
import SubModuleCard from "./Submodulecard";

// import type { PermissionModel, RolePermissionViewModel } from "./Globalsettingapislice";
// import type { useTabColorTokens } from "../../../style/theme";
// import { ROLE_LABEL } from "./constants";
// import type { LocalRole, LocalModule } from "./types";
// import SubModuleCard from "./SubModuleCard";
// import PermissionsErrorState from "./PermissionsErrorState";

interface MainPanelProps {
  activeRole: LocalRole | undefined;
  activeModule: LocalModule | undefined;
  activeModuleId: number | null;
  isPageLoading: boolean;
  isPermsLoading: boolean;
  rolePermsIsError: boolean;
  rolePermsError: unknown;
  mergedRolePermData: RolePermissionViewModel[];
  allPermissions: PermissionModel[];
  totalGranted: number;
  totalRevoked: number;
  savingKey: string | null;
  buildGrantedIds: (row: RolePermissionViewModel) => Set<number>;
  onToggle: (subModuleId: number, permId: number, currentGranted: boolean) => void;
  onSubMenuClick: (e: React.MouseEvent<HTMLButtonElement>, row: RolePermissionViewModel) => void;
  onAddSubModule: () => void;
  onOpenManagePerms: () => void;
  onRetry: () => void;
  c: ReturnType<typeof useTabColorTokens>;
}

const MainPanel: React.FC<MainPanelProps> = ({
  activeRole,
  activeModule,
  activeModuleId,
  isPageLoading,
  isPermsLoading,
  rolePermsIsError,
  rolePermsError,
  mergedRolePermData,
  allPermissions,
  totalGranted,
  totalRevoked,
  savingKey,
  buildGrantedIds,
  onToggle,
  onSubMenuClick,
  onAddSubModule,
  onOpenManagePerms,
  onRetry,
  c,
}) => {
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

  return (
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
              <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, flexWrap: "wrap" }}>
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
                    px: "7px", py: "2px",
                    borderRadius: "5px",
                    bgcolor: alpha(c.accent, 0.1),
                    color: c.accent,
                    border: `1px solid ${alpha(c.accent, 0.3)}`,
                  }}
                >
                  {activeRole?.roleCode ?? "—"}
                </Box>
              </Box>
              <Typography fontSize="0.82rem" color={c.textSecondary} mt={0.5} maxWidth="60ch">
                Permissions for{" "}
                <Box component="strong" sx={{ color: c.textPrimary, fontWeight: 600 }}>
                  {ROLE_LABEL[activeRole?.roleCode ?? ""] ?? activeRole?.roleCode ?? "—"}
                </Box>{" "}
                in{" "}
                <Box component="strong" sx={{ color: c.textPrimary, fontWeight: 600 }}>
                  {activeModule?.moduleName ?? "—"}
                </Box>
                . Click any chip to toggle instantly.
              </Typography>
            </Box>

            {/* Action group */}
            <Box sx={{ display: "flex", gap: 1, flexShrink: 0, alignItems: "center", flexWrap: "wrap" }}>
              <Tooltip
                title={`${allPermissions.length} permission type${allPermissions.length !== 1 ? "s" : ""} — click to add or remove`}
                placement="top"
              >
                <Box
                  component="button"
                  onClick={onOpenManagePerms}
                  sx={{
                    ...btnSx,
                    border: `1px solid ${c.border}`,
                    bgcolor: "transparent",
                    color: c.textSecondary,
                    "&:hover": { bgcolor: c.accentDim, color: c.accent, border: `1px solid ${c.accentBorder}` },
                  }}
                >
                  <TuneOutlined sx={{ fontSize: 13 }} />
                  Permissions ({allPermissions.length})
                </Box>
              </Tooltip>

              {activeModuleId && (
                <Tooltip title="Add a new sub-module to this module" placement="top">
                  <Box
                    component="button"
                    onClick={onAddSubModule}
                    sx={{
                      ...btnSx,
                      border: `1px solid ${c.border}`,
                      bgcolor: "transparent",
                      color: c.textSecondary,
                      "&:hover": { bgcolor: c.accentDim, color: c.accent, border: `1px solid ${c.accentBorder}` },
                    }}
                  >
                    <AddOutlined sx={{ fontSize: 13 }} />
                    Add sub-module
                  </Box>
                </Tooltip>
              )}

              {!isPermsLoading && !rolePermsIsError && mergedRolePermData.length > 0 && (
                <>
                  <Box
                    sx={{
                      display: "inline-flex", alignItems: "center", gap: 0.75,
                      px: 1.25, py: 0.5, borderRadius: "7px",
                      bgcolor: alpha(c.accent, 0.08),
                      border: `1px solid ${alpha(c.accent, 0.2)}`,
                      color: c.accent, fontSize: "0.72rem", fontWeight: 600,
                    }}
                  >
                    <LockOpenOutlined sx={{ fontSize: 12 }} />
                    {totalGranted} granted
                  </Box>
                  <Box
                    sx={{
                      display: "inline-flex", alignItems: "center", gap: 0.75,
                      px: 1.25, py: 0.5, borderRadius: "7px",
                      bgcolor: c.isDark ? "rgba(255,255,255,0.04)" : "rgba(13,27,42,0.04)",
                      border: `1px solid ${c.border}`,
                      color: c.textSecondary, fontSize: "0.72rem", fontWeight: 600,
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
              roleName={ROLE_LABEL[activeRole?.roleCode ?? ""] ?? activeRole?.roleCode ?? "—"}
              moduleName={activeModule?.moduleName ?? "—"}
              onRetry={onRetry}
              c={c}
            />
          ) : mergedRolePermData.length === 0 ? (
            <Box
              sx={{
                border: `1px dashed ${c.border}`,
                borderRadius: "10px",
                px: 3, py: 5,
                textAlign: "center",
                color: c.textDim,
                bgcolor: c.isDark ? "rgba(255,255,255,0.01)" : "rgba(13,27,42,0.015)",
              }}
            >
              <Typography fontSize="0.82rem" mb={1.5}>
                No sub-modules found for{" "}
                <Box component="strong" sx={{ color: c.textPrimary }}>
                  {ROLE_LABEL[activeRole?.roleCode ?? ""] ?? activeRole?.roleCode}
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
                  onClick={onAddSubModule}
                  sx={{
                    ...btnSx,
                    border: `1px solid ${c.border}`,
                    bgcolor: "transparent",
                    color: c.textSecondary,
                    "&:hover": { bgcolor: c.accentDim, color: c.accent, border: `1px solid ${c.accentBorder}` },
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
                const loadingPermId = savingKey?.startsWith(`${row.subModuleId}_`)
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
                      onToggle(row.subModuleId, permId, currentGranted)
                    }
                    onMenuClick={(e) => onSubMenuClick(e, row)}
                    c={c}
                  />
                );
              })}
            </Box>
          )}

          {/* Hint bar */}
          {!isPermsLoading && !rolePermsIsError && mergedRolePermData.length > 0 && (
            <Box sx={{ mt: 2.5, display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
              {[
                ["Click", "a chip to toggle the permission instantly."],
                ["Filled", "chips are currently granted."],
              ].map(([kbd, rest]) => (
                <Box key={kbd} sx={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <Box
                    component="kbd"
                    sx={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: "0.62rem",
                      bgcolor: c.isDark ? "rgba(255,255,255,0.06)" : "rgba(13,27,42,0.05)",
                      border: `1px solid ${c.border}`,
                      borderBottomWidth: 2,
                      px: "5px", py: "1px",
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
  );
};

export default MainPanel;