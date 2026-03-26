import React, { useCallback, useMemo, useState, useEffect } from "react";
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Collapse,
  Stack,
  Paper,
  Checkbox,
  Button,
  TextField,
  Chip,
  InputAdornment,
  useTheme,
  GlobalStyles,
} from "@mui/material";
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from "material-react-table";

// Icons
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import StopRoundedIcon from "@mui/icons-material/StopRounded";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import TableRowsRoundedIcon from "@mui/icons-material/TableRowsRounded";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import { useTabColorTokens } from "../../../../style/theme";
import CrqInfoCards from "./CrqInfoCards";
import CrqTaskTable from "./CrqTaskTable";
import { mockCrqResponse } from "../../api/mockData";
import { deepSearch } from "../../util/stringUtils";

// Utilities & Components
// import { useTabColorTokens } from "../../../styles/theme"; // Adjust path if needed
// import { mockCrqResponse } from "../api/mockData";
// import { deepSearch } from "../../../utils/stringUtils";
// import CrqInfoCards from "../components/CrqInfoCards";
// import CrqTaskTable from "../components/CrqTaskTable";

// ─────────────────────────────────────────────────────────────────────────────
// Global Styles (The React/MUI Way)
// ─────────────────────────────────────────────────────────────────────────────
const PlanPageGlobalStyles = (
  <GlobalStyles
    styles={{
      "@keyframes fadeSlideIn": {
        from: { opacity: 0, transform: "translateY(5px)" },
        to: { opacity: 1, transform: "translateY(0)" },
      },
      "@keyframes pulseRing": {
        "0%": { boxShadow: "0 0 0 0 rgba(99,102,241,0.45)" },
        "70%": { boxShadow: "0 0 0 5px rgba(99,102,241,0)" },
        "100%": { boxShadow: "0 0 0 0 rgba(99,102,241,0)" },
      },
      ".crq-card": {
        animation: "fadeSlideIn 0.22s ease both",
      },
      ".crq-card:nth-of-type(1)": { animationDelay: "0.02s" },
      ".crq-card:nth-of-type(2)": { animationDelay: "0.05s" },
      ".crq-card:nth-of-type(3)": { animationDelay: "0.08s" },
      ".crq-card:nth-of-type(4)": { animationDelay: "0.11s" },
      ".crq-card:nth-of-type(n+5)": { animationDelay: "0.14s" },

      ".expand-chevron": {
        transition: "transform 0.22s cubic-bezier(.4,0,.2,1)",
        display: "flex",
      },
      ".expand-chevron.open": {
        transform: "rotate(90deg)",
      },

      ".plan-table-scroll::-webkit-scrollbar": { height: "6px", width: "6px" },
      ".plan-table-scroll::-webkit-scrollbar-track": {
        background: "transparent",
      },
      ".plan-table-scroll::-webkit-scrollbar-thumb": { borderRadius: "99px" },
    }}
  />
);

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
type Colors = ReturnType<typeof useTabColorTokens>;

// ─────────────────────────────────────────────────────────────────────────────
// StatusPill Component
// ─────────────────────────────────────────────────────────────────────────────
const getStatusConfig = (value: string, c: Colors) => {
  const configs: Record<string, any> = {
    "In Progress": {
      bg: c.accentDim,
      color: c.accent,
      dot: c.accent,
      pulse: true,
    },
    Paused: {
      bg: "rgba(245,158,11,0.12)",
      color: "#F59E0B",
      dot: "#F59E0B",
      pulse: false,
    },
    Completed: {
      bg: c.successDim,
      color: c.success,
      dot: c.success,
      pulse: false,
    },
    Canceled: { bg: c.dangerDim, color: c.danger, dot: c.danger, pulse: false },
    canceled: { bg: c.dangerDim, color: c.danger, dot: c.danger, pulse: false },
    cancel: { bg: c.dangerDim, color: c.danger, dot: c.danger, pulse: false },
  };
  return (
    configs[value] || {
      bg: c.trackOff,
      color: c.textSecondary,
      dot: c.textDim,
      pulse: false,
    }
  );
};

const StatusPill: React.FC<{ value: string; colors: Colors }> = ({
  value,
  colors,
}) => {
  const cfg = getStatusConfig(value, colors);
  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.55,
        px: 1.1,
        py: 0.4,
        borderRadius: "6px",
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: 0.25,
        bgcolor: cfg.bg,
        color: cfg.color,
        border: `1px solid ${cfg.color}28`,
        whiteSpace: "nowrap",
        lineHeight: 1,
        userSelect: "none",
      }}
    >
      <Box
        component="span"
        sx={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          bgcolor: cfg.dot,
          flexShrink: 0,
          ...(cfg.pulse && { animation: "pulseRing 1.8s ease infinite" }),
        }}
      />
      {value}
    </Box>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// CrqCard Component
// ─────────────────────────────────────────────────────────────────────────────
interface CrqCardProps {
  crq: any;
  plan: any;
  isOpen: boolean;
  isSelected: boolean;
  colors: Colors;
  onToggle: () => void;
  onSelect: () => void;
  onStartPause: () => void;
}

const CrqCard: React.FC<CrqCardProps> = ({
  crq,
  plan,
  isOpen,
  isSelected,
  colors,
  onToggle,
  onSelect,
  onStartPause,
}) => {
  const isFailed = ["canceled", "cancel", "Canceled"].includes(crq.crqStatus);
  const status = crq.impactAnalysisStatus || crq.crqReviewStatus;
  const isRunning = status === "In Progress";

  return (
    <Paper
      elevation={0}
      className="crq-card"
      sx={{
        mb: 1.5,
        borderRadius: colors.radiusL,
        border: `1.5px solid ${isSelected ? colors.accentBorder : colors.border}`,
        bgcolor: isSelected ? colors.accentDim : colors.surface,
        overflow: "hidden",
        transition:
          "border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease",
        "&:hover": {
          borderColor: isSelected ? colors.accent : colors.borderHover,
          boxShadow: colors.isDark
            ? "0 4px 22px rgba(0,0,0,0.32)"
            : "0 4px 22px rgba(99,102,241,0.10)",
        },
      }}
    >
      {/* ── Header Row ── */}
      <Stack
        direction="row"
        alignItems="center"
        sx={{
          px: 1.5,
          py: 1.1,
          gap: 1.5,
          borderLeft: `3px solid ${isSelected ? colors.accent : "transparent"}`,
          transition: "border-color 0.18s ease",
          overflowX: "auto",
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        <IconButton
          size="small"
          onClick={onToggle}
          disableRipple={false}
          sx={{
            width: 28,
            height: 28,
            borderRadius: "7px",
            flexShrink: 0,
            bgcolor: isOpen ? colors.accentDim : colors.trackOff,
            color: isOpen ? colors.accent : colors.textSecondary,
            border: `1px solid ${isOpen ? colors.accentBorder : colors.border}`,
            "&:hover": {
              bgcolor: colors.accentDim,
              color: colors.accent,
              borderColor: colors.accentBorder,
            },
          }}
        >
          <Box className={`expand-chevron${isOpen ? " open" : ""}`}>
            <ChevronRightIcon sx={{ fontSize: 16 }} />
          </Box>
        </IconButton>

        <Checkbox
          checked={isSelected}
          onChange={onSelect}
          size="small"
          sx={{
            p: 0,
            flexShrink: 0,
            color: colors.border,
            "&.Mui-checked": { color: colors.accent },
          }}
        />

        <Box
          sx={{
            px: 1.2,
            py: 0.45,
            borderRadius: "7px",
            bgcolor: colors.accentDim,
            border: `1px solid ${colors.accentBorder}`,
            flexShrink: 0,
          }}
        >
          <Typography
            sx={{
              fontSize: 12,
              fontWeight: 800,
              color: colors.accent,
              fontFamily: "'JetBrains Mono','Fira Code',monospace",
              letterSpacing: 0.5,
              lineHeight: 1,
            }}
          >
            {crq.crqNo}
          </Typography>
        </Box>

        <Stack direction="row" spacing={0.7} flexShrink={0}>
          {crq.crqStatus && (
            <StatusPill value={crq.crqStatus} colors={colors} />
          )}
          {status && status !== crq.crqStatus && (
            <StatusPill value={status} colors={colors} />
          )}
        </Stack>

        {/* Info Cards Container */}
        <Box sx={{ flex: 1, overflow: "hidden", minWidth: 0 }}>
          <CrqInfoCards crq={crq} colors={colors} />
        </Box>

        {(crq.tasks?.length ?? 0) > 0 && (
          <Chip
            icon={<AssignmentOutlinedIcon style={{ fontSize: 12 }} />}
            label={crq.tasks.length}
            size="small"
            sx={{
              height: 22,
              fontSize: 11,
              fontWeight: 700,
              flexShrink: 0,
              bgcolor: colors.infoDim,
              color: colors.info,
              border: `1px solid ${colors.infoBorder}`,
              "& .MuiChip-icon": { color: colors.info, ml: 0.7, mr: -0.4 },
              "& .MuiChip-label": { px: 0.8 },
            }}
          />
        )}

        <Button
          variant="outlined"
          size="small"
          disabled={isFailed}
          startIcon={
            isRunning ? (
              <StopRoundedIcon sx={{ fontSize: "14px !important" }} />
            ) : (
              <PlayArrowRoundedIcon sx={{ fontSize: "14px !important" }} />
            )
          }
          onClick={onStartPause}
          sx={{
            flexShrink: 0,
            height: 30,
            minWidth: 90,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 0.3,
            borderRadius: "8px",
            px: 1.5,
            transition: "all 0.15s ease",
            ...(isFailed
              ? {
                  bgcolor: colors.trackOff,
                  color: colors.textDim,
                  borderColor: colors.trackOffBorder,
                  "&.Mui-disabled": {
                    bgcolor: colors.trackOff,
                    color: colors.textDim,
                    borderColor: colors.trackOffBorder,
                  },
                }
              : isRunning
                ? {
                    bgcolor: colors.dangerDim,
                    color: colors.danger,
                    borderColor: colors.dangerBorder,
                    "&:hover": {
                      bgcolor: colors.danger,
                      color: "#fff",
                      borderColor: colors.danger,
                    },
                  }
                : {
                    bgcolor: colors.successDim,
                    color: colors.success,
                    borderColor: colors.successBorder,
                    "&:hover": {
                      bgcolor: colors.success,
                      color: "#fff",
                      borderColor: colors.success,
                    },
                  }),
          }}
        >
          {isFailed ? "Disabled" : isRunning ? "Pause" : "Start"}
        </Button>
      </Stack>

      {/* ── Tasks Collapse ── */}
      <Collapse in={isOpen} timeout="auto" unmountOnExit>
        <Box
          sx={{
            mx: 2,
            mb: 1.5,
            borderRadius: colors.radius,
            border: `1px solid ${colors.border}`,
            overflow: "hidden",
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{
              px: 1.5,
              py: 0.85,
              bgcolor: colors.infoDim,
              borderBottom: `1px solid ${colors.infoBorder}`,
            }}
          >
            <AssignmentOutlinedIcon sx={{ fontSize: 13, color: colors.info }} />
            <Typography
              sx={{ fontSize: 12, fontWeight: 700, color: colors.info }}
            >
              Tasks
            </Typography>
            <Chip
              label={crq.tasks?.length ?? 0}
              size="small"
              sx={{
                height: 18,
                fontSize: 10,
                fontWeight: 800,
                bgcolor: `${colors.info}22`,
                color: colors.info,
                "& .MuiChip-label": { px: 0.7 },
              }}
            />
          </Stack>
          <Box sx={{ bgcolor: colors.surface }}>
            <CrqTaskTable tasks={crq.tasks} colors={colors} />
          </Box>
        </Box>
      </Collapse>
    </Paper>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// DetailPanel Wrapper
// ─────────────────────────────────────────────────────────────────────────────
interface DetailPanelProps {
  plan: any;
  openCrqs: Record<string, boolean>;
  selectedCrq: any;
  colors: Colors;
  onToggle: (id: string) => void;
  onSelect: (crq: any) => void;
  onStartPause: (crq: any) => void;
}

const DetailPanel: React.FC<DetailPanelProps> = ({
  plan,
  openCrqs,
  selectedCrq,
  colors,
  onToggle,
  onSelect,
  onStartPause,
}) => (
  <Box
    sx={{
      width: "100%",
      p: 2,
      bgcolor: colors.isDark ? "rgba(0,0,0,0.20)" : "rgba(248,250,252,0.92)",
      borderTop: `1px solid ${colors.border}`,
    }}
  >
    <Stack direction="row" alignItems="center" spacing={1.2} sx={{ mb: 1.8 }}>
      <Box
        sx={{
          width: 3,
          height: 16,
          borderRadius: 99,
          background: `linear-gradient(180deg, ${colors.accent}, ${colors.info})`,
        }}
      />
      <Typography
        sx={{
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: 0.55,
          color: colors.textSecondary,
          textTransform: "uppercase",
        }}
      >
        CRQs
      </Typography>
      <Chip
        label={plan.crqs?.length ?? 0}
        size="small"
        sx={{
          height: 20,
          fontSize: 11,
          fontWeight: 800,
          bgcolor: colors.accentDim,
          color: colors.accent,
          border: `1px solid ${colors.accentBorder}`,
        }}
      />
      <Typography
        sx={{ fontSize: 12, color: colors.textDim, fontFamily: "monospace" }}
      >
        › {plan.planNumber}
      </Typography>
    </Stack>

    {!plan.crqs?.length ? (
      <Box
        sx={{
          p: 3,
          textAlign: "center",
          border: `1px dashed ${colors.border}`,
          borderRadius: colors.radiusL,
        }}
      >
        <TableRowsRoundedIcon
          sx={{ fontSize: 28, mb: 1, color: colors.textDim, opacity: 0.5 }}
        />
        <Typography sx={{ fontSize: 13, color: colors.textDim }}>
          No CRQs found.
        </Typography>
      </Box>
    ) : (
      plan.crqs.map((crq: any) => (
        <CrqCard
          key={crq.crqNo}
          crq={crq}
          plan={plan}
          colors={colors}
          isOpen={!!openCrqs[crq.crqNo]}
          isSelected={selectedCrq?.crqNo === crq.crqNo}
          onToggle={() => onToggle(crq.crqNo)}
          onSelect={() =>
            onSelect(
              selectedCrq?.crqNo === crq.crqNo
                ? null
                : { ...crq, planNumber: plan.planNumber },
            )
          }
          onStartPause={() => onStartPause(crq)}
        />
      ))
    )}
  </Box>
);

// ─────────────────────────────────────────────────────────────────────────────
// Main Page Export
// ─────────────────────────────────────────────────────────────────────────────
export const PlanAndInventoryPage: React.FC = () => {
  const theme = useTheme();
  const colors = useTabColorTokens(theme);

  const [plansOriginal, setPlansOriginal] = useState(mockCrqResponse.plans);
  const [openCrqs, setOpenCrqs] = useState<Record<string, boolean>>({});
  const [selectedCrq, setSelectedCrq] = useState<any | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [globalSearchInput, setGlobalSearchInput] = useState("");
  const [globalSearch, setGlobalSearch] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setGlobalSearch(globalSearchInput), 300);
    return () => clearTimeout(t);
  }, [globalSearchInput]);

  const handleStartPauseReview = useCallback((crq: any) => {
    const isRunning =
      (crq.impactAnalysisStatus || crq.crqReviewStatus) === "In Progress";
    setPlansOriginal((prev) =>
      prev.map((plan) => ({
        ...plan,
        crqs: plan.crqs.map((c) =>
          c.crqNo === crq.crqNo
            ? {
                ...c,
                impactAnalysisStatus: isRunning ? "Paused" : "In Progress",
              }
            : c,
        ),
      })),
    );
  }, []);

  const toggleFullScreen = () => {
    const elem = document.getElementById("planning-container");
    if (!document.fullscreenElement) {
      elem?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const toggleCrq = (id: string) =>
    setOpenCrqs((prev) => ({ ...prev, [id]: !prev[id] }));

  const filteredPlans = useMemo(() => {
    if (!globalSearch) return plansOriginal;
    const g = globalSearch.trim();
    return plansOriginal
      .map((plan: any) => {
        const match = deepSearch(plan, g);
        const crqs = (plan.crqs || []).filter((c: any) => deepSearch(c, g));
        if (!match && !crqs.length) return null;
        return { ...plan, crqs: g ? crqs : plan.crqs };
      })
      .filter(Boolean);
  }, [plansOriginal, globalSearch]);

  const columns = useMemo<MRT_ColumnDef<any>[]>(
    () => [
      {
        accessorKey: "planNumber",
        header: "Plan Number",
        size: 200,
        Cell: ({ cell }) => (
          <Typography
            sx={{
              fontSize: 12,
              fontWeight: 800,
              fontFamily: "monospace",
              color: colors.accent,
              letterSpacing: 0.4,
            }}
          >
            {cell.getValue<string>()}
          </Typography>
        ),
      },
      {
        accessorKey: "planType",
        header: "Plan Type",
        size: 180,
        Cell: ({ cell }) => (
          <Chip
            label={cell.getValue<string>()}
            size="small"
            sx={{
              height: 20,
              fontSize: 11,
              fontWeight: 600,
              bgcolor: colors.successDim,
              color: colors.success,
              border: `1px solid ${colors.successBorder}`,
            }}
          />
        ),
      },
      {
        accessorKey: "description",
        header: "Description",
        size: 400,
        Cell: ({ cell }) => (
          <Typography
            sx={{ fontSize: 12, color: colors.textSecondary, lineHeight: 1.5 }}
          >
            {cell.getValue<string>()}
          </Typography>
        ),
      },
    ],
    [colors],
  );

  const renderTopToolbarCustomActions = () => (
    <Stack direction="row" alignItems="center" spacing={1.2} flexWrap="wrap">
      <TextField
        size="small"
        placeholder="Search plans, CRQs, tasks…"
        value={globalSearchInput}
        onChange={(e) => setGlobalSearchInput(e.target.value)}
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
      <Tooltip title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}>
        <IconButton
          size="small"
          onClick={toggleFullScreen}
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
          {isFullscreen ? (
            <FullscreenExitIcon sx={{ fontSize: 17 }} />
          ) : (
            <FullscreenIcon sx={{ fontSize: 17 }} />
          )}
        </IconButton>
      </Tooltip>
      <Stack direction="row" spacing={0.8}>
        <Chip
          label={`${filteredPlans.length} plans`}
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
          label={`${filteredPlans.reduce((a: number, p: any) => a + (p.crqs?.length || 0), 0)} CRQs`}
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

  const table = useMaterialReactTable({
    columns,
    data: filteredPlans,
    enableSorting: true,
    enablePagination: true,
    renderDetailPanel: ({ row }) => (
      <DetailPanel
        plan={row.original}
        openCrqs={openCrqs}
        selectedCrq={selectedCrq}
        colors={colors}
        onToggle={toggleCrq}
        onSelect={setSelectedCrq}
        onStartPause={handleStartPauseReview}
      />
    ),
    renderTopToolbarCustomActions,
    initialState: { density: "compact" },
    muiDetailPanelProps: { sx: { padding: 0 } },
    muiTablePaperProps: {
      elevation: 0,
      sx: {
        border: `1px solid ${colors.border}`,
        borderRadius: colors.radiusXL,
        overflow: "hidden",
        bgcolor: colors.surface,
      },
    },
    muiTableHeadCellProps: {
      sx: {
        fontSize: "11px !important",
        fontWeight: "700 !important",
        letterSpacing: "0.55px !important",
        textTransform: "uppercase !important",
        color: `${colors.textSecondary} !important`,
        bgcolor: colors.isDark
          ? "rgba(255,255,255,0.025)"
          : "rgba(248,250,252,0.95)",
        borderBottom: `1px solid ${colors.border} !important`,
        py: "10px !important",
      },
    },
    muiTableBodyCellProps: {
      sx: {
        fontSize: 13,
        color: colors.textPrimary,
        borderBottom: `1px solid ${colors.border}`,
        py: "8px !important",
      },
    },
    muiTableBodyRowProps: {
      sx: {
        transition: "background 0.12s ease",
        cursor: "pointer",
        "&:hover td": {
          bgcolor: colors.isDark
            ? "rgba(99,102,241,0.04)"
            : "rgba(99,102,241,0.025)",
        },
      },
    },
    muiTopToolbarProps: {
      sx: {
        bgcolor: colors.surface,
        borderBottom: `1px solid ${colors.border}`,
        px: 2,
        py: 1,
        minHeight: 52,
      },
    },
    muiBottomToolbarProps: {
      sx: {
        bgcolor: colors.isDark
          ? "rgba(255,255,255,0.01)"
          : "rgba(248,250,252,0.7)",
        borderTop: `1px solid ${colors.border}`,
        minHeight: 44,
      },
    },
    muiTableContainerProps: {
      className: "plan-table-scroll",
      sx: {
        maxHeight: "calc(100vh - 280px)",
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: colors.isDark ? "#1F2937" : "#CBD5E1",
        },
      },
    },
  });

  return (
    <Box
      id="planning-container"
      sx={{
        p: { xs: 1.5, sm: 2, md: 2.5 },
        bgcolor: colors.bg,
        minHeight: "100%",
      }}
    >
      {PlanPageGlobalStyles}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "flex-start", sm: "center" }}
        justifyContent="space-between"
        sx={{ mb: 2.5 }}
        spacing={1}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              width: 4,
              height: 26,
              borderRadius: 99,
              background: `linear-gradient(180deg, ${colors.accent} 0%, ${colors.info} 100%)`,
              flexShrink: 0,
            }}
          />
          <Box>
            <Typography
              sx={{
                fontSize: { xs: 18, sm: 22 },
                fontWeight: 800,
                color: colors.textPrimary,
                letterSpacing: -0.6,
                lineHeight: 1.2,
              }}
            >
              Plan &amp; Inventory
            </Typography>
            <Typography sx={{ fontSize: 12, color: colors.textDim, mt: 0.3 }}>
              Change Request Tracking &amp; Execution
            </Typography>
          </Box>
        </Stack>
      </Stack>
      <MaterialReactTable table={table} />
    </Box>
  );
};

export default PlanAndInventoryPage;

// import React, { useCallback, useMemo, useState, useEffect } from "react";
// import {
//   Box,
//   Typography,
//   IconButton,
//   Tooltip,
//   Collapse,
//   Stack,
//   Paper,
//   Checkbox,
//   Button,
//   TextField,
//   Chip,
//   InputAdornment,
//   useTheme,
// } from "@mui/material";
// import {
//   MaterialReactTable,
//   useMaterialReactTable,
//   type MRT_ColumnDef,
// } from "material-react-table";
// import ChevronRightIcon from "@mui/icons-material/ChevronRight";
// import FullscreenIcon from "@mui/icons-material/Fullscreen";
// import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
// import StopRoundedIcon from "@mui/icons-material/StopRounded";
// import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
// import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
// import TableRowsRoundedIcon from "@mui/icons-material/TableRowsRounded";
// import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
// import { useTabColorTokens } from "../../../../style/theme";
// import { mockCrqResponse } from "../../api/mockData";
// import { deepSearch } from "../../util/stringUtils";
// import CrqInfoCards from "./CrqInfoCards";
// import CrqTaskTable from "./CrqTaskTable";

// // ─────────────────────────────────────────────────────────────────────────────
// // Global keyframe + utility CSS (injected once)
// // ─────────────────────────────────────────────────────────────────────────────
// const injectGlobalStyles = () => {
//   if (document.getElementById("plan-page-styles")) return;
//   const style = document.createElement("style");
//   style.id = "plan-page-styles";
//   style.textContent = `
//     @keyframes fadeSlideIn {
//       from { opacity: 0; transform: translateY(5px); }
//       to   { opacity: 1; transform: translateY(0); }
//     }
//     @keyframes pulseRing {
//       0%   { box-shadow: 0 0 0 0 rgba(99,102,241,0.45); }
//       70%  { box-shadow: 0 0 0 5px rgba(99,102,241,0); }
//       100% { box-shadow: 0 0 0 0 rgba(99,102,241,0); }
//     }

//     .crq-card {
//       animation: fadeSlideIn 0.22s ease both;
//     }
//     .crq-card:nth-child(1) { animation-delay: 0.02s; }
//     .crq-card:nth-child(2) { animation-delay: 0.05s; }
//     .crq-card:nth-child(3) { animation-delay: 0.08s; }
//     .crq-card:nth-child(4) { animation-delay: 0.11s; }
//     .crq-card:nth-child(n+5) { animation-delay: 0.14s; }

//     /* Smooth expand arrow */
//     .expand-chevron {
//       transition: transform 0.22s cubic-bezier(.4,0,.2,1);
//       display: flex;
//     }
//     .expand-chevron.open {
//       transform: rotate(90deg);
//     }

//     /* Styled scrollbars inside MRT container */
//     .plan-table-scroll::-webkit-scrollbar        { height: 5px; width: 5px; }
//     .plan-table-scroll::-webkit-scrollbar-track  { background: transparent; }
//     .plan-table-scroll::-webkit-scrollbar-thumb  { border-radius: 99px; }
//   `;
//   document.head.appendChild(style);
// };

// // ─────────────────────────────────────────────────────────────────────────────
// // StatusPill
// // ─────────────────────────────────────────────────────────────────────────────
// type Colors = ReturnType<typeof useTabColorTokens>;

// const STATUS_CFG = (c: Colors) =>
//   ({
//     "In Progress": {
//       bg: c.accentDim,
//       color: c.accent,
//       dot: c.accent,
//       pulse: true,
//     },
//     Paused: {
//       bg: "rgba(245,158,11,0.12)",
//       color: "#F59E0B",
//       dot: "#F59E0B",
//       pulse: false,
//     },
//     Completed: {
//       bg: c.successDim,
//       color: c.success,
//       dot: c.success,
//       pulse: false,
//     },
//     Canceled: { bg: c.dangerDim, color: c.danger, dot: c.danger, pulse: false },
//     canceled: { bg: c.dangerDim, color: c.danger, dot: c.danger, pulse: false },
//     cancel: { bg: c.dangerDim, color: c.danger, dot: c.danger, pulse: false },
//   }) as Record<
//     string,
//     { bg: string; color: string; dot: string; pulse: boolean }
//   >;

// const StatusPill: React.FC<{ value: string; colors: Colors }> = ({
//   value,
//   colors,
// }) => {
//   const cfg = STATUS_CFG(colors)[value] ?? {
//     bg: colors.trackOff,
//     color: colors.textSecondary,
//     dot: colors.textDim,
//     pulse: false,
//   };
//   return (
//     <Box
//       component="span"
//       sx={{
//         display: "inline-flex",
//         alignItems: "center",
//         gap: 0.55,
//         px: 1.1,
//         py: 0.4,
//         borderRadius: "6px",
//         fontSize: 11,
//         fontWeight: 700,
//         letterSpacing: 0.25,
//         bgcolor: cfg.bg,
//         color: cfg.color,
//         border: `1px solid ${cfg.color}28`,
//         whiteSpace: "nowrap",
//         lineHeight: 1,
//         userSelect: "none",
//       }}
//     >
//       <Box
//         component="span"
//         sx={{
//           width: 5,
//           height: 5,
//           borderRadius: "50%",
//           bgcolor: cfg.dot,
//           flexShrink: 0,
//           ...(cfg.pulse && { animation: "pulseRing 1.8s ease infinite" }),
//         }}
//       />
//       {value}
//     </Box>
//   );
// };

// // ─────────────────────────────────────────────────────────────────────────────
// // CrqCard
// // ─────────────────────────────────────────────────────────────────────────────
// interface CrqCardProps {
//   crq: any;
//   plan: any;
//   isOpen: boolean;
//   isSelected: boolean;
//   colors: Colors;
//   onToggle: () => void;
//   onSelect: () => void;
//   onStartPause: () => void;
// }

// const CrqCard: React.FC<CrqCardProps> = ({
//   crq,
//   plan,
//   isOpen,
//   isSelected,
//   colors,
//   onToggle,
//   onSelect,
//   onStartPause,
// }) => {
//   const isFailed = ["canceled", "cancel", "Canceled"].includes(crq.crqStatus);
//   const status = crq.impactAnalysisStatus || crq.crqReviewStatus;
//   const isRunning = status === "In Progress";

//   return (
//     <Paper
//       elevation={0}
//       className="crq-card"
//       sx={{
//         mb: 1.5,
//         borderRadius: colors.radiusL,
//         border: `1.5px solid ${isSelected ? colors.accentBorder : colors.border}`,
//         bgcolor: isSelected ? colors.accentDim : colors.surface,
//         overflow: "hidden",
//         transition:
//           "border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease",
//         "&:hover": {
//           borderColor: isSelected ? colors.accent : colors.borderHover,
//           boxShadow: colors.isDark
//             ? "0 4px 22px rgba(0,0,0,0.32)"
//             : "0 4px 22px rgba(99,102,241,0.10)",
//         },
//       }}
//     >
//       {/* ── Header row ── */}
//       <Stack
//         direction="row"
//         alignItems="center"
//         sx={{
//           px: 1.5,
//           py: 1.1,
//           gap: 1.5,
//           borderLeft: `3px solid ${isSelected ? colors.accent : "transparent"}`,
//           transition: "border-color 0.18s ease",
//           overflowX: "auto",
//           "&::-webkit-scrollbar": { display: "none" },
//         }}
//       >
//         {/* Expand chevron */}
//         <IconButton
//           size="small"
//           onClick={onToggle}
//           disableRipple={false}
//           sx={{
//             width: 28,
//             height: 28,
//             borderRadius: "7px",
//             flexShrink: 0,
//             bgcolor: isOpen ? colors.accentDim : colors.trackOff,
//             color: isOpen ? colors.accent : colors.textSecondary,
//             border: `1px solid ${isOpen ? colors.accentBorder : colors.border}`,
//             "&:hover": {
//               bgcolor: colors.accentDim,
//               color: colors.accent,
//               borderColor: colors.accentBorder,
//             },
//           }}
//         >
//           <Box className={`expand-chevron${isOpen ? " open" : ""}`}>
//             <ChevronRightIcon sx={{ fontSize: 16 }} />
//           </Box>
//         </IconButton>

//         {/* Checkbox */}
//         <Checkbox
//           checked={isSelected}
//           onChange={onSelect}
//           size="small"
//           sx={{
//             p: 0,
//             flexShrink: 0,
//             color: colors.border,
//             "&.Mui-checked": { color: colors.accent },
//           }}
//         />

//         {/* CRQ number badge */}
//         <Box
//           sx={{
//             px: 1.2,
//             py: 0.45,
//             borderRadius: "7px",
//             bgcolor: colors.accentDim,
//             border: `1px solid ${colors.accentBorder}`,
//             flexShrink: 0,
//           }}
//         >
//           <Typography
//             sx={{
//               fontSize: 12,
//               fontWeight: 800,
//               color: colors.accent,
//               fontFamily: "'JetBrains Mono','Fira Code',monospace",
//               letterSpacing: 0.5,
//               lineHeight: 1,
//             }}
//           >
//             {crq.crqNo}
//           </Typography>
//         </Box>

//         {/* Status pills */}
//         <Stack direction="row" spacing={0.7} flexShrink={0}>
//           {crq.crqStatus && (
//             <StatusPill value={crq.crqStatus} colors={colors} />
//           )}
//           {status && status !== crq.crqStatus && (
//             <StatusPill value={status} colors={colors} />
//           )}
//         </Stack>

//         {/* Info cards (flexibly consuming remaining space) */}
//         <Box sx={{ flex: 1, overflow: "hidden", minWidth: 0 }}>
//           <CrqInfoCards crq={crq} colors={colors} />
//         </Box>

//         {/* Task count chip */}
//         {(crq.tasks?.length ?? 0) > 0 && (
//           <Chip
//             icon={<AssignmentOutlinedIcon style={{ fontSize: 12 }} />}
//             label={crq.tasks.length}
//             size="small"
//             sx={{
//               height: 22,
//               fontSize: 11,
//               fontWeight: 700,
//               flexShrink: 0,
//               bgcolor: colors.infoDim,
//               color: colors.info,
//               border: `1px solid ${colors.infoBorder}`,
//               "& .MuiChip-icon": { color: colors.info, ml: 0.7, mr: -0.4 },
//               "& .MuiChip-label": { px: 0.8 },
//             }}
//           />
//         )}

//         {/* Start / Pause button */}
//         <Button
//           variant="outlined"
//           size="small"
//           disabled={isFailed}
//           startIcon={
//             isRunning ? (
//               <StopRoundedIcon sx={{ fontSize: "14px !important" }} />
//             ) : (
//               <PlayArrowRoundedIcon sx={{ fontSize: "14px !important" }} />
//             )
//           }
//           onClick={onStartPause}
//           sx={{
//             flexShrink: 0,
//             height: 30,
//             minWidth: 90,
//             fontSize: 11,
//             fontWeight: 700,
//             letterSpacing: 0.3,
//             borderRadius: "8px",
//             px: 1.5,
//             transition: "all 0.15s ease",
//             ...(isFailed
//               ? {
//                   bgcolor: colors.trackOff,
//                   color: colors.textDim,
//                   borderColor: colors.trackOffBorder,
//                   "&.Mui-disabled": {
//                     bgcolor: colors.trackOff,
//                     color: colors.textDim,
//                     borderColor: colors.trackOffBorder,
//                   },
//                 }
//               : isRunning
//                 ? {
//                     bgcolor: colors.dangerDim,
//                     color: colors.danger,
//                     borderColor: colors.dangerBorder,
//                     "&:hover": {
//                       bgcolor: colors.danger,
//                       color: "#fff",
//                       borderColor: colors.danger,
//                     },
//                   }
//                 : {
//                     bgcolor: colors.successDim,
//                     color: colors.success,
//                     borderColor: colors.successBorder,
//                     "&:hover": {
//                       bgcolor: colors.success,
//                       color: "#fff",
//                       borderColor: colors.success,
//                     },
//                   }),
//           }}
//         >
//           {isFailed ? "Disabled" : isRunning ? "Pause" : "Start"}
//         </Button>
//       </Stack>

//       {/* ── Tasks collapse ── */}
//       <Collapse in={isOpen} timeout="auto" unmountOnExit>
//         <Box
//           sx={{
//             mx: 2,
//             mb: 1.5,
//             borderRadius: colors.radius,
//             border: `1px solid ${colors.border}`,
//             overflow: "hidden",
//           }}
//         >
//           {/* Tasks header bar */}
//           <Stack
//             direction="row"
//             alignItems="center"
//             spacing={1}
//             sx={{
//               px: 1.5,
//               py: 0.85,
//               bgcolor: colors.infoDim,
//               borderBottom: `1px solid ${colors.infoBorder}`,
//             }}
//           >
//             <AssignmentOutlinedIcon sx={{ fontSize: 13, color: colors.info }} />
//             <Typography
//               sx={{ fontSize: 12, fontWeight: 700, color: colors.info }}
//             >
//               Tasks
//             </Typography>
//             <Chip
//               label={crq.tasks?.length ?? 0}
//               size="small"
//               sx={{
//                 height: 18,
//                 fontSize: 10,
//                 fontWeight: 800,
//                 bgcolor: `${colors.info}22`,
//                 color: colors.info,
//                 "& .MuiChip-label": { px: 0.7 },
//               }}
//             />
//           </Stack>

//           <Box sx={{ bgcolor: colors.surface }}>
//             <CrqTaskTable tasks={crq.tasks} colors={colors} />
//           </Box>
//         </Box>
//       </Collapse>
//     </Paper>
//   );
// };

// // ─────────────────────────────────────────────────────────────────────────────
// // Detail panel (extracted for clarity)
// // ─────────────────────────────────────────────────────────────────────────────
// interface DetailPanelProps {
//   plan: any;
//   openCrqs: Record<string, boolean>;
//   selectedCrq: any;
//   colors: Colors;
//   onToggle: (id: string) => void;
//   onSelect: (crq: any) => void;
//   onStartPause: (crq: any) => void;
// }

// const DetailPanel: React.FC<DetailPanelProps> = ({
//   plan,
//   openCrqs,
//   selectedCrq,
//   colors,
//   onToggle,
//   onSelect,
//   onStartPause,
// }) => (
//   <Box
//     sx={{
//       width: "100%",
//       p: 2,
//       bgcolor: colors.isDark ? "rgba(0,0,0,0.20)" : "rgba(248,250,252,0.92)",
//       borderTop: `1px solid ${colors.border}`,
//     }}
//   >
//     {/* Section title */}
//     <Stack direction="row" alignItems="center" spacing={1.2} sx={{ mb: 1.8 }}>
//       <Box
//         sx={{
//           width: 3,
//           height: 16,
//           borderRadius: 99,
//           background: `linear-gradient(180deg, ${colors.accent}, ${colors.info})`,
//         }}
//       />
//       <Typography
//         sx={{
//           fontSize: 11,
//           fontWeight: 800,
//           letterSpacing: 0.55,
//           color: colors.textSecondary,
//           textTransform: "uppercase",
//         }}
//       >
//         CRQs
//       </Typography>
//       <Chip
//         label={plan.crqs?.length ?? 0}
//         size="small"
//         sx={{
//           height: 20,
//           fontSize: 11,
//           fontWeight: 800,
//           bgcolor: colors.accentDim,
//           color: colors.accent,
//           border: `1px solid ${colors.accentBorder}`,
//           "& .MuiChip-label": { px: 0.8 },
//         }}
//       />
//       <Typography
//         sx={{ fontSize: 12, color: colors.textDim, fontFamily: "monospace" }}
//       >
//         › {plan.planNumber}
//       </Typography>
//     </Stack>

//     {/* Empty state */}
//     {!plan.crqs?.length ? (
//       <Box
//         sx={{
//           p: 3,
//           textAlign: "center",
//           border: `1px dashed ${colors.border}`,
//           borderRadius: colors.radiusL,
//         }}
//       >
//         <TableRowsRoundedIcon
//           sx={{ fontSize: 28, mb: 1, color: colors.textDim, opacity: 0.5 }}
//         />
//         <Typography sx={{ fontSize: 13, color: colors.textDim }}>
//           No CRQs found.
//         </Typography>
//       </Box>
//     ) : (
//       plan.crqs.map((crq: any) => (
//         <CrqCard
//           key={crq.crqNo}
//           crq={crq}
//           plan={plan}
//           colors={colors}
//           isOpen={!!openCrqs[crq.crqNo]}
//           isSelected={selectedCrq?.crqNo === crq.crqNo}
//           onToggle={() => onToggle(crq.crqNo)}
//           onSelect={() =>
//             onSelect(
//               selectedCrq?.crqNo === crq.crqNo
//                 ? null
//                 : { ...crq, planNumber: plan.planNumber },
//             )
//           }
//           onStartPause={() => onStartPause(crq)}
//         />
//       ))
//     )}
//   </Box>
// );

// // ─────────────────────────────────────────────────────────────────────────────
// // PlanAndInventoryPage
// // ─────────────────────────────────────────────────────────────────────────────
// export const PlanAndInventoryPage: React.FC = () => {
//   injectGlobalStyles();

//   const theme = useTheme();
//   const colors = useTabColorTokens(theme);

//   const [plansOriginal, setPlansOriginal] = useState(mockCrqResponse.plans);
//   const [openCrqs, setOpenCrqs] = useState<Record<string, boolean>>({});
//   const [selectedCrq, setSelectedCrq] = useState<any | null>(null);
//   const [isFullscreen, setIsFullscreen] = useState(false);
//   const [globalSearchInput, setGlobalSearchInput] = useState("");
//   const [globalSearch, setGlobalSearch] = useState("");

//   // Debounce search
//   useEffect(() => {
//     const t = setTimeout(() => setGlobalSearch(globalSearchInput), 300);
//     return () => clearTimeout(t);
//   }, [globalSearchInput]);

//   // Start / pause
//   const handleStartPauseReview = useCallback((crq: any) => {
//     const isRunning =
//       (crq.impactAnalysisStatus || crq.crqReviewStatus) === "In Progress";
//     setPlansOriginal((prev) =>
//       prev.map((plan) => ({
//         ...plan,
//         crqs: plan.crqs.map((c) =>
//           c.crqNo === crq.crqNo
//             ? {
//                 ...c,
//                 impactAnalysisStatus: isRunning ? "Paused" : "In Progress",
//               }
//             : c,
//         ),
//       })),
//     );
//   }, []);

//   const toggleFullScreen = () => {
//     const elem = document.getElementById("planning-container");
//     if (!document.fullscreenElement) {
//       elem?.requestFullscreen();
//       setIsFullscreen(true);
//     } else {
//       document.exitFullscreen();
//       setIsFullscreen(false);
//     }
//   };

//   const toggleCrq = (id: string) =>
//     setOpenCrqs((prev) => ({ ...prev, [id]: !prev[id] }));

//   // Filtered data
//   const filteredPlans = useMemo(() => {
//     if (!globalSearch) return plansOriginal;
//     const g = globalSearch.trim();
//     return plansOriginal
//       .map((plan: any) => {
//         const match = deepSearch(plan, g);
//         const crqs = (plan.crqs || []).filter((c: any) => deepSearch(c, g));
//         if (!match && !crqs.length) return null;
//         return { ...plan, crqs: g ? crqs : plan.crqs };
//       })
//       .filter(Boolean);
//   }, [plansOriginal, globalSearch]);

//   // Column definitions
//   const columns = useMemo<MRT_ColumnDef<any>[]>(
//     () => [
//       {
//         accessorKey: "planNumber",
//         header: "Plan Number",
//         size: 200,
//         Cell: ({ cell }) => (
//           <Typography
//             sx={{
//               fontSize: 12,
//               fontWeight: 800,
//               fontFamily: "monospace",
//               color: colors.accent,
//               letterSpacing: 0.4,
//             }}
//           >
//             {cell.getValue<string>()}
//           </Typography>
//         ),
//       },
//       {
//         accessorKey: "planType",
//         header: "Plan Type",
//         size: 180,
//         Cell: ({ cell }) => (
//           <Chip
//             label={cell.getValue<string>()}
//             size="small"
//             sx={{
//               height: 20,
//               fontSize: 11,
//               fontWeight: 600,
//               bgcolor: colors.successDim,
//               color: colors.success,
//               border: `1px solid ${colors.successBorder}`,
//             }}
//           />
//         ),
//       },
//       {
//         accessorKey: "description",
//         header: "Description",
//         size: 400,
//         Cell: ({ cell }) => (
//           <Typography
//             sx={{ fontSize: 12, color: colors.textSecondary, lineHeight: 1.5 }}
//           >
//             {cell.getValue<string>()}
//           </Typography>
//         ),
//       },
//     ],
//     [colors],
//   );

//   // Top toolbar
//   const renderTopToolbarCustomActions = () => (
//     <Stack direction="row" alignItems="center" spacing={1.2} flexWrap="wrap">
//       {/* Search box */}
//       <TextField
//         size="small"
//         placeholder="Search plans, CRQs, tasks…"
//         value={globalSearchInput}
//         onChange={(e) => setGlobalSearchInput(e.target.value)}
//         InputProps={{
//           startAdornment: (
//             <InputAdornment position="start">
//               <SearchRoundedIcon sx={{ fontSize: 15, color: colors.textDim }} />
//             </InputAdornment>
//           ),
//           sx: {
//             fontSize: 13,
//             height: 34,
//             borderRadius: "9px",
//             bgcolor: colors.trackOff,
//             color: colors.textPrimary,
//             "& fieldset": { borderColor: colors.border },
//             "&:hover fieldset": {
//               borderColor: `${colors.accentBorder} !important`,
//             },
//             "&.Mui-focused fieldset": {
//               borderColor: `${colors.accent} !important`,
//               borderWidth: "1.5px !important",
//             },
//             "& input::placeholder": { color: colors.textDim, opacity: 1 },
//           },
//         }}
//         sx={{ width: 260 }}
//       />

//       {/* Fullscreen toggle */}
//       <Tooltip title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}>
//         <IconButton
//           size="small"
//           onClick={toggleFullScreen}
//           sx={{
//             width: 34,
//             height: 34,
//             borderRadius: "9px",
//             bgcolor: colors.trackOff,
//             color: colors.textSecondary,
//             border: `1px solid ${colors.border}`,
//             transition: "all 0.15s ease",
//             "&:hover": {
//               bgcolor: colors.accentDim,
//               color: colors.accent,
//               borderColor: colors.accentBorder,
//             },
//           }}
//         >
//           {isFullscreen ? (
//             <FullscreenExitIcon sx={{ fontSize: 17 }} />
//           ) : (
//             <FullscreenIcon sx={{ fontSize: 17 }} />
//           )}
//         </IconButton>
//       </Tooltip>

//       {/* Summary chips */}
//       <Stack direction="row" spacing={0.8}>
//         <Chip
//           label={`${filteredPlans.length} plans`}
//           size="small"
//           sx={{
//             height: 24,
//             fontSize: 11,
//             fontWeight: 700,
//             bgcolor: colors.accentDim,
//             color: colors.accent,
//             border: `1px solid ${colors.accentBorder}`,
//           }}
//         />
//         <Chip
//           label={`${filteredPlans.reduce((a: number, p: any) => a + (p.crqs?.length || 0), 0)} CRQs`}
//           size="small"
//           sx={{
//             height: 24,
//             fontSize: 11,
//             fontWeight: 700,
//             bgcolor: colors.infoDim,
//             color: colors.info,
//             border: `1px solid ${colors.infoBorder}`,
//           }}
//         />
//       </Stack>
//     </Stack>
//   );

//   // MRT table instance
//   const table = useMaterialReactTable({
//     columns,
//     data: filteredPlans,
//     enableSorting: true,
//     enablePagination: true,
//     renderDetailPanel: ({ row }) => (
//       <DetailPanel
//         plan={row.original}
//         openCrqs={openCrqs}
//         selectedCrq={selectedCrq}
//         colors={colors}
//         onToggle={toggleCrq}
//         onSelect={setSelectedCrq}
//         onStartPause={handleStartPauseReview}
//       />
//     ),
//     renderTopToolbarCustomActions,
//     initialState: { density: "compact" },
//     muiDetailPanelProps: { sx: { padding: 0 } },
//     muiTablePaperProps: {
//       elevation: 0,
//       sx: {
//         border: `1px solid ${colors.border}`,
//         borderRadius: colors.radiusXL,
//         overflow: "hidden",
//         bgcolor: colors.surface,
//       },
//     },
//     muiTableHeadCellProps: {
//       sx: {
//         fontSize: "11px !important",
//         fontWeight: "700 !important",
//         letterSpacing: "0.55px !important",
//         textTransform: "uppercase !important",
//         color: `${colors.textSecondary} !important`,
//         bgcolor: colors.isDark
//           ? "rgba(255,255,255,0.025)"
//           : "rgba(248,250,252,0.95)",
//         borderBottom: `1px solid ${colors.border} !important`,
//         py: "10px !important",
//       },
//     },
//     muiTableBodyCellProps: {
//       sx: {
//         fontSize: 13,
//         color: colors.textPrimary,
//         borderBottom: `1px solid ${colors.border}`,
//         py: "8px !important",
//       },
//     },
//     muiTableBodyRowProps: {
//       sx: {
//         transition: "background 0.12s ease",
//         cursor: "pointer",
//         "&:hover td": {
//           bgcolor: colors.isDark
//             ? "rgba(99,102,241,0.04)"
//             : "rgba(99,102,241,0.025)",
//         },
//       },
//     },
//     muiTopToolbarProps: {
//       sx: {
//         bgcolor: colors.surface,
//         borderBottom: `1px solid ${colors.border}`,
//         px: 2,
//         py: 1,
//         minHeight: 52,
//       },
//     },
//     muiBottomToolbarProps: {
//       sx: {
//         bgcolor: colors.isDark
//           ? "rgba(255,255,255,0.01)"
//           : "rgba(248,250,252,0.7)",
//         borderTop: `1px solid ${colors.border}`,
//         minHeight: 44,
//       },
//     },
//     muiTableContainerProps: {
//       className: "plan-table-scroll",
//       sx: {
//         maxHeight: "calc(100vh - 280px)",
//         "&::-webkit-scrollbar-thumb": {
//           backgroundColor: colors.isDark ? "#1F2937" : "#CBD5E1",
//         },
//       },
//     },
//   });

//   return (
//     <Box
//       id="planning-container"
//       sx={{
//         p: { xs: 1.5, sm: 2, md: 2.5 },
//         bgcolor: colors.bg,
//         minHeight: "100%",
//       }}
//     >
//       {/* ── Page header ── */}
//       <Stack
//         direction={{ xs: "column", sm: "row" }}
//         alignItems={{ xs: "flex-start", sm: "center" }}
//         justifyContent="space-between"
//         sx={{ mb: 2.5 }}
//         spacing={1}
//       >
//         <Stack direction="row" alignItems="center" spacing={1.5}>
//           {/* Gradient accent bar */}
//           <Box
//             sx={{
//               width: 4,
//               height: 26,
//               borderRadius: 99,
//               background: `linear-gradient(180deg, ${colors.accent} 0%, ${colors.info} 100%)`,
//               flexShrink: 0,
//             }}
//           />
//           <Box>
//             <Typography
//               sx={{
//                 fontSize: { xs: 18, sm: 22 },
//                 fontWeight: 800,
//                 color: colors.textPrimary,
//                 letterSpacing: -0.6,
//                 lineHeight: 1.2,
//               }}
//             >
//               Plan &amp; Inventory
//             </Typography>
//             <Typography sx={{ fontSize: 12, color: colors.textDim, mt: 0.3 }}>
//               Change Request Tracking &amp; Execution
//             </Typography>
//           </Box>
//         </Stack>
//       </Stack>

//       {/* ── Table ── */}
//       <MaterialReactTable table={table} />
//     </Box>
//   );
// };
