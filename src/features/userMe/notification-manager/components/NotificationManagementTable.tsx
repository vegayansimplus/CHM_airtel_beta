import React, { useMemo, useCallback, type CSSProperties } from "react";
import { useTheme } from "@mui/material/styles";
import { Box } from "@mui/material";
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from "material-react-table";
import { useNotifTokens, buildToggleCss } from "../style/notificationTokens";
import {
  useGetNotificationConfigsQuery,
  useUpdateNotificationMutation,
  useDeleteNotificationMutation,
  type TransformedNotificationSetting,
} from "../api/notificationApiSlice";

// ─── Custom CSS Animations ───────────────────────────────────────────────────
const ANIM_CSS = `
@keyframes ntfRowIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
.ntf-row { animation: ntfRowIn 0.28s ease both; }
@keyframes ntfPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
.ntf-live { animation: ntfPulse 2.4s infinite; }
`;

// ─── Toggle Component ─────────────────────────────────────────────────────────
const Toggle: React.FC<{
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}> = ({ checked, onChange, disabled }) => (
  <label
    className="ntf-tog"
    style={{
      opacity: disabled ? 0.45 : 1,
      pointerEvents: disabled ? "none" : "auto",
    }}
  >
    <input type="checkbox" checked={checked} onChange={onChange} />
    <div className="ntf-track">
      <div className="ntf-thumb" />
    </div>
  </label>
);

// ─── Status Indicator ─────────────────────────────────────────────────────────
const StatusIndicator: React.FC<{
  isActive: boolean;
  tk: ReturnType<typeof useNotifTokens>;
}> = ({ isActive, tk }) => {
  const style: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    padding: "4px 10px",
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 600,
    whiteSpace: "nowrap",
    background: isActive
      ? tk.successDim
      : tk.isDark
        ? "rgba(255,255,255,0.05)"
        : "rgba(15,23,42,0.06)",
    color: isActive ? tk.success : tk.textSecondary,
    border: `1px solid ${isActive ? tk.successBorder : tk.border}`,
  };

  return (
    <span style={style}>
      {isActive && (
        <span
          className="ntf-live"
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "currentColor",
            flexShrink: 0,
          }}
        />
      )}
      {isActive ? "Active" : "Inactive"}
    </span>
  );
};

// ─── Main MRT Component ───────────────────────────────────────────────────────
const NotificationManagementTable: React.FC = () => {
  const theme = useTheme();
  const tk = useNotifTokens(theme);

  const {
    data: rows = [],
    isLoading,
    isError,
  } = useGetNotificationConfigsQuery();

  const [updateNotification, { isLoading: isUpdating }] =
    useUpdateNotificationMutation();
  const [deleteNotification, { isLoading: isDeleting }] =
    useDeleteNotificationMutation();

  const busy = isUpdating || isDeleting;

  const handleToggle = useCallback(
    (
      row: TransformedNotificationSetting,
      field: keyof Omit<
        TransformedNotificationSetting,
        "configId" | "moduleCode" | "subModuleCode" | "actionCode"
      >,
    ) => {
      const updated = {
        ...row,
        [field]: !row[field],
      };
      updateNotification(updated);
    },
    [updateNotification],
  );

  const handleDelete = useCallback(
    (row: TransformedNotificationSetting) => {
      deleteNotification({ moduleId: row.configId });
    },
    [deleteNotification],
  );

  // Styling object replicas from your tokens
  const moduleBadgeStyle: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "4px 12px",
    background: tk.infoDim,
    border: `1px solid ${tk.infoBorder}`,
    color: tk.info,
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 700,
    whiteSpace: "nowrap",
  };

  const actionBadgeStyle: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "2px 10px",
    background: tk.isDark ? "rgba(168,85,247,0.15)" : "rgba(168,85,247,0.1)",
    border: `1px solid ${
      tk.isDark ? "rgba(168,85,247,0.3)" : "rgba(168,85,247,0.2)"
    }`,
    color: tk.isDark ? "rgba(216,180,255)" : "rgba(147,51,234)",
    borderRadius: 6,
    fontSize: 11,
    fontWeight: 600,
    whiteSpace: "nowrap",
  };

  const delBtnBase: CSSProperties = {
    width: 32,
    height: 32,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: tk.dangerDim,
    border: `1px solid ${tk.dangerBorder}`,
    borderRadius: 6,
    color: tk.danger,
    cursor: "pointer",
    transition: "all .15s ease",
    padding: 0,
    fontSize: 14,
  };

  // ─── Define MRT Columns ─────────────────────────────────────────────────────
  const columns = useMemo<MRT_ColumnDef<TransformedNotificationSetting>[]>(
    () => [
      {
        accessorKey: "moduleCode",
        header: "Module",
        size: 130,
        Cell: ({ cell }) => (
          <span style={moduleBadgeStyle}>
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "currentColor",
                flexShrink: 0,
              }}
            />
            {cell.getValue<string>()}
          </span>
        ),
      },
      {
        accessorKey: "subModuleCode",
        header: "Sub-Module Code",
        size: 150,
        Cell: ({ cell }) => (
          <span
            style={{ fontSize: 13, fontWeight: 500, color: tk.textPrimary }}
          >
            {cell.getValue<string>()}
          </span>
        ),
      },
      {
        accessorKey: "actionCode",
        header: "Action",
        size: 120,
        Cell: ({ cell }) => (
          <span style={actionBadgeStyle}>{cell.getValue<string>()}</span>
        ),
      },
      {
        id: "status",
        header: "Status",
        size: 100,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
        Cell: ({ row }) => {
          const isAnyActive =
            row.original.notifyDomainHead ||
            row.original.notifyFunctionHead ||
            row.original.notifySubDomainHead ||
            row.original.notifySuperAdmin ||
            row.original.notifyTeamMember ||
            row.original.notifyVerticalHead;
          return <StatusIndicator isActive={isAnyActive} tk={tk} />;
        },
      },
      {
        accessorKey: "notifyDomainHead",
        header: "Domain Head",
        size: 100,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
        Cell: ({ cell, row }) => (
          <Box display="flex" justifyContent="center">
            <Toggle
              checked={cell.getValue<boolean>()}
              onChange={() => handleToggle(row.original, "notifyDomainHead")}
              disabled={busy}
            />
          </Box>
        ),
      },
      {
        accessorKey: "notifyFunctionHead",
        header: "Function Head",
        size: 100,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
        Cell: ({ cell, row }) => (
          <Box display="flex" justifyContent="center">
            <Toggle
              checked={cell.getValue<boolean>()}
              onChange={() => handleToggle(row.original, "notifyFunctionHead")}
              disabled={busy}
            />
          </Box>
        ),
      },
      {
        accessorKey: "notifySubDomainHead",
        header: "Sub-Domain Head",
        size: 100,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
        Cell: ({ cell, row }) => (
          <Box display="flex" justifyContent="center">
            <Toggle
              checked={cell.getValue<boolean>()}
              onChange={() => handleToggle(row.original, "notifySubDomainHead")}
              disabled={busy}
            />
          </Box>
        ),
      },
      {
        accessorKey: "notifySuperAdmin",
        header: "Super Admin",
        size: 100,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
        Cell: ({ cell, row }) => (
          <Box display="flex" justifyContent="center">
            <Toggle
              checked={cell.getValue<boolean>()}
              onChange={() => handleToggle(row.original, "notifySuperAdmin")}
              disabled={busy}
            />
          </Box>
        ),
      },
      {
        accessorKey: "notifyTeamMember",
        header: "Team Member",
        size: 100,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
        Cell: ({ cell, row }) => (
          <Box display="flex" justifyContent="center">
            <Toggle
              checked={cell.getValue<boolean>()}
              onChange={() => handleToggle(row.original, "notifyTeamMember")}
              disabled={busy}
            />
          </Box>
        ),
      },
      {
        accessorKey: "notifyVerticalHead",
        header: "Vertical Head",
        size: 100,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
        Cell: ({ cell, row }) => (
          <Box display="flex" justifyContent="center">
            <Toggle
              checked={cell.getValue<boolean>()}
              onChange={() => handleToggle(row.original, "notifyVerticalHead")}
              disabled={busy}
            />
          </Box>
        ),
      },
      {
        id: "actions",
        header: "Delete",
        size: 80,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
        Cell: ({ row }) => (
          <button
            style={delBtnBase}
            disabled={busy}
            title="Delete"
            onClick={() => handleDelete(row.original)}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = tk.isDark
                ? "rgba(219,79,74,0.25)"
                : "rgba(219,79,74,0.16)";
              (e.currentTarget as HTMLElement).style.transform = "scale(1.08)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = tk.dangerDim;
              (e.currentTarget as HTMLElement).style.transform = "scale(1)";
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
              <path d="M10 11v6M14 11v6" />
            </svg>
          </button>
        ),
      },
    ],
    [tk, busy, handleToggle, handleDelete],
  );

  // ─── MRT Table Instance Creation ─────────────────────────────────────────────
  const table = useMaterialReactTable({
    columns,
    data: rows,
    state: {
      // isLoading,
      showAlertBanner: isError,
    },
    // Turn off MRT native settings to match visual requirements of custom table
    enableColumnActions: false,
    enableColumnFilters: false,
    enablePagination: false,
    enableSorting: false,
    enableTopToolbar: false,
    enableBottomToolbar: false,
    enableStickyHeader: true,

    // Container Styling
    muiTablePaperProps: {
      sx: {
        background: tk.surface,
        border: `1px solid ${tk.border}`,
        borderRadius: `${tk.radiusXL}px`,
        boxShadow: tk.isDark
          ? "0 8px 32px rgba(0,0,0,0.45)"
          : "0 4px 24px rgba(15,23,42,0.08)",
        overflow: "hidden",
      },
    },
    muiTableContainerProps: {
      sx: {
        maxHeight: "70vh",
      },
    },
    muiTableHeadCellProps: {
      sx: {
        background: tk.isDark
          ? "rgba(255,255,255,0.02) !important"
          : "rgba(15,23,42,0.03) !important",
        color: tk.textSecondary,
        borderBottom: `2px solid ${tk.border}`,
        padding: "14px 12px",
        fontSize: "12px",
        fontWeight: 700,
        letterSpacing: "0.5px",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
      },
    },
    muiTableBodyCellProps: {
      sx: {
        padding: "13px 12px",
        color: tk.textPrimary,
        verticalAlign: "middle",
        fontSize: "13px",
        borderBottom: `1px solid ${tk.border}`,
      },
    },
    muiTableBodyRowProps: ({ row }) => ({
      className: "ntf-row",
      style: {
        animationDelay: `${row.index * 0.04}s`,
      },
      sx: {
        transition: "background .13s",
        "&:hover": {
          background: tk.isDark
            ? "rgba(255,255,255,0.025) !important"
            : "rgba(15,23,42,0.03) !important",
        },
      },
    }),
    renderEmptyRowsFallback: () => (
      <Box
        sx={{
          padding: 40,
          textAlign: "center",
          color: tk.textSecondary,
          fontSize: 14,
        }}
      >
        No notification settings available.
      </Box>
    ),
  });

  return (
    <>
      <style>{ANIM_CSS + buildToggleCss(tk)}</style>
      <MaterialReactTable table={table} />
    </>
  );
};

export default NotificationManagementTable;

// import React, { useMemo, useCallback } from "react";
// import {
//   MaterialReactTable,
//   useMaterialReactTable,
//   type MRT_ColumnDef,
// } from "material-react-table";
// import { useTheme, Box } from "@mui/material";
// import { useNotifTokens, buildToggleCss } from "../style/notificationTokens";
// import {
//   useGetNotificationConfigsQuery,
//   useUpdateNotificationMutation,
//   useDeleteNotificationMutation,
//   type TransformedNotificationSetting,
// } from "../api/notificationApiSlice";

// // ─── STYLES & ANIMATIONS (Kept from original) ──────────────────────────────
// const ANIM_CSS = `@keyframes ntfShimmer{0%{background-position:200% 0}100%{background-position:-200% 0}} .ntf-skel{height:13px;border-radius:6px;background-size:200% 100%;animation:ntfShimmer 1.5s infinite} @keyframes ntfRowIn{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}} .ntf-row{animation:ntfRowIn .28s ease both} @keyframes ntfPulse{0%,100%{opacity:1}50%{opacity:.4}} .ntf-live{animation:ntfPulse 2.4s infinite}`;

// // ─── SUB-COMPONENTS (Kept from original) ────────────────────────────────────
// const Toggle: React.FC<{
//   checked: boolean;
//   onChange: () => void;
//   disabled?: boolean;
// }> = ({ checked, onChange, disabled }) => (
//   <label
//     className="ntf-tog"
//     style={{
//       opacity: disabled ? 0.45 : 1,
//       pointerEvents: disabled ? "none" : "auto",
//     }}
//   >
//     <input type="checkbox" checked={checked} onChange={onChange} />
//     <div className="ntf-track">
//       <div className="ntf-thumb" />
//     </div>
//   </label>
// );

// const StatusIndicator: React.FC<{
//   isActive: boolean;
//   tk: ReturnType<typeof useNotifTokens>;
// }> = ({ isActive, tk }) => (
//   <Box
//     sx={{
//       display: "inline-flex",
//       alignItems: "center",
//       gap: "5px",
//       padding: "4px 10px",
//       borderRadius: "12px",
//       fontSize: "12px",
//       fontWeight: 600,
//       whiteSpace: "nowrap",
//       background: isActive
//         ? tk.successDim
//         : tk.isDark
//           ? "rgba(255,255,255,0.05)"
//           : "rgba(15,23,42,0.06)",
//       color: isActive ? tk.success : tk.textSecondary,
//       border: `1px solid ${isActive ? tk.successBorder : tk.border}`,
//     }}
//   >
//     {isActive && (
//       <span
//         className="ntf-live"
//         style={{
//           width: 6,
//           height: 6,
//           borderRadius: "50%",
//           background: "currentColor",
//           flexShrink: 0,
//         }}
//       />
//     )}
//     {isActive ? "Active" : "Inactive"}
//   </Box>
// );

// // ─── MAIN TABLE COMPONENT ──────────────────────────────────────────────────
// const NotificationManagementTable: React.FC = () => {
//   const theme = useTheme();
//   const tk = useNotifTokens(theme);

//   const {
//     data: rows = [],
//     isLoading,
//     isError,
//   } = useGetNotificationConfigsQuery();
//   const [updateNotification, { isLoading: isUpdating }] =
//     useUpdateNotificationMutation();
//   const [deleteNotification, { isLoading: isDeleting }] =
//     useDeleteNotificationMutation();

//   const busy = isUpdating || isDeleting;

//   const handleToggle = useCallback(
//     (
//       row: TransformedNotificationSetting,
//       field: keyof TransformedNotificationSetting,
//     ) => {
//       const updated = { ...row, [field]: !row[field] };
//       updateNotification(updated);
//     },
//     [updateNotification],
//   );

//   const handleDelete = useCallback(
//     (row: TransformedNotificationSetting) => {
//       if (window.confirm("Are you sure you want to delete this config?")) {
//         deleteNotification({ moduleId: row.configId });
//       }
//     },
//     [deleteNotification],
//   );

//   // ─── COLUMN DEFINITIONS ───────────────────────────────────────────────────
//   const columns = useMemo<MRT_ColumnDef<TransformedNotificationSetting>[]>(
//     () => [
//       {
//         accessorKey: "moduleCode",
//         header: "Module",
//         size: 110,
//         Cell: ({ cell }) => (
//           <span
//             style={{
//               display: "inline-flex",
//               alignItems: "center",
//               gap: 3,
//               padding: "4px 12px",
//               background: tk.infoDim,
//               border: `1px solid ${tk.infoBorder}`,
//               color: tk.info,
//               borderRadius: 6,
//               fontSize: 12,
//               fontWeight: 700,
//             }}
//           >
//             <span
//               style={{
//                 width: 6,
//                 height: 6,
//                 borderRadius: "50%",
//                 background: "currentColor",
//               }}
//             />
//             {cell.getValue<string>()}
//           </span>
//         ),
//       },
//       {
//         accessorKey: "subModuleCode",
//         header: "Sub-Module Code",
//         size: 130,
//         Cell: ({ cell }) => (
//           <span
//             style={{ fontSize: 13, fontWeight: 500, color: tk.textPrimary }}
//           >
//             {cell.getValue<string>()}
//           </span>
//         ),
//       },
//       {
//         accessorKey: "actionCode",
//         header: "Action",
//         size: 90,
//         Cell: ({ cell }) => (
//           <span
//             style={{
//               display: "inline-flex",
//               alignItems: "center",
//               padding: "3px 10px",
//               background: tk.isDark
//                 ? "rgba(168,85,247,0.15)"
//                 : "rgba(168,85,247,0.1)",
//               border: `1px solid ${tk.isDark ? "rgba(168,85,247,0.3)" : "rgba(168,85,247,0.2)"}`,
//               color: tk.isDark ? "rgba(216,180,255)" : "rgba(147,51,234)",
//               borderRadius: 6,
//               fontSize: 11,
//               fontWeight: 600,
//             }}
//           >
//             {cell.getValue<string>()}
//           </span>
//         ),
//       },
//       {
//         id: "status",
//         header: "Status",
//         size: 90,
//         muiTableBodyCellProps: { align: "center" },
//         Cell: ({ row }) => {
//           const isAnyActive =
//             row.original.notifyDomainHead ||
//             row.original.notifyFunctionHead ||
//             row.original.notifySubDomainHead ||
//             row.original.notifySuperAdmin ||
//             row.original.notifyTeamMember ||
//             row.original.notifyVerticalHead;
//           return <StatusIndicator isActive={isAnyActive} tk={tk} />;
//         },
//       },
//       // Reusable Toggle Columns
//       ...(
//         [
//           { key: "notifyDomainHead", label: "Domain Head" },
//           { key: "notifyFunctionHead", label: "Function Head" },
//           { key: "notifySubDomainHead", label: "Sub-Domain Head" },
//           { key: "notifySuperAdmin", label: "Super Admin" },
//           { key: "notifyTeamMember", label: "Team Member" },
//           { key: "notifyVerticalHead", label: "Vertical Head" },
//         ] as const
//       ).map((col) => ({
//         accessorKey: col.key,
//         header: col.label,
//         size: 90,
//         muiTableBodyCellProps: { align: "center" as const },
//         Cell: ({ cell, row }: any) => (
//           <Toggle
//             checked={cell.getValue()}
//             onChange={() => handleToggle(row.original, col.key)}
//             disabled={busy}
//           />
//         ),
//       })),
//       {
//         id: "delete",
//         header: "Delete",
//         size: 60,
//         muiTableBodyCellProps: { align: "center" },
//         Cell: ({ row }) => (
//           <button
//             onClick={() => handleDelete(row.original)}
//             disabled={busy}
//             style={{
//               width: 32,
//               height: 32,
//               display: "inline-flex",
//               alignItems: "center",
//               justifyContent: "center",
//               background: tk.dangerDim,
//               border: `1px solid ${tk.dangerBorder}`,
//               borderRadius: 6,
//               color: tk.danger,
//               cursor: "pointer",
//               transition: "all .15s ease",
//             }}
//             onMouseEnter={(e) => {
//               (e.currentTarget as HTMLElement).style.background = tk.isDark
//                 ? "rgba(219,79,74,0.25)"
//                 : "rgba(219,79,74,0.16)";
//               (e.currentTarget as HTMLElement).style.transform = "scale(1.08)";
//             }}
//             onMouseLeave={(e) => {
//               (e.currentTarget as HTMLElement).style.background = tk.dangerDim;
//               (e.currentTarget as HTMLElement).style.transform = "scale(1)";
//             }}
//           >
//             <svg
//               width="14"
//               height="14"
//               viewBox="0 0 24 24"
//               fill="none"
//               stroke="currentColor"
//               strokeWidth="2"
//             >
//               <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6" />
//             </svg>
//           </button>
//         ),
//       },
//     ],
//     [tk, busy, handleToggle, handleDelete],
//   );

//   const table = useMaterialReactTable({
//     columns,
//     data: rows,
//     state: {
//       // isLoading,
//       showAlertBanner: isError,
//     },
//     // Styling matches your original 'wrapStyle'
//     muiTablePaperProps: {
//       elevation: 0,
//       style: {
//         background: tk.surface,
//         border: `1px solid ${tk.border}`,
//         borderRadius: tk.radiusXL,
//         boxShadow: tk.isDark
//           ? "0 8px 32px rgba(0,0,0,0.45)"
//           : "0 4px 24px rgba(15,23,42,0.08)",
//         overflow: "hidden",
//       },
//     },
//     muiTableContainerProps: {
//       sx: { maxHeight: "70vh" },
//     },
//     muiTableHeadCellProps: {
//       sx: {
//         padding: "14px 12px",
//         fontSize: "12px",
//         fontWeight: 700,
//         letterSpacing: "0.5px",
//         textTransform: "uppercase",
//         color: tk.textSecondary,
//         background: tk.isDark
//           ? "rgba(255,255,255,0.02)"
//           : "rgba(15,23,42,0.03)",
//         borderBottom: `2px solid ${tk.border}`,
//       },
//     },

//     // initialState: {
//     //   density: "compact",
//     //   columnPinning: {
//     //     right: ["delete"],
//     //   },
//     // },
//     muiTableBodyCellProps: {
//       sx: {
//         padding: "13px 12px",
//         color: tk.textPrimary,
//         fontSize: "13px",
//         borderBottom: `1px solid ${tk.border}`,
//       },
//     },
//     muiTableBodyRowProps: ({ row }) => ({
//       className: "ntf-row",
//       sx: {
//         animationDelay: `${row.index * 0.04}s`,
//         transition: "background .13s",
//         "&:hover": {
//           background: tk.isDark
//             ? "rgba(255,255,255,0.025) !important"
//             : "rgba(15,23,42,0.03) !important",
//         },
//       },
//     }),
//     // Table Features Configuration
//     enableColumnActions: false,
//     enableColumnFilters: false,
//     enablePagination: false,
//     enableSorting: false,
//     enableBottomToolbar: false,
//     enableTopToolbar: false,
//     enableStickyHeader: true,
//     renderEmptyRowsFallback: () => (
//       <Box sx={{ padding: 10, textAlign: "center", color: tk.textSecondary }}>
//         No notification settings available.
//       </Box>
//     ),
//   });

//   return (
//     <>
//       <style>{ANIM_CSS + buildToggleCss(tk)}</style>
//       <MaterialReactTable table={table} />
//     </>
//   );
// };

// export default NotificationManagementTable;
