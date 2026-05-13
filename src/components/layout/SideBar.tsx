import React, { useState, useRef } from "react";
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
  Collapse,
  Paper,
  Popper,
  Fade,
} from "@mui/material";
import { NavLink, useLocation } from "react-router";
import MenuIcon from "@mui/icons-material/Menu";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import vegayanLogo from "../../assets/images/Airtel.png";
import { useBgColor } from "../../context/BgColorContext";
import { useAppSelector } from "../../app/hooks";
import { useGetUnreadNotificationCountQuery } from "../../features/inbox/api/inboxApiSlice";
import { useSidebarNav, type NavItem } from "../../rbac/useSidebarNav";

interface SideBarProps {
  isCollapsed?: boolean;
  onCollapseToggle?: () => void;
}

const DRAWER_WIDTH = 240;
const COLLAPSED_WIDTH = 70;

// ─── Shared active-item styles ────────────────────────────────────────────────
const activeItemSx = {
  background: "linear-gradient(90deg, rgba(255,255,255,0.22), rgba(255,255,255,0.05))",
  color: "#ffffff",
  "&::before": {
    content: '""',
    position: "absolute",
    left: 0,
    top: 8,
    bottom: 8,
    width: 4,
    borderRadius: "0 6px 6px 0",
    background: "linear-gradient(180deg, #38bdf8, #6366f1)",
    boxShadow: "0 0 12px rgba(56,189,248,0.8)",
  },
};

const baseItemSx = (active: boolean, isCollapsed: boolean) => ({
  position: "relative",
  my: 0.6,
  borderRadius: 2.5,
  px: isCollapsed ? 1.5 : 2,
  py: 1.2,
  color: active ? "#ffffff" : "rgba(255,255,255,0.75)",
  background: "transparent",
  ...(active ? activeItemSx : {}),
  "&:hover": {
    background: "linear-gradient(90deg, rgba(255,255,255,0.18), rgba(255,255,255,0.05))",
    transform: "translateX(6px)",
  },
  transition: "all 0.28s ease",
});

// ─── Sub-item row (used in both accordion & flyout) ───────────────────────────
interface SubItemProps {
  item: Omit<NavItem, "children">;
  isActive: boolean;
  flyout?: boolean;
  onNavigate?: () => void;
}

const SubItem: React.FC<SubItemProps> = ({ item, isActive, flyout, onNavigate }) => (
  <ListItemButton
    component={NavLink}
    to={item.to}
    onClick={onNavigate}
    sx={{
      position: "relative",
      mx: flyout ? 0.5 : 1,
      my: 0.3,
      pl: flyout ? 1.5 : 4,
      pr: 1.5,
      py: flyout ? 1 : 0.9,
      borderRadius: 2,
      color: isActive
        ? flyout ? "#6366f1" : "#ffffff"
        : flyout ? "rgba(30,30,50,0.75)" : "rgba(255,255,255,0.65)",
      background: isActive
        ? flyout ? "rgba(99,102,241,0.10)" : "rgba(255,255,255,0.12)"
        : "transparent",
      "&::before": isActive
        ? {
            content: '""',
            position: "absolute",
            left: 0,
            top: 6,
            bottom: 6,
            width: 3,
            borderRadius: "0 4px 4px 0",
            background: "linear-gradient(180deg, #38bdf8, #6366f1)",
            boxShadow: "0 0 8px rgba(56,189,248,0.7)",
          }
        : {},
      "&:hover": {
        background: flyout ? "rgba(99,102,241,0.07)" : "rgba(255,255,255,0.10)",
        transform: "translateX(4px)",
      },
      transition: "all 0.22s ease",
    }}
  >
    <ListItemIcon
      sx={{
        color: "inherit",
        minWidth: 32,
        "& svg": { fontSize: 17 },
      }}
    >
      {item.icon}
    </ListItemIcon>
    <ListItemText
      primary={item.text}
      primaryTypographyProps={{
        fontSize: 13.5,
        fontWeight: isActive ? 600 : 400,
        letterSpacing: 0.2,
      }}
    />
  </ListItemButton>
);

// ─── Flyout panel rendered via Popper ────────────────────────────────────────
interface FlyoutMenuProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  parentText: string;
  children: Omit<NavItem, "children">[];
  isItemActive: (to: string, matchPaths?: string[], exactOnly?: boolean) => boolean;
  onClose: () => void;
}

const FlyoutMenu: React.FC<FlyoutMenuProps> = ({
  anchorEl,
  open,
  parentText,
  children,
  isItemActive,
  onClose,
}) => (
  <Popper
    open={open}
    anchorEl={anchorEl}
    placement="right-start"
    transition
    style={{ zIndex: 1400 }}
    modifiers={[{ name: "offset", options: { offset: [0, 8] } }]}
  >
    {({ TransitionProps }) => (
      <Fade {...TransitionProps} timeout={180}>
        <Paper
          elevation={8}
          onMouseLeave={onClose}
          sx={{
            minWidth: 196,
            borderRadius: 3,
            overflow: "hidden",
            background: "#ffffff",
            boxShadow:
              "0 8px 32px rgba(30,30,80,0.16), 0 2px 8px rgba(99,102,241,0.10)",
            border: "1px solid rgba(99,102,241,0.10)",
            py: 0.8,
          }}
        >
          {/* Section label */}
          <Typography
            sx={{
              px: 2,
              pt: 0.5,
              pb: 0.8,
              fontSize: 10.5,
              fontWeight: 700,
              letterSpacing: 1,
              textTransform: "uppercase",
              color: "rgba(30,30,80,0.35)",
              borderBottom: "1px solid rgba(99,102,241,0.08)",
              mb: 0.5,
            }}
          >
            {parentText}
          </Typography>

          <List disablePadding>
            {children.map((child) => (
              <SubItem
                key={child.to}
                item={child}
                isActive={isItemActive(child.to, child.matchPaths, true)}
                flyout
                onNavigate={onClose}
              />
            ))}
          </List>
        </Paper>
      </Fade>
    )}
  </Popper>
);

// ─── Main SideBar ─────────────────────────────────────────────────────────────
const SideBar: React.FC<SideBarProps> = ({
  isCollapsed = false,
  onCollapseToggle,
}) => {
  const location = useLocation();
  const { bgColor } = useBgColor();
  const user = useAppSelector((s) => s.auth.user);

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  // Flyout state — used only when sidebar is collapsed
  const [flyoutAnchor, setFlyoutAnchor] = useState<HTMLElement | null>(null);
  const [flyoutItem, setFlyoutItem] = useState<NavItem | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: countData } = useGetUnreadNotificationCountQuery(undefined, {
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });
  const inboxCount = countData?.notificationCount ?? 0;

  const sidebarItems = useSidebarNav();

  if (!user) return null;

  /**
   * Determines whether a nav item should appear "active".
   *
   * For PARENT items (called with just `to`):
   *   prefix match — glows whenever the current path is anywhere under it.
   *
   * For CHILD items (called with `to` + optional `matchPaths`):
   *   1. Exact match on `to`  (e.g. /scheduler/planviewandsetup)
   *   2. OR prefix match on any entry in `matchPaths`
   *      (e.g. /scheduler/crqWorkflow stays active on /scheduler/crqWorkflow/ABC123)
   *
   * This means siblings never steal each other's highlight.
   */
  const isItemActive = (
    to: string,
    matchPaths?: string[],
    exactOnly = false,
  ): boolean => {
    const p = location.pathname;

    // Exact hit always wins
    if (p === to) return true;

    // For parent-level check (exactOnly = false, no matchPaths) use prefix
    if (!exactOnly && !matchPaths) {
      return p.startsWith(to + "/");
    }

    // For child items: only prefix-match on explicitly declared matchPaths
    if (matchPaths) {
      return matchPaths.some(
        (mp) => p === mp || p.startsWith(mp + "/"),
      );
    }

    return false;
  };

  const toggleGroup = (to: string) =>
    setOpenGroups((prev) => ({ ...prev, [to]: !prev[to] }));

  const isGroupOpen = (item: NavItem) => {
    if (openGroups[item.to] !== undefined) return openGroups[item.to];
    // Auto-open if any child is active (uses each child's own matchPaths)
    return (
      item.children?.some((c) =>
        isItemActive(c.to, c.matchPaths, true),
      ) ?? false
    );
  };

  // ── Flyout mouse handlers ─────────────────────────────────────────────────
  const openFlyout = (e: React.MouseEvent<HTMLElement>, item: NavItem) => {
    if (!isCollapsed) return;
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setFlyoutAnchor(e.currentTarget);
    setFlyoutItem(item);
  };

  const scheduleFlyoutClose = () => {
    if (!isCollapsed) return;
    closeTimer.current = setTimeout(() => {
      setFlyoutAnchor(null);
      setFlyoutItem(null);
    }, 120); // small grace period so pointer can enter the panel
  };

  const cancelFlyoutClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };

  const closeFlyout = () => {
    setFlyoutAnchor(null);
    setFlyoutItem(null);
  };

  return (
    <>
      <Drawer
        variant="permanent"
        sx={{
          width: isCollapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: isCollapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH,
            background: `linear-gradient(180deg, ${bgColor} 0%, #0b1320 100%)`,
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
              <Typography fontWeight={800} letterSpacing={1.2} sx={{ opacity: 0.95 }}>
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
          {sidebarItems.map((item) => {
            const { to, text, icon, showBadge, children } = item;
            const active = isItemActive(to); // prefix match for parent
            const hasChildren = Array.isArray(children) && children.length > 0;
            const groupOpen = hasChildren && isGroupOpen(item);

            const renderedIcon = showBadge ? (
              <Badge badgeContent={inboxCount} color="error">{icon}</Badge>
            ) : icon;

            // ── Parent with children ──────────────────────────────────────
            if (hasChildren) {
              return (
                <React.Fragment key={to}>
                  <ListItemButton
                    onClick={() => !isCollapsed && toggleGroup(to)}
                    onMouseEnter={(e) => openFlyout(e, item)}
                    onMouseLeave={scheduleFlyoutClose}
                    sx={baseItemSx(active, isCollapsed)}
                  >
                    <ListItemIcon
                      sx={{
                        color: "inherit",
                        minWidth: 42,
                        transform: active ? "scale(1.15)" : "scale(1)",
                        transition: "transform 0.25s ease",
                      }}
                    >
                      {renderedIcon}
                    </ListItemIcon>

                    {!isCollapsed && (
                      <>
                        <ListItemText
                          primary={text}
                          primaryTypographyProps={{
                            fontSize: 14.5,
                            fontWeight: active ? 600 : 400,
                            letterSpacing: 0.3,
                          }}
                        />
                        <Box
                          component="span"
                          sx={{
                            display: "flex",
                            color: "rgba(255,255,255,0.55)",
                            "& svg": { fontSize: 18 },
                          }}
                        >
                          {groupOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </Box>
                      </>
                    )}
                  </ListItemButton>

                  {/* Accordion — expanded sidebar only */}
                  {!isCollapsed && (
                    <Collapse in={groupOpen} timeout={260} unmountOnExit>
                      <List disablePadding sx={{ pb: 0.5 }}>
                        {children!.map((child) => (
                          <SubItem
                            key={child.to}
                            item={child}
                            isActive={isItemActive(child.to, child.matchPaths, true)}
                          />
                        ))}
                      </List>
                    </Collapse>
                  )}
                </React.Fragment>
              );
            }

            // ── Regular leaf item ─────────────────────────────────────────
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
                  sx={baseItemSx(active, isCollapsed)}
                >
                  <ListItemIcon
                    sx={{
                      color: "inherit",
                      minWidth: 42,
                      transform: active ? "scale(1.15)" : "scale(1)",
                      transition: "transform 0.25s ease",
                    }}
                  >
                    {renderedIcon}
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

      {/* Flyout panel — rendered outside Drawer so it isn't clipped by overflowX:hidden */}
      {flyoutItem && (
        <Box
          onMouseEnter={cancelFlyoutClose}   // keep open while pointer is inside panel
          onMouseLeave={closeFlyout}
          sx={{ position: "fixed", zIndex: 1400 }}
        >
          <FlyoutMenu
            anchorEl={flyoutAnchor}
            open={Boolean(flyoutAnchor)}
            parentText={flyoutItem.text}
            children={flyoutItem.children ?? []}
            isItemActive={isItemActive}
            onClose={closeFlyout}
          />
        </Box>
      )}
    </>
  );
};

export default SideBar;