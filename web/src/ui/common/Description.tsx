import { useLocale } from "../../i18n/index.js";

export default function Description({ compact = false }: { compact?: boolean }) {
  const { t } = useLocale();
  if (compact) return null;
  return (
    <div className="w-full bg-gold-soft border-b border-border px-4 py-2 text-center shrink-0">
      <p className="text-gold text-xs font-medium">{t("description")}</p>
    </div>
  );
}
