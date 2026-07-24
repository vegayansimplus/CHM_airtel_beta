import React from "react";
import {
  Box,
  Chip,
  FormControl,
  FormControlLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import DnsOutlinedIcon from "@mui/icons-material/DnsOutlined";
import GpsFixedRoundedIcon from "@mui/icons-material/GpsFixedRounded";
import { Controller, type Control, type FieldErrors } from "react-hook-form";
import type { Colors } from "../../../types/colorTypes";
import type { ResolvedAttribute } from "../types/attributeUpdate.types";
import type { AttributeFormValues } from "../utils/attributeUpdate.utils";
import { MandatoryBadge } from "./MandatoryBadge";

interface AttributeRowProps {
  attribute: ResolvedAttribute;
  /** react-hook-form control for the dialog's single stage-wide form
   * (a throwaway, unused form instance for view-only cards). */
  control: Control<AttributeFormValues>;
  errors: FieldErrors<AttributeFormValues>;
  /** Forces the read-only display branch regardless of the attribute's own
   * flags - set for history/completed stage cards, which are never editable. */
  viewOnly?: boolean;
  colors: Colors;
}

const FlagIcon: React.FC<{ title: string; icon: React.ReactNode; color: string }> = ({
  title,
  icon,
  color,
}) => (
  <Tooltip title={title} arrow placement="top">
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 16,
        height: 16,
        color,
      }}
    >
      {icon}
    </Box>
  </Tooltip>
);

const inputSx = { fontSize: 12.75, borderRadius: "8px" };

/**
 * One editable attribute of the selected stage, rendered as a compact,
 * self-contained field tile (label + badges on top, input below) bound to
 * the dialog's react-hook-form instance under
 * `${attribute.system}.${attribute.field}`. Read-only / backend-set /
 * auto-set attributes render as a disabled display of their live value
 * instead of an input.
 */
export const AttributeRow: React.FC<AttributeRowProps> = React.memo(function AttributeRow({
  attribute,
  control,
  errors,
  viewOnly,
  colors,
}) {
  const isDisabled =
    viewOnly || attribute.readOnly || attribute.isBackend || !!attribute.autoSetFrom;
  const required = attribute.mandatoryLevel === "mandatory";
  const name = `${attribute.system}.${attribute.field}`;
  const errorMessage = (errors as any)?.[attribute.system]?.[attribute.field]?.message as
    | string
    | undefined;

  const autoSetCaption =
    attribute.autoSetFrom === "cmsStage"
      ? "Auto-set from current stage"
      : attribute.autoSetFrom === "remedyStatus"
        ? "Auto-set from Remedy status"
        : attribute.autoSetFrom === "crqNo"
          ? "Auto-set from CRQ number"
          : undefined;

  return (
    <Box
      sx={{
        p: 1.1,
        borderRadius: colors.radiusL,
        border: `1px solid ${colors.border}`,
        bgcolor: isDisabled ? colors.surface2 : colors.surface,
        opacity: attribute.isBackend ? 0.6 : 1,
        transition: "border-color .15s ease, box-shadow .15s ease",
        minWidth: 0,
        ...(!isDisabled && {
          "&:hover": { borderColor: colors.borderHover },
          "&:focus-within": {
            borderColor: colors.accent,
            boxShadow: `0 0 0 3px ${colors.accentDim}`,
          },
        }),
      }}
    >
      <Stack direction="row" alignItems="center" gap={0.6} sx={{ mb: 0.6 }}>
        {!isDisabled && (
          <MandatoryBadge level={attribute.mandatoryLevel} rawLabel={attribute.mandatory} />
        )}
        <Typography
          component="span"
          noWrap
          title={attribute.name}
          sx={{
            fontSize: 12.25,
            fontWeight: 600,
            color: colors.textSecondary,
            letterSpacing: 0.1,
            flex: 1,
            minWidth: 0,
          }}
        >
          {attribute.name}
        </Typography>
        {attribute.readOnly && (
          <FlagIcon
            title="Read-only"
            icon={<LockOutlinedIcon sx={{ fontSize: 13 }} />}
            color={colors.textDim}
          />
        )}
        {attribute.isBackend && (
          <FlagIcon
            title="Set by backend"
            icon={<DnsOutlinedIcon sx={{ fontSize: 13 }} />}
            color={colors.textDim}
          />
        )}
        {attribute.autoSetFrom && (
          <FlagIcon
            title={autoSetCaption ?? "Auto-set"}
            icon={<GpsFixedRoundedIcon sx={{ fontSize: 12 }} />}
            color={colors.accent}
          />
        )}
      </Stack>

      {isDisabled ? (
        <TextField
          size="small"
          fullWidth
          value={attribute.autoSetValue ?? attribute.value ?? ""}
          disabled
          placeholder="Not yet saved"
          helperText={autoSetCaption}
          InputProps={{ sx: inputSx }}
          FormHelperTextProps={{ sx: { fontSize: 10.5, mx: 0, mt: 0.4 } }}
        />
      ) : (
        <Controller
          name={name as `remedy.${string}` | `cab.${string}` | `planningTool.${string}`}
          control={control}
          rules={{ required: required ? `${attribute.name} is required.` : false }}
          render={({ field }) => {
            if (attribute.type === "Dropdown") {
              return (
                <FormControl size="small" fullWidth error={Boolean(errorMessage)}>
                  <Select
                    {...field}
                    value={field.value ?? ""}
                    displayEmpty
                    sx={{ ...inputSx, borderRadius: "8px" }}
                  >
                    <MenuItem value="" sx={{ fontSize: 12.75 }}>
                      <em style={{ opacity: 0.6 }}>Select…</em>
                    </MenuItem>
                    {attribute.values?.map((opt) => (
                      <MenuItem key={opt} value={opt} sx={{ fontSize: 12.75 }}>
                        {opt}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              );
            }

            if (attribute.type === "Multi Select Dropdown") {
              const value: string[] = Array.isArray(field.value) ? field.value : [];
              return (
                <FormControl size="small" fullWidth error={Boolean(errorMessage)}>
                  <Select
                    {...field}
                    multiple
                    value={value}
                    displayEmpty
                    renderValue={(selected) =>
                      (selected as string[]).length ? (
                        <Stack direction="row" flexWrap="wrap" gap={0.4}>
                          {(selected as string[]).map((v) => (
                            <Chip
                              key={v}
                              label={v}
                              size="small"
                              sx={{ height: 18, fontSize: 10.5, "& .MuiChip-label": { px: 0.7 } }}
                            />
                          ))}
                        </Stack>
                      ) : (
                        <em style={{ opacity: 0.6, fontSize: 12.75 }}>Select…</em>
                      )
                    }
                    sx={{ ...inputSx, borderRadius: "8px" }}
                  >
                    {attribute.values?.map((opt) => (
                      <MenuItem key={opt} value={opt} sx={{ fontSize: 12.75 }}>
                        {opt}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              );
            }

            if (attribute.type === "Radio Button") {
              return (
                <RadioGroup {...field} value={field.value ?? ""} row sx={{ gap: 0.25 }}>
                  {attribute.values?.map((opt) => (
                    <FormControlLabel
                      key={opt}
                      value={opt}
                      control={<Radio size="small" sx={{ p: 0.5 }} />}
                      label={<Typography sx={{ fontSize: 12.5 }}>{opt}</Typography>}
                      sx={{ mr: 1.25 }}
                    />
                  ))}
                </RadioGroup>
              );
            }

            if (attribute.type === "Date Time") {
              return (
                <TextField
                  {...field}
                  value={field.value ?? ""}
                  type="datetime-local"
                  size="small"
                  fullWidth
                  error={Boolean(errorMessage)}
                  helperText={errorMessage}
                  InputProps={{ sx: inputSx }}
                  InputLabelProps={{ shrink: true }}
                  FormHelperTextProps={{ sx: { fontSize: 10.5, mx: 0, mt: 0.4 } }}
                />
              );
            }

            // Text / Numbers
            return (
              <TextField
                {...field}
                value={field.value ?? ""}
                type={attribute.type === "Numbers" ? "number" : "text"}
                size="small"
                fullWidth
                error={Boolean(errorMessage)}
                helperText={errorMessage}
                InputProps={{ sx: inputSx }}
                FormHelperTextProps={{ sx: { fontSize: 10.5, mx: 0, mt: 0.4 } }}
              />
            );
          }}
        />
      )}
    </Box>
  );
});

export default AttributeRow;
