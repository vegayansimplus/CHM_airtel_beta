import { useEffect, useState } from "react";
import { Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTabColorTokens } from "../../../style/theme";
import { RescheduleNotificationPage } from "../../rescheduleNotification";
import { useDashboardRoster } from "../hooks/useDashboardRoster";
import { useDashboardProfile } from "../hooks/useDashboardProfile";
import { useDashboardHolidays } from "../hooks/useDashboardHolidays";
import { useDashboardLeaveTeam } from "../hooks/useDashboardLeaveTeam";
import { useDashboardAssignments } from "../hooks/useDashboardAssignments";
import { useDashboardWorkLocation } from "../hooks/useDashboardWorkLocation";
import { useDashboardStats } from "../hooks/useDashboardStats";
import { ProfileCard } from "../components/ProfileCard";
import { WorkLocationCard } from "../components/WorkLocationCard";
import { UpcomingHolidaysCard } from "../components/UpcomingHolidaysCard";
import { TodaysAssignmentsCard } from "../components/TodaysAssignmentsCard";
import { StatCardsGrid } from "../components/StatCardsGrid";
import { WeeklyScheduleCard } from "../components/WeeklyScheduleCard";
import { OnLeaveTodayCard } from "../components/OnLeaveTodayCard";

export default function ModernHomeDashboard() {
  const theme = useTheme();
  const colors = useTabColorTokens(theme);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  const roster = useDashboardRoster();
  const { profile, status: profileStatus, errorMessage: profileErrorMessage } = useDashboardProfile();
  const holidays = useDashboardHolidays();
  const leaveTeam = useDashboardLeaveTeam();
  const assignments = useDashboardAssignments();
  const workLocation = useDashboardWorkLocation();
  const statCards = useDashboardStats();

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
            status={profileStatus}
            profile={profile}
            errorMessage={profileErrorMessage}
            stats={{
              doneCount: assignments.doneCount,
              totalTasks: assignments.totalCount,
              progressPct: assignments.totalCount > 0 ? (assignments.doneCount / assignments.totalCount) * 100 : 0,
              wfMode: workLocation.location?.workfromLocation ?? "—",
            }}
            colors={colors}
            mounted={mounted}
            delay={0.05}
          />

          <WorkLocationCard
            location={workLocation.location}
            status={workLocation.status}
            errorMessage={workLocation.errorMessage}
            colors={colors}
            mounted={mounted}
            delay={0.1}
          />

          <UpcomingHolidaysCard
            holidays={holidays.holidays}
            status={holidays.status}
            errorMessage={holidays.errorMessage}
            colors={colors}
            mounted={mounted}
            delay={0.15}
          />

          <OnLeaveTodayCard
            team={leaveTeam.team}
            status={leaveTeam.status}
            errorMessage={leaveTeam.errorMessage}
            colors={colors}
            mounted={mounted}
            delay={0.2}
          />
        </Box>

        {/* ── RIGHT — Assignments + stats (equal height), schedule, notifications ── */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: "16px", minWidth: 0 }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: "16px",
              alignItems: "stretch",
            }}
          >
            <TodaysAssignmentsCard
              assignments={assignments.assignments}
              doneCount={assignments.doneCount}
              totalCount={assignments.totalCount}
              status={assignments.status}
              errorMessage={assignments.errorMessage}
              colors={colors}
              mounted={mounted}
              delay={0.08}
            />

            <StatCardsGrid cards={statCards} colors={colors} mounted={mounted} delay={0.12} />
          </Box>
          <RescheduleNotificationPage />

          <WeeklyScheduleCard
            week={roster.days}
            rangeLabel={roster.rangeLabel}
            status={roster.status}
            errorMessage={roster.errorMessage}
            anchorDate={roster.anchorDate}
            colors={colors}
            mounted={mounted}
            delay={0.16}
            onPrev={roster.goPrev}
            onNext={roster.goNext}
            onToday={roster.goToday}
          />
        </Box>
      </Box>
    </Box>
  );
}
