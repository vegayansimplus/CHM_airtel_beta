import React, { useState, useEffect, useRef, type CSSProperties } from "react";
import { useTheme } from "@mui/material/styles";
import { useNotifTokens, buildToggleCss } from "../style/notificationTokens";
import { useUpdateNotificationMutation } from "../api/notificationApiSlice";

// ─── Animations CSS ───────────────────────────────────────────────────────────
const BASE_CSS = `
  @keyframes ntfOverlayIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes ntfSlideUp {
    from { opacity: 0; transform: translateY(18px) scale(0.96); }
    to   { opacity: 1; transform: translateY(0)   scale(1);    }
  }
  @keyframes ntfSpin { to { transform: rotate(360deg); } }
  @keyframes ntfShake {
    0%, 100% { transform: translateX(0); }
    20%, 60% { transform: translateX(-5px); }
    40%, 80% { transform: translateX(5px); }
  }
  .ntf-overlay-anim { animation: ntfOverlayIn .18s ease; }
  .ntf-dialog-anim  { animation: ntfSlideUp .24s cubic-bezier(.34,1.4,.64,1); }
  .ntf-spinner {
    width: 14px; height: 14px;
    border: 2px solid rgba(255,255,255,0.25);
    border-top-color: #fff;
    border-radius: 50%;
    animation: ntfSpin .65s linear infinite;
    flex-shrink: 0;
  }
  .ntf-shake { animation: ntfShake .35s ease; }
`;

// ─── Field Component ──────────────────────────────────────────────────────────
const Field: React.FC<{
  label: string;
  value: string;
  placeholder: string;
  error?: string;
  hint?: string;
  inputRef?: React.Ref<HTMLInputElement>;
  onChange: (v: string) => void;
  onEnter?: () => void;
  tk: ReturnType<typeof useNotifTokens>;
}> = ({ label, value, placeholder, error, hint, inputRef, onChange, onEnter, tk }) => {
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? tk.danger
    : focused
    ? tk.accent
    : tk.border;
  const ringColor = error ? `${tk.danger}28` : `${tk.accent}22`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      {/* Label row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <label
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.7px",
            textTransform: "uppercase",
            color: error ? tk.danger : tk.textSecondary,
            transition: "color .15s",
          }}
        >
          {label}
        </label>
        {hint && !error && (
          <span style={{ fontSize: 10.5, color: tk.textSecondary, opacity: 0.7 }}>
            {hint}
          </span>
        )}
      </div>

      {/* Input */}
      <div style={{ position: "relative" }}>
        <input
          ref={inputRef}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && onEnter) onEnter(); }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: "100%",
            padding: "9px 12px",
            background: tk.surface2,
            border: `1.5px solid ${borderColor}`,
            borderRadius: tk.radius,
            color: tk.textPrimary,
            fontSize: 13.5,
            fontFamily: "inherit",
            outline: "none",
            transition: "border-color .18s, box-shadow .18s",
            boxShadow: focused ? `0 0 0 3px ${ringColor}` : "none",
            boxSizing: "border-box",
          } as CSSProperties}
        />
      </div>

      {/* Error or hint message */}
      {error && (
        <span
          style={{
            fontSize: 11.5,
            color: tk.danger,
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v4M12 16h.01" />
          </svg>
          {error}
        </span>
      )}
    </div>
  );
};

// ─── Channel Toggle Card ──────────────────────────────────────────────────────
const ChannelCard: React.FC<{
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  tk: ReturnType<typeof useNotifTokens>;
}> = ({ label, description, checked, onChange, tk }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 13px",
        background: checked
          ? tk.isDark ? "rgba(16,185,129,0.07)" : "rgba(16,185,129,0.05)"
          : tk.surface2,
        border: `1.5px solid ${
          checked
            ? tk.successBorder
            : hovered
            ? tk.borderHover
            : tk.border
        }`,
        borderRadius: tk.radius,
        cursor: "pointer",
        transition: "all .17s ease",
        userSelect: "none",
      }}
      onClick={() => onChange(!checked)}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <span style={{ fontSize: 12.5, fontWeight: 600, color: tk.textPrimary }}>
          {label}
        </span>
        <span style={{ fontSize: 11, color: tk.textSecondary }}>
          {description}
        </span>
      </div>
      <label className="ntf-tog" style={{ pointerEvents: "none" }}>
        <input type="checkbox" checked={checked} onChange={() => {}} />
        <div className="ntf-track">
          <div className="ntf-thumb" />
        </div>
      </label>
    </div>
  );
};

// ─── Progress Steps ───────────────────────────────────────────────────────────
const StepIndicator: React.FC<{
  step: number;
  total: number;
  tk: ReturnType<typeof useNotifTokens>;
}> = ({ step, total, tk }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
    {Array.from({ length: total }).map((_, i) => (
      <div
        key={i}
        style={{
          height: 3,
          width: i === step ? 20 : 8,
          borderRadius: 2,
          background: i <= step ? tk.accent : tk.border,
          transition: "all .25s ease",
        }}
      />
    ))}
  </div>
);

// ─── Main Dialog ──────────────────────────────────────────────────────────────
interface NotificationDialogProps {
  open: boolean;
  onClose: () => void;
}

const NotificationDialog: React.FC<NotificationDialogProps> = ({ open, onClose }) => {
  const theme = useTheme();
  const tk = useNotifTokens(theme);

  const [addNotification, { isLoading, isSuccess, isError, reset: resetMutation }] =
    useUpdateNotificationMutation();

  // Form state
  const [module, setModule]     = useState("");
  const [subModule, setSubModule] = useState("");
  const [action, setAction]     = useState("");
  const [status, setStatus]     = useState(true);
  const [self, setSelf]         = useState(false);
  const [manager, setManager]   = useState(false);
  const [team, setTeam]         = useState(false);
  const [errors, setErrors]     = useState<Record<string, string>>({});
  const [shakeForm, setShakeForm] = useState(false);

  const firstRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setModule(""); setSubModule(""); setAction("");
    setStatus(true); setSelf(false); setManager(false); setTeam(false);
    setErrors({});
    resetMutation?.();
  };

  useEffect(() => {
    if (isSuccess) { reset(); onClose(); }
  }, [isSuccess]);

  useEffect(() => {
    if (open) {
      reset();
      setTimeout(() => firstRef.current?.focus(), 90);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!module.trim())    e.module    = "Module name is required";
    if (!subModule.trim()) e.subModule = "Sub-module is required";
    if (!action.trim())    e.action    = "Action code is required";
    setErrors(e);
    if (Object.keys(e).length > 0) {
      // Shake the form to signal errors
      setShakeForm(true);
      setTimeout(() => setShakeForm(false), 400);
    }
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    addNotification({
      module, subModule, action,
      notificationStatus: status ? "Enable" : "Disabled",
      self: self ? "Yes" : "No",
      manager: manager ? "Yes" : "No",
      team: team ? "Yes" : "No",
    });
  };

  const handleClose = () => { reset(); onClose(); };

  // How many of 3 fields are filled — for step indicator
  const filledFields = [module, subModule, action].filter(Boolean).length;

  if (!open) return null;

  return (
    <>
      <style>{BASE_CSS + buildToggleCss(tk)}</style>

      {/* ── Overlay ── */}
      <div
        className="ntf-overlay-anim"
        onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1300,
          background: tk.isDark ? "rgba(0,0,0,0.72)" : "rgba(15,23,42,0.55)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 16,
          backdropFilter: "blur(2px)",
        }}
      >
        {/* ── Dialog box ── */}
        <div
          className={`ntf-dialog-anim${shakeForm ? " ntf-shake" : ""}`}
          style={{
            background: tk.surface,
            border: `1px solid ${tk.border}`,
            borderRadius: tk.radiusXL,
            width: "100%",
            maxWidth: 440,
            boxShadow: tk.isDark
              ? "0 32px 72px rgba(0,0,0,0.72)"
              : "0 20px 56px rgba(15,23,42,0.20)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* ── Header ── */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "18px 22px 16px",
              borderBottom: `1px solid ${tk.border}`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
              {/* Icon badge */}
              <div
                style={{
                  width: 36,
                  height: 36,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: tk.accentDim,
                  border: `1px solid ${tk.accentBorder}`,
                  borderRadius: tk.radius,
                  color: tk.accent,
                  flexShrink: 0,
                }}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </div>

              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: tk.textPrimary, letterSpacing: "-0.2px" }}>
                  Create notification
                </div>
                <div style={{ fontSize: 11.5, color: tk.textSecondary, marginTop: 1 }}>
                  Configure event-based alerts
                </div>
              </div>
            </div>

            {/* Close button */}
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
                transition: "all .14s ease",
                padding: 0,
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.background = tk.isDark ? "rgba(255,255,255,0.07)" : "rgba(15,23,42,0.07)";
                el.style.color = tk.textPrimary;
                el.style.borderColor = tk.borderHover;
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.background = "transparent";
                el.style.color = tk.textSecondary;
                el.style.borderColor = tk.border;
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* ── Progress indicator ── */}
          <div
            style={{
              padding: "10px 22px 0",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span style={{ fontSize: 11, color: tk.textSecondary }}>
              {filledFields === 0
                ? "Fill in the details below"
                : filledFields < 3
                ? `${3 - filledFields} field${3 - filledFields > 1 ? "s" : ""} remaining`
                : "Ready to create"}
            </span>
            <StepIndicator step={filledFields - 1} total={3} tk={tk} />
          </div>

          {/* ── Body ── */}
          <div
            style={{
              padding: "14px 22px 20px",
              display: "flex",
              flexDirection: "column",
              gap: 13,
              overflowY: "auto",
            }}
          >
            {/* Error banner */}
            {isError && (
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 9,
                  padding: "10px 13px",
                  background: tk.dangerDim,
                  border: `1px solid ${tk.dangerBorder}`,
                  borderRadius: tk.radius,
                  color: tk.danger,
                  fontSize: 12.5,
                  lineHeight: 1.5,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}>
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 8v4M12 16h.01" />
                </svg>
                <div>
                  <strong style={{ fontWeight: 700 }}>Save failed.</strong>{" "}
                  Please check your inputs and try again.
                </div>
              </div>
            )}

            {/* Fields */}
            <Field
              label="Module"
              value={module}
              placeholder="e.g. Rostering"
              error={errors.module}
              hint="e.g. HR, Finance"
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
              hint="Specific event area"
              tk={tk}
              onChange={(v) => {
                setSubModule(v);
                if (errors.subModule) setErrors((p) => ({ ...p, subModule: "" }));
              }}
            />

            <Field
              label="Action"
              value={action}
              placeholder="e.g. Leave request approved by manager"
              error={errors.action}
              hint="Press Enter to save"
              onEnter={handleSave}
              tk={tk}
              onChange={(v) => {
                setAction(v);
                if (errors.action) setErrors((p) => ({ ...p, action: "" }));
              }}
            />

            {/* Divider with label */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "2px 0" }}>
              <div style={{ flex: 1, height: 1, background: tk.border }} />
              <span
                style={{
                  fontSize: 10.5,
                  fontWeight: 700,
                  letterSpacing: "0.7px",
                  textTransform: "uppercase",
                  color: tk.textSecondary,
                  whiteSpace: "nowrap",
                }}
              >
                Notify Recipients
              </span>
              <div style={{ flex: 1, height: 1, background: tk.border }} />
            </div>

            {/* Channel Cards — 2x2 grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8,
              }}
            >
              <ChannelCard
                label="Active"
                description="Enable this rule"
                checked={status}
                onChange={setStatus}
                tk={tk}
              />
              <ChannelCard
                label="Self"
                description="Notify originator"
                checked={self}
                onChange={setSelf}
                tk={tk}
              />
              <ChannelCard
                label="Manager"
                description="Notify line manager"
                checked={manager}
                onChange={setManager}
                tk={tk}
              />
              <ChannelCard
                label="Team"
                description="Notify all team members"
                checked={team}
                onChange={setTeam}
                tk={tk}
              />
            </div>
          </div>

          {/* ── Footer ── */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
              padding: "14px 22px",
              borderTop: `1px solid ${tk.border}`,
              background: tk.isDark
                ? "rgba(255,255,255,0.012)"
                : "rgba(15,23,42,0.018)",
            }}
          >
            {/* Channels summary */}
            <span style={{ fontSize: 11.5, color: tk.textSecondary }}>
              {[status && "Active", self && "Self", manager && "Manager", team && "Team"]
                .filter(Boolean)
                .join(", ") || "No recipients selected"}
            </span>

            <div style={{ display: "flex", gap: 9 }}>
              {/* Cancel */}
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
                  transition: "all .14s ease",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.background = tk.isDark ? "rgba(255,255,255,0.05)" : "rgba(15,23,42,0.05)";
                  el.style.color = tk.textPrimary;
                  el.style.borderColor = tk.borderHover;
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.background = "transparent";
                  el.style.color = tk.textSecondary;
                  el.style.borderColor = tk.border;
                }}
              >
                Cancel
              </button>

              {/* Save */}
              <button
                onClick={handleSave}
                disabled={isLoading}
                style={{
                  padding: "8px 22px",
                  background: tk.accent,
                  border: "none",
                  borderRadius: tk.radius,
                  color: "#ffffff",
                  fontSize: 13,
                  fontWeight: 700,
                  fontFamily: "inherit",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  opacity: isLoading ? 0.6 : 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  minWidth: 90,
                  justifyContent: "center",
                  transition: "opacity .15s, transform .15s",
                  boxShadow: `0 2px 8px ${tk.accentBorder}`,
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    (e.currentTarget as HTMLElement).style.opacity = "0.88";
                    (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
                  }
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.opacity = isLoading ? "0.6" : "1";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                }}
                onMouseDown={(e) => {
                  if (!isLoading)
                    (e.currentTarget as HTMLElement).style.transform = "scale(0.97)";
                }}
                onMouseUp={(e) => {
                  if (!isLoading)
                    (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
                }}
              >
                {isLoading ? (
                  <>
                    <div className="ntf-spinner" />
                    Saving…
                  </>
                ) : (
                  <>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                    Create
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotificationDialog;


// import React, { useState, useEffect, useRef, type CSSProperties } from "react";
// import { useTheme } from "@mui/material/styles";
// import { useNotifTokens, buildToggleCss } from "../style/notificationTokens";
// import { useUpdateNotificationMutation } from "../api/notificationApiSlice";

// // ─── Keyframes only (no external fonts/libs) ─────────────────────────────────
// const BASE_CSS = `
//   @keyframes ntfOverlayIn{from{opacity:0}to{opacity:1}}
//   @keyframes ntfSlideUp{from{opacity:0;transform:translateY(14px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}
//   @keyframes ntfSpin{to{transform:rotate(360deg)}}
//   .ntf-overlay-anim{animation:ntfOverlayIn .16s ease}
//   .ntf-dialog-anim{animation:ntfSlideUp .22s cubic-bezier(.34,1.56,.64,1)}
//   .ntf-spinner{width:15px;height:15px;border:2px solid rgba(0,0,0,0.18);border-top-color:#000;border-radius:50%;animation:ntfSpin .7s linear infinite}
// `;

// // ─── Channel toggle ───────────────────────────────────────────────────────────
// const Channel: React.FC<{
//   label: string;
//   checked: boolean;
//   onChange: (v: boolean) => void;
//   tk: ReturnType<typeof useNotifTokens>;
// }> = ({ label, checked, onChange, tk }) => (
//   <div
//     style={{
//       display: "flex",
//       alignItems: "center",
//       justifyContent: "space-between",
//       padding: "10px 14px",
//       background: tk.surface2,
//       border: `1px solid ${tk.border}`,
//       borderRadius: tk.radius,
//       transition: "border-color .15s",
//     }}
//     onMouseEnter={(e) => (e.currentTarget.style.borderColor = tk.borderHover)}
//     onMouseLeave={(e) => (e.currentTarget.style.borderColor = tk.border)}
//   >
//     <span style={{ fontSize: 13, fontWeight: 500, color: tk.textPrimary }}>
//       {label}
//     </span>
//     <label className="ntf-tog">
//       <input
//         type="checkbox"
//         checked={checked}
//         onChange={(e) => onChange(e.target.checked)}
//       />
//       <div className="ntf-track">
//         <div className="ntf-thumb" />
//       </div>
//     </label>
//   </div>
// );

// // ─── Text field ───────────────────────────────────────────────────────────────
// const Field: React.FC<{
//   label: string;
//   value: string;
//   placeholder: string;
//   error?: string;
//   inputRef?: React.Ref<HTMLInputElement>;
//   onChange: (v: string) => void;
//   onEnter?: () => void;
//   tk: ReturnType<typeof useNotifTokens>;
// }> = ({
//   label,
//   value,
//   placeholder,
//   error,
//   inputRef,
//   onChange,
//   onEnter,
//   tk,
// }) => {
//   const [focused, setFocused] = useState(false);
//   const borderColor = error ? tk.danger : focused ? tk.accent : tk.border;
//   const shadow = focused
//     ? error
//       ? `0 0 0 3px ${tk.dangerDim}`
//       : `0 0 0 3px ${tk.accentDim}`
//     : "none";

//   return (
//     <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
//       <label
//         style={{
//           fontSize: 11,
//           fontWeight: 600,
//           letterSpacing: "0.8px",
//           textTransform: "uppercase",
//           color: tk.textSecondary,
//         }}
//       >
//         {label}
//       </label>
//       <input
//         ref={inputRef}
//         value={value}
//         placeholder={placeholder}
//         onChange={(e) => onChange(e.target.value)}
//         onKeyDown={(e) => {
//           if (e.key === "Enter" && onEnter) onEnter();
//         }}
//         onFocus={() => setFocused(true)}
//         onBlur={() => setFocused(false)}
//         style={
//           {
//             width: "100%",
//             padding: "9px 12px",
//             background: tk.surface2,
//             border: `1px solid ${borderColor}`,
//             borderRadius: tk.radius,
//             color: tk.textPrimary,
//             fontSize: 13.5,
//             fontFamily: "inherit",
//             outline: "none",
//             transition: "border-color .18s",
//             boxShadow: shadow,
//           } as CSSProperties
//         }
//       />
//       {error && (
//         <span style={{ fontSize: 11.5, color: tk.danger }}>{error}</span>
//       )}
//     </div>
//   );
// };

// // ─── Dialog ───────────────────────────────────────────────────────────────────
// interface NotificationDialogProps {
//   open: boolean;
//   onClose: () => void;
// }

// const NotificationDialog: React.FC<NotificationDialogProps> = ({
//   open,
//   onClose,
// }) => {
//   const theme = useTheme();
//   const tk = useNotifTokens(theme);

//   const [addNotification, { isLoading, isSuccess, isError }] =
//     useUpdateNotificationMutation();
//   const [module, setModule] = useState("");
//   const [subModule, setSubModule] = useState("");
//   const [action, setAction] = useState("");
//   const [status, setStatus] = useState(true);
//   const [self, setSelf] = useState(false);
//   const [manager, setManager] = useState(false);
//   const [team, setTeam] = useState(false);
//   const [errors, setErrors] = useState<Record<string, string>>({});
//   const firstRef = useRef<HTMLInputElement>(null);

//   const reset = () => {
//     setModule("");
//     setSubModule("");
//     setAction("");
//     setStatus(true);
//     setSelf(false);
//     setManager(false);
//     setTeam(false);
//     setErrors({});
//   };

//   useEffect(() => {
//     if (isSuccess) {
//       reset();
//       onClose();
//     }
//   }, [isSuccess]);
//   useEffect(() => {
//     if (open) setTimeout(() => firstRef.current?.focus(), 80);
//   }, [open]);
//   useEffect(() => {
//     if (!open) return;
//     const h = (e: KeyboardEvent) => {
//       if (e.key === "Escape") handleClose();
//     };
//     window.addEventListener("keydown", h);
//     return () => window.removeEventListener("keydown", h);
//   }, [open]);

//   const validate = () => {
//     const e: Record<string, string> = {};
//     if (!module.trim()) e.module = "Module is required";
//     if (!subModule.trim()) e.subModule = "Sub-module is required";
//     if (!action.trim()) e.action = "Action is required";
//     setErrors(e);
//     return Object.keys(e).length === 0;
//   };

//   const handleSave = () => {
//     if (!validate()) return;
//     addNotification({
//       module,
//       subModule,
//       action,
//       notificationStatus: status ? "Enable" : "Disabled",
//       self: self ? "Yes" : "No",
//       manager: manager ? "Yes" : "No",
//       team: team ? "Yes" : "No",
//     });
//   };

//   const handleClose = () => {
//     reset();
//     onClose();
//   };

//   if (!open) return null;

//   return (
//     <>
//       <style>{BASE_CSS + buildToggleCss(tk)}</style>

//       {/* Overlay */}
//       <div
//         className="ntf-overlay-anim"
//         onClick={(e) => {
//           if (e.target === e.currentTarget) handleClose();
//         }}
//         style={{
//           position: "fixed",
//           inset: 0,
//           zIndex: 1300,
//           background: "rgba(0,0,0,0.60)",
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//         }}
//       >
//         {/* Box */}
//         <div
//           className="ntf-dialog-anim"
//           style={{
//             background: tk.surface,
//             border: `1px solid ${tk.border}`,
//             borderRadius: tk.radiusXL,
//             width: "100%",
//             maxWidth: 430,
//             boxShadow: tk.isDark
//               ? "0 28px 64px rgba(0,0,0,0.65)"
//               : "0 16px 48px rgba(15,23,42,0.18)",
//             overflow: "hidden",
//           }}
//         >
//           {/* Header */}
//           <div
//             style={{
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "space-between",
//               padding: "18px 22px",
//               borderBottom: `1px solid ${tk.border}`,
//             }}
//           >
//             <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
//               <div
//                 style={{
//                   width: 34,
//                   height: 34,
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "center",
//                   background: tk.accentDim,
//                   border: `1px solid ${tk.accentBorder}`,
//                   borderRadius: tk.radius,
//                   color: tk.accent,
//                 }}
//               >
//                 <svg
//                   width="16"
//                   height="16"
//                   viewBox="0 0 24 24"
//                   fill="none"
//                   stroke="currentColor"
//                   strokeWidth="2.5"
//                   strokeLinecap="round"
//                 >
//                   <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
//                 </svg>
//               </div>
//               <span
//                 style={{
//                   fontSize: 15,
//                   fontWeight: 700,
//                   color: tk.textPrimary,
//                   letterSpacing: "-0.2px",
//                 }}
//               >
//                 Create notification
//               </span>
//             </div>
//             <button
//               onClick={handleClose}
//               style={{
//                 width: 30,
//                 height: 30,
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 background: "transparent",
//                 border: `1px solid ${tk.border}`,
//                 borderRadius: tk.radius,
//                 color: tk.textSecondary,
//                 cursor: "pointer",
//                 transition: "background .15s, color .15s",
//               }}
//               onMouseEnter={(e) => {
//                 (e.currentTarget as HTMLElement).style.background = tk.isDark
//                   ? "rgba(255,255,255,0.06)"
//                   : "rgba(15,23,42,0.06)";
//                 (e.currentTarget as HTMLElement).style.color = tk.textPrimary;
//               }}
//               onMouseLeave={(e) => {
//                 (e.currentTarget as HTMLElement).style.background =
//                   "transparent";
//                 (e.currentTarget as HTMLElement).style.color = tk.textSecondary;
//               }}
//             >
//               <svg
//                 width="13"
//                 height="13"
//                 viewBox="0 0 24 24"
//                 fill="none"
//                 stroke="currentColor"
//                 strokeWidth="2"
//                 strokeLinecap="round"
//               >
//                 <path d="M18 6L6 18M6 6l12 12" />
//               </svg>
//             </button>
//           </div>

//           {/* Body */}
//           <div
//             style={{
//               padding: "20px 22px",
//               display: "flex",
//               flexDirection: "column",
//               gap: 14,
//             }}
//           >
//             {/* Error banner */}
//             {isError && (
//               <div
//                 style={{
//                   display: "flex",
//                   alignItems: "center",
//                   gap: 8,
//                   padding: "10px 13px",
//                   background: tk.dangerDim,
//                   border: `1px solid ${tk.dangerBorder}`,
//                   borderRadius: tk.radius,
//                   color: tk.danger,
//                   fontSize: 13,
//                 }}
//               >
//                 <svg
//                   width="14"
//                   height="14"
//                   viewBox="0 0 24 24"
//                   fill="none"
//                   stroke="currentColor"
//                   strokeWidth="2"
//                   style={{ flexShrink: 0 }}
//                 >
//                   <circle cx="12" cy="12" r="9" />
//                   <path d="M12 8v4M12 16h.01" />
//                 </svg>
//                 Failed to save. Please try again.
//               </div>
//             )}

//             <Field
//               label="Module"
//               value={module}
//               placeholder="e.g. Rostering"
//               error={errors.module}
//               inputRef={firstRef}
//               tk={tk}
//               onChange={(v) => {
//                 setModule(v);
//                 if (errors.module) setErrors((p) => ({ ...p, module: "" }));
//               }}
//             />

//             <Field
//               label="Sub-module"
//               value={subModule}
//               placeholder="e.g. Leave Approved"
//               error={errors.subModule}
//               tk={tk}
//               onChange={(v) => {
//                 setSubModule(v);
//                 if (errors.subModule)
//                   setErrors((p) => ({ ...p, subModule: "" }));
//               }}
//             />

//             <Field
//               label="Action"
//               value={action}
//               placeholder="e.g. Leave request approved by manager"
//               error={errors.action}
//               onEnter={handleSave}
//               tk={tk}
//               onChange={(v) => {
//                 setAction(v);
//                 if (errors.action) setErrors((p) => ({ ...p, action: "" }));
//               }}
//             />

//             {/* Divider */}
//             <div
//               style={{ height: 1, background: tk.border, margin: "2px 0" }}
//             />

//             {/* Channels */}
//             <div>
//               <div
//                 style={{
//                   fontSize: 11,
//                   fontWeight: 600,
//                   letterSpacing: "0.8px",
//                   textTransform: "uppercase",
//                   color: tk.textSecondary,
//                   marginBottom: 10,
//                 }}
//               >
//                 Notification channels
//               </div>
//               <div
//                 style={{
//                   display: "grid",
//                   gridTemplateColumns: "1fr 1fr",
//                   gap: 9,
//                 }}
//               >
//                 <Channel
//                   label="Active"
//                   checked={status}
//                   onChange={setStatus}
//                   tk={tk}
//                 />
//                 <Channel
//                   label="Self"
//                   checked={self}
//                   onChange={setSelf}
//                   tk={tk}
//                 />
//                 <Channel
//                   label="Manager"
//                   checked={manager}
//                   onChange={setManager}
//                   tk={tk}
//                 />
//                 <Channel
//                   label="Team"
//                   checked={team}
//                   onChange={setTeam}
//                   tk={tk}
//                 />
//               </div>
//             </div>
//           </div>

//           {/* Footer */}
//           <div
//             style={{
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "flex-end",
//               gap: 10,
//               padding: "16px 22px",
//               borderBottom: `1px solid ${tk.border}`,
//               borderTop: `1px solid ${tk.border}`,
//             }}
//           >
//             <button
//               onClick={handleClose}
//               disabled={isLoading}
//               style={{
//                 padding: "8px 16px",
//                 background: "transparent",
//                 border: `1px solid ${tk.border}`,
//                 borderRadius: tk.radius,
//                 color: tk.textSecondary,
//                 fontSize: 13,
//                 fontWeight: 500,
//                 fontFamily: "inherit",
//                 cursor: "pointer",
//                 transition: "background .15s, color .15s, border-color .15s",
//               }}
//               onMouseEnter={(e) => {
//                 (e.currentTarget as HTMLElement).style.background = tk.isDark
//                   ? "rgba(255,255,255,0.05)"
//                   : "rgba(15,23,42,0.05)";
//                 (e.currentTarget as HTMLElement).style.color = tk.textPrimary;
//               }}
//               onMouseLeave={(e) => {
//                 (e.currentTarget as HTMLElement).style.background =
//                   "transparent";
//                 (e.currentTarget as HTMLElement).style.color = tk.textSecondary;
//               }}
//             >
//               Cancel
//             </button>
//             <button
//               onClick={handleSave}
//               disabled={isLoading}
//               style={{
//                 padding: "8px 22px",
//                 background: tk.accent, // #6366F1 (indigo) in both modes
//                 border: "none",
//                 borderRadius: tk.radius,
//                 color: "#ffffff",
//                 fontSize: 13,
//                 fontWeight: 700,
//                 fontFamily: "inherit",
//                 cursor: isLoading ? "not-allowed" : "pointer",
//                 opacity: isLoading ? 0.55 : 1,
//                 display: "flex",
//                 alignItems: "center",
//                 gap: 7,
//                 minWidth: 88,
//                 justifyContent: "center",
//                 transition: "opacity .15s, transform .15s",
//               }}
//               onMouseEnter={(e) => {
//                 if (!isLoading)
//                   (e.currentTarget as HTMLElement).style.opacity = "0.87";
//               }}
//               onMouseLeave={(e) => {
//                 (e.currentTarget as HTMLElement).style.opacity = isLoading
//                   ? "0.55"
//                   : "1";
//               }}
//             >
//               {isLoading ? (
//                 <>
//                   <div className="ntf-spinner" />
//                   Saving…
//                 </>
//               ) : (
//                 "Create"
//               )}
//             </button>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default NotificationDialog;
