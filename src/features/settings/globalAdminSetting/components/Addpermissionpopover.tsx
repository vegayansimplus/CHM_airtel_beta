import React from "react";
import { Box, Popover, Typography, alpha } from "@mui/material";
import { AddOutlined } from "@mui/icons-material";
import type { useTabColorTokens } from "../../../../style/theme";
import type { AddablePermission } from "../types/permissionTypes";

interface AddPermissionPopoverProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  availablePermissions: AddablePermission[];
  onClose: () => void;
  onSelect: (perm: AddablePermission) => void;
  c: ReturnType<typeof useTabColorTokens>;
}

export const AddPermissionPopover: React.FC<AddPermissionPopoverProps> = ({
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
        boxShadow: c.isDark ? "0 12px 30px -12px rgba(0,0,0,0.5)" : "0 12px 30px -12px rgba(13,27,42,0.2)",
        minWidth: 240,
        maxHeight: 320,
        overflow: "hidden",
      },
    }}
  >
    <Box sx={{ px: 1.5, py: 1, borderBottom: `1px solid ${c.border}` }}>
      <Typography fontSize="0.65rem" fontWeight={700} color={c.textDim} letterSpacing="0.08em" textTransform="uppercase">
        Add Permission
      </Typography>
    </Box>
    <Box sx={{ maxHeight: 260, overflowY: "auto", py: 0.5 }}>
      {availablePermissions.length === 0 ? (
        <Typography fontSize="0.78rem" color={c.textDim} fontStyle="italic" px={1.5} py={2} textAlign="center">
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
              "&:hover": { bgcolor: alpha(c.accent, 0.08) },
            }}
          >
            <AddOutlined sx={{ fontSize: 13, color: c.accent }} />
            <Typography fontSize="0.82rem" color={c.textPrimary} fontWeight={500} sx={{ flex: 1 }}>
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
                bgcolor: c.isDark ? "rgba(255,255,255,0.06)" : "rgba(13,27,42,0.05)",
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
