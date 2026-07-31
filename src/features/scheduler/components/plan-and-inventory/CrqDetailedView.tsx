import React, { Suspense, lazy, useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { Box, GlobalStyles, IconButton, Skeleton, Stack, Tooltip, Typography, useTheme } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditNoteRoundedIcon from "@mui/icons-material/EditNoteRounded";
import EventRepeatRoundedIcon from "@mui/icons-material/EventRepeatRounded";
import FactCheckRoundedIcon from "@mui/icons-material/FactCheckRounded";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import FindInPageRoundedIcon from "@mui/icons-material/FindInPageRounded";
import TouchAppRoundedIcon from "@mui/icons-material/TouchAppRounded";

import { useTabColorTokens } from "../../../../style/theme";
import { usePermission } from "../../../auth/hooks/usePermission";

import {
  useGetCrqWorkflowOverviewQuery,
  useSubmitCrqReviewDoneMutation,
  useUpdateCrqReviewStatusMutation,
} from "../../api/crqreviewApiSlice";
import { getStageConfig, taskNumbersOf } from "../../constants/stageConfig";
import { useStageWorkflow } from "../../hook/useStageWorkflow";
import { filterPlansBySearch } from "../../util/filterPlansBySearch";
import type { Crq, Plan } from "../../types/crqWorkflow.types";
import type { StageKey } from "../../types/stageWorkflow.types";
import type { RootState } from "../../../../app/store";
import {
  WORKFLOW_STAGES,
  getStageSummaryFields,
  resolveCurrentStageIndex,
  type WorkflowStageId,
} from "../../constants/workflowStages";

import { CrqWorkflowSidebar } from "../crq-workflow/CrqWorkflowSidebar";
import { CrqWorkflowHeader } from "../crq-workflow/CrqWorkflowHeader";
import { StageRail } from "../crq-workflow/StageRail";
import { CrqActionPanel, type StageMode, type CRQAction } from "../crq-workflow/CrqActionPanel";
import { StageSummaryGrid } from "../crq-workflow/StageSummaryGrid";
import { CrqHistoryTable } from "../crq-workflow/CrqHistoryTable";

import { PlanInvDialog } from "../dialog/plan-inv-preview/PlanInvDialog";
import { StageReviewDialog } from "../generic/dialog/StageReviewDialog";
import { PrevCrqStatusDialog } from "../dialog/impact/PrevCrqStatusDialog";
// Both imported by direct file path, deliberately bypassing the sub-feature's
// barrel (index.ts): the barrel statically re-exports every component in the
// sub-feature (including the Dialog itself), so importing anything through
// it - even just the launcher hook - would give this page a static import
// edge into the whole Attribute Update module graph and defeat the
// dynamic-import code-split below. useOpenAttributeUpdate's own file has no
// dependency on the field catalog or the dialog subtree, so it's safe to
// import eagerly; the Dialog (react-hook-form, the full 7-stage field
// catalog, WorkflowStageCard/Body) is only ever needed after the user
// actually clicks "Attribute Update", hence React.lazy.
import { useOpenAttributeUpdate } from "../../sub-feature/attributeUpdate/hooks/useOpenAttributeUpdate";

const AttributeUpdateDialog = lazy(
  () => import("../../sub-feature/attributeUpdate/components/AttributeUpdateDialog"),
);

// Same reasoning as AttributeUpdateDialog: the wizard pulls in its own calendar
// grid, five step components and RTK Query endpoints, none of which are needed
// until someone actually clicks Reschedule.
const RescheduleDialog = lazy(() => import("../crq-workflow/reschedule/RescheduleDialog"));

// Same reasoning again: the Validate dialog carries its own form state hook and
// RTK Query endpoints, needed only once someone clicks Validate on the
// Plan & Inventory stage.
const ValidateDialog = lazy(() => import("../crq-workflow/validate/ValidateDialog"));

/**
 * Stages that expose the Reschedule action. Scheduling and Network Execution
 * (Activity Implement) are the only two where the CRQ already has an engineer
 * slot reserved - on earlier stages there is no reservation to move, and on
 * Task Closure the procedures refuse outright ("CRQ is already closed").
 */
const RESCHEDULABLE_STAGES = new Set<WorkflowStageId>(["scheduling", "activityimplement"]);

/** RBAC module + permission the Reschedule action requires (WEB_MODULE / WEB_PERMISSION). */
const SCHEDULER_MODULE = "Scheduler";
const UPDATE_PERMISSION = "UPDATE";

const GlobalStyleBlock = (
  <GlobalStyles
    styles={{
      ".expand-chevron": {
        transition: "transform 0.22s cubic-bezier(.4,0,.2,1)",
        display: "flex",
      },
      ".expand-chevron.open": { transform: "rotate(90deg)" },
      "@keyframes pulseDot": {
        "0%, 100%": { opacity: 1, transform: "scale(1)" },
        "50%": { opacity: 0.4, transform: "scale(0.8)" },
      },
      ".status-pulse-dot": { animation: "pulseDot 1.4s ease-in-out infinite" },
    }}
  />
);

/** Placeholder shown while the overview query is in flight - mirrors the
 * real layout's shape (header strip, stage rail, a couple of field cards)
 * instead of a bare loading string. */
const CockpitSkeleton: React.FC<{ colors: ReturnType<typeof useTabColorTokens> }> = ({ colors }) => (
  <Box sx={{ flex: 1, p: 2 }}>
    <Skeleton variant="rounded" height={52} sx={{ borderRadius: colors.radius, mb: 1 }} />
    <Stack direction="row" spacing={0.75} sx={{ mb: 1.5 }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} variant="rounded" width={128} height={54} sx={{ borderRadius: colors.radius }} />
      ))}
    </Stack>
    <Skeleton variant="rounded" height={40} sx={{ borderRadius: colors.radius, mb: 1.5 }} />
    {Array.from({ length: 3 }).map((_, i) => (
      <Skeleton key={i} variant="rounded" height={44} sx={{ borderRadius: colors.radius, mb: 1 }} />
    ))}
  </Box>
);

/**
 * Single-CRQ workflow cockpit at /scheduler/crqWorkflow/:crqNo. Reuses the
 * exact same data + mutations as the list pages (useGetCrqReviewQuery,
 * useUpdateCrqReviewStatusMutation for the Plan & Inventory / Review
 * stage, useStageWorkflow + STAGE_CONFIG_MAP for the other six) and the
 * exact same dialogs (PlanInvDialog, StageReviewDialog, PrevCrqStatusDialog)
 * - only the surrounding navigation (sidebar tree + stage rail) is new.
 */
export const CrqDetailedView: React.FC = () => {
  const theme = useTheme();
  const colors = useTabColorTokens(theme);
  const navigate = useNavigate();
  const { crqNo } = useParams<{ crqNo: string }>();
  const [searchParams] = useSearchParams();

  // Same org-hierarchy scope (Vertical/Domain/Sub-domain) the list pages
  // (PlanAndInventoryPage / ImpactAnalysisPage / GenericStagePage) receive
  // as props - here it arrives via query params since this route is
  // reached directly (deep link / new tab), not nested under those pages.
  // Falls back to 1/1 to preserve the previous hardcoded default when a
  // link doesn't carry them (e.g. an old bookmark).
  const domainId = Number(searchParams.get("domainId")) || 1;
  const subDomainId = Number(searchParams.get("subDomainId")) || 1;

  const [plansOriginal, setPlansOriginal] = useState<Plan[]>([]);
  const [expPlans, setExpPlans] = useState<Record<string, boolean>>({});
  const [expCrqs, setExpCrqs] = useState<Record<string, boolean>>({});
  const [selectedCrqNo, setSelectedCrqNo] = useState<string | null>(crqNo ?? null);
  const [selectedStageId, setSelectedStageId] = useState<WorkflowStageId>("review");
  const [hasInitializedSelection, setHasInitializedSelection] = useState(false);

  const [globalSearchInput, setGlobalSearchInput] = useState("");
  const [globalSearch, setGlobalSearch] = useState("");
  // Purely presentational - hides the plan/CRQ tree so tablet-width viewports
  // aren't cramped; doesn't affect selection state or any data fetch.
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [prevCrqStatusOpen, setPrevCrqStatusOpen] = useState(false);
  const [prevCrqData, setPrevCrqData] = useState<any | null>(null);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [validateOpen, setValidateOpen] = useState(false);
  const openAttributeUpdate = useOpenAttributeUpdate();

  const { hasPermission } = usePermission();
  const canReschedule = hasPermission(SCHEDULER_MODULE, UPDATE_PERMISSION);
  const currentUserOlmId = useSelector((state: RootState) => state.auth.user?.olmId);

  // Overview endpoint: every CRQ of the scope regardless of current stage,
  // each carrying its full per-stage history - so a CRQ stays visible here
  // after leaving Plan & Inventory (the old /crqreview feed dropped it).
  const { data, isError, error } = useGetCrqWorkflowOverviewQuery({ domainId, subDomainId });
  const [updateCrqReviewStatus] = useUpdateCrqReviewStatusMutation();
  const [submitCrqReviewDone] = useSubmitCrqReviewDoneMutation();

  // One useStageWorkflow instance per generic stage key - hooks must be
  // called unconditionally, so all six are created up front and the active
  // one is picked by selectedStageId when an action fires.
  const impactanalysis = useStageWorkflow("impactanalysis");
  const mopcreate = useStageWorkflow("mopcreate");
  const mopvalidate = useStageWorkflow("mopvalidate");
  const scheduling = useStageWorkflow("scheduling");
  const activityimplement = useStageWorkflow("activityimplement");
  const closer = useStageWorkflow("closer");
  const stageWorkflows: Record<StageKey, ReturnType<typeof useStageWorkflow>> = {
    impactanalysis,
    mopcreate,
    mopvalidate,
    scheduling,
    activityimplement,
    closer,
  };

  useEffect(() => {
    if (data?.plans) setPlansOriginal(data.plans);
  }, [data]);

  useEffect(() => {
    const t = setTimeout(() => setGlobalSearch(globalSearchInput), 300);
    return () => clearTimeout(t);
  }, [globalSearchInput]);

  useEffect(() => {
    setSelectedCrqNo(crqNo ?? null);
  }, [crqNo]);

  const selectedPlan = useMemo(
    () => plansOriginal.find((p) => (p.crqs ?? []).some((c) => c.crqNo === selectedCrqNo)) ?? null,
    [plansOriginal, selectedCrqNo],
  );
  const selectedCrq = useMemo(
    () => selectedPlan?.crqs.find((c) => c.crqNo === selectedCrqNo) ?? null,
    [selectedPlan, selectedCrqNo],
  );
  const currentStageIndex = useMemo(() => resolveCurrentStageIndex(selectedCrq), [selectedCrq]);
  const selectedStageIndex = useMemo(
    () => Math.max(0, WORKFLOW_STAGES.findIndex((s) => s.id === selectedStageId)),
    [selectedStageId],
  );
  const stageMode: StageMode =
    selectedStageIndex === currentStageIndex ? "editable" : selectedStageIndex < currentStageIndex ? "view" : "locked";

  const isReviewStage = selectedStageId === "review";
  const activeStageWorkflow = !isReviewStage ? stageWorkflows[selectedStageId as StageKey] : null;
  // Live status of the selected stage: the history entry (authoritative,
  // fed by CRQ_MASTER_TBL) first, legacy per-stage status field as fallback.
  const selectedStageEntry =
    selectedCrq?.history?.find((h) => h.stageKey === selectedStageId) ?? null;
  const selectedStageStatus =
    selectedStageEntry?.status ??
    (selectedCrq ? (selectedCrq as any)[WORKFLOW_STAGES[selectedStageIndex].statusField] : undefined);
  const isRunning = selectedStageStatus === "In Progress";

  // Seed the sidebar's expansion state and the selected stage from the
  // route's crqNo the first time the CRQ's plan is found, mirroring the
  // reference's initial expPlans/expCrqs/selStage.
  useEffect(() => {
    if (hasInitializedSelection || !plansOriginal.length || !selectedCrqNo) return;
    const plan = plansOriginal.find((p) => (p.crqs ?? []).some((c) => c.crqNo === selectedCrqNo));
    if (!plan) return;
    const crq = plan.crqs.find((c) => c.crqNo === selectedCrqNo) ?? null;
    setExpPlans((prev) => ({ ...prev, [plan.planNumber]: true }));
    setExpCrqs((prev) => ({ ...prev, [selectedCrqNo]: true }));
    setSelectedStageId(WORKFLOW_STAGES[resolveCurrentStageIndex(crq)].id);
    setHasInitializedSelection(true);
  }, [plansOriginal, selectedCrqNo, hasInitializedSelection]);

  const filteredPlans = useMemo(() => filterPlansBySearch(plansOriginal, globalSearch), [plansOriginal, globalSearch]);

  const handleTogglePlan = useCallback(
    (planNumber: string) => setExpPlans((prev) => ({ ...prev, [planNumber]: !prev[planNumber] })),
    [],
  );
  const handleToggleCrq = useCallback(
    (targetCrqNo: string) => setExpCrqs((prev) => ({ ...prev, [targetCrqNo]: !prev[targetCrqNo] })),
    [],
  );
  const handleSelectCrq = useCallback(
    (crq: Crq, planNumber: string) => {
      setExpPlans((prev) => ({ ...prev, [planNumber]: true }));
      setExpCrqs((prev) => ({ ...prev, [crq.crqNo]: true }));
      setSelectedStageId(WORKFLOW_STAGES[resolveCurrentStageIndex(crq)].id);
      navigate(`/scheduler/crqWorkflow/${crq.crqNo}?${searchParams.toString()}`, { replace: true });
    },
    [navigate, searchParams],
  );
  const handleSelectStage = useCallback((stageId: WorkflowStageId) => setSelectedStageId(stageId), []);

  /**
   * Optimistic local update: patches both the legacy per-stage status field
   * and the matching history entry so the action bar/rail flip immediately;
   * the CrqReview tag invalidation then refetches the authoritative state.
   */
  const applyLocalStageStatus = useCallback(
    (crqNo: string, stageId: WorkflowStageId, statusField: string, nextStatus: string) => {
      setPlansOriginal((prev) =>
        prev.map((plan) => ({
          ...plan,
          crqs: plan.crqs.map((c) =>
            c.crqNo === crqNo
              ? {
                  ...c,
                  [statusField]: nextStatus,
                  history: c.history?.map((h) =>
                    h.stageKey === stageId ? { ...h, status: nextStatus } : h,
                  ),
                }
              : c,
          ),
        })),
      );
    },
    [],
  );

  const handleStartPause = useCallback(async () => {
    if (!selectedCrq) return;

    if (isReviewStage) {
      const reviewStatus =
        selectedCrq.history?.find((h) => h.stageKey === "review")?.status ??
        selectedCrq.crqReviewStatus ??
        "";
      const isRunningNow = reviewStatus.toLowerCase() === "in progress";
      const action = isRunningNow ? "pause" : "start";
      try {
        const response = await updateCrqReviewStatus({
          crqNo: selectedCrq.crqNo,
          crqId: selectedCrq.crqId,
          action,
        }).unwrap();
        toast.success(response?.message || "Updated successfully.");
        applyLocalStageStatus(selectedCrq.crqNo, "review", "crqReviewStatus", isRunningNow ? "Paused" : "In Progress");
      } catch (err) {
        toast.error((err as any)?.data?.message || "Failed to update status. Please try again.");
      }
      return;
    }

    if (!activeStageWorkflow) return;
    const result = await activeStageWorkflow.toggleStartPause(selectedCrq);
    if (!result.success) return;
    const statusField = getStageConfig(selectedStageId as StageKey).statusField;
    applyLocalStageStatus(selectedCrq.crqNo, selectedStageId, statusField, result.nextStatus as string);
  }, [selectedCrq, isReviewStage, activeStageWorkflow, selectedStageId, updateCrqReviewStatus, applyLocalStageStatus]);

  const handleSubmitDone = useCallback(
    async (values: Record<string, any>, crq: Crq) => {
      if (isReviewStage || !activeStageWorkflow) return { success: false };
      const result = await activeStageWorkflow.submitDone(values, crq);
      if (result.success) {
        const statusField = getStageConfig(selectedStageId as StageKey).statusField;
        applyLocalStageStatus(crq.crqNo, selectedStageId, statusField, values.status);
      }
      return result;
    },
    [isReviewStage, activeStageWorkflow, selectedStageId, applyLocalStageStatus],
  );

  /**
   * Plan & Inventory review submit -> /crqworkflow/updatecrqreview/done.
   * On Pass the backend advances the CRQ to Impact Analysis transactionally.
   * Mirrors buildCommonDonePayload's shape (stageConfig.ts) so this stage's
   * mandatory olmId/planNumber/taskNumber and the cancellation block reach
   * the backend exactly like the other six stages.
   */
  const handleReviewSubmit = useCallback(
    async (data: any) => {
      try {
        const isCanceled = data.status === "canceled";
        const response = await submitCrqReviewDone({
          crqNo: data.crqNo,
          crqId: data.crqId,
          olmId: currentUserOlmId ?? "",
          localStatus: isCanceled
            ? (data.field1 ?? "Cancelled")
            : data.status === "Done"
              ? "DONE"
              : data.status,
          remark: isCanceled ? (data.field5 ?? "") : (data.remark ?? ""),
          planNumber: data.planNumber ?? selectedCrq?.planNumber ?? "",
          taskNumber: taskNumbersOf(selectedCrq),
          ...(isCanceled && {
            cygnetStatus: data.cygnetStatus,
            field1: data.field1,
            field3: data.cancellationReason,
            field4: data.field4,
            field5: data.field5,
          }),
        }).unwrap();
        toast.success(response?.message || `Review for ${data.crqNo} submitted.`);
        return { success: true };
      } catch (err) {
        toast.error((err as any)?.data?.message || "Review submission failed. Please try again.");
        return { success: false };
      }
    },
    [submitCrqReviewDone, currentUserOlmId, selectedCrq],
  );

  /** Real previous-stage data (crq.history) - replaces the old mock lookup. */
  const handleShowPrevCrqStatus = useCallback(() => {
    if (!selectedCrq) return;
    const previousStages = (selectedCrq.history ?? []).filter((h) => !h.current);
    if (selectedCrq.history?.length) {
      setPrevCrqData({
        ...selectedCrq,
        planNumber: selectedCrq.planNumber ?? selectedPlan?.planNumber,
        planType: selectedCrq.planType ?? selectedPlan?.planType,
      });
      setPrevCrqStatusOpen(true);
      if (!previousStages.length) {
        toast.info("This CRQ has not completed any previous stage yet.");
      }
    } else {
      toast.warn("No previous CRQ status found for the selected CRQ.");
    }
  }, [selectedCrq, selectedPlan]);

  const crqActions: CRQAction[] = useMemo(
    () => [
      // Plan & Inventory only: the validation attributes belong to the VALIDATE
      // stage, so the action appears on that stage and follows the same gate the
      // panel's own Start/Pause uses - enabled while the stage is the CRQ's
      // current (editable) one, present but inert once it has moved on.
      ...(isReviewStage
        ? [
            {
              key: "validate",
              label: "Validate",
              icon: <FactCheckRoundedIcon sx={{ fontSize: 16 }} />,
              disabled: !selectedCrq || stageMode !== "editable",
              onClick: () => setValidateOpen(true),
            } satisfies CRQAction,
          ]
        : []),
      {
        key: "attribute-update",
        label: "Attribute Update",
        icon: <EditNoteRoundedIcon sx={{ fontSize: 16 }} />,
        disabled: !selectedCrq,
        onClick: () => selectedCrq && openAttributeUpdate(selectedCrq),
      },
      {
        key: "show-prev-crq-status",
        label: "Show Prev CRQ Status",
        icon: <VisibilityIcon sx={{ fontSize: 16 }} />,
        disabled: !selectedCrq,
        onClick: handleShowPrevCrqStatus,
      },
      // Scheduling and Network Execution only: these are the two stages where an
      // engineer reservation already exists, which is exactly what
      // CRQ_SP_RESCHEDULE_CONFIRM_SLOT archives and replaces. Also gated on the
      // Scheduler module's UPDATE permission, like every other mutating action.
      ...(RESCHEDULABLE_STAGES.has(selectedStageId) && canReschedule
        ? [
            {
              key: "reschedule",
              label: "Reschedule",
              icon: <EventRepeatRoundedIcon sx={{ fontSize: 16 }} />,
              disabled: !selectedCrq,
              onClick: () => setRescheduleOpen(true),
            } satisfies CRQAction,
          ]
        : []),
    ],
    [
      selectedCrq,
      isReviewStage,
      stageMode,
      selectedStageId,
      canReschedule,
      openAttributeUpdate,
      handleShowPrevCrqStatus,
    ],
  );

  if (isError) {
    return (
      <Box sx={{ p: 3, display: "flex", justifyContent: "center" }}>
        <Stack
          alignItems="center"
          spacing={1}
          sx={{
            p: 3,
            maxWidth: 420,
            textAlign: "center",
            border: `1px solid ${colors.dangerBorder}`,
            borderRadius: colors.radiusL,
            bgcolor: colors.dangerDim,
          }}
        >
          <ErrorOutlineRoundedIcon sx={{ fontSize: 28, color: colors.danger }} />
          <Typography sx={{ fontWeight: 700, fontSize: 14, color: colors.textPrimary }}>
            Failed to load CRQ details
          </Typography>
          <Typography sx={{ fontSize: 12.5, color: colors.textSecondary }}>
            {(error as any)?.error || "Please refresh."}
          </Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: "calc(100vh - 160px)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        border: `1px solid ${colors.border}`,
        borderRadius: colors.radiusXL,
        bgcolor: colors.bg,
      }}
    >
      {GlobalStyleBlock}
      <Box sx={{ flex: 1, display: "flex", minHeight: 0, position: "relative" }}>
        {!sidebarCollapsed && (
          <CrqWorkflowSidebar
            plans={filteredPlans}
            expPlans={expPlans}
            expCrqs={expCrqs}
            selectedCrqNo={selectedCrqNo}
            onTogglePlan={handleTogglePlan}
            onToggleCrq={handleToggleCrq}
            onSelectCrq={handleSelectCrq}
            searchValue={globalSearchInput}
            onSearchChange={setGlobalSearchInput}
            colors={colors}
          />
        )}

        <Tooltip title={sidebarCollapsed ? "Show CRQ list" : "Hide CRQ list"} placement="right">
          <IconButton
            size="small"
            onClick={() => setSidebarCollapsed((v) => !v)}
            sx={{
              position: "absolute",
              top: 10,
              left: sidebarCollapsed ? 8 : 314,
              zIndex: 3,
              width: 26,
              height: 26,
              bgcolor: colors.surface,
              border: `1px solid ${colors.border}`,
              boxShadow: "0 2px 6px rgba(20,30,50,0.12)",
              transition: "left 0.15s ease",
              "&:hover": { bgcolor: colors.surface2 },
            }}
          >
            {sidebarCollapsed ? (
              <ChevronRightRoundedIcon sx={{ fontSize: 16 }} />
            ) : (
              <ChevronLeftRoundedIcon sx={{ fontSize: 16 }} />
            )}
          </IconButton>
        </Tooltip>

        <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {!selectedCrq ? (
            !plansOriginal.length ? (
              <CockpitSkeleton colors={colors} />
            ) : (
              <Stack
                alignItems="center"
                justifyContent="center"
                spacing={1}
                sx={{ flex: 1, p: 4, textAlign: "center" }}
              >
                {selectedCrqNo ? (
                  <FindInPageRoundedIcon sx={{ fontSize: 36, color: colors.textDim }} />
                ) : (
                  <TouchAppRoundedIcon sx={{ fontSize: 36, color: colors.textDim }} />
                )}
                <Typography sx={{ fontSize: 14, fontWeight: 700, color: colors.textPrimary }}>
                  {selectedCrqNo ? `No CRQ found for ${selectedCrqNo}` : "Select a CRQ"}
                </Typography>
                <Typography sx={{ fontSize: 12.5, color: colors.textDim, maxWidth: 320 }}>
                  {selectedCrqNo
                    ? "It may have been removed, or you may not have access to it."
                    : "Choose a CRQ from the list on the left to view its full workflow details."}
                </Typography>
              </Stack>
            )
          ) : (
            <>
              <CrqWorkflowHeader crq={selectedCrq} currentStageIndex={currentStageIndex} colors={colors} />
              <StageRail
                crq={selectedCrq}
                currentStageIndex={currentStageIndex}
                selectedStageId={selectedStageId}
                onSelectStage={handleSelectStage}
                colors={colors}
              />

              <Box sx={{ flex: 1, overflowY: "auto", p: 2 }}>
                <CrqActionPanel
                  stageLabel={WORKFLOW_STAGES[selectedStageIndex].label}
                  mode={stageMode}
                  isRunning={isRunning}
                  onStartPause={handleStartPause}
                  onReview={() => setReviewDialogOpen(true)}
                  isBusy={activeStageWorkflow?.isTogglingStatus}
                  recordActions={crqActions}
                  colors={colors}
                />

                <StageSummaryGrid fields={getStageSummaryFields(selectedStageId, selectedCrq)} colors={colors} />

                {/* Completed previous stages - read-only, no actions. */}
                <Box sx={{ mt: 1.5 }}>
                  <CrqHistoryTable history={selectedCrq.history} colors={colors} />
                </Box>
              </Box>
            </>
          )}
        </Box>
      </Box>

      {isReviewStage ? (
        <PlanInvDialog
          open={reviewDialogOpen}
          onClose={() => setReviewDialogOpen(false)}
          crq={selectedCrq}
          colors={colors}
          onSubmit={handleReviewSubmit}
        />
      ) : (
        <StageReviewDialog
          open={reviewDialogOpen}
          onClose={() => setReviewDialogOpen(false)}
          crq={selectedCrq}
          colors={colors}
          stageConfig={getStageConfig(selectedStageId as StageKey)}
          onSubmitDone={handleSubmitDone}
        />
      )}

      <PrevCrqStatusDialog
        open={prevCrqStatusOpen}
        onClose={() => setPrevCrqStatusOpen(false)}
        crqData={prevCrqData}
        colors={colors}
      />

      <Suspense fallback={null}>
        <AttributeUpdateDialog />
      </Suspense>

      {/* Same on-demand mount as the wizard below. The dialog reads its own
          details from get_crq_validation_details and writes nothing outside
          CRQ_VALIDATION_DETAILS_TBL, so no cockpit refresh is needed on save. */}
      {validateOpen && (
        <Suspense fallback={null}>
          <ValidateDialog
            open={validateOpen}
            onClose={() => setValidateOpen(false)}
            crqNo={selectedCrq?.crqNo ?? null}
            colors={colors}
          />
        </Suspense>
      )}

      {/* Mounted only once opened, so the wizard's chunk is fetched on demand. */}
      {rescheduleOpen && (
        <Suspense fallback={null}>
          <RescheduleDialog
            open={rescheduleOpen}
            onClose={() => setRescheduleOpen(false)}
            crqId={selectedCrq?.crqId ?? null}
            crqNo={selectedCrq?.crqNo ?? null}
            colors={colors}
          />
        </Suspense>
      )}
    </Box>
  );
};

export default CrqDetailedView;
