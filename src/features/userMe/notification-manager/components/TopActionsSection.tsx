import React, { type CSSProperties } from "react";
import { useTheme } from "@mui/material/styles";
import { useNotifTokens } from "../style/notificationTokens";

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
        alignItems: "flex-start",
        justifyContent: "space-between",
        marginBottom: 24,
        gap: 16,
      }}
    >
      {/* ── Left: Title + subtitle ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {/* Eyebrow label */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 2,
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 20,
              height: 20,
              borderRadius: 6,
              background: tk.accentDim,
              border: `1px solid ${tk.accentBorder}`,
            }}
          >
            {/* Bell icon */}
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke={tk.accent}
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </span>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.8px",
              textTransform: "uppercase",
              color: tk.accent,
            }}
          >
            Configuration
          </span>
        </div>

        <span
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: tk.textPrimary,
            letterSpacing: "-0.5px",
            lineHeight: 1.2,
          }}
        >
          Notification Settings
        </span>
        <span
          style={{
            fontSize: 13,
            fontWeight: 400,
            color: tk.textSecondary,
            marginTop: 2,
          }}
        >
          Manage event-based alerts across modules and roles
        </span>
      </div>

      {/* ── Right: Add button ── */}
      <button
        onClick={onAddNewNotification}
        style={
          {
            display: "flex",
            alignItems: "center",
            gap: 7,
            padding: "10px 18px",
            background: tk.accent,
            border: "none",
            borderRadius: tk.radiusL,
            color: "#ffffff",
            fontSize: 13,
            fontWeight: 700,
            fontFamily: "inherit",
            cursor: "pointer",
            whiteSpace: "nowrap",
            flexShrink: 0,
            transition: "opacity .18s, transform .16s, box-shadow .18s",
            boxShadow: `0 2px 8px ${tk.accentBorder}`,
          } as CSSProperties
        }
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLElement;
          el.style.opacity = "0.88";
          el.style.transform = "translateY(-1px)";
          el.style.boxShadow = `0 4px 16px ${tk.accentBorder}`;
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLElement;
          el.style.opacity = "1";
          el.style.transform = "translateY(0)";
          el.style.boxShadow = `0 2px 8px ${tk.accentBorder}`;
        }}
        onMouseDown={(e) => {
          (e.currentTarget as HTMLElement).style.transform = "translateY(0) scale(0.97)";
        }}
        onMouseUp={(e) => {
          (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
        }}
      >
        {/* Plus icon */}
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.8"
          strokeLinecap="round"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
        Add notification
      </button>
    </div>
  );
};

export default TopActionsSection;

// import React, { type CSSProperties } from "react";
// import { useTheme } from "@mui/material/styles";
// import { useNotifTokens } from "../style/notificationTokens";

// interface TopActionsSectionProps {
//   onAddNewNotification: () => void;
// }

// const TopActionsSection: React.FC<TopActionsSectionProps> = ({
//   onAddNewNotification,
// }) => {
//   const theme = useTheme();
//   const tk = useNotifTokens(theme);

//   return (
//     <div
//       style={{
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "space-between",
//         marginBottom: 1,
//       }}
//     >
//       {/* Title */}
//       <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
//         <span
//           style={{
//             fontSize: 22,
//             fontWeight: 800,
//             color: tk.textPrimary,
//             letterSpacing: "-0.4px",
//           }}
//         >
//           Notification settings
//         </span>
//         <span
//           style={{ fontSize: 13, fontWeight: 300, color: tk.textSecondary }}
//         >
//           Manage event-based alerts across modules and roles
//         </span>
//       </div>

//       {/* Add button — uses theme primary (indigo #6366F1) */}
//       <button
//         onClick={onAddNewNotification}
//         style={
//           {
//             display: "flex",
//             alignItems: "center",
//             gap: 7,
//             padding: "9px 18px",
//             background: tk.accentDim,
//             border: `1px solid ${tk.accentBorder}`,
//             borderRadius: tk.radiusL,
//             color: tk.accent,
//             fontSize: 13,
//             fontWeight: 600,
//             fontFamily: "inherit",
//             cursor: "pointer",
//             whiteSpace: "nowrap",
//             transition: "background .18s, transform .16s",
//           } as CSSProperties
//         }
//         onMouseEnter={(e) => {
//           (e.currentTarget as HTMLElement).style.background = tk.isDark
//             ? "rgba(99,102,241,0.22)"
//             : "rgba(99,102,241,0.15)";
//           (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
//         }}
//         onMouseLeave={(e) => {
//           (e.currentTarget as HTMLElement).style.background = tk.accentDim;
//           (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
//         }}
//       >
//         <svg
//           width="15"
//           height="15"
//           viewBox="0 0 24 24"
//           fill="none"
//           stroke="currentColor"
//           strokeWidth="2.5"
//           strokeLinecap="round"
//         >
//           <circle cx="12" cy="12" r="9" />
//           <path d="M12 8v8M8 12h8" />
//         </svg>
//         Add notification
//       </button>
//     </div>
//   );
// };

// export default TopActionsSection;
