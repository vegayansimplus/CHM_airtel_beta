import { Backdrop } from "@mui/material";
import { FadeLoader } from "react-spinners";
import { useLoadingVisibility } from "./LoadingProvider";

/**
 * Highest-priority loader: app bootstrap / auth hydration only (see
 * useGlobalLoading call sites). Full-screen — while this is up, PageLoader
 * and component-level skeletons self-suppress via useLoadingVisibility.
 */
const GlobalLoader = () => {
  const { globalActive } = useLoadingVisibility();
  return (
    <Backdrop
      sx={{
        color: "#fff",
        zIndex: (theme) => theme.zIndex.drawer + 9999,
      }}
      open={globalActive}
    >
      <FadeLoader
        loading={globalActive}
        cssOverride={{
          display: "block",
          margin: "0 auto",
          borderColor: "#28292bff",
        }}
        height={12}
        width={5}
        radius={2}
        color="#2c3034ff"
        aria-label="Loading Spinner"
        data-testid="loader"
      />
    </Backdrop>
  );
};
export default GlobalLoader;
