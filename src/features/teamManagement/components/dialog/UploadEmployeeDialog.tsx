import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Stack,
  IconButton,
  Paper,
  LinearProgress,
  Chip,
  Fade,
  Divider,
  Step,
  StepLabel,
  Stepper,
  Alert,
  Tooltip,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import CloseIcon from "@mui/icons-material/Close";
import TableChartOutlinedIcon from "@mui/icons-material/TableChartOutlined";

import { useState, useMemo, useRef } from "react";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";
import {
  useLazyDownloadEmployeeTemplateQuery,
  useUploadEmployeesFromExcelMutation,
  type ExcelUploadRowResult,
} from "../../api/teamManagement.api";

/* ─── Props ─────────────────────────────────────────────────────────────── */
interface Props {
  open: boolean;
  onClose: () => void;
}

/* ─── Steps ─────────────────────────────────────────────────────────────── */
const STEPS = ["Download Template", "Fill & Upload", "Review Results"];

/* ─── Column def ────────────────────────────────────────────────────────── */
const resultColumns: MRT_ColumnDef<ExcelUploadRowResult>[] = [
  { accessorKey: "rowNumber", header: "Row", size: 60 },
  { accessorKey: "olmid",     header: "OLMID", size: 120 },
  {
    accessorKey: "status",
    header: "Status",
    size: 100,
    Cell: ({ cell }) => {
      const v = cell.getValue<string>();
      return (
        <Chip
          label={v}
          size="small"
          color={v === "SUCCESS" ? "success" : "error"}
          sx={{ fontWeight: 600, letterSpacing: 0.3 }}
        />
      );
    },
  },
  { accessorKey: "message", header: "Message" },
];

/* ─── Component ─────────────────────────────────────────────────────────── */
export const UploadEmployeeDialog = ({ open, onClose }: Props) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeStep,   setActiveStep]   = useState(0);
  const [isDragging,   setIsDragging]   = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError,    setFileError]    = useState<string | null>(null);
  const [resultData,   setResultData]   = useState<ExcelUploadRowResult[]>([]);

  const [triggerDownload, { isFetching: isDownloading }] =
    useLazyDownloadEmployeeTemplateQuery();
  const [uploadEmployees, { isLoading: isUploading }] =
    useUploadEmployeesFromExcelMutation();

  /* ── Summary counts ── */
  const successCount = useMemo(
    () => resultData.filter((r) => r.status === "SUCCESS").length,
    [resultData],
  );
  const failedCount = useMemo(
    () => resultData.filter((r) => r.status === "FAILED").length,
    [resultData],
  );

  /* ── Handlers ── */
  const handleDownloadTemplate = async () => {
    try {
      const blob = await triggerDownload().unwrap();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = "Employee_Upload_Template.xlsx";
      a.click();
      URL.revokeObjectURL(url);
      // Automatically advance to step 2 after download
      setActiveStep(1);
    } catch {
      // download error handled by RTK Query
    }
  };

  const validateAndSetFile = (file: File) => {
    setFileError(null);
    if (!file.name.endsWith(".xlsx")) {
      setFileError("Only .xlsx files are accepted. Please use the downloaded template.");
      return;
    }
    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) validateAndSetFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    try {
      const response = await uploadEmployees(selectedFile).unwrap();
      setResultData(response);
      setActiveStep(2);
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setResultData([]);
    setFileError(null);
    setActiveStep(1);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClose = () => {
    handleReset();
    setActiveStep(0);
    onClose();
  };

  /* ─── Render ─────────────────────────────────────────────────────────── */
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      {/* ── Header ── */}
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pb: 1,
        }}
      >
        <Box display="flex" alignItems="center" gap={1.5}>
          <TableChartOutlinedIcon color="primary" />
          <Typography fontWeight={700} fontSize={18}>
            Bulk Upload Employees
          </Typography>
        </Box>
        <IconButton size="small" onClick={handleClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 3 }}>
        <Stack spacing={4}>

          {/* ── Stepper ── */}
          <Stepper activeStep={activeStep} alternativeLabel>
            {STEPS.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* ════════════════════════════════════════════════════════════
              STEP 0 — Download template
          ════════════════════════════════════════════════════════════ */}
          {activeStep === 0 && (
            <Paper
              variant="outlined"
              sx={{
                p: 4,
                borderRadius: 3,
                textAlign: "center",
                borderColor: "primary.main",
                borderStyle: "dashed",
                bgcolor: "primary.50",
              }}
            >
              <DownloadIcon sx={{ fontSize: 52, color: "primary.main", mb: 1.5 }} />
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Start with the official template
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Download the pre-filled Excel template with all required dropdowns
                and hierarchy data already populated. Fill in your employee details
                and upload it back here.
              </Typography>

              <Stack direction="row" spacing={2} justifyContent="center">
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<DownloadIcon />}
                  onClick={handleDownloadTemplate}
                  disabled={isDownloading}
                  sx={{ textTransform: "none", fontWeight: 600, borderRadius: 2, px: 4 }}
                >
                  {isDownloading ? "Downloading…" : "Download Template"}
                </Button>
                <Tooltip title="Skip if you already have the template">
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => setActiveStep(1)}
                    sx={{ textTransform: "none", borderRadius: 2 }}
                  >
                    I already have it
                  </Button>
                </Tooltip>
              </Stack>
            </Paper>
          )}

          {/* ════════════════════════════════════════════════════════════
              STEP 1 — Upload filled file
          ════════════════════════════════════════════════════════════ */}
          {activeStep === 1 && (
            <Stack spacing={3}>
              {/* Drag-and-drop zone */}
              <Box
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                sx={{
                  p: 5,
                  borderRadius: 3,
                  textAlign: "center",
                  border: "2px dashed",
                  borderColor: isDragging ? "primary.dark" : selectedFile ? "success.main" : "primary.main",
                  bgcolor: isDragging
                    ? "primary.100"
                    : selectedFile
                    ? "success.50"
                    : "grey.50",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  "&:hover": { bgcolor: "primary.50", borderColor: "primary.dark" },
                }}
              >
                <input
                  ref={fileInputRef}
                  hidden
                  type="file"
                  accept=".xlsx"
                  onChange={(e) => e.target.files && validateAndSetFile(e.target.files[0])}
                />

                {selectedFile ? (
                  <>
                    <CheckCircleOutlineIcon sx={{ fontSize: 48, color: "success.main", mb: 1 }} />
                    <Typography fontWeight={600} color="success.main">
                      File ready to upload
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mt={0.5}>
                      {selectedFile.name} &nbsp;·&nbsp;{(selectedFile.size / 1024).toFixed(1)} KB
                    </Typography>
                  </>
                ) : (
                  <>
                    <UploadFileIcon sx={{ fontSize: 48, color: "primary.main", mb: 1 }} />
                    <Typography fontWeight={600}>
                      Drag & drop your filled Excel here
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mt={0.5}>
                      or click to browse &nbsp;·&nbsp; .xlsx only
                    </Typography>
                  </>
                )}
              </Box>

              {/* File error */}
              {fileError && (
                <Alert severity="error" onClose={() => setFileError(null)}>
                  {fileError}
                </Alert>
              )}

              {/* Selected file actions */}
              {selectedFile && (
                <Box display="flex" alignItems="center" gap={1.5}>
                  <Chip
                    icon={<UploadFileIcon />}
                    label={selectedFile.name}
                    color="success"
                    variant="outlined"
                    sx={{ fontWeight: 500 }}
                  />
                  <Tooltip title="Remove file">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                        setFileError(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              )}

              {/* Upload progress */}
              {isUploading && (
                <Fade in>
                  <Box>
                    <Typography variant="body2" color="text.secondary" mb={1}>
                      Processing employees…
                    </Typography>
                    <LinearProgress sx={{ borderRadius: 2 }} />
                  </Box>
                </Fade>
              )}

              {/* Go back to download */}
              <Button
                size="small"
                startIcon={<DownloadIcon />}
                onClick={handleDownloadTemplate}
                disabled={isDownloading}
                sx={{ alignSelf: "flex-start", textTransform: "none" }}
              >
                {isDownloading ? "Downloading…" : "Re-download template"}
              </Button>
            </Stack>
          )}

          {/* ════════════════════════════════════════════════════════════
              STEP 2 — Results
          ════════════════════════════════════════════════════════════ */}
          {activeStep === 2 && resultData.length > 0 && (
            <Stack spacing={3}>
              {/* Summary cards */}
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <Paper
                  sx={{
                    flex: 1, p: 2.5, borderRadius: 3,
                    border: "1px solid", borderColor: "success.light",
                    bgcolor: "success.50",
                  }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <CheckCircleOutlineIcon color="success" sx={{ fontSize: 28 }} />
                    <Box>
                      <Typography variant="h5" fontWeight={700} color="success.dark">
                        {successCount}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Created successfully
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>

                <Paper
                  sx={{
                    flex: 1, p: 2.5, borderRadius: 3,
                    border: "1px solid", borderColor: failedCount ? "error.light" : "grey.200",
                    bgcolor: failedCount ? "error.50" : "grey.50",
                  }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <ErrorOutlineIcon
                      color={failedCount ? "error" : "disabled"}
                      sx={{ fontSize: 28 }}
                    />
                    <Box>
                      <Typography
                        variant="h5"
                        fontWeight={700}
                        color={failedCount ? "error.dark" : "text.disabled"}
                      >
                        {failedCount}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Failed rows
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Stack>

              {failedCount > 0 && (
                <Alert severity="warning">
                  {failedCount} row{failedCount > 1 ? "s" : ""} failed. Fix the
                  highlighted issues and re-upload only the failed rows.
                </Alert>
              )}

              <Divider />

              {/* Results table */}
              <MaterialReactTable
                columns={resultColumns}
                data={resultData}
                enableTopToolbar={false}
                enablePagination
                muiTablePaperProps={{ elevation: 0, sx: { border: "1px solid", borderColor: "divider", borderRadius: 2 } }}
                initialState={{ pagination: { pageSize: 10, pageIndex: 0 } }}
              />
            </Stack>
          )}
        </Stack>
      </DialogContent>

      {/* ── Footer actions ── */}
      <Divider />
      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button onClick={handleClose} sx={{ textTransform: "none" }}>
          Close
        </Button>

        {activeStep === 1 && (
          <Button
            variant="contained"
            disabled={!selectedFile || isUploading}
            onClick={handleUpload}
            startIcon={<UploadFileIcon />}
            sx={{ textTransform: "none", fontWeight: 600, borderRadius: 2, px: 3 }}
          >
            {isUploading ? "Uploading…" : "Upload File"}
          </Button>
        )}

        {activeStep === 2 && (
          <Button
            variant="outlined"
            startIcon={<RestartAltIcon />}
            onClick={handleReset}
            sx={{ textTransform: "none", borderRadius: 2 }}
          >
            Upload Another File
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
