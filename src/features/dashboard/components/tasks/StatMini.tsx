import { alpha, Box, Card, Stack, Typography } from "@mui/material";

interface MiniStatProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

export const StatMini = ({ label, value, icon, color }: MiniStatProps) => {
  return (
    <Card
      sx={{
        flex: 1,
        p: 1.5,
        borderRadius: 2,
        // border: `1px solid ${alpha(color, 0.3)}`,
        background: alpha(color, 0.06),
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        <Box
          sx={{
            width: 26,
            height: 26,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: alpha(color, 0.15),
            color,
          }}
        >
          {icon}
        </Box>

        <Box>
          <Typography fontWeight={700}>
            {value}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
          >
            {label}
          </Typography>
        </Box>
      </Stack>
    </Card>
  );
};