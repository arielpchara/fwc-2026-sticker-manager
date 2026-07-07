import { useState } from 'react'
import { useOwnStickers } from '../../../application/useStickers.js'
import { parseOwnText } from '../../../application/stickerService.js'
import { useLocale } from '../../../i18n/index.js'

type Action = 'update' | 'add' | 'remove'

export default function AddOwnStickers() {
  const { t } = useLocale()
  const { updateOwn, addStickers, removeStickers, stickers, inv } = useOwnStickers()
  const [text, setText] = useState('')
  const [preview, setPreview] = useState<{ count: number; stickers: string[] } | null>(null)

  function handlePreview() {
    const result = parseOwnText(text)
    setPreview(result.count > 0 ? result : null)
  }

  function handleAction(action: Action) {
    if (!text.trim()) return
    const fn = action === 'update' ? updateOwn : action === 'add' ? addStickers : removeStickers
    const result = fn(text)
    if (result.count > 0) {
      setText('')
      setPreview(null)
    }
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onInput={handlePreview}
          placeholder={t('ownPlaceholder')}
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />

        {preview && (
          <p className="text-xs text-green-700">
            {t('parseFeedback', { n: preview.count, list: preview.stickers.slice(0, 10).join(', ') })}
            {preview.stickers.length > 10 && t('parseMore', { n: preview.stickers.length - 10 })}
          </p>
        )}

        <div className="flex gap-2">
          <button
            onClick={() => handleAction('update')}
            disabled={!text.trim()}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
          >
            {t('updateBtn')}
          </button>
          <button
            onClick={() => handleAction('add')}
            disabled={!text.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
          >
            {t('addBtn')}
          </button>
          <button
            onClick={() => handleAction('remove')}
            disabled={!text.trim()}
            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
          >
            {t('removeBtn')}
          </button>
        </div>
      </div>

      {stickers.length > 0 && (
        <details className="text-xs text-gray-500">
          <summary className="cursor-pointer hover:text-gray-700">{t('viewAll', { n: stickers.length })}</summary>
          <div className="mt-1 max-h-32 overflow-y-auto">
            {stickers.map((c) => (
              <div key={c} className="flex justify-between px-1 py-0.5">
                <span>{c}</span>
                <span className="text-gray-400">{inv[c] > 1 ? `x${inv[c]}` : ''}</span>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  )
}
