import {
  Box,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import type { Holiday } from "../../orgHierarchy/api/holiday.mock";
// import { Holiday } from "../api/holiday.mock";

interface Props {
  holiday: Holiday;
  isNext?: boolean;
}

const HolidayItem = ({ holiday, isNext }: Props) => {
  const theme = useTheme();

  const holidayDate = new Date(holiday.date);
  const today = new Date();
  const diff =
    Math.ceil(
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
        p: 1.8,
        borderRadius: 3,
        border: isNext
          ? `1px solid ${alpha(typeColor, 0.5)}`
          : `1px solid ${alpha(theme.palette.divider, 0.5)}`,
        background: isNext
          ? alpha(typeColor, 0.07)
          : "transparent",
        transition: "all 0.25s ease",
        "&:hover": {
          background: alpha(typeColor, 0.1),
          transform: "translateX(4px)",
        },
      }}
    >
      <Stack direction="row" alignItems="center" spacing={2}>
        <Box
          sx={{
            p: 1.2,
            borderRadius: 2,
            background: alpha(typeColor, 0.15),
            color: typeColor,
          }}
        >
          <CalendarTodayIcon fontSize="small" />
        </Box>

        <Box flex={1}>
          <Typography fontWeight={600}>
            {holiday.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {holidayDate.toDateString()}
          </Typography>
        </Box>

        <Stack alignItems="flex-end">
          <Chip
            label={holiday.type}
            size="small"
            sx={{
              backgroundColor: alpha(typeColor, 0.12),
              color: typeColor,
              fontWeight: 600,
            }}
          />

          <Typography
            variant="caption"
            sx={{
              mt: 0.5,
              fontWeight: 600,
              color: typeColor,
            }}
          >
            {diff} days left
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
};

export default HolidayItem;
