import React from "react";
import {
  Box,
  IconButton,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Drawer,
} from "@mui/material";
import { NavLink, useLocation } from "react-router";
import { Dashboard } from "@mui/icons-material";
import Groups2Icon from "@mui/icons-material/Groups2";
import vegayanLogo from "../../assets/images/Airtel.png";
import { useBgColor } from "../../context/BgColorContext";
import { useAppSelector } from "../../app/hooks";

interface SideBarProps {
  isCollapsed?: boolean;
  onCollapseToggle?: () => void;
}

const SideBar: React.FC<SideBarProps> = ({
  isCollapsed = false,
  onCollapseToggle,
}) => {
  const location = useLocation();
  const { bgColor } = useBgColor();

  const user = useAppSelector((s) => s.auth.user);

  if (!user) return null;

  const userRoles = user.roles; 

  const sidebarItems = [
    {
      to: "/home",
      text: "Dashboard",
      icon: <Dashboard sx={{ color: "white" }} />,
      roles: ["SUPER_ADMIN", "ADMIN", "MANAGER", "USER"],
    },
    {
      to: "/skillsetview",
      text: "Skill Set View",
      icon: <Groups2Icon sx={{ color: "white" }} />,
      roles: ["SUPER_ADMIN", "ADMIN", "MANAGER", "USER"],
    },
  ];

  const isSelected = (path: string) => {
    const currentPath = location.pathname;
    return currentPath === path || currentPath.startsWith(path);
  };

  const hasAccess = (allowedRoles: string[]) =>
    allowedRoles.some((role) => userRoles.includes(role));

  return (
    <Drawer
      variant="permanent"
      sx={{
        zIndex: 1000,
        width: isCollapsed ? 65 : 200,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: isCollapsed ? 65 : 200,
          boxSizing: "border-box",
          backgroundColor: bgColor,
          transition: "width 0.3s ease",
          height: "100vh",
          color: "white",
          overflow: "hidden",
        },
      }}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        pl={isCollapsed ? 1 : 2}
        pr={isCollapsed ? 1 : 2}
        sx={{ cursor: "pointer" }}
      >
        {!isCollapsed && <Typography variant="h6">CHM</Typography>}
        <IconButton onClick={onCollapseToggle} sx={{ color: "white" }}>
          <img src={vegayanLogo} alt="Logo" height={30} width={30} />
        </IconButton>
      </Box>

      <List>
        {sidebarItems
          .filter((item) => hasAccess(item.roles))
          .map(({ to, text, icon }) => (
            <Tooltip title={text} placement="right" arrow key={to}>
              <ListItem
                component={NavLink}
                to={to}
                sx={{
                  color: "white",
                  backgroundColor: isSelected(to)
                    ? "rgba(255, 255, 255, 0.2)"
                    : "transparent",
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                  },
                }}
              >
                <ListItemIcon sx={{ color: "white" }}>
                  {icon}
                </ListItemIcon>
                {!isCollapsed && <ListItemText primary={text} />}
              </ListItem>
            </Tooltip>
          ))}
      </List>
    </Drawer>
  );
};

export default SideBar;
