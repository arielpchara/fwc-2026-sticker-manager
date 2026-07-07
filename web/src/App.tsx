import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MainPage from './ui/pages/MainPage.js'
import ComparePage from './ui/pages/ComparePage.js'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/compare" element={<ComparePage />} />
      </Routes>
    </BrowserRouter>
  )
}
