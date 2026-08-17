import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  Autocomplete,
  Box,
  Chip,
  LinearProgress,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";

import type { Colors } from "../../../types/colorTypes";

/**
 * Both validation columns are stored as one comma-separated string, which is
 * why the dialog used to show them as plain textboxes: fine to save, terrible
 * to read or edit once a CRQ carries half a dozen nodes.
 *
 * This field keeps the wire format (a string in, a string out) but edits it as
 * chips - Enter or a comma commits an entry, backspace removes the last one -
 * so each node and each node$interface pair is individually visible, checkable
 * and deletable.
 */

/** `"a, b ,,c"` -> `["a", "b", "c"]`. */
export const splitTokens = (raw: string): string[] =>
  raw
    .split(",")
    .map((token) => token.trim())
    .filter(Boolean);

/** Back to the stored shape, duplicates dropped (the procedure stores text). */
export const joinTokens = (tokens: string[]): string =>
  Array.from(new Set(tokens.map((token) => token.trim()).filter(Boolean))).join(",");

export interface TokenIssue {
  severity: "error" | "warning";
  message: string;
}

export interface ValidateTokenFieldProps {
  label: string;
  /** Raw comma-separated value straight from the form state. */
  value: string;
  onChange: (next: string) => void;
  onBlur: () => void;
  /** Column width - the same cap the procedure enforces. */
  max: number;
  colors: Colors;
  placeholder: string;
  disabled?: boolean;
  /** Form-level error; takes precedence over the per-entry hints. */
  error?: string;
  /** Per-entry check, drives the chip colour and its tooltip. */
  inspect?: (token: string) => TokenIssue | undefined;
  /** Click-to-insert prefixes, e.g. `HYD-T4-CR11.192$` from the node list. */
  quickInserts?: string[];
  quickInsertLabel?: string;
  helper?: React.ReactNode;
}

export const ValidateTokenField: React.FC<ValidateTokenFieldProps> = ({
  label,
  value,
  onChange,
  onBlur,
  max,
  colors,
  placeholder,
  disabled,
  error,
  inspect,
  quickInserts = [],
  quickInsertLabel = "Insert",
  helper,
}) => {
  const tokens = useMemo(() => splitTokens(value), [value]);
  const [inputValue, setInputValue] = useState("");
  const [capError, setCapError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const used = joinTokens(tokens).length;
  const pct = Math.min(100, Math.round((used / max) * 100));

  /**
   * Guard the cap here rather than letting the form slice at `max`: slicing a
   * joined string would cut the last entry in half and silently save a node
   * that does not exist.
   */
  const commit = useCallback(
    (next: string[]) => {
      const joined = joinTokens(next);
      if (joined.length > max) {
        setCapError(`Not enough room - ${label} is capped at ${max} characters.`);
        return;
      }
      setCapError(null);
      onChange(joined);
    },
    [label, max, onChange],
  );

  const handleInputChange = useCallback(
    (_event: React.SyntheticEvent, next: string, reason: string) => {
      if (reason === "reset") {
        setInputValue("");
        return;
      }
      // Pasting a whole comma-separated list should land as chips, not as one
      // giant entry - split everything before the trailing fragment.
      if (next.includes(",")) {
        const parts = next.split(",");
        const trailing = parts.pop() ?? "";
        commit([...tokens, ...parts]);
        setInputValue(trailing.trim());
        return;
      }
      setInputValue(next);
    },
    [commit, tokens],
  );

  const issues = useMemo(
    () => tokens.map((token) => inspect?.(token)),
    [tokens, inspect],
  );

  const errorCount = issues.filter((issue) => issue?.severity === "error").length;
  const warnCount = issues.filter((issue) => issue?.severity === "warning").length;

  const meterColor =
    pct >= 100 ? colors.danger : pct >= 85 ? colors.warning : colors.accent;

  return (
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Autocomplete
        multiple
        freeSolo
        autoSelect
        disableClearable
        disabled={disabled}
        options={[] as string[]}
        value={tokens}
        inputValue={inputValue}
        onInputChange={handleInputChange}
        onChange={(_event, next) => commit(next as string[])}
        renderTags={(values, getTagProps) =>
          values.map((token, index) => {
            const issue = inspect?.(token);
            const tone =
              issue?.severity === "error"
                ? { fg: colors.danger, bg: colors.dangerDim, border: colors.dangerBorder }
                : issue?.severity === "warning"
                  ? { fg: colors.warning, bg: colors.warningDim, border: colors.warningBorder }
                  : { fg: colors.accent, bg: colors.accentDim, border: colors.accentBorder };
            const { key, ...tagProps } = getTagProps({ index });

            return (
              <Tooltip key={key} title={issue?.message ?? ""} placement="top">
                <Chip
                  {...tagProps}
                  size="small"
                  label={token}
                  icon={
                    issue ? (
                      <ErrorOutlineRoundedIcon sx={{ fontSize: 13, color: `${tone.fg} !important` }} />
                    ) : undefined
                  }
                  sx={{
                    height: 22,
                    maxWidth: "100%",
                    fontSize: 11,
                    fontWeight: 700,
                    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                    color: tone.fg,
                    bgcolor: tone.bg,
                    border: `1px solid ${tone.border}`,
                    "& .MuiChip-deleteIcon": {
                      fontSize: 14,
                      color: tone.fg,
                      opacity: 0.6,
                      "&:hover": { opacity: 1, color: tone.fg },
                    },
                  }}
                />
              </Tooltip>
            );
          })
        }
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            size="small"
            inputRef={inputRef}
            onBlur={onBlur}
            error={!!error || !!capError || errorCount > 0}
            placeholder={tokens.length ? "Add another…" : placeholder}
            sx={{
              "& .MuiOutlinedInput-root": {
                alignItems: "flex-start",
                gap: 0.3,
                py: 0.6,
                bgcolor: colors.isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.012)",
              },
              "& input": { fontSize: 12.5, minWidth: 120 },
            }}
          />
        )}
      />

      {/* Capacity + per-entry counters: the only feedback that used to exist
          was a bare "0/120", which said nothing about what was wrong. */}
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.7 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <LinearProgress
            variant="determinate"
            value={pct}
            sx={{
              height: 3,
              borderRadius: 3,
              bgcolor: colors.border,
              "& .MuiLinearProgress-bar": { bgcolor: meterColor, borderRadius: 3 },
            }}
          />
        </Box>
        <Typography sx={{ fontSize: 10, fontWeight: 700, color: colors.textDim, flexShrink: 0 }}>
          {tokens.length} {tokens.length === 1 ? "entry" : "entries"} · {used}/{max}
        </Typography>
      </Stack>

      <Typography
        sx={{
          display: "block",
          mt: 0.5,
          fontSize: 10.5,
          lineHeight: 1.5,
          color:
            error || capError || errorCount
              ? colors.danger
              : warnCount
                ? colors.warning
                : colors.textDim,
        }}
      >
        {error ??
          capError ??
          (errorCount
            ? `${errorCount} entry${errorCount > 1 ? "s are" : " is"} not in the expected format.`
            : warnCount
              ? `${warnCount} entry${warnCount > 1 ? "s reference" : " references"} a node that is not listed.`
              : helper)}
      </Typography>

      {quickInserts.length > 0 && (
        <Stack
          direction="row"
          alignItems="center"
          flexWrap="wrap"
          useFlexGap
          sx={{ gap: 0.6, mt: 0.8 }}
        >
          <Typography sx={{ fontSize: 10, fontWeight: 800, color: colors.textDim, letterSpacing: 0.3 }}>
            {quickInsertLabel}
          </Typography>
          {quickInserts.map((prefix) => (
            <Chip
              key={prefix}
              size="small"
              clickable
              disabled={disabled}
              icon={<AddRoundedIcon sx={{ fontSize: 12 }} />}
              label={prefix}
              onClick={() => {
                setInputValue(prefix);
                inputRef.current?.focus();
              }}
              sx={{
                height: 20,
                fontSize: 10,
                fontWeight: 700,
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                color: colors.textSecondary,
                bgcolor: "transparent",
                border: `1px dashed ${colors.border}`,
                "&:hover": {
                  bgcolor: colors.accentDim,
                  borderColor: colors.accentBorder,
                  color: colors.accent,
                },
              }}
            />
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default ValidateTokenField;
