import { Box } from "@mui/material";
import { StatsSkeleton, TableSkeleton } from "../../../components/loading/Skeletons";

export { StatsSkeleton, TableSkeleton };

export default function LoadingState() {
  // Fills the page's flex column so the first paint occupies the same height
  // the loaded view will, instead of a short box floating on the shell.
  return (
    <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
      <StatsSkeleton />
      <TableSkeleton />
    </Box>
  );
}
