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
import FilterListIcon from "@mui/icons-material/FilterList";
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

dayjs.extend(isoWeek);
// Define type for swap selection
interface SwapCell {
  userId: string;
  date: string;
  shiftId: number;
  jobLevel: string;
}

export const WeeklyRosterMain = ({ domainId, subDomainId }: any) => {
  const theme = useTheme();
  const [weekStart, setWeekStart] = useState(dayjs().startOf("isoWeek"));

  const [editDialogConfig, setEditDialogConfig] = useState<{
    isOpen: boolean;
    data: { shift: any; date: string; userId: string } | null;
  }>({
    isOpen: false,
    data: null,
  });

  const [infoDialogConfig, setInfoDialogConfig] = useState<{
    isOpen: boolean;
    data: { shift: any; date: string; user: any } | null;
  }>({
    isOpen: false,
    data: null,
  });

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
  }>({
    isOpen: false,
    data: null,
  });

  // --- SWAP STATE ---
  const [isSwapMode, setIsSwapMode] = useState(false);
  const [selectedSwapCells, setSelectedSwapCells] = useState<SwapCell[]>([]);
  const [isSwapping, setIsSwapping] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const weekEnd = weekStart.endOf("isoWeek");
  const startDate = weekStart.format("YYYY-MM-DD");
  const endDate = weekEnd.format("YYYY-MM-DD");

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

  const getShiftId = (shiftDisplay: string) => {
    const option = shiftOptions.find((opt) => opt.shiftRange === shiftDisplay);
    return option?.shiftId || 0;
  };

  const users = data?.data ?? [];

  const weekDates = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) =>
      weekStart.add(i, "day").format("YYYY-MM-DD"),
    );
  }, [weekStart]);

  const [changeShift, { isLoading: isChanging }] = useChangeShiftMutation();
  const [swapByManager] = useShiftSwapByManagerMutation();
  const [requestByMember] = useShiftSwapRequestByTeamMemberMutation();

  const { role,userId } = useAuth();

  // executor that picks the right endpoint(s) based on role
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
        // Identify which cell belongs to the logged-in user and which to the other user
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

      // show toast from API message if available
      if (resp && resp.message) {
        setToastMsg(resp.message);
        toast.success(resp.message);
      } 
      // else {
      //   toast.success("Shift swap completed successfully");
      //   setToastMsg("Shift swap completed successfully");
      // }
    } catch (err: any) {
      console.error("swap error", err);
      const errMsg = err?.data?.message || err?.message || "Shift swap failed";
      setToastMsg(errMsg);
      toast.error(errMsg);
      throw err; 
    } finally {
      setIsSwapping(false);
    }
  };
  // --- HANDLERS ---
  const handleOpenEdit = (shift: any, date: string, userId: string) => {
    setEditDialogConfig({
      isOpen: true,
      data: { shift, date, userId },
    });
  };

  const handleOpenInfo = (shift: any, date: string, user: any) => {
    setInfoDialogConfig({
      isOpen: true,
      data: { shift, date, user },
    });
  };

  const handleCloseEdit = () => {
    setEditDialogConfig({ isOpen: false, data: null });
  };

  const handleCloseInfo = () => {
    setInfoDialogConfig({ isOpen: false, data: null });
  };

  const handleCloseSwap = () => {
    setSwapDialogConfig({ isOpen: false, data: null });
  };

  // --- CELL CLICK LOGIC (Handles both Edit & Swap) ---
  const handleCellClick = (shift: any, date: string, user: any) => {
    if (!isSwapMode) {
      handleOpenEdit(shift, date, user.userId);
      return;
    }

    // 1. Validation: Only future dates
    const isFuture = dayjs(date).startOf("day").isAfter(dayjs().startOf("day"));
    if (!isFuture) {
      setToastMsg("Only future dates can be selected for a shift swap.");
      toast.warning("Only future dates can be selected for a shift swap.");
      return;
    }

    const alreadySelectedIndex = selectedSwapCells.findIndex(
      (c) => c.userId === user.userId && c.date === date,
    );

    // 2. Toggle Unselect
    if (alreadySelectedIndex >= 0) {
      setSelectedSwapCells((prev) =>
        prev.filter((_, i) => i !== alreadySelectedIndex),
      );
      return;
    }

    // 3. Validation: Max 2 cells
    if (selectedSwapCells.length >= 2) {
      setToastMsg("You can only select a maximum of two shifts to swap.");
      return;
    }

    // 4. Validation: Same Level check
    if (
      selectedSwapCells.length === 1 &&
      selectedSwapCells[0].jobLevel !== user.jobLevel
    ) {
      setToastMsg(
        "Shift swap is only allowed between employees of the same level.",
      );
      return;
    }

    // Select Cell
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

  // --- EXECUTE SWAP ---
  const handleApplySwap = async () => {
    if (selectedSwapCells.length !== 2) return;

    const [cell1, cell2] = selectedSwapCells;

    // Prepare data for dialog
    const swapData = {
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
    };

    setSwapDialogConfig({
      isOpen: true,
      data: swapData,
    });
  };

  // Standard Change Shift Logic (Dialog)
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
      const resp = await changeShift({
        affectedUserId: userId,
        shiftDate: date,
        newShiftId,
        newAssignActivity,
        newAvailableMinutes,
        reason,
      }).unwrap();
      handleCloseEdit();
      setToastMsg(resp.message || "Shift changed successfully");
      toast.success(resp.message || "Shift changed successfully");
    } catch (error: any) {
      console.error("Failed to change shift", error);
      const msg =
        error?.data?.message || error?.message || "Change shift failed";
      setToastMsg(msg);
      toast.error(msg);
    }
  };

  const hasError = data?.success === false || !!error;
  const errorMessage = "Roster not generated for selected range";

  if (shouldSkip) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        Please select Domain and SubDomain
      </Alert>
    );
  }

  return (
    <Box
      bgcolor={
        theme.palette.mode === "dark"
          ? theme.palette.background.default
          : "#F9FAFB"
      }
      height="80vh"
      position="relative"
    >
      <RosterToolbar
        startDate={startDate}
        endDate={endDate}
        goPrevWeek={() => setWeekStart((p) => p.subtract(1, "week"))}
        goNextWeek={() => setWeekStart((p) => p.add(1, "week"))}
        domainId={domainId}
        subDomainId={subDomainId}
        // Swap props
        isSwapMode={isSwapMode}
        onToggleSwapMode={() => {
          setIsSwapMode((p) => !p);
          setSelectedSwapCells([]);
        }}
        selectedSwapCount={selectedSwapCells.length}
        onApplySwap={handleApplySwap}
        isSwapping={isSwapping}
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
          refetch(); // Refresh data
        }}
      />

      {isSwapMode && (
        <Alert severity="warning" sx={{ mb: 1 }}>
          Swap Mode Active: Select two shifts of future dates and same level to
          swap. ({selectedSwapCells.length}/2 selected)
        </Alert>
      )}

      <TableContainer component={Paper}>
        <SmartScrollContainer height={450} enableHorizontal>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    width: 200,
                    bgcolor: theme.palette.background.paper,
                    position: "sticky",
                    left: 0,
                    zIndex: 20,
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <FilterListIcon fontSize="small" />
                    <Typography fontSize="0.75rem" fontWeight={600}>
                      Employees {!hasError && !isLoading && `(${users.length})`}
                    </Typography>
                  </Stack>
                </TableCell>
                {weekDates.map((date) => (
                  <TableCell key={date} align="center" size="small">
                    <Typography fontSize="0.75rem">
                      {dayjs(date).format("ddd")}
                    </Typography>
                    <Typography fontWeight={700} fontSize="0.75rem">
                      {dayjs(date).format("DD")}
                    </Typography>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

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
                      No roster available.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user: any) => (
                  <TableRow key={user.userId} hover>
                    <RosterEmployeeCell user={user} />

                    {weekDates.map((date) => {
                      const isSelectedForSwap = selectedSwapCells.some(
                        (c) => c.userId === user.userId && c.date === date,
                      );

                      return (
                        <RosterShiftCell
                          key={date}
                          shift={user.roster?.[date]}
                          shiftDate={date}
                          rowUserId={user.userId}
                          isSelectedForSwap={isSelectedForSwap}
                          isSwapMode={isSwapMode}
                          onEditClick={(shift) =>
                            handleCellClick(shift, date, user)
                          }
                          onInfoClick={(shift) =>
                            handleOpenInfo(shift, date, user)
                          }
                        />
                      );
                    })}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </SmartScrollContainer>
      </TableContainer>

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
      {/* Validations Snackbar */}
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
