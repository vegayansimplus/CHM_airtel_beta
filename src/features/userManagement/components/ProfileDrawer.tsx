import { useState } from "react";
import {
  Avatar,
  Box,
  Chip,
  Divider,
  Drawer,
  IconButton,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import {
  Close,
  Email,
  Phone,
  CalendarMonth,
  Person,
  Devices,
  Laptop,
  PhoneIphone,
  TabletMac,
  Shield,
  History,
} from "@mui/icons-material";
import { AnimatePresence, motion } from "framer-motion";
import RoleBadge from "./RoleBadge";
import StatusBadge from "./StatusBadge";
import { getAvatarColor, getInitials, formatRelativeTime } from "../utils/userHelpers";
import { getUserStatus, type User } from "../types/user";

interface InfoRowProps {
  icon: React.ElementType;
  label: string;
  value: string;
}

function InfoRow({ icon: Icon, label, value }: InfoRowProps) {
  return (
    <Stack direction="row" alignItems="center" gap={1.5} py={1}>
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: "9px",
          bgcolor: "#F1F5F9",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon sx={{ fontSize: 16, color: "#64748B" }} />
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontSize: 10.5, color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          {label}
        </Typography>
        <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }} noWrap>
          {value}
        </Typography>
      </Box>
    </Stack>
  );
}

const deviceIcon = { Desktop: Laptop, Mobile: PhoneIphone, Tablet: TabletMac } as const;

export default function ProfileDrawer({
  user,
  onClose,
}: {
  user: User | null;
  onClose: () => void;
}) {
  const [tab, setTab] = useState(0);

  return (
    <Drawer
      anchor="right"
      open={Boolean(user)}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: "100%", sm: 420 }, borderRadius: "20px 0 0 20px" } }}
    >
      <AnimatePresence mode="wait">
        {user && (
          <Box
            component={motion.div}
            key={user.id}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            transition={{ duration: 0.25 }}
            sx={{ height: "100%", display: "flex", flexDirection: "column" }}
          >
            {/* Header */}
            <Box
              sx={{
                p: 3,
                background: "linear-gradient(135deg, #EFF6FF 0%, #F5F3FF 100%)",
                position: "relative",
              }}
            >
              <IconButton
                onClick={onClose}
                size="small"
                sx={{ position: "absolute", top: 12, right: 12, bgcolor: "rgba(255,255,255,0.6)" }}
              >
                <Close fontSize="small" />
              </IconButton>
              <Stack alignItems="center" gap={1.5}>
                <Avatar
                  sx={{
                    width: 84,
                    height: 84,
                    fontSize: 28,
                    fontWeight: 700,
                    bgcolor: getAvatarColor(user.id),
                    border: "4px solid #fff",
                    boxShadow: "0 8px 24px rgba(15,23,42,0.15)",
                  }}
                >
                  {getInitials(user.name)}
                </Avatar>
                <Box textAlign="center">
                  <Typography sx={{ fontSize: 18, fontWeight: 800, color: "#0F172A" }}>
                    {user.name}
                  </Typography>
                  <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
                    {user.designation ?? user.function}
                  </Typography>
                </Box>
                <Stack direction="row" gap={1}>
                  <RoleBadge role={user.role} />
                  <StatusBadge status={getUserStatus(user)} />
                </Stack>
              </Stack>
            </Box>

            <Tabs
              value={tab}
              onChange={(_, v) => setTab(v)}
              variant="fullWidth"
              sx={{ borderBottom: "1px solid rgba(15,23,42,0.08)" }}
            >
              <Tab label="Overview" />
              <Tab label="Permissions" />
              <Tab label="Activity" />
              <Tab label="Security" />
            </Tabs>

            <Box sx={{ flex: 1, overflowY: "auto", p: 3 }}>
              {tab === 0 && (
                <Box>
                  <InfoRow icon={Person} label="Employee ID" value={user.employeeId} />
                  <InfoRow icon={Email} label="Email" value={user.email} />
                  <InfoRow icon={Phone} label="Phone" value={user.phone ?? "—"} />
                  <InfoRow icon={Person} label="Department" value={user.function} />
                  <InfoRow icon={Person} label="Manager" value={user.manager ?? "—"} />
                  <InfoRow icon={CalendarMonth} label="Joining Date" value={user.joinedDate} />
                  <InfoRow
                    icon={History}
                    label="Last Login"
                    value={formatRelativeTime(user.lastLogin)}
                  />
                </Box>
              )}

              {tab === 1 && (
                <Box>
                  <Typography sx={{ fontSize: 12, fontWeight: 700, color: "text.secondary", mb: 1.5 }}>
                    GRANTED PERMISSIONS
                  </Typography>
                  <Stack direction="row" flexWrap="wrap" gap={1}>
                    {(user.permissions ?? []).length === 0 ? (
                      <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                        No permissions assigned.
                      </Typography>
                    ) : (
                      user.permissions!.map((p) => (
                        <Chip
                          key={p}
                          icon={<Shield sx={{ fontSize: 14 }} />}
                          label={p}
                          size="small"
                          sx={{ bgcolor: "#EEF2FF", color: "#4338CA", fontWeight: 600 }}
                        />
                      ))
                    )}
                  </Stack>
                </Box>
              )}

              {tab === 2 && (
                <Box>
                  <Typography sx={{ fontSize: 12, fontWeight: 700, color: "text.secondary", mb: 1.5 }}>
                    RECENT ACTIVITY
                  </Typography>
                  <Stack gap={0}>
                    {(user.activity ?? []).length === 0 ? (
                      <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                        No recent activity.
                      </Typography>
                    ) : (
                      user.activity!.map((a, i) => (
                        <Box key={a.id}>
                          <Stack direction="row" gap={1.5} py={1.25} alignItems="flex-start">
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                mt: 0.6,
                                borderRadius: "50%",
                                bgcolor: "primary.main",
                                flexShrink: 0,
                              }}
                            />
                            <Box>
                              <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}>
                                {a.action}
                              </Typography>
                              <Typography sx={{ fontSize: 11.5, color: "text.secondary" }}>
                                {a.time}
                              </Typography>
                            </Box>
                          </Stack>
                          {i < user.activity!.length - 1 && <Divider />}
                        </Box>
                      ))
                    )}
                  </Stack>
                </Box>
              )}

              {tab === 3 && (
                <Box>
                  <Typography sx={{ fontSize: 12, fontWeight: 700, color: "text.secondary", mb: 1.5 }}>
                    DEVICES
                  </Typography>
                  <Stack gap={1} mb={2.5}>
                    {(user.devices ?? []).length === 0 ? (
                      <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                        No devices on record.
                      </Typography>
                    ) : (
                      user.devices!.map((d, i) => {
                        const Icon = deviceIcon[d.type];
                        return (
                          <Stack
                            key={i}
                            direction="row"
                            alignItems="center"
                            gap={1.5}
                            sx={{ p: 1.25, borderRadius: "10px", bgcolor: "#F8FAFC" }}
                          >
                            <Icon sx={{ fontSize: 18, color: "#64748B" }} />
                            <Box sx={{ flex: 1 }}>
                              <Typography sx={{ fontSize: 12.5, fontWeight: 600 }}>
                                {d.name}
                              </Typography>
                              <Typography sx={{ fontSize: 11, color: "text.secondary" }}>
                                Active {d.lastActive}
                              </Typography>
                            </Box>
                          </Stack>
                        );
                      })
                    )}
                  </Stack>

                  <Typography sx={{ fontSize: 12, fontWeight: 700, color: "text.secondary", mb: 1.5 }}>
                    RECENT SESSIONS
                  </Typography>
                  <Stack gap={1}>
                    {(user.sessions ?? []).length === 0 ? (
                      <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                        No recent sessions.
                      </Typography>
                    ) : (
                      user.sessions!.map((s) => (
                        <Stack
                          key={s.id}
                          direction="row"
                          alignItems="center"
                          gap={1.5}
                          sx={{ p: 1.25, borderRadius: "10px", bgcolor: "#F8FAFC" }}
                        >
                          <Devices sx={{ fontSize: 18, color: "#64748B" }} />
                          <Box sx={{ flex: 1 }}>
                            <Typography sx={{ fontSize: 12.5, fontWeight: 600 }}>
                              {s.device} · {s.location}
                            </Typography>
                            <Typography sx={{ fontSize: 11, color: "text.secondary" }}>
                              {s.ip} · {s.time}
                            </Typography>
                          </Box>
                        </Stack>
                      ))
                    )}
                  </Stack>
                </Box>
              )}
            </Box>
          </Box>
        )}
      </AnimatePresence>
    </Drawer>
  );
}
