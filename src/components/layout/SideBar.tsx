import React from "react";
import {
  Box,
  IconButton,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Drawer,
} from "@mui/material";
import { NavLink, useLocation } from "react-router";
import DashboardIcon from "@mui/icons-material/Dashboard";
import Groups2Icon from "@mui/icons-material/Groups2";
import MenuIcon from "@mui/icons-material/Menu";
import vegayanLogo from "../../assets/images/Airtel.png";
import { useBgColor } from "../../context/BgColorContext";
import { useAppSelector } from "../../app/hooks";

interface SideBarProps {
  isCollapsed?: boolean;
  onCollapseToggle?: () => void;
}

const DRAWER_WIDTH = 240;
const COLLAPSED_WIDTH = 70;

const SideBar: React.FC<SideBarProps> = ({
  isCollapsed = false,
  onCollapseToggle,
}) => {
  const location = useLocation();
  const { bgColor } = useBgColor();
  const user = useAppSelector((s) => s.auth.user);

  if (!user) return null;

  const sidebarItems = [
    {
      to: "/home",
      text: "Dashboard",
      icon: <DashboardIcon />,
    },
    {
      to: "/team",
      text: "Team Management",
      icon: <Groups2Icon />,
    },
  ];

  const isActive = (path: string) =>
    location.pathname === path ||
    location.pathname.startsWith(path);

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: isCollapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: isCollapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH,
          background: `linear-gradient(
            180deg,
            ${bgColor} 0%,
            #0b1320 100%
          )`,
          color: "#fff",
          borderRight: "none",
          transition: "width 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
          overflowX: "hidden",
          boxShadow: "2px 0 10px rgba(0,0,0,0.45)",
          borderRadius: "0 18px 18px 0",
      
        },
      }}
    >
      {/* HEADER */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent={isCollapsed ? "center" : "space-between"}
        px={2}
        py={2}
      >
        {!isCollapsed && (
          <Box display="flex" alignItems="center" gap={1.2}>
            <img src={vegayanLogo} alt="Logo" width={34} />
            <Typography
              fontWeight={800}
              letterSpacing={1.2}
              sx={{ opacity: 0.95 }}
            >
              CHM
            </Typography>
          </Box>
        )}

        <IconButton
          onClick={onCollapseToggle}
          sx={{
            color: "#fff",
            bgcolor: "rgba(255,255,255,0.08)",
            "&:hover": {
              bgcolor: "rgba(255,255,255,0.18)",
              transform: "rotate(90deg)",
            },
            transition: "all 0.3s ease",
          }}
        >
          <MenuIcon />
        </IconButton>
      </Box>

      {/* NAVIGATION */}
      <List sx={{ px: 1.5, mt: 1 }}>
        {sidebarItems.map(({ to, text, icon }) => {
          const active = isActive(to);

          return (
            <Tooltip
              key={to}
              title={isCollapsed ? text : ""}
              placement="right"
              arrow
            >
              <ListItemButton
                component={NavLink}
                to={to}
                sx={{
                  position: "relative",
                  my: 0.6,
                  borderRadius: 2.5,
                  px: isCollapsed ? 1.5 : 2,
                  py: 1.2,
                  color: active
                    ? "#ffffff"
                    : "rgba(255,255,255,0.75)",
                  background: active
                    ? "linear-gradient(90deg, rgba(255,255,255,0.22), rgba(255,255,255,0.05))"
                    : "transparent",

                  "&::before": active
                    ? {
                        content: '""',
                        position: "absolute",
                        left: 0,
                        top: 8,
                        bottom: 8,
                        width: 4,
                        borderRadius: "0 6px 6px 0",
                        background:
                          "linear-gradient(180deg, #38bdf8, #6366f1)",
                        boxShadow: "0 0 12px rgba(56,189,248,0.8)",
                      }
                    : {},

                  "&:hover": {
                    background:
                      "linear-gradient(90deg, rgba(255,255,255,0.18), rgba(255,255,255,0.05))",
                    transform: "translateX(6px)",
                  },

                  transition: "all 0.28s ease",
                }}
              >
                <ListItemIcon
                  sx={{
                    color: "inherit",
                    minWidth: 42,
                    transform: active ? "scale(1.15)" : "scale(1)",
                    transition: "transform 0.25s ease",
                  }}
                >
                  {icon}
                </ListItemIcon>

                {!isCollapsed && (
                  <ListItemText
                    primary={text}
                    primaryTypographyProps={{
                      fontSize: 14.5,
                      fontWeight: active ? 600 : 400,
                      letterSpacing: 0.3,
                    }}
                  />
                )}
              </ListItemButton>
            </Tooltip>
          );
        })}
      </List>
    </Drawer>
  );
};

export default SideBar;


// import React from "react";
// import {
//   Box,
//   IconButton,
//   Typography,
//   List,
//   ListItemButton,
//   ListItemIcon,
//   ListItemText,
//   Tooltip,
//   Drawer,
// } from "@mui/material";
// import { NavLink, useLocation } from "react-router";
// import DashboardIcon from "@mui/icons-material/Dashboard";
// import Groups2Icon from "@mui/icons-material/Groups2";
// import MenuIcon from "@mui/icons-material/Menu";
// import vegayanLogo from "../../assets/images/Airtel.png";
// import { useBgColor } from "../../context/BgColorContext";
// import { useAppSelector } from "../../app/hooks";

// interface SideBarProps {
//   isCollapsed?: boolean;
//   onCollapseToggle?: () => void;
// }

// const DRAWER_WIDTH = 220;
// const COLLAPSED_WIDTH = 70;

// const SideBar: React.FC<SideBarProps> = ({
//   isCollapsed = false,
//   onCollapseToggle,
// }) => {
//   const location = useLocation();
//   const { bgColor } = useBgColor();
//   const user = useAppSelector((s) => s.auth.user);

//   if (!user) return null;

//   const sidebarItems = [
//     {
//       to: "/home",
//       text: "Dashboard",
//       icon: <DashboardIcon />,
//       roles: ["SUPER_ADMIN", "ADMIN", "MANAGER", "USER"],
//     },
//     {
//       to: "/skillsetview",
//       text: "Skill Set View",
//       icon: <Groups2Icon />,
//       roles: ["SUPER_ADMIN", "ADMIN", "MANAGER", "USER"],
//     },
//   ];

//   const isActive = (path: string) =>
//     location.pathname === path ||
//     location.pathname.startsWith(path);

//   return (
//     <Drawer
//       variant="permanent"
//       sx={{
//         width: isCollapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH,
//         flexShrink: 0,
//         "& .MuiDrawer-paper": {
//           width: isCollapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH,
//           background: `linear-gradient(
//             180deg,
//             ${bgColor} 0%,
//             #0f2027 100%
//           )`,
//           color: "#fff",
//           borderRight: "none",
//           transition: "width 0.3s ease",
//           overflowX: "hidden",
//           // boxShadow: "4px 0 20px rgba(0,0,0,0.4)",
//         },
//       }}
//     >
//       {/* Header */}
//       <Box
//         display="flex"
//         alignItems="center"
//         justifyContent={isCollapsed ? "center" : "space-between"}
//         px={2}
//         py={2}

//       >
//         {!isCollapsed && (
//           <Box display="flex" alignItems="center" gap={1}>
//             <img src={vegayanLogo} alt="Logo" width={32} />
//             <Typography fontWeight={700} letterSpacing={1}>
//               CHM
//             </Typography>
//           </Box>
//         )}
//         <IconButton onClick={onCollapseToggle} sx={{ color: "#fff" }}>
//           <MenuIcon />
//         </IconButton>
//       </Box>

//       {/* Navigation */}
//       <List sx={{ px: 1 }}>
//         {sidebarItems.map(({ to, text, icon }) => {
//           const active = isActive(to);

//           return (
//             <Tooltip
//               key={to}
//               title={isCollapsed ? text : ""}
//               placement="right"
//               arrow
//             >
//               <ListItemButton
//                 component={NavLink}
//                 to={to}
//                 sx={{
//                   my: 0.5,
//                   borderRadius: 2,
//                   color: active ? "#fff" : "rgba(255,255,255,0.7)",
//                   background: active
//                     ? "linear-gradient(90deg, rgba(255,255,255,0.25), rgba(255,255,255,0.05))"
//                     : "transparent",
//                   position: "relative",
//                   overflow: "hidden",
//                   "&::before": active
//                     ? {
//                         content: '""',
//                         position: "absolute",
//                         left: 0,
//                         top: 0,
//                         bottom: 0,
//                         width: 4,
//                         background: "#00e5ff",
//                         borderRadius: "0 4px 4px 0",
//                       }
//                     : {},
//                   "&:hover": {
//                     backgroundColor: "rgba(255,255,255,0.12)",
//                     transform: "translateX(4px)",
//                   },
//                   transition: "all 0.25s ease",
//                 }}
//               >
//                 <ListItemIcon
//                   sx={{
//                     color: "inherit",
//                     minWidth: 40,
//                   }}
//                 >
//                   {icon}
//                 </ListItemIcon>
//                 {!isCollapsed && (
//                   <ListItemText
//                     primary={text}
//                     primaryTypographyProps={{
//                       fontSize: 14,
//                       fontWeight: active ? 600 : 400,
//                     }}
//                   />
//                 )}
//               </ListItemButton>
//             </Tooltip>
//           );
//         })}
//       </List>
//     </Drawer>
//   );
// };

// export default SideBar;


// import React from "react";
// import {
//   Box,
//   IconButton,
//   Typography,
//   List,
//   ListItem,
//   ListItemIcon,
//   ListItemText,
//   Tooltip,
//   Drawer,
// } from "@mui/material";
// import { NavLink, useLocation } from "react-router";
// import { Dashboard } from "@mui/icons-material";
// import Groups2Icon from "@mui/icons-material/Groups2";
// import vegayanLogo from "../../assets/images/Airtel.png";
// import { useBgColor } from "../../context/BgColorContext";
// import { useAppSelector } from "../../app/hooks";

// interface SideBarProps {
//   isCollapsed?: boolean;
//   onCollapseToggle?: () => void;
// }

// const SideBar: React.FC<SideBarProps> = ({
//   isCollapsed = false,
//   onCollapseToggle,
// }) => {
//   const location = useLocation();
//   const { bgColor } = useBgColor();

//   const user = useAppSelector((s) => s.auth.user);

//   if (!user) return null;

//   const userRoles = user.roles; 

//   const sidebarItems = [
//     {
//       to: "/home",
//       text: "Dashboard",
//       icon: <Dashboard sx={{ color: "white" }} />,
//       roles: ["SUPER_ADMIN", "ADMIN", "MANAGER", "USER"],
//     },
//     {
//       to: "/skillsetview",
//       text: "Skill Set View",
//       icon: <Groups2Icon sx={{ color: "white" }} />,
//       roles: ["SUPER_ADMIN", "ADMIN", "MANAGER", "USER"],
//     },
//   ];

//   const isSelected = (path: string) => {
//     const currentPath = location.pathname;
//     return currentPath === path || currentPath.startsWith(path);
//   };

//   const hasAccess = (allowedRoles: string[]) =>
//     allowedRoles.some((role) => userRoles.includes(role));

//   return (
//     <Drawer
//       variant="permanent"
//       sx={{
//         zIndex: 1000,
//         width: isCollapsed ? 65 : 200,
//         flexShrink: 0,
//         "& .MuiDrawer-paper": {
//           width: isCollapsed ? 65 : 200,
//           boxSizing: "border-box",
//           backgroundColor: bgColor,
//           transition: "width 0.3s ease",
//           height: "100vh",
//           color: "white",
//           overflow: "hidden",
//         },
//       }}
//     >
//       <Box
//         display="flex"
//         justifyContent="space-between"
//         alignItems="center"
//         pl={isCollapsed ? 1 : 2}
//         pr={isCollapsed ? 1 : 2}
//         sx={{ cursor: "pointer" }}
//       >
//         {!isCollapsed && <Typography variant="h6">CHM</Typography>}
//         <IconButton onClick={onCollapseToggle} sx={{ color: "white" }}>
//           <img src={vegayanLogo} alt="Logo" height={30} width={30} />
//         </IconButton>
//       </Box>

//       <List>
//         {sidebarItems
//           .filter((item) => hasAccess(item.roles))
//           .map(({ to, text, icon }) => (
//             <Tooltip title={text} placement="right" arrow key={to}>
//               <ListItem
//                 component={NavLink}
//                 to={to}
//                 sx={{
//                   color: "white",
//                   backgroundColor: isSelected(to)
//                     ? "rgba(255, 255, 255, 0.2)"
//                     : "transparent",
//                   "&:hover": {
//                     backgroundColor: "rgba(255, 255, 255, 0.1)",
//                   },
//                 }}
//               >
//                 <ListItemIcon sx={{ color: "white" }}>
//                   {icon}
//                 </ListItemIcon>
//                 {!isCollapsed && <ListItemText primary={text} />}
//               </ListItem>
//             </Tooltip>
//           ))}
//       </List>
//     </Drawer>
//   );
// };

// export default SideBar;
