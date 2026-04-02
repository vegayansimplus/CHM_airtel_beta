import React, { useCallback, useMemo, useState, useEffect } from "react";
import { toast } from "react-toastify";
import FilterSvg from "../../../../assets/svg/NoDataFound.svg";
// import RateReviewRoundedIcon from "@mui/icons-material/RateReviewRounded";

import VisibilityIcon from "@mui/icons-material/Visibility";
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Stack,
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
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import TableRowsRoundedIcon from "@mui/icons-material/TableRowsRounded";

import { useTabColorTokens } from "../../../../style/theme";
import { useGetImpactAnalysisQuery, useUpdateImpactAnalysisStatusMutation } from "../../api/schedulerApiSlice";
import type { Plan } from "../../types/crqWorflow.types";
import { deepSearch } from "../../util/stringUtils";
import { CrqCard } from "./CrqCard";
import CustomActionButton from "../../../../components/common/CustomActionButton";
import { PlanInvDialog } from "../dialog/plan-inv-preview/PlanInvDialog";

interface PlanAndInventoryPageProps {
  domainId?: number;
  subDomainId?: number;
}

// Global Styles
const PlanPageGlobalStyles = (
  <GlobalStyles
    styles={{
      "@keyframes fadeSlideIn": {
        from: { opacity: 0, transform: "translateY(5px)" },
        to: { opacity: 1, transform: "translateY(0)" },
      },
      ".crq-card": { animation: "fadeSlideIn 0.22s ease both" },
      ".crq-card:nth-of-type(1)": { animationDelay: "0.02s" },
      ".crq-card:nth-of-type(2)": { animationDelay: "0.05s" },
      ".crq-card:nth-of-type(3)": { animationDelay: "0.08s" },
      ".crq-card:nth-of-type(4)": { animationDelay: "0.11s" },
      ".crq-card:nth-of-type(n+5)": { animationDelay: "0.14s" },

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

export const PlanAndInventoryPage: React.FC<PlanAndInventoryPageProps> = ({
  domainId,
  subDomainId,
}) => {
  const theme = useTheme();
  const colors = useTabColorTokens(theme);
  const [updateImpactAnalysisStatus] = useUpdateImpactAnalysisStatusMutation();

  const [plansOriginal, setPlansOriginal] = useState<Plan[]>([]);
  const [openCrqs, setOpenCrqs] = useState<Record<string, boolean>>({});
  const [selectedCrq, setSelectedCrq] = useState<any | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [globalSearchInput, setGlobalSearchInput] = useState("");
  const [globalSearch, setGlobalSearch] = useState("");

  const {
    data: impactData,
    isLoading,
    isError,
    error,
  } = useGetImpactAnalysisQuery(
    {
      domainId: domainId ?? 1,
      subDomainId: subDomainId ?? 1,
    },
    {
      skip: !domainId || !subDomainId,
    },
  );

  useEffect(() => {
    if (impactData?.plans) {
      setPlansOriginal(impactData.plans);
    }
  }, [impactData]);

  useEffect(() => {
    const t = setTimeout(() => setGlobalSearch(globalSearchInput), 300);
    return () => clearTimeout(t);
  }, [globalSearchInput]);

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

  const [openReviewDialog, setOpenReviewDialog] = useState(false);

  const handleOpenReviewDialog = () => {
    if (!selectedCrq) return;
    setOpenReviewDialog(true);
  };

  const handleCloseReviewDialog = () => {
    setOpenReviewDialog(false);
  };
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

      {/* Button opens route in a new tab */}
      <CustomActionButton
        label="View Selected CRQ"
        disabled={!selectedCrq}
        url={
          selectedCrq
            ? `/airtelchm/scheduler/crqWorkflow/${selectedCrq.crqNo}`
            : undefined
        }
        colors={colors}
      />

      <CustomActionButton
        label="Review CRQ"
        disabled={!selectedCrq}
        onClick={handleOpenReviewDialog}
        startIcon={<VisibilityIcon sx={{ fontSize: 16 }} />}
        colors={colors}
      />

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

  if (!domainId || !subDomainId) {
    return (
      <Box
        sx={{
          width: "100%",
          minHeight: "calc(100vh - 220px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <img src={FilterSvg} alt="Select Filter" width={850} />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box
        id="planning-container"
        sx={{ p: { xs: 1.5, sm: 2, md: 1 }, minHeight: "100%" }}
      >
        <Typography color="error">
          An error occurred while fetching impact analysis data.{" "}
          {(error as any)?.error || "Please retry."}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      id="planning-container"
      sx={{ p: { xs: 1.5, sm: 2, md: 1 }, minHeight: "100%" }}
    >
      {PlanPageGlobalStyles}
      <MaterialReactTable table={table} />

      <PlanInvDialog
        open={openReviewDialog}
        onClose={() => setOpenReviewDialog(false)}
        crq={selectedCrq}
        colors={colors}
        onSubmit={(data) => {
          console.log("Review Submitted:", data);
        }}
      />
    </Box>
  );
};

export default PlanAndInventoryPage;
