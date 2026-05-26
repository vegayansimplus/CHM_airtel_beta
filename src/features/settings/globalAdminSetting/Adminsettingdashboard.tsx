import React from "react";
import { useTheme } from "@mui/material/styles";
import {
  Box,
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
} from "@mui/material";
import {
  ShieldOutlined,
  ViewModuleOutlined,
  EditOutlined,
  DeleteOutlined,
  ContentCopyOutlined,
  LockOpenOutlined,
  TuneOutlined,
} from "@mui/icons-material";
import { useTabColorTokens } from "../../../style/theme";
import { usePermissionsState } from "./components/Usepermissionsstate";
import { ROLE_LABEL } from "./components/Constants";
import CreateDrawer from "./components/CreateDrawer";
import type { LocalRole, LocalModule } from "./components/GlobalSettingTypes";
import MainPanel from "./components/Mainpanel";
import ManagePermissionsDrawer from "./components/Managepermissionsdrawer";
import RailPanel from "./components/Railpanel";

export const AdminSettingDashboard: React.FC = () => {
  const theme = useTheme();
  const c = useTabColorTokens(theme);
  const s = usePermissionsState();

  // ── Shared button style ────────────────────────────────────
  const dangerBtnSx = {
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
  };

  // ── Role rail items ────────────────────────────────────────
  const roleItems = s.filteredRoles.map((r) => ({
    id: r.roleId,
    label: ROLE_LABEL[r.roleCode] ?? r.roleCode,
    sublabel: r.roleCode,
    icon: <ShieldOutlined sx={{ fontSize: 13 }} />,
  }));

  // ── Module rail items ──────────────────────────────────────
  const moduleItems = s.filteredModules.map((m) => ({
    id: m.moduleId,
    label: m.moduleName,
    sublabel:
      m.moduleId === s.activeModuleId
        ? `${s.mergedRolePermData.length} sub-modules`
        : "",
    icon: <ViewModuleOutlined sx={{ fontSize: 13 }} />,
  }));

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
        {/* Rail 1: Roles */}
        <RailPanel
          title="Roles"
          items={roleItems}
          activeId={s.activeRoleId}
          loading={s.isPageLoading}
          query={s.roleQuery}
          onQueryChange={s.setRoleQuery}
          onSelect={s.setActiveRoleId}
          onMenuClick={(e, id) =>
            s.setRailMenuAnchor({
              el: e.currentTarget as HTMLElement,
              kind: "role",
              id,
            })
          }
          onAdd={() => s.setDrawerState({ kind: "role" })}
          addLabel="New role"
          c={c}
        />

        {/* Rail 2: Modules */}
        <RailPanel
          title="Modules"
          items={moduleItems}
          activeId={s.activeModuleId}
          loading={s.isPageLoading}
          query={s.modQuery}
          onQueryChange={s.setModQuery}
          onSelect={s.setActiveModuleId}
          onMenuClick={(e, id) =>
            s.setRailMenuAnchor({
              el: e.currentTarget as HTMLElement,
              kind: "module",
              id,
            })
          }
          onAdd={() => s.setDrawerState({ kind: "module" })}
          addLabel="New module"
          width={236}
          dimBg
          c={c}
        />

        {/* Main panel */}
        <MainPanel
          activeRole={s.activeRole}
          activeModule={s.activeModule}
          activeModuleId={s.activeModuleId}
          isPageLoading={s.isPageLoading}
          isPermsLoading={s.isPermsLoading}
          rolePermsIsError={s.rolePermsIsError}
          rolePermsError={s.rolePermsError}
          mergedRolePermData={s.mergedRolePermData}
          allPermissions={s.allPermissions}
          totalGranted={s.totalGranted}
          totalRevoked={s.totalRevoked}
          savingKey={s.savingKey}
          buildGrantedIds={s.buildGrantedIds}
          onToggle={s.handleToggle}
          onSubMenuClick={(e, row) =>
            s.setSubMenuAnchor({ el: e.currentTarget as HTMLElement, row })
          }
          onAddSubModule={() =>
            s.setDrawerState({
              kind: "sub-module",
              contextModuleId: s.activeModuleId ?? 0,
            })
          }
          onOpenManagePerms={() => s.setManagePermsOpen(true)}
          onRetry={s.refetchRolePerms}
          c={c}
        />
      </Box>

      {/* ── Rail context menu (roles & modules) ── */}
      <Menu
        anchorEl={s.railMenuAnchor?.el}
        open={!!s.railMenuAnchor}
        onClose={() => s.setRailMenuAnchor(null)}
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
            if (!s.railMenuAnchor) return;
            const { kind, id } = s.railMenuAnchor;
            const item =
              kind === "role"
                ? s.roles.find((r) => r.roleId === id)
                : s.modules.find((m) => m.moduleId === id);
            s.setDrawerState({
              kind: kind === "role" ? "edit-role" : "edit-module",
              target: {
                id,
                label:
                  kind === "role"
                    ? ((item as LocalRole)?.roleCode ?? "")
                    : ((item as LocalModule)?.moduleName ?? ""),
              },
            });
            s.setRailMenuAnchor(null);
          }}
        >
          <ListItemIcon sx={{ minWidth: 28 }}>
            <EditOutlined sx={{ fontSize: 14, color: c.textSecondary }} />
          </ListItemIcon>
          <ListItemText primaryTypographyProps={{ fontSize: "0.8rem" }}>
            Rename…
          </ListItemText>
        </MenuItem>

        {s.railMenuAnchor?.kind === "role" && (
          <MenuItem
            sx={{
              fontSize: "0.8rem",
              color: c.textPrimary,
              borderRadius: "5px",
              mx: "4px",
              mb: "1px",
            }}
            onClick={() => {
              if (s.railMenuAnchor) s.handleDuplicateRole(s.railMenuAnchor.id);
              s.setRailMenuAnchor(null);
            }}
          >
            <ListItemIcon sx={{ minWidth: 28 }}>
              <ContentCopyOutlined
                sx={{ fontSize: 14, color: c.textSecondary }}
              />
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
            if (!s.railMenuAnchor) return;
            const { kind, id } = s.railMenuAnchor;
            s.setRailMenuAnchor(null);
            s.setConfirmDialog({
              open: true,
              title: `Delete ${kind}?`,
              body: `This removes the ${kind} permanently. This cannot be undone.`,
              onConfirm: () => {
                if (kind === "role") s.deleteRole(id);
                if (kind === "module") s.deleteModule(id);
                s.setConfirmDialog((d) => ({ ...d, open: false }));
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
        anchorEl={s.subMenuAnchor?.el}
        open={!!s.subMenuAnchor}
        onClose={() => s.setSubMenuAnchor(null)}
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
        {/* Info row */}
        {s.subMenuAnchor && (
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
              {s.buildGrantedIds(s.subMenuAnchor.row).size} /{" "}
              {s.allPermissions.length} granted
            </ListItemText>
          </MenuItem>
        )}

        <Divider sx={{ borderColor: c.border, my: "4px" }} />

        {/* Rename */}
        {s.subMenuAnchor && (
          <MenuItem
            sx={{
              fontSize: "0.8rem",
              color: c.textPrimary,
              borderRadius: "5px",
              mx: "4px",
              mb: "1px",
            }}
            onClick={() => {
              if (!s.subMenuAnchor) return;
              s.setDrawerState({
                kind: "edit-sub-module",
                target: {
                  id: s.subMenuAnchor.row.subModuleId,
                  label: s.subMenuAnchor.row.subModuleName,
                },
              });
              s.setSubMenuAnchor(null);
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

        {/* Manage permissions shortcut */}
        {s.subMenuAnchor && (
          <MenuItem
            sx={{
              fontSize: "0.8rem",
              color: c.textPrimary,
              borderRadius: "5px",
              mx: "4px",
              mb: "1px",
            }}
            onClick={() => {
              s.setSubMenuAnchor(null);
              s.setManagePermsOpen(true);
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
        {s.subMenuAnchor && (
          <MenuItem
            sx={{
              fontSize: "0.8rem",
              color: c.danger,
              borderRadius: "5px",
              mx: "4px",
              "&:hover": { bgcolor: c.dangerDim },
            }}
            onClick={() => {
              if (!s.subMenuAnchor) return;
              const id = s.subMenuAnchor.row.subModuleId;
              const name = s.subMenuAnchor.row.subModuleName;
              s.setSubMenuAnchor(null);
              s.setConfirmDialog({
                open: true,
                title: "Delete sub-module?",
                body: `This removes "${name}" permanently. This cannot be undone.`,
                onConfirm: () => {
                  s.deleteSubModule(id);
                  s.setConfirmDialog((d) => ({ ...d, open: false }));
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

      {/* ── Manage Permissions Drawer ── */}
      <ManagePermissionsDrawer
        open={s.managePermsOpen}
        permissions={s.allPermissions}
        onClose={() => s.setManagePermsOpen(false)}
        onAdd={s.handleAddPermissionType}
        onRename={s.handleRenamePermissionType}
        onDelete={(id) => {
          s.setConfirmDialog({
            open: true,
            title: "Delete permission type?",
            body: "This removes the permission chip from all sub-module rows. Existing grants for this permission will no longer be visible but are not deleted from the database.",
            onConfirm: () => {
              s.handleDeletePermissionType(id);
              s.setConfirmDialog((d) => ({ ...d, open: false }));
            },
          });
        }}
        c={c}
      />

      {/* ── CreateDrawer ── */}
      <CreateDrawer
        open={!!s.drawerState}
        state={s.drawerState}
        roles={s.roles}
        onClose={() => s.setDrawerState(null)}
        onAddRole={s.handleAddRole}
        onAddModule={s.handleAddModule}
        onEditRole={s.handleEditRole}
        onEditModule={s.handleEditModule}
        onAddSubModule={s.handleAddSubModule}
        onEditSubModule={s.handleEditSubModule}
        onEditPermission={s.handleEditPermission}
        c={c}
      />

      {/* ── Confirm dialog ── */}
      <Dialog
        open={s.confirmDialog.open}
        onClose={() => s.setConfirmDialog((d) => ({ ...d, open: false }))}
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
          sx={{
            fontSize: "1rem",
            fontWeight: 600,
            color: c.textPrimary,
            pb: 1,
          }}
        >
          {s.confirmDialog.title}
        </DialogTitle>
        <DialogContent>
          <DialogContentText
            sx={{ fontSize: "0.82rem", color: c.textSecondary }}
          >
            {s.confirmDialog.body}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, pb: 2, gap: 1 }}>
          <Box
            component="button"
            onClick={() => s.setConfirmDialog((d) => ({ ...d, open: false }))}
            sx={{
              ...dangerBtnSx,
              border: `1px solid ${c.border}`,
              bgcolor: "transparent",
              color: c.textSecondary,
            }}
          >
            Cancel
          </Box>
          <Box
            component="button"
            onClick={s.confirmDialog.onConfirm}
            sx={{
              ...dangerBtnSx,
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
        open={s.snackbar.open}
        autoHideDuration={3000}
        onClose={() => s.setSnackbar((sn) => ({ ...sn, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={s.snackbar.severity}
          onClose={() => s.setSnackbar((sn) => ({ ...sn, open: false }))}
          variant="filled"
          sx={{ fontSize: "0.8rem", borderRadius: "8px" }}
        >
          {s.snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
