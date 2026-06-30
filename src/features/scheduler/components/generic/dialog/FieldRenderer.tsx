import React from "react";
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { Controller, type Control, type FieldErrors } from "react-hook-form";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import type { StageFieldConfig } from "../../../types/stageWorkflow.types";
// import type { StageFieldConfig } from "../../../types/stageWorkflow.types";

interface FieldRendererProps {
  field: StageFieldConfig;
  control: Control<any>;
  errors: FieldErrors<any>;
  values: Record<string, any>;
  disabled: boolean;
}

/**
 * Renders exactly one field from a stage's `fields` config. Adding a new
 * field type only means extending the switch below - every stage benefits
 * automatically since they all share this renderer.
 */
export const FieldRenderer: React.FC<FieldRendererProps> = ({
  field,
  control,
  errors,
  values,
  disabled,
}) => {
  if (field.visibleWhen && !field.visibleWhen(values)) return null;

  const isRequired = field.requiredWhen ? field.requiredWhen(values) : field.required;
  const errorMessage = (errors as any)?.[field.name]?.message as string | undefined;

  if (field.type === "readonly") {
    const value = field.deriveValue ? field.deriveValue(values) : values[field.name] ?? "";
    return (
      <TextField
        key={field.name}
        label={field.label}
        size="small"
        fullWidth
        value={value}
        disabled={disabled}
        helperText="Auto-populated"
        InputProps={{
          readOnly: true,
          startAdornment: <PersonOutlineIcon sx={{ mr: 0.75, fontSize: 16 }} />,
          sx: { fontFamily: "monospace", fontSize: 12.5, borderRadius: 1.5 },
        }}
        InputLabelProps={{ sx: { fontSize: 13 } }}
      />
    );
  }

  return (
    <Controller
      key={field.name}
      name={field.name}
      control={control}
      rules={{ required: isRequired ? `${field.label} is required.` : false }}
      render={({ field: rhfField }) => {
        if (field.type === "select") {
          return (
            <FormControl size="small" fullWidth disabled={disabled} error={Boolean(errorMessage)}>
              <InputLabel sx={{ fontSize: 13 }}>
                {field.label}
                {isRequired ? " *" : ""}
              </InputLabel>
              <Select
                {...rhfField}
                label={`${field.label}${isRequired ? " *" : ""}`}
                sx={{ borderRadius: 1.5, fontSize: 13 }}
              >
                {field.options?.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: 13 }}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          );
        }

        // text / textarea
        return (
          <TextField
            {...rhfField}
            disabled={disabled}
            size="small"
            fullWidth
            multiline={field.type === "textarea"}
            rows={field.type === "textarea" ? 3 : undefined}
            label={`${field.label}${isRequired ? " *" : ""}`}
            placeholder={field.placeholder}
            error={Boolean(errorMessage)}
            helperText={errorMessage}
            InputProps={{ sx: { borderRadius: 1.5, fontSize: 13 } }}
            InputLabelProps={{ sx: { fontSize: 13 } }}
          />
        );
      }}
    />
  );
};

export default FieldRenderer;
