import { useState, type ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useLocale } from "../../i18n/index.js";
import type { Translations } from "../../i18n/locales/en.js";
import BottomSheet from "./BottomSheet.js";
import { ParseStickers } from "../own/ParseStickers.js";
import ImportExportDrawer from "../own/ImportExportDrawer.js";
import LangSelector from "./LangSelector.js";

type DialogId = "own" | "import-export";

type NavItem =
  | {
      kind: "route";
      id: string;
      labelKey: keyof Translations;
      shortKey: keyof Translations;
      to: string;
      icon: ReactNode;
    }
  | {
      kind: "dialog";
      id: DialogId;
      labelKey: keyof Translations;
      shortKey: keyof Translations;
      titleKey: keyof Translations;
      icon: ReactNode;
    };

const iconClass = "w-5 h-5";

function HomeIcon() {
  return (
    <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h3a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V10"
      />
    </svg>
  );
}

function CompareIcon() {
  return (
    <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 7h12m0 0l-4-4m4 4l-4 4M16 17H4m0 0l4 4m-4-4l4-4"
      />
    </svg>
  );
}

function OwnIcon() {
  return (
    <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 4v16m8-8H4"
      />
    </svg>
  );
}

function ImportExportIcon() {
  return (
    <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
      />
    </svg>
  );
}

const ITEMS: NavItem[] = [
  {
    kind: "route",
    id: "home",
    labelKey: "btnHome",
    shortKey: "navHome",
    to: "/",
    icon: <HomeIcon />,
  },
  {
    kind: "route",
    id: "compare",
    labelKey: "btnCompare",
    shortKey: "navCompare",
    to: "/compare",
    icon: <CompareIcon />,
  },
  {
    kind: "dialog",
    id: "own",
    labelKey: "btnOwn",
    shortKey: "navOwn",
    titleKey: "dialogOwn",
    icon: <OwnIcon />,
  },
  {
    kind: "dialog",
    id: "import-export",
    labelKey: "btnImportExport",
    shortKey: "navImportExport",
    titleKey: "dialogImportExport",
    icon: <ImportExportIcon />,
  },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { t } = useLocale();
  const [dialog, setDialog] = useState<DialogId | null>(null);

  const open = ITEMS.find(
    (item): item is Extract<NavItem, { kind: "dialog" }> =>
      item.kind === "dialog" && item.id === dialog,
  );

  function isActive(item: NavItem): boolean {
    if (item.kind === "route") {
      if (item.to === "/") return pathname === "/";
      return pathname === item.to || pathname.startsWith(`${item.to}/`);
    }
    return dialog === item.id;
  }

  return (
    <>
      <nav
        className="md:hidden relative z-50 shrink-0 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)]"
        aria-label="Main"
      >
        <ul className="grid grid-cols-5 h-14">
          {ITEMS.map((item) => {
            const active = isActive(item);
            return (
              <li key={item.id} className="min-w-0">
                <button
                  type="button"
                  onClick={() => {
                    if (item.kind === "route") navigate(item.to);
                    else setDialog(item.id);
                  }}
                  className={`w-full h-full flex flex-col items-center justify-center gap-0.5 px-0.5 ${
                    active ? "text-gold" : "text-muted"
                  }`}
                  aria-current={item.kind === "route" && active ? "page" : undefined}
                  aria-label={t(item.labelKey)}
                  title={t(item.labelKey)}
                >
                  {item.icon}
                  <span className="text-[9px] leading-tight font-medium truncate max-w-full px-0.5">
                    {t(item.shortKey)}
                  </span>
                </button>
              </li>
            );
          })}
          <li className="min-w-0 flex items-center justify-center">
            <LangSelector />
          </li>
        </ul>
      </nav>
      <BottomSheet
        open={dialog !== null}
        onClose={() => setDialog(null)}
        title={open ? t(open.titleKey) : undefined}
      >
        {dialog === "own" && <ParseStickers />}
        {dialog === "import-export" && <ImportExportDrawer />}
      </BottomSheet>
    </>
  );
}
