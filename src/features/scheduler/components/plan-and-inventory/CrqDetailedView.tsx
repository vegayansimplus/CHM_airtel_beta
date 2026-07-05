import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router";
import { Box, GlobalStyles, Stack, Typography, useTheme } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";

import { useTabColorTokens } from "../../../../style/theme";
import CustomActionButton from "../../../../components/common/CustomActionButton";

import { useGetCrqReviewQuery } from "../../api/crqreviewApiSlice";
import { useUpdateImpactAnalysisStatusMutation } from "../../api/schedulerApiSlice";
import { getStageConfig } from "../../constants/stageConfig";
import { useStageWorkflow } from "../../hook/useStageWorkflow";
import { filterPlansBySearch } from "../../util/filterPlansBySearch";
import type { Crq, Plan } from "../../types/crqWorkflow.types";
import type { StageKey } from "../../types/stageWorkflow.types";
import {
  WORKFLOW_STAGES,
  getStageSummaryFields,
  resolveCurrentStageIndex,
  type WorkflowStageId,
} from "../../constants/workflowStages";

import { CrqWorkflowSidebar } from "../crq-workflow/CrqWorkflowSidebar";
import { CrqWorkflowHeader } from "../crq-workflow/CrqWorkflowHeader";
import { StageRail } from "../crq-workflow/StageRail";
import { StageActionBar, type StageMode } from "../crq-workflow/StageActionBar";
import { StageSummaryGrid } from "../crq-workflow/StageSummaryGrid";

import { PlanInvDialog } from "../dialog/plan-inv-preview/PlanInvDialog";
import { StageReviewDialog } from "../generic/dialog/StageReviewDialog";
import { PrevCrqStatusDialog } from "../dialog/impact/PrevCrqStatusDialog";
import { PREV_CRQ_STATUS_DATA } from "../impact-analysis/mockData";

const GlobalStyleBlock = (
  <GlobalStyles
    styles={{
      ".expand-chevron": {
        transition: "transform 0.22s cubic-bezier(.4,0,.2,1)",
        display: "flex",
      },
      ".expand-chevron.open": { transform: "rotate(90deg)" },
    }}
  />
);

/**
 * Single-CRQ workflow cockpit at /scheduler/crqWorkflow/:crqNo. Reuses the
 * exact same data + mutations as the list pages (useGetCrqReviewQuery,
 * useUpdateImpactAnalysisStatusMutation for the Plan & Inventory / Review
 * stage, useStageWorkflow + STAGE_CONFIG_MAP for the other six) and the
 * exact same dialogs (PlanInvDialog, StageReviewDialog, PrevCrqStatusDialog)
 * - only the surrounding navigation (sidebar tree + stage rail) is new.
 */
export const CrqDetailedView: React.FC = () => {
  const theme = useTheme();
  const colors = useTabColorTokens(theme);
  const navigate = useNavigate();
  const { crqNo } = useParams<{ crqNo: string }>();

  const [plansOriginal, setPlansOriginal] = useState<Plan[]>([]);
  const [expPlans, setExpPlans] = useState<Record<string, boolean>>({});
  const [expCrqs, setExpCrqs] = useState<Record<string, boolean>>({});
  const [selectedCrqNo, setSelectedCrqNo] = useState<string | null>(crqNo ?? null);
  const [selectedStageId, setSelectedStageId] = useState<WorkflowStageId>("review");
  const [hasInitializedSelection, setHasInitializedSelection] = useState(false);

  const [globalSearchInput, setGlobalSearchInput] = useState("");
  const [globalSearch, setGlobalSearch] = useState("");

  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [prevCrqStatusOpen, setPrevCrqStatusOpen] = useState(false);
  const [prevCrqData, setPrevCrqData] = useState<any | null>(null);

  const { data, isError, error } = useGetCrqReviewQuery({ domainId: 1, subDomainId: 1 });
  const [updateImpactAnalysisStatus] = useUpdateImpactAnalysisStatusMutation();

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
  const selectedStageStatus = selectedCrq ? (selectedCrq as any)[WORKFLOW_STAGES[selectedStageIndex].statusField] : undefined;
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
      navigate(`/scheduler/crqWorkflow/${crq.crqNo}`, { replace: true });
    },
    [navigate],
  );
  const handleSelectStage = useCallback((stageId: WorkflowStageId) => setSelectedStageId(stageId), []);

  const handleStartPause = useCallback(async () => {
    if (!selectedCrq) return;

    if (isReviewStage) {
      const isRunningNow =
        (selectedCrq.impactAnalysisStatus ?? selectedCrq.crqReviewStatus ?? "").toLowerCase() === "in progress";
      const action = isRunningNow ? "pause" : "start";
      try {
        const response = await updateImpactAnalysisStatus({
          crqNo: selectedCrq.crqNo,
          crqId: selectedCrq.crqId,
          action,
        }).unwrap();
        toast.success(response?.message || "Updated successfully.");
        setPlansOriginal((prev) =>
          prev.map((plan) => ({
            ...plan,
            crqs: plan.crqs.map((c) =>
              c.crqNo === selectedCrq.crqNo
                ? { ...c, impactAnalysisStatus: isRunningNow ? "Paused" : "In Progress" }
                : c,
            ),
          })),
        );
      } catch (err) {
        toast.error((err as any)?.data?.message || "Failed to update status. Please try again.");
      }
      return;
    }

    if (!activeStageWorkflow) return;
    const result = await activeStageWorkflow.toggleStartPause(selectedCrq);
    if (!result.success) return;
    const statusField = getStageConfig(selectedStageId as StageKey).statusField;
    setPlansOriginal((prev) =>
      prev.map((plan) => ({
        ...plan,
        crqs: plan.crqs.map((c) => (c.crqNo === selectedCrq.crqNo ? { ...c, [statusField]: result.nextStatus } : c)),
      })),
    );
  }, [selectedCrq, isReviewStage, activeStageWorkflow, selectedStageId, updateImpactAnalysisStatus]);

  const handleSubmitDone = useCallback(
    async (values: Record<string, any>, crq: Crq) => {
      if (isReviewStage || !activeStageWorkflow) return { success: false };
      const result = await activeStageWorkflow.submitDone(values, crq);
      if (result.success) {
        const statusField = getStageConfig(selectedStageId as StageKey).statusField;
        setPlansOriginal((prev) =>
          prev.map((plan) => ({
            ...plan,
            crqs: plan.crqs.map((c) => (c.crqNo === crq.crqNo ? { ...c, [statusField]: values.status } : c)),
          })),
        );
      }
      return result;
    },
    [isReviewStage, activeStageWorkflow, selectedStageId],
  );

  const handleShowPrevCrqStatus = useCallback(() => {
    if (!selectedCrq) return;
    let matchedCrq: any = null;
    for (const plan of PREV_CRQ_STATUS_DATA.plans) {
      const found = plan.crqs.find((c: any) => c.crqNo === selectedCrq.crqNo);
      if (found) {
        matchedCrq = { ...found, planNumber: plan.planNumber, planType: plan.planType };
        break;
      }
    }
    if (matchedCrq) {
      setPrevCrqData(matchedCrq);
      setPrevCrqStatusOpen(true);
    } else {
      toast.warn("No previous CRQ status found for the selected CRQ.");
    }
  }, [selectedCrq]);

  if (isError) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">
          Failed to load CRQ details. {(error as any)?.error || "Please refresh."}
        </Typography>
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
      <Box sx={{ flex: 1, display: "flex", minHeight: 0 }}>
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

        <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {!selectedCrq ? (
            <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Typography sx={{ color: colors.textDim }}>
                {!plansOriginal.length
                  ? "Loading CRQ workflow…"
                  : selectedCrqNo
                    ? `No CRQ found for ${selectedCrqNo}.`
                    : "Select a CRQ from the left to view its workflow."}
              </Typography>
            </Box>
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

              <Box sx={{ flex: 1, overflowY: "auto", p: 2.5 }}>
                <Stack direction="row" justifyContent="flex-end" sx={{ mb: 1.5 }}>
                  <CustomActionButton
                    label="Show Prev CRQ Status"
                    onClick={handleShowPrevCrqStatus}
                    startIcon={<VisibilityIcon sx={{ fontSize: 16 }} />}
                    colors={colors}
                  />
                </Stack>

                <StageActionBar
                  stageLabel={WORKFLOW_STAGES[selectedStageIndex].label}
                  mode={stageMode}
                  isRunning={isRunning}
                  onStartPause={handleStartPause}
                  onReview={() => setReviewDialogOpen(true)}
                  isBusy={activeStageWorkflow?.isTogglingStatus}
                  colors={colors}
                />

                <StageSummaryGrid fields={getStageSummaryFields(selectedStageId, selectedCrq)} colors={colors} />
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
          onSubmit={(data) => {
            console.log("Review Submitted:", data);
          }}
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
    </Box>
  );
};

export default CrqDetailedView;
