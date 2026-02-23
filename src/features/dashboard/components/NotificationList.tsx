import { Stack, Typography } from "@mui/material";
// import SectionCard from "../../../components/common/SectionCard";
import { notifications } from "../api/dashboard.mock";
import SectionCard from "./common/SectionCard";

const NotificationList = () => {
  return (
    <SectionCard title="Notifications">
      <Stack spacing={2}>
        {notifications.map((item) => (
          <Stack key={item.id}>
            <Typography fontWeight={500}>{item.message}</Typography>
            <Typography variant="caption" color="text.secondary">
              {item.time}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </SectionCard>
  );
};

export default NotificationList;
