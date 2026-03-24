import React, { useState, useEffect, useRef, type CSSProperties } from "react";
import { useTheme } from "@mui/material/styles";
// import { useAddNotificationMutation } from "./notificationApiSlice";
import { useNotifTokens, buildToggleCss } from "./notificationTokens";
import { useAddNotificationMutation } from "../api/notificationApiSlice";

// ─── Keyframes only (no external fonts/libs) ─────────────────────────────────
const BASE_CSS = `
  @keyframes ntfOverlayIn{from{opacity:0}to{opacity:1}}
  @keyframes ntfSlideUp{from{opacity:0;transform:translateY(14px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}
  @keyframes ntfSpin{to{transform:rotate(360deg)}}
  .ntf-overlay-anim{animation:ntfOverlayIn .16s ease}
  .ntf-dialog-anim{animation:ntfSlideUp .22s cubic-bezier(.34,1.56,.64,1)}
  .ntf-spinner{width:15px;height:15px;border:2px solid rgba(0,0,0,0.18);border-top-color:#000;border-radius:50%;animation:ntfSpin .7s linear infinite}
`;

// ─── Channel toggle ───────────────────────────────────────────────────────────
const Channel: React.FC<{
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  tk: ReturnType<typeof useNotifTokens>;
}> = ({ label, checked, onChange, tk }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "10px 14px",
      background: tk.surface2,
      border: `1px solid ${tk.border}`,
      borderRadius: tk.radius,
      transition: "border-color .15s",
    }}
    onMouseEnter={(e) => (e.currentTarget.style.borderColor = tk.borderHover)}
    onMouseLeave={(e) => (e.currentTarget.style.borderColor = tk.border)}
  >
    <span style={{ fontSize: 13, fontWeight: 500, color: tk.textPrimary }}>
      {label}
    </span>
    <label className="ntf-tog">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <div className="ntf-track">
        <div className="ntf-thumb" />
      </div>
    </label>
  </div>
);

// ─── Text field ───────────────────────────────────────────────────────────────
const Field: React.FC<{
  label: string;
  value: string;
  placeholder: string;
  error?: string;
  inputRef?: React.Ref<HTMLInputElement>;
  onChange: (v: string) => void;
  onEnter?: () => void;
  tk: ReturnType<typeof useNotifTokens>;
}> = ({
  label,
  value,
  placeholder,
  error,
  inputRef,
  onChange,
  onEnter,
  tk,
}) => {
  const [focused, setFocused] = useState(false);
  const borderColor = error ? tk.danger : focused ? tk.accent : tk.border;
  const shadow = focused
    ? error
      ? `0 0 0 3px ${tk.dangerDim}`
      : `0 0 0 3px ${tk.accentDim}`
    : "none";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label
        style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.8px",
          textTransform: "uppercase",
          color: tk.textSecondary,
        }}
      >
        {label}
      </label>
      <input
        ref={inputRef}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && onEnter) onEnter();
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={
          {
            width: "100%",
            padding: "9px 12px",
            background: tk.surface2,
            border: `1px solid ${borderColor}`,
            borderRadius: tk.radius,
            color: tk.textPrimary,
            fontSize: 13.5,
            fontFamily: "inherit",
            outline: "none",
            transition: "border-color .18s",
            boxShadow: shadow,
          } as CSSProperties
        }
      />
      {error && (
        <span style={{ fontSize: 11.5, color: tk.danger }}>{error}</span>
      )}
    </div>
  );
};

// ─── Dialog ───────────────────────────────────────────────────────────────────
interface NotificationDialogProps {
  open: boolean;
  onClose: () => void;
}

const NotificationDialog: React.FC<NotificationDialogProps> = ({
  open,
  onClose,
}) => {
  const theme = useTheme();
  const tk = useNotifTokens(theme);

  const [addNotification, { isLoading, isSuccess, isError }] =
    useAddNotificationMutation();
  const [module, setModule] = useState("");
  const [subModule, setSubModule] = useState("");
  const [action, setAction] = useState("");
  const [status, setStatus] = useState(true);
  const [self, setSelf] = useState(false);
  const [manager, setManager] = useState(false);
  const [team, setTeam] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const firstRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setModule("");
    setSubModule("");
    setAction("");
    setStatus(true);
    setSelf(false);
    setManager(false);
    setTeam(false);
    setErrors({});
  };

  useEffect(() => {
    if (isSuccess) {
      reset();
      onClose();
    }
  }, [isSuccess]);
  useEffect(() => {
    if (open) setTimeout(() => firstRef.current?.focus(), 80);
  }, [open]);
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!module.trim()) e.module = "Module is required";
    if (!subModule.trim()) e.subModule = "Sub-module is required";
    if (!action.trim()) e.action = "Action is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    addNotification({
      module,
      subModule,
      action,
      notificationStatus: status ? "Enable" : "Disabled",
      self: self ? "Yes" : "No",
      manager: manager ? "Yes" : "No",
      team: team ? "Yes" : "No",
    });
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!open) return null;

  return (
    <>
      <style>{BASE_CSS + buildToggleCss(tk)}</style>

      {/* Overlay */}
      <div
        className="ntf-overlay-anim"
        onClick={(e) => {
          if (e.target === e.currentTarget) handleClose();
        }}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1300,
          background: "rgba(0,0,0,0.60)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Box */}
        <div
          className="ntf-dialog-anim"
          style={{
            background: tk.surface,
            border: `1px solid ${tk.border}`,
            borderRadius: tk.radiusXL,
            width: "100%",
            maxWidth: 430,
            boxShadow: tk.isDark
              ? "0 28px 64px rgba(0,0,0,0.65)"
              : "0 16px 48px rgba(15,23,42,0.18)",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "18px 22px",
              borderBottom: `1px solid ${tk.border}`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: tk.accentDim,
                  border: `1px solid ${tk.accentBorder}`,
                  borderRadius: tk.radius,
                  color: tk.accent,
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </div>
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: tk.textPrimary,
                  letterSpacing: "-0.2px",
                }}
              >
                Create notification
              </span>
            </div>
            <button
              onClick={handleClose}
              style={{
                width: 30,
                height: 30,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "transparent",
                border: `1px solid ${tk.border}`,
                borderRadius: tk.radius,
                color: tk.textSecondary,
                cursor: "pointer",
                transition: "background .15s, color .15s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = tk.isDark
                  ? "rgba(255,255,255,0.06)"
                  : "rgba(15,23,42,0.06)";
                (e.currentTarget as HTMLElement).style.color = tk.textPrimary;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background =
                  "transparent";
                (e.currentTarget as HTMLElement).style.color = tk.textSecondary;
              }}
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div
            style={{
              padding: "20px 22px",
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            {/* Error banner */}
            {isError && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 13px",
                  background: tk.dangerDim,
                  border: `1px solid ${tk.dangerBorder}`,
                  borderRadius: tk.radius,
                  color: tk.danger,
                  fontSize: 13,
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{ flexShrink: 0 }}
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 8v4M12 16h.01" />
                </svg>
                Failed to save. Please try again.
              </div>
            )}

            <Field
              label="Module"
              value={module}
              placeholder="e.g. Rostering"
              error={errors.module}
              inputRef={firstRef}
              tk={tk}
              onChange={(v) => {
                setModule(v);
                if (errors.module) setErrors((p) => ({ ...p, module: "" }));
              }}
            />

            <Field
              label="Sub-module"
              value={subModule}
              placeholder="e.g. Leave Approved"
              error={errors.subModule}
              tk={tk}
              onChange={(v) => {
                setSubModule(v);
                if (errors.subModule)
                  setErrors((p) => ({ ...p, subModule: "" }));
              }}
            />

            <Field
              label="Action"
              value={action}
              placeholder="e.g. Leave request approved by manager"
              error={errors.action}
              onEnter={handleSave}
              tk={tk}
              onChange={(v) => {
                setAction(v);
                if (errors.action) setErrors((p) => ({ ...p, action: "" }));
              }}
            />

            {/* Divider */}
            <div
              style={{ height: 1, background: tk.border, margin: "2px 0" }}
            />

            {/* Channels */}
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.8px",
                  textTransform: "uppercase",
                  color: tk.textSecondary,
                  marginBottom: 10,
                }}
              >
                Notification channels
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 9,
                }}
              >
                <Channel
                  label="Active"
                  checked={status}
                  onChange={setStatus}
                  tk={tk}
                />
                <Channel
                  label="Self"
                  checked={self}
                  onChange={setSelf}
                  tk={tk}
                />
                <Channel
                  label="Manager"
                  checked={manager}
                  onChange={setManager}
                  tk={tk}
                />
                <Channel
                  label="Team"
                  checked={team}
                  onChange={setTeam}
                  tk={tk}
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: 10,
              padding: "16px 22px",
              borderBottom: `1px solid ${tk.border}`,
              borderTop: `1px solid ${tk.border}`,
            }}
          >
            <button
              onClick={handleClose}
              disabled={isLoading}
              style={{
                padding: "8px 16px",
                background: "transparent",
                border: `1px solid ${tk.border}`,
                borderRadius: tk.radius,
                color: tk.textSecondary,
                fontSize: 13,
                fontWeight: 500,
                fontFamily: "inherit",
                cursor: "pointer",
                transition: "background .15s, color .15s, border-color .15s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = tk.isDark
                  ? "rgba(255,255,255,0.05)"
                  : "rgba(15,23,42,0.05)";
                (e.currentTarget as HTMLElement).style.color = tk.textPrimary;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background =
                  "transparent";
                (e.currentTarget as HTMLElement).style.color = tk.textSecondary;
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading}
              style={{
                padding: "8px 22px",
                background: tk.accent, // #6366F1 (indigo) in both modes
                border: "none",
                borderRadius: tk.radius,
                color: "#ffffff",
                fontSize: 13,
                fontWeight: 700,
                fontFamily: "inherit",
                cursor: isLoading ? "not-allowed" : "pointer",
                opacity: isLoading ? 0.55 : 1,
                display: "flex",
                alignItems: "center",
                gap: 7,
                minWidth: 88,
                justifyContent: "center",
                transition: "opacity .15s, transform .15s",
              }}
              onMouseEnter={(e) => {
                if (!isLoading)
                  (e.currentTarget as HTMLElement).style.opacity = "0.87";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.opacity = isLoading
                  ? "0.55"
                  : "1";
              }}
            >
              {isLoading ? (
                <>
                  <div className="ntf-spinner" />
                  Saving…
                </>
              ) : (
                "Create"
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotificationDialog;
