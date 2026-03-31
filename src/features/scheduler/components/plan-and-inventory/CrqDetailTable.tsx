import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import { Typography, Chip, Box, Stack, Button } from "@mui/material";
import { type MRT_ColumnDef, useMaterialReactTable, MaterialReactTable } from "material-react-table";
import { useMemo } from "react";
import type { Colors } from "../../types/colorTypes";

// Add this component above or below your PlanAndInventoryPage
export const CrqDetailTable: React.FC<{ crq: any; colors: Colors; onBack: () => void }> = ({
  crq,
  colors,
  onBack,
}) => {
  // Define columns for your CRQ Details (e.g., Tasks)
  const columns = useMemo<MRT_ColumnDef<any>[]>(
    () => [
      {
        accessorKey: "taskId",
        header: "Task ID",
        size: 150,
        Cell: ({ cell }) => (
          <Typography sx={{ fontSize: 12, fontWeight: 800, fontFamily: "monospace", color: colors.accent }}>
            {cell.getValue<string>()}
          </Typography>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        size: 150,
        Cell: ({ cell }) => (
          <Chip
            label={cell.getValue<string>() || "Pending"}
            size="small"
            sx={{ height: 20, fontSize: 11, fontWeight: 600 }}
          />
        ),
      },
      {
        accessorKey: "description",
        header: "Task Description",
        size: 400,
        Cell: ({ cell }) => (
          <Typography sx={{ fontSize: 12, color: colors.textSecondary }}>
            {cell.getValue<string>()}
          </Typography>
        ),
      },
    ],
    [colors]
  );

  const table = useMaterialReactTable({
    columns,
    data: crq.tasks || [], // Replace with your actual nested data array (e.g., crq tasks)
    enableSorting: true,
    enablePagination: true,
    initialState: { density: "compact" },
    // Reusing the exact same styling as your main table to keep the "same view"
    muiTablePaperProps: {
      elevation: 0,
      sx: {
        border: `1px solid ${colors.border}`,
        borderRadius: colors.radiusXL,
        overflow: "hidden",
        bgcolor: colors.surface,
      },
    },
    muiTableHeadCellProps: {
      sx: {
        fontSize: "11px !important",
        fontWeight: "700 !important",
        letterSpacing: "0.55px !important",
        textTransform: "uppercase !important",
        color: `${colors.textSecondary} !important`,
        bgcolor: colors.isDark ? "rgba(255,255,255,0.025)" : "rgba(248,250,252,0.95)",
        borderBottom: `1px solid ${colors.border} !important`,
        py: "10px !important",
      },
    },
    muiTableBodyCellProps: {
      sx: {
        fontSize: 13,
        color: colors.textPrimary,
        borderBottom: `1px solid ${colors.border}`,
        py: "8px !important",
      },
    },
    muiTableBodyRowProps: {
      sx: {
        transition: "background 0.12s ease",
        "&:hover td": {
          bgcolor: colors.isDark ? "rgba(99,102,241,0.04)" : "rgba(99,102,241,0.025)",
        },
      },
    },
    muiTopToolbarProps: {
      sx: { bgcolor: colors.surface, borderBottom: `1px solid ${colors.border}`, px: 2, py: 1, minHeight: 52 },
    },
    muiBottomToolbarProps: {
      sx: { bgcolor: colors.isDark ? "rgba(255,255,255,0.01)" : "rgba(248,250,252,0.7)", borderTop: `1px solid ${colors.border}`, minHeight: 44 },
    },
  });

  return (
    <Box sx={{ animation: "fadeSlideIn 0.3s ease" }}>
      {/* Header for Detail View */}
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2, px: 1 }}>
        <Button
          startIcon={<ArrowBackRoundedIcon />}
          onClick={onBack}
          variant="outlined"
          size="small"
          sx={{
            textTransform: "none",
            borderColor: colors.border,
            color: colors.textSecondary,
            "&:hover": { bgcolor: colors.accentDim, borderColor: colors.accent },
          }}
        >
          Back to Plans
        </Button>
        <Typography variant="h6" sx={{ color: colors.textPrimary, fontWeight: 700, fontSize: 18 }}>
          Details for {crq.crqNo}
        </Typography>
      </Stack>

      <MaterialReactTable table={table} />
    </Box>
  );
};