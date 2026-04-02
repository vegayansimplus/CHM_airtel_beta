You are a senior frontend engineer specializing in React, TypeScript, and Material UI (MUI v5+).

I have an existing UI and codebase, but the design and structure are poor. I want you to completely refactor and redesign it using best practices.

### Requirements:

* Use **React with TypeScript (TSX)**
* Use **Material UI (MUI v5 or latest)**
* Follow **modern UI/UX principles** (clean, minimal, responsive)
* Ensure **component reusability and modular structure**
* Use **functional components with hooks**
* Apply **proper spacing, typography, and layout using MUI system**
* Use **Theme customization (createTheme)** for consistent styling
* Ensure **responsive design (mobile + desktop)**
* Use **Grid / Stack / Box effectively**
* Add **basic hover states and interactions**
* Keep code clean, readable, and well-typed

### What I will provide:

1. My existing React/HTML code
2. Screenshot/image of current UI

### What you should do:

1. Analyze the current UI and identify design issues
2. Redesign the UI with a modern Material UI layout
3. Rewrite the code completely in **TSX**
4. Break UI into reusable components (e.g., Header, Card, Form, Table, etc.)
5. Use MUI components (Button, TextField, Card, AppBar, etc.)
6. Improve alignment, spacing, and visual hierarchy
7. Suggest optional improvements if needed

### Output format:

* Provide full working TSX code
* Include component structure (folders/files)
* Include theme setup if used
* Add brief comments explaining key improvements

### Design style:

* Clean and minimal
* Professional dashboard-like UI
* Proper use of whitespace
* Consistent color palette

Here is my current code and UI:

import React, { useState } from "react";
import {
  Table, TableBody, TableContainer, TableHead, TableRow, TableCell,
  Paper, TextField, Autocomplete, Chip, Switch, Tooltip, Button,
  Box, Typography, LinearProgress, useTheme, alpha, Collapse, Fade,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import SaveIcon from "@mui/icons-material/Save";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import HourglassTopOutlinedIcon from "@mui/icons-material/HourglassTopOutlined";

// ─── Types ────────────────────────────────────────────────────────────────────
interface ShiftInfo {
  shiftId: string;
  subFunction: string;
  shiftName: string;
  shiftHours: string;
  shiftEnd: string;
  shiftStart: string;
  shiftRange: string;
  teamFunction: string;
}

interface ShiftRow {
  shiftId: string;
  shiftName: string;
  status: "Enabled" | "Disabled";
  teamAllocation: string;
  minLOneReq: number;
  minLTwoReq: number;
  minLThreeReq: number;
  minLFourReq: number;
  empCat: string[];
}

// ─── Constants ────────────────────────────────────────────────────────────────
const TOTAL_EMPLOYEES = 46;
const EMP_CAT_OPTIONS = ["All", "Onroll", "Offroll", "Project"];

const SHIFT_INFO: ShiftInfo[] = [
  { shiftId: "1", subFunction: "All", shiftName: "A",  shiftHours: "08:00:00", shiftEnd: "15:30:00", shiftStart: "07:30:00", shiftRange: "7:30 am – 3:30 pm",   teamFunction: "IP Core" },
  { shiftId: "2", subFunction: "All", shiftName: "B",  shiftHours: "08:00:00", shiftEnd: "22:00:00", shiftStart: "14:00:00", shiftRange: "2:00 pm – 10:00 pm",  teamFunction: "IP Core" },
  { shiftId: "3", subFunction: "All", shiftName: "N",  shiftHours: "09:30:00", shiftEnd: "07:30:00", shiftStart: "22:00:00", shiftRange: "10:00 pm – 7:30 am", teamFunction: "IP Core" },
  { shiftId: "4", subFunction: "All", shiftName: "G",  shiftHours: "09:00:00", shiftEnd: "18:30:00", shiftStart: "09:30:00", shiftRange: "9:30 am – 6:30 pm",  teamFunction: "IP Core" },
  { shiftId: "5", subFunction: "All", shiftName: "LG", shiftHours: "09:00:00", shiftEnd: "20:00:00", shiftStart: "11:00:00", shiftRange: "11:00 am – 8:00 pm", teamFunction: "IP Core" },
];

// Matches screenshot: 5 + 10 + 11 + 10 + 10 = 46 → 100%
const INITIAL_DATA: ShiftRow[] = [
  { shiftId: "1", shiftName: "A",  status: "Enabled", teamAllocation: "5",  minLOneReq: 1, minLTwoReq: 0, minLThreeReq: 0, minLFourReq: 0, empCat: ["All"] },
  { shiftId: "2", shiftName: "B",  status: "Enabled", teamAllocation: "10", minLOneReq: 1, minLTwoReq: 0, minLThreeReq: 0, minLFourReq: 0, empCat: ["All"] },
  { shiftId: "3", shiftName: "N",  status: "Enabled", teamAllocation: "11", minLOneReq: 7, minLTwoReq: 2, minLThreeReq: 2, minLFourReq: 0, empCat: ["All"] },
  { shiftId: "4", shiftName: "G",  status: "Enabled", teamAllocation: "10", minLOneReq: 6, minLTwoReq: 0, minLThreeReq: 2, minLFourReq: 0, empCat: ["All"] },
  { shiftId: "5", shiftName: "LG", status: "Enabled", teamAllocation: "10", minLOneReq: 1, minLTwoReq: 0, minLThreeReq: 0, minLFourReq: 0, empCat: ["All"] },
];

// ─── Shift visual metadata ────────────────────────────────────────────────────
const getShiftMeta = (name: string) => {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    A:  { bg: "#FFF9C4", color: "#795548",  label: "Morning"   },
    B:  { bg: "#FFE0B2", color: "#E65100", label: "Evening"   },
    N:  { bg: "#1A237E", color: "#E8EAF6",  label: "Night"     },
    G:  { bg: "#B3E5FC", color: "#01579B",label: "General"   },
    LG: { bg: "#C8E6C9", color: "#1B5E20",label: "Late Gen." },
  };
  return map[name] ?? { bg: "#F3E5F5", color: "#4A148C", emoji: "🕐", label: "Custom" };
};

// ─── Circular progress badge ──────────────────────────────────────────────────
const AllocationBadge: React.FC<{ allocation: string; total: number }> = ({ allocation, total }) => {
  const val = parseFloat(allocation) || 0;
  const pct = total > 0 ? Math.min((val / total) * 100, 100) : 0;
  const color = pct >= 100 ? "#f44336" : pct > 60 ? "#ff9800" : "#4caf50";
  const C = 2 * Math.PI * 14;

  return (
    <Box sx={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center", width: 44, height: 44, ml: 1, flexShrink: 0 }}>
      <svg width="44" height="44" style={{ position: "absolute", transform: "rotate(-90deg)" }}>
        <circle cx="22" cy="22" r="14" fill="none" stroke="#e0e0e0" strokeWidth="3" />
        <circle cx="22" cy="22" r="14" fill="none" stroke={color} strokeWidth="3"
          strokeDasharray={`${(pct / 100) * C} ${C}`} strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.45s ease" }} />
      </svg>
      <Typography sx={{ fontSize: "9px", fontWeight: 800, color, zIndex: 1, lineHeight: 1 }}>
        {Math.round(pct)}%
      </Typography>
    </Box>
  );
};

// ─── Reusable number field ────────────────────────────────────────────────────
const NumberCell: React.FC<{ value: number; disabled: boolean; onChange: (v: string) => void; isDark: boolean }> = ({ value, disabled, onChange, isDark }) => (
  <TextField type="number" size="small" value={value} disabled={disabled}
    onChange={(e) => onChange(e.target.value)}
    inputProps={{ min: 0, style: { textAlign: "center", fontSize: "0.82rem", padding: "5px 4px", fontWeight: 600 } }}
    sx={{
      width: 66,
      "& .MuiOutlinedInput-root": {
        borderRadius: 6, fontSize: "0.82rem",
        backgroundColor: disabled ? "transparent" : (isDark ? "#1e2a3a" : "#fafafa"),
        "& fieldset": { borderColor: isDark ? "#334155" : "#e0e7ef" },
        "&:hover fieldset": { borderColor: "#90caf9" },
        "&.Mui-focused fieldset": { borderColor: "#1976d2" },
      },
      "& input[type=number]::-webkit-inner-spin-button": { WebkitAppearance: "none" },
      "& input[type=number]::-webkit-outer-spin-button": { WebkitAppearance: "none" },
    }}
  />
);

// ─── Main ─────────────────────────────────────────────────────────────────────
export const WeekDaySchedule: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [shiftData, setShiftData] = useState<ShiftRow[]>(INITIAL_DATA);
  const [showInfo, setShowInfo] = useState(false);
  const [saved, setSaved] = useState(false);

  const totalAllocated = shiftData.reduce((s, r) => s + (parseFloat(r.teamAllocation) || 0), 0);
  const overallPct = TOTAL_EMPLOYEES > 0 ? Math.min((totalAllocated / TOTAL_EMPLOYEES) * 100, 100) : 0;
  const isFull = overallPct >= 100;

  const handleToggle = (i: number) =>
    setShiftData((prev) => prev.map((r, idx) => idx === i ? { ...r, status: r.status === "Enabled" ? "Disabled" : "Enabled" } : r));

  const handleAlloc = (i: number, value: string) => {
    if (value.length > 3) return;
    const newVal = parseFloat(value) || 0;
    const currentVal = parseFloat(shiftData[i].teamAllocation) || 0;
    if (totalAllocated - currentVal + newVal > TOTAL_EMPLOYEES) return;
    setShiftData((prev) => prev.map((r, idx) => idx === i ? { ...r, teamAllocation: value } : r));
  };

  const handleNumber = (i: number, key: keyof ShiftRow, value: string) => {
    const num = parseInt(value, 10);
    if (!isNaN(num) && num >= 0)
      setShiftData((prev) => prev.map((r, idx) => idx === i ? { ...r, [key]: num } : r));
  };

  const handleEmpCat = (i: number, value: string[]) =>
    setShiftData((prev) => prev.map((r, idx) => idx === i ? { ...r, empCat: value } : r));

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 3000); };

  // ── style tokens ──
  const surface     = isDark ? "#0f172a"  : "#ffffff";
  const headerBg    = isDark ? "#1a2744"  : "#f0f4f9";
  const borderColor = isDark ? "#1e2a3a"  : "#e4eaf2";
  const headerText  = isDark ? "#93c5fd"  : "#455a64";

  const headerCellSx = {
    fontWeight: 700, fontSize: "0.67rem", letterSpacing: "0.06em",
    textTransform: "uppercase" as const, whiteSpace: "nowrap" as const,
    backgroundColor: headerBg, color: headerText,
    borderBottom: `2px solid ${borderColor}`,
    py: 1.5, px: 1.5, textAlign: "center" as const,
  };

  const bodyCellSx = {
    py: 0.75, px: 1.5,
    borderBottom: `1px solid ${borderColor}`,
    backgroundColor: surface,
    verticalAlign: "middle" as const,
  };

  return (
    <Box sx={{ p: { xs: 1, md: 1.5 } }}>

      {/* ── Header ── */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1.5, mb: 1.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={{ width: 4, height: 26, borderRadius: 4, background: "linear-gradient(180deg,#1976d2,#42a5f5)" }} />
          <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: isDark ? "#e2e8f0" : "#1e293b", letterSpacing: "-0.015em" }}>
            Week Day Schedule
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
          <Chip
            icon={<PeopleAltOutlinedIcon sx={{ fontSize: "0.9rem !important" }} />}
            label={`Total Employees: ${TOTAL_EMPLOYEES}`} size="small"
            sx={{
              fontWeight: 600, fontSize: "0.73rem", height: 26,
              backgroundColor: isDark ? "#1e3a5f" : "#e3f2fd",
              color: isDark ? "#90caf9" : "#1565c0",
              border: `1px solid ${isDark ? "#1976d2" : "#90caf9"}`,
              "& .MuiChip-icon": { color: "inherit" },
            }}
          />
          <Chip
            label={`Allocated: ${totalAllocated} / ${TOTAL_EMPLOYEES}`} size="small"
            sx={{
              fontWeight: 700, fontSize: "0.73rem", height: 26,
              backgroundColor: isFull ? (isDark ? "#3e1a1a" : "#ffebee") : (isDark ? "#1b3a2a" : "#e8f5e9"),
              color: isFull ? "#e53935" : "#2e7d32",
              border: `1px solid ${isFull ? "#e53935" : "#43a047"}`,
            }}
          />
          <Tooltip title={showInfo ? "Hide shift times" : "View shift time ranges"} arrow>
            <Box onClick={() => setShowInfo((v) => !v)}
              sx={{
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                width: 28, height: 28, borderRadius: "50%",
                backgroundColor: showInfo ? (isDark ? "#1976d2" : "#e3f2fd") : (isDark ? "#1e293b" : "#f1f5f9"),
                border: `1.5px solid ${showInfo ? "#1976d2" : (isDark ? "#334155" : "#cbd5e1")}`,
                color: showInfo ? "#1976d2" : (isDark ? "#90caf9" : "#546e7a"),
                transition: "all 0.2s",
                "&:hover": { backgroundColor: isDark ? "#1976d2" : "#e3f2fd", color: isDark ? "#fff" : "#1565c0" },
              }}
            >
              <InfoOutlinedIcon sx={{ fontSize: "0.95rem" }} />
            </Box>
          </Tooltip>
        </Box>
      </Box>

      {/* ── Progress bar ── */}
      <Box sx={{ mb: 1.5 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
          <Typography sx={{ fontSize: "0.68rem", color: "text.secondary", letterSpacing: "0.02em" }}>
            Overall Team Allocation
          </Typography>
          <Typography sx={{ fontSize: "0.68rem", fontWeight: 700, color: isFull ? "error.main" : "success.main" }}>
            {Math.round(overallPct)}%
          </Typography>
        </Box>
        <LinearProgress variant="determinate" value={overallPct}
          sx={{
            height: 7, borderRadius: 4,
            backgroundColor: isDark ? "#1e293b" : "#e2e8f0",
            "& .MuiLinearProgress-bar": {
              borderRadius: 4,
              background: isFull ? "linear-gradient(90deg,#ef5350,#f44336)" : "linear-gradient(90deg,#42a5f5,#1976d2)",
              transition: "width 0.5s ease",
            },
          }}
        />
      </Box>

      {/* ── Collapsible shift info ── */}
      <Collapse in={showInfo} timeout={250}>
        <Box sx={{ mb: 1.5, p: 1.5, borderRadius: 2, backgroundColor: isDark ? "#0f1e33" : "#f0f7ff", border: `1px solid ${isDark ? "#1e3a5f" : "#b3d9ff"}`, display: "flex", flexWrap: "wrap", gap: 1 }}>
          {SHIFT_INFO.map((s) => {
            const m = getShiftMeta(s.shiftName);
            return (
              <Box key={s.shiftId} sx={{ display: "flex", alignItems: "center", gap: 1, px: 1.5, py: 0.75, borderRadius: 2, backgroundColor: m.bg, border: `1px solid ${alpha(m.color, 0.25)}`, minWidth: 172 }}>
                <Box>
                  <Typography sx={{ fontSize: "0.73rem", fontWeight: 700, color: m.color, lineHeight: 1.2 }}>
                    Shift {s.shiftName} — {m.label}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.4, mt: 0.2 }}>
                    <AccessTimeIcon sx={{ fontSize: "0.63rem", color: m.color, opacity: 0.75 }} />
                    <Typography sx={{ fontSize: "0.65rem", color: m.color, opacity: 0.85 }}>{s.shiftRange}</Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
                    <HourglassTopOutlinedIcon sx={{ fontSize: "0.58rem", color: m.color, opacity: 0.6 }} />
                    <Typography sx={{ fontSize: "0.61rem", color: m.color, opacity: 0.7 }}>{s.shiftHours.slice(0, 5)} hrs</Typography>
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Collapse>

      {/* ── Table ── */}
      <TableContainer component={Paper} elevation={0}
        sx={{ borderRadius: 2, border: `1px solid ${borderColor}`, overflow: "hidden", backgroundColor: surface }}>
        <Table sx={{ minWidth: 860 }} size="small">
          <TableHead>
            <TableRow>
              {["Shift", "Status", "Team Allocation", "Min L1 Eng.", "Min L2 Eng.", "Min L3 Eng.", "Min L4 Eng.", "Employee Category"].map((h) => (
                <TableCell key={h} sx={headerCellSx}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {shiftData.map((row, i) => {
              const meta = getShiftMeta(row.shiftName);
              const isDisabled = row.status === "Disabled";
              const info = SHIFT_INFO.find((s) => s.shiftId === row.shiftId);

              return (
                <TableRow key={row.shiftId}
                  sx={{
                    opacity: isDisabled ? 0.5 : 1, transition: "opacity 0.2s",
                    "&:hover td": { backgroundColor: isDark ? "#151f2e" : "#f5f9ff" },
                    "&:last-child td": { borderBottom: 0 },
                  }}
                >
                  {/* Shift badge */}
                  <TableCell sx={{ ...bodyCellSx, p: 0, width: 76 }}>
                    <Tooltip title={info ? `${info.shiftRange}  ·  ${info.shiftHours.slice(0, 5)} hrs` : ""} arrow placement="right">
                      <Box sx={{
                        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                        width: "100%", height: 56, backgroundColor: meta.bg, cursor: "default",
                        borderRight: `3px solid ${alpha(meta.color, 0.22)}`,
                        "&:hover": { filter: "brightness(0.96)" }, transition: "filter 0.15s",
                      }}>
                        <Typography sx={{ fontWeight: 800, fontSize: "0.87rem", color: meta.color, letterSpacing: "0.04em", mt: 0.2 }}>
                          {row.shiftName}
                        </Typography>
                      </Box>
                    </Tooltip>
                  </TableCell>

                  {/* Status */}
                  <TableCell sx={{ ...bodyCellSx, textAlign: "center" }}>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.75 }}>
                      <Switch size="small" checked={row.status === "Enabled"} onChange={() => handleToggle(i)}
                        sx={{
                          "& .MuiSwitch-switchBase.Mui-checked": { color: "#43a047" },
                          "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: "#66bb6a" },
                        }}
                      />
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
                        {row.status === "Enabled"
                          ? <CheckCircleOutlineIcon sx={{ fontSize: "0.82rem", color: "#43a047" }} />
                          : <CancelOutlinedIcon sx={{ fontSize: "0.82rem", color: "#bdbdbd" }} />}
                        <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: row.status === "Enabled" ? "#43a047" : "#9e9e9e" }}>
                          {row.status}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>

                  {/* Team Allocation */}
                  <TableCell sx={{ ...bodyCellSx, textAlign: "center" }}>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <TextField size="small" value={row.teamAllocation} disabled={isDisabled}
                        onChange={(e) => { const v = e.target.value; if (v === "" || (/^\d*$/.test(v) && parseFloat(v) <= 100)) handleAlloc(i, v); }}
                        inputProps={{ style: { textAlign: "center", fontSize: "0.82rem", padding: "5px 4px", fontWeight: 600 } }}
                        sx={{
                          width: 58,
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 6, fontSize: "0.82rem",
                            backgroundColor: isDark ? "#1e2a3a" : "#fafafa",
                            "& fieldset": { borderColor: isDark ? "#334155" : "#e0e7ef" },
                            "&:hover fieldset": { borderColor: "#90caf9" },
                            "&.Mui-focused fieldset": { borderColor: "#1976d2" },
                          },
                        }}
                      />
                      <AllocationBadge allocation={row.teamAllocation} total={TOTAL_EMPLOYEES} />
                    </Box>
                  </TableCell>

                  {/* L1–L4 */}
                  {(["minLOneReq", "minLTwoReq", "minLThreeReq", "minLFourReq"] as Array<keyof ShiftRow>).map((key) => (
                    <TableCell key={key} sx={{ ...bodyCellSx, textAlign: "center" }}>
                      <NumberCell value={row[key] as number} disabled={isDisabled} onChange={(v) => handleNumber(i, key, v)} isDark={isDark} />
                    </TableCell>
                  ))}

                  {/* Employee Category */}
                  <TableCell sx={{ ...bodyCellSx, minWidth: 185, textAlign: "center" }}>
                    <Autocomplete multiple disableCloseOnSelect size="small"
                      options={EMP_CAT_OPTIONS}
                      value={Array.isArray(row.empCat) ? row.empCat : [row.empCat]}
                      onChange={(_, v) => handleEmpCat(i, v)}
                      disabled={isDisabled}
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                          <Chip label={option} size="small" {...getTagProps({ index })}
                            sx={{
                              height: 18, fontSize: "0.64rem", fontWeight: 600,
                              backgroundColor: isDark ? "#1e3a5f" : "#e3f2fd",
                              color: isDark ? "#90caf9" : "#1565c0",
                              "& .MuiChip-deleteIcon": { fontSize: "0.7rem", color: isDark ? "#90caf9" : "#1565c0" },
                            }}
                          />
                        ))
                      }
                      renderInput={(params) => (
                        <TextField {...params} variant="outlined" size="small"
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2, fontSize: "0.78rem",
                              "& fieldset": { borderColor: isDark ? "#334155" : "#e0e7ef" },
                              "&:hover fieldset": { borderColor: "#90caf9" },
                            },
                          }}
                        />
                      )}
                      sx={{ width: "100%" }}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ── Footer ── */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", mt: 1.5, gap: 1.5 }}>
        <Fade in={saved}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <CheckCircleOutlineIcon sx={{ fontSize: "0.9rem", color: "success.main" }} />
            <Typography sx={{ fontSize: "0.76rem", color: "success.main", fontWeight: 600 }}>Saved successfully!</Typography>
          </Box>
        </Fade>
        <Button variant="contained" startIcon={<SaveIcon sx={{ fontSize: "0.95rem !important" }} />}
          onClick={handleSave} size="small"
          sx={{
            fontWeight: 700, fontSize: "0.78rem", px: 2.5, py: 0.85,
            borderRadius: 2.5, textTransform: "none",
            background: "linear-gradient(135deg,#1976d2,#1565c0)",
            boxShadow: "0 2px 8px rgba(25,118,210,0.35)",
            "&:hover": { background: "linear-gradient(135deg,#1565c0,#0d47a1)", boxShadow: "0 4px 16px rgba(25,118,210,0.45)", transform: "translateY(-1px)" },
            transition: "all 0.2s ease",
          }}
        >
          Save Changes
        </Button>
      </Box>
    </Box>
  );
};

export default WeekDaySchedule;