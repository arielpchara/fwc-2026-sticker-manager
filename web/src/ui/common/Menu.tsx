import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLocale } from '../../i18n/index.js'
import type { Translations } from '../../i18n/locales/en.js'
import LangSelector from './LangSelector.js'

export default function Menu() {
  const navigate = useNavigate()
  const { t } = useLocale()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  const items: { labelKey: keyof Translations; to: string }[] = [
    { labelKey: 'btnHome',     to: '/' },
    { labelKey: 'btnOwn',     to: '/own' },
    { labelKey: 'btnExtras',  to: '/extras' },
    { labelKey: 'btnCompare', to: '/compare' },
    { labelKey: 'btnMatrix',  to: '/grid' },
  ]

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="text-white text-xl p-1 hover:opacity-80"
        aria-label="Menu"
      >
        ☰
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 bg-white text-gray-800 rounded-lg shadow-lg min-w-40 z-50 py-1">
          {items.map(item => (
            <button
              key={item.labelKey}
              onClick={() => { navigate(item.to); setOpen(false) }}
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 whitespace-nowrap"
            >
              {t(item.labelKey)}
            </button>
          ))}
          <hr className="my-1 mx-2 border-gray-200" />
          <div className="px-4 py-2">
            <LangSelector />
          </div>
        </div>
      )}
    </div>
  )
}
