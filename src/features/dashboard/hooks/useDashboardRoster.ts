import { useMemo, useState } from "react";
import { addWeeks, endOfWeek, format, startOfWeek, subWeeks } from "date-fns";
import { useGetUserMonthlyRosterQuery } from "../../userMe/userRoster/api/userMonthlyRosterApi";
import { buildWeekDays, formatWeekRangeLabel } from "../utils/buildWeekDays";
import type { WeekDay } from "../types/dashboard.types";

export type DashboardRosterStatus = "loading" | "error" | "empty" | "ready";

export interface DashboardRosterState {
  days: WeekDay[];
  rangeLabel: string;
  status: DashboardRosterStatus;
  errorMessage?: string;
  anchorDate: Date;
  goPrev: () => void;
  goNext: () => void;
  goToday: () => void;
}

/** Owns the dashboard's live "My Roster" week range + data, backed by /monthlyrosterview/userroster. */
export function useDashboardRoster(): DashboardRosterState {
  const [anchor, setAnchor] = useState(() => new Date());

  const { weekStart, weekEnd, startDate, endDate } = useMemo(() => {
    const start = startOfWeek(anchor);
    const end = endOfWeek(anchor);
    return {
      weekStart: start,
      weekEnd: end,
      startDate: format(start, "yyyy-MM-dd"),
      endDate: format(end, "yyyy-MM-dd"),
    };
  }, [anchor]);

  const { data, isLoading, isFetching, isError } = useGetUserMonthlyRosterQuery({ startDate, endDate });

  const roster = data?.data?.[0]?.roster;

  const status: DashboardRosterStatus =
    isError || data?.status === "Error"
      ? "error"
      : isLoading || isFetching
        ? "loading"
        : !roster || Object.keys(roster).length === 0
          ? "empty"
          : "ready";

  const errorMessage =
    status === "error"
      ? (data?.message ?? "Failed to load your roster. Please try again.")
      : undefined;

  const days = useMemo(() => buildWeekDays({ weekStart, roster }), [weekStart, roster]);
  const rangeLabel = useMemo(() => formatWeekRangeLabel(weekStart, weekEnd), [weekStart, weekEnd]);

  return {
    days,
    rangeLabel,
    status,
    errorMessage,
    anchorDate: anchor,
    goPrev: () => setAnchor((d) => subWeeks(d, 1)),
    goNext: () => setAnchor((d) => addWeeks(d, 1)),
    goToday: () => setAnchor(new Date()),
  };
}
