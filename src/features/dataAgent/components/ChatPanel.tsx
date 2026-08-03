import { useEffect, useRef } from "react";
import { Avatar, Box, Button, Chip, Stack, TextField, Typography, useTheme } from "@mui/material";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import AddchartRoundedIcon from "@mui/icons-material/AddchartRounded";
import { useTabColorTokens } from "../../../style/theme";
import type { ChatMessage, QueryResult } from "../types/dataAgent.types";

const SUGGESTIONS = [
  "Top 10 interfaces by peak inbound traffic",
  "Show distinct linktypes",
  "Nodes with highest out traffic",
  "Traffic distribution by linktype",
  "Monthly traffic trend",
];

interface ChatPanelProps {
  messages: ChatMessage[];
  chatInput: string;
  onChatInputChange: (value: string) => void;
  onSend: (override?: string) => void;
  loading: boolean;
  error: string | null;
  onAddToCanvas: (result: QueryResult) => void;
}

export default function ChatPanel({
  messages,
  chatInput,
  onChatInputChange,
  onSend,
  loading,
  error,
  onAddToCanvas,
}: ChatPanelProps) {
  const theme = useTheme();
  const c = useTabColorTokens(theme);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <Box sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
      <Stack direction="row" flexWrap="wrap" gap={1} sx={{ px: 2.5, py: 1.25, borderBottom: `1px solid ${c.border}`, flexShrink: 0 }}>
        {SUGGESTIONS.map((s) => (
          <Chip
            key={s}
            label={s}
            size="small"
            variant="outlined"
            onClick={() => onSend(s)}
            sx={{ fontSize: 11, borderRadius: 100 }}
          />
        ))}
      </Stack>

      <Box sx={{ flex: 1, overflowY: "auto", p: 2.5, display: "flex", flexDirection: "column", gap: 1.75 }}>
        {messages.map((msg) => (
          <ChatBubble key={msg.id} msg={msg} onAddToCanvas={onAddToCanvas} />
        ))}
        <div ref={bottomRef} />
      </Box>

      {error && (
        <Box sx={{ px: 2.5, py: 1, borderTop: `1px solid ${c.border}`, flexShrink: 0 }}>
          <Typography variant="caption" color="error">
            ⚠ {error}
          </Typography>
        </Box>
      )}

      <Box sx={{ px: 2.5, py: 2, borderTop: `1px solid ${c.border}`, bgcolor: c.surface, flexShrink: 0 }}>
        <Stack direction="row" gap={1.25} alignItems="flex-end">
          <TextField
            inputRef={inputRef}
            fullWidth
            size="small"
            value={chatInput}
            disabled={loading}
            placeholder="Ask anything about your network data…"
            onChange={(e) => onChatInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) onSend();
            }}
          />
          <Button
            variant="contained"
            endIcon={<SendRoundedIcon fontSize="small" />}
            disabled={loading || !chatInput.trim()}
            onClick={() => onSend()}
            sx={{ textTransform: "none", flexShrink: 0 }}
          >
            {loading ? "…" : "Ask"}
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}

function ChatBubble({ msg, onAddToCanvas }: { msg: ChatMessage; onAddToCanvas: (result: QueryResult) => void }) {
  const theme = useTheme();
  const c = useTabColorTokens(theme);
  const isUser = msg.role === "user";

  if (isUser) {
    return (
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Box
          sx={{
            maxWidth: "75%",
            px: 1.75,
            py: 1.25,
            bgcolor: c.accent,
            color: "#fff",
            borderRadius: "14px 14px 4px 14px",
            fontSize: 13,
            lineHeight: 1.55,
          }}
        >
          {msg.text}
        </Box>
      </Box>
    );
  }

  if (msg.loading) {
    return (
      <Stack direction="row" gap={1.25} alignItems="flex-end">
        <BotAvatar />
        <Box
          sx={{
            px: 2,
            py: 1.5,
            bgcolor: c.surface2,
            border: `1px solid ${c.border}`,
            borderRadius: "14px 14px 14px 4px",
            display: "flex",
            gap: 0.75,
          }}
        >
          {[0, 1, 2].map((i) => (
            <Box
              key={i}
              sx={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                bgcolor: c.accent,
                opacity: 0.5,
                animation: "dataagent-pulse 1.2s ease-in-out infinite",
                animationDelay: `${i * 150}ms`,
                "@keyframes dataagent-pulse": {
                  "0%, 100%": { opacity: 0.3, transform: "scale(0.8)" },
                  "50%": { opacity: 1, transform: "scale(1)" },
                },
              }}
            />
          ))}
        </Box>
      </Stack>
    );
  }

  return (
    <Stack direction="row" gap={1.25} alignItems="flex-start">
      <BotAvatar />
      <Box sx={{ flex: 1, maxWidth: "calc(100% - 46px)" }}>
        <Box
          sx={{
            px: 1.75,
            py: 1.35,
            bgcolor: msg.error ? c.dangerDim : c.surface2,
            border: `1px solid ${msg.error ? c.dangerBorder : c.border}`,
            borderRadius: "14px 14px 14px 4px",
            fontSize: 13,
            color: msg.error ? c.danger : c.textPrimary,
            lineHeight: 1.65,
          }}
        >
          {msg.text || "…"}
        </Box>

        {msg.hasData && !msg.error && (
          <Stack direction="row" flexWrap="wrap" gap={0.75} sx={{ mt: 0.75 }}>
            <Chip
              size="small"
              icon={<AutoAwesomeRoundedIcon sx={{ fontSize: 13 }} />}
              label={`${msg.rowCount} rows · ${msg.columns?.length ?? 0} cols`}
              sx={{ fontSize: 10, bgcolor: c.accentDim, color: c.accent }}
            />
            {msg.intent && <Chip size="small" label={msg.intent} sx={{ fontSize: 10 }} />}
          </Stack>
        )}

        {msg.hasData && !msg.error && msg.result && (
          <Stack direction="row" flexWrap="wrap" gap={0.75} sx={{ mt: 1 }}>
            <Button
              size="small"
              variant="text"
              startIcon={<AddchartRoundedIcon sx={{ fontSize: 15 }} />}
              onClick={() => onAddToCanvas(msg.result!)}
              sx={{ textTransform: "none", fontSize: 11, color: c.textSecondary }}
            >
              Pin to canvas
            </Button>
          </Stack>
        )}
      </Box>
    </Stack>
  );
}

function BotAvatar() {
  const theme = useTheme();
  const c = useTabColorTokens(theme);
  return (
    <Avatar sx={{ width: 28, height: 28, fontSize: 13, bgcolor: c.accent, flexShrink: 0 }}>
      <AutoAwesomeRoundedIcon sx={{ fontSize: 15 }} />
    </Avatar>
  );
}
