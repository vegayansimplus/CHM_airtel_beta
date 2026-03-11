import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  IconButton,
  Stack,
  Divider,
  TextField,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EventNoteIcon from "@mui/icons-material/EventNote";
import BadgeIcon from "@mui/icons-material/Badge";
import EditCalendarIcon from "@mui/icons-material/EditCalendar";
import dayjs from "dayjs";
import { shiftColorMap } from "../../constant/shiftColors";
import { toast } from "react-toastify";

interface EditRosterDialogProps {
  open: boolean;
  onClose: () => void;
  editData: { shift: any; date: string; userId: string } | null;
  onSave: (
    userId: string,
    date: string,
    newShiftId: number,
    newAssignActivity: number,
    newAvailableMinutes: number,
    reason: string,
  ) => void;
  saving?: boolean;
  shiftOptions: { shiftId: number; shiftRange: string }[];
}

export const EditRosterDialog = ({
  open,
  onClose,
  editData,
  onSave,
  saving = false,
  shiftOptions,
}: EditRosterDialogProps) => {
  const [selectedShift, setSelectedShift] = useState<number>(0);
  const [assignActivity, setAssignActivity] = useState<number | "">("");
  const [availableMinutes, setAvailableMinutes] = useState<number | "">("");
  // const [assignActivity, setAssignActivity] = useState<number>(0);
  // const [availableMinutes, setAvailableMinutes] = useState<number>(0);
  const [reason, setReason] = useState("");

  /**
   * Initialize dialog values from roster data
   */ useEffect(() => {
    if (!open || !editData) return;

    setSelectedShift(editData.shift?.shiftId ?? 0);

    setAssignActivity(
      editData.shift?.assignActCount !== undefined
        ? editData.shift.assignActCount
        : "",
    );

    setAvailableMinutes(
      editData.shift?.availableMins !== undefined
        ? editData.shift.availableMins
        : "",
    );

    setReason("");
  }, [open, editData]);

  const isReasonValid = reason.trim().length > 0;

  const handleSave = () => {
    if (!editData) return;

    if (!isReasonValid) {
      toast.error("Reason is required");
      return;
    }

    if (selectedShift === 0) {
      toast.warning("Please select a shift");
      return;
    }

    try {
      onSave(
        editData.userId,
        editData.date,
        selectedShift,
        Number(assignActivity || 0),
        Number(availableMinutes || 0),
        reason.trim(),
      );

      toast.success("Shift updated successfully");
    } catch (error) {
      toast.error("Failed to update shift");
    }
  };

  if (!editData) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: "0px 8px 24px rgba(149, 157, 165, 0.2)",
        },
      }}
    >
      {/* HEADER */}
      <DialogTitle
        sx={{
          m: 0,
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <EditCalendarIcon color="primary" />
          <Typography variant="h6" fontWeight={600}>
            Modify Shift
          </Typography>
        </Stack>

        <IconButton
          onClick={onClose}
          size="small"
          sx={{ color: "text.secondary" }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ p: 3 }}>
        {/* CONTEXT CARD */}
        <Box
          sx={{
            bgcolor: "#F8FAFC",
            border: "1px solid #E2E8F0",
            borderRadius: 2,
            p: 2,
            mb: 3,
          }}
        >
          <Stack spacing={1.5}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  p: 0.5,
                  bgcolor: "#EFF6FF",
                  borderRadius: 1,
                  display: "flex",
                }}
              >
                <EventNoteIcon sx={{ fontSize: 18, color: "#2563EB" }} />
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Shift Date
                </Typography>

                <Typography variant="body2" fontWeight={600}>
                  {dayjs(editData.date).format("dddd, MMM D, YYYY")}
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  p: 0.5,
                  bgcolor: "#F5F3FF",
                  borderRadius: 1,
                  display: "flex",
                }}
              >
                <BadgeIcon sx={{ fontSize: 18, color: "#7C3AED" }} />
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Employee ID
                </Typography>

                <Typography variant="body2" fontWeight={600}>
                  {editData.userId}
                </Typography>
              </Box>
            </Stack>
          </Stack>
        </Box>

        {/* SHIFT DROPDOWN */}
        <Typography
          variant="subtitle2"
          fontWeight={600}
          color="text.primary"
          sx={{ mb: 1 }}
        >
          Assign New Shift
        </Typography>

        {/* Select shift logic  */}
        <FormControl fullWidth size="medium">
          <InputLabel id="shift-select-label">Select Shift</InputLabel>

          <Select
            labelId="shift-select-label"
            value={selectedShift}
            label="Select Shift"
            onChange={(e) => setSelectedShift(Number(e.target.value))}
            renderValue={(value) => {
              const shift = shiftOptions.find((opt) => opt.shiftId === value);

              if (!shift) return "Select Shift";

              const shiftCode = shift.shiftRange;

              const shiftStyle = shiftColorMap.get(shiftCode.charAt(0)) || {
                color: "#475569",
                background: "#F1F5F9",
              };

              return (
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      bgcolor: shiftStyle.color,
                    }}
                  />

                  <Typography variant="body2" fontWeight={500}>
                    {shiftCode}
                  </Typography>
                </Stack>
              );
            }}
          >
            {shiftOptions.map((shift) => {
              const shiftCode = shift.shiftRange;

              const shiftStyle = shiftColorMap.get(shiftCode.charAt(0)) || {
                color: "#475569",
                background: "#F1F5F9",
              };

              return (
                <MenuItem
                  key={shift.shiftId}
                  value={shift.shiftId}
                  sx={{ py: 1.5 }}
                >
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        bgcolor: shiftStyle.color,
                        boxShadow: `0 0 0 2px ${shiftStyle.background}`,
                      }}
                    />

                    <Typography variant="body2" fontWeight={500}>
                      {shiftCode}
                    </Typography>
                  </Stack>
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>

        {/* Assign Activity */}
        <Box sx={{ mt: 2 }}>
          <TextField
            label="Assign Activity Count"
            fullWidth
            size="small"
            type="number"
            value={assignActivity}
            inputProps={{ min: 0 }}
            onKeyDown={(e) => {
              if (["e", "E", "+", "-"].includes(e.key)) {
                e.preventDefault();
              }
            }}
            onChange={(e) => {
              const val = e.target.value;

              if (val === "") {
                setAssignActivity("");
                return;
              }

              const num = Number(val);
              if (!isNaN(num) && num >= 0) {
                setAssignActivity(num);
              }
            }}
          />
        </Box>
        {/* Available Minutes */}
        <Box sx={{ mt: 2 }}>
          <TextField
            label="Available Minutes"
            fullWidth
            size="small"
            type="number"
            value={availableMinutes}
            inputProps={{ min: 0 }}
            onKeyDown={(e) => {
              if (["e", "E", "+", "-"].includes(e.key)) {
                e.preventDefault();
              }
            }}
            onChange={(e) => {
              const val = e.target.value;

              if (val === "") {
                setAvailableMinutes("");
                return;
              }

              const num = Number(val);
              if (!isNaN(num) && num >= 0) {
                setAvailableMinutes(num);
              }
            }}
          />
        </Box>
        {/* Reason */}
        <Box sx={{ mt: 2 }}>
          <TextField
            label="Reason"
            fullWidth
            size="small"
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            error={!isReasonValid && reason !== ""}
            helperText={
              !isReasonValid && reason !== "" ? "Reason is required" : ""
            }
          />
        </Box>
      </DialogContent>

      <Divider />

      {/* ACTIONS */}
      <DialogActions sx={{ p: 2, px: 3, bgcolor: "#F8FAFC" }}>
        <Button
          onClick={onClose}
          variant="text"
          color="inherit"
          sx={{ fontWeight: 600, color: "text.secondary" }}
        >
          Cancel
        </Button>

        <Button
          onClick={handleSave}
          variant="contained"
          color="primary"
          disableElevation
          sx={{ fontWeight: 600, borderRadius: 1.5, px: 3 }}
          disabled={selectedShift === 0 || saving || !isReasonValid}
        >
          {saving ? "Updating..." : "Confirm Update"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// import { useState, useEffect } from "react";
// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Button,
//   FormControl,
//   InputLabel,
//   Select,
//   MenuItem,
//   Typography,
//   Box,
//   IconButton,
//   Stack,
//   Divider,
//   TextField,
// } from "@mui/material";
// import CloseIcon from "@mui/icons-material/Close";
// import EventNoteIcon from "@mui/icons-material/EventNote";
// import BadgeIcon from "@mui/icons-material/Badge";
// import EditCalendarIcon from "@mui/icons-material/EditCalendar";
// import dayjs from "dayjs";
// import { shiftColorMap } from "../../constant/shiftColors";

// interface EditRosterDialogProps {
//   open: boolean;
//   onClose: () => void;
//   editData: { shift: any; date: string; userId: string } | null;
//   onSave: (
//     userId: string,
//     date: string,
//     newShiftId: number,
//     newAssignActivity: number,
//     newAvailableMinutes: number,
//     reason: string,
//   ) => void;
//   saving?: boolean;
//   shiftOptions: { shiftId: number; shiftRange: string }[];
// }
// export const EditRosterDialog = ({
//   open,
//   onClose,
//   editData,
//   onSave,
//   saving = false,
//   shiftOptions,
// }: EditRosterDialogProps) => {
//   const [selectedShift, setSelectedShift] = useState<number>(0);
//   const [assignActivity, setAssignActivity] = useState<number>(0);
//   const [availableMinutes, setAvailableMinutes] = useState<number>(0);
//   const [reason, setReason] = useState("");

//   useEffect(() => {
//     if (!editData || shiftOptions.length === 0) return;

//     const currentShiftId =
//       shiftOptions.find(
//         (opt) => opt.shiftRange === editData.shift?.shiftDisplay,
//       )?.shiftId || 0;

//     setSelectedShift(currentShiftId);

//     setAssignActivity(editData.shift?.assignActCount ?? 0);

//     setAvailableMinutes(editData.shift?.availableMins ?? 0);

//     setReason("");
//   }, [editData, shiftOptions]);

//   // useEffect(() => {
//   //   if (editData && editData.shift) {
//   //     // Set default shift from roster data
//   //     const currentShiftId = shiftOptions.find(
//   //       (opt) => opt.shiftRange === editData.shift.shiftDisplay
//   //     )?.shiftId || 0;
//   //     setSelectedShift(currentShiftId);

//   //     // Set default values from roster data
//   //     setAssignActivity(editData.shift.assignActCount || 0);
//   //     setAvailableMinutes(editData.shift.availableMins || 0);
//   //     setReason("");
//   //   }
//   // }, [editData, shiftOptions]);

//   const isReasonValid = reason.trim().length > 0;

//   const handleSave = () => {
//     if (editData && isReasonValid) {
//       onSave(
//         editData.userId,
//         editData.date,
//         selectedShift,
//         assignActivity,
//         availableMinutes,
//         reason.trim(),
//       );
//     }
//   };

//   if (!editData) return null;

//   return (
//     <Dialog
//       open={open}
//       onClose={onClose}
//       maxWidth="xs"
//       fullWidth
//       PaperProps={{
//         sx: {
//           borderRadius: 3,
//           boxShadow: "0px 8px 24px rgba(149, 157, 165, 0.2)",
//         },
//       }}
//     >
//       {/* HEADER */}
//       <DialogTitle
//         sx={{
//           m: 0,
//           p: 2,
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "space-between",
//         }}
//       >
//         <Stack direction="row" spacing={1} alignItems="center">
//           <EditCalendarIcon color="primary" />
//           <Typography variant="h6" fontWeight={600}>
//             Modify Shift
//           </Typography>
//         </Stack>
//         <IconButton
//           onClick={onClose}
//           size="small"
//           sx={{ color: "text.secondary" }}
//         >
//           <CloseIcon fontSize="small" />
//         </IconButton>
//       </DialogTitle>

//       <Divider />

//       <DialogContent sx={{ p: 3 }}>
//         {/* CONTEXT CARD (Date & Employee Info) */}
//         <Box
//           sx={{
//             bgcolor: "#F8FAFC",
//             border: "1px solid #E2E8F0",
//             borderRadius: 2,
//             p: 2,
//             mb: 3,
//           }}
//         >
//           <Stack spacing={1.5}>
//             <Stack direction="row" spacing={1.5} alignItems="center">
//               <Box
//                 sx={{
//                   p: 0.5,
//                   bgcolor: "#EFF6FF",
//                   borderRadius: 1,
//                   display: "flex",
//                 }}
//               >
//                 <EventNoteIcon sx={{ fontSize: 18, color: "#2563EB" }} />
//               </Box>
//               <Box>
//                 <Typography
//                   variant="caption"
//                   color="text.secondary"
//                   display="block"
//                 >
//                   Shift Date
//                 </Typography>
//                 <Typography
//                   variant="body2"
//                   fontWeight={600}
//                   color="text.primary"
//                 >
//                   {dayjs(editData.date).format("dddd, MMM D, YYYY")}
//                 </Typography>
//               </Box>
//             </Stack>

//             <Stack direction="row" spacing={1.5} alignItems="center">
//               <Box
//                 sx={{
//                   p: 0.5,
//                   bgcolor: "#F5F3FF",
//                   borderRadius: 1,
//                   display: "flex",
//                 }}
//               >
//                 <BadgeIcon sx={{ fontSize: 18, color: "#7C3AED" }} />
//               </Box>
//               <Box>
//                 <Typography
//                   variant="caption"
//                   color="text.secondary"
//                   display="block"
//                 >
//                   Employee ID
//                 </Typography>
//                 <Typography
//                   variant="body2"
//                   fontWeight={600}
//                   color="text.primary"
//                 >
//                   {editData.userId}
//                 </Typography>
//               </Box>
//             </Stack>
//           </Stack>
//         </Box>

//         {/* INPUT SECTION */}
//         <Typography
//           variant="subtitle2"
//           fontWeight={600}
//           color="text.primary"
//           sx={{ mb: 1 }}
//         >
//           Assign New Shift
//         </Typography>

//         <FormControl fullWidth size="medium">
//           <InputLabel id="shift-select-label">Select Shift</InputLabel>
//           <Select
//             labelId="shift-select-label"
//             value={selectedShift || 0}
//             label="Select Shift"
//             onChange={(e) => setSelectedShift(Number(e.target.value))}
//             renderValue={(value) => {
//               if (!value) return null;
//               const shift = shiftOptions.find((opt) => opt.shiftId === value);
//               const shiftCode = shift?.shiftRange || "WO";
//               const shiftStyle = shiftColorMap.get(shiftCode.charAt(0)) || {
//                 color: "#475569",
//                 background: "#F1F5F9",
//               };
//               return (
//                 <Stack direction="row" alignItems="center" spacing={1}>
//                   <Box
//                     sx={{
//                       width: 10,
//                       height: 10,
//                       borderRadius: "50%",
//                       bgcolor: shiftStyle.color,
//                     }}
//                   />
//                   <Typography variant="body2" fontWeight={500}>
//                     {shiftCode}
//                   </Typography>
//                 </Stack>
//               );
//             }}
//           >
//             {shiftOptions.map((shift) => {
//               const shiftCode = shift.shiftRange;

//               const shiftStyle = shiftColorMap.get(shiftCode.charAt(0)) || {
//                 color: "#475569",
//                 background: "#F1F5F9",
//               };

//               return (
//                 <MenuItem
//                   key={shift.shiftId}
//                   value={shift.shiftId}
//                   sx={{ py: 1.5 }}
//                 >
//                   <Stack direction="row" alignItems="center" spacing={1.5}>
//                     <Box
//                       sx={{
//                         width: 12,
//                         height: 12,
//                         borderRadius: "50%",
//                         bgcolor: shiftStyle.color,
//                         boxShadow: `0 0 0 2px ${shiftStyle.background}`,
//                       }}
//                     />
//                     <Typography variant="body2" fontWeight={500}>
//                       {shiftCode}
//                     </Typography>
//                   </Stack>
//                 </MenuItem>
//               );
//             })}
//           </Select>
//         </FormControl>

//         {/* Assign Activity */}
//         <Box sx={{ mt: 2 }}>
//           <TextField
//             label="Assign Activity Count"
//             fullWidth
//             size="small"
//             type="number"
//             value={assignActivity}
//             onChange={(e) => setAssignActivity(Number(e.target.value))}
//           />
//         </Box>

//         {/* Available Minutes */}
//         <Box sx={{ mt: 2 }}>
//           <TextField
//             label="Available Minutes"
//             fullWidth
//             size="small"
//             type="number"
//             value={availableMinutes}
//             onChange={(e) => setAvailableMinutes(Number(e.target.value))}
//           />
//         </Box>

//         {/* reason input */}
//         <Box sx={{ mt: 2 }}>
//           <TextField
//             label="Reason"
//             fullWidth
//             size="small"
//             required
//             value={reason}
//             onChange={(e) => setReason(e.target.value)}
//             error={!isReasonValid && reason !== ""}
//             helperText={
//               !isReasonValid && reason !== "" ? "Reason is required" : ""
//             }
//           />
//         </Box>
//       </DialogContent>

//       <Divider />

//       {/* ACTIONS */}
//       <DialogActions sx={{ p: 2, px: 3, bgcolor: "#F8FAFC" }}>
//         <Button
//           onClick={onClose}
//           variant="text"
//           color="inherit"
//           sx={{ fontWeight: 600, color: "text.secondary" }}
//         >
//           Cancel
//         </Button>
//         <Button
//           onClick={handleSave}
//           variant="contained"
//           color="primary"
//           disableElevation
//           sx={{ fontWeight: 600, borderRadius: 1.5, px: 3 }}
//           disabled={selectedShift === 0 || saving || !isReasonValid}
//         >
//           {saving ? "Updating..." : "Confirm Update"}
//         </Button>
//       </DialogActions>
//     </Dialog>
//   );
// };
