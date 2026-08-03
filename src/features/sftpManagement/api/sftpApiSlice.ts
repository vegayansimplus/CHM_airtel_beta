import { api } from "../../../service/api";
import type {
  RemoteFileEntry,
  SendToLinuxRequest,
  SftpConnectionDetails,
  SftpFileEntry,
  UploadFileArgs,
} from "../types/sftp.types";

const buildUploadFormData = ({ file, replace }: UploadFileArgs) => {
  const formData = new FormData();
  formData.append("file", file);
  return { formData, replace: replace ?? false };
};

export const sftpApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // ───────────────────────── Windows module ─────────────────────────
    // Existing backend endpoints under /api/sftpfromui — untouched, only consumed here.
    getWindowsFiles: builder.query<SftpFileEntry[], void>({
      query: () => "/api/sftpfromui/list",
      providesTags: ["SftpWindowsFiles"],
    }),
    uploadWindowsFile: builder.mutation<string, UploadFileArgs>({
      query: (args) => {
        const { formData, replace } = buildUploadFormData(args);
        return {
          url: `/api/sftpfromui/upload?replace=${replace}`,
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["SftpWindowsFiles"],
    }),
    deleteWindowsFile: builder.mutation<string, string>({
      query: (fileName) => ({
        url: `/api/sftpfromui/delete/${encodeURIComponent(fileName)}`,
        method: "DELETE",
      }),
      invalidatesTags: ["SftpWindowsFiles"],
    }),
    downloadWindowsFile: builder.query<Blob, string>({
      query: (fileName) => ({
        url: `/api/sftpfromui/download/${encodeURIComponent(fileName)}`,
        method: "GET",
        responseHandler: (response: Response) => response.blob(),
        cache: "no-cache",
      }),
    }),

    // ───────────────────────── Linux module (local staging folder) ─────────────────────────
    getLinuxFiles: builder.query<SftpFileEntry[], void>({
      query: () => "/api/sftp/linux/list",
      providesTags: ["SftpLinuxFiles"],
    }),
    uploadLinuxFile: builder.mutation<string, UploadFileArgs>({
      query: (args) => {
        const { formData, replace } = buildUploadFormData(args);
        return {
          url: `/api/sftp/linux/upload?replace=${replace}`,
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["SftpLinuxFiles"],
    }),
    deleteLinuxFile: builder.mutation<string, string>({
      query: (fileName) => ({
        url: `/api/sftp/linux/delete/${encodeURIComponent(fileName)}`,
        method: "DELETE",
      }),
      invalidatesTags: ["SftpLinuxFiles"],
    }),
    downloadLinuxFile: builder.query<Blob, string>({
      query: (fileName) => ({
        url: `/api/sftp/linux/download/${encodeURIComponent(fileName)}`,
        method: "GET",
        responseHandler: (response: Response) => response.blob(),
        cache: "no-cache",
      }),
    }),

    // ───────────────────────── Linux module (remote server over SFTP) ─────────────────────────
    // Every call carries the target host's connection details in the body (never a query
    // string) and the backend opens a fresh SFTP session per call — nothing is cached
    // server-side, so these are plain mutations rather than cacheable queries.
    sendFileToLinuxServer: builder.mutation<RemoteFileEntry[], SendToLinuxRequest>({
      query: (body) => ({
        url: "/api/sftp/linux/remote/send",
        method: "POST",
        body,
      }),
    }),
    listLinuxRemoteFiles: builder.mutation<RemoteFileEntry[], SftpConnectionDetails>({
      query: (body) => ({
        url: "/api/sftp/linux/remote/list",
        method: "POST",
        body,
      }),
    }),
    downloadLinuxRemoteFile: builder.query<Blob, SendToLinuxRequest>({
      query: (body) => ({
        url: "/api/sftp/linux/remote/download",
        method: "POST",
        body,
        responseHandler: (response: Response) => response.blob(),
        cache: "no-cache",
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetWindowsFilesQuery,
  useUploadWindowsFileMutation,
  useDeleteWindowsFileMutation,
  useLazyDownloadWindowsFileQuery,

  useGetLinuxFilesQuery,
  useUploadLinuxFileMutation,
  useDeleteLinuxFileMutation,
  useLazyDownloadLinuxFileQuery,

  useSendFileToLinuxServerMutation,
  useListLinuxRemoteFilesMutation,
  useLazyDownloadLinuxRemoteFileQuery,
} = sftpApi;
