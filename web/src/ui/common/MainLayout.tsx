import type { ReactNode } from 'react'
import Header from './Header.js'
import Footer from './Footer.js'

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      {children}
      <Footer />
    </div>
  )
}
