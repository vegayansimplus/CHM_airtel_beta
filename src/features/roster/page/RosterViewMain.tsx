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

const compactTextFieldSx = {
  minWidth: 160,
  "& .MuiInputBase-root": {
    height: 32,
  },
  "& .MuiInputBase-input": {
    padding: "4px 8px",
    fontSize: "0.8rem",
  },
  "& .MuiInputLabel-root": {
    fontSize: "0.8rem",
    transform: "translate(8px, 7px) scale(1)",
  },
  "& .MuiInputLabel-shrink": {
    transform: "translate(12px, -6px) scale(0.75)",
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
              views={["month", "year"]}
              value={selectedDate}
              format="MMM YYYY"
              onChange={handleDateChange}
              slotProps={{
                textField: {
                  size: "small",
                  sx: compactTextFieldSx,
                },
              }}
            />
          ) : (
            <DatePicker
              value={selectedDate}
              onChange={handleDateChange}
              slotProps={{
                textField: {
                  size: "small",
                  sx: compactTextFieldSx,
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

// import { Box, RadioGroup, FormControlLabel, Radio } from "@mui/material";
// import { useState, useMemo } from "react";
// import dayjs, { Dayjs } from "dayjs";
// import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
// import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
// import { DatePicker } from "@mui/x-date-pickers/DatePicker";
// import { getMonthRange, getWeekRange } from "../utils/dateRange.utils";
// import { MonthlyRosterMain } from "../monthly/MonthlyRosterMain";
// import { WeeklyRosterMain } from "../weekly/WeeklyRosterMain";
// import OrgHierarchyFilters from "../../orgHierarchy/components/OrgHierarchyFiltersV2";
// import { useOrgHierarchyState } from "../../orgHierarchy/hooks/useOrgHierarchyState";
// import { useOrgHierarchyFilters } from "../../orgHierarchy/hooks/useOrgHierarchyFilters";
// import { authStorage } from "../../../app/store/auth.storage";

// // ── Shared compact styles for all DatePickers ──────────────────────────────
// const compactPickerSx = {
//   minWidth: 160,
//   "& .MuiInputBase-root": {
//     height: 32,
//   },
//   "& .MuiInputBase-input": {
//     padding: "4px 8px",
//     fontSize: "0.8rem",
//   },
//   "& .MuiInputLabel-root": {
//     fontSize: "0.8rem",
//     transform: "translate(8px, 7px) scale(1)",
//   },
//   "& .MuiInputLabel-shrink": {
//     transform: "translate(12px, -6px) scale(0.75)",
//   },
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

//   const handleDateChange = (newValue: Dayjs | null) => {
//     if (newValue) setSelectedDate(newValue);
//   };

//   return (
//     <>
//       <LocalizationProvider dateAdapter={AdapterDayjs}>
//         <Box
//           sx={{
//             display: "flex",
//             alignItems: "center",
//             gap: 2,
//             flexWrap: "wrap",
//           }}
//         >
//           {/* ===== VIEW TOGGLE ===== */}
//           <RadioGroup
//             row
//             value={view}
//             onChange={(e) => setView(e.target.value as "weekly" | "monthly")}
//             sx={{ "& .MuiFormControlLabel-label": { fontSize: "0.8rem" } }}
//           >
//             <FormControlLabel
//               value="weekly"
//               control={<Radio size="small" />}
//               label="Weekly"
//             />
//             <FormControlLabel
//               value="monthly"
//               control={<Radio size="small" />}
//               label="Monthly"
//             />
//           </RadioGroup>

//           {/* ===== DATE PICKER ===== */}
//           {view === "monthly" ? (
//             <DatePicker
//               views={["month", "year"]}
//               value={selectedDate}
//               format="MMM YYYY"
//               onChange={handleDateChange}
//               slotProps={{
//                 textField: {
//                   size: "small",
//                   sx: compactPickerSx, // ← here
//                 },
//               }}
//               sx={compactPickerSx}
//             />
//           ) : (
//             <DatePicker
//               value={selectedDate}
//               onChange={handleDateChange}
//               // slotProps={{ textField: { size: "small" } }}
//               slotProps={{
//                 textField: {
//                   size: "small",
//                   sx: compactPickerSx, // ← here
//                 },
//               }}
//               sx={compactPickerSx}
//             />
//           )}

//           {/* ===== ORG FILTERS ===== */}
//           <OrgHierarchyFilters
//             role={roleName}
//             values={values}
//             options={options}
//             onChange={handleChange}
//           />
//         </Box>
//       </LocalizationProvider>

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
//     </>
//   );
// };




// // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// // // How I can customize this also
// // import { Box, RadioGroup, FormControlLabel, Radio } from "@mui/material";
// // import { useState, useMemo } from "react";
// // import dayjs, { Dayjs } from "dayjs";
// // import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
// // import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
// // import { DatePicker } from "@mui/x-date-pickers/DatePicker";
// // import { getMonthRange, getWeekRange } from "../utils/dateRange.utils";
// // import { MonthlyRosterMain } from "../monthly/MonthlyRosterMain";
// // import { WeeklyRosterMain } from "../weekly/WeeklyRosterMain";
// // import OrgHierarchyFilters from "../../orgHierarchy/components/OrgHierarchyFiltersV2";
// // import { useOrgHierarchyState } from "../../orgHierarchy/hooks/useOrgHierarchyState";
// // import { useOrgHierarchyFilters } from "../../orgHierarchy/hooks/useOrgHierarchyFilters";
// // import { authStorage } from "../../../app/store/auth.storage";

// // export const RosterViewMain = () => {
// //   const [view, setView] = useState<"weekly" | "monthly">("weekly");
// //   const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());

// //   const loggedUser = authStorage.getUser();
// //   const roleName = loggedUser?.roleCode ?? "TEAM_MEMBER";

// //   const { values, handleChange } = useOrgHierarchyState();
// //   const { options } = useOrgHierarchyFilters(values);

// //   const domainId = values.domain;
// //   const subDomainId = values.subDomain;

// //   /* ===== SINGLE SOURCE OF TRUTH FOR RANGE ===== */

// //   const { startDate, endDate } = useMemo(() => {
// //     return view === "monthly"
// //       ? getMonthRange(selectedDate)
// //       : getWeekRange(selectedDate);
// //   }, [view, selectedDate]);

// //   return (
// //     <>
// //       <LocalizationProvider dateAdapter={AdapterDayjs}>
// //         <Box
// //           sx={{
// //             display: "flex",
// //             alignItems: "center",
// //             gap: 3,
// //             flexWrap: "wrap",
// //           }}
// //         >
// //           {/* ===== VIEW TOGGLE ===== */}
// //           <RadioGroup
// //             row
// //             value={view}
// //             onChange={(e) => setView(e.target.value as "weekly" | "monthly")}
// //           >
// //             <FormControlLabel
// //               value="weekly"
// //               control={<Radio size="small" />}
// //               label="Weekly"
// //             />
// //             <FormControlLabel
// //               value="monthly"
// //               control={<Radio size="small" />}
// //               label="Monthly"
// //             />
// //           </RadioGroup>

// //           {/* ===== DATE PICKER ===== */}
// //           {view === "monthly" ? (
// //             <DatePicker
// //               views={["month", "year"]}
// //               value={selectedDate}
// //               format="MMM YYYY"
// //               onChange={(newValue) => newValue && setSelectedDate(newValue)}
// //               slotProps={{ textField: { size: "small" } }}
// //               sx={{
// //                 minWidth: 180,
// //                 "& .MuiInputBase-root": {
// //                   height: 32,
// //                 },
// //                 "& .MuiInputBase-input": {
// //                   padding: "4px 8px",
// //                   fontSize: "0.8rem",
// //                 },
// //                 "& .MuiInputLabel-root": {
// //                   fontSize: "0.8rem",
// //                   transform: "translate(8px, 7px) scale(1)",
// //                 },
// //                 "& .MuiInputLabel-shrink": {
// //                   transform: "translate(12px, -6px) scale(0.75)",
// //                 },
// //               }}
// //             />
// //           ) : (
// //             <DatePicker
// //               value={selectedDate}
// //               onChange={(newValue) => newValue && setSelectedDate(newValue)}
// //               slotProps={{ textField: { size: "small" } }}
// //             />
// //           )}

// //           {/* ===== ORG FILTERS ===== */}
// //           <OrgHierarchyFilters
// //             role={roleName}
// //             values={values}
// //             options={options}
// //             onChange={handleChange}
// //           />
// //         </Box>
// //       </LocalizationProvider>

// //       {/* ===== VIEW RENDER ===== */}

// //       <Box mt={2}>
// //         {view === "weekly" ? (
// //           <WeeklyRosterMain
// //             // startDate={startDate}
// //             // endDate={endDate}
// //             domainId={domainId}
// //             subDomainId={subDomainId}
// //           />
// //         ) : (
// //           <MonthlyRosterMain
// //             startDate={startDate}
// //             endDate={endDate}
// //             domainId={domainId}
// //             subDomainId={subDomainId}
// //           />
// //         )}
// //       </Box>
// //     </>
// //   );
// // };
