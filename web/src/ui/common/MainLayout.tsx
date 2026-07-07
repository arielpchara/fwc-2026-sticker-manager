import type { ReactNode } from 'react'
import Header from './Header.js'
import Footer from './Footer.js'

export default function MainLayout({ children, albumOwned, albumTotal, onOwnClick, onSurplusClick, onCompareClick, onMatrixClick }: { children: ReactNode; albumOwned: number; albumTotal: number; onOwnClick?: () => void; onSurplusClick?: () => void; onCompareClick?: () => void; onMatrixClick?: () => void }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header albumOwned={albumOwned} albumTotal={albumTotal} onOwnClick={onOwnClick} onSurplusClick={onSurplusClick} onCompareClick={onCompareClick} onMatrixClick={onMatrixClick} />
      {children}
      <Footer />
    </div>
  )
}
