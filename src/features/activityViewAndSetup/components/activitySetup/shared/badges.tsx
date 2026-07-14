import React from "react";

const IMPACT_COLOR: Record<string, { fg: string; bg: string }> = {
  Low: { fg: "#065f46", bg: "#d1fae5" },
  Medium: { fg: "#92400e", bg: "#fef3c7" },
  High: { fg: "#c2410c", bg: "#ffedd5" },
  Critical: { fg: "#991b1b", bg: "#fee2e2" },
};

const STATUS_COLOR: Record<string, { fg: string; bg: string; dot: string }> = {
  Active: { fg: "#065f46", bg: "#d1fae5", dot: "#10b981" },
  Inactive: { fg: "#374151", bg: "#f3f4f6", dot: "#9ca3af" },
  Draft: { fg: "#1e40af", bg: "#dbeafe", dot: "#3b82f6" },
  Pending: { fg: "#92400e", bg: "#fef3c7", dot: "#f59e0b" },
};

type BadgeSize = "sm" | "md";

const badgeStyle = (size: BadgeSize): React.CSSProperties => ({
  display: "inline-flex",
  alignItems: "center",
  padding: size === "sm" ? "1px 7px" : "2px 8px",
  borderRadius: size === "sm" ? 4 : 6,
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: "0.03em",
  whiteSpace: "nowrap",
});

interface BadgeProps {
  value: string;
  size?: BadgeSize;
  /** Prefix shown before the value, e.g. "Impact: " */
  label?: string;
}

export const ImpactBadge: React.FC<BadgeProps> = ({ value, size = "sm", label }) => {
  const c = IMPACT_COLOR[value] ?? { fg: "#374151", bg: "#f3f4f6" };
  return (
    <span style={{ ...badgeStyle(size), color: c.fg, backgroundColor: c.bg }}>
      {label}
      {value || "—"}
    </span>
  );
};

export const StatusBadge: React.FC<BadgeProps> = ({ value, size = "sm" }) => {
  const c = STATUS_COLOR[value] ?? {
    fg: "#374151",
    bg: "#f3f4f6",
    dot: "#9ca3af",
  };
  return (
    <span style={{ ...badgeStyle(size), color: c.fg, backgroundColor: c.bg, gap: size === "sm" ? 5 : 6 }}>
      <span
        style={{
          width: size === "sm" ? 5 : 6,
          height: size === "sm" ? 5 : 6,
          borderRadius: "50%",
          backgroundColor: c.dot,
          flexShrink: 0,
        }}
      />
      {value || "—"}
    </span>
  );
};
