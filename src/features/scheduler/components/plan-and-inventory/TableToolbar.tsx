/**
 * TableToolbar.tsx
 * Custom top-toolbar for MaterialReactTable.
 * Contains: search field · fullscreen toggle · plan/CRQ summary chips.
 */
import React from "react";
import {
  Chip,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Tooltip,
} from "@mui/material";
import FullscreenIcon     from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import SearchRoundedIcon  from "@mui/icons-material/SearchRounded";
import type { Colors } from "../../types/colorTypes";

// ─────────────────────────────────────────────────────────────────────────────
interface TableToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  planCount: number;
  crqCount: number;
  colors: Colors;
}

// ─────────────────────────────────────────────────────────────────────────────
export const TableToolbar: React.FC<TableToolbarProps> = ({
  searchValue,
  onSearchChange,
  isFullscreen,
  onToggleFullscreen,
  planCount,
  crqCount,
  colors,
}) => (
  <Stack direction="row" alignItems="center" spacing={1.2} flexWrap="wrap">
    {/* Search */}
    <TextField
      size="small"
      placeholder="Search plans, CRQs, tasks…"
      value={searchValue}
      onChange={(e) => onSearchChange(e.target.value)}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchRoundedIcon sx={{ fontSize: 15, color: colors.textDim }} />
          </InputAdornment>
        ),
        sx: {
          fontSize: 13,
          height: 34,
          borderRadius: "9px",
          bgcolor: colors.trackOff,
          color: colors.textPrimary,
          "& fieldset": { borderColor: colors.border },
          "&:hover fieldset": {
            borderColor: `${colors.accentBorder} !important`,
          },
          "&.Mui-focused fieldset": {
            borderColor: `${colors.accent} !important`,
            borderWidth: "1.5px !important",
          },
          "& input::placeholder": { color: colors.textDim, opacity: 1 },
        },
      }}
      sx={{ width: 260 }}
    />

    {/* Fullscreen toggle */}
    <Tooltip title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}>
      <IconButton
        size="small"
        onClick={onToggleFullscreen}
        sx={{
          width: 34,
          height: 34,
          borderRadius: "9px",
          bgcolor: colors.trackOff,
          color: colors.textSecondary,
          border: `1px solid ${colors.border}`,
          transition: "all 0.15s ease",
          "&:hover": {
            bgcolor: colors.accentDim,
            color: colors.accent,
            borderColor: colors.accentBorder,
          },
        }}
      >
        {isFullscreen
          ? <FullscreenExitIcon sx={{ fontSize: 17 }} />
          : <FullscreenIcon     sx={{ fontSize: 17 }} />}
      </IconButton>
    </Tooltip>

    {/* Summary chips */}
    <Stack direction="row" spacing={0.8}>
      <Chip
        label={`${planCount} plans`}
        size="small"
        sx={{
          height: 24,
          fontSize: 11,
          fontWeight: 700,
          bgcolor: colors.accentDim,
          color: colors.accent,
          border: `1px solid ${colors.accentBorder}`,
        }}
      />
      <Chip
        label={`${crqCount} CRQs`}
        size="small"
        sx={{
          height: 24,
          fontSize: 11,
          fontWeight: 700,
          bgcolor: colors.infoDim,
          color: colors.info,
          border: `1px solid ${colors.infoBorder}`,
        }}
      />
    </Stack>
  </Stack>
);