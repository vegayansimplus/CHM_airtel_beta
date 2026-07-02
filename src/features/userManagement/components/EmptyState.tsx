import { Box, Button, Stack, Typography } from "@mui/material";
import { PersonSearch, PersonAddAlt1, RestartAlt } from "@mui/icons-material";
import { motion } from "framer-motion";

export default function EmptyState({
  onAddUser,
  onResetFilters,
  showResetFilters = true,
}: {
  onAddUser: () => void;
  onResetFilters?: () => void;
  showResetFilters?: boolean;
}) {
  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      sx={{ py: 8, px: 3, textAlign: "center" }}
    >
      <Box
        sx={{
          width: 84,
          height: 84,
          mx: "auto",
          mb: 2.5,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #EFF6FF 0%, #EEF2FF 100%)",
        }}
      >
        <PersonSearch sx={{ fontSize: 40, color: "#2563EB" }} />
      </Box>
      <Typography sx={{ fontSize: 17, fontWeight: 700, color: "#0F172A" }}>
        No users found
      </Typography>
      <Typography sx={{ fontSize: 13, color: "text.secondary", mt: 0.5, maxWidth: 340, mx: "auto" }}>
        We couldn't find any users matching your current search or filters. Try
        adjusting them, or add a new user to get started.
      </Typography>
      <Stack direction="row" justifyContent="center" gap={1.5} mt={3}>
        {showResetFilters && onResetFilters && (
          <Button
            variant="outlined"
            startIcon={<RestartAlt sx={{ fontSize: 16 }} />}
            onClick={onResetFilters}
            sx={{ borderRadius: "10px", fontWeight: 600, borderColor: "rgba(15,23,42,0.12)" }}
          >
            Reset Filters
          </Button>
        )}
        <Button
          variant="contained"
          startIcon={<PersonAddAlt1 sx={{ fontSize: 16 }} />}
          onClick={onAddUser}
          sx={{
            borderRadius: "10px",
            fontWeight: 700,
            background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
          }}
        >
          Add User
        </Button>
      </Stack>
    </Box>
  );
}
