import { useNavigate } from 'react-router-dom'
import { useLocale } from '../../i18n/index.js'

export default function LogoBar({ compact = false }: { compact?: boolean }) {
  const navigate = useNavigate()
  const { t } = useLocale()

  return (
    <h1
      className={`font-bold tracking-tight cursor-pointer hover:opacity-80 transition-all duration-200 ${
        compact ? 'text-base' : 'text-2xl'
      }`}
      onClick={() => navigate('/')}
    >
      {t('appTitle')}
    </h1>
  )
}
