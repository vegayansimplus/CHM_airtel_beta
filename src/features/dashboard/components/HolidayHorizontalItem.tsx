import {
  Box,
  Chip,
  Typography,
  Stack,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import type { Holiday } from "../../orgHierarchy/api/holiday.mock";
// import { Holiday } from "../api/holiday.mock";

interface Props {
  holiday: Holiday;
  isNext?: boolean;
}

const HolidayHorizontalItem = ({ holiday, isNext }: Props) => {
  const theme = useTheme();

  const holidayDate = new Date(holiday.date);
  const today = new Date();

  const diff = Math.ceil(
    (holidayDate.getTime() - today.getTime()) /
      (1000 * 60 * 60 * 24)
  );

  const getTypeColor = () => {
    switch (holiday.type) {
      case "National":
        return theme.palette.error.main;
      case "Optional":
        return theme.palette.warning.main;
      case "Company":
        return theme.palette.primary.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const typeColor = getTypeColor();

  return (
    <Box
      sx={{
        minWidth: 150,
        flexShrink: 0,
        p: 2,
        borderRadius: 4,
        border: isNext
          ? `2px solid ${alpha(typeColor, 0.5)}`
          : `1px solid ${alpha(theme.palette.divider, 0.4)}`,
        background: isNext
          ? alpha(typeColor, 0.07)
          : "background.paper",
        transition: "all 0.3s ease",
        scrollSnapAlign: "start",
        "&:hover": {
          transform: "translateY(-6px)",
          boxShadow: 3,
        },
      }}
    >
      <Stack spacing={2}>
        <Box
          sx={{
            p: 1.2,
            width: 42,
            height: 42,
            borderRadius: 2,
            background: alpha(typeColor, 0.15),
            color: typeColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CalendarTodayIcon fontSize="small" />
        </Box>

        <Typography fontWeight={700}>
          {holiday.name}
        </Typography>

        <Typography variant="body2" color="text.secondary">
          {holidayDate.toDateString()}
        </Typography>

        <Chip
          label={`${diff} days left`}
          size="small"
          sx={{
            alignSelf: "flex-start",
            backgroundColor: alpha(typeColor, 0.12),
            color: typeColor,
            fontWeight: 600,
          }}
        />

        <Chip
          label={holiday.type}
          size="small"
          sx={{
            alignSelf: "flex-start",
            backgroundColor: alpha(typeColor, 0.08),
            color: typeColor,
          }}
        />
      </Stack>
    </Box>
  );
};

export default HolidayHorizontalItem;
