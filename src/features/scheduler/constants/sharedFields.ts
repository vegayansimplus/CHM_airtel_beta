import ThumbUpOutlinedIcon from "@mui/icons-material/ThumbUpOutlined";
import ThumbDownOutlinedIcon from "@mui/icons-material/ThumbDownOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import type { StageFieldConfig, StageStatusOption } from "../types/stageWorkflow.types";

/** Default Pass / Failed / Cancelled outcome set - reused by every stage
 * unless a stage explicitly needs a different set (pass an override to
 * buildStageConfig). */
export const DEFAULT_STATUS_OPTIONS: StageStatusOption[] = [
  {
    value: "Done",
    label: "Pass",
    description: "Stage completed successfully",
    icon: ThumbUpOutlinedIcon,
    palette: "success",
  },
  {
    value: "Failed",
    label: "Failed",
    description: "Stage did not meet requirements",
    icon: ThumbDownOutlinedIcon,
    palette: "error",
  },
  {
    value: "canceled",
    label: "Cancelled",
    description: "Stage was cancelled before completion",
    icon: CancelOutlinedIcon,
    palette: "warning",
  },
];

export const MOCK_CANCELLATION_REASONS = [
  { cancellationReason: "Weather Conditions", cancellationRollbackOwner: "John Doe" },
  { cancellationReason: "Equipment Failure", cancellationRollbackOwner: "Jane Smith" },
  { cancellationReason: "Resource Unavailable", cancellationRollbackOwner: "Admin Team" },
];

/**
 * Reusable "cancellation block" fields - identical across all stages today
 * (send-back team, remedy status, reason, derived rollback owner, remedy
 * remark). Spread this into any stage's `fields` array.
 */
export const CANCELLATION_FIELDS: StageFieldConfig[] = [
  {
    name: "cygnetStatus",
    label: "Send activity back to",
    type: "select",
    options: [
      { label: "Planning Team", value: "REJECT_TO_PLANNING" },
      { label: "Operations Team", value: "REJECT_TO_OPERATIONS" },
    ],
    visibleWhen: (v) => v.status === "canceled",
    requiredWhen: (v) => v.status === "canceled",
  },
  {
    name: "field1",
    label: "Remedy Status",
    type: "select",
    options: [{ label: "Cancelled", value: "Cancelled" }],
    visibleWhen: (v) => v.status === "canceled",
    requiredWhen: (v) => v.status === "canceled",
  },
  {
    name: "cancellationReason",
    label: "Cancellation Reason",
    type: "select",
    options: MOCK_CANCELLATION_REASONS.map((r) => ({
      label: r.cancellationReason,
      value: r.cancellationReason,
    })),
    visibleWhen: (v) => v.status === "canceled",
    requiredWhen: (v) => v.status === "canceled",
  },
  {
    name: "field4",
    label: "Cancellation Rejection Owner",
    type: "readonly",
    visibleWhen: (v) => v.status === "canceled",
    deriveValue: (v) =>
      MOCK_CANCELLATION_REASONS.find(
        (r) => r.cancellationReason === v.cancellationReason,
      )?.cancellationRollbackOwner ?? "",
  },
  {
    name: "field5",
    label: "Remedy Remark",
    type: "textarea",
    placeholder: "Enter cancellation remark…",
    visibleWhen: (v) => v.status === "canceled",
    requiredWhen: (v) => v.status === "canceled",
  },
];

/** Always-present "Additional Notes" remark field, required only for
 * Failed/Cancelled outcomes - shared across every stage. */
export const REMARK_FIELD: StageFieldConfig = {
  name: "remark",
  label: "CHM Remark",
  type: "textarea",
  placeholder: "Enter any additional remarks or observations…",
  requiredWhen: (v) => v.status === "Failed" || v.status === "canceled",
};
