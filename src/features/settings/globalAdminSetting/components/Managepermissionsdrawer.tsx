import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Divider,
  Drawer,
  Tooltip,
  alpha,
} from "@mui/material";
import {
  TuneOutlined,
  CloseOutlined,
  AddOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@mui/icons-material";
import type { PermissionModel } from "../Globalsettingapislice";
import type { useTabColorTokens } from "../../../../style/theme";

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
        <Typography fontSize="1rem" fontWeight={600} color={c.textPrimary} letterSpacing="-0.015em">
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
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  bgcolor: alpha(c.accent, 0.6),
                  flexShrink: 0,
                }}
              />

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
                <Typography flex={1} fontSize="0.85rem" color={c.textPrimary} fontWeight={500}>
                  {p.permissionName}
                </Typography>
              )}

              <Typography
                fontSize="0.62rem"
                color={c.textDim}
                fontFamily="'JetBrains Mono', monospace"
                sx={{ flexShrink: 0 }}
              >
                #{p.permissionId}
              </Typography>

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
                        "&:hover": {
                          bgcolor: c.isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
                        },
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
                        onClick={() => { setEditingId(p.permissionId); setEditingName(p.permissionName); }}
                        sx={{
                          width: 26, height: 26, borderRadius: "5px",
                          border: `1px solid ${c.border}`, bgcolor: "transparent",
                          color: c.textDim, cursor: "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          "&:hover": { bgcolor: c.accentDim, color: c.accent, border: `1px solid ${c.accentBorder}` },
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
                          width: 26, height: 26, borderRadius: "5px",
                          border: `1px solid ${c.border}`, bgcolor: "transparent",
                          color: c.textDim, cursor: "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          "&:hover": { bgcolor: c.dangerDim, color: c.danger, border: `1px solid ${alpha(c.danger, 0.4)}` },
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

        {/* Add new */}
        <Divider sx={{ borderColor: c.border, mb: 2 }} />
        <Typography
          fontSize="0.68rem" fontWeight={700} color={c.textDim}
          letterSpacing="0.08em" textTransform="uppercase" mb={1}
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
            onFocus={(e) => (e.target.style.boxShadow = `0 0 0 3px ${alpha(c.accent, 0.15)}`)}
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
                ? { bgcolor: c.isDark ? "rgba(255,255,255,0.88)" : "rgba(13,27,42,0.85)" }
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
          px: 2.5, py: 1.75,
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
            "&:hover": { bgcolor: c.isDark ? "rgba(255,255,255,0.88)" : "rgba(13,27,42,0.85)" },
          }}
        >
          Done
        </Box>
      </Box>
    </Drawer>
  );
};

export default ManagePermissionsDrawer;