import React from "react";
import { Box, Typography } from "@mui/material";
import { MoreHorizOutlined } from "@mui/icons-material";
import type { useTabColorTokens } from "../../../../style/theme";
import type { RolePermissionViewModel, PermissionModel } from "../Globalsettingapislice";
import PermChip from "./PermChip";

interface SubModuleCardProps {
  row: RolePermissionViewModel;
  allPermissions: PermissionModel[];
  grantedIds: Set<number>;
  loadingPermId: number | null;
  onToggle: (permissionId: number, currentGranted: boolean) => void;
  onMenuClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  c: ReturnType<typeof useTabColorTokens>;
}

const SubModuleCard: React.FC<SubModuleCardProps> = ({
  row,
  allPermissions,
  grantedIds,
  loadingPermId,
  onToggle,
  onMenuClick,
  c,
}) => {
  const noRecord = row.rolePermissionId === null && grantedIds.size === 0;

  return (
    <Box
      sx={{
        bgcolor: c.surface,
        border: `1px solid ${c.border}`,
        borderRadius: "10px",
        boxShadow: c.isDark
          ? "0 1px 0 rgba(255,255,255,0.04), 0 4px 16px -8px rgba(0,0,0,0.3)"
          : "0 1px 0 rgba(13,27,42,0.05), 0 4px 16px -8px rgba(13,27,42,0.08)",
        overflow: "hidden",
        transition: "border-color 0.12s",
        "&:hover": {
          borderColor: c.borderHover,
          "& .sub-menu-btn": { opacity: 1 },
        },
      }}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "minmax(180px, 240px) 1fr auto",
          alignItems: "center",
          gap: "16px",
          px: 2,
          py: 1.75,
        }}
      >
        {/* Info column */}
        <Box sx={{ minWidth: 0 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                bgcolor: grantedIds.size > 0 ? c.accent : c.border,
                flexShrink: 0,
                transition: "background 0.15s",
              }}
            />
            <Typography
              fontSize="0.875rem"
              fontWeight={500}
              color={c.textPrimary}
              noWrap
            >
              {row.subModuleName}
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              gap: 1.5,
              alignItems: "center",
              mt: 0.5,
              flexWrap: "wrap",
            }}
          >
            <Typography
              fontSize="0.68rem"
              color={c.textDim}
              fontFamily="'JetBrains Mono', 'Courier New', monospace"
            >
              ID:{row.subModuleId}
            </Typography>
            <Typography fontSize="0.68rem" color={c.textSecondary}>
              {grantedIds.size}/{allPermissions.length} granted
            </Typography>
            {noRecord && (
              <Typography
                fontSize="0.62rem"
                color={c.textDim}
                sx={{
                  px: "5px",
                  py: "1px",
                  borderRadius: "4px",
                  border: `1px dashed ${c.border}`,
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                no record
              </Typography>
            )}
          </Box>
        </Box>

        {/* Permission chips */}
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center" }}>
          {allPermissions.length === 0 ? (
            <Typography fontSize="0.75rem" color={c.textDim} fontStyle="italic">
              No permission types defined.
            </Typography>
          ) : (
            allPermissions.map((p) => (
              <PermChip
                key={p.permissionId}
                label={p.permissionName}
                granted={grantedIds.has(p.permissionId)}
                loading={loadingPermId === p.permissionId}
                onClick={() => onToggle(p.permissionId, grantedIds.has(p.permissionId))}
                c={c}
              />
            ))
          )}
        </Box>

        {/* Context menu trigger */}
        <Box
          component="button"
          className="sub-menu-btn"
          onClick={onMenuClick}
          sx={{
            opacity: 0,
            width: 28,
            height: 28,
            borderRadius: "6px",
            border: `1px solid ${c.border}`,
            bgcolor: "transparent",
            color: c.textDim,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "opacity 0.12s, background 0.1s",
            flexShrink: 0,
            "&:hover": {
              bgcolor: c.isDark ? "rgba(255,255,255,0.08)" : "rgba(13,27,42,0.06)",
              color: c.textPrimary,
            },
          }}
        >
          <MoreHorizOutlined sx={{ fontSize: 14 }} />
        </Box>
      </Box>
    </Box>
  );
};

export default SubModuleCard;