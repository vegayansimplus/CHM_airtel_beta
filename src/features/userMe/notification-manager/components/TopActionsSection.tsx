import React, { type CSSProperties } from "react";
import { useTheme } from "@mui/material/styles";
import { useNotifTokens } from "./notificationTokens";

interface TopActionsSectionProps {
  onAddNewNotification: () => void;
}

const TopActionsSection: React.FC<TopActionsSectionProps> = ({
  onAddNewNotification,
}) => {
  const theme = useTheme();
  const tk = useNotifTokens(theme);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 22,
      }}
    >
      {/* Title */}
      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <span
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: tk.textPrimary,
            letterSpacing: "-0.4px",
          }}
        >
          Notification settings
        </span>
        <span
          style={{ fontSize: 13, fontWeight: 300, color: tk.textSecondary }}
        >
          Manage event-based alerts across modules and roles
        </span>
      </div>

      {/* Add button — uses theme primary (indigo #6366F1) */}
      <button
        onClick={onAddNewNotification}
        style={
          {
            display: "flex",
            alignItems: "center",
            gap: 7,
            padding: "9px 18px",
            background: tk.accentDim,
            border: `1px solid ${tk.accentBorder}`,
            borderRadius: tk.radiusL,
            color: tk.accent,
            fontSize: 13,
            fontWeight: 600,
            fontFamily: "inherit",
            cursor: "pointer",
            whiteSpace: "nowrap",
            transition: "background .18s, transform .16s",
          } as CSSProperties
        }
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.background = tk.isDark
            ? "rgba(99,102,241,0.22)"
            : "rgba(99,102,241,0.15)";
          (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.background = tk.accentDim;
          (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
        }}
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v8M8 12h8" />
        </svg>
        Add notification
      </button>
    </div>
  );
};

export default TopActionsSection;
