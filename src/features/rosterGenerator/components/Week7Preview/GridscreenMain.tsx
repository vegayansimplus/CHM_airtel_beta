import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  alpha,
  Badge,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Snackbar,
  Alert,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import UndoOutlinedIcon from "@mui/icons-material/UndoOutlined";
import CheckIcon from "@mui/icons-material/Check";

import { FutureWeekGrid } from "./FutureWeekGrid";
import type { PendingChangesMap } from "./FutureWeekGrid";
import { usePaginatedFutureWeek } from "./Usepaginatedfutureweek";
import { ShiftLegend } from "./Gridsharedui";
import { isoWeekLabel } from "../../util/Futureweek.utils";
import { ShiftChip } from "./Shiftchip";
import type { ShiftCode } from "../../types/Futureweek.types";
import { SHIFT_CODES } from "../../util/Goldensetutils";
import { useUpdateFutureWeekBatchMutation } from "../../api/rosterGenerationApiSlice";

interface GridscreenMainProps {
  subDomainId: number | string | undefined;
}

const MONO = "'Roboto Mono', 'Fira Mono', monospace";

export default function GridscreenMain({ subDomainId }: GridscreenMainProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const accent = theme.palette.primary.main;
  const accentDim = alpha(accent, 0.08);
  const accentBorder = alpha(accent, 0.35);

  const [editing, setEditing] = useState(false);
  const [brush, setBrush] = useState<ShiftCode>("G");
  const [toast, setToast] = useState<{ msg: string; severity: "success" | "error" } | null>(null);
  const paintingRef = useRef(false);

  // ── Pending-changes state (lives here so Save has access) ─────────────────
  const [pendingChanges, setPendingChanges] = useState<PendingChangesMap>({});
  const pendingCount = Object.keys(pendingChanges).length;
  // Ref to clear grid's internal state after save
  const clearPendingRef = useRef<(() => void) | null>(null);

  const {
    employees,
    isoWeek,
    isoYear,
    totalEmployees,
    isLoading,
    isFetchingMore,
    isError,
    load,
  } = usePaginatedFutureWeek();

  const [updateBatch, { isLoading: isSaving }] = useUpdateFutureWeekBatchMutation();

  useEffect(() => {
    if (subDomainId !== undefined && subDomainId !== null && subDomainId !== "") {
      load(Number(subDomainId));
    }
  }, [subDomainId, load]);

  const weekLabel = isoWeek > 0 ? isoWeekLabel(isoYear, isoWeek) : "";
  const loaded = employees.length;

  const handleMouseUp = useCallback(() => {
    paintingRef.current = false;
  }, []);

  // Toggle edit mode; entering edit doesn't save, exiting doesn't auto-save either
  const handleEditToggle = useCallback(() => {
    setEditing((prev) => !prev);
  }, []);

  // Discard all pending changes
  const handleDiscard = useCallback(() => {
    setPendingChanges({});
    clearPendingRef.current?.();
  }, []);

  // Save: build batch payload from pendingChanges + employee userId, fire API
  const handleSave = useCallback(async () => {
    if (pendingCount === 0) return;

    const payload = Object.entries(pendingChanges).map(([futureIdStr, shifts]) => {
      const futureId = Number(futureIdStr);
      const emp = employees.find((e) => e.futureId === futureId);
      const [W7D1, W7D2, W7D3, W7D4, W7D5, W7D6, W7D7] = shifts;
      return {
        userId: emp?.userId ?? futureId, // fall back to futureId if userId not on type yet
        year: isoYear,
        week: isoWeek,
        W7D1,
        W7D2,
        W7D3,
        W7D4,
        W7D5,
        W7D6,
        W7D7,
      };
    });

    try {
      await updateBatch(payload).unwrap();
      setPendingChanges({});
      clearPendingRef.current?.();
      setToast({ msg: `${pendingCount} row${pendingCount > 1 ? "s" : ""} saved successfully`, severity: "success" });
    } catch {
      setToast({ msg: "Save failed — your changes are still pending", severity: "error" });
    }
  }, [pendingChanges, pendingCount, employees, isoYear, isoWeek, updateBatch]);

  const toolbarBg = isDark
    ? "linear-gradient(135deg,rgba(16,185,129,0.06),rgba(99,102,241,0.04))"
    : "linear-gradient(135deg,rgba(16,185,129,0.03),rgba(99,102,241,0.02))";

  const hasPending = pendingCount > 0;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
        overflow: "hidden",
        "@keyframes tkPulse": {
          "0%,100%": { opacity: 1 },
          "50%": { opacity: 0.35 },
        },
      }}
      onMouseUp={handleMouseUp}
    >
      {/* ── Error banner ──────────────────────────────────────────────────── */}
      {isError && (
        <Box
          sx={{
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            gap: 1,
            px: 2,
            py: 1,
            bgcolor: isDark ? "rgba(239,68,68,0.12)" : "rgba(239,68,68,0.06)",
            borderBottom: `1px solid ${isDark ? "rgba(239,68,68,0.25)" : "rgba(239,68,68,0.15)"}`,
          }}
        >
          <ErrorOutlineIcon sx={{ fontSize: 15, color: "error.main" }} />
          <Typography sx={{ fontSize: 12, color: "error.main", fontWeight: 600 }}>
            Failed to load schedule data. Check your network and try refreshing.
          </Typography>
        </Box>
      )}

      {/* ── Toolbar ───────────────────────────────────────────────────────── */}
      <Box
        sx={{
          flexShrink: 0,
          px: 2,
          py: 1.25,
          borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(13,27,42,0.07)"}`,
          background: toolbarBg,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          flexWrap: "wrap",
        }}
      >
        <ShiftLegend />

        <Box sx={{ flex: 1 }} />

        {/* ISO week badge */}
        {weekLabel && (
          <Chip
            size="small"
            icon={<VerifiedOutlinedIcon sx={{ fontSize: "12px !important" }} />}
            label={weekLabel}
            sx={{
              height: 22,
              fontSize: 10.5,
              fontWeight: 650,
              borderRadius: "6px",
              bgcolor: isDark ? "rgba(16,185,129,0.14)" : "rgba(16,185,129,0.08)",
              color: isDark ? "#6EE7B7" : "#065F46",
              border: `1px solid ${isDark ? "rgba(16,185,129,0.3)" : "rgba(16,185,129,0.2)"}`,
            }}
          />
        )}

        {/* Employee count */}
        {!isLoading && (
          <Chip
            size="small"
            icon={<GroupsOutlinedIcon sx={{ fontSize: "12px !important" }} />}
            label={
              isFetchingMore
                ? `${loaded} / ${totalEmployees} loaded…`
                : `${loaded} employees`
            }
            sx={{ height: 22, fontSize: 10.5, fontWeight: 650, borderRadius: "6px" }}
          />
        )}

        {/* Fetching-more spinner */}
        {isFetchingMore && (
          <Tooltip title="Loading remaining pages…" arrow>
            <Stack direction="row" alignItems="center" gap={0.5}>
              <CircularProgress size={12} thickness={5} />
              <Typography sx={{ fontSize: 10.5, color: "text.secondary" }}>
                Fetching…
              </Typography>
            </Stack>
          </Tooltip>
        )}

        {/* Edit toggle */}
        <Button
          size="small"
          variant={editing ? "contained" : "outlined"}
          color={editing ? "warning" : "inherit"}
          startIcon={<EditOutlinedIcon sx={{ fontSize: 15 }} />}
          onClick={handleEditToggle}
          disableElevation
          sx={{
            fontSize: 12,
            height: 30,
            borderRadius: "8px",
            fontWeight: 600,
            textTransform: "none",
          }}
        >
          {editing ? "Done" : "Edit"}
        </Button>
      </Box>

      {/* ── Paint mode brush bar + Save ──────────────────────────────────── */}
      {editing && (
        <Box
          sx={{
            flexShrink: 0,
            px: 2,
            py: 1.25,
            borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(13,27,42,0.07)"}`,
            bgcolor: isDark ? "rgba(24,95,165,0.06)" : "rgba(24,95,165,0.025)",
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            flexWrap: "wrap",
          }}
        >
          {/* PAINT MODE badge */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.75,
              px: 1.25,
              py: 0.5,
              borderRadius: "6px",
              bgcolor: accentDim,
              border: `1px solid ${accentBorder}`,
              flexShrink: 0,
            }}
          >
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                bgcolor: accent,
                animation: "tkPulse 2s infinite",
              }}
            />
            <Typography
              sx={{
                fontSize: 11,
                color: accent,
                fontWeight: 700,
                letterSpacing: "0.02em",
                fontFamily: MONO,
              }}
            >
              PAINT MODE
            </Typography>
          </Box>

          {/* Shift brush selector */}
          <Stack direction="row" gap={0.75} flexWrap="wrap">
            {([...SHIFT_CODES] as unknown as ShiftCode[]).map((code) => (
              <Box
                key={code}
                onClick={() => setBrush(code)}
                sx={{ cursor: "pointer" }}
              >
                <ShiftChip code={code} size="md" active={brush === code} />
              </Box>
            ))}
          </Stack>

          {/* Hint text */}
          <Typography
            sx={{
              fontSize: 10.5,
              color: isDark ? "rgba(255,255,255,0.35)" : "rgba(13,27,42,0.4)",
              fontStyle: "italic",
              display: { xs: "none", md: "block" },
            }}
          >
            Hover &amp; drag to paint cells
          </Typography>

          <Box sx={{ flex: 1 }} />

          {/* ── Action buttons (right side) ─────────────────────────────── */}
          <Stack direction="row" alignItems="center" gap={1}>
            {/* Pending-changes summary pill */}
            {hasPending && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  px: 1.25,
                  py: 0.4,
                  borderRadius: "20px",
                  bgcolor: isDark ? "rgba(245,158,11,0.12)" : "rgba(245,158,11,0.08)",
                  border: `1px solid ${isDark ? "rgba(245,158,11,0.35)" : "rgba(245,158,11,0.25)"}`,
                }}
              >
                <Box
                  sx={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    bgcolor: "warning.main",
                    animation: "tkPulse 1.8s infinite",
                  }}
                />
                <Typography
                  sx={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: isDark ? "#FCD34D" : "#92400E",
                    fontFamily: MONO,
                  }}
                >
                  {pendingCount} unsaved
                </Typography>
              </Box>
            )}

            {/* Discard button — only when there are pending changes */}
            {hasPending && (
              <Tooltip title="Discard all unsaved changes" arrow>
                <Button
                  size="small"
                  variant="outlined"
                  color="inherit"
                  startIcon={<UndoOutlinedIcon sx={{ fontSize: 14 }} />}
                  onClick={handleDiscard}
                  disabled={isSaving}
                  sx={{
                    fontSize: 11.5,
                    height: 30,
                    borderRadius: "8px",
                    fontWeight: 600,
                    textTransform: "none",
                    borderColor: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.18)",
                    color: "text.secondary",
                    "&:hover": {
                      borderColor: "error.main",
                      color: "error.main",
                      bgcolor: isDark ? "rgba(239,68,68,0.07)" : "rgba(239,68,68,0.04)",
                    },
                  }}
                >
                  Discard
                </Button>
              </Tooltip>
            )}

            {/* Save button */}
            <Tooltip
              title={hasPending ? `Save ${pendingCount} changed row${pendingCount > 1 ? "s" : ""}` : "No changes to save"}
              arrow
            >
              <span>
                <Button
                  size="small"
                  variant="contained"
                  color="primary"
                  startIcon={
                    isSaving ? (
                      <CircularProgress size={13} thickness={5} sx={{ color: "inherit" }} />
                    ) : (
                      <SaveOutlinedIcon sx={{ fontSize: 15 }} />
                    )
                  }
                  onClick={handleSave}
                  disabled={!hasPending || isSaving}
                  disableElevation
                  sx={{
                    fontSize: 12,
                    height: 30,
                    borderRadius: "8px",
                    fontWeight: 700,
                    textTransform: "none",
                    minWidth: 90,
                    // Glow when ready
                    ...(hasPending && !isSaving && {
                      boxShadow: `0 0 0 3px ${alpha(accent, 0.22)}`,
                      "&:hover": {
                        boxShadow: `0 0 0 4px ${alpha(accent, 0.3)}`,
                      },
                    }),
                    transition: "box-shadow 0.2s",
                  }}
                >
                  {isSaving ? "Saving…" : "Save Changes"}
                </Button>
              </span>
            </Tooltip>
          </Stack>
        </Box>
      )}

      {/* ── Grid ──────────────────────────────────────────────────────────── */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        <FutureWeekGrid
          employees={employees}
          isoYear={isoYear}
          isoWeek={isoWeek}
          isLoading={isLoading}
          totalEmployees={totalEmployees}
          editing={editing}
          brush={brush}
          paintingRef={paintingRef}
          onPendingChanges={setPendingChanges}
          clearPendingRef={clearPendingRef}
        />
      </Box>

      {/* ── Toast ─────────────────────────────────────────────────────────── */}
      <Snackbar
        open={!!toast}
        autoHideDuration={2800}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={toast?.severity ?? "success"}
          variant="filled"
          icon={toast?.severity === "success" ? <CheckIcon /> : undefined}
          sx={{ alignItems: "center", borderRadius: "12px" }}
        >
          {toast?.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}


