export type SortMode = 'group' | 'completion'

const SORTS: { value: SortMode; label: string }[] = [
  { value: 'group', label: 'Group A→L' },
  { value: 'completion', label: 'By completion' },
]

export default function SortStickers({
  value,
  onChange,
}: {
  value: SortMode
  onChange: (mode: SortMode) => void
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {SORTS.map((s) => (
        <button
          key={s.value}
          onClick={() => onChange(s.value)}
          className={`px-2.5 py-1 text-xs font-medium rounded-full border transition ${
            value === s.value
              ? 'bg-green-700 text-white border-green-700'
              : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
          }`}
        >
          {s.label}
        </button>
      ))}
    </div>
  )
}
