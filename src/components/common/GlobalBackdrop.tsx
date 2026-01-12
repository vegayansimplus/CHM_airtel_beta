import React, { useEffect, useState } from "react";
import { Backdrop } from "@mui/material"; 

const GlobalBackdrop: React.FC = () => {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    // Hide backdrop after 1.5 seconds
    const timer = setTimeout(() => {
      setOpen(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Add CSS for bouncing ball animation
    const styles = `
      @keyframes bounce {
        0%, 100% {
          transform: translateY(0);
        }
        50% {
          transform: translateY(-20px);
        }
      }
    `;
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);

    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  return (
    <Backdrop
      sx={{
        color: "#fff",
        zIndex: 10000,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
      open={open}
    >
      <div
        style={{
          width: "20px",
          height: "20px",
          backgroundColor: "#fff",
          borderRadius: "50%",
          animation: "bounce 1s infinite",
        }}
      />
      <p style={{ marginTop: "10px", color: "#fff", fontSize: "16px" }}>
        Loading, please wait...
      </p>
    </Backdrop>
  );
};

export default GlobalBackdrop;
