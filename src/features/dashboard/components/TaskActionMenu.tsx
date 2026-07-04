import { Menu, MenuItem } from "@mui/material";
import type { Colors } from "../types/colorTypes";

const MENU_OPTIONS = ["Mark done", "Set priority", "Reassign", "Delete"] as const;

interface TaskActionMenuProps {
  anchorEl: HTMLElement | null;
  colors: Colors;
  onClose: () => void;
  onSelect: (option: string) => void;
}

export function TaskActionMenu({ anchorEl, colors, onClose, onSelect }: TaskActionMenuProps) {
  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            borderRadius: "10px",
            border: `1.5px solid ${colors.border}`,
            boxShadow: colors.isDark ? "0 8px 24px rgba(0,0,0,.5)" : "0 8px 24px rgba(60,60,140,.12)",
            minWidth: 130,
            background: colors.surface,
          },
        },
      }}
    >
      {MENU_OPTIONS.map((opt) => (
        <MenuItem
          key={opt}
          onClick={() => onSelect(opt)}
          sx={{
            fontSize: 11,
            fontWeight: 500,
            color: opt === "Delete" ? colors.danger : colors.textPrimary,
            py: "6px",
            "&:hover": { background: colors.accentDim },
          }}
        >
          {opt}
        </MenuItem>
      ))}
    </Menu>
  );
}
