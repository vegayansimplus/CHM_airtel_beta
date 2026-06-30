import type {
  AdminAnalytics,
  AdminUser,
  AssignMatrixCell,
  AssignRule,
  AuditEntry,
  CabAgendaItem,
  CabChatMessage,
  CabPlanDate,
  CabQueueRow,
  CabSession,
  Crq,
  CrqJourney,
  CrqStage,
  DashboardData,
  EscalationRow,
  ImplementationDetail,
  ImpactCode,
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

export const STAGES: CrqStage[] = [
  "Authorization",
  "Scheduling",
  "Validation",
  "CAB Review",
  "Implementation",
];

// ── Personas / role switcher ────────────────────────────────────────────────
export const ROLES: Record<Role, Persona> = {
  admin:       { role: "admin",       name: "Amit Verma",     title: "CTO · All Domains",        shortTitle: "CTO",          olm: "amver01", initials: "AV", color: "#1565C0", home: "dashboard" },
  requester:   { role: "requester",   name: "Karan Mehta",    title: "NOC L2 · Requester",       shortTitle: "NOC L2",       olm: "karme07", initials: "KM", color: "#00796B", home: "mycrqs" },
  stakeholder: { role: "stakeholder", name: "Priya Deshmukh", title: "COH Optics · Stakeholder", shortTitle: "COH Optics",   olm: "prides3", initials: "PD", color: "#C2185B", home: "mycrqs" },
  cabEngineer: { role: "cabEngineer", name: "Ravi Nair",      title: "NOC · CAB Engineer",       shortTitle: "CAB Engineer", olm: "ravna02", initials: "RN", color: "#5D4037", home: "cabPlanning" },
  cabMember:   { role: "cabMember",   name: "Sneha Iyer",     title: "SPOC · CAB Member",        shortTitle: "SPOC IP Core", olm: "sneiy04", initials: "SI", color: "#7B1FA2", home: "cabSessions" },
  se:          { role: "se",          name: "Arjun Rao",      title: "Field SE · Implementation",shortTitle: "Field SE",     olm: "arjra09", initials: "AR", color: "#E64A19", home: "implementation" },
};

export const ROLE_SCREENS: Record<Role, string[]> = {
  admin:       ["dashboard", "cabPlanning", "cabSessions", "allcrqs", "journey", "admin"],
  requester:   ["dashboard", "mycrqs", "cabSessions", "journey"],
  stakeholder: ["dashboard", "mycrqs", "cabSessions", "journey"],
  cabEngineer: ["dashboard", "cabPlanning", "cabSessions", "allcrqs", "journey"],
  cabMember:   ["dashboard", "cabSessions", "journey"],
  se:          ["dashboard", "cabSessions", "implementation", "journey"],
};

// ── Core CRQ dataset ────────────────────────────────────────────────────────
export const MOCK_CRQS: Crq[] = [
  { id: "CRQ-2026-0418", activity: "DWDM EDFA card swap — Mumbai-Pune IBR",      domain: "Optics",   circle: "MH",   stage: "CAB Review",     sla: 82, impact: "SA",  status: "pending",  approver: "Amit Verma",     scheduled: "Jun 14", window: "02:00 – 05:00 IST", technology: "DWDM",     mop: "MOP-2026-0418-v2", raisedBy: "Karan Mehta (NOC L2)",  raisedOn: "Jun 09, 14:32", hostname: "mum-pune-edfa-04",      assignedToMe: true,  impactedParties: ["Mobility (RAN/Core)", "B2B", "Telemedia"], spoc: "Sneha Iyer",   fieldEngineer: "Arjun Rao" },
  { id: "CRQ-2026-0421", activity: "BGP route-reflector cluster migration",       domain: "IP Core",  circle: "KA",   stage: "Authorization",   sla: 34, impact: "NSA", status: "pending",  approver: "Sneha Iyer",     scheduled: "Jun 16", window: "01:00 – 04:00 IST", technology: "BGP",      mop: "MOP-2026-0421-v1", raisedBy: "Divya Nair (Eng)",       raisedOn: "Jun 10, 09:11", hostname: "blr-rr-01, blr-rr-02",   assignedToMe: false, impactedParties: ["NMS", "Data Center"],                       spoc: null,           fieldEngineer: null },
  { id: "CRQ-2026-0422", activity: "GPON OLT firmware patch — Surat ring",        domain: "Optics",   circle: "GJ",   stage: "Scheduling",      sla: 58, impact: "SA",  status: "pending",  approver: "Priya Deshmukh", scheduled: "Jun 15", window: "00:30 – 03:30 IST", technology: "GPON",     mop: "MOP-2026-0422-v1", raisedBy: "Karan Mehta (NOC L2)",  raisedOn: "Jun 10, 11:04", hostname: "sur-olt-12, 13, 14",     assignedToMe: false, impactedParties: ["Telemedia", "B2B"],                         spoc: "Priya Deshmukh", fieldEngineer: null },
  { id: "CRQ-2026-0423", activity: "MPLS-TE tunnel rerouting — Delhi metro",      domain: "IP Core",  circle: "DL",   stage: "Validation",      sla: 71, impact: "NSA", status: "pending",  approver: "Sneha Iyer",     scheduled: "Jun 17", window: "02:00 – 05:00 IST", technology: "MPLS",     mop: "MOP-2026-0423-v3", raisedBy: "Rohit Bansal (Eng)",     raisedOn: "Jun 10, 16:48", hostname: "del-p-04, 05, 06",       assignedToMe: false, impactedParties: ["ILD Voice", "B2B"],                          spoc: "Sneha Iyer",  fieldEngineer: "Arjun Rao" },
  { id: "CRQ-2026-0424", activity: "OTN wavelength provisioning 10G → 100G",       domain: "Optics",   circle: "TN",   stage: "CAB Review",     sla: 88, impact: "SA",  status: "pending",  approver: "Amit Verma",     scheduled: "Jun 14", window: "01:00 – 04:00 IST", technology: "OTN",      mop: "MOP-2026-0424-v1", raisedBy: "Lakshmi Iyer (NOC)",    raisedOn: "Jun 09, 22:10", hostname: "che-otn-08",             assignedToMe: true,  impactedParties: ["B2B", "Data Center", "TWAMP"],              spoc: "Priya Deshmukh", fieldEngineer: null },
  { id: "CRQ-2026-0425", activity: "Edge router IOS-XR 7.10 upgrade",              domain: "Packet",   circle: "AP",   stage: "Authorization",  sla: 28, impact: "NSA", status: "pending",  approver: "Anil Kumar",     scheduled: "Jun 18", window: "02:00 – 04:30 IST", technology: "IOS-XR",   mop: "MOP-2026-0425-v1", raisedBy: "Divya Nair (Eng)",       raisedOn: "Jun 11, 10:01", hostname: "vij-pe-03",              assignedToMe: false, impactedParties: ["NMS"],                                       spoc: null,           fieldEngineer: null },
  { id: "CRQ-2026-0419", activity: "5G NSA neighbor relation cleanup",             domain: "Mobility", circle: "MH",   stage: "Implementation", sla: 12, impact: "NSA", status: "approved", approver: "Kavya Reddy",    scheduled: "Jun 12", window: "01:30 – 03:30 IST", technology: "5G NSA",   mop: "MOP-2026-0419-v2", raisedBy: "Ashwin Pillai (RAN)",   raisedOn: "Jun 08, 19:22", hostname: "pun-amf-02",             assignedToMe: false, impactedParties: ["Mobility (RAN/Core)"],                       spoc: "Kavya Reddy",  fieldEngineer: "Arjun Rao" },
  { id: "CRQ-2026-0420", activity: "EPC bearer config rollback — Kolkata",         domain: "Mobility", circle: "WB",   stage: "CAB Review",     sla: 64, impact: "SA",  status: "pending",  approver: "Amit Verma",     scheduled: "Jun 15", window: "02:00 – 04:00 IST", technology: "4G EPC",   mop: "MOP-2026-0420-v1", raisedBy: "Ashwin Pillai (RAN)",   raisedOn: "Jun 10, 08:15", hostname: "kol-pgw-01",             assignedToMe: true,  impactedParties: ["Mobility (RAN/Core)", "B2B"],               spoc: "Kavya Reddy",  fieldEngineer: null },
  { id: "CRQ-2026-0415", activity: "IS-IS metric retune — North zone",             domain: "IP Core",  circle: "UP-E", stage: "CAB Review",     sla: 92, impact: "NSA", status: "rejected", approver: "Sneha Iyer",     scheduled: "Jun 12", window: "02:00 – 03:30 IST", technology: "IS-IS",    mop: "MOP-2026-0415-v1", raisedBy: "Rohit Bansal (Eng)",     raisedOn: "Jun 06, 14:00", hostname: "lko-p-02, lko-p-03",     assignedToMe: false, impactedParties: ["NMS"], rejectReason: "Conflicting Change", rejectComment: "Overlaps with CRQ-2026-0411 maintenance window — reschedule after Jun 18.", spoc: "Sneha Iyer", fieldEngineer: null },
  { id: "CRQ-2026-0417", activity: "SR-MPLS prefix-SID reassignment",              domain: "Packet",   circle: "KA",   stage: "Scheduling",     sla: 55, impact: "NSA", status: "pending",  approver: "Anil Kumar",     scheduled: "Jun 16", window: "02:00 – 04:00 IST", technology: "SR-MPLS",  mop: "MOP-2026-0417-v1", raisedBy: "Divya Nair (Eng)",       raisedOn: "Jun 09, 17:30", hostname: "blr-pe-04, blr-pe-05",   assignedToMe: false, impactedParties: ["B2B"],                                       spoc: "Anil Kumar",   fieldEngineer: null },
  { id: "CRQ-2026-0426", activity: "DCN OOB switch stack upgrade",                 domain: "Embedded", circle: "RJ",   stage: "Authorization",  sla: 40, impact: "NSA", status: "pending",  approver: "Rahul Sharma",   scheduled: "Jun 19", window: "02:30 – 04:30 IST", technology: "NX-OS",    mop: "MOP-2026-0426-v1", raisedBy: "Vikram Joshi (Embedded)", raisedOn: "Jun 11, 11:25", hostname: "jai-oob-sw-01",         assignedToMe: false, impactedParties: ["NOC - INFRA"],                              spoc: null,           fieldEngineer: null },
  { id: "CRQ-2026-0414", activity: "Firewall HA failover validation",              domain: "Embedded", circle: "MH",   stage: "Implementation", sla: 18, impact: "SA",  status: "approved", approver: "Rahul Sharma",   scheduled: "Jun 12", window: "02:00 – 03:00 IST", technology: "Palo Alto",mop: "MOP-2026-0414-v2", raisedBy: "Meera Krishnan (Sec)",   raisedOn: "Jun 07, 09:50", hostname: "mum-fw-pri, mum-fw-sec", assignedToMe: false, impactedParties: ["IT Team", "Data Center"],                   spoc: "Rahul Sharma", fieldEngineer: "Arjun Rao" },
  { id: "CRQ-2026-0413", activity: "NTP stratum-2 server replacement",             domain: "Embedded", circle: "DL",   stage: "CAB Review",     sla: 76, impact: "NSA", status: "pending",  approver: "Amit Verma",     scheduled: "Jun 15", window: "03:00 – 04:00 IST", technology: "NTP",      mop: "MOP-2026-0413-v1", raisedBy: "Vikram Joshi (Embedded)", raisedOn: "Jun 09, 12:15", hostname: "del-ntp-01, del-ntp-02", assignedToMe: true,  impactedParties: ["NOC - INFRA", "IT Team"],                   spoc: "Rahul Sharma", fieldEngineer: null },
  { id: "CRQ-2026-0412", activity: "P2P RAN backhaul cutover — Bhopal",            domain: "Packet",   circle: "MP",   stage: "CAB Review",     sla: 81, impact: "SA",  status: "pending",  approver: "Amit Verma",     scheduled: "Jun 14", window: "01:00 – 04:00 IST", technology: "CSR1000v", mop: "MOP-2026-0412-v2", raisedBy: "Ashwin Pillai (RAN)",   raisedOn: "Jun 08, 16:40", hostname: "bho-p2p-07",             assignedToMe: true,  impactedParties: ["Mobility (RAN/Core)"],                       spoc: "Anil Kumar",   fieldEngineer: "Arjun Rao" },
  { id: "CRQ-2026-0411", activity: "L3VPN VRF route-target audit",                 domain: "IP Core",  circle: "WB",   stage: "Scheduling",     sla: 47, impact: "NSA", status: "pending",  approver: "Sneha Iyer",     scheduled: "Jun 18", window: "02:00 – 04:00 IST", technology: "L3VPN",    mop: "MOP-2026-0411-v1", raisedBy: "Rohit Bansal (Eng)",     raisedOn: "Jun 10, 13:55", hostname: "kol-pe-08",              assignedToMe: false, impactedParties: ["B2B", "ILD Voice"],                          spoc: "Sneha Iyer",   fieldEngineer: null },
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

// ── Rejection reasons by stage ──────────────────────────────────────────────
export const STAGE_REJECT_REASONS: Record<CrqStage, string[]> = {
  Authorization:  ["Wrong CRQ Flow – Type of CR", "Incorrect approver mapped", "Wrong Impact - SA, NSA, CNSA", "Duplicate CRQ", "Plan Issue"],
  Scheduling:     ["Approval not received-Internal", "Approval not received-B2B", "Redundancy Failure", "Site Access Issue", "Others"],
  Validation:     ["MOP Issue", "Commissioning sheet not available/not correct", "Configuration Issue", "Pre Check failed- Planning", "Hardware Incompatibility"],
  "CAB Review":   ["Time Constraint- NOC", "Conflicting Change", "Insufficient Impact Analysis", "Stakeholder Sign-off Missing", "Activity on hold by Circle/Central/NOC team"],
  Implementation: ["FE not on site", "FE on site without proper tools", "Network Issue – Fiber", "Pre Check failed- Network", "Material un-availability"],
};
export const DEFAULT_REJECT_REASONS = ["Conflicting Change", "Incorrect Approval Mapping", "Insufficient Impact Analysis", "MOP Incomplete", "Stakeholder Sign-off Missing", "Time Constraint"];

// ── CAB sessions ────────────────────────────────────────────────────────────
export const MOCK_CAB_SESSIONS: CabSession[] = [
  { id: "CAB-2026-061", stage: "CAB Review", host: "Ravi Nair (NOC)", date: "Jun 14, 2026", time: "16:00 IST", status: "live",      type: "Critical", crqIds: ["CRQ-2026-0418", "CRQ-2026-0424", "CRQ-2026-0412"] },
  { id: "CAB-2026-062", stage: "CAB Review", host: "Ravi Nair (NOC)", date: "Jun 15, 2026", time: "11:00 IST", status: "scheduled", type: "Normal",   crqIds: ["CRQ-2026-0420", "CRQ-2026-0413"] },
  { id: "CAB-2026-060", stage: "CAB Review", host: "Ravi Nair (NOC)", date: "Jun 12, 2026", time: "16:00 IST", status: "completed", type: "Normal",   crqIds: ["CRQ-2026-0415"] },
];

export const MOCK_CAB_CHAT: CabChatMessage[] = [
  { who: "Ravi Nair",  role: "CAB Engineer",  text: "Starting with CRQ-2026-0418 — DWDM card swap. Mobility SPOC, please confirm redundancy.", mine: false, time: "16:02" },
  { who: "Sneha Iyer", role: "SPOC IP Core",  text: "Redundancy is in place on the protect path. No objection from IP Core.",                  mine: true,  time: "16:04" },
  { who: "Ravi Nair",  role: "CAB Engineer",  text: "Noted. B2B impact acknowledged, proceeding to 0424.",                                       mine: false, time: "16:05" },
];

// ── SE rings (Implementation) ───────────────────────────────────────────────
export const MOCK_SE_RINGS: SeRing[] = [
  { id: "ring-a", ring: "Ring-A · Mumbai Core", locA: "mum-core-01", locB: "mum-core-02", type: "Protection switch", slotStart: "02:00", slotEnd: "02:45", decision: "pending" },
  { id: "ring-b", ring: "Ring-B · Pune Aggr",   locA: "pun-aggr-03", locB: "pun-aggr-04", type: "EDFA card swap",     slotStart: "02:45", slotEnd: "03:30", decision: "pending" },
  { id: "ring-c", ring: "Ring-C · Nashik Spur", locA: "nsk-olt-07",  locB: "nsk-olt-08",  type: "Fiber re-route",     slotStart: "03:30", slotEnd: "04:15", decision: "pending" },
];

// ── Admin: users / matrix / rules / audit ───────────────────────────────────
export const MOCK_ADMIN_USERS: AdminUser[] = [
  { name: "Amit Verma",     olm: "amver01", role: "CTO / Admin",   domain: "All Domains", access: "Approve", status: "active"   },
  { name: "Priya Deshmukh", olm: "prides3", role: "COH (L4)",      domain: "Optics",      access: "Approve", status: "active"   },
  { name: "Sneha Iyer",     olm: "sneiy04", role: "Lead (L3)",     domain: "IP Core",     access: "Approve", status: "active"   },
  { name: "Ravi Nair",      olm: "ravna02", role: "CAB Engineer",  domain: "All Domains", access: "Write",   status: "active"   },
  { name: "Karan Mehta",    olm: "karme07", role: "Requester (L2)",domain: "Optics",      access: "Write",   status: "active"   },
  { name: "Arjun Rao",      olm: "arjra09", role: "Field SE",      domain: "Optics",      access: "Read",    status: "active"   },
  { name: "Vikram Joshi",   olm: "vikjo05", role: "Manager (L3)",  domain: "Embedded",    access: "Approve", status: "inactive" },
];

export const REJECTION_STAGES = ["Initial Technical Review", "Domain Approval", "CAB Review", "Implementation Gate", "Post Implementation Review"];

export const MOCK_ESCALATION_MATRIX: EscalationRow[] = [
  { stage: "Scheduling",     l1: "6h", l2: "3h", l3: "1h",  notify: "SPOC → Domain Head" },
  { stage: "Validation",     l1: "4h", l2: "2h", l3: "1h",  notify: "Eng Lead → COH"      },
  { stage: "CAB Review",     l1: "8h", l2: "4h", l3: "2h",  notify: "CAB Eng → CTO"       },
  { stage: "Implementation", l1: "2h", l2: "1h", l3: "30m", notify: "NOC-NS → Duty Manager" },
];

export const ASSIGN_STAGES: CrqStage[] = ["Scheduling", "Validation", "CAB Review", "Implementation"];
export const ASSIGN_DOMAINS = ["IP Core", "Optics", "Packet", "Embedded", "Mobility"] as const;
export const ASSIGN_CIRCLES = ["MH", "KA", "GJ", "DL", "TN", "AP", "WB", "UP-E", "RJ", "MP"] as const;

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
export const MOCK_ASSIGN_MATRIX: AssignMatrixCell[] = ASSIGN_STAGES.flatMap((stage) =>
  ASSIGN_DOMAINS.map((domain) => ({
    stage,
    domain,
    approver: stage === "CAB Review" ? "Amit Verma" : ASSIGN_DEFAULT_BY_DOMAIN[domain],
  }))
);

export const MOCK_ASSIGN_RULES: AssignRule[] = [
  { id: "AR-01", domain: "Optics",   circle: "TN", impact: "SA",  stage: "CAB Review",  approver: "Priya Deshmukh", active: true  },
  { id: "AR-02", domain: "Mobility", circle: "MH", impact: "SA",  stage: "Scheduling",  approver: "Kavya Reddy",    active: true  },
  { id: "AR-03", domain: "IP Core",  circle: "KA", impact: "NSA", stage: "Scheduling",  approver: "Sneha Iyer",     active: false },
];

export const SERVICE_TYPES = ["Enterprise Services (B2B)", "Mobility", "Telemedia", "Core Services"];
export const SERVICE_IMPACTS: ImpactCode[] = ["SA", "NSA"];
export const SERVICE_CIRCLES = ["All", "MH", "KA", "GJ", "DL", "TN", "AP", "WB", "UP-E", "RJ", "MP"];
export const APPROVAL_AUTHORITIES = ["GSMC", "RAN Head", "COH", "Core Head", "NOC Head", "Domain Head", "Duty Manager", "CTO"];

export const MOCK_SERVICE_RULES: ServiceApprovalRule[] = [
  { id: "SR-01", service: "Enterprise Services (B2B)", circle: "All", impact: "SA",  l1: "GSMC",      l2: "NOC Head", l3: "CTO", active: true  },
  { id: "SR-02", service: "Mobility",                  circle: "All", impact: "SA",  l1: "RAN Head",  l2: "NOC Head", l3: "CTO", active: true  },
  { id: "SR-03", service: "Telemedia",                 circle: "All", impact: "NSA", l1: "COH",       l2: "NOC Head", l3: "CTO", active: false },
  { id: "SR-04", service: "Core Services",             circle: "All", impact: "SA",  l1: "Core Head", l2: "NOC Head", l3: "CTO", active: false },
];

export const MOCK_REJECTION_REASONS: RejectionReason[] = [
  { reason: "Wrong CRQ Flow – Type of CR",     active: true  },
  { reason: "Incorrect approver mapped",       active: true  },
  { reason: "Wrong Impact - SA, NSA, CNSA",    active: true  },
  { reason: "Duplicate CRQ",                   active: true  },
  { reason: "Plan Issue",                      active: false },
];

export const MOCK_AUDIT_LOG: AuditEntry[] = [
  { actor: "Karan Mehta",    action: "CRQ Raised",                          crq: "CRQ-2026-0418", stage: "Authorization", time: "Jun 09, 14:32", tag: "create"   },
  { actor: "System",         action: "SLA timer started (L1 · 4h)",         crq: "CRQ-2026-0418", stage: "Authorization", time: "Jun 09, 14:32", tag: "system"   },
  { actor: "Sneha Iyer",     action: "Approved",                            crq: "CRQ-2026-0418", stage: "Scheduling",    time: "Jun 10, 09:18", tag: "approve"  },
  { actor: "System",         action: "Escalation triggered — SLA < 50%",    crq: "CRQ-2026-0418", stage: "CAB Review",    time: "Jun 13, 21:40", tag: "escalate" },
  { actor: "Priya Deshmukh", action: "Delegated to Sneha Iyer",             crq: "CRQ-2026-0422", stage: "Scheduling",    time: "Jun 11, 10:02", tag: "delegate" },
  { actor: "Sneha Iyer",     action: "Rejected — Conflicting Change",       crq: "CRQ-2026-0415", stage: "CAB Review",    time: "Jun 11, 16:22", tag: "reject"   },
];

// ─────────────────────────────────────────────────────────────────────────────
//  Derived datasets — built from MOCK_CRQS so they always stay in sync.
// ─────────────────────────────────────────────────────────────────────────────

/** Resolve `value` after `ms` ms — simulates network latency. */
export const mockDelay = <T>(value: T, ms = 350): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

export const buildDashboard = (crqs: Crq[] = MOCK_CRQS): DashboardData => {
  const total = crqs.length;
  const counts: Record<CrqStage, number> = {
    Authorization: 0, Scheduling: 0, Validation: 0, "CAB Review": 0, Implementation: 0,
  };
  crqs.forEach((c) => { counts[c.stage] += 1; });

  return {
    title: "CAB Command Center",
    subtitle: "Cross-domain CRQ health — SLA, escalations and the next action queue.",
    totalCount: total,
    kpis: [
      { label: "Active CRQs",       value: crqs.filter((c) => c.status === "pending").length,  foot: "Across all stages",        accent: "blue"   },
      { label: "In CAB Review",     value: crqs.filter((c) => c.stage === "CAB Review").length, foot: "Awaiting CAB approval",    accent: "orange" },
      { label: "SLA Breach Risk",   value: crqs.filter((c) => c.sla >= 80).length,             foot: "Critical SLA tier",        accent: "red"    },
      { label: "Approved this week",value: crqs.filter((c) => c.status === "approved").length,  foot: "Across all domains",       accent: "green"  },
    ],
    stageBars: STAGES.map<{ stage: CrqStage; count: number; pct: number }>((s) => ({
      stage: s,
      count: counts[s],
      pct: total ? Math.round((counts[s] / total) * 100) : 0,
    })),
    escalations: crqs
      .filter((c) => c.sla >= 80 && c.status === "pending")
      .slice(0, 4)
      .map((c) => ({ id: c.id, activity: c.activity, sla: c.sla })),
    actionQueueTitle: "Action queue — CRQs awaiting your move",
    actionQueue: crqs.filter((c) => c.status === "pending").slice(0, 5),
  };
};

export const buildMyCrqs = (
  role: Role,
  crqs: Crq[] = MOCK_CRQS
): MyCrqsResponse => {
  const mode: "approve" | "assign" = role === "cabEngineer" ? "assign" : "approve";
  const rows =
    mode === "assign"
      ? crqs.filter((c) => c.stage === "Scheduling" || c.stage === "CAB Review")
      : crqs.filter((c) => c.assignedToMe);

  return {
    mode,
    title: mode === "assign" ? "Assignment Queue" : "My CRQs",
    subtitle:
      mode === "assign"
        ? "CRQs awaiting SPOC / Field Engineer assignment from the CAB Engineer."
        : "Approve, reject, delegate or reschedule CRQs that need your sign-off.",
    stats: {
      awaitingMe: rows.filter((c) => c.status === "pending").length,
      approvedThisWeek: 3,
      rejectedThisWeek: 1,
    },
    rows,
  };
};

export const buildCabQueue = (crqs: Crq[] = MOCK_CRQS): CabQueueRow[] =>
  crqs
    .filter((c) => c.stage === "CAB Review" && c.status === "pending")
    .map<CabQueueRow>((c) => ({
      id: c.id,
      activity: c.activity,
      impact: c.impact,
      b2b: c.impactedParties.includes("B2B"),
      critical: c.impact === "SA" ? "Critical" : c.impact === "NSA" ? "Routine" : "Moderate",
      domain: c.domain,
      window: c.window,
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
      sessionId: s.id,
      type: s.type,
      crqIds: s.crqIds,
    };
  });

export const buildAgenda = (
  session: CabSession,
  crqs: Crq[] = MOCK_CRQS
): CabAgendaItem[] =>
  session.crqIds
    .map((id) => crqs.find((c) => c.id === id))
    .filter((c): c is Crq => !!c)
    .map<CabAgendaItem>((c) => ({
      id: c.id,
      activity: c.activity,
      stage: c.stage,
      domain: c.domain,
      impact: c.impact,
      hostname: c.hostname,
    }));

export const buildImplementation = (
  crqId: string,
  crqs: Crq[] = MOCK_CRQS
): ImplementationDetail | null => {
  const crq = crqs.find((c) => c.id === crqId);
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
    const breach = inDomain.filter((c) => c.sla >= 80).length;
    const total = inDomain.length;
    const ratio = total ? breach / total : 0;
    return {
      domain: domain as Crq["domain"],
      breach,
      total,
      level: (ratio > 0.5 ? "high" : ratio > 0.25 ? "mid" : "low") as "low" | "mid" | "high",
    };
  });
  return {
    total: crqs.length,
    approved: crqs.filter((c) => c.status === "approved").length,
    rejected: crqs.filter((c) => c.status === "rejected").length,
    breachRisk: crqs.filter((c) => c.sla >= 80).length,
    heat,
  };
};

// ── Journey builder (parallel tracks + approval chain) ──────────────────────
const STAGE_TO_PIPE: Record<CrqStage, number> = {
  Authorization: 1, Scheduling: 2, Validation: 3, "CAB Review": 4, Implementation: 5,
};
const pipeIndexFor = (c: Crq) => (c.status === "approved" ? 6 : STAGE_TO_PIPE[c.stage] ?? 0);

export const buildJourney = (
  crqId: string,
  crqs: Crq[] = MOCK_CRQS
): CrqJourney | null => {
  const crq = crqs.find((c) => c.id === crqId);
  if (!crq) return null;

  const stageIdx = STAGES.indexOf(crq.stage);
  const approvalChain = STAGES.map<{
    level: string; label: string; who: string;
    state: "completed" | "in_progress" | "pending" | "rejected" | "not_started";
  }>((s, i) => {
    const level = `L${i + 1}`;
    const who =
      i === 0 ? "NOC Shift Lead" :
      i === 1 ? "Domain SPOC · Kavya Reddy" :
      i === 2 ? "Engineering · Rohit Bansal" :
      i === 3 ? crq.approver :
                "Field SE · Arjun Rao";
    let state: "completed" | "in_progress" | "pending" | "rejected" | "not_started";
    if (crq.status === "approved")            state = "completed";
    else if (crq.status === "rejected" && i === stageIdx) state = "rejected";
    else if (i < stageIdx)                    state = "completed";
    else if (i === stageIdx)                  state = "in_progress";
    else                                       state = "not_started";
    return { level, label: s, who, state };
  });

  const pipeIdx = pipeIndexFor(crq);
  const b2b = crq.impactedParties.includes("B2B");

  const trackDefs: { track: string; approver: string; role: string; color: string }[] = [
    { track: `${crq.domain} Domain`,     approver: crq.approver,    role: "Domain SPOC",       color: DOMAIN_COLOR[crq.domain] ?? "#1565C0" },
    { track: "Change Management",        approver: "Ravi Nair",     role: "CAB Engineer",      color: "#5E35B1" },
  ];
  if (crq.impact === "SA") trackDefs.push({ track: "NOC Operations",       approver: "Shift Lead Desk",   role: "Operations Assurance", color: "#00796B" });
  if (b2b)                 trackDefs.push({ track: "Enterprise / B2B",     approver: "B2B Assurance Cell",role: "Enterprise Impact",    color: "#C2185B" });
  trackDefs.push({ track: "Security & Compliance", approver: "SecOps Desk", role: "Risk & Compliance", color: "#455A64" });

  const gateIdx = 4;
  const parallelTracks = trackDefs.map((d, i) => {
    let status: "approved" | "reviewing" | "pending" | "queued" | "rejected";
    if (crq.status === "approved" || pipeIdx > gateIdx)              status = "approved";
    else if (crq.status === "rejected" && pipeIdx === gateIdx)       status = "rejected";
    else if (pipeIdx === gateIdx)                                    status = i === 0 ? "reviewing" : i % 2 ? "pending" : "approved";
    else                                                              status = pipeIdx < gateIdx ? "queued" : "approved";
    return { ...d, status, time: status === "approved" ? "Approved" : status === "rejected" ? "Rejected" : "—" };
  });

  return {
    crq,
    pipeIndex: pipeIdx,
    approvalChain,
    parallelTracks,
    remarks: [
      { who: crq.raisedBy, role: "Requester",       stage: "Authorization", comment: "Pre-checks complete, redundancy verified.", time: crq.raisedOn },
      { who: "Sneha Iyer", role: "Domain SPOC",     stage: "Scheduling",    comment: "Window confirmed with B2B SPOC.",           time: "Jun 10, 12:04" },
    ],
  };
};
