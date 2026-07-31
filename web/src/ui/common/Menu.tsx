import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useLocale } from "../../i18n/index.js";
import type { Translations } from "../../i18n/locales/en.js";
import LangSelector from "./LangSelector.js";
import Modal from "./Modal.js";
import { ParseStickers } from "../own/ParseStickers.js";
import ImportExportDrawer from "../own/ImportExportDrawer.js";

type DialogId = "own" | "import-export";

const ROUTES: { labelKey: keyof Translations; to: string }[] = [
  { labelKey: "btnHome", to: "/" },
  { labelKey: "btnCompare", to: "/compare" },
];

const DIALOGS: {
  id: DialogId;
  labelKey: keyof Translations;
  titleKey: keyof Translations;
}[] = [
  { id: "own", labelKey: "btnOwn", titleKey: "dialogOwn" },
  {
    id: "import-export",
    labelKey: "btnImportExport",
    titleKey: "dialogImportExport",
  },
];

export default function Menu() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { t } = useLocale();
  const [dialog, setDialog] = useState<DialogId | null>(null);

  const open = DIALOGS.find((d) => d.id === dialog);

  return (
    <>
      <nav className="flex items-center gap-1">
        {ROUTES.map((item) => (
          <button
            key={item.labelKey}
            onClick={() => navigate(item.to)}
            className={`px-2.5 py-1 text-sm rounded-md whitespace-nowrap hover:bg-surface-2 ${
              pathname === item.to ? "text-gold font-medium" : "text-fg"
            }`}
          >
            {t(item.labelKey)}
          </button>
        ))}
        {DIALOGS.map((item) => (
          <button
            key={item.id}
            onClick={() => setDialog(item.id)}
            className={`px-2.5 py-1 text-sm rounded-md whitespace-nowrap hover:bg-surface-2 ${
              dialog === item.id ? "text-gold font-medium" : "text-fg"
            }`}
          >
            {t(item.labelKey)}
          </button>
        ))}
        <LangSelector />
      </nav>
      <Modal
        open={dialog !== null}
        onClose={() => setDialog(null)}
        title={open ? t(open.titleKey) : undefined}
      >
        {dialog === "own" && <ParseStickers />}
        {dialog === "import-export" && <ImportExportDrawer />}
      </Modal>
    </>
  );
}
