import moment from "moment";
import {
  getShiftStyle,
  resolveShiftKeyFromDisplay,
} from "../../../roster/constant/shiftPalette";
import type {
  CalendarEvent,
  RosterDay,
  RosterDayMeta,
  RosterMonthStats,
} from "../types/roster.types";

export const parseShiftTime = (shift: string) => {
  const match = shift.match(/\(([^)]+)\)/);

  if (!match) {
    return { allDay: true, start: new Date(), end: new Date() };
  }

  const [start, end] = match[1].split(" - ");

  return {
    allDay: false,
    startTime: moment(start, ["h A"]).format("HH:mm"),
    endTime: moment(end, ["h A"]).format("HH:mm"),
  };
};

export const transformRosterToEvents = (
  roster: Record<string, RosterDay>,
): CalendarEvent[] => {
  return Object.entries(roster).map(([date, value], index) => {
    const shiftDisplay = value.shiftDisplay || "";
    const code = resolveShiftKeyFromDisplay(shiftDisplay);
    const workMode = value.workMode || null;

    // The title is the bare code; the time range, work mode and the day's
    // activity/availability counters live on `resource` so cells, tooltips
    // and the detail dialog present them consistently instead of each
    // re-parsing a concatenated string.
    const base = {
      id: `${date}-${index}`,
      title: code,
      resource: {
        code,
        label: getShiftStyle(code).label,
        workMode,
        shiftDisplay,
        assignActCount: value.assignActCount ?? 0,
        availableMins: value.availableMins ?? 0,
        dateKey: date,
      },
    };

    const parsed = parseShiftTime(shiftDisplay);

    // Off days and any shift without a time range (WO, H, Leave, Comp Off)
    // render as all-day entries on their own date.
    if (!("startTime" in parsed)) {
      return {
        ...base,
        start: new Date(date),
        end: new Date(date),
        allDay: true,
      };
    }

    const start = new Date(`${date} ${parsed.startTime}`);
    const end = new Date(`${date} ${parsed.endTime}`);
    // Night shifts wrap past midnight, so their end lands on the next day.
    if (end <= start) {
      end.setDate(end.getDate() + 1);
    }

    return { ...base, start, end, allDay: false };
  });
};

/** Shift codes that count as an actual working day in the month roll-up. */
const WORKING_CODES = new Set(["G", "LG", "A", "B", "N", "NJ"]);

/**
 * Flattens the API's day map into the per-day facts the calendar chrome
 * needs. Keys stay exactly as the API sent them (`YYYY-MM-DD`).
 */
export const buildDayMetaMap = (
  roster: Record<string, RosterDay> | undefined,
): Map<string, RosterDayMeta> => {
  const map = new Map<string, RosterDayMeta>();
  if (!roster) return map;

  for (const [dateKey, value] of Object.entries(roster)) {
    const shiftDisplay = value.shiftDisplay || "";
    const code = resolveShiftKeyFromDisplay(shiftDisplay);
    const assignActCount = value.assignActCount ?? 0;

    map.set(dateKey, {
      dateKey,
      code,
      label: getShiftStyle(code).label,
      shiftDisplay,
      workMode: value.workMode || null,
      assignActCount,
      availableMins: value.availableMins ?? 0,
      isHoliday: code === "H",
      isLeave: code === "L",
      isWeekOff: code === "W",
      isWorking: WORKING_CODES.has(code),
      isBusy: assignActCount > 0,
    });
  }

  return map;
};

/** Month roll-up for the summary strip — a single pass over the day map. */
export const buildMonthStats = (
  dayMeta: Map<string, RosterDayMeta>,
): RosterMonthStats => {
  const stats: RosterMonthStats = {
    working: 0,
    weekOff: 0,
    leave: 0,
    holiday: 0,
    compOff: 0,
    activities: 0,
    availableHours: 0,
  };

  let availableMins = 0;

  for (const day of dayMeta.values()) {
    if (day.isWorking) stats.working += 1;
    else if (day.isWeekOff) stats.weekOff += 1;
    else if (day.isLeave) stats.leave += 1;
    else if (day.isHoliday) stats.holiday += 1;
    else if (day.code === "C") stats.compOff += 1;

    stats.activities += day.assignActCount;
    availableMins += day.availableMins;
  }

  stats.availableHours = Math.round(availableMins / 60);
  return stats;
};
