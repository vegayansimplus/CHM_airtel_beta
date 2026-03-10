import { Paper, Stack, IconButton, Typography, Button, CircularProgress } from "@mui/material";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import dayjs from "dayjs";
import { CompactShiftCountBar } from "./RosterShiftCountBar";

interface Props {
  startDate: string;
  endDate: string;
  goPrevWeek: () => void;
  goNextWeek: () => void;
  domainId?: number;
  subDomainId?: number;
  isSwapMode: boolean;
  onToggleSwapMode: () => void;
  selectedSwapCount: number;
  onApplySwap: () => void;
  isSwapping: boolean;
}

export const RosterToolbar = ({
  startDate,
  endDate,
  goPrevWeek,
  goNextWeek,
  domainId,
  subDomainId,
  isSwapMode,
  onToggleSwapMode,
  selectedSwapCount,
  onApplySwap,
  isSwapping
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

      <Stack direction="row" alignItems="center" spacing={2}>
        {/* --- SWAP ACTION BUTTONS --- */}
        <Stack direction="row" spacing={1}>
          <Button 
            variant={isSwapMode ? "contained" : "outlined"} 
            color={isSwapMode ? "error" : "primary"}
            startIcon={<SwapHorizIcon />}
            onClick={onToggleSwapMode}
            size="small"
          >
            {isSwapMode ? "Cancel Swap" : "Shift Swap"}
          </Button>

          {isSwapMode && (
            <Button
              variant="contained"
              color="success"
              size="small"
              disabled={selectedSwapCount !== 2 || isSwapping}
              onClick={onApplySwap}
              startIcon={isSwapping ? <CircularProgress size={16} color="inherit" /> : null}
            >
              Apply Swap ({selectedSwapCount}/2)
            </Button>
          )}
        </Stack>

        <Stack direction="row" alignItems="center" bgcolor="#F3F4F6" borderRadius={6}>
          <IconButton size="small" onClick={goPrevWeek}>
            <NavigateBeforeIcon fontSize="small" />
          </IconButton>

          <Typography sx={{ mx: 2, fontSize: '0.875rem', fontWeight: 500 }}>
            {dayjs(startDate).format("DD MMM")} - {dayjs(endDate).format("DD MMM")}
          </Typography>

          <IconButton size="small" onClick={goNextWeek}>
            <NavigateNextIcon fontSize="small" />
          </IconButton>
        </Stack>

        <Button variant="outlined" size="small" endIcon={<KeyboardArrowDownIcon />}>
          Tools
        </Button>
      </Stack>
    </Paper>
  );
};

// import { Paper, Stack, IconButton, Typography, Button } from "@mui/material";
// import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
// import NavigateNextIcon from "@mui/icons-material/NavigateNext";
// import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
// import dayjs from "dayjs";
// import { CompactShiftCountBar } from "./RosterShiftCountBar";

// interface Props {
//   startDate: string;
//   endDate: string;
//   goPrevWeek: () => void;
//   goNextWeek: () => void;
//   domainId?: number;
//   subDomainId?: number;
// }

// export const RosterToolbar = ({
//   startDate,
//   endDate,
//   goPrevWeek,
//   goNextWeek,
//   domainId,
//   subDomainId,
// }: Props) => {
//   return (
//     <Paper
//       elevation={0}
//       sx={{
//         p: 0.5,
//         mb: 0.5,
//         borderRadius: 2,
//         border: "1px solid #E0E0E0",
//         display: "flex",
//         justifyContent: "space-between",
//       }}
//     >
//       <Stack direction="row" bgcolor="#F3F4F6" borderRadius={6}>
//         <CompactShiftCountBar domainId={domainId} subDomainId={subDomainId} />
//       </Stack>
//       <Stack direction="row" alignItems="center"> 
//         <Button>Shift Swap</Button>

//       </Stack>

//       <Stack direction="row" alignItems="center" bgcolor="#F3F4F6" borderRadius={6}>
//         <IconButton size="small" onClick={goPrevWeek}>
//           <NavigateBeforeIcon fontSize="small" />
//         </IconButton>

//         <Typography sx={{ mx: 2 }}>
//           {dayjs(startDate).format("DD MMM")} - {dayjs(endDate).format("DD MMM")}
//         </Typography>

//         <IconButton size="small" onClick={goNextWeek}>
//           <NavigateNextIcon fontSize="small" />
//         </IconButton>
//       </Stack>

//       <Button
//         variant="outlined"
//         size="small"
//         endIcon={<KeyboardArrowDownIcon />}
//       >
//         Tools
//       </Button>
//     </Paper>
//   );
// };