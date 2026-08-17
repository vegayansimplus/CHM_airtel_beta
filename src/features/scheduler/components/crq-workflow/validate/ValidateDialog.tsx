import React, { useCallback, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Fade,
  IconButton,
  LinearProgress,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import FactCheckRoundedIcon from "@mui/icons-material/FactCheckRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import TimelineRoundedIcon from "@mui/icons-material/TimelineRounded";
import HubRoundedIcon from "@mui/icons-material/HubRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

import { SlideUpTransition } from "../../../../../components/common/SlideUpTransition";
import type { Colors } from "../../../types/colorTypes";
import {
  NAME_INTERFACE_PAIR_MAX,
  NODE_NAME_MAX,
} from "../../../types/crqValidation.types";
import {
  InfoTile,
  StatusChip,
  StepSection,
  StepSkeleton,
  formatDateTime,
} from "../reschedule/RescheduleAtoms";
import { stageLabel } from "../reschedule/stageLabel";
import { crqStatusPalette } from "../../../constants/workflowStages";
import { useValidateForm } from "./useValidateForm";

/**
 * Shown as placeholder and as a persistent hint under each field: the
 * procedure stores both columns as free text, so the expected shape
 * (comma-separated nodes, `node$interface` for the pairs) only exists as a
 * convention and has to be spelled out for whoever is typing.
 */
const NODE_NAME_EXAMPLE = "HYD-T4-CR11.192,MUM-T5-CR11.15";
const NAME_INTERFACE_PAIR_EXAMPLE =
  "HYD-T4-CR11.192$TenGigE0/0/0/23,MUM-T5-CR11.15$HundGigE0/0/0/23";

/** `HYD-T4-CR11.192$TenGigE0/0/0/23` -> node + interface halves. */
const splitPair = (token: string): { node: string; iface: string } => {
  const at = token.indexOf("$");
  if (at < 0) return { node: token.trim(), iface: "" };
  return { node: token.slice(0, at).trim(), iface: token.slice(at + 1).trim() };
};

/**
 * Live node -> interfaces roll-up under the two fields. The pair column is the
 * one people get wrong (a typo in the node half is invisible in a comma
 * string), so orphans - interfaces whose node is not in the node list - get
 * their own bucket instead of being left to spot by eye.
 */
const MappingPreview: React.FC<{
  nodes: string[];
  pairs: string[];
  colors: Colors;
}> = ({ nodes, pairs, colors }) => {
  const byNode = new Map<string, string[]>(nodes.map((node) => [node, []]));
  const orphans: string[] = [];

  pairs.forEach((token) => {
    const { node, iface } = splitPair(token);
    if (!iface) return;
    const bucket = byNode.get(node);
    if (bucket) bucket.push(iface);
    else orphans.push(token);
  });

  if (!nodes.length && !orphans.length) return null;

  return (
    <Box
      sx={{
        mt: 1.8,
        p: 1.4,
        borderRadius: colors.radius,
        border: `1px dashed ${colors.border}`,
        bgcolor: colors.isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.012)",
      }}
    >
      <Stack direction="row" alignItems="center" spacing={0.6} sx={{ mb: 1 }}>
        <AccountTreeRoundedIcon sx={{ fontSize: 13, color: colors.textDim }} />
        <Typography
          sx={{
            fontSize: 9.5,
            fontWeight: 800,
            letterSpacing: 0.5,
            textTransform: "uppercase",
            color: colors.textDim,
          }}
        >
          Mapping preview
        </Typography>
      </Stack>

      <Stack spacing={0.9}>
        {nodes.map((node) => {
          const ifaces = byNode.get(node) ?? [];
          return (
            <Stack
              key={node}
              direction={{ xs: "column", sm: "row" }}
              alignItems={{ xs: "flex-start", sm: "center" }}
              spacing={0.8}
            >
              <Typography
                sx={{
                  fontSize: 11.5,
                  fontWeight: 800,
                  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                  color: colors.textPrimary,
                  width: { xs: "auto", sm: 190 },
                  flexShrink: 0,
                  wordBreak: "break-all",
                }}
              >
                {node}
              </Typography>
              {ifaces.length ? (
                <Stack direction="row" flexWrap="wrap" useFlexGap sx={{ gap: 0.5 }}>
                  {ifaces.map((iface) => (
                    <Chip
                      key={iface}
                      size="small"
                      label={iface}
                      sx={{
                        height: 19,
                        fontSize: 10,
                        fontWeight: 700,
                        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                        color: colors.success,
                        bgcolor: colors.successDim,
                        border: `1px solid ${colors.successBorder}`,
                      }}
                    />
                  ))}
                </Stack>
              ) : (
                <Typography sx={{ fontSize: 10.5, fontStyle: "italic", color: colors.textDim }}>
                  no interface mapped yet
                </Typography>
              )}
            </Stack>
          );
        })}

        {orphans.length > 0 && (
          <Stack direction="row" flexWrap="wrap" useFlexGap sx={{ gap: 0.5, pt: 0.4 }}>
            <Typography
              sx={{ fontSize: 10.5, fontWeight: 700, color: colors.warning, mr: 0.4 }}
            >
              Unlisted node:
            </Typography>
            {orphans.map((token) => (
              <Chip
                key={token}
                size="small"
                label={token}
                sx={{
                  height: 19,
                  fontSize: 10,
                  fontWeight: 700,
                  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                  color: colors.warning,
                  bgcolor: colors.warningDim,
                  border: `1px solid ${colors.warningBorder}`,
                }}
              />
            ))}
          </Stack>
        )}
      </Stack>
    </Box>
  );
};

export interface ValidateDialogProps {
  open: boolean;
  onClose: () => void;
  crqNo: string | null;
  colors: Colors;
  /** Fired after a successful save, so the cockpit can refresh if it needs to. */
  onSaved?: () => void;
}

/**
 * Plan & Inventory (VALIDATE stage) "Validate" dialog.
 *
 * Read  -> get_crq_validation_details(crqNo)
 * Write -> update_validation_details(p_Crq_No, p_NodeName, p_NameInterfacePair)
 *
 * Deliberately owns no workflow logic: it never starts, pauses or advances a
 * stage. Current Stage / Validation Status are read-only header context taken
 * straight from CRQ_MASTER_TBL, so opening or saving here cannot move the CRQ.
 *
 * Field state, validation and the save call live in useValidateForm; this file
 * is layout only.
 */
export const ValidateDialog: React.FC<ValidateDialogProps> = ({
  open,
  onClose,
  crqNo,
  colors,
  onSaved,
}) => {
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("md"));
  const [confirmDiscardOpen, setConfirmDiscardOpen] = useState(false);

  const form = useValidateForm(crqNo, open);
  const {
    details,
    values,
    errors,
    isLoading,
    isFetching,
    isSaving,
    loadError,
    saveError,
    isNeverValidated,
    isDirty,
    canSave,
  } = form;

  const closeAndReset = useCallback(() => {
    form.reset();
    onClose();
  }, [form, onClose]);

  /** Unsaved edits are worth one confirmation before they're thrown away. */
  const requestClose = useCallback(() => {
    if (isSaving) return;
    if (isDirty) {
      setConfirmDiscardOpen(true);
      return;
    }
    closeAndReset();
  }, [isSaving, isDirty, closeAndReset]);

  const handleSave = useCallback(async () => {
    const ok = await form.save();
    if (!ok) return;
    onSaved?.();
    // Matches the rest of the cockpit's dialogs: a successful submit closes.
    closeAndReset();
  }, [form, onSaved, closeAndReset]);

  const renderBody = () => {
    if (isLoading) return <StepSkeleton rows={4} />;

    if (loadError) {
      return (
        <Alert
          severity="error"
          variant="outlined"
          sx={{ fontSize: 12.5 }}
          action={
            <Button
              size="small"
              onClick={form.refetch}
              startIcon={<RefreshRoundedIcon sx={{ fontSize: 15 }} />}
              sx={{ textTransform: "none", fontWeight: 700 }}
            >
              Retry
            </Button>
          }
        >
          {loadError}
        </Alert>
      );
    }

    if (!details) {
      return (
        <Alert severity="info" variant="outlined" sx={{ fontSize: 12.5 }}>
          No validation details available for this CRQ.
        </Alert>
      );
    }

    const statusPalette = crqStatusPalette(details.validationStatus, colors);

    return (
      <Fade in timeout={220}>
        <Box>
          {saveError && (
            <Alert severity="error" variant="outlined" sx={{ mb: 2, fontSize: 12.5, py: 0.4 }}>
              {saveError}
            </Alert>
          )}

          {isNeverValidated && !saveError && (
            <Alert
              severity="info"
              variant="outlined"
              icon={<InfoOutlinedIcon sx={{ fontSize: 18 }} />}
              sx={{ mb: 2, fontSize: 12.5, py: 0.4 }}
            >
              This CRQ has not been validated yet — fill in the fields below to record its
              validation details.
            </Alert>
          )}

          {/* Header: identity + live workflow context, all read-only. */}
          <StepSection
            icon={<FactCheckRoundedIcon sx={{ fontSize: 14 }} />}
            title="CRQ"
            colors={colors}
          >
            <Stack direction="row" flexWrap="wrap" useFlexGap sx={{ gap: 1 }}>
              <InfoTile label="CRQ Number" value={details.crqNo} colors={colors} mono />
              <InfoTile
                label="Current Stage"
                value={stageLabel(details.currentStage)}
                colors={colors}
                icon={<TimelineRoundedIcon sx={{ fontSize: 12 }} />}
                accent={colors.accent}
              />
              <InfoTile
                label="Validation Status"
                value={
                  details.validationStatus ? (
                    <StatusChip
                      label={statusPalette.label}
                      fg={statusPalette.fg}
                      bg={statusPalette.bg}
                      border={statusPalette.border}
                    />
                  ) : (
                    "—"
                  )
                }
                colors={colors}
              />
            </Stack>
          </StepSection>

          {/* Editable attributes - two columns on md+, stacked below. */}
          <StepSection
            icon={<HubRoundedIcon sx={{ fontSize: 14 }} />}
            title="Validation Details"
            colors={colors}
            action={
              details.updatedAt ? (
                <Typography sx={{ fontSize: 10.5, fontWeight: 600, color: colors.textDim }}>
                  Last saved {formatDateTime(details.updatedAt)}
                </Typography>
              ) : undefined
            }
          >
            <Typography
              sx={{ fontSize: 11, color: colors.textDim, mb: 1.4, lineHeight: 1.65 }}
            >
              Separate multiple entries with a comma, and join each node to its interface
              with <Box component="span" sx={{ fontWeight: 800 }}>$</Box>.
            </Typography>

            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={1.6}
              useFlexGap
              sx={{ alignItems: "flex-start" }}
            >
              <TextField
                label="Node Name"
                fullWidth
                size="small"
                placeholder={NODE_NAME_EXAMPLE}
                value={values.nodeName}
                onChange={(e) => form.setValue("nodeName", e.target.value)}
                onBlur={() => form.touch("nodeName")}
                disabled={isSaving}
                error={!!errors.nodeName}
                helperText={
                  errors.nodeName ?? (
                    <FieldHint
                      example={NODE_NAME_EXAMPLE}
                      count={`${values.nodeName.length}/${NODE_NAME_MAX}`}
                    />
                  )
                }
                sx={{ flex: 1, minWidth: 0 }}
              />
              <TextField
                label="Node Interface Name"
                fullWidth
                size="small"
                multiline
                minRows={1}
                maxRows={3}
                placeholder={NAME_INTERFACE_PAIR_EXAMPLE}
                value={values.nameInterfacePair}
                onChange={(e) => form.setValue("nameInterfacePair", e.target.value)}
                onBlur={() => form.touch("nameInterfacePair")}
                disabled={isSaving}
                error={!!errors.nameInterfacePair}
                helperText={
                  errors.nameInterfacePair ?? (
                    <FieldHint
                      example={NAME_INTERFACE_PAIR_EXAMPLE}
                      count={`${values.nameInterfacePair.length}/${NAME_INTERFACE_PAIR_MAX}`}
                    />
                  )
                }
                sx={{ flex: 1, minWidth: 0 }}
              />
            </Stack>
          </StepSection>
        </Box>
      </Fade>
    );
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={requestClose}
        maxWidth="md"
        fullWidth
        fullScreen={isSmall}
        TransitionComponent={SlideUpTransition}
        PaperProps={{
          elevation: 0,
          sx: {
            height: isSmall ? "100%" : "auto",
            maxHeight: isSmall ? "100%" : "90vh",
            borderRadius: isSmall ? 0 : colors.radiusXL,
            border: `1px solid ${colors.border}`,
            bgcolor: colors.bg,
          },
        }}
      >
        <DialogTitle
          sx={{
            px: 2.5,
            py: 1.5,
            borderBottom: `1px solid ${colors.border}`,
            bgcolor: colors.surface,
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <FactCheckRoundedIcon sx={{ fontSize: 20, color: colors.accent }} />
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: 14.5, fontWeight: 800, color: colors.textPrimary }}>
                Sync Data Plan
              </Typography>
              <Typography sx={{ fontSize: 11.5, color: colors.textDim }} noWrap>
                {details?.crqNo ?? crqNo ?? ""}
              </Typography>
            </Box>
            <Box sx={{ flex: 1 }} />
            <Tooltip title="Reload validation details">
              <span>
                <IconButton
                  size="small"
                  onClick={form.refetch}
                  disabled={isSaving || isFetching || !crqNo}
                >
                  <RefreshRoundedIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </span>
            </Tooltip>
            <IconButton size="small" onClick={requestClose} disabled={isSaving}>
              <CloseIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Stack>
        </DialogTitle>

        {/* One indeterminate bar for whichever procedure is currently running. */}
        <Box sx={{ height: 3, bgcolor: colors.surface }}>
          {(isFetching || isSaving) && <LinearProgress sx={{ height: 3 }} />}
        </Box>

        <DialogContent
          dividers
          sx={{ px: 2.5, py: 2, bgcolor: colors.bg, borderColor: colors.border }}
        >
          {renderBody()}
        </DialogContent>

        <DialogActions sx={{ px: 2.5, py: 1.5, bgcolor: colors.surface, gap: 1 }}>
          <Button
            onClick={requestClose}
            disabled={isSaving}
            sx={{ textTransform: "none", fontWeight: 700, borderRadius: "8px" }}
          >
            Cancel
          </Button>
          <Box sx={{ flex: 1 }} />
          <Tooltip
            title={
              !canSave && !isSaving && !isFetching
                ? isDirty
                  ? "Fix the highlighted fields to save."
                  : "No changes to save yet."
                : ""
            }
          >
            <span>
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={!canSave}
                startIcon={
                  isSaving ? (
                    <CircularProgress size={15} color="inherit" />
                  ) : (
                    <SaveRoundedIcon sx={{ fontSize: 17 }} />
                  )
                }
                sx={{ textTransform: "none", fontWeight: 700, borderRadius: "8px", px: 2.2 }}
              >
                {isSaving ? "Saving…" : "Save"}
              </Button>
            </span>
          </Tooltip>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmDiscardOpen} onClose={() => setConfirmDiscardOpen(false)} maxWidth="xs">
        <DialogTitle sx={{ fontSize: 15, fontWeight: 800 }}>Discard your changes?</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontSize: 13 }}>
            Node Name and Node Interface Name have unsaved edits. Closing now leaves the saved
            values unchanged.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, pb: 2 }}>
          <Button
            onClick={() => setConfirmDiscardOpen(false)}
            sx={{ textTransform: "none", fontWeight: 700 }}
          >
            Keep editing
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              setConfirmDiscardOpen(false);
              closeAndReset();
            }}
            sx={{ textTransform: "none", fontWeight: 700 }}
          >
            Discard
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ValidateDialog;
