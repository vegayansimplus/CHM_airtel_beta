import React from "react";
import { Box, Stack, Typography } from "@mui/material";
import StorageRoundedIcon from "@mui/icons-material/StorageRounded";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import EventNoteOutlinedIcon from "@mui/icons-material/EventNoteOutlined";
import type { Colors } from "../../../types/colorTypes";
import type {
  ResolvedAttribute,
  TargetSystem,
} from "../types/attributeUpdate.types";
import { SYSTEM_SECTIONS } from "../constants/attributeUpdate.constants";
import { AttributeRow } from "./AttributeRow";

interface AttributeSectionProps {
  system: TargetSystem;
  attributes: ResolvedAttribute[];
  /** Backend-set Planning Tool fields, rendered in a dimmed sub-section. */
  backendAttributes?: ResolvedAttribute[];
  colors: Colors;
}

const SYSTEM_ICONS: Record<TargetSystem, React.ReactNode> = {
  remedy: <StorageRoundedIcon sx={{ fontSize: 16 }} />,
  cab: <AssignmentOutlinedIcon sx={{ fontSize: 16 }} />,
  planningTool: <EventNoteOutlinedIcon sx={{ fontSize: 16 }} />,
};

/**
 * One target-system card (Remedy Console / CAB Form / Planning Tool) with a
 * colored header, attribute count and the stage's attribute rows.
 */
export const AttributeSection: React.FC<AttributeSectionProps> = ({
  system,
  attributes,
  backendAttributes,
  colors,
}) => {
  const meta = SYSTEM_SECTIONS[system];
  const totalCount = attributes.length + (backendAttributes?.length ?? 0);

  return (
    <Box
      sx={{
        bgcolor: colors.surface,
        border: `1px solid ${colors.border}`,
        borderRadius: colors.radiusL,
        overflow: "hidden",
        mb: 1.75,
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{
          px: 2.25,
          py: 1.5,
          bgcolor: meta.headerBg,
          color: meta.headerFg,
          borderBottom: `1px solid ${colors.border}`,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          {SYSTEM_ICONS[system]}
          <Typography sx={{ fontSize: 14, fontWeight: 600, color: "inherit" }}>
            {meta.title}
          </Typography>
        </Stack>
        <Typography sx={{ fontSize: 12.5, color: "inherit", opacity: 0.9 }}>
          {totalCount} attribute{totalCount === 1 ? "" : "s"}
        </Typography>
      </Stack>

      <Box sx={{ px: 2.25, py: 1.25 }}>
        {attributes.length ? (
          attributes.map((attribute) => (
            <AttributeRow
              key={attribute.name}
              attribute={attribute}
              colors={colors}
            />
          ))
        ) : (
          <Typography
            sx={{ fontSize: 13, color: colors.textSecondary, py: 1.25 }}
          >
            No attributes at this stage.
          </Typography>
        )}

        {!!backendAttributes?.length && (
          <>
            <Typography
              sx={{
                fontSize: 11.5,
                fontWeight: 600,
                letterSpacing: 0.6,
                textTransform: "uppercase",
                color: colors.textSecondary,
                mt: 1.5,
                mb: 1,
                pt: 1.5,
                borderTop: `1px dashed ${colors.border}`,
              }}
            >
              Backend-set fields — sent by backend, not shown in UI
            </Typography>
            {backendAttributes.map((attribute) => (
              <AttributeRow
                key={attribute.name}
                attribute={attribute}
                colors={colors}
              />
            ))}
          </>
        )}
      </Box>
    </Box>
  );
};

export default AttributeSection;
