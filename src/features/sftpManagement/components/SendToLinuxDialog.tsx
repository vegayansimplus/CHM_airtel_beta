import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  CircularProgress,
  Divider,
  Alert,
  InputAdornment,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import RefreshIcon from "@mui/icons-material/Refresh";
import SendIcon from "@mui/icons-material/Send";
import { toast } from "react-toastify";
import {
  useSendFileToLinuxServerMutation,
  useListLinuxRemoteFilesMutation,
  useLazyDownloadLinuxRemoteFileQuery,
} from "../api/sftpApiSlice";
import type { RemoteFileEntry, SftpConnectionDetails } from "../types/sftp.types";

interface SendToLinuxDialogProps {
  open: boolean;
  fileName: string | null;
  onClose: () => void;
}

const EMPTY_CONNECTION: SftpConnectionDetails = { host: "", port: 22, username: "", password: "" };

const getErrorMessage = (err: unknown, fallback: string): string => {
  const data = (err as { data?: unknown })?.data;
  if (typeof data === "string") return data;
  if (data && typeof data === "object" && "message" in data) {
    return String((data as { message?: unknown }).message ?? fallback);
  }
  return fallback;
};

export default function SendToLinuxDialog({ open, fileName, onClose }: SendToLinuxDialogProps) {
  const [conn, setConn] = useState<SftpConnectionDetails>(EMPTY_CONNECTION);
  const [showPassword, setShowPassword] = useState(false);
  const [remoteFiles, setRemoteFiles] = useState<RemoteFileEntry[] | null>(null);
  const [downloadingFile, setDownloadingFile] = useState<string | null>(null);

  const [sendFile, { isLoading: isSending }] = useSendFileToLinuxServerMutation();
  const [listRemote, { isLoading: isListing }] = useListLinuxRemoteFilesMutation();
  const [triggerDownload] = useLazyDownloadLinuxRemoteFileQuery();

  // A fresh file selection starts a clean remote-listing view; the last-used
  // host/username/password are kept so re-sending another file doesn't force
  // the user to retype them.
  useEffect(() => {
    if (open) setRemoteFiles(null);
  }, [open, fileName]);

  const canSubmit = Boolean(fileName && conn.host.trim() && conn.username.trim() && conn.password.trim());

  const handleClose = () => {
    setRemoteFiles(null);
    setShowPassword(false);
    onClose();
  };

  const handleSend = async () => {
    if (!fileName || !canSubmit) return;
    try {
      const result = await sendFile({ ...conn, fileName }).unwrap();
      setRemoteFiles(result);
      toast.success(`${fileName} sent to ${conn.host}:/tmp`);
    } catch (err) {
      toast.error(getErrorMessage(err, `Failed to send ${fileName} to ${conn.host}.`));
    }
  };

  const handleRefreshRemoteList = async () => {
    if (!canSubmit) return;
    try {
      const result = await listRemote(conn).unwrap();
      setRemoteFiles(result);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to list the remote /tmp directory."));
    }
  };

  const handleDownloadRemote = async (remoteFileName: string) => {
    setDownloadingFile(remoteFileName);
    try {
      const blob = await triggerDownload({ ...conn, fileName: remoteFileName }).unwrap();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = remoteFileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      toast.error(`Failed to download ${remoteFileName} from the remote server.`);
    } finally {
      setDownloadingFile(null);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Send to Linux Server</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Sending <strong>{fileName}</strong> to the remote server&apos;s <code>/tmp</code> directory over SFTP.
          These credentials are used for this connection only and are never stored.
        </Typography>

        <Grid container spacing={2}>
          <Grid size={{ xs: 8 }}>
            <TextField
              label="Host / IP Address"
              fullWidth
              required
              value={conn.host}
              onChange={(e) => setConn((c) => ({ ...c, host: e.target.value }))}
            />
          </Grid>
          <Grid size={{ xs: 4 }}>
            <TextField
              label="Port"
              type="number"
              fullWidth
              value={conn.port ?? 22}
              onChange={(e) => setConn((c) => ({ ...c, port: Number(e.target.value) || 22 }))}
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <TextField
              label="Username"
              fullWidth
              required
              value={conn.username}
              onChange={(e) => setConn((c) => ({ ...c, username: e.target.value }))}
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <TextField
              label="Password"
              fullWidth
              required
              type={showPassword ? "text" : "password"}
              value={conn.password}
              onChange={(e) => setConn((c) => ({ ...c, password: e.target.value }))}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setShowPassword((s) => !s)} edge="end">
                        {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Grid>
        </Grid>

        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
          <Button
            variant="contained"
            startIcon={isSending ? <CircularProgress size={16} color="inherit" /> : <SendIcon />}
            disabled={!canSubmit || isSending}
            onClick={handleSend}
          >
            {isSending ? "Sending..." : "Connect & Send"}
          </Button>
        </Box>

        {remoteFiles !== null && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
              <Typography variant="subtitle2" fontWeight={600}>
                Remote /tmp on {conn.host}
              </Typography>
              <IconButton size="small" onClick={handleRefreshRemoteList} disabled={isListing}>
                {isListing ? <CircularProgress size={16} /> : <RefreshIcon fontSize="small" />}
              </IconButton>
            </Box>

            {remoteFiles.length === 0 ? (
              <Alert severity="info">No files found in /tmp.</Alert>
            ) : (
              <Box sx={{ overflowX: "auto" }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Size</TableCell>
                      <TableCell>Modified</TableCell>
                      <TableCell align="right">Download</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {remoteFiles
                      .filter((f) => !f.directory)
                      .map((f) => (
                        <TableRow key={f.fileName} hover>
                          <TableCell>
                            <Typography noWrap title={f.fileName} sx={{ maxWidth: 220 }}>
                              {f.fileName}
                            </Typography>
                          </TableCell>
                          <TableCell>{f.fileSize}</TableCell>
                          <TableCell>{f.fileDate}</TableCell>
                          <TableCell align="right">
                            <IconButton
                              size="small"
                              onClick={() => handleDownloadRemote(f.fileName)}
                              disabled={downloadingFile === f.fileName}
                            >
                              {downloadingFile === f.fileName ? (
                                <CircularProgress size={16} />
                              ) : (
                                <CloudDownloadIcon fontSize="small" />
                              )}
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </Box>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
