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
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";

import {
  useGetRosterViewQuery,
  useChangeShiftMutation,
} from "../api/rosterApiSlice";
import SmartScrollContainer from "../../../components/common/SmartScrollContainer";
import { RosterToolbar } from "../components/RosterToolbar";
import { RosterEmployeeCell } from "../components/RosterEmployeeCell";
import { RosterShiftCell } from "../components/RosterShiftCell";
import { EditRosterDialog } from "../components/dialog/EditRosterDialog";

dayjs.extend(isoWeek);
// Define type for swap selection
interface SwapCell {
  userId: string;
  date: string;
  shift: any;
  jobLevel: string;
}

export const WeeklyRosterMain = ({ domainId, subDomainId }: any) => {
  const [weekStart, setWeekStart] = useState(dayjs().startOf("isoWeek"));

  const [editDialogConfig, setEditDialogConfig] = useState<{
    isOpen: boolean;
    data: { shift: any; date: string; userId: string } | null;
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

  const users = data?.data ?? [];

  const weekDates = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) =>
      weekStart.add(i, "day").format("YYYY-MM-DD"),
    );
  }, [weekStart]);

  const [changeShift, { isLoading: isChanging }] = useChangeShiftMutation();

  // --- HANDLERS ---
  const handleOpenEdit = (shift: any, date: string, userId: string) => {
    setEditDialogConfig({
      isOpen: true,
      data: { shift, date, userId },
    });
  };

  const handleCloseEdit = () => {
    setEditDialogConfig({ isOpen: false, data: null });
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
      { userId: user.userId, date, shift, jobLevel: user.jobLevel },
    ]);
  };

  // --- EXECUTE SWAP ---
  const handleApplySwap = async () => {
    if (selectedSwapCells.length !== 2) return;
    setIsSwapping(true);

    const [cell1, cell2] = selectedSwapCells;

    try {
      // Execute both shift changes simultaneously
      await Promise.all([
        changeShift({
          affectedUserId: cell1.userId,
          shiftDate: cell1.date,
          newShiftRange: cell2.shift?.shiftRange || "", // Adjust based on your API's expected format
          newAssignActivity: 0,
          newAvailableMinutes: 0,
          newShiftId: 0,
          reason: "Shift Swap",
        }).unwrap(),
        changeShift({
          affectedUserId: cell2.userId,
          shiftDate: cell2.date,
          newShiftRange: cell1.shift?.shiftRange || "",
          newAssignActivity: 0,
          newAvailableMinutes: 0,
          newShiftId: 0,
          reason: "Shift Swap",
        }).unwrap(),
      ]);

      setToastMsg("Shifts swapped successfully!");
      setIsSwapMode(false);
      setSelectedSwapCells([]);
      refetch(); // Refresh data
    } catch (error) {
      console.error("Failed to swap shifts", error);
      setToastMsg("Failed to complete shift swap. Please try again.");
    } finally {
      setIsSwapping(false);
    }
  };

  // Standard Change Shift Logic (Dialog)
  const handleSaveShift = async (
    userId: string,
    date: string,
    newShiftValue: string,
    reason: string,
  ) => {
    try {
      await changeShift({
        affectedUserId: userId,
        shiftDate: date,
        newShiftRange: newShiftValue,
        newAssignActivity: 0,
        newAvailableMinutes: 0,
        newShiftId: 0,
        reason,
      }).unwrap();
      handleCloseEdit();
    } catch (error) {
      console.error("Failed to change shift", error);
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
    <Box bgcolor="#F9FAFB" height="80vh" position="relative">
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

      {isSwapMode && (
        <Alert severity="warning" sx={{ mb: 1 }}>
          Swap Mode Active: Select two shifts of future dates and same level to
          swap. ({selectedSwapCells.length}/2 selected)
        </Alert>
      )}

      <TableContainer component={Paper}>
        <SmartScrollContainer height={480} enableHorizontal>
          <Table stickyHeader size="small">
            {/* TableHead code remains the same... */}
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    width: 200,
                    bgcolor: "#fff",
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
                  <TableCell key={date} align="center">
                    <Typography variant="caption">
                      {dayjs(date).format("ddd")}
                    </Typography>
                    <Typography fontWeight={700}>
                      {dayjs(date).format("DD")}
                    </Typography>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {hasError ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
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

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// import { useMemo, useState } from "react";
// import {
//   Box,
//   Table,
//   TableHead,
//   TableRow,
//   TableBody,
//   TableContainer,
//   TableCell,
//   Paper,
//   Stack,
//   Typography,
//   CircularProgress,
//   Alert,
// } from "@mui/material";
// import FilterListIcon from "@mui/icons-material/FilterList";
// import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
// import dayjs from "dayjs";
// import isoWeek from "dayjs/plugin/isoWeek";

// import {
//   useGetRosterViewQuery,
//   useChangeShiftMutation,
// } from "../api/rosterApiSlice";
// import SmartScrollContainer from "../../../components/common/SmartScrollContainer";
// import { RosterToolbar } from "../components/RosterToolbar";
// import { RosterEmployeeCell } from "../components/RosterEmployeeCell";
// import { RosterShiftCell } from "../components/RosterShiftCell";
// import { EditRosterDialog } from "../components/dialog/EditRosterDialog";

// dayjs.extend(isoWeek);

// export const WeeklyRosterMain = ({ domainId, subDomainId }: any) => {
//   const [weekStart, setWeekStart] = useState(dayjs().startOf("isoWeek"));

//   const [editDialogConfig, setEditDialogConfig] = useState<{
//     isOpen: boolean;
//     data: { shift: any; date: string; userId: string } | null;
//   }>({
//     isOpen: false,
//     data: null,
//   });

//   const weekEnd = weekStart.endOf("isoWeek");
//   const startDate = weekStart.format("YYYY-MM-DD");
//   const endDate = weekEnd.format("YYYY-MM-DD");

//   const shouldSkip = !subDomainId || subDomainId === 0;

//   const { data, error, isLoading, isFetching } = useGetRosterViewQuery(
//     {
//       domainId: domainId ?? 0,
//       subDomainId: subDomainId ?? 0,
//       startDate,
//       endDate,
//     },
//     { skip: shouldSkip },
//   );

//   const users = data?.data ?? [];

//   const weekDates = useMemo(() => {
//     return Array.from({ length: 7 }, (_, i) =>
//       weekStart.add(i, "day").format("YYYY-MM-DD"),
//     );
//   }, [weekStart]);

//   // --- HANDLERS ---
//   const handleOpenEdit = (shift: any, date: string, userId: string) => {
//     setEditDialogConfig({
//       isOpen: true,
//       data: { shift, date, userId },
//     });
//   };

//   const handleCloseEdit = () => {
//     setEditDialogConfig({ isOpen: false, data: null });
//   };

//   // mutation hook for change API
//   const [changeShift, { isLoading: isChanging }] = useChangeShiftMutation();

//   const handleSaveShift = async (
//     userId: string,
//     date: string,
//     newShiftValue: string,
//     reason: string,
//   ) => {
//     try {
//       const params = {
//         affectedUserId: userId,
//         shiftDate: date,
//         newShiftRange: newShiftValue,
//         newAssignActivity: 0,
//         newAvailableMinutes: 0,
//         newShiftId: 0,
//         reason,
//       };

//       await changeShift(params).unwrap();
//       handleCloseEdit();
//     } catch (error) {
//       console.error("Failed to change shift", error);
//     }
//   };

//   const isApiCustomError = data?.success === false;
//   const apiCustomErrorMessage = (data as any)?.message;

//   const isHttpError = !!error;
//   const httpErrorMessage =
//     error && "data" in error ? (error as any).data?.message : null;

//   const hasError = isApiCustomError || isHttpError;
//   const errorMessage =
//     apiCustomErrorMessage ||
//     httpErrorMessage ||
//     "Roster not generated for selected range";

//   // Early return if no domain is selected yet
//   if (shouldSkip) {
//     return (
//       <Alert severity="info" sx={{ mt: 2 }}>
//         Please select Domain and SubDomain
//       </Alert>
//     );
//   }

//   return (
//     <Box bgcolor="#F9FAFB" height="80vh">
//       <RosterToolbar
//         startDate={startDate}
//         endDate={endDate}
//         goPrevWeek={() => setWeekStart((p) => p.subtract(1, "week"))}
//         goNextWeek={() => setWeekStart((p) => p.add(1, "week"))}
//         domainId={domainId}
//         subDomainId={subDomainId}
//       />

//       <TableContainer component={Paper}>
//         <SmartScrollContainer height={480} enableHorizontal>
//           <Table stickyHeader size="small">
//             <TableHead>
//               <TableRow>
//                 <TableCell
//                   sx={{
//                     width: 200,
//                     bgcolor: "#fff",
//                     position: "sticky",
//                     left: 0,
//                     zIndex: 20,
//                   }}
//                 >
//                   <Stack direction="row" spacing={1} alignItems="center">
//                     <FilterListIcon fontSize="small" />
//                     <Typography fontSize="0.75rem" fontWeight={600}>
//                       Employees {!hasError && !isLoading && `(${users.length})`}
//                     </Typography>
//                   </Stack>
//                 </TableCell>

//                 {weekDates.map((date) => (
//                   <TableCell key={date} align="center">
//                     <Typography variant="caption">
//                       {dayjs(date).format("ddd")}
//                     </Typography>
//                     <Typography fontWeight={700}>
//                       {dayjs(date).format("DD")}
//                     </Typography>
//                   </TableCell>
//                 ))}
//               </TableRow>
//             </TableHead>

//             <TableBody>
//               {/* 4. HANDLE LOADING STATE */}
//               {hasError ? (
//                 <TableRow>
//                   <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
//                     <Stack alignItems="center" spacing={1}>
//                       <ErrorOutlineIcon color="error" sx={{ fontSize: 40 }} />
//                       <Typography variant="h6" color="error">
//                         {errorMessage}
//                       </Typography>
//                     </Stack>
//                   </TableCell>
//                 </TableRow>
//               ) : /* 6. HANDLE EMPTY DATA STATE */
//               users.length === 0 ? (
//                 <TableRow>
//                   <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
//                     <Typography color="text.secondary">
//                       No roster available for selected range.
//                     </Typography>
//                   </TableCell>
//                 </TableRow>
//               ) : (
//                 /* 7. NORMAL RENDERING */
//                 users.map((user: any) => (
//                   <TableRow key={user.userId} hover>
//                     <RosterEmployeeCell user={user} />

//                     {weekDates.map((date) => (
//                       <RosterShiftCell
//                         key={date}
//                         shift={user.roster?.[date]}
//                         shiftDate={date}
//                         rowUserId={user.userId}
//                         onEditClick={(shift) =>
//                           handleOpenEdit(shift, date, user.userId)
//                         }
//                       />
//                     ))}
//                   </TableRow>
//                 ))
//               )}
//             </TableBody>
//           </Table>
//         </SmartScrollContainer>
//       </TableContainer>

//       {/* --- ADD DIALOG COMPONENT HERE --- */}
//       <EditRosterDialog
//         open={editDialogConfig.isOpen}
//         onClose={handleCloseEdit}
//         editData={editDialogConfig.data}
//         onSave={handleSaveShift}
//         saving={isChanging}
//       />
//     </Box>
//   );
// };
