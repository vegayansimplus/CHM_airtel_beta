import { Box, Stack, TableCell, TableRow, Typography } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import FilterSvg from "../../../../assets/svg/RosterEmpty.svg";

/** Full-width error row shown when the roster query fails. */
export const RosterErrorRow = ({
  colSpan,
  message,
}: {
  colSpan: number;
  message: string;
}) => (
  <TableRow>
    <TableCell colSpan={colSpan} align="center" sx={{ py: 8 }}>
      <Stack alignItems="center" spacing={1}>
        <ErrorOutlineIcon color="error" sx={{ fontSize: 40 }} />
        <Typography variant="h6" color="error">
          {message}
        </Typography>
      </Stack>
    </TableCell>
  </TableRow>
);

/** Full-width informational row (no data / no filter matches). */
export const RosterEmptyRow = ({
  colSpan,
  message,
}: {
  colSpan: number;
  message: string;
}) => (
  <TableRow>
    <TableCell colSpan={colSpan} align="center" sx={{ py: 8 }}>
      <Typography color="text.secondary">{message}</Typography>
    </TableCell>
  </TableRow>
);

/** Placeholder shown until a sub-domain filter is selected. */
export const SelectFilterPlaceholder = () => (
  <Box
    sx={{
      width: "100%",
      minHeight: "calc(100vh - 220px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
    }}
  >
    <img src={FilterSvg} alt="Select Filter" width={650} />
  </Box>
);
