import React from "react";
import { Box, Typography, InputBase, CircularProgress, alpha } from "@mui/material";
import { SearchOutlined, AddOutlined } from "@mui/icons-material";
import type { useTabColorTokens } from "../../../../style/theme";
import { RailItem } from "../RailItem";
// import type { useTabColorTokens } from "../../../style/theme";
// import { RailItem } from "./RailItem";

export interface RailPanelItem {
  id: number;
  label: string;
  sublabel?: string;
  icon: React.ReactNode;
}

interface RailPanelProps {
  title: string;
  items: RailPanelItem[];
  activeId: number | null;
  loading: boolean;
  query: string;
  onQueryChange: (q: string) => void;
  onSelect: (id: number) => void;
  onMenuClick: (e: React.MouseEvent<HTMLElement>, id: number) => void;
  onAdd: () => void;
  addLabel: string;
  width?: number;
  dimBg?: boolean;
  c: ReturnType<typeof useTabColorTokens>;
}

const RailPanel: React.FC<RailPanelProps> = ({
  title,
  items,
  activeId,
  loading,
  query,
  onQueryChange,
  onSelect,
  onMenuClick,
  onAdd,
  addLabel,
  width = 256,
  dimBg = false,
  c,
}) => {
  const railSx = {
    width,
    flexShrink: 0,
    bgcolor: dimBg
      ? c.isDark
        ? "rgba(255,255,255,0.01)"
        : "rgba(13,27,42,0.015)"
      : c.surface,
    borderRight: `1px solid ${c.border}`,
    display: "flex",
    flexDirection: "column",
    height: "100%",
    overflow: "hidden",
  };

  const iconBtnSx = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 26,
    height: 26,
    borderRadius: "6px",
    border: `1px solid ${c.border}`,
    bgcolor: "transparent",
    color: c.textSecondary,
    cursor: "pointer",
    transition: "all 0.1s",
    "&:hover": {
      bgcolor: c.accentDim,
      color: c.accent,
      border: `1px solid ${c.accentBorder}`,
    },
  };

  const btnSx = {
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    height: 30,
    px: "11px",
    borderRadius: "7px",
    fontSize: "0.78rem",
    fontWeight: 500,
    fontFamily: "inherit",
    cursor: "pointer",
    letterSpacing: "-0.005em",
    transition: "all 0.1s",
  };

  return (
    <Box sx={railSx}>
      {/* Header */}
      <Box
        sx={{
          px: 2, pt: 2, pb: 1.25,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography
          fontSize="0.68rem"
          fontWeight={700}
          color={c.textDim}
          letterSpacing="0.08em"
          textTransform="uppercase"
        >
          {title}
        </Typography>
        <Box component="button" sx={iconBtnSx} onClick={onAdd}>
          <AddOutlined sx={{ fontSize: 14 }} />
        </Box>
      </Box>

      {/* Search */}
      <Box
        sx={{
          mx: 1.5, mb: 1, px: 1.25, py: 0.75,
          borderRadius: "6px",
          border: `1px solid ${c.border}`,
          bgcolor: c.isDark ? "rgba(255,255,255,0.03)" : "rgba(13,27,42,0.025)",
          display: "flex",
          alignItems: "center",
          gap: 1,
          "&:focus-within": {
            border: `1px solid ${c.accent}`,
            boxShadow: `0 0 0 3px ${alpha(c.accent, 0.12)}`,
          },
        }}
      >
        <SearchOutlined sx={{ fontSize: 14, color: c.textDim, flexShrink: 0 }} />
        <InputBase
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder={`Search ${title.toLowerCase()}…`}
          sx={{
            fontSize: "0.78rem",
            color: c.textPrimary,
            flex: 1,
            "& input": { p: 0 },
          }}
        />
      </Box>

      {/* List */}
      <Box sx={{ flex: 1, overflowY: "auto", px: 1, pb: 1.5 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress size={20} sx={{ color: c.accent }} />
          </Box>
        ) : (
          items.map((item) => (
            <RailItem
              key={item.id}
              label={item.label}
              sublabel={item.sublabel ?? ""}
              isActive={item.id === activeId}
              icon={item.icon}
              onClick={() => onSelect(item.id)}
              onMenuClick={(e) => onMenuClick(e, item.id)}
              c={c}
            />
          ))
        )}
        {!loading && items.length === 0 && (
          <Typography fontSize="0.75rem" color={c.textDim} px={1.5} py={2}>
            No {title.toLowerCase()} match.
          </Typography>
        )}
      </Box>

      {/* Footer add button */}
      <Box sx={{ borderTop: `1px solid ${c.border}`, px: 1.5, py: 1.25 }}>
        <Box
          component="button"
          onClick={onAdd}
          sx={{
            ...btnSx,
            width: "100%",
            height: 30,
            justifyContent: "center",
            border: `1px solid ${c.border}`,
            bgcolor: "transparent",
            color: c.textSecondary,
            "&:hover": {
              bgcolor: c.accentDim,
              color: c.accent,
              border: `1px solid ${c.accentBorder}`,
            },
          }}
        >
          <AddOutlined sx={{ fontSize: 14 }} /> {addLabel}
        </Box>
      </Box>
    </Box>
  );
};

export default RailPanel;