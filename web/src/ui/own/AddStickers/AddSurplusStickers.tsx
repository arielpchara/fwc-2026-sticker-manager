import { useState } from 'react'
import { useSurplusStickers, useOwnStickers } from '../../../application/useStickers.js'
import { parseSurplusText } from '../../../application/stickerService.js'
import { useLocale } from '../../../i18n/index.js'

export default function AddSurplusStickers() {
  const { t } = useLocale()
  const { addSurplusText } = useSurplusStickers()
  const { inv, extras } = useOwnStickers()
  const [text, setText] = useState('')
  const [preview, setPreview] = useState<{ codes: string[] } | null>(null)

  function handlePreview() {
    const result = parseSurplusText(text)
    setPreview(result.codes.length > 0 ? result : null)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const result = addSurplusText(text)
    if (result.codes.length > 0) {
      setText('')
      setPreview(null)
    }
  }

  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit} className="space-y-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onInput={handlePreview}
          placeholder={t('extrasPlaceholder')}
          rows={3}
          className="w-full border border-border bg-surface rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold"
        />

        {preview && (
          <p className="text-xs text-gold">
            {t('parseFeedback', { n: preview.codes.length, list: preview.codes.slice(0, 10).join(', ') })}
            {preview.codes.length > 10 && t('parseMore', { n: preview.codes.length - 10 })}
          </p>
        )}

        <button
          type="submit"
          disabled={!text.trim()}
          className="bg-gold-dim hover:bg-gold disabled:bg-surface-2 text-fg text-sm font-medium px-4 py-2 rounded-lg transition"
        >
          {t('addExtrasBtn')}
        </button>
      </form>

      {Object.keys(extras).length > 0 && (
        <div className="mt-1 flex flex-wrap gap-2 text-fg text-xs">
            {extras
              .map(({qty, code}) => (
                <span key={code} className="">
                  <span>{code}</span>
                  <span className="text-muted">{qty > 1 ? `x${qty}` : ''}</span>
                </span>
              ))}
            </div>
      )}
    </div>
  )
}
