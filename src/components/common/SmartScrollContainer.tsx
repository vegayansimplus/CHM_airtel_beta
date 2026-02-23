import {
  Box,
  IconButton,
} from "@mui/material";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { useRef, useState, useEffect } from "react";

interface Props {
  height?: number;
  children: React.ReactNode;
}

const SmartScrollContainer = ({ height = 240, children }: Props) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const [showTop, setShowTop] = useState(false);
  const [showBottom, setShowBottom] = useState(false);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;

    setShowTop(el.scrollTop > 10);
    setShowBottom(el.scrollTop + el.clientHeight < el.scrollHeight - 10);
  };

  useEffect(() => {
    checkScroll();
  }, []);

  const scroll = (direction: "up" | "down") => {
    const el = scrollRef.current;
    if (!el) return;

    el.scrollBy({
      top: direction === "up" ? -120 : 120,
      behavior: "smooth",
    });
  };

  return (
    <Box position="relative">
      {/* Scrollable Content */}
      <Box
        ref={scrollRef}
        onScroll={checkScroll}
        sx={{
          maxHeight: height,
          overflowY: "auto",
          pr: 1,
          scrollBehavior: "smooth",

          /* Custom Scrollbar */
          "&::-webkit-scrollbar": {
            width: "6px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "rgba(0,0,0,0.2)",
            borderRadius: "10px",
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "transparent",
          },
        }}
      >
        {children}
      </Box>

      {/* Top Fade */}
      {showTop && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 6,
            height: 20,
            background:
              "linear-gradient(to bottom, rgba(255,255,255,0.9), transparent)",
            pointerEvents: "none",
          }}
        />
      )}

      {/* Bottom Fade */}
      {showBottom && (
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 6,
            height: 20,
            background:
              "linear-gradient(to top, rgba(255,255,255,0.9), transparent)",
            pointerEvents: "none",
          }}
        />
      )}

      {/* Scroll Buttons */}
      {showTop && (
        <IconButton
          size="small"
          onClick={() => scroll("up")}
          sx={{
            position: "absolute",
            right: -8,
            top: 10,
            bgcolor: "background.paper",
            boxShadow: 2,
          }}
        >
          <KeyboardArrowUpIcon fontSize="small" />
        </IconButton>
      )}

      {showBottom && (
        <IconButton
          size="small"
          onClick={() => scroll("down")}
          sx={{
            position: "absolute",
            right: -8,
            bottom: 10,
            bgcolor: "background.paper",
            boxShadow: 2,
          }}
        >
          <KeyboardArrowDownIcon fontSize="small" />
        </IconButton>
      )}
    </Box>
  );
};

export default SmartScrollContainer;
