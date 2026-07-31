import { type ReactNode } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import MainPage from "./ui/pages/MainPage.js";
import ComparePage from "./ui/pages/ComparePage.js";
import TradeDrawer from "./ui/trade/TradeDrawer.js";
import Drawer from "./ui/common/Drawer.js";
import { useLocale } from "./i18n/index.js";
import type { Translations } from "./i18n/locales/en.js";
import ValidateText from "./ui/compare/ValidateText.js";

function DrawerPage({
  title,
  children,
}: {
  title: keyof Translations;
  children: ReactNode;
}) {
  const { t } = useLocale();
  const navigate = useNavigate();
  return (
    <Drawer open onClose={() => navigate("..")} title={<span>{t(title)}</span>}>
      {children}
    </Drawer>
  );
}

const basename = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function App() {
  return (
    <BrowserRouter basename={basename}>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/compare" element={<ComparePage />}>
          <Route
            path="validate"
            element={
              <DrawerPage title="dialogValidate">
                <ValidateText />
              </DrawerPage>
            }
          />
          <Route path=":name" element={<TradeDrawer />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
