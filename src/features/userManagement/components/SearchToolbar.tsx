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
  alpha,
  useTheme,
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
import { getRoleConfig } from "../types/user";

export type SortKey = "name-asc" | "name-desc" | "joined-new" | "joined-old" | "role";

export interface FilterOption {
  value: number;
  label: string;
}

export interface UserFilters {
  search: string;
  roleCode: string | "All";
  functionId: number | "All";
  statusFilter: "All" | "Active" | "Inactive";
  sortBy: SortKey;
}

export const DEFAULT_FILTERS: UserFilters = {
  search: "",
  roleCode: "All",
  functionId: "All",
  statusFilter: "All",
  sortBy: "name-asc",
};

interface SearchToolbarProps {
  filters: UserFilters;
  onChange: (patch: Partial<UserFilters>) => void;
  onReset: () => void;
  departments: FilterOption[];
  roles: string[];
  viewMode: "list" | "grid";
  onViewModeChange: (mode: "list" | "grid") => void;
  /** Short-viewport mode: tighter padding/margins so the data region keeps
   *  its height. */
  dense?: boolean;
}

const fieldSx = {
  minWidth: 140,
  "& .MuiOutlinedInput-root": { borderRadius: "8px", fontSize: 12.5 },
};

export default function SearchToolbar({
  filters,
  onChange,
  onReset,
  departments,
  roles,
  viewMode,
  onViewModeChange,
  dense = false,
}: SearchToolbarProps) {
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(filters.search);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  // Debounce search text before it drives the server query, so keystrokes
  // don't each trigger a network round trip.
  useEffect(() => {
    const handle = setTimeout(() => {
      if (searchInput !== filters.search) onChange({ search: searchInput });
    }, 350);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  useEffect(() => {
    setSearchInput(filters.search);
  }, [filters.search]);

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
    (filters.functionId !== "All" ? 1 : 0) + (filters.statusFilter !== "All" ? 1 : 0);

  return (
    <Box
      sx={{
        p: dense ? 1 : 1.25,
        mb: dense ? 1 : 1.5,
        flexShrink: 0,
        borderRadius: "12px",
        background: isDark ? alpha(theme.palette.background.paper, 0.8) : "rgba(255,255,255,0.8)",
        backdropFilter: "blur(10px)",
        border: "1px solid",
        borderColor: "divider",
        boxShadow: isDark ? "0 2px 12px rgba(0,0,0,0.25)" : "0 2px 12px rgba(15,23,42,0.03)",
      }}
    >
      <Stack direction="row" flexWrap="wrap" alignItems="center" gap={1}>
        <TextField
          inputRef={searchRef}
          placeholder="Search by name, OLM ID or email…"
          size="small"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: "text.secondary", fontSize: 18 }} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                {searchInput ? (
                  <IconButton size="small" onClick={() => setSearchInput("")}>
                    <Close sx={{ fontSize: 14 }} />
                  </IconButton>
                ) : (
                  <Box
                    sx={{
                      px: 0.8,
                      py: 0.2,
                      borderRadius: "6px",
                      bgcolor: "action.hover",
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
            value={filters.roleCode}
            onChange={(e) => onChange({ roleCode: e.target.value })}
            displayEmpty
          >
            <MenuItem value="All">All Roles</MenuItem>
            {roles.map((r) => (
              <MenuItem key={r} value={r}>
                {getRoleConfig(r).label}
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
            ...(advancedOpen ? {} : { borderColor: "divider", color: "text.secondary" }),
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
            sx={{ border: "1px solid", borderColor: "divider", borderRadius: "8px" }}
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
                bgcolor: viewMode === "list" ? alpha(theme.palette.primary.main, 0.1) : "transparent",
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
                bgcolor: viewMode === "grid" ? alpha(theme.palette.primary.main, 0.1) : "transparent",
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
          sx={{ borderTop: "1px dashed", borderColor: "divider" }}
        >
          <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: "text.secondary" }}>
            DEPARTMENT
          </Typography>
          <FormControl size="small" sx={fieldSx}>
            <Select
              value={filters.functionId}
              onChange={(e) => onChange({ functionId: e.target.value as number | "All" })}
            >
              <MenuItem value="All">All Departments</MenuItem>
              {departments.map((d) => (
                <MenuItem key={d.value} value={d.value}>
                  {d.label}
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
              onChange={(e) => onChange({ statusFilter: e.target.value as UserFilters["statusFilter"] })}
            >
              <MenuItem value="All">All Statuses</MenuItem>
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Collapse>
    </Box>
  );
}
