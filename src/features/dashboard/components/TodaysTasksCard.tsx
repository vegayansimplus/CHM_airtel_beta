import { Box, Card, Chip, IconButton, Tooltip, Typography } from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import type { Colors } from "../types/colorTypes";
import type { Task, TaskFilter } from "../types/dashboard.types";
import { fadeIn, getCardSx } from "../constants/dashboard.styles";
import { TaskListItem } from "./TaskListItem";
import { TaskActionMenu } from "./TaskActionMenu";

const FILTERS: readonly TaskFilter[] = ["All", "Pending", "Done"];

interface TodaysTasksCardProps {
  tasks: readonly Task[];
  doneCount: number;
  remainingCount: number;
  taskFilter: TaskFilter;
  checkedTasks: Record<number, boolean>;
  hoveredTask: number | null;
  taskMenuAnchor: HTMLElement | null;
  colors: Colors;
  mounted: boolean;
  delay: number;
  onFilterChange: (filter: TaskFilter) => void;
  onToggleTask: (id: number) => void;
  onHoverTask: (id: number | null) => void;
  onOpenTaskMenu: (anchor: HTMLElement, id: number) => void;
  onCloseTaskMenu: () => void;
  onTaskMenuAction: (option: string) => void;
}

export function TodaysTasksCard({
  tasks,
  doneCount,
  remainingCount,
  taskFilter,
  checkedTasks,
  hoveredTask,
  taskMenuAnchor,
  colors,
  mounted,
  delay,
  onFilterChange,
  onToggleTask,
  onHoverTask,
  onOpenTaskMenu,
  onCloseTaskMenu,
  onTaskMenuAction,
}: TodaysTasksCardProps) {
  return (
    <Card sx={{ ...getCardSx(colors), p: "14px", ...fadeIn(mounted, delay) }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: "10px" }}>
        <Box>
          <Typography sx={{ fontSize: 13, fontWeight: 700, color: colors.textPrimary }}>Today's tasks</Typography>
          <Typography sx={{ fontSize: 10, color: colors.textSecondary, mt: 0.3 }}>
            {remainingCount} remaining · {doneCount} done
          </Typography>
        </Box>
        <Chip
          label={`${tasks.length} tasks`}
          size="small"
          sx={{
            fontSize: 9,
            fontWeight: 800,
            color: colors.accent,
            background: colors.accentDim,
            borderRadius: "20px",
            height: "auto",
            "& .MuiChip-label": { px: "8px", py: "2px" },
          }}
        />
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", borderBottom: `1.5px solid ${colors.border}`, mb: "8px" }}>
        {FILTERS.map((f) => (
          <Box
            key={f}
            onClick={() => onFilterChange(f)}
            sx={{
              fontSize: 11,
              fontWeight: taskFilter === f ? 700 : 500,
              px: "10px",
              py: "6px",
              cursor: "pointer",
              color: taskFilter === f ? colors.accent : colors.textSecondary,
              borderBottom: taskFilter === f ? `2px solid ${colors.accent}` : "2px solid transparent",
              mb: "-1.5px",
              transition: "all .15s",
              "&:hover": { color: colors.accent },
            }}
          >
            {f}
          </Box>
        ))}
        <Box sx={{ flex: 1 }} />
        <Tooltip title="Filter">
          <IconButton size="small" sx={{ color: colors.textSecondary, "&:hover": { color: colors.accent } }}>
            <FilterListIcon sx={{ fontSize: 14 }} />
          </IconButton>
        </Tooltip>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: "1px" }}>
        {tasks.map((task) => (
          <TaskListItem
            key={task.id}
            task={task}
            done={!!checkedTasks[task.id]}
            hovered={hoveredTask === task.id}
            colors={colors}
            onToggle={onToggleTask}
            onHoverChange={onHoverTask}
            onOpenMenu={onOpenTaskMenu}
          />
        ))}
        {tasks.length === 0 && (
          <Box sx={{ textAlign: "center", py: "22px" }}>
            <CheckCircleOutlineIcon sx={{ fontSize: 30, color: colors.accentBorder, mb: 1 }} />
            <Typography sx={{ color: colors.textDim, fontSize: 11, fontWeight: 600 }}>All clear here! ✓</Typography>
          </Box>
        )}
      </Box>

      <TaskActionMenu anchorEl={taskMenuAnchor} colors={colors} onClose={onCloseTaskMenu} onSelect={onTaskMenuAction} />
    </Card>
  );
}
