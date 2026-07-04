import { Avatar, Badge, Box, Chip, Divider, Stack, Typography, useTheme } from "@mui/material";
import { motion } from "framer-motion";
import RoleBadge from "./RoleBadge";
import StatusBadge from "./StatusBadge";
import ActionMenu from "./ActionMenu";
import { getAvatarColor, getInitials, formatRelativeTime } from "../utils/userHelpers";
import { getUserStatus, STATUS_CONFIG, type User } from "../types/user";

export interface UserCardProps {
  user: User;
  index?: number;
  onView: (u: User) => void;
  onEdit: (u: User) => void;
  onPermissions: (u: User) => void;
  onResetPassword: (u: User) => void;
  onDelete: (u: User) => void;
}

export default function UserCard({
  user,
  index = 0,
  onView,
  onEdit,
  onPermissions,
  onResetPassword,
  onDelete,
}: UserCardProps) {
  const status = getUserStatus(user);
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index, 8) * 0.03 }}
      whileHover={{ y: -3 }}
    >
      <Box
        className="row-hover"
        sx={{
          p: 1.5,
          borderRadius: "14px",
          border: "1px solid",
          borderColor: "divider",
          background: "background.paper",
          boxShadow: isDark ? "0 2px 10px rgba(0,0,0,0.3)" : "0 2px 10px rgba(15,23,42,0.03)",
          transition: "box-shadow 0.2s ease",
          "&:hover": { boxShadow: isDark ? "0 8px 20px rgba(0,0,0,0.45)" : "0 8px 20px rgba(15,23,42,0.08)" },
          cursor: "pointer",
        }}
        onClick={() => onView(user)}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            badgeContent={
              <Box
                sx={{
                  width: 9,
                  height: 9,
                  borderRadius: "50%",
                  bgcolor: STATUS_CONFIG[status].dot,
                  border: "2px solid",
                  borderColor: "background.paper",
                }}
              />
            }
          >
            <Avatar
              sx={{ bgcolor: getAvatarColor(user.id), width: 38, height: 38, fontSize: 13, fontWeight: 700 }}
            >
              {getInitials(user.name)}
            </Avatar>
          </Badge>
          <Box onClick={(e) => e.stopPropagation()}>
            <ActionMenu
              onView={() => onView(user)}
              onEdit={() => onEdit(user)}
              onPermissions={() => onPermissions(user)}
              onResetPassword={() => onResetPassword(user)}
              onDelete={() => onDelete(user)}
            />
          </Box>
        </Stack>

        <Typography sx={{ fontSize: 13, fontWeight: 700, color: "text.primary", mt: 1 }} noWrap>
          {user.name}
        </Typography>
        <Typography sx={{ fontSize: 11.5, color: "text.secondary" }} noWrap>
          {user.email}
        </Typography>
        <Typography sx={{ fontSize: 11, color: "text.secondary" }}>
          {user.employeeId}
        </Typography>

        <Stack direction="row" gap={0.6} mt={1} flexWrap="wrap">
          <RoleBadge role={user.role} size="small" />
          <StatusBadge status={status} />
          <Chip
            label={user.function}
            size="small"
            sx={{ bgcolor: "action.hover", color: "text.secondary", fontSize: "0.65rem", fontWeight: 600, height: 20 }}
          />
        </Stack>

        <Divider sx={{ my: 1 }} />

        <Stack direction="row" justifyContent="space-between">
          <Typography sx={{ fontSize: 10.5, color: "text.secondary" }}>
            Joined {user.joinedDate}
          </Typography>
          <Typography sx={{ fontSize: 10.5, color: "text.secondary" }}>
            Active {formatRelativeTime(user.lastLogin)}
          </Typography>
        </Stack>
      </Box>
    </motion.div>
  );
}
