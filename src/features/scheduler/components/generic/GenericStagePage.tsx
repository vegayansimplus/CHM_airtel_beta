import React, { Suspense, lazy, useEffect, useMemo, useState } from "react";
import {
  Box,
  Chip,
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
import FactCheckRoundedIcon from "@mui/icons-material/FactCheckRounded";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import { useTabColorTokens } from "../../../../style/theme";
import CustomActionButton from "../../../../components/common/CustomActionButton";
import FilterSvg from "../../../../assets/svg/Filter.svg";
import { getStageConfig } from "../../constants/stageConfig";
import { useGetStageDataQuery } from "../../api/stageWorkflowApiSlice";
import { StageDetailPanel } from "./StageDetailPanel";
import { useStageWorkflow } from "../../hook/useStageWorkflow";
import { filterPlansBySearch } from "../../util/filterPlansBySearch";
import { injectGlobalStyles } from "../../util/injectGlobalStyles";
import type { StageKey } from "../../types/stageWorkflow.types";
import { usePermission } from "../../../auth/hooks/usePermission";
const RescheduleDialog = lazy(() => import("../crq-workflow/reschedule/RescheduleDialog"));
const StageReviewDialog = lazy(() => import("./dialog/StageReviewDialog"));
const PreviewCrqPdfDialog = lazy(() => import("../dialog/crq-preview/PreviewCrqPdfDialog"));
const RESCHEDULABLE_STAGES = new Set<StageKey>(["scheduling", "activityimplement"]);

/** RBAC module + permission the Reschedule action requires. */
const SCHEDULER_MODULE = "Scheduler";
const UPDATE_PERMISSION = "UPDATE";

interface GenericStagePageProps {
  stageKey: StageKey;
  domainId?: number;
  subDomainId?: number;
}

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
  const [rescheduleCrq, setRescheduleCrq] = useState<any | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [previewPdfOpen, setPreviewPdfOpen] = useState(false);

  const { hasPermission } = usePermission();
  // One gate for every mutating affordance on this page. Reschedule already
  // honoured it; Start/Pause did not, so a Scheduler VIEW grant used to hand
  // over the ability to drive a stage.
  const canEdit = hasPermission(SCHEDULER_MODULE, UPDATE_PERMISSION);
  const canReschedule = RESCHEDULABLE_STAGES.has(stageKey) && canEdit;

  useEffect(() => {
    injectGlobalStyles();
  }, []);

  const {
    data: stageData,
    isLoading,
    isFetching,
    isError,
    error,
    refetch: refetchStageData,
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

  /**
   * Review dialog submit ("Pass"/"Failed"/"Cancelled") - mirrors
   * CrqDetailedView's handleSubmitDone so the exact same
   * StageReviewDialog + useStageWorkflow.submitDone flow works whether the
   * CRQ is actioned from this list page or from the single-CRQ cockpit.
   * Patches the row's status locally for an immediate UI flip; the
   * StageWorkflow tag invalidation then refetches the authoritative state.
   */
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
        url={
          selectedCrq
            ? `${import.meta.env.BASE_URL}scheduler/crqWorkflow/${selectedCrq.crqNo}?domainId=${domainId ?? 1}&subDomainId=${subDomainId ?? 1}`
            : undefined
        }
        colors={colors}
      />
      <CustomActionButton
        label={`Review ${stageConfig.label}`}
        disabled={!selectedCrq}
        onClick={() => setReviewDialogOpen(true)}
        startIcon={<FactCheckRoundedIcon sx={{ fontSize: 16 }} />}
        colors={colors}
      />
      <CustomActionButton
        label="PDF View"
        disabled={!selectedCrq}
        onClick={() => setPreviewPdfOpen(true)}
        startIcon={<PictureAsPdfOutlinedIcon sx={{ fontSize: 16 }} />}
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
        onStartPause={canEdit ? handleStartPause : undefined}
        onReschedule={canReschedule ? setRescheduleCrq : undefined}
      />
    ),
    renderTopToolbarCustomActions,
    initialState: { density: "compact" },
    state: { isLoading: isFetching },
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
      <MaterialReactTable table={table} />

      {/* Exact same wizard the CRQ cockpit opens - mounted only once a card's
          Reschedule is clicked, so its chunk is fetched on demand. */}
      {rescheduleCrq && (
        <Suspense fallback={null}>
          <RescheduleDialog
            open={!!rescheduleCrq}
            onClose={() => setRescheduleCrq(null)}
            crqId={rescheduleCrq.crqId ?? null}
            crqNo={rescheduleCrq.crqNo ?? null}
            colors={colors}
            activityPlanStartDate={rescheduleCrq.activityPlanStartDate ?? null}
            activityPlanEndDate={rescheduleCrq.activityPlanEndDate ?? null}
            onCompleted={refetchStageData}
          />
        </Suspense>
      )}
      {/* Same review dialog the CRQ cockpit renders for this stage - lets a
          user Pass/Fail/Cancel the selected CRQ's outcome without leaving
          this list, exactly like the original "Impact Analysis" button on
          the reference list page. Mounted only once opened, so its chunk is
          fetched on demand. */}
      {reviewDialogOpen && selectedCrq && (
        <Suspense fallback={null}>
          <StageReviewDialog
            open={reviewDialogOpen}
            onClose={() => setReviewDialogOpen(false)}
            crq={selectedCrq}
            colors={colors}
            stageConfig={stageConfig}
            onSubmitDone={handleSubmitDone}
          />
        </Suspense>
      )}
      {/* Same "Preview CRQ" plan PDF the single-CRQ cockpit renders, opened
          for whichever CRQ is checked in this list - matches the reference
          list page's "Preview Plan" action. Mounted only once opened. */}
      {previewPdfOpen && selectedCrq && (
        <Suspense fallback={null}>
          <PreviewCrqPdfDialog
            open={previewPdfOpen}
            onClose={() => setPreviewPdfOpen(false)}
            crqNo={selectedCrq.crqNo ?? null}
            colors={colors}
          />
        </Suspense>
      )}
    </Box>
  );
};

export default GenericStagePage;
