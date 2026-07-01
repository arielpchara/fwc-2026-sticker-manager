import { useState } from 'react'
import { useOwnStickers } from '../../application/useStickers.js'
import { parseOwnText } from '../../application/stickerService.js'

export default function AddOwnStickers() {
  const { addOwn, stickers, inv } = useOwnStickers()
  const [text, setText] = useState('')
  const [preview, setPreview] = useState<{ count: number; stickers: string[] } | null>(null)

  function handlePreview() {
    const result = parseOwnText(text)
    setPreview(result.count > 0 ? result : null)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const result = addOwn(text)
    if (result.count > 0) {
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
          placeholder="BRA1, BRA2, ARG1, FWC3, 00 …"
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />

        {preview && (
          <p className="text-xs text-green-700">
            Parse: {preview.count} codes — {preview.stickers.slice(0, 10).join(', ')}
            {preview.stickers.length > 10 && ` … +${preview.stickers.length - 10} more`}
          </p>
        )}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={!text.trim()}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
          >
            Save
          </button>
        </div>
      </form>

      {stickers.length > 0 && (
        <details className="text-xs text-gray-500">
          <summary className="cursor-pointer hover:text-gray-700">View all ({stickers.length})</summary>
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
