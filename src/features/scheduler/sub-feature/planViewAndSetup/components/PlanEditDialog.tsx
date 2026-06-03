import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
  Divider,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  Avatar,
  Slide,
  useTheme,
  alpha,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import { type TransitionProps } from "@mui/material/transitions";
import CloseIcon from "@mui/icons-material/Close";
import EditNoteOutlinedIcon from "@mui/icons-material/EditNoteOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import { toast } from "react-toastify";
import { type PlanViewRow, useUpdatePlanMutation } from "../api/planApiSlice";
import { authStorage } from "../../../../../app/store/auth.storage";

export interface FilterOption {
  label: string;
  value: number;
} 

// Smooth Slide-up transition for the dialog
const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface PlanEditDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (updatedData: PlanViewRow) => void;
  data: PlanViewRow | null;
  chmDomainOptions?: FilterOption[];
  chmSubDomainOptions?: FilterOption[];
}

interface FormDataState extends PlanViewRow {
  chmDomainId?: number;
  chmSubDomainId?: number;
}

export const PlanEditDialog: React.FC<PlanEditDialogProps> = ({
  open,
  onClose,
  onSave,
  data,
  chmDomainOptions = [],
  chmSubDomainOptions = [],
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [formData, setFormData] = useState<FormDataState | null>(null);
  const [updatePlan, { isLoading: isUpdating }] = useUpdatePlanMutation();
  const loggedUser = authStorage.getUser();

  // CHANGE_IMPACT options
  const CHANGE_IMPACT_OPTIONS = ["SA", "NSA"];

  useEffect(() => {
    if (data) {
      // Match chmDomain string to its ID from options
      const matchedDomainId = chmDomainOptions.find(
        (opt) => opt.label === data.chmDomain,
      )?.value;

      // Match chmSubDomain string to its ID from options
      const matchedSubDomainId = chmSubDomainOptions.find(
        (opt) => opt.label === data.chmSubDomain,
      )?.value;

      setFormData({
        ...data,
        chmDomainId: matchedDomainId,
        chmSubDomainId: matchedSubDomainId,
      });
    } else {
      setFormData(null);
    }
  }, [data, open, chmDomainOptions, chmSubDomainOptions]);

  if (!data || !formData) return null;

  const handleChange = (key: keyof FormDataState, value: any) => {
    setFormData((prev) => (prev ? { ...prev, [key]: value } : null));
  };

  const handleSaveClick = async () => {
    if (formData) {
      try {
        const updatePayload = {
          actorUserId: loggedUser?.id ?? 0,
          planId: formData.planId,
          planType: formData.planType,
          status: formData.status,
          chmDomainId: formData.chmDomainId ?? 0,
          chmSubDomain: formData.chmSubDomainId ?? 0,
          networkDomain: formData.networkDomain,
          layer: formData.layer,
          planVendor: formData.planVendor,
          changeImpact: formData.changeImpact,
        };

        const res = await updatePlan(updatePayload).unwrap();
        // Show toast notification on success
        try {
          const msg = (res && (res.message || (res.data && res.data.message))) || "Plan Updated Successfully";
          toast.success(msg);
        } catch (e) {
          toast.success("Plan Updated Successfully");
        }
        onSave(formData);
        onClose();
      } catch (error) {
        console.error("Failed to update plan:", error);
        // Attempt to show an error toast
        try {
          // Try to extract message from common error shapes
          const errMsg = (error as any)?.data?.message || (error as any)?.message || "Failed to update plan";
          toast.error(errMsg);
        } catch (e) {
          toast.error("Failed to update plan");
        }
      }
    }
  };

  // Define fields that shouldn't be editable by the user
  const readOnlyFields = ["id", "planId", "createdAt", "updatedAt", "createdBy"];

  // Fields that are dropdown selects
  const dropdownFields: Record<string, FilterOption[]> = {
    chmDomain: chmDomainOptions,
    chmSubDomain: chmSubDomainOptions,
    changeImpact: CHANGE_IMPACT_OPTIONS.map((v) => ({ label: v, value: v as any })),
  };

  // Map display fields to actual form data keys
  const fieldMapping: Record<string, keyof FormDataState> = {
    chmDomain: "chmDomainId",
    chmSubDomain: "chmSubDomainId",
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md" 
      fullWidth
      TransitionComponent={Transition}
      PaperProps={{
        sx: {
          borderRadius: 3, 
          backgroundImage: "none",
          boxShadow: isDark
            ? "0 24px 48px rgba(0,0,0,0.5)"
            : "0 24px 48px rgba(0,0,0,0.08)",
        },
      }}
    >
      {/* ── Custom Header ── */}
      <DialogTitle sx={{ p: 0 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 3,
            py: 2.5,
            bgcolor: isDark
              ? alpha(theme.palette.background.paper, 0.4)
              : alpha(theme.palette.primary.main, 0.02),
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar
              sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: "primary.main",
                width: 44,
                height: 44,
              }}
            >
              <EditNoteOutlinedIcon fontSize="medium" />
            </Avatar>
            <Box>
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, fontSize: "1.1rem", lineHeight: 1.2 }}
              >
                Edit Plan Details
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                Modify the specific fields for this record below.
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              color: "text.secondary",
              "&:hover": {
                bgcolor: alpha(theme.palette.error.main, 0.1),
                color: "error.main",
              },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
        <Divider />
      </DialogTitle>

      {/* ── Form Content ── */}
      <DialogContent sx={{ p: 4 }}>
        <Grid container spacing={3}>
          {Object.entries(formData).map(([key, value]) => {
            const isReadOnly = readOnlyFields.includes(key);
            const isDropdown =
              key === "chmDomain" ||
              key === "chmSubDomain" ||
              key === "changeImpact";

            if (key === "chmDomainId" || key === "chmSubDomainId") return null; // Skip IDs

            const displayKey =
              key === "chmDomainId"
                ? "chmDomain"
                : key === "chmSubDomainId"
                  ? "chmSubDomain"
                  : key;

            const label = displayKey
              .replace(/([A-Z])/g, " $1")
              .trim(); // camelCase to Title Case

            return (
              <Grid size={{ xs: 12, sm: 6 }} key={key}>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 600,
                    color: "text.secondary",
                    mb: 0.75,
                    display: "block",
                    textTransform: "capitalize",
                  }}
                >
                  {label}
                </Typography>

                {isDropdown ? (
                  <TextField
                    select
                    fullWidth
                    disabled={isReadOnly}
                    size="small"
                    variant="outlined"
                    value={
                      key === "chmDomain"
                        ? formData.chmDomainId ?? ""
                        : key === "chmSubDomain"
                          ? formData.chmSubDomainId ?? ""
                          : value ?? ""
                    }
                    onChange={(e) =>
                      handleChange(
                        key === "chmDomain"
                          ? "chmDomainId"
                          : key === "chmSubDomain"
                            ? "chmSubDomainId"
                            : (key as keyof FormDataState),
                        e.target.value,
                      )
                    }
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        bgcolor: isReadOnly
                          ? alpha(theme.palette.action.disabledBackground, 0.5)
                          : theme.palette.background.paper,
                        transition: "all 0.2s ease-in-out",
                        "&:hover fieldset": {
                          borderColor: isReadOnly
                            ? "transparent"
                            : theme.palette.primary.main,
                        },
                        "&.Mui-focused fieldset": {
                          borderWidth: "1.5px",
                        },
                      },
                    }}
                  >
                    {dropdownFields[displayKey]?.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                ) : (
                  <TextField
                    fullWidth
                    disabled={isReadOnly}
                    size="small"
                    variant="outlined"
                    placeholder={`Enter ${label.toLowerCase()}`}
                    value={value !== null && value !== undefined ? value : ""}
                    onChange={(e) =>
                      handleChange(key as keyof FormDataState, e.target.value)
                    }
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        bgcolor: isReadOnly
                          ? alpha(theme.palette.action.disabledBackground, 0.5)
                          : theme.palette.background.paper,
                        transition: "all 0.2s ease-in-out",
                        "&:hover fieldset": {
                          borderColor: isReadOnly
                            ? "transparent"
                            : theme.palette.primary.main,
                        },
                        "&.Mui-focused fieldset": {
                          borderWidth: "1.5px",
                        },
                      },
                    }}
                  />
                )}
              </Grid>
            );
          })}
        </Grid>
      </DialogContent>

      {/* ── Action Footer ── */}
      <Box
        sx={{
          px: 3,
          py: 2,
          bgcolor: isDark
            ? alpha(theme.palette.background.default, 0.5)
            : theme.palette.grey[50],
          borderTop: `1px solid ${theme.palette.divider}`,
          display: "flex",
          justifyContent: "flex-end",
          gap: 1.5,
        }}
      >
        <Button
          onClick={onClose}
          variant="text"
          color="inherit"
          disabled={isUpdating}
          sx={{ fontWeight: 600, px: 3, borderRadius: 2 }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSaveClick}
          variant="contained"
          color="primary"
          startIcon={
            isUpdating ? (
              <CircularProgress size={20} />
            ) : (
              <SaveOutlinedIcon />
            )
          }
          disabled={isUpdating}
          disableElevation
          sx={{
            fontWeight: 600,
            px: 3,
            borderRadius: 2,
            textTransform: "none",
          }}
        >
          {isUpdating ? "Saving..." : "Save Changes"}
        </Button>
      </Box>
    </Dialog>
  );
};
