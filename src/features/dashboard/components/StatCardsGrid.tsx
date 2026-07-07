import { Box } from "@mui/material";
import type { Colors } from "../types/colorTypes";
import type { StatCardConfig } from "../types/dashboard.types";
import { fadeIn } from "../constants/dashboard.styles";
import { StatCard } from "./StatCard";

interface StatCardsGridProps {
  cards: readonly StatCardConfig[];
  colors: Colors;
  mounted: boolean;
  delay: number;
}

export function StatCardsGrid({ cards, colors, mounted, delay }: StatCardsGridProps) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gridAutoRows: "1fr",
        gap: "16px",
        height: "100%",
        ...fadeIn(mounted, delay),
      }}
    >
      {cards.map((card) => (
        <StatCard key={card.key} config={card} colors={colors} />
      ))}
    </Box>
  );
}
