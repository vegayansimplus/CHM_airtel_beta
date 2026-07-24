import React, { useEffect, useMemo } from "react";
import { Box, Skeleton, Stack, Typography } from "@mui/material";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "react-toastify";

import type { Colors } from "../../../types/colorTypes";
import type { WorkflowStageId } from "../../../constants/workflowStages";
import { useStageAttributeData } from "../hooks/useStageAttributeData";
import { useSaveAttributeUpdateMutation } from "../api/attributeUpdateApiSlice";
import {
  buildAttributeFormDefaults,
  buildAttributeSaveSections,
  computeStageCompletion,
  type AttributeFormValues,
} from "../utils/attributeUpdate.utils";
import { AttributeApiChips } from "./AttributeApiChips";
import { RemedySubStatusBar } from "./RemedySubStatusBar";
import { AttributeSection } from "./AttributeSection";
import { AttributeDialogFooter } from "./AttributeDialogFooter";

interface WorkflowStageCardBodyProps {
  stageId: WorkflowStageId;
  crqNo: string;
  isEditable: boolean;
  colors: Colors;
}

/** Cheap, stable placeholder defaults - the real values are seeded once the
 * live fetch resolves (see the reset() effect below), so there is no need
 * to walk the full attribute catalog just to compute react-hook-form's
 * initial (and normally throwaway) defaultValues. */
const EMPTY_FORM_DEFAULTS: AttributeFormValues = { remedy: {}, cab: {}, planningTool: {} };

/**
 * The actual data-fetching, form-bound body of one workflow stage card -
 * split out of WorkflowStageCard so it only ever mounts (and only ever pays
 * for its GET request, react-hook-form instance, and live-watch
 * subscription) once that card is genuinely open: immediately for the
 * CRQ's current/editable stage, lazily for any history stage the user
 * expands. Pending stages never mount this at all.
 */
export const WorkflowStageCardBody: React.FC<WorkflowStageCardBodyProps> = React.memo(
  function WorkflowStageCardBody({ stageId, crqNo, isEditable, colors }) {
    const { cmsStage, isLoading, error, stageView, setRemedyStatusIndex } =
      useStageAttributeData(stageId, crqNo);

    const [saveAttributeUpdate, { isLoading: isSaving }] = useSaveAttributeUpdateMutation();
    const {
      control,
      handleSubmit,
      reset,
      formState: { errors },
    } = useForm<AttributeFormValues>({ defaultValues: EMPTY_FORM_DEFAULTS });

    // Seed the form once this stage's live values load (or reload after a
    // successful Save). No-op for view cards - they never submit.
    useEffect(() => {
      if (isEditable) reset(buildAttributeFormDefaults(stageView));
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stageView, isEditable]);

    // Live-watch only matters for the editable card's mandatory-completion
    // pill; skipped (and unsubscribed) entirely for view cards.
    const liveFormValues = useWatch({ control, disabled: !isEditable });
    const completion = useMemo(
      () =>
        stageView && isEditable
          ? computeStageCompletion(stageView, liveFormValues as AttributeFormValues)
          : { filled: 0, total: 0 },
      [stageView, isEditable, liveFormValues],
    );

    const onSave = handleSubmit(async (values) => {
      if (!stageView) return;
      const sections = buildAttributeSaveSections(stageView, values);
      try {
        const response = await saveAttributeUpdate({ crqNo, cmsStage, ...sections }).unwrap();
        toast.success(response?.message || "Attributes saved.");
      } catch (err) {
        toast.error(
          (err as any)?.data?.message || "Failed to save attributes. Please try again.",
        );
      }
    });

    if (isLoading) {
      return (
        <Stack spacing={0}>
          <Skeleton variant="rounded" height={44} sx={{ mb: 1.5, borderRadius: "12px" }} />
          <Skeleton variant="rounded" height={110} sx={{ mb: 1.5, borderRadius: "12px" }} />
          <Skeleton variant="rounded" height={110} sx={{ borderRadius: "12px" }} />
        </Stack>
      );
    }

    if (error) {
      return (
        <Typography color="error" sx={{ fontSize: 13, py: 2 }}>
          {error}
        </Typography>
      );
    }

    if (!stageView) return null;

    return (
      <>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <AttributeApiChips colors={colors} />
          {isEditable && completion.total > 0 && (
            <Typography sx={{ fontSize: 11, fontWeight: 600, color: colors.textSecondary, mb: 1.5 }}>
              {completion.filled}/{completion.total} mandatory
            </Typography>
          )}
        </Box>

        {stageView.stage.remedyStatuses.length > 1 && (
          <RemedySubStatusBar
            statuses={stageView.stage.remedyStatuses}
            activeIndex={stageView.stage.remedyStatuses.indexOf(stageView.activeRemedyStatus)}
            onSelect={setRemedyStatusIndex}
            colors={colors}
          />
        )}

        <AttributeSection
          system="remedy"
          attributes={stageView.remedyAttributes}
          control={control}
          errors={errors}
          viewOnly={!isEditable}
          colors={colors}
        />
        <AttributeSection
          system="cab"
          attributes={stageView.cabAttributes}
          control={control}
          errors={errors}
          viewOnly={!isEditable}
          colors={colors}
        />
        <AttributeSection
          system="planningTool"
          attributes={stageView.planningToolVisible}
          backendAttributes={stageView.planningToolBackend}
          control={control}
          errors={errors}
          viewOnly={!isEditable}
          colors={colors}
        />

        {isEditable && (
          <AttributeDialogFooter
            canGoPrevious={false}
            canGoNext={false}
            onPrevious={() => {}}
            onNext={() => {}}
            onCancel={() => reset(buildAttributeFormDefaults(stageView))}
            onSave={onSave}
            isSaving={isSaving}
            navigationEnabled={false}
            colors={colors}
          />
        )}
      </>
    );
  },
);

export default WorkflowStageCardBody;
