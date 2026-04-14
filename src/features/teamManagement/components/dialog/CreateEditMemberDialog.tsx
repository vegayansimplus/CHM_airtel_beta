import {
  Dialog,
  DialogContent,
  Button,
  Stack,
  CircularProgress,
  Typography,
  Box,
  Grid,
  TextField,
  Autocomplete,
  Chip,
  IconButton,
  LinearProgress,
} from "@mui/material";
import EditNoteIcon from "@mui/icons-material/EditNote";
import CloseIcon from "@mui/icons-material/Close";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import WorkIcon from "@mui/icons-material/Work";
import BusinessIcon from "@mui/icons-material/Business";
import ApartmentIcon from "@mui/icons-material/Apartment";
import TimelineIcon from "@mui/icons-material/Timeline";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import MemoryIcon from "@mui/icons-material/Memory";
import EventIcon from "@mui/icons-material/Event";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import LockIcon from "@mui/icons-material/Lock";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  useGetCreateUserDropdownsQuery,
  useAddNewEmployeeMutation,
  useUpdateEmployeeMutation,
} from "../../api/teamManagement.api";
import type { UpdateEmployeeRequest } from "../../types/updateUser.types";

// Reuse the same helpers from AddMemberDialog
const SectionLabel = ({
  step,
  label,
  color,
}: {
  step: number;
  label: string;
  color: string;
}) => (
  <Stack direction="row" alignItems="center" spacing={1.5} mb={2}>
    <Box
      sx={{
        width: 26,
        height: 26,
        borderRadius: "50%",
        bgcolor: color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <Typography
        variant="caption"
        fontWeight={700}
        color="#fff"
        lineHeight={1}
      >
        {step}
      </Typography>
    </Box>
    <Typography
      variant="overline"
      fontWeight={700}
      letterSpacing={1.4}
      color="text.secondary"
      sx={{ lineHeight: 1 }}
    >
      {label}
    </Typography>
  </Stack>
);

const FieldIcon = ({ children }: { children: React.ReactNode }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      color: "text.disabled",
      mr: 0.5,
      "& .MuiSvgIcon-root": { fontSize: 16 },
    }}
  >
    {children}
  </Box>
);

// Autocomplete helper
const useAutoField = (dropdownData: any, form: any, setForm: any) => {
  const auto = (
    label: string,
    icon: React.ReactNode,
    options: string[],
    value: string,
    key: string,
    err?: string,
  ) => (
    <Autocomplete
      size="small"
      options={options || []}
      value={value || null}
      onChange={(_, v) => setForm((p: any) => ({ ...p, [key]: v }))}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          error={!!err}
          helperText={err}
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <>
                <FieldIcon>{icon}</FieldIcon>
                {params.InputProps.startAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
  return auto;
};

interface Props {
  open: boolean;
  onClose: () => void;
  actorUserId: number;
  mode: "create" | "edit";
  editData?: any;
}

export const CreateEditMemberDialog = ({
  open,
  onClose,
  actorUserId,
  mode,
  editData,
}: Props) => {
  const isEdit = mode === "edit";
  const { data: dropdownData, isLoading: dropdownLoading } =
    useGetCreateUserDropdownsQuery();
  const [addEmployee, { isLoading: creating }] = useAddNewEmployeeMutation();
  const [updateEmployee, { isLoading: updating }] = useUpdateEmployeeMutation();
  const [form, setForm] = useState<any>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const busy = creating || updating || dropdownLoading;

  useEffect(() => {
    if (isEdit && editData) {
      setForm({
        actorUserId,
        userId: editData.userId,
        olmid: editData.olmId || editData.olmid,
        employeeName: editData.employeeName,
        emailId: editData.emailId,
        mobileNo: editData.mobileNo,
        employmentType: editData.employmentType,
        vendorCompany: editData.vendorCompany,
        designation: editData.designation,
        jobLevel: editData.jobLevel,
        officeLocation: editData.officeLocation,
        gender: editData.gender?.toUpperCase(),
        deviceVendorCapability: editData.deviceVendorCapability,
        dateOfJoining: editData.dateOfJoining,
        dateOfLeaving: editData.dateOfLeaving || null,
        roleCode: editData.roleCode || "",
        replacementEmpOlmid: null,
        replacementEmpName: null,
      });
    }
    if (!open) {
      setForm({});
      setErrors({});
    }
  }, [isEdit, editData, actorUserId, open]);

  const handleUpdate = async () => {
    try {
      const payload: UpdateEmployeeRequest = {
        actorUserId,
        userId: form.userId,
        employeeName: form.employeeName,
        emailId: form.emailId,
        mobileNo: form.mobileNo,
        employmentType: form.employmentType,
        vendorCompany: form.vendorCompany,
        designation: form.designation,
        jobLevel: form.jobLevel,
        officeLocation: form.officeLocation,
        gender: form.gender?.toUpperCase(),
        deviceVendorCapability: form.deviceVendorCapability,
        dateOfJoining: form.dateOfJoining,
        dateOfLeaving: form.dateOfLeaving || null,
        replacementEmpOlmid: null,
        replacementEmpName: null,
      };
      const res = await updateEmployee(payload).unwrap();
      if (res.status === "Success") {
        toast.success(res.message);
        onClose();
      } else toast.error(res.message);
    } catch (err: any) {
      toast.error(err?.data?.message || "Update failed.");
    }
  };

  const d = dropdownData;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        elevation: 0,
        sx: {
          borderRadius: "16px",
          border: "1px solid",
          borderColor: "divider",
          overflow: "hidden",
          maxHeight: "90vh",
        },
      }}
    >
      {busy && (
        <LinearProgress
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 10,
            height: 2,
          }}
        />
      )}

      {/* Header */}
      <Box
        sx={{
          px: 3,
          pt: 2.5,
          pb: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: "10px",
              bgcolor: "primary.main",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
            }}
          >
            <EditNoteIcon sx={{ fontSize: 18 }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight={700} lineHeight={1.2}>
              Edit Team Member
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Update the employee's information below
            </Typography>
          </Box>
        </Stack>
        <IconButton
          size="small"
          onClick={onClose}
          sx={{ color: "text.secondary" }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Body */}
      <DialogContent sx={{ px: 3, py: 3, bgcolor: "grey.50" }}>
        <Stack spacing={3}>
          {/* Info banner */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              px: 2,
              py: 1.5,
              bgcolor: "primary.50",
              borderRadius: "10px",
              border: "1px solid",
              borderColor: "primary.100",
            }}
          >
            <LockIcon sx={{ fontSize: 15, color: "primary.main" }} />
            <Typography variant="caption" color="primary.main" fontWeight={500}>
              OLM ID and organisation hierarchy are locked and cannot be
              changed.
            </Typography>
          </Box>

          {/* Section 1: Basic Info */}
          <Box
            sx={{
              bgcolor: "background.paper",
              borderRadius: "12px",
              border: "1px solid",
              borderColor: "divider",
              p: 2.5,
            }}
          >
            <SectionLabel step={1} label="Basic Information" color="#4F46E5" />
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  size="small"
                  label="OLM ID"
                  fullWidth
                  disabled
                  value={form.olmid || ""}
                  InputProps={{
                    endAdornment: (
                      <Chip
                        label="Locked"
                        size="small"
                        icon={<LockIcon />}
                        sx={{ height: 20, fontSize: 10 }}
                      />
                    ),
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  size="small"
                  label="Employee Name"
                  fullWidth
                  value={form.employeeName || ""}
                  onChange={(e) =>
                    setForm((p: any) => ({
                      ...p,
                      employeeName: e.target.value,
                    }))
                  }
                  error={!!errors.employeeName}
                  helperText={errors.employeeName}
                  InputProps={{
                    startAdornment: (
                      <FieldIcon>
                        <PersonIcon />
                      </FieldIcon>
                    ),
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  size="small"
                  label="Email"
                  fullWidth
                  value={form.emailId || ""}
                  onChange={(e) =>
                    setForm((p: any) => ({ ...p, emailId: e.target.value }))
                  }
                  error={!!errors.emailId}
                  helperText={errors.emailId || "Must be @airtel.com"}
                  InputProps={{
                    startAdornment: (
                      <FieldIcon>
                        <EmailIcon />
                      </FieldIcon>
                    ),
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  size="small"
                  label="Mobile Number"
                  fullWidth
                  value={form.mobileNo || ""}
                  onChange={(e) =>
                    setForm((p: any) => ({
                      ...p,
                      mobileNo: e.target.value.replace(/\D/g, "").slice(0, 10),
                    }))
                  }
                  error={!!errors.mobileNo}
                  helperText={errors.mobileNo}
                  InputProps={{
                    startAdornment: (
                      <FieldIcon>
                        <PhoneIphoneIcon />
                      </FieldIcon>
                    ),
                  }}
                />
              </Grid>
            </Grid>
          </Box>

          {/* Section 2: Employment */}
          <Box
            sx={{
              bgcolor: "background.paper",
              borderRadius: "12px",
              border: "1px solid",
              borderColor: "divider",
              p: 2.5,
            }}
          >
            <SectionLabel step={2} label="Employment Details" color="#0891B2" />
            <Grid container spacing={2}>
              {[
                [
                  "Employment Type",
                  <WorkIcon />,
                  d?.employmentTypes,
                  "employmentType",
                ],
                [
                  "Vendor Company",
                  <BusinessIcon />,
                  d?.vendorCompanies,
                  "vendorCompany",
                ],
                [
                  "Designation",
                  <ApartmentIcon />,
                  d?.designations,
                  "designation",
                ],
                ["Job Level", <TimelineIcon />, d?.jobLevels, "jobLevel"],
                [
                  "Office Location",
                  <LocationOnIcon />,
                  d?.officeLocations,
                  "officeLocation",
                ],
                [
                  "Device Vendor Capability",
                  <MemoryIcon />,
                  d?.deviceVendorCapabilities,
                  "deviceVendorCapability",
                ],
                [
                  "Role Code",
                  <AdminPanelSettingsIcon />,
                  d?.roleCode,
                  "roleCode",
                ],
              ].map(([label, icon, opts, key]) => (
                <Grid size={{ xs: 12, md: 6 }} key={key as string}>
                  <Autocomplete
                    size="small"
                    options={(opts as string[]) || []}
                    value={(form[key as string] as string) || null}
                    onChange={(_, v) =>
                      setForm((p: any) => ({ ...p, [key as string]: v }))
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={label as string}
                        error={!!errors[key as string]}
                        helperText={errors[key as string]}
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: (
                            <>
                              <FieldIcon>{icon as React.ReactNode}</FieldIcon>
                              {params.InputProps.startAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                  />
                </Grid>
              ))}
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  size="small"
                  type="date"
                  label="Date of Joining"
                  fullWidth
                  value={form.dateOfJoining || ""}
                  onChange={(e) =>
                    setForm((p: any) => ({
                      ...p,
                      dateOfJoining: e.target.value,
                    }))
                  }
                  InputLabelProps={{ shrink: true }}
                  error={!!errors.dateOfJoining}
                  helperText={errors.dateOfJoining}
                  InputProps={{
                    startAdornment: (
                      <FieldIcon>
                        <EventIcon />
                      </FieldIcon>
                    ),
                  }}
                />
              </Grid>
            </Grid>
          </Box>
        </Stack>
      </DialogContent>

      {/* Footer */}
      <Box
        sx={{
          px: 3,
          py: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderTop: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Typography variant="caption" color="text.disabled">
          All fields marked as required must be filled
        </Typography>
        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            size="medium"
            onClick={onClose}
            sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 500 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            size="medium"
            onClick={handleUpdate}
            disabled={busy}
            disableElevation
            sx={{
              borderRadius: "8px",
              textTransform: "none",
              fontWeight: 600,
              minWidth: 140,
              px: 3,
            }}
          >
            {updating ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              "Save Changes"
            )}
          </Button>
        </Stack>
      </Box>
    </Dialog>
  );
};

// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Button,
//   Stack,
//   CircularProgress,
// } from "@mui/material";
// import { useEffect, useState } from "react";
// import { toast } from "react-toastify";

// import {
//   useAddNewEmployeeMutation,
//   useUpdateEmployeeMutation,
//   useGetCreateUserDropdownsQuery,
// } from "../../api/teamManagement.api";

// import type { UpdateEmployeeRequest } from "../../types/updateUser.types";
// import { EmployeeBasicForm } from "../common/EmployeeBasicForm";

// interface Props {
//   open: boolean;
//   onClose: () => void;
//   actorUserId: number;
//   mode: "create" | "edit";
//   editData?: any;
// }

// export const CreateEditMemberDialog = ({
//   open,
//   onClose,
//   actorUserId,
//   mode,
//   editData,
// }: Props) => {
//   const isEdit = mode === "edit";

//   const { data: dropdownData } = useGetCreateUserDropdownsQuery();

//   const [addEmployee, { isLoading: creating }] = useAddNewEmployeeMutation();

//   const [updateEmployee, { isLoading: updating }] = useUpdateEmployeeMutation();

//   const [form, setForm] = useState<any>({});
//   const [errors, setErrors] = useState<Record<string, string>>({});

//   /* ================= PREFILL EDIT ================= */

//   useEffect(() => {
//     if (isEdit && editData) {
//       setForm({
//         actorUserId,
//         userId: editData.userId,
//         olmid: editData.olmId || editData.olmid,
//         employeeName: editData.employeeName,
//         emailId: editData.emailId,
//         mobileNo: editData.mobileNo,
//         employmentType: editData.employmentType,
//         vendorCompany: editData.vendorCompany,
//         designation: editData.designation,
//         jobLevel: editData.jobLevel,
//         officeLocation: editData.officeLocation,
//         gender: editData.gender?.toUpperCase(),
//         deviceVendorCapability: editData.deviceVendorCapability,
//         dateOfJoining: editData.dateOfJoining,
//         dateOfLeaving: editData.dateOfLeaving || null,
//         replacementEmpOlmid: null,
//         replacementEmpName: null,
//       });
//     }
//   }, [isEdit, editData, actorUserId]);

//   /* ================= CREATE ================= */

//   const handleCreate = async () => {
//     try {
//       const res = await addEmployee(form).unwrap();
//       toast.success(res.message);
//       onClose();
//     } catch (err: any) {
//       toast.error(err?.data?.message || "Create failed. Please try again.");
//     }
//   };

//   /* ================= UPDATE ================= */

//   const handleUpdate = async () => {
//     try {
//       const payload: UpdateEmployeeRequest = {
//         actorUserId,
//         userId: form.userId,
//         employeeName: form.employeeName,
//         emailId: form.emailId,
//         mobileNo: form.mobileNo,
//         employmentType: form.employmentType,
//         vendorCompany: form.vendorCompany,
//         designation: form.designation,
//         jobLevel: form.jobLevel,
//         officeLocation: form.officeLocation,
//         gender: form.gender?.toUpperCase(),
//         deviceVendorCapability: form.deviceVendorCapability,
//         dateOfJoining: form.dateOfJoining,
//         dateOfLeaving: form.dateOfLeaving || null,
//         replacementEmpOlmid: null,
//         replacementEmpName: null,
//       };

//       const res = await updateEmployee(payload).unwrap();

//       if (res.status === "Success") {
//         toast.success(res.message);
//         onClose();
//       } else {
//         toast.error(res.message);
//       }
//     } catch (err: any) {
//       toast.error(err?.data?.message || "Update failed. Please try again.");
//     }
//   };

//   return (
//     <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
//       <DialogTitle>{isEdit ? "Edit Member" : "Add Member"}</DialogTitle>

//       <DialogContent dividers>
//         <Stack spacing={3}>
//           <EmployeeBasicForm
//             form={form}
//             setForm={setForm}
//             errors={errors}
//             dropdownData={dropdownData}
//             mode={mode}
//           />
//         </Stack>
//       </DialogContent>

//       <DialogActions>
//         <Button onClick={onClose}>Cancel</Button>

//         <Button
//           variant="contained"
//           onClick={isEdit ? handleUpdate : handleCreate}
//           disabled={creating || updating}
//         >
//           {creating || updating ? (
//             <CircularProgress size={20} />
//           ) : isEdit ? (
//             "Update"
//           ) : (
//             "Create"
//           )}
//         </Button>
//       </DialogActions>
//     </Dialog>
//   );
// };
