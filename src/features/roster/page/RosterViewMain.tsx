// import {
//   Box,
//   IconButton,
//   Select,
//   MenuItem,
//   ToggleButton,
//   ToggleButtonGroup,
//   Chip,
//   Stack,
// } from "@mui/material";
// import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
// import ChevronRightIcon from "@mui/icons-material/ChevronRight";
// import GridViewIcon from "@mui/icons-material/GridView";
// import ViewWeekIcon from "@mui/icons-material/ViewWeek";
// import { useState, useMemo } from "react";
// import dayjs, { Dayjs } from "dayjs";
// import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
// import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
// import { getMonthRange, getWeekRange } from "../utils/dateRange.utils";
// import { MonthlyRosterMain } from "../monthly/MonthlyRosterMain";
// import { WeeklyRosterMain } from "../weekly/WeeklyRosterMain";
// import OrgHierarchyFilters from "../../orgHierarchy/components/OrgHierarchyFiltersV2";
// import { useOrgHierarchyState } from "../../orgHierarchy/hooks/useOrgHierarchyState";
// import { useOrgHierarchyFilters } from "../../orgHierarchy/hooks/useOrgHierarchyFilters";
// import { authStorage } from "../../../app/store/auth.storage";

// const MONTHS = [
//   "January",
//   "February",
//   "March",
//   "April",
//   "May",
//   "June",
//   "July",
//   "August",
//   "September",
//   "October",
//   "November",
//   "December",
// ];
// const MONTHS_SHORT = [
//   "Jan",
//   "Feb",
//   "Mar",
//   "Apr",
//   "May",
//   "Jun",
//   "Jul",
//   "Aug",
//   "Sep",
//   "Oct",
//   "Nov",
//   "Dec",
// ];
// const YEARS = Array.from({ length: 6 }, (_, i) => 2022 + i);

// const pillSx = {
//   display: "inline-flex",
//   alignItems: "center",
//   height: 34,
//   border: "0.5px solid",
//   borderColor: "divider",
//   borderRadius: "8px",
//   bgcolor: "action.hover",
//   overflow: "hidden",
// };

// const toggleGroupSx = {
//   "& .MuiToggleButton-root": {
//     height: 34,
//     px: 1.5,
//     gap: "5px",
//     fontSize: "0.75rem",
//     fontWeight: 400,
//     border: "none",
//     borderRadius: 0,
//     textTransform: "none",
//     color: "text.secondary",
//     "& .MuiSvgIcon-root": { fontSize: 13, opacity: 0.55 },
//     "&.Mui-selected": {
//       bgcolor: "background.paper",
//       color: "text.primary",
//       fontWeight: 500,
//       borderRadius: "6px",
//       boxShadow: "0 0 0 0.5px rgba(0,0,0,0.1)",
//       mx: "2px",
//       height: 30,
//       "& .MuiSvgIcon-root": { opacity: 1 },
//       "&:hover": { bgcolor: "background.paper" },
//     },
//   },
// };

// const dividerSx = {
//   width: "0.5px",
//   height: 20,
//   bgcolor: "divider",
//   flexShrink: 0,
// };

// const compactSelectSx = {
//   height: 26,
//   fontSize: "0.75rem",
//   "& .MuiOutlinedInput-notchedOutline": { borderColor: "divider" },
//   "& .MuiSelect-select": { py: "2px", px: "6px" },
// };

// function getWeekBounds(date: Dayjs) {
//   const dow = date.day();
//   const mon = date.subtract((dow + 6) % 7, "day");
//   const sun = mon.add(6, "day");
//   return { mon, sun };
// }

// function formatWeekLabel(date: Dayjs) {
//   const { mon, sun } = getWeekBounds(date);
//   return `${MONTHS_SHORT[mon.month()]} ${mon.date()}–${MONTHS_SHORT[sun.month()]} ${sun.date()}`;
// }

// export const RosterViewMain = () => {
//   const [view, setView] = useState<"weekly" | "monthly">("weekly");
//   const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());

//   const loggedUser = authStorage.getUser();
//   const roleName = loggedUser?.roleCode ?? "TEAM_MEMBER";
//   const { values, handleChange } = useOrgHierarchyState();
//   const { options } = useOrgHierarchyFilters(values);
//   const { startDate, endDate } = useMemo(
//     () =>
//       view === "monthly"
//         ? getMonthRange(selectedDate)
//         : getWeekRange(selectedDate),
//     [view, selectedDate],
//   );

//   const handleNav = (dir: 1 | -1) =>
//     setSelectedDate((p) => p.add(dir, "month"));

//   const handleMonthChange = (m: number) => setSelectedDate((p) => p.month(m));

//   const handleYearChange = (y: number) => setSelectedDate((p) => p.year(y));

//   const goToday = () => setSelectedDate(dayjs());

//   // Context label shown next to toolbar
//   const ctxLabel =
//     view === "monthly"
//       ? `${selectedDate.daysInMonth()} days · ${MONTHS[selectedDate.month()]} ${selectedDate.year()}`
//       : (() => {
//           const { mon, sun } = getWeekBounds(selectedDate);
//           return `5 days · ${MONTHS_SHORT[mon.month()]} ${mon.date()}–${MONTHS_SHORT[sun.month()]} ${sun.date()}, ${sun.year()}`;
//         })();

//   // Quick-jump chips for weekly view (±2 weeks around today)
//   const weekChips =
//     view === "weekly"
//       ? [-2, -1, 0, 1, 2].map((offset) => {
//           const t = dayjs().add(offset * 7, "day");
//           const label =
//             offset === 0
//               ? "This week"
//               : offset === -1
//                 ? "Last week"
//                 : formatWeekLabel(t);
//           const isActive = formatWeekLabel(selectedDate) === formatWeekLabel(t);
//           return { label, date: t, isActive };
//         })
//       : [];

//   return (
//     <LocalizationProvider dateAdapter={AdapterDayjs}>
//       {/* ===== TOOLBAR ===== */}
//       <Box
//         sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}
//       >
//         {/* Single combined pill */}
//         <Box sx={pillSx}>
//           {/* Weekly / Monthly toggle with icons */}
//           <ToggleButtonGroup
//             exclusive
//             value={view}
//             onChange={(_, val) => val && setView(val)}
//             sx={toggleGroupSx}
//           >
//             <ToggleButton value="weekly">
//               <ViewWeekIcon /> Weekly
//             </ToggleButton>
//             <ToggleButton value="monthly">
//               <GridViewIcon /> Monthly
//             </ToggleButton>
//           </ToggleButtonGroup>

//           <Box sx={dividerSx} />

//           {/* ‹ Month select · Year select › */}
//           <Box
//             sx={{ display: "flex", alignItems: "center", gap: "4px", px: 1 }}
//           >
//             <IconButton
//               size="small"
//               onClick={() => handleNav(-1)}
//               sx={{ p: "2px" }}
//             >
//               <ChevronLeftIcon sx={{ fontSize: 16 }} />
//             </IconButton>

//             <Select
//               value={selectedDate.month()}
//               onChange={(e) => handleMonthChange(Number(e.target.value))}
//               size="small"
//               sx={{ ...compactSelectSx, minWidth: 96 }}
//             >
//               {MONTHS.map((m, i) => (
//                 <MenuItem key={i} value={i} sx={{ fontSize: "0.8rem" }}>
//                   {m}
//                 </MenuItem>
//               ))}
//             </Select>

//             <Select
//               value={selectedDate.year()}
//               onChange={(e) => handleYearChange(Number(e.target.value))}
//               size="small"
//               sx={{ ...compactSelectSx, minWidth: 68 }}
//             >
//               {YEARS.map((y) => (
//                 <MenuItem key={y} value={y} sx={{ fontSize: "0.8rem" }}>
//                   {y}
//                 </MenuItem>
//               ))}
//             </Select>

//             <IconButton
//               size="small"
//               onClick={() => handleNav(1)}
//               sx={{ p: "2px" }}
//             >
//               <ChevronRightIcon sx={{ fontSize: 16 }} />
//             </IconButton>
//           </Box>

//           <Box sx={dividerSx} />

//           <IconButton
//             size="small"
//             onClick={goToday}
//             title="Go to today"
//             sx={{
//               fontSize: "0.7rem",
//               px: 1,
//               borderRadius: "5px",
//               color: "text.secondary",
//               mr: "4px",
//             }}
//           >
//             Today
//           </IconButton>
//         </Box>

//         {/* Org filters */}
//         <OrgHierarchyFilters
//           role={roleName}
//           values={values}
//           options={options}
//           onChange={handleChange}
//         />

//         {/* Context label */}
//         <Chip
//           size="small"
//           label={ctxLabel}
//           sx={{
//             fontSize: "0.7rem",
//             height: 22,
//             bgcolor: "action.hover",
//             border: "0.5px solid",
//             borderColor: "divider",
//           }}
//         />
//       </Box>

//       {/* Quick-jump week chips */}
//       {view === "weekly" && (
//         <Stack
//           direction="row"
//           spacing={0.5}
//           sx={{ mt: 1, flexWrap: "wrap", gap: "4px" }}
//         >
//           {weekChips.map(({ label, date, isActive }) => (
//             <Chip
//               key={label}
//               label={label}
//               size="small"
//               onClick={() => setSelectedDate(date)}
//               sx={{
//                 fontSize: "0.7rem",
//                 height: 24,
//                 cursor: "pointer",
//                 bgcolor: isActive ? "#E6F1FB" : "background.paper",
//                 color: isActive ? "#185FA5" : "text.secondary",
//                 border: "0.5px solid",
//                 borderColor: isActive ? "#85B7EB" : "divider",
//                 fontWeight: isActive ? 500 : 400,
//                 "&:hover": { bgcolor: isActive ? "#E6F1FB" : "action.hover" },
//               }}
//             />
//           ))}
//         </Stack>
//       )}

//       {/* ===== VIEW RENDER ===== */}
//       <Box mt={1.5}>
//         {view === "weekly" ? (
//           <WeeklyRosterMain
//             domainId={values.domain}
//             subDomainId={values.subDomain}
//           />
//         ) : (
//           <MonthlyRosterMain
//             startDate={startDate}
//             endDate={endDate}
//             domainId={values.domain}
//             subDomainId={values.subDomain}
//           />
//         )}
//       </Box>
//     </LocalizationProvider>
//   );
// };

// import { Box, ToggleButton, ToggleButtonGroup, IconButton } from "@mui/material";
// import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
// import ChevronRightIcon from "@mui/icons-material/ChevronRight";
// import { useState, useMemo } from "react";
// import dayjs, { Dayjs } from "dayjs";
// import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
// import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
// import { getMonthRange, getWeekRange } from "../utils/dateRange.utils";
// import { MonthlyRosterMain } from "../monthly/MonthlyRosterMain";
// import { WeeklyRosterMain } from "../weekly/WeeklyRosterMain";
// import OrgHierarchyFilters from "../../orgHierarchy/components/OrgHierarchyFiltersV2";
// import { useOrgHierarchyState } from "../../orgHierarchy/hooks/useOrgHierarchyState";
// import { useOrgHierarchyFilters } from "../../orgHierarchy/hooks/useOrgHierarchyFilters";
// import { authStorage } from "../../../app/store/auth.storage";

// const combinedControlSx = {
//   display: "inline-flex",
//   alignItems: "center",
//   height: 32,
//   border: "1px solid",
//   borderColor: "divider",
//   borderRadius: 1,
//   bgcolor: "action.hover",
//   overflow: "hidden",
// };

// const toggleGroupSx = {
//   "& .MuiToggleButton-root": {
//     height: 32,
//     px: 1.5,
//     fontSize: "0.8rem",
//     fontWeight: 400,
//     border: "none",
//     borderRadius: 0,
//     textTransform: "none",
//     color: "text.secondary",
//     "&.Mui-selected": {
//       bgcolor: "background.paper",
//       color: "text.primary",
//       fontWeight: 500,
//       "&:hover": { bgcolor: "background.paper" },
//     },
//   },
// };

// const dividerSx = {
//   width: "1px",
//   height: 18,
//   bgcolor: "divider",
//   flexShrink: 0,
// };

// export const RosterViewMain = () => {
//   const [view, setView] = useState<"weekly" | "monthly">("weekly");
//   const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());

//   const loggedUser = authStorage.getUser();
//   const roleName = loggedUser?.roleCode ?? "TEAM_MEMBER";

//   const { values, handleChange } = useOrgHierarchyState();
//   const { options } = useOrgHierarchyFilters(values);

//   const domainId = values.domain;
//   const subDomainId = values.subDomain;

//   const { startDate, endDate } = useMemo(() => {
//     return view === "monthly"
//       ? getMonthRange(selectedDate)
//       : getWeekRange(selectedDate);
//   }, [view, selectedDate]);

//   const handleNav = (dir: 1 | -1) => {
//     setSelectedDate((prev) => prev.add(dir, "month"));
//   };

//   const dateLabel = selectedDate.format("MMM YYYY");

//   return (
//     <LocalizationProvider dateAdapter={AdapterDayjs}>
//       <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>

//         {/* ===== COMBINED CONTROL ===== */}
//         <Box sx={combinedControlSx}>
//           {/* View toggle */}
//           <ToggleButtonGroup
//             exclusive
//             value={view}
//             onChange={(_, val) => val && setView(val)}
//             sx={toggleGroupSx}
//           >
//             <ToggleButton value="weekly">Weekly</ToggleButton>
//             <ToggleButton value="monthly">Monthly</ToggleButton>
//           </ToggleButtonGroup>

//           {/* Divider */}
//           <Box sx={dividerSx} />

//           {/* Date navigator */}
//           <Box sx={{ display: "flex", alignItems: "center", px: 0.5 }}>
//             <IconButton size="small" onClick={() => handleNav(-1)} sx={{ p: "2px" }}>
//               <ChevronLeftIcon sx={{ fontSize: 16 }} />
//             </IconButton>
//             <Box sx={{ fontSize: "0.8rem", minWidth: 72, textAlign: "center" }}>
//               {dateLabel}
//             </Box>
//             <IconButton size="small" onClick={() => handleNav(1)} sx={{ p: "2px" }}>
//               <ChevronRightIcon sx={{ fontSize: 16 }} />
//             </IconButton>
//           </Box>
//         </Box>

//         {/* ===== ORG FILTERS ===== */}
//         <OrgHierarchyFilters
//           role={roleName}
//           values={values}
//           options={options}
//           onChange={handleChange}
//         />
//       </Box>

//       {/* ===== VIEW RENDER ===== */}
//       <Box mt={2}>
//         {view === "weekly" ? (
//           <WeeklyRosterMain domainId={domainId} subDomainId={subDomainId} />
//         ) : (
//           <MonthlyRosterMain
//             startDate={startDate}
//             endDate={endDate}
//             domainId={domainId}
//             subDomainId={subDomainId}
//           />
//         )}
//       </Box>
//     </LocalizationProvider>
//   );
// };
import { Box, RadioGroup, FormControlLabel, Radio } from "@mui/material";
import { useState, useMemo } from "react";
import dayjs, { Dayjs } from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { getMonthRange, getWeekRange } from "../utils/dateRange.utils";
import { MonthlyRosterMain } from "../monthly/MonthlyRosterMain";
import { WeeklyRosterMain } from "../weekly/WeeklyRosterMain";
import OrgHierarchyFilters from "../../orgHierarchy/components/OrgHierarchyFiltersV2";
import { useOrgHierarchyState } from "../../orgHierarchy/hooks/useOrgHierarchyState";
import { useOrgHierarchyFilters } from "../../orgHierarchy/hooks/useOrgHierarchyFilters";
import { authStorage } from "../../../app/store/auth.storage";

const compactDatePickerSx = {
  width: 130,

  "& .MuiOutlinedInput-root": {
    height: "28px !important",
    minHeight: "28px !important",
    paddingRight: "2px",

    "& input": {
      padding: "4px 6px !important",
      fontSize: "12px",
    },
  },

  "& .MuiInputAdornment-root": {
    marginLeft: "2px",
  },

  "& .MuiIconButton-root": {
    padding: "2px",
  },

  "& .MuiSvgIcon-root": {
    fontSize: "16px",
  },

  "& .MuiInputLabel-root": {
    fontSize: "12px",
    top: "-6px",
  },
};
export const RosterViewMain = () => {
  const [view, setView] = useState<"weekly" | "monthly">("weekly");
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());

  const loggedUser = authStorage.getUser();
  const roleName = loggedUser?.roleCode ?? "TEAM_MEMBER";

  const { values, handleChange } = useOrgHierarchyState();
  const { options } = useOrgHierarchyFilters(values);

  const domainId = values.domain;
  const subDomainId = values.subDomain;

  const { startDate, endDate } = useMemo(() => {
    return view === "monthly"
      ? getMonthRange(selectedDate)
      : getWeekRange(selectedDate);
  }, [view, selectedDate]);

  const handleDateChange = (newValue: Dayjs | null) => {
    if (newValue) setSelectedDate(newValue);
  };

  return (
    <>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          {/* ===== VIEW TOGGLE ===== */}
          <RadioGroup
            row
            value={view}
            onChange={(e) => setView(e.target.value as "weekly" | "monthly")}
            sx={{ "& .MuiFormControlLabel-label": { fontSize: "0.8rem" } }}
          >
            <FormControlLabel
              value="weekly"
              control={<Radio size="small" />}
              label="Weekly"
            />
            <FormControlLabel
              value="monthly"
              control={<Radio size="small" />}
              label="Monthly"
            />
          </RadioGroup>

          {/* ===== DATE PICKER ===== */}
          {view === "monthly" ? (
            <DatePicker
              views={["month"]}
              value={selectedDate}
              format="MMM YYYY"
              onChange={handleDateChange}
              slotProps={{
                textField: {
                  size: "small",

                  sx: compactDatePickerSx,
                },
              }}
            />
          ) : (
            <DatePicker
              views={["month"]}
              format="MMM YYYY"
              value={selectedDate}
              onChange={handleDateChange}
              slotProps={{
                textField: {
                  size: "small",
                  sx: compactDatePickerSx,
                },
              }}
            />
          )}

          {/* ===== ORG FILTERS ===== */}
          <OrgHierarchyFilters
            role={roleName}
            values={values}
            options={options}
            onChange={handleChange}
          />
        </Box>
      </LocalizationProvider>

      {/* ===== VIEW RENDER ===== */}
      <Box mt={2}>
        {view === "weekly" ? (
          <WeeklyRosterMain domainId={domainId} subDomainId={subDomainId} />
        ) : (
          <MonthlyRosterMain
            startDate={startDate}
            endDate={endDate}
            domainId={domainId}
            subDomainId={subDomainId}
          />
        )}
      </Box>
    </>
  );
};
