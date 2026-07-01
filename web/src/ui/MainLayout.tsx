import type { ReactNode } from 'react'
import Header from './Header.js'
import Footer from './Footer.js'

export default function MainLayout({ children, onOwnClick, onSurplusClick }: { children: ReactNode; onOwnClick?: () => void; onSurplusClick?: () => void }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header onOwnClick={onOwnClick} onSurplusClick={onSurplusClick} />
      {children}
      <Footer />
    </div>
  )
}
