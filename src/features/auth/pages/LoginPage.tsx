import React, { useState, useEffect, useRef } from "react";
import {
  TextField,
  Card,
  CardContent,
  Button,
  Box,
  Typography,
  IconButton,
  InputAdornment,
  Backdrop,
  CircularProgress,
  Divider,
} from "@mui/material";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LockIcon from "@mui/icons-material/Lock";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import RefreshIcon from "@mui/icons-material/Refresh";

import Logo from "../../../assets/images/airtel3.png";
import BgImage from "../../../assets/images/bg_image.png";
import BgImage1 from "../../../assets/images/VegayanCHM.png";

import {
  useForceLogoutMutation,
  useLazyGetLoggedUserQuery,
  useLoginMutation,
} from "../api/auth.api";
import { useAppDispatch } from "../../../app/hooks";
import { setToken, setUser } from "../slices/auth.slice";
// import type { AuthUser } from "../types/auth.types";
import { authStorage } from "../../../app/store/auth.storage";
import { normalizeRBAC } from "../utils/rbacNormalizer";
import type { AuthUser } from "../types/auth.types";

const LoginPage: React.FC = () => {
  const [olmId, setOlmId] = useState("");
  const [password, setPassword] = useState("");
  const [captcha, setCaptcha] = useState(generateCaptcha());
  const [captchaInput, setCaptchaInput] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isAlreadyLogged, setIsAlreadyLogged] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [login, { isLoading }] = useLoginMutation();
  const [fetchUser] = useLazyGetLoggedUserQuery();
  const [forceLogout] = useForceLogoutMutation();

  useEffect(() => {
    renderCaptcha();
  }, [captcha]);

  function generateCaptcha(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    return Array.from(
      { length: 6 },
      () => chars[Math.floor(Math.random() * chars.length)],
    ).join("");
  }

  function renderCaptcha() {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, 150, 35);
    ctx.fillStyle = "#f2f2f2";
    ctx.fillRect(0, 0, 150, 35);
    ctx.font = "bold 22px Arial";
    ctx.fillStyle = "#000";
    ctx.textAlign = "center";
    ctx.fillText(captcha, 75, 25);
  }

  const handleLogin = async () => {
    if (captcha !== captchaInput.toUpperCase()) {
      setError("Captcha does not match");
      refreshCaptcha();
      return;
    }

    const response = await login({ olmId, password });

    if ("error" in response) {
      const message = (response.error as any)?.data?.message || "Login failed";

      if (message.toLowerCase().includes("already")) {
        setIsAlreadyLogged(true);
        toast.info("User already logged in on another device");
        return;
      }

      toast.error(message);
      return;
    }

    const res = response.data;
    if (!res?.accessToken) {
      toast.error("JWT missing");
      return;
    }

    dispatch(setToken(res.accessToken));
    sessionStorage.setItem("access_token", res.accessToken);

    const userRes = await fetchUser().unwrap();
    // const apiUser = userRes[0];
    if (!userRes) {
      toast.error("User data not received");
      return;
    }
    const apiUser = userRes;

    const user: AuthUser = {
      olmId: apiUser.olmId,
      employeeName: apiUser.employeeName,
      roleCode: apiUser.roleCode,
      userId: apiUser.userId,
      modules: normalizeRBAC(apiUser),
      authenticated: true,
    };

    dispatch(setUser(user));

    authStorage.setToken(res.accessToken);
    authStorage.setUser({
      olmId: user.olmId,
      employeeName: user.employeeName,
      roleCode: user.roleCode,
      userId: user.userId,
      modules: user.modules,
    });

    navigate("/home", { replace: true });
  };

  const handleForceLogout = async () => {
    try {
      await forceLogout({ olmId }).unwrap();
      toast.success("Previous session terminated");
      setIsAlreadyLogged(false);
      setPassword("");
      setCaptchaInput("");
    } catch {
      toast.error("Force logout failed");
    }
  };

  const refreshCaptcha = () => {
    setCaptcha(generateCaptcha());
    setCaptchaInput("");
  };

  return (
    <Box sx={{ display: "flex", height: "100vh", bgcolor: "#020f24" }}>
      {/* <Backdrop open={isLoading}>
        <CircularProgress />
      </Backdrop> */}

      {/* LEFT IMAGE */}
      <Box
        sx={{
          width: "65%",
          height: "100vh",
          backgroundImage: `url(${BgImage1})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          borderTopRightRadius: 400,
        }}
      />

      {/* RIGHT PANEL */}
      <Box
        sx={{
          width: "35%",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundImage: `url(${BgImage})`,
          borderTopLeftRadius: 500,
          px: 2,
        }}
      >
        <Card
          sx={{
            width: 400,
            borderRadius: 2,
            boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
          }}
        >
          <CardContent sx={{ p: 4 }}>
            {/* HEADER */}
            <Box textAlign="center" mb={3}>
              <img src={Logo} width={120} />
              <Typography variant="h6" fontWeight={600} mt={2}>
                Secure Login
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sign in to continue
              </Typography>
            </Box>

            <Divider sx={{ mb: 3 }} />

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleLogin();
              }}
              style={{ width: "100%" }}
            >
              <TextField
                label="OLMID"
                fullWidth
                margin="dense"
                value={olmId}
                onChange={(e) => setOlmId(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AccountCircleIcon />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                label="Password"
                type={showPassword ? "text" : "password"}
                fullWidth
                margin="dense"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <IconButton onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  ),
                }}
              />

              {/* CAPTCHA */}
              <Box mt={3}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                  mb={1}
                >
                  Security Check
                </Typography>

                <Box display="flex" alignItems="center" gap={1}>
                  <canvas ref={canvasRef} width={150} height={35} />
                  <IconButton size="small" onClick={refreshCaptcha}>
                    <RefreshIcon />
                  </IconButton>
                </Box>

                <TextField
                  label="Enter CAPTCHA"
                  fullWidth
                  margin="dense"
                  value={captchaInput}
                  onChange={(e) =>
                    setCaptchaInput(e.target.value.toUpperCase())
                  }
                />
              </Box>

              {error && (
                <Typography color="error" variant="body2" mt={1}>
                  {error}
                </Typography>
              )}

              {!isAlreadyLogged ? (
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, py: 1 }}
                  disabled={isLoading}
                >
                  Login
                </Button>
              ) : (
                <Button
                  fullWidth
                  color="secondary"
                  variant="contained"
                  sx={{ mt: 3, py: 1 }}
                  onClick={handleForceLogout}
                >
                  Force Logout
                </Button>
              )}
            </form>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default LoginPage;
