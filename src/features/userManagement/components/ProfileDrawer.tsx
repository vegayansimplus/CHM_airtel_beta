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
  alpha,
  useTheme,
} from "@mui/material";
import {
  Close,
  Edit,
  Email,
  Phone,
  CalendarMonth,
  Person,
  Work,
  Business,
  Shield,
  History,
  Login,
  Logout,
} from "@mui/icons-material";
import { AnimatePresence, motion } from "framer-motion";
import dayjs from "dayjs";
import RoleBadge from "./RoleBadge";
import StatusBadge from "./StatusBadge";
import { getAvatarColor, getInitials } from "../utils/userHelpers";
import { useGetUserProfileQuery } from "../api/userManagementApi";
import { CreateEditMemberDialog } from "../../teamManagement/components/dialog/CreateEditMemberDialog";

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
          bgcolor: "action.hover",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon sx={{ fontSize: 16, color: "text.secondary" }} />
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontSize: 10.5, color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          {label}
        </Typography>
        <Typography sx={{ fontSize: 13, fontWeight: 600, color: "text.primary" }} noWrap>
          {value}
        </Typography>
      </Box>
    </Stack>
  );
}

export default function ProfileDrawer({
  userId,
  actorUserId,
  onClose,
  onUserChanged,
}: {
  userId: number | null;
  actorUserId: number;
  onClose: () => void;
  onUserChanged: () => void;
}) {
  const [tab, setTab] = useState(0);
  const [editOpen, setEditOpen] = useState(false);
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const { data, isFetching, refetch } = useGetUserProfileQuery(userId as number, { skip: userId === null });
  const profile = data?.profile;

  return (
    <Drawer
      anchor="right"
      open={userId !== null}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: "100%", sm: 420 }, borderRadius: "20px 0 0 20px" } }}
    >
      <AnimatePresence mode="wait">
        {userId !== null && (
          <Box
            component={motion.div}
            key={userId}
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
                background: isDark
                  ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.16)} 0%, ${alpha(theme.palette.secondary.main, 0.12)} 100%)`
                  : "linear-gradient(135deg, #EFF6FF 0%, #F5F3FF 100%)",
                position: "relative",
              }}
            >
              <Stack direction="row" gap={0.75} sx={{ position: "absolute", top: 12, right: 12 }}>
                {profile && (
                  <IconButton
                    onClick={() => setEditOpen(true)}
                    size="small"
                    sx={{ bgcolor: isDark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.6)" }}
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                )}
                <IconButton
                  onClick={onClose}
                  size="small"
                  sx={{ bgcolor: isDark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.6)" }}
                >
                  <Close fontSize="small" />
                </IconButton>
              </Stack>
              {profile && (
                <Stack alignItems="center" gap={1.5}>
                  <Avatar
                    sx={{
                      width: 84,
                      height: 84,
                      fontSize: 28,
                      fontWeight: 700,
                      bgcolor: getAvatarColor(String(profile.userId)),
                      border: "4px solid",
                      borderColor: "background.paper",
                      boxShadow: isDark ? "0 8px 24px rgba(0,0,0,0.4)" : "0 8px 24px rgba(15,23,42,0.15)",
                    }}
                  >
                    {getInitials(profile.employeeName)}
                  </Avatar>
                  <Box textAlign="center">
                    <Typography sx={{ fontSize: 18, fontWeight: 800, color: "text.primary" }}>
                      {profile.employeeName}
                    </Typography>
                    <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
                      {profile.designation ?? profile.functionName ?? "—"}
                    </Typography>
                  </Box>
                  <Stack direction="row" gap={1}>
                    <RoleBadge role={profile.roleCode} />
                    <StatusBadge status={profile.employeeStatus === "ACTIVE" ? "Active" : "Inactive"} />
                  </Stack>
                </Stack>
              )}
            </Box>

            <Tabs
              value={tab}
              onChange={(_, v) => setTab(v)}
              variant="fullWidth"
              sx={{ borderBottom: "1px solid", borderColor: "divider" }}
            >
              <Tab label="Overview" />
              <Tab label="Permissions" />
              <Tab label="Sessions" />
            </Tabs>

            <Box sx={{ flex: 1, overflowY: "auto", p: 3 }}>
              {isFetching && !profile && (
                <Typography sx={{ fontSize: 13, color: "text.secondary" }}>Loading profile…</Typography>
              )}

              {profile && tab === 0 && (
                <Box>
                  <InfoRow icon={Person} label="OLM ID" value={profile.olmid} />
                  <InfoRow icon={Email} label="Email" value={profile.emailId} />
                  <InfoRow icon={Phone} label="Phone" value={profile.mobileNo ?? "—"} />
                  <InfoRow
                    icon={Business}
                    label="Department"
                    value={[profile.verticalName, profile.functionName].filter(Boolean).join(" · ") || "—"}
                  />
                  <InfoRow icon={Work} label="Employment Type" value={profile.employmentType} />
                  <InfoRow
                    icon={CalendarMonth}
                    label="Joining Date"
                    value={profile.dateOfJoining ? dayjs(profile.dateOfJoining).format("DD MMM YYYY") : "—"}
                  />
                  <InfoRow
                    icon={History}
                    label="Last Login"
                    value={profile.lastLogin ? dayjs(profile.lastLogin).format("DD MMM YYYY, hh:mm A") : "—"}
                  />
                </Box>
              )}

              {profile && tab === 1 && (
                <Box>
                  <Typography sx={{ fontSize: 12, fontWeight: 700, color: "text.secondary", mb: 1.5 }}>
                    GRANTED PERMISSIONS ({profile.roleCode ? profile.roleCode.replaceAll("_", " ") : "no role"})
                  </Typography>
                  <Stack direction="row" flexWrap="wrap" gap={1}>
                    {(data?.permissions ?? []).length === 0 ? (
                      <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                        No permissions assigned.
                      </Typography>
                    ) : (
                      data!.permissions.map((p, i) => (
                        <Chip
                          key={`${p.moduleName}-${p.subModuleName}-${p.permissionName}-${i}`}
                          icon={<Shield sx={{ fontSize: 14 }} />}
                          label={`${p.subModuleName} · ${p.permissionName}`}
                          size="small"
                          title={p.moduleName}
                          sx={{
                            bgcolor: alpha(theme.palette.primary.main, isDark ? 0.18 : 0.1),
                            color: isDark ? theme.palette.primary.light : theme.palette.primary.dark,
                            fontWeight: 600,
                            "& .MuiChip-icon": { color: "inherit" },
                          }}
                        />
                      ))
                    )}
                  </Stack>
                </Box>
              )}

              {profile && tab === 2 && (
                <Box>
                  <Typography sx={{ fontSize: 12, fontWeight: 700, color: "text.secondary", mb: 1.5 }}>
                    RECENT LOGIN ACTIVITY
                  </Typography>
                  <Stack gap={0}>
                    {(data?.loginHistory ?? []).length === 0 ? (
                      <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                        No recorded sessions.
                      </Typography>
                    ) : (
                      data!.loginHistory.map((s, i) => (
                        <Box key={s.id}>
                          <Stack direction="row" gap={1.5} py={1.25} alignItems="flex-start">
                            <Box
                              sx={{
                                width: 28,
                                height: 28,
                                borderRadius: "8px",
                                bgcolor: "action.hover",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                              }}
                            >
                              {s.status === "LOGIN" ? (
                                <Login sx={{ fontSize: 14, color: "success.main" }} />
                              ) : (
                                <Logout sx={{ fontSize: 14, color: "text.secondary" }} />
                              )}
                            </Box>
                            <Box>
                              <Typography sx={{ fontSize: 13, fontWeight: 600, color: "text.primary" }}>
                                {s.status === "LOGIN" ? "Logged in" : "Logged out"}
                              </Typography>
                              <Typography sx={{ fontSize: 11.5, color: "text.secondary" }}>
                                {dayjs(s.loginTime).format("DD MMM YYYY, hh:mm A")}
                                {s.logoutTime && ` → ${dayjs(s.logoutTime).format("hh:mm A")}`}
                              </Typography>
                            </Box>
                          </Stack>
                          {i < data!.loginHistory.length - 1 && <Divider />}
                        </Box>
                      ))
                    )}
                  </Stack>
                </Box>
              )}
            </Box>
          </Box>
        )}
      </AnimatePresence>

      {profile && (
        <CreateEditMemberDialog
          open={editOpen}
          onClose={() => {
            setEditOpen(false);
            refetch();
            onUserChanged();
          }}
          actorUserId={actorUserId}
          mode="edit"
          editData={profile}
        />
      )}
    </Drawer>
  );
}
