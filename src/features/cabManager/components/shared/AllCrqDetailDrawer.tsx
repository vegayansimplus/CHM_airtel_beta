// // import {
// //   Alert,
// //   Box,
// //   Button,
// //   Divider,
// //   Drawer,
// //   IconButton,
// //   Skeleton,
// //   Stack,
// //   Typography,
// // } from "@mui/material";
// // import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
// // import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
// // import ReplayIcon from "@mui/icons-material/Replay";
// // import CloseIcon from "@mui/icons-material/Close";
// // import OpenInNewIcon from "@mui/icons-material/OpenInNew";
// // import { useState } from "react";
// // import { useNavigate } from "react-router";
// // import { useGetCrqByIdQuery } from "../../api/cabManagerApiSlice";
// // import { ApproveCrqModal } from "../modals/ApproveCrqModal";
// // import { RejectCrqModal } from "../modals/RejectCrqModal";
// // import { RescheduleCrqModal } from "../modals/RescheduleCrqModal";
// // import { StageChip, StatusChip } from "./Chips";
// // import { errMsg } from "./errMsg";

// // export function AllCrqDetailDrawer({ crqId, onClose }: { crqId: string | null; onClose: () => void }) {
// //   const open = !!crqId;
// //   const navigate = useNavigate();
// //   const { data, isLoading, isError, error } = useGetCrqByIdQuery(crqId ?? "", { skip: !crqId });
// //   const [approveOpen, setApproveOpen] = useState(false);
// //   const [rejectOpen, setRejectOpen] = useState(false);
// //   const [scheduleOpen, setScheduleOpen] = useState(false);

// //   return (
// //     <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: 480 } }}>
// //       {/* Header */}
// //       <Box sx={{ p: 2.5, borderBottom: "1px solid", borderColor: "divider" }}>
// //         <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1.5}>
// //           <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
// //             {data && (
// //               <>
// //                 <Typography sx={{ fontFamily: "'Roboto Mono', monospace", color: "primary.main", fontWeight: 500 }}>{data.crqNo}</Typography>
// //                 <StatusChip status={data.currentStatus} />
// //               </>
// //             )}
// //           </Stack>
// //           <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
// //         </Stack>
// //         {data && (
// //           <>
// //             <Typography variant="caption" sx={{ color: "text.secondary", mt: 1, display: "block" }}>
// //               Raised by <Box component="span" sx={{ color: "text.primary" }}>{data.raisedBy}</Box>
// //             </Typography>
// //           </>
// //         )}
// //       </Box>

// //       {/* Body */}
// //       <Box sx={{ flex: 1, overflowY: "auto", p: 2.5 }}>
// //         {isError && <Alert severity="error">{errMsg(error)}</Alert>}
// //         {isLoading && <Stack spacing={1.5}>{[0,1,2,3].map((i) => <Skeleton key={i} variant="rounded" height={48} />)}</Stack>}

// //         {data && (
// //           <>
// //             <Button
// //               fullWidth
// //               variant="outlined"
// //               startIcon={<OpenInNewIcon />}
// //               onClick={() => { onClose(); navigate(`/cabmanager/journey/${data.crqNo}`); }}
// //               sx={{ mb: 2.5 }}
// //             >
// //               View full CRQ journey
// //             </Button>

// //             <Typography variant="caption" sx={{ color: "text.secondary", letterSpacing: 0.5, textTransform: "uppercase", mb: 1, display: "block" }}>
// //               Overview
// //             </Typography>
// //             <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, mb: 3 }}>
// //               {[
// //                 ["Domain",     data.domainName],
// //                 ["Circle",     data.circleCode],
// //                 ["Plan ID",    data.planId],
// //                 ["Stage",      <StageChip key="s" stage={data.currentStage} />],
// //                 ["Approver",   data.approverName],
// //                 ["Scheduled",  data.assignStartTime],
// //               ].map(([k, v]) => (
// //                 <Box key={String(k)}>
// //                   <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>{k}</Typography>
// //                   {typeof v === "string" || v === null || v === undefined
// //                     ? <Typography variant="body2">{v || "—"}</Typography>
// //                     : v}
// //                 </Box>
// //               ))}
// //             </Box>

// //             <Divider sx={{ mb: 2 }} />
// //             <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
// //               <Button
// //                 fullWidth
// //                 variant="contained"
// //                 color="success"
// //                 startIcon={<CheckCircleOutlineIcon />}
// //                 onClick={() => setApproveOpen(true)}
// //               >
// //                 Approve
// //               </Button>
// //               <Button
// //                 fullWidth
// //                 variant="outlined"
// //                 color="error"
// //                 startIcon={<CancelOutlinedIcon />}
// //                 onClick={() => setRejectOpen(true)}
// //               >
// //                 Reject
// //               </Button>
// //               <Button
// //                 fullWidth
// //                 variant="outlined"
// //                 startIcon={<ReplayIcon />}
// //                 onClick={() => setScheduleOpen(true)}
// //               >
// //                 Schedule
// //               </Button>
// //             </Stack>
// //           </>
// //         )}
// //       </Box>

// //       <ApproveCrqModal open={approveOpen} crqId={crqId} onClose={() => setApproveOpen(false)} />
// //       <RejectCrqModal open={rejectOpen} crqId={crqId} onClose={() => setRejectOpen(false)} />
// //       <RescheduleCrqModal open={scheduleOpen} crqId={crqId} onClose={() => setScheduleOpen(false)} />
// //     </Drawer>
// //   );
// // }


// import {
//   Alert,
//   Box,
//   Button,
//   Divider,
//   Drawer,
//   IconButton,
//   Skeleton,
//   Stack,
//   Typography,
// } from "@mui/material";
// import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
// import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
// import ReplayIcon from "@mui/icons-material/Replay";
// import CloseIcon from "@mui/icons-material/Close";
// import OpenInNewIcon from "@mui/icons-material/OpenInNew";
// import { useState } from "react";
// import { useNavigate } from "react-router";
// import { useGetCrqByIdQuery } from "../../api/cabManagerApiSlice";
// import { ApproveCrqModal } from "../modals/ApproveCrqModal";
// import { RejectCrqModal } from "../modals/RejectCrqModal";
// import { RescheduleCrqModal } from "../modals/RescheduleCrqModal";
// import { StageChip, StatusChip } from "./Chips";
// import { errMsg } from "./errMsg";

// type Props = {
//   serviceApprovalId: number | null;
//   crqNo: string | null;
//   onClose: () => void;
// };

// export function AllCrqDetailDrawer({
//   serviceApprovalId,
//   crqNo,
//   onClose,
// }: Props) {
//   const open = !!serviceApprovalId;
//   const navigate = useNavigate();

//   const { data, isLoading, isError, error } = useGetCrqByIdQuery(
//     serviceApprovalId ?? 0,
//     {
//       skip: !serviceApprovalId,
//     }
//   );

//   const [approveOpen, setApproveOpen] = useState(false);
//   const [rejectOpen, setRejectOpen] = useState(false);
//   const [scheduleOpen, setScheduleOpen] = useState(false);

//   return (
//     <Drawer
//       anchor="right"
//       open={open}
//       onClose={onClose}
//       PaperProps={{ sx: { width: 480 } }}
//     >
//       {/* Header */}
//       <Box
//         sx={{
//           p: 2.5,
//           borderBottom: "1px solid",
//           borderColor: "divider",
//         }}
//       >
//         <Stack
//           direction="row"
//           justifyContent="space-between"
//           alignItems="flex-start"
//           spacing={1.5}
//         >
//           <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
//             {data && (
//               <>
//                 <Typography
//                   sx={{
//                     fontFamily: "'Roboto Mono', monospace",
//                     color: "primary.main",
//                     fontWeight: 500,
//                   }}
//                 >
//                   {data.crqNo}
//                 </Typography>
//                 <StatusChip status={data.currentStatus} />
//               </>
//             )}
//           </Stack>

//           <IconButton onClick={onClose} size="small">
//             <CloseIcon />
//           </IconButton>
//         </Stack>

//         {data && (
//           <Typography
//             variant="caption"
//             sx={{
//               color: "text.secondary",
//               mt: 1,
//               display: "block",
//             }}
//           >
//             Raised by{" "}
//             <Box component="span" sx={{ color: "text.primary" }}>
//               {data.raisedBy}
//             </Box>
//           </Typography>
//         )}
//       </Box>

//       {/* Body */}
//       <Box sx={{ flex: 1, overflowY: "auto", p: 2.5 }}>
//         {isError && <Alert severity="error">{errMsg(error)}</Alert>}

//         {isLoading && (
//           <Stack spacing={1.5}>
//             {[0, 1, 2, 3].map((i) => (
//               <Skeleton key={i} variant="rounded" height={48} />
//             ))}
//           </Stack>
//         )}

//         {data && (
//           <>
//             <Button
//               fullWidth
//               variant="outlined"
//               startIcon={<OpenInNewIcon />}
//               onClick={() => {
//                 onClose();
//                 navigate(`/cabmanager/journey/${data.crqNo}`);
//               }}
//               sx={{ mb: 2.5 }}
//             >
//               View full CRQ journey
//             </Button>

//             <Typography
//               variant="caption"
//               sx={{
//                 color: "text.secondary",
//                 letterSpacing: 0.5,
//                 textTransform: "uppercase",
//                 mb: 1,
//                 display: "block",
//               }}
//             >
//               Overview
//             </Typography>

//             <Box
//               sx={{
//                 display: "grid",
//                 gridTemplateColumns: "1fr 1fr",
//                 gap: 2,
//                 mb: 3,
//               }}
//             >
//               {[
//                 ["Domain", data.domainName],
//                 ["Circle", data.circleCode],
//                 ["Plan ID", data.planId],
//                 ["Stage", <StageChip key="stage" stage={data.currentStage} />],
//                 ["Approver", data.approverName],
//                 ["Scheduled", data.assignStartTime],
//               ].map(([k, v]) => (
//                 <Box key={String(k)}>
//                   <Typography
//                     variant="caption"
//                     sx={{
//                       color: "text.secondary",
//                       display: "block",
//                     }}
//                   >
//                     {k}
//                   </Typography>

//                   {typeof v === "string" ||
//                   v === null ||
//                   v === undefined ? (
//                     <Typography variant="body2">{v || "—"}</Typography>
//                   ) : (
//                     v
//                   )}
//                 </Box>
//               ))}
//             </Box>

//             <Divider sx={{ mb: 2 }} />

//             <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
//               <Button
//                 fullWidth
//                 variant="contained"
//                 color="success"
//                 startIcon={<CheckCircleOutlineIcon />}
//                 onClick={() => setApproveOpen(true)}
//               >
//                 Approve
//               </Button>

//               <Button
//                 fullWidth
//                 variant="outlined"
//                 color="error"
//                 startIcon={<CancelOutlinedIcon />}
//                 onClick={() => setRejectOpen(true)}
//               >
//                 Reject
//               </Button>

//               <Button
//                 fullWidth
//                 variant="outlined"
//                 startIcon={<ReplayIcon />}
//                 onClick={() => setScheduleOpen(true)}
//               >
//                 Schedule
//               </Button>
//             </Stack>
//           </>
//         )}
//       </Box>

//       <ApproveCrqModal
//         open={approveOpen}
//         serviceApprovalId={serviceApprovalId}
//         crqNo={crqNo}
//         onClose={() => setApproveOpen(false)}
//       />

//       <RejectCrqModal
//         open={rejectOpen}
//         serviceApprovalId={serviceApprovalId}
//         crqNo={crqNo}
//         onClose={() => setRejectOpen(false)}
//       />

//       <RescheduleCrqModal
//         open={scheduleOpen}
//         serviceApprovalId={serviceApprovalId}
//         crqNo={crqNo}
//         onClose={() => setScheduleOpen(false)}
//       />
//     </Drawer>
//   );
// }




// import {
//   Alert,
//   Box,
//   Button,
//   Divider,
//   Drawer,
//   IconButton,
//   Skeleton,
//   Stack,
//   Typography,
// } from "@mui/material";
// import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
// import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
// import ReplayIcon from "@mui/icons-material/Replay";
// import CloseIcon from "@mui/icons-material/Close";
// import OpenInNewIcon from "@mui/icons-material/OpenInNew";
// import { useState } from "react";
// import { useNavigate } from "react-router";
// import { useGetCrqByIdQuery } from "../../api/cabManagerApiSlice";
// import { ApproveCrqModal } from "../modals/ApproveCrqModal";
// import { RejectCrqModal } from "../modals/RejectCrqModal";
// import { RescheduleCrqModal } from "../modals/RescheduleCrqModal";
// import { StageChip, StatusChip } from "./Chips";
// import { errMsg } from "./errMsg";

// export function AllCrqDetailDrawer({ crqId, onClose }: { crqId: string | null; onClose: () => void }) {
//   const open = !!crqId;
//   const navigate = useNavigate();
//   const { data, isLoading, isError, error } = useGetCrqByIdQuery(crqId ?? "", { skip: !crqId });
//   const [approveOpen, setApproveOpen] = useState(false);
//   const [rejectOpen, setRejectOpen] = useState(false);
//   const [scheduleOpen, setScheduleOpen] = useState(false);

//   return (
//     <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: 480 } }}>
//       {/* Header */}
//       <Box sx={{ p: 2.5, borderBottom: "1px solid", borderColor: "divider" }}>
//         <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1.5}>
//           <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
//             {data && (
//               <>
//                 <Typography sx={{ fontFamily: "'Roboto Mono', monospace", color: "primary.main", fontWeight: 500 }}>{data.crqNo}</Typography>
//                 <StatusChip status={data.currentStatus} />
//               </>
//             )}
//           </Stack>
//           <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
//         </Stack>
//         {data && (
//           <>
//             <Typography variant="caption" sx={{ color: "text.secondary", mt: 1, display: "block" }}>
//               Raised by <Box component="span" sx={{ color: "text.primary" }}>{data.raisedBy}</Box>
//             </Typography>
//           </>
//         )}
//       </Box>

//       {/* Body */}
//       <Box sx={{ flex: 1, overflowY: "auto", p: 2.5 }}>
//         {isError && <Alert severity="error">{errMsg(error)}</Alert>}
//         {isLoading && <Stack spacing={1.5}>{[0,1,2,3].map((i) => <Skeleton key={i} variant="rounded" height={48} />)}</Stack>}

//         {data && (
//           <>
//             <Button
//               fullWidth
//               variant="outlined"
//               startIcon={<OpenInNewIcon />}
//               onClick={() => { onClose(); navigate(`/cabmanager/journey/${data.crqNo}`); }}
//               sx={{ mb: 2.5 }}
//             >
//               View full CRQ journey
//             </Button>

//             <Typography variant="caption" sx={{ color: "text.secondary", letterSpacing: 0.5, textTransform: "uppercase", mb: 1, display: "block" }}>
//               Overview
//             </Typography>
//             <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, mb: 3 }}>
//               {[
//                 ["Domain",     data.domainName],
//                 ["Circle",     data.circleCode],
//                 ["Plan ID",    data.planId],
//                 ["Stage",      <StageChip key="s" stage={data.currentStage} />],
//                 ["Approver",   data.approverName],
//                 ["Scheduled",  data.assignStartTime],
//               ].map(([k, v]) => (
//                 <Box key={String(k)}>
//                   <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>{k}</Typography>
//                   {typeof v === "string" || v === null || v === undefined
//                     ? <Typography variant="body2">{v || "—"}</Typography>
//                     : v}
//                 </Box>
//               ))}
//             </Box>

//             <Divider sx={{ mb: 2 }} />
//             <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
//               <Button
//                 fullWidth
//                 variant="contained"
//                 color="success"
//                 startIcon={<CheckCircleOutlineIcon />}
//                 onClick={() => setApproveOpen(true)}
//               >
//                 Approve
//               </Button>
//               <Button
//                 fullWidth
//                 variant="outlined"
//                 color="error"
//                 startIcon={<CancelOutlinedIcon />}
//                 onClick={() => setRejectOpen(true)}
//               >
//                 Reject
//               </Button>
//               <Button
//                 fullWidth
//                 variant="outlined"
//                 startIcon={<ReplayIcon />}
//                 onClick={() => setScheduleOpen(true)}
//               >
//                 Schedule
//               </Button>
//             </Stack>
//           </>
//         )}
//       </Box>

//       <ApproveCrqModal open={approveOpen} crqId={crqId} onClose={() => setApproveOpen(false)} />
//       <RejectCrqModal open={rejectOpen} crqId={crqId} onClose={() => setRejectOpen(false)} />
//       <RescheduleCrqModal open={scheduleOpen} crqId={crqId} onClose={() => setScheduleOpen(false)} />
//     </Drawer>
//   );
// }


import {
  Alert,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import ReplayIcon from "@mui/icons-material/Replay";
import CloseIcon from "@mui/icons-material/Close";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { useState } from "react";
import { useNavigate } from "react-router";
import { useGetCrqByIdQuery } from "../../api/cabManagerApiSlice";
import { ApproveCrqModal } from "../modals/ApproveCrqModal";
import { RejectCrqModal } from "../modals/RejectCrqModal";
import { RescheduleCrqModal } from "../modals/RescheduleCrqModal";
import { StageChip, StatusChip } from "./Chips";
import { errMsg } from "./errMsg";

type Props = {
  serviceApprovalId: number | null;
  crqNo: string | null;
  onClose: () => void;
};

export function AllCrqDetailDrawer({
  serviceApprovalId,
  crqNo,
  onClose,
}: Props) {
  const open = !!serviceApprovalId;
  const navigate = useNavigate();

  const { data, isLoading, isError, error } = useGetCrqByIdQuery(
    serviceApprovalId ?? 0,
    {
      skip: !serviceApprovalId,
    }
  );

  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: 480 } }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2.5,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          spacing={1.5}
        >
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            {data && (
              <>
                <Typography
                  sx={{
                    fontFamily: "'Roboto Mono', monospace",
                    color: "primary.main",
                    fontWeight: 500,
                  }}
                >
                  {data.crqNo}
                </Typography>
                <StatusChip status={data.serviceApprovalStatus} />
              </>
            )}
          </Stack>

          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Stack>
      </Box>

      {/* Body */}
      <Box sx={{ flex: 1, overflowY: "auto", p: 2.5 }}>
        {isError && <Alert severity="error">{errMsg(error)}</Alert>}

        {isLoading && (
          <Stack spacing={1.5}>
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} variant="rounded" height={48} />
            ))}
          </Stack>
        )}

        {data && (
          <>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<OpenInNewIcon />}
              onClick={() => {
                onClose();
                navigate(`/cabmanager/journey/${data.crqNo}`);
              }}
              sx={{ mb: 2.5 }}
            >
              View full CRQ journey
            </Button>

            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                letterSpacing: 0.5,
                textTransform: "uppercase",
                mb: 1,
                display: "block",
              }}
            >
              Overview
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 2,
                mb: 3,
              }}
            >
              {[
                ["Domain", data.domainName],
                ["Circle", data.circleCode],
                ["Plan ID", data.planId],
                ["Stage", <StageChip key="stage" stage={data.currentStage} />],
                ["Service", data.serviceCode],
                ["Stage Status", data.stageStatus],
              ].map(([k, v]) => (
                <Box key={String(k)}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "text.secondary",
                      display: "block",
                    }}
                  >
                    {k}
                  </Typography>

                  {typeof v === "string" ||
                  v === null ||
                  v === undefined ? (
                    <Typography variant="body2">{v || "—"}</Typography>
                  ) : (
                    v
                  )}
                </Box>
              ))}
            </Box>

            <Divider sx={{ mb: 2 }} />

            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
              <Button
                fullWidth
                variant="contained"
                color="success"
                startIcon={<CheckCircleOutlineIcon />}
                onClick={() => setApproveOpen(true)}
              >
                Approve
              </Button>

              <Button
                fullWidth
                variant="outlined"
                color="error"
                startIcon={<CancelOutlinedIcon />}
                onClick={() => setRejectOpen(true)}
              >
                Reject
              </Button>

              <Button
                fullWidth
                variant="outlined"
                startIcon={<ReplayIcon />}
                onClick={() => setScheduleOpen(true)}
              >
                Reschedule
              </Button>
            </Stack>
          </>
        )}
      </Box>

      <ApproveCrqModal
        open={approveOpen}
        serviceApprovalId={serviceApprovalId}
        crqNo={crqNo}
        onClose={() => setApproveOpen(false)}
        onSuccess={() => {
          setApproveOpen(false);
          onClose();
        }}
      />

      <RejectCrqModal
        open={rejectOpen}
        serviceApprovalId={serviceApprovalId}
        crqNo={crqNo}
        onClose={() => setRejectOpen(false)}
        onSuccess={() => {
          setRejectOpen(false);
          onClose();
        }}
      />

      <RescheduleCrqModal
        open={scheduleOpen}
        serviceApprovalId={serviceApprovalId}
        crqNo={crqNo}
        onClose={() => setScheduleOpen(false)}
        onSuccess={() => {
          setScheduleOpen(false);
          onClose();
        }}
      />
    </Drawer>
  );
}
