import React from "react";
import { Box, Skeleton, Typography } from "@mui/material";
import type { MopCreateDetails } from "../../../../types/mopDocument.types";

interface MopDetailsStripProps {
  details?: MopCreateDetails;
  loading: boolean;
  colors: any;
}

/**
 * The five read-only CRQ facts above the document, exactly the set
 * `SP_GET_MOP_DETAILS_BY_CRQN` returns.
 *
 * Laid out as one wrapping strip rather than a grid of cards: these are five
 * short values, and giving each its own bordered box cost three rows of
 * height that the PDF preview underneath needs far more. The strip is the
 * panel's only fixed-height element, so everything below it can fill.
 *
 * The design draws these as editable inputs, but the procedure is read-only
 * and no write-back procedure exists, so they are rendered as values rather
 * than as fields that would silently discard an edit. Change window, site and
 * vendor are routinely null today (site and vendor come from
 * `CRQ_DETAIL_TBL`, which is empty) - they are kept visible with a dash
 * instead of being hidden, so they populate on their own once that data
 * lands rather than needing this component changed again.
 */
export const MopDetailsStrip: React.FC<MopDetailsStripProps> = ({ details, loading, colors }) => {
  const items: Array<{ label: string; value: string | null | undefined; grow?: boolean; mono?: boolean }> = [
    { label: "CRQ", value: details?.crqNo, mono: true },
    { label: "Change window", value: details?.changeWindow, mono: true },
    { label: "Title", value: details?.title, grow: true },
    { label: "Site / region", value: details?.siteRegion },
    { label: "Vendor", value: details?.vendor },
  ];

  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "stretch",
        rowGap: 1,
        border: `1px solid ${colors.border}`,
        borderRadius: 2,
        bgcolor: colors.surface,
        px: 1.75,
        py: 1,
        flexShrink: 0,
      }}
    >
      {items.map((item, i) => (
        <React.Fragment key={item.label}>
          {i > 0 && (
            <Box
              aria-hidden
              sx={{ width: "1px", bgcolor: colors.border, mx: 1.75, alignSelf: "stretch" }}
            />
          )}
          <Box sx={{ minWidth: 0, flex: item.grow ? "1 1 180px" : "0 1 auto" }}>
            <Typography
              sx={{
                fontSize: 9.5,
                letterSpacing: "0.09em",
                textTransform: "uppercase",
                fontWeight: 700,
                color: colors.textSecondary,
                lineHeight: 1.5,
              }}
            >
              {item.label}
            </Typography>
            {loading ? (
              <Skeleton variant="text" width={90} sx={{ fontSize: 13 }} />
            ) : (
              <Typography
                title={item.value ?? undefined}
                sx={{
                  fontSize: 12.5,
                  lineHeight: 1.5,
                  fontWeight: item.value ? 600 : 400,
                  // Nulls are expected here, not a failure - they read as an
                  // absent value rather than an empty slot.
                  color: item.value ? colors.textPrimary : colors.textDim,
                  fontVariantNumeric: item.mono ? "tabular-nums" : undefined,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {item.value || "—"}
              </Typography>
            )}
          </Box>
        </React.Fragment>
      ))}
    </Box>
  );
};

export default MopDetailsStrip;
