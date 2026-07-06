import { useState, useMemo, useCallback, type ComponentType } from "react";
import {
  Calendar,
  momentLocalizer,
  Views,
  type SlotInfo,
  type View,
  type ToolbarProps,
  type CalendarProps,
} from "react-big-calendar";
import withDragAndDrop, {
  type EventInteractionArgs,
} from "react-big-calendar/lib/addons/dragAndDrop";
import moment from "moment";

// Styles
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";

// MUI Components
import {
  Box,
  Alert,
  Typography,
  Chip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Snackbar,
  CircularProgress,
} from "@mui/material";

// Components & Utils
import EventCell from "./EventCell";
import CustomToolbar from "./CustomToolbar";
import CommonContainer from "../../../../components/common/CommonContainer";
import { useGetUserMonthlyRosterQuery } from "../api/userMonthlyRosterApi";
import { transformRosterToEvents } from "../utils/rosterTransform";
import { shiftColorMap, getShiftColors } from "../constants/shiftColors";
import type {
  CalendarEvent,
  MonthlyRosterResponse,
  ToastState,
} from "../types/roster.types";

const localizer = momentLocalizer(moment);
// react-big-calendar's `Calendar` is a generic class component; the DnD HOC's
// typings can't infer a custom TEvent through it directly, so this asserts
// the shape it actually has once instantiated with CalendarEvent.
const DnDCalendar = withDragAndDrop<CalendarEvent>(
  Calendar as unknown as ComponentType<CalendarProps<CalendarEvent, object>>,
);

// Static calendar chrome overrides — hoisted so it isn't reallocated every render
const calendarSx = {
  ".rbc-today": { backgroundColor: "#e3f2fd !important" },
  ".rbc-event": {
    transition: "transform 0.15s ease, box-shadow 0.15s ease",
  },
  ".rbc-event:hover": {
    transform: "scale(1.03)",
    boxShadow: "0px 4px 10px rgba(0,0,0,0.18)",
    zIndex: 5,
  },
  ".rbc-day-bg:hover": {
    backgroundColor: "#f5f5f5",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  ".rbc-calendar": { fontFamily: "'Roboto', sans-serif" },
} as const;

const computeEvents = (data: MonthlyRosterResponse | undefined): CalendarEvent[] => {
  if (data?.status === "Error" || !data?.data?.[0]?.roster) {
    return [];
  }
  return transformRosterToEvents(data.data[0].roster);
};

const UserMonthlyRosterView = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"month" | "week" | "day">(Views.MONTH);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null,
  );
  const [toast, setToast] = useState<ToastState | null>(null);

  const { startDate, endDate } = useMemo(
    () => ({
      startDate: moment(currentDate).startOf("month").format("YYYY-MM-DD"),
      endDate: moment(currentDate).endOf("month").format("YYYY-MM-DD"),
    }),
    [currentDate],
  );

  // API Call
  const { data, isError, isLoading, isFetching } =
    useGetUserMonthlyRosterQuery({ startDate, endDate });

  // Sync API data into locally-editable state (drag & drop mutates this copy)
  // without an Effect — avoids the extra render pass setState-in-effect causes.
  const [lastRosterData, setLastRosterData] = useState(data);
  const [localEvents, setLocalEvents] = useState<CalendarEvent[]>(() =>
    computeEvents(data),
  );
  if (data !== lastRosterData) {
    setLastRosterData(data);
    setLocalEvents(computeEvents(data));
  }

  const apiErrorMessage = isError
    ? "Failed to fetch roster due to a network or server error."
    : data?.status === "Error"
      ? data.message
      : null;

  const isBusy = isLoading || isFetching;

  // --- Handlers ---
  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    setSelectedEvent(event);
  }, []);

  const handleSelectSlot = useCallback((slotInfo: SlotInfo) => {
    const isPast = moment(slotInfo.start).isBefore(moment(), "day");
    if (isPast) {
      setToast({ message: "Cannot select past dates.", severity: "warning" });
      return;
    }
    setToast({
      message: `Date Selected: ${moment(slotInfo.start).format("MMM DD, YYYY")}`,
      severity: "info",
    });
  }, []);

  const handleEventDrop = useCallback(
    ({ event, start, end }: EventInteractionArgs<CalendarEvent>) => {
      setLocalEvents((prev) => {
        const existing = prev.find((ev) => ev.id === event.id);
        if (existing) {
          return prev.map((ev) =>
            ev.id === event.id
              ? { ...ev, start: new Date(start), end: new Date(end) }
              : ev,
          );
        }
        return prev;
      });
      setToast({ message: "Event updated successfully!", severity: "success" });
    },
    [],
  );

  // --- Dynamic Style Getter using shiftColorMap ---
  const eventStyleGetter = useCallback((event: CalendarEvent) => {
    const shiftColors = getShiftColors(event.title);
    return {
      style: {
        backgroundColor: shiftColors.background,
        color: shiftColors.color,
        border: `1px solid ${shiftColors.border}`,
        borderRadius: "6px",
        padding: "4px",
        fontSize: "12px",
        fontWeight: 600,
        boxShadow: "0px 2px 4px rgba(0,0,0,0.05)",
      },
    };
  }, []);

  const components = useMemo(
    () => ({
      event: EventCell,
      toolbar: (toolbarProps: ToolbarProps<CalendarEvent, object>) => (
        <CustomToolbar
          {...toolbarProps}
          currentView={view}
          onDateChange={setCurrentDate}
        />
      ),
    }),
    [view],
  );

  const selectedEventColors = selectedEvent
    ? getShiftColors(selectedEvent.title)
    : null;

  return (
    <CommonContainer>
      <Box sx={calendarSx}>
        {apiErrorMessage && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {apiErrorMessage}
          </Alert>
        )}

        {/* Shift color legend */}
        <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 1.5 }}>
          {Array.from(shiftColorMap.entries()).map(([code, colors]) => (
            <Chip
              key={code}
              label={code}
              size="small"
              sx={{
                bgcolor: colors.background,
                color: colors.color,
                border: `1px solid ${colors.border}`,
                fontWeight: 600,
              }}
            />
          ))}
        </Stack>

        <Box
          sx={{
            p: 2,
            bgcolor: "background.paper",
            borderRadius: 3,
            boxShadow: 2,
            position: "relative",
          }}
        >
          {isBusy && (
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "rgba(255,255,255,0.5)",
                borderRadius: 3,
                zIndex: 10,
              }}
            >
              <CircularProgress size={32} />
            </Box>
          )}
          <DnDCalendar
            localizer={localizer}
            events={localEvents}
            startAccessor="start"
            endAccessor="end"
            date={currentDate}
            onNavigate={setCurrentDate}
            onView={(nextView: View) =>
              setView(nextView as "month" | "week" | "day")
            }
            view={view}
            views={[Views.MONTH, Views.WEEK, Views.DAY]}
            selectable={true}
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
            onEventDrop={handleEventDrop}
            resizable={false}
            style={{
              height: "75vh",
              pointerEvents: isBusy ? "none" : "auto",
            }}
            eventPropGetter={eventStyleGetter}
            components={components}
          />
        </Box>

        <Dialog
          open={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
          maxWidth="xs"
          fullWidth
        >
          {selectedEventColors && (
            <Box sx={{ height: 6, bgcolor: selectedEventColors.border }} />
          )}
          <DialogTitle fontWeight="bold">Shift Details</DialogTitle>
          <DialogContent dividers>
            <Typography variant="body1">
              <strong>Status/Shift:</strong> {selectedEvent?.title}
            </Typography>
            <Typography variant="body1" mt={1}>
              <strong>Date:</strong>{" "}
              {selectedEvent?.start &&
                moment(selectedEvent.start).format("dddd, MMM DD, YYYY")}
            </Typography>
            {!selectedEvent?.allDay && (
              <Typography variant="body1" mt={1}>
                <strong>Time:</strong>{" "}
                {moment(selectedEvent?.start).format("hh:mm A")} -{" "}
                {moment(selectedEvent?.end).format("hh:mm A")}
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setSelectedEvent(null)}
              color="primary"
              variant="contained"
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={!!toast}
          autoHideDuration={3000}
          onClose={() => setToast(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          {toast ? (
            <Alert
              onClose={() => setToast(null)}
              severity={toast.severity}
              variant="filled"
              sx={{ width: "100%" }}
            >
              {toast.message}
            </Alert>
          ) : undefined}
        </Snackbar>
      </Box>
    </CommonContainer>
  );
};

export default UserMonthlyRosterView;
