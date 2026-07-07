import { Box, Card, Typography } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import type { Colors } from "../types/colorTypes";
import type { Task, TaskFilter } from "../types/dashboard.types";
import { fadeIn, getCardSx } from "../constants/dashboard.styles";
import { RadialProgress } from "./RadialProgress";
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
  const total = doneCount + remainingCount;
  const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0;
  const filterCounts: Record<TaskFilter, number> = {
    All: total,
    Pending: remainingCount,
    Done: doneCount,
  };

  return (
    <Card
      sx={{
        ...getCardSx(colors),
        p: "16px",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        ...fadeIn(mounted, delay),
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: "12px" }}>
        <Box>
          <Typography sx={{ fontSize: 14, fontWeight: 700, color: colors.textPrimary }}>Today's tasks</Typography>
          <Typography sx={{ fontSize: 11, color: colors.textSecondary, mt: 0.3 }}>
            {remainingCount} remaining · {doneCount} done
          </Typography>
        </Box>
        <Box sx={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <RadialProgress value={doneCount} max={Math.max(total, 1)} size={40} stroke={4} color={colors.accent} trackColor={colors.surface2} />
          <Typography sx={{ position: "absolute", fontSize: 10, fontWeight: 800, color: colors.textPrimary }}>
            {pct}%
          </Typography>
        </Box>
      </Box>

      {/* Segmented filter — pills with live counts */}
      <Box
        sx={{
          display: "flex",
          gap: "3px",
          p: "3px",
          mb: "10px",
          borderRadius: "10px",
          background: colors.surface2,
          border: `1px solid ${colors.border}`,
        }}
      >
        {FILTERS.map((f) => {
          const active = taskFilter === f;
          return (
            <Box
              key={f}
              onClick={() => onFilterChange(f)}
              sx={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "5px",
                py: "6px",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: 11.5,
                fontWeight: active ? 800 : 600,
                color: active ? colors.accent : colors.textSecondary,
                background: active ? colors.surface : "transparent",
                border: `1px solid ${active ? colors.accentBorder : "transparent"}`,
                boxShadow: active ? (colors.isDark ? "0 2px 8px rgba(0,0,0,.35)" : "0 2px 8px rgba(60,60,140,.1)") : "none",
                transition: "all .18s",
                "&:hover": { color: colors.accent },
              }}
            >
              {f}
              <Box
                component="span"
                sx={{
                  fontSize: 9,
                  fontWeight: 800,
                  px: "6px",
                  py: "1px",
                  borderRadius: "20px",
                  background: active ? colors.accentDim : colors.border,
                  color: active ? colors.accent : colors.textSecondary,
                  lineHeight: 1.6,
                }}
              >
                {filterCounts[f]}
              </Box>
            </Box>
          );
        })}
      </Box>

      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: "2px" }}>
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
          <Box sx={{ textAlign: "center", py: "22px", my: "auto" }}>
            <CheckCircleOutlineIcon sx={{ fontSize: 30, color: colors.accentBorder, mb: 1 }} />
            <Typography sx={{ color: colors.textDim, fontSize: 12, fontWeight: 600 }}>All caught up! 🎉</Typography>
          </Box>
        )}
      </Box>

      <TaskActionMenu anchorEl={taskMenuAnchor} colors={colors} onClose={onCloseTaskMenu} onSelect={onTaskMenuAction} />
    </Card>
  );
}
