import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  CircularProgress,
  Typography,
  Box,
  Divider,
} from "@mui/material";

import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";

import { useState, useEffect, useMemo } from "react";
import { toast } from "react-toastify";

import {
  useAddNewEmployeeMutation,
  useGetCreateUserDropdownsQuery,
} from "../../api/teamManagement.api";

import { useGetOrgHierarchyByUserQuery } from "../../../orgHierarchy/api/orgHierarchy.api";

import type { CreateEmployeeRequest } from "../../types/createUser.types";
import type { OrgFilterValues } from "../../../orgHierarchy/types/orgHierarchy.types";

import { EmployeeBasicForm } from "../common/EmployeeBasicForm";
import { HierarchySelector } from "../common/HierarchySelector";

interface Props {
  open: boolean;
  onClose: () => void;
  actorUserId: number;
}

export const AddMemberDialog = ({ open, onClose, actorUserId }: Props) => {
  /* ================= API ================= */

  const { data: dropdownData, isLoading: dropdownLoading } =
    useGetCreateUserDropdownsQuery();

  const { data: hierarchyData, isLoading: hierarchyLoading } =
    useGetOrgHierarchyByUserQuery();

  const [addEmployee, { isLoading }] = useAddNewEmployeeMutation();

  /* ================= INITIAL FORM ================= */

  const initialForm: CreateEmployeeRequest = useMemo(
    () => ({
      actorUserId,
      olmid: "",
      employeeName: "",
      emailId: "",
      mobileNo: "",
      employmentType: "",
      vendorCompany: "",
      designation: "",
      jobLevel: "",
      officeLocation: "",
      gender: "Male",
      deviceVendorCapability: "",
      dateOfJoining: "",
      password: "",
      roleId: 5,
      verticalId: 0,
      functionId: 0,
      domainId: 0,
      subDomainId: 0,
      roleCode: "",
    }),
    [actorUserId],
  );

  /* ================= STATE ================= */

  const [form, setForm] = useState<CreateEmployeeRequest>(initialForm);

  const [hierarchy, setHierarchy] = useState<OrgFilterValues>({});

  const [errors, setErrors] = useState<Record<string, string>>({});

  /* ================= RESET ================= */

  const resetForm = () => {
    setForm(initialForm);
    setHierarchy({});
    setErrors({});
  };

  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  /* ================= VALIDATION ================= */

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    const requiredFields: (keyof CreateEmployeeRequest)[] = [
      "olmid",
      "employeeName",
      "emailId",
      "mobileNo",
      "employmentType",
      "vendorCompany",
      "designation",
      "jobLevel",
      "officeLocation",
      "deviceVendorCapability",
      "dateOfJoining",
      "roleCode",
      
    ];

    requiredFields.forEach((field) => {
      if (!form[field] || String(form[field]).trim() === "") {
        newErrors[field] = "This field is required";
      }
    });

    if (form.olmid && !/^[A-Za-z0-9]{8}$/.test(form.olmid)) {
      newErrors.olmid = "OLM ID must be exactly 8 alphanumeric characters";
    }

    if (
      form.emailId &&
      !/^[A-Za-z0-9._%+-]+@airtel\.com$/i.test(form.emailId)
    ) {
      newErrors.emailId = "Email must end with @airtel.com";
    }

    if (form.mobileNo && !/^[6-9]\d{9}$/.test(form.mobileNo)) {
      newErrors.mobileNo = "Mobile must be 10 digits and start with 6-9";
    }

    if (!hierarchy.vertical) newErrors.vertical = "Vertical required";

    if (!hierarchy.teamFunction)
      newErrors.teamFunction = "Team Function required";

    if (!hierarchy.domain) newErrors.domain = "Domain required";

    if (!hierarchy.subDomain) newErrors.subDomain = "Sub Domain required";

    if (!form.roleCode) newErrors.roleCode = "Role Code required";
  
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast.error("Please fix validation errors before submitting.");
      return false;
    }

    return true;
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const payload: CreateEmployeeRequest = {
      ...form,
      actorUserId,
      verticalId: hierarchy.vertical!,
      functionId: hierarchy.teamFunction!,
      domainId: hierarchy.domain!,
      subDomainId: hierarchy.subDomain!,
    };

    try {
      const res = await addEmployee(payload).unwrap();

      if (res.message?.toLowerCase().includes("success")) {
        toast.success("Employee created successfully");
        resetForm();
        onClose();
      } else {
        toast.error(res.message || "Creation failed");
      }
    } catch (err: any) {
      toast.error(
        err?.data?.message || "Failed to create employee. Please try again.",
      );
    }
  };

  /* ================= UI ================= */

  return (
    <Dialog
      open={open}
      onClose={() => {
        resetForm();
        onClose();
      }}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          borderRadius: 4,
          overflow: "hidden",
          // background:
          //   "linear-gradient(145deg, rgba(255,255,255,0.9), rgba(255,255,255,0.6))",
          backdropFilter: "blur(14px)",
        },
      }}
    >
      {/* HEADER */}
      <DialogTitle
        sx={{
          px: 3,
          py: 2,
          background: "rgba(0,0,0,0.02)",
          borderBottom: "1px solid rgba(0,0,0,0.05)",
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <PersonAddAltIcon color="primary" />
          <Typography variant="h6" fontWeight={600}>
            Add New Team Member
          </Typography>
        </Stack>
      </DialogTitle>

      {/* BODY */}
      <DialogContent sx={{ pl: 3, pr: 3, py: 2 }}>
        <Stack spacing={1}>
          <Box>
            <EmployeeBasicForm
              form={form}
              setForm={setForm}
              errors={errors}
              dropdownData={dropdownData}
            />
          </Box>

          <Divider />

          <Box>
            {/* <Typography variant="subtitle1" fontWeight={600} mb={0}>
              Organization Hierarchy
            </Typography> */}

            <HierarchySelector
              hierarchy={hierarchy}
              setHierarchy={setHierarchy}
              hierarchyData={hierarchyData}
              loading={hierarchyLoading}
              errors={errors}
            />
          </Box>
        </Stack>
      </DialogContent>

      {/* FOOTER */}
      <DialogActions
        sx={{
          px: 3,
          py: 2,
          borderTop: "1px solid rgba(0,0,0,0.05)",
          // background: "rgba(255,255,255,0.7)",
          backdropFilter: "blur(8px)",
        }}
      >
        <Button
          variant="outlined"
          onClick={() => {
            resetForm();
            onClose();
          }}
        >
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isLoading || dropdownLoading || hierarchyLoading}
          sx={{ minWidth: 140 }}
        >
          {isLoading ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            "Add Member"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
