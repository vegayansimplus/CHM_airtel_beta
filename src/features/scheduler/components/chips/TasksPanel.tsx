import React from "react";
import { Box, Chip, Collapse, Stack, Typography } from "@mui/material";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import type { Colors } from "../../types/colorTypes";
import CrqTaskTable from "../plan-and-inventory/CrqTaskTable";

interface TasksPanelProps {
  tasks: any[];
  isOpen: boolean;
  colors: Colors;
}

export const TasksPanel: React.FC<TasksPanelProps> = ({ tasks, isOpen, colors }) => (
  <Collapse in={isOpen} timeout="auto" unmountOnExit>
    <Box
      sx={{
        mx: 2,
        mb: 1.5,
        borderRadius: colors.radius,
        border: `1px solid ${colors.border}`,
        overflow: "hidden",
      }}
    >
      {/* Header bar */}
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        sx={{
          px: 1.5,
          py: 0.85,
          bgcolor: colors.infoDim,
          borderBottom: `1px solid ${colors.infoBorder}`,
        }}
      >
        <AssignmentOutlinedIcon sx={{ fontSize: 13, color: colors.info }} />
        <Typography sx={{ fontSize: 12, fontWeight: 700, color: colors.info }}>
          Tasks
        </Typography>
        <Chip
          label={tasks?.length ?? 0}
          size="small"
          sx={{
            height: 18,
            fontSize: 10,
            fontWeight: 800,
            bgcolor: `${colors.info}22`,
            color: colors.info,
            "& .MuiChip-label": { px: 0.7 },
          }}
        />
      </Stack>

      {/* Task table */}
      <Box sx={{ bgcolor: colors.surface }}>
        <CrqTaskTable tasks={tasks} colors={colors} />
      </Box>
    </Box>
  </Collapse>
);