import React from "react";
import { Box, Button, Stack, Tooltip } from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import type { Colors } from "../../../types/colorTypes";

interface AttributeDialogFooterProps {
  canGoPrevious: boolean;
  canGoNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onCancel: () => void;
  /** False hides stage navigation entirely (single-stage locked mode). */
  navigationEnabled?: boolean;
  colors: Colors;
}

/**
 * Stage action row (Cancel / Save Draft / Submit) plus previous/next stage
 * navigation. Submit advances to the next stage; Save Draft stays disabled
 * until the real save API is integrated. In single-stage locked mode the
 * navigation row is hidden and Submit is disabled.
 */
export const AttributeDialogFooter: React.FC<AttributeDialogFooterProps> = ({
  canGoPrevious,
  canGoNext,
  onPrevious,
  onNext,
  onCancel,
  navigationEnabled = true,
  colors,
}) => (
  <Box sx={{ mt: 0.75 }}>
    <Stack
      direction="row"
      spacing={1.25}
      justifyContent="flex-end"
      sx={{ pt: 2, borderTop: `1px solid ${colors.border}` }}
    >
      <Button
        variant="outlined"
        size="small"
        onClick={onCancel}
        sx={{
          textTransform: "none",
          fontWeight: 500,
          fontSize: 13.5,
          px: 2.25,
          py: 1,
          borderRadius: colors.radius,
          color: colors.danger,
          borderColor: colors.dangerBorder,
          "&:hover": { bgcolor: colors.dangerDim, borderColor: colors.danger },
        }}
      >
        Cancel
      </Button>
      <Tooltip title="Available after API integration" arrow>
        <span>
          <Button
            variant="outlined"
            size="small"
            disabled
            sx={{
              textTransform: "none",
              fontWeight: 500,
              fontSize: 13.5,
              px: 2.25,
              py: 1,
              borderRadius: colors.radius,
            }}
          >
            Save Draft
          </Button>
        </span>
      </Tooltip>
      <Tooltip
        title={navigationEnabled ? "" : "Available after API integration"}
        arrow
      >
        <span>
          <Button
            variant="contained"
            size="small"
            disabled={!navigationEnabled || !canGoNext}
            onClick={onNext}
            endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: 16 }} />}
            sx={{
              textTransform: "none",
              fontWeight: 500,
              fontSize: 13.5,
              px: 2.25,
              py: 1,
              borderRadius: colors.radius,
              boxShadow: "none",
              bgcolor: colors.accent,
              "&:hover": { bgcolor: colors.accentLight, boxShadow: "none" },
            }}
          >
            Submit
          </Button>
        </span>
      </Tooltip>
    </Stack>

    {navigationEnabled && (
    <Stack direction="row" justifyContent="space-between" sx={{ mt: 1.25 }}>
      <Button
        size="small"
        disabled={!canGoPrevious}
        onClick={onPrevious}
        startIcon={<ArrowBackRoundedIcon sx={{ fontSize: 15 }} />}
        sx={{
          textTransform: "none",
          fontSize: 12.5,
          color: colors.textSecondary,
          "&:hover": { color: colors.textPrimary, bgcolor: "transparent" },
        }}
      >
        Previous stage
      </Button>
      <Button
        size="small"
        disabled={!canGoNext}
        onClick={onNext}
        endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: 15 }} />}
        sx={{
          textTransform: "none",
          fontSize: 12.5,
          color: colors.textSecondary,
          "&:hover": { color: colors.textPrimary, bgcolor: "transparent" },
        }}
      >
        Next stage
      </Button>
    </Stack>
    )}
  </Box>
);

export default AttributeDialogFooter;
