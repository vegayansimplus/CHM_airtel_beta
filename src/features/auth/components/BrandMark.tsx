import React from "react";
import { Box, Typography } from "@mui/material";
import AirtelLogo from "../../../assets/svg/AiretLogoSvg.svg";
import VegayanLogo from "../../../assets/images/logo_vega.png";

interface Props {
  variant: "airtel" | "vegayan";
}

// Bordered logo pill used on the hero panel. Kept as one component so the
// shared box/hover treatment isn't duplicated per brand, while each brand
// keeps its own distinct wordmark styling.
const BrandMark: React.FC<Props> = ({ variant }) => {
  const isAirtel = variant === "airtel";
  const accent = isAirtel ? "228,0,0" : "24,95,165";

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.2,
        bgcolor: "#fff",
        border: `1px solid rgba(${accent},0.12)`,
        borderRadius: "12px",
        px: 1.8,
        py: 1,
        boxShadow: `0 2px 12px rgba(${accent},0.07)`,
        transition: "box-shadow 0.2s, transform 0.2s",
        "&:hover": {
          boxShadow: `0 4px 20px rgba(${accent},0.14)`,
          transform: "translateY(-1px)",
        },
      }}
    >
      <img
        src={isAirtel ? AirtelLogo : VegayanLogo}
        alt={isAirtel ? "Airtel Logo" : "Vegayan Logo"}
        style={{ width: 24, height: 24 }}
      />
      <Box>
        {isAirtel ? (
          <>
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
          </>
        ) : (
          <>
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
          </>
        )}
      </Box>
    </Box>
  );
};

export default BrandMark;
