import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import en from './locales/en.js'
import pt from './locales/pt.js'
import type { Translations } from './locales/en.js'

export type Locale = 'en' | 'pt'

const STORAGE_KEY = 'sticker-trade-locale'

function loadLocale(): Locale {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'en' || stored === 'pt') return stored
  } catch { /* ignore */ }
  return 'pt'
}

const LOCALE_DATA: Record<Locale, Translations> = { en, pt }

interface LocaleCtx {
  locale: Locale
  setLocale: (l: Locale) => void
  t: (key: keyof Translations, params?: Record<string, string | number>) => string
}

const Ctx = createContext<LocaleCtx>(null!)

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(loadLocale)

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l)
    try { localStorage.setItem(STORAGE_KEY, l) } catch { /* ignore */ }
  }, [])

  const t = useCallback<LocaleCtx['t']>((key, params) => {
    let str = LOCALE_DATA[locale][key]
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        str = str.replace(`{${k}}`, String(v))
      }
    }
    return str
  }, [locale])

  return <Ctx.Provider value={{ locale, setLocale, t }}>{children}</Ctx.Provider>
}

export function useLocale(): LocaleCtx {
  return useContext(Ctx)
}
