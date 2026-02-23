import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  CircularProgress,
} from "@mui/material";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import {
  useAddNewEmployeeMutation,
  useUpdateEmployeeMutation,
  useGetCreateUserDropdownsQuery,
} from "../../api/teamManagement.api";

import type { UpdateEmployeeRequest } from "../../types/updateUser.types";
import { EmployeeBasicForm } from "../common/EmployeeBasicForm";

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

  const { data: dropdownData } = useGetCreateUserDropdownsQuery();

  const [addEmployee, { isLoading: creating }] = useAddNewEmployeeMutation();

  const [updateEmployee, { isLoading: updating }] = useUpdateEmployeeMutation();

  const [form, setForm] = useState<any>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  /* ================= PREFILL EDIT ================= */

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
        replacementEmpOlmid: null,
        replacementEmpName: null,
      });
    }
  }, [isEdit, editData, actorUserId]);

  /* ================= CREATE ================= */

  const handleCreate = async () => {
    try {
      const res = await addEmployee(form).unwrap();
      toast.success(res.message);
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message || "Create failed. Please try again.");
    }
  };

  /* ================= UPDATE ================= */

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
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Update failed. Please try again.");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{isEdit ? "Edit Member" : "Add Member"}</DialogTitle>

      <DialogContent dividers>
        <Stack spacing={3}>
          <EmployeeBasicForm
            form={form}
            setForm={setForm}
            errors={errors}
            dropdownData={dropdownData}
            mode={mode}
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>

        <Button
          variant="contained"
          onClick={isEdit ? handleUpdate : handleCreate}
          disabled={creating || updating}
        >
          {creating || updating ? (
            <CircularProgress size={20} />
          ) : isEdit ? (
            "Update"
          ) : (
            "Create"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
