import { type ReactNode } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import MainPage from "./ui/pages/MainPage.js";
import ComparePage from "./ui/pages/ComparePage.js";
import TradeDrawer from "./ui/trade/TradeDrawer.js";
import GridPage from "./ui/pages/GridPage.js";
import Drawer from "./ui/common/Drawer.js";
import { useLocale } from "./i18n/index.js";
import type { Translations } from "./i18n/locales/en.js";
import AddStickers from "./ui/own/AddStickers/AddStickers.js";
import ImportExportDrawer from "./ui/own/ImportExportDrawer.js";

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
        <Route path="/" element={<MainPage />}>
          <Route
            path="own"
            element={
              <DrawerPage title="dialogOwn">
                <AddStickers />
              </DrawerPage>
            }
          />
          <Route
            path="import-export"
            element={
              <DrawerPage title="dialogImportExport">
                <ImportExportDrawer />
              </DrawerPage>
            }
          />
        </Route>
        <Route path="/grid" element={<GridPage />} />
        <Route path="/compare" element={<ComparePage />}>
          <Route path=":name" element={<TradeDrawer />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
