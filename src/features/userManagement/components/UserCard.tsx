import { Avatar, Badge, Box, Chip, Divider, Stack, Typography } from "@mui/material";
import { motion } from "framer-motion";
import RoleBadge from "./RoleBadge";
import StatusBadge from "./StatusBadge";
import ActionMenu from "./ActionMenu";
import { getAvatarColor, getInitials, formatRelativeTime } from "../utils/userHelpers";
import { getUserStatus, type User } from "../types/user";

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
          p: 2.5,
          borderRadius: "18px",
          border: "1px solid rgba(15,23,42,0.06)",
          background: "rgba(255,255,255,0.9)",
          boxShadow: "0 4px 16px rgba(15,23,42,0.04)",
          transition: "box-shadow 0.2s ease",
          "&:hover": { boxShadow: "0 12px 28px rgba(15,23,42,0.1)" },
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
                  width: 11,
                  height: 11,
                  borderRadius: "50%",
                  bgcolor: status === "Active" ? "#22C55E" : "#9CA3AF",
                  border: "2px solid white",
                }}
              />
            }
          >
            <Avatar
              sx={{ bgcolor: getAvatarColor(user.id), width: 50, height: 50, fontWeight: 700 }}
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

        <Typography sx={{ fontSize: 14.5, fontWeight: 700, color: "#0F172A", mt: 1.5 }} noWrap>
          {user.name}
        </Typography>
        <Typography sx={{ fontSize: 12, color: "text.secondary" }} noWrap>
          {user.email}
        </Typography>
        <Typography sx={{ fontSize: 11.5, color: "text.secondary", mt: 0.25 }}>
          {user.employeeId}
        </Typography>

        <Stack direction="row" gap={1} mt={1.75} flexWrap="wrap">
          <RoleBadge role={user.role} size="small" />
          <StatusBadge status={status} />
          <Chip
            label={user.function}
            size="small"
            sx={{ bgcolor: "#F1F5F9", color: "#475569", fontSize: "0.68rem", fontWeight: 600 }}
          />
        </Stack>

        <Divider sx={{ my: 1.5 }} />

        <Stack direction="row" justifyContent="space-between">
          <Typography sx={{ fontSize: 11, color: "text.secondary" }}>
            Joined {user.joinedDate}
          </Typography>
          <Typography sx={{ fontSize: 11, color: "text.secondary" }}>
            Active {formatRelativeTime(user.lastLogin)}
          </Typography>
        </Stack>
      </Box>
    </motion.div>
  );
}
