import { Box, Chip, IconButton, Tooltip, Typography } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import type { Colors } from "../types/colorTypes";
import type { Task } from "../types/dashboard.types";
import { getTaskStatusStyles } from "../constants/dashboard.styles";

interface TaskListItemProps {
  task: Task;
  done: boolean;
  hovered: boolean;
  colors: Colors;
  onToggle: (id: number) => void;
  onHoverChange: (id: number | null) => void;
  onOpenMenu: (anchor: HTMLElement, id: number) => void;
}

export function TaskListItem({ task, done, hovered, colors, onToggle, onHoverChange, onOpenMenu }: TaskListItemProps) {
  const statusStyles = getTaskStatusStyles(colors);
  const sc = done ? statusStyles.Done : statusStyles[task.status];

  return (
    <Box
      onMouseEnter={() => onHoverChange(task.id)}
      onMouseLeave={() => onHoverChange(null)}
      onClick={() => onToggle(task.id)}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        p: "8px 8px 8px 6px",
        borderRadius: "9px",
        cursor: "pointer",
        transition: "all .18s",
        background: hovered ? colors.accentDim : "transparent",
        boxShadow: hovered ? `0 2px 8px ${colors.accentBorder}` : "none",
        transform: hovered ? "translateX(3px)" : "none",
        "&:hover .task-more": { opacity: 1 },
      }}
    >
      {/* status rail — colour-at-a-glance */}
      <Box
        sx={{
          width: 3,
          height: 26,
          borderRadius: "3px",
          flexShrink: 0,
          background: done ? colors.success : sc.color,
          opacity: done ? 0.5 : 0.9,
          transition: "background .2s, opacity .2s",
        }}
      />

      <Box
        onClick={(e) => {
          e.stopPropagation();
          onToggle(task.id);
        }}
        sx={{
          width: 19,
          height: 19,
          borderRadius: "6px",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all .2s",
          border: done ? "none" : `2px solid ${colors.border}`,
          background: done ? colors.accent : "transparent",
          boxShadow: done ? `0 2px 8px ${colors.accentBorder}` : "none",
          "@keyframes checkPop": {
            "0%": { transform: "scale(.7)" },
            "55%": { transform: "scale(1.18)" },
            "100%": { transform: "scale(1)" },
          },
          animation: done ? "checkPop .28s ease-out" : "none",
          "&:hover": { borderColor: colors.accent, transform: "scale(1.1)" },
        }}
      >
        {done && <CheckIcon sx={{ fontSize: 11, color: "#fff" }} />}
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          sx={{
            fontSize: 13,
            fontWeight: 600,
            color: done ? colors.textSecondary : colors.textPrimary,
            textDecoration: done ? "line-through" : "none",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            transition: "all .2s",
          }}
        >
          {task.title}
        </Typography>
        <Typography sx={{ fontSize: 11, color: colors.textSecondary, mt: "1px" }}>
          {task.dept} · {task.time}
        </Typography>
      </Box>

      <Chip
        label={done ? "Done" : task.status}
        size="small"
        sx={{
          background: sc.bg,
          color: sc.color,
          fontSize: 9,
          fontWeight: 700,
          borderRadius: "6px",
          border: `1.5px solid ${sc.ring}`,
          flexShrink: 0,
          height: "auto",
          transition: "all .2s",
          "& .MuiChip-label": { px: "8px", py: "3px" },
        }}
      />

      <Tooltip title="More options">
        <IconButton
          className="task-more"
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onOpenMenu(e.currentTarget, task.id);
          }}
          sx={{ opacity: 0, color: colors.textSecondary, transition: "opacity .15s", p: "2px", "&:hover": { color: colors.accent } }}
        >
          <MoreHorizIcon sx={{ fontSize: 14 }} />
        </IconButton>
      </Tooltip>
    </Box>
  );
}
