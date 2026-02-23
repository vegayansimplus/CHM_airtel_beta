import {
  Avatar,
  Box,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import type { LeaveEmployee } from "../../orgHierarchy/api/leave.mock";
// import { LeaveEmployee } from "../api/leave.mock";

interface Props {
  employee: LeaveEmployee;
}

const LeaveEmployeeItem = ({ employee }: Props) => {
  const theme = useTheme();

  const getTypeColor = () => {
    switch (employee.type) {
      case "Sick Leave":
        return theme.palette.error.main;
      case "Vacation":
        return theme.palette.success.main;
      case "Casual Leave":
        return theme.palette.warning.main;
      case "WFH":
        return theme.palette.primary.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const typeColor = getTypeColor();

  return (
    <Box
      sx={{
        p: 0.5,
        borderRadius: 3,
        transition: "all 0.25s ease",
        "&:hover": {
          background: alpha(typeColor, 0.08),
          transform: "translateX(4px)",
        },
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1}>
        <Avatar sx={{ bgcolor: alpha(typeColor, 0.2), color: typeColor }}>
          {employee.name.charAt(0)}
        </Avatar>

        <Box flex={1}>
          <Typography fontWeight={600}>
            {employee.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {employee.role}
          </Typography>
        </Box>

        <Chip
          label={employee.type}
          size="small"
          sx={{
            fontWeight: 600,
            backgroundColor: alpha(typeColor, 0.12),
            color: typeColor,
          }}
        />
      </Stack>
    </Box>
  );
};

export default LeaveEmployeeItem;
