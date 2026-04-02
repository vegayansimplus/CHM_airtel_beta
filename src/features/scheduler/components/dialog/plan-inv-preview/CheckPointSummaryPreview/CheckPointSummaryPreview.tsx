
import { Box, alpha, Typography, Stack } from "@mui/material";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";

export const CheckPointSummaryPreview: React.FC<{
  crqNo?: string | null;
  crqStatus?: string | null;
}> = ({ crqNo, crqStatus }) => (
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: 220,
      border: "1.5px dashed",
      borderColor: "divider",
      borderRadius: 3,
      p: 4,
      gap: 1.5,
      bgcolor: "background.paper",
    }}
  >
    <Box
      sx={{
        width: 52,
        height: 52,
        borderRadius: "50%",
        bgcolor: (t) => alpha(t.palette.text.disabled, 0.08),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <AssignmentTurnedInOutlinedIcon
        sx={{ fontSize: 26, color: "text.disabled" }}
      />
    </Box>
    <Typography variant="subtitle2" fontWeight={600} color="text.primary">
      CheckPoint Summary Preview
    </Typography>
    <Stack direction="row" spacing={1} alignItems="center">
      <Typography variant="body2" color="text.secondary">
        CRQ:{" "}
        <Box
          component="strong"
          sx={{ color: "text.primary", fontFamily: "monospace" }}
        >
          {crqNo || "N/A"}
        </Box>
      </Typography>
      <Box
        sx={{
          width: 3,
          height: 3,
          borderRadius: "50%",
          bgcolor: "text.disabled",
        }}
      />
      <Typography variant="body2" color="text.secondary">
        Status:{" "}
        <Box component="strong" sx={{ color: "text.primary" }}>
          {crqStatus || "N/A"}
        </Box>
      </Typography>
    </Stack>
  </Box>
);