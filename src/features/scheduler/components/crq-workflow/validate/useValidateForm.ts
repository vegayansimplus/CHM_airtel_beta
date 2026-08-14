import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

import {
  useGetCrqValidationDetailsQuery,
  useSaveCrqValidationDetailsMutation,
} from "../../../api/crqValidationApiSlice";
import {
  NAME_INTERFACE_PAIR_MAX,
  NODE_NAME_MAX,
  type CrqValidationDetails,
} from "../../../types/crqValidation.types";

/** The two editable attributes - everything else on the form is read-only. */
export interface ValidateFormValues {
  nodeName: string;
  nameInterfacePair: string;
}

export type ValidateFieldErrors = Partial<Record<keyof ValidateFormValues, string>>;

const FIELD_LABEL: Record<keyof ValidateFormValues, string> = {
  nodeName: "Node Name",
  nameInterfacePair: "Name Interface Pair",
};

const FIELD_MAX: Record<keyof ValidateFormValues, number> = {
  nodeName: NODE_NAME_MAX,
  nameInterfacePair: NAME_INTERFACE_PAIR_MAX,
};

/**
 * Both fields are optional - the only rule left to enforce client-side is the
 * column width, same as update_validation_details enforces server-side.
 */
const validateField = (field: keyof ValidateFormValues, raw: string): string | undefined => {
  const value = raw.trim();
  if (value.length > FIELD_MAX[field]) {
    return `${FIELD_LABEL[field]} must not exceed ${FIELD_MAX[field]} characters.`;
  }
  return undefined;
};

const toFormValues = (details?: CrqValidationDetails): ValidateFormValues => ({
  nodeName: details?.nodeName ?? "",
  nameInterfacePair: details?.nameInterfacePair ?? "",
});

const readErrorMessage = (err: unknown, fallback: string): string =>
  (err as { data?: { message?: string } })?.data?.message ?? fallback;

export interface ValidateForm {
  details?: CrqValidationDetails;
  values: ValidateFormValues;
  errors: ValidateFieldErrors;
  isLoading: boolean;
  isFetching: boolean;
  isSaving: boolean;
  loadError: string | null;
  saveError: string | null;
  /** True until this CRQ has been validated at least once. */
  isNeverValidated: boolean;
  isDirty: boolean;
  canSave: boolean;
  setValue: (field: keyof ValidateFormValues, value: string) => void;
  touch: (field: keyof ValidateFormValues) => void;
  reset: () => void;
  refetch: () => void;
  save: () => Promise<boolean>;
}

/**
 * State behind the Validate dialog.
 *
 * The read is subscribed only while the dialog is open (`skip`), so opening
 * the cockpit costs nothing and re-opening a CRQ already loaded this session
 * renders straight from the RTK Query cache. Field state is seeded from the
 * fetched row and re-seeded whenever that row changes identity (a different
 * CRQ, or the refreshed row a save returns).
 */
export const useValidateForm = (crqNo: string | null, open: boolean): ValidateForm => {
  const {
    data: details,
    isLoading,
    isFetching,
    error: queryError,
    refetch,
  } = useGetCrqValidationDetailsQuery(
    { crqNo: crqNo ?? "" },
    { skip: !open || !crqNo },
  );

  const [saveValidationDetails, { isLoading: isSaving }] = useSaveCrqValidationDetailsMutation();

  const [values, setValues] = useState<ValidateFormValues>(() => toFormValues());
  const [touched, setTouched] = useState<Partial<Record<keyof ValidateFormValues, boolean>>>({});
  const [saveError, setSaveError] = useState<string | null>(null);

  // Server row is the source of truth for the initial field state; re-seed
  // whenever it arrives or changes (including the row a save returns).
  useEffect(() => {
    setValues(toFormValues(details));
    setTouched({});
    setSaveError(null);
  }, [details?.crqNo, details?.nodeName, details?.nameInterfacePair, details]);

  // Discard unsaved edits when the dialog closes, so re-opening never shows a
  // previous CRQ's half-typed values.
  useEffect(() => {
    if (!open) {
      setTouched({});
      setSaveError(null);
    }
  }, [open]);

  const setValue = useCallback((field: keyof ValidateFormValues, value: string) => {
    // Hard-cap at the column width so the field can never hold a value the
    // procedure would reject.
    setValues((prev) => ({ ...prev, [field]: value.slice(0, FIELD_MAX[field]) }));
    setSaveError(null);
  }, []);

  const touch = useCallback((field: keyof ValidateFormValues) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  const allErrors = useMemo<ValidateFieldErrors>(
    () => ({
      nodeName: validateField("nodeName", values.nodeName),
      nameInterfacePair: validateField("nameInterfacePair", values.nameInterfacePair),
    }),
    [values],
  );

  // Only surface an error once the user has engaged with that field, so a
  // never-validated CRQ doesn't open covered in red.
  const errors = useMemo<ValidateFieldErrors>(
    () => ({
      nodeName: touched.nodeName ? allErrors.nodeName : undefined,
      nameInterfacePair: touched.nameInterfacePair ? allErrors.nameInterfacePair : undefined,
    }),
    [allErrors, touched],
  );

  const isValid = !allErrors.nodeName && !allErrors.nameInterfacePair;

  const isDirty =
    values.nodeName.trim() !== (details?.nodeName ?? "").trim() ||
    values.nameInterfacePair.trim() !== (details?.nameInterfacePair ?? "").trim();

  const isNeverValidated = !!details && !details.nodeName && !details.nameInterfacePair;

  const reset = useCallback(() => {
    setValues(toFormValues(details));
    setTouched({});
    setSaveError(null);
  }, [details]);

  const save = useCallback(async (): Promise<boolean> => {
    if (!crqNo) return false;

    if (!isValid) {
      setTouched({ nodeName: true, nameInterfacePair: true });
      return false;
    }

    try {
      await saveValidationDetails({
        crqNo,
        // Trimmed here as well as in the procedure, so what the user sees
        // saved is exactly what was sent.
        nodeName: values.nodeName.trim(),
        nameInterfacePair: values.nameInterfacePair.trim(),
      }).unwrap();
      toast.success("Validation details saved successfully.");
      return true;
    } catch (err) {
      const message = readErrorMessage(err, "Failed to save validation details. Please try again.");
      setSaveError(message);
      toast.error(message);
      return false;
    }
  }, [crqNo, isValid, values, saveValidationDetails]);

  return {
    details,
    values,
    errors,
    isLoading,
    isFetching,
    isSaving,
    loadError: queryError
      ? readErrorMessage(queryError, "Failed to load validation details.")
      : null,
    saveError,
    isNeverValidated,
    isDirty,
    canSave: isValid && isDirty && !isSaving && !isFetching,
    setValue,
    touch,
    reset,
    refetch,
    save,
  };
};
