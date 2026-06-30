import { Box, Tab, Tabs, Typography } from "@mui/material";
import { useState } from "react";
import { AdminAnalyticsTab } from "./admin/AnalyticsTab";
import { AdminAssignMatrixTab } from "./admin/AssignMatrixTab";
import { AdminReasonsTab } from "./admin/ReasonsTab";
import { AdminEscalationMatrixTab } from "./admin/EscalationMatrixTab";
import { AdminUsersTab } from "./admin/UsersTab";
import { AdminAuditTab } from "./admin/AuditTab";

const TABS = [
  { id: "analytics",   label: "Analytics" },
  { id: "assign",      label: "Assignment Matrix" },
  { id: "reasons",     label: "Rejection Reasons" },
  { id: "escalation",  label: "Escalation Matrix" },
  { id: "users",       label: "Users & Roles" },
  { id: "audit",       label: "Audit Log" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function AdminPage() {
  const [tab, setTab] = useState<TabId>("analytics");

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 500, letterSpacing: "-0.3px" }}>Admin Configuration</Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
          Cross-domain analytics and governance controls — visible only to NOC Admin.
        </Typography>
      </Box>

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v as TabId)}
        sx={{ mb: 3, borderBottom: 1, borderColor: "divider" }}
      >
        {TABS.map((t) => <Tab key={t.id} label={t.label} value={t.id} />)}
      </Tabs>

      {tab === "analytics"  && <AdminAnalyticsTab />}
      {tab === "assign"     && <AdminAssignMatrixTab />}
      {tab === "reasons"    && <AdminReasonsTab />}
      {tab === "escalation" && <AdminEscalationMatrixTab />}
      {tab === "users"      && <AdminUsersTab />}
      {tab === "audit"      && <AdminAuditTab />}
    </Box>
  );
}
