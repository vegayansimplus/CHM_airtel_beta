import {
  Avatar,
  Badge,
  Box,
  Breadcrumbs,
  Button,
  IconButton,
  Link,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  PersonAddAlt1,
  UploadFile,
  Download,
  Refresh,
  NotificationsNone,
  NavigateNext,
} from "@mui/icons-material";
import { motion } from "framer-motion";

export interface DashboardHeaderProps {
  onAddUser: () => void;
  onImport: () => void;
  onExport: () => void;
  onRefresh: () => void;
  refreshing?: boolean;
  userInitials?: string;
}

export default function DashboardHeader({
  onAddUser,
  onImport,
  onExport,
  onRefresh,
  refreshing = false,
  userInitials = "AD",
}: DashboardHeaderProps) {
  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        mb: 3,
        px: { xs: 2, md: 3 },
        py: 2,
        borderRadius: "20px",
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(14px)",
        border: "1px solid rgba(15,23,42,0.06)",
        boxShadow: "0 4px 24px rgba(15,23,42,0.05)",
      }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        alignItems={{ xs: "flex-start", md: "center" }}
        justifyContent="space-between"
        gap={2}
      >
        <Box>
          <Breadcrumbs
            separator={<NavigateNext sx={{ fontSize: 14 }} />}
            sx={{ mb: 0.5, "& .MuiBreadcrumbs-li": { fontSize: 12 } }}
          >
            <Link underline="hover" color="text.secondary" href="#" sx={{ fontSize: 12 }}>
              Admin
            </Link>
            <Typography color="text.secondary" sx={{ fontSize: 12 }}>
              User Management
            </Typography>
          </Breadcrumbs>
          <Typography sx={{ fontSize: 28, fontWeight: 800, color: "#0F172A", letterSpacing: "-0.02em" }}>
            User Management
          </Typography>
          <Typography sx={{ fontSize: 14, color: "#64748B", mt: 0.25 }}>
            Manage roles, permissions and team access across your organization
          </Typography>
        </Box>

        <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
          <Tooltip title="Import users">
            <Button
              variant="outlined"
              startIcon={<UploadFile sx={{ fontSize: 18 }} />}
              onClick={onImport}
              sx={{
                borderRadius: "12px",
                borderColor: "rgba(15,23,42,0.12)",
                color: "text.secondary",
                fontWeight: 600,
              }}
            >
              Import
            </Button>
          </Tooltip>
          <Tooltip title="Export users">
            <Button
              variant="outlined"
              startIcon={<Download sx={{ fontSize: 18 }} />}
              onClick={onExport}
              sx={{
                borderRadius: "12px",
                borderColor: "rgba(15,23,42,0.12)",
                color: "text.secondary",
                fontWeight: 600,
              }}
            >
              Export
            </Button>
          </Tooltip>
          <Tooltip title="Refresh">
            <IconButton
              onClick={onRefresh}
              sx={{
                borderRadius: "12px",
                border: "1px solid rgba(15,23,42,0.1)",
                width: 38,
                height: 38,
              }}
            >
              <Refresh
                sx={{
                  fontSize: 18,
                  color: "text.secondary",
                  animation: refreshing ? "spin 0.8s linear infinite" : "none",
                  "@keyframes spin": { to: { transform: "rotate(360deg)" } },
                }}
              />
            </IconButton>
          </Tooltip>

          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Button
              variant="contained"
              startIcon={<PersonAddAlt1 sx={{ fontSize: 18 }} />}
              onClick={onAddUser}
              sx={{
                borderRadius: "12px",
                fontWeight: 700,
                px: 2.5,
                background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
                boxShadow: "0 6px 18px rgba(37,99,235,0.35)",
                "&:hover": {
                  background: "linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)",
                  boxShadow: "0 8px 22px rgba(37,99,235,0.45)",
                },
              }}
            >
              Add User
            </Button>
          </motion.div>

          <Tooltip title="Notifications">
            <IconButton
              sx={{
                borderRadius: "12px",
                border: "1px solid rgba(15,23,42,0.1)",
                width: 38,
                height: 38,
              }}
            >
              <Badge variant="dot" color="error" overlap="circular">
                <NotificationsNone sx={{ fontSize: 18, color: "text.secondary" }} />
              </Badge>
            </IconButton>
          </Tooltip>

          <Avatar
            sx={{
              width: 38,
              height: 38,
              fontSize: 13,
              fontWeight: 700,
              background: "linear-gradient(135deg, #7C3AED 0%, #4C1D95 100%)",
            }}
          >
            {userInitials}
          </Avatar>
        </Stack>
      </Stack>
    </Box>
  );
}
