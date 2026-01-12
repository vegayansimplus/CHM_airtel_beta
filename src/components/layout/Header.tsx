import React, { useState, type JSX } from "react";
import {
  Box,
  IconButton,
  Typography,
  useTheme,
  Menu,
  MenuItem,
  Divider,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  InputAdornment,
} from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import BadgeIcon from "@mui/icons-material/Badge";
import LockResetIcon from "@mui/icons-material/LockReset";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { tokens } from "../../style/theme";
import { useBgColor } from "../../context/BgColorContext";
import { useNavigate } from "react-router";
import VegayanLogo from "../../assets/images/logo_vega.png";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
// import { logout } from "../../features/auth/slices/auth.slice";
import { useLogoutMutation } from "../../features/auth/api/auth.api";
import { logout } from "../../features/auth/slices/auth.slice";

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
  const { bgColor } = useBgColor();

  const user = useAppSelector((s) => s.auth.user);
  if (!user) return null;

  const username = user.username;
  const userRole = user.roles.join(", ");

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
  //  PRODUCTION LOGOUT

  const handleLogout = async () => {
    try {
      setLoading(true);

      // backend logout (best effort)
      await logoutApi({ olmId: user.username }).unwrap();
    } catch (err) {
      console.warn("Logout API failed, continuing local logout");
    } finally {
      // clear storage
      sessionStorage.removeItem("access_token");
      localStorage.removeItem("auth_user");

      dispatch(logout());
      navigate("/login", { replace: true });

      setLoading(false);
    }
  };
  // const handleLogout = async () => {
  //   try {
  //     setLoading(true);

  //     // clear storage
  //     sessionStorage.removeItem("access_token");
  //     localStorage.removeItem("auth_user");

  //     // clear redux
  // dispatch(logout());

  // navigate("/login", { replace: true });
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const validateNewPassword = (password: string) => {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!regex.test(password)) {
      return "Password must be at least 8 characters, include uppercase, lowercase, number, and special character.";
    }
    return null;
  };

  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewPassword(value);
    setNewPasswordError(validateNewPassword(value));
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password do not match.");
      return;
    }
    const validationError = validateNewPassword(newPassword);
    if (validationError) {
      setNewPasswordError(validationError);
      return;
    }
    setLoading(true);
    // call change password API here
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
          bgcolor: bgColor,
        }}
      >
        <Box display="flex" justifyContent="space-between" width="100%">
          <Box
            sx={{ paddingLeft: "65px", display: "flex", alignItems: "center" }}
          >
            <IconButton sx={{ color: "white" }}>
              {dynamicHeaderIcon || <AccountCircleIcon />}
            </IconButton>
            <Typography variant="h6">{dynamicHeaderText}</Typography>
          </Box>

          <Box display="flex" alignItems="center">
            <img src={VegayanLogo} alt="Logo" width={30} />
            <Box
              onClick={(e) => setAnchorEl(e.currentTarget)}
              sx={{ cursor: "pointer", display: "flex", alignItems: "center" }}
            >
              <AccountCircleIcon sx={{ fontSize: 30, color: "white" }} />
              <Typography>{username}</Typography>
            </Box>

            <Menu
              anchorEl={anchorEl}
              open={openMenu}
              onClose={() => setAnchorEl(null)}
              slotProps={{
                paper: {
                  sx: {
                    mt: 1,
                    bgcolor:
                      theme.palette.mode === "dark"
                        ? colors.primary[700]
                        : "#fff",
                    borderRadius: "10px",
                    width: "250px",
                  },
                },
              }}
            >
              <MenuItem>
                <PersonIcon sx={{ mr: 1 }} /> {username}
              </MenuItem>

              <MenuItem>
                <BadgeIcon sx={{ mr: 1 }} /> Role: {userRole}
              </MenuItem>

              <MenuItem onClick={() => setIsChangePasswordOpen(true)}>
                <LockResetIcon sx={{ mr: 1 }} /> Change Password
              </MenuItem>

              <Divider />

              <MenuItem onClick={handleLogout} disabled={loading}>
                <LogoutIcon sx={{ mr: 1 }} />
                Logout
                {loading && <CircularProgress size={18} sx={{ ml: 2 }} />}
              </MenuItem>
            </Menu>
          </Box>
        </Box>
      </Box>

      {/* Change Password Dialog */}
      <Dialog
        open={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      >
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <TextField
            label="Current Password"
            type="password"
            fullWidth
            margin="normal"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <TextField
            label="New Password"
            type={showNewPassword ? "text" : "password"}
            fullWidth
            margin="normal"
            value={newPassword}
            onChange={handleNewPasswordChange}
            error={!!newPasswordError}
            helperText={newPasswordError}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            label="Confirm Password"
            type={showConfirmPassword ? "text" : "password"}
            fullWidth
            margin="normal"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsChangePasswordOpen(false)}>Cancel</Button>
          <Button onClick={handleChangePassword} disabled={loading}>
            {loading ? <CircularProgress size={18} /> : "Change"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Header;
