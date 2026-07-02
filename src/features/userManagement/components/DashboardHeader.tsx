import { Box, Breadcrumbs, Button, IconButton, Link, Stack, Tooltip, Typography } from "@mui/material";
import { PersonAddAlt1, UploadFile, Download, Refresh, NavigateNext } from "@mui/icons-material";
import { motion } from "framer-motion";

export interface DashboardHeaderProps {
  onAddUser: () => void;
  onImport: () => void;
  onExport: () => void;
  onRefresh: () => void;
  refreshing?: boolean;
}

export default function DashboardHeader({
  onAddUser,
  onImport,
  onExport,
  onRefresh,
  refreshing = false,
}: DashboardHeaderProps) {
  return (
    <Box component={motion.div} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} sx={{ mb: 1 }}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        alignItems={{ xs: "flex-start", md: "center" }}
        justifyContent="space-between"
        gap={0.75}
      >
        <Box>
          <Breadcrumbs
            separator={<NavigateNext sx={{ fontSize: 11 }} />}
            sx={{ mb: 0, "& .MuiBreadcrumbs-li": { fontSize: 10.5 }, lineHeight: 1 }}
          >
            <Link underline="hover" color="text.secondary" href="#" sx={{ fontSize: 10.5 }}>
              Admin
            </Link>
            <Typography color="text.secondary" sx={{ fontSize: 10.5 }}>
              User Management
            </Typography>
          </Breadcrumbs>
          <Stack direction="row" alignItems="baseline" gap={1} flexWrap="wrap">
            <Typography sx={{ fontSize: 17, fontWeight: 800, color: "#0F172A", letterSpacing: "-0.01em", lineHeight: 1.3 }}>
              User Management
            </Typography>
            <Typography sx={{ fontSize: 11.5, color: "#94A3B8" }}>
              Manage roles, permissions and team access
            </Typography>
          </Stack>
        </Box>

        <Stack direction="row" alignItems="center" gap={0.75} flexWrap="wrap">
          <Tooltip title="Import users">
            <Button
              size="small"
              variant="outlined"
              startIcon={<UploadFile sx={{ fontSize: 15 }} />}
              onClick={onImport}
              sx={{
                borderRadius: "8px",
                borderColor: "rgba(15,23,42,0.12)",
                color: "text.secondary",
                fontWeight: 600,
                py: 0.4,
                minWidth: 0,
                px: { xs: 1, sm: 1.5 },
                "& .MuiButton-startIcon": { mr: { xs: 0, sm: 0.75 } },
              }}
            >
              <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
                Import
              </Box>
            </Button>
          </Tooltip>
          <Tooltip title="Export users">
            <Button
              size="small"
              variant="outlined"
              startIcon={<Download sx={{ fontSize: 15 }} />}
              onClick={onExport}
              sx={{
                borderRadius: "8px",
                borderColor: "rgba(15,23,42,0.12)",
                color: "text.secondary",
                fontWeight: 600,
                py: 0.4,
                minWidth: 0,
                px: { xs: 1, sm: 1.5 },
                "& .MuiButton-startIcon": { mr: { xs: 0, sm: 0.75 } },
              }}
            >
              <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
                Export
              </Box>
            </Button>
          </Tooltip>
          <Tooltip title="Refresh">
            <IconButton
              size="small"
              onClick={onRefresh}
              sx={{ borderRadius: "8px", border: "1px solid rgba(15,23,42,0.1)", width: 30, height: 30 }}
            >
              <Refresh
                sx={{
                  fontSize: 15,
                  color: "text.secondary",
                  animation: refreshing ? "spin 0.8s linear infinite" : "none",
                  "@keyframes spin": { to: { transform: "rotate(360deg)" } },
                }}
              />
            </IconButton>
          </Tooltip>

          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Button
              size="small"
              variant="contained"
              startIcon={<PersonAddAlt1 sx={{ fontSize: 15 }} />}
              onClick={onAddUser}
              sx={{
                borderRadius: "8px",
                fontWeight: 700,
                px: { xs: 1.5, sm: 2 },
                py: 0.4,
                background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
                boxShadow: "0 4px 12px rgba(37,99,235,0.3)",
                "&:hover": {
                  background: "linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)",
                  boxShadow: "0 6px 16px rgba(37,99,235,0.4)",
                },
              }}
            >
              <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
                Add User
              </Box>
              <Box component="span" sx={{ display: { xs: "inline", sm: "none" } }}>
                Add
              </Box>
            </Button>
          </motion.div>
        </Stack>
      </Stack>
    </Box>
  );
}
