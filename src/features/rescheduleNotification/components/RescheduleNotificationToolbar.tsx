import {
  Box,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Button,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import {
  ACTION_FILTER_OPTIONS,
  READ_FILTER_OPTIONS,
  SORT_OPTIONS,
} from "../constants/rescheduleNotification.constants";
import type {
  ActionStatusFilter,
  ReadStatusFilter,
  SortOption,
} from "../types/rescheduleNotification.types";
import { ACCENT } from "../constants/rescheduleNotification.styles";

interface RescheduleNotificationToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  readFilter: ReadStatusFilter;
  onReadFilterChange: (value: ReadStatusFilter) => void;
  actionFilter: ActionStatusFilter;
  onActionFilterChange: (value: ActionStatusFilter) => void;
  sort: SortOption;
  onSortChange: (value: SortOption) => void;
  onReset: () => void;
}

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",
    background: "#fbfbff",
    fontSize: 12.5,
    "& fieldset": { borderColor: "#e8edf6" },
    "&:hover fieldset": { borderColor: "#c7d2fe" },
    "&.Mui-focused fieldset": { borderColor: ACCENT },
  },
  "& .MuiInputLabel-root": { fontSize: 12.5 },
};

export function RescheduleNotificationToolbar({
  search,
  onSearchChange,
  readFilter,
  onReadFilterChange,
  actionFilter,
  onActionFilterChange,
  sort,
  onSortChange,
  onReset,
}: RescheduleNotificationToolbarProps) {
  return (
    <Stack
      direction={{ xs: "column", md: "row" }}
      spacing={1.25}
      alignItems={{ xs: "stretch", md: "center" }}
      sx={{ flexWrap: "wrap" }}
    >
      <TextField
        size="small"
        placeholder="Search by CRQ No."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" sx={{ color: "#94a3b8" }} />
              </InputAdornment>
            ),
          },
        }}
        sx={{ minWidth: { xs: "100%", md: 220 }, flex: { md: 1 }, ...fieldSx }}
        inputProps={{ "aria-label": "Search by CRQ number" }}
      />

      <TextField
        select
        size="small"
        label="Read Status"
        value={readFilter}
        onChange={(e) => onReadFilterChange(e.target.value as ReadStatusFilter)}
        sx={{ minWidth: { xs: "100%", md: 140 }, ...fieldSx }}
      >
        {READ_FILTER_OPTIONS.map((opt) => (
          <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: 12.5 }}>
            {opt.label}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        select
        size="small"
        label="Action Status"
        value={actionFilter}
        onChange={(e) => onActionFilterChange(e.target.value as ActionStatusFilter)}
        sx={{ minWidth: { xs: "100%", md: 150 }, ...fieldSx }}
      >
        {ACTION_FILTER_OPTIONS.map((opt) => (
          <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: 12.5 }}>
            {opt.label}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        select
        size="small"
        label="Sort By"
        value={sort}
        onChange={(e) => onSortChange(e.target.value as SortOption)}
        sx={{ minWidth: { xs: "100%", md: 200 }, ...fieldSx }}
      >
        {SORT_OPTIONS.map((opt) => (
          <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: 12.5 }}>
            {opt.label}
          </MenuItem>
        ))}
      </TextField>

      <Box sx={{ flexShrink: 0 }}>
        <Button
          size="small"
          startIcon={<RestartAltIcon fontSize="small" />}
          onClick={onReset}
          sx={{
            whiteSpace: "nowrap",
            fontSize: 12,
            fontWeight: 700,
            borderRadius: "10px",
            textTransform: "none",
            color: ACCENT,
            "&:hover": { background: "#eef2ff" },
          }}
        >
          Reset
        </Button>
      </Box>
    </Stack>
  );
}
