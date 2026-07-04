import { Box, Grid } from "@mui/material";
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
        p: "18px 20px",
        minHeight: "100vh",
        background: colors.isDark
          ? `linear-gradient(150deg,${colors.bg} 0%,${colors.surface} 100%)`
          : "linear-gradient(150deg,#f0f4ff 0%,#fafbff 50%,#f0fdf6 100%)",
        fontFamily: "'Plus Jakarta Sans','DM Sans','Segoe UI',sans-serif",
      }}
    >
      <Box sx={{ display: "flex", flexDirection: { xs: "column", lg: "row" }, gap: "14px", alignItems: "flex-start" }}>
        {/* ══ LEFT — Profile + Work Location + Holidays ══ */}
        <Box sx={{ width: { xs: "100%", lg: 300 }, flexShrink: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
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
        </Box>

        {/* ══ RIGHT — task widgets + schedule + reschedule notifications ══ */}
        <Box sx={{ flex: 1, minWidth: 0, width: "100%", display: "flex", flexDirection: "column", gap: "14px" }}>
          <Grid container spacing="14px" alignItems="flex-start">
            <Grid size={{ xs: 12, md: 6 }}>
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
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <StatCardsGrid cards={STAT_CARDS} colors={colors} mounted={mounted} delay={0.05} />
            </Grid>
          </Grid>

          <WeeklyScheduleCard
            week={WEEK}
            rangeLabel={WEEKLY_SCHEDULE_RANGE_LABEL}
            scheduleHover={scheduleHover}
            colors={colors}
            mounted={mounted}
            delay={0.1}
            onHoverChange={setScheduleHover}
          />

          <OnLeaveTodayCard team={LEAVE_TEAM} colors={colors} mounted={mounted} delay={0.15} />

          <RescheduleNotificationPage />
        </Box>
      </Box>
    </Box>
  );
}
