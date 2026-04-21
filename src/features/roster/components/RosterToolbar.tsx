import {
  Paper,
  Stack,
  IconButton,
  Typography,
  Button,
  CircularProgress,
  useTheme,
  TextField,
  InputAdornment,
  Box,
} from "@mui/material";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import dayjs from "dayjs";
import { CompactShiftCountBar } from "./RosterShiftCountBar";
import SearchIcon from "@mui/icons-material/Search";
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
  onSearchChange: (value: string) => void;
  searchTerm: string;
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
  isSwapping,
  onSearchChange,
  searchTerm,
}: Props) => {
  const theme = useTheme();
  const bgColor =
    theme.palette.mode === "dark" ? theme.palette.background.paper : "#F3F4F6";

  return (
    <Paper
      elevation={0}
      sx={{
        p: 0.5,
        mb: 0.5,
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
        display: "flex",
        justifyContent: "space-between",
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        gap={1.5}
        bgcolor={bgColor}
        borderRadius={6}
        px={1.75}
        py={0.75}
        border={`0.5px solid ${theme.palette.divider}`}
      >
        <Stack spacing={0.25}>
          <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center" }}>

            <Typography
            sx={{
              fontSize: "0.525rem", // 10px
              fontWeight: 600,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "text.primary",
              lineHeight: 1,
              display: "flex",

            }}
          >
            Today's shift count :
          </Typography>

          <Stack direction="row" alignItems="center" spacing={1}>
            <CompactShiftCountBar
              domainId={domainId}
              subDomainId={subDomainId}
            />
          </Stack>
          </Box>
        </Stack>
      </Stack>
      {/* <Stack direction="row" bgcolor={bgColor} borderRadius={6}>
        Tody's shift count<CompactShiftCountBar domainId={domainId} subDomainId={subDomainId} />
      </Stack> */}

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
              startIcon={
                isSwapping ? (
                  <CircularProgress size={16} color="inherit" />
                ) : null
              }
            >
              Apply Swap ({selectedSwapCount}/2)
            </Button>
          )}
        </Stack>

        <Stack
          direction="row"
          alignItems="center"
          bgcolor={bgColor}
          borderRadius={6}
        >
          <IconButton size="small" onClick={goPrevWeek}>
            <NavigateBeforeIcon fontSize="small" />
          </IconButton>

          <Typography sx={{ mx: 2, fontSize: "0.875rem", fontWeight: 500 }}>
            {dayjs(startDate).format("DD MMM")} -{" "}
            {dayjs(endDate).format("DD MMM")}
          </Typography>

          <IconButton size="small" onClick={goNextWeek}>
            <NavigateNextIcon fontSize="small" />
          </IconButton>
        </Stack>
        <Stack>
          <TextField
            size="small"
            placeholder="Search Employee..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            sx={{
              width: 220,
              "& .MuiOutlinedInput-root": {
                borderRadius: 6,
                backgroundColor: bgColor,
                height: 36,
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </Stack>
      </Stack>
    </Paper>
  );
};
