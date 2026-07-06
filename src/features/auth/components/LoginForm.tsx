import React, { useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import {
  ExitToApp,
  KeyboardCapslockOutlined,
  LockOutlined,
  Login as LoginIcon,
  PersonOutline,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";

import CaptchaField from "./CaptchaField";
import InlineAlert from "./InlineAlert";
import type { CaptchaState } from "../hooks/useCaptcha";

interface LoginFormProps {
  olmId: string;
  password: string;
  onOlmIdChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: () => void;
  loading: boolean;
  error: string;
  captcha: CaptchaState;
  isAlreadyLogged: boolean;
  onForceLogout: () => void;
  lockoutSecondsRemaining: number;
  shakeKey: number;
}

const LoginForm: React.FC<LoginFormProps> = ({
  olmId,
  password,
  onOlmIdChange,
  onPasswordChange,
  onSubmit,
  loading,
  error,
  captcha,
  isAlreadyLogged,
  onForceLogout,
  lockoutSecondsRemaining,
  shakeKey,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);

  const isLocked = lockoutSecondsRemaining > 0;

  const handlePasswordKeyEvent = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (typeof e.getModifierState === "function") {
      setCapsLockOn(e.getModifierState("CapsLock"));
    }
  };

  return (
    <Box
      component="form"
      onSubmit={(e) => {
        e.preventDefault();
        if (!isLocked) onSubmit();
      }}
    >
      <Box
        key={shakeKey}
        sx={{ animation: shakeKey ? "lp-shake 0.4s ease" : "none" }}
      >
        <TextField
          className="lp-field"
          label="OLM ID"
          fullWidth
          size="small"
          value={olmId}
          onChange={(e) => onOlmIdChange(e.target.value)}
          autoComplete="username"
          disabled={isLocked}
          inputProps={{ maxLength: 50 }}
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
          onChange={(e) => onPasswordChange(e.target.value)}
          onKeyDown={handlePasswordKeyEvent}
          onKeyUp={handlePasswordKeyEvent}
          autoComplete="current-password"
          disabled={isLocked}
          inputProps={{ maxLength: 128 }}
          sx={{ mb: capsLockOn ? 0.6 : 2.2 }}
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
                  aria-label={showPassword ? "Hide password" : "Show password"}
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

        {capsLockOn && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              mb: 1.6,
            }}
          >
            <KeyboardCapslockOutlined sx={{ fontSize: 12, color: "#B45309" }} />
            <Typography
              sx={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: "10.5px",
                color: "#B45309",
              }}
            >
              Caps Lock is on
            </Typography>
          </Box>
        )}
      </Box>

      <CaptchaField captcha={captcha} />

      {isLocked ? (
        <InlineAlert tone="warning">
          Too many failed attempts. Try again in {lockoutSecondsRemaining}s.
        </InlineAlert>
      ) : (
        error && <InlineAlert tone="error">{error}</InlineAlert>
      )}

      {!isAlreadyLogged ? (
        <Button
          type="submit"
          fullWidth
          disabled={loading || isLocked}
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
            background: "linear-gradient(135deg, #185FA5 0%, #0C447C 100%)",
            color: "#fff",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: "13.5px",
            fontWeight: 600,
            letterSpacing: "0.15px",
            textTransform: "none",
            boxShadow: "0 2px 10px rgba(24,95,165,0.25)",
            transition: "transform 0.15s, box-shadow 0.18s",
            "&:hover": {
              background: "linear-gradient(135deg, #1d71c2 0%, #185FA5 100%)",
            },
            "&.Mui-disabled": { opacity: 0.55, color: "#fff" },
          }}
        >
          {loading ? "Authenticating…" : isLocked ? `Locked · ${lockoutSecondsRemaining}s` : "Sign In"}
        </Button>
      ) : (
        <>
          <InlineAlert tone="warning">
            This account is active on another device. Force logout to continue here.
          </InlineAlert>
          <Button
            fullWidth
            className="lp-force"
            onClick={onForceLogout}
            startIcon={<ExitToApp sx={{ fontSize: "16px !important" }} />}
            sx={{
              height: 44,
              borderRadius: "10px",
              background: "linear-gradient(135deg, #C0392B 0%, #96281B 100%)",
              color: "#fff",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: "13px",
              fontWeight: 600,
              textTransform: "none",
              letterSpacing: "0.15px",
              boxShadow: "0 2px 10px rgba(192,57,43,0.2)",
              transition: "transform 0.15s, box-shadow 0.18s",
              "&:hover": {
                background: "linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)",
              },
            }}
          >
            Force Logout Previous Session
          </Button>
        </>
      )}
    </Box>
  );
};

export default LoginForm;
