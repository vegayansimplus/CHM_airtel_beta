// src/app/AppProvider.tsx
// src/app/AppProvider.tsx
import type { ReactNode } from "react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router";
import { store } from "./store";

interface Props {
  children: ReactNode;
}

const AppProvider = ({ children }: Props) => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </Provider>
  );
};

export default AppProvider;
