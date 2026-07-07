import { useLocale } from '../../i18n/index.js'

const STEPS = [
  { key: 'tutorialStep1', btn: 'btnOwn', icon: 'M12 4v16m8-8H4' },
  { key: 'tutorialStep2', btn: 'btnExtras', icon: 'M12 4v16m8-8H4' },
  { key: 'tutorialStep3', btn: 'btnCompare', icon: 'M4 6h16M4 12h16M4 18h16' },
] as const

export default function Tutorial() {
  const { t } = useLocale()
  return (
    <section className="max-w-lg mx-auto">
      <div className="space-y-3">
        {STEPS.map((step, i) => (
          <div key={step.key} className="flex items-start gap-3">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-green-100 text-green-700 text-xs font-bold shrink-0 mt-0.5">
              {i + 1}
            </span>
            <div className="text-sm text-gray-600">
              <span className="font-medium text-gray-800">{t(step.btn)}</span>
              {' '}{t(step.key)}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
