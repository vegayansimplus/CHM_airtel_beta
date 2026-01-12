import { useSelector } from "react-redux";
import { Backdrop } from "@mui/material";
import { FadeLoader } from "react-spinners";
import { selectIsLoading } from "../../app/loadingSlice";
const GlobalLoader = () => {
  const isLoading = useSelector(selectIsLoading);
  return (
    <Backdrop
      sx={{
        color: "#fff",
        zIndex: (theme) => theme.zIndex.drawer + 9999,
      }}
      open={isLoading}
    >
      <FadeLoader
        loading={isLoading}
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
