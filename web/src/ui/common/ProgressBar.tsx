export default function ProgressBar({ value, max, size = 'sm' }: { value: number; max: number; size?: 'sm' | 'md' }) {
  const pct = max > 0 ? value / max : 0
  const barColor = 'bg-gold'
  const h = size === 'md' ? 'h-2.5' : 'h-1.5'
  return (
    <span className={`${h} bg-surface-2 rounded-full overflow-hidden w-full`}>
      <span className={`block ${h} rounded-full transition-all ${barColor}`} style={{ width: `${Math.min(pct * 100, 100)}%` }} />
    </span>
  )
}
