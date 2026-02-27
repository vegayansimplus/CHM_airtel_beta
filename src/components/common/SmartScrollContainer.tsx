import { Box, IconButton, useTheme } from "@mui/material";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import { useRef, useState, useEffect, useCallback } from "react";

interface Props {
  height?: number;
  enableHorizontal?: boolean;
  children: React.ReactNode;
}

const SmartScrollContainer = ({
  height = 300,
  enableHorizontal = false,
  children,
}: Props) => {
  const theme = useTheme();
  const scrollRef = useRef<HTMLDivElement>(null);

  const [showTop, setShowTop] = useState(false);
  const [showBottom, setShowBottom] = useState(false);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    setShowTop(el.scrollTop > 8);
    setShowBottom(el.scrollTop + el.clientHeight < el.scrollHeight - 8);

    if (enableHorizontal) {
      setShowLeft(el.scrollLeft > 8);
      setShowRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
    }
  }, [enableHorizontal]);

  useEffect(() => {
    checkScroll();

    const el = scrollRef.current;
    if (!el) return;

    const resizeObserver = new ResizeObserver(() => {
      checkScroll();
    });

    resizeObserver.observe(el);

    return () => {
      resizeObserver.disconnect();
    };
  }, [checkScroll]);

  const scroll = (direction: "up" | "down" | "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;

    const amount = 150;

    el.scrollBy({
      top: direction === "up" ? -amount : direction === "down" ? amount : 0,
      left: direction === "left" ? -amount : direction === "right" ? amount : 0,
      behavior: "smooth",
    });
  };

  const fadeColor =
    theme.palette.mode === "dark"
      ? theme.palette.background.default
      : theme.palette.background.paper;

  return (
    <Box position="relative">
      <Box
        ref={scrollRef}
        onScroll={checkScroll}
        sx={{
          maxHeight: height,
          overflowY: "auto",
          overflowX: enableHorizontal ? "auto" : "hidden",
          pr: 1,
          scrollBehavior: "smooth",

          /* Modern Scrollbar */
          "&::-webkit-scrollbar": {
            width: 6,
            height: 6,
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: theme.palette.divider,
            borderRadius: 10,
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "transparent",
          },
        }}
      >
        {children}
      </Box>

      {/* ===== Vertical Fades ===== */}

      {showTop && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 30,
            background: `linear-gradient(to bottom, ${fadeColor}, transparent)`,
            pointerEvents: "none",
          }}
        />
      )}

      {showBottom && (
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 30,
            background: `linear-gradient(to top, ${fadeColor}, transparent)`,
            pointerEvents: "none",
          }}
        />
      )}

      {/* ===== Vertical Buttons ===== */}

      {showTop && (
        <IconButton
          size="small"
          onClick={() => scroll("up")}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            bgcolor: "background.paper",
            boxShadow: 3,
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
            right: 8,
            bottom: 8,
            bgcolor: "background.paper",
            boxShadow: 3,
          }}
        >
          <KeyboardArrowDownIcon fontSize="small" />
        </IconButton>
      )}

      {/* ===== Horizontal Buttons ===== */}

      {enableHorizontal && showLeft && (
        <IconButton
          size="small"
          onClick={() => scroll("left")}
          sx={{
            position: "absolute",
            left: 8,
            bottom: 8,
            bgcolor: "background.paper",
            boxShadow: 3,
          }}
        >
          <KeyboardArrowLeftIcon fontSize="small" />
        </IconButton>
      )}

      {enableHorizontal && showRight && (
        <IconButton
          size="small"
          onClick={() => scroll("right")}
          sx={{
            position: "absolute",
            right: 8,
            bottom: 8,
            bgcolor: "background.paper",
            boxShadow: 3,
          }}
        >
          <KeyboardArrowRightIcon fontSize="small" />
        </IconButton>
      )}
    </Box>
  );
};

export default SmartScrollContainer;

// import {
//   Box,
//   IconButton,
// } from "@mui/material";
// import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
// import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
// import { useRef, useState, useEffect } from "react";

// interface Props {
//   height?: number;
//   children: React.ReactNode;
// }

// const SmartScrollContainer = ({ height = 240, children }: Props) => {
//   const scrollRef = useRef<HTMLDivElement>(null);

//   const [showTop, setShowTop] = useState(false);
//   const [showBottom, setShowBottom] = useState(false);

//   const checkScroll = () => {
//     const el = scrollRef.current;
//     if (!el) return;

//     setShowTop(el.scrollTop > 10);
//     setShowBottom(el.scrollTop + el.clientHeight < el.scrollHeight - 10);
//   };

//   useEffect(() => {
//     checkScroll();
//   }, []);

//   const scroll = (direction: "up" | "down") => {
//     const el = scrollRef.current;
//     if (!el) return;

//     el.scrollBy({
//       top: direction === "up" ? -120 : 120,
//       behavior: "smooth",
//     });
//   };

//   return (
//     <Box position="relative">
//       {/* Scrollable Content */}
//       <Box
//         ref={scrollRef}
//         onScroll={checkScroll}
//         sx={{
//           maxHeight: height,
//           overflowY: "auto",
//           pr: 1,
//           scrollBehavior: "smooth",

//           /* Custom Scrollbar */
//           "&::-webkit-scrollbar": {
//             width: "6px",
//           },
//           "&::-webkit-scrollbar-thumb": {
//             backgroundColor: "rgba(0,0,0,0.2)",
//             borderRadius: "10px",
//           },
//           "&::-webkit-scrollbar-track": {
//             backgroundColor: "transparent",
//           },
//         }}
//       >
//         {children}
//       </Box>

//       {/* Top Fade */}
//       {showTop && (
//         <Box
//           sx={{
//             position: "absolute",
//             top: 0,
//             left: 0,
//             right: 6,
//             height: 20,
//             background:
//               "linear-gradient(to bottom, rgba(255,255,255,0.9), transparent)",
//             pointerEvents: "none",
//           }}
//         />
//       )}

//       {/* Bottom Fade */}
//       {showBottom && (
//         <Box
//           sx={{
//             position: "absolute",
//             bottom: 0,
//             left: 0,
//             right: 6,
//             height: 20,
//             background:
//               "linear-gradient(to top, rgba(255,255,255,0.9), transparent)",
//             pointerEvents: "none",
//           }}
//         />
//       )}

//       {/* Scroll Buttons */}
//       {showTop && (
//         <IconButton
//           size="small"
//           onClick={() => scroll("up")}
//           sx={{
//             position: "absolute",
//             right: -8,
//             top: 10,
//             bgcolor: "background.paper",
//             boxShadow: 2,
//           }}
//         >
//           <KeyboardArrowUpIcon fontSize="small" />
//         </IconButton>
//       )}

//       {showBottom && (
//         <IconButton
//           size="small"
//           onClick={() => scroll("down")}
//           sx={{
//             position: "absolute",
//             right: -8,
//             bottom: 10,
//             bgcolor: "background.paper",
//             boxShadow: 2,
//           }}
//         >
//           <KeyboardArrowDownIcon fontSize="small" />
//         </IconButton>
//       )}
//     </Box>
//   );
// };

// export default SmartScrollContainer;
