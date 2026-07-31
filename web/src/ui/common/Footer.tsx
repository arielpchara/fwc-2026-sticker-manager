import { useLocale } from "../../i18n/index.js";

export default function Footer({ className = "" }: { className?: string }) {
  const { t } = useLocale();
  return (
    <footer
      className={`text-center text-[10px] leading-none text-muted py-1.5 border-t border-border shrink-0 ${className}`}
    >
      {t("appTitle")} · v{__APP_VERSION__}
    </footer>
  );
}
