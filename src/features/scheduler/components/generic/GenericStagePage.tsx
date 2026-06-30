import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Chip,
  GlobalStyles,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from "material-react-table";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import VisibilityIcon from "@mui/icons-material/Visibility";

import { useTabColorTokens } from "../../../../style/theme";
import CustomActionButton from "../../../../components/common/CustomActionButton";
import FilterSvg from "../../../../assets/svg/Filter.svg";
// import type { StageKey } from "../../types/stageWorkflow.types";
import { getStageConfig } from "../../constants/stageConfig";
import { useGetStageDataQuery } from "../../api/stageWorkflowApiSlice";
// import { useStageWorkflow } from "../../hooks/useStageWorkflow";
// import { filterPlansBySearch } from "../../util/filterPlansBySearch";
import { StageDetailPanel } from "./StageDetailPanel";
import { StageReviewDialog } from "./dialog/StageReviewDialog";
import { useStageWorkflow } from "../../hook/useStageWorkflow";
import { filterPlansBySearch } from "../../util/filterPlansBySearch";
import type { StageKey } from "../../types/stageWorkflow.types";

interface GenericStagePageProps {
  stageKey: StageKey;
  domainId?: number;
  subDomainId?: number;
}

const GlobalStyleBlock = (
  <GlobalStyles
    styles={{
      "@keyframes fadeSlideIn": {
        from: { opacity: 0, transform: "translateY(5px)" },
        to: { opacity: 1, transform: "translateY(0)" },
      },
      ".crq-card": { animation: "fadeSlideIn 0.22s ease both" },
      ".expand-chevron": { transition: "transform 0.22s cubic-bezier(.4,0,.2,1)", display: "flex" },
      ".expand-chevron.open": { transform: "rotate(90deg)" },
    }}
  />
);

/**
 * The single page component rendered by every stage route (Impact
 * Analysis, MOP Create, MOP Validate, Scheduling, Activity Implement,
 * Closer, ...). Pass a different `stageKey` and everything - the GET
 * endpoint, start/pause endpoint, done payload shape, status field,
 * outcome options and form fields - resolves automatically from
 * `stageConfig.ts`.
 *
 * This is a direct refactor of the original `PlanAndInventoryPage`,
 * generalized to take a stageKey instead of being hard-wired to Impact
 * Analysis.
 */
export const GenericStagePage: React.FC<GenericStagePageProps> = ({
  stageKey,
  domainId,
  subDomainId,
}) => {
  const theme = useTheme();
  const colors = useTabColorTokens(theme);
  const stageConfig = getStageConfig(stageKey);

  const { toggleStartPause, submitDone } = useStageWorkflow(stageKey);

  const [plansOriginal, setPlansOriginal] = useState<any[]>([]);
  const [openCrqs, setOpenCrqs] = useState<Record<string, boolean>>({});
  const [selectedCrq, setSelectedCrq] = useState<any | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [globalSearchInput, setGlobalSearchInput] = useState("");
  const [globalSearch, setGlobalSearch] = useState("");
  const [openReviewDialog, setOpenReviewDialog] = useState(false);

  const {
    data: stageData,
    isLoading,
    isError,
    error,
  } = useGetStageDataQuery(
    { stageKey, domainId: domainId ?? 1, subDomainId: subDomainId ?? 1 },
    { skip: !domainId || !subDomainId },
  );

  useEffect(() => {
    if (stageData?.plans) setPlansOriginal(stageData.plans);
  }, [stageData]);

  useEffect(() => {
    const t = setTimeout(() => setGlobalSearch(globalSearchInput), 300);
    return () => clearTimeout(t);
  }, [globalSearchInput]);

  const handleStartPause = async (crq: any) => {
    const result = await toggleStartPause(crq);
    if (!result.success) return;
    setPlansOriginal((prev) =>
      prev.map((plan) => ({
        ...plan,
        crqs: plan.crqs.map((c: any) =>
          c.crqNo === crq.crqNo ? { ...c, [stageConfig.statusField]: result.nextStatus } : c,
        ),
      })),
    );
  };

  const handleSubmitDone = async (values: Record<string, any>, crq: any) => {
    const result = await submitDone(values, crq);
    if (result.success) {
      setPlansOriginal((prev) =>
        prev.map((plan) => ({
          ...plan,
          crqs: plan.crqs.map((c: any) =>
            c.crqNo === crq.crqNo ? { ...c, [stageConfig.statusField]: values.status } : c,
          ),
        })),
      );
    }
    return result;
  };

  const toggleFullScreen = () => {
    const elem = document.getElementById(`${stageKey}-container`);
    if (!document.fullscreenElement) {
      elem?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const toggleCrq = (id: string) => setOpenCrqs((prev) => ({ ...prev, [id]: !prev[id] }));

  const filteredPlans = useMemo(
    () => filterPlansBySearch(plansOriginal, globalSearch),
    [plansOriginal, globalSearch],
  );

  const columns = useMemo<MRT_ColumnDef<any>[]>(
    () => [
      {
        accessorKey: "planNumber",
        header: "Plan Number",
        size: 200,
        Cell: ({ cell }) => (
          <Typography sx={{ fontSize: 12, fontWeight: 800, fontFamily: "monospace", color: colors.accent }}>
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
            sx={{ height: 20, fontSize: 11, fontWeight: 600, bgcolor: colors.successDim, color: colors.success }}
          />
        ),
      },
      {
        accessorKey: "description",
        header: "Description",
        size: 400,
        Cell: ({ cell }) => (
          <Typography sx={{ fontSize: 12, color: colors.textSecondary, lineHeight: 1.5 }}>
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
        placeholder={`Search ${stageConfig.label.toLowerCase()} plans, CRQs…`}
        value={globalSearchInput}
        onChange={(e) => setGlobalSearchInput(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchRoundedIcon sx={{ fontSize: 15, color: colors.textDim }} />
            </InputAdornment>
          ),
          sx: { fontSize: 13, height: 34, borderRadius: "9px", bgcolor: colors.trackOff },
        }}
        sx={{ width: 260 }}
      />
      <Tooltip title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}>
        <IconButton size="small" onClick={toggleFullScreen}>
          {isFullscreen ? <FullscreenExitIcon sx={{ fontSize: 17 }} /> : <FullscreenIcon sx={{ fontSize: 17 }} />}
        </IconButton>
      </Tooltip>

      <CustomActionButton
        label="View Selected CRQ"
        disabled={!selectedCrq}
        url={selectedCrq ? `/airtelchm/scheduler/crqWorkflow/${selectedCrq.crqNo}` : undefined}
        colors={colors}
      />
      <CustomActionButton
        label={`Review ${stageConfig.label}`}
        disabled={!selectedCrq}
        onClick={() => selectedCrq && setOpenReviewDialog(true)}
        startIcon={<VisibilityIcon sx={{ fontSize: 16 }} />}
        colors={colors}
      />

      <Stack direction="row" spacing={0.8}>
        <Chip label={`${filteredPlans.length} plans`} size="small" sx={{ height: 24, fontSize: 11, fontWeight: 700 }} />
        <Chip
          label={`${filteredPlans.reduce((a: number, p: any) => a + (p.crqs?.length || 0), 0)} CRQs`}
          size="small"
          sx={{ height: 24, fontSize: 11, fontWeight: 700 }}
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
      <StageDetailPanel
        plan={row.original}
        stageConfig={stageConfig}
        openCrqs={openCrqs}
        selectedCrq={selectedCrq}
        colors={colors}
        onToggle={toggleCrq}
        onSelect={setSelectedCrq}
        onStartPause={handleStartPause}
      />
    ),
    renderTopToolbarCustomActions,
    initialState: { density: "compact" },
    muiDetailPanelProps: { sx: { padding: 0 } },
    muiTablePaperProps: {
      elevation: 0,
      sx: { border: `1px solid ${colors.border}`, borderRadius: colors.radiusXL, overflow: "hidden", bgcolor: colors.surface },
    },
    muiTableContainerProps: { sx: { maxHeight: "calc(100vh - 350px)" } },
  });

  if (!domainId || !subDomainId) {
    return (
      <Box sx={{ width: "100%", minHeight: "calc(100vh - 220px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <img src={FilterSvg} alt="Select Filter" width={850} />
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="text.secondary">Loading {stageConfig.label}…</Typography>
      </Box>
    );
  }

  if (isError) {
    return (
      <Box id={`${stageKey}-container`} sx={{ p: { xs: 1.5, sm: 2, md: 1 }, minHeight: "100%" }}>
        <Typography color="error">
          An error occurred while fetching {stageConfig.label} data. {(error as any)?.error || "Please retry."}
        </Typography>
      </Box>
    );
  }

  return (
    <Box id={`${stageKey}-container`} sx={{ p: { xs: 1.5, sm: 2, md: 1 }, minHeight: "100%" }}>
      {GlobalStyleBlock}
      <MaterialReactTable table={table} />

      <StageReviewDialog
        open={openReviewDialog}
        onClose={() => setOpenReviewDialog(false)}
        crq={selectedCrq}
        colors={colors}
        stageConfig={stageConfig}
        onSubmitDone={handleSubmitDone}
      />
    </Box>
  );
};

export default GenericStagePage;
