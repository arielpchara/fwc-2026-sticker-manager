import type { ReactNode } from 'react'
import Header from './Header.js'
import Footer from './Footer.js'
import Tutorial from './Tutorial.js'
import Description from './Description.js'

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <Header />
      <Description />
      <div className="flex flex-1">
        <aside className="hidden lg:flex flex-col w-56 shrink-0 border-r border-border bg-surface p-5 gap-6">
          <Tutorial />
        </aside>
        <main className="flex-1 flex flex-col min-w-0">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  )
}
