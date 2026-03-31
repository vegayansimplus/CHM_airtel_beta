import { useState, useEffect, useRef, type CSSProperties } from "react";
import {
  Box,
  Typography,
  Select,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  Paper,
  useTheme,
} from "@mui/material";
import { createTheme, ThemeProvider, alpha } from "@mui/material/styles";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  RadarController,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Bar, Radar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  RadarController,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
);

ChartJS.defaults.color = "rgba(180, 210, 255, 0.75)";
ChartJS.defaults.borderColor = "rgba(255, 255, 255, 0.07)";
ChartJS.defaults.plugins.tooltip.backgroundColor = "rgba(5, 18, 40, 0.97)";
ChartJS.defaults.plugins.tooltip.borderColor = "rgba(0, 191, 255, 0.3)";
ChartJS.defaults.plugins.tooltip.borderWidth = 1;
ChartJS.defaults.plugins.tooltip.titleColor = "#00e5ff";
ChartJS.defaults.plugins.tooltip.bodyColor = "rgba(200, 225, 255, 0.9)";
ChartJS.defaults.plugins.tooltip.padding = 10;
ChartJS.defaults.plugins.tooltip.cornerRadius = 8;

// ─── THEME ───────────────────────────────────────────────────────────────────
const nocTheme = createTheme({
  palette: {
    mode: "dark",
    background: { default: "#010913", paper: "rgba(6,18,40,0.72)" },
    primary: { main: "#00bfff" },
    secondary: { main: "#00ff88" },
    error: { main: "#ff3366" },
    warning: { main: "#ffd700" },
    info: { main: "#00e5ff" },
    text: { primary: "#cce0ff", secondary: "rgba(130,175,230,0.65)" },
  },
  typography: {
    fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
    h1: { fontFamily: "'Rajdhani', 'Bebas Neue', 'Impact', sans-serif" },
    h2: { fontFamily: "'Rajdhani', 'Bebas Neue', 'Impact', sans-serif" },
    h3: { fontFamily: "'Rajdhani', 'Bebas Neue', 'Impact', sans-serif" },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          background: "rgba(6,18,40,0.72)",
          backdropFilter: "blur(22px)",
          WebkitBackdropFilter: "blur(22px)",
          border: "1px solid rgba(0,191,255,0.11)",
          borderRadius: "14px",
          boxShadow:
            "0 4px 28px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.04)",
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          background: "rgba(8,20,46,0.88)",
          color: "rgba(180,215,255,0.9)",
          fontSize: "11px",
          fontFamily: "'JetBrains Mono', monospace",
          borderRadius: "8px",
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(0,191,255,0.18)",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(0,191,255,0.38)",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(0,191,255,0.55)",
          },
        },
        icon: { color: "rgba(0,191,255,0.55)" },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontSize: "11px",
          fontFamily: "'JetBrains Mono', monospace",
          color: "rgba(180,215,255,0.9)",
          background: "rgba(5,15,35,0.98)",
          "&:hover": { background: "rgba(0,100,180,0.25)" },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: "1px solid rgba(255,255,255,0.04)",
          padding: "5px 6px",
          fontSize: "10px",
          fontFamily: "'JetBrains Mono', monospace",
        },
        head: {
          color: "rgba(110,160,215,0.55)",
          fontWeight: 700,
          fontSize: "9px",
          letterSpacing: "0.06em",
          background: "transparent",
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          "&:hover": { background: "rgba(0,191,255,0.04)" },
          transition: "background 0.15s",
          cursor: "default",
        },
      },
    },
  },
});

// ─── COLORS ──────────────────────────────────────────────────────────────────
const C = {
  blue: "#00bfff",
  cyan: "#00e5ff",
  green: "#00ff88",
  orange: "#ff8c00",
  red: "#ff3366",
  yellow: "#ffd700",
  purple: "#bf5fff",
  teal: "#00e0c6",
  pink: "#ff69b4",
};

const neonStyle = (color: string): CSSProperties => ({
  color,
  textShadow: `0 0 10px ${color}90, 0 0 22px ${color}40`,
});

// ─── DATA ────────────────────────────────────────────────────────────────────
const KPI_DATA = [
  {
    title: "Total CRQs",
    value: "2,847",
    change: "+12.3%",
    up: true,
    color: C.blue,
    spark: [180, 210, 195, 230, 250, 240, 270, 255, 280, 285],
  },
  {
    title: "Open CRQs",
    value: "423",
    change: "-8.5%",
    up: false,
    color: C.cyan,
    spark: [520, 490, 470, 460, 455, 450, 440, 435, 425, 423],
  },
  {
    title: "Completed",
    value: "2,284",
    change: "+15.7%",
    up: true,
    color: C.green,
    spark: [1500, 1650, 1780, 1850, 1920, 2050, 2100, 2180, 2240, 2284],
  },
  {
    title: "Rejected",
    value: "140",
    change: "-3.2%",
    up: false,
    color: C.orange,
    spark: [165, 158, 155, 152, 148, 145, 143, 141, 140, 140],
  },
  {
    title: "SLA Score",
    value: "94.2%",
    change: "+2.1%",
    up: true,
    color: C.yellow,
    spark: [88, 89, 90, 91, 91.5, 92, 93, 93.5, 94, 94.2],
  },
];

const SLA_ROWS = [
  {
    id: "CRQ-0891",
    domain: "MPLS Core",
    eng: "R. Singh",
    status: "safe",
    time: "47h 23m",
  },
  {
    id: "CRQ-0892",
    domain: "IP Access",
    eng: "D. Chen",
    status: "risk",
    time: "1h 45m",
  },
  {
    id: "CRQ-0893",
    domain: "Optics",
    eng: "S. Kim",
    status: "breach",
    time: "-2h 10m",
  },
  {
    id: "CRQ-0894",
    domain: "Transport",
    eng: "A. Al-Farsi",
    status: "safe",
    time: "23h 50m",
  },
  {
    id: "CRQ-0895",
    domain: "Voice/VoIP",
    eng: "P. Nair",
    status: "risk",
    time: "3h 12m",
  },
  {
    id: "CRQ-0896",
    domain: "Embedded",
    eng: "J. Wu",
    status: "safe",
    time: "71h 05m",
  },
  {
    id: "CRQ-0897",
    domain: "MPLS Core",
    eng: "M. Garcia",
    status: "breach",
    time: "-5h 33m",
  },
  {
    id: "CRQ-0898",
    domain: "IP Access",
    eng: "R. Mehta",
    status: "risk",
    time: "0h 58m",
  },
  {
    id: "CRQ-0899",
    domain: "Optics",
    eng: "L. Zhang",
    status: "safe",
    time: "15h 42m",
  },
  {
    id: "CRQ-0900",
    domain: "Transport",
    eng: "E. Wilson",
    status: "safe",
    time: "38h 17m",
  },
];

const BREACH_RISK = [
  { domain: "MPLS Core", healthy: 145, risk: 23, breach: 5 },
  { domain: "IP Access", healthy: 98, risk: 31, breach: 12 },
  { domain: "Optics", healthy: 67, risk: 18, breach: 8 },
  { domain: "Transport", healthy: 112, risk: 14, breach: 3 },
  { domain: "Voice/VoIP", healthy: 78, risk: 22, breach: 9 },
  { domain: "Embedded", healthy: 54, risk: 10, breach: 2 },
];

const DOMAIN_SLA = [
  { domain: "MPLS Core", pct: 96.8, color: C.cyan },
  { domain: "IP Access", pct: 91.2, color: C.blue },
  { domain: "Optics", pct: 88.5, color: C.orange },
  { domain: "Transport", pct: 95.4, color: C.green },
  { domain: "Voice/VoIP", pct: 89.7, color: C.purple },
  { domain: "Embedded", pct: 93.1, color: C.yellow },
];

const ALERTS = [
  {
    level: "critical",
    msg: "CRQ-0893 SLA BREACHED — Optics domain, 2h 10m overdue",
    t: "14:23:45",
  },
  {
    level: "critical",
    msg: "CRQ-0897 SLA BREACHED — MPLS Core domain, 5h 33m overdue",
    t: "14:18:02",
  },
  {
    level: "warning",
    msg: "CRQ-0892 approaching SLA breach — 1h 45m remaining",
    t: "14:15:30",
  },
  {
    level: "warning",
    msg: "CRQ-0898 critical SLA risk — only 58m remaining",
    t: "14:12:11",
  },
  {
    level: "warning",
    msg: "3 CRQs in IP Access domain at risk of imminent SLA breach",
    t: "14:08:55",
  },
  {
    level: "info",
    msg: "CCB approval queue: 18 pending items, avg wait time 4.2h",
    t: "14:05:20",
  },
  {
    level: "info",
    msg: "SE Team utilization at 87% — consider workload rebalancing",
    t: "13:58:44",
  },
];

const FEED = [
  {
    t: "14:27:32",
    msg: "[MPLS-CORE] CRQ-0891 state: Implementation → Closure",
    type: "info",
  },
  {
    t: "14:26:18",
    msg: "[IP-ACCESS] CRQ-0898 validator assigned: R. Mehta",
    type: "info",
  },
  {
    t: "14:25:45",
    msg: "[OPTICS]    CRQ-0893 SLA BREACH DETECTED — escalating L3",
    type: "error",
  },
  {
    t: "14:24:33",
    msg: "[TRANSPORT] CRQ-0894 MOP approved by CCB board",
    type: "success",
  },
  {
    t: "14:23:12",
    msg: "[VOICE]     CRQ-0895 impact analysis completed",
    type: "info",
  },
  {
    t: "14:22:05",
    msg: "[EMBEDDED]  CRQ-0896 moved to implementation phase",
    type: "info",
  },
  {
    t: "14:21:47",
    msg: "[MPLS-CORE] CRQ-0897 SLA BREACH — escalation email sent",
    type: "error",
  },
  {
    t: "14:20:30",
    msg: "[IP-ACCESS] CRQ-0902 new CRQ created by D. Chen",
    type: "info",
  },
  {
    t: "14:19:15",
    msg: "[OPTICS]    CRQ-0903 plan review scheduled 15:00 UTC",
    type: "info",
  },
  {
    t: "14:18:02",
    msg: "[TRANSPORT] CRQ-0888 successfully closed — SLA met ✓",
    type: "success",
  },
  {
    t: "14:17:44",
    msg: "[MPLS-CORE] CRQ-0885 closure validated by R. Singh",
    type: "success",
  },
  {
    t: "14:16:20",
    msg: "[IP-ACCESS] CCB meeting rescheduled → 16:30 UTC today",
    type: "warning",
  },
  {
    t: "14:15:05",
    msg: "[VOICE]     CRQ-0895 SLA WARNING — 1h 45m remaining",
    type: "warning",
  },
  {
    t: "14:14:30",
    msg: "[EMBEDDED]  CRQ-0896 change window confirmed 23:00 UTC",
    type: "info",
  },
  {
    t: "14:13:22",
    msg: "[TRANSPORT] Bulk update: 5 CRQs moved to validation",
    type: "info",
  },
];

const BOTTLENECKS = [
  { name: "Approver Queue", val: 67, color: C.orange },
  { name: "Validator Review", val: 45, color: C.yellow },
  { name: "SE Team Load", val: 82, color: C.red },
  { name: "CCB Backlog", val: 58, color: C.purple },
  { name: "MOP Preparation", val: 34, color: C.cyan },
];

const LIFECYCLE = [
  { label: "Planning", val: 72, color: C.cyan },
  { label: "Impact", val: 85, color: C.green },
  { label: "MOP Creation", val: 61, color: C.yellow },
  { label: "Execution", val: 78, color: C.orange },
  { label: "Closure", val: 92, color: C.blue },
];

const HM_DOMAINS = [
  "MPLS",
  "IP Access",
  "Optics",
  "Transport",
  "Voice",
  "Embedded",
];
const HM_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HM_VALUES = [
  [12, 8, 15, 22, 18, 5, 3],
  [7, 18, 25, 12, 9, 6, 2],
  [5, 11, 8, 19, 24, 10, 4],
  [9, 14, 11, 7, 16, 13, 1],
  [15, 22, 18, 9, 12, 8, 5],
  [3, 7, 9, 15, 11, 4, 2],
];

// ─── CHART DATA ───────────────────────────────────────────────────────────────
const TICKET_AGING_DATA = {
  labels: ["<2 hrs", "2–6 hrs", "6–12 hrs", "12–24 hrs"],
  datasets: [
    {
      label: "Open",
      data: [45, 78, 62, 34],
      backgroundColor: "rgba(0,191,255,0.85)",
      borderRadius: 3,
    },
    {
      label: "At Risk",
      data: [12, 28, 45, 67],
      backgroundColor: "rgba(255,215,0,0.85)",
      borderRadius: 3,
    },
    {
      label: "Breached",
      data: [3, 8, 18, 42],
      backgroundColor: "rgba(255,51,102,0.85)",
      borderRadius: 3,
    },
    {
      label: "SLA Safe",
      data: [89, 145, 112, 78],
      backgroundColor: "rgba(0,255,136,0.72)",
      borderRadius: 3,
    },
  ],
};

const AGING_FUNNEL_DATA = {
  labels: ["<2 days", "3–4 days", "6–8 days", ">8 days"],
  datasets: [
    {
      label: "Released",
      data: [245, 178, 92, 45],
      backgroundColor: "rgba(0,191,255,0.82)",
      borderRadius: 3,
    },
    {
      label: "Validation",
      data: [89, 134, 78, 62],
      backgroundColor: "rgba(255,215,0,0.78)",
      borderRadius: 3,
    },
    {
      label: "Implementation",
      data: [123, 98, 67, 38],
      backgroundColor: "rgba(0,255,136,0.75)",
      borderRadius: 3,
    },
  ],
};

const RADAR_DATA = {
  labels: [
    "MPLS Core",
    "IP Access",
    "Optics",
    "Embedded",
    "Transport",
    "Voice",
  ],
  datasets: [
    {
      label: "R. Singh",
      data: [85, 60, 40, 30, 55, 70],
      backgroundColor: "rgba(0,191,255,0.1)",
      borderColor: C.blue,
      pointBackgroundColor: C.blue,
      borderWidth: 2,
      pointRadius: 3,
    },
    {
      label: "D. Chen",
      data: [40, 90, 55, 20, 35, 45],
      backgroundColor: "rgba(0,255,136,0.1)",
      borderColor: C.green,
      pointBackgroundColor: C.green,
      borderWidth: 2,
      pointRadius: 3,
    },
    {
      label: "S. Kim",
      data: [30, 45, 95, 60, 25, 35],
      backgroundColor: "rgba(255,215,0,0.1)",
      borderColor: C.yellow,
      pointBackgroundColor: C.yellow,
      borderWidth: 2,
      pointRadius: 3,
    },
  ],
};

const STAGE_DIST_DATA = {
  labels: [
    "Planning",
    "Impact Anl.",
    "MOP",
    "CCB Review",
    "Validation",
    "Implement",
    "Closure",
  ],
  datasets: [
    {
      label: "Count",
      data: [98, 145, 112, 78, 134, 189, 67],
      backgroundColor: [
        "rgba(0,191,255,0.82)",
        "rgba(0,255,136,0.78)",
        "rgba(255,215,0,0.78)",
        "rgba(191,95,255,0.78)",
        "rgba(0,229,255,0.78)",
        "rgba(255,140,0,0.82)",
        "rgba(0,255,136,0.9)",
      ],
      borderRadius: 5,
    },
  ],
};

const DOMAIN_CRQ_DATA = {
  labels: [
    "MPLS Core",
    "IP Access",
    "Optics",
    "Transport",
    "Voice/VoIP",
    "Embedded",
  ],
  datasets: [
    {
      label: "Completed",
      data: [425, 312, 218, 378, 267, 184],
      backgroundColor: "rgba(0,255,136,0.82)",
      borderRadius: 3,
    },
    {
      label: "In Progress",
      data: [145, 98, 67, 112, 78, 54],
      backgroundColor: "rgba(0,191,255,0.82)",
      borderRadius: 3,
    },
    {
      label: "At Risk",
      data: [23, 31, 18, 14, 22, 10],
      backgroundColor: "rgba(255,215,0,0.82)",
      borderRadius: 3,
    },
    {
      label: "Breached",
      data: [5, 12, 8, 3, 9, 2],
      backgroundColor: "rgba(255,51,102,0.82)",
      borderRadius: 3,
    },
  ],
};

// ─── CHART OPTION FACTORIES ───────────────────────────────────────────────────
const baseChartOpts = (extra = {}) => ({
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 800 },
  plugins: {
    legend: {
      labels: {
        color: "rgba(180,210,255,0.78)",
        font: { size: 9, family: "JetBrains Mono, monospace" },
        boxWidth: 10,
        padding: 10,
      },
      position: "top" as const,
    },
    tooltip: { mode: "index" as const, intersect: false },
  },
  ...extra,
});

const stackedYOpts = baseChartOpts({
  indexAxis: "y" as const,
  scales: {
    x: {
      stacked: true,
      ticks: { color: "rgba(180,210,255,0.6)", font: { size: 9 } },
      grid: { color: "rgba(255,255,255,0.05)" },
    },
    y: {
      stacked: true,
      ticks: { color: "rgba(180,210,255,0.72)", font: { size: 10 } },
      grid: { display: false },
    },
  },
});

const stackedXOpts = baseChartOpts({
  scales: {
    x: {
      stacked: true,
      ticks: { color: "rgba(180,210,255,0.72)", font: { size: 9 } },
      grid: { color: "rgba(255,255,255,0.04)" },
    },
    y: {
      stacked: true,
      ticks: { color: "rgba(180,210,255,0.6)", font: { size: 9 } },
      grid: { color: "rgba(255,255,255,0.05)" },
    },
  },
});

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────

interface SparklineProps {
  data: number[];
  color: string;
  idx: number;
}
const Sparkline = ({ data, color, idx }: SparklineProps) => {
  const min = Math.min(...data),
    max = Math.max(...data);
  const range = max - min || 1;
  const W = 100,
    H = 36;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - 3 - ((v - min) / range) * (H - 6);
    return [x, y] as [number, number];
  });
  const poly = pts.map((p) => p.join(",")).join(" ");
  const area = `0,${H} ${poly} ${W},${H}`;
  const gid = `sk${idx}`;
  return (
    <svg
      width={W}
      height={H}
      style={{ overflow: "visible", display: "block", flexShrink: 0 }}
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.32" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#${gid})`} />
      <polyline
        points={poly}
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ filter: `drop-shadow(0 0 3px ${color}aa)` }}
      />
    </svg>
  );
};

interface SemiGaugeProps {
  val: number;
  color: string;
  label: string;
}
const SemiGauge = ({ val, color, label }: SemiGaugeProps) => {
  const r = 36,
    cx = 52,
    cy = 50;
  const mathAngle = Math.PI - (val / 100) * Math.PI;
  const ex = cx + r * Math.cos(mathAngle);
  const ey = cy - r * Math.sin(mathAngle);
  return (
    <Box sx={{ textAlign: "center", minWidth: "90px" }}>
      <svg width={104} height={64} viewBox="0 0 104 64">
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 0 ${cx + r} ${cy}`}
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth="7"
          strokeLinecap="round"
        />
        {val > 0 && (
          <path
            d={`M ${cx - r} ${cy} A ${r} ${r} 0 ${val > 50 ? 1 : 0} 0 ${ex.toFixed(2)} ${ey.toFixed(2)}`}
            fill="none"
            stroke={color}
            strokeWidth="7"
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 5px ${color})` }}
          />
        )}
        <text
          x={cx}
          y={cy + 4}
          textAnchor="middle"
          fill="white"
          fontSize="12"
          fontWeight="700"
          style={{ fontFamily: "JetBrains Mono, monospace" }}
        >
          {val}%
        </text>
      </svg>
      <Typography
        sx={{
          fontSize: "9px",
          color: "rgba(160,200,250,0.55)",
          mt: "-4px",
          letterSpacing: "0.03em",
        }}
      >
        {label}
      </Typography>
    </Box>
  );
};

interface HeatCellProps {
  val: number;
}
const HeatCell = ({ val }: HeatCellProps) => {
  const max = 25;
  const r = Math.min(val / max, 1);
  const bg =
    r < 0.28
      ? `rgba(0,255,136,${0.18 + r * 2.2})`
      : r < 0.58
        ? `rgba(255,215,0,${0.35 + r * 0.85})`
        : `rgba(255,51,102,${0.3 + r * 0.7})`;
  return (
    <Box
      title={`${val} CRQs`}
      sx={{
        background: bg,
        borderRadius: "5px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "10px",
        fontWeight: 600,
        color: "rgba(255,255,255,0.9)",
        cursor: "default",
        padding: "5px 0",
        transition: "transform 0.15s",
        fontFamily: "JetBrains Mono, monospace",
        "&:hover": { transform: "scale(1.12)" },
      }}
    >
      {val}
    </Box>
  );
};

interface StatusBadgeProps {
  status: string;
}
const StatusBadge = ({ status }: StatusBadgeProps) => {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    safe: { bg: "rgba(0,255,136,0.12)", color: "#00ff88", label: "● Safe" },
    risk: { bg: "rgba(255,215,0,0.12)", color: "#ffd700", label: "◆ At Risk" },
    breach: {
      bg: "rgba(255,51,102,0.12)",
      color: "#ff3366",
      label: "✖ Breached",
    },
  };
  const s = map[status] ?? {
    bg: "rgba(100,100,100,0.15)",
    color: "#aaa",
    label: status,
  };
  return (
    <Chip
      label={s.label}
      size="small"
      sx={{
        background: s.bg,
        color: s.color,
        height: "18px",
        fontSize: "8px",
        fontWeight: 700,
        letterSpacing: "0.04em",
        border: `1px solid ${s.color}35`,
        boxShadow: `0 0 6px ${s.color}30`,
        fontFamily: "JetBrains Mono, monospace",
        "& .MuiChip-label": { px: "8px" },
      }}
    />
  );
};

interface SectionTitleProps {
  color: string;
  children: React.ReactNode;
}
const SectionTitle = ({ color, children }: SectionTitleProps) => (
  <Typography
    sx={{
      fontSize: "12px",
      fontWeight: 800,
      letterSpacing: "0.07em",
      mb: "12px",
      mt: 0,
      display: "flex",
      alignItems: "center",
      gap: "6px",
      ...neonStyle(color),
      fontFamily: "JetBrains Mono, monospace",
    }}
  >
    {children}
  </Typography>
);

// ─── MAIN DASHBOARD ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const [dateRange, setDateRange] = useState("Last 30 Days");
  const [domain, setDomain] = useState("All Domains");
  const [priority, setPriority] = useState("All Priorities");
  const [engineer, setEngineer] = useState("All Engineers");
  const [clockStr, setClockStr] = useState("");
  const feedRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef({ pos: 0, raf: 0 });

  useEffect(() => {
    setMounted(true);
    const updateClock = () => setClockStr(new Date().toUTCString());
    updateClock();
    const cl = setInterval(updateClock, 1000);
    const scrollFeed = () => {
      const el = feedRef.current;
      if (el) {
        scrollRef.current.pos += 0.5;
        if (scrollRef.current.pos >= el.scrollHeight - el.clientHeight)
          scrollRef.current.pos = 0;
        el.scrollTop = scrollRef.current.pos;
      }
      scrollRef.current.raf = requestAnimationFrame(scrollFeed);
    };
    scrollRef.current.raf = requestAnimationFrame(scrollFeed);
    return () => {
      clearInterval(cl);
      cancelAnimationFrame(scrollRef.current.raf);
    };
  }, []);

  return (
    <ThemeProvider theme={nocTheme}>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700;800&family=Rajdhani:wght@700;900&display=swap');
        @keyframes glow-pulse { 0%,100%{box-shadow:0 0 18px rgba(0,191,255,0.28)} 50%{box-shadow:0 0 32px rgba(0,191,255,0.55)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.6} }
        @keyframes scan-line { from{top:0} to{top:100%} }
        ::-webkit-scrollbar { width: 3px; height: 3px; }
        ::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); }
        ::-webkit-scrollbar-thumb { background: rgba(0,191,255,0.25); border-radius: 2px; }
      `}</style>

      <Box
        sx={{
          background:
            "linear-gradient(145deg,#010913 0%,#020c1c 45%,#030d20 100%)",
          minHeight: "100vh",
          color: "#cce0ff",
          overflowX: "hidden",
          position: "relative",
        }}
      >
        {/* Ambient glow */}
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            pointerEvents: "none",
            zIndex: 0,
            background:
              "radial-gradient(ellipse 90% 45% at 50% 0%,rgba(0,80,180,0.12) 0%,transparent 65%)",
          }}
        />
        {/* Scan line */}
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            height: "1px",
            background:
              "linear-gradient(90deg,transparent,rgba(0,191,255,0.3),transparent)",
            animation: "scan-line 8s linear infinite",
            pointerEvents: "none",
            zIndex: 1,
          }}
        />

        <Box
          sx={{
            maxWidth: "1900px",
            mx: "auto",
            px: "18px",
            py: "14px",
            position: "relative",
            zIndex: 2,
          }}
        >
          {/* ══ HEADER ══════════════════════════════════════════════════════ */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              mb: "14px",
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            <Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  mb: "3px",
                }}
              >
                <Box
                  sx={{
                    width: "38px",
                    height: "38px",
                    borderRadius: "10px",
                    flexShrink: 0,
                    background:
                      "linear-gradient(135deg,rgba(0,150,255,0.3),rgba(0,50,140,0.5))",
                    border: "1px solid rgba(0,191,255,0.35)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "20px",
                    boxShadow: "0 0 18px rgba(0,191,255,0.28)",
                    animation: "glow-pulse 3s ease-in-out infinite",
                  }}
                >
                  📡
                </Box>

                <Typography
                  sx={{
                    fontSize: "20px",
                    fontWeight: 900,
                    letterSpacing: "-0.025em",
                    background:
                      "linear-gradient(90deg,#00bfff,#00e5ff 40%,#00ff88)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    fontFamily: "Rajdhani, sans-serif",
                  }}
                >
                  NOC CRQ Analytics
                </Typography>

                <Chip
                  label="● LIVE"
                  size="small"
                  sx={{
                    background: "rgba(0,255,136,0.12)",
                    color: "#00ff88",
                    fontSize: "9px",
                    fontWeight: 800,
                    letterSpacing: "0.12em",
                    border: "1px solid rgba(0,255,136,0.28)",
                    animation: "pulse 2s ease-in-out infinite",
                    fontFamily: "JetBrains Mono, monospace",
                  }}
                />
                <Chip
                  label="COMMAND CENTER v4.2"
                  size="small"
                  sx={{
                    background: "rgba(0,191,255,0.08)",
                    color: "rgba(0,191,255,0.7)",
                    fontSize: "9px",
                    fontWeight: 600,
                    letterSpacing: "0.06em",
                    border: "1px solid rgba(0,191,255,0.15)",
                    fontFamily: "JetBrains Mono, monospace",
                  }}
                />
              </Box>
              <Typography
                sx={{
                  fontSize: "11px",
                  color: "rgba(120,160,210,0.5)",
                  letterSpacing: "0.04em",
                }}
              >
                Telecom Network Operations · Change Request Intelligence ·{" "}
                {clockStr}
              </Typography>
            </Box>

            {/* Filter controls */}
            <Box
              sx={{
                display: "flex",
                gap: "8px",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              {[
                {
                  val: dateRange,
                  set: setDateRange,
                  opts: [
                    "Last 7 Days",
                    "Last 30 Days",
                    "Last 90 Days",
                    "This Quarter",
                    "Custom Range",
                  ],
                },
                {
                  val: domain,
                  set: setDomain,
                  opts: [
                    "All Domains",
                    "MPLS Core",
                    "IP Access",
                    "Optics",
                    "Transport",
                    "Voice/VoIP",
                    "Embedded",
                  ],
                },
                {
                  val: priority,
                  set: setPriority,
                  opts: [
                    "All Priorities",
                    "P1 – Critical",
                    "P2 – High",
                    "P3 – Medium",
                    "P4 – Low",
                  ],
                },
                {
                  val: engineer,
                  set: setEngineer,
                  opts: [
                    "All Engineers",
                    "R. Singh",
                    "D. Chen",
                    "S. Kim",
                    "A. Al-Farsi",
                    "P. Nair",
                    "J. Wu",
                    "R. Mehta",
                  ],
                },
              ].map((f, i) => (
                <Select
                  key={i}
                  value={f.val}
                  size="small"
                  onChange={(e) => f.set(e.target.value as string)}
                  sx={{
                    minWidth: 130,
                    "& .MuiSelect-select": { py: "7px", fontSize: "11px" },
                  }}
                >
                  {f.opts.map((o) => (
                    <MenuItem key={o} value={o}>
                      {o}
                    </MenuItem>
                  ))}
                </Select>
              ))}

              <Button
                variant="outlined"
                size="small"
                sx={{
                  background:
                    "linear-gradient(135deg,rgba(0,100,200,0.55),rgba(0,191,255,0.28))",
                  color: "#00e5ff",
                  borderColor: "rgba(0,191,255,0.32)",
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  fontFamily: "JetBrains Mono, monospace",
                  px: 2,
                  boxShadow: "0 0 12px rgba(0,191,255,0.15)",
                  "&:hover": {
                    boxShadow: "0 0 20px rgba(0,191,255,0.35)",
                    borderColor: "rgba(0,191,255,0.55)",
                  },
                }}
              >
                ↻ REFRESH
              </Button>

              <Button
                variant="outlined"
                size="small"
                sx={{
                  background:
                    "linear-gradient(135deg,rgba(255,51,102,0.25),rgba(180,0,60,0.3))",
                  color: "#ff7799",
                  borderColor: "rgba(255,51,102,0.25)",
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  fontFamily: "JetBrains Mono, monospace",
                  px: 2,
                }}
              >
                ⚑ ESCALATE
              </Button>
            </Box>
          </Box>

          {/* ══ KPI CARDS ═══════════════════════════════════════════════════ */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(5,1fr)",
              gap: "10px",
              mb: "12px",
            }}
          >
            {KPI_DATA.map((k, i) => (
              <Paper
                key={i}
                sx={{
                  p: "14px 16px",
                  position: "relative",
                  overflow: "hidden",
                  cursor: "default",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    transform: "translateY(-3px)",
                    boxShadow: `0 10px 36px rgba(0,0,0,0.55), 0 0 24px ${k.color}22`,
                  },
                }}
              >
                {/* Ambient circle */}
                <Box
                  sx={{
                    position: "absolute",
                    top: "-25px",
                    right: "-18px",
                    width: "90px",
                    height: "90px",
                    borderRadius: "50%",
                    background: `radial-gradient(circle,${k.color}16 0%,transparent 70%)`,
                    pointerEvents: "none",
                  }}
                />
                {/* Top accent */}
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: "16px",
                    right: "16px",
                    height: "2px",
                    background: `linear-gradient(90deg,transparent,${k.color}80,transparent)`,
                    borderRadius: "0 0 2px 2px",
                  }}
                />

                <Typography
                  sx={{
                    fontSize: "10px",
                    color: "rgba(130,175,230,0.58)",
                    letterSpacing: "0.08em",
                    mb: "7px",
                    textTransform: "uppercase",
                    fontWeight: 600,
                  }}
                >
                  {k.title}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-end",
                    gap: "8px",
                  }}
                >
                  <Box>
                    <Typography
                      sx={{
                        fontSize: "26px",
                        fontWeight: 900,
                        lineHeight: 1,
                        fontFamily: "Rajdhani, sans-serif",
                        ...neonStyle(k.color),
                      }}
                    >
                      {k.value}
                    </Typography>
                    <Box
                      sx={{
                        mt: "5px",
                        fontSize: "11px",
                        fontWeight: 700,
                        color: k.up ? "#00ff88" : "#ff6680",
                        display: "flex",
                        alignItems: "center",
                        gap: "3px",
                      }}
                    >
                      <span>{k.up ? "▲" : "▼"}</span>
                      {k.change}
                      <Typography
                        component="span"
                        sx={{
                          fontSize: "9px",
                          fontWeight: 400,
                          color: "rgba(130,175,230,0.4)",
                          ml: "2px",
                        }}
                      >
                        vs last period
                      </Typography>
                    </Box>
                  </Box>
                  <Sparkline data={k.spark} color={k.color} idx={i} />
                </Box>
              </Paper>
            ))}
          </Box>

          {/* ══ MAIN GRID ═══════════════════════════════════════════════════ */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "27% 1fr 23%",
              gap: "10px",
              mb: "10px",
            }}
          >
            {/* ── LEFT ── */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {/* SLA Countdown Table */}
              <Paper sx={{ p: "14px" }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: "10px",
                  }}
                >
                  <SectionTitle color={C.cyan}>⏱ SLA COUNTDOWN</SectionTitle>
                  <Typography
                    sx={{
                      fontSize: "9px",
                      color: "rgba(130,175,230,0.4)",
                      fontFamily: "JetBrains Mono, monospace",
                    }}
                  >
                    {clockStr.slice(17, 25)} UTC
                  </Typography>
                </Box>
                <Box sx={{ overflowX: "auto" }}>
                  <Table size="small" sx={{ whiteSpace: "nowrap" }}>
                    <TableHead>
                      <TableRow>
                        {[
                          "CRQ ID",
                          "Domain",
                          "Engineer",
                          "Time Left",
                          "Status",
                        ].map((h) => (
                          <TableCell key={h}>{h}</TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {SLA_ROWS.map((r, i) => (
                        <TableRow key={i}>
                          <TableCell sx={{ color: "#00bfff", fontWeight: 700 }}>
                            {r.id}
                          </TableCell>
                          <TableCell sx={{ color: "rgba(200,225,255,0.82)" }}>
                            {r.domain}
                          </TableCell>
                          <TableCell sx={{ color: "rgba(170,205,250,0.7)" }}>
                            {r.eng}
                          </TableCell>
                          <TableCell
                            sx={{
                              fontWeight: 800,
                              color:
                                r.status === "breach"
                                  ? C.red
                                  : r.status === "risk"
                                    ? C.yellow
                                    : C.green,
                            }}
                          >
                            {r.time}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={r.status} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              </Paper>

              {/* SLA Breach Risk */}
              <Paper
                sx={{
                  p: "14px",
                  borderColor: "rgba(255,51,102,0.14) !important",
                }}
              >
                <SectionTitle color={C.red}>🔥 SLA BREACH RISK</SectionTitle>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      {["Domain", "Healthy", "At Risk", "Breached"].map(
                        (h, i) => (
                          <TableCell key={h} align={i === 0 ? "left" : "right"}>
                            {h}
                          </TableCell>
                        ),
                      )}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {BREACH_RISK.map((r, i) => (
                      <TableRow key={i}>
                        <TableCell sx={{ color: "rgba(200,225,255,0.82)" }}>
                          {r.domain}
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{ color: C.green, fontWeight: 700 }}
                        >
                          {r.healthy}
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{ color: C.yellow, fontWeight: 700 }}
                        >
                          {r.risk}
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{ color: C.red, fontWeight: 700 }}
                        >
                          {r.breach}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <Box
                  sx={{
                    display: "flex",
                    gap: "8px",
                    mt: "10px",
                    p: "8px 10px",
                    background: "rgba(255,255,255,0.03)",
                    borderRadius: "8px",
                  }}
                >
                  {[
                    {
                      label: "Total Healthy",
                      val: BREACH_RISK.reduce((a, r) => a + r.healthy, 0),
                      color: C.green,
                    },
                    {
                      label: "At Risk",
                      val: BREACH_RISK.reduce((a, r) => a + r.risk, 0),
                      color: C.yellow,
                    },
                    {
                      label: "Breached",
                      val: BREACH_RISK.reduce((a, r) => a + r.breach, 0),
                      color: C.red,
                    },
                  ].map((s, i) => (
                    <Box key={i} sx={{ flex: 1, textAlign: "center" }}>
                      <Typography
                        sx={{
                          fontSize: "16px",
                          fontWeight: 800,
                          fontFamily: "Rajdhani, sans-serif",
                          ...neonStyle(s.color),
                        }}
                      >
                        {s.val}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "8px",
                          color: "rgba(130,175,230,0.45)",
                          letterSpacing: "0.05em",
                        }}
                      >
                        {s.label}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Paper>

              {/* Domain SLA Performance */}
              <Paper sx={{ p: "14px" }}>
                <SectionTitle color={C.green}>
                  📊 DOMAIN SLA PERFORMANCE
                </SectionTitle>
                {DOMAIN_SLA.map((d, i) => (
                  <Box key={i} sx={{ mb: "9px" }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: "4px",
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: "10px",
                          color: "rgba(200,225,255,0.8)",
                        }}
                      >
                        {d.domain}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "10px",
                          fontWeight: 800,
                          color: d.color,
                        }}
                      >
                        {d.pct}%
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        height: "5px",
                        background: "rgba(255,255,255,0.06)",
                        borderRadius: "3px",
                        overflow: "hidden",
                      }}
                    >
                      <Box
                        sx={{
                          height: "100%",
                          width: `${d.pct}%`,
                          background: `linear-gradient(90deg,${d.color}66,${d.color})`,
                          borderRadius: "3px",
                          boxShadow: `0 0 8px ${d.color}55`,
                          transition: "width 1.2s cubic-bezier(0.4,0,0.2,1)",
                        }}
                      />
                    </Box>
                  </Box>
                ))}
              </Paper>
            </Box>

            {/* ── CENTER ── */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {mounted && (
                <Paper sx={{ p: "14px" }}>
                  <SectionTitle color={C.blue}>
                    📈 TICKET AGING DISTRIBUTION
                  </SectionTitle>
                  <Box sx={{ height: "148px" }}>
                    <Bar data={TICKET_AGING_DATA} options={stackedYOpts} />
                  </Box>
                </Paper>
              )}
              {mounted && (
                <Paper sx={{ p: "14px" }}>
                  <SectionTitle color={C.yellow}>
                    ⚗ CRQ AGING FLOW — STAGE DISTRIBUTION
                  </SectionTitle>
                  <Box sx={{ height: "148px" }}>
                    <Bar data={AGING_FUNNEL_DATA} options={stackedXOpts} />
                  </Box>
                </Paper>
              )}

              {/* Bottleneck Detection */}
              <Paper sx={{ p: "14px" }}>
                <SectionTitle color={C.orange}>
                  🔍 BOTTLENECK DETECTION
                </SectionTitle>
                {BOTTLENECKS.map((b, i) => (
                  <Box key={i} sx={{ mb: "10px" }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: "4px",
                        alignItems: "center",
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: "10px",
                          color: "rgba(200,225,255,0.8)",
                        }}
                      >
                        {b.name}
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        {b.val > 70 && (
                          <Typography
                            component="span"
                            sx={{
                              fontSize: "8px",
                              color: C.red,
                              fontWeight: 700,
                              letterSpacing: "0.06em",
                            }}
                          >
                            HIGH
                          </Typography>
                        )}
                        {b.val > 50 && b.val <= 70 && (
                          <Typography
                            component="span"
                            sx={{
                              fontSize: "8px",
                              color: C.yellow,
                              fontWeight: 700,
                              letterSpacing: "0.06em",
                            }}
                          >
                            MED
                          </Typography>
                        )}
                        <Typography
                          sx={{
                            fontSize: "10px",
                            fontWeight: 800,
                            color:
                              b.val > 70
                                ? C.red
                                : b.val > 50
                                  ? C.yellow
                                  : C.green,
                          }}
                        >
                          {b.val}%
                        </Typography>
                      </Box>
                    </Box>
                    <Box
                      sx={{
                        height: "6px",
                        background: "rgba(255,255,255,0.06)",
                        borderRadius: "4px",
                        overflow: "hidden",
                      }}
                    >
                      <Box
                        sx={{
                          height: "100%",
                          width: `${b.val}%`,
                          background: `linear-gradient(90deg,${b.color}66,${b.color})`,
                          borderRadius: "4px",
                          boxShadow: `0 0 10px ${b.color}45`,
                          transition: "width 1.2s cubic-bezier(0.4,0,0.2,1)",
                        }}
                      />
                    </Box>
                  </Box>
                ))}
              </Paper>

              {/* SE Workload Radar */}
              {mounted && (
                <Paper sx={{ p: "14px" }}>
                  <SectionTitle color={C.purple}>
                    🎯 SE WORKLOAD — DOMAIN COVERAGE RADAR
                  </SectionTitle>
                  <Box sx={{ height: "210px" }}>
                    <Radar
                      data={RADAR_DATA}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        animation: { duration: 800 },
                        plugins: {
                          legend: {
                            labels: {
                              color: "rgba(180,210,255,0.78)",
                              font: { size: 9, family: "JetBrains Mono" },
                              boxWidth: 10,
                              padding: 10,
                            },
                            position: "top" as const,
                          },
                        },
                        scales: {
                          r: {
                            min: 0,
                            max: 100,
                            ticks: {
                              color: "rgba(120,160,210,0.45)",
                              font: { size: 8 },
                              backdropColor: "transparent",
                              stepSize: 25,
                            },
                            grid: { color: "rgba(255,255,255,0.07)" },
                            angleLines: { color: "rgba(255,255,255,0.09)" },
                            pointLabels: {
                              color: "rgba(180,210,255,0.72)",
                              font: { size: 9 },
                            },
                          },
                        },
                      }}
                    />
                  </Box>
                </Paper>
              )}
            </Box>

            {/* ── RIGHT ── */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {/* Critical Alerts */}
              <Paper
                sx={{
                  p: "14px",
                  borderColor: "rgba(255,51,102,0.14) !important",
                }}
              >
                <SectionTitle color={C.red}>⚠ CRITICAL ALERTS</SectionTitle>
                {ALERTS.map((a, i) => (
                  <Box
                    key={i}
                    sx={{
                      mb: "6px",
                      p: "7px 9px",
                      borderRadius: "8px",
                      background:
                        a.level === "critical"
                          ? "rgba(255,51,102,0.07)"
                          : a.level === "warning"
                            ? "rgba(255,215,0,0.055)"
                            : "rgba(0,191,255,0.045)",
                      border: `1px solid ${a.level === "critical" ? "rgba(255,51,102,0.18)" : a.level === "warning" ? "rgba(255,215,0,0.13)" : "rgba(0,191,255,0.1)"}`,
                      transition: "transform 0.15s",
                      cursor: "default",
                      "&:hover": { transform: "translateX(3px)" },
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        gap: "6px",
                        alignItems: "flex-start",
                      }}
                    >
                      <Typography
                        component="span"
                        sx={{
                          fontSize: "11px",
                          flexShrink: 0,
                          lineHeight: "14px",
                        }}
                      >
                        {a.level === "critical"
                          ? "🔴"
                          : a.level === "warning"
                            ? "🟡"
                            : "🔵"}
                      </Typography>
                      <Box>
                        <Typography
                          sx={{
                            fontSize: "9.5px",
                            color: "rgba(200,225,255,0.85)",
                            lineHeight: 1.45,
                            mb: "2px",
                          }}
                        >
                          {a.msg}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: "8px",
                            color: "rgba(100,145,205,0.45)",
                            fontFamily: "JetBrains Mono, monospace",
                          }}
                        >
                          {a.t} UTC
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Paper>

              {/* Live Incident Feed */}
              <Paper sx={{ p: "14px", flex: 1 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: "10px",
                  }}
                >
                  <SectionTitle color={C.cyan}>
                    📡 LIVE INCIDENT FEED
                  </SectionTitle>
                  <Chip
                    label="● LIVE"
                    size="small"
                    sx={{
                      background: "rgba(0,255,136,0.12)",
                      color: "#00ff88",
                      fontSize: "8px",
                      fontWeight: 800,
                      letterSpacing: "0.1em",
                      border: "1px solid rgba(0,255,136,0.22)",
                      animation: "pulse 1.8s ease-in-out infinite",
                    }}
                  />
                </Box>
                <Box
                  ref={feedRef}
                  sx={{
                    height: "400px",
                    overflowY: "scroll",
                    scrollbarWidth: "none",
                    "&::-webkit-scrollbar": { display: "none" },
                  }}
                >
                  {[...FEED, ...FEED].map((f, i) => (
                    <Box
                      key={i}
                      sx={{
                        p: "5px 7px",
                        mb: "3px",
                        borderRadius: "5px",
                        fontSize: "9.5px",
                        background:
                          f.type === "error"
                            ? "rgba(255,51,102,0.07)"
                            : f.type === "success"
                              ? "rgba(0,255,136,0.055)"
                              : f.type === "warning"
                                ? "rgba(255,215,0,0.055)"
                                : "rgba(0,191,255,0.04)",
                        borderLeft: `2px solid ${f.type === "error" ? C.red : f.type === "success" ? C.green : f.type === "warning" ? C.yellow : C.blue}`,
                        lineHeight: 1.35,
                      }}
                    >
                      <Typography
                        component="span"
                        sx={{
                          color: "rgba(90,135,200,0.55)",
                          fontFamily: "JetBrains Mono, monospace",
                          mr: "5px",
                          fontSize: "8.5px",
                        }}
                      >
                        {f.t}
                      </Typography>
                      <Typography
                        component="span"
                        sx={{
                          fontSize: "9.5px",
                          color:
                            f.type === "error"
                              ? "#ff9999"
                              : f.type === "success"
                                ? "#88ffcc"
                                : f.type === "warning"
                                  ? "#ffdd88"
                                  : "rgba(190,220,255,0.82)",
                        }}
                      >
                        {f.msg}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Paper>
            </Box>
          </Box>

          {/* ══ BOTTOM SECTION ══════════════════════════════════════════════ */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(4,1fr)",
              gap: "10px",
            }}
          >
            {/* Stage Distribution */}
            {mounted && (
              <Paper sx={{ p: "14px" }}>
                <SectionTitle color={C.blue}>
                  📋 STAGE DISTRIBUTION
                </SectionTitle>
                <Box sx={{ height: "205px" }}>
                  <Bar
                    data={STAGE_DIST_DATA}
                    options={{
                      ...baseChartOpts(),
                      indexAxis: "y" as const,
                      plugins: { legend: { display: false }, tooltip: {} },
                      scales: {
                        x: {
                          ticks: {
                            color: "rgba(180,210,255,0.6)",
                            font: { size: 9 },
                          },
                          grid: { color: "rgba(255,255,255,0.05)" },
                        },
                        y: {
                          ticks: {
                            color: "rgba(180,210,255,0.75)",
                            font: { size: 9 },
                          },
                          grid: { display: false },
                        },
                      },
                    }}
                  />
                </Box>
              </Paper>
            )}

            {/* Lifecycle Time Analysis */}
            <Paper sx={{ p: "14px" }}>
              <SectionTitle color={C.yellow}>
                ⏳ LIFECYCLE TIME ANALYSIS
              </SectionTitle>
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "space-around",
                  gap: "6px",
                  pt: "4px",
                }}
              >
                {LIFECYCLE.map((l, i) => (
                  <SemiGauge
                    key={i}
                    val={l.val}
                    color={l.color}
                    label={l.label}
                  />
                ))}
              </Box>
              <Box
                sx={{
                  mt: "8px",
                  p: "7px 10px",
                  background: "rgba(255,255,255,0.03)",
                  borderRadius: "8px",
                  textAlign: "center",
                }}
              >
                <Typography
                  component="span"
                  sx={{ fontSize: "9px", color: "rgba(130,175,230,0.5)" }}
                >
                  Avg SLA Achievement:{" "}
                </Typography>
                <Typography
                  component="span"
                  sx={{
                    fontSize: "12px",
                    fontWeight: 800,
                    fontFamily: "Rajdhani, sans-serif",
                    ...neonStyle(C.cyan),
                  }}
                >
                  77.6%
                </Typography>
              </Box>
            </Paper>

            {/* CRQ Aging Heatmap */}
            <Paper sx={{ p: "14px" }}>
              <SectionTitle color={C.green}>🗓 CRQ AGING HEATMAP</SectionTitle>
              <Typography
                sx={{
                  fontSize: "8.5px",
                  color: "rgba(110,155,210,0.45)",
                  mb: "7px",
                  mt: "-6px",
                }}
              >
                Aging count by domain × weekday
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "58px repeat(7,1fr)",
                  gap: "2px",
                  mb: "2px",
                }}
              >
                <Box />
                {HM_DAYS.map((d) => (
                  <Typography
                    key={d}
                    sx={{
                      fontSize: "8px",
                      textAlign: "center",
                      color: "rgba(140,185,240,0.48)",
                      fontWeight: 700,
                      letterSpacing: "0.04em",
                    }}
                  >
                    {d}
                  </Typography>
                ))}
              </Box>
              {HM_VALUES.map((row, ri) => (
                <Box
                  key={ri}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "58px repeat(7,1fr)",
                    gap: "2px",
                    mb: "2px",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "8.5px",
                      color: "rgba(175,210,255,0.6)",
                      display: "flex",
                      alignItems: "center",
                      pr: "3px",
                      fontWeight: 500,
                    }}
                  >
                    {HM_DOMAINS[ri]}
                  </Typography>
                  {row.map((val, ci) => (
                    <HeatCell key={ci} val={val} />
                  ))}
                </Box>
              ))}
              <Box
                sx={{
                  display: "flex",
                  gap: "5px",
                  mt: "9px",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography
                  sx={{ fontSize: "8px", color: "rgba(130,175,230,0.4)" }}
                >
                  Low
                </Typography>
                {[
                  "rgba(0,255,136,0.45)",
                  "rgba(100,220,150,0.5)",
                  "rgba(255,215,0,0.55)",
                  "rgba(255,140,50,0.6)",
                  "rgba(255,51,102,0.65)",
                ].map((bg, i) => (
                  <Box
                    key={i}
                    sx={{
                      width: "20px",
                      height: "9px",
                      background: bg,
                      borderRadius: "2px",
                    }}
                  />
                ))}
                <Typography
                  sx={{ fontSize: "8px", color: "rgba(130,175,230,0.4)" }}
                >
                  High
                </Typography>
              </Box>
            </Paper>

            {/* Domain-wise CRQ Analytics */}
            {mounted && (
              <Paper sx={{ p: "14px" }}>
                <SectionTitle color={C.purple}>
                  🏢 DOMAIN-WISE CRQ ANALYTICS
                </SectionTitle>
                <Box sx={{ height: "205px" }}>
                  <Bar data={DOMAIN_CRQ_DATA} options={stackedXOpts} />
                </Box>
              </Paper>
            )}
          </Box>

          {/* Footer */}
          <Box
            sx={{
              mt: "14px",
              py: "10px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderTop: "1px solid rgba(0,191,255,0.07)",
            }}
          >
            <Typography
              sx={{
                fontSize: "9px",
                color: "rgba(90,130,185,0.38)",
                letterSpacing: "0.06em",
              }}
            >
              NOC CRQ Analytics Platform v4.2.1 · Telecom Network Operations
              Center · All times UTC
            </Typography>
            <Box sx={{ display: "flex", gap: "14px" }}>
              {[
                { label: "System Status", val: "OPERATIONAL", color: C.green },
                { label: "Data Latency", val: "< 2s", color: C.cyan },
                { label: "Active Users", val: "47", color: C.blue },
              ].map((s, i) => (
                <Typography
                  key={i}
                  sx={{
                    fontSize: "9px",
                    color: "rgba(130,175,230,0.45)",
                    display: "flex",
                    gap: "4px",
                    alignItems: "center",
                  }}
                >
                  {s.label}:{" "}
                  <Typography
                    component="span"
                    sx={{ fontWeight: 700, color: s.color, fontSize: "9px" }}
                  >
                    {s.val}
                  </Typography>
                </Typography>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
