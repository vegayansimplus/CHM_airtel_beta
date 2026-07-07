import React, { useCallback, useState } from "react";
import { Route, BrowserRouter, Routes } from "react-router";
import { ColorModeContext, useMode } from "./style/theme";
import { CssBaseline, ThemeProvider } from "@mui/material";
import Header from "./components/layout/Header";
import SideBar from "./components/layout/SideBar";
import { Home } from "@mui/icons-material";
import AppRoutes from "./routes/AppRoutes";
import { PublicRoute } from "./routes/PublicRoute";
import LoginPage from "./features/auth/pages/LoginPage";
import { useAppSelector } from "./app/hooks";
import { AppScrollView } from "./components/ui/AppScrollView";

const App: React.FC = () => {
  const isAuth = useAppSelector((s) => s.auth.isAuthenticated);

  const [theme, colorMode] = useMode();
  const [dynamicHeaderText, setDynamicHeaderText] = useState("CHM");
  const [dynamicHeaderIcon, setDynamicHeaderIcon] = useState(<Home />);
  const [loading, setLoading] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const handleSidebarCollapseToggle = useCallback(
    () => setIsSidebarCollapsed((prev) => !prev),
    [],
  );

  return (
    <BrowserRouter basename="airtelchm">
      <ColorModeContext.Provider value={colorMode}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <div className="app">
            {isAuth && (
              <>
                <Header
                  dynamicHeaderText={dynamicHeaderText}
                  dynamicHeaderIcon={dynamicHeaderIcon}
                  setLoading={setLoading}
                  loading={loading}
                  isSidebarCollapsed={isSidebarCollapsed}
                />
                <SideBar
                  isCollapsed={isSidebarCollapsed}
                  onCollapseToggle={handleSidebarCollapseToggle}
                />
              </>
            )}

            <AppScrollView>
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
            </AppScrollView>
          </div>
        </ThemeProvider>
      </ColorModeContext.Provider>
    </BrowserRouter>
  );
};
export default App;
