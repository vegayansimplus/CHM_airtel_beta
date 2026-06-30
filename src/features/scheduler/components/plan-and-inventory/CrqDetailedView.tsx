import React, { useCallback, useMemo, useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useParams } from "react-router";
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Stack,
  TextField,
  Chip,
  InputAdornment,
  useTheme,
  GlobalStyles,
  Collapse,
  Checkbox,
} from "@mui/material";
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from "material-react-table";

// Icons
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import TableRowsRoundedIcon from "@mui/icons-material/TableRowsRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import PauseRoundedIcon from "@mui/icons-material/PauseRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";

import { useTabColorTokens } from "../../../../style/theme";
import { useGetCrqReviewQuery } from "../../api/crqreviewApiSlice";
import { useUpdateImpactAnalysisStatusMutation } from "../../api/schedulerApiSlice";
import type { Plan } from "../../types/crqWorkflow.types";
import { deepSearch } from "../../util/stringUtils";

// ─────────────────────────────────────────────────────────────────────────────
// Global Styles
// ─────────────────────────────────────────────────────────────────────────────
const PlanPageGlobalStyles = (
  <GlobalStyles
    styles={{
      "@keyframes fadeSlideIn": {
        from: { opacity: 0, transform: "translateY(5px)" },
        to: { opacity: 1, transform: "translateY(0)" },
      },
      ".crq-card": { animation: "fadeSlideIn 0.22s ease both" },
      ".expand-chevron": {
        transition: "transform 0.22s cubic-bezier(.4,0,.2,1)",
        display: "flex",
      },
      ".expand-chevron.open": { transform: "rotate(90deg)" },
      ".plan-table-scroll::-webkit-scrollbar": { height: "6px", width: "6px" },
      ".plan-table-scroll::-webkit-scrollbar-track": {
        background: "transparent",
      },
      ".plan-table-scroll::-webkit-scrollbar-thumb": { borderRadius: "99px" },
    }}
  />
);

type Colors = ReturnType<typeof useTabColorTokens>;

// ─────────────────────────────────────────────────────────────────────────────
// StatusPill — reusable status badge with dot indicator
// ─────────────────────────────────────────────────────────────────────────────
interface StatusPillProps {
  status: string;
  colors: Colors;
}

const StatusPill: React.FC<StatusPillProps> = ({ status, colors }) => {
  const s = (status ?? "").toLowerCase();

  const config: Record<
    string,
    { bg: string; color: string; border: string; dot?: string }
  > = {
    "in progress": {
      bg: colors.warningDim ?? colors.accentDim,
      color: colors.warning ?? colors.accent,
      border: colors.warningBorder ?? colors.accentBorder,
      dot: colors.warning ?? colors.accent,
    },
    paused: {
      bg: colors.accentDim,
      color: colors.accent,
      border: colors.accentBorder,
      dot: colors.accent,
    },
    "not started": {
      bg: colors.isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
      color: colors.textSecondary,
      border: colors.border,
    },
    completed: {
      bg: colors.successDim,
      color: colors.success,
      border: colors.successBorder,
      dot: colors.success,
    },
  };

  const style = config[s] ?? config["not started"];

  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.6,
        px: 1,
        py: "3px",
        borderRadius: "99px",
        bgcolor: style.bg,
        color: style.color,
        border: `1px solid ${style.border}`,
        fontSize: 11,
        fontWeight: 700,
        lineHeight: 1,
        whiteSpace: "nowrap",
      }}
    >
      {style.dot && (
        <FiberManualRecordIcon sx={{ fontSize: 6, color: style.dot }} />
      )}
      {status ?? "—"}
    </Box>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MetaCell — single labeled field in the info grid
// ─────────────────────────────────────────────────────────────────────────────
interface MetaCellProps {
  label: string;
  children: React.ReactNode;
  colors: Colors;
  mono?: boolean;
}

const MetaCell: React.FC<MetaCellProps> = ({
  label,
  children,
  colors,
  mono,
}) => (
  <Box sx={{ bgcolor: colors.surface, p: "10px 14px" }}>
    <Typography
      sx={{
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: 0.6,
        color: colors.textDim,
        textTransform: "uppercase",
        mb: 0.6,
      }}
    >
      {label}
    </Typography>
    <Box
      sx={{
        fontSize: 12,
        fontWeight: 500,
        color: colors.textPrimary,
        fontFamily: mono ? "monospace" : "inherit",
        lineHeight: 1.4,
      }}
    >
      {children}
    </Box>
  </Box>
);

// ─────────────────────────────────────────────────────────────────────────────
// TasksTable — renders tasks inside a CRQ card
// ─────────────────────────────────────────────────────────────────────────────
interface TasksTableProps {
  tasks: any[];
  colors: Colors;
}

const TASK_COLUMNS = [
  { key: "taskId", label: "Task ID", mono: true },
  { key: "neLabel", label: "NE Label", mono: true },
  { key: "planActivityDetails", label: "Plan Activity Details" },
  { key: "activitySequence", label: "Activity Sequence" },
  { key: "taskProfileType", label: "Task Profile Type" },
  { key: "locationCode", label: "Location Code" },
  { key: "taskActivity", label: "Task Activity" },
];

const TasksTable: React.FC<TasksTableProps> = ({ tasks, colors }) => (
  <Box sx={{ borderTop: `1px solid ${colors.border}` }}>
    {/* Tasks section header */}
    <Stack
      direction="row"
      alignItems="center"
      spacing={0.8}
      sx={{
        px: 2,
        py: "9px",
        bgcolor: colors.isDark
          ? "rgba(255,255,255,0.03)"
          : "rgba(0,0,0,0.02)",
        borderBottom: `1px solid ${colors.border}`,
      }}
    >
      <TableRowsRoundedIcon sx={{ fontSize: 13, color: colors.textDim }} />
      <Typography
        sx={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: 0.6,
          color: colors.textDim,
          textTransform: "uppercase",
        }}
      >
        Tasks
      </Typography>
      <Chip
        label={tasks.length}
        size="small"
        sx={{
          height: 18,
          fontSize: 10,
          fontWeight: 700,
          bgcolor: colors.isDark
            ? "rgba(255,255,255,0.06)"
            : "rgba(0,0,0,0.05)",
          color: colors.textSecondary,
          border: `1px solid ${colors.border}`,
        }}
      />
    </Stack>

    {/* Scrollable table */}
    <Box sx={{ overflowX: "auto" }}>
      <Box
        component="table"
        sx={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: 12,
          minWidth: 900,
        }}
      >
        <Box component="thead">
          <Box component="tr">
            {TASK_COLUMNS.map((col) => (
              <Box
                component="th"
                key={col.key}
                sx={{
                  textAlign: "left",
                  px: 2,
                  py: "8px",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: 0.5,
                  textTransform: "uppercase",
                  color: colors.textDim,
                  bgcolor: colors.isDark
                    ? "rgba(255,255,255,0.025)"
                    : "rgba(248,250,252,0.95)",
                  borderBottom: `1px solid ${colors.border}`,
                  whiteSpace: "nowrap",
                }}
              >
                {col.label}
              </Box>
            ))}
          </Box>
        </Box>
        <Box component="tbody">
          {tasks.map((task: any, idx: number) => (
            <Box
              component="tr"
              key={task.taskId ?? idx}
              sx={{
                "&:hover td, &:hover th": {
                  bgcolor: colors.isDark
                    ? "rgba(255,255,255,0.03)"
                    : "rgba(0,0,0,0.02)",
                },
                "&:last-child td": { borderBottom: "none" },
              }}
            >
              {TASK_COLUMNS.map((col) => (
                <Box
                  component="td"
                  key={col.key}
                  sx={{
                    px: 2,
                    py: "9px",
                    borderBottom: `1px solid ${colors.border}`,
                    color: colors.textSecondary,
                    verticalAlign: "middle",
                    whiteSpace: "nowrap",
                  }}
                >
                  {col.key === "taskProfileType" ? (
                    // Split comma-separated profile types into chips
                    <Stack direction="row" spacing={0.5} flexWrap="wrap">
                      {String(task[col.key] ?? "")
                        .split(",")
                        .map((t: string) => t.trim())
                        .filter(Boolean)
                        .map((t: string) => (
                          <Chip
                            key={t}
                            label={t}
                            size="small"
                            sx={{
                              height: 18,
                              fontSize: 10,
                              fontWeight: 600,
                              bgcolor: colors.isDark
                                ? "rgba(255,255,255,0.06)"
                                : "rgba(0,0,0,0.05)",
                              color: colors.textSecondary,
                              border: `1px solid ${colors.border}`,
                            }}
                          />
                        ))}
                    </Stack>
                  ) : (
                    <Typography
                      sx={{
                        fontSize: 12,
                        color: colors.textSecondary,
                        fontFamily: col.mono ? "monospace" : "inherit",
                      }}
                    >
                      {task[col.key] ?? "—"}
                    </Typography>
                  )}
                </Box>
              ))}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  </Box>
);

// ─────────────────────────────────────────────────────────────────────────────
// InlineCrqCard — self-contained CRQ card with expand/collapse
// ─────────────────────────────────────────────────────────────────────────────
interface InlineCrqCardProps {
  crq: any;
  plan: any;
  colors: Colors;
  isOpen: boolean;
  onToggle: () => void;
  onStartPause: () => void;
}

const InlineCrqCard: React.FC<InlineCrqCardProps> = ({
  crq,
  plan,
  colors,
  isOpen,
  onToggle,
  onStartPause,
}) => {
  const status = crq.impactAnalysisStatus ?? crq.crqReviewStatus ?? "";
  const isRunning = status.toLowerCase() === "in progress";

  const metaFields = [
    { label: "Start Date", value: crq.startDate ?? "—", mono: true },
    { label: "End Date", value: crq.endDate ?? "—", mono: true },
    {
      label: "CRQ Status",
      value: <StatusPill status={crq.crqStatus ?? "—"} colors={colors} />,
    },
    {
      label: "CRQ Review Status",
      value: (
        <StatusPill status={crq.crqReviewStatus ?? "—"} colors={colors} />
      ),
    },
    {
      label: "Review Start",
      value: crq.reviewStart ? (
        <Typography sx={{ fontSize: 12, fontFamily: "monospace" }}>
          {crq.reviewStart}
        </Typography>
      ) : (
        <Typography sx={{ fontSize: 12, color: colors.textDim }}>—</Typography>
      ),
    },
    {
      label: "Review End",
      value: crq.reviewEnd ? (
        <Typography sx={{ fontSize: 12, fontFamily: "monospace" }}>
          {crq.reviewEnd}
        </Typography>
      ) : (
        <Typography sx={{ fontSize: 12, color: colors.textDim }}>—</Typography>
      ),
    },
  ];

  return (
    <Box
      className="crq-card"
      sx={{
        bgcolor: colors.surface,
        border: `1px solid ${colors.border}`,
        borderRadius: "12px",
        overflow: "hidden",
        mb: 1.5,
        transition: "box-shadow 0.18s ease",
        "&:hover": {
          boxShadow: colors.isDark
            ? "0 2px 12px rgba(0,0,0,0.35)"
            : "0 2px 12px rgba(0,0,0,0.08)",
        },
      }}
    >
      {/* ── Card Header ── */}
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        sx={{
          px: 2,
          py: "10px",
          cursor: "pointer",
          userSelect: "none",
          "&:hover": {
            bgcolor: colors.isDark
              ? "rgba(255,255,255,0.03)"
              : "rgba(0,0,0,0.02)",
          },
        }}
        onClick={onToggle}
      >
        {/* Chevron */}
        <Box
          className={`expand-chevron${isOpen ? " open" : ""}`}
          sx={{ color: colors.textDim, flexShrink: 0 }}
        >
          <ChevronRightRoundedIcon sx={{ fontSize: 18 }} />
        </Box>

        {/* Checkbox — stop propagation so it doesn't toggle */}
        <Checkbox
          size="small"
          onClick={(e) => e.stopPropagation()}
          sx={{ p: 0, "& svg": { fontSize: 16 } }}
        />

        {/* CRQ Number */}
        <Typography
          sx={{
            fontSize: 13,
            fontWeight: 700,
            fontFamily: "monospace",
            color: colors.accent,
            letterSpacing: 0.3,
            flexShrink: 0,
          }}
        >
          {crq.crqNo}
        </Typography>

        {/* Spacer */}
        <Box sx={{ flex: 1 }} />

        {/* Status pill (visible in header for quick scan) */}
        <StatusPill status={status || crq.crqStatus || "—"} colors={colors} />

        {/* Start / Pause button */}
        <Tooltip title={isRunning ? "Pause Review" : "Start Review"}>
          <Box
            component="button"
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              onStartPause();
            }}
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.6,
              px: 1.4,
              py: "5px",
              fontSize: 11,
              fontWeight: 700,
              borderRadius: "8px",
              border: `1px solid ${colors.border}`,
              bgcolor: isRunning ? colors.warningDim ?? colors.accentDim : colors.successDim,
              color: isRunning ? colors.warning ?? colors.accent : colors.success,
              cursor: "pointer",
              transition: "all 0.15s ease",
              "&:hover": {
                bgcolor: isRunning ? colors.warning ?? colors.accent : colors.success,
                color: "#fff",
                borderColor: "transparent",
              },
            }}
          >
            {isRunning ? (
              <PauseRoundedIcon sx={{ fontSize: 13 }} />
            ) : (
              <PlayArrowRoundedIcon sx={{ fontSize: 13 }} />
            )}
            {isRunning ? "Pause" : "Start"}
          </Box>
        </Tooltip>

        {/* Open detail icon */}
        <Tooltip title="View full details">
          <IconButton
            size="small"
            onClick={(e) => e.stopPropagation()}
            sx={{
              width: 28,
              height: 28,
              borderRadius: "8px",
              bgcolor: colors.isDark
                ? "rgba(255,255,255,0.05)"
                : "rgba(0,0,0,0.04)",
              color: colors.textDim,
              border: `1px solid ${colors.border}`,
              "&:hover": {
                bgcolor: colors.accentDim,
                color: colors.accent,
                borderColor: colors.accentBorder,
              },
            }}
          >
            <OpenInNewRoundedIcon sx={{ fontSize: 14 }} />
          </IconButton>
        </Tooltip>
      </Stack>

      {/* ── Collapsible body ── */}
      <Collapse in={isOpen} timeout={200}>
        {/* Meta info grid — responsive, no horizontal scroll */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "1px",
            background: colors.border,          // gap color via bg bleed
            borderTop: `1px solid ${colors.border}`,
          }}
        >
          {metaFields.map(({ label, value, mono }) => (
            <MetaCell key={label} label={label} colors={colors} mono={mono}>
              {typeof value === "string" ? (
                <Typography
                  sx={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: colors.textPrimary,
                    fontFamily: mono ? "monospace" : "inherit",
                  }}
                >
                  {value}
                </Typography>
              ) : (
                value
              )}
            </MetaCell>
          ))}
        </Box>

        {/* Tasks table */}
        {crq.tasks?.length > 0 ? (
          <TasksTable tasks={crq.tasks} colors={colors} />
        ) : (
          <Box
            sx={{
              p: 3,
              textAlign: "center",
              borderTop: `1px solid ${colors.border}`,
            }}
          >
            <TableRowsRoundedIcon
              sx={{ fontSize: 24, mb: 1, color: colors.textDim, opacity: 0.4 }}
            />
            <Typography sx={{ fontSize: 12, color: colors.textDim }}>
              No tasks found.
            </Typography>
          </Box>
        )}
      </Collapse>
    </Box>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// DetailPanel — expanded row rendered by MaterialReactTable
// ─────────────────────────────────────────────────────────────────────────────
interface DetailPanelProps {
  plan: any;
  openCrqs: Record<string, boolean>;
  colors: Colors;
  onToggle: (id: string) => void;
  onStartPause: (crq: any) => void;
}

const DetailPanel: React.FC<DetailPanelProps> = ({
  plan,
  openCrqs,
  colors,
  onToggle,
  onStartPause,
}) => (
  <Box
    sx={{
      width: "100%",
      p: 2,
      bgcolor: colors.isDark
        ? "rgba(255,255,255,0.02)"
        : "rgba(248,250,252,0.8)",
      borderTop: `1px solid ${colors.border}`,
    }}
  >
    {/* Section heading */}
    <Stack direction="row" alignItems="center" spacing={1.2} sx={{ mb: 2 }}>
      <Box
        sx={{
          width: 3,
          height: 16,
          borderRadius: "2px",
          bgcolor: colors.accent,
          flexShrink: 0,
        }}
      />
      <Typography
        sx={{
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: 0.7,
          color: colors.textDim,
          textTransform: "uppercase",
        }}
      >
        CRQ Details
      </Typography>
      <Chip
        label={plan.crqs?.length ?? 0}
        size="small"
        sx={{
          height: 18,
          fontSize: 10,
          fontWeight: 800,
          bgcolor: colors.accentDim,
          color: colors.accent,
          border: `1px solid ${colors.accentBorder}`,
        }}
      />
      <Typography
        sx={{
          fontSize: 11,
          color: colors.textDim,
          fontFamily: "monospace",
        }}
      >
        › {plan.planNumber}
      </Typography>
    </Stack>

    {/* Empty state */}
    {!plan.crqs?.length ? (
      <Box
        sx={{
          p: 4,
          textAlign: "center",
          border: `1px dashed ${colors.border}`,
          borderRadius: "12px",
        }}
      >
        <TableRowsRoundedIcon
          sx={{ fontSize: 28, mb: 1, color: colors.textDim, opacity: 0.4 }}
        />
        <Typography sx={{ fontSize: 13, color: colors.textDim }}>
          No CRQs found.
        </Typography>
      </Box>
    ) : (
      plan.crqs.map((crq: any) => (
        <InlineCrqCard
          key={crq.crqNo}
          crq={crq}
          plan={plan}
          colors={colors}
          isOpen={!!openCrqs[crq.crqNo]}
          onToggle={() => onToggle(crq.crqNo)}
          onStartPause={() => onStartPause(crq)}
        />
      ))
    )}
  </Box>
);

// ─────────────────────────────────────────────────────────────────────────────
// Main Component — CrqDetailedView
// ─────────────────────────────────────────────────────────────────────────────
export const CrqDetailedView: React.FC = () => {
  const theme = useTheme();
  const colors = useTabColorTokens(theme);
  const { crqNo } = useParams<{ crqNo: string }>();
  const [updateImpactAnalysisStatus] = useUpdateImpactAnalysisStatusMutation();

  // ─── State ───
  const [openCrqs, setOpenCrqs] = useState<Record<string, boolean>>({
    [crqNo as string]: true,
  });
  const [singlePlan, setSinglePlan] = useState<Plan[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [globalSearchInput, setGlobalSearchInput] = useState("");
  const [globalSearch, setGlobalSearch] = useState("");

  // ─── Query ───
  const {
    data: impactData,
    isError,
    error,
  } = useGetCrqReviewQuery({
    domainId: 1,
    subDomainId: 1,
  });

  // ─── Effects ───
  useEffect(() => {
    if (!impactData?.plans?.length) {
      setSinglePlan([]);
      return;
    }
    const parentPlan = impactData.plans.find((p) =>
      p.crqs?.some((c) => c.crqNo === crqNo)
    );
    if (parentPlan) {
      const isolatedPlan = {
        ...parentPlan,
        crqs: parentPlan.crqs.filter((c) => c.crqNo === crqNo),
      };
      setSinglePlan([isolatedPlan]);
    } else {
      setSinglePlan([]);
    }
  }, [impactData, crqNo]);

  useEffect(() => {
    const t = setTimeout(() => setGlobalSearch(globalSearchInput), 300);
    return () => clearTimeout(t);
  }, [globalSearchInput]);

  // ─── Callbacks ───
  const handleStartPauseReview = useCallback(
    async (crq: any) => {
      try {
        const isRunning =
          (crq.impactAnalysisStatus ?? crq.crqReviewStatus ?? "").toLowerCase() ===
          "in progress";
        const action = isRunning ? "pause" : "start";

        const response = await updateImpactAnalysisStatus({
          crqNo: crq.crqNo,
          crqId: crq.crqId,
          action,
        }).unwrap();

        toast.success(response?.message || "Updated successfully.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });

        setSinglePlan((prev) =>
          prev.map((plan) => ({
            ...plan,
            crqs: plan.crqs.map((c: any) =>
              c.crqNo === crq.crqNo
                ? {
                    ...c,
                    impactAnalysisStatus: isRunning ? "Paused" : "In Progress",
                  }
                : c
            ),
          }))
        );
      } catch (err) {
        console.error("Failed to update impact analysis status:", err);
        toast.error(
          (err as any)?.data?.message ||
            "Failed to update status. Please try again.",
          {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          }
        );
      }
    },
    [updateImpactAnalysisStatus]
  );

  const toggleFullScreen = useCallback(() => {
    const elem = document.getElementById("detailed-planning-container");
    if (!document.fullscreenElement) {
      elem?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  const toggleCrq = useCallback(
    (id: string) =>
      setOpenCrqs((prev) => ({ ...prev, [id]: !prev[id] })),
    []
  );

  // ─── Derived data ───
  const filteredPlans = useMemo(() => {
    if (!globalSearch) return singlePlan;
    const g = globalSearch.trim();
    return singlePlan
      .map((plan: any) => {
        const match = deepSearch(plan, g);
        const crqs = (plan.crqs || []).filter((c: any) => deepSearch(c, g));
        if (!match && !crqs.length) return null;
        return { ...plan, crqs: g ? crqs : plan.crqs };
      })
      .filter(Boolean);
  }, [singlePlan, globalSearch]);

  // ─── Table columns ───
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
            sx={{
              fontSize: 12,
              color: colors.textSecondary,
              lineHeight: 1.5,
            }}
          >
            {cell.getValue<string>()}
          </Typography>
        ),
      },
    ],
    [colors]
  );

  // ─── Toolbar ───
  const renderTopToolbarCustomActions = useCallback(
    () => (
      <Stack
        direction="row"
        alignItems="center"
        spacing={1.2}
        flexWrap="wrap"
      >
        <TextField
          size="small"
          placeholder="Search tasks, details..."
          value={globalSearchInput}
          onChange={(e) => setGlobalSearchInput(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon
                  sx={{ fontSize: 15, color: colors.textDim }}
                />
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
            label={`Target CRQ: ${crqNo}`}
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
        </Stack>
      </Stack>
    ),
    [globalSearchInput, toggleFullScreen, isFullscreen, crqNo, colors]
  );

  // ─── Table instance ───
  const table = useMaterialReactTable({
    columns,
    data: filteredPlans,
    enableSorting: false,
    enablePagination: false,
    renderDetailPanel: ({ row }) => (
      <DetailPanel
        plan={row.original}
        openCrqs={openCrqs}
        colors={colors}
        onToggle={toggleCrq}
        onStartPause={handleStartPauseReview}
      />
    ),
    renderTopToolbarCustomActions,
    initialState: {
      density: "compact",
      expanded: true,
    },
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
        color: `${colors.textSecondary} !important`,
        bgcolor: colors.isDark
          ? "rgba(255,255,255,0.025)"
          : "rgba(248,250,252,0.95)",
        borderBottom: `1px solid ${colors.border} !important`,
      },
    },
    muiTableBodyCellProps: {
      sx: {
        fontSize: 13,
        borderBottom: `1px solid ${colors.border}`,
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
    muiBottomToolbarProps: { sx: { display: "none" } },
  });

  // ─── Early returns (after all hooks) ───
  if (isError) {
    return (
      <Box id="detailed-planning-container" sx={{ p: 3 }}>
        <Typography color="error">
          Failed to load CRQ details.{" "}
          {(error as any)?.error || "Please refresh."}
        </Typography>
      </Box>
    );
  }

  if (!singlePlan.length) {
    return (
      <Box id="detailed-planning-container" sx={{ p: 3 }}>
        <Typography sx={{ color: colors.textPrimary }}>
          No CRQ found for {crqNo}.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      id="detailed-planning-container"
      sx={{ p: { xs: 1.5, sm: 2, md: 1 }, minHeight: "100%" }}
    >
      {PlanPageGlobalStyles}
      <MaterialReactTable table={table} />
    </Box>
  );
};