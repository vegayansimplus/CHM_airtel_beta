import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  Close,
  Person,
  Work,
  Security,
  FactCheck,
  CheckCircle,
} from "@mui/icons-material";
import { AnimatePresence, motion } from "framer-motion";
import { AppStepper } from "../../../components/ui/AppStepper/AppStepper";
import RoleBadge from "./RoleBadge";
import type { Role } from "../types/user";

export interface NewUserInput {
  name: string;
  employeeId: string;
  email: string;
  phone: string;
  function: string;
  manager: string;
  role: Role;
  permissions: string[];
}

const DEFAULT_VALUES: NewUserInput = {
  name: "",
  employeeId: "",
  email: "",
  phone: "",
  function: "",
  manager: "",
  role: "Team Member",
  permissions: [],
};

const ALL_PERMISSIONS = [
  "View Reports",
  "Manage Tasks",
  "Approve Changes",
  "User Management",
  "System Settings",
];

const STEPS = [
  { id: 1, label: "Basic Info", icon: <Person /> },
  { id: 2, label: "Department", icon: <Work /> },
  { id: 3, label: "Permissions", icon: <Security /> },
  { id: 4, label: "Review", icon: <FactCheck /> },
];

export interface AddUserWizardProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (user: NewUserInput) => void;
  departments: string[];
  managers: string[];
}

export default function AddUserWizard({
  open,
  onClose,
  onSubmit,
  departments,
  managers,
}: AddUserWizardProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [success, setSuccess] = useState(false);
  const {
    control,
    handleSubmit,
    trigger,
    reset,
    watch,
    formState: { errors },
  } = useForm<NewUserInput>({ defaultValues: DEFAULT_VALUES, mode: "onBlur" });

  useEffect(() => {
    if (!open) {
      setActiveStep(0);
      setSuccess(false);
      reset(DEFAULT_VALUES);
    }
  }, [open, reset]);

  const values = watch();

  const handleNext = async () => {
    if (activeStep === 0) {
      const ok = await trigger(["name", "employeeId", "email"]);
      if (!ok) return;
    }
    if (activeStep === 1) {
      const ok = await trigger(["function", "role"]);
      if (!ok) return;
    }
    setActiveStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const handleBack = () => setActiveStep((s) => Math.max(s - 1, 0));

  const submit = handleSubmit((data) => {
    setSuccess(true);
    setTimeout(() => {
      onSubmit(data);
      onClose();
    }, 1100);
  });

  return (
    <Dialog
      open={open}
      onClose={success ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: "20px" } }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 3,
          pt: 2.5,
          pb: 1,
        }}
      >
        <Typography sx={{ fontSize: 17, fontWeight: 800 }}>Add New User</Typography>
        {!success && (
          <IconButton size="small" onClick={onClose}>
            <Close fontSize="small" />
          </IconButton>
        )}
      </Box>

      <DialogContent sx={{ pt: 1 }}>
        <AnimatePresence mode="wait">
          {success ? (
            <Box
              component={motion.div}
              key="success"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              sx={{ py: 6, textAlign: "center" }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 18 }}
              >
                <CheckCircle sx={{ fontSize: 72, color: "#10B981" }} />
              </motion.div>
              <Typography sx={{ fontSize: 17, fontWeight: 800, mt: 2 }}>
                User added successfully
              </Typography>
              <Typography sx={{ fontSize: 13, color: "text.secondary", mt: 0.5 }}>
                {values.name} has been added to your organization.
              </Typography>
            </Box>
          ) : (
            <motion.div
              key={`step-${activeStep}`}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.2 }}
            >
              <AppStepper steps={STEPS} activeStep={activeStep} sx={{ mb: 3 }} />

              {activeStep === 0 && (
                <Stack gap={2}>
                  <Controller
                    name="name"
                    control={control}
                    rules={{ required: "Full name is required" }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Full Name"
                        size="small"
                        fullWidth
                        error={!!errors.name}
                        helperText={errors.name?.message}
                      />
                    )}
                  />
                  <Controller
                    name="employeeId"
                    control={control}
                    rules={{ required: "Employee ID is required" }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Employee ID"
                        size="small"
                        fullWidth
                        error={!!errors.employeeId}
                        helperText={errors.employeeId?.message}
                      />
                    )}
                  />
                  <Controller
                    name="email"
                    control={control}
                    rules={{
                      required: "Email is required",
                      pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email" },
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Email Address"
                        size="small"
                        fullWidth
                        error={!!errors.email}
                        helperText={errors.email?.message}
                      />
                    )}
                  />
                  <Controller
                    name="phone"
                    control={control}
                    render={({ field }) => (
                      <TextField {...field} label="Phone Number" size="small" fullWidth />
                    )}
                  />
                </Stack>
              )}

              {activeStep === 1 && (
                <Stack gap={2}>
                  <Controller
                    name="function"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <FormControl size="small" fullWidth error={!!errors.function}>
                        <InputLabel>Department</InputLabel>
                        <Select {...field} label="Department">
                          {departments.map((d) => (
                            <MenuItem key={d} value={d}>
                              {d}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  />
                  <Controller
                    name="manager"
                    control={control}
                    render={({ field }) => (
                      <FormControl size="small" fullWidth>
                        <InputLabel>Manager</InputLabel>
                        <Select {...field} label="Manager">
                          <MenuItem value="">— None —</MenuItem>
                          {managers.map((m) => (
                            <MenuItem key={m} value={m}>
                              {m}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  />
                  <Controller
                    name="role"
                    control={control}
                    render={({ field }) => (
                      <FormControl size="small" fullWidth>
                        <InputLabel>Role</InputLabel>
                        <Select {...field} label="Role">
                          <MenuItem value="Team Member">Team Member</MenuItem>
                          <MenuItem value="Team Lead">Team Lead</MenuItem>
                          <MenuItem value="Super Admin">Super Admin</MenuItem>
                        </Select>
                      </FormControl>
                    )}
                  />
                </Stack>
              )}

              {activeStep === 2 && (
                <Stack gap={0.5}>
                  <Typography sx={{ fontSize: 12.5, color: "text.secondary", mb: 1 }}>
                    Select the permissions and groups this user should have access to.
                  </Typography>
                  <Controller
                    name="permissions"
                    control={control}
                    render={({ field }) => (
                      <>
                        {ALL_PERMISSIONS.map((p) => (
                          <FormControlLabel
                            key={p}
                            control={
                              <Checkbox
                                size="small"
                                checked={field.value.includes(p)}
                                onChange={(e) => {
                                  field.onChange(
                                    e.target.checked
                                      ? [...field.value, p]
                                      : field.value.filter((v) => v !== p),
                                  );
                                }}
                              />
                            }
                            label={<Typography sx={{ fontSize: 13.5 }}>{p}</Typography>}
                          />
                        ))}
                      </>
                    )}
                  />
                </Stack>
              )}

              {activeStep === 3 && (
                <Stack gap={1.5}>
                  <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: "text.secondary" }}>
                    REVIEW DETAILS
                  </Typography>
                  {[
                    ["Full Name", values.name || "—"],
                    ["Employee ID", values.employeeId || "—"],
                    ["Email", values.email || "—"],
                    ["Phone", values.phone || "—"],
                    ["Department", values.function || "—"],
                    ["Manager", values.manager || "—"],
                  ].map(([label, val]) => (
                    <Stack key={label} direction="row" justifyContent="space-between">
                      <Typography sx={{ fontSize: 13, color: "text.secondary" }}>{label}</Typography>
                      <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{val}</Typography>
                    </Stack>
                  ))}
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography sx={{ fontSize: 13, color: "text.secondary" }}>Role</Typography>
                    <RoleBadge role={values.role} size="small" />
                  </Stack>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Typography sx={{ fontSize: 13, color: "text.secondary" }}>Permissions</Typography>
                    <Typography sx={{ fontSize: 13, fontWeight: 600, textAlign: "right", maxWidth: 220 }}>
                      {values.permissions.length ? values.permissions.join(", ") : "None"}
                    </Typography>
                  </Stack>
                </Stack>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>

      {!success && (
        <Stack direction="row" justifyContent="space-between" px={3} pb={2.5} pt={1}>
          <Button
            onClick={activeStep === 0 ? onClose : handleBack}
            variant="outlined"
            color="inherit"
            sx={{ borderRadius: "10px" }}
          >
            {activeStep === 0 ? "Cancel" : "Back"}
          </Button>
          {activeStep < STEPS.length - 1 ? (
            <Button
              onClick={handleNext}
              variant="contained"
              sx={{
                borderRadius: "10px",
                fontWeight: 700,
                background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
              }}
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={submit}
              variant="contained"
              startIcon={<CheckCircle sx={{ fontSize: 18 }} />}
              sx={{
                borderRadius: "10px",
                fontWeight: 700,
                background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
              }}
            >
              Add User
            </Button>
          )}
        </Stack>
      )}
    </Dialog>
  );
}
