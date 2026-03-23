import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  Calendar,
  momentLocalizer,
  Views,
  type SlotInfo,
} from "react-big-calendar";
import withDragAndDrop, {
  type withDragAndDropProps,
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
import CommonContainer from "../../../components/common/CommonContainer";
import { useGetUserMonthlyRosterQuery } from "../api/userMonthlyRosterApi";
import {
  transformRosterToEvents,
  type CalendarEvent,
} from "../utils/rosterTransform";

// --- SHIFT COLOR MAP ---
export const shiftColorMap = new Map<
  string,
  { background: string; color: string; border: string }
>([
  ["Leave", { background: "#FEF2F2", color: "#B91C1C", border: "#FCA5A5" }],
  [
    "New Joinee",
    { background: "#FFFBEB", color: "#92400E", border: "#FCD34D" },
  ],
  ["N", { background: "#EEF2FF", color: "#3730A3", border: "#818CF8" }],
  [
    "A",
    {
      background: "#FEF9C3",
      color: "#854D0E",
      border: "#FDE047",
    },
  ],
  ["B", { background: "#ECFEFF", color: "#155E75", border: "#67E8F9" }],
  ["G", { background: "#EFF6FF", color: "#1D4ED8", border: "#93C5FD" }],
  ["L", { background: "#ECFDF5", color: "#065F46", border: "#6EE7B7" }],
  ["W", { background: "#F8FAFC", color: "#475569", border: "#CBD5F5" }],
  ["H", { background: "#FFF7ED", color: "#C2410C", border: "#FDBA74" }],
  ["C", { background: "#F1F5F9", color: "#475569", border: "#CBD5E1" }],
]);

const localizer = momentLocalizer(moment);
const DnDCalendar = withDragAndDrop<CalendarEvent>(Calendar as any);

const UserMonthlyRosterView = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"month" | "week" | "day">(Views.MONTH);
  const [localEvents, setLocalEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null,
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const startDate = moment(currentDate).startOf("month").format("YYYY-MM-DD");
  const endDate = moment(currentDate).endOf("month").format("YYYY-MM-DD");

  // API Call
  const { data, isError, isLoading, isFetching } = useGetUserMonthlyRosterQuery(
    { startDate, endDate },
  );

  useEffect(() => {
    if (data?.status === "Error" || !data?.data?.[0]?.roster) {
      setLocalEvents([]);
    } else {
      setLocalEvents(transformRosterToEvents(data.data[0].roster));
    }
  }, [data]);

  const apiErrorMessage = isError
    ? "Failed to fetch roster due to a network or server error."
    : data?.status === "Error"
      ? data.message
      : null;

  // --- Handlers ---
  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    setSelectedEvent(event);
  }, []);

  const handleSelectSlot = useCallback((slotInfo: SlotInfo) => {
    const isPast = moment(slotInfo.start).isBefore(moment(), "day");
    if (isPast) {
      setToastMessage("Cannot select past dates.");
      return;
    }
    setToastMessage(
      `Date Selected: ${moment(slotInfo.start).format("MMM DD, YYYY")}`,
    );
  }, []);

  const handleEventDrop = useCallback(
    ({
      event,
      start,
      end,
    }: withDragAndDropProps<CalendarEvent>["onEventDrop"] extends (
      args: infer U,
    ) => any
      ? U
      : never) => {
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
      setToastMessage("Event updated successfully!");
    },
    [],
  );

  // --- Dynamic Style Getter using shiftColorMap ---
  const eventStyleGetter = useCallback((event: CalendarEvent) => {
    // 1. Extract base shift (e.g., "N (WFO)" -> "N", "New Joinee" -> "New Joinee")
    const baseShift = event.title.split("(")[0].trim();

    // 2. Lookup in map (Treat "WO" as "W" if WO isn't explicitly in the map)
    const shiftLookup = baseShift === "WO" ? "W" : baseShift;

    // 3. Get colors or fallback to generic defaults
    const shiftColors = shiftColorMap.get(shiftLookup) || {
      background: "#F1F5F9",
      color: "#475569",
      border: "#CBD5E1",
    };

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
        transition: "transform 0.2s, box-shadow 0.2s",
      },
    };
  }, []);

  const components = useMemo(
    () => ({
      event: EventCell,
      toolbar: (props: any) => (
        <CustomToolbar
          {...props}
          currentView={view}
          onDateChange={setCurrentDate}
        />
      ),
    }),
    [view],
  );

  return (
    <CommonContainer>
      <Box
        sx={{
          ".rbc-today": { backgroundColor: "#e3f2fd !important" },
          ".rbc-event:hover": {
            transform: "scale(1.02)",
            boxShadow: "0px 4px 8px rgba(0,0,0,0.2)",
          },
          ".rbc-day-bg:hover": {
            backgroundColor: "#f5f5f5",
            cursor: "pointer",
            transition: "0.2s",
          },
          ".rbc-calendar": { fontFamily: "'Roboto', sans-serif" },
        }}
      >
        {apiErrorMessage && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {apiErrorMessage}
          </Alert>
        )}

        <Box
          sx={{
            p: 2,
            bgcolor: "background.paper",
            borderRadius: 3,
            boxShadow: 2,
            position: "relative",
          }}
        >
          <DnDCalendar
            localizer={localizer}
            events={localEvents}
            startAccessor="start"
            endAccessor="end"
            date={currentDate}
            onNavigate={setCurrentDate}
            onView={(v: any) => setView(v)}
            view={view}
            views={[Views.MONTH, Views.WEEK, Views.DAY]}
            selectable={true}
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
            onEventDrop={handleEventDrop}
            resizable={false}
            style={{
              height: "75vh",
              opacity: isLoading || isFetching ? 0.6 : 1,
              transition: "opacity 0.3s",
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
          open={!!toastMessage}
          autoHideDuration={3000}
          onClose={() => setToastMessage(null)}
          message={toastMessage}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        />
      </Box>
    </CommonContainer>
  );
};

export default UserMonthlyRosterView;

// import React, { useState, useMemo, useCallback, useEffect } from "react";
// import { Calendar, momentLocalizer, Views, type SlotInfo } from "react-big-calendar";
// import withDragAndDrop, {
//  type withDragAndDropProps,
// } from "react-big-calendar/lib/addons/dragAndDrop";
// import moment from "moment";

// // Styles
// import "react-big-calendar/lib/css/react-big-calendar.css";
// import "react-big-calendar/lib/addons/dragAndDrop/styles.css";

// // MUI Components
// import {
//   Box,
//   Alert,
//   Typography,
//   Chip,
//   Stack,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Button,
//   Snackbar,
// } from "@mui/material";

// // Components & Utils
// import EventCell from "./EventCell";
// import CustomToolbar from "./CustomToolbar";
// import CommonContainer from "../../../components/common/CommonContainer";
// import { useGetUserMonthlyRosterQuery } from "../api/userMonthlyRosterApi";
// import {
//   transformRosterToEvents,
//   type CalendarEvent,
// } from "../utils/rosterTransform";

// const localizer = momentLocalizer(moment);
// const DnDCalendar = withDragAndDrop<CalendarEvent>(Calendar as any);

// const UserMonthlyRosterView = () => {
//   const [currentDate, setCurrentDate] = useState(new Date());
//   const [view, setView] = useState<"month" | "week" | "day">(Views.MONTH);
//   const [localEvents, setLocalEvents] = useState<CalendarEvent[]>([]);
//   const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
//     null,
//   );
//   const [toastMessage, setToastMessage] = useState<string | null>(null);

//   const startDate = moment(currentDate).startOf("month").format("YYYY-MM-DD");
//   const endDate = moment(currentDate).endOf("month").format("YYYY-MM-DD");

//   // API Call
//   const { data, isError, isLoading } = useGetUserMonthlyRosterQuery({
//     startDate,
//     endDate,
//   });

//   // Sync API data to local state for Drag & Drop functionality
//   useEffect(() => {
//     if (data?.data?.[0]) {
//       setLocalEvents(transformRosterToEvents(data.data[0].roster));
//     }
//   }, [data]);

//   // --- Handlers (Memoized) ---
//   const handleSelectEvent = useCallback((event: CalendarEvent) => {
//     setSelectedEvent(event);
//   }, []);

//   const handleSelectSlot = useCallback((slotInfo: SlotInfo) => {
//     const isPast = moment(slotInfo.start).isBefore(moment(), "day");

//     // Optional feature: Disable past dates selection
//     if (isPast) {
//       setToastMessage("Cannot select past dates.");
//       return;
//     }

//     // Logic to open a create event modal could go here
//     setToastMessage(
//       `Date Selected: ${moment(slotInfo.start).format("MMM DD, YYYY")}`,
//     );
//   }, []);

//   const handleEventDrop = useCallback(
//     ({
//       event,
//       start,
//       end,
//     }: withDragAndDropProps<CalendarEvent>["onEventDrop"] extends (
//       args: infer U,
//     ) => any
//       ? U
//       : never) => {
//       setLocalEvents((prev) => {
//         const existing = prev.find((ev) => ev.id === event.id);
//         if (existing) {
//           return prev.map((ev) =>
//             ev.id === event.id
//               ? { ...ev, start: new Date(start), end: new Date(end) }
//               : ev,
//           );
//         }
//         return prev;
//       });
//       setToastMessage("Event updated successfully!");
//     },
//     [],
//   );

//   // --- Memoized Configs ---
//   const eventStyleGetter = useCallback((event: CalendarEvent) => {
//     let bg = "#e0e0e0";
//     let color = "#000";

//     if (event.title.includes("WO"))
//       bg = "#9e9e9e"; // Week Off
//     else if (event.title.includes("A"))
//       bg = "#fdd835"; // Absent
//     else if (event.title.includes("N")) {
//       bg = "#283593";
//       color = "#fff";
//     } // Night Shift

//     return {
//       style: {
//         backgroundColor: bg,
//         color,
//         borderRadius: "6px",
//         padding: "4px",
//         fontSize: "12px",
//         fontWeight: 500,
//         border: "none",
//         boxShadow: "0px 2px 4px rgba(0,0,0,0.1)", // Adding smooth UI depth
//         transition: "transform 0.2s, box-shadow 0.2s",
//       },
//     };
//   }, []);

//   const components = useMemo(
//     () => ({
//       event: EventCell,
//       toolbar: (props: any) => (
//         <CustomToolbar
//           {...props}
//           currentView={view}
//           onDateChange={setCurrentDate}
//         />
//       ),
//     }),
//     [view],
//   );

//   if (isError) {
//     return (
//       <Box display="flex" justifyContent="center" mt={5}>
//         <Alert severity="error">Failed to load roster</Alert>
//       </Box>
//     );
//   }

//   return (
//     <CommonContainer>
//       <Box
//         sx={{
//           // Global calendar styles overrides for UI/UX
//           ".rbc-today": { backgroundColor: "#e3f2fd !important" }, // Highlight today
//           ".rbc-event:hover": {
//             transform: "scale(1.02)",
//             boxShadow: "0px 4px 8px rgba(0,0,0,0.2)",
//           }, // Hover transition
//           ".rbc-day-bg:hover": {
//             backgroundColor: "#f5f5f5",
//             cursor: "pointer",
//             transition: "0.2s",
//           }, // Date hover
//           ".rbc-calendar": { fontFamily: "'Roboto', sans-serif" },
//         }}
//       >
//         {/* HEADER */}
//         {/* <Stack
//           direction="row"
//           justifyContent="space-between"
//           alignItems="center"
//           mb={2}
//         >
//           <Typography variant="h5" fontWeight={700}>
//             Monthly Roster
//           </Typography>
//           <Chip
//             label={
//               isLoading ? "Loading..." : `Total Users: ${data?.totalUsers || 0}`
//             }
//             color="primary"
//             variant="outlined"
//           />
//         </Stack> */}

//         {/* CALENDAR */}
//         <Box
//           sx={{
//             p: 2,
//             bgcolor: "background.paper",
//             borderRadius: 3,
//             boxShadow: 2,
//           }}
//         >
//           <DnDCalendar
//             localizer={localizer}
//             events={localEvents}
//             startAccessor="start"
//             endAccessor="end"
//             date={currentDate}
//             onNavigate={setCurrentDate}
//             onView={(v: any) => setView(v)}
//             view={view}
//             views={[Views.MONTH, Views.WEEK, Views.DAY]}
//             selectable={true}
//             onSelectEvent={handleSelectEvent}
//             onSelectSlot={handleSelectSlot}
//             onEventDrop={handleEventDrop}
//             resizable={false} // Enable if you want to drag duration
//             style={{ height: "75vh" }}
//             eventPropGetter={eventStyleGetter}
//             components={components}
//           />
//         </Box>

//         {/* EVENT DETAILS MODAL */}
//         <Dialog
//           open={!!selectedEvent}
//           onClose={() => setSelectedEvent(null)}
//           maxWidth="xs"
//           fullWidth
//         >
//           <DialogTitle fontWeight="bold">Shift Details</DialogTitle>
//           <DialogContent dividers>
//             <Typography variant="body1">
//               <strong>Status/Shift:</strong> {selectedEvent?.title}
//             </Typography>
//             <Typography variant="body1" mt={1}>
//               <strong>Date:</strong>{" "}
//               {selectedEvent?.start &&
//                 moment(selectedEvent.start).format("dddd, MMM DD, YYYY")}
//             </Typography>
//             {!selectedEvent?.allDay && (
//               <Typography variant="body1" mt={1}>
//                 <strong>Time:</strong>{" "}
//                 {moment(selectedEvent?.start).format("hh:mm A")} -{" "}
//                 {moment(selectedEvent?.end).format("hh:mm A")}
//               </Typography>
//             )}
//           </DialogContent>
//           <DialogActions>
//             <Button
//               onClick={() => setSelectedEvent(null)}
//               color="primary"
//               variant="contained"
//             >
//               Close
//             </Button>
//           </DialogActions>
//         </Dialog>

//         {/* TOAST / SNACKBAR NOTIFICATIONS */}
//         <Snackbar
//           open={!!toastMessage}
//           autoHideDuration={3000}
//           onClose={() => setToastMessage(null)}
//           message={toastMessage}
//           anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
//         />
//       </Box>
//     </CommonContainer>
//   );
// };

// export default UserMonthlyRosterView;
