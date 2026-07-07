import React, { memo } from "react";
import { type EventProps } from "react-big-calendar";
import { Typography, Box, Tooltip } from "@mui/material";
import moment from "moment";
import type { CalendarEvent } from "../types/roster.types";

const IGNORED_TITLES = ["Leave", "WO", "LG"];

const EventCell: React.FC<EventProps<CalendarEvent>> = ({ event }) => {
  const tooltipLabel = event.allDay
    ? `${event.title} · ${moment(event.start).format("MMM DD, YYYY")}`
    : `${event.title} · ${moment(event.start).format("hh:mm A")} - ${moment(
        event.end,
      ).format("hh:mm A")}`;

  // Check if title should be ignored
  if (IGNORED_TITLES.includes(event.title.split(" ")[0])) {
    return (
      <Tooltip title={tooltipLabel} arrow enterDelay={400}>
        <Box p={0.5} textAlign="center" sx={{ cursor: "pointer" }}>
          <Typography variant="caption" fontWeight="medium">
            {event.title}
          </Typography>
        </Box>
      </Tooltip>
    );
  }

  // Extract first character or first two if "LG"
  const match = event.title.match(/^(LG|\S)(.*)$/);
  const boldPart = match ? match[1] : "";
  const restOfTitle = match ? match[2] : "";

  return (
    <Tooltip title={tooltipLabel} arrow enterDelay={400}>
      <Box
        p={0.5}
        textAlign="center"
        display="flex"
        justifyContent="center"
        sx={{ cursor: "pointer" }}
      >
        <Typography variant="caption" fontWeight="bold">
          {boldPart}
        </Typography>
        <Typography variant="caption">{restOfTitle}</Typography>
      </Box>
    </Tooltip>
  );
};

export default memo(EventCell);
