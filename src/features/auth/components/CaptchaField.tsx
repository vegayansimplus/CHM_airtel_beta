import React, { useEffect, useRef } from "react";
import { Box, IconButton, InputAdornment, TextField, Typography } from "@mui/material";
import { Refresh, ShieldOutlined } from "@mui/icons-material";
import type { CaptchaState } from "../hooks/useCaptcha";

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
  const cols = ["#185FA5", "#0C447C", "#378ADD", "#185FA5", "#0C447C", "#378ADD"];
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

interface Props {
  captcha: CaptchaState;
}

const CaptchaField: React.FC<Props> = ({ captcha }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (captcha.enabled) renderCaptcha(canvasRef.current, captcha.code);
  }, [captcha.enabled, captcha.code]);

  if (!captcha.enabled) {
    return (
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
          Verification skipped — development build
        </Typography>
      </Box>
    );
  }

  return (
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
      <Box sx={{ display: "flex", gap: 1, alignItems: "center", mb: 1 }}>
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
          onClick={captcha.refresh}
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
        value={captcha.input}
        onChange={(e) => captcha.setInput(e.target.value.toUpperCase())}
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
  );
};

export default CaptchaField;
