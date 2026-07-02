import React, { useState, useEffect } from "react";
import { Box, Typography, Divider, Drawer, alpha } from "@mui/material";
import { CloseOutlined } from "@mui/icons-material";
import type { useTabColorTokens } from "../../../../style/theme";
import { ROLE_LABEL } from "./Constants";
import type { DrawerState, LocalRole, DrawerKind } from "./GlobalSettingTypes";
import { slug } from "./Utils";
// import type { useTabColorTokens } from "../../../style/theme";
// import type { DrawerState, DrawerKind, LocalRole } from "./types";
// import { ROLE_LABEL } from "./constants";
// import { slug } from "./utils";

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

const TITLE_MAP: Record<DrawerKind, string> = {
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

const PLACEHOLDER_MAP: Record<string, string> = {
  role: "e.g. Regional Manager",
  module: "e.g. Reports",
  "sub-module": "e.g. Monthly Summary",
  permission: "e.g. Approve",
};

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
    | "role" | "module" | "sub-module" | "permission" | undefined;

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
      {/* Header */}
      <Box
        sx={{
          px: 2.5, py: 2.25,
          borderBottom: `1px solid ${c.border}`,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        <Typography fontSize="1rem" fontWeight={600} color={c.textPrimary} letterSpacing="-0.015em">
          {state ? TITLE_MAP[state.kind] : ""}
        </Typography>
        <Box flex={1} />
        <Box
          component="button"
          onClick={onClose}
          sx={{
            width: 28, height: 28, border: "none", borderRadius: "6px",
            bgcolor: "transparent", color: c.textSecondary, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            "&:hover": { bgcolor: c.isDark ? "rgba(255,255,255,0.06)" : "rgba(13,27,42,0.05)" },
          }}
        >
          <CloseOutlined sx={{ fontSize: 16 }} />
        </Box>
      </Box>

      {/* Body */}
      <Box sx={{ flex: 1, overflowY: "auto", px: 2.5, py: 2.5 }}>
        {/* Edit-permission notice */}
        {state?.kind === "edit-permission" && (
          <Box
            sx={{
              display: "flex", alignItems: "center", gap: 1, px: 1.5, py: 1,
              borderRadius: "8px", bgcolor: alpha(c.accent, 0.06),
              border: `1px solid ${alpha(c.accent, 0.2)}`, mb: 2,
            }}
          >
            <Typography fontSize="0.72rem" color={c.textSecondary}>
              Renaming the display label of permission ID{" "}
              <Box component="span" sx={{ fontFamily: "'JetBrains Mono', monospace", color: c.textPrimary }}>
                {state.target?.id}
              </Box>
              . The underlying permission key in the database is not changed.
            </Typography>
          </Box>
        )}

        <Typography
          component="label" fontSize="0.72rem" fontWeight={600}
          color={c.textSecondary} display="block" mb={0.75}
        >
          Display name
        </Typography>
        <input
          autoFocus
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder={kindBase ? (PLACEHOLDER_MAP[kindBase] ?? "Enter name…") : "Enter name…"}
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
          onFocus={(e) => (e.target.style.boxShadow = `0 0 0 3px ${alpha(c.accent, 0.15)}`)}
          onBlur={(e) => (e.target.style.boxShadow = "none")}
        />

        {showSlug && (
          <Typography fontSize="0.68rem" color={c.textDim} mt={0.5}>
            Stored as key{" "}
            <Box component="span" sx={{ fontFamily: "'JetBrains Mono', monospace", color: c.textSecondary }}>
              {slug(label) || (kindBase?.toUpperCase().replace("-", "_") ?? "")}
            </Box>
          </Typography>
        )}

        {/* Copy-from role (create role only) */}
        {kindBase === "role" && !isEdit && (
          <>
            <Divider sx={{ borderColor: c.border, my: 2 }} />
            <Typography
              fontSize="0.72rem" fontWeight={600} color={c.textSecondary}
              display="block" mb={0.75}
            >
              Copy permissions from (optional)
            </Typography>
            <select
              value={copyFromRoleId}
              onChange={(e) => setCopyFromRoleId(e.target.value ? Number(e.target.value) : "")}
              style={{
                width: "100%", border: `1px solid ${c.border}`, borderRadius: 6,
                padding: "8px 10px", fontSize: "0.82rem", fontFamily: "inherit",
                background: c.surface, color: c.textPrimary, outline: "none",
                cursor: "pointer", boxSizing: "border-box",
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
          px: 2.5, py: 1.75, borderTop: `1px solid ${c.border}`,
          display: "flex", gap: 1, justifyContent: "flex-end",
        }}
      >
        <Box
          component="button" onClick={onClose}
          sx={{
            ...btnSx, bgcolor: "transparent", color: c.textSecondary,
            "&:hover": { bgcolor: c.isDark ? "rgba(255,255,255,0.04)" : "rgba(13,27,42,0.04)" },
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
              ? { bgcolor: c.isDark ? "rgba(255,255,255,0.88)" : "rgba(13,27,42,0.85)" }
              : {},
          }}
        >
          {isEdit ? "Save changes" : "Create"}
        </Box>
      </Box>
    </Drawer>
  );
};

export default CreateDrawer;