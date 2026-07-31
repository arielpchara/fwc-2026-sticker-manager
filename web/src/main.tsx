import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { registerSW } from "virtual:pwa-register";
import { store, persistor } from "./storage/store.js";
import { LocaleProvider } from "./i18n/index.js";
import App from "./App.js";

registerSW({ immediate: true });

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <LocaleProvider>
          <App />
        </LocaleProvider>
      </PersistGate>
    </Provider>
  </StrictMode>,
);

