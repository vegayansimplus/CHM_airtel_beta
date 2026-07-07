import { type ReactNode } from "react";
import {
  Box,
  CircularProgress,
  Paper,
  Table,
  TableContainer,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import SmartScrollContainer from "../../../../components/common/SmartScrollContainer";

interface Props {
  /** Scroll viewport height passed to SmartScrollContainer. */
  height: number;
  /** Semi-transparent spinner overlay (used while refetching). */
  loading?: boolean;
  /** Extra sx merged onto the <Table> (e.g. tableLayout overrides). */
  tableSx?: Record<string, unknown>;
  children: ReactNode;
}

/**
 * Shared scrollable table shell for the Weekly and Monthly roster grids:
 * rounded Paper container + horizontal/vertical smart scrolling + a
 * sticky-header table with collapsed borders.
 */
export const RosterTableFrame = ({
  height,
  loading = false,
  tableSx,
  children,
}: Props) => {
  const theme = useTheme();

  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{
        borderRadius: "10px 10px 0 0",
        bgcolor: theme.palette.background.paper,
        position: "relative",
      }}
    >
      {loading && (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: alpha(theme.palette.background.paper, 0.75),
            zIndex: 50,
            borderRadius: "10px",
          }}
        >
          <CircularProgress size={30} />
        </Box>
      )}

      <SmartScrollContainer height={height} enableHorizontal>
        <Table
          stickyHeader
          size="small"
          sx={{
            tableLayout: "fixed",
            width: "100%",
            borderCollapse: "collapse",
            ...tableSx,
          }}
        >
          {children}
        </Table>
      </SmartScrollContainer>
    </TableContainer>
  );
};
