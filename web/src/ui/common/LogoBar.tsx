import { useNavigate } from 'react-router-dom'
import { useLocale } from '../../i18n/index.js'

export default function LogoBar() {
  const navigate = useNavigate()
  const { t } = useLocale()

  return (
    <h1
      className="text-2xl font-bold tracking-tight cursor-pointer hover:opacity-80"
      onClick={() => navigate('/')}
    >
      {t('appTitle')}
    </h1>
  )
}
