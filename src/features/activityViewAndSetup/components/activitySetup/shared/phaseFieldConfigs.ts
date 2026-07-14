// Single source describing the 6 activity phases. Drives both the create-time
// input form (PhaseConfigSection, keyed by insertKey — matches the flat
// ActivityInsertRequestDTO field prefixes) and the read-only viewer
// (PhaseSummaryTab, keyed by viewKey — matches GET /activity/phase-view's
// phases map keys).

export type PhaseVariant = "slim" | "full";

export interface PhaseFieldConfig {
  /** Prefix used in the flat /activity/insert payload, e.g. "crqReview" -> crqReviewShift */
  insertKey: string;
  /** Key used in the GET /activity/phase-view "phases" map (or "execution" top-level field) */
  viewKey: string;
  label: string;
  variant: PhaseVariant;
}

export const PHASE_CONFIGS: PhaseFieldConfig[] = [
  { insertKey: "crqReview", viewKey: "review", label: "CRQ Review", variant: "slim" },
  { insertKey: "impactAnalysis", viewKey: "impactAnalysis", label: "Impact Analysis", variant: "slim" },
  { insertKey: "scheduling", viewKey: "scheduling", label: "Scheduling", variant: "slim" },
  { insertKey: "mopCreate", viewKey: "mopCreation", label: "MOP Creation", variant: "slim" },
  { insertKey: "mopValidate", viewKey: "mopValidation", label: "MOP Validation", variant: "slim" },
  { insertKey: "crqExecution", viewKey: "execution", label: "Execution", variant: "full" },
];
