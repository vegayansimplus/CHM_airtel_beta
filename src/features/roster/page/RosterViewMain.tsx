import {
  Box,
  RadioGroup,
  FormControlLabel,
  Radio,
  IconButton,
  Typography,
} from "@mui/material";
import { useState, useMemo } from "react";
import dayjs, { Dayjs } from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
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

  const { startDate, endDate } = useMemo(() => {
    return view === "monthly"
      ? getMonthRange(selectedDate)
      : getWeekRange(selectedDate);
  }, [view, selectedDate]);

  // Navigate back: -1 month or -1 week
  const handlePrev = () => {
    setSelectedDate((prev) =>
      view === "monthly" ? prev.subtract(1, "month") : prev.subtract(1, "week"),
    );
  };

  // Navigate forward: +1 month or +1 week
  const handleNext = () => {
    setSelectedDate((prev) =>
      view === "monthly" ? prev.add(1, "month") : prev.add(1, "week"),
    );
  };

  // Label: "Apr 2026" for monthly, "Mar 30 – Apr 5" for weekly
  const dateLabel = useMemo(() => {
    if (view === "monthly") {
      return selectedDate.format("MMM YYYY");
    } else {
      const start = dayjs(startDate);
      const end = dayjs(endDate);
      const sameMonth = start.month() === end.month();
      return sameMonth
        ? `${start.format("MMM D")} – ${end.format("D")}`
        : `${start.format("MMM D")} – ${end.format("MMM D")}`;
    }
  }, [view, selectedDate, startDate, endDate]);

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

          {/* ===== DATE NAVIGATOR ===== */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
              overflow: "hidden",
            }}
          >
            <IconButton
              size="small"
              onClick={handlePrev}
              sx={{ borderRadius: 0, px: 0.5 }}
            >
              <ChevronLeftIcon fontSize="small" />
            </IconButton>

            <Typography
              sx={{
                fontSize: "0.8rem",
                fontWeight: 600,
                px: 1.5,
                minWidth: view === "monthly" ? 80 : 120,
                textAlign: "center",
                userSelect: "none",
              }}
            >
              {dateLabel}
            </Typography>

            <IconButton
              size="small"
              onClick={handleNext}
              sx={{ borderRadius: 0, px: 0.5 }}
            >
              <ChevronRightIcon fontSize="small" />
            </IconButton>
          </Box>

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
            domainId={domainId}
            subDomainId={subDomainId}
            startDate={startDate}
            endDate={endDate}
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
