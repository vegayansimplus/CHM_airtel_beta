import type {
  AdminAnalytics,
  AdminUser,
  AssignMatrixCell,
  AssignRule,
  AuditEntry,
  CabAgendaItem,
  CabPlanDate,
  CabQueueRow,
  CabRejectReason,
  CabSession,
  Crq,
  CrqJourney,
  CrqStage,
  DashboardData,
  EscalationRow,
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
//  Mock data for the CAB Portal RTK Query slice (queryFn fallback / VITE_CAB_USE_MOCK).
//  Field shapes mirror the backend's dummy stored procedures 1:1 — see
//  airtelmanagement/src/main/resources/sql/cabmanager_dummy_procedures.sql.
// ─────────────────────────────────────────────────────────────────────────────

export const STAGES: CrqStage[] = [
  "VALIDATE",
  "IMPACT_ANALYSIS",
  "MOP_CREATION",
  "MOP_VALIDATION",
  "SCHEDULING_APPROVAL",
  "EXECUTION",
  "CLOSURE",
];
export const ASSIGN_STAGES: CrqStage[] = STAGES;

// ── Personas / role switcher ────────────────────────────────────────────────
export const ROLES: Record<Role, Persona> = {
  admin:       { role: "admin",       name: "Amit Verma",     title: "CTO · All Domains",        shortTitle: "CTO",          olm: "amver01", initials: "AV", color: "#1565C0", home: "dashboard" },
  requester:   { role: "requester",   name: "Karan Mehta",    title: "NOC L2 · Requester",       shortTitle: "NOC L2",       olm: "karme07", initials: "KM", color: "#00796B", home: "mycrqs" },
  stakeholder: { role: "stakeholder", name: "Priya Deshmukh", title: "COH Optics · Stakeholder", shortTitle: "COH Optics",   olm: "prdes03", initials: "PD", color: "#C2185B", home: "mycrqs" },
  cabEngineer: { role: "cabEngineer", name: "Ravi Nair",      title: "NOC · CAB Engineer",       shortTitle: "CAB Engineer", olm: "ravna02", initials: "RN", color: "#5D4037", home: "cabPlanning" },
  cabMember:   { role: "cabMember",   name: "Sneha Iyer",     title: "SPOC · CAB Member",        shortTitle: "SPOC IP Core", olm: "sneiy04", initials: "SI", color: "#7B1FA2", home: "cabSessions" },
  se:          { role: "se",          name: "Arjun Rao",      title: "Field SE · Implementation",shortTitle: "Field SE",     olm: "arjra09", initials: "AR", color: "#E64A19", home: "implementation" },
};

export const ROLE_SCREENS: Record<Role, string[]> = {
  admin:       ["dashboard", "cabPlanning", "cabSessions", "allcrqs", "journey", "admin"],
  requester:   ["dashboard", "cabSessions", "mycrqs", "journey"],
  stakeholder: ["dashboard", "cabSessions", "mycrqs", "journey"],
  cabEngineer: ["dashboard", "cabSessions", "allcrqs", "journey"],
  cabMember:   ["dashboard", "cabSessions", "journey"],
  se:          ["dashboard", "cabSessions", "implementation", "journey"],
};

// ── Core CRQ dataset — mirrors backend CrqDto (11 fields) ───────────────────
export const MOCK_CRQS: Crq[] = [
  { crqNo: "CRQ-2026-0418", planId: "PLAN-2026-0001", domainName: "Optics",   circleCode: "MH",   currentStage: "VALIDATE",             approverName: "Amit Verma",     assignStartTime: "2026-06-14T02:00:00", currentStatus: "pending",   slaPercentage: 82, assignedToMe: false, raisedBy: "Karan Mehta" },
  { crqNo: "CRQ-2026-0421", planId: "PLAN-2026-0002", domainName: "IP Core",  circleCode: "KA",   currentStage: "VALIDATE",             approverName: "Sneha Iyer",     assignStartTime: "2026-06-16T01:00:00", currentStatus: "pending",   slaPercentage: 34, assignedToMe: false, raisedBy: "Divya Nair" },
  { crqNo: "CRQ-2026-0422", planId: "PLAN-2026-0003", domainName: "Optics",   circleCode: "GJ",   currentStage: "SCHEDULING_APPROVAL",  approverName: "Priya Deshmukh", assignStartTime: "2026-06-15T00:30:00", currentStatus: "pending",   slaPercentage: 58, assignedToMe: false, raisedBy: "Karan Mehta" },
  { crqNo: "CRQ-2026-0423", planId: "PLAN-2026-0004", domainName: "IP Core",  circleCode: "DL",   currentStage: "MOP_VALIDATION",       approverName: "Sneha Iyer",     assignStartTime: "2026-06-17T02:00:00", currentStatus: "pending",   slaPercentage: 71, assignedToMe: false, raisedBy: "Rohit Bansal" },
  { crqNo: "CRQ-2026-0424", planId: "PLAN-2026-0005", domainName: "Optics",   circleCode: "TN",   currentStage: "VALIDATE",             approverName: "Amit Verma",     assignStartTime: "2026-06-14T01:00:00", currentStatus: "pending",   slaPercentage: 88, assignedToMe: false, raisedBy: "Lakshmi Iyer" },
  { crqNo: "CRQ-2026-0425", planId: "PLAN-2026-0006", domainName: "Packet",   circleCode: "AP",   currentStage: "VALIDATE",             approverName: "Anil Kumar",     assignStartTime: "2026-06-18T02:00:00", currentStatus: "pending",   slaPercentage: 28, assignedToMe: false, raisedBy: "Divya Nair" },
  { crqNo: "CRQ-2026-0419", planId: "PLAN-2026-0007", domainName: "Mobility", circleCode: "MH",   currentStage: "EXECUTION",            approverName: "Kavya Reddy",    assignStartTime: "2026-06-12T01:30:00", currentStatus: "approved",  slaPercentage: 12, assignedToMe: false, raisedBy: "Ashwin Pillai" },
  { crqNo: "CRQ-2026-0420", planId: "PLAN-2026-0008", domainName: "Mobility", circleCode: "WB",   currentStage: "VALIDATE",             approverName: "Amit Verma",     assignStartTime: "2026-06-15T02:00:00", currentStatus: "pending",   slaPercentage: 64, assignedToMe: true,  raisedBy: "Ashwin Pillai" },
  { crqNo: "CRQ-2026-0415", planId: "PLAN-2026-0009", domainName: "IP Core",  circleCode: "UP-E", currentStage: "VALIDATE",             approverName: "Sneha Iyer",     assignStartTime: "2026-06-12T02:00:00", currentStatus: "rejected",  slaPercentage: 92, assignedToMe: false, raisedBy: "Rohit Bansal" },
  { crqNo: "CRQ-2026-0417", planId: "PLAN-2026-0010", domainName: "Packet",   circleCode: "KA",   currentStage: "SCHEDULING_APPROVAL",  approverName: "Anil Kumar",     assignStartTime: "2026-06-16T02:00:00", currentStatus: "pending",   slaPercentage: 55, assignedToMe: false, raisedBy: "Divya Nair" },
  { crqNo: "CRQ-2026-0426", planId: "PLAN-2026-0011", domainName: "Embedded", circleCode: "RJ",   currentStage: "VALIDATE",             approverName: "Rahul Sharma",   assignStartTime: "2026-06-19T02:30:00", currentStatus: "pending",   slaPercentage: 40, assignedToMe: false, raisedBy: "Vikram Joshi" },
  { crqNo: "CRQ-2026-0414", planId: "PLAN-2026-0012", domainName: "Embedded", circleCode: "MH",   currentStage: "EXECUTION",            approverName: "Rahul Sharma",   assignStartTime: "2026-06-12T02:00:00", currentStatus: "approved",  slaPercentage: 18, assignedToMe: false, raisedBy: "Meera Krishnan" },
  { crqNo: "CRQ-2026-0413", planId: "PLAN-2026-0013", domainName: "Embedded", circleCode: "DL",   currentStage: "VALIDATE",             approverName: "Amit Verma",     assignStartTime: "2026-06-15T03:00:00", currentStatus: "pending",   slaPercentage: 76, assignedToMe: false, raisedBy: "Vikram Joshi" },
  { crqNo: "CRQ-2026-0412", planId: "PLAN-2026-0014", domainName: "Packet",   circleCode: "MP",   currentStage: "VALIDATE",             approverName: "Amit Verma",     assignStartTime: "2026-06-14T01:00:00", currentStatus: "pending",   slaPercentage: 81, assignedToMe: false, raisedBy: "Ashwin Pillai" },
  { crqNo: "CRQ-2026-0411", planId: "PLAN-2026-0015", domainName: "IP Core",  circleCode: "WB",   currentStage: "SCHEDULING_APPROVAL",  approverName: "Sneha Iyer",     assignStartTime: "2026-06-18T02:00:00", currentStatus: "pending",   slaPercentage: 47, assignedToMe: false, raisedBy: "Rohit Bansal" },
];

// ── Rejection reasons / stage vocab used by admin config screens ────────────
export const REJECTION_STAGES = ["Initial Technical Review", "Domain Approval", "Validation", "Execution Gate", "Post Execution Review"];

export const MOCK_REJECTION_REASONS: RejectionReason[] = [
  { reason: "Wrong CRQ Flow – Type of CR",  active: true  },
  { reason: "Incorrect approver mapped",    active: true  },
  { reason: "Wrong Impact - SA, NSA, CNSA", active: true  },
  { reason: "Duplicate CRQ",                active: true  },
  { reason: "Plan Issue",                   active: false },
];

// ── CAB reject reasons (AllCRQs reject dropdown) — mirrors sp_get_cab_reject_reasons() ──
export const MOCK_CAB_REJECT_REASONS: CabRejectReason[] = [
  { reasonId: 1, reasonText: "Insufficient impact details" },
  { reasonId: 2, reasonText: "Window clashes with freeze/blackout" },
  { reasonId: 3, reasonText: "Rollback plan inadequate" },
  { reasonId: 4, reasonText: "Wrong impact classification" },
];

// ── CAB sessions ────────────────────────────────────────────────────────────
export const MOCK_CAB_SESSIONS: CabSession[] = [
  { id: "CAB-2026-101", stage: "SCHEDULING_APPROVAL", host: "Rahul Sharma", date: "2026-06-14", time: "16:00 IST", status: "scheduled", type: "Critical", crqIds: ["CRQ-2026-0418", "CRQ-2026-0424", "CRQ-2026-0412"] },
  { id: "CAB-2026-098", stage: "SCHEDULING_APPROVAL", host: "Anita Desai",  date: "2026-06-11", time: "15:00 IST", status: "live",      type: "Normal",   crqIds: ["CRQ-2026-0415"] },
];

// ── SE rings (Field Execution) ───────────────────────────────────────────────
export const MOCK_SE_RINGS: SeRing[] = [
  { id: "RING-01", ring: "Ring A", locA: "Chennai-Central", locB: "Chennai-East", type: "Protection", slotStart: "01:00 IST", slotEnd: "02:00 IST", decision: "pending" },
  { id: "RING-02", ring: "Ring B", locA: "Chennai-East",    locB: "Chennai-South", type: "Working",     slotStart: "02:00 IST", slotEnd: "03:00 IST", decision: "pending" },
];

// ── Admin: users / matrix / rules / audit ───────────────────────────────────
export const MOCK_ADMIN_USERS: AdminUser[] = [
  { name: "Amit Verma",     olm: "amver01", role: "CTO / Admin",    domain: "All Domains", access: "Approve", status: "active"   },
  { name: "Priya Deshmukh", olm: "prdes03", role: "COH (L4)",       domain: "Optics",      access: "Approve", status: "active"   },
  { name: "Sneha Iyer",     olm: "sneiy04", role: "Lead (L3)",      domain: "IP Core",     access: "Approve", status: "active"   },
  { name: "Ravi Nair",      olm: "ravna02", role: "CAB Engineer",   domain: "All Domains", access: "Write",   status: "active"   },
  { name: "Karan Mehta",    olm: "karme07", role: "Requester (L2)", domain: "Optics",      access: "Write",   status: "active"   },
  { name: "Arjun Rao",      olm: "arjra09", role: "Field SE",       domain: "Optics",      access: "Read",    status: "active"   },
  { name: "Vikram Joshi",   olm: "vikjo05", role: "Manager (L3)",   domain: "Embedded",    access: "Approve", status: "inactive" },
];

export const ASSIGN_DOMAINS = ["IP Core", "Optics", "Packet", "Embedded", "Mobility"] as const;
export const ASSIGN_CIRCLES = ["MH", "KA", "GJ", "DL", "TN", "AP", "WB", "UP-E", "RJ", "MP"] as const;

export const APPROVERS = [
  { name: "Amit Verma",     role: "CTO / Admin",  domain: "All Domains" },
  { name: "Priya Deshmukh", role: "COH (L4)",     domain: "Optics"      },
  { name: "Sneha Iyer",     role: "Lead (L3)",    domain: "IP Core"     },
  { name: "Anil Kumar",     role: "Lead (L3)",    domain: "Packet"      },
  { name: "Kavya Reddy",    role: "Lead (L3)",    domain: "Mobility"    },
  { name: "Rahul Sharma",   role: "Manager (L3)", domain: "Embedded"    },
  { name: "Vikram Joshi",   role: "Manager (L3)", domain: "Embedded"    },
];

const ASSIGN_DEFAULT_BY_DOMAIN: Record<string, string> = {
  "IP Core":  "Sneha Iyer",
  Optics:     "Priya Deshmukh",
  Packet:     "Anil Kumar",
  Embedded:   "Rahul Sharma",
  Mobility:   "Kavya Reddy",
};
export const MOCK_ASSIGN_MATRIX: AssignMatrixCell[] = ASSIGN_STAGES.flatMap((stage) =>
  ASSIGN_DOMAINS.map((domain) => ({
    stage,
    domain,
    approver: stage === "VALIDATE" ? "Amit Verma" : ASSIGN_DEFAULT_BY_DOMAIN[domain],
  }))
);

export const MOCK_ASSIGN_RULES: AssignRule[] = [
  { id: "AR-01", domain: "Optics",   circle: "TN", impact: "SA",  stage: "VALIDATE",             approver: "Priya Deshmukh", active: true  },
  { id: "AR-02", domain: "Mobility", circle: "MH", impact: "SA",  stage: "SCHEDULING_APPROVAL",  approver: "Kavya Reddy",    active: true  },
  { id: "AR-03", domain: "IP Core",  circle: "KA", impact: "NSA", stage: "SCHEDULING_APPROVAL",  approver: "Sneha Iyer",     active: false },
];

export const SERVICE_TYPES = ["Enterprise Services (B2B)", "Mobility", "Telemedia", "Core Services"];
export const SERVICE_IMPACTS: ImpactCode[] = ["SA", "NSA"];
export const SERVICE_CIRCLES = ["All", "MH", "KA", "GJ", "DL", "TN", "AP", "WB", "UP-E", "RJ", "MP"];
export const APPROVAL_AUTHORITIES = ["GSMC", "RAN Head", "COH", "Core Head", "NOC Head", "Domain Head", "Duty Manager", "CTO"];

export const MOCK_SERVICE_RULES: ServiceApprovalRule[] = [
  { id: "SR-01", service: "Enterprise Services (B2B)", circle: "All", impact: "SA",  l1: "GSMC",      l2: "NOC Head", l3: "CTO", active: true  },
  { id: "SR-02", service: "Mobility",                  circle: "All", impact: "SA",  l1: "RAN Head",  l2: "NOC Head", l3: "CTO", active: true  },
  { id: "SR-03", service: "Telemedia",                 circle: "All", impact: "NSA", l1: "COH",       l2: "NOC Head", l3: "CTO", active: false },
  { id: "SR-04", service: "Core Services",              circle: "All", impact: "SA",  l1: "Core Head", l2: "NOC Head", l3: "CTO", active: false },
];

export const MOCK_ESCALATION_MATRIX: EscalationRow[] = [
  { stage: "SCHEDULING_APPROVAL", l1: "6h", l2: "3h", l3: "1h",  notify: "SPOC → Domain Head"   },
  { stage: "MOP_VALIDATION",      l1: "4h", l2: "2h", l3: "1h",  notify: "Eng Lead → COH"       },
  { stage: "VALIDATE",            l1: "8h", l2: "4h", l3: "2h",  notify: "CAB Eng → CTO"        },
  { stage: "EXECUTION",           l1: "2h", l2: "1h", l3: "30m", notify: "NOC-NS → Duty Manager" },
];

export const MOCK_AUDIT_LOG: AuditEntry[] = [
  { actor: "Karan Mehta",    action: "CRQ Raised",                     crq: "CRQ-2026-0418", stage: "VALIDATE",            time: "2026-06-09T14:32:00", tag: "create"   },
  { actor: "System",         action: "SLA timer started (L1 · 4h)",    crq: "CRQ-2026-0418", stage: "VALIDATE",            time: "2026-06-09T14:32:00", tag: "system"   },
  { actor: "Sneha Iyer",     action: "Approved",                       crq: "CRQ-2026-0418", stage: "SCHEDULING_APPROVAL", time: "2026-06-10T09:18:00", tag: "approve"  },
  { actor: "System",         action: "Escalation triggered — SLA < 50%", crq: "CRQ-2026-0418", stage: "VALIDATE",          time: "2026-06-13T21:40:00", tag: "escalate" },
  { actor: "Priya Deshmukh", action: "Delegated to Sneha Iyer",        crq: "CRQ-2026-0422", stage: "SCHEDULING_APPROVAL", time: "2026-06-11T10:02:00", tag: "delegate" },
  { actor: "Sneha Iyer",     action: "Rejected — Conflicting Change",  crq: "CRQ-2026-0415", stage: "VALIDATE",            time: "2026-06-11T16:22:00", tag: "reject"   },
];

// ─────────────────────────────────────────────────────────────────────────────
//  Builders — mirror the backend's (hardcoded) dummy stored procedures so the
//  mock fallback behaves like the real API. See cabmanager_dummy_procedures.sql.
// ─────────────────────────────────────────────────────────────────────────────

/** Resolve `value` after `ms` ms — simulates network latency. */
export const mockDelay = <T>(value: T, ms = 350): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

export const buildDashboard = (): DashboardData => ({
  kpis: [
    { label: "Pending Approvals", value: "12", foot: "Awaiting your action", accent: "blue"   },
    { label: "Approved Today",    value: "8",  foot: "Completed today",      accent: "green"  },
    { label: "Escalations",       value: "3",  foot: "SLA at risk",          accent: "red"    },
    { label: "Rejected",          value: "2",  foot: "This week",            accent: "orange" },
  ],
  stageBars: [
    { stage: "VALIDATE",            count: 10, pct: 24 },
    { stage: "SCHEDULING_APPROVAL", count: 8,  pct: 19 },
    { stage: "IMPACT_ANALYSIS",     count: 6,  pct: 14 },
    { stage: "MOP_VALIDATION",      count: 12, pct: 29 },
    { stage: "EXECUTION",           count: 6,  pct: 14 },
  ],
  escalations: [
    { crqNo: "CRQ-2026-0401", slaPercentage: 42 },
    { crqNo: "CRQ-2026-0407", slaPercentage: 35 },
  ],
});

export const buildMyCrqs = (): MyCrqsResponse => ({
  stats: { awaitingMe: 5, approvedThisWeek: 11, rejectedThisWeek: 2 },
  rows: [
    {
      crqNo: "CRQ-2026-0401", planId: "PLAN-2026-101", domainName: "IP Core", circleCode: "MH",
      currentStage: "SCHEDULING_APPROVAL", approverName: "Rahul Sharma", assignStartTime: "2026-06-14T02:00:00",
      currentStatus: "pending", slaPercentage: 42, assignedToMe: true, raisedBy: "Priya Nair",
    },
  ],
});

export const buildCabQueue = (): CabQueueRow[] => [
  { crqNo: "CRQ-2026-0410", impact: "SA",  circle: "Mumbai",    domain: "Packet",   executionWindow: "02:00 - 05:00 IST" },
  { crqNo: "CRQ-2026-0411", impact: "NSA", circle: "Bangalore", domain: "Embedded", executionWindow: "01:00 - 03:00 IST" },
];

export const buildCabPlanDates = (): CabPlanDate[] => [
  { date: "2026-06-14", dayName: "FRI", dayNum: "14", monthName: "JUN", sessionId: "CAB-2026-101", type: "Critical", crqIds: ["CRQ-2026-0418", "CRQ-2026-0424", "CRQ-2026-0412"] },
  { date: "2026-06-16", dayName: "SUN", dayNum: "16", monthName: "JUN", sessionId: "CAB-2026-102", type: "Normal",   crqIds: ["CRQ-2026-0420", "CRQ-2026-0413"] },
];

export const buildAgenda = (_session?: CabSession): CabAgendaItem[] => [
  { id: "CRQ-2026-0410", activity: "Packet core capacity expansion",  stage: "SCHEDULING_APPROVAL", domain: "Packet",   impact: "SA",  hostname: "mum-pkt-rt-04" },
  { id: "CRQ-2026-0411", activity: "Embedded firmware patch rollout", stage: "SCHEDULING_APPROVAL", domain: "Embedded", impact: "NSA", hostname: "blr-emb-sw-02" },
];

export const buildImplementation = (
  crqId: string = "CRQ-2026-0418",
  crqs: Crq[] = MOCK_CRQS
): ImplementationDetail => {
  const crq: Crq = crqs.find((c) => c.crqNo === crqId) ?? {
    crqNo: "CRQ-2026-0418",
    planId: "PLAN-2026-104",
    domainName: "Optics",
    circleCode: "TN",
    currentStage: "EXECUTION",
    approverName: "Meera Iyer",
    assignStartTime: "2026-06-13T01:00:00",
    currentStatus: "approved",
    slaPercentage: 76,
    assignedToMe: false,
    raisedBy: "Vikram Rao",
  };
  return {
    crq,
    noc: { tollFree: "1800-419-8181", email: "noc@airtel.com", called: false },
    rings: MOCK_SE_RINGS.map((r) => ({ ...r })),
  };
};

export const buildAnalytics = (): AdminAnalytics => ({
  total: 120,
  approved: 95,
  rejected: 14,
  breachRisk: 11,
  heat: [
    { domain: "IP Core",  breach: 4, total: 30, level: "mid"  },
    { domain: "Optics",   breach: 1, total: 22, level: "low"  },
    { domain: "Packet",   breach: 6, total: 18, level: "high" },
    { domain: "Embedded", breach: 0, total: 15, level: "low"  },
    { domain: "Mobility", breach: 0, total: 35, level: "low"  },
  ],
});

// ── Journey builder — fixed approval chain / parallel tracks / remarks,
//    matching the backend's dummy sp_get_crq_journey_* procedures. ──────────
export const buildJourney = (
  crqId: string,
  crqs: Crq[] = MOCK_CRQS
): CrqJourney | null => {
  const crq = crqs.find((c) => c.crqNo === crqId);
  if (!crq) return null;

  return {
    crq,
    pipeIndex: 3,
    approvalChain: [
      { level: "L1", label: "Authorization", who: "Priya Nair",   state: "completed"   },
      { level: "L2", label: "Scheduling",    who: "Sanjay Gupta", state: "completed"   },
      { level: "L3", label: "Validation",    who: "Meera Iyer",   state: "in_progress" },
      { level: "L4", label: "CAB Review",    who: "Rahul Sharma", state: "pending"     },
      { level: "L5", label: "Implementation",who: "Arjun Nair",   state: "not_started" },
    ],
    parallelTracks: [
      { track: "Security", approver: "Deepak Verma", role: "Security Lead",   status: "approved",  color: "green",  time: "2026-06-10T09:00:00" },
      { track: "Network",  approver: "Anita Desai",   role: "Network Lead",   status: "reviewing", color: "blue",   time: "2026-06-10T10:30:00" },
      { track: "Business", approver: "Karan Mehta",   role: "Business Owner", status: "queued",    color: "orange", time: "" },
    ],
    remarks: [
      { who: "Priya Nair",   role: "Requester",   stage: "VALIDATE",            comment: "Pre-checks complete, redundancy verified.", time: "2026-06-09T08:05:00" },
      { who: "Sanjay Gupta", role: "Domain SPOC", stage: "SCHEDULING_APPROVAL", comment: "Window confirmed with B2B SPOC.",           time: "2026-06-10T12:04:00" },
    ],
  };
};
