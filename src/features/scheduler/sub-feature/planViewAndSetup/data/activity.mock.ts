import type { Activity, SelectOption } from "../types/activity.types";

// ─────────────────────────────────────────────
//  Static Mock Data — Activities
// ─────────────────────────────────────────────

export const MOCK_ACTIVITIES: Activity[] = [
  {
    id: "ACT-001",
    activityName: "5G LKF Upgrade",
    chmDomain: "RAN",
    chmSubDomain: "Access",
    domain: "Access",
    layer: "L3",
    planType: "Plan-A",
    vendorOEM: "Nokia",
    changeImpact: "High",
    status: "Active",
    createdAt: "2024-11-01",
    updatedAt: "2024-11-15",
    phases: {
      review: {
        crqReviewShift: "Day",
        crqReviewMinLevel: "L2",
        crqReviewTimeMinutes: 30,
      },
      impactAnalysis: {
        impactAnalysisShift: "Night",
        impactAnalysisMinLevel: "L2",
        impactAnalysisTimeMinutes: 60,
      },
      scheduling: {
        schedulingShift: "Day",
        schedulingLevel: "L3",
        schedulingDurationMinutes: 45,
      },
      mopCreation: {
        mopCreationShift: "Day",
        mopCreationMinLevel: "L2",
        mopCreationTimeMinutes: 90,
      },
      mopValidation: {
        mopValidationShift: "Evening",
        mopValidationMinLevel: "L2",
        mopValidationTimeMinutes: 45,
      },
      execution: {
        activityNWExecShift: "Night",
        daysMargin: 3,
        reservationMargin: 2,
        activityTimeMinutes: 120,
        executionMinLevel: "L3",
        rollbackTimeMinutes: 30,
      },
    },
  },
  {
    id: "ACT-002",
    activityName: "Fiber Cutover",
    chmDomain: "Transport",
    chmSubDomain: "Transmission",
    domain: "Core",
    layer: "L2",
    planType: "Plan-B",
    vendorOEM: "STL",
    changeImpact: "Medium",
    status: "Active",
    createdAt: "2024-11-03",
    updatedAt: "2024-11-18",
    phases: {
      review: {
        crqReviewShift: "Day",
        crqReviewMinLevel: "L1",
        crqReviewTimeMinutes: 20,
      },
      impactAnalysis: {
        impactAnalysisShift: "Day",
        impactAnalysisMinLevel: "L1",
        impactAnalysisTimeMinutes: 40,
      },
      scheduling: {
        schedulingShift: "Evening",
        schedulingLevel: "L2",
        schedulingDurationMinutes: 30,
      },
      mopCreation: {
        mopCreationShift: "Day",
        mopCreationMinLevel: "L1",
        mopCreationTimeMinutes: 60,
      },
      mopValidation: {
        mopValidationShift: "Day",
        mopValidationMinLevel: "L1",
        mopValidationTimeMinutes: 30,
      },
      execution: {
        activityNWExecShift: "Night",
        daysMargin: 2,
        reservationMargin: 1,
        activityTimeMinutes: 90,
        executionMinLevel: "L2",
        rollbackTimeMinutes: 20,
      },
    },
  },
  {
    id: "ACT-003",
    activityName: "4G Capacity Expansion",
    chmDomain: "RAN",
    chmSubDomain: "Access",
    domain: "Access",
    layer: "L1",
    planType: "Plan-C",
    vendorOEM: "Ericsson",
    changeImpact: "Low",
    status: "Draft",
    createdAt: "2024-11-05",
    updatedAt: "2024-11-10",
    phases: {
      review: { crqReviewShift: "", crqReviewMinLevel: "", crqReviewTimeMinutes: "" },
      impactAnalysis: { impactAnalysisShift: "", impactAnalysisMinLevel: "", impactAnalysisTimeMinutes: "" },
      scheduling: { schedulingShift: "", schedulingLevel: "", schedulingDurationMinutes: "" },
      mopCreation: { mopCreationShift: "", mopCreationMinLevel: "", mopCreationTimeMinutes: "" },
      mopValidation: { mopValidationShift: "", mopValidationMinLevel: "", mopValidationTimeMinutes: "" },
      execution: { activityNWExecShift: "", daysMargin: "", reservationMargin: "", activityTimeMinutes: "", executionMinLevel: "", rollbackTimeMinutes: "" },
    },
  },
  {
    id: "ACT-004",
    activityName: "MW Link Commissioning",
    chmDomain: "Transport",
    chmSubDomain: "Transmission",
    domain: "Transmission",
    layer: "L2",
    planType: "Plan-A",
    vendorOEM: "Huawei",
    changeImpact: "High",
    status: "Pending",
    createdAt: "2024-11-07",
    updatedAt: "2024-11-12",
    phases: {
      review: {
        crqReviewShift: "Night",
        crqReviewMinLevel: "L3",
        crqReviewTimeMinutes: 45,
      },
      impactAnalysis: {
        impactAnalysisShift: "Night",
        impactAnalysisMinLevel: "L3",
        impactAnalysisTimeMinutes: 90,
      },
      scheduling: {
        schedulingShift: "Night",
        schedulingLevel: "L3",
        schedulingDurationMinutes: 60,
      },
      mopCreation: {
        mopCreationShift: "Day",
        mopCreationMinLevel: "L2",
        mopCreationTimeMinutes: 120,
      },
      mopValidation: {
        mopValidationShift: "Day",
        mopValidationMinLevel: "L3",
        mopValidationTimeMinutes: 60,
      },
      execution: {
        activityNWExecShift: "Night",
        daysMargin: 5,
        reservationMargin: 3,
        activityTimeMinutes: 180,
        executionMinLevel: "L3",
        rollbackTimeMinutes: 45,
      },
    },
  },
  {
    id: "ACT-005",
    activityName: "Core Node Migration",
    chmDomain: "Core",
    chmSubDomain: "EPC",
    domain: "EPC",
    layer: "L3",
    planType: "Plan-B",
    vendorOEM: "Cisco",
    changeImpact: "Medium",
    status: "Active",
    createdAt: "2024-11-09",
    updatedAt: "2024-11-20",
    phases: {
      review: {
        crqReviewShift: "Day",
        crqReviewMinLevel: "L2",
        crqReviewTimeMinutes: 30,
      },
      impactAnalysis: {
        impactAnalysisShift: "Evening",
        impactAnalysisMinLevel: "L2",
        impactAnalysisTimeMinutes: 50,
      },
      scheduling: {
        schedulingShift: "Day",
        schedulingLevel: "L2",
        schedulingDurationMinutes: 40,
      },
      mopCreation: {
        mopCreationShift: "Day",
        mopCreationMinLevel: "L1",
        mopCreationTimeMinutes: 80,
      },
      mopValidation: {
        mopValidationShift: "Evening",
        mopValidationMinLevel: "L2",
        mopValidationTimeMinutes: 40,
      },
      execution: {
        activityNWExecShift: "Night",
        daysMargin: 2,
        reservationMargin: 1,
        activityTimeMinutes: 100,
        executionMinLevel: "L2",
        rollbackTimeMinutes: 25,
      },
    },
  },
  {
    id: "ACT-006",
    activityName: "Optical Amplifier Replacement",
    chmDomain: "Transport",
    chmSubDomain: "Transmission",
    domain: "Transmission",
    layer: "L1",
    planType: "Plan-C",
    vendorOEM: "STL",
    changeImpact: "Low",
    status: "Inactive",
    createdAt: "2024-10-15",
    updatedAt: "2024-10-28",
    phases: {
      review: {
        crqReviewShift: "Day",
        crqReviewMinLevel: "L1",
        crqReviewTimeMinutes: 15,
      },
      impactAnalysis: {
        impactAnalysisShift: "Day",
        impactAnalysisMinLevel: "L1",
        impactAnalysisTimeMinutes: 30,
      },
      scheduling: {
        schedulingShift: "Day",
        schedulingLevel: "L1",
        schedulingDurationMinutes: 20,
      },
      mopCreation: {
        mopCreationShift: "Day",
        mopCreationMinLevel: "L1",
        mopCreationTimeMinutes: 40,
      },
      mopValidation: {
        mopValidationShift: "Day",
        mopValidationMinLevel: "L1",
        mopValidationTimeMinutes: 20,
      },
      execution: {
        activityNWExecShift: "Day",
        daysMargin: 1,
        reservationMargin: 1,
        activityTimeMinutes: 60,
        executionMinLevel: "L1",
        rollbackTimeMinutes: 15,
      },
    },
  },
  {
    id: "ACT-007",
    activityName: "IMS Core Upgrade",
    chmDomain: "Core",
    chmSubDomain: "IMS",
    domain: "EPC",
    layer: "L3",
    planType: "Plan-A",
    vendorOEM: "Nokia",
    changeImpact: "High",
    status: "Draft",
    createdAt: "2024-11-11",
    updatedAt: "2024-11-21",
    phases: {
      review: { crqReviewShift: "Day", crqReviewMinLevel: "L3", crqReviewTimeMinutes: 60 },
      impactAnalysis: { impactAnalysisShift: "", impactAnalysisMinLevel: "", impactAnalysisTimeMinutes: "" },
      scheduling: { schedulingShift: "", schedulingLevel: "", schedulingDurationMinutes: "" },
      mopCreation: { mopCreationShift: "", mopCreationMinLevel: "", mopCreationTimeMinutes: "" },
      mopValidation: { mopValidationShift: "", mopValidationMinLevel: "", mopValidationTimeMinutes: "" },
      execution: { activityNWExecShift: "", daysMargin: "", reservationMargin: "", activityTimeMinutes: "", executionMinLevel: "", rollbackTimeMinutes: "" },
    },
  },
];

// ─────────────────────────────────────────────
//  Dropdown Option Constants
// ─────────────────────────────────────────────

export const CHM_DOMAIN_OPTIONS: SelectOption[] = [
  { label: "RAN", value: "RAN" },
  { label: "Transport", value: "Transport" },
  { label: "Core", value: "Core" },
  { label: "OSS/BSS", value: "OSS/BSS" },
];

export const CHM_SUBDOMAIN_OPTIONS: Record<string, SelectOption[]> = {
  RAN: [
    { label: "Access", value: "Access" },
    { label: "Backhaul", value: "Backhaul" },
  ],
  Transport: [
    { label: "Transmission", value: "Transmission" },
    { label: "IP/MPLS", value: "IP/MPLS" },
  ],
  Core: [
    { label: "EPC", value: "EPC" },
    { label: "IMS", value: "IMS" },
    { label: "5GC", value: "5GC" },
  ],
  "OSS/BSS": [
    { label: "OSS", value: "OSS" },
    { label: "BSS", value: "BSS" },
  ],
};

export const DOMAIN_OPTIONS: SelectOption[] = [
  { label: "Access", value: "Access" },
  { label: "Core", value: "Core" },
  { label: "Transmission", value: "Transmission" },
  { label: "EPC", value: "EPC" },
  { label: "IP/MPLS", value: "IP/MPLS" },
];

export const LAYER_OPTIONS: SelectOption[] = [
  { label: "L1", value: "L1" },
  { label: "L2", value: "L2" },
  { label: "L3", value: "L3" },
];

export const PLAN_TYPE_OPTIONS: SelectOption[] = [
  { label: "Plan-A", value: "Plan-A" },
  { label: "Plan-B", value: "Plan-B" },
  { label: "Plan-C", value: "Plan-C" },
];

export const VENDOR_OPTIONS: SelectOption[] = [
  { label: "Nokia", value: "Nokia" },
  { label: "Ericsson", value: "Ericsson" },
  { label: "Huawei", value: "Huawei" },
  { label: "STL", value: "STL" },
  { label: "Cisco", value: "Cisco" },
  { label: "ZTE", value: "ZTE" },
];

export const CHANGE_IMPACT_OPTIONS: SelectOption[] = [
  { label: "Low", value: "Low" },
  { label: "Medium", value: "Medium" },
  { label: "High", value: "High" },
];

export const SHIFT_OPTIONS: SelectOption[] = [
  { label: "Day", value: "Day" },
  { label: "Night", value: "Night" },
  { label: "Evening", value: "Evening" },
  { label: "All", value: "All" },
];

export const LEVEL_OPTIONS: SelectOption[] = [
  { label: "L1", value: "L1" },
  { label: "L2", value: "L2" },
  { label: "L3", value: "L3" },
];

export const STATUS_OPTIONS: SelectOption[] = [
  { label: "All", value: "" },
  { label: "Active", value: "Active" },
  { label: "Draft", value: "Draft" },
  { label: "Pending", value: "Pending" },
  { label: "Inactive", value: "Inactive" },
];

export const PAGE_SIZE = 5;
