import { useState } from "react";
import { IconButton, Tooltip } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import CommonContainer from "../../../components/common/CommonContainer";
import FileManagerPanel from "../components/FileManagerPanel";
import SendToLinuxDialog from "../components/SendToLinuxDialog";
import {
  useGetLinuxFilesQuery,
  useUploadLinuxFileMutation,
  useDeleteLinuxFileMutation,
  useLazyDownloadLinuxFileQuery,
} from "../api/sftpApiSlice";

const triggerBrowserDownload = (blob: Blob, fileName: string) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

export default function LinuxSftpPage() {
  const { data: files, isLoading, isFetching, refetch } = useGetLinuxFilesQuery();
  const [uploadFile, { isLoading: isUploading }] = useUploadLinuxFileMutation();
  const [deleteFile] = useDeleteLinuxFileMutation();
  const [triggerDownload] = useLazyDownloadLinuxFileQuery();
  const [sendDialogFile, setSendDialogFile] = useState<string | null>(null);

  const handleDownload = async (fileName: string) => {
    const blob = await triggerDownload(fileName).unwrap();
    triggerBrowserDownload(blob, fileName);
  };

  return (
    <CommonContainer>
      <FileManagerPanel
        title="Linux SFTP File Manager"
        subtitle="Files staged locally (C:\vivek\Linux SFTP\) before being sent to a remote Linux server's /tmp directory."
        files={files}
        isLoading={isLoading}
        isFetching={isFetching}
        onRefresh={refetch}
        isUploading={isUploading}
        onUpload={(file) => uploadFile({ file }).unwrap()}
        onDownload={handleDownload}
        onDelete={(fileName) => deleteFile(fileName).unwrap()}
        renderRowAction={(fileName) => (
          <Tooltip title="Send to Linux Server">
            <IconButton size="small" color="primary" onClick={() => setSendDialogFile(fileName)}>
              <SendIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      />

      <SendToLinuxDialog
        open={sendDialogFile !== null}
        fileName={sendDialogFile}
        onClose={() => setSendDialogFile(null)}
      />
    </CommonContainer>
  );
}
