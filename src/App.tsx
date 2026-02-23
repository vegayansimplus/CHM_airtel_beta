import React, {  useState } from "react";
import {
  Route,
  BrowserRouter,
  Routes,
} from "react-router";
import { BgColorProvider } from "./context/BgColorContext";
import { ColorModeContext, useMode } from "./style/theme";
import { CssBaseline, ThemeProvider } from "@mui/material";
import Header from "./components/layout/Header";
import SideBar from "./components/layout/SideBar";
import { Home } from "@mui/icons-material";
import GlobalBackdrop from "./components/common/GlobalBackdrop";
import AppRoutes from "./routes/AppRoutes";
import { PublicRoute } from "./routes/PublicRoute";
import LoginPage from "./features/auth/pages/LoginPage";
import { useAppSelector } from "./app/hooks";


const App: React.FC = () => {
  const isAuth = useAppSelector((s) => s.auth.isAuthenticated);

  const [theme, colorMode] = useMode();
  const [dynamicHeaderText, setDynamicHeaderText] = useState("CHM");
  const [dynamicHeaderIcon, setDynamicHeaderIcon] = useState(<Home />);
  const [loading, setLoading] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

  return (
    <BgColorProvider>
      <BrowserRouter basename="airtelchm">
        <ColorModeContext.Provider value={colorMode}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <div className="app">
              <GlobalBackdrop />

              {isAuth && (
                <>
                  <Header
                    dynamicHeaderText={dynamicHeaderText}
                    dynamicHeaderIcon={dynamicHeaderIcon}
                    setLoading={setLoading}
                    loading={loading}
                  />
                  <SideBar
                    isCollapsed={isSidebarCollapsed}
                    onCollapseToggle={() =>
                      setIsSidebarCollapsed(!isSidebarCollapsed)
                    }
                  />
                </>
              )}

              <main className="content">
                <Routes>
                  <Route
                    path="/login"
                    element={<PublicRoute element={<LoginPage />} />}
                  />
                  <Route
                    path="/*"
                    element={
                      <AppRoutes
                        setDynamicHeaderText={setDynamicHeaderText}
                        setDynamicHeaderIcon={setDynamicHeaderIcon}
                      />
                    }
                  />
                </Routes>
              </main>
            </div>
          </ThemeProvider>
        </ColorModeContext.Provider>
      </BrowserRouter>
    </BgColorProvider>
  );
};
export default App;

