import moment from "moment";

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  resource?: any;
}

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

export const transformRosterToEvents = (roster: Record<string, any>): CalendarEvent[] => {
  return Object.entries(roster).map(([date, value], index) => {
    const shift = value.shiftDisplay || "";

    if (shift === "WO" || shift === "H") {
      return {
        id: `${date}-${index}`,
        title: shift,
        start: new Date(date),
        end: new Date(date),
        allDay: true,
      };
    }

    const { startTime, endTime } = parseShiftTime(shift);

    return {
      id: `${date}-${index}`,
      title: `${shift} (${value.workMode || ""})`,
      start: new Date(`${date} ${startTime}`),
      end: new Date(`${date} ${endTime}`),
      allDay: false,
    };
  });
};