import { useOwnStickers } from '../../application/useStickers.js'
import { TOTAL_STICKERS } from '../../data/stickers.js'
import { useLocale } from '../../i18n/index.js'
import ProgressBar from './ProgressBar.js'

export default function AlbumProgress() {
  const { t } = useLocale()
  const { inv, extras } = useOwnStickers()
  const owned = Object.keys(inv).length
  return (
    <div className="flex flex-col gap-0.5 w-full">
      <span className="text-xs font-medium tabular-nums text-center">{t('albumProgress', { owned, total: TOTAL_STICKERS, extras: extras.length })}</span>
      <ProgressBar value={owned} max={TOTAL_STICKERS} size="md" />
    </div>
  )
}
