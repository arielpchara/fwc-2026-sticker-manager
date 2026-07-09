import { useLocale } from '../../i18n/index.js'

const STEPS = [
  { key: 'tutorialStep1', btn: 'btnOwn' },
  { key: 'tutorialStep2', btn: 'btnExtras' },
  { key: 'tutorialStep3', btn: 'btnCompare' },
] as const

export default function Tutorial() {
  const { t } = useLocale()
  return (
    <section>
      <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">{t('howToUse')}</h2>
      <div className="space-y-2.5">
        {STEPS.map((step, i) => (
          <div key={step.key} className="flex items-start gap-2.5">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-green-100 text-green-700 text-[10px] font-bold shrink-0 mt-0.5">
              {i + 1}
            </span>
            <div className="text-xs text-gray-600 leading-relaxed">
              <span className="font-semibold text-gray-800">{t(step.btn)}</span>
              {' '}{t(step.key)}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
