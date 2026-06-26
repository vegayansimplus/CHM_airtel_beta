import React, { useState, useContext, type JSX } from "react";
import {
  Box,
  IconButton,
  Typography,
  useTheme,
  Menu,
  MenuItem,
  Divider,
  CircularProgress,
  Switch,
  Stack,
  Tooltip,
} from "@mui/material";

import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import LockResetIcon from "@mui/icons-material/LockReset";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import BadgeIcon from "@mui/icons-material/Badge";

import { tokens, ColorModeContext } from "../../style/theme";
import { useBgColor } from "../../context/BgColorContext";
import { useNavigate } from "react-router";
// import VegayanLogo from "../../assets/images/logo_vega.png";
// vegayan_logo.png
import VegayanLogo from "../../assets/images/vegayan_logo.png";
import AirtelLog from "../../assets/images/airtel3.png";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { useLogoutMutation } from "../../features/auth/api/auth.api";
import { logout } from "../../features/auth/slices/auth.slice";
import ChangePasswordDialog from "../common/ChangePasswordDialog";

// ── Import the notification bell ──────────────────────────────────────────────
import NotificationBell from "../common/NotificationBell";
// If you want to pass real notifications from an API, import your notification
// type too: import NotificationBell, { type Notification } from "../common/NotificationBell";

const THEME_COLORS = [
  "#6C5CE7",
  "#0984E3",
  "#00B894",
  "#F39C12",
  "#141b2e",
  "#b81d4c",
];

interface HeaderProps {
  dynamicHeaderText: string;
  dynamicHeaderIcon?: JSX.Element;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  loading: boolean;
}

const Header: React.FC<HeaderProps> = ({
  dynamicHeaderText,
  dynamicHeaderIcon,
  setLoading,
  loading,
}) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { bgColor, setBgColor } = useBgColor();
  const colorMode = useContext(ColorModeContext);

  const user = useAppSelector((s) => s.auth.user);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);

  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [newPasswordError, setNewPasswordError] = useState<string | null>(null);

  const [logoutApi] = useLogoutMutation();
  if (!user) return null;

  const olmId = user.olmId;
  const roleCode = user.roleCode;

  const handleLogout = async () => {
    try {
      setLoading(true);
      await logoutApi({ olmId: user.olmId }).unwrap();
    } catch {
      console.warn("Logout API failed, continuing local logout");
    } finally {
      sessionStorage.removeItem("access_token");
      localStorage.removeItem("access_token");
      localStorage.removeItem("auth_user");
      localStorage.clear();
      dispatch(logout());
      navigate("/login", { replace: true });
      setLoading(false);
    }
  };

  const validateNewPassword = (password: string) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    return regex.test(password)
      ? null
      : "Password must be strong (8+ chars, uppercase, lowercase, number, symbol)";
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    const error = validateNewPassword(newPassword);
    if (error) {
      setNewPasswordError(error);
      return;
    }
    setLoading(true);
    setLoading(false);
    toast.success("Password changed successfully");
    setIsChangePasswordOpen(false);
  };

  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        p={0.8}
        sx={{
          position: "fixed",
          width: "100%",
          zIndex: 1000,
          color: "white",
          paddingLeft: "80px",
          bgcolor: bgColor,
        }}
      >
        {/* Left — Airtel logo */}
        <Box display="flex" alignItems="center">
          <IconButton sx={{ p: 0 }}>
            <img
              src={AirtelLog}
              alt="Airtel Logo"
              style={{ width: "80px", height: "auto", objectFit: "contain" }}
            />
          </IconButton>
        </Box>

        {/* Right — Bell + user menu */}
        <Box display="flex" alignItems="center" gap="8px">
          <img src={VegayanLogo} alt="Logo" width={100} />

          <NotificationBell onViewAll={() => navigate("/notifications")} />

          {/* User avatar / profile menu */}
          <Box
            onClick={(e) => setAnchorEl(e.currentTarget)}
            sx={{
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              ml: 0.5,
            }}
          >
            <AccountCircleIcon sx={{ fontSize: 30, color: "white" }} />
            <Typography>{olmId}</Typography>
          </Box>

          <Menu
            anchorEl={anchorEl}
            open={openMenu}
            onClose={() => setAnchorEl(null)}
            slotProps={{
              paper: {
                sx: {
                  mt: 1,
                  width: 280,
                  borderRadius: 3,
                  bgcolor:
                    theme.palette.mode === "dark" ? "#1e293b" : "#ffffff",
                  color: theme.palette.mode === "dark" ? "#e5e7eb" : "#111827",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.35)",
                  p: 1,
                },
              },
            }}
          >
            <MenuItem>
              <PersonIcon sx={{ mr: 1 }} />
              {user.employeeName}
            </MenuItem>

            <MenuItem onClick={() => setIsChangePasswordOpen(true)}>
              <LockResetIcon sx={{ mr: 1 }} />
              Change Password
            </MenuItem>

            <MenuItem>
              <PersonIcon sx={{ mr: 1 }} /> {olmId}
            </MenuItem>

            <MenuItem>
              <BadgeIcon sx={{ mr: 1 }} /> Role: {roleCode}
            </MenuItem>

            <MenuItem onClick={handleLogout} disabled={loading}>
              <LogoutIcon sx={{ mr: 1 }} />
              Logout
              {loading && <CircularProgress size={16} sx={{ ml: 2 }} />}
            </MenuItem>

            <Divider sx={{ my: 1 }} />

            {/* Color palette */}
            <Stack direction="row" spacing={1.2} justifyContent="center" py={1}>
              {THEME_COLORS.map((color) => (
                <Tooltip key={color} title="Theme color">
                  <Box
                    sx={{
                      width: 26,
                      height: 26,
                      borderRadius: 1,
                      bgcolor: color,
                      cursor: "pointer",
                      border: "2px solid transparent",
                      transition: "all 0.2s",
                      "&:hover": {
                        transform: "scale(1.1)",
                        borderColor: "#fff",
                      },
                    }}
                    onClick={() => setBgColor(color)}
                  />
                </Tooltip>
              ))}
            </Stack>

            {/* Light / dark toggle */}
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="center"
              spacing={1}
              pb={1}
            >
              <LightModeIcon fontSize="small" />
              <Typography variant="body2">Light</Typography>
              <Switch
                checked={theme.palette.mode === "dark"}
                onChange={colorMode.toggleColorMode}
                size="small"
              />
              <Typography variant="body2">Dark</Typography>
              <DarkModeIcon fontSize="small" />
            </Stack>
          </Menu>
        </Box>
      </Box>

      <ChangePasswordDialog
        open={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
        loading={loading}
        currentPassword={currentPassword}
        newPassword={newPassword}
        confirmPassword={confirmPassword}
        showNewPassword={showNewPassword}
        showConfirmPassword={showConfirmPassword}
        newPasswordError={newPasswordError}
        onCurrentPasswordChange={setCurrentPassword}
        onNewPasswordChange={(value) => {
          setNewPassword(value);
          setNewPasswordError(validateNewPassword(value));
        }}
        onConfirmPasswordChange={setConfirmPassword}
        onToggleNewPassword={() => setShowNewPassword(!showNewPassword)}
        onToggleConfirmPassword={() =>
          setShowConfirmPassword(!showConfirmPassword)
        }
        onSubmit={handleChangePassword}
      />
    </>
  );
};

export default Header;
