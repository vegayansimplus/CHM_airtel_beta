import type { CrqJourneyData, CrqInfo } from "../types/crqJourney.types";

// ─── CRQ Dropdown List (used in CRQ selector) ────────────────────────────────
export const CRQ_LIST: Pick<CrqInfo, "id" | "title" | "status" | "priority">[] = [
  { id: "CRQ-2026-001234", title: "Core Router Upgrade",          status: "in_progress", priority: "high"   },
  { id: "CRQ-2026-001189", title: "Firewall Policy Refresh",      status: "pending",     priority: "medium" },
  { id: "CRQ-2026-001100", title: "BGP Route Redistribution",     status: "completed",   priority: "low"    },
  { id: "CRQ-2026-001050", title: "MPLS Label Stack Optimisation",status: "pending",     priority: "high"   },
];

// ─── Full Journey Data per CRQ ────────────────────────────────────────────────
export const CRQ_JOURNEY_MOCK: Record<string, CrqJourneyData> = {
  "CRQ-2026-001234": {
    crqInfo: {
      id:           "CRQ-2026-001234",
      title:        "Core Router Upgrade",
      requester:    "NOC Team",
      priority:     "high",
      createdOn:    "12 May 2026, 10:30 AM",
      status:       "in_progress",
      slaRemaining: "18h 25m Remaining",
    },
    flowData: {
      parallelActivities: {
        row1: [
          { id: "pa1", label: "SPOC / FE Assignment", iconType: "team",      status: "completed" },
          { id: "pa2", label: "Field Readiness",       iconType: "tools",     status: "completed" },
        ],
        row2: [
          { id: "pa3", label: "Plan & Inventory Validation", iconType: "clipboard", status: "completed" },
          { id: "pa4", label: "Impact Analysis",             iconType: "chart",     status: "completed" },
        ],
      },
      mopSteps: [
        { id: "mop1", label: "MOP Creation",   status: "completed"   },
        { id: "mop2", label: "MOP Validation", status: "in_progress" },
      ],
      approvalTriggers: [
        { id: "ap1", name: "Mobility",  icon: "mobility",  status: "approved" },
        { id: "ap2", name: "B2B",       icon: "b2b",       status: "approved" },
        { id: "ap3", name: "Telemedia", icon: "telemedia", status: "pending"  },
        { id: "ap4", name: "NOC Head",  icon: "user",      status: "approved" },
      ],
      schedulingSteps: [
        { id: "sc1", label: "Activity Scheduling",    iconType: "calendar", status: "pending" },
        { id: "sc2", label: "CAB",                    iconType: "team",     status: "pending" },
        { id: "sc3", label: "Conflict Check",         iconType: "shield",   status: "pending" },
        { id: "sc4", label: "Implementation Approval",iconType: "check",    status: "pending" },
      ],
      executionSteps: [
        { id: "ex1", label: "Activity Implementation", iconType: "tools",  status: "not_started" },
        { id: "ex2", label: "CRQ Closure",             iconType: "check",  status: "not_started" },
      ],
    },
  },

  "CRQ-2026-001189": {
    crqInfo: {
      id:           "CRQ-2026-001189",
      title:        "Firewall Policy Refresh",
      requester:    "Security Team",
      priority:     "medium",
      createdOn:    "08 May 2026, 09:00 AM",
      status:       "pending",
      slaRemaining: "36h 10m Remaining",
    },
    flowData: {
      parallelActivities: {
        row1: [
          { id: "pa1", label: "SPOC / FE Assignment", iconType: "team",  status: "completed" },
          { id: "pa2", label: "Field Readiness",       iconType: "tools", status: "pending"   },
        ],
        row2: [
          { id: "pa3", label: "Plan & Inventory Validation", iconType: "clipboard", status: "pending" },
          { id: "pa4", label: "Impact Analysis",             iconType: "chart",     status: "pending" },
        ],
      },
      mopSteps: [
        { id: "mop1", label: "MOP Creation",   status: "pending"     },
        { id: "mop2", label: "MOP Validation", status: "not_started" },
      ],
      approvalTriggers: [
        { id: "ap1", name: "Mobility",  icon: "mobility",  status: "pending" },
        { id: "ap2", name: "B2B",       icon: "b2b",       status: "pending" },
        { id: "ap3", name: "Telemedia", icon: "telemedia", status: "pending" },
      ],
      schedulingSteps: [
        { id: "sc1", label: "Activity Scheduling",    iconType: "calendar", status: "not_started" },
        { id: "sc2", label: "CAB",                    iconType: "team",     status: "not_started" },
        { id: "sc3", label: "Conflict Check",         iconType: "shield",   status: "not_started" },
        { id: "sc4", label: "Implementation Approval",iconType: "check",    status: "not_started" },
      ],
      executionSteps: [
        { id: "ex1", label: "Activity Implementation", iconType: "tools", status: "not_started" },
        { id: "ex2", label: "CRQ Closure",             iconType: "check", status: "not_started" },
      ],
    },
  },
};
