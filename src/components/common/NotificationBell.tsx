import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Badge,
  IconButton,
  Typography,
  Chip,
  Divider,
  Collapse,
  Button,
  ClickAwayListener,
  Tooltip,
  Fade,
  Avatar,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";

// ─── Types ────────────────────────────────────────────────────────────────────

export type NotifType = "info" | "danger" | "success" | "warn";
export type NotifGroup = "today" | "earlier";

export interface Notification {
  id: number;
  title: string;
  desc: string;
  time: string;
  action: string;
  type: NotifType;
  group: NotifGroup;
  needsAction?: boolean;
}

// ─── Demo data ────────────────────────────────────────────────────────────────

const DEFAULT_NOTIFS: Notification[] = [
  {
    id: 1,
    title: "Shift swap requested",
    desc: "John Doe wants to swap Friday shift with you",
    time: "10m ago",
    action: "Review",
    type: "info",
    group: "today",
    needsAction: true,
  },
  {
    id: 2,
    title: "Swap request rejected",
    desc: "Manager declined your Tuesday swap request",
    time: "1h ago",
    action: "Dismiss",
    type: "danger",
    group: "today",
    needsAction: false,
  },
  {
    id: 3,
    title: "Leave approved",
    desc: "Your leave for Apr 2–4 has been confirmed",
    time: "2h ago",
    action: "View",
    type: "success",
    group: "today",
    needsAction: false,
  },
  {
    id: 4,
    title: "Schedule published",
    desc: "Next week's roster is now live",
    time: "Yesterday",
    action: "View",
    type: "info",
    group: "earlier",
    needsAction: false,
  },
  {
    id: 5,
    title: "Overtime alert",
    desc: "You are approaching 45 hours this week",
    time: "Yesterday",
    action: "View",
    type: "warn",
    group: "earlier",
    needsAction: true,
  },
];

// ─── Style maps ───────────────────────────────────────────────────────────────

const TYPE_STYLE: Record<
  NotifType,
  { bg: string; color: string; border: string; avatarBg: string }
> = {
  info: {
    bg: "#eef2ff",
    color: "#6366f1",
    border: "#c7d2fe",
    avatarBg: "#e0e7ff",
  },
  danger: {
    bg: "#fef2f2",
    color: "#ef4444",
    border: "#fecaca",
    avatarBg: "#fee2e2",
  },
  success: {
    bg: "#ecfdf5",
    color: "#10b981",
    border: "#a7f3d0",
    avatarBg: "#d1fae5",
  },
  warn: {
    bg: "#fffbeb",
    color: "#f59e0b",
    border: "#fde68a",
    avatarBg: "#fef3c7",
  },
};

const ACCENT = "#6366f1";

function TypeIcon({ type, size = 16 }: { type: NotifType; size?: number }) {
  const c = TYPE_STYLE[type].color;
  const sx = { fontSize: size, color: c };
  if (type === "danger") return <CloseIcon sx={sx} />;
  if (type === "success") return <CheckIcon sx={sx} />;
  if (type === "warn") return <WarningAmberIcon sx={sx} />;
  return <SwapHorizIcon sx={sx} />;
}

type TabType = "All" | "Unread" | "Action";

// ─── Main Component ───────────────────────────────────────────────────────────

interface NotificationBellProps {
  notifications?: Notification[];
  onViewAll?: () => void;
}

export default function NotificationBell({
  notifications = DEFAULT_NOTIFS,
  onViewAll,
}: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<TabType>("All");
  const [dismissed, setDismissed] = useState<Record<number, boolean>>({});
  const [readIds, setReadIds] = useState<Record<number, boolean>>({});
  const [expanded, setExpanded] = useState<number | null>(null);
  const [pulse, setPulse] = useState(false);

  // Pulse bell on mount to draw attention
  useEffect(() => {
    const t = setTimeout(() => setPulse(true), 600);
    const t2 = setTimeout(() => setPulse(false), 1400);
    return () => {
      clearTimeout(t);
      clearTimeout(t2);
    };
  }, []);

  const active = notifications.filter((n) => !dismissed[n.id]);
  const unread = active.filter((n) => !readIds[n.id]).length;

  const filtered = active.filter((n) => {
    if (tab === "Unread") return !readIds[n.id];
    if (tab === "Action") return !!n.needsAction;
    return true;
  });

  const grouped = filtered.reduce<Record<NotifGroup, Notification[]>>(
    (acc, n) => {
      (acc[n.group] = acc[n.group] || []).push(n);
      return acc;
    },
    { today: [], earlier: [] },
  );

  const markRead = (id: number) => setReadIds((p) => ({ ...p, [id]: true }));
  const dismiss = (id: number) => setDismissed((p) => ({ ...p, [id]: true }));
  const markAll = () => {
    const patch: Record<number, boolean> = {};
    active.forEach((n) => (patch[n.id] = true));
    setReadIds((p) => ({ ...p, ...patch }));
  };
  const toggleExpand = (id: number) =>
    setExpanded((p) => (p === id ? null : id));

  return (
    <ClickAwayListener onClickAway={() => setOpen(false)}>
      <Box sx={{ position: "relative", display: "flex", alignItems: "center" }}>
        {/* ── Bell Button ──────────────────────────────────────────────────── */}
        <Tooltip title="Notifications" placement="bottom" arrow>
          <Box
            onClick={() => setOpen((p) => !p)}
            sx={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 30,
              height: 30,
              borderRadius: "12px",
              cursor: "pointer",
              background: open
                ? "rgba(255,255,255,0.20)"
                : "rgba(255,255,255,0.08)",
              border: open
                ? "1.5px solid rgba(255,255,255,0.35)"
                : "1.5px solid rgba(255,255,255,0.14)",
              transition: "all 0.22s cubic-bezier(.4,0,.2,1)",
              "&:hover": {
                background: "rgba(255,255,255,0.18)",
                border: "1.5px solid rgba(255,255,255,0.30)",
                transform: "translateY(-1px)",
              },
              "&:active": { transform: "scale(0.96)" },
            }}
          >
            {/* Glow ring when open */}
            {open && (
              <Box
                sx={{
                  position: "absolute",
                  inset: -3,
                  borderRadius: "14px",
                  border: `1.5px solid ${ACCENT}55`,
                  pointerEvents: "none",
                }}
              />
            )}

            {/* Bell icon */}
            <NotificationsIcon
              sx={{
                fontSize: 22,
                color: unread > 0 ? "#fff" : "rgba(255,255,255,0.75)",
                transition: "all 0.2s",
                animation: pulse ? "bellRing 0.6s ease" : "none",
                "@keyframes bellRing": {
                  "0%,100%": { transform: "rotate(0deg)" },
                  "15%": { transform: "rotate(14deg)" },
                  "30%": { transform: "rotate(-12deg)" },
                  "45%": { transform: "rotate(8deg)" },
                  "60%": { transform: "rotate(-5deg)" },
                  "75%": { transform: "rotate(3deg)" },
                },
              }}
            />

            {/* Badge count pill */}
            {unread > 0 && (
              <Box
                sx={{
                  position: "absolute",
                  top: -5,
                  right: -5,
                  minWidth: 20,
                  height: 20,
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, #ef4444, #dc2626)",
                  border: "2.5px solid #141b2e",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  px: "4px",
                  boxShadow: "0 2px 8px rgba(239,68,68,0.6)",
                  animation: "popIn 0.3s cubic-bezier(.4,0,.2,1)",
                  "@keyframes popIn": {
                    from: { transform: "scale(0)", opacity: 0 },
                    to: { transform: "scale(1)", opacity: 1 },
                  },
                }}
              >
                <Typography
                  sx={{
                    fontSize: 10,
                    fontWeight: 900,
                    color: "#fff",
                    lineHeight: 1,
                    letterSpacing: "-0.3px",
                  }}
                >
                  {unread > 99 ? "99+" : unread}
                </Typography>
              </Box>
            )}
          </Box>
        </Tooltip>

        {/* ── Dropdown ─────────────────────────────────────────────────────── */}
        <Fade in={open} timeout={180}>
          <Box
            sx={{
              position: "absolute",
              top: "calc(100% + 14px)",
              right: -4,
              width: 360,
              background: "#fff",
              borderRadius: "18px",
              boxShadow:
                "0 24px 60px rgba(0,0,0,0.22), 0 4px 16px rgba(0,0,0,0.08)",
              border: "1.5px solid #e8edf6",
              overflow: "hidden",
              zIndex: 1400,
              display: open ? "block" : "none",
              // Arrow pointer
              "&::before": {
                content: '""',
                position: "absolute",
                top: -8,
                right: 16,
                width: 16,
                height: 16,
                background: "#fff",
                border: "1.5px solid #e8edf6",
                borderBottom: "none",
                borderRight: "none",
                transform: "rotate(45deg)",
                borderRadius: "2px",
              },
            }}
          >
            {/* ── Header ── */}
            <Box
              sx={{
                px: "16px",
                pt: "16px",
                pb: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "linear-gradient(135deg, #fafbff 0%, #f0f3ff 100%)",
                borderBottom: "1.5px solid #eef1f8",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: "9px",
                    background: ACCENT,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: `0 4px 12px ${ACCENT}55`,
                  }}
                >
                  <NotificationsIcon sx={{ fontSize: 16, color: "#fff" }} />
                </Box>
                <Box>
                  <Typography
                    sx={{
                      fontSize: 13,
                      fontWeight: 800,
                      color: "#1e1b4b",
                      lineHeight: 1.2,
                    }}
                  >
                    Notifications
                  </Typography>
                  <Typography
                    sx={{ fontSize: 10, color: "#94a3b8", fontWeight: 500 }}
                  >
                    {unread > 0
                      ? `${unread} new update${unread > 1 ? "s" : ""}`
                      : "You're all caught up"}
                  </Typography>
                </Box>
              </Box>
              <Tooltip title="Mark all as read">
                <Box
                  onClick={markAll}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    px: "10px",
                    py: "5px",
                    borderRadius: "8px",
                    background: unread > 0 ? "#eef2ff" : "#f1f5f9",
                    cursor: "pointer",
                    transition: "all .15s",
                    "&:hover": { background: "#e0e7ff" },
                  }}
                >
                  <DoneAllIcon
                    sx={{
                      fontSize: 13,
                      color: unread > 0 ? ACCENT : "#94a3b8",
                    }}
                  />
                  <Typography
                    sx={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: unread > 0 ? ACCENT : "#94a3b8",
                    }}
                  >
                    All read
                  </Typography>
                </Box>
              </Tooltip>
            </Box>

            {/* ── Tabs ── */}
            <Box
              sx={{
                display: "flex",
                gap: "2px",
                px: "10px",
                pt: "8px",
                pb: "0",
                borderBottom: "1.5px solid #f1f5f9",
              }}
            >
              {(["All", "Unread", "Action"] as TabType[]).map((t) => {
                const count =
                  t === "Unread"
                    ? active.filter((n) => !readIds[n.id]).length
                    : t === "Action"
                      ? active.filter((n) => n.needsAction).length
                      : active.length;
                return (
                  <Box
                    key={t}
                    onClick={() => setTab(t)}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      px: "12px",
                      py: "7px",
                      cursor: "pointer",
                      borderBottom:
                        tab === t
                          ? `2.5px solid ${ACCENT}`
                          : "2.5px solid transparent",
                      mb: "-1.5px",
                      transition: "all .15s",
                      "&:hover": { "& .tab-label": { color: ACCENT } },
                    }}
                  >
                    <Typography
                      className="tab-label"
                      sx={{
                        fontSize: 11,
                        fontWeight: tab === t ? 800 : 500,
                        color: tab === t ? ACCENT : "#94a3b8",
                        transition: "color .15s",
                      }}
                    >
                      {t}
                    </Typography>
                    {count > 0 && (
                      <Box
                        sx={{
                          minWidth: 16,
                          height: 16,
                          borderRadius: "8px",
                          px: "4px",
                          background: tab === t ? ACCENT : "#f1f5f9",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: 9,
                            fontWeight: 800,
                            color: tab === t ? "#fff" : "#94a3b8",
                          }}
                        >
                          {count}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                );
              })}
            </Box>

            {/* ── List ── */}
            <Box
              sx={{
                maxHeight: 360,
                overflowY: "auto",
                "&::-webkit-scrollbar": { width: "3px" },
                "&::-webkit-scrollbar-thumb": {
                  background: "#e2e8f0",
                  borderRadius: "4px",
                },
              }}
            >
              {(["today", "earlier"] as NotifGroup[]).map((group) => {
                const items = grouped[group];
                if (!items?.length) return null;
                return (
                  <Box key={group}>
                    <Typography
                      sx={{
                        fontSize: 9,
                        fontWeight: 800,
                        color: "#94a3b8",
                        letterSpacing: "1px",
                        textTransform: "uppercase",
                        px: "16px",
                        pt: "10px",
                        pb: "4px",
                      }}
                    >
                      {group === "today" ? "Today" : "Earlier"}
                    </Typography>
                    {items.map((n) => {
                      const isRead = !!readIds[n.id];
                      const isExpanded = expanded === n.id;
                      const s = TYPE_STYLE[n.type];
                      return (
                        <Box key={n.id}>
                          <Box
                            onClick={() => {
                              toggleExpand(n.id);
                              markRead(n.id);
                            }}
                            sx={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: "11px",
                              px: "14px",
                              py: "10px",
                              cursor: "pointer",
                              background: isExpanded
                                ? "#f5f7ff"
                                : isRead
                                  ? "transparent"
                                  : "#fafbff",
                              borderBottom: "1px solid #f8fafc",
                              position: "relative",
                              transition: "background .15s",
                              "&:hover": { background: "#f5f7ff" },
                            }}
                          >
                            {/* Unread left bar */}
                            {!isRead && (
                              <Box
                                sx={{
                                  position: "absolute",
                                  left: 0,
                                  top: "20%",
                                  bottom: "20%",
                                  width: 3,
                                  borderRadius: "0 3px 3px 0",
                                  background: ACCENT,
                                }}
                              />
                            )}

                            {/* Avatar */}
                            <Box
                              sx={{
                                width: 36,
                                height: 36,
                                borderRadius: "11px",
                                flexShrink: 0,
                                background: s.avatarBg,
                                border: `1.5px solid ${s.border}`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                position: "relative",
                              }}
                            >
                              <TypeIcon type={n.type} size={17} />
                              {!isRead && (
                                <Box
                                  sx={{
                                    position: "absolute",
                                    top: -3,
                                    right: -3,
                                    width: 9,
                                    height: 9,
                                    borderRadius: "50%",
                                    background: ACCENT,
                                    border: "2px solid #fff",
                                  }}
                                />
                              )}
                            </Box>

                            {/* Text */}
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography
                                sx={{
                                  fontSize: 12,
                                  fontWeight: isRead ? 600 : 800,
                                  color: "#1e1b4b",
                                  lineHeight: 1.3,
                                }}
                              >
                                {n.title}
                              </Typography>
                              <Typography
                                sx={{
                                  fontSize: 10.5,
                                  color: "#64748b",
                                  mt: "2px",
                                  lineHeight: 1.4,
                                  whiteSpace: isExpanded ? "normal" : "nowrap",
                                  overflow: "hidden",
                                  textOverflow: isExpanded
                                    ? "unset"
                                    : "ellipsis",
                                }}
                              >
                                {n.desc}
                              </Typography>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "5px",
                                  mt: "4px",
                                }}
                              >
                                <FiberManualRecordIcon
                                  sx={{ fontSize: 5, color: "#cbd5e1" }}
                                />
                                <Typography
                                  sx={{
                                    fontSize: 9.5,
                                    color: "#94a3b8",
                                    fontWeight: 600,
                                  }}
                                >
                                  {n.time}
                                </Typography>
                              </Box>
                            </Box>

                            {/* Action chip */}
                            <Chip
                              label={n.action}
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                dismiss(n.id);
                              }}
                              sx={{
                                fontSize: 9.5,
                                fontWeight: 700,
                                background: s.bg,
                                color: s.color,
                                border: `1.5px solid ${s.border}`,
                                borderRadius: "8px",
                                flexShrink: 0,
                                alignSelf: "center",
                                height: "auto",
                                "& .MuiChip-label": { px: "9px", py: "3px" },
                                "&:hover": {
                                  opacity: 0.8,
                                  transform: "scale(0.96)",
                                },
                                transition: "all .15s",
                              }}
                            />
                          </Box>

                          {/* Expanded panel */}
                          <Collapse in={isExpanded}>
                            <Box
                              sx={{
                                mx: "12px",
                                mb: "8px",
                                p: "10px 12px",
                                borderRadius: "10px",
                                background: s.bg,
                                border: `1px solid ${s.border}`,
                              }}
                            >
                              <Typography
                                sx={{
                                  fontSize: 10.5,
                                  color: "#475569",
                                  lineHeight: 1.6,
                                }}
                              >
                                {n.desc}
                              </Typography>
                              <Box
                                sx={{ display: "flex", gap: "6px", mt: "8px" }}
                              >
                                <Button
                                  size="small"
                                  variant="contained"
                                  onClick={() => dismiss(n.id)}
                                  sx={{
                                    fontSize: 9.5,
                                    fontWeight: 700,
                                    background: s.color,
                                    borderRadius: "7px",
                                    py: "4px",
                                    px: "14px",
                                    textTransform: "none",
                                    minWidth: 0,
                                    boxShadow: "none",
                                    "&:hover": {
                                      background: s.color,
                                      opacity: 0.85,
                                    },
                                  }}
                                >
                                  {n.action}
                                </Button>
                                <Button
                                  size="small"
                                  onClick={() => toggleExpand(n.id)}
                                  sx={{
                                    fontSize: 9.5,
                                    fontWeight: 600,
                                    color: "#94a3b8",
                                    borderRadius: "7px",
                                    py: "4px",
                                    px: "10px",
                                    textTransform: "none",
                                    minWidth: 0,
                                  }}
                                >
                                  Close
                                </Button>
                              </Box>
                            </Box>
                          </Collapse>
                        </Box>
                      );
                    })}
                  </Box>
                );
              })}

              {filtered.length === 0 && (
                <Box sx={{ textAlign: "center", py: "36px" }}>
                  <Box
                    sx={{
                      width: 52,
                      height: 52,
                      borderRadius: "16px",
                      background: "#eef2ff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mx: "auto",
                      mb: "10px",
                    }}
                  >
                    <CheckCircleOutlineIcon
                      sx={{ fontSize: 28, color: "#a5b4fc" }}
                    />
                  </Box>
                  <Typography
                    sx={{ color: "#1e1b4b", fontSize: 12, fontWeight: 700 }}
                  >
                    {tab === "Unread"
                      ? "No unread notifications"
                      : tab === "Action"
                        ? "Nothing needs action"
                        : "All caught up!"}
                  </Typography>
                  <Typography
                    sx={{ color: "#94a3b8", fontSize: 10.5, mt: "3px" }}
                  >
                    Check back later for updates
                  </Typography>
                </Box>
              )}
            </Box>

            {/* ── Footer ── */}
            <Box
              sx={{
                borderTop: "1.5px solid #f1f5f9",
                background: "#fafbff",
                px: "14px",
                py: "10px",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Button
                size="small"
                endIcon={<OpenInFullIcon sx={{ fontSize: 12 }} />}
                onClick={() => {
                  setOpen(false);
                  onViewAll?.();
                }}
                sx={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: ACCENT,
                  background: "#eef2ff",
                  borderRadius: "9px",
                  textTransform: "none",
                  px: "20px",
                  py: "6px",
                  width: "100%",
                  "&:hover": { background: "#e0e7ff" },
                }}
              >
                View all notifications
              </Button>
            </Box>
          </Box>
        </Fade>
      </Box>
    </ClickAwayListener>
  );
}
