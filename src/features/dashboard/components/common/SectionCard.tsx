import { Card, CardContent, Typography, Box } from "@mui/material";
import type { ReactNode } from "react";
// import { ReactNode } from "react";

interface Props {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}

const SectionCard = ({ title, action, children }: Props) => {
  return (
    <Card elevation={1} sx={{ borderRadius: 3 , maxHeight: "250px", overflow: "auto"}}>
      <CardContent>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={1}
        >
          <Typography fontWeight={600}>{title}</Typography>
          {action}
        </Box>
        {children}
      </CardContent>
    </Card>
  );
};

export default SectionCard;
