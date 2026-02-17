import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { Provider } from "react-redux";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { store } from "./app/store.ts";
import { CssBaseline } from "@mui/material";
import AuthHydrator from "./features/auth/utils/AuthHydrator.tsx";
import GlobalLoader from "./components/common/GlobalLoader";

createRoot(document.getElementById("root")!).render(
  <>
    <Provider store={store}>
      <CssBaseline />
      <AuthHydrator />
      <GlobalLoader/>
      <App />
      <ToastContainer
        autoClose={2000}
        closeOnClick
        pauseOnHover
        draggable
        position="top-right"
      />
    </Provider>
  </>
);
