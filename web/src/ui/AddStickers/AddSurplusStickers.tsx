import { useState } from 'react'
import { useSurplusStickers, useOwnStickers } from '../../application/useStickers.js'
import { parseSurplusText } from '../../application/stickerService.js'

export default function AddSurplusStickers() {
  const { addSurplusText } = useSurplusStickers()
  const { inv } = useOwnStickers()
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
          placeholder="RSA5 (x1), RSA12 (x1) …"
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {preview && (
          <p className="text-xs text-blue-700">
            Parse: {preview.codes.length} codes — {preview.codes.slice(0, 10).join(', ')}
            {preview.codes.length > 10 && ` … +${preview.codes.length - 10} more`}
          </p>
        )}

        <button
          type="submit"
          disabled={!text.trim()}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
        >
          Add Surplus
        </button>
      </form>

      {Object.keys(inv).length > 0 && (
        <details className="text-xs text-gray-500">
          <summary className="cursor-pointer hover:text-gray-700">View inventory</summary>
          <div className="mt-1 max-h-32 overflow-y-auto">
            {Object.entries(inv)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([code, qty]) => (
                <div key={code} className="flex justify-between px-1 py-0.5">
                  <span>{code}</span>
                  <span className="text-gray-400">{qty > 1 ? `x${qty}` : ''}</span>
                </div>
              ))}
          </div>
        </details>
      )}
    </div>
  )
}
