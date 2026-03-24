import React, { useCallback, type CSSProperties } from "react";
import { useTheme } from "@mui/material/styles";

import { useNotifTokens, buildToggleCss } from "./notificationTokens";
import {
  useGetNotificationsQuery,
  useUpdateNotificationMutation,
  useDeleteNotificationMutation,
  type TransformedNotificationSetting,
} from "../api/notificationApiSlice";

// ─── Toggle ───────────────────────────────────────────────────────────────────
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

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const ANIM_CSS = `
  @keyframes ntfShimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
  .ntf-skel{height:13px;border-radius:6px;background-size:200% 100%;animation:ntfShimmer 1.5s infinite}
  @keyframes ntfRowIn{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}
  .ntf-row{animation:ntfRowIn .28s ease both}
  @keyframes ntfPulse{0%,100%{opacity:1}50%{opacity:.4}}
  .ntf-live{animation:ntfPulse 2.4s infinite}
`;

const SkeletonRows: React.FC<{ surface2: string; border: string }> = ({
  surface2,
  border,
}) => (
  <>
    {Array.from({ length: 6 }).map((_, i) => (
      <tr key={i} style={{ borderBottom: `1px solid ${border}` }}>
        {[100, 150, 200, 80, 50, 50, 50, 40].map((w, j) => (
          <td key={j} style={{ padding: "15px 14px" }}>
            <div
              className="ntf-skel"
              style={{
                width: w,
                maxWidth: "100%",
                background: `linear-gradient(90deg,${surface2} 25%,rgba(128,128,128,0.07) 50%,${surface2} 75%)`,
              }}
            />
          </td>
        ))}
      </tr>
    ))}
  </>
);

// ─── Status pill ──────────────────────────────────────────────────────────────
const StatusPill: React.FC<{
  on: boolean;
  onClick: () => void;
  busy: boolean;
  tk: ReturnType<typeof useNotifTokens>;
}> = ({ on, onClick, busy, tk }) => {
  const base: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    padding: "3px 10px",
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 600,
    cursor: busy ? "not-allowed" : "pointer",
    userSelect: "none",
    transition: "opacity .15s",
    whiteSpace: "nowrap",
  };
  const style: CSSProperties = on
    ? {
        ...base,
        background: tk.successDim,
        border: `1px solid ${tk.successBorder}`,
        color: tk.success,
      }
    : {
        ...base,
        background: tk.isDark
          ? "rgba(255,255,255,0.04)"
          : "rgba(15,23,42,0.05)",
        border: `1px solid ${tk.border}`,
        color: tk.textSecondary,
      };
  return (
    <span
      style={style}
      onClick={() => !busy && onClick()}
      title="Click to toggle"
    >
      {on && (
        <span
          className="ntf-live"
          style={{
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: "currentColor",
            flexShrink: 0,
          }}
        />
      )}
      {on ? "Active" : "Disabled"}
    </span>
  );
};

// ─── Table ────────────────────────────────────────────────────────────────────
const NotificationManagementTable: React.FC = () => {
  const theme = useTheme();
  const tk = useNotifTokens(theme);

  const { data: rows = [], isLoading, isError } = useGetNotificationsQuery();
  const [updateNotification, { isLoading: isUpdating }] =
    useUpdateNotificationMutation();
  const [deleteNotification, { isLoading: isDeleting }] =
    useDeleteNotificationMutation();
  const busy = isUpdating || isDeleting;

  const handleToggle = useCallback(
    (
      row: TransformedNotificationSetting,
      field: "status" | "self" | "manager" | "team",
    ) => {
      const u = { ...row, [field]: !row[field] };
      updateNotification({
        moduleId: u.moduleId,
        module: u.module,
        subModule: u.submodule,
        action: u.action,
        notificationStatus: u.status ? "Enable" : "Disabled",
        self: u.self ? "Yes" : "No",
        manager: u.manager ? "Yes" : "No",
        team: u.team ? "Yes" : "No",
      });
    },
    [updateNotification],
  );

  const handleDelete = useCallback(
    (row: TransformedNotificationSetting) =>
      deleteNotification({ moduleId: row.moduleId }),
    [deleteNotification],
  );

  const wrapStyle: CSSProperties = {
    background: tk.surface,
    border: `1px solid ${tk.border}`,
    borderRadius: tk.radiusXL,
    overflow: "hidden",
    boxShadow: tk.isDark
      ? "0 8px 32px rgba(0,0,0,0.45)"
      : "0 4px 24px rgba(15,23,42,0.08)",
  };
  const thStyle: CSSProperties = {
    padding: "12px 14px",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "1px",
    textTransform: "uppercase",
    color: tk.textSecondary,
    textAlign: "left",
    borderBottom: `1px solid ${tk.border}`,
    whiteSpace: "nowrap",
  };
  const tdStyle: CSSProperties = {
    padding: "14px 14px",
    color: tk.textPrimary,
    verticalAlign: "middle",
  };
  const badgeStyle: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    padding: "3px 10px",
    background: tk.infoDim,
    border: `1px solid ${tk.infoBorder}`,
    color: tk.info,
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 600,
    whiteSpace: "nowrap",
  };
  const delBtnBase: CSSProperties = {
    width: 30,
    height: 30,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: tk.dangerDim,
    border: `1px solid ${tk.dangerBorder}`,
    borderRadius: tk.radius,
    color: tk.danger,
    cursor: "pointer",
    transition: "background .18s, transform .18s",
  };

  return (
    <>
      <style>{ANIM_CSS + buildToggleCss(tk)}</style>
      <div style={wrapStyle}>
        {isError ? (
          <div
            style={{
              padding: 48,
              textAlign: "center",
              color: tk.danger,
              fontSize: 14,
            }}
          >
            Failed to load notification settings. Please try again.
          </div>
        ) : (
          <div
            style={{ overflowX: "auto", maxHeight: "72vh", overflowY: "auto" }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 13.5,
                tableLayout: "fixed",
                minWidth: 780,
              }}
            >
              <colgroup>
                <col style={{ width: 130 }} />
                <col style={{ width: 175 }} />
                <col />
                <col style={{ width: 105 }} />
                <col style={{ width: 80 }} />
                <col style={{ width: 80 }} />
                <col style={{ width: 80 }} />
                <col style={{ width: 64 }} />
              </colgroup>
              <thead style={{ background: tk.surface2 }}>
                <tr>
                  {[
                    "Module",
                    "Sub-module",
                    "Action",
                    "Status",
                    "Self",
                    "Manager",
                    "Team",
                    "Delete",
                  ].map((h, i) => (
                    <th
                      key={h}
                      style={{
                        ...thStyle,
                        ...(i >= 4 ? { textAlign: "center" } : {}),
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <SkeletonRows surface2={tk.surface2} border={tk.border} />
                ) : (
                  rows.map((row, i) => (
                    <tr
                      key={row.moduleId}
                      className="ntf-row"
                      style={{
                        borderBottom: `1px solid ${tk.border}`,
                        animationDelay: `${i * 0.04}s`,
                        transition: "background .13s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = tk.isDark
                          ? "rgba(255,255,255,0.022)"
                          : "rgba(15,23,42,0.025)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      <td style={tdStyle}>
                        <span style={badgeStyle}>
                          <span
                            style={{
                              width: 5,
                              height: 5,
                              borderRadius: "50%",
                              background: "currentColor",
                              flexShrink: 0,
                            }}
                          />
                          {row.module}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <span style={{ fontWeight: 500, fontSize: 13.5 }}>
                          {row.submodule}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <span
                          style={{
                            fontSize: 12.5,
                            color: tk.textSecondary,
                            fontWeight: 300,
                            lineHeight: 1.4,
                          }}
                        >
                          {row.action}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <StatusPill
                          on={row.status}
                          onClick={() => handleToggle(row, "status")}
                          busy={busy}
                          tk={tk}
                        />
                      </td>
                      {(["self", "manager", "team"] as const).map((f) => (
                        <td key={f} style={{ ...tdStyle, textAlign: "center" }}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "center",
                            }}
                          >
                            <Toggle
                              checked={row[f]}
                              onChange={() => handleToggle(row, f)}
                              disabled={busy}
                            />
                          </div>
                        </td>
                      ))}
                      <td style={{ ...tdStyle, textAlign: "center" }}>
                        <button
                          style={delBtnBase}
                          disabled={busy}
                          title="Delete"
                          onClick={() => handleDelete(row)}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLElement).style.background =
                              tk.isDark
                                ? "rgba(219,79,74,0.22)"
                                : "rgba(219,79,74,0.14)";
                            (e.currentTarget as HTMLElement).style.transform =
                              "scale(1.07)";
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.background =
                              tk.dangerDim;
                            (e.currentTarget as HTMLElement).style.transform =
                              "scale(1)";
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
                          >
                            <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default NotificationManagementTable;
