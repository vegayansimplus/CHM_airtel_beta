import { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Collapse,
  FormControl,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Search,
  Close,
  Tune,
  Sort,
  RestartAlt,
  ViewList,
  GridView,
} from "@mui/icons-material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import type { Dayjs } from "dayjs";

export type SortKey = "name-asc" | "name-desc" | "joined-new" | "joined-old" | "role";

export interface UserFilters {
  search: string;
  roleFilter: string;
  deptFilter: string;
  statusFilter: string;
  dateFrom: Dayjs | null;
  dateTo: Dayjs | null;
  sortBy: SortKey;
}

export const DEFAULT_FILTERS: UserFilters = {
  search: "",
  roleFilter: "All",
  deptFilter: "All",
  statusFilter: "All",
  dateFrom: null,
  dateTo: null,
  sortBy: "name-asc",
};

interface SearchToolbarProps {
  filters: UserFilters;
  onChange: (patch: Partial<UserFilters>) => void;
  onReset: () => void;
  departments: string[];
  viewMode: "list" | "grid";
  onViewModeChange: (mode: "list" | "grid") => void;
}

const fieldSx = {
  minWidth: 120,
  "& .MuiOutlinedInput-root": { borderRadius: "8px", fontSize: 12.5 },
};

export default function SearchToolbar({
  filters,
  onChange,
  onReset,
  departments,
  viewMode,
  onViewModeChange,
}: SearchToolbarProps) {
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const activeAdvancedCount =
    (filters.deptFilter !== "All" ? 1 : 0) +
    (filters.statusFilter !== "All" ? 1 : 0) +
    (filters.dateFrom || filters.dateTo ? 1 : 0);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box
        sx={{
          p: 1.25,
          mb: 1.5,
          borderRadius: "12px",
          background: "rgba(255,255,255,0.8)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(15,23,42,0.06)",
          boxShadow: "0 2px 12px rgba(15,23,42,0.03)",
        }}
      >
        <Stack direction="row" flexWrap="wrap" alignItems="center" gap={1}>
          <TextField
            inputRef={searchRef}
            placeholder="Search by name, ID or email…"
            size="small"
            value={filters.search}
            onChange={(e) => onChange({ search: e.target.value })}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: "text.secondary", fontSize: 18 }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  {filters.search ? (
                    <IconButton size="small" onClick={() => onChange({ search: "" })}>
                      <Close sx={{ fontSize: 14 }} />
                    </IconButton>
                  ) : (
                    <Box
                      sx={{
                        px: 0.8,
                        py: 0.2,
                        borderRadius: "6px",
                        bgcolor: "rgba(15,23,42,0.05)",
                        color: "text.secondary",
                        fontSize: 11,
                        fontWeight: 600,
                      }}
                    >
                      /
                    </Box>
                  )}
                </InputAdornment>
              ),
            }}
            sx={{
              flex: 1,
              minWidth: 200,
              "& .MuiOutlinedInput-root": { borderRadius: "999px", fontSize: 12.5, height: 34 },
            }}
          />

          <FormControl size="small" sx={fieldSx}>
            <Select
              value={filters.roleFilter}
              onChange={(e) => onChange({ roleFilter: e.target.value })}
              displayEmpty
            >
              {["All", "Super Admin", "Team Lead", "Team Member"].map((r) => (
                <MenuItem key={r} value={r}>
                  {r === "All" ? "All Roles" : r}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ ...fieldSx, minWidth: 170 }}>
            <Select
              value={filters.sortBy}
              onChange={(e) => onChange({ sortBy: e.target.value as SortKey })}
              startAdornment={
                <InputAdornment position="start">
                  <Sort sx={{ fontSize: 16, color: "text.secondary" }} />
                </InputAdornment>
              }
            >
              <MenuItem value="name-asc">Name (A–Z)</MenuItem>
              <MenuItem value="name-desc">Name (Z–A)</MenuItem>
              <MenuItem value="joined-new">Joined (Newest)</MenuItem>
              <MenuItem value="joined-old">Joined (Oldest)</MenuItem>
              <MenuItem value="role">Role</MenuItem>
            </Select>
          </FormControl>

          <Button
            size="small"
            variant={advancedOpen ? "contained" : "outlined"}
            startIcon={<Tune sx={{ fontSize: 15 }} />}
            onClick={() => setAdvancedOpen((p) => !p)}
            sx={{
              borderRadius: "8px",
              fontWeight: 600,
              ...(advancedOpen
                ? {}
                : { borderColor: "rgba(15,23,42,0.12)", color: "text.secondary" }),
            }}
          >
            Advanced Filters
            {activeAdvancedCount > 0 && (
              <Chip
                label={activeAdvancedCount}
                size="small"
                sx={{
                  ml: 0.75,
                  height: 18,
                  fontSize: 10,
                  bgcolor: advancedOpen ? "rgba(255,255,255,0.25)" : "primary.main",
                  color: "#fff",
                }}
              />
            )}
          </Button>

          <Tooltip title="Reset filters">
            <IconButton
              size="small"
              onClick={onReset}
              sx={{ border: "1px solid rgba(15,23,42,0.1)", borderRadius: "8px" }}
            >
              <RestartAlt sx={{ fontSize: 16, color: "text.secondary" }} />
            </IconButton>
          </Tooltip>

          <Stack direction="row" gap={0.5} ml={{ xs: 0, md: "auto" }}>
            <Tooltip title="List view">
              <IconButton
                size="small"
                onClick={() => onViewModeChange("list")}
                sx={{
                  borderRadius: "8px",
                  bgcolor: viewMode === "list" ? "rgba(37,99,235,0.1)" : "transparent",
                  color: viewMode === "list" ? "primary.main" : "text.secondary",
                }}
              >
                <ViewList fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Grid view">
              <IconButton
                size="small"
                onClick={() => onViewModeChange("grid")}
                sx={{
                  borderRadius: "8px",
                  bgcolor: viewMode === "grid" ? "rgba(37,99,235,0.1)" : "transparent",
                  color: viewMode === "grid" ? "primary.main" : "text.secondary",
                }}
              >
                <GridView fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>

        <Collapse in={advancedOpen}>
          <Stack
            direction="row"
            flexWrap="wrap"
            alignItems="center"
            gap={1}
            mt={1.25}
            pt={1.25}
            sx={{ borderTop: "1px dashed rgba(15,23,42,0.1)" }}
          >
            <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: "text.secondary" }}>
              DEPARTMENT
            </Typography>
            <FormControl size="small" sx={fieldSx}>
              <Select
                value={filters.deptFilter}
                onChange={(e) => onChange({ deptFilter: e.target.value })}
              >
                <MenuItem value="All">All Departments</MenuItem>
                {departments.map((d) => (
                  <MenuItem key={d} value={d}>
                    {d}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: "text.secondary" }}>
              STATUS
            </Typography>
            <FormControl size="small" sx={fieldSx}>
              <Select
                value={filters.statusFilter}
                onChange={(e) => onChange({ statusFilter: e.target.value })}
              >
                <MenuItem value="All">All Statuses</MenuItem>
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
              </Select>
            </FormControl>

            <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: "text.secondary" }}>
              JOINED
            </Typography>
            <DatePicker
              label="From"
              value={filters.dateFrom}
              onChange={(v) => onChange({ dateFrom: v })}
              slotProps={{ textField: { size: "small", sx: { ...fieldSx, minWidth: 150 } } }}
            />
            <DatePicker
              label="To"
              value={filters.dateTo}
              onChange={(v) => onChange({ dateTo: v })}
              slotProps={{ textField: { size: "small", sx: { ...fieldSx, minWidth: 150 } } }}
            />
          </Stack>
        </Collapse>
      </Box>
    </LocalizationProvider>
  );
}
