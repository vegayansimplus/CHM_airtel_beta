import { useState } from "react";
import { IconButton, Menu, MenuItem, Stack, Tooltip, Typography, Divider } from "@mui/material";
import {
  Visibility,
  Edit,
  AdminPanelSettings,
  LockReset,
  Delete,
  MoreVert,
} from "@mui/icons-material";

export interface ActionMenuProps {
  onView: () => void;
  onEdit: () => void;
  onPermissions: () => void;
  onResetPassword: () => void;
  onDelete: () => void;
}

export default function ActionMenu({
  onView,
  onEdit,
  onPermissions,
  onResetPassword,
  onDelete,
}: ActionMenuProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  return (
    <Stack
      direction="row"
      alignItems="center"
      gap={0.25}
      className="row-actions"
      sx={{
        opacity: { xs: 1, md: 0 },
        transition: "opacity 0.15s ease",
        ".row-hover:hover &, tr:hover &": { opacity: 1 },
      }}
    >
      <Tooltip title="View profile">
        <IconButton size="small" onClick={onView} sx={{ color: "text.secondary" }}>
          <Visibility fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Edit user">
        <IconButton size="small" onClick={onEdit} sx={{ color: "text.secondary" }}>
          <Edit fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="More actions">
        <IconButton
          size="small"
          onClick={(e) => setAnchorEl(e.currentTarget)}
          sx={{ color: "text.secondary" }}
        >
          <MoreVert fontSize="small" />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        PaperProps={{
          sx: { borderRadius: "12px", boxShadow: "0 12px 32px rgba(15,23,42,0.14)", minWidth: 190 },
        }}
      >
        <MenuItem
          onClick={() => {
            onPermissions();
            setAnchorEl(null);
          }}
          sx={{ gap: 1.5 }}
        >
          <AdminPanelSettings fontSize="small" sx={{ color: "text.secondary" }} />
          <Typography variant="body2">Permissions</Typography>
        </MenuItem>
        <MenuItem
          onClick={() => {
            onResetPassword();
            setAnchorEl(null);
          }}
          sx={{ gap: 1.5 }}
        >
          <LockReset fontSize="small" sx={{ color: "text.secondary" }} />
          <Typography variant="body2">Reset Password</Typography>
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem
          onClick={() => {
            onDelete();
            setAnchorEl(null);
          }}
          sx={{ gap: 1.5, color: "#DC2626" }}
        >
          <Delete fontSize="small" />
          <Typography variant="body2" color="inherit">
            Remove User
          </Typography>
        </MenuItem>
      </Menu>
    </Stack>
  );
}
