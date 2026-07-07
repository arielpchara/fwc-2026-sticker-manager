import { useLocale } from '../../i18n/index.js'
import ProgressBar from './ProgressBar.js'

export default function AlbumProgress({ owned, total }: { owned: number; total: number }) {
  const { t } = useLocale()
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-xs font-medium tabular-nums">{t('albumProgress', { owned, total })}</span>
      <ProgressBar value={owned} max={total} size="md" />
    </div>
  )
}
