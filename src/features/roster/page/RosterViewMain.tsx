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

export const RosterViewMain = () => {
  const [view, setView] = useState<"weekly" | "monthly">("weekly");
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());

  const loggedUser = authStorage.getUser();
  const roleName = loggedUser?.roleCode ?? "TEAM_MEMBER";

  const { values, handleChange } = useOrgHierarchyState();
  const { options } = useOrgHierarchyFilters(values);

  const domainId = values.domain;
  const subDomainId = values.subDomain;

  /* ===== SINGLE SOURCE OF TRUTH FOR RANGE ===== */

  const { startDate, endDate } = useMemo(() => {
    return view === "monthly"
      ? getMonthRange(selectedDate)
      : getWeekRange(selectedDate);
  }, [view, selectedDate]);

  return (
    <>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 3,
            flexWrap: "wrap",
          }}
        >
          {/* ===== VIEW TOGGLE ===== */}
          <RadioGroup
            row
            value={view}
            onChange={(e) => setView(e.target.value as "weekly" | "monthly")}
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
              onChange={(newValue) => newValue && setSelectedDate(newValue)}
              slotProps={{ textField: { size: "small" } }}
            />
          ) : (
            <DatePicker
              value={selectedDate}
              onChange={(newValue) => newValue && setSelectedDate(newValue)}
              slotProps={{ textField: { size: "small" } }}
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
          <WeeklyRosterMain
            // startDate={startDate}
            // endDate={endDate}
            domainId={domainId}
            subDomainId={subDomainId}
          />
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
