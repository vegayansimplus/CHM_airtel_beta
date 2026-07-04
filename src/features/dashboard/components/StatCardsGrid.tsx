import { Grid } from "@mui/material";
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
    <Grid container spacing="10px" sx={{ ...fadeIn(mounted, delay) }}>
      {cards.map((card) => (
        <Grid key={card.key} size={{ xs: 6 }}>
          <StatCard config={card} colors={colors} />
        </Grid>
      ))}
    </Grid>
  );
}
