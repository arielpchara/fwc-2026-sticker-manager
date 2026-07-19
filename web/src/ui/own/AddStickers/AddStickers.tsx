import { useState } from 'react'
import { useOwnStickers, useSurplusStickers } from '../../../application/useStickers.js'
import { parseOwnText, parseSurplusText } from '../../../application/stickerService.js'
import { useLocale } from '../../../i18n/index.js'

type Mode = 'own' | 'surplus'
type Action = 'overwrite' | 'merge' | 'remove'

export default function AddStickers() {
  const { t } = useLocale()
  const { updateOwn, addStickers, removeStickers, stickers, inv } = useOwnStickers()
  const { addSurplusText, overwriteSurplus } = useSurplusStickers()
  const [mode, setMode] = useState<Mode>('own')
  const [text, setText] = useState('')
  const [result, setResult] = useState<{ count: number; codes: string[] } | null>(null)
  const [preview, setPreview] = useState<{ count: number; codes: string[] } | null>(null)

  function handleTextChange(value: string) {
    setText(value)
    setResult(null)
    if (!value.trim()) { setPreview(null); return }
    const parsed = mode === 'own' ? parseOwnText(value) : parseSurplusText(value)
    const codes = 'stickers' in parsed ? parsed.stickers : parsed.codes
    setPreview(codes.length > 0 ? { count: codes.length, codes } : null)
  }

  function handleModeSwitch(newMode: Mode) {
    setMode(newMode)
    setResult(null)
  }

  function handleAction(action: Action) {
    if (!text.trim()) return
    if (mode === 'own') {
      const parsed = parseOwnText(text)
      if (parsed.count === 0) return
      const fn = action === 'overwrite' ? updateOwn : action === 'merge' ? addStickers : removeStickers
      fn(text)
      setText('')
      setResult({ count: parsed.count, codes: parsed.stickers })
    } else {
      const parsed = parseSurplusText(text)
      if (parsed.codes.length === 0) return
      const fn = action === 'overwrite' ? overwriteSurplus : action === 'merge' ? addSurplusText : removeStickers
      fn(text)
      setText('')
      setResult({ count: parsed.codes.length, codes: parsed.codes })
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <button
          onClick={() => handleModeSwitch('own')}
          className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-lg transition ${
            mode === 'own'
              ? 'bg-gold text-bg'
              : 'bg-surface text-muted border border-border hover:border-gold'
          }`}
        >
          {t('modeOwn')}
        </button>
        <button
          onClick={() => handleModeSwitch('surplus')}
          className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-lg transition ${
            mode === 'surplus'
              ? 'bg-gold text-bg'
              : 'bg-surface text-muted border border-border hover:border-gold'
          }`}
        >
          {t('modeExtras')}
        </button>
      </div>

      <div className="space-y-2">
          <textarea
          value={text}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder={mode === 'own' ? t('ownPlaceholder') : t('extrasPlaceholder')}
          rows={3}
          className="w-full border border-border bg-surface rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold"
        />

        {preview && (
          <p className="text-xs text-gold">
            {t('parseFeedback', { n: preview.count, list: preview.codes.slice(0, 10).join(', ') })}
            {preview.codes.length > 10 && t('parseMore', { n: preview.codes.length - 10 })}
          </p>
        )}

        <div className="flex gap-2">
          <button
            onClick={() => handleAction('overwrite')}
            disabled={!text.trim()}
            className="bg-gold hover:bg-gold-bright disabled:bg-surface-2 text-bg text-sm font-medium px-4 py-2 rounded-lg transition"
          >
            {t('overwriteBtn')}
          </button>
          <button
            onClick={() => handleAction('merge')}
            disabled={!text.trim()}
            className="bg-gold-dim hover:bg-gold disabled:bg-surface-2 text-fg text-sm font-medium px-4 py-2 rounded-lg transition"
          >
            {t('addBtn')}
          </button>
          <button
            onClick={() => handleAction('remove')}
            disabled={!text.trim()}
            className="bg-red-600 hover:bg-red-700 disabled:bg-surface-2 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
          >
            {t('removeBtn')}
          </button>
        </div>
      </div>

      {result && (
        <div className="bg-surface-2 rounded-lg p-3 space-y-1">
          <p className="text-xs text-gold">
            {t('resultFeedback', { n: result.count })}
          </p>
          <div className="max-h-32 overflow-y-auto flex flex-wrap gap-1">
            {result.codes.map((code) => (
              <span key={code} className="text-xs text-muted bg-surface px-1.5 py-0.5 rounded">
                {code}
              </span>
            ))}
          </div>
        </div>
      )}

      {mode === 'surplus' && Object.keys(inv).length > 0 && (
        <details className="text-xs text-muted">
          <summary className="cursor-pointer hover:text-fg">{t('viewAll', { n: stickers.length })}</summary>
          <div className="mt-1 max-h-32 overflow-y-auto">
            {stickers.map((c) => (
              <div key={c} className="flex justify-between px-1 py-0.5">
                <span>{c}</span>
                <span className="text-muted">{inv[c] > 1 ? `x${inv[c]}` : ''}</span>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  )
}
