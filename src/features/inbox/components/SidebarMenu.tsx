import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Chip,
  Stack,
  Divider,
  useTheme,
  alpha,
} from "@mui/material";

export const SidebarMenu = ({ primaryMenus, moduleMenus, activeMenu, setActiveMenu }: any) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const renderMenuItems = (menus: any[]) =>
    menus.map((menu: any) => {
      const isActive = activeMenu === menu.id;
      const isHighlight = menu.isHighlight;

      return (
        <ListItemButton
          key={menu.id}
          onClick={() => setActiveMenu(menu.id)}
          sx={{
            borderRadius: "8px",
            mb: 0.25,
            py: 0.75,
            px: 1.25,
            minHeight: 36,
            bgcolor: isActive
              ? alpha(theme.palette.primary.main, isDark ? 0.2 : 0.09)
              : "transparent",
            color: isActive
              ? "primary.main"
              : isHighlight
              ? "warning.dark"
              : "text.primary",
            transition: "background-color 0.15s ease, color 0.15s ease",
            "&:hover": {
              bgcolor: isActive
                ? alpha(theme.palette.primary.main, isDark ? 0.25 : 0.12)
                : isHighlight
                ? alpha(theme.palette.warning.main, 0.08)
                : alpha(theme.palette.action.hover, 1),
            },
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 28,
              color: isActive ? "primary.main" : isHighlight ? "warning.main" : "text.secondary",
            }}
          >
            {menu.icon}
          </ListItemIcon>
          <ListItemText
            primary={menu.text}
            primaryTypographyProps={{
              fontSize: "0.8125rem",
              fontWeight: isActive ? 600 : 500,
              noWrap: true,
            }}
          />
          {menu.unreadCount > 0 && (
            <Chip
              label={menu.unreadCount}
              size="small"
              sx={{
                height: 18,
                minWidth: 18,
                fontSize: "0.68rem",
                fontWeight: 700,
                px: 0.5,
                bgcolor: isActive
                  ? "primary.main"
                  : isHighlight
                  ? alpha(theme.palette.warning.main, 0.15)
                  : alpha(theme.palette.text.primary, 0.08),
                color: isActive
                  ? "#fff"
                  : isHighlight
                  ? "warning.dark"
                  : "text.secondary",
                "& .MuiChip-label": { px: 0.75 },
              }}
            />
          )}
        </ListItemButton>
      );
    });

  const sectionLabel = (text: string) => (
    <Typography
      variant="overline"
      sx={{
        display: "block",
        px: 1.25,
        pt: 1.5,
        pb: 0.5,
        fontSize: "0.65rem",
        fontWeight: 700,
        letterSpacing: "0.08em",
        color: "text.disabled",
        userSelect: "none",
      }}
    >
      {text}
    </Typography>
  );

  return (
    <Stack sx={{ height: "100%", overflow: "hidden" }}>
      {/* App header strip */}
      <Box
        sx={{
          px: 2,
          py: 1.5,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 700, fontSize: "0.875rem", color: "text.primary" }}
        >
          Inbox
        </Typography>
      </Box>

      <Box sx={{ flex: 1, overflowY: "auto", px: 1, pb: 2 }}>
        {sectionLabel("Views")}
        <List disablePadding>{renderMenuItems(primaryMenus)}</List>

        <Divider sx={{ my: 1.5, mx: 0.5 }} />

        {sectionLabel("By Module")}
        <List disablePadding>{renderMenuItems(moduleMenus)}</List>
      </Box>
    </Stack>
  );
};

// import { ListItemButton, alpha, ListItemIcon, Badge, ListItemText, Chip, Stack, Typography, List, Divider, useTheme } from "@mui/material";

// // --- Sidebar Menu ---
// export const SidebarMenu = ({
//   primaryMenus,
//   moduleMenus,
//   activeMenu,
//   setActiveMenu,
// }: any) => {
//   const theme = useTheme();

//   const renderMenuItems = (menus: any[]) =>
//     menus.map((menu: any) => {
//       const isActive = activeMenu === menu.id;
//       const isHighlight = menu.isHighlight;

//       return (
//         <ListItemButton
//           key={menu.id}
//           onClick={() => setActiveMenu(menu.id)}
//           sx={{
//             borderRadius: 2,
//             mb: 0.5,
//             bgcolor: isActive
//               ? alpha(theme.palette.primary.main, 0.08)
//               : isHighlight
//                 ? alpha(theme.palette.warning.light, 0.1)
//                 : "transparent",
//             color: isActive
//               ? "primary.main"
//               : isHighlight
//                 ? "warning.dark"
//                 : "text.primary",
//             "&:hover": {
//               bgcolor: isHighlight
//                 ? alpha(theme.palette.warning.light, 0.2)
//                 : alpha(theme.palette.primary.main, 0.12),
//             },
//           }}
//         >
//           <ListItemIcon sx={{ minWidth: 40, color: "inherit" }}>
//             <Badge
//               badgeContent={menu.unreadCount}
//               color={isHighlight ? "warning" : "error"}
//               variant="dot"
//             >
//               {menu.icon}
//             </Badge>
//           </ListItemIcon>
//           <ListItemText
//             primary={menu.text}
//             primaryTypographyProps={{
//               fontSize: 14,
//               fontWeight: isActive || isHighlight ? 600 : 500,
//             }}
//           />
//           {menu.unreadCount > 0 && (
//             <Chip
//               label={menu.unreadCount}
//               size="small"
//               sx={{
//                 height: 20,
//                 fontSize: "0.7rem",
//                 fontWeight: 600,
//                 bgcolor: isActive
//                   ? "primary.main"
//                   : isHighlight
//                     ? "warning.main"
//                     : theme.palette.action.selected,
//                 color: isActive || isHighlight ? "#fff" : "text.primary",
//               }}
//             />
//           )}
//         </ListItemButton>
//       );
//     });

//   return (
//     <Stack sx={{ py: 3, height: "100%" }}>
//       {/* Primary Section */}
//       <Typography
//         variant="overline"
//         sx={{
//           px: 3,
//           mb: 1,
//           fontWeight: 700,
//           color: "text.secondary",
//           letterSpacing: 1,
//         }}
//       >
//         Views
//       </Typography>
//       <List sx={{ px: 2, pb: 0 }}>{renderMenuItems(primaryMenus)}</List>

//       <Divider sx={{ my: 2, mx: 2 }} />

//       {/* Modules Section */}
//       <Typography
//         variant="overline"
//         sx={{
//           px: 3,
//           mb: 1,
//           fontWeight: 700,
//           color: "text.secondary",
//           letterSpacing: 1,
//         }}
//       >
//         By Module
//       </Typography>
//       <List sx={{ px: 2, flex: 1, overflowY: "auto" }}>
//         {renderMenuItems(moduleMenus)}
//       </List>
//     </Stack>
//   );
// };
