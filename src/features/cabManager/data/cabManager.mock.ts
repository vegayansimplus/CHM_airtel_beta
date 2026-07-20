import type {
  AdminAnalytics,
  AdminUser,
  AssignMatrixCell,
  AssignRule,
  AuditEntry,
  CabAgendaItem,
  CabPlanDate,
  CabQueueRow,
  CabSession,
  Crq,
  CrqJourney,
  CrqcurrentStage,
  DashboardData,
  EscalationRow,
  // EXECUTIONDetail,
  ImpactCode,
  ImplementationDetail,
  MyCrqsResponse,
  Persona,
  RejectionReason,
  Role,
  SeRing,
  ServiceApprovalRule,
} from "../types/types";

// ─────────────────────────────────────────────────────────────────────────────
//  Mock data — ported verbatim from CAB Portal design (Claude Design HTML).
//  Used by the RTK Query slice (queryFn) and as importable seed for tests.
// ─────────────────────────────────────────────────────────────────────────────

export const currentStageS: CrqcurrentStage[] = [
  "VALcrqNoATE",
  "IMPACT_ANALYSIS",
  "MOP_CREATION",
  "MOP_VALcrqNoATION",
  "SCHEDULING_APPROVAL",
  "EXECUTION",
  "CLOSURE",
];

// ── Personas / role switcher ────────────────────────────────────────────────
export const ROLES: Record<Role, Persona> = {
  admin:       { role: "admin",       name: "Amit Verma",     title: "CTO · All Domains",        shortTitle: "CTO",          olm: "amver01", initials: "AV", color: "#1565C0", home: "dashboard" },
  requester:   { role: "requester",   name: "Karan Mehta",    title: "NOC L2 · Requester",       shortTitle: "NOC L2",       olm: "karme07", initials: "KM", color: "#00796B", home: "mycrqs" },
  stakeholder: { role: "stakeholder", name: "Priya Deshmukh", title: "COH Optics · Stakeholder", shortTitle: "COH Optics",   olm: "prcrqNoes3", initials: "PD", color: "#C2185B", home: "mycrqs" },
  cabEngineer: { role: "cabEngineer", name: "Ravi Nair",      title: "NOC · CAB Engineer",       shortTitle: "CAB Engineer", olm: "ravna02", initials: "RN", color: "#5D4037", home: "cabPlanning" },
  cabMember:   { role: "cabMember",   name: "Sneha Iyer",     title: "SPOC · CAB Member",        shortTitle: "SPOC IP Core", olm: "sneiy04", initials: "SI", color: "#7B1FA2", home: "cabSessions" },
  se:          { role: "se",          name: "Arjun Rao",      title: "Field SE · EXECUTION",shortTitle: "Field SE",     olm: "arjra09", initials: "AR", color: "#E64A19", home: "EXECUTION" },
};

export const ROLE_SCREENS: Record<Role, string[]> = {
  admin:       ["dashboard", "cabPlanning", "cabSessions", "allcrqs", "journey", "admin"],
  requester:   ["dashboard", "cabSessions", "mycrqs", "journey"],
  stakeholder: ["dashboard", "cabSessions", "mycrqs", "journey"],
  cabEngineer: ["dashboard", "cabSessions", "allcrqs", "journey"],
  cabMember:   ["dashboard", "cabSessions", "journey"],
  se:          ["dashboard", "cabSessions", "EXECUTION", "journey"],
};

// ── Core CRQ dataset ────────────────────────────────────────────────────────
export const MOCK_CRQS: Crq[] = [
  {
    crqNo: "CRQ-2026-0418",
    planId: "PLAN-2026-0001",
    domain: "Optics",
    circleCode: "MH",
    currentStage: "VALIDATE",
    slaPercentage: 82,
    impact: "SA",
    currentStatus: "pending",
    approverName: "Amit Verma",
    assignStartTime: "Jun 14",
    window: "02:00 – 05:00 IST",
    raisedBy: "Karan Mehta (NOC L2)",
    raisedOn: "Jun 09, 14:32",
    assignedToMe: false,
  },
  {
    crqNo: "CRQ-2026-0421",
    planId: "PLAN-2026-0002",
    domain: "IP Core",
    circleCode: "KA",
    currentStage: "VALIDATE",
    slaPercentage: 34,
    impact: "NSA",
    currentStatus: "pending",
    approverName: "Sneha Iyer",
    assignStartTime: "Jun 16",
    window: "01:00 – 04:00 IST",
    raisedBy: "Divya Nair (Eng)",
    raisedOn: "Jun 10, 09:11",
    assignedToMe: false,
  },
  {
    crqNo: "CRQ-2026-0422",
    planId: "PLAN-2026-0003",
    domain: "Optics",
    circleCode: "GJ",
    currentStage: "SCHEDULING_APPROVAL",
    slaPercentage: 58,
    impact: "SA",
    currentStatus: "pending",
    approverName: "Priya Deshmukh",
    assignStartTime: "Jun 15",
    window: "00:30 – 03:30 IST",
    raisedBy: "Karan Mehta (NOC L2)",
    raisedOn: "Jun 10, 11:04",
    assignedToMe: false,
  },
  {
    crqNo: "CRQ-2026-0423",
    planId: "PLAN-2026-0004",
    domain: "IP Core",
    circleCode: "DL",
    currentStage: "MOP_VALIDATION",
    slaPercentage: 71,
    impact: "NSA",
    currentStatus: "pending",
    approverName: "Sneha Iyer",
    assignStartTime: "Jun 17",
    window: "02:00 – 05:00 IST",
    raisedBy: "Rohit Bansal (Eng)",
    raisedOn: "Jun 10, 16:48",
    assignedToMe: false,
  },
  {
    crqNo: "CRQ-2026-0424",
    planId: "PLAN-2026-0005",
    domain: "Optics",
    circleCode: "TN",
    currentStage: "VALIDATE",
    slaPercentage: 88,
    impact: "SA",
    currentStatus: "pending",
    approverName: "Amit Verma",
    assignStartTime: "Jun 14",
    window: "01:00 – 04:00 IST",
    raisedBy: "Lakshmi Iyer (NOC)",
    raisedOn: "Jun 09, 22:10",
    assignedToMe: false,
  },
  {
    crqNo: "CRQ-2026-0425",
    planId: "PLAN-2026-0006",
    domain: "Packet",
    circleCode: "AP",
    currentStage: "VALIDATE",
    slaPercentage: 28,
    impact: "NSA",
    currentStatus: "pending",
    approverName: "Anil Kumar",
    assignStartTime: "Jun 18",
    window: "02:00 – 04:30 IST",
    raisedBy: "Divya Nair (Eng)",
    raisedOn: "Jun 11, 10:01",
    assignedToMe: false,
  },
  {
    crqNo: "CRQ-2026-0419",
    planId: "PLAN-2026-0007",
    domain: "Mobility",
    circleCode: "MH",
    currentStage: "EXECUTION",
    slaPercentage: 12,
    impact: "NSA",
    currentStatus: "approved",
    approverName: "Kavya Reddy",
    assignStartTime: "Jun 12",
    window: "01:30 – 03:30 IST",
    raisedBy: "Ashwin Pillai (RAN)",
    raisedOn: "Jun 08, 19:22",
    assignedToMe: false,
  },
  {
    crqNo: "CRQ-2026-0420",
    planId: "PLAN-2026-0008",
    domain: "Mobility",
    circleCode: "WB",
    currentStage: "VALIDATE",
    slaPercentage: 64,
    impact: "SA",
    currentStatus: "pending",
    approverName: "Amit Verma",
    assignStartTime: "Jun 15",
    window: "02:00 – 04:00 IST",
    raisedBy: "Ashwin Pillai (RAN)",
    raisedOn: "Jun 10, 08:15",
    assignedToMe: false,
  },
  {
    crqNo: "CRQ-2026-0415",
    planId: "PLAN-2026-0009",
    domain: "IP Core",
    circleCode: "UP-E",
    currentStage: "VALIDATE",
    slaPercentage: 92,
    impact: "NSA",
    currentStatus: "rejected",
    approverName: "Sneha Iyer",
    assignStartTime: "Jun 12",
    window: "02:00 – 03:30 IST",
    raisedBy: "Rohit Bansal (Eng)",
    raisedOn: "Jun 06, 14:00",
    assignedToMe: false,
  },
  {
    crqNo: "CRQ-2026-0417",
    planId: "PLAN-2026-0010",
    domain: "Packet",
    circleCode: "KA",
    currentStage: "SCHEDULING_APPROVAL",
    slaPercentage: 55,
    impact: "NSA",
    currentStatus: "pending",
    approverName: "Anil Kumar",
    assignStartTime: "Jun 16",
    window: "02:00 – 04:00 IST",
    raisedBy: "Divya Nair (Eng)",
    raisedOn: "Jun 09, 17:30",
    assignedToMe: false,
  },
  {
    crqNo: "CRQ-2026-0426",
    planId: "PLAN-2026-0011",
    domain: "Embedded",
    circleCode: "RJ",
    currentStage: "VALIDATE",
    slaPercentage: 40,
    impact: "NSA",
    currentStatus: "pending",
    approverName: "Rahul Sharma",
    assignStartTime: "Jun 19",
    window: "02:30 – 04:30 IST",
    raisedBy: "Vikram Joshi (Embedded)",
    raisedOn: "Jun 11, 11:25",
    assignedToMe: false,
  },
  {
    crqNo: "CRQ-2026-0414",
    planId: "PLAN-2026-0012",
    domain: "Embedded",
    circleCode: "MH",
    currentStage: "EXECUTION",
    slaPercentage: 18,
    impact: "SA",
    currentStatus: "approved",
    approverName: "Rahul Sharma",
    assignStartTime: "Jun 12",
    window: "02:00 – 03:00 IST",
    raisedBy: "Meera Krishnan (Sec)",
    raisedOn: "Jun 07, 09:50",
    assignedToMe: false,
  },
  {
    crqNo: "CRQ-2026-0413",
    planId: "PLAN-2026-0013",
    domain: "Embedded",
    circleCode: "DL",
    currentStage: "VALIDATE",
    slaPercentage: 76,
    impact: "NSA",
    currentStatus: "pending",
    approverName: "Amit Verma",
    assignStartTime: "Jun 15",
    window: "03:00 – 04:00 IST",
    raisedBy: "Vikram Joshi (Embedded)",
    raisedOn: "Jun 09, 12:15",
    assignedToMe: false,
  },
  {
    crqNo: "CRQ-2026-0412",
    planId: "PLAN-2026-0014",
    domain: "Packet",
    circleCode: "MP",
    currentStage: "VALIDATE",
    slaPercentage: 81,
    impact: "SA",
    currentStatus: "pending",
    approverName: "Amit Verma",
    assignStartTime: "Jun 14",
    window: "01:00 – 04:00 IST",
    raisedBy: "Ashwin Pillai (RAN)",
    raisedOn: "Jun 08, 16:40",
    assignedToMe: false,
  },
  {
    crqNo: "CRQ-2026-0411",
    planId: "PLAN-2026-0015",
    domain: "IP Core",
    circleCode: "WB",
    currentStage: "SCHEDULING_APPROVAL",
    slaPercentage: 47,
    impact: "NSA",
    currentStatus: "pending",
    approverName: "Sneha Iyer",
    assignStartTime: "Jun 18",
    window: "02:00 – 04:00 IST",
    raisedBy: "Rohit Bansal (Eng)",
    raisedOn: "Jun 10, 13:55",
    assignedToMe: false,
  },
];

// ── Colour maps ─────────────────────────────────────────────────────────────
export const DOMAIN_COLOR: Record<string, string> = {
  "IP Core": "#1976D2",
  Optics:    "#7B1FA2",
  Packet:    "#00897B",
  Embedded:  "#5D4037",
  Mobility:  "#E64A19",
};

export const APPROVER_COLOR: Record<string, string> = {
  "Amit Verma":     "#1565C0",
  "Sneha Iyer":     "#7B1FA2",
  "Priya Deshmukh": "#C2185B",
  "Anil Kumar":     "#00796B",
  "Rahul Sharma":   "#5D4037",
  "Kavya Reddy":    "#E64A19",
  "Vikram Joshi":   "#455A64",
};

// ── Rejection reasons by currentStage ──────────────────────────────────────────────
export const currentStage_REJECT_REASONS: Record<CrqcurrentStage, string[]> = {
  VALcrqNoATE:  ["Wrong CRQ Flow – Type of CR", "Incorrect approver mapped", "Wrong Impact - SA, NSA, CNSA", "Duplicate CRQ", "Plan Issue"],
  SCHEDULING_APPROVAL:     ["Approval not received-Internal", "Approval not received-B2B", "Redundancy Failure", "Site Access Issue", "Others"],
  MOP_VALcrqNoATION:     ["MOP Issue", "Commissioning sheet not available/not correct", "Configuration Issue", "Pre Check failed- Planning", "Hardware Incompatibility"],
  MOP_CREATION:   ["Time Constraint- NOC", "Conflicting Change", "Insufficient Impact Analysis", "Stakeholder Sign-off Missing", "Activity on hold by circleCode/Central/NOC team"],
  IMPACT_ANALYSIS: ["Impact assessment incomplete","Business impact not justified","Risk analysis missing",],
  CLOSURE: ["Closure report missing","Post checks failed","EvcrqNoence not attached",
],
  EXECUTION: ["FE not on site", "FE on site without proper tools", "Network Issue – Fiber", "Pre Check failed- Network", "Material un-availability"],
};
export const DEFAULT_REJECT_REASONS = ["Conflicting Change", "Incorrect Approval Mapping", "Insufficient Impact Analysis", "MOP Incomplete", "Stakeholder Sign-off Missing", "Time Constraint"];

// ── CAB sessions ────────────────────────────────────────────────────────────
export const MOCK_CAB_SESSIONS: CabSession[] = [
  { crqNo: "CAB-2026-061", currentStage: "VALcrqNoATE", host: "Ravi Nair (NOC)", date: "Jun 14, 2026", time: "16:00 IST", status: "live",      type: "Critical", crqcrqNos: ["CRQ-2026-0418", "CRQ-2026-0424", "CRQ-2026-0412"] },
  { crqNo: "CAB-2026-062", currentStage: "VALcrqNoATE", host: "Ravi Nair (NOC)", date: "Jun 15, 2026", time: "11:00 IST", status: "scheduled", type: "Normal",   crqcrqNos: ["CRQ-2026-0420", "CRQ-2026-0413"] },
  { crqNo: "CAB-2026-060", currentStage: "VALcrqNoATE", host: "Ravi Nair (NOC)", date: "Jun 12, 2026", time: "16:00 IST", status: "completed", type: "Normal",   crqcrqNos: ["CRQ-2026-0415"] },
];

// ── SE rings (EXECUTION) ───────────────────────────────────────────────
export const MOCK_SE_RINGS: SeRing[] = [
  { crqNo: "ring-a", ring: "Ring-A · Mumbai Core", locA: "mum-core-01", locB: "mum-core-02", type: "Protection switch", slotStart: "02:00", slotEnd: "02:45", decision: "pending" },
  { crqNo: "ring-b", ring: "Ring-B · Pune Aggr",   locA: "pun-aggr-03", locB: "pun-aggr-04", type: "EDFA card swap",     slotStart: "02:45", slotEnd: "03:30", decision: "pending" },
  { crqNo: "ring-c", ring: "Ring-C · Nashik Spur", locA: "nsk-olt-07",  locB: "nsk-olt-08",  type: "Fiber re-route",     slotStart: "03:30", slotEnd: "04:15", decision: "pending" },
];

// ── Admin: users / matrix / rules / audit ───────────────────────────────────
export const MOCK_ADMIN_USERS: AdminUser[] = [
  { name: "Amit Verma",     olm: "amver01", role: "CTO / Admin",   domain: "All Domains", access: "Approve", status: "active"   },
  { name: "Priya Deshmukh", olm: "prcrqNoes3", role: "COH (L4)",      domain: "Optics",      access: "Approve", status: "active"   },
  { name: "Sneha Iyer",     olm: "sneiy04", role: "Lead (L3)",     domain: "IP Core",     access: "Approve", status: "active"   },
  { name: "Ravi Nair",      olm: "ravna02", role: "CAB Engineer",  domain: "All Domains", access: "Write",   status: "active"   },
  { name: "Karan Mehta",    olm: "karme07", role: "Requester (L2)",domain: "Optics",      access: "Write",   status: "active"   },
  { name: "Arjun Rao",      olm: "arjra09", role: "Field SE",      domain: "Optics",      access: "Read",    status: "active"   },
  { name: "Vikram Joshi",   olm: "vikjo05", role: "Manager (L3)",  domain: "Embedded",    access: "Approve", status: "inactive" },
];

export const REJECTION_currentStageS = ["Initial Technical Review", "Domain Approval", "VALcrqNoATE", "EXECUTION Gate", "Post EXECUTION Review"];

export const MOCK_ESCALATION_MATRIX: EscalationRow[] = [
  { currentStage: "SCHEDULING_APPROVAL",     l1: "6h", l2: "3h", l3: "1h",  notify: "SPOC → Domain Head" },
  { currentStage: "MOP_VALcrqNoATION",     l1: "4h", l2: "2h", l3: "1h",  notify: "Eng Lead → COH"      },
  { currentStage: "VALcrqNoATE",     l1: "8h", l2: "4h", l3: "2h",  notify: "CAB Eng → CTO"       },
  { currentStage: "EXECUTION", l1: "2h", l2: "1h", l3: "30m", notify: "NOC-NS → Duty Manager" },
];

export const ASSIGN_currentStageS: CrqcurrentStage[] = [
  "VALcrqNoATE",
  "IMPACT_ANALYSIS",
  "MOP_CREATION",
  "MOP_VALcrqNoATION",
  "SCHEDULING_APPROVAL",
  "EXECUTION",
  "CLOSURE",
];
export const ASSIGN_DOMAINS = ["IP Core", "Optics", "Packet", "Embedded", "Mobility"] as const;
export const ASSIGN_circleCodeS = ["MH", "KA", "GJ", "DL", "TN", "AP", "WB", "UP-E", "RJ", "MP"] as const;

export const APPROVERS = [
  { name: "Amit Verma",     role: "CTO / Admin",    domain: "All Domains" },
  { name: "Priya Deshmukh", role: "COH (L4)",       domain: "Optics"      },
  { name: "Sneha Iyer",     role: "Lead (L3)",      domain: "IP Core"     },
  { name: "Anil Kumar",     role: "Lead (L3)",      domain: "Packet"      },
  { name: "Kavya Reddy",    role: "Lead (L3)",      domain: "Mobility"    },
  { name: "Rahul Sharma",   role: "Manager (L3)",   domain: "Embedded"    },
  { name: "Vikram Joshi",   role: "Manager (L3)",   domain: "Embedded"    },
];

const ASSIGN_DEFAULT_BY_DOMAIN: Record<string, string> = {
  "IP Core":  "Sneha Iyer",
  Optics:     "Priya Deshmukh",
  Packet:     "Anil Kumar",
  Embedded:   "Rahul Sharma",
  Mobility:   "Kavya Reddy",
};
export const MOCK_ASSIGN_MATRIX: AssignMatrixCell[] = ASSIGN_currentStageS.flatMap((currentStage) =>
  ASSIGN_DOMAINS.map((domain) => ({
    currentStage,
    domain,
    approver: currentStage === "VALcrqNoATE" ? "Amit Verma" : ASSIGN_DEFAULT_BY_DOMAIN[domain],
  }))
);

export const MOCK_ASSIGN_RULES: AssignRule[] = [
  { crqNo: "AR-01", domain: "Optics",   circleCode: "TN", impact: "SA",  currentStage: "VALcrqNoATE",  approver: "Priya Deshmukh", active: true  },
  { crqNo: "AR-02", domain: "Mobility", circleCode: "MH", impact: "SA",  currentStage: "SCHEDULING_APPROVAL",  approver: "Kavya Reddy",    active: true  },
  { crqNo: "AR-03", domain: "IP Core",  circleCode: "KA", impact: "NSA", currentStage: "SCHEDULING_APPROVAL",  approver: "Sneha Iyer",     active: false },
];

export const SERVICE_TYPES = ["Enterprise Services (B2B)", "Mobility", "Telemedia", "Core Services"];
export const SERVICE_IMPACTS: ImpactCode[] = ["SA", "NSA"];
export const SERVICE_circleCodeS = ["All", "MH", "KA", "GJ", "DL", "TN", "AP", "WB", "UP-E", "RJ", "MP"];
export const APPROVAL_AUTHORITIES = ["GSMC", "RAN Head", "COH", "Core Head", "NOC Head", "Domain Head", "Duty Manager", "CTO"];

export const MOCK_SERVICE_RULES: ServiceApprovalRule[] = [
  { crqNo: "SR-01", service: "Enterprise Services (B2B)", circleCode: "All", impact: "SA",  l1: "GSMC",      l2: "NOC Head", l3: "CTO", active: true  },
  { crqNo: "SR-02", service: "Mobility",                  circleCode: "All", impact: "SA",  l1: "RAN Head",  l2: "NOC Head", l3: "CTO", active: true  },
  { crqNo: "SR-03", service: "Telemedia",                 circleCode: "All", impact: "NSA", l1: "COH",       l2: "NOC Head", l3: "CTO", active: false },
  { crqNo: "SR-04", service: "Core Services",             circleCode: "All", impact: "SA",  l1: "Core Head", l2: "NOC Head", l3: "CTO", active: false },
];

export const MOCK_REJECTION_REASONS: RejectionReason[] = [
  { reason: "Wrong CRQ Flow – Type of CR",     active: true  },
  { reason: "Incorrect approver mapped",       active: true  },
  { reason: "Wrong Impact - SA, NSA, CNSA",    active: true  },
  { reason: "Duplicate CRQ",                   active: true  },
  { reason: "Plan Issue",                      active: false },
];

export const MOCK_AUDIT_LOG: AuditEntry[] = [
  { actor: "Karan Mehta",    action: "CRQ Raised",                          crq: "CRQ-2026-0418", currentStage: "VALcrqNoATE", time: "Jun 09, 14:32", tag: "create"   },
  { actor: "System",         action: "slaPercentage timer started (L1 · 4h)",         crq: "CRQ-2026-0418", currentStage: "VALcrqNoATE", time: "Jun 09, 14:32", tag: "system"   },
  { actor: "Sneha Iyer",     action: "Approved",                            crq: "CRQ-2026-0418", currentStage: "SCHEDULING_APPROVAL",    time: "Jun 10, 09:18", tag: "approve"  },
  { actor: "System",         action: "Escalation triggered — slaPercentage < 50%",    crq: "CRQ-2026-0418", currentStage: "VALcrqNoATE",    time: "Jun 13, 21:40", tag: "escalate" },
  { actor: "Priya Deshmukh", action: "Delegated to Sneha Iyer",             crq: "CRQ-2026-0422", currentStage: "SCHEDULING_APPROVAL",    time: "Jun 11, 10:02", tag: "delegate" },
  { actor: "Sneha Iyer",     action: "Rejected — Conflicting Change",       crq: "CRQ-2026-0415", currentStage: "VALcrqNoATE",    time: "Jun 11, 16:22", tag: "reject"   },
];

// ─────────────────────────────────────────────────────────────────────────────
//  Derived datasets — built from MOCK_CRQS so they always stay in sync.
// ─────────────────────────────────────────────────────────────────────────────

/** Resolve `value` after `ms` ms — simulates network latency. */
export const mockDelay = <T>(value: T, ms = 350): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

export const buildDashboard = (crqs: Crq[] = MOCK_CRQS): DashboardData => {
  const total = crqs.length;
const counts: Record<CrqcurrentStage, number> = {
  VALcrqNoATE: 0,
  IMPACT_ANALYSIS: 0,
  MOP_CREATION: 0,
  MOP_VALcrqNoATION: 0,
  SCHEDULING_APPROVAL: 0,
  EXECUTION: 0,
  CLOSURE: 0,
};
  crqs.forEach((c) => { counts[c.currentStage] += 1; });

  return {
    title: "CAB Command Center",
    subtitle: "Cross-domain CRQ health — slaPercentage, escalations and the next action queue.",
    totalCount: total,
    kpis: [
      { label: "Active CRQs",       value: crqs.filter((c) => c.currentStatus === "pending").length,  foot: "Across all currentStages",        accent: "blue"   },
      { label: "In VALcrqNoATE",     value: crqs.filter((c) => c.currentStage === "VALIDATE").length, foot: "Awaiting CAB approval",    accent: "orange" },
      { label: "slaPercentage Breach Risk",   value: crqs.filter((c) => c.slaPercentage >= 80).length,             foot: "Critical slaPercentage tier",        accent: "red"    },
      { label: "Approved this week",value: crqs.filter((c) => c.currentStatus === "approved").length,  foot: "Across all domains",       accent: "green"  },
    ],
    currentStageBars: currentStageS.map<{ currentStage: CrqcurrentStage; count: number; pct: number }>((s) => ({
      currentStage: s,
      count: counts[s],
      pct: total ? Math.round((counts[s] / total) * 100) : 0,
    })),
    escalations: crqs
      .filter((c) => c.slaPercentage >= 80 && c.currentStatus === "pending")
      .slice(0, 4)
      .map((c) => ({ crqNo: c.crqNo, slaPercentage: c.slaPercentage })),
  };
};

export const buildMyCrqs = (
  crqs: Crq[] = MOCK_CRQS
): MyCrqsResponse => {
  const rows = crqs.filter((c) => c.assignedToMe);

  return {
    title: "My CRQs",
    subtitle: "CRQs assigned to you. Open a CRQ to re-assign SPOC or Field Engineer.",
    stats: {
      awaitingMe: rows.filter((c) => c.currentStatus === "pending").length,
      approvedThisWeek: 3,
      rejectedThisWeek: 1,
    },
    rows,
  };
};

export const buildCabQueue = (crqs: Crq[] = MOCK_CRQS): CabQueueRow[] =>
  crqs
    .filter((c) => c.currentStage === "SCHEDULING_APPROVAL" && c.status === "pending")
    .map<CabQueueRow>((c) => ({
      crqNo: c.crqNo,
      impact: c.impact,
      critical: c.impact === "SA" ? "Critical" : c.impact === "NSA" ? "Routine" : "Moderate",
      domain: c.domain,
    }));

export const buildCabPlanDates = (
  sessions: CabSession[] = MOCK_CAB_SESSIONS
): CabPlanDate[] =>
  sessions.map((s) => {
    const [mon, dayWithComma] = s.date.split(" ");
    const dayNum = dayWithComma.replace(",", "");
    return {
      date: s.date,
      dayName: "WED", // visual hint — replace if you compute weekday from real date
      dayNum,
      monthName: mon.toUpperCase(),
      sessioncrqNo: s.crqNo,
      type: s.type,
      crqNo: s.crqNo,
    };
  });

export const buildAgenda = (
  session: CabSession,
  crqs: Crq[] = MOCK_CRQS
): CabAgendaItem[] =>
  session.crqNos
    .map((crqNo) => crqs.find((c) => c.crqNo === crqNo))
    .filter((c): c is Crq => !!c)
    .map<CabAgendaItem>((c) => ({
      crqNo: c.crqNo,
      activity: c.activity,
      currentStage: c.currentStage,
      domain: c.domain,
      impact: c.impact,
    }));

export const buildEXECUTION = (
  crqcrqNo: string,
  crqs: Crq[] = MOCK_CRQS
): ImplementationDetail | null => {
  const crq = crqs.find((c) => c.crqNo === crqcrqNo);
  if (!crq) return null;
  return {
    crq,
    noc: { tollFree: "1800-NOC-NS01", email: "nocns.west@noc", called: false },
    rings: MOCK_SE_RINGS.map((r) => ({ ...r })),
  };
};

export const buildAnalytics = (crqs: Crq[] = MOCK_CRQS): AdminAnalytics => {
  const heat = (Object.keys(DOMAIN_COLOR) as Array<keyof typeof DOMAIN_COLOR>).map((domain) => {
    const inDomain = crqs.filter((c) => c.domain === domain);
    const breach = inDomain.filter((c) => c.slaPercentage >= 80).length;
    const total = inDomain.length;
    const ratio = total ? breach / total : 0;
    return {
      domain: domain as Crq["domain"],
      breach,
      total,
      level: (ratio > 0.5 ? "high" : ratio > 0.25 ? "mcrqNo" : "low") as "low" | "mcrqNo" | "high",
    };
  });
  return {
    total: crqs.length,
    approved: crqs.filter((c) => c.currentStatus === "approved").length,
    rejected: crqs.filter((c) => c.currentStatus === "rejected").length,
    breachRisk: crqs.filter((c) => c.slaPercentage >= 80).length,
    heat,
  };
};

// ── Journey builder (parallel tracks + approval chain) ──────────────────────
const currentStage_TO_PIPE: Record<CrqcurrentStage, number> = {
  VALcrqNoATE: 1,
  IMPACT_ANALYSIS: 2,
  MOP_CREATION: 3,
  MOP_VALcrqNoATION: 4,
  SCHEDULING_APPROVAL: 5,
  EXECUTION: 6,
  CLOSURE: 7,
};

const pipeIndexFor = (c: Crq) => (c.currentStatus === "approved" ? 6 : currentStage_TO_PIPE[c.currentStage] ?? 0);

export const buildJourney = (
  crqcrqNo: string,
  crqs: Crq[] = MOCK_CRQS
): CrqJourney | null => {
  const crq = crqs.find((c) => c.crqNo === crqcrqNo);
  if (!crq) return null;

  const currentStagecrqNox = currentStageS.indexOf(crq.currentStage);
  const approvalChain = currentStageS.map<{
    level: string; label: string; who: string;
    state: "completed" | "in_progress" | "pending" | "rejected" | "not_started";
  }>((s, i) => {
    const level = `L${i + 1}`;
    const who =
      i === 0 ? "NOC Shift Lead" :
      i === 1 ? "Domain SPOC · Kavya Reddy" :
      i === 2 ? "Engineering · Rohit Bansal" :
      i === 3 ? crq.approverName :
                "Field SE · Arjun Rao";
    let state: "completed" | "in_progress" | "pending" | "rejected" | "not_started";
    if (crq.currentStatus === "approved")            state = "completed";
    else if (crq.currentStatus === "rejected" && i === currentStagecrqNox) state = "rejected";
    else if (i < currentStagecrqNox)                    state = "completed";
    else if (i === currentStagecrqNox)                  state = "in_progress";
    else                                       state = "not_started";
    return { level, label: s, who, state };
  });

  const pipecrqNox = pipeIndexFor(crq);


  const trackDefs: { track: string; approver: string; role: string; color: string }[] = [
    { track: `${crq.domain} Domain`,     approver: crq.approverName,    role: "Domain SPOC",       color: DOMAIN_COLOR[crq.domain] ?? "#1565C0" },
    { track: "Change Management",        approver: "Ravi Nair",     role: "CAB Engineer",      color: "#5E35B1" },
  ];
  if (crq.impact === "SA") trackDefs.push({ track: "NOC Operations",       approver: "Shift Lead Desk",   role: "Operations Assurance", color: "#00796B" });
  trackDefs.push({ track: "Security & Compliance", approver: "SecOps Desk", role: "Risk & Compliance", color: "#455A64" });

  const gatecrqNox = 4;
  const parallelTracks = trackDefs.map((d, i) => {
    let status: "approved" | "reviewing" | "pending" | "queued" | "rejected";
    if (crq.currentStatus === "approved" || pipecrqNox > gatecrqNox)              status = "approved";
    else if (crq.currentStatus === "rejected" && pipecrqNox === gatecrqNox)       status = "rejected";
    else if (pipecrqNox === gatecrqNox)                                    status = i === 0 ? "reviewing" : i % 2 ? "pending" : "approved";
    else                                                              status = pipecrqNox < gatecrqNox ? "queued" : "approved";
    return { ...d, status, time: status === "approved" ? "Approved" : status === "rejected" ? "Rejected" : "—" };
  });

  return {
    crq,
    pipeIndex: pipecrqNox,
    approvalChain,
    parallelTracks,
    remarks: [
      { who: crq.raisedBy, role: "Requester",       currentStage: "VALIDATE", comment: "Pre-checks complete, redundancy verified.", time: crq.raisedOn },
      { who: "Sneha Iyer", role: "Domain SPOC",     currentStage: "SCHEDULING_APPROVAL",    comment: "Window confirmed with B2B SPOC.",           time: "Jun 10, 12:04" },
    ],
  };
};
