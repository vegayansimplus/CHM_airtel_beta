import React, { useState, useEffect, useRef, useCallback } from "react";
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

import AirtelLogo from "../../../assets/svg/AiretLogoSvg.svg";
import VegayanLogo from "../../../assets/images/logo_vega.png";

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
  ctx.fillStyle = "rgba(230,241,251,0.7)";
  ctx.beginPath();
  (ctx as any).roundRect?.(0, 0, W, H, 8);
  ctx.fill();
  ctx.strokeStyle = "rgba(24,95,165,0.2)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(Math.random() * W, 0);
    ctx.lineTo(Math.random() * W, H);
    ctx.stroke();
  }
  const cols = [
    "#185FA5",
    "#0C447C",
    "#378ADD",
    "#185FA5",
    "#0C447C",
    "#378ADD",
  ];
  const cw = W / code.length;
  code.split("").forEach((ch, i) => {
    ctx.save();
    ctx.translate(cw * i + cw / 2, H / 2 + 1);
    ctx.rotate((Math.random() - 0.5) * 0.28);
    ctx.font = `bold ${16 + Math.random() * 3}px 'Courier New', monospace`;
    ctx.fillStyle = cols[i % cols.length];
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(ch, 0, 0);
    ctx.restore();
  });
}

// ─── GLOBAL CSS ───────────────────────────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

  @keyframes lp-fadeUp  { from{opacity:0;transform:translateY(18px);} to{opacity:1;transform:translateY(0);} }
  @keyframes lp-slideL  { from{opacity:0;transform:translateX(-28px);} to{opacity:1;transform:translateX(0);} }
  @keyframes lp-slideR  { from{opacity:0;transform:translateX(28px);}  to{opacity:1;transform:translateX(0);} }
  @keyframes lp-pulse   { 0%,100%{opacity:1;transform:scale(1);} 50%{opacity:.25;transform:scale(.6);} }
  @keyframes lp-orb1    { from{transform:translate(0,0) scale(1);} to{transform:translate(24px,18px) scale(1.06);} }
  @keyframes lp-orb2    { from{transform:translate(0,0) scale(1);} to{transform:translate(-18px,22px) scale(0.95);} }
  @keyframes lp-float   { 0%,100%{transform:translateY(0) rotate(0deg);} 50%{transform:translateY(-8px) rotate(2deg);} }
  @keyframes lp-floatB  { 0%,100%{transform:translateY(0) rotate(0deg);} 50%{transform:translateY(6px) rotate(-1.5deg);} }
  @keyframes lp-spin    { from{transform:rotate(0deg);} to{transform:rotate(360deg);} }
  @keyframes lp-spinRev { from{transform:rotate(360deg);} to{transform:rotate(0deg);} }
  @keyframes lp-ripple  { 0%{transform:scale(0.8);opacity:0.6;} 100%{transform:scale(2.2);opacity:0;} }
  @keyframes lp-dash    { from{stroke-dashoffset:200;} to{stroke-dashoffset:0;} }
  @keyframes lp-glow    { 0%,100%{filter:drop-shadow(0 0 4px rgba(24,95,165,0.3));} 50%{filter:drop-shadow(0 0 12px rgba(55,138,221,0.6));} }
  @keyframes lp-particle {
    0%   { transform: translate(0, 0) scale(1); opacity: 0.7; }
    100% { transform: translate(var(--tx), var(--ty)) scale(0); opacity: 0; }
  }
  @keyframes lp-wave {
    0%   { d: path("M0,30 Q120,10 240,30 Q360,50 480,30 Q600,10 720,30 L720,60 L0,60 Z"); }
    50%  { d: path("M0,30 Q120,50 240,30 Q360,10 480,30 Q600,50 720,30 L720,60 L0,60 Z"); }
    100% { d: path("M0,30 Q120,10 240,30 Q360,50 480,30 Q600,10 720,30 L720,60 L0,60 Z"); }
  }

  .lp-field .MuiOutlinedInput-root {
    background: #F8FAFD; border-radius: 9px !important;
    color: #0C1B2E; font-size: 13.5px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    transition: box-shadow 0.2s, background 0.2s;
  }
  .lp-field .MuiOutlinedInput-root:hover { background: #EEF4FC; }
  .lp-field .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline { border-color: rgba(24,95,165,0.4) !important; }
  .lp-field .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline { border-color: #185FA5 !important; border-width: 1.5px !important; }
  .lp-field .MuiOutlinedInput-root.Mui-focused { background: #EEF4FC; box-shadow: 0 0 0 3px rgba(24,95,165,0.1); }
  .lp-field .MuiOutlinedInput-notchedOutline { border-color: rgba(12,27,46,0.12) !important; }
  .lp-field .MuiInputLabel-root            { color: rgba(12,27,46,0.45); font-size: 13px; font-family: 'Plus Jakarta Sans', sans-serif; }
  .lp-field .MuiInputLabel-root.Mui-focused { color: #185FA5; }
  .lp-field .MuiInputBase-input            { color: #0C1B2E; font-family: 'Plus Jakarta Sans', sans-serif; }
  .lp-field .MuiInputBase-input::placeholder { color: rgba(12,27,46,0.3); }
  .lp-field .MuiSvgIcon-root              { color: rgba(12,27,46,0.3) !important; }
  .lp-field .MuiInputAdornment-root .MuiIconButton-root { color: rgba(12,27,46,0.4); }
  .lp-submit:hover { transform: translateY(-1px) !important; box-shadow: 0 8px 24px rgba(24,95,165,0.3) !important; }
  .lp-submit:active { transform: translateY(0px) !important; }
  .lp-force:hover  { transform: translateY(-1px) !important; box-shadow: 0 8px 24px rgba(192,57,43,0.3) !important; }

  html, body, #root { height: 100%; overflow: hidden; }

  .lp-mouse-trail {
    position: fixed; pointer-events: none; border-radius: 50%;
    mix-blend-mode: multiply; transition: transform 0.1s ease-out;
    z-index: 0;
  }
`;

function injectGlobalCss() {
  if (document.querySelector("[data-lp-css]")) return;
  const s = document.createElement("style");
  s.dataset.lpCss = "1";
  s.textContent = GLOBAL_CSS;
  document.head.appendChild(s);
}

// ─── ANIMATED BACKGROUND CANVAS ──────────────────────────────────────────────
const AnimatedBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -999, y: -999 });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    let W = window.innerWidth,
      H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;

    // Particles
    type Particle = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      r: number;
      alpha: number;
      color: string;
      life: number;
      maxLife: number;
    };
    const particles: Particle[] = [];

    // Floating nodes (network graph nodes)
    type Node = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      r: number;
      alpha: number;
    };
    const COLS = ["rgba(24,95,165,", "rgba(55,138,221,", "rgba(12,68,124,"];
    const nodes: Node[] = Array.from({ length: 22 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: 2 + Math.random() * 3,
      alpha: 0.15 + Math.random() * 0.25,
    }));

    // Mouse ripples
    type Ripple = {
      x: number;
      y: number;
      r: number;
      maxR: number;
      alpha: number;
    };
    const ripples: Ripple[] = [];
    let lastMouse = { x: -999, y: -999 };
    let frameCount = 0;

    const spawnParticle = (x: number, y: number) => {
      if (particles.length > 80) return;
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.4 + Math.random() * 1.2;
      const maxLife = 60 + Math.random() * 60;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        r: 1 + Math.random() * 2.5,
        alpha: 0.5 + Math.random() * 0.4,
        color: COLS[Math.floor(Math.random() * COLS.length)],
        life: 0,
        maxLife,
      });
    };

    const draw = () => {
      frameCount++;
      W = canvas.width;
      H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      // ── Spawn particles near mouse
      if (mx > 0 && my > 0 && frameCount % 3 === 0) {
        spawnParticle(
          mx + (Math.random() - 0.5) * 30,
          my + (Math.random() - 0.5) * 30,
        );
      }

      // ── Spawn ripple on mouse move
      const dx = mx - lastMouse.x,
        dy = my - lastMouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 18 && frameCount % 12 === 0 && mx > 0) {
        ripples.push({
          x: mx,
          y: my,
          r: 4,
          maxR: 80 + Math.random() * 40,
          alpha: 0.35,
        });
        lastMouse = { x: mx, y: my };
      }

      // ── Draw ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const rp = ripples[i];
        rp.r += (rp.maxR - rp.r) * 0.06;
        rp.alpha -= 0.008;
        if (rp.alpha <= 0) {
          ripples.splice(i, 1);
          continue;
        }
        ctx.beginPath();
        ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(24,95,165,${rp.alpha})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // ── Move & draw nodes
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;

        // Mouse repulsion
        const ndx = n.x - mx,
          ndy = n.y - my;
        const nd = Math.sqrt(ndx * ndx + ndy * ndy);
        if (nd < 120) {
          const force = ((120 - nd) / 120) * 0.4;
          n.vx += (ndx / nd) * force;
          n.vy += (ndy / nd) * force;
        }
        // Damping
        n.vx *= 0.99;
        n.vy *= 0.99;

        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(24,95,165,${n.alpha})`;
        ctx.fill();
      }

      // ── Draw connections between near nodes
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i],
            b = nodes[j];
          const dx2 = a.x - b.x,
            dy2 = a.y - b.y;
          const d2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
          if (d2 < 160) {
            const alpha = (1 - d2 / 160) * 0.12;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(24,95,165,${alpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      // ── Draw & update particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.97;
        p.vy *= 0.97;
        const progress = p.life / p.maxLife;
        const alpha = p.alpha * (1 - progress);
        const radius = p.r * (1 - progress * 0.5);
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${alpha})`;
        ctx.fill();
        if (p.life >= p.maxLife) particles.splice(i, 1);
      }

      // ── Mouse spotlight gradient
      if (mx > 0 && my > 0) {
        const grd = ctx.createRadialGradient(mx, my, 0, mx, my, 200);
        grd.addColorStop(0, "rgba(24,95,165,0.06)");
        grd.addColorStop(1, "rgba(24,95,165,0)");
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, W, H);
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    const onResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", onResize);
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    mouseRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
};

// ─── AIRTEL LOGO — Proper SVG using official brand geometry ──────────────────
// const AirtelLogo: React.FC<{ size?: number; variant?: "full" | "mark" }> = ({
//   size = 32,
//   variant = "full",
// }) => {
//   if (variant === "mark") {
//     // Airtel iconic "swoosh" logomark — the red circle with white wave
//     return (
//       <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
//         <circle cx="20" cy="20" r="20" fill="#E40000" />
//         {/* Airtel swoosh — two curved paths that form the iconic shape */}
//         <path
//           d="M10 24 C13 18, 17 14, 20 14 C23 14, 26 16, 28 20"
//           stroke="white" strokeWidth="3" strokeLinecap="round" fill="none"
//         />
//         <path
//           d="M14 28 C17 22, 20 18, 24 17 C27 16, 30 17, 31 20"
//           stroke="white" strokeWidth="2.2" strokeLinecap="round" fill="none" strokeOpacity="0.6"
//         />
//         <circle cx="31" cy="21" r="2.2" fill="white" />
//       </svg>
//     );
//   }

//   // Full wordmark: logomark + "airtel" text
//   return (
//     <svg width={size * 3.5} height={size} viewBox="0 0 140 40" fill="none" xmlns="http://www.w3.org/2000/svg">
//       {/* Mark */}
//       <circle cx="20" cy="20" r="20" fill="#E40000" />
//       <path d="M10 24 C13 18, 17 14, 20 14 C23 14, 26 16, 28 20"
//         stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" />
//       <path d="M14 28 C17 22, 20 18, 24 17 C27 16, 30 17, 31 20"
//         stroke="white" strokeWidth="2.2" strokeLinecap="round" fill="none" strokeOpacity="0.6" />
//       <circle cx="31" cy="21" r="2.2" fill="white" />
//       {/* "airtel" wordmark */}
//       <text x="50" y="27" fontFamily="'Arial Rounded MT Bold', Arial, sans-serif"
//         fontSize="20" fontWeight="900" fill="#E40000" letterSpacing="-0.5">
//         airtel
//       </text>
//     </svg>
//   );
// };

// ─── VEGAYAN LOGO — Professional grid-based logomark ─────────────────────────
// const VegayanLogo: React.FC<{ size?: number; variant?: "full" | "mark" }> = ({
//   size = 22,
//   variant = "full",
// }) => {
//   if (variant === "mark") {
//     return (
//       <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//         {/* V-shape geometric mark */}
//         <rect x="0" y="0" width="10" height="10" rx="2.5" fill="#185FA5" />
//         <rect x="14" y="0" width="10" height="10" rx="2.5" fill="#378ADD" fillOpacity="0.75" />
//         <rect x="0" y="14" width="10" height="10" rx="2.5" fill="#378ADD" fillOpacity="0.5" />
//         <rect x="14" y="14" width="10" height="10" rx="2.5" fill="#185FA5" fillOpacity="0.85" />
//         {/* Center dot connector */}
//         <circle cx="12" cy="12" r="2" fill="#185FA5" fillOpacity="0.3" />
//       </svg>
//     );
//   }

//   // Full wordmark
//   return (
//     <svg width={size * 5} height={size} viewBox="0 0 110 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//       {/* Mark */}
//       <rect x="0" y="0" width="10" height="10" rx="2" fill="#185FA5" />
//       <rect x="12" y="0" width="10" height="10" rx="2" fill="#378ADD" fillOpacity="0.75" />
//       <rect x="0" y="12" width="10" height="10" rx="2" fill="#378ADD" fillOpacity="0.5" />
//       <rect x="12" y="12" width="10" height="10" rx="2" fill="#185FA5" fillOpacity="0.85" />
//       {/* Wordmark */}
//       <text x="30" y="18" fontFamily="'Plus Jakarta Sans', 'Segoe UI', sans-serif"
//         fontSize="14" fontWeight="700" fill="#185FA5" letterSpacing="-0.3">
//         Vegayan
//       </text>
//     </svg>
//   );
// };

// ─── FEATURE ROW ─────────────────────────────────────────────────────────────
const FeatureRow: React.FC<{ text: string; delay: number }> = ({
  text,
  delay,
}) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "flex-start",
      gap: 1.2,
      animation: `lp-fadeUp 0.6s ${delay}s both`,
    }}
  >
    <Box
      sx={{
        width: 18,
        height: 18,
        borderRadius: "50%",
        bgcolor: "rgba(24,95,165,0.1)",
        border: "1px solid rgba(24,95,165,0.25)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        mt: "1px",
      }}
    >
      <Box
        sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: "#185FA5" }}
      />
    </Box>
    <Typography
      sx={{
        fontSize: "12.5px",
        color: "rgba(12,27,46,0.5)",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        lineHeight: 1.6,
      }}
    >
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

  useEffect(() => {
    injectGlobalCss();
  }, []);
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
    if (!res?.accessToken) {
      toast.error("JWT missing");
      return;
    }
    dispatch(setToken(res.accessToken));
    sessionStorage.setItem("access_token", res.accessToken);

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
      {/* Top-left floating ring */}
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

      {/* Bottom-left hexagon */}
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

      {/* Top-right diamond */}
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
            {/* Airtel logo */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.2,
                bgcolor: "#fff",
                border: "1px solid rgba(228,0,0,0.12)",
                borderRadius: "12px",
                px: 1.8,
                py: 1,
                boxShadow: "0 2px 12px rgba(228,0,0,0.07)",
                transition: "box-shadow 0.2s, transform 0.2s",
                "&:hover": {
                  boxShadow: "0 4px 20px rgba(228,0,0,0.14)",
                  transform: "translateY(-1px)",
                },
              }}
            >
              {/* <AiretLogoSvg /> */}
              <img
                src={AirtelLogo}
                alt="Airtel Logo"
                style={{ width: 24, height: 24 }}
              />
              <Box>
                <Typography
                  sx={{
                    fontFamily: "'Arial Rounded MT Bold', Arial, sans-serif",
                    fontSize: "16px",
                    fontWeight: 900,
                    color: "#E40000",
                    letterSpacing: "-0.5px",
                    lineHeight: 1,
                  }}
                >
                  airtel
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: "9px",
                    color: "rgba(12,27,46,0.4)",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                >
                  Enterprise
                </Typography>
              </Box>
            </Box>

            {/* Divider */}
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

            {/* Vegayan logo */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.2,
                bgcolor: "#fff",
                border: "1px solid rgba(24,95,165,0.12)",
                borderRadius: "12px",
                px: 1.8,
                py: 1,
                boxShadow: "0 2px 12px rgba(24,95,165,0.07)",
                transition: "box-shadow 0.2s, transform 0.2s",
                "&:hover": {
                  boxShadow: "0 4px 20px rgba(24,95,165,0.14)",
                  transform: "translateY(-1px)",
                },
              }}
            >
              {/* <VegayanLog size={20} variant="mark" /> */}
              <img
                src={VegayanLogo}
                alt="Vegayan Logo"
                style={{ width: 24, height: 24 }}
              />
              <Box>
                <Typography
                  sx={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#185FA5",
                    lineHeight: 1,
                    letterSpacing: "-0.2px",
                  }}
                >
                  Vegayan
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: "9px",
                    color: "rgba(12,27,46,0.35)",
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                  }}
                >
                  System Pvt. Ltd.
                </Typography>
              </Box>
            </Box>
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
                fontFamily: "'Plus Jakarta Sans', sans-serif",
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
              fontFamily: "'Plus Jakarta Sans', sans-serif",
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
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            Streamline operational workflows, approvals, and change requests
            across enterprise infrastructure — governed, auditable, and secure.
          </Typography>

          {/* Feature list */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.4 }}>
            <FeatureRow
              text="Real-time change request tracking with automated approvals"
              delay={0.42}
            />
            <FeatureRow
              text="Role-based access control with fine-grained permissions"
              delay={0.46}
            />
            <FeatureRow
              text="Full audit trail, impact scoring, and analytics dashboard"
              delay={0.5}
            />
            <FeatureRow
              text="Multi-factor authentication and 256-bit SSL encryption"
              delay={0.54}
            />
          </Box>

          {/* Bottom powered-by with both logos */}
          <Box
            sx={{
              mt: 6,
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              animation: "lp-fadeUp 0.6s 0.58s both",
            }}
          >
            {/* <AiretLogoSvg /> */}
            <img
              src={AirtelLogo}
              alt="Airtel Logo"
              style={{ width: 24, height: 24 }}
            />
            <Typography
              sx={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
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

              {/* ── CARD HEADER: Both logos ── */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 3.5,
                }}
              >
                {/* Left: Airtel + Vegayan stacked */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  {/* Airtel mark */}
                  {/* <AiretLogoSvg  /> */}
                  <img
                    src={AirtelLogo}
                    alt="Airtel Logo"
                    style={{ width: 24, height: 24 }}
                  />

                  {/* Divider */}
                  <Box
                    sx={{
                      width: "1px",
                      height: 22,
                      bgcolor: "rgba(12,27,46,0.1)",
                    }}
                  />

                  {/* Vegayan mark */}
                  {/* <VegayanLogo size={18} variant="mark" /> */}
                  <img
                    src={VegayanLogo}
                    alt="Vegayan Logo"
                    style={{ width: 24, height: 24 }}
                  />

                  <Box>
                    <Typography
                      sx={{
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
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
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontSize: "9.5px",
                        color: "rgba(12,27,46,0.35)",
                        letterSpacing: "0.04em",
                      }}
                    >
                      by Vegayan System
                    </Typography>
                  </Box>
                </Box>

                {/* SSL badge
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    bgcolor: "rgba(24,95,165,0.06)",
                    border: "1px solid rgba(24,95,165,0.14)",
                    borderRadius: "6px",
                    px: 0.9,
                    py: 0.4,
                  }}
                >
                  <ShieldOutlined sx={{ fontSize: 10, color: "#185FA5" }} />
                  <Typography
                    sx={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: "9px",
                      color: "#185FA5",
                      fontWeight: 500,
                      letterSpacing: "0.03em",
                    }}
                  >
                    SSL Secured
                  </Typography>
                </Box> */}
              </Box>

              <Typography
                sx={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
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
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: "12.5px",
                  color: "rgba(12,27,46,0.42)",
                  mb: 3.5,
                }}
              >
                Sign in to the Change Management Portal
              </Typography>

              {/* ── FORM ── */}
              <Box
                component="form"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleLogin();
                }}
              >
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
                          sx={{ color: "rgba(12,27,46,0.4)", p: 0.5 }}
                        >
                          {showPassword ? (
                            <VisibilityOff sx={{ fontSize: 15 }} />
                          ) : (
                            <Visibility sx={{ fontSize: 15 }} />
                          )}
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
                      bgcolor: "rgba(24,95,165,0.05)",
                      border: "1px dashed rgba(24,95,165,0.22)",
                      borderRadius: "8px",
                      px: 1.4,
                      py: 0.85,
                      mb: 2.2,
                    }}
                  >
                    <ShieldOutlined sx={{ fontSize: 12, color: "#185FA5" }} />
                    <Typography
                      sx={{
                        fontFamily: "'DM Mono', monospace",
                        fontSize: "10px",
                        color: "#185FA5",
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
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontSize: "10px",
                        fontWeight: 600,
                        letterSpacing: "0.07em",
                        textTransform: "uppercase",
                        color: "rgba(12,27,46,0.38)",
                        mb: 1,
                      }}
                    >
                      Security Verification
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        gap: 1,
                        alignItems: "center",
                        mb: 1,
                      }}
                    >
                      <canvas
                        ref={canvasRef}
                        width={168}
                        height={36}
                        style={{
                          borderRadius: 8,
                          border: "1px solid rgba(24,95,165,0.18)",
                          display: "block",
                          background: "#F0F5FC",
                        }}
                      />
                      <IconButton
                        size="small"
                        onClick={refreshCaptcha}
                        aria-label="Refresh CAPTCHA"
                        sx={{
                          bgcolor: "#F0F5FC",
                          border: "1px solid rgba(24,95,165,0.18)",
                          borderRadius: "8px",
                          width: 34,
                          height: 34,
                          color: "rgba(12,27,46,0.45)",
                          "&:hover": { bgcolor: "#E2EEFA" },
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
                      onChange={(e) =>
                        setCaptchaInput(e.target.value.toUpperCase())
                      }
                      autoComplete="off"
                      inputProps={{
                        maxLength: 6,
                        style: {
                          letterSpacing: "0.16em",
                          fontWeight: 600,
                          fontFamily: "'DM Mono', monospace",
                        },
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

                {error && (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.9,
                      mb: 1.8,
                      mt: -0.8,
                      bgcolor: "rgba(226,75,74,0.06)",
                      border: "1px solid rgba(226,75,74,0.2)",
                      borderRadius: "8px",
                      px: 1.2,
                      py: 0.75,
                    }}
                  >
                    <ErrorOutline sx={{ fontSize: 13, color: "#C0392B" }} />
                    <Typography
                      sx={{
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        color: "#C0392B",
                        fontSize: "11.5px",
                      }}
                    >
                      {error}
                    </Typography>
                  </Box>
                )}

                {!isAlreadyLogged ? (
                  <Button
                    type="submit"
                    fullWidth
                    disabled={loading}
                    className="lp-submit"
                    startIcon={
                      loading ? (
                        <CircularProgress size={13} sx={{ color: "#fff" }} />
                      ) : (
                        <LoginIcon sx={{ fontSize: "16px !important" }} />
                      )
                    }
                    sx={{
                      height: 44,
                      borderRadius: "10px",
                      background:
                        "linear-gradient(135deg, #185FA5 0%, #0C447C 100%)",
                      color: "#fff",
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontSize: "13.5px",
                      fontWeight: 600,
                      letterSpacing: "0.15px",
                      textTransform: "none",
                      boxShadow: "0 2px 10px rgba(24,95,165,0.25)",
                      transition: "transform 0.15s, box-shadow 0.18s",
                      "&:hover": {
                        background:
                          "linear-gradient(135deg, #1d71c2 0%, #185FA5 100%)",
                      },
                      "&.Mui-disabled": { opacity: 0.55, color: "#fff" },
                    }}
                  >
                    {loading ? "Authenticating…" : "Sign In"}
                  </Button>
                ) : (
                  <>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 1,
                        mb: 1.8,
                        bgcolor: "rgba(234,179,8,0.06)",
                        border: "1px solid rgba(234,179,8,0.22)",
                        borderRadius: "8px",
                        px: 1.4,
                        py: 1,
                      }}
                    >
                      <ErrorOutline
                        sx={{ fontSize: 14, color: "#B45309", mt: 0.1 }}
                      />
                      <Typography
                        sx={{
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          fontSize: "11.5px",
                          color: "#92400E",
                          lineHeight: 1.5,
                        }}
                      >
                        This account is active on another device. Force logout
                        to continue here.
                      </Typography>
                    </Box>
                    <Button
                      fullWidth
                      className="lp-force"
                      onClick={handleForceLogout}
                      startIcon={
                        <ExitToApp sx={{ fontSize: "16px !important" }} />
                      }
                      sx={{
                        height: 44,
                        borderRadius: "10px",
                        background:
                          "linear-gradient(135deg, #C0392B 0%, #96281B 100%)",
                        color: "#fff",
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontSize: "13px",
                        fontWeight: 600,
                        textTransform: "none",
                        letterSpacing: "0.15px",
                        boxShadow: "0 2px 10px rgba(192,57,43,0.2)",
                        transition: "transform 0.15s, box-shadow 0.18s",
                        "&:hover": {
                          background:
                            "linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)",
                        },
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
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
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

                {/* Footer: both brand marks */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
                  {/* <AiretLogoSvg/> */}
                  <img
                    src={AirtelLogo}
                    alt="Airtel Logo"
                    style={{ width: 24, height: 24 }}
                  />
                  <Typography
                    sx={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: "9px",
                      color: "rgba(12,27,46,0.28)",
                    }}
                  >
                    ×
                  </Typography>
                  {/* <VegayanLogo size={10} variant="mark" /> */}
                  <img
                    src={VegayanLogo}
                    alt="Vegayan Logo"
                    style={{ width: 24, height: 24 }}
                  />

                  <Typography
                    sx={{
                      fontFamily: "'DM Mono', monospace",
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
