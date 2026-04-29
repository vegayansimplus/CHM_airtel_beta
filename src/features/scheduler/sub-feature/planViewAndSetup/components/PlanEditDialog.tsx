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
} from "@mui/material";
import { type TransitionProps } from "@mui/material/transitions";
import CloseIcon from "@mui/icons-material/Close";
import EditNoteOutlinedIcon from "@mui/icons-material/EditNoteOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import { type PlanViewRow } from "../api/planApiSlice"; 

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
}

export const PlanEditDialog: React.FC<PlanEditDialogProps> = ({
  open,
  onClose,
  onSave,
  data,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  // Local state to hold the form data being edited
  const [formData, setFormData] = useState<PlanViewRow | null>(null);

  useEffect(() => {
    if (data) {
      setFormData({ ...data });
    } else {
      setFormData(null);
    }
  }, [data, open]);

  if (!data || !formData) return null;

  const handleChange = (key: keyof PlanViewRow, value: string) => {
    setFormData((prev) => (prev ? { ...prev, [key]: value } : null));
  };

  const handleSaveClick = () => {
    if (formData) {
      onSave(formData);
      onClose();
    }
  };

  // Define fields that shouldn't be editable by the user
  const readOnlyFields = ["id", "planId", "createdAt", "updatedAt"];

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
            const label = key.replace(/([A-Z])/g, " $1").trim(); // camelCase to Title Case

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
                <TextField
                  fullWidth
                  disabled={isReadOnly}
                  size="small"
                  variant="outlined"
                  placeholder={`Enter ${label.toLowerCase()}`}
                  value={value !== null && value !== undefined ? value : ""}
                  onChange={(e) =>
                    handleChange(key as keyof PlanViewRow, e.target.value)
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
          sx={{ fontWeight: 600, px: 3, borderRadius: 2 }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSaveClick}
          variant="contained"
          color="primary"
          startIcon={<SaveOutlinedIcon />}
          disableElevation
          sx={{
            fontWeight: 600,
            px: 3,
            borderRadius: 2,
            textTransform: "none",
          }}
        >
          Save Changes
        </Button>
      </Box>
    </Dialog>
  );
};
