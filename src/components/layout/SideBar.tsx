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
  Badge,
} from "@mui/material";
import { NavLink, useLocation } from "react-router";
import DashboardIcon from "@mui/icons-material/Dashboard";
import Groups2Icon from "@mui/icons-material/Groups2";
import MenuIcon from "@mui/icons-material/Menu";
import vegayanLogo from "../../assets/images/Airtel.png";
import { useBgColor } from "../../context/BgColorContext";
import { useAppSelector } from "../../app/hooks";
import { CalendarMonth, RequestQuoteSharp } from "@mui/icons-material";
import MailIcon from "@mui/icons-material/Mail";
import PersonIcon from "@mui/icons-material/Person";
import ViewTimelineOutlinedIcon from '@mui/icons-material/ViewTimelineOutlined';
import {
  // Dashboard,
  // FileUpload,
  FilterTiltShift,
  // Schedule,
  // Task,
} from "@mui/icons-material";
import { useGetUnreadNotificationCountQuery } from "../../features/inbox/api/inboxApiSlice";
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
  // const inboxCount = useAppSelector((s) => s.notifications.inboxCount); // example store
  const { data: countData } = useGetUnreadNotificationCountQuery(undefined, {
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });
  const inboxCount = countData?.notificationCount ?? 0; // const inboxCount = 3; // hardcoded for now
  if (!user) return null;

  const sidebarItems = [
    {
      to: "/home",
      text: "Dashboard",
      icon: <DashboardIcon />,
    },
    {
      to: "/me",
      text: "Me",
      icon: <PersonIcon />,
    },
    {
      to: "/generateroster",
      text: "Roster Generator",
      icon: <ViewTimelineOutlinedIcon />,
    },
    {
      to: "/team",
      text: "Team Management",
      icon: <Groups2Icon />,
    },
    {
      to: "/scheduler",
      text: "Scheduler",
      icon: <FilterTiltShift />,
    },

    {
      to: "/roster",
      text: "Roster View",
      icon: <CalendarMonth />,
    },
    {
      to: "/inbox",
      text: "Inbox",
      icon: (
        <Badge badgeContent={inboxCount} color="error">
          <MailIcon />
        </Badge>
      ),
    },
  ];

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path);

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
                  color: active ? "#ffffff" : "rgba(255,255,255,0.75)",
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
                        background: "linear-gradient(180deg, #38bdf8, #6366f1)",
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
