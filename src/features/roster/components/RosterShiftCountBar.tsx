import { Box, Stack, Typography } from "@mui/material";
import { useGetCurrentShiftCountQuery } from "../api/rosterApiSlice";
import { getShiftCountColor } from "../utils/shiftCountColor";

interface Props {
  domainId?: number;
  subDomainId?: number;
}

export const CompactShiftCountBar = ({ domainId, subDomainId }: Props) => {

  const shouldSkip = !domainId || !subDomainId;

  const { data = [] } = useGetCurrentShiftCountQuery(
    { domainId: domainId ?? 0, subDomainId: subDomainId ?? 0 },
    { skip: shouldSkip }
  );

  return (
    <Box
      sx={{
        px: 0.5,
        py: 0.25,
        overflowX: "auto"
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        {data.map((item) => {

          const color = getShiftCountColor(item.shiftName);
          const count = Number(item.totalUsers);

          return (
            <Stack
              key={item.shiftName}
              direction="row"
              alignItems="center"
              spacing={0.5}
            >
              {/* Colored Pill */}
              <Box
                sx={{
                  height: 22,
                  px: 1,
                  borderRadius: 5,
                  bgcolor: color.bg,
                  color: color.text,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: 700,
                  lineHeight: 1
                }}
              >
                {item.shiftName === "TOTAL COUNT"
                  ? "Total"
                  : item.shiftName}
              </Box>

              {/* Count Outside */}
              <Typography
                sx={{
                  fontSize: 12,
                  fontWeight: 600,
                  minWidth: 14
                }}
              >
                {count}
              </Typography>
            </Stack>
          );
        })}
      </Stack>
    </Box>
  );
};