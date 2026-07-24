import { Box, CircularProgress } from "@mui/material";
import { useLoadingVisibility } from "./LoadingProvider";

interface PageLoaderProps {
  /** Height of the centered spinner area. Defaults to filling a typical route/tab content region. */
  height?: number | string;
}

/**
 * Route/page-level loader: shown only for a page's *initial* data load
 * (registered via usePageLoading), inside the content area — header/sidebar
 * chrome stays visible, unlike GlobalLoader. Renders nothing while a Global
 * Loader is active (Global always wins) or while no page loader is registered.
 */
const PageLoader = ({ height = "50vh" }: PageLoaderProps) => {
  const { globalActive, pageActive } = useLoadingVisibility();
  if (globalActive || !pageActive) return null;

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height,
      }}
    >
      <CircularProgress />
    </Box>
  );
};

export default PageLoader;
