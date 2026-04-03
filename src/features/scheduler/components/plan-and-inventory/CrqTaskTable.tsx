import React, { useMemo } from 'react';
import { MaterialReactTable, useMaterialReactTable, type MRT_ColumnDef } from 'material-react-table';
import type { Task } from '../../types/crqWorkflow.types';

interface CrqTaskTableProps {
  tasks: Task[];
  colors: any;
}

const CrqTaskTable: React.FC<CrqTaskTableProps> = ({ tasks, colors }) => {
  const columns = useMemo<MRT_ColumnDef<Task>[]>(() => [
    { accessorKey: "taskId", header: "Task ID", size: 250 },
    { accessorKey: "neLabel", header: "NE Label", size: 200 },
    { accessorKey: "planActivityDetails", header: "Plan Activity details", size: 200 },
    { accessorKey: "activitySequence", header: "Activity Sequence", size: 180 },
    { accessorKey: "taskProfileType", header: "Task Profile Type", size: 220 },
    { accessorKey: "locationCodeM6", header: "Location Code", size: 150 },
    { accessorKey: "taskActivity", header: "Task Activity", size: 200 },
  ], []);

  const table = useMaterialReactTable({
    columns,
    data: tasks || [],
    enableTopToolbar: false,
    enableBottomToolbar: false,
    enablePagination: false,
    enableSorting: false,
    enableColumnActions: false,
    muiTablePaperProps: {
      elevation: 0,
      sx: {
        border: `1px solid ${colors.border}`,
        borderTop: 'none', // Border top handled by the blue header box in parent
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        borderRadius: colors.radius,
      }
    },
    muiTableHeadCellProps: {
      sx: {
        bgcolor: colors.surface,
        color: colors.textSecondary,
        fontWeight: 600,
        fontSize: '0.75rem',
        borderBottom: `1px solid ${colors.borderHover}`,
      }
    },
    muiTableBodyCellProps: {
      sx: {
        fontSize: '0.8125rem',
        color: colors.textPrimary,
        borderBottom: `1px solid ${colors.borderHover}`,
        py: 1.5,
      }
    },
    initialState: { density: "compact" }
  });

  return <MaterialReactTable table={table} />;
};

export default CrqTaskTable;