import { TableCell, Stack, Avatar, Typography, Box } from "@mui/material";

const getInitials = (name: string) =>
  name?.substring(0, 2).toUpperCase() || "??";

export const RosterEmployeeCell = ({ user }: any) => {
  return (
    <TableCell
      sx={{
        position: "sticky",
        left: 0,
        bgcolor: "#fff",
      }}
    >
      <Stack direction="row" spacing={1}>
        <Avatar
          sx={{
            width: 28,
            height: 28,
            fontSize: 11,
          }}
        >
          {getInitials(user.olmid)}
        </Avatar>

        <Box>
          <Typography fontSize="0.75rem" fontWeight={700}>
            {user.olmid}
          </Typography>

          <Typography fontSize="0.65rem">{user.jobLevel}</Typography>
        </Box>
      </Stack>
    </TableCell>
  );
};