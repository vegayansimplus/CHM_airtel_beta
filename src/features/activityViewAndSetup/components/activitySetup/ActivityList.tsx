import React, { useState } from "react";
import {
  Box,
  Button,
  Chip,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import FilterListIcon from "@mui/icons-material/FilterList";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import BlockIcon from "@mui/icons-material/Block";
import ClearIcon from "@mui/icons-material/Clear";

import { useActivity } from "../../hooks/useActivity";
import { ImpactChip, StatusChip } from "./shared/ActivityShared";
import {
  CHANGE_IMPACT_OPTIONS,
  DOMAIN_OPTIONS,
  STATUS_OPTIONS,
} from "../../data/activity.mock";
import type { Activity } from "../../types/activity.types";

// ─────────────────────────────────────────────
//  Stats Cards Row
// ─────────────────────────────────────────────

const StatsRow: React.FC = () => {
  const { stats } = useActivity();
  const theme = useTheme();
  const cards = [
    { label: "Total", value: stats.total, color: theme.palette.primary.main },
    { label: "Active", value: stats.active, color: theme.palette.success.main },
    { label: "Draft", value: stats.draft, color: theme.palette.text.secondary },
    {
      label: "Pending",
      value: stats.pending,
      color: theme.palette.warning.main,
    },
    {
      label: "High Impact",
      value: stats.highImpact,
      color: theme.palette.error.main,
    },
  ];
  return (
    <Grid container spacing={1.5} sx={{ mb: 2.25 }}>
      {cards.map((c) => (
        <Grid
          // item xs={6} sm={4} md={2.4}
          size={{ xs: 6, sm: 4, md: 2.4 }}
          key={c.label}
        >
          <Paper
            elevation={0}
            sx={{
              p: 1.5,
              textAlign: "center",
              borderRadius: 3,
              border: `1px solid ${alpha(
                c.color,
                theme.palette.mode === "dark" ? 0.35 : 0.25,
              )}`,
              backgroundColor: alpha(
                c.color,
                theme.palette.mode === "dark" ? 0.14 : 0.08,
              ),
              boxShadow:
                theme.palette.mode === "dark"
                  ? "0 10px 30px rgba(0,0,0,0.28)"
                  : theme.shadows[1],
            }}
          >
            <Typography
              sx={{
                fontSize: 22,
                fontWeight: 700,
                color: c.color,
                lineHeight: 1.2,
              }}
            >
              {c.value}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {c.label}
            </Typography>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};

// ─────────────────────────────────────────────
//  Filter Bar
// ─────────────────────────────────────────────

const FilterBar: React.FC = () => {
  const { filters, updateFilters, clearFilters } = useActivity();
  const theme = useTheme();
  const [showFilters, setShowFilters] = useState(false);

  const hasActive = Boolean(
    filters.search ||
      filters.domain ||
      filters.status ||
      filters.changeImpact,
  );

  return (
    <Paper
      variant="outlined"
      sx={{
        mb: 2,
        p: 1.5,
        borderRadius: 3,
        backgroundColor:
          theme.palette.mode === "dark"
            ? "rgba(255,255,255,0.03)"
            : theme.palette.grey[50],
        borderColor: theme.palette.divider,
      }}
    >
      <Box
        sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}
      >
        {/* Search */}
        <TextField
          size="small"
          placeholder="Search activities…"
          value={filters.search}
          onChange={(e) => updateFilters({ search: e.target.value })}
          sx={{ minWidth: 240, flexGrow: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
            endAdornment: filters.search ? (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => updateFilters({ search: "" })}
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : null,
          }}
        />

        {/* Filter toggle */}
        <Button
          size="small"
          variant={showFilters ? "contained" : "outlined"}
          startIcon={<FilterListIcon />}
          onClick={() => setShowFilters((p) => !p)}
          color={hasActive ? "primary" : "inherit"}
        >
          Filters{" "}
          {hasActive
            ? `(${[
                filters.search,
                filters.domain,
                filters.status,
                filters.changeImpact,
              ].filter(Boolean).length})`
            : ""}
        </Button>

        {hasActive && (
          <Button
            size="small"
            variant="text"
            onClick={clearFilters}
            startIcon={<ClearIcon />}
          >
            Clear
          </Button>
        )}
      </Box>

      {showFilters && (
        <Box sx={{ display: "flex", gap: 1.5, mt: 1.25, flexWrap: "wrap" }}>
          <TextField
            select
            size="small"
            label="Domain"
            value={filters.domain}
            onChange={(e) => updateFilters({ domain: e.target.value })}
            sx={{ minWidth: 130 }}
          >
            <MenuItem value="">All</MenuItem>
            {DOMAIN_OPTIONS.map((o) => (
              <MenuItem key={o.value} value={o.value}>
                {o.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            size="small"
            label="Status"
            value={filters.status}
            onChange={(e) => updateFilters({ status: e.target.value })}
            sx={{ minWidth: 130 }}
          >
            {STATUS_OPTIONS.map((o) => (
              <MenuItem key={o.value} value={o.value}>
                {o.label || "All"}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            size="small"
            label="Change impact"
            value={filters.changeImpact}
            onChange={(e) => updateFilters({ changeImpact: e.target.value })}
            sx={{ minWidth: 140 }}
          >
            <MenuItem value="">All</MenuItem>
            {CHANGE_IMPACT_OPTIONS.map((o) => (
              <MenuItem key={o.value} value={o.value}>
                {o.label}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      )}
    </Paper>
  );
};

// ─────────────────────────────────────────────
//  Phases count badge
// ─────────────────────────────────────────────

const PhasesBadge: React.FC<{ phases: Activity["phases"] }> = ({ phases }) => {
  const configured = Object.values(phases).filter((p) => {
    return Object.values(p).some(
      (v) => v !== "" && v !== null && v !== undefined,
    );
  }).length;

  const theme = useTheme();
  const main =
    configured === 6
      ? theme.palette.success.main
      : configured > 0
        ? theme.palette.warning.main
        : theme.palette.grey[600];

  return (
    <Chip
      label={`${configured}/6`}
      size="small"
      variant="filled"
      sx={{
        fontWeight: 800,
        fontSize: 11,
        borderRadius: 999,
        bgcolor: alpha(main, theme.palette.mode === "dark" ? 0.22 : 0.12),
        color: main,
        border: `1px solid ${alpha(
          main,
          theme.palette.mode === "dark" ? 0.55 : 0.32,
        )}`,
      }}
    />
  );
};

// ─────────────────────────────────────────────
//  Pagination
// ─────────────────────────────────────────────

const PaginationRow: React.FC = () => {
  const {
    currentPage,
    totalPages,
    totalCount,
    changePage,
  } = useActivity();

  const start = (currentPage - 1) * 5 + 1;
  const end = Math.min(currentPage * 5, totalCount);

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: 1,
        pt: 1,
        flexWrap: "wrap",
        gap: 1,
      }}
    >
      <Typography variant="caption" color="text.secondary">
        Showing {start}–{end} of {totalCount} activities
      </Typography>
      <Box sx={{ display: "flex", gap: 0.5 }}>
        {[
          "«",
          "‹",
          ...Array.from({ length: totalPages }, (_, i) => String(i + 1)),
          "›",
          "»",
        ].map((label, idx) => {
          const isNum = !isNaN(Number(label));
          const pageNum = Number(label);
          const disabled =
            (label === "«" || label === "‹") && currentPage === 1
              ? true
              : (label === "›" || label === "»") && currentPage === totalPages
                ? true
                : false;

          const onClick = () => {
            if (label === "«") changePage(1);
            else if (label === "‹") changePage(Math.max(1, currentPage - 1));
            else if (label === "›")
              changePage(Math.min(totalPages, currentPage + 1));
            else if (label === "»") changePage(totalPages);
            else if (isNum) changePage(pageNum);
          };

          return (
            <Button
              key={idx}
              size="small"
              variant={
                isNum && pageNum === currentPage ? "contained" : "outlined"
              }
              disabled={disabled}
              onClick={onClick}
              sx={{
                minWidth: 32,
                px: 1,
                py: 0.25,
                fontSize: 12,
                borderRadius: 999,
                fontWeight: 700,
              }}
            >
              {label}
            </Button>
          );
        })}
      </Box>
    </Box>
  );
};

// ─────────────────────────────────────────────
//  Main Activity List
// ─────────────────────────────────────────────

export const ActivityList: React.FC = () => {
  const {
    paginatedActivities,
    goToCreate,
    openConfigure,
    handleUpdateStatus,
    handleDelete,
    filters,
    clearFilters,
  } = useActivity();
  const theme = useTheme();
  const hasActiveFilters = Boolean(
    filters.search ||
      filters.domain ||
      filters.status ||
      filters.changeImpact,
  );

  const cols = [
    "Activity Name",
    "CHM Domain",
    "Domain",
    "Plan Type",
    "Vendor OEM",
    "Phases",
    "Change Impact",
    "Status",
    "Actions",
  ];

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        <Typography variant="h6" fontWeight={600}>
          Activities
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={goToCreate}
          size="small"
        >
          Create activity
        </Button>
      </Box>

      <StatsRow />
      <FilterBar />

      {/* Table */}
      <TableContainer
        component={Paper}
        variant="outlined"
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          borderColor: theme.palette.divider,
          backgroundColor: theme.palette.background.paper,
        }}
      >
        <Table size="small">
          <TableHead>
            <TableRow
              sx={{
                backgroundColor:
                  theme.palette.mode === "dark"
                    ? alpha(theme.palette.primary.main, 0.20)
                    : theme.palette.grey[50],
              }}
            >
              {cols.map((c) => (
                <TableCell
                  key={c}
                  sx={{
                    fontWeight: 800,
                    fontSize: 12,
                    whiteSpace: "nowrap",
                    letterSpacing: 0.2,
                  }}
                >
                  {c}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedActivities.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={cols.length}
                  align="center"
                  sx={{ py: 5, px: 2 }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 1.5,
                    }}
                  >
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 3,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: alpha(
                          theme.palette.primary.main,
                          theme.palette.mode === "dark" ? 0.16 : 0.1,
                        ),
                        color: theme.palette.primary.main,
                        border: `1px solid ${alpha(
                          theme.palette.primary.main,
                          theme.palette.mode === "dark" ? 0.35 : 0.22,
                        )}`,
                      }}
                    >
                      <SearchOffIcon />
                    </Box>

                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 800, lineHeight: 1.1 }}
                    >
                      {hasActiveFilters
                        ? "No matching activities"
                        : "No activities found"}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      {hasActiveFilters
                        ? "Try clearing filters or adjusting your search."
                        : "Create your first activity and start configuring phases."}
                    </Typography>

                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                      {hasActiveFilters && (
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<ClearIcon />}
                          onClick={clearFilters}
                        >
                          Clear filters
                        </Button>
                      )}

                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<AddIcon />}
                        onClick={goToCreate}
                      >
                        Create activity
                      </Button>
                    </Box>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              paginatedActivities.map((row: any) => (
                <TableRow
                  key={row.id}
                  hover
                  sx={{
                    "&:hover td": {
                      backgroundColor: alpha(
                        theme.palette.primary.main,
                        theme.palette.mode === "dark" ? 0.16 : 0.06,
                      ),
                    },
                    transition: "background-color 120ms ease",
                  }}
                >
                  <TableCell>
                    <Typography
                      variant="body2"
                      fontWeight={500}
                      noWrap
                      title={row.activityName}
                      sx={{
                        cursor: "pointer",
                        color: theme.palette.primary.main,
                      }}
                      onClick={() => openConfigure(row.id)}
                    >
                      {row.activityName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {row.id}
                    </Typography>
                  </TableCell>
                  <TableCell
                    sx={{ fontSize: 13, whiteSpace: "nowrap" }}
                  >
                    {row.chmDomain}
                  </TableCell>
                  <TableCell sx={{ fontSize: 13, whiteSpace: "nowrap" }}>
                    {row.domain}
                  </TableCell>
                  <TableCell sx={{ fontSize: 13, whiteSpace: "nowrap" }}>
                    {row.planType}
                  </TableCell>
                  <TableCell sx={{ fontSize: 13, whiteSpace: "nowrap" }}>
                    {row.vendorOEM}
                  </TableCell>
                  <TableCell>
                    <PhasesBadge phases={row.phases} />
                  </TableCell>
                  <TableCell>
                    <ImpactChip impact={row.changeImpact} />
                  </TableCell>
                  <TableCell>
                    <StatusChip status={row.status} />
                  </TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        display: "flex",
                        gap: 0.25,
                        "& .MuiIconButton-root": {
                          borderRadius: 2,
                          border: "1px solid transparent",
                          "&:hover": {
                            backgroundColor: alpha(
                              theme.palette.primary.main,
                              theme.palette.mode === "dark" ? 0.18 : 0.1,
                            ),
                            borderColor: alpha(
                              theme.palette.primary.main,
                              theme.palette.mode === "dark" ? 0.35 : 0.22,
                            ),
                          },
                        },
                      }}
                    >
                      <Tooltip title="View / Edit phases">
                        <IconButton
                          size="small"
                          onClick={() => openConfigure(row.id)}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit activity">
                        <IconButton
                          size="small"
                          onClick={() => openConfigure(row.id)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {row.status !== "Active" ? (
                        <Tooltip title="Activate">
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleUpdateStatus(row.id, "Active")}
                          >
                            <CheckCircleOutlineIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Tooltip title="Deactivate">
                          <IconButton
                            size="small"
                            color="warning"
                            onClick={() =>
                              handleUpdateStatus(row.id, "Inactive")
                            }
                          >
                            <BlockIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(row.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <Box
          sx={{
            p: 1.25,
            borderTop: `1px solid ${theme.palette.divider}`,
            backgroundColor:
              theme.palette.mode === "dark"
                ? "rgba(255,255,255,0.02)"
                : theme.palette.grey[50],
          }}
        >
          <PaginationRow />
        </Box>
      </TableContainer>
    </Box>
  );
};
