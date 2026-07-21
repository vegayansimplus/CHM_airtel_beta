import { useEffect, useState } from "react";
import { TASKS } from "../mocks/dashboard.mock";
import type { TaskFilter, WorkMode } from "../types/dashboard.types";

/**
 * Local UI state for the Modern Home Dashboard.
 * Backed by static mock data, except the roster/schedule card which now
 * sources live data from `useDashboardRoster` (RTK Query) instead — see
 * ModernHomeDashboard.tsx. Remaining mock-driven state stays here.
 */
export function useHomeDashboard() {
  const [taskFilter, setTaskFilter] = useState<TaskFilter>("All");
  const [wfMode, setWfMode] = useState<WorkMode>("WFH");
  const [checkedTasks, setCheckedTasks] = useState<Record<number, boolean>>({ 1: true });
  const [mounted, setMounted] = useState(false);
  const [hoveredTask, setHoveredTask] = useState<number | null>(null);
  const [taskMenuAnchor, setTaskMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [wfhBounce, setWfhBounce] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  const toggleTask = (id: number) => setCheckedTasks((p) => ({ ...p, [id]: !p[id] }));

  const doneCount = Object.values(checkedTasks).filter(Boolean).length;
  const progressPct = (doneCount / TASKS.length) * 100;

  const visibleTasks = TASKS.filter((t) =>
    taskFilter === "Done" ? !!checkedTasks[t.id] : taskFilter === "Pending" ? !checkedTasks[t.id] : true,
  );

  const changeWorkMode = (mode: WorkMode) => {
    setWfMode(mode);
    setWfhBounce(true);
    setTimeout(() => setWfhBounce(false), 300);
  };

  const openTaskMenu = (anchor: HTMLElement, id: number) => {
    setTaskMenuAnchor(anchor);
    setSelectedTaskId(id);
  };

  const closeTaskMenu = () => setTaskMenuAnchor(null);

  const runTaskMenuAction = (action: string) => {
    if (action === "Mark done" && selectedTaskId) toggleTask(selectedTaskId);
    closeTaskMenu();
  };

  return {
    mounted,

    taskFilter,
    setTaskFilter,
    visibleTasks,
    doneCount,
    totalTasks: TASKS.length,
    progressPct,
    checkedTasks,
    toggleTask,
    hoveredTask,
    setHoveredTask,

    taskMenuAnchor,
    selectedTaskId,
    openTaskMenu,
    closeTaskMenu,
    runTaskMenuAction,

    wfMode,
    changeWorkMode,
    wfhBounce,
  };
}

export type UseHomeDashboardResult = ReturnType<typeof useHomeDashboard>;
