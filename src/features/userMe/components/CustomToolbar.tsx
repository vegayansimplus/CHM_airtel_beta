import React, { memo } from "react";
import {type  ToolbarProps } from "react-big-calendar";
import {
  Box,
  Button,
  ButtonGroup,
  IconButton,
  Typography,
  Select,
  MenuItem,
  Stack,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import TodayIcon from "@mui/icons-material/Today";

interface CustomToolbarProps extends ToolbarProps {
  currentView: "month" | "week" | "day";
  onDateChange: (date: Date) => void;
}

const CustomToolbar: React.FC<CustomToolbarProps> = (props) => {
  const { date, onNavigate, onView, label, currentView, onDateChange } = props;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleYearChange = (event: any) => {
    const newYear = event.target.value;
    const newDate = new Date(date.setFullYear(newYear));
    onDateChange(newDate); // Custom prop to update parent state accurately
  };

  const currentYear = date.getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i); // +/- 5 years

  return (
    <Stack
      direction={isMobile ? "column" : "row"}
      justifyContent="space-between"
      alignItems="center"
      spacing={2}
      mb={2}
    >
      {/* Navigation Buttons */}
      <Stack direction="row" spacing={1} alignItems="center">
        <Button
          variant="outlined"
          size="small"
          startIcon={!isMobile && <TodayIcon />}
          onClick={() => onNavigate("TODAY")}
        >
          {isMobile ? "Today" : "Current"}
        </Button>
        <ButtonGroup variant="outlined" size="small">
          <IconButton onClick={() => onNavigate("PREV")}>
            <ChevronLeftIcon />
          </IconButton>
          <IconButton onClick={() => onNavigate("NEXT")}>
            <ChevronRightIcon />
          </IconButton>
        </ButtonGroup>
      </Stack>

      {/* Date Label & Year Selector */}
      <Stack direction="row" alignItems="center" spacing={1}>
        <Typography variant={isMobile ? "h6" : "h5"} fontWeight={600}>
          {label.split(" ")[0]} {/* Show only Month */}
        </Typography>
        <Select
          value={currentYear}
          size="small"
          onChange={handleYearChange}
          sx={{ height: 32, fontWeight: 600 }}
        >
          {years.map((year) => (
            <MenuItem key={year} value={year}>
              {year}
            </MenuItem>
          ))}
        </Select>
      </Stack>

      {/* View Switcher */}
      <ButtonGroup variant="contained" size="small" disableElevation>
        {(["month", "week", "day"] as const).map((view) => (
          <Button
            key={view}
            onClick={() => onView(view)}
            color={currentView === view ? "primary" : "inherit"}
            sx={{ textTransform: "capitalize" }}
          >
            {view}
          </Button>
        ))}
      </ButtonGroup>
    </Stack>
  );
};

export default memo(CustomToolbar);