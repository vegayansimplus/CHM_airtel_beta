import { useMemo } from "react";
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
import type { User } from "../types/user";

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

export default function StatsSection({ users }: { users: User[] }) {
  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.active).length;
    const leads = users.filter((u) => u.role === "Team Lead").length;
    const admins = users.filter((u) => u.role === "Super Admin").length;
    const inactive = users.filter((u) => !u.active).length;
    const now = new Date();
    const newThisMonth = users.filter((u) => {
      const d = new Date(`1 ${u.joinedDate}`);
      return (
        !Number.isNaN(d.getTime()) &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear()
      );
    }).length;

    return { total, active, leads, admins, inactive, newThisMonth };
  }, [users]);

  const cards = [
    {
      label: "Total Users",
      value: stats.total,
      icon: Group,
      color: "#2563EB",
      gradient: "linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)",
      trend: 8,
    },
    {
      label: "Active Users",
      value: stats.active,
      icon: Verified,
      color: "#10B981",
      gradient: "linear-gradient(135deg, #34D399 0%, #059669 100%)",
      trend: 5,
    },
    {
      label: "Team Leads",
      value: stats.leads,
      icon: SupervisorAccount,
      color: "#7C3AED",
      gradient: "linear-gradient(135deg, #A78BFA 0%, #6D28D9 100%)",
      trend: 2,
    },
    {
      label: "Super Admins",
      value: stats.admins,
      icon: Shield,
      color: "#DC2626",
      gradient: "linear-gradient(135deg, #F87171 0%, #B91C1C 100%)",
      trend: 0,
    },
    {
      label: "Inactive Users",
      value: stats.inactive,
      icon: PersonOff,
      color: "#F59E0B",
      gradient: "linear-gradient(135deg, #FBBF24 0%, #D97706 100%)",
      trend: -4,
    },
    {
      label: "New This Month",
      value: stats.newThisMonth,
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
