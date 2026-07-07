export default function ProgressBar({ value, max, size = 'sm' }: { value: number; max: number; size?: 'sm' | 'md' }) {
  const pct = max > 0 ? value / max : 0
  const barColor = pct >= 1 ? 'bg-green-500' : pct >= 0.8 ? 'bg-lime-500' : pct >= 0.6 ? 'bg-yellow-500' : pct >= 0.4 ? 'bg-amber-500' : pct >= 0.2 ? 'bg-orange-500' : 'bg-red-500'
  const h = size === 'md' ? 'h-2.5' : 'h-1.5'
  return (
    <span className={`${h} bg-gray-200 rounded-full overflow-hidden shrink-0`}>
      <span className={`block ${h} rounded-full transition-all ${barColor}`} style={{ width: `${Math.min(pct * 100, 100)}%` }} />
    </span>
  )
}
