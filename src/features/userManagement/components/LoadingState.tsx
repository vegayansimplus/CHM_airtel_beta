import { Box } from "@mui/material";
import { StatsSkeleton, TableSkeleton } from "../../../components/loading/Skeletons";

export { StatsSkeleton, TableSkeleton };

export default function LoadingState() {
  return (
    <Box>
      <StatsSkeleton />
      <TableSkeleton />
    </Box>
  );
}
