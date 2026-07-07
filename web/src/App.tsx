import { type ReactNode } from 'react'
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'
import MainPage from './ui/pages/MainPage.js'
import ComparePage from './ui/pages/ComparePage.js'
import TradeDrawer from './ui/trade/TradeDrawer.js'
import GridPage from './ui/pages/GridPage.js'
import Drawer from './ui/common/Drawer.js'
import { useLocale } from './i18n/index.js'
import type { Translations } from './i18n/locales/en.js'
import AddOwnStickers from './ui/own/AddStickers/AddOwnStickers.js'
import AddSurplusStickers from './ui/own/AddStickers/AddSurplusStickers.js'

function DrawerPage({ title, children }: { title: keyof Translations; children: ReactNode }) {
  const { t } = useLocale()
  const navigate = useNavigate()
  return (
    <Drawer open onClose={() => navigate('..')} title={<span>{t(title)}</span>}>
      {children}
    </Drawer>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />}>
          <Route path="own" element={<DrawerPage title="dialogOwn"><AddOwnStickers /></DrawerPage>} />
          <Route path="extras" element={<DrawerPage title="dialogExtras"><AddSurplusStickers /></DrawerPage>} />
        </Route>
        <Route path="/grid" element={<GridPage />} />
        <Route path="/compare" element={<ComparePage />}>
          <Route path=":name" element={<TradeDrawer />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
