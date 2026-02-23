import {
  Box,
  Stack,
  Typography,
  Divider,
  AvatarGroup,
  Avatar,
  Badge,
  useTheme,
} from "@mui/material";
import EventBusyIcon from "@mui/icons-material/EventBusy";
// import SectionCard from "../../../components/common/SectionCard";
import LeaveEmployeeItem from "./LeaveEmployeeItem";
// import { onLeaveEmployees } from "../api/leave.mock";
import { alpha } from "@mui/material/styles";
import { onLeaveEmployees } from "../../orgHierarchy/api/leave.mock";
import SectionCard from "./common/SectionCard";
import SmartScrollContainer from "../../../components/common/SmartScrollContainer";

const OnLeaveTodayCard = () => {
  const theme = useTheme();
  const count = onLeaveEmployees.length;

  return (
    <SectionCard
      title="On Leave Today"
      action={
        <Typography
          variant="caption"
          sx={{
            cursor: "pointer",
            fontWeight: 600,
            color: theme.palette.primary.main,
          }}
        >
          View All →
        </Typography>
      }
    >
      {count === 0 ? (
        <Stack alignItems="center" py={1} spacing={1}>
          <EventBusyIcon
            sx={{
              fontSize: 40,
              color: alpha(theme.palette.success.main, 0.6),
            }}
          />
          <Typography fontWeight={600}>Everyone is In Today</Typography>
          <Typography variant="caption" color="text.secondary">
            No team member is on leave.
          </Typography>
        </Stack>
      ) : (
        <>
          {/* Top Summary */}
          <Stack direction="row" alignItems="center" spacing={2} mb={0.5}>
            <Badge
              badgeContent={count}
              color="error"
              sx={{
                "& .MuiBadge-badge": {
                  fontWeight: 600,
                },
              }}
            >
              <EventBusyIcon color="error" />
            </Badge>

            <Typography fontWeight={600}>
              {count} Employee{count > 1 && "s"} on Leave
            </Typography>

            <AvatarGroup max={5} sx={{ ml: "auto" }}>
              {onLeaveEmployees.map((emp) => (
                <Avatar key={emp.id}>{emp.name.charAt(0)}</Avatar>
              ))}
            </AvatarGroup>
          </Stack>

          <Divider sx={{ mb: 0.5 }} />

          {/* Employee List */}
          {/* <Stack spacing={0.5} maxHeight={100} sx={{ overflow: "auto" }}>
            {onLeaveEmployees.map((employee) => (
              <LeaveEmployeeItem
                key={employee.id}
                employee={employee}
              />
            ))}
          </Stack> */}
          <SmartScrollContainer height={120}>
            <Stack spacing={0.5}>
              {onLeaveEmployees.map((employee) => (
                <LeaveEmployeeItem key={employee.id} employee={employee} />
              ))}
            </Stack>
          </SmartScrollContainer>
        </>
      )}
    </SectionCard>
  );
};

export default OnLeaveTodayCard;
