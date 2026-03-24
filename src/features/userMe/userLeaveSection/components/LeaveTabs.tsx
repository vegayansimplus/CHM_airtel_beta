import { Tabs, Tab } from "@mui/material";
import type { LeaveTabValue } from "../types/leave.types";

interface Tab {
  label: string;
  value: LeaveTabValue;
}

const TABS: Tab[] = [
  { label: "All", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
];

interface LeaveTabsProps {
  value: LeaveTabValue;
  onChange: (value: LeaveTabValue) => void;
}

export const LeaveTabs = ({ value, onChange }: LeaveTabsProps) => (
  <Tabs
    value={value}
    onChange={(_, newValue: LeaveTabValue) => onChange(newValue)}
    indicatorColor="primary"
    textColor="primary"
    variant="scrollable"
    scrollButtons="auto"
  >
    {TABS.map((tab) => (
      <Tab key={tab.value} label={tab.label} value={tab.value} />
    ))}
  </Tabs>
);