import React from "react";
import { Box, Stack, Typography } from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import DnsOutlinedIcon from "@mui/icons-material/DnsOutlined";
import GpsFixedRoundedIcon from "@mui/icons-material/GpsFixedRounded";
import type { Colors } from "../../../types/colorTypes";
import type { ResolvedAttribute } from "../types/attributeUpdate.types";
import {
  ATTRIBUTE_FLAGS,
  AUTO_SET_BANNER,
} from "../constants/attributeUpdate.constants";
import { MandatoryBadge } from "./MandatoryBadge";
import { AttributeValueList } from "./AttributeValueList";

interface AttributeRowProps {
  attribute: ResolvedAttribute;
  colors: Colors;
}

const FlagPill: React.FC<{
  palette: { label: string; bg: string; fg: string };
  icon: React.ReactNode;
}> = ({ palette, icon }) => (
  <Box
    component="span"
    sx={{
      display: "inline-flex",
      alignItems: "center",
      gap: 0.4,
      px: 0.9,
      py: "3px",
      borderRadius: "5px",
      fontSize: 11,
      fontWeight: 500,
      letterSpacing: 0.3,
      bgcolor: palette.bg,
      color: palette.fg,
    }}
  >
    {icon}
    {palette.label}
  </Box>
);

/**
 * One attribute of the selected stage: name + READ-ONLY/BACKEND flags on the
 * left, field type + mandatory badge on the right, followed by the auto-set
 * banner and/or the allowed value list when present.
 */
export const AttributeRow: React.FC<AttributeRowProps> = ({
  attribute,
  colors,
}) => {
  const banner = attribute.autoSetFrom
    ? AUTO_SET_BANNER[attribute.autoSetFrom]
    : null;

  return (
    <Box
      sx={{
        py: 1.25,
        px: attribute.readOnly ? 1.5 : 0,
        mx: attribute.readOnly ? -1.25 : 0,
        borderRadius: attribute.readOnly ? colors.radius : 0,
        bgcolor: attribute.readOnly ? colors.surface2 : "transparent",
        opacity: attribute.isBackend ? 0.6 : 1,
        borderBottom: attribute.readOnly
          ? "none"
          : `1px dashed ${colors.border}`,
        "&:last-child": { borderBottom: "none" },
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        spacing={1.5}
      >
        <Stack
          direction="row"
          alignItems="center"
          flexWrap="wrap"
          gap={0.8}
          sx={{ flex: 1, minWidth: 0 }}
        >
          <Typography
            component="span"
            sx={{
              fontSize: 13.5,
              fontWeight: 500,
              color: colors.textPrimary,
              wordBreak: "break-word",
            }}
          >
            {attribute.name}
          </Typography>
          {attribute.readOnly && (
            <FlagPill
              palette={ATTRIBUTE_FLAGS.readOnly}
              icon={<LockOutlinedIcon sx={{ fontSize: 11 }} />}
            />
          )}
          {attribute.isBackend && (
            <FlagPill
              palette={ATTRIBUTE_FLAGS.backend}
              icon={<DnsOutlinedIcon sx={{ fontSize: 11 }} />}
            />
          )}
        </Stack>

        <Stack
          direction="row"
          alignItems="center"
          spacing={0.75}
          sx={{ flexShrink: 0 }}
        >
          <Box
            component="span"
            sx={{
              px: 1,
              py: "3px",
              borderRadius: "5px",
              fontSize: 11.5,
              fontWeight: 500,
              whiteSpace: "nowrap",
              bgcolor: colors.trackOff,
              border: `1px solid ${colors.border}`,
              color: colors.textPrimary,
            }}
          >
            {attribute.type}
          </Box>
          <MandatoryBadge
            level={attribute.mandatoryLevel}
            rawLabel={attribute.mandatory}
          />
        </Stack>
      </Stack>

      {banner && attribute.autoSetValue && (
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.6,
            mt: 1,
            px: 1.5,
            py: "4px",
            borderRadius: "6px",
            fontSize: 12.5,
            fontWeight: 500,
            bgcolor: banner.bg,
            border: `1px solid ${banner.border}`,
            color: banner.fg,
          }}
        >
          <GpsFixedRoundedIcon sx={{ fontSize: 12 }} />
          Auto-set to&nbsp;<strong>{attribute.autoSetValue}</strong>
        </Box>
      )}

      {attribute.values && (
        <AttributeValueList values={attribute.values} colors={colors} />
      )}
    </Box>
  );
};

export default AttributeRow;
