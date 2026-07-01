export default function Header({ onOwnClick, onSurplusClick }: { onOwnClick?: () => void; onSurplusClick?: () => void }) {
  return (
    <header className="bg-gradient-to-r from-green-700 to-green-600 text-white px-6 py-4 shadow-md flex items-center justify-between">
      <h1 className="text-2xl font-bold tracking-tight">Cup 2026 — Sticker Trade</h1>
      <div className="flex items-center gap-2">
        {onOwnClick && (
          <button onClick={onOwnClick} className="bg-white/20 hover:bg-white/30 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Own
          </button>
        )}
        {onSurplusClick && (
          <button onClick={onSurplusClick} className="bg-white/20 hover:bg-white/30 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Surplus
          </button>
        )}
      </div>
    </header>
  )
}
