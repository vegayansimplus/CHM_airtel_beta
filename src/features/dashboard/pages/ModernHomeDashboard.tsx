import { Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTabColorTokens } from "../../../style/theme";
import { RescheduleNotificationPage } from "../../rescheduleNotification";
import { useHomeDashboard } from "../hooks/useHomeDashboard";
import {
  HOLIDAYS,
  LEAVE_TEAM,
  PROFILE,
  STAT_CARDS,
  TASKS,
  WEEK,
  WEEKLY_SCHEDULE_RANGE_LABEL,
  WFH_WEEK,
  WORK_LOCATION_DATE_LABEL,
} from "../mocks/dashboard.mock";
import { ProfileCard } from "../components/ProfileCard";
import { WorkLocationCard } from "../components/WorkLocationCard";
import { UpcomingHolidaysCard } from "../components/UpcomingHolidaysCard";
import { TodaysTasksCard } from "../components/TodaysTasksCard";
import { StatCardsGrid } from "../components/StatCardsGrid";
import { WeeklyScheduleCard } from "../components/WeeklyScheduleCard";
import { OnLeaveTodayCard } from "../components/OnLeaveTodayCard";

export default function ModernHomeDashboard() {
  const theme = useTheme();
  const colors = useTabColorTokens(theme);

  const {
    mounted,
    taskFilter,
    setTaskFilter,
    visibleTasks,
    doneCount,
    totalTasks,
    progressPct,
    checkedTasks,
    toggleTask,
    hoveredTask,
    setHoveredTask,
    taskMenuAnchor,
    openTaskMenu,
    closeTaskMenu,
    runTaskMenuAction,
    wfMode,
    changeWorkMode,
    wfhBounce,
    scheduleHover,
    setScheduleHover,
  } = useHomeDashboard();

  return (
    <Box
      sx={{
        p: { xs: "12px 4px 28px", md: "16px 8px 32px" },
        fontFamily: "'Plus Jakarta Sans','DM Sans','Segoe UI',sans-serif",
      }}
    >
      {/* ══ Main grid — fixed left rail + fluid right column ══ */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "300px minmax(0, 1fr)" },
          gap: "16px",
          alignItems: "start",
        }}
      >
        {/* ── LEFT — Profile, Work location, Holidays, On leave ── */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: "16px", minWidth: 0 }}>
          <ProfileCard
            name={PROFILE.name}
            role={PROFILE.role}
            employeeId={PROFILE.id}
            doneCount={doneCount}
            totalTasks={totalTasks}
            progressPct={progressPct}
            wfMode={wfMode}
            colors={colors}
            mounted={mounted}
            delay={0.05}
          />

          <WorkLocationCard
            wfMode={wfMode}
            wfhBounce={wfhBounce}
            weekLabel={WORK_LOCATION_DATE_LABEL}
            week={WFH_WEEK}
            colors={colors}
            mounted={mounted}
            delay={0.1}
            onChangeMode={changeWorkMode}
          />

          <UpcomingHolidaysCard holidays={HOLIDAYS} colors={colors} mounted={mounted} delay={0.15} />

          <OnLeaveTodayCard team={LEAVE_TEAM} colors={colors} mounted={mounted} delay={0.2} />
        </Box>

        {/* ── RIGHT — Tasks + stats (equal height), schedule, notifications ── */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: "16px", minWidth: 0 }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: "16px",
              alignItems: "stretch",
            }}
          >
            <TodaysTasksCard
              tasks={visibleTasks}
              doneCount={doneCount}
              remainingCount={TASKS.length - doneCount}
              taskFilter={taskFilter}
              checkedTasks={checkedTasks}
              hoveredTask={hoveredTask}
              taskMenuAnchor={taskMenuAnchor}
              colors={colors}
              mounted={mounted}
              delay={0.08}
              onFilterChange={setTaskFilter}
              onToggleTask={toggleTask}
              onHoverTask={setHoveredTask}
              onOpenTaskMenu={openTaskMenu}
              onCloseTaskMenu={closeTaskMenu}
              onTaskMenuAction={runTaskMenuAction}
            />

            <StatCardsGrid cards={STAT_CARDS} colors={colors} mounted={mounted} delay={0.12} />
          </Box>

          <WeeklyScheduleCard
            week={WEEK}
            rangeLabel={WEEKLY_SCHEDULE_RANGE_LABEL}
            scheduleHover={scheduleHover}
            colors={colors}
            mounted={mounted}
            delay={0.16}
            onHoverChange={setScheduleHover}
          />

          <RescheduleNotificationPage />
        </Box>
      </Box>
    </Box>
  );
}
