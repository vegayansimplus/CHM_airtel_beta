import React, { useMemo, useState } from "react";
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
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Stack,
  Avatar,
  Button,
  Select,
  MenuItem,
  Divider,
  FormControl,
  useTheme,
  Chip,
} from "@mui/material";

// Icons
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import FilterListIcon from "@mui/icons-material/FilterList";
// import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
// import RosterEmpty from "../../../src/assets/svg/rosterEmpty.svg"
import RosterEmpty from "../../../assets/svg/rosterEmpty.svg";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import { useGetRosterViewQuery } from "../api/rosterApiSlice";
import SmartScrollContainer from "../../../components/common/SmartScrollContainer";
import { CompactShiftCountBar } from "../components/RosterShiftCountBar";
// import { CurrentShiftCountBar } from "../components/RosterShiftCountBar";

dayjs.extend(isoWeek);

/* ================= TYPES ================= */

interface Props {
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

/* ================= HELPER FUNCTIONS ================= */

const getShiftStyles = (shiftDisplay: string | null) => {
  if (!shiftDisplay || shiftDisplay === "WO") {
    return {
      bgcolor: "transparent",
      borderColor: "transparent",
      color: "#9e9e9e",
    };
  }
  if (shiftDisplay.includes("LEAVE")) {
    return { bgcolor: "#FFEBEE", borderColor: "#EF5350", color: "#C62828" };
  }

  const firstChar = shiftDisplay.charAt(0).toUpperCase();
  switch (firstChar) {
    case "M":
      return { bgcolor: "#E3F2FD", borderColor: "#42A5F5", color: "#1565C0" };
    case "A":
      return { bgcolor: "#F3E5F5", borderColor: "#AB47BC", color: "#6A1B9A" };
    case "B":
      return { bgcolor: "#E0F2F1", borderColor: "#26A69A", color: "#00695C" };
    case "N":
      return { bgcolor: "#FFF3E0", borderColor: "#FFA726", color: "#EF6C00" };
    default:
      return { bgcolor: "#F5F5F5", borderColor: "#BDBDBD", color: "#616161" };
  }
};

const parseShiftData = (displayString: string) => {
  if (!displayString) return { time: "-", label: "" };
  if (displayString === "WO") return { time: "Week Off", label: "" };
  if (displayString === "LEAVE") return { time: "Leave", label: "" };

  const match = displayString.match(/\(([^)]+)\)/);
  if (match) {
    return { time: match[1], label: displayString.split(" ")[0] };
  }
  return { time: displayString, label: "" };
};

const getInitials = (name: string) =>
  name?.substring(0, 2).toUpperCase() || "??";

/* ================= COMPONENT ================= */

export const WeeklyRosterMain = ({ domainId, subDomainId }: Props) => {
  const theme = useTheme();

  /* ================= STATE ================= */
  const [weekStart, setWeekStart] = useState(dayjs().startOf("isoWeek"));
  const weekEnd = weekStart.endOf("isoWeek");
  const startDate = weekStart.format("YYYY-MM-DD");
  const endDate = weekEnd.format("YYYY-MM-DD");

  /* ================= FETCH ================= */
  const shouldSkip = !domainId || !subDomainId;
  const { data, isLoading, isError } = useGetRosterViewQuery(
    {
      domainId: domainId ?? 0,
      subDomainId: subDomainId ?? 0,
      startDate,
      endDate,
    },
    { skip: shouldSkip },
  );
  const users: UserRoster[] = data?.data ?? [];

  /* ================= MEMOS ================= */
  const weekDates = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) =>
      weekStart.add(i, "day").format("YYYY-MM-DD"),
    );
  }, [weekStart]);

  /* ================= HANDLERS ================= */
  const goNextWeek = () => setWeekStart((prev) => prev.add(1, "week"));
  const goPrevWeek = () => setWeekStart((prev) => prev.subtract(1, "week"));

  /* ================= RENDER ================= */

  if (shouldSkip)
    return (
      <Box
        sx={{
          height: "72vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          // bgcolor: "#F9FAFB",
          background:
            theme.palette.mode === "dark"
              ? "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))"
              : "linear-gradient(135deg, rgba(255,255,255,0.7), rgba(255,255,255,0.4))",
        }}
      >
        <Box
          component="img"
          src={RosterEmpty}
          alt="Select Domain Illustration"
          sx={{
            width: 420,
            maxWidth: "90%",
            // mb: 3,
            userSelect: "none",
            pointerEvents: "none",
          }}
        />

        <Typography variant="h6" fontWeight={600} gutterBottom>
          Select Domain & SubDomain
        </Typography>

        <Typography variant="body2" color="text.secondary">
          Choose filters above to weekly roster view.
        </Typography>
      </Box>
    );
  return (
    <Box
      sx={{
        bgcolor: "#F9FAFB",
        height: "72vh", // Force full viewport height
        display: "flex",
        flexDirection: "column",
        p: 0,
        overflow: "hidden",
      }}
    >
      {/* ===== HEADER TOOLBAR ===== */}
      <Paper
        elevation={0}
        sx={{
          mb: 1,
          p: 1,
          borderRadius: 2,
          border: "1px solid #E0E0E0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          bgcolor="#F3F4F6"
          borderRadius={6}
          px={1}
          py={0.5}
        >
          <CompactShiftCountBar
            domainId={domainId}
            subDomainId={subDomainId}
          />{" "}
        </Stack>

        {/* Center: Date Navigation */}
        <Stack
          direction="row"
          alignItems="center"
          bgcolor="#F3F4F6"
          borderRadius={6}
          px={1}
          py={0.5}
        >
          <IconButton size="small" onClick={goPrevWeek}>
            <NavigateBeforeIcon fontSize="small" />
          </IconButton>
          <Typography
            variant="body2"
            fontWeight={600}
            sx={{ mx: 2, minWidth: 130, textAlign: "center" }}
          >
            {dayjs(startDate).format("DD MMM")} -{" "}
            {dayjs(endDate).format("DD MMM")}
          </Typography>
          <IconButton size="small" onClick={goNextWeek}>
            <NavigateNextIcon fontSize="small" />
          </IconButton>
        </Stack>

        {/* Right: Actions */}
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            size="small"
            color="inherit"
            endIcon={<KeyboardArrowDownIcon />}
            sx={{
              textTransform: "none",
              borderColor: "#E0E0E0",
              whiteSpace: "nowrap",
            }}
          >
            Tools
          </Button>
          {/* <Button
            variant="contained"
            disableElevation
            size="small"
            sx={{
              textTransform: "none",
              bgcolor: "#7986CB",
              whiteSpace: "nowrap",
            }}
          >
            Publish
          </Button> */}
        </Stack>
      </Paper>

      {/* ===== RESPONSIVE TABLE CONTAINER ===== */}

      <TableContainer
        component={Paper}
        sx={{
          flex: 1,
          borderRadius: 2,
          boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
          border: "1px solid #E0E0E0",
          overflow: "auto", // Enables native scrolling
          maxHeight: "60vh",
        }}
      >
        <SmartScrollContainer height={400} enableHorizontal>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                {/* 
                  === STICKY CORNER (Top-Left) === 
                  Needs highest z-index to stay on top of both
                  header row and first column
              */}
                <TableCell
                  sx={{
                    width: 260,
                    pl: 3,
                    py: 2,
                    bgcolor: "#fff",
                    position: "sticky",
                    left: 0,
                    top: 0,
                    zIndex: 20, // Highest Priority
                    borderRight: "1px solid #F0F0F0",
                    borderBottom: "1px solid #F0F0F0",
                    boxShadow: "2px 2px 5px -2px rgba(0,0,0,0.05)", // Subtle shadow for depth
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <FilterListIcon fontSize="small" color="action" />
                    <Typography variant="subtitle2" color="text.secondary">
                      All Employees
                    </Typography>
                    <KeyboardArrowDownIcon fontSize="small" color="action" />
                  </Stack>
                </TableCell>

                {/* === STICKY HEADER ROW === */}
                {weekDates.map((date) => (
                  <TableCell
                    key={date}
                    align="center"
                    sx={{
                      bgcolor: "#fff",
                      borderLeft: "1px solid #F0F0F0",
                      borderBottom: "1px solid #F0F0F0",
                      minWidth: 160,
                      py: 1.5,
                      position: "sticky",
                      top: 0,
                      zIndex: 10, // Medium Priority
                    }}
                  >
                    <Typography
                      variant="caption"
                      display="block"
                      color="text.secondary"
                      sx={{ textTransform: "uppercase" }}
                    >
                      {dayjs(date).format("ddd")}
                    </Typography>
                    <Typography
                      variant="h6"
                      fontWeight={500}
                      sx={{ lineHeight: 1 }}
                    >
                      {dayjs(date).format("DD")}
                    </Typography>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {/* === USER ROWS === */}
              {users.map((user) => (
                <TableRow key={user.userId} hover>
                  {/* === STICKY FIRST COLUMN === */}
                  <TableCell
                    sx={{
                      pl: 3,
                      py: 2,
                      bgcolor: "#fff",
                      position: "sticky",
                      left: 0,
                      zIndex: 5, // Lower than corner, higher than data
                      borderRight: "1px solid #F0F0F0",
                      boxShadow: "2px 0 5px -2px rgba(0,0,0,0.05)",
                    }}
                  >
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar
                        sx={{
                          width: 36,
                          height: 36,
                          fontSize: 14,
                          bgcolor:
                            user.jobLevel === "L2" ? "#FFCCBC" : "#B2DFDB",
                          color: "#444",
                        }}
                      >
                        {getInitials(user.olmid)}
                      </Avatar>
                      <Box>
                        <Typography
                          variant="subtitle2"
                          fontWeight={700}
                          sx={{
                            color: "#3F51B5",
                            cursor: "pointer",
                            lineHeight: 1.2,
                          }}
                        >
                          {user.olmid}
                        </Typography>
                        <Typography
                          variant="caption"
                          display="block"
                          color="text.secondary"
                        >
                          {user.jobLevel}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.disabled"
                          sx={{ fontSize: "0.65rem" }}
                        >
                          {/* 42 h / $ 504.00 */}
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>

                  {/* === DATA CELLS === */}
                  {weekDates.map((date) => {
                    const shift = user.roster?.[date];
                    const styles = getShiftStyles(shift?.shiftDisplay);
                    const { time, label } = parseShiftData(
                      shift?.shiftDisplay || "",
                    );
                    const isOff =
                      !shift ||
                      shift.shiftDisplay === "WO" ||
                      !shift.shiftDisplay;

                    return (
                      <TableCell
                        key={date}
                        sx={{
                          borderLeft: "1px solid #F0F0F0",
                          p: 1,
                          verticalAlign: "top",
                          height: 90, // Fixed height for uniformity
                        }}
                      >
                        {!isOff ? (
                          <Tooltip
                            title={`Tasks: ${shift?.assignActCount ?? 0} | Avl: ${shift?.availableMins ?? 0}`}
                            arrow
                          >
                            <Box
                              sx={{
                                bgcolor: styles.bgcolor,
                                borderLeft: `4px solid ${styles.borderColor}`,
                                borderRadius: 1,
                                p: 1,
                                height: "100%",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                                cursor: "pointer",
                                transition: "all 0.2s",
                                "&:hover": {
                                  boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                                  filter: "brightness(0.98)",
                                },
                              }}
                            >
                              <Typography
                                variant="caption"
                                fontWeight={700}
                                sx={{
                                  color: "#444",
                                  display: "block",
                                  mb: 0.5,
                                }}
                              >
                                {time}
                              </Typography>
                              <Stack
                                direction="row"
                                alignItems="center"
                                justifyContent="space-between"
                              >
                                <Typography
                                  variant="caption"
                                  sx={{ color: styles.color, fontWeight: 500 }}
                                >
                                  {label || user.jobLevel}
                                </Typography>
                                {shift?.workMode === "WFH" && (
                                  <Chip
                                    label="WFH"
                                    size="small"
                                    sx={{ height: 16, fontSize: "0.6rem" }}
                                  />
                                )}
                              </Stack>
                            </Box>
                          </Tooltip>
                        ) : (
                          <Box
                            sx={{
                              height: "100%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              bgcolor:
                                shift?.shiftDisplay === "WO"
                                  ? "#FAFAFA"
                                  : "transparent",
                            }}
                          >
                            {shift?.shiftDisplay === "WO" && (
                              <Typography
                                variant="caption"
                                color="text.disabled"
                                fontWeight={500}
                                letterSpacing={1}
                              >
                                WO
                              </Typography>
                            )}
                          </Box>
                        )}
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
