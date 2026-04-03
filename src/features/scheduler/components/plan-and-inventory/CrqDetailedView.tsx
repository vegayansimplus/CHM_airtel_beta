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

import { useTabColorTokens } from "../../../../style/theme";
import { useGetImpactAnalysisQuery, useUpdateImpactAnalysisStatusMutation } from "../../api/schedulerApiSlice";
import type { Plan } from "../../types/crqWorflow.types";
import { deepSearch } from "../../util/stringUtils";
import { CrqCard } from "./CrqCard";

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
// DetailPanel Wrapper
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
      bgcolor: colors.accentDim,
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
        CRQ DETAILS
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
          isOpen={!!openCrqs[crq.crqNo]} // Controls if tasks expand
          isSelected={false} // Selection checkbox is ignored in detail view
          onToggle={() => onToggle(crq.crqNo)}
          onSelect={() => {}} // Disabled in this view
          onStartPause={() => onStartPause(crq)}
        />
      ))
    )}
  </Box>
);

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
export const CrqDetailedView: React.FC = () => {
  const theme = useTheme();
  const colors = useTabColorTokens(theme);
  const { crqNo } = useParams<{ crqNo: string }>();
  const [updateImpactAnalysisStatus] = useUpdateImpactAnalysisStatusMutation();

  // ─── ALL HOOKS DECLARED FIRST (unconditionally) ───

  // State hooks
  const [openCrqs, setOpenCrqs] = useState<Record<string, boolean>>({
    [crqNo as string]: true,
  });
  const [singlePlan, setSinglePlan] = useState<Plan[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [globalSearchInput, setGlobalSearchInput] = useState("");
  const [globalSearch, setGlobalSearch] = useState("");

  // Query hook
  const {
    data: impactData,
    // isLoading,
    isError,
    error,
  } = useGetImpactAnalysisQuery({
    domainId: 1,
    subDomainId: 1,
  });

  // Effect hooks
  useEffect(() => {
    if (!impactData?.plans?.length) {
      setSinglePlan([]);
      return;
    }

    const parentPlan = impactData.plans.find((p) =>
      p.crqs?.some((c) => c.crqNo === crqNo),
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

  // Callback hooks
  const handleStartPauseReview = useCallback(
    async (crq: any) => {
      try {
        const isRunning =
          (crq.impactAnalysisStatus || crq.crqReviewStatus) === "In Progress";
        const action = isRunning ? "pause" : "start";

        // Call API to update status
        const response = await updateImpactAnalysisStatus({
          crqNo: crq.crqNo,
          crqId: crq.crqId,
          action,
        }).unwrap();

        // Show success toast
        toast.success(response?.message || "Updated successfully.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });

        // Update local state
        setSinglePlan((prev) =>
          prev.map((plan) => ({
            ...plan,
            crqs: plan.crqs.map((c: any) =>
              c.crqNo === crq.crqNo
                ? {
                    ...c,
                    impactAnalysisStatus: isRunning ? "Paused" : "In Progress",
                  }
                : c,
            ),
          })),
        );
      } catch (error) {
        console.error("Failed to update impact analysis status:", error);
        toast.error(
          (error as any)?.data?.message || "Failed to update status. Please try again.",
          {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          },
        );
      }
    },
    [updateImpactAnalysisStatus],
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
    (id: string) => setOpenCrqs((prev) => ({ ...prev, [id]: !prev[id] })),
    [],
  );

  // Memo hooks
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

  const renderTopToolbarCustomActions = useCallback(
    () => (
      <Stack direction="row" alignItems="center" spacing={1.2} flexWrap="wrap">
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
    [globalSearchInput, toggleFullScreen, isFullscreen, crqNo, colors],
  );

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
      sx: { fontSize: 13, borderBottom: `1px solid ${colors.border}` },
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

  // ─── EARLY RETURNS (after all hooks) ───

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
