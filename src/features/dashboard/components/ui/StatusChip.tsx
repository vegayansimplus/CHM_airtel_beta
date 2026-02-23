import { Chip } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";

interface Props {
  label: string;
}

const StatusChip = ({ label }: Props) => {
  const theme = useTheme();

  const colorMap: Record<string, string> = {
    Pending: theme.palette.warning.main,
    Tomorrow: theme.palette.info.main,
    Completed: theme.palette.success.main,
    Leave: theme.palette.error.main,
  };

  const color = colorMap[label] || theme.palette.grey[500];

  return (
    <Chip
      label={label}
      size="small"
      sx={{
        fontWeight: 600,
        backgroundColor: alpha(color, 0.12),
        color: color,
        borderRadius: 2,
      }}
    />
  );
};

export default StatusChip;


// import { Chip } from "@mui/material";

// interface Props {
//   label: string;
// }

// const StatusChip = ({ label }: Props) => {
//   const colorMap: Record<string, any> = {
//     Pending: "warning",
//     Tomorrow: "info",
//     Completed: "success",
//     Leave: "error",
//     WFO: "success",
//     WFH: "primary",
//   };

//   return <Chip label={label} color={colorMap[label] || "default"} size="small" />;
// };

// export default StatusChip;
