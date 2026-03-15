import { ListItemButton, alpha, ListItemIcon, Badge, ListItemText, Chip, Stack, Typography, List, Divider, useTheme } from "@mui/material";

// --- Sidebar Menu ---
export const SidebarMenu = ({
  primaryMenus,
  moduleMenus,
  activeMenu,
  setActiveMenu,
}: any) => {
  const theme = useTheme();

  const renderMenuItems = (menus: any[]) =>
    menus.map((menu: any) => {
      const isActive = activeMenu === menu.id;
      const isHighlight = menu.isHighlight;

      return (
        <ListItemButton
          key={menu.id}
          onClick={() => setActiveMenu(menu.id)}
          sx={{
            borderRadius: 2,
            mb: 0.5,
            bgcolor: isActive
              ? alpha(theme.palette.primary.main, 0.08)
              : isHighlight
                ? alpha(theme.palette.warning.light, 0.1)
                : "transparent",
            color: isActive
              ? "primary.main"
              : isHighlight
                ? "warning.dark"
                : "text.primary",
            "&:hover": {
              bgcolor: isHighlight
                ? alpha(theme.palette.warning.light, 0.2)
                : alpha(theme.palette.primary.main, 0.12),
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 40, color: "inherit" }}>
            <Badge
              badgeContent={menu.unreadCount}
              color={isHighlight ? "warning" : "error"}
              variant="dot"
            >
              {menu.icon}
            </Badge>
          </ListItemIcon>
          <ListItemText
            primary={menu.text}
            primaryTypographyProps={{
              fontSize: 14,
              fontWeight: isActive || isHighlight ? 600 : 500,
            }}
          />
          {menu.unreadCount > 0 && (
            <Chip
              label={menu.unreadCount}
              size="small"
              sx={{
                height: 20,
                fontSize: "0.7rem",
                fontWeight: 600,
                bgcolor: isActive
                  ? "primary.main"
                  : isHighlight
                    ? "warning.main"
                    : theme.palette.action.selected,
                color: isActive || isHighlight ? "#fff" : "text.primary",
              }}
            />
          )}
        </ListItemButton>
      );
    });

  return (
    <Stack sx={{ py: 3, height: "100%" }}>
      {/* Primary Section */}
      <Typography
        variant="overline"
        sx={{
          px: 3,
          mb: 1,
          fontWeight: 700,
          color: "text.secondary",
          letterSpacing: 1,
        }}
      >
        Views
      </Typography>
      <List sx={{ px: 2, pb: 0 }}>{renderMenuItems(primaryMenus)}</List>

      <Divider sx={{ my: 2, mx: 2 }} />

      {/* Modules Section */}
      <Typography
        variant="overline"
        sx={{
          px: 3,
          mb: 1,
          fontWeight: 700,
          color: "text.secondary",
          letterSpacing: 1,
        }}
      >
        By Module
      </Typography>
      <List sx={{ px: 2, flex: 1, overflowY: "auto" }}>
        {renderMenuItems(moduleMenus)}
      </List>
    </Stack>
  );
};
