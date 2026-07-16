import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { toast } from "react-toastify";
import { Box, Typography } from "@mui/material";

import {
  useForceLogoutMutation,
  useLazyGetLoggedUserQuery,
  useLoginMutation,
} from "../api/auth.api";
import { useAppDispatch } from "../../../app/hooks";
import { setToken, setUser } from "../slices/auth.slice";
import { authStorage } from "../../../app/store/auth.storage";
import { normalizeRBAC, normalizeModuleHierarchy } from "../utils/rbacNormalizer";
import type { AuthUser } from "../types/auth.types";
import { useCaptcha } from "../hooks/useCaptcha";
import AnimatedBackground from "../components/AnimatedBackground";
import BrandMark from "../components/BrandMark";
import FeatureHighlights from "../components/FeatureHighlights";
import ConnectionSecurityBadge from "../components/ConnectionSecurityBadge";
import LoginForm from "../components/LoginForm";
import AirtelLogo from "../../../assets/svg/AiretLogoSvg.svg";
import VegayanLogo from "../../../assets/images/logo_vega.png";
const CAPTCHA_DISABLED = true;
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 30_000;

const GLOBAL_CSS = `
  @keyframes lp-fadeUp  { from{opacity:0;transform:translateY(18px);} to{opacity:1;transform:translateY(0);} }
  @keyframes lp-slideL  { from{opacity:0;transform:translateX(-28px);} to{opacity:1;transform:translateX(0);} }
  @keyframes lp-slideR  { from{opacity:0;transform:translateX(28px);}  to{opacity:1;transform:translateX(0);} }
  @keyframes lp-pulse   { 0%,100%{opacity:1;transform:scale(1);} 50%{opacity:.25;transform:scale(.6);} }
  @keyframes lp-orb1    { from{transform:translate(0,0) scale(1);} to{transform:translate(24px,18px) scale(1.06);} }
  @keyframes lp-orb2    { from{transform:translate(0,0) scale(1);} to{transform:translate(-18px,22px) scale(0.95);} }
  @keyframes lp-float   { 0%,100%{transform:translateY(0) rotate(0deg);} 50%{transform:translateY(-8px) rotate(2deg);} }
  @keyframes lp-floatB  { 0%,100%{transform:translateY(0) rotate(0deg);} 50%{transform:translateY(6px) rotate(-1.5deg);} }
  @keyframes lp-shake {
    10%, 90% { transform: translateX(-1px); }
    20%, 80% { transform: translateX(2px); }
    30%, 50%, 70% { transform: translateX(-4px); }
    40%, 60% { transform: translateX(4px); }
  }

  .lp-field .MuiOutlinedInput-root {
    background: #F8FAFD; border-radius: 9px !important;
    color: #0C1B2E; font-size: 13.5px;
    font-family: 'Segoe UI', system-ui, -apple-system, Roboto, Arial, sans-serif;
    transition: box-shadow 0.2s, background 0.2s;
  }
  .lp-field .MuiOutlinedInput-root:hover { background: #EEF4FC; }
  .lp-field .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline { border-color: rgba(24,95,165,0.4) !important; }
  .lp-field .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline { border-color: #185FA5 !important; border-width: 1.5px !important; }
  .lp-field .MuiOutlinedInput-root.Mui-focused { background: #EEF4FC; box-shadow: 0 0 0 3px rgba(24,95,165,0.1); }
  .lp-field .MuiOutlinedInput-notchedOutline { border-color: rgba(12,27,46,0.12) !important; }
  .lp-field .MuiInputLabel-root            { color: rgba(12,27,46,0.45); font-size: 13px; font-family: 'Segoe UI', system-ui, -apple-system, Roboto, Arial, sans-serif; }
  .lp-field .MuiInputLabel-root.Mui-focused { color: #185FA5; }
  .lp-field .MuiInputBase-input            { color: #0C1B2E; font-family: 'Segoe UI', system-ui, -apple-system, Roboto, Arial, sans-serif; }
  .lp-field .MuiInputBase-input::placeholder { color: rgba(12,27,46,0.3); }
  .lp-field .MuiSvgIcon-root              { color: rgba(12,27,46,0.3) !important; }
  .lp-field .MuiInputAdornment-root .MuiIconButton-root { color: rgba(12,27,46,0.4); }
  .lp-submit:hover { transform: translateY(-1px) !important; box-shadow: 0 8px 24px rgba(24,95,165,0.3) !important; }
  .lp-submit:active { transform: translateY(0px) !important; }
  .lp-force:hover  { transform: translateY(-1px) !important; box-shadow: 0 8px 24px rgba(192,57,43,0.3) !important; }

  html, body, #root { height: 100%; overflow: hidden; }
`;

function injectGlobalCss() {
  if (document.querySelector("[data-lp-css]")) return;
  const s = document.createElement("style");
  s.dataset.lpCss = "1";
  s.textContent = GLOBAL_CSS;
  document.head.appendChild(s);
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
const LoginPage: React.FC = () => {
  const [olmId, setOlmId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isAlreadyLogged, setIsAlreadyLogged] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);

  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [lockoutRemaining, setLockoutRemaining] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const captcha = useCaptcha(!CAPTCHA_DISABLED);

  const [login, { isLoading }] = useLoginMutation();
  const [fetchUser] = useLazyGetLoggedUserQuery();
  const [forceLogout] = useForceLogoutMutation();

  useEffect(() => {
    injectGlobalCss();
  }, []);

  useEffect(() => {
    if (!lockedUntil) {
      setLockoutRemaining(0);
      return;
    }
    const tick = () => {
      const remaining = Math.max(
        0,
        Math.ceil((lockedUntil - Date.now()) / 1000),
      );
      setLockoutRemaining(remaining);
      if (remaining <= 0) {
        setLockedUntil(null);
        setFailedAttempts(0);
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [lockedUntil]);

  const registerFailedAttempt = () => {
    setShakeKey((k) => k + 1);
    setFailedAttempts((prev) => {
      const next = prev + 1;
      if (next >= MAX_ATTEMPTS) {
        setLockedUntil(Date.now() + LOCKOUT_DURATION_MS);
      }
      return next;
    });
  };

  const handleOlmIdChange = (value: string) => {
    setOlmId(value);
    if (error) setError("");
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (error) setError("");
  };

  const handleLogin = async () => {
    if (lockedUntil && Date.now() < lockedUntil) return;

    const trimmedOlmId = olmId.trim();
    if (!trimmedOlmId || !password) {
      setError("OLM ID and password are required");
      setShakeKey((k) => k + 1);
      return;
    }

    if (!captcha.isValid()) {
      setError("Captcha does not match");
      captcha.refresh();
      registerFailedAttempt();
      return;
    }

    setBtnLoading(true);
    const response = await login({ olmId: trimmedOlmId, password });
    setBtnLoading(false);

    if ("error" in response) {
      const message = (response.error as any)?.data?.message || "Login failed";
      if (message.toLowerCase().includes("already")) {
        setIsAlreadyLogged(true);
        toast.info("User already logged in on another device");
        return;
      }
      setError(message);
      setPassword("");
      toast.error(message);
      registerFailedAttempt();
      return;
    }

    const res = response.data;
    if (!res?.accessToken) {
      toast.error("JWT missing");
      registerFailedAttempt();
      return;
    }

    setError("");
    setFailedAttempts(0);
    setLockedUntil(null);
    dispatch(setToken(res.accessToken));

    const userRes = await fetchUser().unwrap();
    if (!userRes) {
      toast.error("User data not received");
      return;
    }

    const user: AuthUser = {
      olmId: userRes.olmId,
      employeeName: userRes.employeeName,
      roleCode: userRes.roleCode,
      userId: userRes.userId,
      modules: normalizeRBAC(userRes),
      moduleHierarchy: normalizeModuleHierarchy(userRes),
      authenticated: true,
    };

    dispatch(setUser(user));
    authStorage.setToken(res.accessToken);
    const storedUser = {
      olmId: user.olmId,
      employeeName: user.employeeName,
      roleCode: user.roleCode,
      userId: user.userId,
      modules: user.modules,
      moduleHierarchy: user.moduleHierarchy,
    };
    authStorage.setUser(storedUser);
    // Writing to localStorage above already notifies any other open tab
    // via the native `storage` event (see AuthHydrator), so no separate
    // broadcast is needed here.
    const from = (location.state as { from?: string } | null)?.from;
    navigate(from && from !== "/login" ? from : "/home", { replace: true });
  };

  const handleForceLogout = async () => {
    try {
      await forceLogout({ olmId: olmId.trim() }).unwrap();
      toast.success("Previous session terminated");
      setIsAlreadyLogged(false);
      setPassword("");
      setError("");
      captcha.refresh();
    } catch {
      toast.error("Force logout failed");
    }
  };

  const loading = isLoading || btnLoading;

  return (
    <Box
      sx={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        background: "#F0F4FA",
        display: "flex",
      }}
    >
      {/* ── STATIC BACKGROUND LAYERS ─────────────────────────────────── */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          background: `
          radial-gradient(ellipse 60% 60% at 8% 50%, rgba(24,95,165,0.07) 0%, transparent 70%),
          radial-gradient(ellipse 45% 50% at 92% 15%, rgba(55,138,221,0.06) 0%, transparent 65%),
          radial-gradient(ellipse 35% 40% at 55% 95%, rgba(24,95,165,0.05) 0%, transparent 60%),
          linear-gradient(150deg, #EEF3FA 0%, #F4F7FC 50%, #EBF1F8 100%)
        `,
        }}
      />

      {/* Dot grid */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          backgroundImage: `radial-gradient(rgba(24,95,165,0.08) 1px, transparent 1px)`,
          backgroundSize: "28px 28px",
          maskImage:
            "radial-gradient(ellipse 85% 85% at 50% 50%, black 30%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 85% 85% at 50% 50%, black 30%, transparent 100%)",
        }}
      />

      {/* Ambient orbs */}
      <Box
        sx={{
          position: "absolute",
          width: 500,
          height: 500,
          borderRadius: "50%",
          top: -100,
          left: -150,
          zIndex: 0,
          pointerEvents: "none",
          filter: "blur(90px)",
          opacity: 0.45,
          background:
            "radial-gradient(circle, rgba(24,95,165,0.14), transparent 70%)",
          animation: "lp-orb1 18s ease-in-out infinite alternate",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          width: 300,
          height: 300,
          borderRadius: "50%",
          bottom: -30,
          right: "28%",
          zIndex: 0,
          pointerEvents: "none",
          filter: "blur(70px)",
          opacity: 0.35,
          background:
            "radial-gradient(circle, rgba(55,138,221,0.16), transparent 70%)",
          animation: "lp-orb2 22s ease-in-out infinite alternate",
        }}
      />

      {/* ── INTERACTIVE CANVAS ANIMATION ─────────────────────────────── */}
      <AnimatedBackground />

      {/* ── FLOATING DECORATIVE SHAPES ──────────────────────────────── */}
      <Box
        sx={{
          position: "absolute",
          top: "8%",
          left: "4%",
          zIndex: 0,
          pointerEvents: "none",
          animation: "lp-float 8s ease-in-out infinite",
        }}
      >
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
          <circle
            cx="40"
            cy="40"
            r="36"
            stroke="rgba(24,95,165,0.12)"
            strokeWidth="2"
            strokeDasharray="8 6"
          />
          <circle
            cx="40"
            cy="40"
            r="26"
            stroke="rgba(55,138,221,0.08)"
            strokeWidth="1.5"
          />
        </svg>
      </Box>

      <Box
        sx={{
          position: "absolute",
          bottom: "12%",
          left: "7%",
          zIndex: 0,
          pointerEvents: "none",
          animation: "lp-floatB 10s ease-in-out infinite",
        }}
      >
        <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
          <polygon
            points="30,4 56,18 56,42 30,56 4,42 4,18"
            stroke="rgba(24,95,165,0.1)"
            strokeWidth="1.5"
            fill="none"
          />
          <polygon
            points="30,14 46,23 46,37 30,46 14,37 14,23"
            stroke="rgba(24,95,165,0.06)"
            strokeWidth="1"
            fill="none"
          />
        </svg>
      </Box>

      <Box
        sx={{
          position: "absolute",
          top: "15%",
          right: "3%",
          zIndex: 0,
          pointerEvents: "none",
          animation: "lp-float 12s ease-in-out infinite 2s",
        }}
      >
        <svg width="50" height="50" viewBox="0 0 50 50" fill="none">
          <rect
            x="15"
            y="15"
            width="20"
            height="20"
            transform="rotate(45 25 25)"
            stroke="rgba(55,138,221,0.14)"
            strokeWidth="1.5"
            fill="rgba(55,138,221,0.03)"
          />
        </svg>
      </Box>

      {/* ── TWO-COLUMN LAYOUT ───────────────────────────────────────── */}
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          height: "100%",
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 420px" },
          alignItems: "center",
        }}
      >
        {/* ══ LEFT PANEL ══════════════════════════════════════════════ */}
        <Box
          sx={{
            display: { xs: "none", md: "flex" },
            flexDirection: "column",
            justifyContent: "center",
            height: "100%",
            px: { md: 8, lg: 11 },
            animation: "lp-slideL 0.85s cubic-bezier(0.22,1,0.36,1) both",
          }}
        >
          {/* ── DUAL BRAND LOGOS ─────────────────────────────────── */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2.5,
              mb: 6,
              animation: "lp-fadeUp 0.6s 0.05s both",
            }}
          >
            <BrandMark variant="airtel" />

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 0.5,
              }}
            >
              <Box
                sx={{ width: "1px", height: 16, bgcolor: "rgba(12,27,46,0.1)" }}
              />
              <Typography
                sx={{
                  fontSize: "8px",
                  color: "rgba(12,27,46,0.25)",
                  fontFamily: "monospace",
                }}
              >
                ×
              </Typography>
              <Box
                sx={{ width: "1px", height: 16, bgcolor: "rgba(12,27,46,0.1)" }}
              />
            </Box>

            <BrandMark variant="vegayan" />
          </Box>

          {/* Status pill */}
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.8,
              bgcolor: "#fff",
              border: "1px solid rgba(24,95,165,0.18)",
              borderRadius: "100px",
              px: 1.5,
              py: 0.5,
              width: "fit-content",
              mb: 2.5,
              animation: "lp-fadeUp 0.6s 0.12s both",
              boxShadow: "0 1px 4px rgba(12,27,46,0.07)",
            }}
          >
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                bgcolor: "#22C55E",
                boxShadow: "0 0 6px rgba(34,197,94,0.7)",
                animation: "lp-pulse 2.4s ease-in-out infinite",
              }}
            />
            <Typography
              sx={{
                fontSize: "10px",
                fontWeight: 600,
                letterSpacing: "0.07em",
                textTransform: "uppercase",
                color: "#16A34A",
                fontFamily: "'Segoe UI', system-ui, -apple-system, Roboto, Arial, sans-serif",
              }}
            >
              All Systems Operational
            </Typography>
          </Box>

          {/* Hero headline */}
          <Typography
            sx={{
              fontSize: { md: "38px", lg: "50px" },
              fontWeight: 700,
              lineHeight: 1.07,
              letterSpacing: "-1.5px",
              color: "#0C1B2E",
              mb: 2,
              animation: "lp-fadeUp 0.6s 0.18s both",
              fontFamily: "'Segoe UI', system-ui, -apple-system, Roboto, Arial, sans-serif",
            }}
          >
            Change
            <Box
              component="span"
              sx={{
                display: "block",
                background:
                  "linear-gradient(135deg, #185FA5 0%, #378ADD 55%, #5BA3E0 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Management
            </Box>
            <Box component="span" sx={{ color: "rgba(12,27,46,0.55)" }}>
              System
            </Box>
          </Typography>

          <Typography
            sx={{
              fontSize: "13px",
              color: "rgba(12,27,46,0.45)",
              lineHeight: 1.85,
              maxWidth: 370,
              mb: 4.5,
              animation: "lp-fadeUp 0.6s 0.24s both",
              fontFamily: "'Segoe UI', system-ui, -apple-system, Roboto, Arial, sans-serif",
            }}
          >
            Streamline operational workflows, approvals, and change requests
            across enterprise infrastructure — governed, auditable, and secure.
          </Typography>

          <FeatureHighlights />

          {/* Bottom powered-by */}
          <Box
            sx={{
              mt: 6,
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              animation: "lp-fadeUp 0.6s 0.58s both",
            }}
          >
            <img
              src={AirtelLogo}
              alt="Airtel Logo"
              style={{ width: 24, height: 24 }}
            />
            <Typography
              sx={{
                fontFamily: "'Segoe UI', system-ui, -apple-system, Roboto, Arial, sans-serif",
                fontSize: "10.5px",
                color: "rgba(12,27,46,0.28)",
                letterSpacing: "0.03em",
              }}
            >
              Airtel CHM · Powered by Vegayan System Pvt. Ltd.
            </Typography>
          </Box>
        </Box>

        {/* ══ RIGHT — LOGIN CARD ═══════════════════════════════════════ */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            px: { xs: 1.5, md: 2.5 },
          }}
        >
          <Box
            sx={{
              width: "100%",
              maxWidth: 390,
              position: "relative",
              animation:
                "lp-slideR 0.85s cubic-bezier(0.22,1,0.36,1) 0.08s both",
            }}
          >
            <Box
              sx={{
                bgcolor: "#FFFFFF",
                border: "1px solid rgba(24,95,165,0.1)",
                borderRadius: "18px",
                p: { xs: "24px 20px", md: "36px 32px" },
                boxShadow:
                  "0 4px 6px rgba(12,27,46,0.04), 0 20px 60px rgba(24,95,165,0.1), 0 1px 2px rgba(12,27,46,0.04)",
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
                  height: "3px",
                  background:
                    "linear-gradient(90deg, #E40000 0%, #185FA5 50%, #378ADD 100%)",
                  borderRadius: "18px 18px 0 0",
                }}
              />

              {/* Corner watermark */}
              <Box
                sx={{
                  position: "absolute",
                  top: -30,
                  right: -30,
                  width: 110,
                  height: 110,
                  borderRadius: "50%",
                  pointerEvents: "none",
                  background:
                    "radial-gradient(circle, rgba(24,95,165,0.04), transparent 70%)",
                }}
              />

              {/* ── CARD HEADER ── */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 3.5,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <img
                    src={AirtelLogo}
                    alt="Airtel Logo"
                    style={{ width: 24, height: 24 }}
                  />
                  <Box
                    sx={{
                      width: "1px",
                      height: 22,
                      bgcolor: "rgba(12,27,46,0.1)",
                    }}
                  />
                  <img
                    src={VegayanLogo}
                    alt="Vegayan Logo"
                    style={{ width: 24, height: 24 }}
                  />

                  <Box>
                    <Typography
                      sx={{
                        fontFamily: "'Segoe UI', system-ui, -apple-system, Roboto, Arial, sans-serif",
                        fontSize: "11px",
                        fontWeight: 700,
                        color: "#185FA5",
                        letterSpacing: "0.05em",
                        textTransform: "uppercase",
                        lineHeight: 1,
                      }}
                    >
                      Airtel CHM
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: "'Segoe UI', system-ui, -apple-system, Roboto, Arial, sans-serif",
                        fontSize: "9.5px",
                        color: "rgba(12,27,46,0.35)",
                        letterSpacing: "0.04em",
                      }}
                    >
                      by Vegayan System
                    </Typography>
                  </Box>
                </Box>

                <ConnectionSecurityBadge />
              </Box>

              <Typography
                sx={{
                  fontFamily: "'Segoe UI', system-ui, -apple-system, Roboto, Arial, sans-serif",
                  fontSize: "22px",
                  fontWeight: 700,
                  letterSpacing: "-0.6px",
                  color: "#0C1B2E",
                  mb: 0.5,
                  lineHeight: 1.2,
                }}
              >
                Welcome back
              </Typography>
              <Typography
                sx={{
                  fontFamily: "'Segoe UI', system-ui, -apple-system, Roboto, Arial, sans-serif",
                  fontSize: "12.5px",
                  color: "rgba(12,27,46,0.42)",
                  mb: 3.5,
                }}
              >
                Sign in to the Change Management Portal
              </Typography>

              <LoginForm
                olmId={olmId}
                password={password}
                onOlmIdChange={handleOlmIdChange}
                onPasswordChange={handlePasswordChange}
                onSubmit={handleLogin}
                loading={loading}
                error={error}
                captcha={captcha}
                isAlreadyLogged={isAlreadyLogged}
                onForceLogout={handleForceLogout}
                lockoutSecondsRemaining={lockoutRemaining}
                shakeKey={shakeKey}
              />

              {/* ── FOOTER ── */}
              <Box
                sx={{
                  mt: 3,
                  pt: 2,
                  borderTop: "1px solid rgba(12,27,46,0.07)",
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
                        fontFamily: "'Segoe UI', system-ui, -apple-system, Roboto, Arial, sans-serif",
                        fontSize: "11px",
                        color: "#185FA5",
                        textDecoration: "none",
                        fontWeight: 500,
                        opacity: 0.75,
                        transition: "opacity 0.15s",
                        "&:hover": { opacity: 1 },
                      }}
                    >
                      {label}
                    </Typography>
                  ))}
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
                  <img
                    src={AirtelLogo}
                    alt="Airtel Logo"
                    style={{ width: 24, height: 24 }}
                  />
                  <Typography
                    sx={{
                      fontFamily: "Consolas, 'Courier New', monospace",
                      fontSize: "9px",
                      color: "rgba(12,27,46,0.28)",
                    }}
                  >
                    ×
                  </Typography>
                  <img
                    src={VegayanLogo}
                    alt="Vegayan Logo"
                    style={{ width: 24, height: 24 }}
                  />
                  <Typography
                    sx={{
                      fontFamily: "Consolas, 'Courier New', monospace",
                      fontSize: "9px",
                      color: "rgba(12,27,46,0.28)",
                      ml: 0.4,
                    }}
                  >
                    © {new Date().getFullYear()}
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
