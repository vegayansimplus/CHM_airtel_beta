import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Stack,
  Chip,
  Button,
  useTheme,
  alpha,
  Divider,
} from "@mui/material";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";
import HourglassEmptyRoundedIcon from "@mui/icons-material/HourglassEmptyRounded";
import type { Checkpoint, CheckpointItem } from "../../../../types/checkpoint.types";
import CheckpointItemCard from "./CheckpointItemCard";

interface Props {
  checkpoints: Checkpoint[];
  onStatusChange?: (checkpointId: string, newStatus: "Pass" | "Fail") => void;
  defaultSelectedId?: string | null;
  disableActions?: boolean;
}

const HorizontalCheckpointStrip: React.FC<Props> = ({
  checkpoints,
  onStatusChange,
  defaultSelectedId = null,
  disableActions = false,
}) => {
  const theme = useTheme();
  const [selectedId, setSelectedId] = useState<string | null>(
    defaultSelectedId ?? checkpoints[0]?.id ?? null,
  );
  const selectedCardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!checkpoints.some((c) => c.id === selectedId)) {
      setSelectedId(checkpoints[0]?.id ?? null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkpoints]);

  useEffect(() => {
    selectedCardRef.current?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [selectedId]);

  const statusConfig = (status: string) => {
    if (status === "Pass")
      return {
        color: theme.palette.success.main,
        label: "PASS",
        icon: <CheckCircleRoundedIcon fontSize="small" />,
      };
    if (status === "Fail")
      return {
        color: theme.palette.error.main,
        label: "FAIL",
        icon: <ErrorRoundedIcon fontSize="small" />,
      };
    return {
      color: theme.palette.text.disabled,
      label: "PENDING",
      icon: <HourglassEmptyRoundedIcon fontSize="small" />,
    };
  };

  if (checkpoints.length === 0) {
    return (
      <Typography color="text.secondary" sx={{ py: 2 }}>
        No checkpoints available for this CRQ.
      </Typography>
    );
  }

  return (
    <Box sx={{ width: "100%" }}>
      {/* Horizontal strip */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          overflowX: "auto",
          py: 1,
          px: 0.5,
          scrollSnapType: "x mandatory",
          "&::-webkit-scrollbar": { height: 6 },
          "&::-webkit-scrollbar-thumb": {
            background: alpha(theme.palette.text.primary, 0.15),
            borderRadius: 20,
          },
        }}
      >
        {checkpoints.map((cp) => {
          const cfg = statusConfig(cp.status ?? "NA");
          const isSelected = cp.id === selectedId;

          return (
            <Paper
              key={cp.id}
              ref={isSelected ? selectedCardRef : undefined}
              onClick={() => setSelectedId(cp.id)}
              elevation={0}
              variant="outlined"
              sx={{
                p: 1.5,
                width: 230,
                flexShrink: 0,
                borderRadius: 2.5,
                scrollSnapAlign: "center",
                cursor: "pointer",
                borderWidth: isSelected ? 2 : 1,
                borderColor: isSelected ? cfg.color : "divider",
                bgcolor: isSelected ? alpha(cfg.color, 0.06) : "background.paper",
                transition: "transform .2s ease, box-shadow .25s ease, border-color .25s ease",
                "&:hover": {
                  transform: "translateY(-3px)",
                  boxShadow: 3,
                },
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: alpha(cfg.color, 0.14),
                      width: 30,
                      height: 30,
                      borderRadius: "50%",
                      flexShrink: 0,
                      color: cfg.color,
                    }}
                  >
                    {cfg.icon}
                  </Box>

                  <Typography fontWeight={700} noWrap sx={{ fontSize: 13.5 }}>
                    {(() => {
                      const match = cp.title.match(/\(([^)]+)\)/);
                      const display = match ? match[1] : cp.title;
                      return display.length > 24 ? display.slice(0, 24) + "…" : display;
                    })()}
                  </Typography>
                </Stack>

                <Chip
                  label={cfg.label}
                  size="small"
                  sx={{
                    bgcolor: alpha(cfg.color, 0.14),
                    color: cfg.color,
                    fontWeight: 700,
                    fontSize: 10,
                    height: 20,
                  }}
                />
              </Stack>

              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                {cp.items?.length ?? 0} items
              </Typography>
            </Paper>
          );
        })}
      </Box>

      {/* Selected checkpoint detail */}
      <Box sx={{ mt: 2 }}>
        {(() => {
          const sel = checkpoints.find((c) => c.id === selectedId);
          if (!sel) return null;

          return (
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
                <Stack>
                  <Typography variant="subtitle1" fontWeight={700}>
                    {sel.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {sel.items.length} items • Status: {sel.status ?? "NA"}
                  </Typography>
                </Stack>

                <Stack direction="row" spacing={1}>
                  <Button
                    size="small"
                    variant="contained"
                    color="success"
                    disabled={disableActions}
                    onClick={() => onStatusChange?.(sel.id, "Pass")}
                  >
                    Mark PASS
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    color="error"
                    disabled={disableActions}
                    onClick={() => onStatusChange?.(sel.id, "Fail")}
                  >
                    Mark FAIL
                  </Button>
                </Stack>
              </Stack>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ maxHeight: "50vh", overflow: "auto", pr: 0.5 }}>
                {sel.items.length > 0 ? (
                  <Stack spacing={2}>
                    {sel.items.map((it: CheckpointItem, idx: number) => (
                      <CheckpointItemCard key={`${sel.id}_${idx}`} item={it} />
                    ))}
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                    No items available for this checkpoint.
                  </Typography>
                )}
              </Box>
            </Paper>
          );
        })()}
      </Box>
    </Box>
  );
};

export default HorizontalCheckpointStrip;
