import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "antd/dist/reset.css";
import "./index.css";
import App from "./App";
import { ConfigProvider, theme } from "antd";
import ruRU from "antd/locale/ru_RU";
import dayjs from "dayjs";
import "dayjs/locale/ru";

import { Provider } from "react-redux";
import { store } from "./store/index.ts";
import { AssigneesProvider } from "./contexts/AssigneesContext";

dayjs.locale("ru");

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ConfigProvider
      locale={ruRU}
      theme={{
        algorithm: theme.darkAlgorithm,
      }}
    >
      <Provider store={store}>
        <AssigneesProvider>
          <App />
        </AssigneesProvider>
      </Provider>
    </ConfigProvider>
  </StrictMode>,
);
