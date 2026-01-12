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
// import GlobalLoader from "./components/common/GlobalLoader";
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



// import React, { useEffect, useState, Suspense } from "react";
// import {
//   Route,
//   BrowserRouter,
//   Routes,
//   useNavigate,
//   Navigate,
// } from "react-router";
// import { BgColorProvider } from "./context/BgColorContext";
// import { ColorModeContext, useMode } from "./style/theme";
// import { CssBaseline, ThemeProvider } from "@mui/material";
// import Header from "./components/layout/Header";
// import SideBar from "./components/layout/SideBar";
// import { Home } from "@mui/icons-material";
// import GlobalBackdrop from "./components/common/GlobalBackdrop";
// import AppRoutes from "./routes/AppRoutes";
// // import GlobalLoader from "./components/common/GlobalLoader";
// import { PublicRoute } from "./routes/PublicRoute";
// import LoginPage from "./features/auth/pages/LoginPage";

// const AuthManager = ({
//   isAuthenticated,
//   setIsAuthenticated,
// }: {
//   isAuthenticated: boolean;
//   setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
// }) => {
//   const navigate = useNavigate();
//   useEffect(() => {
//     const user = localStorage.getItem("user");
//     if (user) {
//       setIsAuthenticated(true);
//     } else {
//       setIsAuthenticated(false);
//     }
//   }, [setIsAuthenticated]);

//   useEffect(() => {
//     const syncAuth = (event: StorageEvent) => {
//       if (event.key === "user") {
//         if (event.newValue) {
//           // User logged in on another tab
//           setIsAuthenticated(true);
//         } else {
//           // User logged out on another tab
//           setIsAuthenticated(false);
//           // Force navigate to login to clear state and show login page
//           navigate("/login", { replace: true });
//         }
//       }
//     };

//     window.addEventListener("storage", syncAuth);

//     // Cleanup listener on component unmount
//     return () => {
//       window.removeEventListener("storage", syncAuth);
//     };
//   }, [navigate, setIsAuthenticated]);

//   return null;
// };

// const App: React.FC = () => {
//   const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
//     !!localStorage.getItem("user")
//   );
//   const [theme, colorMode] = useMode();
//   const [dynamicHeaderText, setDynamicHeaderText] = useState("CHM");
//   const [dynamicHeaderIcon, setDynamicHeaderIcon] = useState(<Home />);
//   const [loading, setLoading] = useState<boolean>(false);
//   const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(true);
//   const [notificationCount, setNotificationCount] = useState<number>(0);

//   const handleCollapseToggle = () => {
//     setIsSidebarCollapsed(!isSidebarCollapsed);
//   };

//   return (
//     <BgColorProvider>
//       <BrowserRouter basename="airtelchm">
//         <ColorModeContext.Provider value={colorMode}>
//           <ThemeProvider theme={theme}>
//             {/* this apiStatusWrapper is added server unavailable page */}
//             {/* <ApiStatusWrapper> */}
//             {/* <GlobalLoader /> */}
//             <CssBaseline />
//             {/* <AuthHandler setIsAuthenticated={setIsAuthenticated} /> */}
//             <AuthManager
//               isAuthenticated={isAuthenticated}
//               setIsAuthenticated={setIsAuthenticated}
//             />
//             <div className="app">
//               <GlobalBackdrop />
//               {isAuthenticated ? (
//                 <>
//                   <Header
//                     dynamicHeaderText={dynamicHeaderText}
//                     dynamicHeaderIcon={dynamicHeaderIcon}
//                     setIsAuthenticated={setIsAuthenticated}
//                     setLoading={setLoading}
//                     loading={loading}
//                   />
//                   <div className="main-content">
//                     <SideBar
//                       isCollapsed={isSidebarCollapsed}
//                       onCollapseToggle={handleCollapseToggle}
//                       notificationCount={notificationCount}
//                       bgColor={theme.palette.background.default}
//                     />
//                     <main
//                       className={`content ${
//                         isSidebarCollapsed ? "collapsed" : ""
//                       }`}
//                     >
//                       <Suspense
//                         fallback={
//                           <div>
//                             <GlobalBackdrop />
//                           </div>
//                         }
//                       >
//                         <AppRoutes
//                           setDynamicHeaderText={setDynamicHeaderText}
//                           setDynamicHeaderIcon={setDynamicHeaderIcon}
//                           setNotificationCount={setNotificationCount}
//                         />
//                       </Suspense>
//                     </main>
//                   </div>
//                 </>
//               ) : (
//                 <Suspense
//                   fallback={
//                     <div>
//                       <GlobalBackdrop />
//                     </div>
//                   }
//                 >
//                   <Routes>
//                     {/* <Route
//                       path="/login"
//                       element={
//                         <LoginPage setIsAuthenticated={setIsAuthenticated} />
//                       }

//                     /> */}

//                     <Route
//                       path="/login"
//                       element={
//                         <PublicRoute
//                           element={
//                             <LoginPage
//                               setIsAuthenticated={() => {
//                                 setIsAuthenticated(true);
//                               }}
//                             />
//                           }
//                         />
//                       }
//                     />
//                     {/* <Route path="*" element={<NotFound />} /> */}
//                     <Route
//                       path="*"
//                       element={<Navigate to="/login" replace />}
//                     />
//                   </Routes>
//                 </Suspense>
//               )}
//               {/* <ToastContainer /> */}
//             </div>
//             {/* </ApiStatusWrapper> */}
//           </ThemeProvider>
//         </ColorModeContext.Provider>
//       </BrowserRouter>
//     </BgColorProvider>
//   );
// };

// export default App;
