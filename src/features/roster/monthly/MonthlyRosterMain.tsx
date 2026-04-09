import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Switch,
  FormControlLabel,
  CircularProgress,
  Alert,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useMemo, useState } from "react";
import dayjs from "dayjs";
import { useGetRosterViewQuery } from "../api/rosterApiSlice";
import SmartScrollContainer from "../../../components/common/SmartScrollContainer";
import FilterSvg from "../../../assets/svg/RosterEmpty.svg";
/* ================= TYPES ================= */

interface Props {
  startDate: string;
  endDate: string;
  domainId?: number;
  subDomainId?: number;
}

interface Shift {
  assignActCount: number;
  availableMins: number;
  shiftDisplay: string;
  workMode: string | null;
}

interface UserRoster {
  userId: number;
  olmid: string;
  jobLevel: string;
  mobileNo: string;
  officeLocation: string;
  roster: Record<string, Shift>;
}

/* ================= SHIFT COLOR ================= */

const getShiftColor = (
  shift: string | null | undefined,
  mode: "light" | "dark",
) => {
  if (!shift) {
    return {
      bg: mode === "dark" ? alpha("#ffffff", 0.06) : "#f5f5f5",
      color: mode === "dark" ? "#aaa" : "#666",
    };
  }

  const code = shift.charAt(0);

  const map: Record<string, string> = {
    N: "#1a237e",
    A: "#fbc02d",
    B: "#ef6c00",
    M: "#1976d2",
    L: "#e53935",
    W: "#9e9e9e",
  };

  const base = map[code] ?? "#9e9e9e";

  return {
    bg: alpha(base, 0.18),
    color: base,
  };
};

/* ================= COMPONENT ================= */

export const MonthlyRosterMain = ({
  startDate,
  endDate,
  domainId,
  subDomainId,
}: Props) => {
  const theme = useTheme();
  const [detailedView, setDetailedView] = useState(false);

  // const shouldSkip =!domainId || !subDomainId || domainId === 0 || subDomainId === 0;
  const shouldSkip = !subDomainId || subDomainId === 0;
  const { data, isLoading, isError } = useGetRosterViewQuery(
    {
      domainId: domainId ?? 0,
      subDomainId: subDomainId ?? 0,
      startDate,
      endDate,
    },
    { skip: shouldSkip },
  );

  /* ===== Generate Dates ===== */

  const allDates = useMemo(() => {
    if (!startDate || !endDate) return [];

    const start = dayjs(startDate);
    const end = dayjs(endDate);

    const dates: string[] = [];
    let current = start;

    while (current.isBefore(end) || current.isSame(end, "day")) {
      dates.push(current.format("YYYY-MM-DD"));
      current = current.add(1, "day");
    }

    return dates;
  }, [startDate, endDate]);

  const users: UserRoster[] = data?.data ?? [];

  if (shouldSkip) {
    return (
      <Box
        sx={{
          width: "100%",
          minHeight: "calc(100vh - 220px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <img src={FilterSvg} alt="Select Filter" width={650} />
      </Box>
    );
  }

  // if (isLoading) {
  //   return (
  //     <Box textAlign="center" mt={4}>
  //       <CircularProgress />
  //     </Box>
  //   );
  // }

  if (isError || data?.success === false) {
    return (
      <Alert severity="error">Roster not generated for selected range</Alert>
    );
  }

  if (!users.length) {
    return (
      <Alert severity="info">No roster available for selected range</Alert>
    );
  }

  const getShiftLetter = (shift?: string | null) => {
    if (!shift) return "-";
    if (shift === "LEAVE") return "L";
    if (shift === "WO") return "W";
    return shift.charAt(0);
  };

  return (
    <Box>
      {/* ===== HEADER ===== */}

      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 2,
          borderRadius: 3,
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box display="flex" justifyContent="space-between">
          <Box>
            <Typography variant="h6" fontWeight={600}>
              Monthly Roster
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {startDate} → {endDate}
            </Typography>
          </Box>

          <FormControlLabel
            control={
              <Switch
                checked={detailedView}
                onChange={(e) => setDetailedView(e.target.checked)}
              />
            }
            label="Detailed View"
          />
        </Box>
      </Paper>

      {/* ===== TABLE ===== */}

      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          borderRadius: 3,
          border: `1px solid ${theme.palette.divider}`,
          background: theme.palette.background.paper,
        }}
      >
        <SmartScrollContainer height={420} enableHorizontal>
          <Table
            size="small"
            sx={{
              tableLayout: detailedView ? "auto" : "fixed",
              width: detailedView ? "max-content" : "100%",
              minWidth: detailedView ? 1400 : "100%",
            }}
          >
            {/* ===== HEADER ===== */}

            <TableHead>
              <TableRow>
                {/* Sticky Employee Header */}
                <TableCell
                  sx={{
                    width: 200,
                    minWidth: 200,
                    maxWidth: 200,
                    position: "sticky",
                    left: 0,
                    zIndex: 30,
                    background: theme.palette.background.paper,
                    borderRight: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  Employee
                </TableCell>

                {allDates.map((date) => (
                  <TableCell
                    key={date}
                    align="center"
                    sx={{
                      minWidth: detailedView ? 150 : undefined,
                      position: "sticky",
                      top: 0,
                      zIndex: 10,
                      background: theme.palette.background.paper,
                      borderBottom: `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    <Typography fontSize={11} fontWeight={600}>
                      {dayjs(date).format("DD")}
                    </Typography>
                    <Typography fontSize={9} color="text.secondary">
                      {dayjs(date).format("ddd")}
                    </Typography>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            {/* ===== BODY ===== */}

            <TableBody>
              {users.map((user) => (
                <TableRow key={user.userId} hover>
                  {/* Sticky Employee Column */}
                  <TableCell
                    sx={{
                      width: 200,
                      minWidth: 200,
                      maxWidth: 200,
                      position: "sticky",
                      left: 0,
                      zIndex: 30,
                      background: theme.palette.background.paper,
                      borderRight: `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    <Typography fontWeight={600} fontSize={13}>
                      {user.olmid}
                    </Typography>
                    <Typography fontSize={11} color="text.secondary">
                      {user.jobLevel}
                    </Typography>
                  </TableCell>

                  {allDates.map((date) => {
                    const shift = user.roster?.[date];
                    const color = getShiftColor(
                      shift?.shiftDisplay,
                      theme.palette.mode,
                    );

                    return (
                      <TableCell
                        key={date}
                        align="center"
                        sx={{
                          minWidth: detailedView ? 150 : undefined,
                        }}
                      >
                        <Box
                          sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: color.bg,
                            color: color.color,
                            borderRadius: 1,
                            px: 1,
                            fontWeight: 600,
                            fontSize: detailedView ? 12 : 11,
                            minHeight: detailedView ? 36 : 24,
                          }}
                        >
                          {detailedView
                            ? (shift?.shiftDisplay ?? "WO")
                            : getShiftLetter(shift?.shiftDisplay)}
                        </Box>
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </SmartScrollContainer>
      </TableContainer>
    </Box>
  );
};
