import { useEffect, useRef, useState } from "react";
import { Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTabColorTokens } from "../../../style/theme";
import { RescheduleNotificationPage } from "../../rescheduleNotification";
import { useDashboardRoster } from "../hooks/useDashboardRoster";
import { useDashboardProfile } from "../hooks/useDashboardProfile";
import { useDashboardHolidays } from "../hooks/useDashboardHolidays";
import { useDashboardLeaveTeam } from "../hooks/useDashboardLeaveTeam";
import { useDashboardAssignments } from "../hooks/useDashboardAssignments";
import { useDashboardAttendance } from "../hooks/useDashboardAttendance";
import { useDashboardStats } from "../hooks/useDashboardStats";
import { ProfileCard } from "../components/ProfileCard";
import { AttendanceCard } from "../components/AttendanceCard";
import { UpcomingHolidaysCard } from "../components/UpcomingHolidaysCard";
import { TodaysAssignmentsCard } from "../components/TodaysAssignmentsCard";
import { StatCardsGrid } from "../components/StatCardsGrid";
import { WeeklyScheduleCard } from "../components/WeeklyScheduleCard";
import { OnLeaveTodayCard } from "../components/OnLeaveTodayCard";
import { usePageLoading } from "../../../components/loading/LoadingProvider";
import PageLoader from "../../../components/loading/PageLoader";

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
  const attendance = useDashboardAttendance();
  const statCards = useDashboardStats();

  // Page Loader covers only the *first* load of this page's 7 parallel
  // queries; once every widget has settled once (ready/empty/error), this
  // flips permanently false so later background refetches never re-trigger
  // it — each card then relies on its own (now refetch-safe) status.
  const hasLoadedOnceRef = useRef(false);
  const anyStillLoading = [
    roster.status,
    profileStatus,
    holidays.status,
    leaveTeam.status,
    assignments.status,
    attendance.status,
  ].some((s) => s === "loading");
  useEffect(() => {
    if (!anyStillLoading) hasLoadedOnceRef.current = true;
  }, [anyStillLoading]);
  const isInitialLoading = anyStillLoading && !hasLoadedOnceRef.current;
  usePageLoading(isInitialLoading, "home-dashboard");

  if (isInitialLoading) {
    return <PageLoader height="70vh" />;
  }

  return (
    <Box
      sx={{
        p: { xs: "12px 4px 28px", md: "16px 8px 32px" },
        fontFamily: (theme) => theme.typography.fontFamily,
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
              wfMode: attendance.attendance?.workfromLocation ?? "—",
            }}
            colors={colors}
            mounted={mounted}
            delay={0.05}
          />

          <AttendanceCard
            attendance={attendance.attendance}
            status={attendance.status}
            errorMessage={attendance.errorMessage}
            isMutating={attendance.isMutating}
            onSetWorkMode={attendance.setWorkMode}
            onClockIn={attendance.clockIn}
            onClockOut={attendance.clockOut}
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
