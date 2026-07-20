import { Stack } from "@mui/material";
import {
  Group,
  Shield,
  SupervisorAccount,
  PersonOff,
  PersonAdd,
  Verified,
} from "@mui/icons-material";
import StatCard from "./StatCard";
import type { UserStats } from "../api/userManagementApi";

// Deterministic pseudo-trend so sparklines don't jump around on re-render.
function seededSeries(seed: number, base: number) {
  const out: number[] = [];
  let x = seed || 1;
  for (let i = 0; i < 7; i++) {
    x = (x * 9301 + 49297) % 233280;
    const wobble = (x / 233280 - 0.5) * base * 0.35;
    out.push(Math.max(0, Math.round(base * 0.7 + i * (base * 0.05) + wobble)));
  }
  return out;
}

// Stats are unfiltered aggregates across all users, returned alongside the
// filtered/paginated grid by the same sp_get_users_paginated call - not
// derived from the (search/filter/page-limited) rows currently on screen.
export default function StatsSection({ stats }: { stats?: UserStats }) {
  const s = stats ?? { activeCount: 0, inactiveCount: 0, adminCount: 0, headCount: 0, newThisMonth: 0 };
  const total = s.activeCount + s.inactiveCount;

  const cards = [
    {
      label: "Total Users",
      value: total,
      icon: Group,
      color: "#2563EB",
      gradient: "linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)",
      trend: 8,
    },
    {
      label: "Active Users",
      value: s.activeCount,
      icon: Verified,
      color: "#10B981",
      gradient: "linear-gradient(135deg, #34D399 0%, #059669 100%)",
      trend: 5,
    },
    {
      label: "Team Heads",
      value: s.headCount,
      icon: SupervisorAccount,
      color: "#7C3AED",
      gradient: "linear-gradient(135deg, #A78BFA 0%, #6D28D9 100%)",
      trend: 2,
    },
    {
      label: "Super Admins",
      value: s.adminCount,
      icon: Shield,
      color: "#DC2626",
      gradient: "linear-gradient(135deg, #F87171 0%, #B91C1C 100%)",
      trend: 0,
    },
    {
      label: "Inactive Users",
      value: s.inactiveCount,
      icon: PersonOff,
      color: "#F59E0B",
      gradient: "linear-gradient(135deg, #FBBF24 0%, #D97706 100%)",
      trend: -4,
    },
    {
      label: "New This Month",
      value: s.newThisMonth,
      icon: PersonAdd,
      color: "#0891B2",
      gradient: "linear-gradient(135deg, #22D3EE 0%, #0E7490 100%)",
      trend: 12,
    },
  ];

  return (
    <Stack direction="row" flexWrap="wrap" gap={1} mb={2}>
      {cards.map((c, i) => (
        <StatCard
          key={c.label}
          index={i}
          label={c.label}
          value={c.value}
          icon={c.icon}
          color={c.color}
          gradient={c.gradient}
          trend={c.trend}
          sparkline={seededSeries(c.value * 17 + i * 31 + 1, Math.max(c.value, 1))}
        />
      ))}
    </Stack>
  );
}
