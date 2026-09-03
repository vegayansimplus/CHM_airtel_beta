/**
 * Format of the MOP document stored for a CRQ.
 *
 * `CRQ_PDF_TBL` holds one row per CRQ with a single content column and no
 * MIME or filename column, so the backend sniffs this from the stored bytes.
 * It also means a CRQ carries one MOP in one format - uploading either kind
 * replaces whatever was there.
 */
export type MopDocumentType = "PDF" | "XLSX" | "XLS";

/**
 * MOP Create stage document panel.
 *
 * Mirrors `MopCreateDetailsDto` on the backend, which reads
 * `SP_GET_MOP_DETAILS_BY_CRQN`. That procedure aliases its columns for human
 * display ("CRQ Number", "Change window", "Site/Region"), so the backend maps
 * them by label into these camelCase fields.
 */
export interface MopCreateDetails {
  crqNo: string | null;
  /** Execution start of the current schedule. Null when none is set. */
  changeWindow: string | null;
  /** Plan type, used as the MOP's title. */
  title: string | null;
  /**
   * Region and vendor both come from `CRQ_DETAIL_TBL`, which is still empty
   * in every environment - they are expected to be null today and render as a
   * dash rather than being hidden, so they light up on their own once that
   * table is populated.
   */
  siteRegion: string | null;
  vendor: string | null;
  /** True when a MOP document is already stored against this CRQ. */
  documentAttached: boolean;
  /** Format of that document, or null when none is attached. */
  documentType: MopDocumentType | null;
}

/** Raw-file ceiling enforced by the backend, mirrored here so the drop zone
 *  can reject an oversized file before spending an upload on it. Keep in step
 *  with `MOP_PDF_MAX_BYTES` in `CrqWorkflowService`. */
export const MOP_PDF_MAX_BYTES = 25 * 1024 * 1024;

/** What the file input offers and the drop zone accepts. */
export const MOP_ACCEPT_ATTR = ".pdf,.xlsx,.xls,application/pdf";

/** Extension the download uses, matching what the backend stored. */
export const MOP_EXTENSION: Record<MopDocumentType, string> = {
  PDF: "pdf",
  XLSX: "xlsx",
  XLS: "xls",
};

export const MOP_TYPE_LABEL: Record<MopDocumentType, string> = {
  PDF: "PDF",
  XLSX: "Excel",
  XLS: "Excel (legacy)",
};
