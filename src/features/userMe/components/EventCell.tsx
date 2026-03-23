import React, { memo } from "react";
import { type EventProps } from "react-big-calendar";
import { Typography, Box } from "@mui/material";
import type { CalendarEvent } from "../utils/rosterTransform";

const EventCell: React.FC<EventProps<CalendarEvent>> = ({ event }) => {
  const ignoredTitles = ["Leave", "WO", "LG"];

  // Check if title should be ignored
  if (ignoredTitles.includes(event.title.split(" ")[0])) {
    return (
      <Box p={0.5} textAlign="center" sx={{ transition: "all 0.2s" }}>
        <Typography variant="caption" fontWeight="medium">
          {event.title}
        </Typography>
      </Box>
    );
  }

  // Extract first character or first two if "LG"
  const match = event.title.match(/^(LG|\S)(.*)$/);
  const boldPart = match ? match[1] : "";
  const restOfTitle = match ? match[2] : "";

  return (
    <Box p={0.5} textAlign="center" display="flex" justifyContent="center">
      <Typography variant="caption" fontWeight="bold">
        {boldPart}
      </Typography>
      <Typography variant="caption">{restOfTitle}</Typography>
    </Box>
  );
};

export default memo(EventCell);