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
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

import { useState, useMemo } from "react";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";
import { useUploadEmployeesFromExcelMutation } from "../../api/teamManagement.api";

interface Props {
  open: boolean;
  onClose: () => void;
}

interface UploadResponse {
  rowNumber: number;
  olmid: string;
  status: "SUCCESS" | "FAILED";
  message: string;
}

export const UploadEmployeeDialog = ({ open, onClose }: Props) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [resultData, setResultData] = useState<UploadResponse[]>([]);
  const [uploadEmployees, { isLoading }] =
    useUploadEmployeesFromExcelMutation();

  /* ================= FILE HANDLER ================= */
  const handleFileChange = (file: File) => {
    if (!file.name.endsWith(".xlsx")) {
      alert("Only .xlsx files are allowed");
      return;
    }
    setSelectedFile(file);
    setResultData([]);
  };

  /* ================= UPLOAD ================= */
  const handleUpload = async () => {
    if (!selectedFile) return;
    try {
      const response = await uploadEmployees(selectedFile).unwrap();
      setResultData(response);
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setResultData([]);
  };

  /* ================= SUMMARY ================= */
  const successCount = useMemo(
    () => resultData.filter((r) => r.status === "SUCCESS").length,
    [resultData],
  );

  const failedCount = useMemo(
    () => resultData.filter((r) => r.status === "FAILED").length,
    [resultData],
  );

  /* ================= TABLE ================= */
  const columns: MRT_ColumnDef<UploadResponse>[] = [
    { accessorKey: "rowNumber", header: "Row", size: 60 },
    { accessorKey: "olmid", header: "OLMID" },
    {
      accessorKey: "status",
      header: "Status",
      Cell: ({ cell }) => {
        const value = cell.getValue<string>();
        return (
          <Chip
            label={value}
            color={value === "FAILED" ? "error" : "success"}
            size="small"
          />
        );
      },
    },
    { accessorKey: "message", header: "Message" },
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>
        Upload Users From Excel
      </DialogTitle>

      <DialogContent>
        <Stack spacing={4}>
          {/* ================= DRAG & DROP AREA ================= */}
          {!resultData.length && (
            <Paper
              component="label"
              elevation={0}
              sx={{
                p: 6,
                borderRadius: 3,
                textAlign: "center",
                border: "2px dashed",
                borderColor: "primary.main",
                cursor: "pointer",
                transition: "0.3s",
                "&:hover": {
                  backgroundColor: "primary.50",
                },
              }}
            >
              <UploadFileIcon
                sx={{ fontSize: 50, color: "primary.main", mb: 2 }}
              />
              <Typography variant="h6" fontWeight={600}>
                Drag & Drop Excel File
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Only .xlsx files supported
              </Typography>

              <input
                hidden
                type="file"
                accept=".xlsx"
                onChange={(e) =>
                  e.target.files && handleFileChange(e.target.files[0])
                }
              />
            </Paper>
          )}

          {/* ================= SELECTED FILE ================= */}
          {selectedFile && !resultData.length && (
            <Box display="flex" alignItems="center" gap={2}>
              <Chip
                label={selectedFile.name}
                color="info"
                variant="outlined"
              />
              <IconButton onClick={handleReset}>
                <DeleteIcon />
              </IconButton>
            </Box>
          )}

          {/* ================= LOADING ================= */}
          {isLoading && (
            <Fade in={isLoading}>
              <Box>
                <Typography variant="body2" mb={1}>
                  Uploading & Processing...
                </Typography>
                <LinearProgress />
              </Box>
            </Fade>
          )}

          {/* ================= RESULT SUMMARY ================= */}
          {resultData.length > 0 && (
            <>
              <Stack direction="row" spacing={3}>
                <Paper
                  sx={{
                    p: 3,
                    flex: 1,
                    borderRadius: 3,
                    backgroundColor: "success.light",
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="center">
                    <CheckCircleIcon color="success" />
                    <Typography variant="h6">
                      {successCount} Success
                    </Typography>
                  </Stack>
                </Paper>

                <Paper
                  sx={{
                    p: 3,
                    flex: 1,
                    borderRadius: 3,
                    backgroundColor: "error.light",
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="center">
                    <ErrorIcon color="error" />
                    <Typography variant="h6">
                      {failedCount} Failed
                    </Typography>
                  </Stack>
                </Paper>
              </Stack>

              <Divider />

              <MaterialReactTable
                columns={columns}
                data={resultData}
                enableTopToolbar={false}
                enablePagination
                initialState={{ pagination: { pageSize: 10, pageIndex: 0 } }}
              />
            </>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Close</Button>

        {!resultData.length && (
          <Button
            variant="contained"
            disabled={!selectedFile || isLoading}
            onClick={handleUpload}
          >
            Upload
          </Button>
        )}

        {resultData.length > 0 && (
          <Button
            variant="outlined"
            startIcon={<RestartAltIcon />}
            onClick={handleReset}
          >
            Upload Another File
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};