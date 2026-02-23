import {
  Box,
  IconButton,
  Typography,
  Stack,
} from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { useRef } from "react";
// import SectionCard from "../../../components/common/SectionCard";
import HolidayHorizontalItem from "./HolidayHorizontalItem";
import { upcomingHolidays } from "../../orgHierarchy/api/holiday.mock";
import SectionCard from "./common/SectionCard";
// import { upcomingHolidays } from "../api/holiday.mock";

const UpcomingHolidayCard = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const sorted = [...upcomingHolidays].sort(
    (a, b) =>
      new Date(a.date).getTime() -
      new Date(b.date).getTime()
  );

  const nextHoliday = sorted[0];

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;

    const scrollAmount = 260;

    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <SectionCard
      title="Upcoming Holidays"
      action={
        <Typography
          variant="caption"
          sx={{ cursor: "pointer", fontWeight: 600 }}
        >
          View All →
        </Typography>
      }
    >
      <Stack direction="row" alignItems="center" spacing={1} mb={2}>
        <IconButton size="small" onClick={() => scroll("left")}>
          <ArrowBackIosNewIcon fontSize="small" />
        </IconButton>

        <Box
          ref={scrollRef}
          sx={{
            display: "flex",
            gap: 1,
            overflowX: "auto",
            scrollSnapType: "x mandatory",
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": { display: "none" },
          }}
        >
          {sorted.map((holiday) => (
            <HolidayHorizontalItem
              key={holiday.id}
              holiday={holiday}
              isNext={holiday.id === nextHoliday.id}
            />
          ))}
        </Box>

        <IconButton size="small" onClick={() => scroll("right")}>
          <ArrowForwardIosIcon fontSize="small" />
        </IconButton>
      </Stack>
    </SectionCard>
  );
};

export default UpcomingHolidayCard;


// import {
//   Box,
//   Stack,
//   Typography,
//   Divider,
//   Button,
// } from "@mui/material";
// // import SectionCard from "../../../components/common/SectionCard";
// import HolidayItem from "./HolidayItem";
// import { upcomingHolidays } from "../../orgHierarchy/api/holiday.mock";
// import SectionCard from "./common/SectionCard";
// // import { upcomingHolidays } from "../api/holiday.mock";

// const UpcomingHolidayCard = () => {
//   const sorted = [...upcomingHolidays].sort(
//     (a, b) =>
//       new Date(a.date).getTime() -
//       new Date(b.date).getTime()
//   );

//   const nextHoliday = sorted[0];

//   return (
//     <SectionCard
//       title="Upcoming Holidays"
//       action={
//         <Button size="small">
//           View All
//         </Button>
//       }
//     >
//       <Stack spacing={2}>
//         {sorted.map((holiday, index) => (
//           <HolidayItem
//             key={holiday.id}
//             holiday={holiday}
//             isNext={holiday.id === nextHoliday.id}
//           />
//         ))}
//       </Stack>
//     </SectionCard>
//   );
// };

// export default UpcomingHolidayCard;
