import { Box, Stack, Tooltip, Typography } from "@mui/material";
import ArrowRightAltIcon from "@mui/icons-material/ArrowRightAlt";
import { compareExecutionTimes, formatExecutionTime } from "../utils/rescheduleNotification.utils";
import { DIRECTION_STYLES } from "../constants/rescheduleNotification.styles";

interface RescheduleTimeComparisonProps {
  currentExecutionTime: string;
  rescheduledExecutionTime: string;
  /** Compact renders the two timestamps inline (table row); default stacks them (card). */
  variant?: "stacked" | "inline";
}

export function RescheduleTimeComparison({
  currentExecutionTime,
  rescheduledExecutionTime,
  variant = "stacked",
}: RescheduleTimeComparisonProps) {
  const comparison = compareExecutionTimes(currentExecutionTime, rescheduledExecutionTime);
  const directionStyle = DIRECTION_STYLES[comparison.direction];

  const timestamps = (
    <Stack
      direction={variant === "inline" ? "row" : "column"}
      spacing={variant === "inline" ? 1 : 0.25}
      alignItems={variant === "inline" ? "center" : "flex-start"}
    >
      <Typography sx={{ fontSize: 12, color: "#94a3b8", fontWeight: 500 }}>
        {formatExecutionTime(currentExecutionTime)}
      </Typography>
      <ArrowRightAltIcon
        fontSize="small"
        sx={{
          color: directionStyle.color,
          transform: variant === "stacked" ? "rotate(90deg)" : "none",
        }}
      />
      <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#1e1b4b" }}>
        {formatExecutionTime(rescheduledExecutionTime)}
      </Typography>
    </Stack>
  );

  return (
    <Box>
      {timestamps}
      <Tooltip title={comparison.isSameDay ? "Same-day reschedule" : "Different-day reschedule"} arrow>
        <Box
          sx={{
            display: "inline-block",
            mt: "5px",
            px: "7px",
            py: "1px",
            borderRadius: "20px",
            background: directionStyle.bg,
          }}
        >
          <Typography sx={{ fontSize: 9, fontWeight: 800, color: directionStyle.color }}>
            {comparison.diffLabel}
          </Typography>
        </Box>
      </Tooltip>
    </Box>
  );
}
