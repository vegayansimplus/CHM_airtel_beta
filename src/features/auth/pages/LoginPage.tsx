import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  CircularProgress,
  useTheme,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Refresh,
  Login as LoginIcon,
  PersonOutline,
  LockOutlined,
  ShieldOutlined,
  ExitToApp,
  ErrorOutline,
  TrendingUp,
  Speed,
  VerifiedUser,
} from "@mui/icons-material";

import {
  useForceLogoutMutation,
  useLazyGetLoggedUserQuery,
  useLoginMutation,
} from "../api/auth.api";
import { useAppDispatch } from "../../../app/hooks";
import { setToken, setUser } from "../slices/auth.slice";
import { authStorage } from "../../../app/store/auth.storage";
import { normalizeRBAC } from "../utils/rbacNormalizer";
import type { AuthUser } from "../types/auth.types";

const CAPTCHA_DISABLED = true;

// ─── CAPTCHA HELPERS ─────────────────────────────────────────────────────────
function generateCaptcha(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return Array.from(
    { length: 6 },
    () => chars[Math.floor(Math.random() * chars.length)],
  ).join("");
}

function renderCaptcha(canvas: HTMLCanvasElement | null, code: string) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const W = canvas.width,
    H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  ctx.fillStyle = "rgba(24,95,165,0.06)";
  ctx.beginPath();
  (ctx as any).roundRect?.(0, 0, W, H, 8);
  ctx.fill();

  ctx.strokeStyle = "rgba(24,95,165,0.18)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(Math.random() * W, 0);
    ctx.lineTo(Math.random() * W, H);
    ctx.stroke();
  }

  const cols = ["#185FA5", "#378ADD", "#0C447C", "#5BA3E0", "#185FA5", "#378ADD"];
  const cw = W / code.length;
  code.split("").forEach((ch, i) => {
    ctx.save();
    ctx.translate(cw * i + cw / 2, H / 2 + 1);
    ctx.rotate((Math.random() - 0.5) * 0.28);
    ctx.font = `bold ${16 + Math.random() * 3}px 'Courier New', monospace`;
    ctx.fillStyle = cols[i % cols.length];
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "rgba(24,95,165,0.5)";
    ctx.shadowBlur = 5;
    ctx.fillText(ch, 0, 0);
    ctx.restore();
  });

  for (let y = 0; y < H; y += 3) {
    ctx.fillStyle = "rgba(0,0,0,0.05)";
    ctx.fillRect(0, y, W, 1);
  }
}

// ─── GLOBAL CSS ───────────────────────────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

  @keyframes lp-fadeUp   { from{opacity:0;transform:translateY(20px);} to{opacity:1;transform:translateY(0);} }
  @keyframes lp-slideL   { from{opacity:0;transform:translateX(-30px);} to{opacity:1;transform:translateX(0);} }
  @keyframes lp-slideR   { from{opacity:0;transform:translateX(30px);}  to{opacity:1;transform:translateX(0);} }
  @keyframes lp-pulse    { 0%,100%{opacity:1;transform:scale(1);} 50%{opacity:.3;transform:scale(.65);} }
  @keyframes lp-orb1     { from{transform:translate(0,0) scale(1);} to{transform:translate(30px,20px) scale(1.08);} }
  @keyframes lp-orb2     { from{transform:translate(0,0) scale(1);} to{transform:translate(-22px,28px) scale(0.94);} }
  @keyframes lp-scan     { from{transform:translateY(-100%);} to{transform:translateY(100vh);} }
  @keyframes lp-shimmer  { from{background-position:200% 0;} to{background-position:-200% 0;} }
  @keyframes lp-grid     { from{opacity:0;} to{opacity:1;} }

  .lp-field .MuiOutlinedInput-root {
    background: rgba(24,95,165,0.04);
    border-radius: 8px !important;
    color: #E8EDF5;
    font-size: 13.5px;
    font-family: 'DM Sans', sans-serif;
    transition: box-shadow 0.2s, background 0.2s;
  }
  .lp-field .MuiOutlinedInput-root:hover {
    background: rgba(24,95,165,0.07);
  }
  .lp-field .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline {
    border-color: rgba(55,138,221,0.5) !important;
  }
  .lp-field .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline {
    border-color: #185FA5 !important;
    border-width: 1.5px !important;
  }
  .lp-field .MuiOutlinedInput-root.Mui-focused {
    background: rgba(24,95,165,0.08);
    box-shadow: 0 0 0 3px rgba(24,95,165,0.15);
  }
  .lp-field .MuiOutlinedInput-notchedOutline { border-color: rgba(255,255,255,0.08) !important; }
  .lp-field .MuiInputLabel-root            { color: rgba(232,237,245,0.4); font-size: 13px; font-family: 'DM Sans', sans-serif; }
  .lp-field .MuiInputLabel-root.Mui-focused { color: #378ADD; }
  .lp-field .MuiInputBase-input            { color: #E8EDF5; font-family: 'DM Sans', sans-serif; }
  .lp-field .MuiInputBase-input::placeholder { color: rgba(232,237,245,0.22); }
  .lp-field .MuiSvgIcon-root              { color: rgba(232,237,245,0.3) !important; }
  .lp-field .MuiInputAdornment-root .MuiIconButton-root { color: rgba(232,237,245,0.35); }

  .lp-submit:hover { transform: translateY(-1px) !important; box-shadow: 0 10px 28px rgba(24,95,165,0.55) !important; }
  .lp-submit:active { transform: translateY(0px) !important; }
  .lp-force:hover  { transform: translateY(-1px) !important; box-shadow: 0 10px 28px rgba(226,75,74,0.45) !important; }

  html, body, #root { height: 100%; overflow: hidden; }
`;

function injectGlobalCss() {
  if (document.querySelector("[data-lp-css]")) return;
  const s = document.createElement("style");
  s.dataset.lpCss = "1";
  s.textContent = GLOBAL_CSS;
  document.head.appendChild(s);
}

// ─── BRAND LOGO ──────────────────────────────────────────────────────────────
const BrandMark: React.FC<{ size?: number }> = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <rect width="32" height="32" rx="8" fill="rgba(24,95,165,0.18)" />
    <rect x="6" y="6" width="8" height="8" rx="2" fill="#185FA5" />
    <rect x="18" y="6" width="8" height="8" rx="2" fill="#378ADD" fillOpacity="0.7" />
    <rect x="6" y="18" width="8" height="8" rx="2" fill="#378ADD" fillOpacity="0.5" />
    <rect x="18" y="18" width="8" height="8" rx="2" fill="#185FA5" fillOpacity="0.85" />
  </svg>
);

// ─── STAT CARD ────────────────────────────────────────────────────────────────
const StatCard: React.FC<{ icon: React.ReactNode; value: string; label: string; delay: number }> = ({
  icon, value, label, delay
}) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 1.5,
      bgcolor: "rgba(24,95,165,0.08)",
      border: "1px solid rgba(24,95,165,0.18)",
      borderRadius: "10px",
      px: 1.8,
      py: 1.2,
      flex: 1,
      animation: `lp-fadeUp 0.6s ${delay}s both`,
      backdropFilter: "blur(8px)",
    }}
  >
    <Box
      sx={{
        width: 32,
        height: 32,
        borderRadius: "8px",
        bgcolor: "rgba(24,95,165,0.2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#378ADD",
        flexShrink: 0,
      }}
    >
      {icon}
    </Box>
    <Box>
      <Typography sx={{ fontSize: "15px", fontWeight: 700, color: "#E8EDF5", lineHeight: 1, fontFamily: "'DM Sans', sans-serif" }}>
        {value}
      </Typography>
      <Typography sx={{ fontSize: "10px", color: "rgba(232,237,245,0.4)", mt: 0.2, fontFamily: "'DM Sans', sans-serif" }}>
        {label}
      </Typography>
    </Box>
  </Box>
);

// ─── FEATURE ROW ─────────────────────────────────────────────────────────────
const FeatureRow: React.FC<{ text: string; delay: number }> = ({ text, delay }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 1.2,
      animation: `lp-fadeUp 0.6s ${delay}s both`,
    }}
  >
    <Box
      sx={{
        width: 5,
        height: 5,
        borderRadius: "50%",
        bgcolor: "#185FA5",
        boxShadow: "0 0 6px rgba(24,95,165,0.8)",
        flexShrink: 0,
      }}
    />
    <Typography sx={{ fontSize: "12.5px", color: "rgba(232,237,245,0.5)", fontFamily: "'DM Sans', sans-serif" }}>
      {text}
    </Typography>
  </Box>
);

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
const LoginPage: React.FC = () => {
  const [olmId, setOlmId] = useState("");
  const [password, setPassword] = useState("");
  const [captcha, setCaptcha] = useState(generateCaptcha());
  const [captchaInput, setCaptchaInput] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isAlreadyLogged, setIsAlreadyLogged] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [login, { isLoading }] = useLoginMutation();
  const [fetchUser] = useLazyGetLoggedUserQuery();
  const [forceLogout] = useForceLogoutMutation();

  useEffect(() => { injectGlobalCss(); }, []);

  useEffect(() => {
    if (!CAPTCHA_DISABLED) renderCaptcha(canvasRef.current, captcha);
  }, [captcha]);

  const handleLogin = async () => {
    if (!CAPTCHA_DISABLED && captcha !== captchaInput.toUpperCase()) {
      setError("Captcha does not match");
      refreshCaptcha();
      return;
    }

    setBtnLoading(true);
    const response = await login({ olmId, password });
    setBtnLoading(false);

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
    if (!res?.accessToken) { toast.error("JWT missing"); return; }

    dispatch(setToken(res.accessToken));
    sessionStorage.setItem("access_token", res.accessToken);

    const userRes = await fetchUser().unwrap();
    if (!userRes) { toast.error("User data not received"); return; }

    const user: AuthUser = {
      olmId: userRes.olmId,
      employeeName: userRes.employeeName,
      roleCode: userRes.roleCode,
      userId: userRes.userId,
      modules: normalizeRBAC(userRes),
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

  const refreshCaptcha = () => { setCaptcha(generateCaptcha()); setCaptchaInput(""); };
  const loading = isLoading || btnLoading;

  return (
    <Box
      sx={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        background: "#0C1117",
        display: "flex",
      }}
    >
      {/* ── BACKGROUND ─────────────────────────────────────────────────── */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          background: `
            radial-gradient(ellipse 65% 65% at 12% 50%, rgba(24,95,165,0.10) 0%, transparent 70%),
            radial-gradient(ellipse 50% 55% at 88% 18%, rgba(55,138,221,0.08) 0%, transparent 65%),
            radial-gradient(ellipse 35% 45% at 55% 90%, rgba(12,68,124,0.07) 0%, transparent 60%),
            linear-gradient(160deg, #0C1117 0%, #0E1520 55%, #0A0F1A 100%)
          `,
        }}
      />

      {/* Dot grid */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          backgroundImage: `radial-gradient(rgba(55,138,221,0.13) 1px, transparent 1px)`,
          backgroundSize: "28px 28px",
          maskImage: "radial-gradient(ellipse 85% 85% at 50% 50%, black 30%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 85% 85% at 50% 50%, black 30%, transparent 100%)",
          animation: "lp-grid 1.2s 0.1s both",
        }}
      />

      {/* Scan line */}
      <Box
        sx={{
          position: "absolute",
          left: 0,
          right: 0,
          height: "1px",
          background: "linear-gradient(90deg, transparent, rgba(55,138,221,0.25) 40%, rgba(24,95,165,0.4) 60%, transparent)",
          zIndex: 0,
          pointerEvents: "none",
          animation: "lp-scan 8s linear infinite",
          animationDelay: "2s",
        }}
      />

      {/* Ambient orbs */}
      <Box
        sx={{
          position: "absolute",
          width: 420,
          height: 420,
          borderRadius: "50%",
          top: -100,
          left: -130,
          zIndex: 0,
          pointerEvents: "none",
          filter: "blur(90px)",
          opacity: 0.35,
          background: "radial-gradient(circle, rgba(24,95,165,0.28), transparent 70%)",
          animation: "lp-orb1 14s ease-in-out infinite alternate",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          width: 280,
          height: 280,
          borderRadius: "50%",
          bottom: -30,
          right: "28%",
          zIndex: 0,
          pointerEvents: "none",
          filter: "blur(80px)",
          opacity: 0.28,
          background: "radial-gradient(circle, rgba(55,138,221,0.22), transparent 70%)",
          animation: "lp-orb2 18s ease-in-out infinite alternate",
        }}
      />

      {/* ── TWO-COLUMN GRID ─────────────────────────────────────────────── */}
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          height: "100%",
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 440px" },
          alignItems: "center",
        }}
      >
        {/* ══ LEFT — BRANDING PANEL ══════════════════════════════════════ */}
        <Box
          sx={{
            display: { xs: "none", md: "flex" },
            flexDirection: "column",
            justifyContent: "center",
            height: "100%",
            px: { md: 8, lg: 10 },
            animation: "lp-slideL 0.9s cubic-bezier(0.22,1,0.36,1) both",
          }}
        >
          {/* Brand */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.4, mb: 7, animation: "lp-fadeUp 0.6s 0.05s both" }}>
            <BrandMark size={30} />
            <Box>
              <Typography
                sx={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "14px",
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                  color: "rgba(232,237,245,0.5)",
                  textTransform: "uppercase",
                  lineHeight: 1,
                  mb: 0.1,
                }}
              >
                Vegayan
              </Typography>
              <Typography
                sx={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "11px",
                  color: "rgba(232,237,245,0.28)",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                Enterprise Suite
              </Typography>
            </Box>
          </Box>

          {/* Status pill */}
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.9,
              bgcolor: "rgba(24,95,165,0.1)",
              border: "1px solid rgba(24,95,165,0.25)",
              borderRadius: "100px",
              px: 1.6,
              py: 0.6,
              width: "fit-content",
              mb: 2.5,
              animation: "lp-fadeUp 0.6s 0.12s both",
            }}
          >
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                bgcolor: "#378ADD",
                boxShadow: "0 0 8px rgba(55,138,221,0.9)",
                animation: "lp-pulse 2.2s ease-in-out infinite",
              }}
            />
            <Typography
              sx={{
                fontSize: "10px",
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#378ADD",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              All Systems Operational
            </Typography>
          </Box>

          {/* Hero headline */}
          <Typography
            sx={{
              fontSize: { md: "40px", lg: "52px" },
              fontWeight: 700,
              lineHeight: 1.06,
              letterSpacing: "-1.8px",
              color: "#E8EDF5",
              mb: 2,
              animation: "lp-fadeUp 0.6s 0.18s both",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Change
            <Box
              component="span"
              sx={{
                display: "block",
                background: "linear-gradient(135deg, #185FA5 0%, #378ADD 50%, #85B7EB 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Management
            </Box>
            <Box component="span" sx={{ color: "rgba(232,237,245,0.7)" }}>System</Box>
          </Typography>

          <Typography
            sx={{
              fontSize: "13px",
              color: "rgba(232,237,245,0.38)",
              lineHeight: 1.8,
              maxWidth: 380,
              mb: 4,
              animation: "lp-fadeUp 0.6s 0.24s both",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Streamline operational workflows, approvals, and change requests
            across enterprise infrastructure — governed, auditable, and secure.
          </Typography>

          {/* Stat cards */}
          {/* <Box sx={{ display: "flex", gap: 1.2, mb: 4, animation: "lp-fadeUp 0.6s 0.30s both" }}>
            <StatCard icon={<TrendingUp sx={{ fontSize: 16 }} />} value="12K+" label="Changes tracked" delay={0.32} />
            <StatCard icon={<Speed sx={{ fontSize: 16 }} />} value="99.9%" label="Uptime SLA" delay={0.36} />
            <StatCard icon={<VerifiedUser sx={{ fontSize: 16 }} />} value="ISO 27001" label="Certified" delay={0.40} />
          </Box> */}

          {/* Feature list */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.3 }}>
            <FeatureRow text="Real-time change request tracking with automated approvals" delay={0.44} />
            <FeatureRow text="Role-based access control with fine-grained permissions" delay={0.48} />
            <FeatureRow text="Full audit trail, impact scoring, and analytics dashboard" delay={0.52} />
            <FeatureRow text="Multi-factor authentication and 256-bit SSL encryption" delay={0.56} />
          </Box>
        </Box>

        {/* ══ RIGHT — LOGIN CARD ═════════════════════════════════════════ */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            px: { xs: 1.5, md: 2 },
          }}
        >
          <Box
            sx={{
              width: "100%",
              maxWidth: 400,
              position: "relative",
              animation: "lp-slideR 0.9s cubic-bezier(0.22,1,0.36,1) 0.1s both",
            }}
          >
            {/* Outer glow ring */}
            <Box
              sx={{
                position: "absolute",
                inset: -1,
                borderRadius: "18px",
                background: "linear-gradient(135deg, rgba(24,95,165,0.3) 0%, rgba(55,138,221,0.1) 50%, rgba(24,95,165,0.15) 100%)",
                zIndex: -1,
                filter: "blur(1px)",
              }}
            />

            {/* Card */}
            <Box
              sx={{
                bgcolor: "rgba(13,21,37,0.92)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                border: "1px solid rgba(55,138,221,0.12)",
                borderRadius: "16px",
                p: { xs: "24px 20px", md: "36px 32px" },
                boxShadow: "0 32px 72px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.04)",
                overflow: "hidden",
                position: "relative",
              }}
            >
              {/* Top accent bar */}
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "2px",
                  background: "linear-gradient(90deg, transparent 0%, #185FA5 30%, #378ADD 60%, transparent 100%)",
                }}
              />

              {/* Corner decoration */}
              <Box
                sx={{
                  position: "absolute",
                  top: -40,
                  right: -40,
                  width: 120,
                  height: 120,
                  borderRadius: "50%",
                  background: "radial-gradient(circle, rgba(24,95,165,0.12), transparent 70%)",
                  pointerEvents: "none",
                }}
              />

              {/* ── CARD HEADER ── */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, mb: 3.5 }}>
                <BrandMark size={22} />
                <Box>
                  <Typography sx={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", fontWeight: 700, color: "rgba(232,237,245,0.5)", letterSpacing: "0.05em", textTransform: "uppercase", lineHeight: 1 }}>
                    Vegayan CHM
                  </Typography>
                </Box>
              </Box>

              <Typography
                sx={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "21px",
                  fontWeight: 700,
                  letterSpacing: "-0.5px",
                  color: "#E8EDF5",
                  mb: 0.5,
                  lineHeight: 1.2,
                }}
              >
                Welcome back
              </Typography>
              <Typography
                sx={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "12.5px",
                  color: "rgba(232,237,245,0.35)",
                  mb: 3.5,
                }}
              >
                Sign in to your Change Management Portal
              </Typography>

              {/* ── FORM ── */}
              <Box
                component="form"
                onSubmit={(e) => { e.preventDefault(); handleLogin(); }}
              >
                {/* OLM ID */}
                <TextField
                  className="lp-field"
                  label="OLM ID"
                  fullWidth
                  size="small"
                  value={olmId}
                  onChange={(e) => setOlmId(e.target.value)}
                  autoComplete="username"
                  sx={{ mb: 1.8 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonOutline sx={{ fontSize: 16 }} />
                      </InputAdornment>
                    ),
                  }}
                />

                {/* Password */}
                <TextField
                  className="lp-field"
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  fullWidth
                  size="small"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  sx={{ mb: 2.2 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlined sx={{ fontSize: 16 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          edge="end"
                          onClick={() => setShowPassword(!showPassword)}
                          sx={{ color: "rgba(232,237,245,0.35)", p: 0.5 }}
                        >
                          {showPassword
                            ? <VisibilityOff sx={{ fontSize: 15 }} />
                            : <Visibility sx={{ fontSize: 15 }} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                {/* CAPTCHA */}
                {CAPTCHA_DISABLED ? (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      bgcolor: "rgba(24,95,165,0.06)",
                      border: "1px dashed rgba(24,95,165,0.25)",
                      borderRadius: "8px",
                      px: 1.4,
                      py: 0.85,
                      mb: 2.2,
                    }}
                  >
                    <ShieldOutlined sx={{ fontSize: 13, color: "#378ADD" }} />
                    <Typography
                      sx={{
                        fontFamily: "'DM Mono', monospace",
                        fontSize: "10px",
                        color: "#378ADD",
                        letterSpacing: "0.04em",
                      }}
                    >
                      CAPTCHA bypassed — development mode
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ mb: 2.2 }}>
                    <Typography
                      sx={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: "10px",
                        fontWeight: 600,
                        letterSpacing: "0.07em",
                        textTransform: "uppercase",
                        color: "rgba(232,237,245,0.35)",
                        mb: 1,
                      }}
                    >
                      Security Verification
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, alignItems: "center", mb: 1 }}>
                      <canvas
                        ref={canvasRef}
                        width={168}
                        height={36}
                        style={{
                          borderRadius: 8,
                          border: "1px solid rgba(55,138,221,0.15)",
                          display: "block",
                        }}
                      />
                      <IconButton
                        size="small"
                        onClick={refreshCaptcha}
                        aria-label="Refresh CAPTCHA"
                        sx={{
                          bgcolor: "rgba(24,95,165,0.08)",
                          border: "1px solid rgba(55,138,221,0.15)",
                          borderRadius: "8px",
                          width: 34,
                          height: 34,
                          color: "rgba(232,237,245,0.4)",
                          "&:hover": { bgcolor: "rgba(24,95,165,0.16)" },
                        }}
                      >
                        <Refresh sx={{ fontSize: 15 }} />
                      </IconButton>
                    </Box>
                    <TextField
                      className="lp-field"
                      label="Enter CAPTCHA"
                      fullWidth
                      size="small"
                      value={captchaInput}
                      onChange={(e) => setCaptchaInput(e.target.value.toUpperCase())}
                      autoComplete="off"
                      inputProps={{
                        maxLength: 6,
                        style: { letterSpacing: "0.16em", fontWeight: 600, fontFamily: "'DM Mono', monospace" },
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <ShieldOutlined sx={{ fontSize: 15 }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>
                )}

                {/* Error */}
                {error && (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.9,
                      mb: 1.8,
                      mt: -0.8,
                      bgcolor: "rgba(226,75,74,0.08)",
                      border: "1px solid rgba(226,75,74,0.22)",
                      borderRadius: "8px",
                      px: 1.2,
                      py: 0.75,
                    }}
                  >
                    <ErrorOutline sx={{ fontSize: 13, color: "#F09595" }} />
                    <Typography sx={{ fontFamily: "'DM Sans', sans-serif", color: "#F09595", fontSize: "11.5px" }}>
                      {error}
                    </Typography>
                  </Box>
                )}

                {/* Primary / Force CTA */}
                {!isAlreadyLogged ? (
                  <Button
                    type="submit"
                    fullWidth
                    disabled={loading}
                    className="lp-submit"
                    startIcon={
                      loading
                        ? <CircularProgress size={13} sx={{ color: "#fff" }} />
                        : <LoginIcon sx={{ fontSize: "16px !important" }} />
                    }
                    sx={{
                      height: 43,
                      borderRadius: "9px",
                      background: "linear-gradient(135deg, #185FA5 0%, #0C447C 100%)",
                      color: "#fff",
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "13.5px",
                      fontWeight: 600,
                      letterSpacing: "0.2px",
                      textTransform: "none",
                      boxShadow: "0 4px 16px rgba(24,95,165,0.35)",
                      transition: "transform 0.15s, box-shadow 0.18s",
                      "&:hover": {
                        background: "linear-gradient(135deg, #1d71c2 0%, #185FA5 100%)",
                      },
                      "&.Mui-disabled": { opacity: 0.55, color: "#fff" },
                    }}
                  >
                    {loading ? "Authenticating…" : "Sign In"}
                  </Button>
                ) : (
                  <>
                    {/* Already logged in warning */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 1,
                        mb: 1.8,
                        bgcolor: "rgba(239,159,39,0.07)",
                        border: "1px solid rgba(239,159,39,0.2)",
                        borderRadius: "8px",
                        px: 1.4,
                        py: 1,
                      }}
                    >
                      <ErrorOutline sx={{ fontSize: 14, color: "#FAC775", mt: 0.1 }} />
                      <Typography sx={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11.5px", color: "rgba(250,199,117,0.8)", lineHeight: 1.5 }}>
                        This account is active on another device. Force logout to continue here.
                      </Typography>
                    </Box>
                    <Button
                      fullWidth
                      className="lp-force"
                      onClick={handleForceLogout}
                      startIcon={<ExitToApp sx={{ fontSize: "16px !important" }} />}
                      sx={{
                        height: 43,
                        borderRadius: "9px",
                        background: "linear-gradient(135deg, #C0392B 0%, #96281B 100%)",
                        color: "#fff",
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: "13px",
                        fontWeight: 600,
                        textTransform: "none",
                        letterSpacing: "0.2px",
                        boxShadow: "0 4px 16px rgba(192,57,43,0.3)",
                        transition: "transform 0.15s, box-shadow 0.18s",
                        "&:hover": { background: "linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)" },
                      }}
                    >
                      Force Logout Previous Session
                    </Button>
                  </>
                )}
              </Box>

              {/* ── FOOTER ── */}
              <Box
                sx={{
                  mt: 2.8,
                  pt: 2,
                  borderTop: "1px solid rgba(255,255,255,0.05)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box sx={{ display: "flex", gap: 1.8 }}>
                  {["Forgot Password?", "Need Help?"].map((label) => (
                    <Typography
                      key={label}
                      component="a"
                      href="#"
                      sx={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: "11px",
                        color: "rgba(55,138,221,0.7)",
                        textDecoration: "none",
                        fontWeight: 500,
                        transition: "color 0.15s",
                        "&:hover": { color: "#378ADD" },
                      }}
                    >
                      {label}
                    </Typography>
                  ))}
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
                  <ShieldOutlined sx={{ fontSize: 10, color: "rgba(232,237,245,0.2)" }} />
                  <Typography
                    sx={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: "9.5px",
                      color: "rgba(232,237,245,0.2)",
                      letterSpacing: "0.02em",
                    }}
                  >
                    SSL · {new Date().getFullYear()}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default LoginPage;
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

// import React, { useState, useEffect, useRef } from "react";
// import {
//   TextField,
//   Card,
//   CardContent,
//   Button,
//   Box,
//   Typography,
//   IconButton,
//   InputAdornment,
//   Backdrop,
//   CircularProgress,
//   Divider,
// } from "@mui/material";
// import { useNavigate } from "react-router";
// import { toast } from "react-toastify";
// import AccountCircleIcon from "@mui/icons-material/AccountCircle";
// import LockIcon from "@mui/icons-material/Lock";
// import Visibility from "@mui/icons-material/Visibility";
// import VisibilityOff from "@mui/icons-material/VisibilityOff";
// import RefreshIcon from "@mui/icons-material/Refresh";

// import Logo from "../../../assets/images/airtel3.png";
// import BgImage from "../../../assets/images/bg_image.png";
// import BgImage1 from "../../../assets/images/VegayanCHM.png";

// import {
//   useForceLogoutMutation,
//   useLazyGetLoggedUserQuery,
//   useLoginMutation,
// } from "../api/auth.api";
// import { useAppDispatch } from "../../../app/hooks";
// import { setToken, setUser } from "../slices/auth.slice";
// // import type { AuthUser } from "../types/auth.types";
// import { authStorage } from "../../../app/store/auth.storage";
// import { normalizeRBAC } from "../utils/rbacNormalizer";
// import type { AuthUser } from "../types/auth.types";

// const LoginPage: React.FC = () => {
//   const [olmId, setOlmId] = useState("");
//   const [password, setPassword] = useState("");
//   const [captcha, setCaptcha] = useState(generateCaptcha());
//   const [captchaInput, setCaptchaInput] = useState("");
//   const [error, setError] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [isAlreadyLogged, setIsAlreadyLogged] = useState(false);

//   const canvasRef = useRef<HTMLCanvasElement>(null);
//   const navigate = useNavigate();
//   const dispatch = useAppDispatch();

//   const [login, { isLoading }] = useLoginMutation();
//   const [fetchUser] = useLazyGetLoggedUserQuery();
//   const [forceLogout] = useForceLogoutMutation();

//   useEffect(() => {
//     renderCaptcha();
//   }, [captcha]);

//   function generateCaptcha(): string {
//     const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
//     return Array.from(
//       { length: 6 },
//       () => chars[Math.floor(Math.random() * chars.length)],
//     ).join("");
//   }

//   function renderCaptcha() {
//     const ctx = canvasRef.current?.getContext("2d");
//     if (!ctx) return;
//     ctx.clearRect(0, 0, 150, 35);
//     ctx.fillStyle = "#f2f2f2";
//     ctx.fillRect(0, 0, 150, 35);
//     ctx.font = "bold 22px Arial";
//     ctx.fillStyle = "#000";
//     ctx.textAlign = "center";
//     ctx.fillText(captcha, 75, 25);
//   }

//   const handleLogin = async () => {
//     if (captcha !== captchaInput.toUpperCase()) {
//       setError("Captcha does not match");
//       refreshCaptcha();
//       return;
//     }

//     const response = await login({ olmId, password });

//     if ("error" in response) {
//       const message = (response.error as any)?.data?.message || "Login failed";

//       if (message.toLowerCase().includes("already")) {
//         setIsAlreadyLogged(true);
//         toast.info("User already logged in on another device");
//         return;
//       }

//       toast.error(message);
//       return;
//     }

//     const res = response.data;
//     if (!res?.accessToken) {
//       toast.error("JWT missing");
//       return;
//     }

//     dispatch(setToken(res.accessToken));
//     sessionStorage.setItem("access_token", res.accessToken);

//     const userRes = await fetchUser().unwrap();
//     // const apiUser = userRes[0];
//     if (!userRes) {
//       toast.error("User data not received");
//       return;
//     }
//     const apiUser = userRes;

//     const user: AuthUser = {
//       olmId: apiUser.olmId,
//       employeeName: apiUser.employeeName,
//       roleCode: apiUser.roleCode,
//       userId: apiUser.userId,
//       modules: normalizeRBAC(apiUser),
//       authenticated: true,
//     };

//     dispatch(setUser(user));

//     authStorage.setToken(res.accessToken);
//     authStorage.setUser({
//       olmId: user.olmId,
//       employeeName: user.employeeName,
//       roleCode: user.roleCode,
//       userId: user.userId,
//       modules: user.modules,
//     });

//     navigate("/home", { replace: true });
//   };

//   const handleForceLogout = async () => {
//     try {
//       await forceLogout({ olmId }).unwrap();
//       toast.success("Previous session terminated");
//       setIsAlreadyLogged(false);
//       setPassword("");
//       setCaptchaInput("");
//     } catch {
//       toast.error("Force logout failed");
//     }
//   };

//   const refreshCaptcha = () => {
//     setCaptcha(generateCaptcha());
//     setCaptchaInput("");
//   };

//   return (
//     <Box sx={{ display: "flex", height: "100vh", bgcolor: "#020f24" }}>
//       {/* <Backdrop open={isLoading}>
//         <CircularProgress />
//       </Backdrop> */}

//       {/* LEFT IMAGE */}
//       <Box
//         sx={{
//           width: "65%",
//           height: "100vh",
//           backgroundImage: `url(${BgImage1})`,
//           backgroundSize: "cover",
//           backgroundPosition: "center",
//           borderTopRightRadius: 400,
//         }}
//       />

//       {/* RIGHT PANEL */}
//       <Box
//         sx={{
//           width: "35%",
//           height: "100vh",
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//           backgroundImage: `url(${BgImage})`,
//           borderTopLeftRadius: 500,
//           px: 2,
//         }}
//       >
//         <Card
//           sx={{
//             width: 400,
//             borderRadius: 2,
//             boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
//           }}
//         >
//           <CardContent sx={{ p: 4 }}>
//             {/* HEADER */}
//             <Box textAlign="center" mb={3}>
//               <img src={Logo} width={120} />
//               <Typography variant="h6" fontWeight={600} mt={2}>
//                 Secure Login
//               </Typography>
//               <Typography variant="body2" color="text.secondary">
//                 Sign in to continue
//               </Typography>
//             </Box>

//             <Divider sx={{ mb: 3 }} />

//             <form
//               onSubmit={(e) => {
//                 e.preventDefault();
//                 handleLogin();
//               }}
//               style={{ width: "100%" }}
//             >
//               <TextField
//                 label="OLMID"
//                 fullWidth
//                 margin="dense"
//                 value={olmId}
//                 onChange={(e) => setOlmId(e.target.value)}
//                 InputProps={{
//                   startAdornment: (
//                     <InputAdornment position="start">
//                       <AccountCircleIcon />
//                     </InputAdornment>
//                   ),
//                 }}
//               />

//               <TextField
//                 label="Password"
//                 type={showPassword ? "text" : "password"}
//                 fullWidth
//                 margin="dense"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 InputProps={{
//                   startAdornment: (
//                     <InputAdornment position="start">
//                       <LockIcon />
//                     </InputAdornment>
//                   ),
//                   endAdornment: (
//                     <IconButton onClick={() => setShowPassword(!showPassword)}>
//                       {showPassword ? <VisibilityOff /> : <Visibility />}
//                     </IconButton>
//                   ),
//                 }}
//               />

//               {/* CAPTCHA */}
//               <Box mt={3}>
//                 <Typography
//                   variant="caption"
//                   color="text.secondary"
//                   display="block"
//                   mb={1}
//                 >
//                   Security Check
//                 </Typography>

//                 <Box display="flex" alignItems="center" gap={1}>
//                   <canvas ref={canvasRef} width={150} height={35} />
//                   <IconButton size="small" onClick={refreshCaptcha}>
//                     <RefreshIcon />
//                   </IconButton>
//                 </Box>

//                 <TextField
//                   label="Enter CAPTCHA"
//                   fullWidth
//                   margin="dense"
//                   value={captchaInput}
//                   onChange={(e) =>
//                     setCaptchaInput(e.target.value.toUpperCase())
//                   }
//                 />
//               </Box>

//               {error && (
//                 <Typography color="error" variant="body2" mt={1}>
//                   {error}
//                 </Typography>
//               )}

//               {!isAlreadyLogged ? (
//                 <Button
//                   type="submit"
//                   fullWidth
//                   variant="contained"
//                   sx={{ mt: 3, py: 1 }}
//                   disabled={isLoading}
//                 >
//                   Login
//                 </Button>
//               ) : (
//                 <Button
//                   fullWidth
//                   color="secondary"
//                   variant="contained"
//                   sx={{ mt: 3, py: 1 }}
//                   onClick={handleForceLogout}
//                 >
//                   Force Logout
//                 </Button>
//               )}
//             </form>
//           </CardContent>
//         </Card>
//       </Box>
//     </Box>
//   );
// };

// export default LoginPage;
