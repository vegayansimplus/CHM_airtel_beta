import { Card, CardContent, Typography, Box, Divider } from "@mui/material";
import type { ReactNode } from "react";

interface SectionCardProps {
  title: string;
  action?: ReactNode;
  children: ReactNode;

  // layout control
  height?: number | string;
  scrollable?: boolean;

  // optional enhancements
  footer?: ReactNode;
  headerDivider?: boolean;
}

const SectionCard = ({
  title,
  action,
  children,
  height = "auto",
  scrollable = false,
  footer,
  headerDivider = false,
}: SectionCardProps) => {
  return (
    <Card
      elevation={1}
      sx={{
        borderRadius: 3,
        height,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* HEADER */}
      <Box
        px={2}
        py={1.5}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <Typography variant="subtitle1" fontWeight={600}>
          {title}
        </Typography>
        {action}
      </Box>

      {headerDivider && <Divider />}

      {/* CONTENT */}
      <CardContent
        sx={{
          flex: 1,
          overflow: scrollable ? "auto" : "visible",
          pt: 1,
        }}
      >
        {children}
      </CardContent>

      {/* FOOTER */}
      {footer && (
        <>
          <Divider />
          <Box px={2} py={1}>
            {footer}
          </Box>
        </>
      )}
    </Card>
  );
};

export default SectionCard;

// import { Card, CardContent, Typography, Box } from "@mui/material";
// import type { ReactNode } from "react";

// interface Props {
//   title: string;
//   action?: ReactNode;
//   children: ReactNode;
// }

// const SectionCard = ({ title, action, children }: Props) => {
//   return (
//     <Card  sx={{ borderRadius: 3 , maxHeight: "250px", overflow: "auto"}}>
//       <CardContent>
//         <Box
//           display="flex"
//           justifyContent="space-between"
//           alignItems="center"
//           mb={1}
//         >
//           <Typography fontWeight={600}>{title}</Typography>
//           {action}
//         </Box>
//         {children}
//       </CardContent>
//     </Card>
//   );
// };

// export default SectionCard;
