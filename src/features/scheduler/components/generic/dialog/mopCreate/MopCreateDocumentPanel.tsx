import React from "react";
import { Alert, Box } from "@mui/material";
import { MopDetailsStrip } from "./MopDetailsStrip";
import { MopDocumentUploader } from "./MopDocumentUploader";
import { useGetMopCreateDetailsQuery } from "../../../../api/mopDocumentApiSlice";

interface MopCreateDocumentPanelProps {
  crqNo: string | null;
  /** Cancelled / already-Done / view-only - the panel stays readable and the
   *  stored document still previewable, but nothing may be uploaded. */
  readOnly: boolean;
  colors: any;
}

/**
 * Right-hand pane of the MOP Create stage dialog - the CRQ's MOP header and
 * its document, sitting beside the existing "MOP Create Action" outcome form.
 *
 * Sized to its container rather than to its content: a fixed-height details
 * strip and action row, then a body that takes the rest. Everything is in one
 * view at any window height, and the panel itself never scrolls - only the
 * embedded PDF does. Nothing here measures its own height, so it can't feed
 * the app shell's scrollbar oscillation (see `useAutoFitScale`'s notes).
 *
 * Built on procedures that already existed, unchanged:
 * `SP_GET_MOP_DETAILS_BY_CRQN` for the header, `SP_STORE_CRQ_MOP_CREATE_PDF`
 * and `SP_GET_CRQ_MOP_CREATE_PDF` for the document.
 */
export const MopCreateDocumentPanel: React.FC<MopCreateDocumentPanelProps> = ({
  crqNo,
  readOnly,
  colors,
}) => {
  const { data, isLoading, isError } = useGetMopCreateDetailsQuery(crqNo as string, {
    skip: !crqNo,
  });

  if (!crqNo) {
    return (
      <Alert severity="info" sx={{ fontSize: 13, m: 2 }}>
        Select a CRQ to see its MOP document.
      </Alert>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
        height: "100%",
        minHeight: 0,
        p: 2,
        // Capped so five short values and a PDF don't stretch across a
        // 1600px monitor; it still fills anything narrower.
        maxWidth: 1100,
      }}
    >
      {isError ? (
        <Alert severity="warning" sx={{ fontSize: 12.5, flexShrink: 0 }}>
          The MOP header for {crqNo} could not be loaded. The document below can still be uploaded.
        </Alert>
      ) : (
        <MopDetailsStrip details={data} loading={isLoading} colors={colors} />
      )}

      <MopDocumentUploader
        crqNo={crqNo}
        attached={Boolean(data?.documentAttached)}
        documentType={data?.documentType ?? null}
        readOnly={readOnly}
        colors={colors}
      />
    </Box>
  );
};

export default MopCreateDocumentPanel;
