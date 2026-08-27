import React, { useState, useEffect, useRef, useCallback, type CSSProperties } from "react";
import { useTheme } from "@mui/material/styles";
import { useNotifTokens, buildToggleCss } from "../style/notificationTokens";
<<<<<<< Updated upstream
import { useCreateNotificationMutation } from "../api/notificationApiSlice";
=======
import { NOTIFY_ROLES } from "../constants/notifyRoles";
import {
  useCreateNotificationMutation,
  useUpdateNotificationFieldMutation,
  type ApiNotificationSetting,
} from "../api/notificationApiSlice";
>>>>>>> Stashed changes

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

/** Pulls the backend's real proc-level message out of a rejected RTK Query mutation. */
const extractErrorMessage = (err: unknown): string | null => {
  if (err && typeof err === "object" && "data" in err) {
    const data = (err as { data?: unknown }).data;
    if (data && typeof data === "object" && "message" in data) {
      const message = (data as { message?: unknown }).message;
      if (typeof message === "string") return message;
    }
  }
  return null;
};

// ─── Field Component ──────────────────────────────────────────────────────────
const Field: React.FC<{
  label: string;
  value: string;
  placeholder: string;
  error?: string;
  hint?: string;
  disabled?: boolean;
  inputRef?: React.Ref<HTMLInputElement>;
  onChange: (v: string) => void;
  onEnter?: () => void;
  tk: ReturnType<typeof useNotifTokens>;
}> = ({ label, value, placeholder, error, hint, disabled, inputRef, onChange, onEnter, tk }) => {
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
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && onEnter) onEnter(); }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: "100%",
            padding: "9px 12px",
            background: disabled ? tk.trackOff : tk.surface2,
            border: `1.5px solid ${borderColor}`,
            borderRadius: tk.radius,
            color: disabled ? tk.textSecondary : tk.textPrimary,
            fontSize: 13.5,
            fontFamily: "inherit",
            outline: "none",
            cursor: disabled ? "not-allowed" : "text",
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
  /** "edit" prefills and locks the identity fields (module/sub-module/action are
   * the table's unique key — the generic update proc can only patch boolean
   * columns, so renaming a rule after creation isn't supported). */
  mode?: "create" | "edit";
  initialRule?: ApiNotificationSetting | null;
}

const EMPTY_ROLE_STATE: Record<string, boolean> = Object.fromEntries(
  NOTIFY_ROLES.map((r) => [r.field, false]),
);

const NotificationDialog: React.FC<NotificationDialogProps> = ({
  open,
  onClose,
  mode = "create",
  initialRule = null,
}) => {
  const theme = useTheme();
  const tk = useNotifTokens(theme);
  const isEdit = mode === "edit" && !!initialRule;

<<<<<<< Updated upstream
  const [addNotification, { isLoading, isError, reset: resetMutation }] =
    useCreateNotificationMutation();
=======
  const [createNotification, { isLoading: isCreating, error: createError, reset: resetCreate }] =
    useCreateNotificationMutation();
  const [updateField] = useUpdateNotificationFieldMutation();
>>>>>>> Stashed changes

  // Form state
  const [module, setModule]     = useState("");
  const [subModule, setSubModule] = useState("");
  const [action, setAction]     = useState("");
  const [active, setActive]     = useState(true);
  const [roles, setRoles]       = useState<Record<string, boolean>>(EMPTY_ROLE_STATE);
  const [errors, setErrors]     = useState<Record<string, string>>({});
  const [shakeForm, setShakeForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const firstRef = useRef<HTMLInputElement>(null);

  const reset = useCallback(() => {
    setModule(""); setSubModule(""); setAction("");
    setActive(true); setRoles(EMPTY_ROLE_STATE);
    setErrors({}); setEditError(null);
    resetCreate?.();
  }, [resetCreate]);

  // Every close path resets the form, so reopening always starts fresh.
  const handleClose = useCallback(() => { reset(); onClose(); }, [reset, onClose]);

  // Prefill from the rule being edited (or blank out for create) whenever the
  // dialog opens or the target rule changes.
  useEffect(() => {
    if (!open) return;
    if (isEdit && initialRule) {
      setModule(initialRule.moduleCode);
      setSubModule(initialRule.subModuleCode);
      setAction(initialRule.actionCode);
      setActive(initialRule.isActive);
      setRoles(
        Object.fromEntries(NOTIFY_ROLES.map((r) => [r.field, Boolean(initialRule[r.field])])),
      );
    } else {
      setModule(""); setSubModule(""); setAction("");
      setActive(true); setRoles(EMPTY_ROLE_STATE);
    }
    setErrors({}); setEditError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isEdit, initialRule?.configId]);

  useEffect(() => {
    if (open && !isEdit) setTimeout(() => firstRef.current?.focus(), 90);
  }, [open, isEdit]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, handleClose]);

  const validate = () => {
    if (isEdit) return true; // identity fields are read-only/prefilled in edit mode
    const e: Record<string, string> = {};
    if (!module.trim())    e.module    = "Module name is required";
    if (!subModule.trim()) e.subModule = "Sub-module is required";
    if (!action.trim())    e.action    = "Action code is required";
    setErrors(e);
    if (Object.keys(e).length > 0) {
      setShakeForm(true);
      setTimeout(() => setShakeForm(false), 400);
    }
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    if (isEdit && initialRule) {
      setEditError(null);
      setIsSaving(true);
      try {
        const changes: Array<{ column: string; value: boolean }> = [];
        NOTIFY_ROLES.forEach((r) => {
          if (roles[r.field] !== Boolean(initialRule[r.field])) {
            changes.push({ column: r.column, value: roles[r.field] });
          }
        });
        if (active !== initialRule.isActive) {
          changes.push({ column: "is_active", value: active });
        }
        await Promise.all(
          changes.map((c) =>
            updateField({ configId: initialRule.configId, column: c.column, value: c.value }).unwrap(),
          ),
        );
        handleClose();
      } catch (err) {
        setEditError(extractErrorMessage(err) ?? "Save failed. Please try again.");
      } finally {
        setIsSaving(false);
      }
      return;
    }

    try {
<<<<<<< Updated upstream
      // The dialog's Self/Manager channels have no API counterpart yet;
      // only Team and the master Active switch map to real columns.
      await addNotification({
        moduleCode: module.trim(),
        subModuleCode: subModule.trim(),
        actionCode: action.trim(),
        notifyDomainHead: false,
        notifyFunctionHead: false,
        notifySubDomainHead: false,
        notifySuperAdmin: false,
        notifyTeamMember: team,
        notifyVerticalHead: false,
        isActive: status,
=======
      await createNotification({
        moduleCode: module.trim(),
        subModuleCode: subModule.trim(),
        actionCode: action.trim(),
        notifySuperAdmin: roles.notifySuperAdmin,
        notifyVerticalHead: roles.notifyVerticalHead,
        notifyFunctionHead: roles.notifyFunctionHead,
        notifyDomainHead: roles.notifyDomainHead,
        notifySubDomainHead: roles.notifySubDomainHead,
        notifyTeamMember: roles.notifyTeamMember,
>>>>>>> Stashed changes
      }).unwrap();
      reset();
      onClose();
    } catch {
      // isError/createError from the mutation hook drives the banner below.
    }
  };

  const isLoading = isEdit ? isSaving : isCreating;
  const bannerMessage = isEdit ? editError : extractErrorMessage(createError) ?? (createError ? "Save failed. Please check your inputs and try again." : null);

  // How many of 3 identity fields are filled — for the create-mode step indicator
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
            maxWidth: 480,
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
                  {isEdit ? "Edit notification rule" : "Create notification"}
                </div>
                <div style={{ fontSize: 11.5, color: tk.textSecondary, marginTop: 1 }}>
                  {isEdit ? "Update recipients and status" : "Configure event-based alerts"}
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

          {/* ── Progress indicator (create mode only) ── */}
          {!isEdit && (
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
          )}

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
            {bannerMessage && (
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
                <div>{bannerMessage}</div>
              </div>
            )}

            {/* Identity fields */}
            <Field
              label="Module"
              value={module}
              placeholder="e.g. Rostering"
              error={errors.module}
              hint={isEdit ? "Locked after creation" : "e.g. HR, Finance"}
              disabled={isEdit}
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
              hint={isEdit ? undefined : "Specific event area"}
              disabled={isEdit}
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
              hint={isEdit ? undefined : "Press Enter to save"}
              disabled={isEdit}
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

            {/* Channel Cards — 2x2 grid, real DB-backed roles + Active status */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8,
              }}
            >
              <ChannelCard
                label="Active"
                description="Rule sends alerts"
                checked={active}
                onChange={setActive}
                tk={tk}
              />
              {NOTIFY_ROLES.map((role) => (
                <ChannelCard
                  key={role.field}
                  label={role.label}
                  description={`Notify ${role.label.toLowerCase()}`}
                  checked={roles[role.field]}
                  onChange={(v) => setRoles((p) => ({ ...p, [role.field]: v }))}
                  tk={tk}
                />
              ))}
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
            {/* Recipients summary */}
            <span style={{ fontSize: 11.5, color: tk.textSecondary }}>
              {[active && "Active", ...NOTIFY_ROLES.filter((r) => roles[r.field]).map((r) => r.label)]
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
                    {isEdit ? "Save" : "Create"}
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
