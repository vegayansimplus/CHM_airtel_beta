import { useState, useEffect, useMemo, useCallback } from "react";
import {
  type PermissionModel,
  type RolePermissionViewModel,
  useGetRolesQuery,
  useGetModulesQuery,
  useGetPermissionTypesQuery,
  useEnablePermissionMutation,
  useDisablePermissionMutation,
  useGetAllRolePermissionsQuery,
} from "../Globalsettingapislice";
import { DEFAULT_PERMISSIONS } from "./Constants";
import type {
  LocalRole,
  LocalModule,
  LocalSubModule,
  LocalPermission,
  SnackbarState,
  DrawerState,
  ConfirmDialogState,
} from "./GlobalSettingTypes";
import {
  parseGrantedPermissions,
  extractApiErrorMessage,
  newLocalId,
  slug,
} from "./Utils";

export function usePermissionsState() {
  // ── Selection ──────────────────────────────────────────────
  const [activeRoleId, setActiveRoleId] = useState<number | null>(null);
  const [activeModuleId, setActiveModuleId] = useState<number | null>(null);

  // ── Local CRUD state ───────────────────────────────────────
  const [localRoles, setLocalRoles] = useState<LocalRole[]>([]);
  const [localModules, setLocalModules] = useState<LocalModule[]>([]);
  const [deletedRoleIds, setDeletedRoleIds] = useState<Set<number>>(new Set());
  const [deletedModuleIds, setDeletedModuleIds] = useState<Set<number>>(
    new Set(),
  );

  const [localSubModules, setLocalSubModules] = useState<LocalSubModule[]>([]);
  const [deletedSubModuleIds, setDeletedSubModuleIds] = useState<Set<number>>(
    new Set(),
  );

  const [managedPermissions, setManagedPermissions] =
    useState<PermissionModel[]>(DEFAULT_PERMISSIONS);
  const [localPermissions, setLocalPermissions] = useState<LocalPermission[]>(
    [],
  );

  // ── UI state ───────────────────────────────────────────────
  const [managePermsOpen, setManagePermsOpen] = useState(false);
  const [roleQuery, setRoleQuery] = useState("");
  const [modQuery, setModQuery] = useState("");
  const [optimistic, setOptimistic] = useState<Record<string, boolean>>({});
  const [savingKey, setSavingKey] = useState<string | null>(null);

  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
    severity: "success",
  });

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

  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
    open: false,
    title: "",
    body: "",
    onConfirm: () => {},
  });

  // ── API ────────────────────────────────────────────────────
  const { data: apiRoles = [], isLoading: rolesLoading } = useGetRolesQuery();
  const { data: apiModules = [], isLoading: modulesLoading } =
    useGetModulesQuery();
  useGetPermissionTypesQuery(); // keep cache warm

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

  // ── Derived: resolved permissions ──────────────────────────
  const allPermissions: PermissionModel[] = useMemo(() => {
    return managedPermissions.map((p) => {
      const override = localPermissions.find(
        (lp) => lp.permissionId === p.permissionId,
      );
      return override ? { ...p, permissionName: override.permissionName } : p;
    });
  }, [managedPermissions, localPermissions]);

  // ── Derived: merged roles ──────────────────────────────────
  const roles: LocalRole[] = useMemo(() => {
    const apiMapped = apiRoles
      .filter((r) => !deletedRoleIds.has(r.roleId))
      .map(
        (r) =>
          localRoles.find((lr) => lr.roleId === r.roleId && !lr.isLocal) ?? r,
      );
    return [...apiMapped, ...localRoles.filter((lr) => lr.isLocal)];
  }, [apiRoles, localRoles, deletedRoleIds]);

  // ── Derived: merged modules ────────────────────────────────
  const modules: LocalModule[] = useMemo(() => {
    const apiMapped = apiModules
      .filter((m) => !deletedModuleIds.has(m.moduleId))
      .map(
        (m) =>
          localModules.find(
            (lm) => lm.moduleId === m.moduleId && !lm.isLocal,
          ) ?? m,
      );
    return [...apiMapped, ...localModules.filter((lm) => lm.isLocal)];
  }, [apiModules, localModules, deletedModuleIds]);

  // ── Derived: merged sub-module rows ───────────────────────
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

  // ── Auto-select ────────────────────────────────────────────
  useEffect(() => {
    if (roles.length && !activeRoleId) setActiveRoleId(roles[0].roleId);
  }, [roles, activeRoleId]);

  useEffect(() => {
    if (modules.length && !activeModuleId)
      setActiveModuleId(modules[0].moduleId);
  }, [modules, activeModuleId]);

  useEffect(() => {
    setOptimistic({});
  }, [activeRoleId, activeModuleId]);

  // ── Filtered lists ─────────────────────────────────────────
  const filteredRoles = useMemo(
    () =>
      roles.filter(
        (r) =>
          !roleQuery ||
          r.roleCode.toLowerCase().includes(roleQuery.toLowerCase()),
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

  // ── Granted-id set builder ─────────────────────────────────
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
    async (
      subModuleId: number,
      permissionId: number,
      currentGranted: boolean,
    ) => {
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

  // ── CRUD: Permission types ─────────────────────────────────
  const handleAddPermissionType = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setManagedPermissions((prev) => [
      ...prev,
      { permissionId: newLocalId(), permissionName: trimmed },
    ]);
    setSnackbar({
      open: true,
      message: `Permission type "${trimmed}" added.`,
      severity: "success",
    });
  };

  const handleRenamePermissionType = (id: number, name: string) => {
    setManagedPermissions((prev) =>
      prev.map((p) =>
        p.permissionId === id ? { ...p, permissionName: name } : p,
      ),
    );
    setLocalPermissions((prev) => prev.filter((lp) => lp.permissionId !== id));
    setSnackbar({
      open: true,
      message: `Permission renamed to "${name}".`,
      severity: "success",
    });
  };

  const handleDeletePermissionType = (id: number) => {
    setManagedPermissions((prev) => prev.filter((p) => p.permissionId !== id));
    setLocalPermissions((prev) => prev.filter((lp) => lp.permissionId !== id));
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
    setSnackbar({
      open: true,
      message: "Sub-module removed.",
      severity: "info",
    });
  };

  // ── Derived summaries ──────────────────────────────────────
  const totalGranted = useMemo(
    () =>
      mergedRolePermData.reduce(
        (sum, row) => sum + buildGrantedIds(row).size,
        0,
      ),
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

  const activeRole = roles.find((r) => r.roleId === activeRoleId);
  const activeModule = modules.find((m) => m.moduleId === activeModuleId);
  const isPageLoading = rolesLoading || modulesLoading;
  const isPermsLoading = rolePermsLoading || rolePermsFetching;

  return {
    // Selection
    activeRoleId,
    setActiveRoleId,
    activeModuleId,
    setActiveModuleId,
    activeRole,
    activeModule,
    // Lists
    roles,
    modules,
    filteredRoles,
    filteredModules,
    mergedRolePermData,
    allPermissions,
    // Queries
    isPageLoading,
    isPermsLoading,
    rolePermsIsError,
    rolePermsError,
    refetchRolePerms,
    // Search
    roleQuery,
    setRoleQuery,
    modQuery,
    setModQuery,
    // Optimistic
    savingKey,
    buildGrantedIds,
    handleToggle,
    // Summaries
    totalGranted,
    totalRevoked,
    // Permission CRUD
    managedPermissions,
    managePermsOpen,
    setManagePermsOpen,
    handleAddPermissionType,
    handleRenamePermissionType,
    handleDeletePermissionType,
    handleEditPermission: handleRenamePermissionType,
    // Role CRUD
    handleAddRole,
    handleEditRole,
    handleDuplicateRole,
    deleteRole,
    // Module CRUD
    handleAddModule,
    handleEditModule,
    deleteModule,
    // SubModule CRUD
    handleAddSubModule,
    handleEditSubModule,
    deleteSubModule,
    // UI
    drawerState,
    setDrawerState,
    railMenuAnchor,
    setRailMenuAnchor,
    subMenuAnchor,
    setSubMenuAnchor,
    confirmDialog,
    setConfirmDialog,
    snackbar,
    setSnackbar,
  };
}
