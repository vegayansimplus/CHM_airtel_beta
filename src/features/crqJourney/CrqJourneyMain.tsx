import { Box } from "@mui/material";
import { CrqDetailsPage } from "./pages/CrqDetailsPage";

// Renders at /scheduler/crqjourney. Deliberately a different visualization
// from /cabmanager/journey's CrqJourneyPage (horizontal pipeline canvas) —
// this is an info-card + vertical audit-trail timeline built from
// get_crq_details, which carries assignment/performer/timestamp detail the
// CAB pipeline view doesn't need.
export const CrqJourneyMain = () => (
  <Box>
    <CrqDetailsPage />
  </Box>
);
