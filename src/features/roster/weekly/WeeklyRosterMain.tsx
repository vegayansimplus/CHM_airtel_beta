import { useMemo, useState } from "react";
import {
  Box,
  Table,
  TableHead,
  TableRow,
  TableBody,
  TableContainer,
  TableCell,
  Paper,
  Stack,
  Typography,
  Alert,
  Snackbar,
  useTheme,
} from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import {
  useGetRosterViewQuery,
  useChangeShiftMutation,
  useGetShiftDropdownQuery,
  useShiftSwapByManagerMutation,
  useShiftSwapRequestByTeamMemberMutation,
} from "../api/rosterApiSlice";
import SmartScrollContainer from "../../../components/common/SmartScrollContainer";
import { useAuth } from "../../auth/hooks/useAuth";
import { RosterToolbar } from "../components/RosterToolbar";
import { RosterEmployeeCell } from "../components/RosterEmployeeCell";
import { RosterShiftCell } from "../components/RosterShiftCell";
import { EditRosterDialog } from "../components/dialog/EditRosterDialog";
import { ShiftInfoDialog } from "../components/dialog/ShiftInfoDialog";
import { SwapRosterDialog } from "../components/dialog/SwapRosterDialog";
import { toast } from "react-toastify";
import FilterSvg from "../../../assets/svg/RosterEmpty.svg";
import { RosterShiftCellCompact } from "../components/Rostershiftcellcompact";
import { ShiftLegend } from "../components/ShiftLegend";

dayjs.extend(isoWeek);

/* ─── Types ─── */
interface SwapCell {
  userId: string;
  date: string;
  shiftId: number;
  jobLevel: string;
}

/* ─── Shift key resolver (mirrors MonthlyRosterMain) ────────────────────── */
function resolveShiftKey(shiftDisplay?: string | null): string {
  if (!shiftDisplay || shiftDisplay === "WO") return "W";
  const d = shiftDisplay.trim();
  if (d.toLowerCase() === "leave") return "L";
  if (d === "New Joinee") return "NJ";
  if (d === "Holiday") return "H";
  if (d === "Comp Off" || d === "CO") return "C";
  if (d.startsWith("LG")) return "LG";
  return d.charAt(0).toUpperCase();
}

/* ─── Component ─────────────────────────────────────────────────────────── */
export const WeeklyRosterMain = ({
  domainId,
  subDomainId,
  startDate,
  endDate,
}: any) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  /* ── View state ───────────────────────────────────────────────────── */
  const [isDetailed, setIsDetailed] = useState(true);

  /* ── Dialog state ─────────────────────────────────────────────────── */
  const [editDialogConfig, setEditDialogConfig] = useState<{
    isOpen: boolean;
    data: { shift: any; date: string; userId: string } | null;
  }>({ isOpen: false, data: null });

  const [infoDialogConfig, setInfoDialogConfig] = useState<{
    isOpen: boolean;
    data: { shift: any; date: string; user: any } | null;
  }>({ isOpen: false, data: null });

  const [swapDialogConfig, setSwapDialogConfig] = useState<{
    isOpen: boolean;
    data: {
      cell1: {
        userId: string;
        date: string;
        shiftId: number;
        shiftDisplay: string;
      };
      cell2: {
        userId: string;
        date: string;
        shiftId: number;
        shiftDisplay: string;
      };
    } | null;
  }>({ isOpen: false, data: null });

  /* ── Swap state ───────────────────────────────────────────────────── */
  const [isSwapMode, setIsSwapMode] = useState(false);
  const [selectedSwapCells, setSelectedSwapCells] = useState<SwapCell[]>([]);
  const [isSwapping, setIsSwapping] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  /* ── Search / filter / highlight state ───────────────────────────── */
  const [searchTerms, setSearchTerms] = useState<string[]>([]);
  const [filterShift, setFilterShift] = useState<string[]>([]);
  const [filterLevel, setFilterLevel] = useState<string[]>([]);
  const [highlightShift, setHighlightShift] = useState("");

  /* ── API ──────────────────────────────────────────────────────────── */
  const shouldSkip = !subDomainId || subDomainId === 0;

  const { data, error, isLoading, refetch } = useGetRosterViewQuery(
    {
      domainId: domainId ?? 0,
      subDomainId: subDomainId ?? 0,
      startDate,
      endDate,
    },
    { skip: shouldSkip },
  );

  const { data: shiftOptions = [] } = useGetShiftDropdownQuery(
    { subDomainId: subDomainId ?? 0 },
    { skip: !subDomainId },
  );

  /* ── Dates ────────────────────────────────────────────────────────── */
  const weekDates = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) =>
        dayjs(startDate).add(i, "day").format("YYYY-MM-DD"),
      ),
    [startDate],
  );

  /* ── Derived data ─────────────────────────────────────────────────── */
  const allUsers: any[] = data?.data ?? [];

  const jobLevels = useMemo(
    () =>
      Array.from(
        new Set(allUsers.map((u: any) => u.jobLevel as string)),
      ).sort(),
    [allUsers],
  );

  const users = useMemo(() => {
    return allUsers.filter((user: any) => {
      // Multi-search AND logic
      if (searchTerms.length > 0) {
        const haystack = JSON.stringify(user).toLowerCase();
        if (!searchTerms.every((t) => haystack.includes(t.toLowerCase())))
          return false;
      }
      // Level filter
      if (filterLevel.length && !filterLevel.includes(user.jobLevel))
        return false;
      // Shift filter — must have at least one matching shift in the week
      if (filterShift.length) {
        const hasMatch = weekDates.some((d) =>
          filterShift.includes(resolveShiftKey(user.roster?.[d]?.shiftDisplay)),
        );
        if (!hasMatch) return false;
      }
      return true;
    });
  }, [allUsers, searchTerms, filterLevel, filterShift, weekDates]);

  /* ── Mutations ────────────────────────────────────────────────────── */
  const [changeShift, { isLoading: isChanging }] = useChangeShiftMutation();
  const [swapByManager] = useShiftSwapByManagerMutation();
  const [requestByMember] = useShiftSwapRequestByTeamMemberMutation();

  const { role, userId } = useAuth();

  /* ── Helpers ──────────────────────────────────────────────────────── */
  const getShiftId = (shiftDisplay: string) => {
    const option = shiftOptions.find((opt) => opt.shiftRange === shiftDisplay);
    return option?.shiftId || 0;
  };

  /* ── Swap execute ─────────────────────────────────────────────────── */
  const executeSwap = async (
    cell1: {
      userId: string;
      date: string;
      shiftId: number;
      shiftDisplay: string;
    },
    cell2: {
      userId: string;
      date: string;
      shiftId: number;
      shiftDisplay: string;
    },
    reason: string,
  ): Promise<void> => {
    setToastMsg(null);
    setIsSwapping(true);
    try {
      let resp;
      if (
        [
          "SUPER_ADMIN",
          "DOMAIN_HEAD",
          "FUNCTION_HEAD",
          "SUB_DOMAIN_HEAD",
        ].includes(role as string)
      ) {
        resp = await swapByManager({
          affectedUserId1: cell1.userId,
          shiftDate1: cell1.date,
          affectedUserId2: cell2.userId,
          shiftDate2: cell2.date,
          shiftSwapReason: reason,
        }).unwrap();
      } else if (role === "TEAM_MEMBER") {
        const loggedInUserId = String(userId);
        const isCell1LoggedInUser = String(cell1.userId) === loggedInUserId;
        const loggedInUserCell = isCell1LoggedInUser ? cell1 : cell2;
        const otherUserCell = isCell1LoggedInUser ? cell2 : cell1;
        resp = await requestByMember({
          shiftDate1: loggedInUserCell.date,
          recipientUserId: otherUserCell.userId,
          shiftDate2: otherUserCell.date,
          shiftSwapReason: reason,
        }).unwrap();
      }
      if (resp?.message) {
        setToastMsg(resp.message);
        toast.success(resp.message);
      }
    } catch (err: any) {
      const errMsg = err?.data?.message || err?.message || "Shift swap failed";
      setToastMsg(errMsg);
      toast.error(errMsg);
      throw err;
    } finally {
      setIsSwapping(false);
    }
  };

  /* ── Dialog handlers ──────────────────────────────────────────────── */
  const handleOpenEdit = (shift: any, date: string, userId: string) =>
    setEditDialogConfig({ isOpen: true, data: { shift, date, userId } });

  const handleOpenInfo = (shift: any, date: string, user: any) =>
    setInfoDialogConfig({ isOpen: true, data: { shift, date, user } });

  const handleCloseEdit = () =>
    setEditDialogConfig({ isOpen: false, data: null });
  const handleCloseInfo = () =>
    setInfoDialogConfig({ isOpen: false, data: null });
  const handleCloseSwap = () =>
    setSwapDialogConfig({ isOpen: false, data: null });

  /* ── Cell click handler ───────────────────────────────────────────── */
  const handleCellClick = (shift: any, date: string, user: any) => {
    if (!isSwapMode) {
      handleOpenEdit(shift, date, user.userId);
      return;
    }
    const isFuture = dayjs(date).startOf("day").isAfter(dayjs().startOf("day"));
    if (!isFuture) {
      const msg = "Only future dates can be selected for a shift swap.";
      setToastMsg(msg);
      toast.warning(msg);
      return;
    }
    const alreadySelectedIndex = selectedSwapCells.findIndex(
      (c) => c.userId === user.userId && c.date === date,
    );
    if (alreadySelectedIndex >= 0) {
      setSelectedSwapCells((prev) =>
        prev.filter((_, i) => i !== alreadySelectedIndex),
      );
      return;
    }
    if (selectedSwapCells.length >= 2) {
      setToastMsg("You can only select a maximum of two shifts to swap.");
      return;
    }
    if (
      selectedSwapCells.length === 1 &&
      selectedSwapCells[0].jobLevel !== user.jobLevel
    ) {
      setToastMsg(
        "Shift swap is only allowed between employees of the same level.",
      );
      return;
    }
    setSelectedSwapCells((prev) => [
      ...prev,
      {
        userId: user.userId,
        date,
        shiftId: getShiftId(shift?.shiftDisplay || ""),
        jobLevel: user.jobLevel,
      },
    ]);
  };

  /* ── Apply swap ───────────────────────────────────────────────────── */
  const handleApplySwap = async () => {
    if (selectedSwapCells.length !== 2) return;
    const [cell1, cell2] = selectedSwapCells;
    setSwapDialogConfig({
      isOpen: true,
      data: {
        cell1: {
          userId: cell1.userId,
          date: cell1.date,
          shiftId: cell1.shiftId,
          shiftDisplay:
            shiftOptions.find((opt) => opt.shiftId === cell1.shiftId)
              ?.shiftRange || "Unknown",
        },
        cell2: {
          userId: cell2.userId,
          date: cell2.date,
          shiftId: cell2.shiftId,
          shiftDisplay:
            shiftOptions.find((opt) => opt.shiftId === cell2.shiftId)
              ?.shiftRange || "Unknown",
        },
      },
    });
  };

  /* ── Save shift ───────────────────────────────────────────────────── */
const handleSaveShift = async (
  userId: string,
  date: string,
  newShiftId: number,
  newAssignActivity: number,
  newAvailableMinutes: number,
  reason: string,
) => {
  setToastMsg(null);

  try {
    const response = await changeShift({
      affectedUserId: Number(userId),
      shiftDate: date, // YYYY-MM-DD
      newShiftId: Number(newShiftId),
      newAssignActivity: Number(newAssignActivity),
      newAvailableMinutes: Number(newAvailableMinutes),
      reason: reason.trim(),
    }).unwrap();

    handleCloseEdit();

    const successMessage =
      response?.message || "Shift changed successfully";

    setToastMsg(successMessage);
    toast.success(successMessage);
  } catch (error: any) {
    console.error("Change Shift Error:", error);

    const errorMessage =
      error?.data?.message ||
      error?.message ||
      "Shift change failed";

    setToastMsg(errorMessage);
    toast.error(errorMessage);
  }
};

  // const handleSaveShift = async (
  //   userId: string,
  //   date: string,
  //   newShiftId: number,
  //   newAssignActivity: number,
  //   newAvailableMinutes: number,
  //   reason: string,
  // ) => {
  //   setToastMsg(null);
  //   try {
  //     const resp = await changeShift({
  //       affectedUserId: userId,
  //       shiftDate: date,
  //       newShiftId,
  //       newAssignActivity,
  //       newAvailableMinutes,
  //       reason,
  //     }).unwrap();
  //     handleCloseEdit();
  //     setToastMsg(resp.message || "Shift changed successfully");
  //     toast.success(resp.message || "Shift changed successfully");
  //   } catch (error: any) {
  //     const msg =
  //       error?.data?.message || error?.message || "Change shift failed";
  //     setToastMsg(msg);
  //     toast.error(msg);
  //   }
  // };

  const hasError = data?.success === false || !!error;
  const errorMessage = "Roster not generated for selected range";

  /* ── Guard ────────────────────────────────────────────────────────── */
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

  /* ── Shared column header cell sx ─────────────────────────────────── */
  const headDateCellSx = (date: string) => {
    const isToday = dayjs(date).isSame(dayjs(), "day");
    return {
      textAlign: "center" as const,
      px: isDetailed ? "6px" : "4px",
      py: "8px",
      minWidth: isDetailed ? 130 : 56,
      width: isDetailed ? 130 : 56,
      bgcolor: theme.palette.background.paper,
      borderBottom: isToday ? `2px solid #2563EB` : undefined,
    };
  };

  /* ── Render ───────────────────────────────────────────────────────── */
  return (
    <Box
      bgcolor={isDark ? theme.palette.background.default : "#F9FAFB"}
      height="80vh"
      position="relative"
    >
      {/* Toolbar */}
      <RosterToolbar
        startDate={startDate}
        endDate={endDate}
        domainId={domainId}
        subDomainId={subDomainId}
        isSwapMode={isSwapMode}
        onToggleSwapMode={() => {
          setIsSwapMode((p) => !p);
          setSelectedSwapCells([]);
        }}
        selectedSwapCount={selectedSwapCells.length}
        onApplySwap={handleApplySwap}
        isSwapping={isSwapping}
        searchTerms={searchTerms}
        onSearchChange={setSearchTerms}
        isDetailed={isDetailed}
        onToggleDetailed={() => setIsDetailed((p) => !p)}
        filterShift={filterShift}
        onFilterShiftChange={setFilterShift}
        filterLevel={filterLevel}
        onFilterLevelChange={setFilterLevel}
        jobLevels={jobLevels}
        highlightShift={highlightShift}
        onHighlightShiftChange={setHighlightShift}
      />

      <SwapRosterDialog
        open={swapDialogConfig.isOpen}
        onClose={handleCloseSwap}
        swapData={swapDialogConfig.data}
        onConfirm={executeSwap}
        onSwapSuccess={() => {
          setToastMsg("Shifts swapped successfully!");
          setIsSwapMode(false);
          setSelectedSwapCells([]);
          refetch();
        }}
      />

      {isSwapMode && (
        <Alert severity="warning" sx={{ mb: 1 }}>
          Swap Mode Active: Select two shifts of future dates and same level to
          swap. ({selectedSwapCells.length}/2 selected)
        </Alert>
      )}

      {/* Table */}
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{ borderRadius: "10px 10px 0 0" }}
      >
        <SmartScrollContainer height={450} enableHorizontal>
          <Table
            stickyHeader
            size="small"
            sx={{
              tableLayout: "fixed",
              width: "100%",
              borderCollapse: "collapse",
            }}
          >
            {/* ── Head ─────────────────────────────────────────────── */}
            <TableHead>
              <TableRow>
                {/* Employee column — sticky */}
                <TableCell
                  sx={{
                    width: 160, 
                    minWidth: 160, 
                    maxWidth: 160, 
                    position: "sticky",
                    left: 0,
                    zIndex: 20,
                    bgcolor: theme.palette.background.paper,
                    borderBottom: `1px solid ${isDark ? "rgba(255,255,255,.06)" : "#F0F0F2"}`,
                    py: "10px",
                    px: "8px", // ← was 12px, reduced to reclaim space
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography fontSize="0.75rem" fontWeight={600}>
                      Employees {!hasError && !isLoading && `(${users.length})`}
                    </Typography>
                  </Stack>
                </TableCell>

                {/* Day columns */}
                {weekDates.map((date) => {
                  const isToday = dayjs(date).isSame(dayjs(), "day");
                  return (
                    <TableCell key={date} sx={headDateCellSx(date)}>
                      <Typography
                        fontSize="0.7rem"
                        color={isToday ? "#2563EB" : "text.secondary"}
                        lineHeight={1.2}
                      >
                        {dayjs(date).format("ddd")}
                      </Typography>
                      <Typography
                        fontWeight={700}
                        fontSize="0.9rem"
                        color={isToday ? "#2563EB" : "text.primary"}
                        lineHeight={1.2}
                      >
                        {dayjs(date).format("DD")}
                      </Typography>
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableHead>

            {/* ── Body ─────────────────────────────────────────────── */}
            <TableBody>
              {hasError ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 8 }}>
                    <Stack alignItems="center" spacing={1}>
                      <ErrorOutlineIcon color="error" sx={{ fontSize: 40 }} />
                      <Typography variant="h6" color="error">
                        {errorMessage}
                      </Typography>
                    </Stack>
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                    <Typography color="text.secondary">
                      {allUsers.length > 0
                        ? "No employees match the current filters"
                        : "No roster available."}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user: any) => (
                  <TableRow
                    key={user.userId}
                    hover
                    sx={{
                      "&:last-child td": { borderBottom: "none" },
                    }}
                  >
                    <RosterEmployeeCell user={user} />

                    {weekDates.map((date) => {
                      const isSelectedForSwap = selectedSwapCells.some(
                        (c) => c.userId === user.userId && c.date === date,
                      );

                      return isDetailed ? (
                        <RosterShiftCell
                          key={date}
                          shift={user.roster?.[date]}
                          shiftDate={date}
                          rowUserId={user.userId}
                          isSelectedForSwap={isSelectedForSwap}
                          isSwapMode={isSwapMode}
                          highlightShift={highlightShift}
                          onEditClick={(shift) =>
                            handleCellClick(shift, date, user)
                          }
                          onInfoClick={(shift) =>
                            handleOpenInfo(shift, date, user)
                          }
                        />
                      ) : (
                        <RosterShiftCellCompact
                          key={date}
                          shift={user.roster?.[date]}
                          shiftDate={date}
                          rowUserId={user.userId}
                          isSelectedForSwap={isSelectedForSwap}
                          isSwapMode={isSwapMode}
                          highlightShift={highlightShift}
                          onEditClick={(shift) =>
                            handleCellClick(shift, date, user)
                          }
                        />
                      );
                    })}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <ShiftLegend
            visibleCodes={["G", "LG", "B", "N", "A", "L", "H", "C", "W"]}
          />
        </SmartScrollContainer>
      </TableContainer>

      {/* Dialogs */}
      <EditRosterDialog
        open={editDialogConfig.isOpen}
        onClose={handleCloseEdit}
        editData={editDialogConfig.data}
        onSave={handleSaveShift}
        saving={isChanging}
        shiftOptions={shiftOptions}
      />
      <ShiftInfoDialog
        open={infoDialogConfig.isOpen}
        onClose={handleCloseInfo}
        data={infoDialogConfig.data}
      />
      <Snackbar
        open={!!toastMsg}
        autoHideDuration={4000}
        onClose={() => setToastMsg(null)}
        message={toastMsg}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </Box>
  );
};
