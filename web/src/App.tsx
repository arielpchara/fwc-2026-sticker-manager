import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MainPage from './ui/pages/MainPage.js'
import ComparePage from './ui/pages/ComparePage.js'
import TradePage from './ui/pages/TradePage.js'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/compare" element={<ComparePage />} />
        <Route path="/compare/:name" element={<TradePage />} />
      </Routes>
    </BrowserRouter>
  )
}
