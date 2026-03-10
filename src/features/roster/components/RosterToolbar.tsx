import { Paper, Stack, IconButton, Typography, Button } from "@mui/material";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import dayjs from "dayjs";
import { CompactShiftCountBar } from "./RosterShiftCountBar";

interface Props {
  startDate: string;
  endDate: string;
  goPrevWeek: () => void;
  goNextWeek: () => void;
  domainId?: number;
  subDomainId?: number;
}

export const RosterToolbar = ({
  startDate,
  endDate,
  goPrevWeek,
  goNextWeek,
  domainId,
  subDomainId,
}: Props) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 0.5,
        mb: 0.5,
        borderRadius: 2,
        border: "1px solid #E0E0E0",
        display: "flex",
        justifyContent: "space-between",
      }}
    >
      <Stack direction="row" bgcolor="#F3F4F6" borderRadius={6}>
        <CompactShiftCountBar domainId={domainId} subDomainId={subDomainId} />
      </Stack>

      <Stack direction="row" alignItems="center" bgcolor="#F3F4F6" borderRadius={6}>
        <IconButton size="small" onClick={goPrevWeek}>
          <NavigateBeforeIcon fontSize="small" />
        </IconButton>

        <Typography sx={{ mx: 2 }}>
          {dayjs(startDate).format("DD MMM")} - {dayjs(endDate).format("DD MMM")}
        </Typography>

        <IconButton size="small" onClick={goNextWeek}>
          <NavigateNextIcon fontSize="small" />
        </IconButton>
      </Stack>

      <Button
        variant="outlined"
        size="small"
        endIcon={<KeyboardArrowDownIcon />}
      >
        Tools
      </Button>
    </Paper>
  );
};